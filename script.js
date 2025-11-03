const API_BASE = 'https://roblox-api-lua8.onrender.com';

// Tabs
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// Login
const loginScreen = document.getElementById('login-screen');
const dashboard = document.getElementById('dashboard');
const loginBtn = document.getElementById('login-btn');
const passwordInput = document.getElementById('password-input');
const loginError = document.getElementById('login-error');

loginBtn.addEventListener('click', login);

function saveToken(token) {
  localStorage.setItem('token', token);
}

function logout() {
  localStorage.removeItem('token');
  dashboard.classList.add('hidden');
  loginScreen.classList.remove('hidden');
}

document.getElementById('logout-btn').addEventListener('click', logout);

async function login() {
  const password = passwordInput.value;
  loginError.textContent = '';
  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });

    if (!res.ok) throw new Error('Unauthorized');
    const data = await res.json();
    saveToken(data.token);
    showDashboard();
  } catch (err) {
    loginError.textContent = 'Invalid password';
  }
}

function showDashboard() {
  loginScreen.classList.add('hidden');
  dashboard.classList.remove('hidden');
  loadBans();
}

// Load bans
async function loadBans() {
  const banTableBody = document.querySelector('#banTable tbody');
  banTableBody.innerHTML = '<tr><td colspan="3">Loading...</td></tr>';

  try {
    const res = await fetch(`${API_BASE}/bans`);
    const data = await res.json();
    const bansArray = Object.values(data);

    if (!bansArray.length) {
      banTableBody.innerHTML = '<tr><td colspan="3">No bans</td></tr>';
      return;
    }

    banTableBody.innerHTML = bansArray.map(ban => `
      <tr>
        <td>${ban.userId}</td>
        <td>${ban.reason}</td>
        <td>${ban.date}</td>
      </tr>`).join('');
  } catch (err) {
    banTableBody.innerHTML = '<tr><td colspan="3">Error loading bans</td></tr>';
    console.error(err);
  }
}

// Ban/unban
document.getElementById('banBtn').addEventListener('click', async () => {
  const userId = document.getElementById('banUserId').value;
  const reason = document.getElementById('banReason').value;

  const res = await fetch(`${API_BASE}/ban`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, reason })
  });

  if (res.ok) {
    document.getElementById('banStatus').textContent = `Banned ${userId}`;
    loadBans();
  }
});

document.getElementById('unbanBtn').addEventListener('click', async () => {
  const userId = document.getElementById('unbanUserId').value;

  const res = await fetch(`${API_BASE}/unban`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });

  if (res.ok) {
    document.getElementById('banStatus').textContent = `Unbanned ${userId}`;
    loadBans();
  }
});

// Search
document.getElementById('searchBtn').addEventListener('click', async () => {
  const userId = document.getElementById('searchInput').value;
  const res = await fetch(`${API_BASE}/bans/${userId}`);
  const resultDiv = document.getElementById('searchResult');

  if (res.ok) {
    const data = await res.json();
    resultDiv.textContent = `User: ${data.userId}, Reason: ${data.reason}, Date: ${data.date}`;
  } else {
    resultDiv.textContent = 'User not banned';
  }
});

// Auto-login if token exists
if (localStorage.getItem('token')) showDashboard();

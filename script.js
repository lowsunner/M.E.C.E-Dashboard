const API_BASE = 'https://roblox-api-lua8.onrender.com';

const loginScreen = document.getElementById('login-screen');
const passwordInput = document.getElementById('password-input');
const loginBtn = document.getElementById('login-btn');
const loginError = document.getElementById('login-error');

const dashboard = document.getElementById('dashboard');
const logoutBtn = document.getElementById('logout-btn');

const tabs = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

const banTableBody = document.querySelector('#banTable tbody');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const searchResult = document.getElementById('searchResult');

const banUserId = document.getElementById('banUserId');
const banReason = document.getElementById('banReason');
const banBtn = document.getElementById('banBtn');
const unbanUserId = document.getElementById('unbanUserId');
const unbanBtn = document.getElementById('unbanBtn');
const banStatus = document.getElementById('banStatus');

// LOGIN
async function login() {
  const password = passwordInput.value.trim();
  if (!password) return;

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });

    if (!res.ok) throw new Error('Invalid password');

    localStorage.setItem('adminPassword', password);
    showDashboard();
  } catch (err) {
    loginError.textContent = 'Access Denied';
  }
}

function showDashboard() {
  loginScreen.classList.add('hidden');
  dashboard.classList.remove('hidden');
  loadBans();
}

// LOGOUT
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('adminPassword');
  dashboard.classList.add('hidden');
  loginScreen.classList.add('show');
});

// AUTO LOGIN
window.addEventListener('DOMContentLoaded', () => {
  loginScreen.classList.remove('show');
  if (localStorage.getItem('adminPassword')) showDashboard();
});

// TAB SWITCHING
tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    tabs.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    tabPanels.forEach(panel => panel.classList.remove('active'));
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// LOAD BANS
async function loadBans() {
  banTableBody.innerHTML = '<tr><td colspan="3">Loading...</td></tr>';
  try {
    const res = await fetch(`${API_BASE}/bans`);
    if (!res.ok) throw new Error('Failed to fetch');
    const data = await res.json();
    const bans = Object.values(data);

    if (!bans.length) {
      banTableBody.innerHTML = '<tr><td colspan="3">No bans</td></tr>';
      return;
    }

    banTableBody.innerHTML = bans.map(b => 
      `<tr>
        <td>${b.userId}</td>
        <td>${b.reason || ''}</td>
        <td>${new Date(b.date).toLocaleString()}</td>
      </tr>`).join('');
  } catch (err) {
    banTableBody.innerHTML = '<tr><td colspan="3">Failed to load bans</td></tr>';
  }
}

// SEARCH
searchBtn.addEventListener('click', async () => {
  const userId = searchInput.value.trim();
  if (!userId) return;

  searchResult.textContent = 'Searching...';
  try {
    const res = await fetch(`${API_BASE}/bans/${userId}`);
    if (!res.ok) throw new Error('Not found');
    const ban = await res.json();
    searchResult.textContent = `User ${ban.userId} banned for: "${ban.reason}" on ${new Date(ban.date).toLocaleString()}`;
  } catch {
    searchResult.textContent = 'User not banned';
  }
});

// BAN
banBtn.addEventListener('click', async () => {
  const userId = banUserId.value.trim();
  const reason = banReason.value.trim();
  if (!userId) return;

  banStatus.textContent = 'Banning...';
  try {
    const res = await fetch(`${API_BASE}/ban`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ userId, reason })
    });
    if (!res.ok) throw new Error('Failed');
    banStatus.textContent = 'User banned!';
    loadBans();
  } catch {
    banStatus.textContent = 'Ban failed';
  }
});

// UNBAN
unbanBtn.addEventListener('click', async () => {
  const userId = unbanUserId.value.trim();
  if (!userId) return;

  banStatus.textContent = 'Unbanning...';
  try {
    const res = await fetch(`${API_BASE}/unban`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ userId })
    });
    if (!res.ok) throw new Error('Failed');
    banStatus.textContent = 'User unbanned!';
    loadBans();
  } catch {
    banStatus.textContent = 'Unban failed';
  }
});

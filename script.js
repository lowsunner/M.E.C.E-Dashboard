const API_BASE = 'https://roblox-api-lua8.onrender.com';

const loginScreen = document.getElementById('login-screen');
const dashboard = document.getElementById('dashboard');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const passwordInput = document.getElementById('password-input');
const loginError = document.getElementById('login-error');

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

function showDashboard() {
  loginScreen.classList.add('hidden');
  dashboard.classList.remove('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  loadBans();
}

function showLogin() {
  dashboard.classList.add('hidden');
  loginScreen.classList.remove('hidden');
}

tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    tabs.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    tabPanels.forEach(panel => panel.classList.remove('active'));
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

loginBtn.addEventListener('click', async () => {
  const password = passwordInput.value.trim();
  if (!password) return;

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    if (!res.ok) throw new Error('Unauthorized');
    localStorage.setItem('adminPassword', password);
    
    showDashboard();
  } catch {
    loginError.textContent = 'Invalid password';
  }
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('adminPassword');
  showLogin();
});

async function loadBans() {
  const banTableBody = document.querySelector('#banTable tbody');
  banTableBody.innerHTML = '<tr><td colspan="3">Loading...</td></tr>';

  try {
    const res = await fetch(`${API_BASE}/bans`);
    const data = await res.json();

    // Firebase returns an object keyed by userId
    const bansArray = Object.values(data); // <-- convert to array

    if (!bansArray.length) {
      banTableBody.innerHTML = '<tr><td colspan="3">No bans</td></tr>';
      return;
    }

    banTableBody.innerHTML = bansArray
      .map(ban => `<tr>
        <td>${ban.userId}</td>
        <td>${ban.reason}</td>
        <td>${ban.date}</td>
      </tr>`)
      .join('');
  } catch (err) {
    banTableBody.innerHTML = '<tr><td colspan="3">Error loading bans</td></tr>';
    console.error(err);
  }
}

searchBtn.addEventListener('click', async () => {
  const id = searchInput.value.trim();
  if (!id) return;
  searchResult.textContent = 'Searching...';
  try {
    const res = await fetch(`${API_BASE}/bans/${id}`);
    if (!res.ok) throw new Error('Not found');
    const ban = await res.json();
    searchResult.textContent = `User: ${ban.userId}, Reason: ${ban.reason}, Date: ${ban.date}`;
  } catch {
    searchResult.textContent = 'User not found';
  }
});

banBtn.addEventListener('click', async () => {
  const id = banUserId.value.trim();
  const reason = banReason.value.trim();
  if (!id) return;
  banStatus.textContent = 'Banning...';
  try {
    await fetch(`${API_BASE}/ban`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: id, reason })
    });
    banStatus.textContent = 'User banned';
    loadBans();
  } catch {
    banStatus.textContent = 'Failed to ban';
  }
});

unbanBtn.addEventListener('click', async () => {
  const id = unbanUserId.value.trim();
  if (!id) return;
  banStatus.textContent = 'Unbanning...';
  try {
    await fetch(`${API_BASE}/unban`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: id })
    });
    banStatus.textContent = 'User unbanned';
    loadBans();
  } catch {
    banStatus.textContent = 'Failed to unban';
  }
});

// Auto-login if password in localStorage
document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('adminPassword');
  if (saved) {
    passwordInput.value = saved;
    loginBtn.click();
    
  }
});

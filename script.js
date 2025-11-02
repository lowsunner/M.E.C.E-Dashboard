const API_BASE = 'https://roblox-api-lua8.onrender.com';

const loginScreen = document.getElementById('login-screen');
const dashboard = document.getElementById('dashboard');
const loginBtn = document.getElementById('login-btn');
const passwordInput = document.getElementById('password-input');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');

const searchBar = document.getElementById('search-bar');
const searchBtn = document.getElementById('search-btn');
const banList = document.getElementById('ban-list');

const userIdInput = document.getElementById('user-id');
const reasonInput = document.getElementById('reason');
const banBtn = document.getElementById('ban-btn');
const unbanBtn = document.getElementById('unban-btn');
const actionResult = document.getElementById('action-result');

let authToken = localStorage.getItem('authToken') || null;

function showLogin() {
  loginScreen.classList.remove('hidden');
  dashboard.classList.add('hidden');
}

function showDashboard() {
  loginScreen.classList.add('hidden');
  dashboard.classList.remove('hidden');
  loadBans();
}

function makeHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': authToken ? `Bearer ${authToken}` : ''
  };
}

async function login(password) {
  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    if (!res.ok) {
      loginError.textContent = 'Invalid password';
      return false;
    }
    const data = await res.json();
    authToken = data.token;
    localStorage.setItem('authToken', authToken);
    loginError.textContent = '';
    showDashboard();
  } catch (err) {
    console.error(err);
    loginError.textContent = 'Failed to connect';
  }
}

loginBtn.addEventListener('click', () => {
  const pw = passwordInput.value.trim();
  if (!pw) return;
  login(pw);
});

logoutBtn.addEventListener('click', () => {
  authToken = null;
  localStorage.removeItem('authToken');
  showLogin();
});

async function loadBans() {
  banList.innerHTML = 'Loading bans...';
  try {
    const res = await fetch(`${API_BASE}/bans`, { headers: makeHeaders() });
    if (!res.ok) {
      banList.innerHTML = 'Failed to load bans.';
      if (res.status === 401) {
        authToken = null;
        localStorage.removeItem('authToken');
        showLogin();
      }
      return;
    }
    const data = await res.json();
    let list = [];
    if (data && typeof data === 'object') list = Object.values(data);
    renderBans(list);
  } catch (err) {
    console.error(err);
    banList.innerHTML = 'Failed to load bans.';
  }
}

function renderBans(list) {
  if (!list.length) {
    banList.innerHTML = '<div class="ban-card">No bans yet</div>';
    return;
  }
  banList.innerHTML = '';
  list.forEach(b => {
    const card = document.createElement('div');
    card.className = 'ban-card';
    card.innerHTML = `
      <span>${b.userId}</span>
      <span>${b.reason}</span>
      <small>${b.date ? new Date(b.date).toLocaleString() : ''}</small>
    `;
    banList.appendChild(card);
  });
}

// Ban user
banBtn.addEventListener('click', async () => {
  const userId = userIdInput.value.trim();
  const reason = reasonInput.value.trim();
  if (!userId) return;
  try {
    const res = await fetch(`${API_BASE}/ban`, {
      method: 'POST',
      headers: makeHeaders(),
      body: JSON.stringify({ userId, reason })
    });
    const data = await res.json();
    actionResult.textContent = data.ok ? `Banned ${userId}` : data.error;
    loadBans();
  } catch (err) {
    console.error(err);
    actionResult.textContent = 'Failed to ban';
  }
});

// Unban user
unbanBtn.addEventListener('click', async () => {
  const userId = userIdInput.value.trim();
  if (!userId) return;
  try {
    const res = await fetch(`${API_BASE}/unban`, {
      method: 'POST',
      headers: makeHeaders(),
      body: JSON.stringify({ userId })
    });
    const data = await res.json();
    actionResult.textContent = data.ok ? `Unbanned ${userId}` : data.error;
    loadBans();
  } catch (err) {
    console.error(err);
    actionResult.textContent = 'Failed to unban';
  }
});

// Search bans
searchBtn.addEventListener('click', async () => {
  const id = searchBar.value.trim();
  if (!id) return;
  try {
    const res = await fetch(`${API_BASE}/bans/${id}`, { headers: makeHeaders() });
    if (!res.ok) {
      actionResult.textContent = 'User not found';
      return;
    }
    const data = await res.json();
    renderBans([data]);
  } catch (err) {
    console.error(err);
    actionResult.textContent = 'Search failed';
  }
});

// On load, check token
if (authToken) showDashboard();
else showLogin();

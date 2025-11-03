document.addEventListener('DOMContentLoaded', () => {
  const loginScreen = document.getElementById('login-screen');
  const dashboard = document.getElementById('dashboard');
  const passwordInput = document.getElementById('password-input');
  const loginBtn = document.getElementById('login-btn');
  const loginError = document.getElementById('login-error');
  const logoutBtn = document.getElementById('logout-btn');

  const tabButtons = document.querySelectorAll('.tab-btn');
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

  const API_BASE = 'https://roblox-api-lua8.onrender.com';

  function showDashboard() {
    loginScreen.classList.add('hidden');
    dashboard.classList.remove('hidden');
    loadBans();
  }

  function logout() {
    localStorage.removeItem('adminAccess');
    dashboard.classList.add('hidden');
    loginScreen.classList.remove('hidden');
    passwordInput.value = '';
  }

  async function login() {
    const password = passwordInput.value.trim();
    if (!password) return;

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (!res.ok) {
        loginError.textContent = 'Invalid password';
        return;
      }

      localStorage.setItem('adminAccess', password);
      loginError.textContent = '';
      showDashboard();
    } catch (err) {
      loginError.textContent = 'Login failed';
      console.error(err);
    }
  }

  async function loadBans() {
    try {
      const res = await fetch(`${API_BASE}/bans`);
      const bans = await res.json();

      if (!Array.isArray(bans) || bans.length === 0) {
        banTableBody.innerHTML = '<tr><td colspan="3">No bans found</td></tr>';
        return;
      }

      banTableBody.innerHTML = bans
        .map(b => `<tr><td>${b.userId}</td><td>${b.reason}</td><td>${b.date}</td></tr>`)
        .join('');
    } catch (err) {
      banTableBody.innerHTML = '<tr><td colspan="3">Failed to load bans</td></tr>';
      console.error(err);
    }
  }

  async function searchPlayer() {
    const userId = searchInput.value.trim();
    if (!userId) return;

    try {
      const res = await fetch(`${API_BASE}/bans/${userId}`);
      if (!res.ok) {
        searchResult.textContent = 'Player not found';
        return;
      }
      const data = await res.json();
      searchResult.textContent = `UserID: ${data.userId}, Reason: ${data.reason}, Date: ${data.date}`;
    } catch (err) {
      searchResult.textContent = 'Error fetching player';
      console.error(err);
    }
  }

  async function banPlayer() {
    const userId = banUserId.value.trim();
    if (!userId) return;
    const reason = banReason.value.trim();

    try {
      const res = await fetch(`${API_BASE}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, reason })
      });
      if (!res.ok) throw new Error('Failed to ban');
      banStatus.textContent = `Banned ${userId}`;
      loadBans();
    } catch (err) {
      banStatus.textContent = 'Ban failed';
      console.error(err);
    }
  }

  async function unbanPlayer() {
    const userId = unbanUserId.value.trim();
    if (!userId) return;

    try {
      const res = await fetch(`${API_BASE}/unban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (!res.ok) throw new Error('Failed to unban');
      banStatus.textContent = `Unbanned ${userId}`;
      loadBans();
    } catch (err) {
      banStatus.textContent = 'Unban failed';
      console.error(err);
    }
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });

  loginBtn.addEventListener('click', login);
  logoutBtn.addEventListener('click', logout);
  searchBtn.addEventListener('click', searchPlayer);
  banBtn.addEventListener('click', banPlayer);
  unbanBtn.addEventListener('click', unbanPlayer);

  // Auto-login if password stored
  const savedPassword = localStorage.getItem('adminAccess');
  if (savedPassword) {
    passwordInput.value = savedPassword;
    login();
  }
});

const API_BASE = 'https://roblox-api-lua8.onrender.com';

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

  function showDashboard() {
    loginScreen.classList.add('hidden');
    dashboard.classList.remove('hidden');
    loadBans();
  }

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
      localStorage.setItem('accessToken', password);
      showDashboard();
    } catch {
      loginError.textContent = 'Invalid password';
    }
  }

  function logout() {
    localStorage.removeItem('accessToken');
    dashboard.classList.add('hidden');
    loginScreen.classList.remove('hidden');
    passwordInput.value = '';
  }

  function switchTab(tabId) {
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabPanels.forEach(panel => panel.classList.remove('active'));
    const btn = Array.from(tabButtons).find(b => b.dataset.tab === tabId);
    if (btn) btn.classList.add('active');
    const panel = document.getElementById(tabId);
    if (panel) panel.classList.add('active');
  }

  async function loadBans() {
    banTableBody.innerHTML = '<tr><td colspan="3">Loading...</td></tr>';
    try {
      const res = await fetch(`${API_BASE}/bans`);
      const data = await res.json();
      if (!Array.isArray(data)) return banTableBody.innerHTML = '<tr><td colspan="3">No bans</td></tr>';
      banTableBody.innerHTML = data.map(b => `<tr><td>${b.userId}</td><td>${b.reason}</td><td>${b.date}</td></tr>`).join('');
    } catch {
      banTableBody.innerHTML = '<tr><td colspan="3">Failed to load bans</td></tr>';
    }
  }

  async function searchPlayer() {
    const userId = searchInput.value.trim();
    searchResult.textContent = '';
    if (!userId) return;
    try {
      const res = await fetch(`${API_BASE}/bans/${userId}`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      searchResult.innerHTML = `<p>User: ${data.userId}<br>Reason: ${data.reason}<br>Date: ${data.date}</p>`;
    } catch {
      searchResult.textContent = 'User not found';
    }
  }

  async function banUser() {
    const userId = banUserId.value.trim();
    const reason = banReason.value.trim();
    banStatus.textContent = '';
    if (!userId) return;
    try {
      const res = await fetch(`${API_BASE}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, reason })
      });
      if (!res.ok) throw new Error('Failed');
      banStatus.textContent = `Banned ${userId}`;
      loadBans();
    } catch {
      banStatus.textContent = 'Failed to ban user';
    }
  }

  async function unbanUser() {
    const userId = unbanUserId.value.trim();
    banStatus.textContent = '';
    if (!userId) return;
    try {
      const res = await fetch(`${API_BASE}/unban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (!res.ok) throw new Error('Failed');
      banStatus.textContent = `Unbanned ${userId}`;
      loadBans();
    } catch {
      banStatus.textContent = 'Failed to unban user';
    }
  }

  // Event listeners
  if (loginBtn) loginBtn.addEventListener('click', login);
  if (logoutBtn) logoutBtn.addEventListener('click', logout);
  if (searchBtn) searchBtn.addEventListener('click', searchPlayer);
  if (banBtn) banBtn.addEventListener('click', banUser);
  if (unbanBtn) unbanBtn.addEventListener('click', unbanUser);

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Auto-login if token exists
  const token = localStorage.getItem('accessToken');
  if (token) {
    passwordInput.value = token;
    login();
  }
});

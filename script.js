const API_BASE = 'https://roblox-api-lua8.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
  const loginScreen = document.getElementById('login-screen');
  const dashboard = document.getElementById('dashboard');
  const passwordInput = document.getElementById('password-input');
  const loginBtn = document.getElementById('login-btn');
  const loginError = document.getElementById('login-error');
  const logoutBtn = document.getElementById('logout-btn');
  const banTableBody = document.querySelector('#banTable tbody');
  const searchBar = document.getElementById('search-bar');
  const searchBtn = document.getElementById('search-btn');
  const searchResult = document.getElementById('searchResult');
  const banUserId = document.getElementById('banUserId');
  const banReason = document.getElementById('banReason');
  const banBtn = document.getElementById('banBtn');
  const unbanUserId = document.getElementById('unbanUserId');
  const unbanBtn = document.getElementById('unbanBtn');
  const banStatus = document.getElementById('banStatus');

  let authToken = localStorage.getItem('authToken') || null;

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
      if (!res.ok) throw new Error('Invalid password');
      const data = await res.json();
      authToken = data.token;
      localStorage.setItem('authToken', authToken);
      showDashboard();
    } catch(e) {
      loginError.textContent = 'Access Denied';
    }
  }

  function logout() {
    authToken = null;
    localStorage.removeItem('authToken');
    dashboard.classList.add('hidden');
    loginScreen.classList.remove('hidden');
  }

  async function loadBans() {
    banTableBody.innerHTML = '<tr><td colspan="3">Loading...</td></tr>';
    try {
      const res = await fetch(`${API_BASE}/bans`, {
        headers: { 'Authorization': authToken || '' }
      });
      if (!res.ok) throw new Error('Failed to fetch bans');
      const bans = await res.json();
      if (!Array.isArray(bans) || bans.length === 0) {
        banTableBody.innerHTML = '<tr><td colspan="3">No bans</td></tr>';
        return;
      }
      banTableBody.innerHTML = '';
      bans.forEach(ban => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${ban.userId}</td><td>${ban.reason}</td><td>${new Date(ban.date).toLocaleString()}</td>`;
        banTableBody.appendChild(tr);
      });
    } catch(e) {
      banTableBody.innerHTML = '<tr><td colspan="3">Error loading bans</td></tr>';
      console.error(e);
    }
  }

  async function searchPlayer() {
    const userId = searchBar.value.trim();
    searchResult.textContent = 'Searching...';
    if (!userId) return;
    try {
      const res = await fetch(`${API_BASE}/bans/${userId}`, {
        headers: { 'Authorization': authToken || '' }
      });
      if (res.status === 404) {
        searchResult.textContent = 'Player not banned';
        return;
      }
      const data = await res.json();
      searchResult.textContent = `User ID: ${data.userId}, Reason: ${data.reason}, Date: ${new Date(data.date).toLocaleString()}`;
    } catch(e) {
      searchResult.textContent = 'Error fetching player';
      console.error(e);
    }
  }

  async function banPlayer() {
    const userId = banUserId.value.trim();
    const reason = banReason.value.trim() || 'No reason';
    if (!userId) return;
    try {
      const res = await fetch(`${API_BASE}/ban`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': authToken || ''
        },
        body: JSON.stringify({ userId, reason })
      });
      if (!res.ok) throw new Error('Failed to ban');
      banStatus.textContent = `Banned ${userId}`;
      loadBans();
    } catch(e) {
      banStatus.textContent = 'Error banning user';
      console.error(e);
    }
  }

  async function unbanPlayer() {
    const userId = unbanUserId.value.trim();
    if (!userId) return;
    try {
      const res = await fetch(`${API_BASE}/unban`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': authToken || ''
        },
        body: JSON.stringify({ userId })
      });
      if (!res.ok) throw new Error('Failed to unban');
      banStatus.textContent = `Unbanned ${userId}`;
      loadBans();
    } catch(e) {
      banStatus.textContent = 'Error unbanning user';
      console.error(e);
    }
  }

  loginBtn.addEventListener('click', login);
  logoutBtn.addEventListener('click', logout);
  searchBtn.addEventListener('click', searchPlayer);
  banBtn.addEventListener('click', banPlayer);
  unbanBtn.addEventListener('click', unbanPlayer);

  if(authToken) showDashboard();
});

const API_BASE = 'https://roblox-api-lua8.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
  const loginScreen = document.getElementById('login-screen');
  const overlay = document.querySelector('.overlay');
  const dashboard = document.getElementById('dashboard');
  const loginBtn = document.getElementById('login-btn');
  const passwordInput = document.getElementById('password-input');
  const loginError = document.getElementById('login-error');
  const logoutBtn = document.getElementById('logout-btn');

  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  const banTableBody = document.querySelector('#banTable tbody');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const searchResult = document.getElementById('searchResult');

  const banUserIdInput = document.getElementById('banUserId');
  const banReasonInput = document.getElementById('banReason');
  const banBtn = document.getElementById('banBtn');
  const unbanUserIdInput = document.getElementById('unbanUserId');
  const unbanBtn = document.getElementById('unbanBtn');
  const banStatus = document.getElementById('banStatus');

  // --- Login ---
  async function login(password) {
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (!res.ok) throw new Error('Unauthorized');
      localStorage.setItem('adminPassword', password);

      // Hide login, show dashboard
      loginScreen.classList.add('hidden');
      overlay.style.opacity = 0;
      setTimeout(() => overlay.classList.add('hidden'), 500);
      dashboard.classList.remove('hidden');

      loadBans();
    } catch (err) {
      loginError.textContent = 'Invalid password';
    }
  }

  loginBtn.addEventListener('click', () => login(passwordInput.value));

  // Auto-login if localStorage has password
  const storedPassword = localStorage.getItem('adminPassword');
  if (storedPassword) login(storedPassword);

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('adminPassword');
    dashboard.classList.add('hidden');
    loginScreen.classList.remove('hidden');
    overlay.classList.remove('hidden');
    overlay.style.opacity = 1;
  });

  // --- Tabs ---
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.dataset.tab;
      tabPanels.forEach(panel => panel.id === target ? panel.classList.add('active') : panel.classList.remove('active'));
    });
  });

  // --- Load Bans ---
  async function loadBans() {
    try {
      const res = await fetch(`${API_BASE}/bans`);
      if (!res.ok) throw new Error('Failed to fetch bans');
      const bans = await res.json();
      if (!Array.isArray(bans)) {
        banTableBody.innerHTML = '<tr><td colspan="3">No bans</td></tr>';
        return;
      }
      banTableBody.innerHTML = bans.map(b => `<tr><td>${b.userId}</td><td>${b.reason}</td><td>${b.date}</td></tr>`).join('');
    } catch (err) {
      banTableBody.innerHTML = '<tr><td colspan="3">Failed to load bans</td></tr>';
    }
  }

  // --- Search ---
  searchBtn.addEventListener('click', async () => {
    const id = searchInput.value.trim();
    if (!id) return;
    searchResult.textContent = 'Loading...';
    try {
      const res = await fetch(`${API_BASE}/bans/${id}`);
      if (!res.ok) throw new Error('User not found');
      const data = await res.json();
      searchResult.textContent = `User ID: ${data.userId}, Reason: ${data.reason}, Date: ${data.date}`;
    } catch (err) {
      searchResult.textContent = 'User not found';
    }
  });

  // --- Ban / Unban ---
  banBtn.addEventListener('click', async () => {
    const userId = banUserIdInput.value.trim();
    if (!userId) return;
    const reason = banReasonInput.value.trim() || 'No reason';
    banStatus.textContent = 'Processing...';
    try {
      const res = await fetch(`${API_BASE}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, reason })
      });
      if (!res.ok) throw new Error('Failed');
      banStatus.textContent = 'User banned!';
      loadBans();
    } catch (err) {
      banStatus.textContent = 'Failed to ban user';
    }
  });

  unbanBtn.addEventListener('click', async () => {
    const userId = unbanUserIdInput.value.trim();
    if (!userId) return;
    banStatus.textContent = 'Processing...';
    try {
      const res = await fetch(`${API_BASE}/unban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (!res.ok) throw new Error('Failed');
      banStatus.textContent = 'User unbanned!';
      loadBans();
    } catch (err) {
      banStatus.textContent = 'Failed to unban user';
    }
  });

});

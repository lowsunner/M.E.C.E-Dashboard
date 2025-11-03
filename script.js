const API_BASE = "https://roblox-api-lua8.onrender.com";

document.addEventListener('DOMContentLoaded', () => {
  const loginScreen = document.getElementById('login-screen');
  const dashboard = document.getElementById('dashboard');
  const passwordInput = document.getElementById('password-input');
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');

  const tabs = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');

  const banTable = document.getElementById('banTable').querySelector('tbody');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const searchResult = document.getElementById('searchResult');

  const banUserId = document.getElementById('banUserId');
  const banReason = document.getElementById('banReason');
  const banBtn = document.getElementById('banBtn');

  const unbanUserId = document.getElementById('unbanUserId');
  const unbanBtn = document.getElementById('unbanBtn');
  const banStatus = document.getElementById('banStatus');

  async function login(password) {
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      if (!res.ok) throw new Error("Unauthorized");
      localStorage.setItem('adminPassword', password);
      showDashboard();
    } catch {
      document.getElementById('login-error').innerText = "Invalid password!";
    }
  }

  function showDashboard() {
    loginScreen.classList.add('hidden');
    dashboard.classList.remove('hidden');
    loadBans();
  }

  async function loadBans() {
    try {
      const res = await fetch(`${API_BASE}/bans`);
      const data = await res.json();
      banTable.innerHTML = '';
      const bansArray = Object.values(data);
      if (bansArray.length === 0) {
        banTable.innerHTML = '<tr><td colspan="3">No bans</td></tr>';
        return;
      }
      bansArray.forEach(b => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${b.userId}</td><td>${b.reason}</td><td>${new Date(b.date).toLocaleString()}</td>`;
        banTable.appendChild(tr);
      });
    } catch (err) {
      banTable.innerHTML = '<tr><td colspan="3">Failed to load bans</td></tr>';
    }
  }

  searchBtn.addEventListener('click', async () => {
    const id = searchInput.value.trim();
    if (!id) return;
    try {
      const res = await fetch(`${API_BASE}/bans/${id}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      searchResult.innerText = `User: ${data.userId}, Reason: ${data.reason}, Date: ${new Date(data.date).toLocaleString()}`;
    } catch {
      searchResult.innerText = "User not found";
    }
  });

  banBtn.addEventListener('click', async () => {
    const id = banUserId.value.trim();
    if (!id) return;
    const reason = banReason.value.trim();
    try {
      await fetch(`${API_BASE}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id, reason })
      });
      banStatus.innerText = `Banned ${id}`;
      loadBans();
    } catch {
      banStatus.innerText = "Failed to ban user";
    }
  });

  unbanBtn.addEventListener('click', async () => {
    const id = unbanUserId.value.trim();
    if (!id) return;
    try {
      await fetch(`${API_BASE}/unban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id })
      });
      banStatus.innerText = `Unbanned ${id}`;
      loadBans();
    } catch {
      banStatus.innerText = "Failed to unban user";
    }
  });

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('adminPassword');
    dashboard.classList.add('hidden');
    loginScreen.classList.remove('hidden');
  });

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.add('active');
    });
  });

  // Auto-login
  const savedPassword = localStorage.getItem('adminPassword');
  if (savedPassword) login(savedPassword);

  loginBtn.addEventListener('click', () => {
    const password = passwordInput.value.trim();
    if (password) login(password);
  });

  // Fade-in effect for login screen
  setTimeout(() => loginScreen.classList.remove('hidden'), 50);
});

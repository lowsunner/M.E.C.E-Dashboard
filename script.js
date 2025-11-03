const API_BASE = "https://roblox-api-lua8.onrender.com";

const loginScreen = document.getElementById('login-screen');
const dashboard = document.getElementById('dashboard');
const passwordInput = document.getElementById('password-input');
const loginBtn = document.getElementById('login-btn');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');

const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

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

let authToken = localStorage.getItem('authToken') || null;

function showDashboard() {
  loginScreen.classList.add('hidden');
  dashboard.classList.remove('hidden');
  loadBans();
}

async function login() {
  const password = passwordInput.value;
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
    loginError.textContent = "Access Denied";
  }
}

function logout() {
  authToken = null;
  localStorage.removeItem('authToken');
  dashboard.classList.add('hidden');
  loginScreen.classList.remove('hidden');
}

loginBtn.addEventListener('click', login);
logoutBtn.addEventListener('click', logout);

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    tabButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const target = btn.getAttribute('data-tab');
    tabPanels.forEach(panel => panel.classList.remove('active'));
    document.getElementById(target).classList.add('active');
  });
});

async function loadBans() {
  if(!authToken) return;
  try {
    const res = await fetch(`${API_BASE}/bans`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if(!res.ok) throw new Error('Failed to load');
    const bans = await res.json();
    renderBans(bans);
  } catch(e) {
    banTable.innerHTML = '<tr><td colspan="3">Failed to load bans</td></tr>';
  }
}

function renderBans(bans) {
  if(!Array.isArray(bans) || bans.length === 0){
    banTable.innerHTML = '<tr><td colspan="3">No bans found</td></tr>';
    return;
  }
  banTable.innerHTML = '';
  bans.forEach(ban => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${ban.userId}</td><td>${ban.reason}</td><td>${ban.date}</td>`;
    banTable.appendChild(tr);
  });
}

searchBtn.addEventListener('click', async () => {
  const id = searchInput.value.trim();
  if(!id) return;
  try {
    const res = await fetch(`${API_BASE}/bans/${id}`, { headers: { 'Authorization': `Bearer ${authToken}` }});
    if(!res.ok) throw new Error('Not found');
    const data = await res.json();
    searchResult.textContent = JSON.stringify(data, null, 2);
  } catch(e) {
    searchResult.textContent = "Player not found";
  }
});

banBtn.addEventListener('click', async () => {
  const id = banUserId.value.trim();
  const reason = banReason.value.trim();
  if(!id) return;
  try {
    const res = await fetch(`${API_BASE}/ban`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'Authorization': `Bearer ${authToken}` },
      body: JSON.stringify({ userId:id, reason })
    });
    if(!res.ok) throw new Error();
    banStatus.textContent = `Banned ${id}`;
    loadBans();
  } catch(e) {
    banStatus.textContent = `Failed to ban ${id}`;
  }
});

unbanBtn.addEventListener('click', async () => {
  const id = unbanUserId.value.trim();
  if(!id) return;
  try {
    const res = await fetch(`${API_BASE}/unban`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'Authorization': `Bearer ${authToken}` },
      body: JSON.stringify({ userId:id })
    });
    if(!res.ok) throw new Error();
    banStatus.textContent = `Unbanned ${id}`;
    loadBans();
  } catch(e) {
    banStatus.textContent = `Failed to unban ${id}`;
  }
});

if(authToken) showDashboard();

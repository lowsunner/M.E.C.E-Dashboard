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

function showLogin() {
  loginScreen.classList.add('show');
  dashboard.classList.remove('show');
}

function showDashboard() {
  loginScreen.classList.remove('show');
  dashboard.classList.add('show');
  loadBans();
}

function isLoggedIn() {
  return !!localStorage.getItem('adminToken');
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
    if (!res.ok) throw new Error('Invalid password');
    const data = await res.json();
    localStorage.setItem('adminToken', data.token);
    showDashboard();
  } catch {
    loginError.textContent = 'Access Denied';
  }
}

loginBtn.addEventListener('click', login);

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('adminToken');
  showLogin();
});

window.addEventListener('DOMContentLoaded', () => {
  if (isLoggedIn()) {
    showDashboard();
  } else {
    showLogin();
  }
});

tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    tabs.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    tabPanels.forEach(panel => panel.classList.remove('active'));
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});
function decodeExpiry(expiryStr) {
  if (!expiryStr) return 'Never';
  const match = expiryStr.match(/\[(\d+),(\d+),(\d+),(\d+)\]/);
  if (!match) return 'Never';

  const years = parseInt(match[1], 10) || 0;
  const months = parseInt(match[2], 10) || 0;
  const days = parseInt(match[3], 10) || 0;
  const hours = parseInt(match[4], 10) || 0;

  let totalSeconds = 0;
  totalSeconds += years * 365 * 24 * 60 * 60;
  totalSeconds += months * 30 * 24 * 60 * 60;
  totalSeconds += days * 24 * 60 * 60;
  totalSeconds += hours * 60 * 60;

  // clamp to 10 years (same as Lua)
  const maxSeconds = 31536000 * 10;
  totalSeconds = Math.min(totalSeconds, maxSeconds);

  // Convert seconds to milliseconds for JS
  const expiryDate = new Date(Date.now() + totalSeconds * 1000);
  return expiryDate.toLocaleString(); // Format it as a readable date
}
async function loadBans() {
  if (!isLoggedIn()) return;
  banTableBody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';
  try {
    const res = await fetch(`${API_BASE}/bans`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
    });
    if (!res.ok) {
      throw new Error('Failed to fetch bans');
    }

    const data = await res.json();
    console.log('Bans Data:', data);  // Log the data to check it

    const bans = Object.values(data);
    if (!bans.length) {
      banTableBody.innerHTML = '<tr><td colspan="5">No bans</td></tr>';
      return;
    }

    // This part renders the bans in the table
    banTableBody.innerHTML = bans.map(b => 
      `<tr>
        <td>${b.username || ''}</td>
        <td>${b.userId}</td>
        <td>${b.reason || ''}</td>
        <td>${decodeExpiry(b.expiry)}</td>  <!-- Display the decoded expiry here -->
        <td>${new Date(b.date).toLocaleString()}</td>
      </tr>`).join('');
  } catch (error) {
    console.error('Error loading bans:', error);  // Log the error if it fails
    banTableBody.innerHTML = '<tr><td colspan="5">Failed to load bans</td></tr>';
  }
}




searchBtn.addEventListener('click', async () => {
  if (!isLoggedIn()) return;
  const query = searchInput.value.trim();
  if (!query) return;
  searchResult.textContent = 'Searching...';
  try {
    const res = await fetch(`${API_BASE}/bans/${query}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
    });
    if (!res.ok) throw new Error();
    const ban = await res.json();
    searchResult.textContent = `User ${ban.username || ''} (${ban.userId}) banned for: "${ban.reason || ''}" — expires: ${decodeExpiry(ban.expiry)} — banned on ${new Date(ban.date).toLocaleString()}`;
  } catch {
    searchResult.textContent = 'User not banned';
  }
});



banBtn.addEventListener('click', async () => {
  if (!isLoggedIn()) return;
  const query = banUserId.value.trim(); // can be username or userId
  const reason = banReason.value.trim();
  const expiry = document.getElementById('banExpiry').value.trim(); // input for expiry
  if (!query) return;

  const parsedExpiry = expiry ? `[${expiry}]` : null; // if expiry is provided, format it

  banStatus.textContent = 'Banning...';
  try {
    const res = await fetch(`${API_BASE}/bans`, {
      method: 'POST',
      headers: {
        'Content-Type':'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify({ query, reason, expiry: parsedExpiry }) // send expiry if present
    });
    if (!res.ok) throw new Error();
    banStatus.textContent = 'User banned!';
    loadBans();
  } catch {
    banStatus.textContent = 'Ban failed';
  }
});


unbanBtn.addEventListener('click', async () => {
  if (!isLoggedIn()) return;
  const query = unbanUserId.value.trim(); // can be username or userId
  if (!query) return;
  banStatus.textContent = 'Unbanning...';
  try {
    const res = await fetch(`${API_BASE}/unban`, {
      method: 'POST',
      headers: {
        'Content-Type':'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify({ query }) // send as `query`
    });
    if (!res.ok) throw new Error();
    banStatus.textContent = 'User unbanned!';
    loadBans();
  } catch {
    banStatus.textContent = 'Unban failed';
  }
});


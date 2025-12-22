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
// Decode expiry string like "[0,0,7,0]" -> human readable expiry date
function decodeExpiry(expiry) {
  // If no expiry or invalid expiry, return 'Never'
  if (!expiry || typeof expiry !== 'number') return 'Never';

  // Convert the expiry time (which is in seconds from Unix epoch) to a Date object
  const expiryDate = new Date(expiry * 1000);  // Multiply by 1000 to convert seconds to milliseconds
  return expiryDate.toLocaleString();  // Convert it to a readable date string
}



async function loadBans() {
  if (!isLoggedIn()) return;
  banTableBody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';
  try {
    const res = await fetch(`${API_BASE}/bans`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    const bans = Object.values(data);
    if (!bans.length) {
      banTableBody.innerHTML = '<tr><td colspan="5">No bans</td></tr>';
      return;
    }
    banTableBody.innerHTML = bans.map(b => 
      `<tr>
        <td>${b.username || ''}</td>
        <td>${b.userId}</td>
        <td>${b.reason || ''}</td>
        <td>${decodeExpiry(b.expiry)}</td>  <!-- Display the decoded expiry here -->
        <td>${new Date(b.date).toLocaleString()}</td>
      </tr>`).join('');
  } catch {
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



document.addEventListener('DOMContentLoaded', () => {

  const permaCheckbox = document.getElementById('permaBan');

  if (permaCheckbox) {
    permaCheckbox.addEventListener('change', e => {
      const disabled = e.target.checked;
      ['banYears', 'banMonths', 'banDays', 'banHours'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = disabled;
      });
    });
  }

  const banBtn = document.getElementById('banBtn');
  if (banBtn) {
    banBtn.addEventListener('click', async () => {
      const userId = document.getElementById('banUserId').value.trim();
      const reason = document.getElementById('banReason').value.trim();

      const years = parseInt(document.getElementById('banYears').value) || 0;
      const months = parseInt(document.getElementById('banMonths').value) || 0;
      const days = parseInt(document.getElementById('banDays').value) || 0;
      const hours = parseInt(document.getElementById('banHours').value) || 0;

      const isPerma = document.getElementById('permaBan').checked;

      let duration;
      if (isPerma) {
        duration = null;
      } else {
        duration = { years, months, days, hours };
      }

      if (!userId) return;

      document.getElementById('banStatus').textContent = 'Banning...';

      try {
        const res = await fetch(`${API_BASE}/ban`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: JSON.stringify({
            userId,
            reason,
            duration,
            permanent: isPerma
          })
        });

        if (!res.ok) throw new Error();
        document.getElementById('banStatus').textContent = 'User banned!';
        loadBans();
      } catch {
        document.getElementById('banStatus').textContent = 'Ban failed';
      }
    });
  }

  const unbanBtn = document.getElementById('unbanBtn');
  if (unbanBtn) {
    unbanBtn.addEventListener('click', async () => {
      const userId = document.getElementById('unbanUserId').value.trim();
      if (!userId) return;

      document.getElementById('banStatus').textContent = 'Unbanning...';

      try {
        const res = await fetch(`${API_BASE}/unban`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: JSON.stringify({ userId })
        });

        if (!res.ok) throw new Error();
        document.getElementById('banStatus').textContent = 'User unbanned!';
        loadBans();
      } catch {
        document.getElementById('banStatus').textContent = 'Unban failed';
      }
    });
  }

});





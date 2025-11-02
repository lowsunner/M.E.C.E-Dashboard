const API_BASE = 'https://roblox-api-lua8.onrender.com';

const loginScreen = document.getElementById('login-screen');
const dashboard = document.getElementById('dashboard');
const passwordInput = document.getElementById('password-input');
const loginBtn = document.getElementById('login-btn');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');

const banList = document.getElementById('ban-list');
const searchBar = document.getElementById('search-bar');
const userIdInput = document.getElementById('user-id');
const reasonInput = document.getElementById('reason');
const banBtn = document.getElementById('ban-btn');
const unbanBtn = document.getElementById('unban-btn');
const actionResult = document.getElementById('action-result');

let authToken = localStorage.getItem('authToken');

async function login(password) {
  try {
    const res = await fetch(`${API_BASE}/login`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ password })
    });

    if(!res.ok) throw new Error('Unauthorized');
    const data = await res.json();
    authToken = data.token;
    localStorage.setItem('authToken', authToken);
    showDashboard();
  } catch(err) {
    loginError.textContent = 'Invalid password';
  }
}

function logout() {
  localStorage.removeItem('authToken');
  authToken = null;
  dashboard.classList.add('hidden');
  loginScreen.classList.remove('hidden');
}

async function loadBans() {
  try {
    const res = await fetch(`${API_BASE}/bans`, {
      headers:{ 'Authorization': authToken }
    });
    if(!res.ok) throw new Error('Failed');
    const data = await res.json();

    if(Object.keys(data).length === 0){
      banList.innerHTML = '<p>No bans found</p>';
      return;
    }

    let html = '<table><thead><tr><th>UserID</th><th>Reason</th><th>Date</th></tr></thead><tbody>';
    data.forEach(b=> html+=`<tr><td>${b.userId}</td><td>${b.reason}</td><td>${b.date}</td></tr>`);
    html+='</tbody></table>';
    banList.innerHTML = html;

  } catch(err){
    banList.innerHTML = '<p>Error loading bans</p>';
  }
}

function showDashboard(){
  loginScreen.classList.add('hidden');
  dashboard.classList.remove('hidden');
  loadBans();
}

loginBtn.addEventListener('click', ()=>login(passwordInput.value));
logoutBtn.addEventListener('click', logout);

if(authToken) showDashboard();

banBtn.addEventListener('click', async ()=>{
  const userId = userIdInput.value;
  const reason = reasonInput.value;
  if(!userId) return;

  const res = await fetch(`${API_BASE}/ban`,{
    method:'POST',
    headers:{ 'Content-Type':'application/json','Authorization':authToken },
    body: JSON.stringify({ userId, reason })
  });

  if(res.ok) actionResult.textContent = 'Banned successfully';
  else actionResult.textContent = 'Failed to ban';

  loadBans();
});

unbanBtn.addEventListener('click', async ()=>{
  const userId = userIdInput.value;
  if(!userId) return;

  const res = await fetch(`${API_BASE}/unban`,{
    method:'POST',
    headers:{ 'Content-Type':'application/json','Authorization':authToken },
    body: JSON.stringify({ userId })
  });

  if(res.ok) actionResult.textContent = 'Unbanned successfully';
  else actionResult.textContent = 'Failed to unban';

  loadBans();
});

searchBar.addEventListener('input', ()=>{
  const filter = searchBar.value.trim();
  const rows = banList.querySelectorAll('tbody tr');
  rows.forEach(row=>{
    row.style.display = row.children[0].textContent.includes(filter)?'':'none';
  });
});

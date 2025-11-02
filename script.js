const API_BASE = "https://roblox-api-lua8.onrender.com";

const loginScreen = document.getElementById('login-screen');
const dashboard = document.getElementById('dashboard');
const loginBtn = document.getElementById('login-btn');
const passwordInput = document.getElementById('password-input');
const errorText = document.getElementById('login-error');
const banList = document.getElementById('ban-list');
const searchBar = document.getElementById('search-bar');
const banBtn = document.getElementById('ban-btn');
const unbanBtn = document.getElementById('unban-btn');
const actionResult = document.getElementById('action-result');

async function login() {
  const password = passwordInput.value.trim();
  if (!password) return;

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    if (!res.ok) throw new Error("Unauthorized");
    const data = await res.json();
    dashboard.classList.remove("hidden");
    loginScreen.classList.add("hidden");
    loadBans();
  } catch {
    errorText.textContent = "Invalid password. Access denied.";
  }
}

async function loadBans() {
  const res = await fetch(`${API_BASE}/bans`);
  const bans = await res.json();
  renderBans(bans);
}

function renderBans(bans) {
  banList.innerHTML = "";
  for (const id in bans) {
    const user = bans[id];
    const div = document.createElement("div");
    div.className = "ban-item";
    div.textContent = `${user.userId} — ${user.reason} (${new Date(user.date).toLocaleString()})`;
    banList.appendChild(div);
  }
}

async function banUser() {
  const userId = document.getElementById("user-id").value.trim();
  const reason = document.getElementById("reason").value.trim();
  if (!userId) return;
  const res = await fetch(`${API_BASE}/ban`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, reason })
  });
  actionResult.textContent = res.ok ? "User banned." : "Failed to ban user.";
  if (res.ok) loadBans();
}

async function unbanUser() {
  const userId = document.getElementById("user-id").value.trim();
  if (!userId) return;
  const res = await fetch(`${API_BASE}/unban`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId })
  });
  actionResult.textContent = res.ok ? "User unbanned." : "Failed to unban user.";
  if (res.ok) loadBans();
}

loginBtn.addEventListener("click", login);
banBtn.addEventListener("click", banUser);
unbanBtn.addEventListener("click", unbanUser);

searchBar.addEventListener("input", e => {
  const term = e.target.value.toLowerCase();
  document.querySelectorAll(".ban-item").forEach(item => {
    item.style.display = item.textContent.toLowerCase().includes(term) ? "block" : "none";
  });
});

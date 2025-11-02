// API base
const API_BASE = "https://roblox-api-lua8.onrender.com";

// elements
const loginScreen = document.getElementById("login-screen");
const dashboard = document.getElementById("dashboard");
const passwordInput = document.getElementById("password-input");
const loginBtn = document.getElementById("login-btn");
const loginError = document.getElementById("login-error");
const logoutBtn = document.getElementById("logout-btn");
const refreshBtn = document.getElementById("refresh-btn");
const banList = document.getElementById("ban-list");
const searchBar = document.getElementById("search-bar");
const userIdInput = document.getElementById("user-id");
const reasonInput = document.getElementById("reason");
const banBtn = document.getElementById("ban-btn");
const unbanBtn = document.getElementById("unban-btn");
const actionResult = document.getElementById("action-result");
const adminLevelEl = document.getElementById("admin-level");

// token + role
let authToken = null;
let adminRole = null;

// helper: headers with auth when available
function makeHeaders() {
  const h = { "Content-Type": "application/json" };
  if (authToken) h["Authorization"] = `Bearer ${authToken}`;
  return h;
}

// restore session on load
document.addEventListener("DOMContentLoaded", async () => {
  const saved = localStorage.getItem("authData");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      authToken = parsed.token;
      adminRole = parsed.role || null;
      showDashboard();
      await loadBans();
      updateAdminInfo();
    } catch {
      localStorage.removeItem("authData");
      showLogin();
    }
  } else {
    showLogin();
  }
});

// show/hide helpers
function showLogin() {
  dashboard.classList.add("hidden");
  loginScreen.classList.remove("hidden");
  loginError.textContent = "";
}

function showDashboard() {
  loginScreen.classList.add("hidden");
  dashboard.classList.remove("hidden");
  loginError.textContent = "";
}

// update admin level display
function updateAdminInfo() {
  adminLevelEl.textContent = adminRole ? `Role: ${adminRole}` : "";
}

// login
loginBtn.addEventListener("click", async () => {
  const pw = passwordInput.value.trim();
  if (!pw) return (loginError.textContent = "Enter password.");

  loginError.textContent = "Verifying...";
  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Login failed" }));
      loginError.textContent = err.error || "Invalid password.";
      return;
    }

    const data = await res.json();
    authToken = data.token;
    adminRole = data.role || null;
    localStorage.setItem("authData", JSON.stringify({ token: authToken, role: adminRole }));
    passwordInput.value = "";
    loginError.textContent = "";
    showDashboard();
    updateAdminInfo();
    await loadBans();
  } catch (err) {
    console.error(err);
    loginError.textContent = "Server error.";
  }
});

// logout
logoutBtn.addEventListener("click", () => {
  authToken = null;
  adminRole = null;
  localStorage.removeItem("authData");
  showLogin();
});

// refresh
refreshBtn.addEventListener("click", () => loadBans());

// load bans
async function loadBans() {
  banList.innerHTML = "Loading bans...";
  try {
    const res = await fetch(`${API_BASE}/bans`, { headers: makeHeaders() });
    if (!res.ok) {
      if (res.status === 401) {
        // token expired or invalid — force logout
        localStorage.removeItem("authData");
        authToken = null;
        adminRole = null;
        showLogin();
        return;
      }
      banList.textContent = "Failed to load bans.";
      return;
    }
    const data = await res.json();
    renderBans(data);
  } catch (err) {
    console.error(err);
    banList.textContent = "Failed to load bans.";
  }
}

// render bans (accept array or object)
function renderBans(data) {
  let list = [];
  if (!data) list = [];
  else if (Array.isArray(data)) list = data;
  else if (typeof data === "object") list = Object.values(data);
  if (!list.length) {
    banList.innerHTML = "<div class='ban-card'>No bans yet</div>";
    return;
  }
  banList.innerHTML = "";
  list.forEach(b => {
    const card = document.createElement("div");
    card.className = "ban-card";
    const uid = document.createElement("strong");
    uid.textContent = b.userId || "(no id)";
    const reason = document.createElement("span");
    reason.textContent = b.reason || "No reason";
    const date = document.createElement("small");
    date.textContent = b.date ? new Date(b.date).toLocaleString() : "";
    card.appendChild(uid);
    card.appendChild(reason);
    card.appendChild(date);
    banList.appendChild(card);
  });
}

// search filter
searchBar.addEventListener("input", () => {
  const term = searchBar.value.toLowerCase();
  document.querySelectorAll(".ban-card").forEach(card => {
    card.style.display = card.textContent.toLowerCase().includes(term) ? "" : "none";
  });
});

// ban user
banBtn.addEventListener("click", async () => {
  const userId = userIdInput.value.trim();
  const reason = reasonInput.value.trim();
  if (!userId) return (actionResult.textContent = "Enter user ID.");

  actionResult.textContent = "Processing...";
  try {
    const res = await fetch(`${API_BASE}/ban`, {
      method: "POST",
      headers: makeHeaders(),
      body: JSON.stringify({ userId, reason })
    });
    if (!res.ok) {
      const err = await res.json().catch(()=>({error:"Failed"}));
      actionResult.textContent = err.error || "Failed to ban user.";
      return;
    }
    actionResult.textContent = `✅ User ${userId} banned.`;
    userIdInput.value = "";
    reasonInput.value = "";
    await loadBans();
  } catch (err) {
    console.error(err);
    actionResult.textContent = "Server error.";
  }
});

// unban user
unbanBtn.addEventListener("click", async () => {
  const userId = userIdInput.value.trim();
  if (!userId) return (actionResult.textContent = "Enter user ID.");

  actionResult.textContent = "Processing...";
  try {
    const res = await fetch(`${API_BASE}/unban`, {
      method: "POST",
      headers: makeHeaders(),
      body: JSON.stringify({ userId })
    });
    if (!res.ok) {
      const err = await res.json().catch(()=>({error:"Failed"}));
      actionResult.textContent = err.error || "Failed to unban user.";
      return;
    }
    actionResult.textContent = `✅ User ${userId} unbanned.`;
    userIdInput.value = "";
    await loadBans();
  } catch (err) {
    console.error(err);
    actionResult.textContent = "Server error.";
  }
});

const API_BASE = "https://roblox-api-lua8.onrender.com";

const loginScreen = document.getElementById("login-screen");
const dashboard = document.getElementById("dashboard");
const passwordInput = document.getElementById("password-input");
const loginBtn = document.getElementById("login-btn");
const loginError = document.getElementById("login-error");
const logoutBtn = document.getElementById("logout-btn");
const banList = document.getElementById("ban-list");
const searchBar = document.getElementById("search-bar");
const userIdInput = document.getElementById("user-id");
const reasonInput = document.getElementById("reason");
const banBtn = document.getElementById("ban-btn");
const unbanBtn = document.getElementById("unban-btn");
const actionResult = document.getElementById("action-result");

// On load: check if token saved
document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("authToken");
  if (token) {
    showDashboard();
    await loadBans();
  }
});

// LOGIN
loginBtn.addEventListener("click", async () => {
  const password = passwordInput.value.trim();
  if (!password) return;

  loginError.textContent = "Verifying...";
  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      loginError.textContent = "Invalid password.";
      return;
    }

    const data = await res.json();
    localStorage.setItem("authToken", data.token);
    showDashboard();
    await loadBans();

  } catch {
    loginError.textContent = "Server error. Try again.";
  }
});

// LOGOUT
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("authToken");
  dashboard.classList.add("hidden");
  loginScreen.classList.remove("hidden");
});

// SHOW DASHBOARD
function showDashboard() {
  loginScreen.classList.add("hidden");
  dashboard.classList.remove("hidden");
}

async function loadBans() {
  banList.innerHTML = "Loading bans...";
  try {
    const res = await fetch(`${API_BASE}/bans`, { headers: makeHeaders() });
    if (!res.ok) {
      if (res.status === 401) {
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

    // Firebase returns object with keys
    let list = [];
    if (data && typeof data === "object") {
      list = Object.values(data); // convert object -> array
    }

    renderBans(list);
  } catch (err) {
    console.error(err);
    banList.textContent = "Failed to load bans.";
  }
}

// render bans
function renderBans(list) {
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

// SEARCH FILTER
searchBar.addEventListener("input", () => {
  const term = searchBar.value.toLowerCase();
  document.querySelectorAll(".ban-entry").forEach(entry => {
    entry.style.display = entry.textContent.toLowerCase().includes(term) ? "" : "none";
  });
});

// BAN USER
banBtn.addEventListener("click", async () => {
  const userId = userIdInput.value.trim();
  const reason = reasonInput.value.trim();
  if (!userId) return (actionResult.textContent = "Enter user ID.");

  actionResult.textContent = "Processing...";
  try {
    const res = await fetch(`${API_BASE}/ban`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, reason }),
    });

    if (res.ok) {
      actionResult.textContent = `✅ User ${userId} banned.`;
      await loadBans();
    } else {
      actionResult.textContent = "Failed to ban user.";
    }
  } catch {
    actionResult.textContent = "Server error.";
  }
});

// UNBAN USER
unbanBtn.addEventListener("click", async () => {
  const userId = userIdInput.value.trim();
  if (!userId) return (actionResult.textContent = "Enter user ID.");

  actionResult.textContent = "Processing...";
  try {
    const res = await fetch(`${API_BASE}/unban`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    if (res.ok) {
      actionResult.textContent = `✅ User ${userId} unbanned.`;
      await loadBans();
    } else {
      actionResult.textContent = "Failed to unban user.";
    }
  } catch {
    actionResult.textContent = "Server error.";
  }
});


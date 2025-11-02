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


document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("authToken");
  if (token) {
    showDashboard();
    await loadBans();
  }
});

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

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("authToken");
  dashboard.classList.add("hidden");
  loginScreen.classList.remove("hidden");
});

function showDashboard() {
  loginScreen.classList.add("hidden");
  dashboard.classList.remove("hidden");
}

async function loadBans() {
  banList.innerHTML = "Loading bans...";
  try {
    const res = await fetch(`${API_BASE}/bans`);
    const bans = await res.json();
    renderBans(bans);
  } catch {
    banList.textContent = "Failed to load bans.";
  }
}

function renderBans(bans) {
  if (!bans.length) {
    banList.textContent = "No bans found.";
    return;
  }

  banList.innerHTML = "";
  bans.forEach(ban => {
    const div = document.createElement("div");
    div.className = "ban-entry";
    div.innerHTML = `
      <strong>${ban.userId}</strong><br>
      <span>${ban.reason}</span><br>
      <small>${new Date(ban.date).toLocaleString()}</small>
    `;
    banList.appendChild(div);
  });
}


searchBar.addEventListener("input", () => {
  const term = searchBar.value.toLowerCase();
  document.querySelectorAll(".ban-entry").forEach(entry => {
    entry.style.display = entry.textContent.toLowerCase().includes(term) ? "" : "none";
  });
});

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

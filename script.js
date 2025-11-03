const API_BASE = "https://roblox-api-lua8.onrender.com"; // Your Render API URL

// Elements
const loginScreen = document.getElementById("login-screen");
const dashboard = document.getElementById("dashboard");
const loginBtn = document.getElementById("login-btn");
const passwordInput = document.getElementById("password-input");
const loginError = document.getElementById("login-error");
const logoutBtn = document.getElementById("logout-btn");

const tabBtns = document.querySelectorAll(".tab-btn");
const tabPanels = document.querySelectorAll(".tab-panel");

const banTable = document.getElementById("banTable").getElementsByTagName("tbody")[0];
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const searchResult = document.getElementById("searchResult");

const banUserId = document.getElementById("banUserId");
const banReason = document.getElementById("banReason");
const banBtn = document.getElementById("banBtn");
const unbanUserId = document.getElementById("unbanUserId");
const unbanBtn = document.getElementById("unbanBtn");
const banStatus = document.getElementById("banStatus");

// Login check
async function login() {
  const password = passwordInput.value;
  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ password })
    });
    if (!res.ok) throw new Error("Unauthorized");
    localStorage.setItem("adminPassword", password);
    showDashboard();
  } catch (err) {
    loginError.innerText = "Invalid password!";
  }
}

function showDashboard() {
  loginScreen.classList.add("hidden");
  dashboard.classList.remove("hidden");
  loadBans();
}

// Logout
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("adminPassword");
  dashboard.classList.add("hidden");
  loginScreen.classList.remove("hidden");
});

// Tab switch
tabBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    tabBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const tab = btn.getAttribute("data-tab");
    tabPanels.forEach(panel => panel.classList.remove("active"));
    document.getElementById(tab).classList.add("active");
  });
});

// Load bans
async function loadBans() {
  try {
    const res = await fetch(`${API_BASE}/bans`);
    const bans = await res.json();
    renderBans(bans);
  } catch (err) {
    banTable.innerHTML = "<tr><td colspan='3'>Failed to load bans</td></tr>";
  }
}

function renderBans(bans) {
  if (!Array.isArray(bans) || bans.length === 0) {
    banTable.innerHTML = "<tr><td colspan='3'>No bans</td></tr>";
    return;
  }
  banTable.innerHTML = "";
  bans.forEach(ban => {
    const row = banTable.insertRow();
    row.insertCell(0).innerText = ban.userId;
    row.insertCell(1).innerText = ban.reason;
    row.insertCell(2).innerText = ban.date;
  });
}

// Search
searchBtn.addEventListener("click", async () => {
  const userId = searchInput.value.trim();
  if (!userId) return;
  try {
    const res = await fetch(`${API_BASE}/bans/${userId}`);
    if (!res.ok) throw new Error("Not found");
    const ban = await res.json();
    searchResult.innerText = `UserID: ${ban.userId}, Reason: ${ban.reason}, Date: ${ban.date}`;
  } catch (err) {
    searchResult.innerText = "User not banned";
  }
});

// Ban
banBtn.addEventListener("click", async () => {
  const userId = banUserId.value.trim();
  if (!userId) return;
  const reason = banReason.value.trim() || "No reason";
  try {
    const res = await fetch(`${API_BASE}/ban`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ userId, reason })
    });
    if (!res.ok) throw new Error("Failed");
    banStatus.innerText = "User banned!";
    loadBans();
  } catch (err) {
    banStatus.innerText = "Failed to ban user";
  }
});

// Unban
unbanBtn.addEventListener("click", async () => {
  const userId = unbanUserId.value.trim();
  if (!userId) return;
  try {
    const res = await fetch(`${API_BASE}/unban`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ userId })
    });
    if (!res.ok) throw new Error("Failed");
    banStatus.innerText = "User unbanned!";
    loadBans();
  } catch (err) {
    banStatus.innerText = "Failed to unban user";
  }
});

// Auto-login if saved password
document.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("adminPassword");
  if (saved) showDashboard();
});

loginBtn.addEventListener("click", login);

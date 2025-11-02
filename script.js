const API_BASE = "https://roblox-api-lua8.onrender.com";
const loginScreen = document.getElementById("login-screen");
const dashboard = document.getElementById("dashboard");
const passwordInput = document.getElementById("password-input");
const loginBtn = document.getElementById("login-btn");
const loginError = document.getElementById("login-error");
const logoutBtnId = "logout-btn"; // We'll create logout button dynamically
const searchBar = document.getElementById("search-bar");
const userIdInput = document.getElementById("user-id");
const reasonInput = document.getElementById("reason");
const banBtn = document.getElementById("ban-btn");
const unbanBtn = document.getElementById("unban-btn");
const actionResult = document.getElementById("action-result");
const banListContainer = document.getElementById("ban-list");

// --- UTILITIES ---
function saveToken(token) {
  localStorage.setItem("meceToken", token);
}

function getToken() {
  return localStorage.getItem("meceToken");
}

function clearToken() {
  localStorage.removeItem("meceToken");
}

function showLogin() {
  loginScreen.classList.remove("hidden");
  dashboard.classList.add("hidden");
}

function showDashboard(token) {
  loginScreen.classList.add("hidden");
  dashboard.classList.remove("hidden");

  // Add logout button dynamically if not exists
  if (!document.getElementById(logoutBtnId)) {
    const btn = document.createElement("button");
    btn.id = logoutBtnId;
    btn.textContent = "Logout";
    btn.classList.add("danger");
    dashboard.querySelector("header").appendChild(btn);
    btn.addEventListener("click", () => {
      clearToken();
      showLogin();
    });
  }

  loadBans(token);
}

// --- LOGIN ---
async function login() {
  const password = passwordInput.value.trim();
  if (!password) return (loginError.textContent = "Enter password");

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      loginError.textContent = "Invalid password";
      return;
    }

    const data = await res.json();
    saveToken(data.token);
    passwordInput.value = "";
    loginError.textContent = "";
    showDashboard(data.token);
  } catch (err) {
    loginError.textContent = "Failed to login";
    console.error(err);
  }
}

// --- LOAD BANS ---
async function loadBans(token) {
  try {
    const res = await fetch(`${API_BASE}/bans`, {
      headers: {
        Authorization: token,
      },
    });

    if (!res.ok) throw new Error("Failed to fetch bans");

    const bans = await res.json();
    renderBans(bans);
  } catch (err) {
    banListContainer.innerHTML = "<p>Failed to load bans</p>";
    console.error(err);
  }
}

function renderBans(bans) {
  if (!bans || bans.length === 0) {
    banListContainer.innerHTML = "<p>No bans found</p>";
    return;
  }

  const table = document.createElement("table");
  table.innerHTML = `
    <thead>
      <tr>
        <th>User ID</th>
        <th>Reason</th>
        <th>Date</th>
      </tr>
    </thead>
    <tbody>
      ${bans
        .map(
          (b) =>
            `<tr>
              <td>${b.userId}</td>
              <td>${b.reason}</td>
              <td>${b.date}</td>
            </tr>`
        )
        .join("")}
    </tbody>
  `;
  banListContainer.innerHTML = "";
  banListContainer.appendChild(table);
}

// --- BAN USER ---
async function banUser() {
  const userId = userIdInput.value.trim();
  const reason = reasonInput.value.trim();
  if (!userId) return (actionResult.textContent = "Enter User ID");

  try {
    const res = await fetch(`${API_BASE}/ban`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: getToken(),
      },
      body: JSON.stringify({ userId, reason }),
    });

    if (!res.ok) throw new Error("Failed to ban");

    actionResult.textContent = `Banned ${userId}`;
    userIdInput.value = "";
    reasonInput.value = "";
    loadBans(getToken());
  } catch (err) {
    actionResult.textContent = "Ban failed";
    console.error(err);
  }
}

// --- UNBAN USER ---
async function unbanUser() {
  const userId = userIdInput.value.trim();
  if (!userId) return (actionResult.textContent = "Enter User ID");

  try {
    const res = await fetch(`${API_BASE}/unban`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: getToken(),
      },
      body: JSON.stringify({ userId }),
    });

    if (!res.ok) throw new Error("Failed to unban");

    actionResult.textContent = `Unbanned ${userId}`;
    userIdInput.value = "";
    loadBans(getToken());
  } catch (err) {
    actionResult.textContent = "Unban failed";
    console.error(err);
  }
}

// --- SEARCH ---
function searchBans() {
  const query = searchBar.value.trim();
  const rows = banListContainer.querySelectorAll("tbody tr");
  rows.forEach((row) => {
    const id = row.children[0].textContent;
    row.style.display = id.includes(query) ? "" : "none";
  });
}

// --- EVENT LISTENERS ---
document.addEventListener("DOMContentLoaded", () => {
  loginBtn.addEventListener("click", login);
  banBtn.addEventListener("click", banUser);
  unbanBtn.addEventListener("click", unbanUser);
  searchBar.addEventListener("input", searchBans);

  // Auto-login if token exists
  const token = getToken();
  if (token) showDashboard(token);
});

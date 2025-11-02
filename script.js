document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = "https://roblox-api-lua8.onrender.com";
  let authToken = null;

  const tabs = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll(".tab-panel");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      panels.forEach(p => p.classList.remove("active"));
      document.getElementById(tab.dataset.tab).classList.add("active");
    });
  });

  // Login modal
  const loginModal = document.createElement("div");
  loginModal.className = "modal";
  loginModal.innerHTML = `
    <div class="modal-content">
      <h2>Admin Login</h2>
      <input type="password" id="pwInput" placeholder="Enter password"/>
      <button id="loginBtn">Login</button>
      <div id="loginMsg"></div>
    </div>
  `;
  document.body.appendChild(loginModal);

  const pwInput = document.getElementById("pwInput");
  const loginBtn = document.getElementById("loginBtn");
  const loginMsg = document.getElementById("loginMsg");

  loginBtn.addEventListener("click", async () => {
    const pw = pwInput.value.trim();
    if (!pw) return loginMsg.textContent = "Enter password";
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw })
      });
      const data = await res.json();
      if (!res.ok) return loginMsg.textContent = data.error || "Invalid password";
      authToken = data.token;
      loginModal.style.display = "none";
      loadBans();
    } catch (err) {
      loginMsg.textContent = "Network error";
      console.error(err);
    }
  });

  function authHeaders() {
    return authToken ? { "Authorization": `Bearer ${authToken}` } : {};
  }

  async function loadBans() {
    const tbody = document.querySelector("#banTable tbody");
    tbody.innerHTML = "<tr><td colspan='3'>Loading...</td></tr>";
    try {
      const res = await fetch(`${API_BASE}/bans`, { headers: authHeaders() });
      const data = await res.json();
      tbody.innerHTML = "";
      data.forEach(b => {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${b.userId}</td><td>${b.reason}</td><td>${b.date}</td>`;
        tbody.appendChild(tr);
      });
      if (!data.length) tbody.innerHTML = "<tr><td colspan='3'>No bans yet</td></tr>";
    } catch (err) {
      tbody.innerHTML = "<tr><td colspan='3'>Failed to load</td></tr>";
      console.error(err);
    }
  }

  document.getElementById("searchBtn").addEventListener("click", async () => {
    const id = document.getElementById("searchInput").value.trim();
    if (!id) return;
    try {
      const res = await fetch(`${API_BASE}/bans/${id}`, { headers: authHeaders() });
      const data = await res.json();
      document.getElementById("searchResult").textContent = res.ok ?
        `User ${data.userId} - ${data.reason} (${data.date})` : "User not found";
    } catch (err) { console.error(err); }
  });

  document.getElementById("banBtn").addEventListener("click", async () => {
    const id = document.getElementById("banUserId").value.trim();
    const reason = document.getElementById("banReason").value.trim();
    if (!id) return;
    try {
      const res = await fetch(`${API_BASE}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ userId: id, reason: reason })
      });
      if (res.ok) {
        loadBans();
        document.getElementById("banUserId").value = "";
        document.getElementById("banReason").value = "";
        document.getElementById("banStatus").textContent = "User banned ✅";
      } else {
        const e = await res.json();
        document.getElementById("banStatus").textContent = e.error || "Error";
      }
    } catch (err) { console.error(err); }
  });

  document.getElementById("unbanBtn").addEventListener("click", async () => {
    const id = document.getElementById("unbanUserId").value.trim();
    if (!id) return;
    try {
      const res = await fetch(`${API_BASE}/unban`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ userId: id })
      });
      if (res.ok) {
        loadBans();
        document.getElementById("unbanUserId").value = "";
        document.getElementById("banStatus").textContent = "User unbanned ✅";
      } else {
        const e = await res.json();
        document.getElementById("banStatus").textContent = e.error || "Error";
      }
    } catch (err) { console.error(err); }
  });
});

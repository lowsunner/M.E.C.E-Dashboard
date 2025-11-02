const API_URL = "https://roblox-api-lua8.onrender.com";
const API_KEY = "super_secret_key_123"; // Replace with your key or prompt for input

// Tabs
const tabs = document.querySelectorAll(".tab-btn");
const panels = document.querySelectorAll(".tab-panel");
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    panels.forEach(p => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.add("active");
  });
});

// Load bans
async function loadBans() {
  try {
    const res = await fetch(`${API_URL}/bans`);
    const bans = await res.json();
    const tbody = document.querySelector("#banTable tbody");
    tbody.innerHTML = "";
    if (bans.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3">No banned players</td></tr>`;
      return;
    }
    bans.forEach(b => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${b.userId}</td><td>${b.reason}</td><td>${new Date(b.date).toLocaleString()}</td>`;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
  }
}
loadBans();
setInterval(loadBans, 10000); // Refresh every 10 sec

// Search player
document.getElementById("searchBtn").addEventListener("click", async () => {
  const id = document.getElementById("searchInput").value.trim();
  const resultDiv = document.getElementById("searchResult");
  if (!id) return alert("Enter a User ID");
  try {
    const res = await fetch(`${API_URL}/bans`);
    const bans = await res.json();
    const found = bans.find(b => b.userId.toString() === id);
    if (found) {
      resultDiv.innerHTML = `User ${found.userId} is banned: ${found.reason} (${new Date(found.date).toLocaleString()})`;
    } else {
      resultDiv.innerHTML = `User ${id} is not banned.`;
    }
  } catch (err) {
    console.error(err);
    resultDiv.innerHTML = "Error fetching data.";
  }
});

// Ban player
document.getElementById("banBtn").addEventListener("click", async () => {
  const id = document.getElementById("banUserId").value.trim();
  const reason = document.getElementById("banReason").value.trim();
  const status = document.getElementById("banStatus");
  if (!id) return alert("Enter User ID to ban");
  try {
    const res = await fetch(`${API_URL}/ban`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY
      },
      body: JSON.stringify({ userId: id, reason })
    });
    const data = await res.json();
    if (data.ok) {
      status.innerHTML = `✅ User ${id} banned successfully`;
      loadBans();
    } else {
      status.innerHTML = `❌ Error banning user: ${data.error}`;
    }
  } catch (err) {
    console.error(err);
    status.innerHTML = `❌ Error banning user`;
  }
});

// Unban player
document.getElementById("unbanBtn").addEventListener("click", async () => {
  const id = document.getElementById("unbanUserId").value.trim();
  const status = document.getElementById("banStatus");
  if (!id) return alert("Enter User ID to unban");
  try {
    const res = await fetch(`${API_URL}/unban`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY
      },
      body: JSON.stringify({ userId: id })
    });
    const data = await res.json();
    if (data.ok) {
      status.innerHTML = `✅ User ${id} unbanned successfully`;
      loadBans();
    } else {
      status.innerHTML = `❌ Error unbanning user: ${data.error}`;
    }
  } catch (err) {
    console.error(err);
    status.innerHTML = `❌ Error unbanning user`;
  }
});

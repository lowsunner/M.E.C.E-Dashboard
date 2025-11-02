const API_BASE = "https://roblox-api-lua8.onrender.com";

let authToken = null;

const loginModal = document.getElementById("loginModal");
const pwInput = document.getElementById("pwInput");
const loginBtn = document.getElementById("loginBtn");
const loginMsg = document.getElementById("loginMsg");

const bansList = document.getElementById("bansList");
const searchId = document.getElementById("searchId");
const searchBtn = document.getElementById("searchBtn");
const refreshBtn = document.getElementById("refreshBtn");

const banUserId = document.getElementById("banUserId");
const banReason = document.getElementById("banReason");
const banBtn = document.getElementById("banBtn");

// Login
loginBtn.addEventListener("click", async () => {
  const pw = pwInput.value.trim();
  if(!pw) return loginMsg.textContent="Enter password";
  try {
    const res = await fetch(`${API_BASE}/login`, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({password:pw})
    });
    const data = await res.json();
    if(!res.ok) return loginMsg.textContent = data.error || "Invalid password";
    authToken = data.token;
    loginModal.classList.add("hidden");
    loadBans();
  } catch(err){loginMsg.textContent="Network error"; console.error(err);}
});

function authHeaders(){ return authToken ? {"Authorization": `Bearer ${authToken}`} : {}; }

// Load bans list
async function loadBans(){
  try{
    bansList.innerHTML="Loading...";
    const res = await fetch(`${API_BASE}/bans`, {headers:authHeaders()});
    const data = await res.json();
    bansList.innerHTML="";
    data.forEach(b=>{
      const li = document.createElement("li");
      li.textContent = `${b.userId} - ${b.reason} (${b.date})`;
      const unbanBtn = document.createElement("button");
      unbanBtn.textContent = "Unban";
      unbanBtn.onclick = ()=>unbanUser(b.userId);
      li.appendChild(unbanBtn);
      bansList.appendChild(li);
    });
  } catch(err){bansList.innerHTML="Failed to load"; console.error(err);}
}

// Search by ID
async function searchUser(){
  const id = searchId.value.trim();
  if(!id) return;
  try{
    const res = await fetch(`${API_BASE}/bans/${id}`, {headers:authHeaders()});
    if(!res.ok) return alert("User not found");
    const d = await res.json();
    alert(`User ${d.userId} - ${d.reason} (${d.date})`);
  } catch(err){console.error(err);}
}

// Ban user
async function banUser(){
  const id = banUserId.value.trim();
  const reason = banReason.value.trim();
  if(!id) return;
  try{
    const res = await fetch(`${API_BASE}/ban`, {
      method:"POST",
      headers:{"Content-Type":"application/json", ...authHeaders()},
      body:JSON.stringify({userId:id, reason:reason})
    });
    if(res.ok){ loadBans(); banUserId.value=""; banReason.value=""; } 
    else { const e = await res.json(); alert(e.error || "Error"); }
  } catch(err){console.error(err);}
}

// Unban
async function unbanUser(id){
  try{
    const res = await fetch(`${API_BASE}/unban`, {
      method:"POST",
      headers:{"Content-Type":"application/json", ...authHeaders()},
      body:JSON.stringify({userId:id})
    });
    if(res.ok) loadBans();
    else { const e = await res.json(); alert(e.error || "Error"); }
  } catch(err){console.error(err);}
}

searchBtn.addEventListener("click", searchUser);
refreshBtn.addEventListener("click", loadBans);
banBtn.addEventListener("click", banUser);
window.addEventListener("load", ()=>{if(authToken) loadBans();});

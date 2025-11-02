const API_BASE="https://roblox-api-lua8.onrender.com";
let authToken=null;

const pwModal=document.getElementById("pwModal");
const pwInput=document.getElementById("pwInput");
const pwSubmit=document.getElementById("pwSubmit");
const pwMsg=document.getElementById("pwMsg");
const bansList=document.getElementById("bansList");
const searchId=document.getElementById("searchId");
const searchBtn=document.getElementById("searchBtn");
const refreshBtn=document.getElementById("refreshBtn");
const banUserId=document.getElementById("banUserId");
const banReason=document.getElementById("banReason");
const banBtn=document.getElementById("banBtn");

pwSubmit.addEventListener("click",()=>{const v=pwInput.value.trim();if(!v)return pwMsg.textContent="Enter password";login(v)});
async function login(pw){try{const res=await fetch(`${API_BASE}/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password:pw})});if(!res.ok){const e=await res.json().catch(()=>({error:"Bad"}));pwMsg.textContent=e.error||"Invalid password";return}const d=await res.json();authToken=d.token;pwModal.classList.add("hidden");loadBans()}catch(err){pwMsg.textContent="Network error";console.error(err)}}

function authHeaders(){return authToken?{"Authorization":`Bearer ${authToken}`}:{}} 

async function loadBans(){try{bansList.innerHTML="Loading...";const res=await fetch(`${API_BASE}/bans`,{headers:authHeaders()});const data=await res.json();bansList.innerHTML="";data.forEach(b=>{const li=document.createElement("li");li.textContent=`${b.userId} - ${b.reason} (${b.date})`;const unban=document.createElement("button");unban.textContent="Unban";unban.onclick=()=>unbanUser(b.userId);li.appendChild(unban);bansList.appendChild(li)})}catch(err){console.error(err);bansList.innerHTML="Failed to load"}}

async function searchUser(){const id=searchId.value.trim();if(!id)return;try{const res=await fetch(`${API_BASE}/bans/${id}`,{headers:authHeaders()});if(!res.ok){alert("Not found");return}const d=await res.json();alert(`User ${d.userId} - ${d.reason} (${d.date})`)}catch(err){console.error(err)}} 

async function banUser(){const id=banUserId.value.trim();const reason=banReason.value.trim();if(!id)return;try{const res=await fetch(`${API_BASE}/ban`,{method:"POST",headers:{"Content-Type":"application/json",...authHeaders()},body:JSON.stringify({userId:id,reason:reason})});if(res.ok){loadBans();banUserId.value="";banReason.value="";}else{const e=await res.json();alert(e.error||"Error")}}catch(err){console.error(err)}} 

async function unbanUser(id){try{const res=await fetch(`${API_BASE}/unban`,{method:"POST",headers:{"Content-Type":"application/json",...authHeaders()},body:JSON.stringify({userId:id})});if(res.ok)loadBans();else{const e=await res.json();alert(e.error||"Error")}}catch(err){console.error(err)}}

searchBtn.addEventListener("click",searchUser);
refreshBtn.addEventListener("click",loadBans);
banBtn.addEventListener("click",banUser);
window.addEventListener("load",loadBans);

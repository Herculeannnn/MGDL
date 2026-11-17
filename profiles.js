
const PROFILE_KEY="mgdlPlayerProfilesV1";
const PLAYER_KEY="Snappedlol";

const PROFILE_DEMONS=[
"Firework","Unknown","Kenos","Zodiac","Bloodlust",
"Shardscapes","Arctic Lights","Wasureta","Yatagarasu",
"Bloodbath","Cataclysm","Sweater Weather","Acu",
"Rauchkammer","MikuMikuMikuMiku","Supersonic","Crazy III",
"Death Note","Crazy II","Crazy","Nine Circles",
"Troll Madness","B","Permafrost Mountain","Demon Park"
];

function profileRead(key,fallback){
 try{
  return JSON.parse(localStorage.getItem(key))??fallback;
 }catch(e){
  return fallback;
 }
}

function profileSave(key,value){
 localStorage.setItem(key,JSON.stringify(value));
}

function profileEscape(value){
 return String(value??"").replace(/[&<>"']/g,c=>({
  "&":"&amp;","<":"&lt;",">":"&gt;",
  '"':"&quot;","'":"&#39;"
 }[c]));
}

function getProfilePlayers(){
 return profileRead(PLAYER_KEY,[]);
}

function getProfiles(){
 return profileRead(PROFILE_KEY,{});
}

function getProfilePoints(player){
 const completed=Array.isArray(player.completed)?player.completed:[];
 return completed.reduce((sum,rank)=>sum+151-rank,0);
}

function getProfileStats(name){
 const players=getProfilePlayers();
 const player=players.find(p=>p.name.toLowerCase()===name.toLowerCase());

 if(!player)return {points:0,completed:[],rank:"—"};

 const sorted=[...players].sort((a,b)=>
  getProfilePoints(b)-getProfilePoints(a)
 );

 return {
  points:getProfilePoints(player),
  completed:Array.isArray(player.completed)?player.completed:[],
  rank:sorted.findIndex(p=>p.name===player.name)+1
 };
}

function profileUrl(name){
 return "profile.html?user="+encodeURIComponent(name);
}

/* REGISTRATION */
function registerProfile(event){
 event.preventDefault();

 const input=document.getElementById("registerName");
 const message=document.getElementById("registerMessage");
 const name=input.value.trim();

 if(!name){
  message.textContent="Enter a username.";
  return;
 }

 if(name.length<3){
  message.textContent="Username must be at least 3 characters.";
  return;
 }

 const players=getProfilePlayers();

 if(players.some(p=>p.name.toLowerCase()===name.toLowerCase())){
  message.textContent="That username already exists.";
  return;
 }

 players.push({name,completed:[]});
 profileSave(PLAYER_KEY,players);

 const profiles=getProfiles();
 profiles[name]={
  name,
  avatar:"🎮",
  bio:"New MGDL player.",
  banner:"#351b20",
  joined:new Date().toISOString()
 };

 profileSave(PROFILE_KEY,profiles);
 input.value="";
 message.textContent="Profile created! Opening your profile...";

 location.href=profileUrl(name);
}

/* PLAYER DIRECTORY */
function renderProfileDirectory(filter=""){
 const container=document.getElementById("profileDirectory");
 if(!container)return;

 const players=getProfilePlayers();
 const profiles=getProfiles();

 const results=players.filter(player=>
  player.name.toLowerCase().includes(filter.toLowerCase())
 );

 if(!results.length){
  container.innerHTML='<p class="empty">No players found. Create a profile to get started.</p>';
  return;
 }

 results.sort((a,b)=>getProfilePoints(b)-getProfilePoints(a));

 container.innerHTML=results.map(player=>{
  const profile=profiles[player.name]||{
   avatar:"🎮",bio:"MGDL player."
  };

  const stats=getProfileStats(player.name);

  return `
   <a class="profile-card" href="${profileUrl(player.name)}">
    <div class="directory-avatar">${profileEscape(profile.avatar)}</div>
    <div class="directory-info">
     <h3>${profileEscape(player.name)}</h3>
     <p>${profileEscape(profile.bio)}</p>
     <span>${stats.points} points · ${stats.completed.length} completions</span>
    </div>
    <span class="profile-arrow">›</span>
   </a>
  `;
 }).join("");
}

/* PROFILE PAGE */
function renderProfilePage(){
 const container=document.getElementById("profileView");
 if(!container)return;

 const name=new URLSearchParams(location.search).get("user");

 if(!name){
  container.innerHTML='<p class="empty">No player selected.</p>';
  return;
 }

 const players=getProfilePlayers();
 const player=players.find(p=>p.name.toLowerCase()===name.toLowerCase());

 if(!player){
  container.innerHTML='<p class="empty">Player not found on this device.</p>';
  return;
 }

 const profiles=getProfiles();
 const profile=profiles[player.name]||{
  name:player.name,avatar:"🎮",bio:"MGDL player.",banner:"#351b20"
 };

 const stats=getProfileStats(player.name);
 const completedNames=stats.completed.map(rank=>{
  const demon=PROFILE_DEMONS[rank-1];
  return demon?{rank,name:demon}:null;
 }).filter(Boolean);

 const joined=profile.joined
  ?new Date(profile.joined).toLocaleDateString()
  :"Unknown";

 container.innerHTML=`
  <section class="full-profile">
   <div class="profile-banner"
   style="background:${safeColor(profile.banner)}"></div>

   <div class="profile-main">
    <div class="profile-avatar">${profileEscape(profile.avatar)}</div>
    <h2>${profileEscape(player.name)}</h2>
    <p class="profile-bio">${profileEscape(profile.bio)}</p>
    <span class="profile-joined">Joined ${joined}</span>

    <div class="profile-stats">
     <div><strong>${stats.points}</strong><span>POINTS</span></div>
     <div><strong>#${stats.rank}</strong><span>POSITION</span></div>
     <div><strong>${completedNames.length}</strong><span>COMPLETIONS</span></div>
    </div>

    <button id="editProfileButton" type="button">Edit profile</button>

    <form id="editProfileForm" class="edit-profile-form" hidden>
     <label>Avatar emoji</label>
     <input class="field" id="editAvatar" maxlength="8"
     value="${profileEscape(profile.avatar)}">

     <label>Bio</label>
     <textarea class="field" id="editBio" maxlength="120"
     rows="3">${profileEscape(profile.bio)}</textarea>

     <label>Banner colour</label>
     <select class="field" id="editBanner">
      <option value="#351b20">Dark red</option>
      <option value="#202020">Charcoal</option>
      <option value="#292929">Grey</option>
      <option value="#252033">Dark purple</option>
     </select>

     <button type="submit">Save profile</button>
     <p id="editMessage" class="form-message"></p>
    </form>
   </div>
  </section>

  <section class="completed-section">
   <h2 class="section-title">Completed demons</h2>
   ${
    completedNames.length
    ?completedNames.map(d=>`
      <div class="completed-row">
       <span class="rank">#${d.rank}</span>
       <strong>${profileEscape(d.name)}</strong>
       <span class="completion-percent">100%</span>
      </div>
     `).join("")
    :'<p class="empty">No completed demons recorded yet.</p>'
   }
  </section>
  <p class="local-notice">Profile data is stored locally on this device and is not independently verified.</p>
 `;

 const bannerSelect=document.getElementById("editBanner");
 if([...bannerSelect.options].some(o=>o.value===profile.banner)){
  bannerSelect.value=profile.banner;
 }

 document.getElementById("editProfileButton").addEventListener("click",()=>{
  const form=document.getElementById("editProfileForm");
  form.hidden=!form.hidden;
 });

 document.getElementById("editProfileForm").addEventListener("submit",event=>{
  event.preventDefault();

  const updated=getProfiles();
  updated[player.name]={
   ...profile,
   avatar:document.getElementById("editAvatar").value.trim()||"🎮",
   bio:document.getElementById("editBio").value.trim(),
   banner:document.getElementById("editBanner").value
  };

  profileSave(PROFILE_KEY,updated);
  renderProfilePage();
 });
}

function safeColor(value){
 const allowed=["#351b20","#202020","#292929","#252033"];
 return allowed.includes(value)?value:"#351b20";
}

/* STARTUP */
document.addEventListener("DOMContentLoaded",()=>{
 const registerForm=document.getElementById("registerForm");
 if(registerForm){
  registerForm.addEventListener("submit",registerProfile);
 }

 const search=document.getElementById("profileSearch");
 if(search){
  search.addEventListener("input",()=>renderProfileDirectory(search.value));
  renderProfileDirectory();
 }

 renderProfilePage();
});

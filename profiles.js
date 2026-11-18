const PROFILE_KEY="mgdlPlayerProfilesV1";

/* MAIN MGDL PLAYER DATA */
const PLAYER_KEY="maldivesDemonProgressV1";

/* CURRENT MGDL DEMON ORDER */
const PROFILE_DEMONS=[
 "Firework",
 "Unknown",
 "Kenos",
 "Zodiac",
 "Bloodlust",
 "Shardscapes",
 "Arctic Lights",
 "Wasureta",
 "Yatagarasu",
 "Bloodbath",
 "Cataclysm",
 "Sweater Weather",
 "Acu",
 "Rauchkammer",
 "MikuMikuMikuMiku",
 "Supersonic",
 "Crazy III",
 "Death Note",
 "Crazy II",
 "Crazy",
 "Nine Circles",
 "Troll Madness",
 "B",
 "Permafrost Mountain",
 "Demon Park"
];

/* ================================
   STORAGE
================================ */

function profileRead(key,fallback){
 try{
  const value=JSON.parse(localStorage.getItem(key));
  return value??fallback;
 }catch(error){
  return fallback;
 }
}

function profileSave(key,value){
 localStorage.setItem(key,JSON.stringify(value));
}

function profileEscape(value){
 return String(value??"").replace(/[&<>"']/g,char=>({
  "&":"&amp;",
  "<":"&lt;",
  ">":"&gt;",
  '"':"&quot;",
  "'":"&#39;"
 }[char]));
}

function getProfilePlayers(){
 const players=profileRead(PLAYER_KEY,[]);
 return Array.isArray(players)?players:[];
}

function getProfiles(){
 const profiles=profileRead(PROFILE_KEY,{});
 return profiles&&typeof profiles==="object"&&!Array.isArray(profiles)
  ?profiles:{};
}

/* ================================
   PLAYER POINTS AND RANKINGS
================================ */

function getCompletedRanks(player){
 if(!Array.isArray(player.completed))return [];

 return [...new Set(
  player.completed
   .map(Number)
   .filter(rank=>
    Number.isInteger(rank)&&
    rank>=1&&
    rank<=PROFILE_DEMONS.length
   )
 )];
}

function getProfilePoints(player){
 return getCompletedRanks(player).reduce(
  (total,rank)=>total+(151-rank),0
 );
}

function getRankedPlayers(){
 return [...getProfilePlayers()].sort((a,b)=>{
  const pointDifference=getProfilePoints(b)-getProfilePoints(a);

  if(pointDifference!==0)return pointDifference;

  return getCompletedRanks(b).length-getCompletedRanks(a).length;
 });
}

function getProfileStats(name){
 const ranked=getRankedPlayers();

 const index=ranked.findIndex(player=>
  player.name.toLowerCase()===name.toLowerCase()
 );

 if(index===-1){
  return {points:0,completed:[],rank:"—"};
 }

 const player=ranked[index];

 return {
  points:getProfilePoints(player),
  completed:getCompletedRanks(player),
  rank:index+1
 };
}

function profileUrl(name){
 return "profile.html?user="+encodeURIComponent(name);
}

/* ================================
   REGISTRATION
================================ */

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

 if(players.some(player=>
  player.name.toLowerCase()===name.toLowerCase()
 )){
  message.textContent="That username already exists.";
  return;
 }

 /*
  Add to the existing MGDL player list.
  Existing players and their completions are preserved.
 */
 players.push({
  name,
  completed:[]
 });

 profileSave(PLAYER_KEY,players);

 const profiles=getProfiles();

 profiles[name]={
  name,
  avatar:"🎮",
  bio:"New MGDL player.",
  banner:"#292929",
  joined:new Date().toISOString()
 };

 profileSave(PROFILE_KEY,profiles);

 input.value="";
 message.textContent="Profile created! Opening your profile...";

 location.href=profileUrl(name);
}

/* ================================
   LEADERBOARD STATISTICS
================================ */

function renderLeaderboardStats(){
 const players=getRankedPlayers();

 const totalPlayers=document.getElementById("totalPlayers");
 const totalCompletions=document.getElementById("totalCompletions");
 const topPlayer=document.getElementById("topPlayer");

 if(totalPlayers){
  totalPlayers.textContent=players.length;
 }

 if(totalCompletions){
  totalCompletions.textContent=players.reduce(
   (total,player)=>total+getCompletedRanks(player).length,0
  );
 }

 if(topPlayer){
  topPlayer.textContent=players.length
   ?players[0].name
   :"—";
 }
}

/* ================================
   PLAYER DIRECTORY
================================ */

function renderProfileDirectory(){
 const container=document.getElementById("profileDirectory");
 if(!container)return;

 const searchInput=document.getElementById("profileSearch");
 const sortInput=document.getElementById("profileSort");

 const filter=searchInput
  ?searchInput.value.trim().toLowerCase()
  :"";

 const sort=sortInput?sortInput.value:"points";

 const profiles=getProfiles();

 let players=getRankedPlayers();

 if(sort==="completions"){
  players.sort((a,b)=>
   getCompletedRanks(b).length-getCompletedRanks(a).length||
   getProfilePoints(b)-getProfilePoints(a)
  );
 }

 if(sort==="name"){
  players.sort((a,b)=>a.name.localeCompare(b.name));
 }

 /*
  Rank remains based on the actual points leaderboard,
  even when another sorting option is selected.
 */
 const globalRanks=new Map(
  getRankedPlayers().map((player,index)=>[
   player.name.toLowerCase(),index+1
  ])
 );

 const results=players.filter(player=>
  player.name.toLowerCase().includes(filter)
 );

 renderLeaderboardStats();

 if(!results.length){
  container.innerHTML=
   '<p class="empty">No players found.</p>';
  return;
 }

 container.innerHTML=results.map(player=>{
  const profile=profiles[player.name]||{
   avatar:"🎮",
   bio:"MGDL player."
  };

  const completed=getCompletedRanks(player);
  const points=getProfilePoints(player);
  const rank=globalRanks.get(player.name.toLowerCase());

  const percentage=Math.round(
   completed.length/PROFILE_DEMONS.length*100
  );

  let rankClass="";
  let medal="";

  if(rank===1){
   rankClass="rank-gold";
   medal="🥇";
  }else if(rank===2){
   rankClass="rank-silver";
   medal="🥈";
  }else if(rank===3){
   rankClass="rank-bronze";
   medal="🥉";
  }

  return `
   <a class="profile-card ${rankClass}"
      href="${profileUrl(player.name)}">

    <div class="player-rank">
     <span class="player-medal">${medal}</span>
     <span class="player-rank-number">#${rank}</span>
    </div>

    <div class="player-identity">
     <div class="directory-avatar">
      ${profileEscape(profile.avatar||"🎮")}
     </div>

     <div class="directory-info">
      <h3>${profileEscape(player.name)}</h3>
      <p>${profileEscape(profile.bio||"MGDL player.")}</p>
     </div>
    </div>

    <div class="player-points">
     ${points.toLocaleString()}
    </div>

    <div class="player-completions">
     <span class="completion-count">
      ${completed.length}/${PROFILE_DEMONS.length}
     </span>

     <div class="completion-track">
      <div class="completion-fill"
       style="width:${percentage}%"></div>
     </div>
    </div>

    <span class="profile-arrow">VIEW →</span>

   </a>
  `;
 }).join("");
}

/* ================================
   INDIVIDUAL PROFILE PAGE
================================ */

function renderProfilePage(){
 const container=document.getElementById("profileView");
 if(!container)return;

 const name=new URLSearchParams(location.search).get("user");

 if(!name){
  container.innerHTML='<p class="empty">No player selected.</p>';
  return;
 }

 const players=getProfilePlayers();

 const player=players.find(item=>
  item.name.toLowerCase()===name.toLowerCase()
 );

 if(!player){
  container.innerHTML=
   '<p class="empty">Player not found on this device.</p>';
  return;
 }

 const profiles=getProfiles();

 const profile=profiles[player.name]||{
  name:player.name,
  avatar:"🎮",
  bio:"MGDL player.",
  banner:"#292929"
 };

 const stats=getProfileStats(player.name);

 const completedNames=stats.completed.map(rank=>({
  rank,
  name:PROFILE_DEMONS[rank-1]
 }));

 const joined=profile.joined
  ?new Date(profile.joined).toLocaleDateString()
  :"Unknown";

 container.innerHTML=`
  <section class="full-profile">

   <div class="profile-banner"
    style="background:${safeColor(profile.banner)}">
   </div>

   <div class="profile-main">

    <div class="profile-avatar">
     ${profileEscape(profile.avatar||"🎮")}
    </div>

    <h2>${profileEscape(player.name)}</h2>

    <p class="profile-bio">
     ${profileEscape(profile.bio||"MGDL player.")}
    </p>

    <span class="profile-joined">
     Joined ${joined}
    </span>

    <div class="profile-stats">
     <div>
      <strong>${stats.points.toLocaleString()}</strong>
      <span>POINTS</span>
     </div>

     <div>
      <strong>#${stats.rank}</strong>
      <span>POSITION</span>
     </div>

     <div>
      <strong>${completedNames.length}</strong>
      <span>COMPLETIONS</span>
     </div>
    </div>

    <button id="editProfileButton" type="button">
     Edit profile
    </button>

    <form id="editProfileForm"
     class="edit-profile-form" hidden>

     <label>Avatar emoji</label>
     <input class="field" id="editAvatar"
      maxlength="8"
      value="${profileEscape(profile.avatar||"🎮")}">

     <label>Bio</label>
     <textarea class="field" id="editBio"
      maxlength="120"
      rows="3">${profileEscape(profile.bio||"")}</textarea>

     <label>Banner colour</label>
     <select class="field" id="editBanner">
      <option value="#292929">Charcoal</option>
      <option value="#202020">Dark grey</option>
      <option value="#383838">Silver grey</option>
      <option value="#252033">Dark purple</option>
      <option value="#351b20">Dark red</option>
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
    ?completedNames.map(demon=>`
      <div class="completed-row">
       <span class="rank">#${demon.rank}</span>
       <strong>${profileEscape(demon.name)}</strong>
       <span class="completion-percent">100%</span>
      </div>
     `).join("")
    :'<p class="empty">No completed demons recorded yet.</p>'
   }
  </section>

  <p class="local-notice">
   Profile data is stored locally on this device.
   Player progress is read from the MGDL leaderboard.
  </p>
 `;

 const bannerSelect=document.getElementById("editBanner");

 if([...bannerSelect.options].some(option=>
  option.value===profile.banner
 )){
  bannerSelect.value=profile.banner;
 }

 document.getElementById("editProfileButton")
  .addEventListener("click",()=>{
   const form=document.getElementById("editProfileForm");
   form.hidden=!form.hidden;
  });

 document.getElementById("editProfileForm")
  .addEventListener("submit",event=>{
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

/* ================================
   BANNER COLOUR VALIDATION
================================ */

function safeColor(value){
 const allowed=[
  "#292929",
  "#202020",
  "#383838",
  "#252033",
  "#351b20"
 ];

 return allowed.includes(value)?value:"#292929";
}

/* ================================
   STARTUP
================================ */

document.addEventListener("DOMContentLoaded",()=>{

 const registerForm=document.getElementById("registerForm");

 if(registerForm){
  registerForm.addEventListener("submit",registerProfile);
 }

 const search=document.getElementById("profileSearch");

 if(search){
  search.addEventListener("input",renderProfileDirectory);
 }

 const sort=document.getElementById("profileSort");

 if(sort){
  sort.addEventListener("change",renderProfileDirectory);
 }

 renderProfileDirectory();
 renderProfilePage();

});
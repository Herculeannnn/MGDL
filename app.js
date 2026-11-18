
const DEMONS=[
{rank:1,name:"Firework",video:"QBe5x2o9v2w"},
{rank:2,name:"Unknown",video:"a1sQxQqU6EM"},
{rank:3,name:"Kenos",video:"Bs1kVySdUtI"},
{rank:4,name:"Zodiac",video:"91AcKHJC5PA"},
{rank:5,name:"Bloodlust",video:"5SzKetF2btw"},
{rank:6,name:"Shardscapes",video:"2njKGrzPmVY"},
{rank:7,name:"Arctic Lights",video:"NDqUHxZjRUw"},
{rank:8,name:"Wasureta",video:"LDdnsp53PJs"},
{rank:9,name:"Yatagarasu",video:"vKXBWa2o3Dw"},
{rank:10,name:"Bloodbath",video:"A6xe4tKdx_c"},
{rank:11,name:"Cataclysm",video:"J90L73YOR3k"},
{rank:12,name:"Sweater Weather",video:"6YzbM1egN1w"},
{rank:13,name:"Acu",video:"qTE6hE1a_vU"},
{rank:14,name:"Rauchkammer",video:"-ge89eZ9_5M"},
{rank:15,name:"MikuMikuMikuMiku",video:"VQOJ_SZ0Nto"},
{rank:16,name:"Supersonic",video:"Wqtn1vsU-HY"},
{rank:17,name:"Crazy III",video:"1ynspvn8KSs"},
{rank:18,name:"Death Note",video:"asQrt9B3aMo"},
{rank:19,name:"Crazy II",video:"eGPNEaZV6cc"},
{rank:20,name:"Crazy",video:"g_MP6BENHEs"},
{rank:21,name:"Nine Circles",video:"dOdPoU1ncOc"},
{rank:22,name:"Troll Madness",video:"zK3c_RDr-88"},
{rank:23,name:"B",video:"ohKPqGxotao"},
{rank:24,name:"Permafrost Mountain",video:"-jlOsjCoTJM"},
{rank:25,name:"Demon Park",video:"JgNcaLkn7bU"}
];

const PLAYER_KEY="maldivesDemonProgressV1";
const UNRATED_KEY="mgdlUnratedLevelsV1";
const ORDER_VERSION="mgdlOrderV2";

function readStore(key,fallback){
 try{
  const data=JSON.parse(localStorage.getItem(key));
  return data??fallback;
 }catch(e){
  return fallback;
 }
}

let players=readStore(PLAYER_KEY,[
 {name:"snappedlol",completed:DEMONS.map(d=>d.rank)},
 {name:"Hxssuuu",completed:[11,14,16]}
]);

let unrated=readStore(UNRATED_KEY,[]);

function migrateCompletions(){
 if(localStorage.getItem(ORDER_VERSION)==="done")return;

 const oldOrder=[
  "Firework","Unknown","Kenos","Zodiac","Bloodlust",
  "Yatagarasu","Bloodbath","Acu","Crazy III","Supersonic",
  "Death Note","Crazy II","Crazy","Nine Circles",
  "Troll Madness","Permafrost Mountain"
 ];

 players.forEach(player=>{
  if(!Array.isArray(player.completed))player.completed=[];

  player.completed=player.completed.map(rank=>{
   const oldName=oldOrder[rank-1];
   if(!oldName)return null;

   const newDemon=DEMONS.find(d=>d.name===oldName);
   return newDemon?newDemon.rank:null;
  }).filter(rank=>rank!==null);
 });

 savePlayers();
 localStorage.setItem(ORDER_VERSION,"done");
}

function savePlayers(){
 localStorage.setItem(PLAYER_KEY,JSON.stringify(players));
}

function saveUnrated(){
 localStorage.setItem(UNRATED_KEY,JSON.stringify(unrated));
}

function esc(s){
 return String(s).replace(/[&<>"']/g,c=>({
  "&":"&amp;","<":"&lt;",">":"&gt;",
  '"':"&quot;","'":"&#39;"
 }[c]));
}

function getYouTubeID(value){
 value=value.trim();

 if(/^[\w-]{11}$/.test(value))return value;

 try{
  const u=new URL(value);

  if(u.hostname==="youtu.be"){
   return u.pathname.slice(1).split("/")[0];
  }

  if(u.hostname.endsWith("youtube.com")){
   if(u.pathname==="/watch")return u.searchParams.get("v");

   const p=u.pathname.split("/");
   if(["embed","shorts","live"].includes(p[1]))return p[2];
  }
 }catch(e){}

 return "";
}

/* VICTORS POPUP AND TOP 3 AURA STYLES */
function injectVictorsStyles(){
 if(document.getElementById("victorsStyles"))return;

 const style=document.createElement("style");
 style.id="victorsStyles";

 style.textContent=`

 /* VICTORS POPUP */

 .victors-modal{
  display:none;
  position:fixed;
  inset:0;
  z-index:500;
  background:#000b;
  align-items:center;
  justify-content:center;
  padding:15px;
 }

 .victors-modal.show{display:flex}

 .victors-box{
  position:relative;
  width:100%;
  max-width:430px;
  max-height:80vh;
  overflow-y:auto;
  background:#202020;
  border:1px solid #555;
  border-radius:14px;
  padding:24px;
  color:#eee;
  box-shadow:0 10px 40px #0009;
 }

 .victors-box h2{
  color:#eee;
  margin:0 35px 8px 0;
 }

 .victors-close{
  position:absolute;
  top:12px;
  right:12px;
  width:35px;
  height:35px;
  font-size:23px;
  padding:0;
  background:#444;
  color:white;
  border:0;
  border-radius:6px;
  cursor:pointer;
 }

 .victor-entry{
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:13px 10px;
  margin-top:8px;
  background:#303030;
  border:1px solid #484848;
  border-radius:8px;
 }

 .victor-percent{
  color:#ccc;
  font-weight:bold;
 }

 .victors-trigger{
  background:#555;
  border:1px solid #666;
  color:white;
  cursor:pointer;
 }

 .victors-trigger:hover{background:#777}


 /* MGDL TOP 3 DEMON AURAS */

 .demon{
  position:relative;
  isolation:isolate;
  overflow:visible;
  transition:
   box-shadow .35s ease,
   transform .35s ease,
   border-color .35s ease;
 }

 .demon.top-aura-gold{
  border:1px solid rgba(255,215,0,.8);
  box-shadow:
   0 0 12px rgba(255,215,0,.35),
   0 0 28px rgba(255,215,0,.18);
 }

 .demon.top-aura-silver{
  border:1px solid rgba(192,192,192,.8);
  box-shadow:
   0 0 12px rgba(192,192,192,.35),
   0 0 28px rgba(192,192,192,.18);
 }

 .demon.top-aura-bronze{
  border:1px solid rgba(205,127,50,.8);
  box-shadow:
   0 0 12px rgba(205,127,50,.35),
   0 0 28px rgba(205,127,50,.18);
 }


 /* AURA BEHIND THE CARDS */

 .demon.top-aura-gold::before,
 .demon.top-aura-silver::before,
 .demon.top-aura-bronze::before{
  content:"";
  position:absolute;
  inset:-14px;
  border-radius:inherit;
  z-index:-1;
  pointer-events:none;
  filter:blur(22px);
  animation:mgdlAuraPulse 3s ease-in-out infinite;
 }

 .demon.top-aura-gold::before{
  background:radial-gradient(
   ellipse,
   rgba(255,215,0,.65) 0%,
   rgba(255,215,0,.25) 45%,
   transparent 75%
  );
 }

 .demon.top-aura-silver::before{
  background:radial-gradient(
   ellipse,
   rgba(192,192,192,.65) 0%,
   rgba(192,192,192,.25) 45%,
   transparent 75%
  );
 }

 .demon.top-aura-bronze::before{
  background:radial-gradient(
   ellipse,
   rgba(205,127,50,.65) 0%,
   rgba(205,127,50,.25) 45%,
   transparent 75%
  );
 }


 /* HOVER EFFECT */

 .demon.top-aura-gold:hover{
  transform:translateY(-5px);
  box-shadow:
   0 0 18px rgba(255,215,0,.55),
   0 0 38px rgba(255,215,0,.3);
 }

 .demon.top-aura-silver:hover{
  transform:translateY(-5px);
  box-shadow:
   0 0 18px rgba(192,192,192,.55),
   0 0 38px rgba(192,192,192,.3);
 }

 .demon.top-aura-bronze:hover{
  transform:translateY(-5px);
  box-shadow:
   0 0 18px rgba(205,127,50,.55),
   0 0 38px rgba(205,127,50,.3);
 }


 /* ANIMATION */

 @keyframes mgdlAuraPulse{
  0%,100%{
   opacity:.45;
   transform:scale(.96);
  }

  50%{
   opacity:1;
   transform:scale(1.06);
  }
 }

 @media(prefers-reduced-motion:reduce){
  .demon.top-aura-gold::before,
  .demon.top-aura-silver::before,
  .demon.top-aura-bronze::before{
   animation:none;
  }

  .demon{
   transition:none;
  }
 }
 `;

 document.head.appendChild(style);
}

/* CREATE VICTORS POPUP */
function createVictorsModal(){
 if(document.getElementById("victorsModal"))return;

 const modal=document.createElement("div");
 modal.id="victorsModal";
 modal.className="victors-modal";

 modal.innerHTML=`
  <div class="victors-box" role="dialog" aria-modal="true"
  aria-labelledby="victorsTitle">
   <button class="victors-close" type="button"
   onclick="closeVictors()" aria-label="Close">×</button>
   <h2 id="victorsTitle"></h2>
   <p id="victorsCount"></p>
   <div id="victorsList"></div>
  </div>
 `;

 modal.addEventListener("click",e=>{
  if(e.target===modal)closeVictors();
 });

 document.body.appendChild(modal);
}

function openVictors(demon){
 const modal=document.getElementById("victorsModal");
 if(!modal)return;

 const victors=players.filter(player=>
  Array.isArray(player.completed)&&
  player.completed.includes(demon.rank)
 );

 document.getElementById("victorsTitle").textContent=
  `#${demon.rank} — ${demon.name}`;

 document.getElementById("victorsCount").textContent=
  `${victors.length} ${victors.length===1?"Victor":"Victors"}`;

 const list=document.getElementById("victorsList");

 if(!victors.length){
  list.innerHTML='<p class="empty">No victors yet.</p>';
 }else{
  list.innerHTML=victors.map((player,index)=>`
   <div class="victor-entry">
    <span>${index+1}. ${esc(player.name)}</span>
    <span class="victor-percent">100%</span>
   </div>
  `).join("");
 }

 modal.classList.add("show");
}

function closeVictors(){
 const modal=document.getElementById("victorsModal");
 if(modal)modal.classList.remove("show");
}

/* DEMONLIST */
function renderDemons(filter=""){
 const grid=document.getElementById("demonGrid");
 if(!grid)return;

 grid.innerHTML="";

 const results=DEMONS.filter(d=>
  d.name.toLowerCase().includes(filter.toLowerCase())
 );

 if(!results.length){
  grid.innerHTML='<p class="empty">No demons found.</p>';
  return;
 }

 results.forEach(d=>{
  const card=document.createElement("article");

  const rankClass =
   d.rank===1 ? "rank-gold" :
   d.rank===2 ? "rank-silver" :
   d.rank===3 ? "rank-bronze" : "";

  const auraClass =
   d.rank===1 ? "top-aura-gold" :
   d.rank===2 ? "top-aura-silver" :
   d.rank===3 ? "top-aura-bronze" : "";

  card.className=`demon ${auraClass}`;
  card.style.cursor="pointer";

  card.innerHTML=`
   <img src="https://img.youtube.com/vi/${d.video}/hqdefault.jpg"
   alt="${esc(d.name)}">

   <div class="info">
    <div class="top">
     <span class="rank ${rankClass}">#${d.rank}</span>
     <h3>${esc(d.name)}</h3>
    </div>

    <p>Difficulty: Extreme Demon</p>

    <button class="victors-trigger" type="button">
     VICTORS
    </button>

    <a class="watch" target="_blank"
    rel="noopener noreferrer"
    href="https://youtube.com/watch?v=${encodeURIComponent(d.video)}">
     WATCH
    </a>
   </div>
  `;

  card.addEventListener("click",()=>openVictors(d));

  card.querySelector(".victors-trigger").addEventListener("click",e=>{
   e.stopPropagation();
   openVictors(d);
  });

  card.querySelector("a").addEventListener("click",e=>{
   e.stopPropagation();
  });

  grid.appendChild(card);
 });
}

/* UNRATED LEVELS */
function renderUnrated(filter=""){
 const grid=document.getElementById("unratedGrid");
 if(!grid)return;

 grid.innerHTML="";

 const results=unrated.map((v,i)=>({...v,index:i}))
 .filter(v=>
  [v.name,v.creator,v.id].join(" ")
  .toLowerCase().includes(filter.toLowerCase())
 );

 if(!results.length){
  grid.innerHTML='<p class="empty">No unrated levels found.</p>';
  return;
 }

 results.forEach(v=>{
  const card=document.createElement("article");
  card.className="unrated-card";

  card.innerHTML=`
   <img src="https://img.youtube.com/vi/${encodeURIComponent(v.video)}/hqdefault.jpg"
   alt="Level showcase">
   <div class="info">
    <span class="unrated-label">UNRATED</span>
    <h3>${esc(v.name)}</h3>
    <p>Creator: ${esc(v.creator)}</p>
    <p>Level ID: ${esc(v.id)}</p>
    <div class="actions">
     <a class="watch" target="_blank"
     rel="noopener noreferrer"
     href="https://youtube.com/watch?v=${encodeURIComponent(v.video)}">
      WATCH
     </a>
     <button class="remove" onclick="removeUnrated(${v.index})">
      Remove
     </button>
    </div>
   </div>
  `;

  grid.appendChild(card);
 });
}

function addUnrated(){
 const name=document.getElementById("unratedName").value.trim();
 const creator=document.getElementById("unratedCreator").value.trim();
 const id=document.getElementById("unratedID").value.trim();
 const video=getYouTubeID(
  document.getElementById("unratedVideo").value
 );

 if(!name||!creator||!id||!video){
  alert("Fill in all fields and enter a valid YouTube link or ID.");
  return;
 }

 if(unrated.some(v=>v.id===id)){
  alert("That level ID is already listed.");
  return;
 }

 unrated.push({name,creator,id,video});
 saveUnrated();

 ["unratedName","unratedCreator","unratedID","unratedVideo"]
 .forEach(id=>{
  document.getElementById(id).value="";
 });

 renderUnrated(
  document.getElementById("unratedSearch")?.value||""
 );
}

function removeUnrated(index){
 if(!confirm("Remove this level?"))return;

 unrated.splice(index,1);
 saveUnrated();

 renderUnrated(
  document.getElementById("unratedSearch")?.value||""
 );
}

/* PLAYER POINTS */
function getPoints(player){
 const completed=Array.isArray(player.completed)
  ?player.completed:[];

 return completed.reduce(
  (total,rank)=>total+151-rank,0
 );
}

/* PLAYER LEADERBOARD */
function renderPlayers(filter=""){
 const list=document.getElementById("playerList");
 if(!list)return;

 list.innerHTML="";

 [...players]
 .sort((a,b)=>getPoints(b)-getPoints(a))
 .filter(p=>
  p.name.toLowerCase().includes(filter.toLowerCase())
 )
 .forEach((player,index)=>{
  const i=players.indexOf(player);
  const completed=Array.isArray(player.completed)
   ?player.completed:[];

  const rankClass =
   index===0 ? "rank-gold" :
   index===1 ? "rank-silver" :
   index===2 ? "rank-bronze" : "";

  const card=document.createElement("article");
  card.className="player";

  card.innerHTML=`
   <div class="player-head">
    <span class="player-position ${rankClass}">#${index+1}</span>
    <b>${esc(player.name)}</b>
    <span class="points">${getPoints(player)} points</span>
   </div>

   <div class="player-actions">
    <button onclick="toggleCompletions(${i})">
     Edit completions
    </button>
    <button class="remove" onclick="removePlayer(${i})">
     Remove
    </button>
   </div>

   <div class="completions" id="completions-${i}">
    ${DEMONS.map(d=>`
     <label class="completion">
      <input type="checkbox"
      ${completed.includes(d.rank)?"checked":""}
      onchange="toggleDemon(${i},${d.rank},this.checked)">
      #${d.rank} — ${esc(d.name)}
     </label>
    `).join("")}
   </div>
  `;

  list.appendChild(card);
 });

 const count=document.getElementById("playerCount");
 if(count)count.textContent=players.length;
}

function addPlayer(){
 const input=document.getElementById("newPlayer");
 if(!input)return;

 const name=input.value.trim();
 if(!name)return;

 if(players.some(p=>
  p.name.toLowerCase()===name.toLowerCase()
 )){
  alert("Player already exists!");
  return;
 }

 players.push({name,completed:[]});
 input.value="";

 savePlayers();

 renderPlayers(
  document.getElementById("playerSearch")?.value||""
 );
}

function removePlayer(i){
 if(!confirm("Remove this player?"))return;

 players.splice(i,1);
 savePlayers();

 renderPlayers(
  document.getElementById("playerSearch")?.value||""
 );
}

function toggleCompletions(i){
 const element=document.getElementById("completions-"+i);
 if(element)element.classList.toggle("show");
}

function toggleDemon(i,rank,checked){
 if(!players[i])return;

 if(!Array.isArray(players[i].completed)){
  players[i].completed=[];
 }

 const completed=players[i].completed;

 if(checked&&!completed.includes(rank)){
  completed.push(rank);
 }

 if(!checked){
  players[i].completed=completed.filter(r=>r!==rank);
 }

 savePlayers();

 renderPlayers(
  document.getElementById("playerSearch")?.value||""
 );
}

/* INITIALIZE */
document.addEventListener("DOMContentLoaded",()=>{

 migrateCompletions();

 injectVictorsStyles();
 createVictorsModal();

 document.addEventListener("keydown",e=>{
  if(e.key==="Escape")closeVictors();
 });

 renderDemons();
 renderUnrated();
 renderPlayers();

 const levelCount=document.getElementById("levelCount");
 if(levelCount){
  levelCount.textContent=DEMONS.length;
 }

 const searches=[
  ["demonSearch",renderDemons],
  ["unratedSearch",renderUnrated],
  ["playerSearch",renderPlayers]
 ];

 searches.forEach(([id,fn])=>{
  const input=document.getElementById(id);

  if(input){
   input.addEventListener("input",()=>{
    fn(input.value);
   });
  }
 });
});

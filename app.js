
const DEMONS=[
{rank:1,name:"Firework",video:"QBe5x2o9v2w"},
{rank:2,name:"Unknown",video:"a1sQxQqU6EM"},
{rank:3,name:"Kenos",video:"Bs1kVySdUtI"},
{rank:4,name:"Zodiac",video:"91AcKHJC5PA"},
{rank:5,name:"Bloodlust",video:"5SzKetF2btw"},
{rank:6,name:"Yatagarasu",video:"vKXBWa2o3Dw"},
{rank:7,name:"Bloodbath",video:"A6xe4tKdx_c"},
{rank:8,name:"Acu",video:"qTE6hE1a_vU"},
{rank:9,name:"Crazy III",video:"1ynspvn8KSs"},
{rank:10,name:"Supersonic",video:"3yblLSc0HFqV-ntn"},
{rank:11,name:"Death Note",video:"asQrt9B3aMo"},
{rank:12,name:"Crazy II",video:"eGPNEaZV6cc"},
{rank:13,name:"Crazy",video:"g_MP6BENHEs"},
{rank:14,name:"Nine Circles",video:"dOdPoU1ncOc"},
{rank:15,name:"Troll Madness",video:"zK3c_RDr-88"},
{rank:16,name:"Permafrost Mountain",video:"-jlOsjCoTJM"}
];

const PLAYER_KEY="maldivesDemonProgressV1";
const UNRATED_KEY="mgdlUnratedLevelsV1";

function readStore(key,fallback){
 try{return JSON.parse(localStorage.getItem(key))||fallback}
 catch(e){return fallback}
}

let players=readStore(PLAYER_KEY,[
 {name:"snappedlol",completed:DEMONS.map(d=>d.rank)},
 {name:"Hxssuuu",completed:[11,14,16]}
]);

let unrated=readStore(UNRATED_KEY,[]);

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
  if(u.hostname==="youtu.be")return u.pathname.slice(1).split("/")[0];
  if(u.hostname.endsWith("youtube.com")){
   if(u.pathname==="/watch")return u.searchParams.get("v");
   const p=u.pathname.split("/");
   if(["embed","shorts","live"].includes(p[1]))return p[2];
  }
 }catch(e){}
 return "";
}

/* VICTORS POPUP STYLING */
function injectVictorsStyles(){
 if(document.getElementById("victorsStyles"))return;

 const style=document.createElement("style");
 style.id="victorsStyles";

 style.textContent=`
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
 }

 .victors-trigger:hover{
  background:#777;
 }
 `;

 document.head.appendChild(style);
}

/* OPEN VICTORS */
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
  card.className="demon";
  card.style.cursor="pointer";

  card.innerHTML=`
   <img src="https://img.youtube.com/vi/${d.video}/hqdefault.jpg"
   alt="${esc(d.name)}">

   <div class="info">
    <div class="top">
     <span class="rank">#${d.rank}</span>
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

  card.addEventListener("click",()=>{
   openVictors(d);
  });

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
 .filter(v=>[v.name,v.creator,v.id].join(" ").toLowerCase().includes(filter.toLowerCase()));

 if(!results.length){
  grid.innerHTML='<p class="empty">No unrated levels found.</p>';
  return;
 }

 results.forEach(v=>{
  const card=document.createElement("article");
  card.className="unrated-card";

  card.innerHTML=`
   <img src="https://img.youtube.com/vi/${encodeURIComponent(v.video)}/hqdefault.jpg" alt="Level showcase">
   <div class="info">
    <span class="unrated-label">UNRATED</span>
    <h3>${esc(v.name)}</h3>
    <p>Creator: ${esc(v.creator)}</p>
    <p>Level ID: ${esc(v.id)}</p>
    <div class="actions">
     <a class="watch" target="_blank" href="https://youtube.com/watch?v=${encodeURIComponent(v.video)}">WATCH</a>
     <button class="remove" onclick="removeUnrated(${v.index})">Remove</button>
    </div>
   </div>`;

  grid.appendChild(card);
 });
}

function addUnrated(){
 const name=document.getElementById("unratedName").value.trim();
 const creator=document.getElementById("unratedCreator").value.trim();
 const id=document.getElementById("unratedID").value.trim();
 const video=getYouTubeID(document.getElementById("unratedVideo").value);

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

 ["unratedName","unratedCreator","unratedID","unratedVideo"].forEach(id=>{
  document.getElementById(id).value="";
 });

 renderUnrated(document.getElementById("unratedSearch").value);
}

function removeUnrated(index){
 if(!confirm("Remove this level?"))return;

 unrated.splice(index,1);
 saveUnrated();
 renderUnrated(document.getElementById("unratedSearch")?.value||"");
}

/* PLAYER POINTS */
function getPoints(player){
 return player.completed.reduce((total,rank)=>total+151-rank,0);
}

/* PLAYER LEADERBOARD */
function renderPlayers(filter=""){
 const list=document.getElementById("playerList");
 if(!list)return;

 list.innerHTML="";

 [...players].sort((a,b)=>getPoints(b)-getPoints(a))
 .filter(p=>p.name.toLowerCase().includes(filter.toLowerCase()))
 .forEach(player=>{
  const i=players.indexOf(player);
  const card=document.createElement("article");
  card.className="player";

  card.innerHTML=`
   <div class="player-head">
    <b>${esc(player.name)}</b>
    <span class="points">${getPoints(player)} points</span>
   </div>

   <div class="player-actions">
    <button onclick="toggleCompletions(${i})">Edit completions</button>
    <button class="remove" onclick="removePlayer(${i})">Remove</button>
   </div>

   <div class="completions" id="completions-${i}">
    ${DEMONS.map(d=>`
     <label class="completion">
      <input type="checkbox"
      ${player.completed.includes(d.rank)?"checked":""}
      onchange="toggleDemon(${i},${d.rank},this.checked)">
      #${d.rank} — ${esc(d.name)}
     </label>
    `).join("")}
   </div>`;

  list.appendChild(card);
 });

 const count=document.getElementById("playerCount");
 if(count)count.textContent=players.length;
}

function addPlayer(){
 const input=document.getElementById("newPlayer");
 const name=input.value.trim();

 if(!name)return;

 if(players.some(p=>p.name.toLowerCase()===name.toLowerCase())){
  alert("Player already exists!");
  return;
 }

 players.push({name,completed:[]});
 input.value="";
 savePlayers();

 renderPlayers(document.getElementById("playerSearch")?.value||"");
}

function removePlayer(i){
 if(!confirm("Remove this player?"))return;

 players.splice(i,1);
 savePlayers();

 renderPlayers(document.getElementById("playerSearch")?.value||"");
}

function toggleCompletions(i){
 document.getElementById("completions-"+i).classList.toggle("show");
}

function toggleDemon(i,rank,checked){
 const a=players[i].completed;

 if(checked&&!a.includes(rank))a.push(rank);
 if(!checked)players[i].completed=a.filter(r=>r!==rank);

 savePlayers();
 renderPlayers(document.getElementById("playerSearch")?.value||"");
}

/* INITIALIZE */
document.addEventListener("DOMContentLoaded",()=>{

 injectVictorsStyles();

 const modal=document.createElement("div");
 modal.id="victorsModal";
 modal.className="victors-modal";

 modal.innerHTML=`
  <div class="victors-box">
   <button class="victors-close" onclick="closeVictors()">×</button>
   <h2 id="victorsTitle"></h2>
   <p class="muted" id="victorsCount"></p>
   <div id="victorsList"></div>
  </div>
 `;

 modal.addEventListener("click",e=>{
  if(e.target===modal)closeVictors();
 });

 document.body.appendChild(modal);

 document.addEventListener("keydown",e=>{
  if(e.key==="Escape")closeVictors();
 });

 renderDemons();
 renderUnrated();
 renderPlayers();

 const levelCount=document.getElementById("levelCount");
 if(levelCount)levelCount.textContent=DEMONS.length;

 const searches=[
  ["demonSearch",renderDemons],
  ["unratedSearch",renderUnrated],
  ["playerSearch",renderPlayers]
 ];

 searches.forEach(([id,fn])=>{
  const input=document.getElementById(id);
  if(input)input.addEventListener("input",()=>fn(input.value));
 });
});

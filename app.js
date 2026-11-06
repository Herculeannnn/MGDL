
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
{rank:10,name:"Supersonic",video:"Wqtn1vsU-HY"},
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

function renderDemons(filter=""){
 const grid=document.getElementById("demonGrid");
 if(!grid)return;
 grid.innerHTML="";
 const results=DEMONS.filter(d=>d.name.toLowerCase().includes(filter.toLowerCase()));
 if(!results.length){grid.innerHTML='<p class="empty">No demons found.</p>';return}
 results.forEach(d=>{
  const card=document.createElement("article");
  card.className="demon";
  card.innerHTML=`
  <img src="https://img.youtube.com/vi/${d.video}/hqdefault.jpg" alt="${esc(d.name)}">
  <div class="info">
   <div class="top"><span class="rank">#${d.rank}</span><h3>${esc(d.name)}</h3></div>
   <p>Difficulty: Extreme Demon</p>
   <a class="watch" target="_blank" href="https://youtube.com/watch?v=${d.video}">WATCH</a>
  </div>`;
  grid.appendChild(card);
 });
}

function renderUnrated(filter=""){
 const grid=document.getElementById("unratedGrid");
 if(!grid)return;
 grid.innerHTML="";
 const results=unrated.map((v,i)=>({...v,index:i}))
 .filter(v=>[v.name,v.creator,v.id].join(" ").toLowerCase().includes(filter.toLowerCase()));

 if(!results.length){grid.innerHTML='<p class="empty">No unrated levels found.</p>';return}

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

function getPoints(player){
 return player.completed.reduce((total,rank)=>total+151-rank,0);
}

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
      <input type="checkbox" ${player.completed.includes(d.rank)?"checked":""}
      onchange="toggleDemon(${i},${d.rank},this.checked)">
      #${d.rank} — ${esc(d.name)}
     </label>`).join("")}
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
 renderPlayers(document.getElementById("playerSearch").value);
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

document.addEventListener("DOMContentLoaded",()=>{
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

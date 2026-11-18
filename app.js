
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

  const rankClass = d.rank === 1 ? "rank-gold" :
                    d.rank === 2 ? "rank-silver" :
                    d.rank === 3 ? "rank-bronze" : "";

  card.innerHTML=`
   <img src="https://img.youtube.com/vi/${d.video}/hqdefault.jpg"
   alt="${esc(d.name)}">
   <div class="info">
    <div class="top">
     <span class="rank ${rankClass}">#${d.rank}</span>
     <h3>${esc(d.name)}</h3>
    </div>
    <p>Difficulty: Extreme Demon</p>
    <button class="victors-trigger" type="button">VICTORS</button>
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

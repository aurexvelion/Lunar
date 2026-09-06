function renderToday(){
  ensureWeek();
  const el=document.getElementById('today');
  const d=new Date(), day=d.getDay();
  let resin=clamp(S.resin,0,200);
  const q=todayQueue();
  const tomorrow=tomorrowDomainGoals();
  const hasHigherTomorrow=tomorrow.length>0;
  let html=`<div class="card hero"><div class="eyebrow">${DAY[day]} · TODAY</div><div class="title">Spend resin without thinking</div>
    <div class="inline-input"><label>Current Original Resin</label><input id="resinInput" type="number" min="0" max="200" value="${resin}"></div></div>`;

  if(q.length){
    const first=q[0];
    let runs=Math.floor(resin/first.cost);
    if(first.kind==='weekly') runs=Math.min(1,runs);
    const spend=runs*first.cost;
    html+=`<div class="card"><div class="eyebrow">BEST USE RIGHT NOW</div><div class="task primary">
      <div class="taskhead"><div><b>${esc(first.title)}</b><div class="muted" style="font-size:10px;margin-top:3px">${esc(first.owner)} · ${esc(first.source)}</div></div><span class="pill">${first.cost} resin</span></div>
      <div class="tags"><span class="tag">${esc(first.remaining)}</span>${first.days?`<span class="tag">${first.days.map(x=>SHORT[x]).join(' / ')}</span>`:''}</div>
      <div style="margin-top:10px"><b>${runs>0?`${runs} run${runs===1?'':'s'} · ${spend} resin`:'Wait for enough resin for 1 run'}</b></div>
      <button class="action goodbtn" onclick="setDoneToday('${first.id}',true)">DONE WITH THIS FOR TODAY</button>
    </div></div>`;

    if(q.length>1){html+=`<div class="section-title">After that</div><div class="card">`+q.slice(1,5).map(g=>`<div class="row"><div class="left"><b>${esc(g.title)}</b><small>${esc(g.owner)} · ${esc(g.source)}</small></div><span class="pill">${g.cost}</span></div>`).join('')+`</div>`}
  }else{
    const arts=artifactQueue();
    if(hasHigherTomorrow){
      html+=`<div class="card savebox"><b>SAVE RESIN</b><div>Tomorrow has unfinished time-gated farming.</div><div class="note">${tomorrow.map(g=>esc(g.title)).join(' · ')}</div></div>`;
      if(arts.length)html+=`<div class="card"><div class="eyebrow">ONLY IF YOU WOULD CAP</div><div class="row"><div class="left"><b>${esc(arts[0].title)}</b><small>${esc(arts[0].source)}</small></div><span class="pill">artifact fallback</span></div></div>`;
    }else if(arts.length){
      const a=arts[0],runs=Math.floor(resin/20);
      html+=`<div class="card"><div class="eyebrow">NON-ARTIFACT GOALS CLEAR / UNAVAILABLE</div><div class="task primary"><div class="taskhead"><div><b>${esc(a.title)}</b><div class="muted" style="font-size:10px;margin-top:3px">${esc(a.owner)} · ${esc(a.source)}</div></div><span class="pill">20 resin</span></div><div style="margin-top:10px"><b>${runs} run${runs===1?'':'s'} available</b></div><button class="action goodbtn" onclick="setDoneToday('${a.id}',true)">DONE WITH THIS FOR TODAY</button></div></div>`;
    }else{
      html+=`<div class="card savebox"><b>YOU'RE DONE</b><div>No unfinished resin goals remain.</div></div>`;
    }
  }

  const todayDone=Object.keys(S.dayDone[dateKey()]||{}).filter(k=>S.dayDone[dateKey()][k]);
  if(todayDone.length){html+=`<button class="action secondary" onclick="clearTodayDone()">RESET TODAY BUTTONS</button>`}
  el.innerHTML=html;
  const input=document.getElementById('resinInput');
  if(input)input.addEventListener('change',()=>{S.resin=clamp(input.value,0,200);save();renderToday()});
}
function clearTodayDone(){S.dayDone[dateKey()]={};save();renderToday()}

function renderPlan(){
  const el=document.getElementById('plan');
  const day=new Date().getDay();
  const non=RESIN_GOALS.filter(g=>g.kind!=='artifact');
  const art=RESIN_GOALS.filter(g=>g.kind==='artifact');
  const row=g=>`<div class="checkrow ${goalDone(g.id)?'goal-complete':''}"><input type="checkbox" ${goalDone(g.id)?'checked':''} onchange="toggleGoal('${g.id}',this.checked)"><label><b>${esc(g.owner)} · ${esc(g.title)}</b><small>${esc(g.remaining)}<br>${esc(g.source)}${g.days?' · '+g.days.map(x=>SHORT[x]).join('/') : ''}${available(g,day)&&!goalDone(g.id)?' · AVAILABLE TODAY':''}</small></label></div>`;
  el.innerHTML=`<div class="card hero"><div class="eyebrow">SOURCE OF TRUTH = HOYOLAB</div><div class="title">Resin goals</div><div class="muted">When HoYoLAB says a goal is finished, tick it here. No material-count spreadsheet required.</div></div>
  <div class="section-title">Everything before artifacts</div><div class="card">${non.map(row).join('')}</div>
  <div class="section-title">Artifacts last</div><div class="card">${art.map(row).join('')}</div>
  <button class="action secondary" onclick="resetGoals()">RESET ALL GOAL CHECKS</button>`;
}
function toggleGoal(id,v){S.completedGoals[id]=v;save();renderPlan();renderToday()}
function resetGoals(){if(!confirm('Reset every resin goal checkbox?'))return;S.completedGoals={};save();renderPlan();renderToday()}

function renderWishes(){
  const w=S.wishes;
  const available=Math.floor(clamp(w.primos,0,99999999)/160)+clamp(w.fates,0,999999);
  const cp=clamp(w.charPity,0,89), wp=clamp(w.weaponPity,0,79);
  const charFirst=(w.charGuaranteed?90:180)-cp;
  const charWorst=charFirst+(4*180);
  const weaponFirst=(w.weaponFate?80:160)-wp;
  const weaponWorst=weaponFirst+(2*160);
  const total=charWorst+weaponWorst;
  const missing=Math.max(0,total-available);
  const pct=Math.min(100,total?available/total*100:100);
  document.getElementById('wishes').innerHTML=`
  <div class="card hero"><div class="eyebrow">FIXED TARGET LIST</div><div class="targetchips"><span class="targetchip">Staff of Homa ×1</span><span class="targetchip">Yelan ×2</span><span class="targetchip">Aqua Simulacra ×1</span><span class="targetchip">Nicole ×3</span><span class="targetchip">Angelos' Heptades ×1</span></div></div>
  <div class="grid2"><div class="metric"><span class="muted">Saved wishes</span><b>${available}</b><small>${Math.floor(clamp(w.primos,0,99999999)/160)} from primos + ${clamp(w.fates,0,999999)} fates</small></div><div class="metric"><span class="muted">Worst-case missing</span><b>${missing}</b><small>${(missing*160).toLocaleString()} primogems</small></div></div>
  <div class="card"><div><span>Worst-case fund</span><b style="float:right">${Math.round(pct)}%</b></div><div class="bar"><i style="width:${pct}%"></i></div><div class="note">Worst case assumes 5 featured character copies total and Homa, Aqua and Angelos as separate weapon targets. Weapon Fate Points do not carry between weapon banners.</div></div>
  <div class="section-title">Savings</div><div class="card">
    ${wishInput('Primogems','primos',w.primos,0,99999999)}
    ${wishInput('Intertwined Fates','fates',w.fates,0,999999)}
  </div>
  <div class="section-title">Character banner</div><div class="card">
    ${wishInput('Current pity','charPity',w.charPity,0,89)}
    <div class="checkrow"><input id="charGuaranteed" type="checkbox" ${w.charGuaranteed?'checked':''}><label><b>Next 5★ is guaranteed featured</b><small>Turn on after losing a 50/50.</small></label></div>
    <div class="row"><div class="left"><b>Worst case for 2 Yelan + 3 Nicole</b><small>Starting from your current character pity.</small></div><span class="pill">${charWorst} wishes</span></div>
  </div>
  <div class="section-title">Weapon banner</div><div class="card">
    ${wishInput('Current pity','weaponPity',w.weaponPity,0,79)}
    <div class="checkrow"><input id="weaponFate" type="checkbox" ${w.weaponFate?'checked':''}><label><b>1 Fate Point on current target</b><small>If enabled, the next weapon 5★ is treated as the selected weapon.</small></label></div>
    <div class="row"><div class="left"><b>Worst case for Homa + Aqua + Angelos</b><small>Three target weapons.</small></div><span class="pill">${weaponWorst} wishes</span></div>
  </div>`;
  document.querySelectorAll('[data-wish]').forEach(x=>x.addEventListener('change',()=>{S.wishes[x.dataset.wish]=clamp(x.value,Number(x.min),Number(x.max));save();renderWishes()}));
  document.getElementById('charGuaranteed').addEventListener('change',e=>{S.wishes.charGuaranteed=e.target.checked;save();renderWishes()});
  document.getElementById('weaponFate').addEventListener('change',e=>{S.wishes.weaponFate=e.target.checked;save();renderWishes()});
}
function wishInput(label,key,val,min,max){return `<div class="inline-input"><label>${label}</label><input data-wish="${key}" type="number" min="${min}" max="${max}" value="${clamp(val,min,max)}"></div>`}

function renderPrimos(){
  document.getElementById('primos').innerHTML=`<div class="card hero"><div class="eyebrow">PRIMOGEM MAP</div><div class="title">Where the pink rocks hide</div><div class="muted">Simple list. No fake precision, no 47-tab economy simulator.</div></div>
  <div class="card">${PRIMO_SOURCES.map(([a,b,c])=>`<div class="row"><div class="left"><b>${esc(a)}</b><small>${esc(c)}</small></div><span class="pill">${esc(b)}</span></div>`).join('')}</div>
  <a class="linkbtn" href="https://genshin.hoyoverse.com/m/en/gift">OPEN OFFICIAL CODE REDEMPTION</a>
  <div class="note" style="padding:0 4px">The daily ChatGPT code check is separate from L.U.N.A.R. and runs at 12:00 Finland time.</div>`;
}

function renderWeekly(){
  ensureWeek();
  const w=S.weekly;
  const items=[
    ['transformer','Parametric Transformer','Use it once when available.'],
    ['trap','Crystalfly Trap','Collect/redeploy when its cooldown is ready.'],
    ['teapot','Buy Transient Resin','Serenitea Pot weekly shop.'],
    ['azhdaha','Azhdaha','Needed for Yelan Gilded Scales.'],
    ['dottore','Il Dottore','Needed for Nicole Counterfeit Resin.'],
    ['third','Third discounted weekly boss','Optional flex claim if you want the third discount.']
  ];
  document.getElementById('weekly').innerHTML=`<div class="card hero"><div class="eyebrow">${esc(w.weekKey)}</div><div class="title">Weekly checker</div><div class="muted">Automatically resets when a new ISO week starts.</div></div>
  <div class="card">${items.map(([k,n,d])=>`<div class="checkrow"><input data-week="${k}" type="checkbox" ${w[k]?'checked':''}><label><b>${esc(n)}</b><small>${esc(d)}</small></label></div>`).join('')}</div>`;
  document.querySelectorAll('[data-week]').forEach(x=>x.addEventListener('change',()=>{S.weekly[x.dataset.week]=x.checked;save();renderToday()}));
}

function renderTeam(){
  document.getElementById('team').innerHTML=`<div class="card hero"><div class="eyebrow">CURRENT FOUR</div><div class="title">Hu Tao · Yelan · Mona · Nicole</div><div class="muted">Artifact choices here are aimed at this exact four-character setup.</div></div><div class="roster">${TEAM.map(c=>`<div class="charcard"><div class="charhead"><div><h3>${esc(c.name)}</h3><div class="muted" style="font-size:10px;margin-top:2px">${esc(c.role)}</div></div><span class="pill ${c.element.toLowerCase()}">${esc(c.element)}</span></div><div class="charline"><b>Weapon:</b> ${esc(c.weapon)}</div><div class="charline"><b>Artifacts:</b> ${esc(c.artifact)}</div><div class="charline"><b>Main stats:</b> ${esc(c.stats)}</div><div class="charline"><b>Current target:</b> ${esc(c.note)}</div></div>`).join('')}</div>`;
}

function renderAll(){renderToday();renderPlan();renderWishes();renderPrimos();renderWeekly();renderTeam()}

document.getElementById('nav').addEventListener('click',e=>{
  const b=e.target.closest('button[data-page]');if(!b)return;
  document.querySelectorAll('.nav button').forEach(x=>x.classList.toggle('on',x===b));
  document.querySelectorAll('.page').forEach(x=>x.classList.toggle('on',x.id===b.dataset.page));
});

renderAll();

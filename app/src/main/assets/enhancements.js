(() => {
  if (window.__lunarEnhancementsLoaded) return;
  window.__lunarEnhancementsLoaded = true;

  const nav = document.getElementById('mainNav');
  const viewport = document.querySelector('.viewport');
  if (!nav || !viewport || typeof s === 'undefined' || typeof mats === 'undefined' || typeof chars === 'undefined') return;

  const extraStyle = document.createElement('style');
  extraStyle.textContent = `
    .actionbtn{width:100%;font-weight:800;border-color:#6572bd;background:#222b49;margin-top:8px}
    .priorityrow{display:grid;grid-template-columns:minmax(0,1fr) 42px 42px;gap:6px;align-items:center;padding:8px 0;border-top:1px solid #222938}
    .priorityrow:first-child{border-top:0}.priorityrow button{min-height:36px;padding:4px}
    .countdown{font-variant-numeric:tabular-nums}.logrow{padding:8px 0;border-top:1px solid #222938;font-size:11px}.logrow:first-child{border-top:0}
    .buttonGrid{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:8px}.buttonGrid button{font-size:10px}
    .advice{padding:14px;border-radius:14px;background:#0d1119;border:1px solid #30384b;margin-top:8px}.advice b{display:block;font-size:15px;margin-bottom:4px}
  `;
  document.head.appendChild(extraStyle);

  function addPage(id, label) {
    if (!document.querySelector(`#mainNav [data-page="${id}"]`)) {
      const b = document.createElement('button');
      b.dataset.page = id;
      b.textContent = label;
      nav.appendChild(b);
      b.onclick = () => { s.page = id; renderNav(); save(); const p = document.getElementById(id); if (p) p.scrollTop = 0; };
    }
    if (!document.getElementById(id)) {
      const p = document.createElement('section');
      p.id = id;
      p.className = 'page';
      viewport.appendChild(p);
    }
  }
  addPage('planner', 'PLAN');
  addPage('banners', 'BANNERS');

  if (!mats.yelan_mora) {
    mats.yelan_mora = {name:'Mora',need:3200000,step:100000,owner:'yelan',group:'character',source:'Shared Mora stash'};
    if (!chars.yelan.groups.character.includes('yelan_mora')) chars.yelan.groups.character.unshift('yelan_mora');
  }

  const sharedIds = {
    wit: ['yelan_wit','nicole_wit','citlali_wit'],
    mora: ['yelan_mora','nicole_mora','citlali_mora']
  };
  const worldBossIds = ['yelan_boss','nicole_boss','citlali_boss'];
  const weeklyBossIds = ['yelan_gilded','nicole_counterfeit','citlali_denial'];
  const specialtyIds = ['nicole_pine'];
  const forgetItems = [
    ['events','Event rewards','Claim limited event primogem stages before expiry.'],
    ['codes','Promo / livestream codes','Redeem them before the codes die.'],
    ['trials','5★ Test Runs','Grab the 20 primos from each featured 5★ trial.'],
    ['mail','Mailbox / compensation','Claim maintenance, bug-fix and event mail.'],
    ['bp','Battle Pass rewards','Claim anything unlocked before the period ends.'],
    ['teapot','Teapot currency / Realm Depot','Spend Realm Currency and check weekly stock.'],
    ['banner','Banner ending soon','Check pity, weapon Fate Point and banner end date.']
  ];

  function ensure() {
    s.inventory = Object.assign({wit:0,mora:0}, s.inventory || {});
    s.resinPlan = Object.assign({current:160}, s.resinPlan || {});
    s.priority = Array.isArray(s.priority) ? s.priority.filter(x => chars[x]) : ['yelan','nicole','citlali','hutao'];
    ['yelan','nicole','citlali','hutao'].forEach(x => { if (!s.priority.includes(x)) s.priority.push(x); });
    s.specialtyTimers = s.specialtyTimers || {};
    s.bannerDates = Object.assign({yelan:'',nicole:'',citlali:'',hutao:'',extraDaily:0}, s.bannerDates || {});
    s.pullLog = Array.isArray(s.pullLog) ? s.pullLog : [];
    s.dontForget = s.dontForget || {};
    s.wish.weaponFate = Math.max(0, Math.min(1, +s.wish.weaponFate || 0));
  }
  ensure();

  const baseRemain = remain;
  const baseMaterialRow = materialRow;
  const baseDomainTasks = domainTasks;

  function sharedKind(id) {
    if (sharedIds.wit.includes(id)) return 'wit';
    if (sharedIds.mora.includes(id)) return 'mora';
    return null;
  }
  function totalSharedNeed(kind) { return sharedIds[kind].reduce((a,id) => a + (mats[id] ? mats[id].need : 0), 0); }
  function allocatedFor(id) {
    const kind = sharedKind(id);
    if (!kind) return null;
    let pool = Math.max(0, +s.inventory[kind] || 0);
    for (const owner of s.priority) {
      for (const mid of sharedIds[kind]) {
        if (!mats[mid] || mats[mid].owner !== owner) continue;
        const a = Math.min(pool, mats[mid].need);
        if (mid === id) return a;
        pool -= a;
      }
    }
    return 0;
  }
  remain = function(id) {
    const kind = sharedKind(id);
    if (kind) return Math.max(0, mats[id].need - allocatedFor(id));
    return baseRemain(id);
  };
  pct = function(ids) {
    if (!ids.length) return 100;
    const need = ids.reduce((a,id) => a + mats[id].need, 0);
    const done = ids.reduce((a,id) => a + (mats[id].need - remain(id)), 0);
    return need ? Math.round(done / need * 100) : 100;
  };
  materialRow = function(id) {
    const kind = sharedKind(id);
    if (!kind) return baseMaterialRow(id);
    const m = mats[id], allocated = allocatedFor(id), stash = Math.max(0,+s.inventory[kind]||0), step = kind === 'mora' ? 100000 : 1;
    const done = allocated >= m.need;
    return `<div class="matrow ${done?'done':''}"><div><div class="matname">${done?'✓ ':''}${m.name}</div><div class="matsource">Shared stash ${stash.toLocaleString()} • allocated by goal priority</div></div><div class="stepper"><button data-shared="${kind}" data-d="-${step}">−</button><b>${allocated.toLocaleString()} / ${m.need.toLocaleString()}</b><button data-shared="${kind}" data-d="${step}">+</button></div></div>`;
  };
  domainTasks = function(day) {
    const p = baseDomainTasks(day);
    return p.sort((a,b) => s.priority.indexOf(a.owner) - s.priority.indexOf(b.owner));
  };

  const baseWishCalc = wishCalc;
  wishCalc = function() {
    const w = s.wish;
    const available = Math.floor(Math.max(0,w.primos)/160) + Math.max(0,w.fates);
    const cn = Math.max(0,Math.floor(w.charsNeeded)), wn = Math.max(0,Math.floor(w.weaponsNeeded));
    const cWorst = cn ? Math.max(0,90-clamp(w.charPity,0,89)) + (w.charGuaranteed?0:90) + Math.max(0,cn-1)*180 : 0;
    const firstWeapon = wn ? Math.max(0,80-clamp(w.weaponPity,0,79)) + (w.weaponFate?0:80) : 0;
    const wWorst = wn ? firstWeapon + Math.max(0,wn-1)*160 : 0;
    const total = cWorst + wWorst;
    return {available,cWorst,wWorst,total,missing:Math.max(0,total-available),primoEq:Math.max(0,total-available)*160};
  };

  function bindShared(root=document) {
    root.querySelectorAll('[data-shared]').forEach(b => b.onclick = () => {
      const k = b.dataset.shared, d = +b.dataset.d || 0;
      s.inventory[k] = clamp((+s.inventory[k]||0)+d,0,totalSharedNeed(k));
      save(); renderAll();
    });
  }

  function nextFarmDay() {
    const now = new Date().getDay();
    for (let i=1;i<=7;i++) {
      const d = (now+i)%7;
      if (domainTasks(d).length) return d;
    }
    return null;
  }
  function bossRange(id) {
    const r = remain(id);
    if (!r) return 'DONE';
    return `~${Math.ceil(r/3)}–${Math.ceil(r/2)} claims`;
  }
  function respawnText(id) {
    const t = +s.specialtyTimers[id] || 0;
    if (!t) return 'Not timed yet';
    const left = t + 48*60*60*1000 - Date.now();
    if (left <= 0) return 'RESPAWNED';
    const h = Math.floor(left/3600000), m = Math.floor((left%3600000)/60000);
    return `${h}h ${m}m until estimated respawn`;
  }
  function whatNow() {
    const d = new Date().getDay(), tasks = domainTasks(d);
    if (!s.daily.welkin) return ['Claim Welkin Moon','Free 90 primos first. No reason to leave money-shaped rocks on the floor.'];
    if (!s.daily.comm) return ['Do Daily Commissions','60 guaranteed primos.'];
    if (tasks.length) {
      const t = tasks[0], c = chars[t.owner];
      return [`Farm ${t.domain}`,`${c.name} is highest in your goal priority and has unfinished materials available today.`];
    }
    const spec = specialtyIds.find(id => remain(id)>0 && (!s.specialtyTimers[id] || Date.now() >= s.specialtyTimers[id]+48*60*60*1000));
    if (spec) return [`Collect ${mats[spec].name}`,`${chars[mats[spec].owner].name} still needs ${remain(spec)} and this costs no Resin.`];
    const n = nextFarmDay();
    return ['SAVE RESIN', n==null ? 'All scheduled domain materials are complete.' : `Nothing needed is open today. Next tracked material day: ${dayNames[n]}.`];
  }

  function renderPlanner() {
    const page = document.getElementById('planner');
    const resin = clamp(Math.floor(+s.resinPlan.current||0),0,200), day = new Date().getDay(), tasks = domainTasks(day), advice = whatNow();
    const resinText = tasks.length ? `${Math.floor(resin/20)} domain run${Math.floor(resin/20)===1?'':'s'} available • prioritize ${tasks[0].domain}` : (resin>=180 ? 'No tracked material domain today. SAVE RESIN, but spend overflow before you cap.' : 'No tracked material domain today. SAVE RESIN.');
    const weekly = weeklyBossIds.filter(id=>remain(id)>0).map(id=>`<div class="row"><div class="left"><b>${mats[id].source}</b><small>${chars[mats[id].owner].name} • ${mats[id].name}</small></div><span class="pill">${remain(id)} left</span></div>`).join('') || '<div class="complete-note">✓ All tracked weekly boss materials finished</div>';
    const bosses = worldBossIds.filter(id=>remain(id)>0).map(id=>`<div class="row"><div class="left"><b>${mats[id].source}</b><small>${chars[mats[id].owner].name} • ${remain(id)} materials left</small></div><span class="pill">${bossRange(id)}</span></div>`).join('') || '<div class="complete-note">✓ All tracked world-boss materials finished</div>';
    const specs = specialtyIds.filter(id=>remain(id)>0).map(id=>`<div class="task"><div class="taskhead"><div><b>${mats[id].name}</b><div class="muted" style="font-size:10px">${chars[mats[id].owner].name} • ${remain(id)} remaining</div></div><span class="pill">48H</span></div>${baseMaterialRow(id)}<div class="row"><div class="left"><b>Respawn timer</b><small data-respawn="${id}">${respawnText(id)}</small></div><button data-specialty-now="${id}">FARMED NOW</button></div></div>`).join('') || '<div class="complete-note">✓ No local specialties remain in the current plans</div>';
    const priority = s.priority.map((id,i)=>`<div class="priorityrow"><div><b>${i+1}. ${chars[id].name}</b><div class="matsource">Controls domain order + shared Mora/Wit allocation</div></div><button data-priority="${i}" data-dir="-1" ${i===0?'disabled':''}>↑</button><button data-priority="${i}" data-dir="1" ${i===s.priority.length-1?'disabled':''}>↓</button></div>`).join('');
    const sunday = day===0 ? `<div class="card"><div class="eyebrow">SUNDAY MODE</div><div class="title">Power-farm day</div><div class="muted">All rotating weapon/talent materials are available. L.U.N.A.R. puts the highest-priority unfinished target first instead of spreading Resin randomly.</div>${tasks.length?`<div class="advice"><b>${tasks[0].domain}</b><span>${chars[tasks[0].owner].name} first.</span></div>`:'<div class="complete-note">✓ No rotating material grind remains</div>'}</div>` : '';
    page.innerHTML = `<div class="card hero"><div class="eyebrow">SMART PLANNER</div><div class="title">What should I do?</div><div class="advice"><b id="adviceTitle">${advice[0]}</b><span id="adviceText">${advice[1]}</span></div><button class="actionbtn" id="decideBtn">DECIDE FOR ME</button></div>${sunday}<div class="card"><div class="eyebrow">RESIN BUDGET</div><div class="wishinput"><span>Current Original Resin</span><input id="resinCurrent" type="number" min="0" max="200" value="${resin}"></div><div class="muted">${resinText}</div>${resin>=20?'<button id="spend20" class="actionbtn">SPENT 20 RESIN</button>':''}</div><div class="card"><div class="eyebrow">SHARED INVENTORY</div><div class="row"><div class="left"><b>Hero’s Wit</b><small>Total remaining across tracked characters: ${totalSharedNeed('wit').toLocaleString()}</small></div><div class="stepper"><button data-shared="wit" data-d="-1">−</button><b>${(+s.inventory.wit||0).toLocaleString()}</b><button data-shared="wit" data-d="1">+</button></div></div><div class="row"><div class="left"><b>Mora</b><small>Total remaining across tracked characters: ${totalSharedNeed('mora').toLocaleString()}</small></div><div class="stepper"><button data-shared="mora" data-d="-100000">−</button><b>${(+s.inventory.mora||0).toLocaleString()}</b><button data-shared="mora" data-d="100000">+</button></div></div></div><div class="card"><div class="eyebrow">GOAL PRIORITY</div>${priority}</div><div class="card"><div class="eyebrow">WEEKLY BOSS MATERIALS</div>${weekly}</div><div class="card"><div class="eyebrow">WORLD BOSS PLANNER</div><div class="muted" style="font-size:10px">Claim range assumes roughly 2–3 boss materials per claim.</div>${bosses}</div><div class="card"><div class="eyebrow">LOCAL SPECIALTIES</div>${specs}</div>`;

    const resinInput = document.getElementById('resinCurrent');
    resinInput.onchange = () => { s.resinPlan.current = clamp(Math.floor(+resinInput.value||0),0,200); save(); renderPlanner(); };
    const spend = document.getElementById('spend20'); if (spend) spend.onclick = () => { s.resinPlan.current = Math.max(0,(+s.resinPlan.current||0)-20); save(); renderPlanner(); };
    document.getElementById('decideBtn').onclick = () => { const a=whatNow(); document.getElementById('adviceTitle').textContent=a[0]; document.getElementById('adviceText').textContent=a[1]; };
    page.querySelectorAll('[data-priority]').forEach(b=>b.onclick=()=>{const i=+b.dataset.priority,j=i+(+b.dataset.dir);if(j<0||j>=s.priority.length)return;[s.priority[i],s.priority[j]]=[s.priority[j],s.priority[i]];save();renderAll();});
    page.querySelectorAll('[data-specialty-now]').forEach(b=>b.onclick=()=>{s.specialtyTimers[b.dataset.specialtyNow]=Date.now();save();renderPlanner();});
    bindShared(page); bindMatButtons(page);
  }

  function dateProjection(id) {
    const val = s.bannerDates[id];
    if (!val) return {days:null,pulls:null,primos:null};
    const parts=val.split('-').map(Number); if(parts.length!==3)return {days:null,pulls:null,primos:null};
    const target=new Date(parts[0],parts[1]-1,parts[2],0,0,0,0);
    const days=Math.max(0,Math.ceil((target-Date.now())/86400000));
    const daily=150+Math.max(0,+s.bannerDates.extraDaily||0);
    const primos=Math.max(0,+s.wish.primos||0)+days*daily;
    const pulls=Math.floor(primos/160)+Math.max(0,+s.wish.fates||0);
    return {days,pulls,primos};
  }
  function renderBanners() {
    const page=document.getElementById('banners');
    const cards=['yelan','nicole','citlali','hutao'].map(id=>{const p=dateProjection(id);return `<div class="task"><div class="taskhead"><b>${chars[id].name}</b><span class="pill">${p.days==null?'DATE ?':p.days+' DAYS'}</span></div><div class="wishinput"><span>Banner start</span><input type="date" data-banner-date="${id}" value="${s.bannerDates[id]||''}"></div>${p.days==null?'<div class="muted">Enter the announced date when you get it.</div>':`<div class="grid2"><div class="metric">PROJECTED PULLS<b>${p.pulls}</b></div><div class="metric">PROJECTED PRIMOS<b>${p.primos.toLocaleString()}</b></div></div>`}</div>`}).join('');
    page.innerHTML=`<div class="card hero"><div class="eyebrow">BANNER COUNTDOWN</div><div class="title">How cooked is the wallet?</div><div class="muted">Projection uses your current bank + Welkin 90/day + Commissions 60/day. Event primos are excluded unless you add an estimate below.</div></div><div class="card"><div class="wishinput"><span>Extra expected primos / day</span><input id="extraDaily" type="number" min="0" value="${+s.bannerDates.extraDaily||0}"></div></div><div class="card">${cards}</div>`;
    page.querySelectorAll('[data-banner-date]').forEach(e=>e.onchange=()=>{s.bannerDates[e.dataset.bannerDate]=e.value;save();renderBanners();});
    document.getElementById('extraDaily').onchange=e=>{s.bannerDates.extraDaily=Math.max(0,Math.floor(+e.target.value||0));save();renderBanners();};
  }

  function logPull(text) {
    s.pullLog.unshift({t:Date.now(),text});
    s.pullLog=s.pullLog.slice(0,30);
  }
  function decorateWishes() {
    const page=document.getElementById('wishes'); if(!page||document.getElementById('pullLogger'))return;
    const hist=s.pullLog.slice(0,8).map(x=>`<div class="logrow"><b>${x.text}</b><div class="matsource">${new Date(x.t).toLocaleString()}</div></div>`).join('')||'<div class="muted" style="padding:10px 0">No pulls logged yet.</div>';
    page.insertAdjacentHTML('beforeend',`<div class="card" id="pullLogger"><div class="eyebrow">PULL LOG</div><div class="muted">Updates pity/guarantee. It does not subtract currency from the bank.</div><div class="buttonGrid"><button data-pull="c1">CHAR +1</button><button data-pull="c10">CHAR +10</button><button data-pull="cw">CHAR 5★ WIN</button><button data-pull="cl">CHAR 5★ LOST</button><button data-pull="w1">WEAPON +1</button><button data-pull="w10">WEAPON +10</button><button data-pull="wh">WEAPON TARGET</button><button data-pull="wm">WEAPON MISS</button></div><div class="row"><div class="left"><b>Weapon Fate Point</b><small>Resets when the weapon banner changes.</small></div><span class="pill">${s.wish.weaponFate} / 1</span></div><button id="resetFate" style="width:100%">NEW WEAPON BANNER • RESET FATE POINT</button><div class="section-title">RECENT</div>${hist}</div>`);
    page.querySelectorAll('[data-pull]').forEach(b=>b.onclick=()=>{const a=b.dataset.pull,w=s.wish;if(a==='c1'){w.charPity=clamp(w.charPity+1,0,89);logPull('Character pull +1');}if(a==='c10'){w.charPity=clamp(w.charPity+10,0,89);logPull('Character pulls +10');}if(a==='cw'){w.charPity=0;w.charGuaranteed=false;w.charsNeeded=Math.max(0,w.charsNeeded-1);logPull('Character 5★ WON');}if(a==='cl'){w.charPity=0;w.charGuaranteed=true;logPull('Character 5★ LOST • next guaranteed');}if(a==='w1'){w.weaponPity=clamp(w.weaponPity+1,0,79);logPull('Weapon pull +1');}if(a==='w10'){w.weaponPity=clamp(w.weaponPity+10,0,79);logPull('Weapon pulls +10');}if(a==='wh'){w.weaponPity=0;w.weaponFate=0;w.weaponsNeeded=Math.max(0,w.weaponsNeeded-1);logPull('Weapon 5★ TARGET HIT');}if(a==='wm'){w.weaponPity=0;w.weaponFate=1;logPull('Weapon 5★ MISS • Fate Point 1/1');}save();renderAll();});
    document.getElementById('resetFate').onclick=()=>{s.wish.weaponFate=0;logPull('Weapon banner changed • Fate Point reset');save();renderAll();};
  }

  function resetTargetUTC() {
    const now=new Date(), today=Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate(),3,0,0);
    return now.getTime()<today?today:today+86400000;
  }
  function weeklyTargetUTC() {
    const now=new Date(), base=Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate(),3,0,0), day=new Date(base).getUTCDay();
    let add=(8-day)%7; if(add===0 && now.getTime()>=base)add=7;
    return base+add*86400000;
  }
  function fmtCountdown(ms){ms=Math.max(0,ms);const d=Math.floor(ms/86400000),h=Math.floor(ms%86400000/3600000),m=Math.floor(ms%3600000/60000),sec=Math.floor(ms%60000/1000);return `${d?d+'d ':''}${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;}
  function updateCountdowns(){const a=document.getElementById('dailyResetCountdown'),b=document.getElementById('weeklyResetCountdown');if(a)a.textContent=fmtCountdown(resetTargetUTC()-Date.now());if(b)b.textContent=fmtCountdown(weeklyTargetUTC()-Date.now());document.querySelectorAll('[data-respawn]').forEach(e=>e.textContent=respawnText(e.dataset.respawn));}

  function decorateToday() {
    const page=document.getElementById('today'); if(!page)return;
    const hero=page.firstElementChild;
    if(hero&&!document.getElementById('resetCountdownCard'))hero.insertAdjacentHTML('afterend',`<div class="card" id="resetCountdownCard"><div class="grid2"><div class="metric">DAILY RESET<b class="countdown" id="dailyResetCountdown">--:--:--</b></div><div class="metric">WEEKLY RESET<b class="countdown" id="weeklyResetCountdown">--:--:--</b></div></div><div class="matsource">EU server • 04:00 server time</div></div>`);
    if(!document.getElementById('dontForgetCard'))page.insertAdjacentHTML('beforeend',`<div class="card" id="dontForgetCard"><div class="eyebrow">DON’T FORGET THIS SHIT</div>${forgetItems.map(x=>`<div class="checkrow"><input type="checkbox" id="df_${x[0]}" data-forget="${x[0]}" ${s.dontForget[x[0]]?'checked':''}><label for="df_${x[0]}"><b>${x[1]}</b><small>${x[2]}</small></label></div>`).join('')}<button id="clearForget" style="width:100%;margin-top:8px">CLEAR CHECKS</button></div>`);
    page.querySelectorAll('[data-forget]').forEach(e=>e.onchange=()=>{s.dontForget[e.dataset.forget]=e.checked;save();});
    const clear=document.getElementById('clearForget');if(clear)clear.onclick=()=>{s.dontForget={};save();renderAll();};
    updateCountdowns();
  }

  function decorateDomains() {
    const page=document.getElementById('domains'); if(!page||s.selectedDay!==0||document.getElementById('sundayPower'))return;
    const tasks=domainTasks(0), hero=page.firstElementChild;
    if(hero)hero.insertAdjacentHTML('afterend',`<div class="card" id="sundayPower"><div class="eyebrow">SUNDAY MODE</div><div class="title">Everything is open</div><div class="muted">Use goal priority to avoid over-farming. ${tasks.length?`Best first target: ${tasks[0].domain} for ${chars[tasks[0].owner].name}.`:'All tracked rotating materials are complete.'}</div></div>`);
  }

  const priorRenderAll=renderAll;
  renderAll=function(){ensure();priorRenderAll();renderPlanner();renderBanners();decorateWishes();decorateToday();decorateDomains();bindShared(document);renderNav();save();updateCountdowns();};

  renderAll();
  setInterval(updateCountdowns,1000);
})();

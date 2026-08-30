(() => {
  if (window.__lunarSmartLastLoaded) return;
  window.__lunarSmartLastLoaded = true;
  if (typeof s === 'undefined' || typeof mats === 'undefined' || typeof chars === 'undefined' || typeof renderAll !== 'function') return;

  const nav=document.getElementById('mainNav'), viewport=document.querySelector('.viewport');
  if(!nav||!viewport)return;
  const style=document.createElement('style');
  style.textContent=`
    .statusgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:9px}
    .statusbox{border:1px solid #2b3347;background:#0c1018;border-radius:12px;padding:9px;text-align:center;font-size:9px;color:#9ba4b8}.statusbox b{display:block;font-size:11px;color:#e9ecf8;margin-top:3px}.statusbox.ready{border-color:#32694b;background:#0d1a14}.statusbox.ready b{color:#76e6aa}
    .reserveLine{font-size:9px;color:#9ca4b8;margin-top:4px}.reserveLine .surplus{color:#76e6aa;font-weight:700}
    .family{background:#0d1119;border:1px solid #252d3d;border-radius:14px;padding:10px;margin:8px 0}.family b{font-size:12px}.family .craft{font-size:10px;color:#b7bfd4;margin-top:6px}
    .toolselect,textarea{width:100%;background:#0a0d14;color:#f4f6ff;border:1px solid #343c50;border-radius:10px;padding:9px;font:inherit}textarea{min-height:90px;resize:vertical}
    .scoregrade{font-size:25px;font-weight:900;margin-top:7px}.tiny{font-size:9px;color:#9299ad}
  `;
  document.head.appendChild(style);

  if(!document.querySelector('#mainNav [data-page="tools"]')){
    const b=document.createElement('button');b.dataset.page='tools';b.textContent='TOOLS';nav.appendChild(b);
    b.onclick=()=>{s.page='tools';renderNav();save();document.getElementById('tools').scrollTop=0;};
  }
  if(!document.getElementById('tools')){const p=document.createElement('section');p.id='tools';p.className='page';viewport.appendChild(p);}

  const families=[
    ['Hu Tao • Agnidus Agate',['hutao_agate1','hutao_agate2','hutao_agate3','hutao_agate4']],
    ['Hu Tao • Whopperflower Nectar',['hutao_nectar1','hutao_nectar2','hutao_nectar3']],
    ['Hu Tao • Diligence',['hutao_diligence1','hutao_diligence2','hutao_diligence3']],
    ['Staff of Homa • Aerosiderite',['homa_grain','homa_piece','homa_bit','homa_chunk']],
    ['Staff of Homa • Ley Line',['homa_ley1','homa_ley2','homa_ley3']],
    ['Staff of Homa • Slime',['homa_slime1','homa_slime2','homa_slime3']],
    ['Yelan • Varunada Lazurite',['yelan_gem1','yelan_gem2','yelan_gem3','yelan_gem']],
    ['Yelan • Fatui Insignia',['yelan_insig1','yelan_insig2','yelan_insig3']],
    ['Yelan • Prosperity',['yelan_prosperity1','yelan_prosperity2','yelan_prosperity']],
    ['Aqua Simulacra • Guyun',['aqua_sands','aqua_stone','aqua_relic','aqua_body']],
    ['Aqua Simulacra • Statuette',['aqua_stat1','aqua_stat2','yelan_statuette']],
    ['Aqua Simulacra • Specter',['aqua_spec1','aqua_spec2','aqua_spec3']],
    ['Nicole • Agnidus Agate',['nicole_agate1','nicole_agate2','nicole_agate3','nicole_gem']],
    ['Nicole • Warrant',['nicole_warrant1','nicole_warrant2','nicole_warrant3']],
    ['Nicole • Elysium',['nicole_elysium1','nicole_elysium2','nicole_elysium']],
    ["Angelos' Heptades • Artful Device",['angel_art1','angel_art2','angel_art3','angel_art4']],
    ["Angelos' Heptades • Hilt",['angel_hilt1','angel_hilt2','angel_hilt3']],
    ["Angelos' Heptades • Drive Shaft",['angel_drive1','angel_drive2','angel_drive3']],
    ['Citlali • Shivada Jade',['citlali_jade1','citlali_jade2','citlali_jade3','citlali_gem']],
    ['Citlali • Fang',['citlali_fang1','citlali_fang2','citlali_fang3']],
    ['Citlali • Kindling',['citlali_kindling1','citlali_kindling2','citlali_kindling']],
    ["Starcaller's Watch • Sacred Lord",['star_decadence','star_desolation','star_demeanor','star_divinity']],
    ["Starcaller's Watch • Will",['star_will1','star_will2','star_will3']],
    ["Starcaller's Watch • Whistle",['star_whistle1','star_whistle2','star_whistle3']]
  ].filter(x=>x[1].every(id=>mats[id]));

  s.smartTools=Object.assign({family:0},s.smartTools||{});
  s.artifactScore=Object.assign({char:'hutao',cr:0,cd:0,er:0,em:0,hp:0,atk:0,flat:0},s.artifactScore||{});
  s.farmNotice=Object.assign({enabled:false,hour:18,minute:0,initialized:false},s.farmNotice||{});

  try{
    if(!s.farmNotice.initialized&&window.LunarAndroid&&LunarAndroid.getFarmReminder){
      const n=JSON.parse(LunarAndroid.getFarmReminder());
      s.farmNotice.enabled=!!n.enabled;s.farmNotice.hour=+n.hour||18;s.farmNotice.minute=+n.minute||0;s.farmNotice.initialized=true;
    }
  }catch(_){s.farmNotice.initialized=true;}

  function owned(id){return Math.max(0,Number(s.materials?.[id]||0));}
  function target(id){return Math.max(0,Number(mats[id]?.need||0));}
  function remaining(id){return Math.max(0,target(id)-owned(id));}
  function groupReady(ids){return ids.length===0||ids.every(id=>owned(id)>=target(id));}
  function serverDay(){const d=new Date(Date.now()-9*3600000);return d.getUTCDay();}

  function planFamily(ids){
    let carry=0, missing=0, crafts=[];
    const rows=[];
    ids.forEach((id,i)=>{
      const have=owned(id)+(i?carry:0), need=target(id), reserve=Math.min(have,need), extra=Math.max(0,have-need);
      missing+=Math.max(0,need-have);
      carry=i<ids.length-1?Math.floor(extra/3):0;
      if(carry>0&&i<ids.length-1)crafts.push(`${carry} ${mats[ids[i+1]].name}`);
      rows.push({id,have:owned(id),need,reserve,surplus:Math.max(0,owned(id)-need)});
    });
    return {rows,missing,crafts,ready:missing===0};
  }

  function familyCard(index){
    const [name,ids]=families[index],p=planFamily(ids);
    return `<div class="family"><div class="taskhead"><b>${name}</b><span class="pill ${p.ready?'good':''}">${p.ready?'READY':'CHECK'}</span></div>${p.rows.map(r=>`<div class="row"><div class="left"><b>${mats[r.id].name}</b><small>owned ${r.have.toLocaleString()} • fixed target ${r.need.toLocaleString()}</small></div><span class="pill">${r.surplus?`+${r.surplus} surplus`:'reserved'}</span></div>`).join('')}<div class="craft">${p.crafts.length?'Safe upward crafts after reserving targets: '+p.crafts.join(' • '):'No safe upward craft available from current surplus.'}</div></div>`;
  }

  function decorateReserves(){
    document.querySelectorAll('.matrow').forEach(row=>{
      if(row.querySelector('.reserveLine'))return;
      const b=row.querySelector('[data-mat]');if(!b)return;const id=b.dataset.mat;if(!mats[id])return;
      const o=owned(id),t=target(id),r=Math.min(o,t),sur=Math.max(0,o-t);
      const src=row.querySelector('.matsource');
      const line=document.createElement('div');line.className='reserveLine';line.innerHTML=`RESERVED ${r.toLocaleString()} / ${t.toLocaleString()}${sur?` • <span class="surplus">SAFE SURPLUS +${sur.toLocaleString()}</span>`:''}`;
      (src||row.firstElementChild)?.appendChild(line);
    });
  }

  function decorateReady(){
    Object.entries(chars).forEach(([id,c])=>{
      const page=document.getElementById(id);if(!page||document.getElementById(`${id}ReadyCard`))return;
      const a=groupReady(c.groups.character),t=groupReady(c.groups.talents),w=groupReady(c.groups.weapon),all=a&&t&&w;
      const hero=page.firstElementChild;if(!hero)return;
      hero.insertAdjacentHTML('afterend',`<div class="card" id="${id}ReadyCard"><div class="eyebrow">MATERIAL READINESS</div>${all?'<div class="title good">FULLY PRE-FARMED ✓</div>':''}<div class="statusgrid"><div class="statusbox ${a?'ready':''}">CHARACTER<b>${a?'READY':'FARMING'}</b></div><div class="statusbox ${t?'ready':''}">TALENTS<b>${t?'READY':'FARMING'}</b></div><div class="statusbox ${w?'ready':''}">WEAPON<b>${w?'READY':'FARMING'}</b></div></div></div>`);
    });
  }

  function familyTierMap(){const map={};families.forEach(([,ids])=>ids.forEach((id,i)=>map[id]=i));return map;}
  const tierMap=familyTierMap();
  function estimateCharacter(id){
    const c=chars[id];let resin=0,weeklyWeeks=0;
    [...c.groups.character,...c.groups.talents,...c.groups.weapon].forEach(mid=>{
      const m=mats[mid],r=remaining(mid);if(!m||!r)return;
      if(String(m.source).includes('weekly boss')){weeklyWeeks=Math.max(weeklyWeeks,Math.ceil(r/2.5));return;}
      if(m.domain){const tier=tierMap[mid]??0;const lowEq=r*Math.pow(3,tier);resin+=Math.ceil(lowEq/8)*20;return;}
      if(/boss/i.test(String(m.source))&&!/weekly/i.test(String(m.source))){resin+=Math.ceil(r/2.5)*40;return;}
      if(/Mora/.test(m.name)){resin+=Math.ceil(r/60000)*20;return;}
      if(/Wit/.test(m.name)){resin+=Math.ceil(r/5)*20;return;}
    });
    return {resin,days:Math.ceil(resin/200),weeks:weeklyWeeks};
  }

  function decorateEstimates(){
    const page=document.getElementById('planner');if(!page||document.getElementById('finishEstimateCard'))return;
    page.insertAdjacentHTML('beforeend',`<div class="card" id="finishEstimateCard"><div class="eyebrow">ROUGH DAYS TO FINISH</div><div class="muted" style="font-size:10px">Uses 200 Resin/day, rough AR58 domain/boss yields, and your current owned counts. Mob drops and local-specialty travel time are excluded.</div>${Object.keys(chars).map(id=>{const e=estimateCharacter(id);return `<div class="row"><div class="left"><b>${chars[id].name}</b><small>~${e.resin.toLocaleString()} Resin of tracked farming${e.weeks?` • weekly boss floor ~${e.weeks} weeks`:''}</small></div><span class="pill">~${e.days} resin day${e.days===1?'':'s'}</span></div>`}).join('')}</div>`);
  }

  function farmPlan(day){
    const tasks=typeof domainTasks==='function'?domainTasks(day):[];
    if(!tasks.length)return 'No unfinished material domain today. Save Resin or farm artifacts/Ley Lines.';
    return tasks.map(t=>`${t.domain} • ${chars[t.owner]?.name||t.owner}`).join(' | ');
  }
  function allFarmPlans(){return [0,1,2,3,4,5,6].map(farmPlan).join('\u001F');}
  function syncFarmNotice(){
    try{if(window.LunarAndroid&&LunarAndroid.setFarmReminder)LunarAndroid.setFarmReminder(!!s.farmNotice.enabled,+s.farmNotice.hour,+s.farmNotice.minute,allFarmPlans());}catch(_){}
  }

  function scoreArtifact(){
    const a=s.artifactScore,n=k=>Math.max(0,+a[k]||0);let score=0,why='';
    if(a.char==='hutao'){score=n('cr')*2+n('cd')+n('em')*.12+n('hp')*.7+n('atk')*.25+n('er')*.2;why='CRIT > EM/HP% > ATK%; ER gets a small bonus.';}
    if(a.char==='yelan'){score=n('cr')*2+n('cd')+n('hp')*.8+n('er')*.65+n('em')*.05;why='CRIT + HP% + enough ER. ATK is intentionally worth basically nothing.';}
    if(a.char==='nicole'){score=n('er')*.8+n('atk')*.95+n('flat')*.055+n('cr')*.15+n('cd')*.075;why='ATK%/Flat ATK + enough ER are weighted heavily.';}
    if(a.char==='citlali'){score=n('em')*.11+n('er')*.75+n('cr')*.5+n('cd')*.25+n('atk')*.15;why='EM + enough ER first, then useful CRIT/ATK.';}
    const grade=score>=48?'LOCK IT':score>=34?'KEEP':score>=22?'MID':'FEED';return {score:Math.round(score*10)/10,grade,why};
  }

  function encodeBackup(){try{return 'LUNAR2:'+btoa(unescape(encodeURIComponent(JSON.stringify(s))));}catch(_){return '';}}
  function importBackup(code){
    try{if(!String(code).startsWith('LUNAR2:'))throw new Error('bad');const obj=JSON.parse(decodeURIComponent(escape(atob(String(code).slice(7)))));Object.keys(s).forEach(k=>delete s[k]);Object.assign(s,obj);save();renderAll();return true;}catch(_){return false;}
  }

  function renderTools(){
    const page=document.getElementById('tools'),fam=Math.max(0,Math.min(families.length-1,+s.smartTools.family||0)),a=s.artifactScore,sc=scoreArtifact();
    const time=`${String(s.farmNotice.hour).padStart(2,'0')}:${String(s.farmNotice.minute).padStart(2,'0')}`;
    page.innerHTML=`<div class="card hero"><div class="eyebrow">TOOLS</div><div class="title">Logistics brain</div><div class="muted">Conversion, artifact scoring, farm alerts and backups.</div></div>
      <div class="card"><div class="eyebrow">MATERIAL CONVERSION</div><div class="muted" style="font-size:10px">Uses the normal 3 lower-tier → 1 next-tier crafting rule and only recommends crafts from material above your fixed reserve target.</div><select id="familySelect" class="toolselect">${families.map((x,i)=>`<option value="${i}" ${i===fam?'selected':''}>${x[0]}</option>`).join('')}</select>${familyCard(fam)}</div>
      <div class="card"><div class="eyebrow">DAILY FARM NOTIFICATION</div><div class="row"><div class="left"><b>America-server farming alert</b><small>${farmPlan(serverDay())}</small></div><button id="farmNoticeToggle" class="${s.farmNotice.enabled?'good':''}">${s.farmNotice.enabled?'ON':'OFF'}</button></div><div class="wishinput"><span>Phone time</span><input id="farmNoticeTime" type="time" value="${time}"></div></div>
      <div class="card"><div class="eyebrow">ARTIFACT SCORE</div><div class="muted" style="font-size:10px">Enter the substats on ONE artifact. This is a L.U.N.A.R. heuristic for your target build, not an official Genshin score.</div><select id="artifactChar" class="toolselect">${Object.keys(chars).map(id=>`<option value="${id}" ${a.char===id?'selected':''}>${chars[id].name}</option>`).join('')}</select>${[['cr','CRIT Rate %'],['cd','CRIT DMG %'],['er','Energy Recharge %'],['em','Elemental Mastery'],['hp','HP %'],['atk','ATK %'],['flat','Flat ATK']].map(([k,n])=>`<div class="wishinput"><span>${n}</span><input data-art="${k}" type="number" min="0" step="0.1" value="${+a[k]||0}"></div>`).join('')}<div class="scoregrade">${sc.grade} • ${sc.score}</div><div class="muted">${sc.why}</div></div>
      <div class="card"><div class="eyebrow">BACKUP / RESTORE</div><div class="muted">Copies your entire L.U.N.A.R. state so an APK reinstall or phone swap does not vaporize your counters.</div><div class="buttonGrid"><button id="copyBackup">COPY BACKUP</button><button id="importBackup">IMPORT CLIPBOARD</button></div><textarea id="backupBox" placeholder="Backup code can also be pasted here manually."></textarea><button id="importBox" style="width:100%;margin-top:7px">IMPORT TEXT BOX</button></div>`;

    document.getElementById('familySelect').onchange=e=>{s.smartTools.family=+e.target.value;save();renderTools();};
    document.getElementById('farmNoticeToggle').onclick=()=>{s.farmNotice.enabled=!s.farmNotice.enabled;s.farmNotice.initialized=true;save();syncFarmNotice();renderTools();};
    document.getElementById('farmNoticeTime').onchange=e=>{const p=String(e.target.value||'18:00').split(':');s.farmNotice.hour=Math.max(0,Math.min(23,+p[0]||0));s.farmNotice.minute=Math.max(0,Math.min(59,+p[1]||0));s.farmNotice.initialized=true;save();if(s.farmNotice.enabled)syncFarmNotice();renderTools();};
    document.getElementById('artifactChar').onchange=e=>{s.artifactScore.char=e.target.value;save();renderTools();};
    page.querySelectorAll('[data-art]').forEach(e=>e.onchange=()=>{s.artifactScore[e.dataset.art]=Math.max(0,+e.value||0);save();renderTools();});
    document.getElementById('copyBackup').onclick=()=>{const code=encodeBackup();document.getElementById('backupBox').value=code;try{if(window.LunarAndroid&&LunarAndroid.copyText)LunarAndroid.copyText(code);else navigator.clipboard?.writeText(code);}catch(_){};};
    document.getElementById('importBackup').onclick=()=>{let code='';try{if(window.LunarAndroid&&LunarAndroid.getClipboard)code=LunarAndroid.getClipboard();}catch(_){}if(!code)code=document.getElementById('backupBox').value;if(!importBackup(code))alert('That is not a valid L.U.N.A.R. backup.');};
    document.getElementById('importBox').onclick=()=>{if(!importBackup(document.getElementById('backupBox').value))alert('That is not a valid L.U.N.A.R. backup.');};
  }

  // Normal taps on material buttons now allow OWNED to exceed TARGET, which is required for surplus tracking.
  document.addEventListener('click',e=>{
    const b=e.target.closest?.('[data-mat]');if(!b||b.disabled)return;
    const id=b.dataset.mat,d=+b.dataset.d||0;if(!id||!d||!mats[id])return;
    e.preventDefault();e.stopImmediatePropagation();
    s.materials[id]=Math.max(0,Math.min(999999999,owned(id)+d));save();
    const page=document.querySelector('.page.on'),pid=page?.id||s.page,scroll=page?.scrollTop||0;renderAll();requestAnimationFrame(()=>{s.page=pid;renderNav();const p=document.getElementById(pid);if(p)p.scrollTop=scroll;});
  },true);

  const priorRenderAll=renderAll;
  renderAll=function(){priorRenderAll();decorateReady();decorateReserves();decorateEstimates();renderTools();if(s.farmNotice.enabled)syncFarmNotice();renderNav();save();};
  renderAll();
})();

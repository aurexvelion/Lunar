(() => {
  if (window.__lunarSmartMoreLoaded) return;
  window.__lunarSmartMoreLoaded = true;
  if (typeof s === 'undefined' || typeof chars === 'undefined' || typeof mats === 'undefined' || typeof renderAll !== 'function') return;

  const RESIN_CAP = 200;
  const RESIN_MS = 8 * 60 * 1000;
  const WEEKLY_REGEN = 1260;
  const categories = [
    ['talents','Talents'],['weapons','Weapons'],['artifacts','Artifacts'],['bosses','Bosses'],['leylines','Ley Lines']
  ];

  const style = document.createElement('style');
  style.textContent = `
    .urgentStack{display:flex;flex-direction:column;gap:7px;margin-top:9px}.urgentItem{background:#0d1119;border:1px solid #293145;border-radius:13px;padding:11px;display:flex;align-items:center;justify-content:space-between;gap:8px}.urgentItem b{display:block;font-size:12px}.urgentItem small{display:block;color:#9299ad;font-size:9px;margin-top:2px}.urgentItem.warn{border-color:#665027;background:#18140b}.urgentItem.good{border-color:#32694b;background:#0d1a14}.urgentItem button{min-height:34px;font-size:9px;padding:5px 8px}
    .budgetrow{display:grid;grid-template-columns:minmax(0,1fr) 78px 68px;gap:7px;align-items:center;padding:9px 0;border-top:1px solid #222938}.budgetrow:first-child{border-top:0}.budgetrow input{text-align:right;padding:7px;min-height:36px}.budgetrow button{min-height:36px;padding:5px;font-size:9px}.budgetbar{height:6px;background:#080a10;border-radius:99px;overflow:hidden;margin-top:5px}.budgetbar i{display:block;height:100%;background:#9ca7ff}.budgetbar i.over{background:#ffd27c}
    .celebrate{position:fixed;inset:0;z-index:9999;background:rgba(5,7,12,.88);display:flex;align-items:center;justify-content:center;padding:22px}.celebrateBox{width:min(430px,100%);background:linear-gradient(145deg,#1b2441,#10141f);border:1px solid #6d79bd;border-radius:24px;padding:26px;text-align:center;box-shadow:0 24px 80px rgba(0,0,0,.55)}.celebrateGlyph{font-size:48px}.celebrateTitle{font-size:27px;font-weight:950;margin:8px 0}.celebrateName{font-size:18px;color:#9ca7ff;font-weight:800}.celebrate button{width:100%;margin-top:18px}
    .timergrid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:9px}.timerbox{background:#0d1119;border:1px solid #293145;border-radius:12px;padding:9px;text-align:center;font-size:9px;color:#9299ad}.timerbox b{display:block;color:#f4f6ff;font-size:11px;margin-top:3px;font-variant-numeric:tabular-nums}
  `;
  document.head.appendChild(style);

  function now(){ return Date.now(); }
  function clampInt(v,a,b){ return Math.max(a,Math.min(b,Math.floor(Number(v)||0))); }
  function fmtDuration(ms){
    ms=Math.max(0,ms); const h=Math.floor(ms/3600000),m=Math.floor(ms%3600000/60000),sec=Math.floor(ms%60000/1000);
    return `${h}h ${String(m).padStart(2,'0')}m ${String(sec).padStart(2,'0')}s`;
  }
  function mondayKeyAmerica(){
    const d=new Date(now()-9*3600000); const copy=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()));
    const delta=(copy.getUTCDay()+6)%7; copy.setUTCDate(copy.getUTCDate()-delta); return copy.toISOString().slice(0,10);
  }
  function americaDay(){ return new Date(now()-9*3600000).getUTCDay(); }

  function ensureState(){
    s.resinPlan = Object.assign({current:200,condensed:0},s.resinPlan||{});
    s.resinPlan.current = clampInt(s.resinPlan.current,0,RESIN_CAP);
    s.resinClock = Object.assign({value:s.resinPlan.current,at:now()},s.resinClock||{});
    s.resinAlarm = Object.assign({enabled:false,lead:60},s.resinAlarm||{});
    s.resinBudget = Object.assign({week:mondayKeyAmerica(),target:{talents:300,weapons:240,artifacts:360,bosses:240,leylines:120},spent:{talents:0,weapons:0,artifacts:0,bosses:0,leylines:0}},s.resinBudget||{});
    s.resinBudget.target=Object.assign({talents:300,weapons:240,artifacts:360,bosses:240,leylines:120},s.resinBudget.target||{});
    s.resinBudget.spent=Object.assign({talents:0,weapons:0,artifacts:0,bosses:0,leylines:0},s.resinBudget.spent||{});
    if(s.resinBudget.week!==mondayKeyAmerica()){s.resinBudget.week=mondayKeyAmerica();categories.forEach(([k])=>s.resinBudget.spent[k]=0);}
    s.celebrated=s.celebrated||{};
  }

  function accrueOnLoad(){
    ensureState();
    const c=s.resinClock;
    const base=clampInt(c.value,0,RESIN_CAP), elapsed=Math.max(0,now()-(+c.at||now()));
    if(base>=RESIN_CAP){s.resinPlan.current=RESIN_CAP;s.resinClock={value:RESIN_CAP,at:now()};return;}
    const gain=Math.floor(elapsed/RESIN_MS), current=Math.min(RESIN_CAP,base+gain);
    s.resinPlan.current=current;
    if(current>=RESIN_CAP)s.resinClock={value:RESIN_CAP,at:now()};
    else s.resinClock={value:current,at:(+c.at||now())+gain*RESIN_MS};
  }

  function syncClockToCurrent(){
    ensureState(); s.resinPlan.current=clampInt(s.resinPlan.current,0,RESIN_CAP); s.resinClock={value:s.resinPlan.current,at:now()}; save(); syncResinAlarm();
  }
  function currentResin(){return clampInt(s.resinPlan.current,0,RESIN_CAP);}
  function timeTo(target){const c=currentResin();return c>=target?0:(target-c)*RESIN_MS;}
  function capAt(){return now()+timeTo(RESIN_CAP);}
  function syncResinAlarm(){
    try{
      if(!window.LunarAndroid||!LunarAndroid.setResinAlarm)return;
      if(!s.resinAlarm.enabled||currentResin()>=RESIN_CAP){LunarAndroid.setResinAlarm(false,0,currentResin(),+s.resinAlarm.lead||60);return;}
      const delay=Math.max(1000,timeTo(RESIN_CAP)-clampInt(s.resinAlarm.lead,0,1440)*60000);
      LunarAndroid.setResinAlarm(true,delay,currentResin(),clampInt(s.resinAlarm.lead,0,1440));
    }catch(_){}
  }

  function allReady(id){const c=chars[id];if(!c)return false;return [...c.groups.character,...c.groups.talents,...c.groups.weapon].every(mid=>(+s.materials[mid]||0)>=(+mats[mid]?.need||0));}
  function checkCelebrations(){
    Object.keys(chars).forEach(id=>{
      const ready=allReady(id);
      if(!ready){s.celebrated[id]=false;return;}
      if(s.celebrated[id]||document.querySelector('.celebrate'))return;
      const el=document.createElement('div');el.className='celebrate';el.innerHTML=`<div class="celebrateBox"><div class="celebrateGlyph">✦</div><div class="eyebrow">MISSION COMPLETE</div><div class="celebrateTitle">FULLY PRE-FARMED</div><div class="celebrateName">${chars[id].name}</div><div class="muted" style="margin-top:9px">Character, talents and weapon targets are all covered.</div><button id="celebrateDone">HELL YEAH</button></div>`;
      document.body.appendChild(el);document.getElementById('celebrateDone').onclick=()=>{s.celebrated[id]=true;save();el.remove();};
    });
  }

  function incompleteWeekly(){
    if(!s.weekly)return null; const items=[['transformer','Parametric Transformer'],['crystalfly','Crystalfly Trap'],['transient','Transient Resin'],['trounce','Weekly bosses']];
    const x=items.find(([k])=>!s.weekly[k]);return x?x[1]:null;
  }
  function topDomain(){try{const t=domainTasks(americaDay());return t&&t.length?t[0]:null;}catch(_){return null;}}
  function dynamicItems(){
    const items=[];
    if(!s.daily?.welkin)items.push({kind:'normal',title:'Claim Welkin Moon',sub:'90 primogems waiting.',action:'welkin',label:'DONE'});
    if(!s.daily?.comm)items.push({kind:'normal',title:'Daily Commissions',sub:'60 primogems.',action:'comm',label:'DONE'});
    const resin=currentResin(), cap=timeTo(200);
    if(resin>=180)items.push({kind:'warn',title:`Resin ${resin} / 200`,sub:resin>=200?'CAPPED. Spend it.':`Caps in ${fmtDuration(cap)}.`,action:'planner',label:'PLAN'});
    const d=topDomain();
    if(d)items.push({kind:'normal',title:`Farm ${d.domain}`,sub:`Highest-priority open target: ${chars[d.owner]?.name||d.owner}.`,action:'domains',label:'OPEN'});
    else items.push({kind:'good',title:'No required material domain today',sub:'Save Resin, farm artifacts/Ley Lines, or clear another priority.',action:'planner',label:'PLAN'});
    const wk=incompleteWeekly();if(wk)items.push({kind:'normal',title:wk,sub:'Still unfinished this week.',action:'weekly',label:'OPEN'});
    const unfinishedForget=s.dontForget?Object.values(s.dontForget).filter(Boolean).length:0;
    if(unfinishedForget===0)items.push({kind:'normal',title:'Check limited-time stuff',sub:'Events, codes, mail, trials, BP and banner deadlines.',action:'primos',label:'CHECK'});
    return items.slice(0,5);
  }
  function goPage(id){s.page=id;if(typeof renderNav==='function')renderNav();save();const p=document.getElementById(id);if(p)p.scrollTop=0;}
  function decorateDynamicHome(){
    const page=document.getElementById('today');if(!page)return;
    [...page.querySelectorAll('.card')].forEach(card=>{const e=card.querySelector('.eyebrow')?.textContent.trim();if(['RESIN PLAN','DAILY PRIMOS','BUILD PROGRESS','DON’T FORGET THIS SHIT'].includes(e))card.style.display='none';});
    let card=document.getElementById('dynamicHomeCard');if(card)card.remove();
    const hero=page.firstElementChild;if(!hero)return;
    hero.insertAdjacentHTML('afterend',`<div class="card" id="dynamicHomeCard"><div class="eyebrow">RIGHT NOW</div><div class="title">Only what matters</div><div class="urgentStack">${dynamicItems().map((x,i)=>`<div class="urgentItem ${x.kind}"><div><b>${i+1}. ${x.title}</b><small>${x.sub}</small></div><button data-home-action="${x.action}">${x.label}</button></div>`).join('')}</div></div>`);
    card=document.getElementById('dynamicHomeCard');card.querySelectorAll('[data-home-action]').forEach(b=>b.onclick=()=>{
      const a=b.dataset.homeAction;if(a==='welkin'){s.daily.welkin=true;save();renderAll();return;}if(a==='comm'){s.daily.comm=true;save();renderAll();return;}goPage(a);
    });
  }

  function decorateResinTimers(){
    const page=document.getElementById('planner');if(!page)return;
    document.getElementById('resinClockCard')?.remove();
    const cards=[...page.querySelectorAll('.card')], resinCard=cards.find(c=>c.querySelector('.eyebrow')?.textContent.trim()==='RESIN BUDGET'); if(!resinCard)return;
    const c=currentResin(),cap=timeTo(200),lead=clampInt(s.resinAlarm.lead,0,1440);
    resinCard.insertAdjacentHTML('afterend',`<div class="card" id="resinClockCard"><div class="eyebrow">RESIN REGEN</div><div class="taskhead"><div><div class="title">${c} / 200</div><div class="muted">1 Resin every 8 minutes.</div></div><span class="pill ${c>=180?'warn':''}" id="capCountdown">${c>=200?'CAPPED':fmtDuration(cap)}</span></div><div class="timergrid">${[20,40,60,160,200].map(t=>`<div class="timerbox">${t} RESIN<b data-resin-target="${t}">${c>=t?'NOW':fmtDuration(timeTo(t))}</b></div>`).join('')}</div><div class="row"><div class="left"><b>Cap warning</b><small>Phone alert ${lead} minutes before reaching 200.</small></div><button id="resinAlarmToggle" class="${s.resinAlarm.enabled?'good':''}">${s.resinAlarm.enabled?'ON':'OFF'}</button></div><div class="wishinput"><span>Warn before cap (minutes)</span><input id="resinLead" type="number" min="0" max="1440" value="${lead}"></div></div>`);
    document.getElementById('resinAlarmToggle').onclick=()=>{s.resinAlarm.enabled=!s.resinAlarm.enabled;save();syncResinAlarm();renderAll();};
    document.getElementById('resinLead').onchange=e=>{s.resinAlarm.lead=clampInt(e.target.value,0,1440);save();syncResinAlarm();renderAll();};
  }

  function budgetTotals(){let target=0,spent=0;categories.forEach(([k])=>{target+=clampInt(s.resinBudget.target[k],0,9999);spent+=clampInt(s.resinBudget.spent[k],0,99999);});return {target,spent};}
  function decorateWeeklyBudget(){
    const page=document.getElementById('planner');if(!page)return;document.getElementById('weeklyResinBudgetCard')?.remove();
    ensureState();const tot=budgetTotals();
    page.insertAdjacentHTML('beforeend',`<div class="card" id="weeklyResinBudgetCard"><div class="eyebrow">WEEKLY RESIN BUDGET</div><div class="title">${tot.spent} / ${WEEKLY_REGEN} spent</div><div class="muted" style="font-size:10px">Natural regeneration is 1,260 Resin per 7 days. Set category targets and log spending in +20 chunks. Resets with the America-server Monday week.</div>${categories.map(([k,n])=>{const t=clampInt(s.resinBudget.target[k],0,9999),sp=clampInt(s.resinBudget.spent[k],0,99999),p=t?Math.min(150,Math.round(sp/t*100)):0;return `<div class="budgetrow"><div><b>${n}</b><div class="tiny">spent ${sp} / target ${t}${sp>t?' • OVER BUDGET':''}</div><div class="budgetbar"><i class="${sp>t?'over':''}" style="width:${Math.min(100,p)}%"></i></div></div><input type="number" min="0" step="20" data-budget-target="${k}" value="${t}"><button data-budget-spend="${k}">+20 USED</button></div>`;}).join('')}<div class="grid2" style="margin-top:9px"><div class="metric">ALLOCATED<b>${tot.target}</b></div><div class="metric">UNALLOCATED<b>${WEEKLY_REGEN-tot.target}</b></div></div><button id="resetWeekSpend" style="width:100%;margin-top:8px">RESET THIS WEEK'S SPENT</button></div>`);
    page.querySelectorAll('[data-budget-target]').forEach(e=>e.onchange=()=>{s.resinBudget.target[e.dataset.budgetTarget]=clampInt(e.value,0,9999);save();renderAll();});
    page.querySelectorAll('[data-budget-spend]').forEach(b=>b.onclick=()=>{const k=b.dataset.budgetSpend;s.resinBudget.spent[k]=clampInt(s.resinBudget.spent[k]+20,0,99999);save();renderAll();});
    document.getElementById('resetWeekSpend').onclick=()=>{categories.forEach(([k])=>s.resinBudget.spent[k]=0);save();renderAll();};
  }

  function updateLiveTimers(){
    const c=currentResin();document.querySelectorAll('[data-resin-target]').forEach(e=>{const t=+e.dataset.resinTarget;e.textContent=c>=t?'NOW':fmtDuration(timeTo(t));});
    const cap=document.getElementById('capCountdown');if(cap)cap.textContent=c>=200?'CAPPED':fmtDuration(timeTo(200));
  }

  accrueOnLoad();
  syncResinAlarm();

  // Any manual Resin change becomes the new regeneration baseline.
  document.addEventListener('change',e=>{if(e.target&&e.target.id==='resinCurrent')setTimeout(syncClockToCurrent,30);},true);
  document.addEventListener('click',e=>{const id=e.target?.id;if(id==='spend20'||id==='craftCondensed')setTimeout(syncClockToCurrent,60);},true);

  const priorRenderAll=renderAll;
  renderAll=function(){ensureState();priorRenderAll();decorateDynamicHome();decorateResinTimers();decorateWeeklyBudget();checkCelebrations();renderNav();save();updateLiveTimers();};
  renderAll();

  setInterval(updateLiveTimers,1000);
  setInterval(()=>{
    ensureState(); if(currentResin()>=RESIN_CAP)return;
    const elapsed=now()-(+s.resinClock.at||now());
    if(elapsed>=RESIN_MS){const gain=Math.floor(elapsed/RESIN_MS);s.resinPlan.current=Math.min(RESIN_CAP,currentResin()+gain);s.resinClock={value:s.resinPlan.current,at:(+s.resinClock.at||now())+gain*RESIN_MS};if(s.resinPlan.current>=RESIN_CAP)s.resinClock.at=now();save();syncResinAlarm();renderAll();}
  },30000);
})();
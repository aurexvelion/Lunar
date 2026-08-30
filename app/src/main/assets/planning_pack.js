(() => {
  if (window.__lunarPlanningPackLoaded) return;
  window.__lunarPlanningPackLoaded = true;
  if (typeof s === 'undefined' || typeof mats === 'undefined' || typeof chars === 'undefined' || typeof renderAll !== 'function') return;

  const style = document.createElement('style');
  style.textContent = `
    .weekplanDay{background:#0d1119;border:1px solid #252d3d;border-radius:14px;padding:11px;margin:8px 0}
    .weekplanHead{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px}.weekplanHead b{font-size:13px}.weekplanHead small{color:#9299ad;font-size:9px}
    .weekplanTask{padding:8px 0;border-top:1px solid #222938}.weekplanTask:first-of-type{border-top:0}.weekplanTask b{display:block;font-size:11px}.weekplanTask small{display:block;color:#9299ad;font-size:9px;margin-top:2px}
    .solverGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:9px}.solverBox{background:#0d1119;border:1px solid #2b3347;border-radius:13px;padding:10px;min-width:0}.solverBox .resinNum{font-size:18px;font-weight:900}.solverBox b{display:block;font-size:10px;margin-top:5px}.solverBox small{display:block;color:#9299ad;font-size:9px;margin-top:3px;line-height:1.35}
    .exploreLog{padding:9px 0;border-top:1px solid #222938}.exploreLog:first-child{border-top:0}.exploreLog b{font-size:11px}.exploreLog small{display:block;color:#9299ad;font-size:9px;margin-top:2px}.gain{color:#76e6aa;font-weight:900}
  `;
  document.head.appendChild(style);

  const dayNamesLocal = (typeof dayNames !== 'undefined' && Array.isArray(dayNames)) ? dayNames : ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  function ensureState() {
    s.explorationSessions = Array.isArray(s.explorationSessions) ? s.explorationSessions : [];
    s.explorationDraft = Object.assign({start:'', end:'', region:'', note:''}, s.explorationDraft || {});
  }
  ensureState();

  function americaDay() { return new Date(Date.now() - 9 * 3600000).getUTCDay(); }
  function priorityIndex(owner) {
    const p = Array.isArray(s.priority) ? s.priority : Object.keys(chars);
    const i = p.indexOf(owner);
    return i < 0 ? 999 : i;
  }
  function left(id) {
    if (!mats[id]) return 0;
    try { if (typeof remain === 'function') return Math.max(0, Number(remain(id)) || 0); } catch (_) {}
    return Math.max(0, Number(mats[id].need || 0) - Number(s.materials?.[id] || 0));
  }
  function taskLeft(task) { return (task.ids || []).reduce((a,id) => a + left(id), 0); }
  function domainFor(day) {
    try {
      const list = typeof domainTasks === 'function' ? domainTasks(day) : [];
      return [...(list || [])].sort((a,b) => priorityIndex(a.owner) - priorityIndex(b.owner));
    } catch (_) { return []; }
  }

  function buildWeekRows() {
    const start = americaDay();
    const rows = [];
    for (let offset = 0; offset < 7; offset++) {
      const d = (start + offset) % 7;
      const tasks = domainFor(d);
      rows.push({day:d, offset, tasks});
    }
    return rows;
  }

  function decorateWeekCalendar() {
    const page = document.getElementById('planner');
    if (!page) return;
    document.getElementById('sevenDayFarmCard')?.remove();
    const rows = buildWeekRows();
    const html = rows.map(r => {
      const label = r.offset === 0 ? 'TODAY' : (r.offset === 1 ? 'TOMORROW' : `+${r.offset} DAYS`);
      const body = r.tasks.length ? r.tasks.map((t, i) => {
        const c = chars[t.owner];
        const missing = taskLeft(t);
        return `<div class="weekplanTask"><b>${i+1}. ${t.domain}</b><small>${c?.name || t.owner} • ${missing.toLocaleString()} tracked pieces short • priority #${priorityIndex(t.owner)+1}</small></div>`;
      }).join('') : '<div class="weekplanTask"><b>SAVE / FLEX DAY</b><small>No unfinished rotating material domain is required on this day.</small></div>';
      return `<div class="weekplanDay"><div class="weekplanHead"><div><b>${dayNamesLocal[r.day]}</b><small>${label} • America server</small></div><span class="pill">${r.tasks.length} target${r.tasks.length===1?'':'s'}</span></div>${body}</div>`;
    }).join('');
    page.insertAdjacentHTML('beforeend', `<div class="card" id="sevenDayFarmCard"><div class="eyebrow">7-DAY FARMING CALENDAR</div><div class="title">Your next week</div><div class="muted" style="font-size:10px">Built live from unfinished domain materials and your character priority order. Sunday naturally becomes the catch-up day because rotating material domains are open.</div>${html}</div>`);
  }

  const worldBossIds = ['hutao_jade','yelan_boss','nicole_boss','citlali_boss'];
  const weeklyBossIds = ['hutao_weekly','yelan_gilded','nicole_counterfeit','citlali_denial'];

  function bestWorldBoss() {
    return worldBossIds.filter(id => mats[id] && left(id) > 0).sort((a,b) => priorityIndex(mats[a].owner) - priorityIndex(mats[b].owner))[0] || null;
  }
  function bestWeeklyBosses() {
    return weeklyBossIds.filter(id => mats[id] && left(id) > 0).sort((a,b) => priorityIndex(mats[a].owner) - priorityIndex(mats[b].owner));
  }
  function bestLeyLineNeed() {
    const ids = [];
    Object.values(chars).forEach(c => [...c.groups.character,...c.groups.talents,...c.groups.weapon].forEach(id => {
      if (!mats[id] || left(id) <= 0) return;
      const n = String(mats[id].name || '');
      if (/Mora|Wit/i.test(n)) ids.push(id);
    }));
    ids.sort((a,b) => priorityIndex(mats[a].owner) - priorityIndex(mats[b].owner));
    if (!ids.length) return null;
    const id = ids[0];
    return {id, type:/Mora/i.test(mats[id].name) ? 'Mora Ley Line' : 'EXP Ley Line', owner:mats[id].owner};
  }
  function baseTwenty() {
    const d = domainFor(americaDay())[0];
    if (d) return {title:`Run ${d.domain}`, sub:`Advances ${chars[d.owner]?.name || d.owner}, your highest-priority open material target.`};
    const ley = bestLeyLineNeed();
    if (ley) return {title:ley.type, sub:`${chars[ley.owner]?.name || ley.owner} still has a tracked ${/Mora/.test(ley.type)?'Mora':'EXP'} shortage.`};
    const top = (Array.isArray(s.priority) ? s.priority : Object.keys(chars))[0];
    return {title:`Farm ${chars[top]?.artifactDomain || 'an artifact domain'}`, sub:'No required rotating material domain is open, so artifact farming is the flexible Resin sink.'};
  }
  function solveResin(amount) {
    const twenty = baseTwenty();
    const wb = bestWorldBoss();
    const weekly = bestWeeklyBosses();
    const openDomain = domainFor(americaDay())[0];
    if (amount === 20) return twenty;
    if (amount === 40) {
      if (wb) return {title:`Claim ${mats[wb].source}`, sub:`40 Resin directly advances ${chars[mats[wb].owner]?.name || mats[wb].owner}: ${left(wb)} ${mats[wb].name} still needed.`};
      return {title:`2× ${twenty.title}`, sub:'No higher-priority 40-Resin character boss target is unfinished right now.'};
    }
    if (amount === 60) {
      if (openDomain) return {title:`1 Condensed → ${openDomain.domain}`, sub:`Under your 60-Resin / 3× reward rule, this concentrates all 60 into ${chars[openDomain.owner]?.name || openDomain.owner}'s highest-priority open material domain.`};
      if (weekly.length >= 2) return {title:'2 discounted weekly boss claims', sub:`Use 30 + 30 Resin on ${mats[weekly[0]].source} and ${mats[weekly[1]].source}. Both still feed tracked talent targets.`};
      if (wb) return {title:`${mats[wb].source} + ${twenty.title}`, sub:'40 Resin into the highest-priority world boss, then the remaining 20 into the best flexible target.'};
      return {title:`3× ${twenty.title}`, sub:'No unfinished boss target outranks the current 20-Resin farm.'};
    }
    return twenty;
  }

  function decorateResinSolver() {
    const page = document.getElementById('planner');
    if (!page) return;
    document.getElementById('resinPrioritySolverCard')?.remove();
    const options = [20,40,60].map(n => [n, solveResin(n)]);
    const first = page.firstElementChild;
    const html = `<div class="card" id="resinPrioritySolverCard"><div class="eyebrow">RESIN PRIORITY SOLVER</div><div class="title">Best next spend</div><div class="muted" style="font-size:10px">Uses today's America-server domains, unfinished fixed targets, and your character priority. This is a planning recommendation, not a drop-rate guarantee.</div><div class="solverGrid">${options.map(([n,x])=>`<div class="solverBox"><div class="resinNum">${n}</div><span class="tiny">RESIN</span><b>${x.title}</b><small>${x.sub}</small></div>`).join('')}</div></div>`;
    if (first) first.insertAdjacentHTML('afterend', html); else page.insertAdjacentHTML('beforeend', html);
  }

  function sessionStats() {
    const list = s.explorationSessions || [];
    const total = list.reduce((a,x)=>a+Math.max(0,+x.gain||0),0);
    const best = list.reduce((a,x)=>Math.max(a,Math.max(0,+x.gain||0)),0);
    return {count:list.length,total,best,avg:list.length?Math.round(total/list.length):0};
  }
  function decorateExplorationLogger() {
    const page = document.getElementById('primos');
    if (!page) return;
    document.getElementById('explorationSessionCard')?.remove();
    ensureState();
    const d = s.explorationDraft, stats = sessionStats();
    const recent = s.explorationSessions.slice(0,8).map(x => `<div class="exploreLog"><div class="taskhead"><div><b>${x.region || 'Exploration session'}</b><small>${new Date(x.t).toLocaleString()}${x.note ? ` • ${x.note}` : ''}</small></div><span class="gain">+${(+x.gain||0).toLocaleString()}</span></div><small>${(+x.start||0).toLocaleString()} → ${(+x.end||0).toLocaleString()} primos</small></div>`).join('') || '<div class="muted" style="padding:10px 0">No exploration sessions logged yet.</div>';
    page.insertAdjacentHTML('beforeend', `<div class="card" id="explorationSessionCard"><div class="eyebrow">EXPLORATION SESSION LOGGER</div><div class="title">How profitable was the grind?</div><div class="grid2"><div class="metric">TOTAL EARNED<b>${stats.total.toLocaleString()}</b></div><div class="metric">AVG / SESSION<b>${stats.avg.toLocaleString()}</b></div></div><div class="grid2" style="margin-top:8px"><div class="metric">SESSIONS<b>${stats.count}</b></div><div class="metric">BEST SESSION<b>${stats.best.toLocaleString()}</b></div></div><div class="wishinput"><span>Starting primogems</span><input id="exploreStart" type="number" min="0" value="${d.start}"></div><div class="wishinput"><span>Ending primogems</span><input id="exploreEnd" type="number" min="0" value="${d.end}"></div><div class="wishinput"><span>Region / area</span><input id="exploreRegion" type="text" value="${String(d.region||'').replace(/"/g,'&quot;')}" placeholder="e.g. Nod-Krai"></div><div class="wishinput"><span>Optional note</span><input id="exploreNote" type="text" value="${String(d.note||'').replace(/"/g,'&quot;')}" placeholder="quests, chests, oculi..."></div><div class="buttonGrid"><button id="exploreUseBankStart">BANK → START</button><button id="exploreUseBankEnd">BANK → END</button></div><button class="actionbtn" id="logExploreSession">LOG SESSION</button><div id="exploreMsg" class="tiny" style="margin-top:6px"></div><div class="section-title">RECENT SESSIONS</div>${recent}${stats.count?'<button id="clearExploreSessions" style="width:100%;margin-top:8px">CLEAR SESSION HISTORY</button>':''}</div>`);

    const start = document.getElementById('exploreStart'), end = document.getElementById('exploreEnd'), region = document.getElementById('exploreRegion'), note = document.getElementById('exploreNote');
    const storeDraft = () => { s.explorationDraft={start:start.value,end:end.value,region:region.value,note:note.value}; save(); };
    [start,end,region,note].forEach(e=>e.onchange=storeDraft);
    document.getElementById('exploreUseBankStart').onclick=()=>{start.value=Math.max(0,+s.wish?.primos||0);storeDraft();};
    document.getElementById('exploreUseBankEnd').onclick=()=>{end.value=Math.max(0,+s.wish?.primos||0);storeDraft();};
    document.getElementById('logExploreSession').onclick=()=>{
      const a=Math.max(0,Math.floor(+start.value||0)), b=Math.max(0,Math.floor(+end.value||0)), msg=document.getElementById('exploreMsg');
      if (b < a) { msg.textContent='Ending primogems cannot be lower than the starting amount for an exploration gain log.'; return; }
      s.explorationSessions.unshift({t:Date.now(),start:a,end:b,gain:b-a,region:region.value.trim(),note:note.value.trim()});
      s.explorationSessions=s.explorationSessions.slice(0,50);
      s.explorationDraft={start:b,end:'',region:region.value.trim(),note:''};
      save(); renderAll();
    };
    const clear=document.getElementById('clearExploreSessions');
    if(clear)clear.onclick=()=>{if(confirm('Clear exploration session history?')){s.explorationSessions=[];save();renderAll();}};
  }

  const priorRenderAll = renderAll;
  renderAll = function() {
    ensureState();
    priorRenderAll();
    decorateResinSolver();
    decorateWeekCalendar();
    decorateExplorationLogger();
    if (typeof renderNav === 'function') renderNav();
    save();
  };

  renderAll();
})();

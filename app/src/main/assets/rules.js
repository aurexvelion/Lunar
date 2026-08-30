(() => {
  if (window.__lunarRulesLoaded) return;
  window.__lunarRulesLoaded = true;
  if (typeof s === 'undefined' || typeof mats === 'undefined' || typeof chars === 'undefined') return;

  const AMERICA_RESET_UTC_HOUR = 9; // 04:00 server time at UTC-5
  const HOUR = 60 * 60 * 1000;

  function americaCycleDate() {
    return new Date(Date.now() - AMERICA_RESET_UTC_HOUR * HOUR);
  }
  function americaDay() {
    return americaCycleDate().getUTCDay();
  }
  function americaDayKey() {
    const d = americaCycleDate();
    return `america-${d.getUTCFullYear()}-${d.getUTCMonth()+1}-${d.getUTCDate()}`;
  }
  function nextDailyReset() {
    const now = new Date();
    let t = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), AMERICA_RESET_UTC_HOUR, 0, 0);
    if (Date.now() >= t) t += 86400000;
    return t;
  }
  function nextWeeklyReset() {
    const daily = nextDailyReset();
    const d = new Date(daily).getUTCDay();
    const add = (1 - d + 7) % 7;
    return daily + add * 86400000;
  }
  function fmt(ms) {
    ms = Math.max(0, ms);
    const d = Math.floor(ms / 86400000);
    const h = Math.floor((ms % 86400000) / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return `${d ? d + 'd ' : ''}${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  }

  // America server day controls daily checklist resets.
  todayKey = americaDayKey;

  // Primogem checklist scope requested by the user.
  try {
    const abyss = recurring.find(x => x.id === 'abyss');
    if (abyss) {
      abyss.name = 'Spiral Abyss • Floors 9–11';
      abyss.reward = 'Track only through Floor 11';
    }
    const theatre = recurring.find(x => x.id === 'theatre');
    if (theatre) {
      theatre.name = 'Imaginarium Theater • Mid difficulty';
      theatre.reward = 'Mid difficulty only';
    }
  } catch (_) {}

  s.resinPlan = Object.assign({current:200, condensed:0}, s.resinPlan || {});
  s.resinPlan.current = Math.max(0, Math.min(200, Math.floor(+s.resinPlan.current || 0)));
  s.resinPlan.condensed = Math.max(0, Math.min(3, Math.floor(+s.resinPlan.condensed || 0)));

  function sharedTotal(kind) {
    if (kind === 'wit') return ['yelan_wit','nicole_wit','citlali_wit'].reduce((a,id)=>a+(mats[id]?.need||0),0);
    if (kind === 'mora') return ['yelan_mora','nicole_mora','citlali_mora'].reduce((a,id)=>a+(mats[id]?.need||0),0);
    return 0;
  }

  function totalRowsForCharacter(id) {
    const c = chars[id];
    if (!c) return '';
    const grouped = new Map();
    const ids = [...c.groups.character, ...c.groups.talents, ...c.groups.weapon];
    ids.forEach(mid => {
      const m = mats[mid];
      if (!m) return;
      const key = m.name;
      const old = grouped.get(key) || {name:m.name, need:0, sources:new Set()};
      old.need += m.need;
      if (m.source) old.sources.add(m.source);
      grouped.set(key, old);
    });
    if (!grouped.size) return '<div class="complete-note">No tracked materials required.</div>';
    return [...grouped.values()].map(x => `<div class="row"><div class="left"><b>${x.name}</b><small>${[...x.sources].join(' • ')}</small></div><span class="pill">TARGET ${x.need.toLocaleString()}</span></div>`).join('');
  }

  function decorateCharacterTargets() {
    Object.keys(chars).forEach(id => {
      const page = document.getElementById(id);
      if (!page || document.getElementById(`${id}ZeroTargets`)) return;
      const hero = page.firstElementChild;
      if (!hero) return;
      hero.insertAdjacentHTML('afterend', `<div class="card" id="${id}ZeroTargets"><div class="eyebrow">TOTAL MATERIAL TARGETS FROM ZERO</div><div class="muted" style="font-size:10px;margin:6px 0 2px">These totals never shrink. Your counters show what you currently own, so if you spend something accidentally you can lower the owned count without moving the target.</div>${totalRowsForCharacter(id)}</div>`);
    });
  }

  function renderAmericaToday() {
    const page = document.getElementById('today');
    if (!page) return;
    const day = americaDay();
    const tasks = domainTasks(day);
    const dailyCount = (s.daily.welkin ? 90 : 0) + (s.daily.comm ? 60 : 0);
    const taskHtml = tasks.length ? tasks.map(t => {
      const c = chars[t.owner];
      return `<div class="task"><div class="taskhead"><div><b>${t.domain}</b><div class="muted" style="font-size:10px">${c.name} • America server ${dayNames[day]}</div></div><span class="pill ${String(c.element).toLowerCase()}">${c.element}</span></div><div class="tags">${t.ids.map(id=>`<span class="tag">${mats[id].name}: target ${mats[id].need.toLocaleString()} • owned ${(+s.materials[id]||0).toLocaleString()}</span>`).join('')}</div></div>`;
    }).join('') : `<div class="save-resin"><b>SAVE RESIN</b><span class="muted">No unfinished scheduled material is available on the America server today.</span></div>`;
    const progress = Object.entries(chars).map(([id,c]) => { const p=pct(charAllIds(c)); return `<div class="progressline"><span>${c.name}</span><b class="${p===100?'good':''}">${p}%</b></div><div class="bar"><i style="width:${p}%"></i></div>`; }).join('');
    page.innerHTML = `<div class="card hero"><div class="eyebrow">TODAY • AMERICA SERVER</div><div class="title">${dayNames[day]}</div><div class="muted">Domain day and resets follow the America server, not your phone's local midnight.</div></div><div class="card"><div class="eyebrow">RESIN PLAN</div>${taskHtml}</div><div class="card"><div class="eyebrow">DAILY PRIMOS</div><div class="big">${dailyCount} <span class="muted" style="font-size:12px">/ 150 guaranteed</span></div><div class="checkrow"><input type="checkbox" id="dWelkin" ${s.daily.welkin?'checked':''}><label for="dWelkin"><b>Welkin Moon</b><small>90 primogems</small></label></div><div class="checkrow"><input type="checkbox" id="dComm" ${s.daily.comm?'checked':''}><label for="dComm"><b>Daily Commissions</b><small>60 primogems</small></label></div><div class="checkrow"><input type="checkbox" id="dHoyo" ${s.daily.hoyo?'checked':''}><label for="dHoyo"><b>HoYoLAB Check-In</b><small>Primogems on reward days</small></label></div></div><div class="card"><div class="eyebrow">BUILD PROGRESS</div>${progress}</div>`;
    ['Welkin','Comm','Hoyo'].forEach(k => {
      const e = document.getElementById('d'+k);
      if (e) e.onchange = () => { s.daily[k.toLowerCase()] = e.checked; save(); renderAll(); };
    });
  }

  // Replace the base TODAY renderer so its weekday follows America server reset.
  renderToday = renderAmericaToday;

  function decorateFixedTargets() {
    const planner = document.getElementById('planner');
    if (!planner) return;

    // Replace misleading shared "remaining" wording with fixed-from-zero targets.
    planner.querySelectorAll('.row .left b').forEach(b => {
      if (b.textContent === 'Hero’s Wit') {
        const small = b.parentElement.querySelector('small');
        if (small) small.textContent = `Fixed target from zero across tracked characters: ${sharedTotal('wit').toLocaleString()}`;
      }
      if (b.textContent === 'Mora') {
        const small = b.parentElement.querySelector('small');
        if (small) small.textContent = `Fixed target from zero across tracked characters: ${sharedTotal('mora').toLocaleString()}`;
      }
    });

    if (!document.getElementById('fixedTargetRuleCard')) {
      const first = planner.firstElementChild;
      first?.insertAdjacentHTML('afterend', `<div class="card" id="fixedTargetRuleCard"><div class="eyebrow">MATERIAL TRACKING RULE</div><div class="title">Targets never shrink</div><div class="muted">L.U.N.A.R. keeps the full amount required from zero as the target. Only your OWNED count changes. Domain tasks disappear only when OWNED reaches the fixed target.</div></div>`);
    }
  }

  function decorateCondensed() {
    const planner = document.getElementById('planner');
    if (!planner || document.getElementById('condensedRuleCard')) return;
    const cards = [...planner.querySelectorAll('.card')];
    const resinCard = cards.find(c => c.querySelector('.eyebrow')?.textContent.trim() === 'RESIN BUDGET');
    if (!resinCard) return;
    const resin = Math.max(0, Math.min(200, Math.floor(+s.resinPlan.current || 0)));
    const condensed = Math.max(0, Math.min(3, Math.floor(+s.resinPlan.condensed || 0)));
    const craftable = Math.min(3-condensed, Math.floor(resin/60));
    const tasks = domainTasks(americaDay());
    const useHint = tasks.length ? `Best tracked use today: ${tasks[0].domain}.` : 'No tracked material domain is open today. Save it for a material/artifact domain or a Ley Line.';
    resinCard.insertAdjacentHTML('afterend', `<div class="card" id="condensedRuleCard"><div class="eyebrow">CONDENSED RESIN</div><div class="grid2"><div class="metric">ORIGINAL RESIN<b>${resin} / 200</b></div><div class="metric">CONDENSED<b>${condensed} / 3</b></div></div><div class="muted" style="margin-top:8px">1 Condensed Resin = 60 Original Resin and gives 3× rewards. Use only on artifact/material domains and Ley Lines.</div><div class="advice"><b>${craftable ? `You can craft ${craftable} now` : 'No craft available right now'}</b><span>${useHint}</span></div><div class="buttonGrid"><button id="craftCondensed" ${craftable<1?'disabled':''}>CRAFT 1 • −60</button><button id="useCondensed" ${condensed<1?'disabled':''}>USED 1 CONDENSED</button></div></div>`);
    const craft = document.getElementById('craftCondensed');
    if (craft) craft.onclick = () => { if ((+s.resinPlan.current||0) < 60 || (+s.resinPlan.condensed||0) >= 3) return; s.resinPlan.current -= 60; s.resinPlan.condensed += 1; save(); renderAll(); };
    const use = document.getElementById('useCondensed');
    if (use) use.onclick = () => { if ((+s.resinPlan.condensed||0) < 1) return; s.resinPlan.condensed -= 1; save(); renderAll(); };
  }

  function decorateAmericaReset() {
    const card = document.getElementById('resetCountdownCard');
    if (card) {
      const note = card.querySelector('.matsource');
      if (note) note.textContent = 'America server • daily reset 04:00 server time';
    }
    const a = document.getElementById('dailyResetCountdown');
    const b = document.getElementById('weeklyResetCountdown');
    if (a) a.textContent = fmt(nextDailyReset() - Date.now());
    if (b) b.textContent = fmt(nextWeeklyReset() - Date.now());
  }

  const priorRenderAll = renderAll;
  renderAll = function() {
    s.resinPlan = Object.assign({current:200, condensed:0}, s.resinPlan || {});
    s.resinPlan.current = Math.max(0, Math.min(200, Math.floor(+s.resinPlan.current || 0)));
    s.resinPlan.condensed = Math.max(0, Math.min(3, Math.floor(+s.resinPlan.condensed || 0)));
    priorRenderAll();
    decorateFixedTargets();
    decorateCondensed();
    decorateCharacterTargets();
    decorateAmericaReset();
    renderNav();
    save();
  };

  renderAll();
  setInterval(decorateAmericaReset, 1000);
})();

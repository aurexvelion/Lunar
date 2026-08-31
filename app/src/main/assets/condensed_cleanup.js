(() => {
  if (window.__lunarCondensedCleanupLoaded) return;
  window.__lunarCondensedCleanupLoaded = true;
  if (typeof s === 'undefined' || typeof renderAll !== 'function') return;

  function americaDay() {
    return new Date(Date.now() - 9 * 3600000).getUTCDay();
  }

  function domainList(day) {
    try {
      return typeof domainTasks === 'function' ? (domainTasks(day) || []) : [];
    } catch (_) {
      return [];
    }
  }

  function priorityIndex(owner) {
    const p = Array.isArray(s.priority) ? s.priority : [];
    const i = p.indexOf(owner);
    return i < 0 ? 999 : i;
  }

  function remaining(id) {
    if (typeof mats === 'undefined' || !mats[id]) return 0;
    try {
      if (typeof remain === 'function') return Math.max(0, Number(remain(id)) || 0);
    } catch (_) {}
    return Math.max(0, Number(mats[id].need || 0) - Number(s.materials?.[id] || 0));
  }

  function stripCondensedTracking() {
    if (s.resinPlan && Object.prototype.hasOwnProperty.call(s.resinPlan, 'condensed')) delete s.resinPlan.condensed;
    document.getElementById('condensedRuleCard')?.remove();
    document.querySelectorAll('.card').forEach(card => {
      const label = card.querySelector('.eyebrow')?.textContent?.trim();
      if (label === 'CONDENSED RESIN') card.remove();
    });
  }

  const worldBossIds = ['hutao_jade','yelan_boss','nicole_boss','citlali_boss'];

  function bestWorldBoss() {
    if (typeof mats === 'undefined') return null;
    return worldBossIds
      .filter(id => mats[id] && remaining(id) > 0)
      .sort((a,b) => priorityIndex(mats[a].owner) - priorityIndex(mats[b].owner))[0] || null;
  }

  function bestLeyLine() {
    if (typeof chars === 'undefined' || typeof mats === 'undefined') return null;
    const needs = [];
    Object.values(chars).forEach(c => {
      [...c.groups.character, ...c.groups.talents, ...c.groups.weapon].forEach(id => {
        const m = mats[id];
        if (!m || remaining(id) <= 0) return;
        if (/Mora/i.test(String(m.name))) needs.push({name:'Mora Ley Line', owner:m.owner});
        else if (/Wit/i.test(String(m.name))) needs.push({name:'EXP Ley Line', owner:m.owner});
      });
    });
    needs.sort((a,b) => priorityIndex(a.owner) - priorityIndex(b.owner));
    return needs[0] || null;
  }

  function nextResetMs() {
    const now = new Date();
    let t = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 9, 0, 0);
    if (Date.now() >= t) t += 86400000;
    return t - Date.now();
  }

  function currentResin() {
    return Math.max(0, Math.min(200, Math.floor(Number(s.resinPlan?.current ?? 0) || 0)));
  }

  function buildSimplePlan() {
    const resin = currentResin();
    const today = domainList(americaDay()).sort((a,b) => priorityIndex(a.owner) - priorityIndex(b.owner));
    const tomorrow = domainList((americaDay() + 1) % 7).sort((a,b) => priorityIndex(a.owner) - priorityIndex(b.owner));
    const domain = today[0] || null;
    const bossId = bestWorldBoss();
    const boss = bossId && typeof mats !== 'undefined' ? mats[bossId] : null;
    const ley = bestLeyLine();
    const actions = [];
    let left = resin;

    if (domain && left >= 20) {
      const runs = Math.min(4, Math.floor(left / 20));
      if (runs > 0) {
        const who = (typeof chars !== 'undefined' && chars[domain.owner]) ? chars[domain.owner].name : domain.owner;
        actions.push({title:`${domain.domain} ×${runs}`, sub:`Material domain for ${who}.`, cost:runs * 20});
        left -= runs * 20;
      }
    }

    if (boss && left >= 40) {
      const runs = Math.floor(left / 40);
      if (runs > 0) {
        const who = (typeof chars !== 'undefined' && chars[boss.owner]) ? chars[boss.owner].name : boss.owner;
        actions.push({title:`${boss.source} ×${runs}`, sub:`World-boss claims for ${who}. ${remaining(bossId).toLocaleString()} ${boss.name} still tracked.`, cost:runs * 40});
        left -= runs * 40;
      }
    }

    if (left >= 20) {
      if (domain) {
        const runs = Math.floor(left / 20);
        const who = (typeof chars !== 'undefined' && chars[domain.owner]) ? chars[domain.owner].name : domain.owner;
        actions.push({title:`${domain.domain} ×${runs}`, sub:`Use the leftover Resin on the same ${who} material domain.`, cost:runs * 20});
        left -= runs * 20;
      } else if (ley) {
        const runs = Math.floor(left / 20);
        const who = (typeof chars !== 'undefined' && chars[ley.owner]) ? chars[ley.owner].name : ley.owner;
        actions.push({title:`${ley.name} ×${runs}`, sub:`Flexible farming for ${who}.`, cost:runs * 20});
        left -= runs * 20;
      } else {
        const top = Array.isArray(s.priority) ? s.priority[0] : null;
        const domainName = top && typeof chars !== 'undefined' ? chars[top]?.artifactDomain : null;
        const runs = Math.floor(left / 20);
        actions.push({title:`${domainName || 'Artifact domain'} ×${runs}`, sub:'No tracked material or boss target currently outranks artifact farming.', cost:runs * 20});
        left -= runs * 20;
      }
    }

    let tomorrowNote = '';
    if (!domain && tomorrow.length) {
      const t = tomorrow[0];
      const who = (typeof chars !== 'undefined' && chars[t.owner]) ? chars[t.owner].name : t.owner;
      const capBeforeReset = resin < 200 && ((200 - resin) * 8 * 60 * 1000) < nextResetMs();
      tomorrowNote = capBeforeReset
        ? `Tomorrow: ${t.domain} for ${who}. Your Resin will cap before reset, so this is the one case where banking some Resin as Condensed Resin makes sense.`
        : `Tomorrow: ${t.domain} for ${who}. Save enough Resin for it instead of forcing a bad farm today.`;
    }

    return {resin, actions, left, tomorrowNote};
  }

  function replaceResinSolver() {
    document.getElementById('resinPrioritySolverCard')?.remove();
    document.getElementById('simpleResinPlanCard')?.remove();
    const page = document.getElementById('planner');
    if (!page) return;

    const plan = buildSimplePlan();
    const body = plan.actions.length
      ? plan.actions.map((x,i) => `<div class="row"><div class="left"><b>${i+1}. ${x.title}</b><small>${x.sub}</small></div><span class="pill">${x.cost} RESIN</span></div>`).join('')
      : `<div class="save-resin"><b>DON'T FORCE A FARM</b><span class="muted">You only have ${plan.resin} Resin right now. Wait for enough Resin or follow tomorrow's plan.</span></div>`;
    const leftover = plan.left > 0 ? `<div class="muted" style="font-size:10px;margin-top:8px">${plan.left} Resin left after this plan. Let it regenerate until it can pay for another useful claim.</div>` : '';
    const tomorrow = plan.tomorrowNote ? `<div class="advice" style="margin-top:9px"><b>NEXT DAY</b><span>${plan.tomorrowNote}</span></div>` : '';
    const html = `<div class="card" id="simpleResinPlanCard"><div class="eyebrow">TODAY'S RESIN ORDERS</div><div class="title">Just tell me what to run</div><div class="muted" style="font-size:10px">Built from your current ${plan.resin}/200 Resin, today's America-server domains, unfinished materials, and character priority.</div>${body}${leftover}${tomorrow}</div>`;
    const first = page.firstElementChild;
    if (first) first.insertAdjacentHTML('afterend', html); else page.insertAdjacentHTML('beforeend', html);
  }

  function cleanup() {
    stripCondensedTracking();
    replaceResinSolver();
    if (typeof save === 'function') save();
  }

  const priorRenderAll = renderAll;
  renderAll = function() {
    priorRenderAll();
    cleanup();
  };

  cleanup();
})();

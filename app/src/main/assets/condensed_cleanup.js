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

  function stripCondensedTracking() {
    if (s.resinPlan && Object.prototype.hasOwnProperty.call(s.resinPlan, 'condensed')) {
      delete s.resinPlan.condensed;
    }

    document.getElementById('condensedRuleCard')?.remove();
    document.querySelectorAll('.card').forEach(card => {
      const label = card.querySelector('.eyebrow')?.textContent?.trim();
      if (label === 'CONDENSED RESIN') card.remove();
    });
  }

  function rewriteSixtyResinAdvice() {
    const card = document.getElementById('resinPrioritySolverCard');
    if (!card) return;

    const box = [...card.querySelectorAll('.solverBox')].find(x => x.querySelector('.resinNum')?.textContent?.trim() === '60');
    if (!box) return;

    const title = box.querySelector('b');
    const sub = box.querySelector('small');
    if (!title || !sub) return;

    const today = americaDay();
    const tomorrow = (today + 1) % 7;
    const todayTasks = domainList(today);
    const tomorrowTasks = domainList(tomorrow);

    if (!todayTasks.length && tomorrowTasks.length) {
      const t = tomorrowTasks[0];
      const who = (typeof chars !== 'undefined' && chars[t.owner]) ? chars[t.owner].name : t.owner;
      title.textContent = 'SAVE FOR TOMORROW';
      sub.textContent = `Nothing tracked is worth forcing today. If Resin would cap before reset, Condensed Resin is useful only to bank some for ${t.domain} tomorrow for ${who}.`;
      return;
    }

    if (todayTasks.length) {
      const t = todayTasks[0];
      const who = (typeof chars !== 'undefined' && chars[t.owner]) ? chars[t.owner].name : t.owner;
      title.textContent = `3× ${t.domain}`;
      sub.textContent = `Spend the 60 Resin as three normal 20-Resin runs for ${who}. No Condensed Resin tracking needed.`;
      return;
    }

    title.textContent = '3× BEST 20-RESIN SPEND';
    sub.textContent = 'No tracked domain is open today or tomorrow. Spend normally on Ley Lines, artifacts, or another current priority.';
  }

  function cleanup() {
    stripCondensedTracking();
    rewriteSixtyResinAdvice();
    if (typeof save === 'function') save();
  }

  const priorRenderAll = renderAll;
  renderAll = function() {
    priorRenderAll();
    cleanup();
  };

  cleanup();
})();

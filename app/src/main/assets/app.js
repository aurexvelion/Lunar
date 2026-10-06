(() => {
  const KEY = 'lunar_simple_v1';
  const defaultState = { primos: 0, weekly: 0 };
  let s = {...defaultState, ...JSON.parse(localStorage.getItem(KEY) || '{}')};

  const $ = id => document.getElementById(id);
  const save = () => localStorage.setItem(KEY, JSON.stringify(s));
  const clamp = n => Math.max(0, Math.floor(Number(n) || 0));
  const pct = (a,b) => Math.min(100, Math.max(0, b ? a / b * 100 : 0));

  function render() {
    const weeklyPct = pct(s.weekly, 1600);
    const totalPct = pct(s.primos, 200000);
    $('weeklyValue').textContent = `${s.weekly.toLocaleString()} / 1,600`;
    $('weeklyBar').style.width = `${weeklyPct}%`;
    $('weeklyPct').textContent = `${Math.round(weeklyPct)}%`;
    $('primoValue').textContent = s.primos.toLocaleString();
    $('totalBar').style.width = `${totalPct}%`;
    $('totalPct').textContent = `${Math.round(totalPct)}%`;
    $('currentInput').value = s.primos;
    $('weeklyInput').value = s.weekly;
    $('weeklyStatus').textContent = s.weekly >= 1600 ? 'WEEKLY GOAL COMPLETE' : `${(1600-s.weekly).toLocaleString()} primogems to go`;
    $('totalStatus').textContent = s.primos >= 200000 ? '200K GOAL REACHED' : `${(200000-s.primos).toLocaleString()} primogems to go`;
  }

  $('currentInput').addEventListener('change', e => { s.primos = clamp(e.target.value); save(); render(); });
  $('weeklyInput').addEventListener('change', e => { s.weekly = clamp(e.target.value); save(); render(); });
  $('addWeekly').addEventListener('click', () => { s.weekly += 160; save(); render(); });
  $('resetWeekly').addEventListener('click', () => { s.weekly = 0; save(); render(); });
  $('clearAll').addEventListener('click', () => { s = {...defaultState}; save(); render(); });
  render();
})();

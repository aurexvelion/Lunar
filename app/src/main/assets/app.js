(() => {
  const KEY = 'lunar_simple_v2';
  const mondayKey = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  };

  const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
  let s = {
    primos: Math.max(0, Math.floor(Number(saved.primos) || 0)),
    weekly: Math.max(0, Math.floor(Number(saved.weekly) || 0)),
    week: saved.week || mondayKey()
  };

  if (s.week !== mondayKey()) {
    s.week = mondayKey();
    s.weekly = 0;
  }

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
    $('weeklyStatus').textContent = s.weekly >= 1600
      ? 'WEEKLY GOAL COMPLETE'
      : `${(1600 - s.weekly).toLocaleString()} primogems to go`;

    $('primoValue').textContent = s.primos.toLocaleString();
    $('totalBar').style.width = `${totalPct}%`;
    $('totalPct').textContent = `${Math.round(totalPct)}%`;
    $('totalStatus').textContent = s.primos >= 200000
      ? '200K GOAL REACHED'
      : `${(200000 - s.primos).toLocaleString()} primogems to go`;

    $('currentInput').value = s.primos;
    $('weeklyInput').value = s.weekly;
  }

  $('currentInput').addEventListener('change', e => {
    s.primos = clamp(e.target.value);
    save();
    render();
  });

  $('weeklyInput').addEventListener('change', e => {
    s.weekly = clamp(e.target.value);
    save();
    render();
  });

  save();
  render();
})();

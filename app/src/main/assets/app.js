(() => {
  const STORAGE_KEY = 'lunar_core_v1';
  const WEEKLY_GOAL = 1600;
  const GRAND_GOAL = 200000;

  const $ = id => document.getElementById(id);
  const clamp = value => Math.max(0, Math.floor(Number(value) || 0));
  const fmt = value => clamp(value).toLocaleString('en-US');
  const percent = (value, goal) => Math.min(100, Math.max(0, goal ? (value / goal) * 100 : 0));

  function getMondayKey() {
    const d = new Date();
    const day = (d.getDay() + 6) % 7;
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - day);
    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0')
    ].join('-');
  }

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return {
        current: clamp(saved.current),
        weekKey: typeof saved.weekKey === 'string' ? saved.weekKey : '',
        weekStart: clamp(saved.weekStart)
      };
    } catch {
      return { current: 0, weekKey: '', weekStart: 0 };
    }
  }

  const state = load();

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function ensureCurrentWeek() {
    const key = getMondayKey();
    if (state.weekKey !== key) {
      state.weekKey = key;
      state.weekStart = state.current;
      save();
    }
  }

  function render() {
    ensureCurrentWeek();

    const weeklyEarned = Math.max(0, state.current - state.weekStart);
    const weeklyPct = percent(weeklyEarned, WEEKLY_GOAL);
    const grandPct = percent(state.current, GRAND_GOAL);

    $('currentInput').value = state.current || '';

    $('weeklyValue').textContent = fmt(weeklyEarned);
    $('weeklyBar').style.width = weeklyPct + '%';
    $('weeklyPct').textContent = weeklyPct.toFixed(1).replace('.0', '') + '%';
    $('weeklyLeft').textContent = weeklyEarned >= WEEKLY_GOAL
      ? 'Goal complete'
      : fmt(WEEKLY_GOAL - weeklyEarned) + ' left';
    $('weeklyLeft').classList.toggle('complete', weeklyEarned >= WEEKLY_GOAL);

    $('grandValue').textContent = fmt(state.current);
    $('grandBar').style.width = grandPct + '%';
    $('grandPct').textContent = grandPct.toFixed(2).replace(/0+$/, '').replace(/\.$/, '') + '%';
    $('grandLeft').textContent = state.current >= GRAND_GOAL
      ? 'Goal complete'
      : fmt(GRAND_GOAL - state.current) + ' left';
    $('grandLeft').classList.toggle('complete', state.current >= GRAND_GOAL);

    $('weekNote').textContent =
      'Weekly progress is measured from your saved balance of ' +
      fmt(state.weekStart) +
      ' at the start of this tracked week.';
  }

  $('currentInput').addEventListener('input', event => {
    state.current = clamp(event.target.value);
    save();
    render();
  });

  $('currentInput').addEventListener('blur', () => {
    $('currentInput').value = state.current || '';
  });

  $('resetWeek').addEventListener('click', () => {
    state.weekKey = getMondayKey();
    state.weekStart = state.current;
    save();
    render();
  });

  ensureCurrentWeek();
  render();
})();

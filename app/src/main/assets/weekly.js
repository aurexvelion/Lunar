(() => {
  if (window.__lunarWeeklyLoaded) return;
  window.__lunarWeeklyLoaded = true;

  const nav = document.getElementById('mainNav');
  const viewport = document.querySelector('.viewport');
  if (!nav || !viewport || typeof s === 'undefined') return;

  const weeklyButton = document.createElement('button');
  weeklyButton.dataset.page = 'weekly';
  weeklyButton.textContent = 'WEEKLY';
  nav.appendChild(weeklyButton);

  const weeklyPage = document.createElement('section');
  weeklyPage.id = 'weekly';
  weeklyPage.className = 'page';
  viewport.appendChild(weeklyPage);

  if (!s.weekly) s.weekly = { week: '', transformer: false, crystalfly: false, transient: false, trounce: false };
  if (!s.stash) s.stash = { fragile: 0, solvent: 0 };
  if (!s.weeklyNotice) s.weeklyNotice = { enabled: false, day: 1, hour: 18, minute: 0, initialized: false };

  try {
    if (!s.weeklyNotice.initialized && window.LunarAndroid && LunarAndroid.getWeeklyReminder) {
      const native = JSON.parse(LunarAndroid.getWeeklyReminder());
      s.weeklyNotice.enabled = !!native.enabled;
      s.weeklyNotice.day = Math.max(0, Math.min(6, +native.day || 0));
      s.weeklyNotice.hour = Math.max(0, Math.min(23, +native.hour || 18));
      s.weeklyNotice.minute = Math.max(0, Math.min(59, +native.minute || 0));
      s.weeklyNotice.initialized = true;
    }
  } catch (_) {
    s.weeklyNotice.initialized = true;
  }

  function mondayKey() {
    const d = new Date();
    const m = new Date(d);
    m.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    m.setHours(0, 0, 0, 0);
    return m.toDateString();
  }

  function resetWeeklyIfNeeded() {
    const key = mondayKey();
    if (s.weekly.week !== key) {
      s.weekly = { week: key, transformer: false, crystalfly: false, transient: false, trounce: false };
    }
  }

  function timeValue() {
    return String(s.weeklyNotice.hour).padStart(2, '0') + ':' + String(s.weeklyNotice.minute).padStart(2, '0');
  }

  function syncNativeReminder() {
    try {
      if (window.LunarAndroid && LunarAndroid.setWeeklyReminder) {
        LunarAndroid.setWeeklyReminder(
          !!s.weeklyNotice.enabled,
          +s.weeklyNotice.day,
          +s.weeklyNotice.hour,
          +s.weeklyNotice.minute
        );
      }
    } catch (_) {}
  }

  function counterRow(label, key) {
    const v = Math.max(0, Math.floor(+s.stash[key] || 0));
    return `<div class="row"><div class="left"><b>${label}</b><small>Persistent inventory count</small></div><div class="stepper"><button data-stash="${key}" data-d="-1">−</button><b>${v}</b><button data-stash="${key}" data-d="1">+</button></div></div>`;
  }

  function reminderRow(id, title, sub) {
    return `<div class="checkrow"><input type="checkbox" id="wk_${id}" data-weekly="${id}" ${s.weekly[id] ? 'checked' : ''}><label for="wk_${id}"><b>${title}</b><small>${sub}</small></label></div>`;
  }

  function renderWeekly() {
    resetWeeklyIfNeeded();
    const n = s.weeklyNotice;
    const completed = ['transformer', 'crystalfly', 'transient', 'trounce'].filter(k => s.weekly[k]).length;

    weeklyPage.innerHTML = `
      <div class="card hero">
        <div class="eyebrow">WEEKLY</div>
        <div class="title">Weekly maintenance</div>
        <div class="muted">${completed} / 4 reminders done this week. Checklist resets Monday.</div>
        <div class="bar"><i style="width:${completed * 25}%"></i></div>
      </div>

      <div class="card">
        <div class="eyebrow">GADGETS + WEEKLY STUFF</div>
        ${reminderRow('transformer', 'Parametric Transformer', 'Use it when its 7-day cooldown is ready.')}
        ${reminderRow('crystalfly', 'Crystalfly Trap', 'Collect it and deploy it again when ready.')}
        ${reminderRow('transient', 'Buy Transient Resin', 'Realm Depot weekly purchase.')}
        ${reminderRow('trounce', 'Use weekly boss discounts', 'Do your discounted Trounce Domain claims and check boss drops.')}
      </div>

      <div class="card">
        <div class="eyebrow">STASH</div>
        ${counterRow('Fragile Resin', 'fragile')}
        ${counterRow('Dream Solvent', 'solvent')}
      </div>

      <div class="card">
        <div class="eyebrow">WEEKLY PHONE REMINDER</div>
        <div class="row"><div class="left"><b>Notification</b><small>Reminds you about gadgets, Transient Resin, bosses and stash.</small></div><button id="weeklyNotifyToggle" class="${n.enabled ? 'good' : ''}">${n.enabled ? 'ON' : 'OFF'}</button></div>
        <div class="section-title">DAY</div>
        <div class="weekdays">${shortDays.map((name, i) => `<button data-week-notice-day="${i}" class="${i === +n.day ? 'on' : ''}">${name}</button>`).join('')}</div>
        <div class="wishinput"><span>Reminder time</span><input id="weeklyNotifyTime" type="time" value="${timeValue()}"></div>
      </div>
    `;

    weeklyPage.querySelectorAll('[data-weekly]').forEach(box => {
      box.onchange = () => {
        s.weekly[box.dataset.weekly] = box.checked;
        save();
        renderWeekly();
      };
    });

    weeklyPage.querySelectorAll('[data-stash]').forEach(button => {
      button.onclick = () => {
        const key = button.dataset.stash;
        s.stash[key] = Math.max(0, Math.floor((+s.stash[key] || 0) + (+button.dataset.d || 0)));
        save();
        renderWeekly();
      };
    });

    weeklyPage.querySelectorAll('[data-week-notice-day]').forEach(button => {
      button.onclick = () => {
        s.weeklyNotice.day = +button.dataset.weekNoticeDay;
        save();
        if (s.weeklyNotice.enabled) syncNativeReminder();
        renderWeekly();
      };
    });

    const toggle = document.getElementById('weeklyNotifyToggle');
    toggle.onclick = () => {
      s.weeklyNotice.enabled = !s.weeklyNotice.enabled;
      s.weeklyNotice.initialized = true;
      save();
      syncNativeReminder();
      renderWeekly();
    };

    const time = document.getElementById('weeklyNotifyTime');
    time.onchange = () => {
      const parts = String(time.value || '18:00').split(':');
      s.weeklyNotice.hour = Math.max(0, Math.min(23, +parts[0] || 0));
      s.weeklyNotice.minute = Math.max(0, Math.min(59, +parts[1] || 0));
      s.weeklyNotice.initialized = true;
      save();
      if (s.weeklyNotice.enabled) syncNativeReminder();
      renderWeekly();
    };
  }

  weeklyButton.onclick = () => {
    s.page = 'weekly';
    renderNav();
    save();
    weeklyPage.scrollTop = 0;
  };

  const baseRenderAll = renderAll;
  renderAll = function () {
    baseRenderAll();
    renderWeekly();
    renderNav();
  };

  resetWeeklyIfNeeded();
  renderWeekly();
  renderNav();
  save();
})();

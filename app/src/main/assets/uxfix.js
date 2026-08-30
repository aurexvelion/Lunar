(() => {
  if (window.__lunarUxFixLoaded) return;
  window.__lunarUxFixLoaded = true;
  if (typeof s === 'undefined' || typeof save !== 'function' || typeof renderAll !== 'function') return;

  const style = document.createElement('style');
  style.textContent = `
    button.auto-holding{transform:scale(.96);background:#303a61;border-color:#8996ef}
    .stepper button{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
  `;
  document.head.appendChild(style);

  function activePage() {
    return document.querySelector('.page.on');
  }

  function safeRender() {
    const page = activePage();
    const pageId = page ? page.id : s.page;
    const scroll = page ? page.scrollTop : 0;
    if (pageId) s.page = pageId;
    save();
    renderAll();
    requestAnimationFrame(() => {
      if (pageId) {
        s.page = pageId;
        if (typeof renderNav === 'function') renderNav();
        const p = document.getElementById(pageId);
        if (p) p.scrollTop = scroll;
      }
    });
  }

  // Character sub-tabs used to call renderChar() directly. That rebuilt the character page
  // but skipped the later decorators, which made cards such as fixed total targets disappear.
  // Handle these clicks once, at the document level, and do a complete render instead.
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('[data-char-tab]');
    if (!b) return;
    const page = b.closest('.charpage');
    if (!page || !s.charTabs) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    s.charTabs[page.id] = b.dataset.charTab;
    safeRender();
  }, true);

  let hold = null;
  let suppressClickFor = null;

  function amountButton(el) {
    return el && el.closest ? el.closest('[data-mat],[data-shared],[data-stash]') : null;
  }

  function applyOne(b) {
    const d = Number(b.dataset.d || 0);
    if (!d) return false;

    if (b.dataset.mat) {
      const id = b.dataset.mat;
      if (typeof mats === 'undefined' || !mats[id]) return false;
      if (!s.materials) s.materials = {};
      const max = Math.max(0, Number(mats[id].need || 0));
      s.materials[id] = Math.max(0, Math.min(max, Number(s.materials[id] || 0) + d));
      const label = b.closest('.stepper')?.querySelector('b');
      if (label) label.textContent = `${Number(s.materials[id]).toLocaleString()} / ${max.toLocaleString()}`;
      return true;
    }

    if (b.dataset.shared) {
      const key = b.dataset.shared;
      if (!s.inventory) s.inventory = {};
      // Shared inventory is an owned stash, so do not artificially clamp it to one character.
      s.inventory[key] = Math.max(0, Math.min(999999999, Number(s.inventory[key] || 0) + d));
      const label = b.closest('.stepper')?.querySelector('b');
      if (label) label.textContent = Number(s.inventory[key]).toLocaleString();
      return true;
    }

    if (b.dataset.stash) {
      const key = b.dataset.stash;
      if (!s.stash) s.stash = {};
      s.stash[key] = Math.max(0, Math.min(999999999, Number(s.stash[key] || 0) + d));
      const label = b.closest('.stepper')?.querySelector('b');
      if (label) label.textContent = Number(s.stash[key]).toLocaleString();
      return true;
    }

    return false;
  }

  function stopHold(pointerId) {
    if (!hold || (pointerId != null && hold.pointerId !== pointerId)) return;
    clearTimeout(hold.delay);
    clearInterval(hold.timer);
    const b = hold.button;
    b.classList.remove('auto-holding');
    if (hold.repeating) {
      suppressClickFor = b;
      save();
      safeRender();
    }
    hold = null;
  }

  document.addEventListener('pointerdown', e => {
    const b = amountButton(e.target);
    if (!b || b.disabled || e.button !== 0) return;
    if (hold) stopHold();
    try { b.setPointerCapture(e.pointerId); } catch (_) {}
    const state = {button:b, pointerId:e.pointerId, repeating:false, timer:null, delay:null};
    state.delay = setTimeout(() => {
      if (hold !== state) return;
      state.repeating = true;
      b.classList.add('auto-holding');
      applyOne(b);
      state.timer = setInterval(() => applyOne(b), 75);
    }, 325);
    hold = state;
  }, true);

  document.addEventListener('pointerup', e => stopHold(e.pointerId), true);
  document.addEventListener('pointercancel', e => stopHold(e.pointerId), true);

  // A long press normally emits a final click on release. Swallow that click so the value
  // does not jump by one extra step after auto-repeat finishes.
  document.addEventListener('click', e => {
    const b = amountButton(e.target);
    if (!b || b !== suppressClickFor) return;
    suppressClickFor = null;
    e.preventDefault();
    e.stopImmediatePropagation();
  }, true);
})();

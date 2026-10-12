(() => {
  'use strict';

  const STORAGE_KEY = 'lunar_materials_v1';
  const TAB_KEY = 'lunar_active_tab_v1';
  const $ = id => document.getElementById(id);
  const safeNumber = (value, minimum = 0) => {
    const number = Math.floor(Number(value));
    return Number.isFinite(number) ? Math.min(999999999, Math.max(minimum, number)) : minimum;
  };
  const format = value => value.toLocaleString('en-US');
  const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
  const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 9);

  function readCharacters() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (!Array.isArray(parsed.characters)) return [];
      return parsed.characters.filter(char => char && typeof char.name === 'string' && char.id).map(char => ({
        id: String(char.id),
        name: char.name.slice(0, 60),
        materials: (Array.isArray(char.materials) ? char.materials : [])
          .filter(mat => mat && mat.id && typeof mat.name === 'string')
          .map(mat => {
            const required = safeNumber(mat.required, 1);
            return {
              id: String(mat.id),
              name: mat.name.slice(0, 80),
              required: required,
              owned: Math.min(required, safeNumber(mat.owned))
            };
          })
      }));
    } catch (_) {
      return [];
    }
  }

  let characters = readCharacters();
  let selectedId = null;

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ characters: characters }));
  }

  function selectedCharacter() {
    return characters.find(char => char.id === selectedId) || null;
  }

  function counts(char) {
    const required = char.materials.reduce((sum, mat) => sum + mat.required, 0);
    const owned = char.materials.reduce((sum, mat) => sum + Math.min(mat.owned, mat.required), 0);
    return { required, owned, remaining: Math.max(0, required - owned),
      percent: required ? Math.round(owned / required * 100) : 0 };
  }

  function bar(percent) {
    return '<div class="bar" role="progressbar" aria-valuenow="' + percent +
      '" aria-valuemin="0" aria-valuemax="100"><i class="fill" style="width:' + percent + '%"></i></div>';
  }

  function renderRoster() {
    const roster = $('characterRoster');
    if (!characters.length) {
      roster.innerHTML = '<div class="materialEmpty">No characters yet.<br>Add one above to start tracking materials.</div>';
      return;
    }

    roster.innerHTML = characters.map(char => {
      const c = counts(char);
      const complete = char.materials.length && c.remaining === 0;
      return '<article class="card characterCard" data-character-id="' + escapeHtml(char.id) + '">' +
        '<button type="button" class="characterOpen" data-action="open-character" aria-label="Open ' + escapeHtml(char.name) + '">' +
        '<div class="characterLine"><span class="characterName">' + escapeHtml(char.name) + '</span>' +
        '<span class="characterArrow" aria-hidden="true">›</span></div>' +
        '<div class="characterMeta">' + char.materials.length + ' materials · ' +
        (complete ? 'All collected' : format(c.remaining) + ' items remaining') + ' · ' + c.percent + '%</div>' +
        bar(c.percent) + '</button>' +
        '<div class="characterFoot"><button type="button" class="dangerBtn" data-action="remove-character">Delete character</button></div>' +
        '</article>';
    }).join('');
  }

  function renderDetail() {
    const char = selectedCharacter();
    $('characterWelcome').hidden = !!char;
    $('characterRoster').hidden = !!char;
    $('characterDetails').hidden = !char;
    if (!char) return;

    const c = counts(char);
    $('characterTitle').textContent = char.name;
    $('characterSummary').textContent = char.materials.length +
      ' materials · ' + format(c.remaining) + ' items remaining';
    $('characterPercent').textContent = c.percent + '%';
    $('characterProgress').style.width = c.percent + '%';
    $('characterProgressBar').setAttribute('aria-valuenow', c.percent);
    $('materialCount').textContent = char.materials.length + ' total';

    if (!char.materials.length) {
      $('materialsList').innerHTML = '<div class="materialEmpty">Nothing to farm yet.<br>Add a material and set your target amount.</div>';
      return;
    }

    $('materialsList').innerHTML = char.materials.map(mat => {
      const remaining = Math.max(0, mat.required - mat.owned);
      const percent = Math.round(100 * Math.min(mat.owned, mat.required) / mat.required);
      return '<article class="card materialCard" data-material-id="' + escapeHtml(mat.id) + '">' +
        '<div class="materialTop"><div><div class="materialName">' + escapeHtml(mat.name) + '</div>' +
        '<div class="materialRemaining' + (remaining === 0 ? ' materialComplete' : '') + '">' +
        (remaining === 0 ? '✓ Complete' : format(remaining) + ' still needed') + '</div></div>' +
        '<button type="button" class="dangerBtn" data-action="remove-material" aria-label="Delete ' +
        escapeHtml(mat.name) + '">Delete</button></div>' +
        '<div class="materialNumbers">' +
        '<label><span class="formLabel">Required</span><input class="matInput" type="number" min="1" max="999999999" step="1" inputmode="numeric" data-field="required" aria-label="' +
        escapeHtml(mat.name) + ' required" value="' + mat.required + '"></label>' +
        '<label><span class="formLabel">Owned</span><span class="ownedControl">' +
        '<button type="button" class="step" data-action="decrease" aria-label="Remove one ' + escapeHtml(mat.name) + '">−</button>' +
        '<input class="matInput" type="number" min="0" max="' + mat.required +
        '" step="1" inputmode="numeric" data-field="owned" aria-label="' + escapeHtml(mat.name) +
        ' owned" value="' + mat.owned + '">' +
        '<button type="button" class="step" data-action="increase" aria-label="Add one ' + escapeHtml(mat.name) + '">+</button>' +
        '</span></label></div>' + bar(percent) + '</article>';
    }).join('');
  }

  function render() {
    renderRoster();
    renderDetail();
  }

  function setTab(tab) {
    const materials = tab === 'materials';
    $('primosView').hidden = materials;
    $('materialsView').hidden = !materials;
    $('tabPrimos').classList.toggle('active', !materials);
    $('tabMaterials').classList.toggle('active', materials);
    $('tabPrimos').setAttribute('aria-selected', String(!materials));
    $('tabMaterials').setAttribute('aria-selected', String(materials));
    try { localStorage.setItem(TAB_KEY, materials ? 'materials' : 'primos'); } catch (_) {}
  }

  $('tabPrimos').addEventListener('click', () => setTab('primos'));
  $('tabMaterials').addEventListener('click', () => setTab('materials'));

  $('addCharacterForm').addEventListener('submit', event => {
    event.preventDefault();
    const input = $('characterNameInput');
    const name = input.value.trim();
    if (!name) return;
    let char = characters.find(item => item.name.toLocaleLowerCase() === name.toLocaleLowerCase());
    if (!char) {
      char = { id: newId(), name: name.slice(0, 60), materials: [] };
      characters.push(char);
      save();
    }
    selectedId = char.id;
    input.value = '';
    render();
  });

  $('characterRoster').addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    const card = button && button.closest('[data-character-id]');
    if (!card) return;
    const char = characters.find(item => item.id === card.dataset.characterId);
    if (!char) return;
    if (button.dataset.action === 'open-character') {
      selectedId = char.id;
      render();
      window.scrollTo(0, 0);
    } else if (button.dataset.action === 'remove-character' &&
               window.confirm('Delete ' + char.name + ' and all its materials?')) {
      characters = characters.filter(item => item.id !== char.id);
      save();
      render();
    }
  });

  $('backToCharacters').addEventListener('click', () => {
    selectedId = null;
    render();
  });

  $('addMaterialForm').addEventListener('submit', event => {
    event.preventDefault();
    const char = selectedCharacter();
    if (!char) return;
    const nameInput = $('newMaterialName');
    const requiredInput = $('newMaterialRequired');
    const ownedInput = $('newMaterialOwned');
    const name = nameInput.value.trim();
    if (!name || !requiredInput.value) return;
    const required = safeNumber(requiredInput.value, 1);
    const owned = Math.min(required, safeNumber(ownedInput.value));
    const duplicate = char.materials.find(mat => mat.name.toLocaleLowerCase() === name.toLocaleLowerCase());
    if (duplicate) {
      window.alert('This material is already listed for ' + char.name + '. Edit its quantities below.');
      return;
    }
    char.materials.push({ id: newId(), name: name.slice(0, 80), required, owned });
    save();
    nameInput.value = '';
    requiredInput.value = '';
    ownedInput.value = '0';
    render();
    nameInput.focus();
  });

  $('materialsList').addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    const row = button && button.closest('[data-material-id]');
    const char = selectedCharacter();
    if (!row || !char) return;
    const mat = char.materials.find(item => item.id === row.dataset.materialId);
    if (!mat) return;

    if (button.dataset.action === 'remove-material') {
      if (!window.confirm('Delete ' + mat.name + '?')) return;
      char.materials = char.materials.filter(item => item.id !== mat.id);
    } else if (button.dataset.action === 'increase') {
      mat.owned = Math.min(mat.required, mat.owned + 1);
    } else if (button.dataset.action === 'decrease') {
      mat.owned = Math.max(0, mat.owned - 1);
    } else return;

    save();
    render();
  });

  $('materialsList').addEventListener('change', event => {
    const input = event.target.closest('input[data-field]');
    const row = input && input.closest('[data-material-id]');
    const char = selectedCharacter();
    if (!input || !row || !char) return;
    const mat = char.materials.find(item => item.id === row.dataset.materialId);
    if (!mat) return;
    if (input.dataset.field === 'required') {
      mat.required = safeNumber(input.value, 1);
      mat.owned = Math.min(mat.required, mat.owned);
    } else {
      mat.owned = Math.min(mat.required, safeNumber(input.value));
    }
    save();
    render();
  });

  render();
  let initialTab = 'primos';
  try { initialTab = localStorage.getItem(TAB_KEY) === 'materials' ? 'materials' : 'primos'; } catch (_) {}
  setTab(initialTab);
})();

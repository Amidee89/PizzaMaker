/**
 * Glassmorphic UI Manager for PizzaMaker 3D.
 * Dynamically builds accordion controls, custom range sliders with live badges,
 * preset buttons, topping manager layers, quick-slice toolbars, and export tools.
 */

import { PARAM_DEFINITIONS, CATEGORIES, AVAILABLE_TOPPINGS } from '../config/parameters.js';
import { PRESETS } from '../config/presets.js';

export function getStepPrecision(step) {
  if (!step || step >= 1) return 0;
  const str = step.toString();
  const decIndex = str.indexOf('.');
  return decIndex >= 0 ? str.length - decIndex - 1 : 0;
}

export function formatValueWithUnit(val, def) {
  if (typeof val !== 'number' || isNaN(val)) {
    return `${val || ''} ${def?.unit || ''}`.trim();
  }
  const precision = getStepPrecision(def?.step || 0.01);
  const formattedNum = Number(val.toFixed(precision)).toString();
  return `${formattedNum} ${def?.unit || ''}`.trim();
}

export class UIManager {
  constructor(app) {
    this.app = app;
    this.sidebarContainer = document.getElementById('controlsSidebar');
    this.presetBarContainer = document.getElementById('presetBar');
    this.sliceToolbar = document.getElementById('sliceQuickToolbar');
    this.toppingLayersContainer = null;
    this.inputElements = new Map();
  }

  init() {
    this.renderPresets();
    this.renderAccordionCategories();
    this.renderSliceQuickBar();
    this.bindHeaderActions();
    this.bindCameraControls();
  }

  renderPresets() {
    if (!this.presetBarContainer) return;
    this.presetBarContainer.innerHTML = '';

    for (const [id, preset] of Object.entries(PRESETS)) {
      const btn = document.createElement('button');
      btn.className = 'preset-btn';
      btn.dataset.presetId = id;
      btn.innerHTML = `<span class="preset-icon">${preset.icon}</span> <span class="preset-name">${preset.name}</span>`;
      btn.addEventListener('click', () => {
        document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.app.presetManager.loadPreset(id);
      });
      this.presetBarContainer.appendChild(btn);
    }
  }

  renderAccordionCategories() {
    if (!this.sidebarContainer) return;
    this.sidebarContainer.innerHTML = '';

    for (const cat of CATEGORIES) {
      const card = document.createElement('div');
      card.className = 'accordion-card';
      card.dataset.categoryId = cat.id;

      // Accordion Header
      const header = document.createElement('div');
      header.className = 'accordion-header';
      header.innerHTML = `
        <div class="acc-title">
          <span class="acc-icon">${cat.icon}</span>
          <span class="acc-name">${cat.name}</span>
        </div>
        <span class="acc-chevron">▾</span>
      `;

      // Accordion Body
      const body = document.createElement('div');
      body.className = 'accordion-body';
      // Open all categories by default so everything is immediately visible and accessible
      card.classList.add('open');

      header.addEventListener('click', () => {
        card.classList.toggle('open');
      });

      // Special content for Toppings Studio
      if (cat.id === 'toppings') {
        this.renderToppingsStudio(body);
      } else {
        // Render parameters matching this category
        for (const [key, def] of Object.entries(PARAM_DEFINITIONS)) {
          if (def.category === cat.id) {
            const row = this.createControlRow(key, def);
            body.appendChild(row);
          }
        }
      }

      card.appendChild(header);
      card.appendChild(body);
      this.sidebarContainer.appendChild(card);
    }
  }

  createControlRow(key, def) {
    const row = document.createElement('div');
    row.className = 'control-row';
    row.dataset.paramKey = key;

    const labelRow = document.createElement('div');
    labelRow.className = 'control-label-row';

    const label = document.createElement('label');
    label.className = 'control-label';
    label.textContent = def.label;
    label.title = def.description || '';
    labelRow.appendChild(label);

    let inputWrapper = document.createElement('div');
    inputWrapper.className = 'input-wrapper';

    const currentValue = this.app.params[key] !== undefined ? this.app.params[key] : def.default;

    if (def.type === 'slider') {
      const valBadge = document.createElement('span');
      valBadge.className = 'value-badge';
      valBadge.textContent = formatValueWithUnit(currentValue, def);
      labelRow.appendChild(valBadge);

      const slider = document.createElement('input');
      slider.type = 'range';
      slider.className = 'range-slider';
      slider.min = def.min;
      slider.max = def.max;
      slider.step = def.step;
      slider.value = currentValue;

      slider.addEventListener('input', (e) => {
        const numVal = parseFloat(e.target.value);
        valBadge.textContent = formatValueWithUnit(numVal, def);
        this.app.updateSingleParameter(key, numVal);

        // Sync visible slices limit if total slices changed
        if (key === 'slice_total') {
          this.syncSliceMaxLimits(numVal);
        }
      });

      this.inputElements.set(key, { input: slider, badge: valBadge, def });
      inputWrapper.appendChild(slider);
    } else if (def.type === 'toggle') {
      const toggleLabel = document.createElement('label');
      toggleLabel.className = 'switch';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = !!currentValue;

      const sliderSpan = document.createElement('span');
      sliderSpan.className = 'slider-round';

      checkbox.addEventListener('change', (e) => {
        this.app.updateSingleParameter(key, e.target.checked);
      });

      toggleLabel.appendChild(checkbox);
      toggleLabel.appendChild(sliderSpan);
      this.inputElements.set(key, { input: checkbox, def });
      inputWrapper.appendChild(toggleLabel);
    } else if (def.type === 'color') {
      const colorPicker = document.createElement('input');
      colorPicker.type = 'color';
      colorPicker.className = 'color-picker';
      colorPicker.value = currentValue;

      colorPicker.addEventListener('input', (e) => {
        this.app.updateSingleParameter(key, e.target.value);
      });

      this.inputElements.set(key, { input: colorPicker, def });
      inputWrapper.appendChild(colorPicker);
    } else if (def.type === 'dropdown') {
      const select = document.createElement('select');
      select.className = 'dropdown-select';

      for (const opt of def.options) {
        const optElem = document.createElement('option');
        optElem.value = opt;
        optElem.textContent = opt;
        if (opt === currentValue) optElem.selected = true;
        select.appendChild(optElem);
      }

      select.addEventListener('change', (e) => {
        this.app.updateSingleParameter(key, e.target.value);
      });

      this.inputElements.set(key, { input: select, def });
      inputWrapper.appendChild(select);
    }

    row.appendChild(labelRow);
    row.appendChild(inputWrapper);
    return row;
  }

  renderToppingsStudio(container) {
    container.innerHTML = '';

    const headerActions = document.createElement('div');
    headerActions.className = 'toppings-header-actions';

    const addBtn = document.createElement('button');
    addBtn.className = 'btn-secondary btn-sm';
    addBtn.innerHTML = `<span>➕ Add Topping Layer</span>`;
    addBtn.addEventListener('click', () => {
      this.app.addToppingLayer('pepperoni', 16, 1.0);
      this.syncToppingsList();
    });

    headerActions.appendChild(addBtn);
    container.appendChild(headerActions);

    this.toppingLayersContainer = document.createElement('div');
    this.toppingLayersContainer.className = 'toppings-layers-list';
    container.appendChild(this.toppingLayersContainer);

    this.syncToppingsList();
  }

  syncToppingsList() {
    if (!this.toppingLayersContainer) return;
    this.toppingLayersContainer.innerHTML = '';

    const toppings = this.app.toppings || [];
    if (toppings.length === 0) {
      this.toppingLayersContainer.innerHTML = '<div class="empty-hint">No active topping layers. Click "Add Topping" above to add some!</div>';
      return;
    }

    toppings.forEach((layer, index) => {
      const row = document.createElement('div');
      row.className = 'topping-layer-card';

      // Type Selector Dropdown
      const select = document.createElement('select');
      select.className = 'dropdown-select topping-type-select';
      for (const t of AVAILABLE_TOPPINGS) {
        const opt = document.createElement('option');
        opt.value = t.id;
        opt.textContent = t.name;
        if (t.id === layer.type) opt.selected = true;
        select.appendChild(opt);
      }
      select.addEventListener('change', (e) => {
        this.app.toppings[index].type = e.target.value;
        this.app.rebuildToppings();
      });

      // Quantity Slider
      const countWrapper = document.createElement('div');
      countWrapper.className = 'topping-slider-group';
      countWrapper.innerHTML = `<label>Count: <span class="badge-count">${Math.round(layer.count)}</span></label>`;
      const countSlider = document.createElement('input');
      countSlider.type = 'range';
      countSlider.min = 0;
      countSlider.max = 60;
      countSlider.value = Math.round(layer.count);
      countSlider.className = 'range-slider';
      countSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        layer.count = val;
        countWrapper.querySelector('.badge-count').textContent = val;
        this.app.rebuildToppings();
      });
      countWrapper.appendChild(countSlider);

      // Scale Slider
      const scaleWrapper = document.createElement('div');
      scaleWrapper.className = 'topping-slider-group';
      const formattedScale = Number(parseFloat(layer.scale || 1.0).toFixed(2));
      scaleWrapper.innerHTML = `<label>Size: <span class="badge-scale">${formattedScale}x</span></label>`;
      const scaleSlider = document.createElement('input');
      scaleSlider.type = 'range';
      scaleSlider.min = 0.5;
      scaleSlider.max = 2.0;
      scaleSlider.step = 0.05;
      scaleSlider.value = layer.scale || 1.0;
      scaleSlider.className = 'range-slider';
      scaleSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        layer.scale = val;
        scaleWrapper.querySelector('.badge-scale').textContent = `${Number(val.toFixed(2))}x`;
        this.app.rebuildToppings();
      });
      scaleWrapper.appendChild(scaleSlider);

      // Remove button
      const removeBtn = document.createElement('button');
      removeBtn.className = 'btn-icon-danger';
      removeBtn.innerHTML = '🗑️';
      removeBtn.title = 'Remove layer';
      removeBtn.addEventListener('click', () => {
        this.app.removeToppingLayer(index);
        this.syncToppingsList();
      });

      const topRow = document.createElement('div');
      topRow.className = 'topping-card-top';
      topRow.appendChild(select);
      topRow.appendChild(removeBtn);

      row.appendChild(topRow);
      row.appendChild(countWrapper);
      row.appendChild(scaleWrapper);
      this.toppingLayersContainer.appendChild(row);
    });
  }

  renderSliceQuickBar() {
    if (!this.sliceToolbar) return;
    this.sliceToolbar.innerHTML = `
      <div class="slice-quick-group">
        <span class="slice-label">Slice Cuts:</span>
        <div class="slice-pills">
          <button class="slice-pill" data-slices="1">1</button>
          <button class="slice-pill" data-slices="2">2</button>
          <button class="slice-pill" data-slices="4">4</button>
          <button class="slice-pill" data-slices="6">6</button>
          <button class="slice-pill active" data-slices="8">8</button>
          <button class="slice-pill" data-slices="12">12</button>
          <button class="slice-pill" data-slices="16">16</button>
        </div>
      </div>
      <div class="slice-slider-quick">
        <label>Visible Slices:</label>
        <input type="range" id="quickVisibleSlices" class="range-slider" min="1" max="8" value="8" />
        <span id="quickVisibleBadge" class="value-badge">8 / 8</span>
      </div>
      <div class="slice-slider-quick">
        <label>Pull Slice:</label>
        <input type="range" id="quickPullOffset" class="range-slider" min="0" max="12" step="0.5" value="0" />
        <span id="quickPullBadge" class="value-badge">0 cm</span>
      </div>
    `;

    this.sliceToolbar.querySelectorAll('.slice-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        this.sliceToolbar.querySelectorAll('.slice-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const numSlices = parseInt(btn.dataset.slices, 10);
        this.app.updateSingleParameter('slice_total', numSlices);
        this.app.updateSingleParameter('slice_visible_count', numSlices);
        this.syncSliceMaxLimits(numSlices);
      });
    });

    const visSlider = document.getElementById('quickVisibleSlices');
    const visBadge = document.getElementById('quickVisibleBadge');
    if (visSlider) {
      visSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        visBadge.textContent = `${val} / ${this.app.params.slice_total || 8}`;
        this.app.updateSingleParameter('slice_visible_count', val);
      });
    }

    const pullSlider = document.getElementById('quickPullOffset');
    const pullBadge = document.getElementById('quickPullBadge');
    if (pullSlider) {
      pullSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        pullBadge.textContent = `${Number(val.toFixed(1))} cm`;
        this.app.updateSingleParameter('slice_pull_offset', val);
      });
    }
  }

  syncSliceMaxLimits(totalSlices) {
    const visSlider = document.getElementById('quickVisibleSlices');
    const visBadge = document.getElementById('quickVisibleBadge');
    if (visSlider) {
      visSlider.max = totalSlices;
      visSlider.value = Math.min(visSlider.value, totalSlices);
      if (visBadge) visBadge.textContent = `${visSlider.value} / ${totalSlices}`;
    }

    // Sync sidebar inputs
    const sidebarTotal = this.inputElements.get('slice_total');
    if (sidebarTotal) {
      sidebarTotal.input.value = totalSlices;
      sidebarTotal.badge.textContent = formatValueWithUnit(totalSlices, sidebarTotal.def);
    }

    const sidebarVisible = this.inputElements.get('slice_visible_count');
    if (sidebarVisible) {
      sidebarVisible.input.max = totalSlices;
      sidebarVisible.input.value = Math.min(sidebarVisible.input.value, totalSlices);
      sidebarVisible.badge.textContent = formatValueWithUnit(sidebarVisible.input.value, sidebarVisible.def);
    }

    const sidebarPullIndex = this.inputElements.get('slice_pull_index');
    if (sidebarPullIndex) {
      sidebarPullIndex.input.max = totalSlices;
    }
  }

  bindHeaderActions() {
    const btnRandom = document.getElementById('btnRandomize');
    if (btnRandom) {
      btnRandom.addEventListener('click', () => {
        this.app.presetManager.randomize();
      });
    }

    const btnSnapshot = document.getElementById('btnSnapshot');
    if (btnSnapshot) {
      btnSnapshot.addEventListener('click', () => {
        this.app.takeSnapshot();
      });
    }

    const btnExport3D = document.getElementById('btnExport3D');
    if (btnExport3D) {
      btnExport3D.addEventListener('click', () => {
        this.app.exportGLTF();
      });
    }

    const btnCopyRecipe = document.getElementById('btnCopyRecipe');
    if (btnCopyRecipe) {
      btnCopyRecipe.addEventListener('click', () => {
        this.app.copyRecipeJSON();
      });
    }

    const btnToggleAll = document.getElementById('btnToggleAllSections');
    if (btnToggleAll) {
      let allExpanded = true;
      btnToggleAll.addEventListener('click', () => {
        allExpanded = !allExpanded;
        document.querySelectorAll('.accordion-card').forEach(c => {
          c.classList.toggle('open', allExpanded);
        });
        btnToggleAll.textContent = allExpanded ? '⊟ Collapse All' : '⊞ Expand All';
      });
    }
  }

  bindCameraControls() {
    const btnHero = document.getElementById('camHero');
    if (btnHero) {
      btnHero.addEventListener('click', () => this.app.setCameraView('hero'));
    }

    const btnTop = document.getElementById('camTop');
    if (btnTop) {
      btnTop.addEventListener('click', () => this.app.setCameraView('top'));
    }

    const btnClose = document.getElementById('camClose');
    if (btnClose) {
      btnClose.addEventListener('click', () => this.app.setCameraView('close'));
    }

    const btnAutoRot = document.getElementById('camAutoRotate');
    if (btnAutoRot) {
      btnAutoRot.addEventListener('click', () => {
        const active = this.app.toggleAutoRotate();
        btnAutoRot.classList.toggle('active', active);
      });
    }
  }

  syncUIValues(params, toppings) {
    for (const [key, val] of Object.entries(params)) {
      const item = this.inputElements.get(key);
      if (!item) continue;

      const { input, badge, def } = item;
      if (def.type === 'slider') {
        input.value = val;
        if (badge) badge.textContent = formatValueWithUnit(val, def);
      } else if (def.type === 'toggle') {
        input.checked = !!val;
      } else if (def.type === 'color' || def.type === 'dropdown') {
        input.value = val;
      }
    }

    // Sync slice quick bar
    if (params.slice_total) {
      this.syncSliceMaxLimits(params.slice_total);
      if (this.sliceToolbar) {
        this.sliceToolbar.querySelectorAll('.slice-pill').forEach(b => {
          b.classList.toggle('active', parseInt(b.dataset.slices, 10) === params.slice_total);
        });
      }
    }

    const quickPull = document.getElementById('quickPullOffset');
    const quickPullBadge = document.getElementById('quickPullBadge');
    if (quickPull && params.slice_pull_offset !== undefined) {
      quickPull.value = params.slice_pull_offset;
      if (quickPullBadge) quickPullBadge.textContent = `${Number(parseFloat(params.slice_pull_offset).toFixed(1))} cm`;
    }

    this.syncToppingsList();
  }
}

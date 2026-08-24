/**
 * Preset Management and Parameter Interpolation / Loading
 */

import { PRESETS } from '../config/presets.js';

function snap(val, step, min, max) {
  if (step === undefined || step === 0) return val;
  const precision = step < 1 ? (step.toString().split('.')[1] || '').length : 0;
  let res = Math.round(val / step) * step;
  if (min !== undefined) res = Math.max(min, res);
  if (max !== undefined) res = Math.min(max, res);
  return Number(res.toFixed(precision));
}

export class PresetManager {
  constructor(app) {
    this.app = app;
  }

  loadPreset(presetId) {
    const preset = PRESETS[presetId];
    if (!preset) return;

    // Apply parameters
    this.app.updateParameters(preset.params, preset.toppings);
    this.app.uiManager.syncUIValues(preset.params, preset.toppings);
  }

  randomize() {
    const sidesOptions = [3, 4, 6, 8, 12, 32];
    const chosenSides = sidesOptions[Math.floor(Math.random() * sidesOptions.length)];
    const crustProfiles = ['Puffy Round', 'Square Focaccia', 'Crisp Tapered', 'Crown Pinched'];
    const containers = ['Rustic Wooden Peel', 'Cardboard Delivery Box', 'White Ceramic Plate', 'Steel Diner Pan'];
    const sauceTypes = ['San Marzano Tomato', 'Basil Pesto', 'White Garlic Cream', 'Smoky BBQ'];
    const seasonTypes = ['Dried Oregano & Thyme', 'Crushed Red Chili Flakes', 'Grated Parmigiano-Reggiano', 'EVOO Olive Oil Drizzle'];

    const randomParams = {
      geo_sides: chosenSides,
      geo_stellation: snap(chosenSides === 8 || chosenSides === 6 ? (Math.random() > 0.5 ? 0.35 : 0) : 0, 0.01, 0, 1),
      geo_radius: snap(26 + Math.random() * 12, 1.0, 15, 50),
      geo_height: snap(5 + Math.random() * 10, 0.5, 2, 35),
      geo_ovalness: snap(Math.random() > 0.7 ? 1.25 : 1.0, 0.05, 1.0, 2.5),
      geo_oval_dir: Math.floor(Math.random() * 180),
      geo_bowl_dome: snap((Math.random() - 0.5) * 0.4, 0.05, -1, 1),
      geo_thick_var_amp: snap(0.05 + Math.random() * 0.2, 0.01, 0, 1),
      geo_thick_var_freq: snap(2.0 + Math.random() * 3.0, 0.1, 1, 8),
      geo_rad_waviness_amp: snap(0.04 + Math.random() * 0.12, 0.01, 0, 1),
      geo_rad_waviness_freq: 3 + Math.floor(Math.random() * 6),
      geo_air_pockets_count: Math.floor(Math.random() * 10),
      geo_air_pockets_size: snap(10 + Math.random() * 10, 1.0, 5, 30),
      geo_donut_hole: snap(Math.random() > 0.85 ? 0.3 : 0.0, 0.01, 0, 0.65),
      geo_dough_color: '#EED8A1',
      geo_dough_roughness: snap(0.7 + Math.random() * 0.25, 0.02, 0.2, 1.0),

      crust_width: snap(14 + Math.random() * 20, 1.0, 5, 50),
      crust_height_ratio: snap(1.5 + Math.random() * 1.5, 0.1, 1.0, 3.5),
      crust_profile: crustProfiles[Math.floor(Math.random() * crustProfiles.length)],
      crust_stuffed: Math.random() > 0.6,
      crust_blisters: Math.floor(Math.random() * 12),
      crust_blister_height: snap(3 + Math.random() * 5, 0.5, 1, 10),

      bake_level: snap(0.5 + Math.random() * 0.4, 0.02, 0, 1),
      bake_char_dough: snap(0.2 + Math.random() * 0.4, 0.02, 0, 1),
      bake_char_crust: snap(0.3 + Math.random() * 0.5, 0.02, 0, 1),
      bake_bottom_browning: snap(0.6 + Math.random() * 0.35, 0.02, 0, 1),
      bake_bottom_char: snap(0.2 + Math.random() * 0.4, 0.02, 0, 1),

      sauce_enabled: true,
      sauce_type: sauceTypes[Math.floor(Math.random() * sauceTypes.length)],
      sauce_margin: snap(10 + Math.random() * 15, 1.0, 2, 40),
      sauce_thickness: snap(1.0 + Math.random() * 1.5, 0.1, 0.5, 4.0),
      sauce_spread_patch: snap(Math.random() * 0.4, 0.02, 0, 1),
      sauce_texture_rough: snap(0.3 + Math.random() * 0.4, 0.02, 0, 1),
      sauce_shininess: snap(0.6 + Math.random() * 0.35, 0.02, 0, 1),

      season_active: Math.random() > 0.2,
      season_type: seasonTypes[Math.floor(Math.random() * seasonTypes.length)],
      season_density: snap(50 + Math.floor(Math.random() * 150), 10, 0, 300),
      season_spread_mode: 'Uniform Scatter',
      season_randomness: 0.5,

      slice_total: chosenSides <= 6 ? chosenSides : (Math.random() > 0.5 ? 8 : 6),
      slice_visible_count: Math.random() > 0.5 ? (chosenSides <= 6 ? chosenSides : 8) : 7,
      slice_pull_offset: Math.random() > 0.4 ? 2.0 : 0.0,
      slice_pull_index: 1,

      prop_container: containers[Math.floor(Math.random() * containers.length)],
      prop_box_stains: snap(0.3 + Math.random() * 0.5, 0.05, 0, 1),
      prop_crumbs: Math.floor(Math.random() * 20),
      fx_steam_intensity: snap(0.2 + Math.random() * 0.5, 0.05, 0, 1)
    };

    // Random toppings
    const toppingTypes = ['pepperoni', 'mozzarella_melt', 'mozzarella_pearls', 'basil', 'mushrooms', 'olives', 'bell_peppers', 'sausage'];
    const numToppingLayers = 1 + Math.floor(Math.random() * 3);
    const chosenToppings = [];

    for (let i = 0; i < numToppingLayers; i++) {
      const type = toppingTypes[Math.floor(Math.random() * toppingTypes.length)];
      if (!chosenToppings.some(t => t.type === type)) {
        chosenToppings.push({
          type,
          count: 8 + Math.floor(Math.random() * 18),
          scale: snap(0.9 + Math.random() * 0.3, 0.05, 0.5, 2.0)
        });
      }
    }

    this.app.updateParameters(randomParams, chosenToppings);
    this.app.uiManager.syncUIValues(randomParams, chosenToppings);
  }
}

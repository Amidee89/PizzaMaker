/**
 * Preset Management and Parameter Interpolation / Loading
 */

import { PRESETS } from '../config/presets.js';
import { AVAILABLE_SEASONINGS } from '../config/parameters.js';

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

    const seasonings = preset.seasonings || [
      { type: 'oregano', density: 80, spreadMode: 'Uniform Scatter', randomness: 0.5 }
    ];

    this.app.updateParameters(preset.params, preset.toppings, seasonings);
    this.app.uiManager.syncUIValues(preset.params, preset.toppings, seasonings);
  }

  randomize() {
    const sidesOptions = [3, 4, 6, 8, 12, 32];
    const chosenSides = sidesOptions[Math.floor(Math.random() * sidesOptions.length)];
    const crustProfiles = ['Puffy Round', 'Square Focaccia', 'Crisp Tapered', 'Crown Pinched'];
    const containers = ['Rustic Wooden Peel', 'Cardboard Delivery Box', 'White Ceramic Plate', 'Steel Diner Pan'];
    const sauceTypes = ['San Marzano Tomato', 'Basil Pesto', 'White Garlic Cream', 'Smoky BBQ', 'Spicy Arrabbiata'];
    const stuffTypes = ['Mozzarella Cheese', 'Cheddar Cream', 'Ricotta & Herb', 'Garlic Butter', 'Spicy Sausage'];

    const randomParams = {
      geo_sides: chosenSides,
      geo_stellation: snap(chosenSides === 8 || chosenSides === 6 ? (Math.random() > 0.5 ? 0.35 : 0) : 0, 0.01, 0, 1),
      geo_radius: snap(26 + Math.random() * 14, 1.0, 15, 50),
      geo_height: snap(5 + Math.random() * 12, 0.5, 2, 35),
      geo_ovalness: snap(Math.random() > 0.7 ? 1.25 : 1.0, 0.05, 1.0, 2.5),
      geo_oval_dir: Math.floor(Math.random() * 180),
      geo_bowl_dome: snap((Math.random() - 0.5) * 1.5, 0.05, -3.0, 3.0),
      geo_thick_var_amp: snap(0.05 + Math.random() * 0.2, 0.01, 0, 1),
      geo_thick_var_freq: snap(2.0 + Math.random() * 3.0, 0.1, 1, 8),
      geo_rad_waviness_amp: snap(0.04 + Math.random() * 0.12, 0.01, 0, 1),
      geo_rad_waviness_freq: 3 + Math.floor(Math.random() * 6),
      geo_air_pockets_count: Math.floor(Math.random() * 18),
      geo_air_pockets_size: snap(10 + Math.random() * 20, 1.0, 5, 45),
      geo_donut_hole: snap(Math.random() > 0.85 ? 0.3 : 0.0, 0.01, 0, 0.65),
      geo_fractal_reps: snap(Math.random() > 0.8 ? Math.floor(Math.random() * 4) : 0, 1, 0, 5),
      geo_fractal_ratio: snap(0.35 + Math.random() * 0.2, 0.05, 0.20, 0.70),
      geo_dough_color: '#EED8A1',
      geo_dough_roughness: snap(0.7 + Math.random() * 0.25, 0.02, 0.2, 1.0),

      crust_width: snap(14 + Math.random() * 20, 1.0, 5, 50),
      crust_height_ratio: snap(1.5 + Math.random() * 1.5, 0.1, 1.0, 3.5),
      crust_profile: crustProfiles[Math.floor(Math.random() * crustProfiles.length)],
      crust_stuffed: Math.random() > 0.5,
      crust_stuff_amount: snap(8 + Math.random() * 16, 0.5, 4, 28),
      crust_stuff_type: stuffTypes[Math.floor(Math.random() * stuffTypes.length)],
      crust_stuff_color: '#FFF3B3',
      crust_blisters: Math.floor(Math.random() * 14),
      crust_blister_height: snap(3 + Math.random() * 6, 0.5, 1, 12),

      bake_level: snap(0.5 + Math.random() * 0.4, 0.02, 0, 1),
      bake_char_dough: snap(0.2 + Math.random() * 0.4, 0.02, 0, 1),
      bake_char_crust: snap(0.3 + Math.random() * 0.5, 0.02, 0, 1),
      bake_bottom_browning: snap(0.6 + Math.random() * 0.35, 0.02, 0, 1),
      bake_bottom_char: snap(0.2 + Math.random() * 0.4, 0.02, 0, 1),

      sauce_enabled: true,
      sauce_type: sauceTypes[Math.floor(Math.random() * sauceTypes.length)],
      sauce_margin: snap(10 + Math.random() * 15, 1.0, 2, 40),
      sauce_thickness: snap(1.0 + Math.random() * 2.0, 0.1, 0.5, 5.0),
      sauce_spread_patch: snap(0.2 + Math.random() * 0.6, 0.02, 0, 1),
      sauce_texture_rough: snap(0.3 + Math.random() * 0.4, 0.02, 0, 1),
      sauce_shininess: snap(0.6 + Math.random() * 0.35, 0.02, 0, 1),

      slice_total: chosenSides <= 6 ? chosenSides : (Math.random() > 0.5 ? 8 : 6),
      slice_visible_count: Math.random() > 0.5 ? (chosenSides <= 6 ? chosenSides : 8) : 7,
      slice_pull_offset: Math.random() > 0.4 ? 2.5 : 0.0,
      slice_pull_index: 1,

      prop_container: containers[Math.floor(Math.random() * containers.length)],
      prop_box_stains: snap(0.3 + Math.random() * 0.5, 0.05, 0, 1),
      prop_crumbs: Math.floor(Math.random() * 50),
      fx_steam_intensity: snap(0.3 + Math.random() * 0.8, 0.05, 0, 2.5)
    };

    // Random toppings
    const toppingTypes = ['pepperoni', 'mozzarella_melt', 'mozzarella_pearls', 'basil', 'mushrooms', 'olives', 'bell_peppers', 'sausage', 'bacon'];
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

    // Random seasonings
    const seasonTypes = ['oregano', 'chili', 'parmigiano', 'evoo', 'garlic_herb', 'black_pepper'];
    const numSeasonLayers = 1 + Math.floor(Math.random() * 2);
    const chosenSeasonings = [];
    for (let i = 0; i < numSeasonLayers; i++) {
      const type = seasonTypes[Math.floor(Math.random() * seasonTypes.length)];
      if (!chosenSeasonings.some(s => s.type === type)) {
        chosenSeasonings.push({
          type,
          density: 40 + Math.floor(Math.random() * 120),
          spreadMode: Math.random() > 0.5 ? 'Uniform Scatter' : 'Spiral Swirl',
          randomness: 0.5
        });
      }
    }

    this.app.updateParameters(randomParams, chosenToppings, chosenSeasonings);
    this.app.uiManager.syncUIValues(randomParams, chosenToppings, chosenSeasonings);
  }
}

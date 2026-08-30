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
    const sidesOptions = [3, 4, 5, 6, 7, 8, 10, 12, 16, 24, 32, 48, 64];
    const chosenSides = sidesOptions[Math.floor(Math.random() * sidesOptions.length)];
    const crustProfiles = ['Puffy Round', 'Square Focaccia', 'Crisp Tapered', 'Crown Pinched'];
    const containers = ['Rustic Wooden Peel', 'Cardboard Delivery Box', 'White Ceramic Plate', 'Steel Diner Pan', 'Oven Wire Rack', 'None (Floating)'];
    const environments = [
      'Commercial Kitchen',
      'Bright Modern Room',
      'Cozy Living Room',
      'House Terrace',
      'Aerial Drone Panorama',
      'Blue Sky & Mountains',
      'Sunset Cloudscape',
      'Golden Sunset Sky',
      'Minimal Dark Void'
    ];
    const sauceTypes = ['San Marzano Tomato', 'Basil Pesto', 'White Garlic Cream', 'Smoky BBQ', 'Spicy Arrabbiata', 'Truffle Cream', 'Custom'];
    const stuffTypes = ['Mozzarella Cheese', 'Cheddar Cream', 'Ricotta & Herb', 'Garlic Butter', 'Spicy Sausage'];

    // Wild dough color palettes (Classic, Whole Wheat, Charcoal, Beetroot, Matcha, Saffron, Extraterrestrial)
    const doughColors = [
      '#EED8A1', '#F0DCAC', '#E8CA92', '#D8B87A', '#C8A878',
      '#242424', '#7D1B28', '#3B5E2B', '#E5A93B', '#5C2D78',
      '#1E2A38', '#E6C280', '#F5E6CC'
    ];
    const chosenDoughColor = doughColors[Math.floor(Math.random() * doughColors.length)];

    // Stellation chance
    const hasStellation = Math.random() > 0.65;
    const stellationVal = hasStellation ? snap(0.15 + Math.random() * 0.65, 0.01, 0, 1) : 0.0;

    // Extreme Bowl / Dome warp
    const extremeWarp = Math.random() > 0.4 ? (Math.random() - 0.5) * 5.0 : (Math.random() - 0.5) * 1.5;

    // Bake level with chance of pure raw (0.0-0.15) or maximum coal (0.95-1.0)
    let bakeVal = 0.5 + (Math.random() - 0.5) * 0.6;
    if (Math.random() < 0.12) bakeVal = 0.98 + Math.random() * 0.02; // coal!
    if (Math.random() < 0.08) bakeVal = Math.random() * 0.15; // raw!
    bakeVal = snap(Math.max(0, Math.min(1.0, bakeVal)), 0.02, 0, 1);

    const sliceCount = chosenSides <= 6 ? chosenSides : [4, 6, 8, 12, 16][Math.floor(Math.random() * 5)];
    const visibleCount = Math.random() > 0.6 ? Math.max(1, sliceCount - Math.floor(Math.random() * 3)) : sliceCount;

    const randomParams = {
      geo_sides: chosenSides,
      geo_stellation: stellationVal,
      geo_radius: snap(18 + Math.random() * 30, 1.0, 15, 50),
      geo_height: snap(2.5 + Math.random() * 28, 0.5, 2, 35),
      geo_ovalness: snap(Math.random() > 0.65 ? 1.0 + Math.random() * 1.2 : 1.0, 0.05, 1.0, 2.5),
      geo_oval_dir: Math.floor(Math.random() * 180),
      geo_bowl_dome: snap(extremeWarp, 0.05, -3.0, 3.0),
      geo_thick_var_amp: snap(Math.random() * 0.65, 0.01, 0, 1),
      geo_thick_var_freq: snap(1.5 + Math.random() * 5.5, 0.1, 1, 8),
      geo_rad_waviness_amp: snap(Math.random() * 0.55, 0.01, 0, 1),
      geo_rad_waviness_freq: 2 + Math.floor(Math.random() * 10),
      geo_air_pockets_count: Math.floor(Math.random() * 35),
      geo_air_pockets_size: snap(8 + Math.random() * 32, 1.0, 5, 45),
      geo_donut_hole: snap(Math.random() > 0.75 ? 0.2 + Math.random() * 0.4 : 0.0, 0.01, 0, 0.65),
      geo_fractal_reps: snap(Math.random() > 0.65 ? Math.floor(Math.random() * 5) : 0, 1, 0, 5),
      geo_fractal_ratio: snap(0.25 + Math.random() * 0.4, 0.05, 0.20, 0.70),
      geo_fractal_angle: Math.floor((Math.random() - 0.5) * 180),
      geo_dough_color: chosenDoughColor,
      geo_dough_roughness: snap(0.4 + Math.random() * 0.55, 0.02, 0.2, 1.0),

      crust_width: snap(8 + Math.random() * 38, 1.0, 5, 50),
      crust_height_ratio: snap(1.1 + Math.random() * 2.2, 0.1, 1.0, 3.5),
      crust_profile: crustProfiles[Math.floor(Math.random() * crustProfiles.length)],
      crust_stuffed: Math.random() > 0.45,
      crust_stuff_amount: snap(6 + Math.random() * 20, 0.5, 4, 28),
      crust_stuff_type: stuffTypes[Math.floor(Math.random() * stuffTypes.length)],
      crust_stuff_color: '#FFF3B3',
      crust_blisters: Math.floor(Math.random() * 20),
      crust_blister_height: snap(2 + Math.random() * 9, 0.5, 1, 12),

      bake_level: bakeVal,
      bake_char_dough: snap(Math.random(), 0.02, 0, 1),
      bake_char_crust: snap(Math.random(), 0.02, 0, 1),
      bake_bottom_browning: snap(Math.random(), 0.02, 0, 1),
      bake_bottom_char: snap(Math.random(), 0.02, 0, 1),

      sauce_enabled: Math.random() > 0.10,
      sauce_type: sauceTypes[Math.floor(Math.random() * sauceTypes.length)],
      sauce_color: '#B52818',
      sauce_margin: snap(4 + Math.random() * 28, 1.0, 2, 40),
      sauce_thickness: snap(0.6 + Math.random() * 3.8, 0.1, 0.5, 5.0),
      sauce_spread_patch: snap(Math.random() * 0.85, 0.02, 0, 1),
      sauce_texture_rough: snap(Math.random() * 0.85, 0.02, 0, 1),
      sauce_shininess: snap(Math.random() * 0.95, 0.02, 0, 1),

      slice_total: sliceCount,
      slice_visible_count: visibleCount,
      slice_pull_offset: Math.random() > 0.5 ? snap(1.5 + Math.random() * 5.0, 0.5, 0, 12) : 0.0,
      slice_pull_index: 1 + Math.floor(Math.random() * visibleCount),

      prop_environment: environments[Math.floor(Math.random() * environments.length)],
      prop_container: containers[Math.floor(Math.random() * containers.length)],
      prop_box_stains: snap(Math.random(), 0.05, 0, 1),
      prop_crumbs: Math.floor(Math.random() * 100),
      prop_box_lid_angle: 45 + Math.floor(Math.random() * 80),
      fx_steam_intensity: snap(Math.random() * 1.8, 0.05, 0, 2.5)
    };

    // Extreme Toppings (0 to 6 layers with wild counts from 2 to 55)
    const toppingPool = [
      'pepperoni', 'mozzarella_melt', 'mozzarella_pearls', 'basil',
      'mushrooms', 'olives', 'bell_peppers', 'red_onions',
      'jalapenos', 'pineapple', 'sausage', 'bacon'
    ];
    // Shuffle pool
    const shuffledToppings = [...toppingPool].sort(() => Math.random() - 0.5);

    // Number of topping layers: 0 to 6
    const numToppingLayers = Math.floor(Math.random() * 7); // 0, 1, 2, 3, 4, 5, or 6
    const chosenToppings = [];

    for (let i = 0; i < numToppingLayers; i++) {
      const type = shuffledToppings[i];
      // Random count with chance of extreme dense topping (40-55) or sparse (4-8)
      let count = 6 + Math.floor(Math.random() * 22);
      if (Math.random() < 0.25) count = 35 + Math.floor(Math.random() * 22); // extreme dense!
      if (Math.random() < 0.15) count = 2 + Math.floor(Math.random() * 4); // micro minimal!

      const scale = snap(0.6 + Math.random() * 1.1, 0.05, 0.5, 2.0);
      chosenToppings.push({ type, count, scale });
    }

    // Extreme Seasonings (0 to 4 layers)
    const seasoningPool = ['oregano', 'chili', 'parmigiano', 'evoo', 'garlic_herb', 'black_pepper'];
    const shuffledSeasonings = [...seasoningPool].sort(() => Math.random() - 0.5);
    const numSeasonLayers = Math.floor(Math.random() * 5); // 0 to 4
    const spreadModes = ['Uniform Scatter', 'Center Heavy', 'Crust Border', 'Spiral Swirl'];
    const chosenSeasonings = [];

    for (let i = 0; i < numSeasonLayers; i++) {
      const type = shuffledSeasonings[i];
      const density = 20 + Math.floor(Math.random() * 240);
      const spreadMode = spreadModes[Math.floor(Math.random() * spreadModes.length)];
      chosenSeasonings.push({ type, density, spreadMode, randomness: 0.5 });
    }

    this.app.updateParameters(randomParams, chosenToppings, chosenSeasonings);
    this.app.uiManager.syncUIValues(randomParams, chosenToppings, chosenSeasonings);
    this.app.showToast('🎲 Synthesized Wild Randomized Pizza!');
  }
}

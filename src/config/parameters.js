/**
 * Configuration of all parameters, categories, sliders, and controls
 * for PizzaMaker 3D.
 */

export const PARAM_DEFINITIONS = {
  // --- Category: Base Geometry & Shape ---
  geo_sides: {
    category: 'shape',
    label: 'Number of Sides',
    type: 'slider',
    min: 3,
    max: 64,
    step: 1,
    default: 32,
    unit: 'sides',
    description: '3 = Triangle, 4 = Square, 6 = Hexagon, 32+ = Circle'
  },
  geo_stellation: {
    category: 'shape',
    label: 'Stellation (Star Points)',
    type: 'slider',
    min: 0.0,
    max: 1.0,
    step: 0.01,
    default: 0.0,
    unit: 'ratio',
    description: 'Inward indentation creating star/flower shapes (Stella di Napoli)'
  },
  geo_radius: {
    category: 'shape',
    label: 'Diameter / Radius',
    type: 'slider',
    min: 15.0,
    max: 50.0,
    step: 1.0,
    default: 30.0,
    unit: 'cm',
    description: 'Nominal outer diameter of the pizza'
  },
  geo_height: {
    category: 'shape',
    label: 'Base Thickness',
    type: 'slider',
    min: 2.0,
    max: 35.0,
    step: 0.5,
    default: 8.0,
    unit: 'mm',
    description: 'Thickness of the central dough floor'
  },
  geo_ovalness: {
    category: 'shape',
    label: 'Ovalness (Aspect Ratio)',
    type: 'slider',
    min: 1.0,
    max: 2.5,
    step: 0.05,
    default: 1.0,
    unit: 'ratio',
    description: 'Elongation factor for Pinsa Romana / oval shapes'
  },
  geo_oval_dir: {
    category: 'shape',
    label: 'Ovalness Direction',
    type: 'slider',
    min: 0,
    max: 180,
    step: 1,
    default: 0,
    unit: '°',
    description: 'Angle of the major elongation axis'
  },
  geo_bowl_dome: {
    category: 'shape',
    label: 'Bowl / Dome Warp',
    type: 'slider',
    min: -3.0,
    max: 3.0,
    step: 0.05,
    default: 0.0,
    unit: 'warp',
    description: 'Negative = Deep dish bowl; Positive = Convex center dome (Extended 3x range)'
  },
  geo_thick_var_amp: {
    category: 'shape',
    label: 'Thickness Variance (Amp)',
    type: 'slider',
    min: 0.0,
    max: 1.0,
    step: 0.01,
    default: 0.15,
    unit: 'amp',
    description: 'Intensity of artisanal height irregularity'
  },
  geo_thick_var_freq: {
    category: 'shape',
    label: 'Thickness Variance (Density)',
    type: 'slider',
    min: 1.0,
    max: 8.0,
    step: 0.1,
    default: 3.0,
    unit: 'freq',
    description: 'Frequency of height surface noise'
  },
  geo_rad_waviness_amp: {
    category: 'shape',
    label: 'Perimeter Waviness (Amp)',
    type: 'slider',
    min: 0.0,
    max: 1.0,
    step: 0.01,
    default: 0.10,
    unit: 'amp',
    description: 'Hand-stretched edge wobble amplitude'
  },
  geo_rad_waviness_freq: {
    category: 'shape',
    label: 'Perimeter Waviness (Lobes)',
    type: 'slider',
    min: 1,
    max: 12,
    step: 1,
    default: 5,
    unit: 'lobes',
    description: 'Number of undulating lobes around rim'
  },
  geo_air_pockets_count: {
    category: 'shape',
    label: 'Dough Air Blisters (Count)',
    type: 'slider',
    min: 0,
    max: 40,
    step: 1,
    default: 6,
    unit: 'pockets',
    description: 'Number of raised baked air blisters on dough and exposed cutaway cavities'
  },
  geo_air_pockets_size: {
    category: 'shape',
    label: 'Dough Air Blisters (Size)',
    type: 'slider',
    min: 5.0,
    max: 45.0,
    step: 1.0,
    default: 18.0,
    unit: 'mm',
    description: 'Radius and prominence of air blisters'
  },
  geo_donut_hole: {
    category: 'shape',
    label: 'Donut Hole Size',
    type: 'slider',
    min: 0.0,
    max: 0.65,
    step: 0.01,
    default: 0.0,
    unit: 'ratio',
    description: '0 = Solid pizza; >0 = Ring/Crown pizza void'
  },
  geo_fractal_reps: {
    category: 'shape',
    label: 'Fractal Repetitions',
    type: 'slider',
    min: 0,
    max: 5,
    step: 1,
    default: 0,
    unit: 'reps',
    description: 'Number of recursive child pizzas budding along the perimeter'
  },
  geo_fractal_ratio: {
    category: 'shape',
    label: 'Fractal Size Ratio',
    type: 'slider',
    min: 0.20,
    max: 0.70,
    step: 0.05,
    default: 0.40,
    unit: 'ratio',
    description: 'Scale ratio of child recursive pizzas'
  },
  geo_fractal_angle: {
    category: 'shape',
    label: 'Fractal Chain Angle',
    type: 'slider',
    min: -180,
    max: 180,
    step: 1,
    default: 0,
    unit: '°',
    description: 'Angle offset between each fractal repetition — 0° = straight line, ±30–60° = classic golden spiral'
  },
  geo_dough_color: {
    category: 'shape',
    label: 'Dough Base Color',
    type: 'color',
    default: '#EED8A1',
    description: 'Color tint of the dough base'
  },
  geo_dough_roughness: {
    category: 'shape',
    label: 'Dough Flour / Roughness',
    type: 'slider',
    min: 0.2,
    max: 1.0,
    step: 0.02,
    default: 0.85,
    unit: 'rough',
    description: 'Matte flour dusting vs oiled sheen'
  },

  // --- Category: Crust (Cornicione) Architecture ---
  crust_width: {
    category: 'crust',
    label: 'Crust Width',
    type: 'slider',
    min: 5.0,
    max: 50.0,
    step: 1.0,
    default: 24.0,
    unit: 'mm',
    description: 'Width of the outer cornicione rim'
  },
  crust_height_ratio: {
    category: 'crust',
    label: 'Crust Height Multiplier',
    type: 'slider',
    min: 1.0,
    max: 3.5,
    step: 0.1,
    default: 2.2,
    unit: 'x',
    description: 'Height of crust relative to base thickness'
  },
  crust_profile: {
    category: 'crust',
    label: 'Edge Profile Roundness',
    type: 'dropdown',
    options: ['Puffy Round', 'Square Focaccia', 'Crisp Tapered', 'Crown Pinched'],
    default: 'Puffy Round',
    description: 'Cross-sectional curve of the outer crust rim'
  },
  crust_stuffed: {
    category: 'crust',
    label: 'Stuffed Crust Enabled',
    type: 'toggle',
    default: false,
    description: 'Adds an internal filling core inside the rim'
  },
  crust_stuff_amount: {
    category: 'crust',
    label: 'Stuffing Core Diameter',
    type: 'slider',
    min: 4.0,
    max: 28.0,
    step: 0.5,
    default: 12.0,
    unit: 'mm',
    description: 'Physical diameter of internal filling tube and cutaway core'
  },
  crust_stuff_type: {
    category: 'crust',
    label: 'Stuffing Filling Type',
    type: 'dropdown',
    options: ['Mozzarella Cheese', 'Cheddar Cream', 'Ricotta & Herb', 'Garlic Butter', 'Spicy Sausage'],
    default: 'Mozzarella Cheese',
    description: 'Material preset and cross-section filling appearance'
  },
  crust_stuff_color: {
    category: 'crust',
    label: 'Stuffing Custom Color',
    type: 'color',
    default: '#FFF3B3',
    description: 'Tint for customized stuffed crust core'
  },
  crust_blisters: {
    category: 'crust',
    label: 'Crust Blister Bubbles',
    type: 'slider',
    min: 0,
    max: 25,
    step: 1,
    default: 8,
    unit: 'count',
    description: 'Puffed air blisters along the crust rim'
  },
  crust_blister_height: {
    category: 'crust',
    label: 'Blister Prominence',
    type: 'slider',
    min: 1.0,
    max: 12.0,
    step: 0.5,
    default: 5.0,
    unit: 'mm',
    description: 'Height displacement of crust blisters'
  },

  // --- Category: Cooking, Baking & Char Dynamics ---
  bake_level: {
    category: 'bake',
    label: 'Bake Degree',
    type: 'slider',
    min: 0.0,
    max: 1.0,
    step: 0.02,
    default: 0.65,
    unit: 'bake',
    description: '0 = Pale raw dough, 0.65 = Golden baked, 1.0 = Well-done woodfired'
  },
  bake_char_dough: {
    category: 'bake',
    label: 'Dough Leopard Spots',
    type: 'slider',
    min: 0.0,
    max: 1.0,
    step: 0.02,
    default: 0.35,
    unit: 'density',
    description: 'Woodfired scorch spots across the center surface'
  },
  bake_char_crust: {
    category: 'bake',
    label: 'Crust Char / Scorch Marks',
    type: 'slider',
    min: 0.0,
    max: 1.0,
    step: 0.02,
    default: 0.55,
    unit: 'density',
    description: 'Intense blistering char along cornicione peaks'
  },
  bake_bottom_browning: {
    category: 'bake',
    label: 'Bottom Under-Bake Gradient',
    type: 'slider',
    min: 0.0,
    max: 1.0,
    step: 0.02,
    default: 0.70,
    unit: 'gradient',
    description: 'Baked coloration and browning on the underside'
  },
  bake_bottom_char: {
    category: 'bake',
    label: 'Oven Stone Scorch Marks',
    type: 'slider',
    min: 0.0,
    max: 1.0,
    step: 0.02,
    default: 0.40,
    unit: 'density',
    description: 'Baking stone contact scorch marks underneath'
  },

  // --- Category: Sauce Layer ---
  sauce_enabled: {
    category: 'sauce',
    label: 'Sauce Layer Active',
    type: 'toggle',
    default: true,
    description: 'Toggles the volumetric sauce layer'
  },
  sauce_type: {
    category: 'sauce',
    label: 'Sauce Preset',
    type: 'dropdown',
    options: ['San Marzano Tomato', 'Spicy Arrabbiata', 'White Garlic Cream', 'Basil Pesto', 'Smoky BBQ', 'Truffle Cream', 'Custom'],
    default: 'San Marzano Tomato',
    description: 'Sauce color, roughness, and texture preset'
  },
  sauce_color: {
    category: 'sauce',
    label: 'Sauce Color Tint',
    type: 'color',
    default: '#B52818',
    description: 'Color tint for the sauce'
  },
  sauce_margin: {
    category: 'sauce',
    label: 'Crust Clearance Margin',
    type: 'slider',
    min: 2.0,
    max: 40.0,
    step: 1.0,
    default: 16.0,
    unit: 'mm',
    description: 'Clearance gap between sauce boundary and crust'
  },
  sauce_thickness: {
    category: 'sauce',
    label: 'Sauce Layer Height',
    type: 'slider',
    min: 0.5,
    max: 5.0,
    step: 0.1,
    default: 1.6,
    unit: 'mm',
    description: 'Physical volumetric thickness and vertical cutaway wall height'
  },
  sauce_spread_patch: {
    category: 'sauce',
    label: 'Spread Swirls & Ladle Ridges',
    type: 'slider',
    min: 0.0,
    max: 1.0,
    step: 0.02,
    default: 0.45,
    unit: 'swirl',
    description: 'Ladle spiral grooves with thin patchy spots exposing dough'
  },
  sauce_texture_rough: {
    category: 'sauce',
    label: 'Sauce Pulp & Seeds',
    type: 'slider',
    min: 0.0,
    max: 1.0,
    step: 0.02,
    default: 0.55,
    unit: 'chunks',
    description: 'Crushed tomato chunks, herbs, and seed bumpiness'
  },
  sauce_shininess: {
    category: 'sauce',
    label: 'Sauce Wetness / Gloss',
    type: 'slider',
    min: 0.0,
    max: 1.0,
    step: 0.02,
    default: 0.80,
    unit: 'gloss',
    description: 'Wet specular sheen of fresh cooked sauce'
  },

  // --- Category: Slicing Engine ---
  slice_total: {
    category: 'slice',
    label: 'Total Slices (N)',
    type: 'slider',
    min: 1,
    max: 16,
    step: 1,
    default: 8,
    unit: 'slices',
    description: 'Number of radial cuts (1 to 16 sectors)'
  },
  slice_visible_count: {
    category: 'slice',
    label: 'Visible Slices (K)',
    type: 'slider',
    min: 1,
    max: 16,
    step: 1,
    default: 8,
    unit: 'slices',
    description: 'Displays first K slices, revealing internal crumb cross-sections'
  },
  slice_pull_offset: {
    category: 'slice',
    label: 'Pull Out Slice (Hero Offset)',
    type: 'slider',
    min: 0.0,
    max: 12.0,
    step: 0.5,
    default: 0.0,
    unit: 'cm',
    description: 'Radially pulls the selected slice outward to inspect cross-section'
  },
  slice_pull_index: {
    category: 'slice',
    label: 'Pulled Slice Number',
    type: 'slider',
    min: 1,
    max: 16,
    step: 1,
    default: 1,
    unit: '#',
    description: 'Which slice index is pulled out'
  },

  // --- Category: Plates, Boxes & Props ---
  prop_environment: {
    category: 'props',
    label: 'Environment & Skybox',
    type: 'dropdown',
    options: [
      'Bright Modern Room',
      'House Terrace',
      'Cozy Living Room',
      'Golden Sunset Sky',
      'Sunset Cloudscape',
      'Blue Sky & Mountains',
      'Aerial Drone Panorama',
      'Commercial Kitchen',
      'Minimal Dark Void'
    ],
    default: 'Bright Modern Room',
    description: '360° panoramic skybox environment'
  },
  prop_container: {
    category: 'props',
    label: 'Plate / Serving Surface',
    type: 'dropdown',
    options: ['Rustic Wooden Peel', 'Cardboard Delivery Box', 'White Ceramic Plate', 'Steel Diner Pan', 'Oven Wire Rack', 'None (Floating)'],
    default: 'Rustic Wooden Peel',
    description: '3D serving surface supporting the pizza'
  },
  prop_box_stains: {
    category: 'props',
    label: 'Grease Stains & Oil Rings',
    type: 'slider',
    min: 0.0,
    max: 1.0,
    step: 0.05,
    default: 0.50,
    unit: 'grease',
    description: 'Translucent oil saturation and grease rings on peel, plate, pan, and box'
  },
  prop_crumbs: {
    category: 'props',
    label: 'Table Crust Crumbs',
    type: 'slider',
    min: 0,
    max: 150,
    step: 1,
    default: 25,
    unit: 'crumbs',
    description: 'Toasted crust crumbs and charred specks scattered around tray'
  },
  fx_steam_intensity: {
    category: 'props',
    label: 'Hot Steam Vapor',
    type: 'slider',
    min: 0.0,
    max: 2.5,
    step: 0.05,
    default: 0.50,
    unit: 'steam',
    description: 'Dense billowing hot thermal steam haze (Extended range)'
  },
  prop_box_lid_angle: {
    category: 'props',
    label: 'Box Lid Open Angle',
    type: 'slider',
    min: 0,
    max: 130,
    step: 1,
    default: 115,
    unit: '°',
    description: 'Opening tilt angle of the cardboard pizza box lid'
  }
};

export const CATEGORIES = [
  { id: 'shape', name: 'Shape & Geometry', icon: '📐' },
  { id: 'crust', name: 'Crust Architecture', icon: '🥖' },
  { id: 'bake', name: 'Bake & Cooking', icon: '🔥' },
  { id: 'sauce', name: 'Sauces & Spreads', icon: '🍅' },
  { id: 'toppings', name: 'Toppings Studio', icon: '🧀' },
  { id: 'seasoning', name: 'Seasonings Studio', icon: '🌿' },
  { id: 'slice', name: 'Slicing & Cuts', icon: '🔪' },
  { id: 'props', name: 'Plates, Box & Steam', icon: '📦' }
];

export const AVAILABLE_TOPPINGS = [
  { id: 'pepperoni', name: 'Pepperoni (Cupped)', defaultCount: 18, color: '#9E2A1C' },
  { id: 'mozzarella_melt', name: 'Melted Mozzarella Pools', defaultCount: 12, color: '#FCEBBD' },
  { id: 'mozzarella_pearls', name: 'Fresh Mozzarella Pearls', defaultCount: 8, color: '#FFFFFF' },
  { id: 'mushrooms', name: 'Sliced Mushrooms', defaultCount: 14, color: '#D4C4B1' },
  { id: 'basil', name: 'Fresh Basil Leaves', defaultCount: 7, color: '#2E8B57' },
  { id: 'olives', name: 'Kalamata Olives (Rings)', defaultCount: 16, color: '#2B1E22' },
  { id: 'bell_peppers', name: 'Green Bell Pepper Strips', defaultCount: 12, color: '#32CD32' },
  { id: 'red_onions', name: 'Red Onion Slivers', defaultCount: 15, color: '#9B30FF' },
  { id: 'jalapenos', name: 'Spicy Jalapeño Rings', defaultCount: 12, color: '#228B22' },
  { id: 'pineapple', name: 'Golden Pineapple Chunks', defaultCount: 14, color: '#FFD700' },
  { id: 'sausage', name: 'Italian Sausage Crumbles', defaultCount: 20, color: '#6E2C1A' },
  { id: 'bacon', name: 'Crispy Bacon Bits', defaultCount: 25, color: '#8B2500' }
];

export const AVAILABLE_SEASONINGS = [
  { id: 'oregano', name: 'Dried Oregano & Thyme', defaultDensity: 120, icon: '🌿' },
  { id: 'chili', name: 'Crushed Red Chili Flakes', defaultDensity: 90, icon: '🌶️' },
  { id: 'parmigiano', name: 'Grated Parmigiano-Reggiano', defaultDensity: 140, icon: '🧀' },
  { id: 'garlic_herb', name: 'Garlic Herb Dust', defaultDensity: 110, icon: '🧄' },
  { id: 'evoo', name: 'EVOO Olive Oil Drizzle', defaultDensity: 60, icon: '🫒' },
  { id: 'black_pepper', name: 'Cracked Black Pepper', defaultDensity: 80, icon: '⚫' }
];

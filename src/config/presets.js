/**
 * Curated Pizza Presets for instant styling
 */

export const PRESETS = {
  neapolitan: {
    id: 'neapolitan',
    name: 'Neapolitan Margherita',
    icon: '🇮🇹',
    description: 'High-hydration blistered cornicione, San Marzano tomato, fresh mozzarella pearls, fresh basil, and wood-fired leopard spotting.',
    params: {
      geo_sides: 32,
      geo_stellation: 0.0,
      geo_radius: 30.0,
      geo_height: 6.0,
      geo_ovalness: 1.0,
      geo_oval_dir: 0,
      geo_bowl_dome: 0.0,
      geo_thick_var_amp: 0.18,
      geo_thick_var_freq: 3.2,
      geo_rad_waviness_amp: 0.12,
      geo_rad_waviness_freq: 5,
      geo_air_pockets_count: 7,
      geo_air_pockets_size: 18.0,
      geo_donut_hole: 0.0,
      geo_fractal_reps: 0,
      geo_fractal_ratio: 0.40,
      geo_dough_color: '#EED8A1',
      geo_dough_roughness: 0.85,

      crust_width: 28.0,
      crust_height_ratio: 2.6,
      crust_profile: 'Puffy Round',
      crust_stuffed: false,
      crust_stuff_amount: 12.0,
      crust_stuff_type: 'Mozzarella Cheese',
      crust_stuff_color: '#FFF3B3',
      crust_blisters: 10,
      crust_blister_height: 6.0,

      bake_level: 0.70,
      bake_char_dough: 0.35,
      bake_char_crust: 0.65,
      bake_bottom_browning: 0.75,
      bake_bottom_char: 0.45,

      sauce_enabled: true,
      sauce_type: 'San Marzano Tomato',
      sauce_color: '#B52818',
      sauce_margin: 20.0,
      sauce_thickness: 1.6,
      sauce_spread_patch: 0.35,
      sauce_texture_rough: 0.55,
      sauce_shininess: 0.80,

      slice_total: 8,
      slice_visible_count: 8,
      slice_pull_offset: 0.0,
      slice_pull_index: 1,

      prop_environment: 'House Terrace',
      prop_container: 'Rustic Wooden Peel',
      prop_box_stains: 0.4,
      prop_crumbs: 20,
      fx_steam_intensity: 0.50
    },
    toppings: [
      { type: 'mozzarella_pearls', count: 9, scale: 1.1 },
      { type: 'basil', count: 8, scale: 1.1 }
    ],
    seasonings: [
      { type: 'evoo', density: 70, spreadMode: 'Spiral Swirl', randomness: 0.4 },
      { type: 'oregano', density: 40, spreadMode: 'Uniform Scatter', randomness: 0.5 }
    ]
  },

  ny_pepperoni: {
    id: 'ny_pepperoni',
    name: 'NY Classic Pepperoni',
    icon: '🗽',
    description: 'Thin, wide, foldable slice with crisp edge, rich mozzarella blanket, and cupped spicy pepperoni with glowing orange grease pools.',
    params: {
      geo_sides: 32,
      geo_stellation: 0.0,
      geo_radius: 40.0,
      geo_height: 5.0,
      geo_ovalness: 1.0,
      geo_oval_dir: 0,
      geo_bowl_dome: -0.10,
      geo_thick_var_amp: 0.08,
      geo_thick_var_freq: 2.5,
      geo_rad_waviness_amp: 0.05,
      geo_rad_waviness_freq: 4,
      geo_air_pockets_count: 5,
      geo_air_pockets_size: 14.0,
      geo_donut_hole: 0.0,
      geo_fractal_reps: 0,
      geo_fractal_ratio: 0.40,
      geo_dough_color: '#F0DCAC',
      geo_dough_roughness: 0.80,

      crust_width: 18.0,
      crust_height_ratio: 1.8,
      crust_profile: 'Crisp Tapered',
      crust_stuffed: false,
      crust_stuff_amount: 12.0,
      crust_stuff_type: 'Mozzarella Cheese',
      crust_stuff_color: '#FFF3B3',
      crust_blisters: 5,
      crust_blister_height: 3.5,

      bake_level: 0.65,
      bake_char_dough: 0.20,
      bake_char_crust: 0.40,
      bake_bottom_browning: 0.85,
      bake_bottom_char: 0.50,

      sauce_enabled: true,
      sauce_type: 'San Marzano Tomato',
      sauce_color: '#A92415',
      sauce_margin: 12.0,
      sauce_thickness: 1.3,
      sauce_spread_patch: 0.25,
      sauce_texture_rough: 0.40,
      sauce_shininess: 0.70,

      slice_total: 8,
      slice_visible_count: 7,
      slice_pull_offset: 3.0,
      slice_pull_index: 1,

      prop_environment: 'Bright Modern Room',
      prop_container: 'Cardboard Delivery Box',
      prop_box_stains: 0.75,
      prop_crumbs: 30,
      fx_steam_intensity: 0.60
    },
    toppings: [
      { type: 'mozzarella_melt', count: 16, scale: 1.0 },
      { type: 'pepperoni', count: 26, scale: 1.05 }
    ],
    seasonings: [
      { type: 'oregano', density: 130, spreadMode: 'Uniform Scatter', randomness: 0.6 },
      { type: 'parmigiano', density: 60, spreadMode: 'Uniform Scatter', randomness: 0.5 }
    ]
  },

  detroit_square: {
    id: 'detroit_square',
    name: 'Detroit Crispy Square',
    icon: '🟦',
    description: 'Thick square focaccia dough with caramelized crispy cheese corners, brick cheese blend, and signature racing stripes of thick red sauce.',
    params: {
      geo_sides: 4,
      geo_stellation: 0.0,
      geo_radius: 28.0,
      geo_height: 22.0,
      geo_ovalness: 1.2,
      geo_oval_dir: 45,
      geo_bowl_dome: 0.0,
      geo_thick_var_amp: 0.10,
      geo_thick_var_freq: 2.0,
      geo_rad_waviness_amp: 0.02,
      geo_rad_waviness_freq: 4,
      geo_air_pockets_count: 4,
      geo_air_pockets_size: 20.0,
      geo_donut_hole: 0.0,
      geo_fractal_reps: 0,
      geo_fractal_ratio: 0.40,
      geo_dough_color: '#E8CA92',
      geo_dough_roughness: 0.75,

      crust_width: 10.0,
      crust_height_ratio: 1.15,
      crust_profile: 'Square Focaccia',
      crust_stuffed: false,
      crust_stuff_amount: 12.0,
      crust_stuff_type: 'Mozzarella Cheese',
      crust_stuff_color: '#FFF3B3',
      crust_blisters: 4,
      crust_blister_height: 3.0,

      bake_level: 0.85,
      bake_char_dough: 0.45,
      bake_char_crust: 0.85,
      bake_bottom_browning: 0.95,
      bake_bottom_char: 0.65,

      sauce_enabled: true,
      sauce_type: 'San Marzano Tomato',
      sauce_color: '#9E1E12',
      sauce_margin: 8.0,
      sauce_thickness: 2.5,
      sauce_spread_patch: 0.55,
      sauce_texture_rough: 0.70,
      sauce_shininess: 0.80,

      slice_total: 4,
      slice_visible_count: 4,
      slice_pull_offset: 0.0,
      slice_pull_index: 1,

      prop_environment: 'Cozy Living Room',
      prop_container: 'Steel Diner Pan',
      prop_box_stains: 0.50,
      prop_crumbs: 18,
      fx_steam_intensity: 0.65
    },
    toppings: [
      { type: 'mozzarella_melt', count: 18, scale: 1.1 },
      { type: 'pepperoni', count: 20, scale: 0.95 },
      { type: 'sausage', count: 16, scale: 1.0 }
    ],
    seasonings: [
      { type: 'parmigiano', density: 160, spreadMode: 'Uniform Scatter', randomness: 0.5 },
      { type: 'oregano', density: 70, spreadMode: 'Uniform Scatter', randomness: 0.4 }
    ]
  },

  chicago_stuffed: {
    id: 'chicago_stuffed',
    name: 'Chicago Stuffed Deep Dish',
    icon: '🥧',
    description: 'High concave dough walls with an oozing mozzarella stuffing core, sweet crushed tomato sauce on top, and hearty sausage crumbles.',
    params: {
      geo_sides: 32,
      geo_stellation: 0.0,
      geo_radius: 28.0,
      geo_height: 28.0,
      geo_ovalness: 1.0,
      geo_oval_dir: 0,
      geo_bowl_dome: -0.85,
      geo_thick_var_amp: 0.12,
      geo_thick_var_freq: 2.0,
      geo_rad_waviness_amp: 0.04,
      geo_rad_waviness_freq: 4,
      geo_air_pockets_count: 3,
      geo_air_pockets_size: 16.0,
      geo_donut_hole: 0.0,
      geo_fractal_reps: 0,
      geo_fractal_ratio: 0.40,
      geo_dough_color: '#EDD399',
      geo_dough_roughness: 0.70,

      crust_width: 20.0,
      crust_height_ratio: 1.3,
      crust_profile: 'Square Focaccia',
      crust_stuffed: true,
      crust_stuff_amount: 18.0,
      crust_stuff_type: 'Mozzarella Cheese',
      crust_stuff_color: '#FFF5B8',
      crust_blisters: 6,
      crust_blister_height: 4.0,

      bake_level: 0.75,
      bake_char_dough: 0.25,
      bake_char_crust: 0.50,
      bake_bottom_browning: 0.90,
      bake_bottom_char: 0.40,

      sauce_enabled: true,
      sauce_type: 'San Marzano Tomato',
      sauce_color: '#B22222',
      sauce_margin: 10.0,
      sauce_thickness: 3.2,
      sauce_spread_patch: 0.20,
      sauce_texture_rough: 0.65,
      sauce_shininess: 0.75,

      slice_total: 6,
      slice_visible_count: 5,
      slice_pull_offset: 3.5,
      slice_pull_index: 1,

      prop_environment: 'Cozy Living Room',
      prop_container: 'Steel Diner Pan',
      prop_box_stains: 0.35,
      prop_crumbs: 25,
      fx_steam_intensity: 0.80
    },
    toppings: [
      { type: 'sausage', count: 24, scale: 1.1 },
      { type: 'mushrooms', count: 12, scale: 1.0 }
    ],
    seasonings: [
      { type: 'parmigiano', density: 180, spreadMode: 'Uniform Scatter', randomness: 0.4 },
      { type: 'black_pepper', density: 60, spreadMode: 'Uniform Scatter', randomness: 0.5 }
    ]
  },

  stella_napoli: {
    id: 'stella_napoli',
    name: 'Stella di Napoli (Star Pizza)',
    icon: '⭐',
    description: 'Eight-pointed artisanal star pizza with ricotta-stuffed crust points, fresh basil, cherry mozzarella pearls, and sliced mushrooms.',
    params: {
      geo_sides: 8,
      geo_stellation: 0.42,
      geo_radius: 32.0,
      geo_height: 7.0,
      geo_ovalness: 1.0,
      geo_oval_dir: 0,
      geo_bowl_dome: 0.10,
      geo_thick_var_amp: 0.15,
      geo_thick_var_freq: 3.0,
      geo_rad_waviness_amp: 0.08,
      geo_rad_waviness_freq: 8,
      geo_air_pockets_count: 8,
      geo_air_pockets_size: 16.0,
      geo_donut_hole: 0.0,
      geo_fractal_reps: 0,
      geo_fractal_ratio: 0.40,
      geo_dough_color: '#EEDAA5',
      geo_dough_roughness: 0.85,

      crust_width: 30.0,
      crust_height_ratio: 2.4,
      crust_profile: 'Crown Pinched',
      crust_stuffed: true,
      crust_stuff_amount: 16.0,
      crust_stuff_type: 'Ricotta & Herb',
      crust_stuff_color: '#FFFFE0',
      crust_blisters: 8,
      crust_blister_height: 5.0,

      bake_level: 0.68,
      bake_char_dough: 0.30,
      bake_char_crust: 0.60,
      bake_bottom_browning: 0.75,
      bake_bottom_char: 0.35,

      sauce_enabled: true,
      sauce_type: 'San Marzano Tomato',
      sauce_color: '#BD281B',
      sauce_margin: 22.0,
      sauce_thickness: 1.5,
      sauce_spread_patch: 0.30,
      sauce_texture_rough: 0.50,
      sauce_shininess: 0.75,

      slice_total: 8,
      slice_visible_count: 8,
      slice_pull_offset: 0.0,
      slice_pull_index: 1,

      prop_environment: 'Golden Sunset Sky',
      prop_container: 'Rustic Wooden Peel',
      prop_box_stains: 0.30,
      prop_crumbs: 15,
      fx_steam_intensity: 0.45
    },
    toppings: [
      { type: 'mozzarella_pearls', count: 10, scale: 1.0 },
      { type: 'basil', count: 8, scale: 1.1 },
      { type: 'mushrooms', count: 12, scale: 0.9 }
    ],
    seasonings: [
      { type: 'evoo', density: 90, spreadMode: 'Center Heavy', randomness: 0.4 },
      { type: 'parmigiano', density: 70, spreadMode: 'Center Heavy', randomness: 0.4 }
    ]
  },

  the_crown_donut: {
    id: 'the_crown_donut',
    name: 'The Crown (Donut Ring)',
    icon: '👑',
    description: 'Hexagonal crown pizza with central open void hole, vibrant basil pesto sauce, kalamata olives, and fresh mozzarella.',
    params: {
      geo_sides: 6,
      geo_stellation: 0.0,
      geo_radius: 32.0,
      geo_height: 8.0,
      geo_ovalness: 1.0,
      geo_oval_dir: 0,
      geo_bowl_dome: 0.0,
      geo_thick_var_amp: 0.12,
      geo_thick_var_freq: 3.0,
      geo_rad_waviness_amp: 0.08,
      geo_rad_waviness_freq: 6,
      geo_air_pockets_count: 5,
      geo_air_pockets_size: 14.0,
      geo_donut_hole: 0.38,
      geo_fractal_reps: 0,
      geo_fractal_ratio: 0.40,
      geo_dough_color: '#EBD49D',
      geo_dough_roughness: 0.85,

      crust_width: 22.0,
      crust_height_ratio: 2.1,
      crust_profile: 'Puffy Round',
      crust_stuffed: false,
      crust_stuff_amount: 12.0,
      crust_stuff_type: 'Mozzarella Cheese',
      crust_stuff_color: '#FFF3B3',
      crust_blisters: 6,
      crust_blister_height: 4.5,

      bake_level: 0.62,
      bake_char_dough: 0.25,
      bake_char_crust: 0.50,
      bake_bottom_browning: 0.70,
      bake_bottom_char: 0.30,

      sauce_enabled: true,
      sauce_type: 'Basil Pesto',
      sauce_color: '#4A7C28',
      sauce_margin: 14.0,
      sauce_thickness: 1.4,
      sauce_spread_patch: 0.25,
      sauce_texture_rough: 0.60,
      sauce_shininess: 0.70,

      slice_total: 6,
      slice_visible_count: 6,
      slice_pull_offset: 0.0,
      slice_pull_index: 1,

      prop_environment: 'House Terrace',
      prop_container: 'White Ceramic Plate',
      prop_box_stains: 0.25,
      prop_crumbs: 12,
      fx_steam_intensity: 0.40
    },
    toppings: [
      { type: 'mozzarella_melt', count: 12, scale: 0.9 },
      { type: 'olives', count: 18, scale: 1.0 },
      { type: 'bell_peppers', count: 10, scale: 0.95 }
    ],
    seasonings: [
      { type: 'parmigiano', density: 110, spreadMode: 'Uniform Scatter', randomness: 0.5 }
    ]
  },

  alien_abduction: {
    id: 'alien_abduction',
    name: 'Alien Abduction (Wacky)',
    icon: '👽',
    description: 'Extraterrestrial triangular pizza with cosmic purple dough, glowing toxic green radioactive sauce, golden pineapples, and spicy jalapeño rings.',
    params: {
      geo_sides: 3,
      geo_stellation: 0.15,
      geo_radius: 34.0,
      geo_height: 10.0,
      geo_ovalness: 1.0,
      geo_oval_dir: 0,
      geo_bowl_dome: 0.30,
      geo_thick_var_amp: 0.25,
      geo_thick_var_freq: 4.0,
      geo_rad_waviness_amp: 0.18,
      geo_rad_waviness_freq: 9,
      geo_air_pockets_count: 12,
      geo_air_pockets_size: 20.0,
      geo_donut_hole: 0.0,
      geo_fractal_reps: 3,
      geo_fractal_ratio: 0.35,
      geo_dough_color: '#5C2D78',
      geo_dough_roughness: 0.70,

      crust_width: 25.0,
      crust_height_ratio: 2.5,
      crust_profile: 'Crown Pinched',
      crust_stuffed: true,
      crust_stuff_amount: 16.0,
      crust_stuff_type: 'Cheddar Cream',
      crust_stuff_color: '#39FF14',
      crust_blisters: 12,
      crust_blister_height: 6.5,

      bake_level: 0.70,
      bake_char_dough: 0.40,
      bake_char_crust: 0.70,
      bake_bottom_browning: 0.80,
      bake_bottom_char: 0.50,

      sauce_enabled: true,
      sauce_type: 'Custom',
      sauce_color: '#39FF14',
      sauce_margin: 16.0,
      sauce_thickness: 1.8,
      sauce_spread_patch: 0.40,
      sauce_texture_rough: 0.45,
      sauce_shininess: 0.95,

      slice_total: 3,
      slice_visible_count: 2,
      slice_pull_offset: 4.0,
      slice_pull_index: 1,

      prop_environment: 'Sunset Cloudscape',
      prop_container: 'None (Floating)',
      prop_box_stains: 0.0,
      prop_crumbs: 0,
      fx_steam_intensity: 0.90
    },
    toppings: [
      { type: 'pineapple', count: 16, scale: 1.1 },
      { type: 'jalapenos', count: 14, scale: 1.05 }
    ],
    seasonings: [
      { type: 'chili', density: 140, spreadMode: 'Uniform Scatter', randomness: 0.7 },
      { type: 'garlic_herb', density: 90, spreadMode: 'Uniform Scatter', randomness: 0.5 }
    ]
  },

  sicilian_sfincione: {
    id: 'sicilian_sfincione',
    name: 'Sicilian Sfincione',
    icon: '🍅',
    description: 'Thick spongy Sicilian focaccia with sweet caramelized tomato onion sauce, oregano, extra virgin olive oil, and toasted breadcrumb topping.',
    params: {
      geo_sides: 4,
      geo_stellation: 0.0,
      geo_radius: 30.0,
      geo_height: 18.0,
      geo_ovalness: 1.25,
      geo_oval_dir: 0,
      geo_bowl_dome: 0.0,
      geo_thick_var_amp: 0.08,
      geo_thick_var_freq: 2.0,
      geo_rad_waviness_amp: 0.03,
      geo_rad_waviness_freq: 4,
      geo_air_pockets_count: 6,
      geo_air_pockets_size: 18.0,
      geo_donut_hole: 0.0,
      geo_fractal_reps: 0,
      geo_fractal_ratio: 0.40,
      geo_dough_color: '#E8CA92',
      geo_dough_roughness: 0.85,

      crust_width: 12.0,
      crust_height_ratio: 1.2,
      crust_profile: 'Square Focaccia',
      crust_stuffed: false,
      crust_stuff_amount: 10.0,
      crust_stuff_type: 'Mozzarella Cheese',
      crust_stuff_color: '#FFF3B3',
      crust_blisters: 4,
      crust_blister_height: 2.8,

      bake_level: 0.72,
      bake_char_dough: 0.30,
      bake_char_crust: 0.55,
      bake_bottom_browning: 0.88,
      bake_bottom_char: 0.45,

      sauce_enabled: true,
      sauce_type: 'San Marzano Tomato',
      sauce_color: '#A92415',
      sauce_margin: 10.0,
      sauce_thickness: 2.2,
      sauce_spread_patch: 0.35,
      sauce_texture_rough: 0.60,
      sauce_shininess: 0.72,

      slice_total: 4,
      slice_visible_count: 4,
      slice_pull_offset: 0.0,
      slice_pull_index: 1,

      prop_environment: 'Cozy Living Room',
      prop_container: 'Steel Diner Pan',
      prop_box_stains: 0.40,
      prop_crumbs: 22,
      fx_steam_intensity: 0.55
    },
    toppings: [
      { type: 'onions', count: 18, scale: 1.0 },
      { type: 'olives', count: 14, scale: 0.95 }
    ],
    seasonings: [
      { type: 'oregano', density: 160, spreadMode: 'Uniform Scatter', randomness: 0.5 },
      { type: 'evoo', density: 80, spreadMode: 'Spiral Swirl', randomness: 0.4 }
    ]
  },

  quattro_formaggi: {
    id: 'quattro_formaggi',
    name: 'Quattro Formaggi Bianco',
    icon: '🧀',
    description: 'White artisan pie with decadent mozzarella melt, gorgonzola crumbles, parmigiano, and rich creamy ricotta swirls with cracked black pepper.',
    params: {
      geo_sides: 32,
      geo_stellation: 0.0,
      geo_radius: 34.0,
      geo_height: 8.0,
      geo_ovalness: 1.0,
      geo_oval_dir: 0,
      geo_bowl_dome: 0.05,
      geo_thick_var_amp: 0.10,
      geo_thick_var_freq: 2.5,
      geo_rad_waviness_amp: 0.06,
      geo_rad_waviness_freq: 6,
      geo_air_pockets_count: 6,
      geo_air_pockets_size: 15.0,
      geo_donut_hole: 0.0,
      geo_fractal_reps: 0,
      geo_fractal_ratio: 0.40,
      geo_dough_color: '#F2E2BA',
      geo_dough_roughness: 0.75,

      crust_width: 22.0,
      crust_height_ratio: 2.0,
      crust_profile: 'Puffy Round',
      crust_stuffed: true,
      crust_stuff_amount: 14.0,
      crust_stuff_type: 'Ricotta & Herb',
      crust_stuff_color: '#FFFFE0',
      crust_blisters: 7,
      crust_blister_height: 4.2,

      bake_level: 0.64,
      bake_char_dough: 0.22,
      bake_char_crust: 0.45,
      bake_bottom_browning: 0.80,
      bake_bottom_char: 0.38,

      sauce_enabled: true,
      sauce_type: 'White Garlic Cream',
      sauce_color: '#F7F3E8',
      sauce_margin: 16.0,
      sauce_thickness: 1.5,
      sauce_spread_patch: 0.25,
      sauce_texture_rough: 0.45,
      sauce_shininess: 0.85,

      slice_total: 8,
      slice_visible_count: 8,
      slice_pull_offset: 0.0,
      slice_pull_index: 1,

      prop_environment: 'Bright Modern Room',
      prop_container: 'Rustic Wooden Peel',
      prop_box_stains: 0.30,
      prop_crumbs: 14,
      fx_steam_intensity: 0.60
    },
    toppings: [
      { type: 'mozzarella_melt', count: 18, scale: 1.05 },
      { type: 'mozzarella_pearls', count: 8, scale: 1.1 }
    ],
    seasonings: [
      { type: 'parmigiano', density: 170, spreadMode: 'Uniform Scatter', randomness: 0.4 },
      { type: 'black_pepper', density: 70, spreadMode: 'Uniform Scatter', randomness: 0.6 }
    ]
  },

  calabrian_fire: {
    id: 'calabrian_fire',
    name: 'Calabrian Hot Honey Fire',
    icon: '🌶️',
    description: 'Blistered crust with fiery tomato sauce, spicy pepperoni, fresh jalapeño rings, chili flakes, parmigiano, and infused hot honey sheen.',
    params: {
      geo_sides: 32,
      geo_stellation: 0.0,
      geo_radius: 36.0,
      geo_height: 7.0,
      geo_ovalness: 1.0,
      geo_oval_dir: 0,
      geo_bowl_dome: 0.0,
      geo_thick_var_amp: 0.12,
      geo_thick_var_freq: 2.8,
      geo_rad_waviness_amp: 0.07,
      geo_rad_waviness_freq: 7,
      geo_air_pockets_count: 7,
      geo_air_pockets_size: 16.0,
      geo_donut_hole: 0.0,
      geo_fractal_reps: 0,
      geo_fractal_ratio: 0.40,
      geo_dough_color: '#EEDAA5',
      geo_dough_roughness: 0.80,

      crust_width: 24.0,
      crust_height_ratio: 2.2,
      crust_profile: 'Crisp Tapered',
      crust_stuffed: false,
      crust_stuff_amount: 12.0,
      crust_stuff_type: 'Mozzarella Cheese',
      crust_stuff_color: '#FFF3B3',
      crust_blisters: 8,
      crust_blister_height: 4.8,

      bake_level: 0.74,
      bake_char_dough: 0.35,
      bake_char_crust: 0.65,
      bake_bottom_browning: 0.88,
      bake_bottom_char: 0.52,

      sauce_enabled: true,
      sauce_type: 'Spicy Arrabbiata',
      sauce_color: '#B52010',
      sauce_margin: 15.0,
      sauce_thickness: 1.6,
      sauce_spread_patch: 0.30,
      sauce_texture_rough: 0.55,
      sauce_shininess: 0.88,

      slice_total: 8,
      slice_visible_count: 7,
      slice_pull_offset: 2.5,
      slice_pull_index: 1,

      prop_environment: 'Golden Sunset Sky',
      prop_container: 'Cardboard Delivery Box',
      prop_box_stains: 0.65,
      prop_crumbs: 26,
      fx_steam_intensity: 0.70
    },
    toppings: [
      { type: 'pepperoni', count: 24, scale: 1.05 },
      { type: 'jalapenos', count: 16, scale: 1.0 },
      { type: 'basil', count: 7, scale: 1.1 }
    ],
    seasonings: [
      { type: 'chili', density: 160, spreadMode: 'Uniform Scatter', randomness: 0.6 },
      { type: 'parmigiano', density: 80, spreadMode: 'Uniform Scatter', randomness: 0.4 }
    ]
  }
};

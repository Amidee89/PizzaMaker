# 🍕 PizzaMaker 3D - Architectural Roadmap & Feature Specification

## 1. Executive Summary & Vision

**PizzaMaker 3D** is an interactive, browser-based 3D pizza synthesizer and customizer built with **HTML5, Vanilla CSS, and JavaScript (Three.js WebGL)**.
Users can manipulate procedural geometric, material, culinary, and baking parameters in real-time via a sleek, responsive glassmorphic control dashboard.

A key technical highlight is the **Parametric Sector-Based Mesh Engine**, allowing the pizza to be cut into any arbitrary number of slices ($N$) with arbitrary visible slices ($K \le N$). When cut, the 3D mesh reveals realistic internal cross-sections (dough crumb structure, hollow air pockets, stuffed crust cores, sauce and cheese strata) rather than an empty hollow shell.

---

## 2. Technical Architecture & Mesh Generation Strategy

### 2.1 The Radial Wedge / Slice-Capped Topology Problem
Standard 3D models with boolean CSG operations in WebGL tend to be slow, create non-manifold geometry, and ruin UV texture mapping. To solve this and allow arbitrary slice count and slice toggles:

1. **Slice-Centric Parametric Sector Generator**:
   - The pizza is mathematically partitioned into $N$ angular wedge geometries: $\theta \in [\theta_k, \theta_{k+1}]$ where $\theta_k = k \cdot \frac{2\pi}{N}$.
   - Each wedge $k$ is constructed as a separate closed 3D `BufferGeometry` (or submesh with distinct material indices).
   - Each slice has 4 primary surface groups:
     - **Top Crust & Dough Surface**: Evaluated using radial height curves $H(r, \theta)$ + Simplex noise displacement.
     - **Bottom Crust Surface**: Evaluated at the oven floor level $y = 0$ with slight thermal warping.
     - **Outer Rim (Cornicione)**: Curved exterior profile bridging top and bottom along the boundary radius $R(\theta)$.
     - **Cut Faces (Left & Right radial cross-sections at $\theta_k$ and $\theta_{k+1}$)**: Solid planar walls bridging top profile to bottom profile, UV-mapped to a specialized interior "baked dough crumb & cross-section" material (including the stuffed crust cross-section core).
     - **Inner Core Wall (if Donut Hole $> 0$)**: Cylindrical/toroidal inner ring.

2. **Cross-Section Interior Material Mapping**:
   - The cut planes at $\theta_k$ expose the interior layers:
     - Bottom base layer (dense crumb)
     - Middle dough layer (alveolated crumb with procedural noise cavities)
     - Crust core (either hollow cavity or stuffed cheese/sauce cylinder cross-section)
     - Surface toppings cross-section profile.

3. **Slice Interaction & Animation**:
   - Slices can be individually shown/hidden.
   - Slices can be translated outwards radially with an "Explode / Pull Slice" slider ($\Delta \vec{r} = d \cdot (\cos \theta_{mid}, 0, \sin \theta_{mid})$) to inspect the cross-section in full 3D.

```
       Slice Wedge Topology:
             Outer Rim (Cornicione)
                  .---''''---.
                /     Crust    \
               /  Top Sauce/Dough \
              /                    \
  Left Cut Face                  Right Cut Face
 (Exposed crumb                 (Exposed crumb
  & cheese core)                 & cheese core)
              \                    /
               \      Origin      /
                \   (or Hole)    /
                  '-----o------'
```

---

## 3. Comprehensive Feature Matrix & Value Boundaries

### Group 1: Base Geometry & Shape

| Feature ID | Parameter / Slider Name | Type | Range (Min - Max) | Step | Default | Unit | Description & Mathematical Behavior |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `geo_sides` | Number of Sides | Slider | $3$ to $64$ | 1 | $32$ | sides | 3 = Triangle, 4 = Square (Detroit style), 5 = Pentagon, 6 = Hexagon, 8 = Octagon, 32-64 = Smooth Circle. Modulates radial formula $R(\theta) = R_0 \cdot \frac{\cos(\pi / n)}{\cos((\theta \pmod{2\pi/n}) - \pi/n)}$. |
| `geo_stellation` | Stellation (Star Points) | Slider | $0.0$ to $1.0$ | 0.01 | $0.0$ | ratio | Inward indentation factor of intermediate vertices, creating star/flower shapes (like Italian Stella pizzas). |
| `geo_height` | Base Thickness / Height | Slider | $2.0$ to $40.0$ | 0.5 | $8.0$ | mm | Thickness of the central dough floor (excluding the crust rim). |
| `geo_radius` | Pizza Diameter / Radius | Slider | $15.0$ to $50.0$ | 1.0 | $30.0$ | cm | Overall nominal outer diameter of the pizza. |
| `geo_ovalness` | Ovalness (Aspect Ratio) | Slider | $1.0$ to $2.5$ | 0.05 | $1.0$ | ratio | Scale ratio of Major axis ($X$) vs Minor axis ($Z$), turning round pizzas into oval/pinsa romana shapes. |
| `geo_oval_dir` | Ovalness Direction | Slider | $0^\circ$ to $180^\circ$ | 1 | $0^\circ$ | deg | Rotation angle of the primary oval elongation axis. |
| `geo_bowl_dome` | Bowl / Dome Curvature | Slider | $-1.0$ to $+1.0$ | 0.05 | $0.0$ | warp | Negative values create a concave Deep Dish/Bowl; positive values create a convex puffy dome in the center. |
| `geo_thick_var_amp` | Thickness Variance (Intensity) | Slider | $0.0$ to $1.0$ | 0.01 | $0.15$ | amp | Amplitude of procedural height irregularity across the dough floor. |
| `geo_thick_var_freq` | Thickness Variance (Density) | Slider | $1.0$ to $10.0$ | 0.1 | $3.0$ | freq | Frequency of the 2D Simplex noise generator controlling thickness variation. |
| `geo_rad_waviness_amp`| Rim Waviness (Intensity) | Slider | $0.0$ to $1.0$ | 0.01 | $0.10$ | amp | Radial displacement perturbation amplitude (hand-stretched wobble). |
| `geo_rad_waviness_freq`| Rim Waviness (Frequency) | Slider | $1$ to $16$ | 1 | $5$ | waves | Number of wavy lobes/folds around the perimeter. |
| `geo_air_pockets_count`| Dough Air Pockets (Count) | Slider | $0$ to $30$ | 1 | $6$ | count | Number of large raised baked air blisters on the flat dough bed. |
| `geo_air_pockets_size` | Dough Air Pockets (Size) | Slider | $5.0$ to $35.0$ | 1.0 | $15.0$ | mm | Radius of Gaussian blister bumps raised on the surface. |
| `geo_donut_hole` | Donut Hole Size | Slider | $0.0$ to $0.7$ | 0.01 | $0.0$ | ratio | Inner void radius ratio relative to total radius ($0.0$ = standard solid pizza, $>0$ = ring/crown pizza). |
| `geo_fractal` | Fractal Edge Fluting | Slider | $0$ to $4$ | 1 | $0$ | iter | Recursive corner self-reflection iterations (fractal snowflake/scalloped border). |
| `geo_dough_color` | Dough Base Color | Color | `#EED8A1` | - | `#EED8A1` | hex | Base raw/baked dough albedo tint. |
| `geo_dough_roughness`| Dough Roughness / Flour | Slider | $0.2$ to $1.0$ | 0.02 | $0.85$ | - | PBR roughness representing matte flour dusting vs oily dough. |

---

### Group 2: Crust (Cornicione) Architecture

| Feature ID | Parameter / Slider Name | Type | Range (Min - Max) | Step | Default | Unit | Description & Mathematical Behavior |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `crust_width` | Crust Width (Thickness) | Slider | $5.0$ to $60.0$ | 1.0 | $25.0$ | mm | Width of the raised outer border measured inwards from the perimeter edge. |
| `crust_height_ratio` | Crust Height Proportion | Slider | $1.0$ to $4.0$ | 0.1 | $2.2$ | ratio | Multiplier of crust height relative to the base dough floor thickness. |
| `crust_profile` | Edge Profile / Roundness | Dropdown | `Puffy Round`, `Square/Focaccia`, `Crisp Tapered`, `Crown Pinched` | - | `Puffy Round` | enum | Mathematical cross-section curve for the outer edge (super-ellipse exponent). |
| `crust_stuffed` | Stuffed Crust Enabled | Toggle | `false` / `true` | - | `false` | bool | Enables an internal cylindrical core inside the outer rim. |
| `crust_stuff_amount` | Stuffed Core Diameter | Slider | $4.0$ to $25.0$ | 0.5 | $12.0$ | mm | Diameter of the stuffing core running through the cornicione. |
| `crust_stuff_type` | Stuffing Filling Type | Dropdown | `Mozzarella Cheese`, `Cheddar`, `Ricotta & Herb`, `Garlic Butter`, `Spicy Sausage` | - | `Mozzarella Cheese` | enum | Sets the material, color, and cross-section texture of the stuffing core. |
| `crust_stuff_color` | Stuffing Custom Color | Color | `#FFF4B8` | - | `#FFF4B8` | hex | Tint for customized cheese/stuffing core. |
| `crust_blisters` | Crust Blister Bubbles | Slider | $0$ to $25$ | 1 | $8$ | count | High-frequency bulging air pockets specific to the cornicione rim. |
| `crust_blister_height`| Blister Prominence | Slider | $1.0$ to $12.0$ | 0.5 | $5.0$ | mm | Height offset of the crust bubble peaks. |

---

### Group 3: Cooking, Baking & Char Dynamics

| Feature ID | Parameter / Slider Name | Type | Range (Min - Max) | Step | Default | Unit | Description & Mathematical Behavior |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `bake_level` | Overall Bake Degree | Slider | $0.0$ to $1.0$ | 0.02 | $0.60$ | norm | Global bake timer: $0.0$ = Pale raw dough, $0.5$ = Golden baked, $0.8$ = Woodfired leopard-spotted, $1.0$ = Well done / charred. |
| `bake_char_dough` | Dough Leopard Spots | Slider | $0.0$ to $1.0$ | 0.02 | $0.35$ | density| High-contrast dark scorch spots generated via thresholded Voronoi noise on the main top face. |
| `bake_char_crust` | Crust Char / Scorch Marks | Slider | $0.0$ to $1.0$ | 0.02 | $0.55$ | density| Wood-fired blister char concentrated along the peaks of crust air pockets. |
| `bake_bottom_browning`| Bottom Under-Bake Gradient | Slider | $0.0$ to $1.0$ | 0.02 | $0.70$ | gradient| Gradient transition from golden brown to deep amber on the base underside. |
| `bake_bottom_char` | Oven Stone Scorch Spots | Slider | $0.0$ to $1.0$ | 0.02 | $0.40$ | density| Dark rectangular/circular stone contact scorch marks on the bottom plane. |

---

### Group 4: Sauce Layer Engine

| Feature ID | Parameter / Slider Name | Type | Range (Min - Max) | Step | Default | Unit | Description & Mathematical Behavior |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `sauce_enabled` | Sauce Layer Active | Toggle | `false` / `true` | - | `true` | bool | Toggles presence of the liquid/spread sauce layer. |
| `sauce_type` | Sauce Preset | Dropdown | `San Marzano Tomato`, `Spicy Arrabbiata`, `White Garlic Cream`, `Basil Pesto`, `Smoky BBQ`, `Truffle Cream`, `Custom` | - | `San Marzano Tomato` | enum | Preconfigured colors, roughness, normal maps, and opacity presets. |
| `sauce_color` | Sauce Base Color | Color | `#B22222` | - | `#B22222` | hex | Primary sauce color tint. |
| `sauce_margin` | Crust Border Clearance | Slider | $2.0$ to $50.0$ | 1.0 | $15.0$ | mm | Distance kept between the outer edge of the sauce and the crest of the crust. |
| `sauce_thickness` | Sauce Layer Depth | Slider | $0.5$ to $5.0$ | 0.1 | $1.5$ | mm | Physical geometric height offset of the sauce plane above the dough. |
| `sauce_spread_patch`| Spread Irregularity / Swirls | Slider | $0.0$ to $1.0$ | 0.02 | $0.25$ | ratio | Simplex noise mask simulating imperfect ladle spiral spreading with patchy spots. |
| `sauce_texture_rough`| Sauce Texture & Chunks | Slider | $0.0$ to $1.0$ | 0.02 | $0.50$ | norm | Normal map intensity simulating crushed tomato pulp, seeds, and oregano flecks. |
| `sauce_shininess` | Sauce Wetness / Gloss | Slider | $0.0$ to $1.0$ | 0.02 | $0.75$ | gloss | Specular wet glossiness (low roughness, subtle clearcoat). |

---

### Group 5: Toppings & Scattering Engine

| Feature ID | Parameter / Slider Name | Type | Range (Min - Max) | Step | Default | Unit | Description & Mathematical Behavior |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `top_layers` | Multi-Topping Manager | Array | Dynamic List | - | Mozzarella + Pepperoni | list | Allows adding/removing distinct topping layers with independent parameters. |
| `top_type` | Topping Ingredient | Dropdown | `Pepperoni (Cupped)`, `Mozzarella Melt Pools`, `Fresh Mozzarella Pearls`, `Sliced Mushrooms`, `Fresh Basil Leaves`, `Kalamata Olives (Hollow)`, `Green Bell Pepper Rings`, `Red Onion Slivers`, `Jalapeño Slices`, `Golden Pineapple Chunks`, `Italian Sausage Crumbles`, `Crispy Bacon Bits`, `Anchovy Fillets`, `Sweetcorn Kernels` | - | `Pepperoni` | enum | Selects 3D procedural mesh generator, procedural textures, and deformation shaders. |
| `top_count` | Topping Quantity | Slider | $0$ to $80$ | 1 | $18$ | pieces | Number of instances distributed via Poisson-disk rejection sampling within the sauced area. |
| `top_scale` | Topping Size Scale | Slider | $0.5$ to $2.0$ | 0.05 | $1.0$ | x | Scaling factor applied to topping 3D meshes. |
| `top_scale_variance`| Size Randomness | Slider | $0.0$ to $0.8$ | 0.05 | $0.2$ | ratio | Random scale variation per topping piece ($\pm \Delta s$). |
| `top_rot_variance` | Rotation Randomness | Slider | $0^\circ$ to $360^\circ$ | 5 | $360^\circ$| deg | Random yaw and slight tilt angle jitter so toppings look naturally scattered. |
| `top_curl_cupping` | Pepperoni Oil / Cupping | Slider | $0.0$ to $1.0$ | 0.05 | $0.6$ | norm | Bends pepperoni disk into a bowl shape with glossy orange grease pool in the center. |
| `top_melt_spread` | Cheese Melt Spread | Slider | $0.0$ to $1.0$ | 0.05 | $0.7$ | norm | For mozzarella: controls how much cheese blurs into a continuous bubbly melted blanket. |

---

### Group 6: Seasoning, Garnishes & Oils

| Feature ID | Parameter / Slider Name | Type | Range (Min - Max) | Step | Default | Unit | Description & Mathematical Behavior |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `season_active` | Seasoning Layer Active | Toggle | `false` / `true` | - | `true` | bool | Toggles micro-garnish scattering. |
| `season_type` | Seasoning Preset | Dropdown | `Dried Oregano & Thyme`, `Crushed Red Chili Flakes`, `Grated Parmigiano-Reggiano`, `Garlic Herb Dust`, `EVOO Olive Oil Drizzle` | - | `Dried Oregano & Thyme` | enum | Micro-particle geometries or decal paths. |
| `season_density` | Seasoning Particle Density | Slider | $0$ to $400$ | 10 | $120$ | count | Number of micro-leaf flakes or cheese granules scattered across surface. |
| `season_spread_mode`| Distribution Mode | Dropdown | `Uniform Scatter`, `Center Heavy`, `Crust Border Drizzle`, `Spiral Drizzle` | - | `Uniform Scatter` | enum | Spatial probability density function for particle distribution. |
| `season_randomness` | Clustering Randomness | Slider | $0.0$ to $1.0$ | 0.05 | $0.5$ | norm | Controls clumpiness/clustering of seasoning flakes. |

---

### Group 7: Slicing, Presentation & Environment Props

| Feature ID | Parameter / Slider Name | Type | Range (Min - Max) | Step | Default | Unit | Description & Mathematical Behavior |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `slice_total` | Total Slice Count ($N$) | Slider | $1$ to $16$ | 1 | $8$ | slices | Number of radial cuts partitioning the pizza into $N$ equal angular sectors. |
| `slice_visible_count`| Visible Slices ($K$) | Slider | $1$ to $N$ | 1 | $8$ | slices | Displays only the first $K$ contiguous slices, exposing internal crumb cross-sections for the missing gap. |
| `slice_select_mode` | Slice Selection Mode | Dropdown | `Contiguous Count`, `Interactive Click-to-Toggle`, `Single Slice Hero` | - | `Contiguous Count` | enum | Lets user click individual 3D slices to hide/eat them or pull them out. |
| `slice_pull_offset` | Pull Out Slice (Hero Offset) | Slider | $0.0$ to $15.0$ | 0.5 | $0.0$ | cm | Radial outward shift distance for a selected slice (creating a classic serving presentation). |
| `slice_cheese_pull` | Cheese Pull Stretches | Slider | $0.0$ to $1.0$ | 0.05 | $0.0$ | norm | Stretchy procedural cheese strings connecting pulled slice to neighboring pizza body. |
| `prop_container` | Plate / Container Choice | Dropdown | `None (Floating)`, `Rustic Wooden Peel`, `Cardboard Delivery Box (Open)`, `White Ceramic Plate`, `Checkerboard Paper Diner Tray`, `Oven Wire Rack` | - | `Rustic Wooden Peel` | enum | 3D prop base supporting the pizza with realistic materials. |
| `prop_box_stains` | Grease Stains & Oil Rings | Slider | $0.0$ to $1.0$ | 0.05 | $0.4$ | norm | Translucent dark oil saturation decal on cardboard/paper under the pizza. |
| `prop_crumbs` | Table Crumbs & Flour Dust | Slider | $0$ to $50$ | 1 | $15$ | count | Small baked crust crumbs scattered around the base plate. |
| `fx_steam_intensity`| Steam / Smoke Particles | Slider | $0.0$ to $1.0$ | 0.05 | $0.35$ | norm | Rising animated GPU/Three.js sprite particle system with turbulent thermal drift. |

---

## 4. UI/UX Layout & Interaction Design

The application will feature a **Dual-Pane Modern Studio**:
1. **Interactive 3D Viewport (Left / Main Canvas)**:
   - Full-bleed Three.js WebGL canvas with high-grade studio lighting (warm key light, cool rim light, soft ambient fill, ground contact shadow via shadow map).
   - Smooth OrbitControls (rotate, zoom, pan) with auto-rotation toggle and cinematic camera reset buttons (Top-Down, 45° Hero View, Macro Cross-Section Close-up).
   - Dynamic cursor hover highlighting on individual pizza slices.
   - Live FPS and polygon counter badge.
2. **Glassmorphic Floating Control Inspector (Right Sidebar)**:
   - Accordion-based categorized toolbars:
     - 📐 **Shape & Crust**
     - 🔥 **Bake & Cooking**
     - 🍅 **Sauces & Spreads**
     - 🧀 **Toppings & Scatter**
     - 🌿 **Seasonings & Oils**
     - 🔪 **Slicing & Presentation**
   - **Preset Quick-Bar**:
     - *Neapolitan Margherita* (Puffy blistered cornicione, fresh basil, mozzarella pools)
     - *New York Pepperoni* (Thin wide fold, dense cupped pepperoni with hot grease)
     - *Detroit Deep Dish* (Square, tall caramelized cheese crust, thick sauce stripes)
     - *Chicago Stuffed Deep Dish* (High bowl walls, stuffed interior, sauce-on-top)
     - *Star of Naples (Stella)* (8-pointed stellation, ricotta-stuffed crust pockets)
     - *Wacky Alien Pizza* (Donut hole, purple dough, glowing green sauce, square slices)
   - **Action Footer**:
     - 🎲 *Randomize Pizza* (Smart randomized sliders that generate fun, valid pizzas)
     - 📸 *Snapshot HD (PNG with transparent/studio background)*
     - 💾 *Export 3D Mesh (.OBJ / .GLTF with textures)*
     - 📋 *Copy Pizza Recipe JSON & Shareable URL*

---

## 5. Phased Implementation Plan

### Phase 1: Engine Foundation & Sector Geometry
- Setup pure modular Vanilla JS + Three.js application structure with clean CSS design tokens.
- Implement the parametric sector generator:
  - $N$-slice radial wedge math.
  - Variable sides (Polygon to Circle interpolation) & Stellation math.
  - Oval deformation & Bowl/Dome vertical displacement.
  - Solid cut-face capping with UV unwrap for interior crumb texture.
- Wire slice count ($N$) and visible slice count ($K$) with radial pull-out offset.

### Phase 2: Crust, Baking & Shader Materials
- Implement cornicione profile generator (round, square, folded) with edge height multipliers.
- Implement stuffed crust internal core (geometry + cut-face rendering).
- Procedural baking shaders:
  - Base dough PBR material (color, roughness, normal map).
  - Vertex/fragment Simplex noise for thickness variance, air blister bumps, and leopard charring spots.
  - Bottom browning gradient and oven stone char texture mapping.

### Phase 3: Sauce Layer & Procedural 3D Toppings
- Parametric sauce mesh conforming to dough floor with border clearance margin and wetness gloss.
- Procedural topping models:
  - Pepperoni disks with cupping vertex deformation and oil pooling.
  - Melted mozzarella blobs & fresh bocconcini pearls.
  - Mushroom slices, basil leaves, olive rings, pepper slivers.
- Poisson-disk scattering algorithm distributing toppings accurately across sector wedges.
- Seasoning micro-particle scatter system (oregano, chili flakes, parmesan dust).

### Phase 4: Slicing Controls, Props & Atmosphere
- Slice click-to-hide and click-to-pull interactions.
- Procedural props: Wooden peel, Cardboard pizza box with lid and grease stain decals, Ceramic plates.
- Animated steam particle emitter using soft additive alpha sprites.
- Lighting presets: Warm Pizzeria Kitchen, Dark Mood Studio, Daylight Patio.

### Phase 5: UI Polish, Presets & Export
- Responsive luxury dark glassmorphism dashboard.
- Preset loader system with smooth parameter tweens.
- Export pipeline: 4K screenshot capture, 3D GLTF export, shareable URL hash encoding.

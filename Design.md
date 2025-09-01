Shape:
    Number of sides
    Stellation
    pizza height
ovalness
ovalness direction
bowl/dome
thickness variance intensity
thickness variance density
radius randomness/wavinessair pockets (can and should also "bump up" the surface)doughnut hole size
fractal (Yes, in that, the shape will self reflect from a side of itself n times. I said it's crazy)
color
texture
Crust:crust thickness crust proportionedge roundness (how squared off it is)
crust stuffing amount
crust stuffing color
radius randomness/waviness
air pockets (can and should also "bump up" the surface)
thickness variancecolortexture

Cooking
char marks dough
char marks crustbottom browningbottom char marks
sauce
sauce texturesauce spread
sauce thickness
sauce shininess
sauce randomnessadd saucetoppingstopping choicetopping quantitytopping sizetopping randomness 
add topping 
seasoningseasoning choice
quantity
randomnessadd seasoning

extra:
show only n slices of the pizzapizza box / plate (size, color, texture, stains)
steam intensity


To scale the PizzaMaker class for all features without collapse, shift from rigid ExtrudeGeometry to a procedural mesh-based system. Use BufferGeometry for the base dough, allowing vertex-level manipulations (e.g., via noise functions for waviness/air pockets). Build layers additively (crust on dough, sauce on top), apply deformations modularly, and handle slices via angular sector generation (avoid post-hoc booleans for performance). Textures/materials for cooking/seasoning/colors; instanced meshes for toppings. This supports fractal recursion via subdivision. Extend PizzaMaker with modular methods.
Base Dough Generation
Start with a 2D polar grid (radial/tangential segments) in XY plane, extruded along Z for height.
Params: number of sides (angular segments = sides * detail multiplier), radius, doughnut hole size (inner radius cutoff).
Generate vertices: For each radial layer, place points at angles 0 to 2π/sides, scaled by radius.
Extrude: Duplicate grid along Z, connect faces for volume. Base height from pizzaHeight.
Why scalable: Vertex array allows easy perturbations (e.g., push for air pockets). For fractal: Recursively subdivide a side's edge, extruding mini-polygons (limit depth to 3-5 for perf; use LOD).
Deformations and Shape Features
Apply these as sequential vertex modifiers on the base dough geometry:
Ovalness & Direction: Scale vertices along a rotated axis (as in current transformPoint, but vectorized for all verts).
Thickness Variance & Bowl/Dome: Offset Z positions per vertex using a heightmap function (e.g., Gaussian for dome, inverted for bowl; add per-vertex random offset for variance).
Radius Randomness/Waviness: Perturb radial distance with Perlin/simplex noise (via three.js Noise module or custom shader). Intensity param controls amplitude.
Air Pockets: Add localized bumps by displacing clusters of vertices upward (use Voronoi partitioning for random pocket placement; scale "bump up" by param).
Fractal: On base polygon edges, recursively add self-similar protrusions (e.g., Koch curve variant: midpoint displace + extrude). Param: iteration depth.
Integrate: Chain methods like applyOvalness() -> applyWaviness() -> applyAirPockets(). Recompute normals after each for lighting.
Crust Integration
Generate as a separate BufferGeometry, but derived from dough's outer edge.
Extract outer loop verts from dough, offset outward by crustProportion * radius.
Extrude along Z by crustThickness (taller than dough for "rise").
Features:
Edge Roundness: Bevel edges with Catmull-Rom smoothing or subdivision modifier.
Stuffing: Inflate inner crust volume (add inner shell geometry, colored separately).
Randomness/Waviness/Air Pockets/Thickness Variance: Apply same deformation functions as dough, but with independent params.
Merge with dough if perf allows (single mesh with material groups); else keep separate but align transforms.
Scalability: Crust inherits dough's base shape (e.g., fractal propagates), avoiding duplication.
Slicing Mechanism
During generation, limit angular span to (numSlices / maxSlices) * 2π (e.g., maxSlices=8).
Generate only verts/faces within the sector; add side faces for clean cuts (triangulate radial edges).
For partial slices, clip inner geometry accordingly (no hole for full pizza).
Handles all layers (dough, crust, sauce) uniformly by passing slice params to each generator.
Extra: For "show only n slices," generate multiple sectors, positioned in scene (e.g., arranged in box).
Sauce Layer
Create as thin BufferGeometry conforming to dough's top surface.
Copy dough's top verts, offset up by sauceThickness.
Spread & Randomness: Erode edges with noise (remove verts beyond threshold); perturb for blotchiness.
Texture/Shininess: Use MeshPhongMaterial with procedural noise map (for speckles), specular param for shine.
Add as child mesh to dough for alignment. Multiple sauces? Stack layers.
Toppings and Seasoning
Toppings: Load/use primitive 3D models (e.g., spheres for pepperoni, loaded GLTF for complex). Instance them via InstancedMesh for efficiency.
Placement: Raycast onto dough/sauce surface; scatter randomly (quantity, size variance) within bounds, avoiding crust.
Params: Choice (model type), quantity, size scale, randomness (Poisson disk sampling for even distribution).
Seasoning: ParticleSystem or small instanced meshes (e.g., tiny cubes/spheres for herbs).
Scatter similarly, but denser; color/texture per choice.
"Add" buttons: Dynamically append new topping/seasoning groups to scene.
Cooking Effects, Colors, and Textures
Use materials with procedural textures (no external loads for simplicity; generate via CanvasTexture).
Char Marks/Browning: Noise-based albedo map (darken areas); normal map for bumpiness. Separate for top/bottom (flip UVs for bottom).
Colors: Vertex colors for gradients (e.g., browner crust edges); or multi-material.
Textures: Apply UV-mapped noise for dough/sauce/crust (e.g., fibrous for dough, glossy for sauce).
Bottom effects: Make base visible via transparency or separate bottom mesh.
Extra Features
Pizza Box/Plate: Add as PlaneGeometry or BoxGeometry child, scaled to fit. Procedural stains via texture noise; params for size/color/texture.
Steam: ParticleSystem with upward-moving, fading billboards (texture: soft cloud). Intensity controls emitter rate/lifetime.
Integrate into scene hierarchy: Group all (pizza + box + steam) under a root object for transforms.
Implementation Extensions
Class Structure: Extend PizzaMaker with getters/setters for all params; regenerate on change via updatePizza() chaining all generators.
Controls: Add sliders/groups to HTML (e.g., sections for Shape/Crust/Sauce). Use dat.GUI for prototyping.
Performance: Use mergeGeometries where possible; compute once per update. For fractal/heavy noise, add detail levels.
Libraries: Stick to Three.js core + OrbitControls; add SimplexNoise.js if needed (inline or assume available). This approach keeps code modular (e.g., separate files for deformations), avoiding monolithic createPizza(). Total features fit without collapse, as most boil down to vertex ops or instancing.
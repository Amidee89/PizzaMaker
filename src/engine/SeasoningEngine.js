/**
 * Micro-Particle Garnish and Seasoning Engine.
 * Supports stackable multiple seasoning layers (Oregano, Chili flakes, Parmigiano,
 * Garlic herb dust, EVOO drizzle, Black pepper) with InstancedMesh rendering
 * for maximum rendering performance and low CPU overhead.
 */

import * as THREE from 'three';

export class SeasoningEngine {
  constructor(pizzaGenerator) {
    this.pizzaGenerator = pizzaGenerator;
    this.materials = this.initMaterials();
    this.dummy = new THREE.Object3D();
  }

  initMaterials(params = {}) {
    const bake = params.bake_level !== undefined ? params.bake_level : 0.65;
    const coalProgress = Math.max(0, (bake - 0.75) / 0.25);

    const makeMat = (hex, rough, metal = 0.0) => {
      const col = new THREE.Color(hex);
      if (coalProgress > 0) col.lerp(new THREE.Color(0x181514), coalProgress);
      return new THREE.MeshStandardMaterial({
        color: col,
        roughness: coalProgress > 0.8 ? 0.95 : rough,
        metalness: coalProgress > 0.8 ? 0.0 : metal,
        side: THREE.DoubleSide
      });
    };

    const oreganoColor = new THREE.Color(0x2E4A1E);
    if (coalProgress > 0) oreganoColor.lerp(new THREE.Color(0x151614), coalProgress);

    const evooColor = new THREE.Color(0x9ACD32);
    if (coalProgress > 0) evooColor.lerp(new THREE.Color(0x1A1614), coalProgress);

    return {
      oregano: new THREE.MeshBasicMaterial({ color: oreganoColor, side: THREE.DoubleSide }),
      chili: makeMat(0xC41E1E, 0.3, 0.1),
      chiliSeed: makeMat(0xE8D072, 0.4),
      parmigiano: makeMat(0xFFF8DC, 0.75),
      garlicHerb: makeMat(0xEDE2C8, 0.85),
      blackPepper: makeMat(0x1A1A1A, 0.9),
      evoo: new THREE.MeshStandardMaterial({
        color: evooColor,
        roughness: coalProgress > 0.8 ? 0.9 : 0.08,
        metalness: 0.15,
        transparent: true,
        opacity: coalProgress > 0.8 ? 0.3 : 0.88
      })
    };
  }

  getGeomForType(type) {
    switch (type) {
      case 'chili':
        return new THREE.PlaneGeometry(0.022, 0.016);
      case 'parmigiano':
        return new THREE.DodecahedronGeometry(0.009, 0);
      case 'garlic_herb':
        return new THREE.DodecahedronGeometry(0.007, 0);
      case 'black_pepper':
        return new THREE.DodecahedronGeometry(0.008, 0);
      case 'evoo': {
        const g = new THREE.SphereGeometry(0.018, 8, 8);
        g.scale(1.2, 0.35, 1.2);
        return g;
      }
      case 'oregano':
      default:
        return new THREE.PlaneGeometry(0.018, 0.010);
    }
  }

  getMaterialForType(type) {
    switch (type) {
      case 'chili':
        return this.materials.chili;
      case 'parmigiano':
        return this.materials.parmigiano;
      case 'garlic_herb':
        return this.materials.garlicHerb;
      case 'black_pepper':
        return this.materials.blackPepper;
      case 'evoo':
        return this.materials.evoo;
      case 'oregano':
      default:
        return this.materials.oregano;
    }
  }

  scatterSeasonings(seasoningsList, params) {
    const slices = this.pizzaGenerator.slices;
    if (!slices || slices.length === 0) return;

    this.materials = this.initMaterials(params);

    // Handle single or multi-layer array
    const layers = Array.isArray(seasoningsList) ? seasoningsList : [];
    if (layers.length === 0 && params.season_active && params.season_density > 0) {
      layers.push({
        type: params.season_type || 'oregano',
        density: params.season_density || 100,
        spreadMode: params.season_spread_mode || 'Uniform Scatter',
        randomness: params.season_randomness || 0.5
      });
    }

    // Group slices by fractal level
    const levelMap = new Map();
    for (const slice of slices) {
      const lvl = slice.level !== undefined ? slice.level : 0;
      if (!levelMap.has(lvl)) levelMap.set(lvl, []);
      levelMap.get(lvl).push(slice);
    }

    const baseRadius = (params.geo_radius || 30.0) * 0.05;
    const donutHole = params.geo_donut_hole || 0.0;
    const innerR = donutHole > 0.01 ? baseRadius * donutHole : 0.0;

    for (const [level, levelSlices] of levelMap.entries()) {
      // Get scale from the first slice of this level for fractal density scaling
      const refSlice = levelSlices[0];
      const levelScale = refSlice.scale || 1.0;

      for (const layer of layers) {
        const type = layer.type || 'oregano';
        const baseDensity = Math.min(300, Math.max(0, Math.round(layer.density !== undefined ? layer.density : 100)));
        if (baseDensity <= 0) continue;

        // Scale density for fractal children — fewer particles on smaller pizzas
        const density = level === 0 ? baseDensity : Math.max(1, Math.round(baseDensity * levelScale * levelScale));

        const spreadMode = layer.spreadMode || 'Uniform Scatter';
        const randomness = layer.randomness !== undefined ? layer.randomness : 0.5;

        const geom = this.getGeomForType(type);
        const mat = this.getMaterialForType(type);

        const perSliceInstances = Array.from({ length: levelSlices.length }, () => []);

        for (let i = 0; i < density; i++) {
          let angle = (i * 137.5 * Math.PI) / 180;
          let normR = Math.sqrt((i + 0.5) / density);

          if (spreadMode === 'Center Heavy') {
            normR = Math.pow(normR, 1.8) * 0.7;
          } else if (spreadMode === 'Crust Border') {
            normR = 0.75 + normR * 0.22;
          } else if (spreadMode === 'Spiral Swirl') {
            angle = (i * 0.12) * Math.PI * 2;
            normR = (i / density) * 0.85;
          }

          if (randomness > 0.01) {
            angle += ((i % 7) - 3) * 0.04 * randomness;
            normR = Math.max(0.05, Math.min(0.95, normR + ((i % 5) - 2) * 0.03 * randomness));
          }

          const normAngle = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
          const outerR = this.pizzaGenerator.computeRadiusAtAngle(normAngle, params);
          const r = innerR + normR * (outerR - innerR);

          const x = r * Math.cos(normAngle);
          const z = r * Math.sin(normAngle);

          const { yTop } = this.pizzaGenerator.computeSurfaceProfile(r, normAngle, outerR, innerR, params);

          let sliceIndex = 0;
          for (let s = 0; s < levelSlices.length; s++) {
            if (normAngle >= levelSlices[s].angleStart && normAngle < levelSlices[s].angleEnd) {
              sliceIndex = s;
              break;
            }
          }

          perSliceInstances[sliceIndex].push({
            x,
            y: yTop + 0.003,
            z,
            rotX: ((i * 13) % 360) * (Math.PI / 180),
            rotY: ((i * 37) % 360) * (Math.PI / 180),
            rotZ: ((i * 59) % 360) * (Math.PI / 180)
          });
        }

        // Build InstancedMesh for each slice in this level
        for (let s = 0; s < levelSlices.length; s++) {
          const instList = perSliceInstances[s];
          if (instList.length === 0) continue;

          const instMesh = new THREE.InstancedMesh(geom, mat, instList.length);
          instMesh.castShadow = false;
          instMesh.receiveShadow = false;

          for (let j = 0; j < instList.length; j++) {
            const item = instList[j];
            this.dummy.position.set(item.x, item.y, item.z);
            this.dummy.rotation.set(item.rotX, item.rotY, item.rotZ);
            this.dummy.updateMatrix();
            instMesh.setMatrixAt(j, this.dummy.matrix);
          }
          instMesh.instanceMatrix.needsUpdate = true;

          levelSlices[s].toppingsGroup.add(instMesh);
        }
      }
    }
  }
}

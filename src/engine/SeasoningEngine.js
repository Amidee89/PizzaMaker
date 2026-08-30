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

  initMaterials() {
    return {
      oregano: new THREE.MeshBasicMaterial({ color: 0x2E4A1E, side: THREE.DoubleSide }),
      chili: new THREE.MeshStandardMaterial({ color: 0xC41E1E, roughness: 0.3, metalness: 0.1, side: THREE.DoubleSide }),
      chiliSeed: new THREE.MeshStandardMaterial({ color: 0xE8D072, roughness: 0.4 }),
      parmigiano: new THREE.MeshStandardMaterial({ color: 0xFFF8DC, roughness: 0.75 }),
      garlicHerb: new THREE.MeshStandardMaterial({ color: 0xEDE2C8, roughness: 0.85 }),
      blackPepper: new THREE.MeshStandardMaterial({ color: 0x1A1A1A, roughness: 0.9 }),
      evoo: new THREE.MeshStandardMaterial({
        color: 0x9ACD32,
        roughness: 0.08,
        metalness: 0.15,
        transparent: true,
        opacity: 0.88
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

    const baseRadius = (params.geo_radius || 30.0) * 0.05;
    const donutHole = params.geo_donut_hole || 0.0;
    const innerR = donutHole > 0.01 ? baseRadius * donutHole : 0.0;

    for (const layer of layers) {
      const type = layer.type || 'oregano';
      const density = Math.min(300, Math.max(0, Math.round(layer.density !== undefined ? layer.density : 100)));
      if (density <= 0) continue;

      const spreadMode = layer.spreadMode || 'Uniform Scatter';
      const randomness = layer.randomness !== undefined ? layer.randomness : 0.5;

      const geom = this.getGeomForType(type);
      const mat = this.getMaterialForType(type);

      // Distribute instances per slice to maintain sector clipping on pull
      const perSliceInstances = Array.from({ length: slices.length }, () => []);

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
        for (let s = 0; s < slices.length; s++) {
          if (normAngle >= slices[s].angleStart && normAngle < slices[s].angleEnd) {
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

      // Build InstancedMesh for each slice
      for (let s = 0; s < slices.length; s++) {
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

        slices[s].toppingsGroup.add(instMesh);
      }
    }
  }
}

/**
 * Micro-Particle Garnish and Seasoning Engine.
 * Scatters dried oregano, chili flakes, grated parmesan dust, and EVOO drizzle ribbons.
 */

import * as THREE from 'three';

export class SeasoningEngine {
  constructor(pizzaGenerator) {
    this.pizzaGenerator = pizzaGenerator;
    this.materials = this.initMaterials();
  }

  initMaterials() {
    return {
      oregano: new THREE.MeshBasicMaterial({ color: 0x2E4A1E, side: THREE.DoubleSide }),
      chili: new THREE.MeshStandardMaterial({ color: 0xC41E1E, roughness: 0.3, metalness: 0.1 }),
      chiliSeed: new THREE.MeshStandardMaterial({ color: 0xE8D072, roughness: 0.4 }),
      parmesan: new THREE.MeshStandardMaterial({ color: 0xFFF8DC, roughness: 0.7 }),
      evoo: new THREE.MeshStandardMaterial({
        color: 0x9ACD32,
        roughness: 0.1,
        metalness: 0.1,
        transparent: true,
        opacity: 0.85
      })
    };
  }

  scatterSeasonings(params) {
    const slices = this.pizzaGenerator.slices;
    if (!slices || slices.length === 0) return;

    if (!params.season_active || !params.season_density || params.season_density <= 0) return;

    const type = params.season_type || 'Dried Oregano & Thyme';
    const density = Math.min(300, params.season_density);
    const spreadMode = params.season_spread_mode || 'Uniform Scatter';
    const randomness = params.season_randomness !== undefined ? params.season_randomness : 0.5;

    const baseRadius = (params.geo_radius || 30.0) * 0.05;
    const donutHole = params.geo_donut_hole || 0.0;
    const innerR = donutHole > 0.01 ? baseRadius * donutHole : 0.0;

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

      // Add clustering jitter
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

      // Find owning slice
      let targetSlice = null;
      for (const slice of slices) {
        if (normAngle >= slice.angleStart && normAngle < slice.angleEnd) {
          targetSlice = slice;
          break;
        }
      }
      if (!targetSlice) targetSlice = slices[0];

      // Spawn particle mesh
      const particle = this.createParticleMesh(type, i);
      particle.position.set(x, yTop + 0.003, z);
      particle.rotation.set(
        ((i * 13) % 360) * (Math.PI / 180),
        ((i * 37) % 360) * (Math.PI / 180),
        ((i * 59) % 360) * (Math.PI / 180)
      );

      targetSlice.toppingsGroup.add(particle);
    }
  }

  createParticleMesh(type, index) {
    if (type === 'Crushed Red Chili Flakes') {
      if (index % 6 === 0) {
        // Yellow seed
        const geom = new THREE.SphereGeometry(0.012, 6, 6);
        geom.scale(1.0, 0.4, 0.7);
        return new THREE.Mesh(geom, this.materials.chiliSeed);
      } else {
        // Red flake
        const geom = new THREE.PlaneGeometry(0.022, 0.016);
        return new THREE.Mesh(geom, this.materials.chili);
      }
    } else if (type === 'Grated Parmigiano-Reggiano') {
      const size = 0.008 + (index % 3) * 0.004;
      const geom = new THREE.DodecahedronGeometry(size, 0);
      return new THREE.Mesh(geom, this.materials.parmesan);
    } else if (type === 'EVOO Olive Oil Drizzle') {
      const geom = new THREE.SphereGeometry(0.018, 8, 8);
      geom.scale(1.2, 0.4, 1.2);
      return new THREE.Mesh(geom, this.materials.evoo);
    } else {
      // Default: Dried Oregano & Thyme
      const geom = new THREE.PlaneGeometry(0.018, 0.010);
      return new THREE.Mesh(geom, this.materials.oregano);
    }
  }
}

/**
 * Core Parametric Sector-Based 3D Pizza Generator.
 * Constructs watertight, topologically closed slices with internal crumb cross-sections,
 * multi-sided polygon interpolation, stellation, ovalness, triple dome/bowl warping,
 * air blister pockets, volumetric sauce with vertical cut walls, stuffed crust cores,
 * and recursive fractal pizza satellite generation.
 */

import * as THREE from 'three';
import { SimplexNoise, defaultNoise } from '../utils/simplex-noise.js';

export class PizzaGenerator {
  constructor(materialManager) {
    this.materialManager = materialManager;
    this.noise = defaultNoise;
    this.slices = [];
    this.rootGroup = new THREE.Group();
    this.rootGroup.name = 'PizzaRoot';

    this.doughBlisters = [];
    this.crustBlisters = [];
    this.generateBlisterSeeds();
  }

  generateBlisterSeeds() {
    this.doughBlisters = [];
    for (let i = 0; i < 40; i++) {
      const angle = (i * 137.5 * Math.PI) / 180;
      const radiusNorm = 0.15 + (i % 8) * 0.08;
      this.doughBlisters.push({
        angle,
        radiusNorm,
        size: 0.15 + (i % 5) * 0.04,
        height: 0.08 + (i % 4) * 0.03
      });
    }

    this.crustBlisters = [];
    for (let i = 0; i < 25; i++) {
      const angle = (i * 2 * Math.PI) / 25 + ((i % 3) - 1) * 0.08;
      this.crustBlisters.push({
        angle,
        size: 0.12 + (i % 4) * 0.03,
        height: 0.08 + (i % 3) * 0.04
      });
    }
  }

  computeRadiusAtAngle(theta, params) {
    const baseRadius = (params.geo_radius || 30.0) * 0.05;
    const sides = Math.max(3, Math.round(params.geo_sides || 32));
    const stellation = params.geo_stellation || 0.0;
    const ovalness = params.geo_ovalness || 1.0;
    const ovalDir = ((params.geo_oval_dir || 0) * Math.PI) / 180;
    const wavinessAmp = params.geo_rad_waviness_amp || 0.0;
    const wavinessFreq = params.geo_rad_waviness_freq || 5;

    let r = baseRadius;

    // 1. Polygon Sides Formulation
    if (sides < 32) {
      const sectorAngle = (2 * Math.PI) / sides;
      let phi = ((theta % sectorAngle) + sectorAngle) % sectorAngle;
      if (phi > sectorAngle / 2) phi -= sectorAngle;
      const polyR = baseRadius * (Math.cos(Math.PI / sides) / Math.cos(phi));
      r = polyR;
    }

    // 2. Stellation (Star points)
    if (stellation > 0.001) {
      const starFrequency = sides >= 32 ? 8 : sides;
      const starWave = Math.pow(Math.abs(Math.sin((starFrequency * theta) / 2)), 1.4);
      const starFactor = 1.0 - stellation * 0.48 * starWave;
      r *= starFactor;
    }

    // 3. Ovalness
    if (ovalness > 1.001) {
      const rotTheta = theta - ovalDir;
      const xRatio = Math.sqrt(ovalness);
      const zRatio = 1.0 / Math.sqrt(ovalness);
      const cosT = Math.cos(rotTheta);
      const sinT = Math.sin(rotTheta);
      const ovalFactor = Math.sqrt((xRatio * cosT) ** 2 + (zRatio * sinT) ** 2);
      r *= ovalFactor;
    }

    // 4. Artisanal Rim Waviness
    if (wavinessAmp > 0.001) {
      const wave = Math.sin(theta * wavinessFreq) * wavinessAmp * 0.08 * baseRadius;
      const noisePerturb = this.noise.noise2D(Math.cos(theta) * 2.0, Math.sin(theta) * 2.0) * wavinessAmp * 0.05 * baseRadius;
      r += wave + noisePerturb;
    }

    return Math.max(0.2, r);
  }

  computeSurfaceProfile(r, theta, outerR, innerR, params) {
    const baseThickness = (params.geo_height || 8.0) * 0.01;
    const bowlDome = params.geo_bowl_dome !== undefined ? params.geo_bowl_dome : 0.0;
    const crustWidth = ((params.crust_width || 24.0) * 0.05) / 1.5;
    const crustHeightRatio = params.crust_height_ratio !== undefined ? params.crust_height_ratio : 2.2;
    const crustProfile = params.crust_profile || 'Puffy Round';
    const thickVarAmp = params.geo_thick_var_amp || 0.0;
    const thickVarFreq = params.geo_thick_var_freq || 3.0;

    const radialSpan = outerR - innerR;
    const normR = radialSpan > 0.001 ? Math.min(1.0, Math.max(0.0, (r - innerR) / radialSpan)) : 0;

    // 1. Triple Bowl / Dome Curvature (Expanded 3x Range)
    const domeWarp = bowlDome * (1.0 - normR * normR) * 0.16;

    // 2. Crust Bulge Profile
    let crustBulge = 0;
    const crustStartNorm = Math.max(0.35, 1.0 - crustWidth / outerR);

    if (normR > crustStartNorm) {
      const t = (normR - crustStartNorm) / (1.0 - crustStartNorm); // 0 to 1
      const maxHeight = baseThickness * (crustHeightRatio - 1.0);

      if (crustProfile === 'Square Focaccia') {
        crustBulge = smoothstep(0.0, 0.35, t) * maxHeight;
      } else if (crustProfile === 'Crisp Tapered') {
        crustBulge = Math.pow(t, 2.2) * maxHeight;
      } else if (crustProfile === 'Crown Pinched') {
        crustBulge = Math.sin(t * Math.PI * 0.85) * maxHeight * 1.3;
      } else {
        // Puffy Round
        crustBulge = Math.sin(t * Math.PI * 0.58) * maxHeight;
      }
    }

    // 3. Thickness Variance (Simplex Noise)
    const x = r * Math.cos(theta);
    const z = r * Math.sin(theta);
    let noiseH = 0;
    if (thickVarAmp > 0.001) {
      noiseH = this.noise.noise2D(x * thickVarFreq, z * thickVarFreq) * thickVarAmp * baseThickness * 0.5;
    }

    // 4. Air Blister Bumps (Significantly boosted visibility & height)
    let blisterH = 0;
    const activeDoughBlisters = params.geo_air_pockets_count || 0;
    const bSizeSlider = params.geo_air_pockets_size || 18.0;
    const bRadius = (bSizeSlider * 0.05) / 6.0;

    for (let i = 0; i < Math.min(activeDoughBlisters, this.doughBlisters.length); i++) {
      const b = this.doughBlisters[i];
      const bx = b.radiusNorm * outerR * Math.cos(b.angle);
      const bz = b.radiusNorm * outerR * Math.sin(b.angle);
      const dist = Math.sqrt((x - bx) ** 2 + (z - bz) ** 2);
      if (dist < bRadius) {
        const falloff = (1.0 + Math.cos((dist / bRadius) * Math.PI)) * 0.5;
        blisterH += falloff * b.height * 2.5 * (baseThickness * 0.8 + 0.04);
      }
    }

    // Crust Blisters
    const activeCrustBlisters = params.crust_blisters || 0;
    if (normR > crustStartNorm) {
      for (let i = 0; i < Math.min(activeCrustBlisters, this.crustBlisters.length); i++) {
        const cb = this.crustBlisters[i];
        const cbx = outerR * 0.95 * Math.cos(cb.angle);
        const cbz = outerR * 0.95 * Math.sin(cb.angle);
        const dist = Math.sqrt((x - cbx) ** 2 + (z - cbz) ** 2);
        const cbRadius = 0.18;
        if (dist < cbRadius) {
          const falloff = (1.0 + Math.cos((dist / cbRadius) * Math.PI)) * 0.5;
          const blisterMax = (params.crust_blister_height || 5.0) * 0.012;
          blisterH += falloff * blisterMax;
        }
      }
    }

    const yTop = Math.max(0.005, baseThickness + domeWarp + crustBulge + noiseH + blisterH);
    const yBottom = 0.0;

    return { yTop, yBottom, normR };
  }

  generatePizza(params) {
    while (this.rootGroup.children.length > 0) {
      const child = this.rootGroup.children[0];
      this.rootGroup.remove(child);
      if (child.geometry) child.geometry.dispose();
    }
    this.slices = [];

    const materials = this.materialManager.getMaterials(params);
    const totalSlices = Math.max(1, Math.min(16, Math.round(params.slice_total || 8)));
    const visibleSlices = Math.max(1, Math.min(totalSlices, Math.round(params.slice_visible_count || totalSlices)));
    const pullOffset = (params.slice_pull_offset || 0.0) * 0.05;
    const pullIndex = (params.slice_pull_index || 1) - 1;

    const donutHoleRatio = params.geo_donut_hole || 0.0;
    const baseRadius = (params.geo_radius || 30.0) * 0.05;
    const innerRadius = donutHoleRatio > 0.01 ? baseRadius * donutHoleRatio : 0.0;

    const numRings = 24;
    const numAngleSteps = Math.max(12, Math.round(48 / totalSlices));

    for (let s = 0; s < totalSlices; s++) {
      const thetaStart = (s * 2 * Math.PI) / totalSlices;
      const thetaEnd = ((s + 1) * 2 * Math.PI) / totalSlices;
      const midTheta = (thetaStart + thetaEnd) / 2;

      const wedgeGroup = new THREE.Group();
      wedgeGroup.name = `SliceWedge_${s + 1}`;

      // 1. Dough Mesh
      const wedgeMesh = this.buildWedgeMesh(
        thetaStart,
        thetaEnd,
        innerRadius,
        numRings,
        numAngleSteps,
        params,
        materials
      );
      wedgeMesh.castShadow = true;
      wedgeMesh.receiveShadow = true;
      wedgeGroup.add(wedgeMesh);

      // 2. Stuffed Crust Core Mesh (Physical 3D Core)
      if (params.crust_stuffed) {
        const coreMesh = this.buildStuffedCoreMesh(
          thetaStart,
          thetaEnd,
          numAngleSteps,
          params,
          materials.stuffing
        );
        if (coreMesh) {
          coreMesh.castShadow = true;
          wedgeGroup.add(coreMesh);
        }
      }

      // 3. Volumetric Sauce Mesh with Vertical Cut Walls
      if (params.sauce_enabled) {
        const sauceMesh = this.buildSauceMesh(
          thetaStart,
          thetaEnd,
          innerRadius,
          numRings,
          numAngleSteps,
          params,
          materials.sauce
        );
        if (sauceMesh) {
          sauceMesh.castShadow = true;
          sauceMesh.receiveShadow = true;
          wedgeGroup.add(sauceMesh);
        }
      }

      if (s === pullIndex && pullOffset > 0.001) {
        wedgeGroup.position.x = pullOffset * Math.cos(midTheta);
        wedgeGroup.position.z = pullOffset * Math.sin(midTheta);
      }

      const isVisible = s < visibleSlices;
      wedgeGroup.visible = isVisible;

      this.rootGroup.add(wedgeGroup);

      this.slices.push({
        wedgeGroup,
        wedgeMesh,
        sliceIndex: s,
        sliceNumber: s + 1,
        angleStart: thetaStart,
        angleEnd: thetaEnd,
        midAngle: midTheta,
        isVisible,
        isPulled: s === pullIndex && pullOffset > 0.001,
        toppingsGroup: new THREE.Group()
      });

      wedgeGroup.add(this.slices[s].toppingsGroup);
    }

    // 4. Recursive Fractal Satellite Pizzas
    const fractalReps = params.geo_fractal_reps || 0;
    if (fractalReps > 0) {
      this.buildFractalSatellites(params, materials, fractalReps);
    }

    return this.rootGroup;
  }

  buildWedgeMesh(thetaStart, thetaEnd, innerR, numRings, numAngleSteps, params, materials) {
    const geometry = new THREE.BufferGeometry();

    const positions = [];
    const uvs = [];
    const indices = [];

    const groupTopIndices = [];
    const groupBottomIndices = [];
    const groupCutIndices = [];

    // --- 1. Top Surface Grid ---
    const topVertStart = positions.length / 3;
    for (let j = 0; j <= numAngleSteps; j++) {
      const vA = j / numAngleSteps;
      const theta = thetaStart + vA * (thetaEnd - thetaStart);
      const outerR = this.computeRadiusAtAngle(theta, params);

      for (let i = 0; i <= numRings; i++) {
        const uR = i / numRings;
        const r = innerR + uR * (outerR - innerR);
        const { yTop } = this.computeSurfaceProfile(r, theta, outerR, innerR, params);

        const x = r * Math.cos(theta);
        const z = r * Math.sin(theta);

        positions.push(x, yTop, z);
        uvs.push(0.5 + 0.5 * (x / outerR), 0.5 + 0.5 * (z / outerR));
      }
    }

    const ringPitch = numRings + 1;
    for (let j = 0; j < numAngleSteps; j++) {
      for (let i = 0; i < numRings; i++) {
        const i0 = topVertStart + j * ringPitch + i;
        const i1 = topVertStart + j * ringPitch + (i + 1);
        const i2 = topVertStart + (j + 1) * ringPitch + i;
        const i3 = topVertStart + (j + 1) * ringPitch + (i + 1);

        groupTopIndices.push(i0, i2, i1);
        groupTopIndices.push(i1, i2, i3);
      }
    }

    // --- 2. Bottom Surface Grid ---
    const bottomVertStart = positions.length / 3;
    for (let j = 0; j <= numAngleSteps; j++) {
      const vA = j / numAngleSteps;
      const theta = thetaStart + vA * (thetaEnd - thetaStart);
      const outerR = this.computeRadiusAtAngle(theta, params);

      for (let i = 0; i <= numRings; i++) {
        const uR = i / numRings;
        const r = innerR + uR * (outerR - innerR);
        const { yBottom } = this.computeSurfaceProfile(r, theta, outerR, innerR, params);

        const x = r * Math.cos(theta);
        const z = r * Math.sin(theta);

        positions.push(x, yBottom, z);
        uvs.push(0.5 + 0.5 * (x / outerR), 0.5 + 0.5 * (z / outerR));
      }
    }

    for (let j = 0; j < numAngleSteps; j++) {
      for (let i = 0; i < numRings; i++) {
        const i0 = bottomVertStart + j * ringPitch + i;
        const i1 = bottomVertStart + j * ringPitch + (i + 1);
        const i2 = bottomVertStart + (j + 1) * ringPitch + i;
        const i3 = bottomVertStart + (j + 1) * ringPitch + (i + 1);

        groupBottomIndices.push(i0, i1, i2);
        groupBottomIndices.push(i1, i3, i2);
      }
    }

    // --- 3. Outer Rim (Cornicione Exterior Wall) ---
    for (let j = 0; j < numAngleSteps; j++) {
      const topIdx0 = topVertStart + j * ringPitch + numRings;
      const topIdx1 = topVertStart + (j + 1) * ringPitch + numRings;
      const botIdx0 = bottomVertStart + j * ringPitch + numRings;
      const botIdx1 = bottomVertStart + (j + 1) * ringPitch + numRings;

      groupTopIndices.push(topIdx0, topIdx1, botIdx0);
      groupTopIndices.push(topIdx1, botIdx1, botIdx0);
    }

    // --- 4. Inner Hole Wall ---
    if (innerR > 0.001) {
      for (let j = 0; j < numAngleSteps; j++) {
        const topIdx0 = topVertStart + j * ringPitch;
        const topIdx1 = topVertStart + (j + 1) * ringPitch;
        const botIdx0 = bottomVertStart + j * ringPitch;
        const botIdx1 = bottomVertStart + (j + 1) * ringPitch;

        groupTopIndices.push(topIdx0, botIdx0, topIdx1);
        groupTopIndices.push(topIdx1, botIdx0, botIdx1);
      }
    }

    // --- 5. Left Cut Face at thetaStart (Interior Crumb Cross-Section) ---
    const leftCutVertStart = positions.length / 3;
    const outerRLeft = this.computeRadiusAtAngle(thetaStart, params);
    for (let i = 0; i <= numRings; i++) {
      const uR = i / numRings;
      const r = innerR + uR * (outerRLeft - innerR);
      const { yTop, yBottom } = this.computeSurfaceProfile(r, thetaStart, outerRLeft, innerR, params);

      const x = r * Math.cos(thetaStart);
      const z = r * Math.sin(thetaStart);

      positions.push(x, yTop, z);
      uvs.push(uR, 0.0);

      positions.push(x, yBottom, z);
      uvs.push(uR, 1.0);
    }

    for (let i = 0; i < numRings; i++) {
      const t0 = leftCutVertStart + i * 2;
      const b0 = leftCutVertStart + i * 2 + 1;
      const t1 = leftCutVertStart + (i + 1) * 2;
      const b1 = leftCutVertStart + (i + 1) * 2 + 1;

      groupCutIndices.push(t0, b0, t1);
      groupCutIndices.push(t1, b0, b1);
    }

    // --- 6. Right Cut Face at thetaEnd (Interior Crumb Cross-Section) ---
    const rightCutVertStart = positions.length / 3;
    const outerRRight = this.computeRadiusAtAngle(thetaEnd, params);
    for (let i = 0; i <= numRings; i++) {
      const uR = i / numRings;
      const r = innerR + uR * (outerRRight - innerR);
      const { yTop, yBottom } = this.computeSurfaceProfile(r, thetaEnd, outerRRight, innerR, params);

      const x = r * Math.cos(thetaEnd);
      const z = r * Math.sin(thetaEnd);

      positions.push(x, yTop, z);
      uvs.push(uR, 0.0);

      positions.push(x, yBottom, z);
      uvs.push(uR, 1.0);
    }

    for (let i = 0; i < numRings; i++) {
      const t0 = rightCutVertStart + i * 2;
      const b0 = rightCutVertStart + i * 2 + 1;
      const t1 = rightCutVertStart + (i + 1) * 2;
      const b1 = rightCutVertStart + (i + 1) * 2 + 1;

      groupCutIndices.push(t0, t1, b0);
      groupCutIndices.push(t1, b1, b0);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

    let indexOffset = 0;
    geometry.clearGroups();

    geometry.addGroup(indexOffset, groupTopIndices.length, 0);
    for (const idx of groupTopIndices) indices.push(idx);
    indexOffset += groupTopIndices.length;

    geometry.addGroup(indexOffset, groupBottomIndices.length, 1);
    for (const idx of groupBottomIndices) indices.push(idx);
    indexOffset += groupBottomIndices.length;

    geometry.addGroup(indexOffset, groupCutIndices.length, 2);
    for (const idx of groupCutIndices) indices.push(idx);
    indexOffset += groupCutIndices.length;

    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const mesh = new THREE.Mesh(geometry, [
      materials.doughTop,
      materials.doughBottom,
      materials.cutFace
    ]);

    return mesh;
  }

  /**
   * Builds Stuffed Crust Filling Core Tube inside the cornicione
   */
  buildStuffedCoreMesh(thetaStart, thetaEnd, numAngleSteps, params, stuffMaterial) {
    const stuffAmount = params.crust_stuff_amount !== undefined ? params.crust_stuff_amount : 12.0;
    const coreRadius = (stuffAmount / 28.0) * 0.024 + 0.008; // 8mm to 32mm in 3D units

    const tubeGeom = new THREE.BufferGeometry();
    const positions = [];
    const uvs = [];
    const indices = [];

    const radialSegments = 10;
    const lengthSegments = numAngleSteps;

    for (let j = 0; j <= lengthSegments; j++) {
      const vA = j / lengthSegments;
      const theta = thetaStart + vA * (thetaEnd - thetaStart);
      const outerR = this.computeRadiusAtAngle(theta, params);
      const crustWidth = ((params.crust_width || 24.0) * 0.05) / 1.5;
      const coreR = outerR - crustWidth * 0.45;

      const { yTop } = this.computeSurfaceProfile(coreR, theta, outerR, 0, params);
      const coreCenterY = yTop * 0.55;

      const cx = coreR * Math.cos(theta);
      const cz = coreR * Math.sin(theta);

      // Tangent, Normal, and Binormal
      const tangentX = -Math.sin(theta);
      const tangentZ = Math.cos(theta);
      const normalX = Math.cos(theta);
      const normalZ = Math.sin(theta);

      for (let i = 0; i <= radialSegments; i++) {
        const phi = (i / radialSegments) * Math.PI * 2;
        const cosP = Math.cos(phi);
        const sinP = Math.sin(phi);

        const px = cx + normalX * (cosP * coreRadius);
        const py = coreCenterY + sinP * coreRadius * 0.85;
        const pz = cz + normalZ * (cosP * coreRadius);

        positions.push(px, py, pz);
        uvs.push(i / radialSegments, vA);
      }
    }

    const pitch = radialSegments + 1;
    for (let j = 0; j < lengthSegments; j++) {
      for (let i = 0; i < radialSegments; i++) {
        const i0 = j * pitch + i;
        const i1 = j * pitch + (i + 1);
        const i2 = (j + 1) * pitch + i;
        const i3 = (j + 1) * pitch + (i + 1);

        indices.push(i0, i2, i1);
        indices.push(i1, i2, i3);
      }
    }

    tubeGeom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    tubeGeom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    tubeGeom.setIndex(indices);
    tubeGeom.computeVertexNormals();

    return new THREE.Mesh(tubeGeom, stuffMaterial);
  }

  /**
   * Builds Closed Volumetric Sauce Mesh with Vertical Cut Walls
   */
  buildSauceMesh(thetaStart, thetaEnd, innerR, numRings, numAngleSteps, params, sauceMaterial) {
    const sauceMargin = ((params.sauce_margin || 16.0) * 0.05) / 1.5;
    const sauceThickness = (params.sauce_thickness || 1.6) * 0.01;
    const swirlAmp = params.sauce_spread_patch !== undefined ? params.sauce_spread_patch : 0.45;

    const positions = [];
    const uvs = [];
    const indices = [];

    const sauceRings = Math.max(6, Math.round(numRings * 0.75));

    // 1. Top Sauce Surface Grid
    const topStart = 0;
    for (let j = 0; j <= numAngleSteps; j++) {
      const vA = j / numAngleSteps;
      const theta = thetaStart + vA * (thetaEnd - thetaStart);
      const outerR = this.computeRadiusAtAngle(theta, params);
      const maxSauceR = Math.max(innerR + 0.1, outerR - sauceMargin);

      for (let i = 0; i <= sauceRings; i++) {
        const uR = i / sauceRings;
        const r = innerR + uR * (maxSauceR - innerR);
        const { yTop } = this.computeSurfaceProfile(r, theta, outerR, innerR, params);

        const x = r * Math.cos(theta);
        const z = r * Math.sin(theta);
        const swirlDisplacement = swirlAmp > 0 ? this.noise.noise2D(x * 3.5, z * 3.5) * 0.012 * swirlAmp : 0;

        const ySauce = yTop + sauceThickness + swirlDisplacement;

        positions.push(x, ySauce, z);
        uvs.push(0.5 + 0.5 * (x / outerR), 0.5 + 0.5 * (z / outerR));
      }
    }

    const ringPitch = sauceRings + 1;
    for (let j = 0; j < numAngleSteps; j++) {
      for (let i = 0; i < sauceRings; i++) {
        const i0 = topStart + j * ringPitch + i;
        const i1 = topStart + j * ringPitch + (i + 1);
        const i2 = topStart + (j + 1) * ringPitch + i;
        const i3 = topStart + (j + 1) * ringPitch + (i + 1);

        indices.push(i0, i2, i1);
        indices.push(i1, i2, i3);
      }
    }

    // 2. Bottom Sauce Contact Surface Grid
    const bottomStart = positions.length / 3;
    for (let j = 0; j <= numAngleSteps; j++) {
      const vA = j / numAngleSteps;
      const theta = thetaStart + vA * (thetaEnd - thetaStart);
      const outerR = this.computeRadiusAtAngle(theta, params);
      const maxSauceR = Math.max(innerR + 0.1, outerR - sauceMargin);

      for (let i = 0; i <= sauceRings; i++) {
        const uR = i / sauceRings;
        const r = innerR + uR * (maxSauceR - innerR);
        const { yTop } = this.computeSurfaceProfile(r, theta, outerR, innerR, params);

        const x = r * Math.cos(theta);
        const z = r * Math.sin(theta);

        positions.push(x, yTop + 0.001, z);
        uvs.push(0.5 + 0.5 * (x / outerR), 0.5 + 0.5 * (z / outerR));
      }
    }

    for (let j = 0; j < numAngleSteps; j++) {
      for (let i = 0; i < sauceRings; i++) {
        const i0 = bottomStart + j * ringPitch + i;
        const i1 = bottomStart + j * ringPitch + (i + 1);
        const i2 = bottomStart + (j + 1) * ringPitch + i;
        const i3 = bottomStart + (j + 1) * ringPitch + (i + 1);

        indices.push(i0, i1, i2);
        indices.push(i1, i3, i2);
      }
    }

    // 3. Vertical Cut Wall at thetaStart (Left Cross-Section Wall)
    for (let i = 0; i < sauceRings; i++) {
      const top0 = topStart + 0 * ringPitch + i;
      const top1 = topStart + 0 * ringPitch + (i + 1);
      const bot0 = bottomStart + 0 * ringPitch + i;
      const bot1 = bottomStart + 0 * ringPitch + (i + 1);

      indices.push(top0, bot0, top1);
      indices.push(top1, bot0, bot1);
    }

    // 4. Vertical Cut Wall at thetaEnd (Right Cross-Section Wall)
    for (let i = 0; i < sauceRings; i++) {
      const top0 = topStart + numAngleSteps * ringPitch + i;
      const top1 = topStart + numAngleSteps * ringPitch + (i + 1);
      const bot0 = bottomStart + numAngleSteps * ringPitch + i;
      const bot1 = bottomStart + numAngleSteps * ringPitch + (i + 1);

      indices.push(top0, top1, bot0);
      indices.push(top1, bot1, bot0);
    }

    // 5. Outer Boundary Wall
    for (let j = 0; j < numAngleSteps; j++) {
      const top0 = topStart + j * ringPitch + sauceRings;
      const top1 = topStart + (j + 1) * ringPitch + sauceRings;
      const bot0 = bottomStart + j * ringPitch + sauceRings;
      const bot1 = bottomStart + (j + 1) * ringPitch + sauceRings;

      indices.push(top0, top1, bot0);
      indices.push(top1, bot1, bot0);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const mesh = new THREE.Mesh(geometry, sauceMaterial);
    return mesh;
  }

  /**
   * Generates Recursive Fractal Child Pizzas attached along perimeter
   */
  buildFractalSatellites(params, materials, repetitions) {
    const sides = Math.max(3, Math.min(8, Math.round(params.geo_sides || 32)));
    const ratio = params.geo_fractal_ratio || 0.40;
    const baseRadius = (params.geo_radius || 30.0) * 0.05;

    const numSatellites = Math.min(repetitions, sides);
    for (let s = 0; s < numSatellites; s++) {
      const angle = (s * 2 * Math.PI) / numSatellites;
      const parentR = this.computeRadiusAtAngle(angle, params);
      const childScale = Math.pow(ratio, 1.0);
      const childRadius = parentR * childScale;
      const distance = parentR + childRadius * 0.90;

      const satGroup = new THREE.Group();
      satGroup.name = `FractalSatellite_${s + 1}`;
      satGroup.position.set(distance * Math.cos(angle), 0, distance * Math.sin(angle));
      satGroup.scale.set(childScale, childScale, childScale);

      // Create mini child pizza wedge cluster
      const childParams = Object.assign({}, params, {
        geo_radius: (params.geo_radius || 30.0) * ratio,
        geo_fractal_reps: 0 // prevent infinite recursion
      });

      const childWedge = this.buildWedgeMesh(
        0,
        Math.PI * 2,
        0,
        14,
        24,
        childParams,
        materials
      );
      childWedge.castShadow = true;
      satGroup.add(childWedge);

      if (params.sauce_enabled) {
        const childSauce = this.buildSauceMesh(
          0,
          Math.PI * 2,
          0,
          10,
          24,
          childParams,
          materials.sauce
        );
        if (childSauce) satGroup.add(childSauce);
      }

      this.rootGroup.add(satGroup);
    }
  }
}

function smoothstep(min, max, value) {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

/**
 * Procedural PBR Material and Texture Generator for PizzaMaker 3D.
 * Creates dynamic high-contrast canvas textures for dough, baked charring, crumb cross-sections,
 * stuffed crust cores, glossy sauces, toppings, and props.
 * Includes texture caching to minimize CPU load during slider dragging.
 */

import * as THREE from 'three';
import { SimplexNoise, defaultNoise } from '../utils/simplex-noise.js';

export class MaterialManager {
  constructor() {
    this.noise = defaultNoise;
    this.textureCache = new Map();
  }

  getStuffingColor(params) {
    const type = params.crust_stuff_type || 'Mozzarella Cheese';
    if (params.crust_stuff_color && params.crust_stuff_color !== '#FFF3B3') {
      return params.crust_stuff_color;
    }
    switch (type) {
      case 'Cheddar Cream':
        return '#FF9500';
      case 'Ricotta & Herb':
        return '#F5FFF2';
      case 'Garlic Butter':
        return '#FFE666';
      case 'Spicy Sausage':
        return '#8A2515';
      case 'Mozzarella Cheese':
      default:
        return '#FFF6D1';
    }
  }

  // --- 1. Procedural Texture Generators ---

  /**
   * Generates Top Dough Surface Texture with bake browning and leopard spotting
   */
  generateDoughTopTexture(params) {
    const baseColorHex = params.geo_dough_color || '#EED8A1';
    const bake = params.bake_level !== undefined ? params.bake_level : 0.65;
    const charDough = params.bake_char_dough !== undefined ? params.bake_char_dough : 0.35;
    const charCrust = params.bake_char_crust !== undefined ? params.bake_char_crust : 0.55;

    const cacheKey = `doughTop_${baseColorHex}_${bake.toFixed(2)}_${charDough.toFixed(2)}_${charCrust.toFixed(2)}`;
    if (this.textureCache.has(cacheKey)) {
      return this.textureCache.get(cacheKey);
    }

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const baseRgb = hexToRgb(baseColorHex);
    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const nx = (x / size) - 0.5;
        const ny = (y / size) - 0.5;
        const distFromCenter = Math.sqrt(nx * nx + ny * ny) * 2.0;

        const nFlour = this.noise.noise2D(x * 0.15, y * 0.15) * 12;
        const nBake = this.noise.fbm2D(x * 0.02, y * 0.02, 3) * 35;

        const crustFactor = Math.max(0, (distFromCenter - 0.65) / 0.35);
        const bakeMod = bake * (0.8 + crustFactor * 0.8);

        let r = baseRgb.r - bakeMod * 40 + nBake + nFlour;
        let g = baseRgb.g - bakeMod * 60 + nBake * 0.7 + nFlour;
        let b = baseRgb.b - bakeMod * 95 + nBake * 0.4 + nFlour;

        // Leopard Spotting (woodfired char)
        const charDensity = distFromCenter > 0.7 ? charCrust : charDough;
        if (charDensity > 0.05) {
          const charNoise = this.noise.fbm2D(x * 0.045, y * 0.045, 3, 2.2, 0.6);
          const threshold = 1.0 - charDensity * 0.52;
          if (charNoise > threshold) {
            const spotIntensity = Math.min(1.0, (charNoise - threshold) / 0.12);
            r = r * (1.0 - spotIntensity) + 28 * spotIntensity;
            g = g * (1.0 - spotIntensity) + 18 * spotIntensity;
            b = b * (1.0 - spotIntensity) + 12 * spotIntensity;
          }
        }

        data[idx] = Math.min(255, Math.max(0, r));
        data[idx + 1] = Math.min(255, Math.max(0, g));
        data[idx + 2] = Math.min(255, Math.max(0, b));
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;

    this.textureCache.set(cacheKey, texture);
    return texture;
  }

  /**
   * Generates Underside / Bottom Crust Texture with oven stone scorch
   */
  generateDoughBottomTexture(params) {
    const browning = params.bake_bottom_browning !== undefined ? params.bake_bottom_browning : 0.7;
    const charStone = params.bake_bottom_char !== undefined ? params.bake_bottom_char : 0.4;

    const cacheKey = `doughBottom_${browning.toFixed(2)}_${charStone.toFixed(2)}`;
    if (this.textureCache.has(cacheKey)) {
      return this.textureCache.get(cacheKey);
    }

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;

        let r = 215 - browning * 75;
        let g = 175 - browning * 85;
        let b = 105 - browning * 85;

        const stoneNoise = this.noise.noise2D(x * 0.02, y * 0.02) * 15;
        const fineGrain = this.noise.noise2D(x * 0.2, y * 0.2) * 10;

        r += fineGrain + stoneNoise;
        g += fineGrain + stoneNoise * 0.8;
        b += fineGrain + stoneNoise * 0.5;

        if (charStone > 0.05) {
          const charNoise = this.noise.fbm2D(x * 0.035, y * 0.035, 3);
          const threshold = 1.0 - charStone * 0.5;
          if (charNoise > threshold) {
            const spot = Math.min(1.0, (charNoise - threshold) / 0.12);
            r = r * (1.0 - spot) + 32 * spot;
            g = g * (1.0 - spot) + 22 * spot;
            b = b * (1.0 - spot) + 16 * spot;
          }
        }

        data[idx] = Math.min(255, Math.max(0, r));
        data[idx + 1] = Math.min(255, Math.max(0, g));
        data[idx + 2] = Math.min(255, Math.max(0, b));
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;

    this.textureCache.set(cacheKey, texture);
    return texture;
  }

  /**
   * Generates Cut-Face Internal Crumb Texture (Dough Cross-Section)
   * Shows porous alveolated crumb cells, hollow air blister cavities, top crust golden layer,
   * bottom floor, and dynamic stuffed cheese/sauce core.
   */
  generateCutFaceCrumbTexture(params) {
    const baseColor = params.geo_dough_color || '#EED8A1';
    const isStuffed = !!params.crust_stuffed;
    const stuffType = params.crust_stuff_type || 'Mozzarella Cheese';
    const stuffColor = this.getStuffingColor(params);
    const stuffAmount = params.crust_stuff_amount !== undefined ? params.crust_stuff_amount : 12.0;
    const bake = params.bake_level !== undefined ? params.bake_level : 0.65;
    const airBlisterCount = params.geo_air_pockets_count || 0;
    const airBlisterSize = params.geo_air_pockets_size || 18.0;

    const cacheKey = `cutFace_${baseColor}_${isStuffed}_${stuffType}_${stuffColor}_${stuffAmount.toFixed(1)}_${bake.toFixed(2)}_${airBlisterCount}_${airBlisterSize.toFixed(1)}`;
    if (this.textureCache.has(cacheKey)) {
      return this.textureCache.get(cacheKey);
    }

    const width = 512;
    const height = 256;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const baseRgb = hexToRgb(baseColor);
    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    // Pre-calculate hollow air cavity seeds across the crumb cross-section
    const airCavities = [];
    if (airBlisterCount > 0) {
      const numCavities = Math.min(8, Math.round(airBlisterCount * 0.3) + 2);
      for (let c = 0; c < numCavities; c++) {
        const uPos = 0.20 + (c / numCavities) * 0.58;
        const vPos = 0.35 + ((c % 3) * 0.15);
        const radiusU = (airBlisterSize / 45.0) * 0.08 + 0.03;
        const radiusV = radiusU * 1.5; // taller vertically
        airCavities.push({ u: uPos, v: vPos, rx: radiusU, ry: radiusV });
      }
    }

    for (let y = 0; y < height; y++) {
      const v = y / height; // 0 = top, 1 = bottom
      for (let x = 0; x < width; x++) {
        const u = x / width; // 0 = center, 1 = crust rim
        const idx = (y * width + x) * 4;

        // Base crumb color
        let r = baseRgb.r + 15;
        let g = baseRgb.g + 15;
        let b = baseRgb.b + 10;

        // Alveoli (air cells in fermented dough)
        const cellNoise = this.noise.fbm2D(x * 0.05, y * 0.08, 3);
        const microPores = this.noise.noise2D(x * 0.25, y * 0.25) * 15;

        if (cellNoise > 0.30) {
          const cellDepth = (cellNoise - 0.30) / 0.70;
          r -= cellDepth * 85;
          g -= cellDepth * 80;
          b -= cellDepth * 70;
        } else {
          r += microPores;
          g += microPores;
          b += microPores;
        }

        // Air Blister Cavities (Large hollow pockets in cutaway)
        for (const cav of airCavities) {
          const du = (u - cav.u) / cav.rx;
          const dv = (v - cav.v) / cav.ry;
          const distSq = du * du + dv * dv;
          if (distSq < 1.0) {
            const cavityDepth = 1.0 - Math.sqrt(distSq);
            // Internal cavity shadow + toasted perimeter ring
            r = r * (1.0 - cavityDepth * 0.85) + 35 * cavityDepth;
            g = g * (1.0 - cavityDepth * 0.85) + 25 * cavityDepth;
            b = b * (1.0 - cavityDepth * 0.85) + 18 * cavityDepth;
          }
        }

        // Top Crust rim browning band
        if (v < 0.16) {
          const crustBlend = (0.16 - v) / 0.16;
          r = r * (1 - crustBlend) + (180 - bake * 40) * crustBlend;
          g = g * (1 - crustBlend) + (110 - bake * 50) * crustBlend;
          b = b * (1 - crustBlend) + (45 - bake * 30) * crustBlend;
        }

        // Bottom floor browning band
        if (v > 0.84) {
          const floorBlend = (v - 0.84) / 0.16;
          r = r * (1 - floorBlend) + 150 * floorBlend;
          g = g * (1 - floorBlend) + 90 * floorBlend;
          b = b * (1 - floorBlend) + 35 * floorBlend;
        }

        // Stuffed Crust Core Cross-Section (scales with crust_stuff_amount)
        if (isStuffed) {
          const coreCenterX = 0.85;
          const coreCenterY = 0.50;
          const coreRadius = Math.max(0.12, (stuffAmount / 28.0) * 0.38);

          const dx = (u - coreCenterX) / (coreRadius * 0.55);
          const dy = (v - coreCenterY) / (coreRadius * 0.85);
          const coreDist = Math.sqrt(dx * dx + dy * dy);

          if (coreDist < 1.0) {
            const cheeseRgb = hexToRgb(stuffColor);
            const coreBlend = Math.min(1.0, (1.0 - coreDist) / 0.15);
            const fillingTexture = this.noise.noise2D(x * 0.1, y * 0.1) * 20;

            r = r * (1 - coreBlend) + (cheeseRgb.r + fillingTexture) * coreBlend;
            g = g * (1 - coreBlend) + (cheeseRgb.g + fillingTexture) * coreBlend;
            b = b * (1 - coreBlend) + (cheeseRgb.b + fillingTexture) * coreBlend;
          }
        }

        data[idx] = Math.min(255, Math.max(0, r));
        data[idx + 1] = Math.min(255, Math.max(0, g));
        data[idx + 2] = Math.min(255, Math.max(0, b));
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.needsUpdate = true;

    this.textureCache.set(cacheKey, texture);
    return texture;
  }

  /**
   * Generates Sauce Diffuse Texture with Ladle Swirls & Patchiness
   */
  generateSauceDiffuseTexture(params) {
    let sauceColorHex = params.sauce_color || '#B52818';
    if (params.sauce_type === 'Basil Pesto') sauceColorHex = '#4A7C28';
    if (params.sauce_type === 'White Garlic Cream') sauceColorHex = '#F4EED8';
    if (params.sauce_type === 'Smoky BBQ') sauceColorHex = '#6A1B0E';
    if (params.sauce_type === 'Truffle Cream') sauceColorHex = '#D8CEB8';

    const swirlAmp = params.sauce_spread_patch !== undefined ? params.sauce_spread_patch : 0.45;
    const doughColorHex = params.geo_dough_color || '#EED8A1';

    const cacheKey = `sauceDiff_${sauceColorHex}_${doughColorHex}_${swirlAmp.toFixed(2)}`;
    if (this.textureCache.has(cacheKey)) {
      return this.textureCache.get(cacheKey);
    }

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const sauceRgb = hexToRgb(sauceColorHex);
    const doughRgb = hexToRgb(doughColorHex);
    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const nx = (x / size) - 0.5;
        const ny = (y / size) - 0.5;
        const dist = Math.sqrt(nx * nx + ny * ny) * 2.0;
        const angle = Math.atan2(ny, nx);

        // Ladle spiral groove pattern
        const spiral = Math.sin(dist * 20.0 - angle * 3.0) * swirlAmp * 0.4;
        const patchNoise = this.noise.fbm2D(x * 0.015, y * 0.015, 3);
        const seeds = this.noise.noise2D(x * 0.3, y * 0.3) > 0.65 ? 25 : 0;

        let r = sauceRgb.r + spiral * 30 + seeds;
        let g = sauceRgb.g + spiral * 25 + seeds * 0.8;
        let b = sauceRgb.b + spiral * 20 + seeds * 0.5;

        // Thin patchy spots exposing dough underneath
        if (swirlAmp > 0.1 && patchNoise > (1.15 - swirlAmp * 0.5)) {
          const patchBlend = Math.min(1.0, (patchNoise - (1.15 - swirlAmp * 0.5)) / 0.15);
          r = r * (1 - patchBlend) + doughRgb.r * patchBlend;
          g = g * (1 - patchBlend) + doughRgb.g * patchBlend;
          b = b * (1 - patchBlend) + doughRgb.b * patchBlend;
        }

        data[idx] = Math.min(255, Math.max(0, r));
        data[idx + 1] = Math.min(255, Math.max(0, g));
        data[idx + 2] = Math.min(255, Math.max(0, b));
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;

    this.textureCache.set(cacheKey, texture);
    return texture;
  }

  /**
   * Generates Sauce Bump & Normal Map with ladle ridges
   */
  generateSauceNormalMap(params) {
    const roughness = params.sauce_texture_rough !== undefined ? params.sauce_texture_rough : 0.55;
    const swirlAmp = params.sauce_spread_patch !== undefined ? params.sauce_spread_patch : 0.45;

    const cacheKey = `sauceNorm_${roughness.toFixed(2)}_${swirlAmp.toFixed(2)}`;
    if (this.textureCache.has(cacheKey)) {
      return this.textureCache.get(cacheKey);
    }

    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const nxPos = (x / size) - 0.5;
        const nyPos = (y / size) - 0.5;
        const dist = Math.sqrt(nxPos * nxPos + nyPos * nyPos) * 2.0;
        const angle = Math.atan2(nyPos, nxPos);

        const ladleWave = Math.sin(dist * 18.0 - angle * 3.0) * swirlAmp * 40;
        const n1 = this.noise.noise2D(x * 0.08, y * 0.08);
        const n2 = this.noise.noise2D(x * 0.25, y * 0.25) * 0.5;
        const total = (n1 + n2) * roughness * 50 + ladleWave;

        const nx = Math.round(128 + total);
        const ny = Math.round(128 + this.noise.noise2D(y * 0.08, x * 0.08) * roughness * 50 + ladleWave * 0.5);
        const nz = 255;

        data[idx] = Math.min(255, Math.max(0, nx));
        data[idx + 1] = Math.min(255, Math.max(0, ny));
        data[idx + 2] = nz;
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;

    this.textureCache.set(cacheKey, texture);
    return texture;
  }

  // --- 2. Material Builders ---

  getMaterials(params) {
    const doughTopTex = this.generateDoughTopTexture(params);
    const doughBottomTex = this.generateDoughBottomTexture(params);
    const crumbTex = this.generateCutFaceCrumbTexture(params);
    const sauceDiffuseTex = this.generateSauceDiffuseTexture(params);
    const sauceNormalTex = this.generateSauceNormalMap(params);

    const doughTopMaterial = new THREE.MeshStandardMaterial({
      map: doughTopTex,
      roughness: params.geo_dough_roughness !== undefined ? params.geo_dough_roughness : 0.85,
      metalness: 0.02,
      side: THREE.DoubleSide
    });

    const doughBottomMaterial = new THREE.MeshStandardMaterial({
      map: doughBottomTex,
      roughness: 0.90,
      metalness: 0.0,
      side: THREE.DoubleSide
    });

    const cutFaceMaterial = new THREE.MeshStandardMaterial({
      map: crumbTex,
      roughness: 0.75,
      metalness: 0.02,
      side: THREE.DoubleSide
    });

    const sauceMaterial = new THREE.MeshStandardMaterial({
      map: sauceDiffuseTex,
      normalMap: sauceNormalTex,
      normalScale: new THREE.Vector2(1.2, 1.2),
      roughness: Math.max(0.1, 1.0 - (params.sauce_shininess !== undefined ? params.sauce_shininess : 0.80)),
      metalness: 0.05,
      side: THREE.DoubleSide
    });

    const stuffColor = this.getStuffingColor(params);
    const stuffMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(stuffColor),
      roughness: params.crust_stuff_type === 'Garlic Butter' ? 0.15 : 0.40,
      metalness: 0.05,
      side: THREE.DoubleSide
    });

    return {
      doughTop: doughTopMaterial,
      doughBottom: doughBottomMaterial,
      cutFace: cutFaceMaterial,
      sauce: sauceMaterial,
      stuffing: stuffMaterial
    };
  }
}

function hexToRgb(hex) {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  const num = parseInt(c, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

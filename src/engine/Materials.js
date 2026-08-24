/**
 * Procedural PBR Material and Texture Generator for PizzaMaker 3D.
 * Creates dynamic high-contrast canvas textures for dough, baked charring, crumb cross-sections,
 * stuffed crust cores, glossy sauces, toppings, and props.
 */

import * as THREE from 'three';
import { SimplexNoise, defaultNoise } from '../utils/simplex-noise.js';

export class MaterialManager {
  constructor() {
    this.noise = defaultNoise;
  }

  // --- 1. Procedural Texture Generators ---

  /**
   * Generates Top Dough Surface Texture with bake browning and leopard spotting
   */
  generateDoughTopTexture(params) {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const baseColorHex = params.geo_dough_color || '#EED8A1';
    const bake = params.bake_level !== undefined ? params.bake_level : 0.65;
    const charDough = params.bake_char_dough !== undefined ? params.bake_char_dough : 0.35;
    const charCrust = params.bake_char_crust !== undefined ? params.bake_char_crust : 0.55;

    const baseRgb = hexToRgb(baseColorHex);

    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const nx = (x / size) - 0.5;
        const ny = (y / size) - 0.5;
        const distFromCenter = Math.sqrt(nx * nx + ny * ny) * 2.0; // 0 at center, 1 at edge

        // Micro flour noise + macro dough color variation
        const nFlour = this.noise.noise2D(x * 0.15, y * 0.15) * 12;
        const nBake = this.noise.fbm2D(x * 0.02, y * 0.02, 3) * 35;

        // Crust edge receives extra rich golden-brown baking
        const crustFactor = Math.max(0, (distFromCenter - 0.65) / 0.35);
        const bakeMod = bake * (0.8 + crustFactor * 0.8);

        let r = baseRgb.r - bakeMod * 40 + nBake + nFlour;
        let g = baseRgb.g - bakeMod * 60 + nBake * 0.7 + nFlour;
        let b = baseRgb.b - bakeMod * 95 + nBake * 0.4 + nFlour;

        // Leopard Spotting (high-frequency thresholded noise for wood-fired char)
        const charDensity = distFromCenter > 0.7 ? charCrust : charDough;
        if (charDensity > 0.05) {
          const charNoise = this.noise.fbm2D(x * 0.045, y * 0.045, 3, 2.2, 0.6);
          const threshold = 1.0 - charDensity * 0.52;
          if (charNoise > threshold) {
            const spotIntensity = Math.min(1.0, (charNoise - threshold) / 0.12);
            r = r * (1.0 - spotIntensity) + 30 * spotIntensity;
            g = g * (1.0 - spotIntensity) + 20 * spotIntensity;
            b = b * (1.0 - spotIntensity) + 15 * spotIntensity;
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
    return texture;
  }

  /**
   * Generates Underside / Bottom Crust Texture with oven stone scorch and semolina
   */
  generateDoughBottomTexture(params) {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const browning = params.bake_bottom_browning !== undefined ? params.bake_bottom_browning : 0.7;
    const charStone = params.bake_bottom_char !== undefined ? params.bake_bottom_char : 0.4;

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
    return texture;
  }

  /**
   * Generates Cut-Face Internal Crumb Texture (Dough Cross-Section)
   * Shows porous alveolated crumb cells, top crust golden layer, bottom floor,
   * and stuffed cheese core when enabled.
   */
  generateCutFaceCrumbTexture(params) {
    const width = 512;
    const height = 256;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const baseColor = params.geo_dough_color || '#EED8A1';
    const isStuffed = !!params.crust_stuffed;
    const stuffColor = params.crust_stuff_color || '#FFF3B3';
    const bake = params.bake_level !== undefined ? params.bake_level : 0.65;

    const baseRgb = hexToRgb(baseColor);
    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    for (let y = 0; y < height; y++) {
      const v = y / height; // 0 = top, 1 = bottom
      for (let x = 0; x < width; x++) {
        const u = x / width; // 0 = center, 1 = crust rim
        const idx = (y * width + x) * 4;

        // Base crumb color (creamy ivory-golden with spongy porosity)
        let r = baseRgb.r + 15;
        let g = baseRgb.g + 15;
        let b = baseRgb.b + 10;

        // Alveoli (air cells / porous cavities in fermented dough)
        const cellNoise = this.noise.fbm2D(x * 0.05, y * 0.08, 3);
        const microPores = this.noise.noise2D(x * 0.25, y * 0.25) * 15;

        if (cellNoise > 0.32) {
          // Hollow cell interior shadow
          const cellDepth = (cellNoise - 0.32) / 0.68;
          r -= cellDepth * 85;
          g -= cellDepth * 80;
          b -= cellDepth * 70;
        } else {
          r += microPores;
          g += microPores;
          b += microPores;
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

        // Sauce layer at top-left
        if (v < 0.08 && u < 0.80) {
          r = 190; g = 35; b = 22; // Rich marinara top sliver
        }

        // Stuffed Crust Core Cross-Section (circular cheese core inside outer crust zone)
        if (isStuffed) {
          const coreCenterX = 0.86;
          const coreCenterY = 0.50;
          const dx = (u - coreCenterX) * 2.2;
          const dy = (v - coreCenterY) * 1.2;
          const coreDist = Math.sqrt(dx * dx + dy * dy);

          if (coreDist < 0.28) {
            const cheeseRgb = hexToRgb(stuffColor);
            const coreBlend = Math.min(1.0, (0.28 - coreDist) / 0.04);
            const cheeseSwirl = this.noise.noise2D(x * 0.1, y * 0.1) * 20;
            r = r * (1 - coreBlend) + (cheeseRgb.r + cheeseSwirl) * coreBlend;
            g = g * (1 - coreBlend) + (cheeseRgb.g + cheeseSwirl) * coreBlend;
            b = b * (1 - coreBlend) + (cheeseRgb.b + cheeseSwirl) * coreBlend;
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
    return texture;
  }

  /**
   * Generates Sauce Bump & Normal Map
   */
  generateSauceNormalMap(params) {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const roughness = params.sauce_texture_rough !== undefined ? params.sauce_texture_rough : 0.5;

    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;

        const n1 = this.noise.noise2D(x * 0.08, y * 0.08);
        const n2 = this.noise.noise2D(x * 0.25, y * 0.25) * 0.5;
        const total = (n1 + n2) * roughness;

        const nx = Math.round(128 + total * 80);
        const ny = Math.round(128 + this.noise.noise2D(y * 0.08, x * 0.08) * roughness * 80);
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
    return texture;
  }

  // --- 2. Material Builders ---

  getMaterials(params) {
    const doughTopTex = this.generateDoughTopTexture(params);
    const doughBottomTex = this.generateDoughBottomTexture(params);
    const crumbTex = this.generateCutFaceCrumbTexture(params);
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

    let sauceColor = params.sauce_color || '#B52818';
    if (params.sauce_type === 'Basil Pesto') sauceColor = '#4A7C28';
    if (params.sauce_type === 'White Garlic Cream') sauceColor = '#F4EED8';
    if (params.sauce_type === 'Smoky BBQ') sauceColor = '#6A1B0E';
    if (params.sauce_type === 'Truffle Cream') sauceColor = '#D8CEB8';

    const sauceMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(sauceColor),
      normalMap: sauceNormalTex,
      normalScale: new THREE.Vector2(0.8, 0.8),
      roughness: Math.max(0.1, 1.0 - (params.sauce_shininess || 0.75)),
      metalness: 0.05,
      side: THREE.FrontSide
    });

    const stuffColor = params.crust_stuff_color || '#FFF3B3';
    const stuffMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(stuffColor),
      roughness: 0.35,
      metalness: 0.05
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

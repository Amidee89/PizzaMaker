/**
 * Procedural 3D Toppings Generator and Sector-Aware Scatterer.
 * Builds rich, highly realistic 3D models for Pepperoni, Mozzarella, Basil, Mushrooms,
 * Olives, Peppers, Onions, Jalapeños, Pineapple, Sausage, and Bacon.
 */

import * as THREE from 'three';

export class ToppingsEngine {
  constructor(pizzaGenerator) {
    this.pizzaGenerator = pizzaGenerator;
    this.toppingMaterials = this.initMaterials();
  }

  initMaterials() {
    // 1. Pepperoni Material - Deep Crimson Red with Paprika Oil & Charred Edge
    const pepCanvas = document.createElement('canvas');
    pepCanvas.width = 256; pepCanvas.height = 256;
    const pepCtx = pepCanvas.getContext('2d');
    const pepGrad = pepCtx.createRadialGradient(128, 128, 15, 128, 128, 128);
    pepGrad.addColorStop(0, '#B82010');
    pepGrad.addColorStop(0.65, '#8E1408');
    pepGrad.addColorStop(0.88, '#590B04');
    pepGrad.addColorStop(1.0, '#240402'); // charred edge
    pepCtx.fillStyle = pepGrad;
    pepCtx.fillRect(0, 0, 256, 256);

    for (let i = 0; i < 300; i++) {
      const sx = Math.random() * 256;
      const sy = Math.random() * 256;
      pepCtx.fillStyle = Math.random() > 0.4 ? 'rgba(255, 120, 0, 0.5)' : 'rgba(30, 5, 2, 0.6)';
      pepCtx.fillRect(sx, sy, 2 + Math.random() * 3, 2 + Math.random() * 3);
    }

    const pepTex = new THREE.CanvasTexture(pepCanvas);
    pepTex.needsUpdate = true;

    const pepperoni = new THREE.MeshStandardMaterial({
      map: pepTex,
      color: 0xBD2615,
      roughness: 0.30,
      metalness: 0.08,
      side: THREE.DoubleSide
    });

    const pepperoniGrease = new THREE.MeshStandardMaterial({
      color: 0xFF6600,
      roughness: 0.04,
      metalness: 0.2,
      transparent: true,
      opacity: 0.94,
      side: THREE.DoubleSide
    });

    // 2. Mozzarella Melt Material - Warm Golden Bubbly Melt
    const cheeseCanvas = document.createElement('canvas');
    cheeseCanvas.width = 256; cheeseCanvas.height = 256;
    const cheeseCtx = cheeseCanvas.getContext('2d');
    const cheeseGrad = cheeseCtx.createRadialGradient(128, 128, 20, 128, 128, 128);
    cheeseGrad.addColorStop(0, '#FFF2BD');
    cheeseGrad.addColorStop(0.6, '#F7DC84');
    cheeseGrad.addColorStop(0.85, '#E5A534');
    cheeseGrad.addColorStop(1.0, '#B86812'); // toasted blister
    cheeseCtx.fillStyle = cheeseGrad;
    cheeseCtx.fillRect(0, 0, 256, 256);

    // Add toasted blister spots
    for (let i = 0; i < 15; i++) {
      const bx = 40 + Math.random() * 176;
      const by = 40 + Math.random() * 176;
      const br = 4 + Math.random() * 8;
      cheeseCtx.fillStyle = 'rgba(180, 90, 15, 0.7)';
      cheeseCtx.beginPath();
      cheeseCtx.arc(bx, by, br, 0, Math.PI * 2);
      cheeseCtx.fill();
    }

    const cheeseTex = new THREE.CanvasTexture(cheeseCanvas);
    cheeseTex.needsUpdate = true;

    const mozzarellaMelt = new THREE.MeshStandardMaterial({
      map: cheeseTex,
      color: 0xFEE694,
      roughness: 0.28,
      metalness: 0.02,
      side: THREE.DoubleSide
    });

    // 3. Fresh Mozzarella Pearl Material
    const mozzarellaPearl = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      roughness: 0.16,
      metalness: 0.02
    });

    // 4. Fresh Basil Leaf Material
    const basil = new THREE.MeshStandardMaterial({
      color: 0x1E824C,
      roughness: 0.35,
      metalness: 0.05,
      side: THREE.DoubleSide
    });

    // 5. Mushroom Cap & Stem Materials
    const mushroomCap = new THREE.MeshStandardMaterial({
      color: 0x8C735A,
      roughness: 0.65,
      metalness: 0.0
    });
    const mushroomFlesh = new THREE.MeshStandardMaterial({
      color: 0xF2EAE1,
      roughness: 0.75,
      metalness: 0.0
    });

    // 6. Kalamata Olive Material
    const olive = new THREE.MeshStandardMaterial({
      color: 0x221B20,
      roughness: 0.22,
      metalness: 0.12
    });

    // 7. Green Bell Pepper Material
    const bellPepper = new THREE.MeshStandardMaterial({
      color: 0x27AE60,
      roughness: 0.25,
      metalness: 0.08
    });

    // 8. Red Onion Material
    const redOnion = new THREE.MeshStandardMaterial({
      color: 0x9B59B6,
      roughness: 0.28,
      metalness: 0.05,
      side: THREE.DoubleSide
    });

    // 9. Jalapeño Material
    const jalapeno = new THREE.MeshStandardMaterial({
      color: 0x196F3D,
      roughness: 0.28,
      metalness: 0.05
    });

    // 10. Pineapple Material
    const pineapple = new THREE.MeshStandardMaterial({
      color: 0xF1C40F,
      roughness: 0.35,
      metalness: 0.02
    });

    // 11. Sausage Material
    const sausage = new THREE.MeshStandardMaterial({
      color: 0x78281F,
      roughness: 0.60,
      metalness: 0.08
    });

    // 12. Bacon Material
    const bacon = new THREE.MeshStandardMaterial({
      color: 0x922B21,
      roughness: 0.40,
      metalness: 0.12
    });

    return {
      pepperoni,
      pepperoniGrease,
      mozzarellaMelt,
      mozzarellaPearl,
      basil,
      mushroomCap,
      mushroomFlesh,
      olive,
      bellPepper,
      redOnion,
      jalapeno,
      pineapple,
      sausage,
      bacon
    };
  }

  createPepperoniMesh(scale = 1.0) {
    const group = new THREE.Group();
    const radius = 0.13 * scale;
    const segments = 24;

    const geom = new THREE.BufferGeometry();
    const pos = [];
    const uvs = [];
    const idx = [];

    // Center vertex (depressed downwards for cup)
    pos.push(0, -0.016 * scale, 0);
    uvs.push(0.5, 0.5);

    for (let i = 0; i < segments; i++) {
      const angle = (i * 2 * Math.PI) / segments;
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);
      // Rim curls up slightly
      const y = 0.024 * scale + Math.sin(angle * 3) * 0.004 * scale;

      pos.push(x, y, z);
      uvs.push(0.5 + 0.5 * Math.cos(angle), 0.5 + 0.5 * Math.sin(angle));
    }

    for (let i = 1; i <= segments; i++) {
      const next = i === segments ? 1 : i + 1;
      idx.push(0, next, i);
    }

    geom.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.setIndex(idx);
    geom.computeVertexNormals();

    const disk = new THREE.Mesh(geom, this.toppingMaterials.pepperoni);
    disk.castShadow = true;
    group.add(disk);

    // Glowing paprika grease pool in center
    const greaseGeom = new THREE.CircleGeometry(radius * 0.58, 16);
    greaseGeom.rotateX(-Math.PI / 2);
    const grease = new THREE.Mesh(greaseGeom, this.toppingMaterials.pepperoniGrease);
    grease.position.y = -0.008 * scale;
    group.add(grease);

    return group;
  }

  createMozzarellaMeltMesh(scale = 1.0) {
    const group = new THREE.Group();
    const radius = 0.16 * scale;
    const segments = 16;

    const geom = new THREE.BufferGeometry();
    const pos = [];
    const uvs = [];
    const idx = [];

    pos.push(0, 0.006 * scale, 0);
    uvs.push(0.5, 0.5);

    for (let i = 0; i < segments; i++) {
      const angle = (i * 2 * Math.PI) / segments;
      const r = radius * (0.85 + Math.sin(angle * 3 + scale) * 0.15);
      pos.push(r * Math.cos(angle), 0.002 * scale, r * Math.sin(angle));
      uvs.push(0.5 + 0.5 * Math.cos(angle), 0.5 + 0.5 * Math.sin(angle));
    }

    for (let i = 1; i <= segments; i++) {
      const next = i === segments ? 1 : i + 1;
      idx.push(0, next, i);
    }

    geom.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.setIndex(idx);
    geom.computeVertexNormals();

    const mesh = new THREE.Mesh(geom, this.toppingMaterials.mozzarellaMelt);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return group;
  }

  createMozzarellaPearlMesh(scale = 1.0) {
    const radius = 0.10 * scale;
    const geom = new THREE.SphereGeometry(radius, 16, 12);
    geom.scale(1.0, 0.65, 1.0);
    const mesh = new THREE.Mesh(geom, this.toppingMaterials.mozzarellaPearl);
    mesh.castShadow = true;
    return mesh;
  }

  createBasilMesh(scale = 1.0) {
    const group = new THREE.Group();
    const length = 0.22 * scale;
    const width = 0.12 * scale;

    const geom = new THREE.BufferGeometry();
    const pos = [];
    const uvs = [];
    const idx = [];

    const rows = 7;
    const cols = 3;

    for (let r = 0; r < rows; r++) {
      const v = r / (rows - 1);
      const leafW = Math.sin(v * Math.PI) * width;
      const leafZ = (v - 0.5) * length;
      const archY = Math.sin(v * Math.PI) * 0.04 * scale;

      for (let c = 0; c < cols; c++) {
        const u = (c / (cols - 1) - 0.5) * 2.0;
        const leafX = u * leafW;
        const creaseY = Math.abs(u) * 0.016 * scale;

        pos.push(leafX, archY + creaseY, leafZ);
        uvs.push((u + 1) * 0.5, v);
      }
    }

    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < cols - 1; c++) {
        const i0 = r * cols + c;
        const i1 = r * cols + (c + 1);
        const i2 = (r + 1) * cols + c;
        const i3 = (r + 1) * cols + (c + 1);

        idx.push(i0, i2, i1);
        idx.push(i1, i2, i3);
      }
    }

    geom.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.setIndex(idx);
    geom.computeVertexNormals();

    const leaf = new THREE.Mesh(geom, this.toppingMaterials.basil);
    leaf.castShadow = true;
    group.add(leaf);

    return group;
  }

  createMushroomMesh(scale = 1.0) {
    const group = new THREE.Group();
    const capW = 0.14 * scale;
    const capH = 0.08 * scale;

    const capGeom = new THREE.CylinderGeometry(capW * 0.4, capW, 0.03 * scale, 12);
    capGeom.scale(1.0, 0.5, 0.8);
    const cap = new THREE.Mesh(capGeom, this.toppingMaterials.mushroomCap);
    cap.position.set(0, 0.015 * scale, 0.02 * scale);
    cap.castShadow = true;
    group.add(cap);

    const stemGeom = new THREE.BoxGeometry(capW * 0.35, 0.025 * scale, capH * 0.7);
    const stem = new THREE.Mesh(stemGeom, this.toppingMaterials.mushroomFlesh);
    stem.position.set(0, 0.01 * scale, -0.03 * scale);
    stem.castShadow = true;
    group.add(stem);

    return group;
  }

  createOliveMesh(scale = 1.0) {
    const rOuter = 0.075 * scale;
    const rInner = 0.042 * scale;
    const height = 0.04 * scale;

    const shape = new THREE.Shape();
    shape.absarc(0, 0, rOuter, 0, Math.PI * 2, false);
    const hole = new THREE.Path();
    hole.absarc(0, 0, rInner, 0, Math.PI * 2, true);
    shape.holes.push(hole);

    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: height,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.005 * scale,
      bevelThickness: 0.005 * scale
    });
    geom.rotateX(Math.PI / 2);

    const mesh = new THREE.Mesh(geom, this.toppingMaterials.olive);
    mesh.castShadow = true;
    return mesh;
  }

  createBellPepperMesh(scale = 1.0) {
    const group = new THREE.Group();
    const radius = 0.12 * scale;
    const tube = 0.02 * scale;

    const geom = new THREE.TorusGeometry(radius, tube, 8, 16, Math.PI * 0.9);
    geom.rotateX(Math.PI / 2);
    const mesh = new THREE.Mesh(geom, this.toppingMaterials.bellPepper);
    mesh.castShadow = true;
    group.add(mesh);
    return group;
  }

  createRedOnionMesh(scale = 1.0) {
    const group = new THREE.Group();
    const radius = 0.13 * scale;
    const tube = 0.015 * scale;

    const geom = new THREE.TorusGeometry(radius, tube, 6, 16, Math.PI * 0.85);
    geom.rotateX(Math.PI / 2);
    const mesh = new THREE.Mesh(geom, this.toppingMaterials.redOnion);
    mesh.castShadow = true;
    group.add(mesh);
    return group;
  }

  createJalapenoMesh(scale = 1.0) {
    const group = new THREE.Group();
    const rOuter = 0.08 * scale;
    const rInner = 0.045 * scale;
    const height = 0.025 * scale;

    const shape = new THREE.Shape();
    shape.absarc(0, 0, rOuter, 0, Math.PI * 2, false);
    const hole = new THREE.Path();
    hole.absarc(0, 0, rInner, 0, Math.PI * 2, true);
    shape.holes.push(hole);

    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: height,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.004 * scale,
      bevelThickness: 0.004 * scale
    });
    geom.rotateX(Math.PI / 2);

    const mesh = new THREE.Mesh(geom, this.toppingMaterials.jalapeno);
    mesh.castShadow = true;
    group.add(mesh);
    return group;
  }

  createPineappleMesh(scale = 1.0) {
    const geom = new THREE.BoxGeometry(0.12 * scale, 0.045 * scale, 0.09 * scale);
    geom.rotateY(0.2);
    const mesh = new THREE.Mesh(geom, this.toppingMaterials.pineapple);
    mesh.castShadow = true;
    return mesh;
  }

  createSausageMesh(scale = 1.0) {
    const group = new THREE.Group();
    const count = 3 + Math.floor(Math.random() * 2);
    for (let i = 0; i < count; i++) {
      const radius = (0.035 + Math.random() * 0.02) * scale;
      const geom = new THREE.DodecahedronGeometry(radius, 1);
      const mesh = new THREE.Mesh(geom, this.toppingMaterials.sausage);
      mesh.position.set(
        (Math.random() - 0.5) * 0.06 * scale,
        (Math.random() * 0.02) * scale,
        (Math.random() - 0.5) * 0.06 * scale
      );
      mesh.castShadow = true;
      group.add(mesh);
    }
    return group;
  }

  createBaconMesh(scale = 1.0) {
    const geom = new THREE.BoxGeometry(0.09 * scale, 0.018 * scale, 0.045 * scale);
    const mesh = new THREE.Mesh(geom, this.toppingMaterials.bacon);
    mesh.castShadow = true;
    return mesh;
  }

  createToppingMesh(type, scale = 1.0) {
    switch (type) {
      case 'pepperoni': return this.createPepperoniMesh(scale);
      case 'mozzarella_melt': return this.createMozzarellaMeltMesh(scale);
      case 'mozzarella_pearls': return this.createMozzarellaPearlMesh(scale);
      case 'basil': return this.createBasilMesh(scale);
      case 'mushrooms': return this.createMushroomMesh(scale);
      case 'olives': return this.createOliveMesh(scale);
      case 'bell_peppers': return this.createBellPepperMesh(scale);
      case 'red_onions': return this.createRedOnionMesh(scale);
      case 'jalapenos': return this.createJalapenoMesh(scale);
      case 'pineapple': return this.createPineappleMesh(scale);
      case 'sausage': return this.createSausageMesh(scale);
      case 'bacon': return this.createBaconMesh(scale);
      default: return this.createPepperoniMesh(scale);
    }
  }

  scatterToppings(toppingsConfig, params) {
    const slices = this.pizzaGenerator.slices;
    if (!slices || slices.length === 0) return;

    for (const slice of slices) {
      while (slice.toppingsGroup.children.length > 0) {
        const child = slice.toppingsGroup.children[0];
        slice.toppingsGroup.remove(child);
      }
    }

    if (!toppingsConfig || toppingsConfig.length === 0) return;

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
    const sauceMargin = ((params.sauce_margin || 16.0) * 0.05) / 1.5;

    for (const [level, levelSlices] of levelMap.entries()) {
      for (let layerIdx = 0; layerIdx < toppingsConfig.length; layerIdx++) {
        const toppingLayer = toppingsConfig[layerIdx];
        const type = toppingLayer.type;
        const count = toppingLayer.count || 0;
        const userScale = toppingLayer.scale || 1.0;
        if (count <= 0) continue;

        let layerYOffset = 0.005;
        if (type === 'pepperoni') layerYOffset = 0.018;
        if (type === 'basil') layerYOffset = 0.020;
        if (type === 'sausage' || type === 'pineapple') layerYOffset = 0.014;

        const layerAngleOffset = layerIdx * 1.61803398875 * Math.PI;

        for (let i = 0; i < count; i++) {
          const angle = layerAngleOffset + (i * 137.508 * Math.PI) / 180 + Math.sin(i * 3.7 + layerIdx) * 0.15;
          const normDist = 0.22 + 0.70 * Math.sqrt((i + 0.5) / count);
          const normAngle = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

          const outerR = this.pizzaGenerator.computeRadiusAtAngle(normAngle, params);
          const maxR = Math.max(innerR + 0.15, outerR - sauceMargin - 0.08);
          const r = innerR + normDist * (maxR - innerR);

          const x = r * Math.cos(normAngle);
          const z = r * Math.sin(normAngle);

          const { yTop } = this.pizzaGenerator.computeSurfaceProfile(r, normAngle, outerR, innerR, params);

          let targetSlice = null;
          for (const slice of levelSlices) {
            if (normAngle >= slice.angleStart && normAngle < slice.angleEnd) {
              targetSlice = slice;
              break;
            }
          }
          if (!targetSlice) targetSlice = levelSlices[0];

          const scaleJitter = userScale * (0.92 + (i % 4) * 0.05);
          const mesh = this.createToppingMesh(type, scaleJitter);

          mesh.position.set(x, yTop + layerYOffset, z);
          mesh.rotation.y = normAngle + ((i * 47) % 360) * (Math.PI / 180);
          mesh.rotation.x = ((i % 3) - 1) * 0.04;
          mesh.rotation.z = (((i + 1) % 3) - 1) * 0.04;

          targetSlice.toppingsGroup.add(mesh);
        }
      }
    }
  }
}

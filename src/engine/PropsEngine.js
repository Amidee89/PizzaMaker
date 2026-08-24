/**
 * 3D Props & Atmosphere Engine.
 * Builds procedural plates, wooden peels, cardboard delivery boxes,
 * grease stain decals, table crumbs, and rising animated steam particle system.
 */

import * as THREE from 'three';
import { SimplexNoise, defaultNoise } from '../utils/simplex-noise.js';

export class PropsEngine {
  constructor() {
    this.noise = defaultNoise;
    this.rootGroup = new THREE.Group();
    this.rootGroup.name = 'PropsRoot';

    this.steamParticles = null;
    this.steamData = [];
    this.steamTime = 0;
  }

  /**
   * Generates procedural wood grain texture for the pizza peel
   */
  generateWoodTexture() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');

    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;

        // Wood grain rings + fine fibers
        const grain = this.noise.noise2D(x * 0.005, y * 0.05) * 20;
        const ring = Math.sin((x + grain) * 0.08) * 15;
        const fiber = this.noise.noise2D(x * 0.3, y * 0.02) * 8;

        let r = 180 + ring + fiber;
        let g = 130 + ring * 0.8 + fiber;
        let b = 80 + ring * 0.5 + fiber;

        data[idx] = Math.min(255, Math.max(0, r));
        data[idx + 1] = Math.min(255, Math.max(0, g));
        data[idx + 2] = Math.min(255, Math.max(0, b));
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }

  /**
   * Generates cardboard texture with customizable grease stain ring
   */
  generateCardboardTexture(greaseIntensity = 0.4) {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');

    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const nx = x / size - 0.5;
        const ny = y / size - 0.5;
        const dist = Math.sqrt(nx * nx + ny * ny) * 2.0;

        // Kraft paper noise
        const paperNoise = this.noise.noise2D(x * 0.1, y * 0.1) * 8;
        let r = 195 + paperNoise;
        let g = 160 + paperNoise * 0.8;
        let b = 115 + paperNoise * 0.6;

        // Translucent dark oil saturation stain
        if (greaseIntensity > 0.01 && dist < 0.85) {
          const stainNoise = this.noise.noise2D(nx * 8.0, ny * 8.0) * 0.1;
          const falloff = Math.max(0, 1.0 - (dist + stainNoise) / 0.85);
          const stainAmount = falloff * greaseIntensity;

          // Grease darkens and saturates paper
          r = r * (1.0 - stainAmount * 0.45);
          g = g * (1.0 - stainAmount * 0.55);
          b = b * (1.0 - stainAmount * 0.70);
        }

        data[idx] = Math.min(255, Math.max(0, r));
        data[idx + 1] = Math.min(255, Math.max(0, g));
        data[idx + 2] = Math.min(255, Math.max(0, b));
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }

  /**
   * Builds the selected 3D prop container
   */
  updateProps(params) {
    // Clear existing
    while (this.rootGroup.children.length > 0) {
      const child = this.rootGroup.children[0];
      this.rootGroup.remove(child);
      if (child.geometry) child.geometry.dispose();
    }

    const containerType = params.prop_container || 'Rustic Wooden Peel';
    const greaseStains = params.prop_box_stains !== undefined ? params.prop_box_stains : 0.4;
    const crumbCount = params.prop_crumbs !== undefined ? params.prop_crumbs : 12;

    const baseRadius = (params.geo_radius || 30.0) * 0.05;
    const propSize = baseRadius * 1.35;

    if (containerType === 'Rustic Wooden Peel') {
      const peelGroup = new THREE.Group();
      const woodTex = this.generateWoodTexture();
      const woodMat = new THREE.MeshStandardMaterial({
        map: woodTex,
        roughness: 0.65,
        metalness: 0.05
      });

      // Paddle disk
      const paddleGeom = new THREE.CylinderGeometry(propSize, propSize * 0.98, 0.04, 32);
      const paddle = new THREE.Mesh(paddleGeom, woodMat);
      paddle.position.y = -0.025;
      paddle.receiveShadow = true;
      peelGroup.add(paddle);

      // Handle
      const handleGeom = new THREE.BoxGeometry(0.18, 0.038, propSize * 1.1);
      const handle = new THREE.Mesh(handleGeom, woodMat);
      handle.position.set(0, -0.025, propSize * 1.0);
      handle.receiveShadow = true;
      peelGroup.add(handle);

      this.rootGroup.add(peelGroup);
    } else if (containerType === 'Cardboard Delivery Box') {
      const boxGroup = new THREE.Group();
      const cardTex = this.generateCardboardTexture(greaseStains);
      const cardMat = new THREE.MeshStandardMaterial({
        map: cardTex,
        roughness: 0.85,
        metalness: 0.0
      });

      const boxW = propSize * 2.1;
      const boxH = 0.22;

      // Bottom Tray
      const trayGeom = new THREE.BoxGeometry(boxW, 0.02, boxW);
      const tray = new THREE.Mesh(trayGeom, cardMat);
      tray.position.y = -0.015;
      tray.receiveShadow = true;
      boxGroup.add(tray);

      // Side Walls
      const wallMat = new THREE.MeshStandardMaterial({ color: 0xD4B588, roughness: 0.9 });
      const wallBack = new THREE.Mesh(new THREE.BoxGeometry(boxW, boxH, 0.02), wallMat);
      wallBack.position.set(0, boxH / 2 - 0.015, -boxW / 2);
      boxGroup.add(wallBack);

      const wallLeft = new THREE.Mesh(new THREE.BoxGeometry(0.02, boxH, boxW), wallMat);
      wallLeft.position.set(-boxW / 2, boxH / 2 - 0.015, 0);
      boxGroup.add(wallLeft);

      const wallRight = new THREE.Mesh(new THREE.BoxGeometry(0.02, boxH, boxW), wallMat);
      wallRight.position.set(boxW / 2, boxH / 2 - 0.015, 0);
      boxGroup.add(wallRight);

      // Open angled Lid
      const lid = new THREE.Mesh(new THREE.BoxGeometry(boxW, 0.02, boxW), cardMat);
      lid.position.set(0, boxH, -boxW / 2);
      lid.rotation.x = -Math.PI * 0.65; // Angled back open
      lid.castShadow = true;
      boxGroup.add(lid);

      this.rootGroup.add(boxGroup);
    } else if (containerType === 'White Ceramic Plate') {
      const plateMat = new THREE.MeshStandardMaterial({
        color: 0xFAFAFA,
        roughness: 0.15,
        metalness: 0.05
      });
      const plateGeom = new THREE.CylinderGeometry(propSize * 1.05, propSize * 0.85, 0.04, 32);
      const plate = new THREE.Mesh(plateGeom, plateMat);
      plate.position.y = -0.025;
      plate.receiveShadow = true;
      this.rootGroup.add(plate);
    } else if (containerType === 'Steel Diner Pan') {
      const steelMat = new THREE.MeshStandardMaterial({
        color: 0x2A2C30,
        roughness: 0.35,
        metalness: 0.75
      });
      const panGeom = new THREE.CylinderGeometry(propSize * 1.02, propSize * 0.95, 0.06, 32);
      const pan = new THREE.Mesh(panGeom, steelMat);
      pan.position.y = -0.035;
      pan.receiveShadow = true;
      this.rootGroup.add(pan);
    } else if (containerType === 'Oven Wire Rack') {
      const chromeMat = new THREE.MeshStandardMaterial({
        color: 0xCCCCCC,
        roughness: 0.2,
        metalness: 0.9
      });
      const rackGroup = new THREE.Group();
      const numWires = 18;
      for (let i = 0; i < numWires; i++) {
        const wireZ = ((i / (numWires - 1)) - 0.5) * propSize * 2.0;
        const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, propSize * 2.0, 8), chromeMat);
        wire.rotation.z = Math.PI / 2;
        wire.position.set(0, -0.015, wireZ);
        rackGroup.add(wire);
      }
      this.rootGroup.add(rackGroup);
    }

    // Spawn Table Crumbs
    if (crumbCount > 0 && containerType !== 'None (Floating)') {
      const crumbMat = new THREE.MeshStandardMaterial({ color: 0xD4A054, roughness: 0.9 });
      for (let i = 0; i < crumbCount; i++) {
        const angle = (i * 57.3 * Math.PI) / 180;
        const dist = baseRadius * (1.05 + (i % 5) * 0.06);
        const size = 0.008 + (i % 3) * 0.004;
        const crumb = new THREE.Mesh(new THREE.DodecahedronGeometry(size, 0), crumbMat);
        crumb.position.set(dist * Math.cos(angle), -0.005, dist * Math.sin(angle));
        crumb.rotation.set(Math.random(), Math.random(), Math.random());
        crumb.castShadow = true;
        this.rootGroup.add(crumb);
      }
    }

    // Build Steam Particle System
    this.buildSteamEmitter(params);
  }

  /**
   * Builds animated rising thermal steam particle cloud
   */
  buildSteamEmitter(params) {
    if (this.steamParticles) {
      this.rootGroup.remove(this.steamParticles);
      this.steamParticles.geometry.dispose();
      this.steamParticles = null;
    }

    const intensity = params.fx_steam_intensity !== undefined ? params.fx_steam_intensity : 0.35;
    if (intensity <= 0.01) return;

    const particleCount = Math.round(45 * intensity);
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);
    this.steamData = [];

    const baseRadius = (params.geo_radius || 30.0) * 0.05 * 0.7;

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * baseRadius;
      const x = r * Math.cos(angle);
      const z = r * Math.sin(angle);
      const y = 0.05 + Math.random() * 0.8;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      scales[i] = 0.08 + Math.random() * 0.12;

      this.steamData.push({
        baseX: x,
        baseZ: z,
        speedY: 0.25 + Math.random() * 0.35,
        driftPhase: Math.random() * Math.PI * 2,
        life: Math.random(),
        maxLife: 1.5 + Math.random() * 1.0
      });
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Soft puff texture
    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    grad.addColorStop(0.5, 'rgba(240, 240, 240, 0.2)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const steamTex = new THREE.CanvasTexture(canvas);

    const mat = new THREE.PointsMaterial({
      map: steamTex,
      size: 0.45,
      transparent: true,
      opacity: 0.4 * intensity,
      depthWrite: false,
      blending: THREE.NormalBlending
    });

    this.steamParticles = new THREE.Points(geom, mat);
    this.rootGroup.add(this.steamParticles);
  }

  /**
   * Called every frame in the render loop to animate rising steam
   */
  update(delta) {
    if (!this.steamParticles || this.steamData.length === 0) return;

    this.steamTime += delta;
    const posAttr = this.steamParticles.geometry.attributes.position;
    const positions = posAttr.array;

    for (let i = 0; i < this.steamData.length; i++) {
      const data = this.steamData[i];
      data.life += delta;

      if (data.life > data.maxLife) {
        data.life = 0;
        positions[i * 3 + 1] = 0.05;
      } else {
        positions[i * 3 + 1] += data.speedY * delta;
        // Horizontal turbulent drift
        positions[i * 3] = data.baseX + Math.sin(this.steamTime * 2.0 + data.driftPhase) * 0.06;
        positions[i * 3 + 2] = data.baseZ + Math.cos(this.steamTime * 1.5 + data.driftPhase) * 0.06;
      }
    }

    posAttr.needsUpdate = true;
  }
}

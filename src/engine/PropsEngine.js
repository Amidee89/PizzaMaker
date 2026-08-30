/**
 * 3D Props & Atmosphere Engine.
 * Builds procedural plates, wooden peels, cardboard delivery boxes,
 * grease stain decals, table crumbs, and rising animated steam particle system.
 * Supports grease stains and oil rings on all plate/board surfaces, expanded steam density,
 * and high-count toasted table crumbs.
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

    this.skyboxCache = new Map();
    this.textureLoader = new THREE.TextureLoader();
    this.currentScene = null;
    this.currentImagePath = null;
  }

  /**
   * Loads 360 equirectangular skybox texture from skybox/ image directory
   */
  loadSkyboxTexture(imagePath) {
    if (!imagePath) return null;
    const randomOffset = Math.random();

    if (this.skyboxCache.has(imagePath)) {
      const tex = this.skyboxCache.get(imagePath);
      tex.offset.x = randomOffset;
      tex.needsUpdate = true;
      return tex;
    }

    const texture = this.textureLoader.load(imagePath, (tex) => {
      tex.mapping = THREE.EquirectangularReflectionMapping;
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.RepeatWrapping;
      tex.offset.x = randomOffset;
      tex.needsUpdate = true;
      if (this.currentScene && this.currentImagePath === imagePath) {
        this.currentScene.background = tex;
        this.currentScene.environment = tex;
      }
    });

    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.offset.x = randomOffset;
    this.skyboxCache.set(imagePath, texture);
    return texture;
  }

  /**
   * Generates procedural wood grain texture with customizable grease stain rings
   */
  generateWoodTexture(greaseIntensity = 0.4) {
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

        // Wood grain rings + fine fibers
        const grain = this.noise.noise2D(x * 0.005, y * 0.05) * 20;
        const ring = Math.sin((x + grain) * 0.08) * 15;
        const fiber = this.noise.noise2D(x * 0.3, y * 0.02) * 8;

        let r = 180 + ring + fiber;
        let g = 130 + ring * 0.8 + fiber;
        let b = 80 + ring * 0.5 + fiber;

        // Oil saturation / grease soak ring on wood
        if (greaseIntensity > 0.01 && dist < 0.95) {
          const stainNoise = this.noise.noise2D(nx * 7.0, ny * 7.0) * 0.12;
          const falloff = Math.max(0, 1.0 - (dist + stainNoise) / 0.95);
          const stainAmount = falloff * greaseIntensity;

          r = r * (1.0 - stainAmount * 0.42);
          g = g * (1.0 - stainAmount * 0.48);
          b = b * (1.0 - stainAmount * 0.65);
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
   * Generates stone terrace tile texture
   */
  generateStoneTexture() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const n1 = this.noise.noise2D(x * 0.02, y * 0.02) * 25;
        const n2 = this.noise.noise2D(x * 0.1, y * 0.1) * 12;

        let r = 160 + n1 + n2;
        let g = 145 + n1 + n2;
        let b = 130 + n1 + n2;

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

        const paperNoise = this.noise.noise2D(x * 0.1, y * 0.1) * 8;
        let r = 195 + paperNoise;
        let g = 160 + paperNoise * 0.8;
        let b = 115 + paperNoise * 0.6;

        if (greaseIntensity > 0.01 && dist < 0.92) {
          const stainNoise = this.noise.noise2D(nx * 8.0, ny * 8.0) * 0.12;
          const falloff = Math.max(0, 1.0 - (dist + stainNoise) / 0.92);
          const stainAmount = falloff * greaseIntensity;

          r = r * (1.0 - stainAmount * 0.50);
          g = g * (1.0 - stainAmount * 0.60);
          b = b * (1.0 - stainAmount * 0.75);
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
   * Generates Ceramic Plate / Pan texture with oil sheen rings
   */
  generatePlateTexture(baseColorHex, greaseIntensity = 0.4) {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');

    const baseRgb = hexToRgb(baseColorHex);
    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const nx = x / size - 0.5;
        const ny = y / size - 0.5;
        const dist = Math.sqrt(nx * nx + ny * ny) * 2.0;

        let r = baseRgb.r;
        let g = baseRgb.g;
        let b = baseRgb.b;

        if (greaseIntensity > 0.01 && dist < 0.90) {
          const stainNoise = this.noise.noise2D(nx * 6.0, ny * 6.0) * 0.08;
          const falloff = Math.max(0, 1.0 - (dist + stainNoise) / 0.90);
          const stain = falloff * greaseIntensity;

          // Golden glistening oil tint
          r = r * (1.0 - stain * 0.15) + 215 * stain * 0.25;
          g = g * (1.0 - stain * 0.20) + 160 * stain * 0.25;
          b = b * (1.0 - stain * 0.45) + 40 * stain * 0.25;
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
   * Builds the selected 3D prop container and environment
   */
  updateProps(params, scene) {
    while (this.rootGroup.children.length > 0) {
      const child = this.rootGroup.children[0];
      this.rootGroup.remove(child);
      if (child.geometry) child.geometry.dispose();
    }

    const containerType = params.prop_container || 'Rustic Wooden Peel';
    const greaseStains = params.prop_box_stains !== undefined ? params.prop_box_stains : 0.50;
    const crumbCount = params.prop_crumbs !== undefined ? params.prop_crumbs : 25;

    const baseRadius = (params.geo_radius || 30.0) * 0.05;
    const fractalReps = Math.max(0, Math.min(6, Math.round(params.geo_fractal_reps || 0)));
    const fractalRatio = Math.max(0.15, Math.min(0.85, params.geo_fractal_ratio || 0.40));
    const fractalAngleDeg = params.geo_fractal_angle !== undefined ? params.geo_fractal_angle : 0;
    const fractalAngleRad = (fractalAngleDeg * Math.PI) / 180;

    // Compute bounding box of all fractal child centers
    let minX = -baseRadius, maxX = baseRadius;
    let minZ = -baseRadius, maxZ = baseRadius;
    let cx = 0, cz = 0, heading = 0;
    let currScale = 1.0;
    let prevR = baseRadius;
    for (let k = 1; k <= fractalReps; k++) {
      currScale *= fractalRatio;
      const childR = baseRadius * currScale;
      const gap = prevR + childR * 0.96;
      cx += gap * Math.cos(heading);
      cz += gap * Math.sin(heading);
      minX = Math.min(minX, cx - childR);
      maxX = Math.max(maxX, cx + childR);
      minZ = Math.min(minZ, cz - childR);
      maxZ = Math.max(maxZ, cz + childR);
      prevR = childR;
      heading += fractalAngleRad;
    }

    const centerShiftX = (minX + maxX) / 2;
    const centerShiftZ = (minZ + maxZ) / 2;
    const spanX = maxX - minX;
    const spanZ = maxZ - minZ;
    const propSize = Math.max(spanX, spanZ) * 0.65 + 0.05;

    if (containerType === 'Rustic Wooden Peel') {
      const peelGroup = new THREE.Group();
      peelGroup.position.set(centerShiftX, 0, centerShiftZ);
      const woodTex = this.generateWoodTexture(greaseStains);
      const woodMat = new THREE.MeshStandardMaterial({
        map: woodTex,
        roughness: 0.60,
        metalness: 0.05
      });

      const paddleGeom = new THREE.CylinderGeometry(propSize, propSize * 0.98, 0.04, 36);
      const paddle = new THREE.Mesh(paddleGeom, woodMat);
      paddle.position.y = -0.025;
      paddle.receiveShadow = true;
      peelGroup.add(paddle);

      const handleGeom = new THREE.BoxGeometry(0.18, 0.038, propSize * 1.1);
      const handle = new THREE.Mesh(handleGeom, woodMat);
      handle.position.set(0, -0.025, propSize * 1.0);
      handle.receiveShadow = true;
      peelGroup.add(handle);

      this.rootGroup.add(peelGroup);
    } else if (containerType === 'Cardboard Delivery Box') {
      const boxGroup = new THREE.Group();
      boxGroup.position.set(centerShiftX, 0, centerShiftZ);
      const cardTex = this.generateCardboardTexture(greaseStains);
      const cardMat = new THREE.MeshStandardMaterial({
        map: cardTex,
        roughness: 0.85,
        metalness: 0.0
      });

      const boxW = propSize * 2.1;
      const boxH = 0.22;

      const trayGeom = new THREE.BoxGeometry(boxW, 0.02, boxW);
      const tray = new THREE.Mesh(trayGeom, cardMat);
      tray.position.y = -0.015;
      tray.receiveShadow = true;
      boxGroup.add(tray);

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

      // Lid hinges from the back edge of the box
      const lidAngleDeg = params.prop_box_lid_angle !== undefined ? params.prop_box_lid_angle : 115;
      const lidAngleRad = (lidAngleDeg / 180) * Math.PI;

      const lidPivot = new THREE.Group();
      lidPivot.position.set(0, boxH - 0.015, -boxW / 2);

      const lid = new THREE.Mesh(new THREE.BoxGeometry(boxW, 0.02, boxW), cardMat);
      lid.position.set(0, 0, boxW / 2);
      lid.castShadow = true;

      lidPivot.rotation.x = -lidAngleRad;
      lidPivot.add(lid);
      boxGroup.add(lidPivot);

      this.rootGroup.add(boxGroup);
    } else if (containerType === 'White Ceramic Plate') {
      const plateTex = this.generatePlateTexture('#FAFAFA', greaseStains);
      const plateMat = new THREE.MeshStandardMaterial({
        map: plateTex,
        roughness: 0.18,
        metalness: 0.05
      });
      const plateGeom = new THREE.CylinderGeometry(propSize * 1.05, propSize * 0.85, 0.04, 36);
      const plate = new THREE.Mesh(plateGeom, plateMat);
      plate.position.set(centerShiftX, -0.025, centerShiftZ);
      plate.receiveShadow = true;
      this.rootGroup.add(plate);
    } else if (containerType === 'Steel Diner Pan') {
      const panTex = this.generatePlateTexture('#2A2C30', greaseStains);
      const steelMat = new THREE.MeshStandardMaterial({
        map: panTex,
        roughness: 0.35,
        metalness: 0.75
      });
      const panGeom = new THREE.CylinderGeometry(propSize * 1.02, propSize * 0.95, 0.06, 36);
      const pan = new THREE.Mesh(panGeom, steelMat);
      pan.position.set(centerShiftX, -0.035, centerShiftZ);
      pan.receiveShadow = true;
      this.rootGroup.add(pan);
    } else if (containerType === 'Oven Wire Rack') {
      const chromeMat = new THREE.MeshStandardMaterial({
        color: 0xCCCCCC,
        roughness: 0.2,
        metalness: 0.9
      });
      const rackGroup = new THREE.Group();
      rackGroup.position.set(centerShiftX, 0, centerShiftZ);
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

    // Spawn Table Crust Crumbs & Char Specks (Up to 150)
    if (crumbCount > 0 && containerType !== 'None (Floating)') {
      const crumbGeom = new THREE.DodecahedronGeometry(0.010, 0);
      const crumbMat1 = new THREE.MeshStandardMaterial({ color: 0xD4A054, roughness: 0.9 });
      const crumbMat2 = new THREE.MeshStandardMaterial({ color: 0x6E3E1A, roughness: 0.9 });
      const crumbMat3 = new THREE.MeshStandardMaterial({ color: 0x24160E, roughness: 0.85 });

      for (let i = 0; i < crumbCount; i++) {
        const angle = (i * 47.3 * Math.PI) / 180;
        const dist = propSize * (0.80 + (i % 7) * 0.04);
        const sizeScale = 0.5 + (i % 5) * 0.25;

        const mat = i % 4 === 0 ? crumbMat3 : (i % 2 === 0 ? crumbMat2 : crumbMat1);
        const crumb = new THREE.Mesh(crumbGeom, mat);
        crumb.scale.set(sizeScale, sizeScale * 0.7, sizeScale);
        crumb.position.set(centerShiftX + dist * Math.cos(angle), -0.005, centerShiftZ + dist * Math.sin(angle));
        crumb.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
        crumb.castShadow = true;
        this.rootGroup.add(crumb);
      }
    }

    // Build Steam Emitter
    this.buildSteamEmitter(params);

    // Build background environment and skybox
    this.buildEnvironment(params, scene);
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

    const intensity = params.fx_steam_intensity !== undefined ? params.fx_steam_intensity : 0.50;
    if (intensity <= 0.01) return;

    const particleCount = Math.round(90 * intensity);
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);
    this.steamData = [];

    const baseRadius = (params.geo_radius || 30.0) * 0.05 * 0.75;

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * baseRadius;
      const x = r * Math.cos(angle);
      const z = r * Math.sin(angle);
      const y = 0.05 + Math.random() * 0.9;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      scales[i] = 0.12 + Math.random() * 0.16;

      this.steamData.push({
        baseX: x,
        baseZ: z,
        speedY: 0.30 + Math.random() * 0.45,
        driftPhase: Math.random() * Math.PI * 2,
        life: Math.random(),
        maxLife: 1.6 + Math.random() * 1.2
      });
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
    grad.addColorStop(0.4, 'rgba(245, 245, 245, 0.28)');
    grad.addColorStop(0.8, 'rgba(235, 235, 235, 0.08)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const steamTex = new THREE.CanvasTexture(canvas);

    const mat = new THREE.PointsMaterial({
      map: steamTex,
      size: 0.55,
      transparent: true,
      opacity: Math.min(0.65, 0.35 * intensity + 0.1),
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
        positions[i * 3] = data.baseX + Math.sin(this.steamTime * 2.2 + data.driftPhase) * 0.08;
        positions[i * 3 + 2] = data.baseZ + Math.cos(this.steamTime * 1.7 + data.driftPhase) * 0.08;
      }
    }

    posAttr.needsUpdate = true;
  }

  /**
   * Generates deep smoked charcoal timber & slate countertop texture for table
   * Provides high contrast against golden wooden peels and ceramic plates
   */
  generateTableTexture() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const grain = this.noise.noise2D(x * 0.008, y * 0.05) * 8;
        const fiber = this.noise.noise2D(x * 0.3, y * 0.02) * 5;
        const slate = this.noise.noise2D(x * 0.03, y * 0.03) * 6;

        let r = 42 + grain + fiber + slate;
        let g = 38 + grain * 0.9 + fiber + slate;
        let b = 34 + grain * 0.8 + fiber + slate;

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
   * Builds the selected background environment and skybox
   */
  buildEnvironment(params = {}, scene = null) {
    const prevEnv = this.rootGroup.getObjectByName('EnvironmentGroup');
    if (prevEnv) {
      this.rootGroup.remove(prevEnv);
    }

    const envType = params.prop_environment || 'Bright Modern Room';

    const envGroup = new THREE.Group();
    envGroup.name = 'EnvironmentGroup';

    const SKYBOX_FILE_MAP = {
      'Commercial Kitchen': 'skybox/kitchen.jpg',
      'Bright Modern Room': 'skybox/bright_room.jpg',
      'Cozy Living Room': 'skybox/livingroom.jpg',
      'House Terrace': 'skybox/house.jpg',
      'Aerial Drone Panorama': 'skybox/drone.jpg',
      'Blue Sky & Mountains': 'skybox/sky_1.png',
      'Sunset Cloudscape': 'skybox/sky_2.png',
      'Golden Sunset Sky': 'skybox/sky_3.png',
      // Legacy aliases for saved recipe JSONs:
      'Sunset Amalfi (Skybox)': 'skybox/sky_3.png',
      'Sunny Terrace (Skybox)': 'skybox/sky_1.png',
      'Campfire Night (Skybox)': 'skybox/drone.jpg',
      'Modern Studio (Skybox)': 'skybox/bright_room.jpg',
      'Rustic Pizzeria Room': 'skybox/kitchen.jpg'
    };

    if (envType === 'Minimal Dark Void') {
      if (scene) {
        scene.background = new THREE.Color(0x0A0C10);
        scene.environment = null;
        scene.fog = null;
      }
    } else {
      const filePath = SKYBOX_FILE_MAP[envType] || 'skybox/bright_room.jpg';
      if (scene) {
        this.currentScene = scene;
        this.currentImagePath = filePath;
        const tex = this.loadSkyboxTexture(filePath);
        scene.background = tex;
        scene.environment = tex;
        scene.fog = null;

        const randomAngle = Math.random() * Math.PI * 2;
        if (scene.backgroundRotation) scene.backgroundRotation.y = randomAngle;
        if (scene.environmentRotation) scene.environmentRotation.y = randomAngle;
      }

      // Countertop / table surface (Dark charcoal smoked timber for high contrast with warm wooden peel)
      const tableTex = this.generateTableTexture();
      tableTex.wrapS = THREE.RepeatWrapping;
      tableTex.wrapT = THREE.RepeatWrapping;
      tableTex.repeat.set(4, 4);
      const tableMat = new THREE.MeshStandardMaterial({
        map: tableTex,
        roughness: 0.50,
        metalness: 0.10
      });

      const table = new THREE.Mesh(new THREE.BoxGeometry(10, 0.08, 10), tableMat);
      table.position.set(0, -0.09, 0);
      table.receiveShadow = true;
      envGroup.add(table);
    }

    this.rootGroup.add(envGroup);
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

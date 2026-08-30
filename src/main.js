/**
 * Main Bootstrap & Application Coordinator for PizzaMaker 3D.
 * Connects Three.js WebGL Rendering, OrbitControls, Raycasting,
 * Generator Engines, and UI Managers with requestAnimationFrame throttled updates.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

import { PARAM_DEFINITIONS } from './config/parameters.js';
import { PRESETS } from './config/presets.js';
import { MaterialManager } from './engine/Materials.js';
import { PizzaGenerator } from './engine/PizzaGenerator.js';
import { ToppingsEngine } from './engine/ToppingsEngine.js';
import { SeasoningEngine } from './engine/SeasoningEngine.js';
import { PropsEngine } from './engine/PropsEngine.js';
import { UIManager } from './ui/UIManager.js';
import { PresetManager } from './ui/PresetManager.js';

export class PizzaMakerApp {
  constructor() {
    this.canvas = document.getElementById('webglCanvas');
    this.params = {};
    this.toppings = [];
    this.seasonings = [];
    this.clock = new THREE.Clock();
    this.isAutoRotating = false;

    // Raycasting
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // rAF Throttle / Batching flag
    this.pendingRebuild = false;
    this.pendingToppings = false;

    // Initialize Default Parameters
    for (const [key, def] of Object.entries(PARAM_DEFINITIONS)) {
      this.params[key] = def.default;
    }

    // Default Neapolitan Toppings & Seasonings
    this.toppings = [
      { type: 'mozzarella_pearls', count: 9, scale: 1.1 },
      { type: 'basil', count: 8, scale: 1.1 }
    ];

    this.seasonings = [
      { type: 'evoo', density: 70, spreadMode: 'Spiral Swirl', randomness: 0.4 },
      { type: 'oregano', density: 40, spreadMode: 'Uniform Scatter', randomness: 0.5 }
    ];

    this.initThree();
    this.initEngines();
    this.initUI();
    this.setupEvents();
    this.animate();

    // Hide loader
    const loader = document.getElementById('loadingOverlay');
    if (loader) {
      setTimeout(() => loader.classList.add('hidden'), 350);
    }
  }

  initThree() {
    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1A1210);
    this.scene.fog = new THREE.FogExp2(0x1A1210, 0.08);

    // 2. Camera
    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50);
    this.camera.position.set(0, 2.2, 3.2);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    // 4. Controls (Allows complete 360 inspection including underneath)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI - 0.08;
    this.controls.minDistance = 0.8;
    this.controls.maxDistance = 8.0;
    this.controls.target.set(0, 0.1, 0);

    // 5. Lighting Setup (Studio Warm Pizzeria + Underside Bounce)
    this.setupLighting();

    // 6. Floor Shadow Receiver
    const floorGeom = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    this.floorMesh = new THREE.Mesh(floorGeom, floorMat);
    this.floorMesh.rotation.x = -Math.PI / 2;
    this.floorMesh.position.y = -0.04;
    this.floorMesh.receiveShadow = true;
    this.scene.add(this.floorMesh);
  }

  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xFFEEDD, 0.7);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xFFFAF0, 2.2);
    keyLight.position.set(3, 5, 3);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 15;
    keyLight.shadow.camera.left = -2.5;
    keyLight.shadow.camera.right = 2.5;
    keyLight.shadow.camera.top = 2.5;
    keyLight.shadow.camera.bottom = -2.5;
    keyLight.shadow.bias = -0.0005;
    this.scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xAACCFF, 1.2);
    rimLight.position.set(-3, 3, -3);
    this.scene.add(rimLight);

    const ovenLight = new THREE.PointLight(0xFF6600, 1.0, 6);
    ovenLight.position.set(-2, 1.5, 2);
    this.scene.add(ovenLight);

    // Warm underside bounce light to brightly illuminate the bottom under-bake and stone scorch marks
    const bottomBounceLight = new THREE.DirectionalLight(0xFFE5CC, 0.95);
    bottomBounceLight.position.set(0, -6, 0);
    this.scene.add(bottomBounceLight);
  }

  initEngines() {
    this.materialManager = new MaterialManager();
    this.pizzaGenerator = new PizzaGenerator(this.materialManager);
    this.toppingsEngine = new ToppingsEngine(this.pizzaGenerator);
    this.seasoningEngine = new SeasoningEngine(this.pizzaGenerator);
    this.propsEngine = new PropsEngine();

    this.scene.add(this.propsEngine.rootGroup);
    this.scene.add(this.pizzaGenerator.rootGroup);

    this.rebuildFullPizza();
  }

  initUI() {
    this.presetManager = new PresetManager(this);
    this.uiManager = new UIManager(this);
    this.uiManager.init();

    this.presetManager.loadPreset('neapolitan');
  }

  rebuildFullPizza() {
    // 1. Build Base Pizza & Slices
    this.pizzaGenerator.generatePizza(this.params);

    // 2. Build Toppings
    this.toppingsEngine.scatterToppings(this.toppings, this.params);

    // 3. Build Seasonings
    this.seasoningEngine.scatterSeasonings(this.seasonings, this.params);

    // 4. Build Props & Steam & Environment Skybox
    this.propsEngine.updateProps(this.params, this.scene);
  }

  rebuildToppings() {
    this.toppingsEngine.scatterToppings(this.toppings, this.params);
    this.seasoningEngine.scatterSeasonings(this.seasonings, this.params);
  }

  scheduleRebuild() {
    if (this.pendingRebuild) return;
    this.pendingRebuild = true;
    requestAnimationFrame(() => {
      this.rebuildFullPizza();
      this.pendingRebuild = false;
    });
  }

  scheduleToppingsRebuild() {
    if (this.pendingToppings) return;
    this.pendingToppings = true;
    requestAnimationFrame(() => {
      this.rebuildToppings();
      this.pendingToppings = false;
    });
  }

  updateParameters(newParams, newToppings, newSeasonings) {
    Object.assign(this.params, newParams);
    if (newToppings) this.toppings = JSON.parse(JSON.stringify(newToppings));
    if (newSeasonings) this.seasonings = JSON.parse(JSON.stringify(newSeasonings));
    this.rebuildFullPizza();
  }

  updateSingleParameter(key, value) {
    this.params[key] = value;

    if (key === 'slice_pull_offset' || key === 'slice_pull_index' || key === 'slice_visible_count') {
      this.updateSliceTransforms();
    } else if (key.startsWith('prop_') || key.startsWith('fx_')) {
      this.propsEngine.updateProps(this.params, this.scene);
    } else if (key.startsWith('season_')) {
      this.scheduleToppingsRebuild();
    } else {
      this.scheduleRebuild();
    }
  }

  updateSliceTransforms() {
    const totalSlices = Math.round(this.params.slice_total || 8);
    const visibleSlices = Math.round(this.params.slice_visible_count || totalSlices);
    const pullOffset = (this.params.slice_pull_offset || 0) * 0.05;
    const pullIndex = (this.params.slice_pull_index || 1) - 1;

    for (const slice of this.pizzaGenerator.slices) {
      const si = slice.sliceIndex;
      slice.wedgeGroup.visible = si < visibleSlices;

      const midAngle = slice.midAngle;
      if (si === pullIndex && pullOffset > 0.001 && isFinite(midAngle)) {
        // Pure radial outward slide along the pizza plane
        slice.wedgeGroup.position.x = pullOffset * Math.cos(midAngle);
        slice.wedgeGroup.position.z = pullOffset * Math.sin(midAngle);
        slice.wedgeGroup.position.y = 0;
        slice.wedgeGroup.rotation.x = 0;
        slice.wedgeGroup.rotation.y = 0;
        slice.wedgeGroup.rotation.z = 0;
      } else {
        slice.wedgeGroup.position.x = 0;
        slice.wedgeGroup.position.z = 0;
        slice.wedgeGroup.position.y = 0;
        slice.wedgeGroup.rotation.x = 0;
        slice.wedgeGroup.rotation.y = 0;
        slice.wedgeGroup.rotation.z = 0;
      }
    }
  }

  addToppingLayer(type = 'pepperoni', count = 16, scale = 1.0) {
    this.toppings.push({ type, count, scale });
    this.scheduleToppingsRebuild();
  }

  removeToppingLayer(index) {
    if (index >= 0 && index < this.toppings.length) {
      this.toppings.splice(index, 1);
      this.scheduleToppingsRebuild();
    }
  }

  addSeasoningLayer(type = 'oregano', density = 100, spreadMode = 'Uniform Scatter', randomness = 0.5) {
    this.seasonings.push({ type, density, spreadMode, randomness });
    this.scheduleToppingsRebuild();
  }

  removeSeasoningLayer(index) {
    if (index >= 0 && index < this.seasonings.length) {
      this.seasonings.splice(index, 1);
      this.scheduleToppingsRebuild();
    }
  }

  setCameraView(mode) {
    if (mode === 'top') {
      this.animateCameraTo(new THREE.Vector3(0, 3.8, 0.01), new THREE.Vector3(0, 0, 0));
    } else if (mode === 'close') {
      this.animateCameraTo(new THREE.Vector3(1.2, 0.6, 1.2), new THREE.Vector3(0.3, 0.1, 0.3));
    } else {
      // Hero 45°
      this.animateCameraTo(new THREE.Vector3(0, 2.2, 3.2), new THREE.Vector3(0, 0.1, 0));
    }
  }

  animateCameraTo(targetPos, targetLookAt) {
    const startPos = this.camera.position.clone();
    const startTarget = this.controls.target.clone();
    let progress = 0;

    const tween = () => {
      progress += 0.04;
      if (progress <= 1.0) {
        const ease = 0.5 - 0.5 * Math.cos(progress * Math.PI);
        this.camera.position.lerpVectors(startPos, targetPos, ease);
        this.controls.target.lerpVectors(startTarget, targetLookAt, ease);
        requestAnimationFrame(tween);
      } else {
        this.camera.position.copy(targetPos);
        this.controls.target.copy(targetLookAt);
      }
    };
    tween();
  }

  toggleAutoRotate() {
    this.isAutoRotating = !this.isAutoRotating;
    this.controls.autoRotate = this.isAutoRotating;
    this.controls.autoRotateSpeed = 1.5;
    return this.isAutoRotating;
  }

  takeSnapshot() {
    this.renderer.render(this.scene, this.camera);
    const dataURL = this.canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'pizza_artisan_3d.png';
    link.href = dataURL;
    link.click();
    this.showToast('📸 HD Snapshot downloaded!');
  }

  exportGLTF() {
    const exporter = new GLTFExporter();
    this.showToast('💾 Preparing 3D GLTF Export...');

    exporter.parse(
      this.pizzaGenerator.rootGroup,
      (gltf) => {
        const blob = new Blob([JSON.stringify(gltf, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.download = 'pizza_model.gltf';
        link.href = URL.createObjectURL(blob);
        link.click();
        this.showToast('✅ 3D Pizza exported as GLTF!');
      },
      (error) => {
        console.error('Error exporting GLTF:', error);
        this.showToast('❌ Export failed');
      },
      { binary: false }
    );
  }

  copyRecipeJSON() {
    const recipe = {
      name: 'Custom Artisanal Pizza',
      date: new Date().toISOString(),
      parameters: this.params,
      toppings: this.toppings,
      seasonings: this.seasonings
    };
    navigator.clipboard.writeText(JSON.stringify(recipe, null, 2))
      .then(() => this.showToast('📋 Recipe JSON copied to clipboard!'))
      .catch(() => this.showToast('❌ Failed to copy to clipboard'));
  }

  importRecipeJSON(jsonStr) {
    try {
      const data = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
      const params = data.parameters || data.params;
      if (!params) {
        this.showToast('❌ Invalid Recipe JSON: missing parameters');
        return false;
      }
      const toppings = data.toppings || [];
      const seasonings = data.seasonings || [];
      this.updateParameters(params, toppings, seasonings);
      this.uiManager.syncUIValues(this.params, this.toppings, this.seasonings);
      this.showToast(`🍕 Loaded Recipe: ${data.name || 'Artisanal Pizza'}!`);
      return true;
    } catch (e) {
      console.error('Error importing recipe:', e);
      this.showToast('❌ Failed to parse Recipe JSON file');
      return false;
    }
  }

  showToast(msg) {
    let toast = document.getElementById('toastNotification');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toastNotification';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2600);
  }

  setupEvents() {
    window.addEventListener('resize', () => {
      const width = this.canvas.clientWidth || window.innerWidth;
      const height = this.canvas.clientHeight || window.innerHeight;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    });

    // Drag and Drop JSON file loading
    window.addEventListener('dragover', (e) => e.preventDefault());
    window.addEventListener('drop', (e) => {
      e.preventDefault();
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file.name.endsWith('.json') || file.type === 'application/json') {
          const reader = new FileReader();
          reader.onload = (event) => {
            this.importRecipeJSON(event.target.result);
          };
          reader.readAsText(file);
        }
      }
    });

    // 3D Canvas Raycasting for Slice Click
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.pizzaGenerator.rootGroup.children, true);

      if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj && !obj.name.startsWith('SliceWedge_') && obj.parent) {
          obj = obj.parent;
        }

        if (obj && obj.name.startsWith('SliceWedge_')) {
          const match = obj.name.match(/SliceWedge_L\d+_(\d+)/);
          const sliceNum = match ? parseInt(match[1], 10) : NaN;
          if (!isNaN(sliceNum)) {
            this.params.slice_pull_index = sliceNum;
            this.params.slice_pull_offset = this.params.slice_pull_offset > 0.1 ? 0 : 3.0;

            this.updateSliceTransforms();
            this.uiManager.syncUIValues(this.params, this.toppings, this.seasonings);
            this.showToast(`🍕 Selected Slice #${sliceNum} (${this.params.slice_pull_offset > 0 ? 'Pulled Out' : 'Retracted'})`);
          }
        }
      }
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();

    this.controls.update();
    this.propsEngine.update(delta);

    this.renderer.render(this.scene, this.camera);
  }
}

// Bootstrap when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.app = new PizzaMakerApp();
});

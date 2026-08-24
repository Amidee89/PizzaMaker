/**
 * Main Bootstrap & Application Coordinator for PizzaMaker 3D.
 * Connects Three.js WebGL Rendering, OrbitControls, Raycasting,
 * Generator Engines, and UI Managers.
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
    this.clock = new THREE.Clock();
    this.isAutoRotating = false;

    // Raycasting
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.hoveredSlice = null;

    // Initialize Default Parameters
    for (const [key, def] of Object.entries(PARAM_DEFINITIONS)) {
      this.params[key] = def.default;
    }

    // Default Neapolitan Toppings
    this.toppings = [
      { type: 'mozzarella_pearls', count: 9, scale: 1.1 },
      { type: 'basil', count: 8, scale: 1.1 }
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
    this.scene.background = new THREE.Color(0x0C0E14);
    this.scene.fog = new THREE.FogExp2(0x0C0E14, 0.12);

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

    // 4. Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't go below floor
    this.controls.minDistance = 0.8;
    this.controls.maxDistance = 8.0;
    this.controls.target.set(0, 0.1, 0);

    // 5. Lighting Setup (Studio Warm Pizzeria)
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
    // Ambient Warm Fill
    const ambientLight = new THREE.AmbientLight(0xFFEEDD, 0.7);
    this.scene.add(ambientLight);

    // Main Key Light
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

    // Cool Rim Light
    const rimLight = new THREE.DirectionalLight(0xAACCFF, 1.2);
    rimLight.position.set(-3, 3, -3);
    this.scene.add(rimLight);

    // Warm Oven Glow Side Light
    const ovenLight = new THREE.PointLight(0xFF6600, 1.0, 6);
    ovenLight.position.set(-2, 1.5, 2);
    this.scene.add(ovenLight);
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

    // Default preset
    this.presetManager.loadPreset('neapolitan');
  }

  rebuildFullPizza() {
    // 1. Build Base Pizza & Slices
    this.pizzaGenerator.generatePizza(this.params);

    // 2. Build Toppings
    this.toppingsEngine.scatterToppings(this.toppings, this.params);

    // 3. Build Seasonings
    this.seasoningEngine.scatterSeasonings(this.params);

    // 4. Build Props & Steam
    this.propsEngine.updateProps(this.params);
  }

  rebuildToppings() {
    this.toppingsEngine.scatterToppings(this.toppings, this.params);
    this.seasoningEngine.scatterSeasonings(this.params);
  }

  updateParameters(newParams, newToppings) {
    Object.assign(this.params, newParams);
    if (newToppings) this.toppings = JSON.parse(JSON.stringify(newToppings));
    this.rebuildFullPizza();
  }

  updateSingleParameter(key, value) {
    this.params[key] = value;

    // Fast updates vs full rebuild
    if (key === 'slice_pull_offset' || key === 'slice_pull_index' || key === 'slice_visible_count') {
      this.updateSliceTransforms();
    } else if (key.startsWith('prop_') || key.startsWith('fx_')) {
      this.propsEngine.updateProps(this.params);
    } else if (key.startsWith('season_')) {
      this.seasoningEngine.scatterSeasonings(this.params);
    } else {
      this.rebuildFullPizza();
    }
  }

  updateSliceTransforms() {
    const totalSlices = Math.round(this.params.slice_total || 8);
    const visibleSlices = Math.round(this.params.slice_visible_count || totalSlices);
    const pullOffset = (this.params.slice_pull_offset || 0) * 0.05;
    const pullIndex = (this.params.slice_pull_index || 1) - 1;

    for (let s = 0; s < this.pizzaGenerator.slices.length; s++) {
      const slice = this.pizzaGenerator.slices[s];
      slice.wedgeGroup.visible = s < visibleSlices;

      if (s === pullIndex && pullOffset > 0.001) {
        slice.wedgeGroup.position.x = pullOffset * Math.cos(slice.midAngle);
        slice.wedgeGroup.position.z = pullOffset * Math.sin(slice.midAngle);
      } else {
        slice.wedgeGroup.position.x = 0;
        slice.wedgeGroup.position.z = 0;
      }
    }
  }

  addToppingLayer(type = 'pepperoni', count = 16, scale = 1.0) {
    this.toppings.push({ type, count, scale });
    this.rebuildToppings();
  }

  removeToppingLayer(index) {
    if (index >= 0 && index < this.toppings.length) {
      this.toppings.splice(index, 1);
      this.rebuildToppings();
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
      toppings: this.toppings
    };
    navigator.clipboard.writeText(JSON.stringify(recipe, null, 2))
      .then(() => this.showToast('📋 Recipe JSON copied to clipboard!'))
      .catch(() => this.showToast('❌ Failed to copy to clipboard'));
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

    // 3D Canvas Raycasting for Slice Click
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.pizzaGenerator.rootGroup.children, true);

      if (intersects.length > 0) {
        // Find which slice wedge was clicked
        let obj = intersects[0].object;
        while (obj && !obj.name.startsWith('SliceWedge_') && obj.parent) {
          obj = obj.parent;
        }

        if (obj && obj.name.startsWith('SliceWedge_')) {
          const sliceNum = parseInt(obj.name.replace('SliceWedge_', ''), 10);
          this.params.slice_pull_index = sliceNum;
          // Toggle pull offset if clicked
          this.params.slice_pull_offset = this.params.slice_pull_offset > 0.1 ? 0 : 3.0;

          this.updateSliceTransforms();
          this.uiManager.syncUIValues(this.params, this.toppings);
          this.showToast(`🍕 Selected Slice #${sliceNum} (${this.params.slice_pull_offset > 0 ? 'Pulled Out' : 'Retracted'})`);
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

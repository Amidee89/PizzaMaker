// Three.js Pizza Maker
class PizzaMaker {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.pizzaMesh = null;
        this.crustMesh = null;
        this.sides = 8;
        this.extrusionHeight = 0.5;
        this.crustThickness = 0.3;
        this.crustProportion = 0.2;
        this.numSlices = 8;
        
        this.init();
        this.setupControls();
        this.animate();
    }
    
    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f0f0);
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 2, 5);
        
        // Create renderer
        const container = document.getElementById('pizza-viewer');
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(this.renderer.domElement);
        
        // Setup orbit controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 2;
        this.controls.maxDistance = 10;
        this.controls.maxPolarAngle = Math.PI / 2;
        
        // Add lighting
        this.setupLighting();
        
        // Create initial pizza
        this.createPizza();
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);
        
        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Point light for highlights
        const pointLight = new THREE.PointLight(0xffffff, 0.3);
        pointLight.position.set(-5, 3, 5);
        this.scene.add(pointLight);
    }
    
    createPizza() {
        // Remove existing pizza and crust if any
        if (this.pizzaMesh) {
            this.scene.remove(this.pizzaMesh);
        }
        if (this.crustMesh) {
            this.scene.remove(this.crustMesh);
        }
        
        // Create pizza geometry (inner part)
        const pizzaGeometry = this.createPizzaGeometry();
        
        // Create pizza material with pizza-like colors
        const pizzaMaterial = new THREE.MeshPhongMaterial({
            color: 0xffa500, // Orange base
            flatShading: false,
            transparent: true,
            opacity: 0.9
        });
        
        // Create pizza mesh
        this.pizzaMesh = new THREE.Mesh(pizzaGeometry, pizzaMaterial);
        this.pizzaMesh.castShadow = true;
        this.pizzaMesh.receiveShadow = true;
        
        // Create crust geometry (outer ring)
        const crustGeometry = this.createCrustGeometry();
        
        // Create crust material
        const crustMaterial = new THREE.MeshPhongMaterial({
            color: 0xd4a574, // Golden brown crust
            flatShading: false,
            transparent: true,
            opacity: 0.9
        });
        
        // Create crust mesh
        this.crustMesh = new THREE.Mesh(crustGeometry, crustMaterial);
        this.crustMesh.castShadow = true;
        this.crustMesh.receiveShadow = true;
        
        // Add both to scene
        this.scene.add(this.pizzaMesh);
        this.scene.add(this.crustMesh);
    }
    
    createPizzaGeometry() {
    const radius = 2 * (1 - this.crustProportion);
    const height = this.extrusionHeight;

    let actualNumSlices = this.numSlices;
    if (this.sides === 3 && this.numSlices < 3) {
        actualNumSlices = 3;
    } else if (this.sides < 8 && this.numSlices === 1) {
        actualNumSlices = 2;
    }

    const totalAngle = (actualNumSlices / 8) * (2 * Math.PI);

    if (this.crustProportion >= 1) {
        return new THREE.BufferGeometry();
    }

    const shape = new THREE.Shape();
    const angleStep = (2 * Math.PI) / this.sides;
    const numSegments = Math.ceil(this.sides * (actualNumSlices / 8));

    // Generate points for the polygon
    const points = [];
    for (let i = 0; i <= numSegments; i++) {
        const angle = i * angleStep;
        if (angle > totalAngle) break;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        points.push({ x, y });
    }

    if (this.numSlices < 8) {
        points.push({ x: 0, y: 0 });
    }


    // Create shape from points, and close it
    shape.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        shape.lineTo(points[i].x, points[i].y);
    }
    shape.closePath();

    const extrudeSettings = {
        steps: 1,
        depth: height,
        bevelEnabled: false,
        bevelThickness: 0.1,
        bevelSize: 0.1,
        bevelOffset: 0,
        bevelSegments: 3
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.rotateX(-Math.PI / 2);

    return geometry;
}
    createCrustGeometry() {
        const outerRadius = 2; // Full radius
        const innerRadius = 2 * (1 - this.crustProportion); // Inner radius (where pizza ends)
        const height = this.extrusionHeight + this.crustThickness; // Crust is thicker
        
        let actualNumSlices = this.numSlices;
        if (this.sides === 3 && this.numSlices < 3) {
            actualNumSlices = 3;
        } else if (this.sides < 8 && this.numSlices === 1) {
            actualNumSlices = 2;
        }

        const totalAngle = (actualNumSlices / 8) * (2 * Math.PI);
        
        // Don't create crust if crust proportion is 0 (no crust)
        if (this.crustProportion <= 0) {
            return new THREE.BufferGeometry();
        }
        
        // Create outer polygon
        const outerShape = new THREE.Shape();
        const angleStep = (2 * Math.PI) / this.sides;
        const numSegments = Math.ceil(this.sides * (actualNumSlices / 8));
        
        // Create points arrays for better precision
        const outerPoints = [];
        const innerPoints = [];
        
        // Generate all points first
        for (let i = 0; i <= numSegments; i++) {
            const angle = i * angleStep;
            if (angle > totalAngle) break;
            const outerX = outerRadius * Math.cos(angle);
            const outerY = outerRadius * Math.sin(angle);
            const innerX = innerRadius * Math.cos(angle);
            const innerY = innerRadius * Math.sin(angle);
            
            outerPoints.push({ x: outerX, y: outerY });
            innerPoints.push({ x: innerX, y: innerY });
        }
        
        // Create outer shape
        outerShape.moveTo(outerPoints[0].x, outerPoints[0].y);
        for (let i = 1; i < outerPoints.length; i++) {
            outerShape.lineTo(outerPoints[i].x, outerPoints[i].y);
        }

        if (this.numSlices < 8) {
            // If sliced, create a path that includes the cut sides
            outerShape.lineTo(innerPoints[innerPoints.length - 1].x, innerPoints[innerPoints.length - 1].y);
            for (let i = innerPoints.length - 2; i >= 0; i--) {
                outerShape.lineTo(innerPoints[i].x, innerPoints[i].y);
            }
            outerShape.lineTo(outerPoints[0].x, outerPoints[0].y); // Close the shape
        }
        outerShape.closePath();
        
        // Create inner hole only for a full pizza
        if (this.numSlices === 8) {
            const innerShape = new THREE.Path();
            innerShape.moveTo(innerPoints[0].x, innerPoints[0].y);
            for (let i = 1; i < innerPoints.length; i++) {
                innerShape.lineTo(innerPoints[i].x, innerPoints[i].y);
            }
            innerShape.closePath();
            outerShape.holes.push(innerShape);
        }
        
        // Create extrusion settings
        const extrudeSettings = {
            steps: 1,
            depth: height,
            bevelEnabled: false,
            bevelThickness: 0.1,
            bevelSize: 0.1,
            bevelOffset: 0,
            bevelSegments: 3
        };
        
        // Create geometry
        const geometry = new THREE.ExtrudeGeometry(outerShape, extrudeSettings);
        
        // Center the geometry and rotate to lay flat (z-axis up)
        geometry.rotateX(-Math.PI / 2);
        
        return geometry;
    }
    

    
    setupControls() {
        // Sides slider
        const sidesSlider = document.getElementById('sides-slider');
        const sidesValue = document.getElementById('sides-value');
        
        sidesSlider.addEventListener('input', (e) => {
            this.sides = parseInt(e.target.value);
            sidesValue.textContent = this.sides;
            this.createPizza();
        });
        
        // Extrusion slider
        const extrusionSlider = document.getElementById('extrusion-slider');
        const extrusionValue = document.getElementById('extrusion-value');
        
        extrusionSlider.addEventListener('input', (e) => {
            this.extrusionHeight = parseFloat(e.target.value);
            extrusionValue.textContent = this.extrusionHeight;
            this.createPizza();
        });
        
        // Crust thickness slider
        const crustThicknessSlider = document.getElementById('crust-thickness-slider');
        const crustThicknessValue = document.getElementById('crust-thickness-value');
        
        crustThicknessSlider.addEventListener('input', (e) => {
            this.crustThickness = parseFloat(e.target.value);
            crustThicknessValue.textContent = this.crustThickness;
            this.createPizza();
        });
        
        // Crust proportion slider
        const crustProportionSlider = document.getElementById('crust-proportion-slider');
        const crustProportionValue = document.getElementById('crust-proportion-value');
        
        crustProportionSlider.addEventListener('input', (e) => {
            this.crustProportion = parseFloat(e.target.value);
            crustProportionValue.textContent = this.crustProportion;
            this.createPizza();
        });

        // Slices slider
        const slicesSlider = document.getElementById('slices-slider');
        const slicesValue = document.getElementById('slices-value');
        
        slicesSlider.addEventListener('input', (e) => {
            this.numSlices = parseInt(e.target.value);
            slicesValue.textContent = this.numSlices;
            this.createPizza();
        });
    }
    
    onWindowResize() {
        const container = document.getElementById('pizza-viewer');
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update controls
        this.controls.update();
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the pizza maker when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PizzaMaker();
});

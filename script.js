// Three.js Pizza Maker - Redesigned for Scalability
class PizzaMaker {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.pizzaGroup = new THREE.Group(); // Root group for all pizza parts
        this.doughMesh = null;
        this.crustMesh = null;
        this.sauceMesh = null; // Skeleton for sauce
        this.toppingsGroup = new THREE.Group(); // Skeleton for toppings
        
        // Ported parameters
        this.sides = 8;
        this.pizzaHeight = 0.5;
        this.crustThickness = 0.3;
        this.crustProportion = 0.2;
        this.numSlices = 8;
        this.ovalness = 0;
        this.ovalnessDirection = 0;
        
        // Skeleton parameters for new features
        this.thicknessVariance = 0; // 0-1 scale
        this.bowlDomeAmount = 0; // -1 (bowl) to 1 (dome)
        this.radiusRandomness = 0; // Waviness amplitude
        this.airPockets = 0; // Intensity
        this.doughnutHoleSize = 0; // Inner radius
        this.fractalDepth = 0; // 0-3
        this.doughColor = 0xffa500;
        this.doughTexture = null; // Placeholder
        this.crustEdgeRoundness = 0; // 0 (square) - 1 (round)
        this.crustStuffingAmount = 0;
        this.crustStuffingColor = 0xffffff;
        this.crustRadiusRandomness = 0;
        this.crustAirPockets = 0;
        this.crustThicknessVariance = 0;
        this.crustColor = 0xd4a574;
        this.crustTexture = null;
        this.charMarksDough = 0; // Intensity
        this.charMarksCrust = 0;
        this.bottomBrowning = 0;
        this.bottomCharMarks = 0;
        this.sauceTexture = null;
        this.sauceSpread = 1; // 0-1
        this.sauceThickness = 0.1;
        this.sauceShininess = 0.5;
        this.sauceRandomness = 0;
        this.toppings = []; // Array of {type, quantity, size, randomness}
        this.seasonings = []; // Similar
        this.showPizzaBox = true; // Toggle for debugging
        this.steamIntensity = 0;
        
        this.init();
        this.setupControls();
        this.animate();
    }
    
    init() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f0f0);
        
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 2, 5);
        
        const container = document.getElementById('pizza-viewer');
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(this.renderer.domElement);
        
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 2;
        this.controls.maxDistance = 10;
        this.controls.maxPolarAngle = Math.PI / 2;
        
        this.setupLighting();
        this.scene.add(this.pizzaGroup);
        this.pizzaGroup.add(this.toppingsGroup);
        
        this.updatePizza();
        
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        const pointLight = new THREE.PointLight(0xffffff, 0.3);
        pointLight.position.set(-5, 3, 5);
        this.scene.add(pointLight);
    }
    
    updatePizza() {
        // Clear existing meshes
        if (this.doughMesh) this.pizzaGroup.remove(this.doughMesh);
        if (this.crustMesh) this.pizzaGroup.remove(this.crustMesh);
        if (this.sauceMesh) this.pizzaGroup.remove(this.sauceMesh);
        this.toppingsGroup.clear();
        // Clear pizza box if exists
        if (this.pizzaBox) this.scene.remove(this.pizzaBox);
        
        // Generate base dough
        const doughGeometry = this.generateDoughGeometry();
        this.applyDeformations(doughGeometry);
        const doughMaterial = this.generateDoughMaterial();
        this.doughMesh = new THREE.Mesh(doughGeometry, doughMaterial);
        this.doughMesh.castShadow = true;
        this.doughMesh.receiveShadow = true;
        this.pizzaGroup.add(this.doughMesh);
        
        // Generate crust
        const crustGeometry = this.generateCrustGeometry();
        this.applyDeformations(crustGeometry, true); // true for crust-specific
        const crustMaterial = this.generateCrustMaterial();
        this.crustMesh = new THREE.Mesh(crustGeometry, crustMaterial);
        this.crustMesh.castShadow = true;
        this.crustMesh.receiveShadow = true;
        this.pizzaGroup.add(this.crustMesh);
        
        this.applyPizzaTransform();
        
        // Skeleton for sauce
        this.generateSauce();
        
        // Skeleton for toppings and seasonings
        this.generateToppings();
        this.generateSeasonings();
        
        // Skeleton for extras
        if (this.showPizzaBox) this.generatePizzaBox();
        this.generateSteam();
    }
    
    generateDoughGeometry() {
        const radius = 2 * (1 - this.crustProportion);
        const height = this.pizzaHeight;

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
            let x = radius * Math.cos(angle);
            let y = radius * Math.sin(angle);
            
            const transformedPoint = this.transformPoint(x, y);
            points.push(transformedPoint);
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
    
    generateDoughMaterial() {
        const material = new THREE.MeshPhongMaterial({
            color: this.doughColor,
            flatShading: false,
            transparent: true,
            opacity: 0.9
        });
        // TODO: Add procedural texture for cooking effects (char marks, browning)
        return material;
    }
    
    generateCrustGeometry() {
        const outerRadius = 2; // Full radius
        const innerRadius = 2 * (1 - this.crustProportion); // Inner radius (where pizza ends)
        const height = this.pizzaHeight + this.crustThickness; // Crust is thicker
        
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
            
            outerPoints.push(this.transformPoint(outerX, outerY));
            innerPoints.push(this.transformPoint(innerX, innerY));
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
    
    generateCrustMaterial() {
        const material = new THREE.MeshPhongMaterial({
            color: this.crustColor,
            flatShading: false,
            transparent: true,
            opacity: 0.9
        });
        // TODO: Textures for char marks, etc.
        return material;
    }
    
    transformPoint(x, y) {
        const angle = this.ovalnessDirection * Math.PI / 180;
        const cosAngle = Math.cos(angle);
        const sinAngle = Math.sin(angle);

        // Vector projection to get components along the scaling direction and perpendicular to it
        const dotProduct = x * cosAngle + y * sinAngle;
        const perpDotProduct = -x * sinAngle + y * cosAngle;

        // Scale the component along the direction vector
        const scaledComponentX = (1 + this.ovalness) * dotProduct * cosAngle;
        const scaledComponentY = (1 + this.ovalness) * dotProduct * sinAngle;

        // The perpendicular component remains unchanged
        const perpComponentX = perpDotProduct * -sinAngle;
        const perpComponentY = perpDotProduct * cosAngle;

        return {
            x: scaledComponentX + perpComponentX,
            y: scaledComponentY + perpComponentY,
        };
    }
    
    applyPizzaTransform() {
        const rotation = this.ovalnessDirection * Math.PI / 180;
        if (this.doughMesh) {
            this.doughMesh.rotation.y = rotation;
            this.doughMesh.scale.x = 1 + this.ovalness;
        }
        if (this.crustMesh) {
            this.crustMesh.rotation.y = rotation;
            this.crustMesh.scale.x = 1 + this.ovalness;
        }
    }
    
    applyDeformations(geometry, isCrust = false) {
        // For scalability: manipulate vertices here for new features
        const positions = geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const z = positions.getZ(i);
            
            // TODO: Apply thicknessVariance, bowlDomeAmount, radiusRandomness, airPockets, etc.
            // Example for bowl/dome (assuming z is up):
            // const dist = Math.sqrt(x*x + y*y);
            // const maxRadius = 2;
            // positions.setZ(i, z + this.bowlDomeAmount * (1 - (dist / maxRadius)**2) * this.pizzaHeight);
            
            // For crust-specific: use isCrust to apply crustRadiusRandomness, etc.
        }
        geometry.computeVertexNormals();
    }
    
    generateSauce() {
        // Skeleton: Thin layer on dough top
        if (this.sauceThickness <= 0) return;
        // TODO: Copy top faces from doughGeometry, offset up, apply spread/randomness
        const geometry = new THREE.BufferGeometry(); // Placeholder
        const material = new THREE.MeshPhongMaterial({
            color: 0xff0000, // Red sauce
            shininess: this.sauceShininess * 100
        });
        this.sauceMesh = new THREE.Mesh(geometry, material);
        this.pizzaGroup.add(this.sauceMesh);
    }
    
    generateToppings() {
        // Skeleton
        this.toppings.forEach(topping => {
            // TODO: InstancedMesh scattering
        });
    }
    
    generateSeasonings() {
        // TODO
    }
    
    generatePizzaBox() {
        const geometry = new THREE.BoxGeometry(5, 0.2, 5);
        const material = new THREE.MeshPhongMaterial({ color: 0xaaaaaa });
        this.pizzaBox = new THREE.Mesh(geometry, material);
        this.pizzaBox.position.y = -0.1 - this.pizzaHeight / 2; // Below pizza
        this.scene.add(this.pizzaBox);
    }
    
    generateSteam() {
        // TODO: Particle system if steamIntensity > 0
    }
    
    setupControls() {
        // Ported controls
        document.getElementById('sides-slider').addEventListener('input', (e) => {
            this.sides = parseInt(e.target.value);
            document.getElementById('sides-value').textContent = this.sides;
            this.updatePizza();
        });
        
        document.getElementById('pizza-height-slider').addEventListener('input', (e) => {
            this.pizzaHeight = parseFloat(e.target.value);
            document.getElementById('pizza-height-value').textContent = this.pizzaHeight;
            this.updatePizza();
        });
        
        document.getElementById('crust-thickness-slider').addEventListener('input', (e) => {
            this.crustThickness = parseFloat(e.target.value);
            document.getElementById('crust-thickness-value').textContent = this.crustThickness;
            this.updatePizza();
        });
        
        document.getElementById('crust-proportion-slider').addEventListener('input', (e) => {
            this.crustProportion = parseFloat(e.target.value);
            document.getElementById('crust-proportion-value').textContent = this.crustProportion;
            this.updatePizza();
        });
        
        document.getElementById('slices-slider').addEventListener('input', (e) => {
            this.numSlices = parseInt(e.target.value);
            document.getElementById('slices-value').textContent = this.numSlices;
            this.updatePizza();
        });
        
        document.getElementById('ovalness-slider').addEventListener('input', (e) => {
            this.ovalness = parseFloat(e.target.value);
            document.getElementById('ovalness-value').textContent = this.ovalness.toFixed(2);
            this.updatePizza();
        });
        
        document.getElementById('ovalness-direction-slider').addEventListener('input', (e) => {
            this.ovalnessDirection = parseInt(e.target.value);
            document.getElementById('ovalness-direction-value').textContent = `${this.ovalnessDirection}°`;
            this.updatePizza();
        });
        
        // Wire skeleton controls
        document.getElementById('thickness-variance-slider').addEventListener('input', (e) => {
            this.thicknessVariance = parseFloat(e.target.value);
            document.getElementById('thickness-variance-value').textContent = this.thicknessVariance;
            this.updatePizza();
        });
        
        document.getElementById('bowl-dome-slider').addEventListener('input', (e) => {
            this.bowlDomeAmount = parseFloat(e.target.value);
            document.getElementById('bowl-dome-value').textContent = this.bowlDomeAmount;
            this.updatePizza();
        });
        
        // TODO: Add more listeners for other params
    }
    
    onWindowResize() {
        const container = document.getElementById('pizza-viewer');
        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.clientWidth, container.clientHeight);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
        // TODO: Update particles
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new PizzaMaker();
});
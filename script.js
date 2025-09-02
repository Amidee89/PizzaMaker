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
        this.thicknessVarianceDensity = 0.5;
        this.bowlDomeAmount = 0; // -1 (bowl) to 1 (dome)
        this.pointiness = 0; // 0-1 scale for bowl/dome pointiness
        this.stellation = 0;
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
        this.controls.maxDistance = 20;
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
        
        // Generate base dough geometry using custom approach for better vertex distribution
        const doughGeometry = this.generateCustomDoughGeometry();
        
        // Convert to BufferGeometry and apply advanced deformations
        const processedDoughGeometry = this.convertToProcessableGeometry(doughGeometry);
        this.applyAdvancedDeformations(processedDoughGeometry);
        
        const doughMaterial = this.generateDoughMaterial();
        this.doughMesh = new THREE.Mesh(processedDoughGeometry, doughMaterial);
        this.doughMesh.castShadow = true;
        this.doughMesh.receiveShadow = true;
        this.pizzaGroup.add(this.doughMesh);
        
        // Generate crust following the same pattern (but skip deformations for now)
        const crustGeometry = this.generateBaseCrustGeometry();
        const processedCrustGeometry = this.convertToProcessableGeometry(crustGeometry);
        this.applyAdvancedDeformations(processedCrustGeometry, true); // true for crust-specific
        
        const crustMaterial = this.generateCrustMaterial();
        this.crustMesh = new THREE.Mesh(processedCrustGeometry, crustMaterial);
        this.crustMesh.castShadow = true;
        this.crustMesh.receiveShadow = true;
        this.pizzaGroup.add(this.crustMesh);
        
        // Skeleton for sauce
        this.generateSauce();
        
        // Skeleton for toppings and seasonings
        this.generateToppings();
        this.generateSeasonings();
        
        // Skeleton for extras
        if (this.showPizzaBox) this.generatePizzaBox();
        this.generateSteam();
    }
    
    generateBaseDoughGeometry() {
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
        if (this.stellation > 0) {
            const numPoints = 2 * this.sides;
            const pointinessAngleStep = (2 * Math.PI) / numPoints;
            const numPointinessSegments = Math.ceil(numPoints * (actualNumSlices / 8));
            const smallRadius = radius * (1 - this.stellation);

            for (let i = 0; i <= numPointinessSegments; i++) {
                const angle = i * pointinessAngleStep;
                if (angle > totalAngle) break;
                const r = (i % 2 === 0) ? radius : smallRadius;
                let x = r * Math.cos(angle);
                let y = r * Math.sin(angle);
                
                const transformedPoint = this.transformPoint(x, y);
                points.push(transformedPoint);
            }
        } else {
            for (let i = 0; i <= numSegments; i++) {
                const angle = i * angleStep;
                if (angle > totalAngle) break;
                let x = radius * Math.cos(angle);
                let y = radius * Math.sin(angle);
                
                const transformedPoint = this.transformPoint(x, y);
                points.push(transformedPoint);
            }
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
        geometry.translate(0, -height / 2, 0);

        return geometry;
    }
    
    /**
     * Custom dough geometry with proper internal vertices for smooth deformations
     * This replaces ExtrudeGeometry for better control over vertex distribution
     */
    generateCustomDoughGeometry() {

        const radius = 2 * (1 - this.crustProportion);
        const height = this.pizzaHeight;
        
        // Create geometry with radial subdivisions for smooth deformation
        const radialSegments = 8; // Rings from center to edge
        // For low-sided polygons, use exact sides. For higher sides, add smoothness
        const angularSegments = this.sides < 6 ? this.sides : this.sides * 2; 
        const heightSegments = 1; // Only 2 levels: bottom and top (0 and 1)
        
        const geometry = new THREE.BufferGeometry();
        
        // Calculate total vertices needed
        const verticesPerLevel = 1 + (radialSegments * angularSegments); // center + rings
        const totalVertices = verticesPerLevel * (heightSegments + 1); // levels from bottom to top
        
        const positions = new Float32Array(totalVertices * 3);
        const normals = new Float32Array(totalVertices * 3);
        const uvs = new Float32Array(totalVertices * 2);
        const indices = [];
        
        let vertexIndex = 0;
        
        // Generate vertices level by level (bottom to top)
        for (let level = 0; level <= heightSegments; level++) {
            const y = (level / heightSegments - 0.5) * height; // -height/2 to +height/2
            
            // Center vertex for this level
            positions[vertexIndex * 3] = 0;
            positions[vertexIndex * 3 + 1] = y;
            positions[vertexIndex * 3 + 2] = 0;
            
            normals[vertexIndex * 3] = 0;
            normals[vertexIndex * 3 + 1] = 1;
            normals[vertexIndex * 3 + 2] = 0;
            
            uvs[vertexIndex * 2] = 0.5;
            uvs[vertexIndex * 2 + 1] = 0.5;
            
            const centerIndexThisLevel = vertexIndex;
            vertexIndex++;
            
            // Ring vertices for this level
            for (let ring = 1; ring <= radialSegments; ring++) {
                const ringRadius = (ring / radialSegments) * radius;
                
                for (let seg = 0; seg < angularSegments; seg++) {
                    const angle = (seg / angularSegments) * Math.PI * 2;
                    let x = ringRadius * Math.cos(angle);
                    let z = ringRadius * Math.sin(angle);
                    
                    // Apply transformations (ovalness, stellation, etc.)
                    // transformPoint was designed for ExtrudeGeometry coordinate system
                    // Custom geometry needs direction flipped to match crust behavior
                    const transformed = this.transformPoint(x, -z); // Flip Z to match crust
                    x = transformed.x;
                    z = -transformed.y; // Flip back
                    
                    // Handle stellation - apply to ALL rings, not just the outer one
                    if (this.stellation > 0) {
                        // For stellation, create star pattern by alternating radii
                        // Calculate which main polygon vertex this is closest to
                        const segmentAngle = (2 * Math.PI) / this.sides;
                        const closestMainAngle = Math.round(angle / segmentAngle) * segmentAngle;
                        const angleDiff = Math.abs(angle - closestMainAngle);
                        
                        // If we're far from a main vertex angle, apply stellation reduction
                        const maxAngleDiff = segmentAngle / 2;
                        if (angleDiff > maxAngleDiff * 0.3) { // 30% threshold
                            const stellationFactor = 1 - this.stellation * 0.7; // Max 70% reduction
                            x *= stellationFactor;
                            z *= stellationFactor;
                        }
                    }
                    
                    positions[vertexIndex * 3] = x;
                    positions[vertexIndex * 3 + 1] = y;
                    positions[vertexIndex * 3 + 2] = z;
                    
                    normals[vertexIndex * 3] = 0;
                    normals[vertexIndex * 3 + 1] = 1;
                    normals[vertexIndex * 3 + 2] = 0;
                    
                    uvs[vertexIndex * 2] = 0.5 + (x / (radius * 2));
                    uvs[vertexIndex * 2 + 1] = 0.5 + (z / (radius * 2));
                    
                    vertexIndex++;
                }
            }
        }
        
        // Generate triangular faces to create solid geometry
        this.generateCustomGeometryFaces(indices, radialSegments, angularSegments, heightSegments);
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
        geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
        
        // Set the indices to create actual faces
        geometry.setIndex(indices);
        

        
        return geometry;
    }
    
    /**
     * Generates triangular faces for the custom geometry
     * @param {Array} indices - Array to populate with face indices
     * @param {number} radialSegments 
     * @param {number} angularSegments 
     * @param {number} heightSegments 
     */
    generateCustomGeometryFaces(indices, radialSegments, angularSegments, heightSegments) {
        const verticesPerLevel = 1 + (radialSegments * angularSegments);
        
        // Generate faces for each level (top and bottom caps)
        for (let level = 0; level <= heightSegments; level++) {
            const levelOffset = level * verticesPerLevel;
            const centerIndex = levelOffset; // Center vertex at each level
            const isTop = level === heightSegments;
            

            
            // Connect center to first ring
            for (let seg = 0; seg < angularSegments; seg++) {
                const next = (seg + 1) % angularSegments;
                const curr = levelOffset + 1 + seg; // First ring starts at offset + 1
                const nextVert = levelOffset + 1 + next;
                
                if (isTop) {
                    // Top face - counter-clockwise when viewed from above
                    indices.push(centerIndex, nextVert, curr);
                } else {
                    // Bottom face - clockwise when viewed from above (which is counter-clockwise from below)
                    indices.push(centerIndex, curr, nextVert);
                }
            }
            
            // Connect rings to each other
            for (let ring = 1; ring < radialSegments; ring++) {
                const ringStart = levelOffset + 1 + (ring - 1) * angularSegments;
                const nextRingStart = levelOffset + 1 + ring * angularSegments;
                
                for (let seg = 0; seg < angularSegments; seg++) {
                    const next = (seg + 1) % angularSegments;
                    
                    const curr = ringStart + seg;
                    const currNext = ringStart + next;
                    const outer = nextRingStart + seg;
                    const outerNext = nextRingStart + next;
                    
                    if (isTop) {
                        // Top face - counter-clockwise winding when viewed from above
                        indices.push(curr, currNext, outer);
                        indices.push(currNext, outerNext, outer);
                    } else {
                        // Bottom face - clockwise winding when viewed from above
                        indices.push(curr, outer, currNext);
                        indices.push(currNext, outer, outerNext);
                    }
                }
            }
        }
        
        // Generate side faces connecting top and bottom
        const bottomLevelOffset = 0;
        const topLevelOffset = verticesPerLevel;
        
        // Only connect the outermost ring for side faces
        const outerRingStart = 1 + (radialSegments - 1) * angularSegments;
        
        for (let seg = 0; seg < angularSegments; seg++) {
            const next = (seg + 1) % angularSegments;
            
            const bottomCurr = bottomLevelOffset + outerRingStart + seg;
            const bottomNext = bottomLevelOffset + outerRingStart + next;
            const topCurr = topLevelOffset + outerRingStart + seg;
            const topNext = topLevelOffset + outerRingStart + next;
            
            // Create two triangles for each side face
            indices.push(bottomCurr, topCurr, bottomNext);
            indices.push(bottomNext, topCurr, topNext);
        }
        

    }
    
    generateDoughMaterial() {
        const material = new THREE.MeshPhongMaterial({
            color: this.doughColor,
            flatShading: false,
            transparent: true,
            opacity: 0.9,
            wireframe: false // Set to true to debug mesh structure
        });
        // TODO: Add procedural texture for cooking effects (char marks, browning)
        return material;
    }
    
    generateBaseCrustGeometry() {

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
        
        if (this.stellation > 0) {
            const numPoints = 2 * this.sides;
            const pointinessAngleStep = (2 * Math.PI) / numPoints;
            const numPointinessSegments = Math.ceil(numPoints * (actualNumSlices / 8));
            const smallOuterRadius = outerRadius * (1 - this.stellation);
            const smallInnerRadius = innerRadius * (1 - this.stellation);

            for (let i = 0; i <= numPointinessSegments; i++) {
                const angle = i * pointinessAngleStep;
                if (angle > totalAngle) break;
                
                const rOuter = (i % 2 === 0) ? outerRadius : smallOuterRadius;
                const rInner = (i % 2 === 0) ? innerRadius : smallInnerRadius;

                const outerX = rOuter * Math.cos(angle);
                const outerY = rOuter * Math.sin(angle);
                const innerX = rInner * Math.cos(angle);
                const innerY = rInner * Math.sin(angle);
                
                outerPoints.push(this.transformPoint(outerX, outerY));
                innerPoints.push(this.transformPoint(innerX, innerY));
            }
        } else {
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
        geometry.translate(0, (-height / 2) + (this.crustThickness / 2), 0);
        
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

        const result = {
            x: scaledComponentX + perpComponentX,
            y: scaledComponentY + perpComponentY,
        };



        return result;
    }
    
    /**
     * Converts ExtrudeGeometry to a BufferGeometry that can be subdivided and processed
     * @param {THREE.ExtrudeGeometry} geometry 
     * @returns {THREE.BufferGeometry}
     */
    convertToProcessableGeometry(geometry) {
        // Convert to BufferGeometry if it isn't already
        let bufferGeometry = geometry;
        if (geometry.isGeometry) {
            bufferGeometry = new THREE.BufferGeometry().fromGeometry(geometry);
        }
        
        return bufferGeometry;
    }
    
    /**
     * Applies advanced deformations that require vertex-level manipulation
     * @param {THREE.BufferGeometry} geometry 
     * @param {boolean} isCrust 
     */
    applyAdvancedDeformations(geometry, isCrust = false) {
        const positions = geometry.attributes.position;
        if (!positions) return;
        
        // Apply deformations in order of complexity
        if (this.bowlDomeAmount !== 0) {
            this.applyBowlDomeDeformation(geometry, isCrust);
        }
        
        if (this.thicknessVariance > 0) {
            this.applyThicknessVariance(geometry, isCrust);
        }
        
        // TODO: Add more advanced deformations:
        // - Air pockets
        // - Radius randomness/waviness  
        
        geometry.computeVertexNormals();
    }
    
    /**
     * Enriches cap geometry by adding internal vertices for smooth deformations
     * This is a much simpler approach that works with non-indexed ExtrudeGeometry
     * @param {THREE.BufferGeometry} geometry 
     * @param {boolean} isCrust 
     */
    enrichCapGeometry(geometry, isCrust = false) {
        console.log('🔄 Enriching cap geometry with internal vertices...');
        
        const radius = isCrust ? 2 : 2 * (1 - this.crustProportion);
        const height = isCrust ? this.pizzaHeight + this.crustThickness : this.pizzaHeight;
        
        console.log('- Working radius:', radius);
        console.log('- Working height:', height);
        
        // Get current geometry data
        const oldPositions = geometry.attributes.position.array;
        const oldNormals = geometry.attributes.normal ? geometry.attributes.normal.array : null;
        const oldUvs = geometry.attributes.uv ? geometry.attributes.uv.array : null;
        
        console.log('Original geometry has', oldPositions.length / 3, 'vertices');
        
        // Add internal vertices to caps in a simple grid pattern
        const internalRings = 4; // Fewer rings for simpler approach
        const angularSegments = this.sides * 2;
        const newVerticesPerCap = internalRings * angularSegments; // No center vertex needed
        const totalNewVertices = 2 * newVerticesPerCap; // top and bottom caps
        
        console.log('Adding', totalNewVertices, 'internal vertices');
        console.log('- Internal rings:', internalRings);
        console.log('- Angular segments:', angularSegments);
        
        // Create new arrays
        const newPositions = new Float32Array(oldPositions.length + totalNewVertices * 3);
        const newNormals = new Float32Array(oldNormals ? oldNormals.length + totalNewVertices * 3 : oldPositions.length + totalNewVertices * 3);
        const newUvs = new Float32Array(oldUvs ? oldUvs.length + totalNewVertices * 2 : (oldPositions.length / 3) * 2 + totalNewVertices * 2);
        
        // Copy old data
        newPositions.set(oldPositions);
        if (oldNormals) {
            newNormals.set(oldNormals);
        } else {
            // Generate normals for old vertices if they don't exist
            for (let i = 0; i < oldPositions.length / 3; i++) {
                newNormals[i * 3] = 0;
                newNormals[i * 3 + 1] = 1;
                newNormals[i * 3 + 2] = 0;
            }
        }
        if (oldUvs) {
            newUvs.set(oldUvs);
        } else {
            // Generate basic UVs if they don't exist
            for (let i = 0; i < oldPositions.length / 3; i++) {
                newUvs[i * 2] = 0.5;
                newUvs[i * 2 + 1] = 0.5;
            }
        }
        
        const oldVertexCount = oldPositions.length / 3;
        let newVertexIndex = oldVertexCount;
        
        // Add internal vertices for top cap
        console.log('Adding internal vertices for top cap at y =', height/2);
        for (let ring = 1; ring <= internalRings; ring++) {
            const ringRadius = (ring / (internalRings + 1)) * radius; // Don't go to full radius
            
            for (let seg = 0; seg < angularSegments; seg++) {
                const angle = (seg / angularSegments) * Math.PI * 2;
                let x = ringRadius * Math.cos(angle);
                let z = ringRadius * Math.sin(angle);
                
                // Apply transformations
                const transformed = this.transformPoint(x, z);
                x = transformed.x;
                z = transformed.y;
                
                // Position
                newPositions[newVertexIndex * 3] = x;
                newPositions[newVertexIndex * 3 + 1] = height / 2;
                newPositions[newVertexIndex * 3 + 2] = z;
                
                // Normal (pointing up)
                newNormals[newVertexIndex * 3] = 0;
                newNormals[newVertexIndex * 3 + 1] = 1;
                newNormals[newVertexIndex * 3 + 2] = 0;
                
                // UV
                newUvs[newVertexIndex * 2] = 0.5 + (x / (radius * 2));
                newUvs[newVertexIndex * 2 + 1] = 0.5 + (z / (radius * 2));
                
                newVertexIndex++;
            }
        }
        
        // Add internal vertices for bottom cap
        console.log('Adding internal vertices for bottom cap at y =', -height/2);
        for (let ring = 1; ring <= internalRings; ring++) {
            const ringRadius = (ring / (internalRings + 1)) * radius;
            
            for (let seg = 0; seg < angularSegments; seg++) {
                const angle = (seg / angularSegments) * Math.PI * 2;
                let x = ringRadius * Math.cos(angle);
                let z = ringRadius * Math.sin(angle);
                
                // Apply transformations
                const transformed = this.transformPoint(x, z);
                x = transformed.x;
                z = transformed.y;
                
                // Position
                newPositions[newVertexIndex * 3] = x;
                newPositions[newVertexIndex * 3 + 1] = -height / 2;
                newPositions[newVertexIndex * 3 + 2] = z;
                
                // Normal (pointing down)
                newNormals[newVertexIndex * 3] = 0;
                newNormals[newVertexIndex * 3 + 1] = -1;
                newNormals[newVertexIndex * 3 + 2] = 0;
                
                // UV
                newUvs[newVertexIndex * 2] = 0.5 + (x / (radius * 2));
                newUvs[newVertexIndex * 2 + 1] = 0.5 + (z / (radius * 2));
                
                newVertexIndex++;
            }
        }
        
        // Update geometry attributes (keep as non-indexed)
        geometry.setAttribute('position', new THREE.BufferAttribute(newPositions, 3));
        geometry.setAttribute('normal', new THREE.BufferAttribute(newNormals, 3));
        geometry.setAttribute('uv', new THREE.BufferAttribute(newUvs, 2));
        
        console.log('✅ Cap enrichment complete. Total vertices:', newVertexIndex);
        console.log('NOTE: New vertices are internal only - ExtrudeGeometry structure preserved');
    }
    
    /**
     * OLD METHOD - keeping for reference but not using
     * Subdivides the top and bottom caps of the extruded geometry to add more vertices for deformation
     * @param {THREE.BufferGeometry} geometry 
     * @param {number} subdivisionLevel - Number of radial rings to create
     * @param {boolean} isCrust 
     */
    subdivideCaps_OLD(geometry, subdivisionLevel, isCrust = false) {
        console.log('🔄 Starting cap subdivision...');
        console.log('- Subdivision level:', subdivisionLevel);
        console.log('- Is crust:', isCrust);
        
        const radius = isCrust ? 2 : 2 * (1 - this.crustProportion);
        const height = isCrust ? this.pizzaHeight + this.crustThickness : this.pizzaHeight;
        
        console.log('- Working radius:', radius);
        console.log('- Working height:', height);
        
        // Get current geometry data
        const oldPositions = geometry.attributes.position.array;
        const oldNormals = geometry.attributes.normal ? geometry.attributes.normal.array : null;
        const oldUvs = geometry.attributes.uv ? geometry.attributes.uv.array : null;
        const oldIndices = geometry.index ? geometry.index.array : null;
        
        console.log('Original geometry has', oldPositions.length / 3, 'vertices');
        
        // Create new arrays with room for additional cap vertices
        const angularSegments = this.sides * 2; // More segments for smoother caps
        const newVerticesPerCap = 1 + (subdivisionLevel * angularSegments); // center + rings
        const totalNewVertices = 2 * newVerticesPerCap; // top and bottom caps
        
        console.log('Adding', totalNewVertices, 'new vertices for caps');
        console.log('- Angular segments:', angularSegments);
        console.log('- Vertices per cap:', newVerticesPerCap);
        
        const newPositions = new Float32Array(oldPositions.length + totalNewVertices * 3);
        const newNormals = new Float32Array(oldNormals ? oldNormals.length + totalNewVertices * 3 : totalNewVertices * 3);
        const newUvs = new Float32Array(oldUvs ? oldUvs.length + totalNewVertices * 2 : totalNewVertices * 2);
        
        // Copy old data
        newPositions.set(oldPositions);
        if (oldNormals) newNormals.set(oldNormals);
        if (oldUvs) newUvs.set(oldUvs);
        
        const oldVertexCount = oldPositions.length / 3;
        let newVertexIndex = oldVertexCount;
        
        // Generate top cap (y = height/2)
        console.log('Generating top cap at y =', height/2);
        newVertexIndex = this.generateCapVertices(
            newPositions, newNormals, newUvs, 
            newVertexIndex, radius, height/2, 
            subdivisionLevel, angularSegments, true
        );
        
        // Generate bottom cap (y = -height/2)
        console.log('Generating bottom cap at y =', -height/2);
        newVertexIndex = this.generateCapVertices(
            newPositions, newNormals, newUvs, 
            newVertexIndex, radius, -height/2, 
            subdivisionLevel, angularSegments, false
        );
        
        // Update geometry attributes
        geometry.setAttribute('position', new THREE.BufferAttribute(newPositions, 3));
        geometry.setAttribute('normal', new THREE.BufferAttribute(newNormals, 3));
        geometry.setAttribute('uv', new THREE.BufferAttribute(newUvs, 2));
        
        // Generate indices for the new cap faces
        this.generateCapIndices(geometry, oldVertexCount, subdivisionLevel, angularSegments);
        
        console.log('✅ Cap subdivision complete. Total vertices:', newVertexIndex);
    }
    
    /**
     * Generates vertices for a single cap (top or bottom)
     */
    generateCapVertices(positions, normals, uvs, startIndex, radius, yLevel, subdivisionLevel, angularSegments, isTop) {
        let vertexIndex = startIndex;
        
        // Add center vertex
        const centerIdx = vertexIndex * 3;
        positions[centerIdx] = 0;
        positions[centerIdx + 1] = yLevel;
        positions[centerIdx + 2] = 0;
        
        const normalIdx = vertexIndex * 3;
        normals[normalIdx] = 0;
        normals[normalIdx + 1] = isTop ? 1 : -1;
        normals[normalIdx + 2] = 0;
        
        const uvIdx = vertexIndex * 2;
        uvs[uvIdx] = 0.5;
        uvs[uvIdx + 1] = 0.5;
        
        vertexIndex++;
        
        // Add rings of vertices
        for (let ring = 1; ring <= subdivisionLevel; ring++) {
            const ringRadius = (ring / subdivisionLevel) * radius;
            
            for (let seg = 0; seg < angularSegments; seg++) {
                const angle = (seg / angularSegments) * Math.PI * 2;
                let x = ringRadius * Math.cos(angle);
                let z = ringRadius * Math.sin(angle);
                
                // Apply the same transformations as the base geometry
                const transformed = this.transformPoint(x, z);
                x = transformed.x;
                z = transformed.y; // Note: transformPoint returns {x, y} which maps to {x, z}
                
                const posIdx = vertexIndex * 3;
                positions[posIdx] = x;
                positions[posIdx + 1] = yLevel;
                positions[posIdx + 2] = z;
                
                const normIdx = vertexIndex * 3;
                normals[normIdx] = 0;
                normals[normIdx + 1] = isTop ? 1 : -1;
                normals[normIdx + 2] = 0;
                
                const uvIdx = vertexIndex * 2;
                uvs[uvIdx] = 0.5 + (x / (radius * 2));
                uvs[uvIdx + 1] = 0.5 + (z / (radius * 2));
                
                vertexIndex++;
            }
        }
        
        return vertexIndex;
    }
    
    /**
     * Generates indices for the cap faces
     */
    generateCapIndices(geometry, oldVertexCount, subdivisionLevel, angularSegments) {
        console.log('Generating cap face indices...');
        
        const oldIndices = geometry.index ? geometry.index.array : [];
        const newFaceCount = 2 * subdivisionLevel * angularSegments; // triangles for both caps
        const newIndices = new Uint32Array(oldIndices.length + newFaceCount * 3);
        
        // Copy old indices
        newIndices.set(oldIndices);
        let indexPtr = oldIndices.length;
        
        // Generate indices for both caps
        for (let cap = 0; cap < 2; cap++) {
            const isTop = cap === 0;
            const centerIndex = oldVertexCount + cap * (1 + subdivisionLevel * angularSegments);
            
            console.log(`Generating ${isTop ? 'top' : 'bottom'} cap indices, center at vertex`, centerIndex);
            
            // Connect center to first ring
            for (let seg = 0; seg < angularSegments; seg++) {
                const next = (seg + 1) % angularSegments;
                const curr = centerIndex + 1 + seg;
                const nextVert = centerIndex + 1 + next;
                
                if (isTop) {
                    newIndices[indexPtr++] = centerIndex;
                    newIndices[indexPtr++] = curr;
                    newIndices[indexPtr++] = nextVert;
                } else {
                    newIndices[indexPtr++] = centerIndex;
                    newIndices[indexPtr++] = nextVert;
                    newIndices[indexPtr++] = curr;
                }
            }
            
            // Connect rings
            for (let ring = 1; ring < subdivisionLevel; ring++) {
                const ringStart = centerIndex + 1 + (ring - 1) * angularSegments;
                const nextRingStart = centerIndex + 1 + ring * angularSegments;
                
                for (let seg = 0; seg < angularSegments; seg++) {
                    const next = (seg + 1) % angularSegments;
                    
                    if (isTop) {
                        // First triangle
                        newIndices[indexPtr++] = ringStart + seg;
                        newIndices[indexPtr++] = nextRingStart + seg;
                        newIndices[indexPtr++] = ringStart + next;
                        
                        // Second triangle
                        newIndices[indexPtr++] = ringStart + next;
                        newIndices[indexPtr++] = nextRingStart + seg;
                        newIndices[indexPtr++] = nextRingStart + next;
                    } else {
                        // First triangle (reversed winding)
                        newIndices[indexPtr++] = ringStart + seg;
                        newIndices[indexPtr++] = ringStart + next;
                        newIndices[indexPtr++] = nextRingStart + seg;
                        
                        // Second triangle (reversed winding)
                        newIndices[indexPtr++] = ringStart + next;
                        newIndices[indexPtr++] = nextRingStart + next;
                        newIndices[indexPtr++] = nextRingStart + seg;
                    }
                }
            }
        }
        
        geometry.setIndex(new THREE.BufferAttribute(newIndices, 1));
        console.log('✅ Cap indices generated, total faces:', newIndices.length / 3);
    }
    
    /**
     * Applies bowl/dome deformation to the geometry
     * @param {THREE.BufferGeometry} geometry 
     * @param {boolean} isCrust 
     */
    applyBowlDomeDeformation(geometry, isCrust = false) {
        const positions = geometry.attributes.position;
        const maxRadius = isCrust ? 2 : 2 * (1 - this.crustProportion);
        
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const z = positions.getZ(i); // Note: z is horizontal in our coordinate system
            const y = positions.getY(i); // y is vertical
            
            // Calculate distance from center in horizontal plane
            const dist = Math.sqrt(x * x + z * z);
            const normalizedDist = Math.min(dist / maxRadius, 1);
            
            // Apply bowl (negative) or dome (positive) curvature
            // Pointiness parameter controls the falloff curve (0 = quadratic, 1 = linear/pointy)
            const falloffExponent = 2 - this.pointiness * 1.5; // Range from 2 (smooth) to 0.5 (pointy)
            const curvatureAmount = this.bowlDomeAmount * (1 - Math.pow(normalizedDist, falloffExponent)) * this.pizzaHeight;
            
            positions.setY(i, y + curvatureAmount);
        }
        
        positions.needsUpdate = true;
    }
    
    /**
     * Applies thickness variance to create natural irregularities
     * @param {THREE.BufferGeometry} geometry 
     * @param {boolean} isCrust 
     */
    applyThicknessVariance(geometry, isCrust = false) {
        const positions = geometry.attributes.position;
        const density = isCrust ? this.crustThicknessVariance : this.thicknessVarianceDensity;
        const intensity = this.thicknessVariance;
        
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const z = positions.getZ(i);
            const y = positions.getY(i);
            
            // Use simple noise-like function for thickness variation
            // TODO: Replace with proper Perlin noise for better results
            const noiseValue = Math.sin(x * density * 10) * Math.cos(z * density * 10);
            const variance = noiseValue * intensity * this.pizzaHeight * 0.2;
            
            positions.setY(i, y + variance);
        }
        
        positions.needsUpdate = true;
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
        
        document.getElementById('stellation-slider').addEventListener('input', (e) => {
            this.stellation = parseFloat(e.target.value);
            document.getElementById('stellation-value').textContent = this.stellation.toFixed(1);
            this.updatePizza();
        });

        document.getElementById('thickness-variance-density-slider').addEventListener('input', (e) => {
            this.thicknessVarianceDensity = parseFloat(e.target.value);
            document.getElementById('thickness-variance-density-value').textContent = this.thicknessVarianceDensity.toFixed(1);
            this.updatePizza();
        });

        document.getElementById('pointiness-slider').addEventListener('input', (e) => {
            this.pointiness = parseFloat(e.target.value);
            document.getElementById('pointiness-value').textContent = this.pointiness.toFixed(2);
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
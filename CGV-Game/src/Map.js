// src/Map.js
import * as THREE from 'three';
import { Water } from 'three/examples/jsm/objects/Water.js'; // Import Water class
import { CubeTextureLoader } from 'three'; // Import CubeTextureLoader for reflections

export default class Map {
    constructor(scene) {
        this.scene = scene;
        this.interactiveObjects = [];
        this.obstacleBoundingBoxes = [];
        this.backgroundMusic = null;
        
        if (!this.scene) {
            console.error("Scene not provided to Map class.");
        }
    }

    clearMap(enemySpawner) {
        // Check if `this.scene` is defined
        if (!this.scene) {
            console.error("Scene is undefined in clearMap");
            return;
        }

        console.log("Clearing map and removing all children from the scene.");
    
        // Remove all children from the scene
        while (this.scene.children.length > 0) {
            this.scene.remove(this.scene.children[0]);
        }
    
        // Clear interactiveObjects and obstacleBoundingBoxes arrays
        this.interactiveObjects = [];
        this.obstacleBoundingBoxes = [];
    
        // Call `removeAllEnemies` on the enemy spawner to remove enemies
        if (enemySpawner) {
            enemySpawner.removeAllEnemies();
        }
    
        // Stop any currently playing audio
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0; // Reset the track
            this.backgroundMusic = null;
        }
    }
    
    

    addWorldBorders(size) {
        const borderThickness = 1;  // Thickness of the walls
        const borderHeight = 50;      // Height of the walls (to ensure player can't jump over)
        
        // Material for the borders (solid color, non-reflective)
        const borderMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0 }); // Clear material
        
        // Positions and dimensions for each border wall
        const borders = [
            { position: { x: -size / 2, y: borderHeight / 2, z: 0 }, size: [borderThickness, borderHeight, size] }, // Left wall
            { position: { x: size / 2, y: borderHeight / 2, z: 0 }, size: [borderThickness, borderHeight, size] }, // Right wall
            { position: { x: 0, y: borderHeight / 2, z: -size / 2 }, size: [size, borderHeight, borderThickness] }, // Front wall
            { position: { x: 0, y: borderHeight / 2, z: size / 2 }, size: [size, borderHeight, borderThickness] }  // Back wall
        ];
        
        borders.forEach(border => {
            // Create geometry based on the border size
            const geometry = new THREE.BoxGeometry(...border.size);
            
            // Create the mesh with geometry and material
            const wall = new THREE.Mesh(geometry, borderMaterial);
            
            // Set the wall's position
            wall.position.set(border.position.x, border.position.y, border.position.z);
            
            // Add the wall to the scene
            this.scene.add(wall);
    
            // Create and add the bounding box for collision detection
            const boundingBox = new THREE.Box3().setFromObject(wall);
            this.obstacleBoundingBoxes.push(boundingBox);  // Add the wall's bounding box to the array
        });
    }
    

    loadMap(mapType, enemySpawner) {
        // Clear the previous map and enemies before loading a new one
        this.clearMap(enemySpawner);
        this.stopBackgroundMusic();

        // Load new map based on map type and play its background track
        switch (mapType) {
            case 'forest':
                this.addForestMap();
                this.playBackgroundMusic('assets/audio/forest_bg.mp3'); // Specify the forest track
                this.addWorldBorders(100);
                break;
            case 'desert':
                this.addDesertMap();
                this.playBackgroundMusic('assets/audio/desert_bg.mp3'); // Specify the desert track
                this.addWorldBorders(100);
                break;
            case 'city':
                this.addCityMap();
                this.playBackgroundMusic('assets/audio/city_bg.mp3'); // Specify the city track
                this.addWorldBorders(100);
                break;
            default:
                console.warn(`Unknown map type: ${mapType}`);
        }
    }
  
    playBackgroundMusic(audioFilePath) {
        // If background music is already playing this track, don't reload
        if (this.backgroundMusic && this.backgroundMusic.src.includes(audioFilePath) && !this.backgroundMusic.ended) {
            console.log("Background music is already playing.");
            return;
        }
    
        // Otherwise, initialize a new audio object
        this.backgroundMusic = new Audio(audioFilePath);
        this.backgroundMusic.loop = true;
        this.backgroundMusic.volume = 0.5; // Adjust as necessary
        this.backgroundMusic.play().catch(error => console.error("Background music play error:", error));
    }
    
    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            // Keep `currentTime` for resuming later; do not reset to 0
        }
    }
    
    getBackgroundMusic() {
        return this.backgroundMusic;
    }
    
    addForestMap() {
        // Add the skybox for the forest
        this.addForestSkybox();
    
        // Create ambient light to soften shadows
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
        this.scene.add(this.ambientLight);
        
        // Create directional light for sunlight
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        this.directionalLight.position.set(5, 10, 7.5); // Position the light
        this.directionalLight.castShadow = true; // Enable shadows for this light
        this.scene.add(this.directionalLight);

        this.directionalLight.shadow.mapSize.width = 1024; // Increase resolution for shadows
        this.directionalLight.shadow.mapSize.height = 1024; // Increase resolution for shadows
        this.directionalLight.shadow.camera.near = 0.5; // Near plane for the shadow camera
        this.directionalLight.shadow.camera.far = 50; // Far plane for the shadow camera

        
        const forestGround = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100),
            new THREE.MeshStandardMaterial({ map: new THREE.TextureLoader().load('/assets/textures/forest/row-3-column-2.png') }) // Use the same ground texture
        );
        forestGround.rotation.x = -Math.PI / 2;
        forestGround.receiveShadow = true; // Enable ground to receive shadows
        this.scene.add(forestGround);
        this.interactiveObjects.push(forestGround);
        
        // Initialize bounding boxes for obstacles
        this.obstacleBoundingBoxes = [];  // Initialize bounding boxes array
    
        // Add trees, rocks, and bushes
        for (let i = 0; i < 30; i++) {
            const treePosition = new THREE.Vector3(
                THREE.MathUtils.randFloat(-40, 40),
                0,
                THREE.MathUtils.randFloat(-40, 40)
            );
            const tree = this.createTree(treePosition);
            if (tree) {
                tree.castShadow = true; // Enable tree to cast shadows
                this.scene.add(tree);
                this.obstacleBoundingBoxes.push(new THREE.Box3().setFromObject(tree));
            }
        
            const rockPosition = new THREE.Vector3(
                THREE.MathUtils.randFloat(-40, 40),
                0,
                THREE.MathUtils.randFloat(-40, 40)
            );
            const rock = this.createRock(rockPosition);
            if (rock) {
                rock.castShadow = true; // Enable rock to cast shadows
                this.scene.add(rock);
                this.obstacleBoundingBoxes.push(new THREE.Box3().setFromObject(rock));
            }
        
            const bushPosition = new THREE.Vector3(
                THREE.MathUtils.randFloat(-40, 40),
                0,
                THREE.MathUtils.randFloat(-40, 40)
            );
            const bush = this.createBush(bushPosition);
            if (bush) {
                bush.castShadow = true; // Enable bush to cast shadows
                this.scene.add(bush);
                this.obstacleBoundingBoxes.push(new THREE.Box3().setFromObject(bush));
            }
        }        
    }    
    

    createTree(position) {
        const geometry = new THREE.CylinderGeometry(0.5, 1, 4, 8);
        const material = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(geometry, material);
        
        const foliageGeometry = new THREE.ConeGeometry(2, 5, 8);
        const foliageMaterial = new THREE.MeshBasicMaterial({ color: 0x228B22 });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.y = 3;
        foliage.castShadow = true;
    
        const tree = new THREE.Group();
        tree.add(trunk);
        tree.add(foliage);
        tree.position.copy(position);
        tree.userData.isMapObject = true;  // Mark it as a map object for later reference
    
        return tree;  // Ensure we return the tree group
    }
    
    createRock(position) {
        const geometry = new THREE.DodecahedronGeometry(1, 0);
        const material = new THREE.MeshBasicMaterial({ color: 0x808080 });
        const rock = new THREE.Mesh(geometry, material);
        rock.position.copy(position);
        rock.userData.isMapObject = true;
        rock.castShadow = true; // Enable rock to cast shadows
    
        return rock;  // Return the rock mesh
    }
    
    createBush(position) {
        const geometry = new THREE.SphereGeometry(1.5, 8, 8);
        const material = new THREE.MeshBasicMaterial({ color: 0x006400 });
        const bush = new THREE.Mesh(geometry, material);
        bush.position.copy(position);
        bush.userData.isMapObject = true;
        bush.castShadow = true; // Enable bush to cast shadows
    
        return bush;  // Return the bush mesh
    }
    
    addDesertSkybox() {
        const loader = new THREE.CubeTextureLoader();
        const skyboxTexture = loader.load([
            '/assets/textures/desert/row-2-column-3.png', // Right
            '/assets/textures/desert/row-2-column-1.png', // Left
            '/assets/textures/desert/row-1-column-2.png', // Top
            '/assets/textures/desert/row-3-column-2.png', // Bottom
            '/assets/textures/desert/row-2-column-4.png', // Back
            '/assets/textures/desert/row-2-column-2.png'  // Front
        ]);
        
        // Set the scene background to the skybox texture
        this.scene.background = skyboxTexture;
    }    

    addForestSkybox() {
        const loader = new THREE.CubeTextureLoader();
        const skyboxTexture = loader.load([
            '/assets/textures/forest/row-2-column-3.png', // Right
            '/assets/textures/forest/row-2-column-1.png', // Left
            '/assets/textures/forest/row-1-column-2.png', // Top
            '/assets/textures/forest/row-3-column-2.png', // Bottom
            '/assets/textures/forest/row-2-column-4.png', // Back
            '/assets/textures/forest/row-2-column-2.png'  // Front
        ]);
        
        // Set the scene background to the skybox texture
        this.scene.background = skyboxTexture;
    }  

    addDesertMap() {
        const desertGround = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100),
            new THREE.MeshStandardMaterial({ map: new THREE.TextureLoader().load('/assets/textures/desert/row-3-column-2.png') }) // Use the same ground texture
        );
        desertGround.rotation.x = -Math.PI / 2;
        desertGround.receiveShadow = true; // Enable ground to receive shadows
        this.scene.add(desertGround);
        this.interactiveObjects.push(desertGround);
        
        // Create and add the reflective oasis
        this.createOasis(new THREE.Vector3(0, 0.1, 0), 10); // Position and size of the oasis
    
        // Add the skybox
        this.addDesertSkybox();
    
        // Create ambient light to soften shadows
        const ambientLight = new THREE.AmbientLight(0x404040, 1); // Soft white light
        this.scene.add(ambientLight);
    
        // Create directional light to simulate sunlight
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 7.5); // Set position of the light
        directionalLight.castShadow = false; // Enable shadows for this light
        this.scene.add(directionalLight);
        
        // Optional: Adjust shadow settings (if needed)
        directionalLight.shadow.mapSize.width = 256; // Default
        directionalLight.shadow.mapSize.height = 256; // Default
        directionalLight.shadow.camera.near = 0.5; // Default
        directionalLight.shadow.camera.far = 50; // Default
    
        // Create a point light for additional localized lighting
        const pointLight = new THREE.PointLight(0xffaa00, 1, 50); // Warm color, intensity, distance
        pointLight.position.set(0, 5, 0); // Position the point light
        pointLight.castShadow = false; // Enable shadows
        this.scene.add(pointLight);
        
        // Create hemisphere light for sky and ground illumination
        const hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, 1); // Sky color, ground color, intensity
        this.scene.add(hemisphereLight);
    }
    
    
    createOasis(position, size) {
        // Load the cubemap for reflections
        const loader = new CubeTextureLoader();
        const reflectionTexture = loader.load([
            '/assets/textures/desert/row-2-column-3.png', // Right
            '/assets/textures/desert/row-2-column-1.png', // Left
            '/assets/textures/desert/row-1-column-2.png', // Top
            '/assets/textures/desert/row-3-column-2.png', // Bottom
            '/assets/textures/desert/row-2-column-4.png', // Back
            '/assets/textures/desert/row-2-column-2.png'  // Front
        ]);
        
        // Create the water surface
        const waterGeometry = new THREE.PlaneGeometry(size, size);
        const water = new Water(waterGeometry, {
            color: 0x001e0f, // Water color
            scale: 1, // Waves scale
            flowDirection: new THREE.Vector2(1, 1), // Flow direction
            textureWidth: 256, // Reflection texture width
            textureHeight: 256, // Reflection texture height
            // Set reflection map
            envMap: reflectionTexture,
        });
        
        // Position the oasis
        water.rotation.x = -Math.PI / 2; // Make it horizontal
        water.position.copy(position);
        water.receiveShadow = true; // Make sure it can receive shadows
        this.scene.add(water);
    }    

    addCitySkybox() {
        const loader = new THREE.CubeTextureLoader();
        const skyboxTexture = loader.load([
            '/assets/textures/city/posx.jpg', // Right
            '/assets/textures/city/negx.jpg', // Left
            '/assets/textures/city/posy.jpg', // Top
            '/assets/textures/city/negy.jpg', // Bottom
            '/assets/textures/city/posz.jpg', // Back
            '/assets/textures/city/negz.jpg'  // Front
        ]);
        
        // Set the scene background to the skybox texture
        this.scene.background = skyboxTexture;
    } 

    addCityMap() {
        // Add ground for city
        const cityGround = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100),
            new THREE.MeshStandardMaterial({ map: new THREE.TextureLoader().load('/assets/textures/city/negy.jpg') })
        );
        cityGround.rotation.x = -Math.PI / 2;
        this.scene.add(cityGround);
        this.interactiveObjects.push(cityGround);
    
        this.addCitySkybox(); // Add the city skybox
    
        this.obstacleBoundingBoxes = [];  // Initialize bounding boxes array
    
        // Add streetlights to the city
        this.addStreetLights();
    
        // Add moon-like light
        this.addMoonLight();

        const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
        this.scene.add(ambientLight);
    
        // Optionally, add buildings or other city-specific objects here
    }
    
    addMoonLight() {
        // Create a directional light to simulate moonlight
        const moonLight = new THREE.DirectionalLight(0xffffff, 0.5); // White light
        moonLight.position.set(5, 40, 5); // Set the position of the moon light
        moonLight.castShadow = true; // Enable shadow casting
    
        // Optional: Adjust light properties for softer shadows
        moonLight.shadow.mapSize.width = 2048; // Default is 512
        moonLight.shadow.mapSize.height = 2048; // Default is 512
        moonLight.shadow.camera.near = 0.5; // Default is 0.5
        moonLight.shadow.camera.far = 50; // Default is 50
    
        // Add the light to the scene
        this.scene.add(moonLight);
        
        // Optional: Add a helper to visualize the moonlight direction in the scene
        const helper = new THREE.DirectionalLightHelper(moonLight, 1); // Size of the helper
        this.scene.add(helper);
    }
    

    addStreetLights() {
        // Define positions for streetlights (example grid)
        const spacing = 10; // Spacing between streetlights
        const range = 50;    // Range of the city area
        const streetLightPositions = [];

        for (let x = -range / 2; x <= range / 2; x += spacing) {
            for (let z = -range / 2; z <= range / 2; z += spacing) {
                // Place streetlights along the edges of the city
                if (Math.abs(x) === range / 2 || Math.abs(z) === range / 2) {
                    streetLightPositions.push(new THREE.Vector3(x, 0, z));
                }
            }
        }

        // Add a streetlight at each position
        streetLightPositions.forEach(position => {
            const streetLight = this.createStreetLight(position);
            if (streetLight) {
                this.obstacleBoundingBoxes.push(new THREE.Box3().setFromObject(streetLight));
            }
        });
    }

    createStreetLight(position) {
        const streetLight = new THREE.Group();
    
        // Create pole
        const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 5, 8);
        const poleMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.y = 2.5; // Half the height to position base at ground
        pole.castShadow = true;
        pole.receiveShadow = true;
        streetLight.add(pole);
    
        // Create light
        const light = new THREE.PointLight(0xffee88, 1, 10);
        light.position.set(0, 5, 0); // At the top of the pole
        light.castShadow = true;
        streetLight.add(light);
    
        // Add a bulb mesh for visualization
        const bulbGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const bulbMaterial = new THREE.MeshStandardMaterial({ color: 0xffffee, emissive: 0xffffee, emissiveIntensity: 1 });
        const bulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
        bulb.position.set(0, 5, 0);
        bulb.castShadow = true;
        bulb.receiveShadow = true;
        streetLight.add(bulb);
    
        // Set streetLight position
        streetLight.position.copy(position);
        streetLight.userData.isMapObject = true; // Mark as part of the map
    
        this.scene.add(streetLight);
    
        return streetLight;
    }
    
    getInteractiveObjects() {
        return this.interactiveObjects;
    }
}

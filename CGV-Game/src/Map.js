// src/Map.js
import * as THREE from 'three';

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

        // Remove all map-specific objects
        const objectsToRemove = [];
        this.scene.traverse((object) => {
            if (object.isMesh && object.userData.isMapObject) { // Only remove map objects
                objectsToRemove.push(object);
            }
        });

        objectsToRemove.forEach((object) => this.scene.remove(object));
        this.obstacleBoundingBoxes = []; // Clear obstacle bounding boxes
        // Call `removeAllEnemies` on the enemy spawner to remove enemies
        if (enemySpawner) {
            enemySpawner.removeAllEnemies();
        }

        // Stop any currently playing audio
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0; // Reset the track
            this.currentAudio = null;
        }
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
                break;
            case 'desert':
                this.addDesertMap();
                this.playBackgroundMusic('assets/audio/desert_bg.mp3'); // Specify the desert track
                break;
            case 'city':
                this.addCityMap();
                this.playBackgroundMusic('assets/audio/city_bg.mp3'); // Specify the city track
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
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
        this.scene.add(this.ambientLight);
    
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        this.directionalLight.position.set(5, 10, 7.5); // Position the light
        this.scene.add(this.directionalLight);
    
        const forestGround = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100),
            new THREE.MeshBasicMaterial({ color: 0x228B22 })
        );
        forestGround.rotation.x = -Math.PI / 2;
        this.scene.add(forestGround);
        this.interactiveObjects.push(forestGround);
    
        this.obstacleBoundingBoxes = [];  // Initialize bounding boxes array
    
        for (let i = 0; i < 30; i++) {
            const treePosition = new THREE.Vector3(
                THREE.MathUtils.randFloat(-40, 40),
                0,
                THREE.MathUtils.randFloat(-40, 40)
            );
            const tree = this.createTree(treePosition);
            if (tree) {
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
    
        return rock;  // Return the rock mesh
    }
    
    createBush(position) {
        const geometry = new THREE.SphereGeometry(1.5, 8, 8);
        const material = new THREE.MeshBasicMaterial({ color: 0x006400 });
        const bush = new THREE.Mesh(geometry, material);
        bush.position.copy(position);
        bush.userData.isMapObject = true;
    
        return bush;  // Return the bush mesh
    }
    
    

    addDesertMap() {
        const desertGround = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100),
            new THREE.MeshBasicMaterial({ color: 0xC2B280 })
        );
        desertGround.rotation.x = -Math.PI / 2;
        this.scene.add(desertGround);
        this.interactiveObjects.push(desertGround);
    }

    addCityMap() {
        const cityGround = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100),
            new THREE.MeshBasicMaterial({ color: 0x808080 })
        );
        cityGround.rotation.x = -Math.PI / 2;
        this.scene.add(cityGround);
        this.interactiveObjects.push(cityGround);
    }

    getInteractiveObjects() {
        return this.interactiveObjects;
    }
}

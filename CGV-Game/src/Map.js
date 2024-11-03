// src/Map.js
import * as THREE from 'three';

export default class Map {
    constructor(scene) {
        this.scene = scene;
        this.interactiveObjects = [];
        this.currentAudio = null; // Track the current audio element
        
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

        // Load new map based on map type and play its background track
        switch (mapType) {
            case 'forest':
                this.addForestMap();
                this.playBackgroundTrack('assets/audio/forest_bg.mp3'); // Specify the forest track
                break;
            case 'desert':
                this.addDesertMap();
                this.playBackgroundTrack('assets/audio/desert_bg.mp3'); // Specify the desert track
                break;
            case 'city':
                this.addCityMap();
                this.playBackgroundTrack('assets/audio/city_bg.mp3'); // Specify the city track
                break;
            default:
                console.warn(`Unknown map type: ${mapType}`);
        }
    }
  
    playBackgroundTrack(audioSrc) {
        // Stop any current audio track
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }

        // Create a new audio element and start playing
        this.currentAudio = new Audio(audioSrc);
        this.currentAudio.loop = true; // Loop the track
        this.currentAudio.volume = 0.5; // Adjust volume as needed
        this.currentAudio.play().catch(error => console.error("Audio play error:", error));
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

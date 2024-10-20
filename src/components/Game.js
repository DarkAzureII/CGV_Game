import * as THREE from 'three';
import { Player } from './player.js';
import { Enemy } from './enemy.js';
import { levels } from './levels.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import * as CANNON from 'cannon-es'; // Import Cannon.js

export class Game {
  constructor() {
    // Three.js setup
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 20, 30);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.controls = new PointerLockControls(this.camera, document.body);
    this.scene.add(this.controls.getObject());

    this.addLights();

    // Cannon.js physics setup
    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.82, 0); // Earth-like gravity

    this.addGround(); // Add ground with physics
    this.player = new Player(this.scene, this.world); // Update Player class to include physics
    this.maxEnemies = 10; // New property to limit the number of enemies
    this.enemies = [];
    this.currentLevelIndex = 0;
    this.spawnInterval = null;

    this.keys = { left: false, right: false, forward: false, backward: false };
    this.setupControls();

    this.loadIsland();
    this.startLevel();

    // Add collision detection for damage handling
    this.addCollisionHandler();
  }

  addLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);
  }

  // Add ground physics
  addGround() {
    const groundShape = new CANNON.Plane();
    const groundBody = new CANNON.Body({ mass: 0 }); // mass = 0 means it's static
    groundBody.addShape(groundShape);
    groundBody.position.set(0, 0, 0); // Adjust ground position
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); // Rotate ground to be horizontal
    this.world.addBody(groundBody);

    // Visual representation of the ground in Three.js
    const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    this.scene.add(groundMesh);
  }

  loadIsland() {
    const loader = new GLTFLoader();
    loader.load('/assets/untitled.glb', (gltf) => {
      this.scene.add(gltf.scene);
      this.setupIsland(gltf.scene);
    }, undefined, (error) => {
      console.error('An error occurred while loading the island:', error);
    });
  }

  setupIsland(island) {
    island.position.set(0, 0, 0);
    island.scale.set(1, 1, 1);
  }

  setupControls() {
    document.addEventListener('click', () => {
      this.controls.lock();
    });

    document.addEventListener('keydown', (event) => {
      if (event.code === 'ArrowLeft' || event.code === 'KeyA') this.keys.left = true;
      if (event.code === 'ArrowRight' || event.code === 'KeyD') this.keys.right = true;
      if (event.code === 'ArrowUp' || event.code === 'KeyW') this.keys.forward = true;
      if (event.code === 'ArrowDown' || event.code === 'KeyS') this.keys.backward = true;
    });

    document.addEventListener('keyup', (event) => {
      if (event.code === 'ArrowLeft' || event.code === 'KeyA') this.keys.left = false;
      if (event.code === 'ArrowRight' || event.code === 'KeyD') this.keys.right = false;
      if (event.code === 'ArrowUp' || event.code === 'KeyW') this.keys.forward = false;
      if (event.code === 'ArrowDown' || event.code === 'KeyS') this.keys.backward = false;
    });
  }

  startLevel() {
    const level = levels[this.currentLevelIndex];
    this.enemies = [];
    this.spawnEnemies(level.enemyCount);
    this.startEnemySpawning(level.spawnRate);
  }

  startEnemySpawning(spawnRate) {
    this.spawnInterval = setInterval(() => {
      if (this.enemies.length < this.maxEnemies) {
        this.spawnEnemy();
      } else {
        clearInterval(this.spawnInterval); // Stop spawning when max is reached
      }
    }, spawnRate);
  }

  spawnEnemies(count) {
    for (let i = 0; i < count && this.enemies.length < this.maxEnemies; i++) {
      this.spawnEnemy();
    }
  }

  spawnEnemy() {
    const enemy = new Enemy(this.scene, this.world); 
    this.enemies.push(enemy);
  }

  addCollisionHandler() {
    this.world.addEventListener('postStep', () => {
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const enemy = this.enemies[i];
        const distance = this.player.body.position.distanceTo(enemy.body.position);
        if (distance < 6) { // Assuming a small threshold for "collision"
          this.handleDamage(enemy, i);
          console.log('Collision detected!');
        }
      }
    });
  }

  handleDamage(enemy, index) {
    // Damage player
    this.player.health -= 10;
    console.log(`Player health: ${this.player.health}`);
    
    // Damage enemy
    enemy.health -= 10;
    console.log(`Enemy health: ${enemy.health}`);

    // Remove enemy if health is 0
    if (enemy.health <= 0) {
      this.scene.remove(enemy.mesh);
      this.world.removeBody(enemy.body);
      this.enemies.splice(index, 1);
    }

    // Check if player dies
    if (this.player.health <= 0) {
      console.log('Player is dead! Game Over!');
      // Implement game over logic
    }
  }

  update() {
    const timeStep = 1 / 60; // Time step for physics simulation (60fps)
    this.world.step(timeStep); // Update physics world

    this.player.updateMovement(this.keys);
    this.enemies.forEach(enemy => {
      enemy.moveToward(this.player.mesh); // Move toward player
      enemy.update(); // Sync physics and Three.js mesh
    });

    if (this.enemies.length === 0) {
      this.levelComplete();
    }
  }

  levelComplete() {
    clearInterval(this.spawnInterval);
    if (this.currentLevelIndex < levels.length - 1) {
      this.currentLevelIndex++;
      this.startLevel();
    } else {
      console.log('Game Complete!');
    }
  }

  render() {
    requestAnimationFrame(() => this.render());
    this.update();
    this.renderer.render(this.scene, this.camera);
  }
}

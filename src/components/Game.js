// src/components/Game.js
import * as THREE from 'three';
import { Player } from './player.js';
import { Enemy } from './enemy.js';
import { levels } from './levels.js'; // Import levels configuration

export class Game {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 20, 30);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.player = new Player(this.scene);
    this.enemies = [];
    this.currentLevelIndex = 0; // Track the current level
    this.spawnInterval = null;

    this.keys = { left: false, right: false, forward: false, backward: false };
    this.setupControls();
    this.startLevel(); // Start the first level
  }

  setupControls() {
    document.addEventListener('keydown', (event) => {
      if (event.code === 'ArrowLeft' || event.code === 'KeyA') this.keys.left = true;
      if (event.code === 'ArrowRight' || event.code === 'KeyD') this.keys.right = true;
      if (event.code === 'ArrowUp' || event.code === 'KeyW') this.keys.forward = true;
      if (event.code === 'ArrowDown' || event.code === 'KeyS') this.keys.backward = false;
    });

    document.addEventListener('keyup', (event) => {
      if (event.code === 'ArrowLeft' || event.code === 'KeyA') this.keys.left = false;
      if (event.code === 'ArrowRight' || event.code === 'KeyD') this.keys.right = false;
      if (event.code === 'ArrowUp' || event.code === 'KeyW') this.keys.forward = false;
      if (event.code === 'ArrowDown' || event.code === 'KeyS') this.keys.backward = false;
    });
  }

  startLevel() {
    const level = levels[this.currentLevelIndex]; // Get the current level configuration
    this.enemies = []; // Reset enemies
    this.spawnEnemies(level.enemyCount); // Spawn enemies for the level
    this.startEnemySpawning(level.spawnRate); // Start spawning enemies
  }

  startEnemySpawning(spawnRate) {
    this.spawnInterval = setInterval(() => this.spawnEnemy(), spawnRate);
  }

  spawnEnemies(count) {
    for (let i = 0; i < count; i++) {
      this.spawnEnemy();
    }
  }

  spawnEnemy() {
    this.enemies.push(new Enemy(this.scene));
  }

  update() {
    this.player.updateMovement(this.keys);
    this.enemies.forEach(enemy => enemy.moveToward(this.player.mesh));
    
    // Check if the level is complete (customize this logic as needed)
    if (this.enemies.length === 0) {
      this.levelComplete();
    }
  }

  levelComplete() {
    clearInterval(this.spawnInterval); // Stop spawning enemies
    if (this.currentLevelIndex < levels.length - 1) {
      this.currentLevelIndex++; // Move to the next level
      this.startLevel(); // Start the next level
    } else {
      console.log('Game Complete!'); // Handle game completion logic here
    }
  }

  render() {
    requestAnimationFrame(() => this.render());
    this.update();
    this.renderer.render(this.scene, this.camera);
  }
}

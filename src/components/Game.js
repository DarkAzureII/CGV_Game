// src/components/Game.js
import * as THREE from 'three';
import { Player } from './player.js';
import { Enemy } from './enemy.js';
import { levels } from './levels.js';
import { Environment } from './Environment.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js'; // Import PointerLockControls

export class Game {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 20, 30);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.controls = new PointerLockControls(this.camera, document.body); // Initialize PointerLockControls
    this.scene.add(this.controls.getObject()); // Add controls to the scene

    this.player = new Player(this.scene);
    this.enemies = [];
    this.currentLevelIndex = 0;
    this.spawnInterval = null;

    this.keys = { left: false, right: false, forward: false, backward: false };
    this.setupControls();
    
    new Environment(this.scene); // Create the environment
    this.startLevel();
  }

  setupControls() {
    // Event listener for mouse lock
    document.addEventListener('click', () => {
      this.controls.lock(); // Lock the pointer on click
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

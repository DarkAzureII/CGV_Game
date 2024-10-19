// src/components/Game.js
import * as THREE from 'three';
import { Player } from './player.js';
import { Enemy } from './enemy.js';

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

    this.keys = { left: false, right: false, forward: false, backward: false };
    this.setupControls();
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

  spawnEnemy() {
    this.enemies.push(new Enemy(this.scene));
  }

  update() {
    this.player.updateMovement(this.keys);
    this.enemies.forEach(enemy => enemy.moveToward(this.player.mesh));
  }

  render() {
    requestAnimationFrame(() => this.render());
    this.update();
    this.renderer.render(this.scene, this.camera);
  }
}

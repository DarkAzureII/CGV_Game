// File: game.js
import * as THREE from 'three';
import { Player } from './player.js';
import { EnemyManager } from './enemyManager.js';
import { LevelManager } from './levelManager.js';
import { PhysicsWorld } from './physicsWorld.js';
import { SceneManager } from './sceneManager.js';
import { InputManager } from './inputManager.js';
import { CollisionManager } from './collisionManager.js';

export class Game {
  constructor() {
    this.sceneManager = new SceneManager();
    this.physicsWorld = new PhysicsWorld();
    this.player = new Player(this.sceneManager.scene, this.physicsWorld.world);
    this.enemyManager = new EnemyManager(this.sceneManager.scene, this.physicsWorld.world);
    this.levelManager = new LevelManager(this.enemyManager);
    this.inputManager = new InputManager(this.sceneManager.controls);
    this.collisionManager = new CollisionManager(this.physicsWorld.world, this.player, this.enemyManager);

    this.setupGame();
  }

  setupGame() {
    this.sceneManager.setup();
    this.physicsWorld.setup();
    this.levelManager.startLevel();
    this.collisionManager.setup();
  }

  update() {
    const timeStep = 1 / 60;
    this.physicsWorld.update(timeStep);
    this.player.updateMovement(this.inputManager.keys);
    this.enemyManager.update(this.player.mesh);
    this.collisionManager.checkCollisions();

    if (this.enemyManager.enemies.length === 0) {
      this.levelManager.levelComplete();
    }
  }

  render() {
    requestAnimationFrame(() => this.render());
    this.update();
    this.sceneManager.render();
  }
}
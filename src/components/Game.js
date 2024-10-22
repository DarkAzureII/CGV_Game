// File: game.js
import * as THREE from 'three';
import { Player } from './Player.js';
import { EnemyManager } from './enemyManager.js';
import { LevelManager } from './levelManager.js';
import { PhysicsWorld } from './physicsWorld.js';
import { SceneManager } from './sceneManager.js';
import { InputManager } from './inputManager.js';
import { CollisionManager } from './collisionManager.js';
import { Menu } from './menu.js'

const clock = new THREE.Clock(); 

export class Game {
  constructor() {
    this.sceneManager = new SceneManager();
    this.physicsWorld = new PhysicsWorld();
    this.physicsWorld = new PhysicsWorld(this.sceneManager);
    this.player = new Player(this.sceneManager.scene, this.physicsWorld.world);
    this.enemyManager = new EnemyManager(this.sceneManager.scene, this.physicsWorld.world);
    this.levelManager = new LevelManager(this.enemyManager);
    this.inputManager = new InputManager(this.sceneManager.controls);
    this.collisionManager = new CollisionManager(this.physicsWorld.world, this.player, this.enemyManager);
    this.menu = new Menu();
    this.player.onDie = () => this.gameOver();

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
    this.sceneManager.updateCamera(this.player)
    this.player.shoot(this.enemyManager, this.inputManager.mouse, clock, this.collisionManager);  // Pass mouse data and enemy manager to handle shooting

    if (this.enemyManager.enemies.length === 0) {
      this.levelManager.levelComplete();
    }
  }

  gameOver() {
      console.log("Game Over!");
      this.showGameOverScreen();
      cancelAnimationFrame(this.renderID); // Stop the render loop
  }

  showGameOverScreen() {
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      overlay.style.color = 'white';
      overlay.style.display = 'flex';
      overlay.style.justifyContent = 'center';
      overlay.style.alignItems = 'center';
      overlay.style.fontSize = '48px';
      overlay.innerText = 'Game Over!';

      const restartButton = document.createElement('button');
      restartButton.innerText = 'Restart';
      restartButton.style.marginTop = '20px';
      restartButton.onclick = () => {
          document.body.removeChild(overlay);
          this.restartGame();
      };
      overlay.appendChild(restartButton);

      document.body.appendChild(overlay);
  }

  restartGame() {
      this.player.health = 100;
      this.player.isAlive = true;
      this.player.updateHealthBar();

      this.sceneManager.controls.unlock(); // Unlock before restarting
      this.menu.render();
  }

  render() {
    requestAnimationFrame(() => this.render());
    this.update();
    this.sceneManager.render();
  }
}
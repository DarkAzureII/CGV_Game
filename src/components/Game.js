import * as THREE from 'three';
import { Player } from './Player.js';
import { EnemyManager } from './enemyManager.js';
import { LevelManager } from './levelManager.js';
import { PhysicsWorld } from './physicsWorld.js';
import { SceneManager } from './sceneManager.js';
import { InputManager } from './inputManager.js';
import { CollisionManager } from './collisionManager.js';
import { Menu } from './menu.js';

const clock = new THREE.Clock();

export class Game {
  constructor() {
    this.paused = true;
    this.sceneManager = new SceneManager();
    this.physicsWorld = new PhysicsWorld(this.sceneManager);
    this.player = new Player(this.sceneManager.scene, this.physicsWorld.world);
    this.enemyManager = new EnemyManager(this.sceneManager.scene, this.physicsWorld.world);
    this.levelManager = new LevelManager(this.enemyManager);
    this.inputManager = new InputManager(this.sceneManager.controls);
    this.collisionManager = new CollisionManager(this.physicsWorld.world, this.player, this.enemyManager);
    this.menu = new Menu();
    this.player.onDie = () => this.gameOver();

    this.setupGame();
    this.createCrosshair(); // Initialize crosshair
    this.requestPointerLock();
  }

  createCrosshair() {
    this.crosshair = document.createElement('div');
    this.crosshair.style.position = 'absolute';
    this.crosshair.style.width = '30px';
    this.crosshair.style.height = '30px';
    this.crosshair.style.pointerEvents = 'none';
    this.crosshair.style.zIndex = '1000';

    // Horizontal and vertical lines for crosshair
    const horizontalLine = document.createElement('div');
    horizontalLine.style.width = '30px';
    horizontalLine.style.height = '2px';
    horizontalLine.style.backgroundColor = 'red';
    horizontalLine.style.position = 'absolute';
    horizontalLine.style.top = '14px';

    const verticalLine = document.createElement('div');
    verticalLine.style.width = '2px';
    verticalLine.style.height = '30px';
    verticalLine.style.backgroundColor = 'red';
    verticalLine.style.position = 'absolute';
    verticalLine.style.left = '14px';

    this.crosshair.appendChild(horizontalLine);
    this.crosshair.appendChild(verticalLine);
    document.body.appendChild(this.crosshair);

    // Center crosshair
    this.cursorX = window.innerWidth / 2;
    this.cursorY = window.innerHeight / 2;
    this.crosshair.style.transform = `translate(${this.cursorX - 15}px, ${this.cursorY - 15}px)`;

    document.addEventListener('mousemove', (event) => {
      if (document.pointerLockElement) {
        this.cursorX += event.movementX;
        this.cursorY += event.movementY;
        this.cursorX = Math.max(0, Math.min(window.innerWidth, this.cursorX));
        this.cursorY = Math.max(0, Math.min(window.innerHeight, this.cursorY));
        this.crosshair.style.transform = `translate(${this.cursorX - 15}px, ${this.cursorY - 15}px)`;
      }
    });

    document.addEventListener('pointerlockchange', () => {
      const isLocked = document.pointerLockElement;
      this.crosshair.style.display = isLocked ? 'block' : 'none';
    });
  }

  setupGame() {
    this.sceneManager.setup();
    this.physicsWorld.setup();
    this.levelManager.startLevel();
    this.collisionManager.setup();
  }

  requestPointerLock() {
    const canvas = this.sceneManager.renderer.domElement;

    canvas.addEventListener('click', () => {
      canvas.requestPointerLock();
    });

    canvas.addEventListener('click', () => {
      if (document.fullscreenElement !== canvas) {
        canvas.requestFullscreen();
      }
    });

    document.addEventListener('pointerlockchange', this.pointerLockChange.bind(this), false);
    document.addEventListener('pointerlockerror', this.pointerLockError, false);
  }

  pointerLockChange() {
    const canvas = this.sceneManager.renderer.domElement;
    if (document.pointerLockElement === canvas) {
      console.log('Pointer locked.');
      this.inputManager.enableMouseControls();
      this.disableBrowserDefaults();
    } else {
      console.log('Pointer unlocked.');
      this.inputManager.disableMouseControls();
      this.enableBrowserDefaults();
    }
  }

  disableBrowserDefaults() {
    document.addEventListener('contextmenu', this.preventDefault);
    document.addEventListener('wheel', this.preventDefault);
    document.addEventListener('keydown', this.preventDefault);
  }

  enableBrowserDefaults() {
    document.removeEventListener('contextmenu', this.preventDefault);
    document.removeEventListener('wheel', this.preventDefault);
    document.removeEventListener('keydown', this.preventDefault);
  }

  preventDefault(event) {
    event.preventDefault();
  }

  pointerLockError() {
    console.error('Error locking pointer.');
  }

  update() {
    if (this.paused) return;

    const timeStep = 1 / 60;
    this.physicsWorld.update(timeStep);
    this.player.updateMovement(this.inputManager.keys);
    this.player.update(this.inputManager.keys, clock.getDelta());

    // Check if the player's mesh is ready
    if (this.player.mesh) {
        this.enemyManager.update(this.player.mesh);
    } else {
        console.warn("Player mesh is not yet available");
    }

    this.collisionManager.checkCollisions();
    this.sceneManager.updateCamera(this.player);
    this.player.shoot(this.enemyManager, this.inputManager.mouse, clock, this.sceneManager.scene, this.physicsWorld, this.collisionManager);

    if (this.enemyManager.enemies.length === 0) {
        this.levelManager.levelComplete();
    }
}


  gameOver() {
    console.log("Game Over!");
    this.showGameOverScreen();
    cancelAnimationFrame(this.renderID);
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

    this.enemyManager.reset();
    this.levelManager.reset();

    this.cleanup();
    this.setupGame();
    this.start();

    const overlay = document.getElementById('game-over-overlay');
    if (overlay) {
      document.body.removeChild(overlay);
    }
  }

  render() {
    this.renderID = requestAnimationFrame(() => this.render());
    if (!this.paused) this.update();
    this.sceneManager.render();
  }

  start() {
    this.paused = false;
    this.levelManager.startLevel();

  }

  pause() {
    console.log("Game paused.");
    this.paused = true;
  }

  resume() {
    console.log("Game resumed.");
    this.paused = false;
  }

  cleanup() {
    this.paused = true;
  }
}

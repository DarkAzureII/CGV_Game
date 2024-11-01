
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
    this.paused = true; // Game starts in a paused state
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
    this.requestPointerLock(); 
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
  
    // Listen for pointer lock changes or errors
    document.addEventListener('pointerlockchange', this.pointerLockChange.bind(this), false);
    document.addEventListener('pointerlockerror', this.pointerLockError, false);
  }
  
  pointerLockChange() {
    const canvas = this.sceneManager.renderer.domElement;
  
    if (document.pointerLockElement === canvas) {
      console.log('Pointer locked.');
      this.inputManager.enableMouseControls();  // Enable your custom mouse controls here
    } else {
      console.log('Pointer unlocked.');
      this.inputManager.disableMouseControls(); // Disable mouse controls when unlocked
    }
  }
  
  pointerLockError() {
    console.error('Error locking pointer.');
  }

  update() {
    if (this.paused) {
      return; // Don't update the game if it's paused
    }

    const timeStep = 1 / 60;
    this.physicsWorld.update(timeStep);
    this.player.updateMovement(this.inputManager.keys);
    this.enemyManager.update(this.player.mesh);
    this.collisionManager.checkCollisions();
    this.sceneManager.updateCamera(this.player);
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
    overlay.style.backgroundColor = 'rgba(0, 255, 0, 0)';
    
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
    // Reset player state
    this.player.health = 100;
    this.player.isAlive = true;
    this.player.updateHealthBar(); // Reset health bar display

    // Reset enemy manager and level manager
    this.enemyManager.reset(); // You will need to implement this method
    this.levelManager.reset(); // You will need to implement this method

    // Cleanup and reinitialize the game world
    this.cleanup();
    this.setupGame(); // Reinitialize the game components
    
    // Start the game
    this.start();
    
    // Hide the game over screen if it's still displayed
    const overlay = document.getElementById('game-over-overlay');
    if (overlay) {
        document.body.removeChild(overlay);
    }
}

  render() {
    // The game should render even if it's paused (static background)
    this.renderID = requestAnimationFrame(() => this.render());

    // Call update only if the game is not paused
    if (!this.paused) {
      this.update();
    }
    
    this.sceneManager.render(); // Always render the scene
  }

  start() {
    this.paused = false; // Unpause the game and allow updates
    this.levelManager.startLevel();
  }
  pause() {
    console.log("Game paused.");
    this.paused = true; // Pause the game
}

resume() {
    console.log("Game resumed.");
    this.paused = false; // Allow the game to continue
}
  cleanup() {
    this.paused = true; // Set game to paused before cleaning up
    // Add additional cleanup logic here if needed
  }
}
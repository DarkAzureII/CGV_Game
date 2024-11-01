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
    // Your existing setup code
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
    this.createCrosshair(); // Add this line to set up the crosshair
    this.requestPointerLock();
  }

  createCrosshair() {
    // Create the crosshair element
    this.crosshair = document.createElement('div');
    this.crosshair.style.position = 'absolute';
    this.crosshair.style.width = '30px';  // Increased size for visibility
    this.crosshair.style.height = '30px';
    this.crosshair.style.background = 'transparent';
    this.crosshair.style.pointerEvents = 'none';
    this.crosshair.style.zIndex = '1000';

    // Create horizontal and vertical lines for the crosshair
    const horizontalLine = document.createElement('div');
    horizontalLine.style.position = 'absolute';
    horizontalLine.style.width = '30px';
    horizontalLine.style.height = '2px';
    horizontalLine.style.backgroundColor = 'red';
    horizontalLine.style.top = '14px';

    const verticalLine = document.createElement('div');
    verticalLine.style.position = 'absolute';
    verticalLine.style.width = '2px';
    verticalLine.style.height = '30px';
    verticalLine.style.backgroundColor = 'red';
    verticalLine.style.left = '14px';

    // Append lines to the crosshair
    this.crosshair.appendChild(horizontalLine);
    this.crosshair.appendChild(verticalLine);
    document.body.appendChild(this.crosshair);

    // Set the initial position of the crosshair to the center of the screen
    this.cursorX = window.innerWidth / 2;
    this.cursorY = window.innerHeight / 2;
    this.crosshair.style.transform = `translate(${this.cursorX - 15}px, ${this.cursorY - 15}px)`;

    // Mouse movement event listener for updating crosshair position
    document.addEventListener('mousemove', (event) => {
      if (document.pointerLockElement) {
        this.cursorX += event.movementX;
        this.cursorY += event.movementY;

        // Keep within screen bounds
        this.cursorX = Math.max(0, Math.min(window.innerWidth, this.cursorX));
        this.cursorY = Math.max(0, Math.min(window.innerHeight, this.cursorY));

        this.crosshair.style.transform = `translate(${this.cursorX - 15}px, ${this.cursorY - 15}px)`;
      }
    });

    // Show/hide crosshair based on pointer lock status
    document.addEventListener('pointerlockchange', () => {
      const isLocked = document.pointerLockElement;
      this.crosshair.style.display = isLocked ? 'block' : 'none';
      if (isLocked) {
        console.log("Pointer locked. Crosshair visible.");
      } else {
        console.log("Pointer unlocked. Crosshair hidden.");
      }
    });

    // Make sure it's visible initially to verify setup
    this.crosshair.style.display = 'block';
  }

  setupGame() {
    this.sceneManager.setup();
    this.physicsWorld.setup();
    this.levelManager.startLevel();
    this.collisionManager.setup();
  }

  requestPointerLock() {
    const canvas = this.sceneManager.renderer.domElement;

    // Click to request pointer lock
    canvas.addEventListener('click', () => {
        canvas.requestPointerLock();
    });

    // Fullscreen mode on click (optional)
    canvas.addEventListener('click', () => {
        if (document.fullscreenElement !== canvas) {
            canvas.requestFullscreen();
        }
    });

    // Detect pointer lock changes
    document.addEventListener('pointerlockchange', this.pointerLockChange.bind(this), false);
    document.addEventListener('pointerlockerror', this.pointerLockError, false);
}

pointerLockChange() {
    const canvas = this.sceneManager.renderer.domElement;

    if (document.pointerLockElement === canvas) {
        console.log('Pointer locked.');
        this.inputManager.enableMouseControls(); // Enable custom game controls
        this.disableBrowserDefaults(); // Disable default browser behavior
    } else {
        console.log('Pointer unlocked.');
        this.inputManager.disableMouseControls(); // Disable game controls
        this.enableBrowserDefaults(); // Restore default browser behavior
    }
}

disableBrowserDefaults() {
    // Disable right-click context menu
    document.addEventListener('contextmenu', this.preventDefault);
    // Disable default mouse wheel scrolling
    document.addEventListener('wheel', this.preventDefault);
    // Disable key events that interfere with the game (optional)
    document.addEventListener('keydown', this.preventDefault);
}

enableBrowserDefaults() {
    // Restore default browser behavior when pointer lock is lost
    document.removeEventListener('contextmenu', this.preventDefault);
    document.removeEventListener('wheel', this.preventDefault);
    document.removeEventListener('keydown', this.preventDefault);
}

preventDefault(event) {
    event.preventDefault(); // Prevent default browser behavior
}

pointerLockError() {
    console.error('Error locking pointer.');
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
    this.player.shoot(this.enemyManager, this.inputManager.mouse, clock, this.sceneManager.scene, this.physicsWorld, this.collisionManager);  // Pass mouse data and enemy manager to handle shooting

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

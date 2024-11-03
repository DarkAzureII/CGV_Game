// src/Game.js
import { GameState } from './GameState.js';
import Input from './Input.js';
import Player from './Player.js';
import CameraController from './CameraController.js';
import Map from './Map.js';
import UI from './UI.js';
import Bullet from './Bullet.js';
import EnemySpawner from './EnemySpawner.js';
import * as THREE from 'three';

export default class Game {
    constructor(containerId) {
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        document.getElementById(containerId).appendChild(this.renderer.domElement);

        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb); // Sky blue background

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 10, 20);

        // Resize Handling
        window.addEventListener('resize', this.onWindowResize.bind(this), false);

        // Map
        this.map = new Map(this.scene);
        this.map.name = 'map';
        this.blasterSound = new Audio('assets/audio/blaster.mp3');
        this.blasterSound.volume = 0.8;

        // Input with domElement
        this.input = new Input(this.renderer.domElement);

        // Player with camera reference
        this.player = new Player(this.scene, this.input, this.camera);
        console.log(this.scene.children);

        // Camera Controller
        this.cameraController = new CameraController(this.camera, this.renderer.domElement, this.input, this.player);

        // UI
        this.ui = new UI(this);

        // Clock
        this.clock = new THREE.Clock();

        // Enemies Array
        this.enemies = [];

        // Bullets Array
        this.bullets = [];

        // Shooting cooldown
        this.canShoot = true;
        this.shootCooldown = 0.5; // seconds
        this.shootTimer = 0;

        // Initialize Enemy Spawner
        this.enemySpawner = null;

        // Initialize game state
        this.state = GameState.MENU;

        // Level configurations
        this.levelConfigs = this.getLevelConfigurations();

        // Initialize UI elements
        this.initUI();

        // Current level
        this.currentLevel = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.handleMapClick = this.handleMapClick.bind(this);

        // HUD Elements
        this.hud = document.getElementById('hud');
        this.playerHealthElement = document.getElementById('player-health');
        this.enemyCountElement = document.getElementById('enemy-count');
        this.bossHealthElement = document.getElementById('boss-health');

        // Player health
        this.playerHealth = 100; // Example value

        // Bind pause toggle
        this.togglePause = this.togglePause.bind(this);
        window.addEventListener('keydown', this.togglePause);
        this.renderer.domElement.addEventListener('click', this.handleMapClick);
        
    }

    onAttackPlayer() {
      this.playerHealth -= 10; // Reduce health by 10 each attack
      console.log(`Player Health: ${this.playerHealth}`);
      
      if (this.playerHealth <= 0) {
          this.setState(GameState.GAME_OVER); // Handle game over
      }
    }

    getLevelConfigurations() {
        return [
            {
                name: 'Easy',
                enemyType: 'grunt',
                mapType: 'forest',
                spawnRate: 1, // Enemies per second
                bossAfter: 10, // Spawn a boss after 10 enemies
                bossType: 'boss1'
            },
            {
                name: 'Medium',
                enemyType: 'soldier',
                mapType: 'desert',
                spawnRate: 2,
                bossAfter: 15,
                bossType: 'boss2'
            },
            {
                name: 'Hard',
                enemyType: 'elite',
                mapType: 'city',
                spawnRate: 2.5,
                bossAfter: 20,
                bossType: 'boss3'
            },
            // Add more levels as needed
        ];
    }

    initUI() {
        // Cache DOM elements
        this.optionsMenu = document.getElementById('options-menu');
        this.mainMenu = document.getElementById('main-menu');
        this.startButton = document.getElementById('start-button');
        this.optionsButton = document.getElementById('options-button');
        this.optionsBackButton = document.getElementById('options-back-button');
        this.quitButton = document.getElementById('quit-button');

        this.levelSelectMenu = document.getElementById('level-select');
        this.levelOptionsContainer = document.getElementById('level-options');
        this.backToMenuButton = document.getElementById('back-to-menu-button');

        this.countdownScreen = document.getElementById('countdown');
        this.countdownNumber = document.getElementById('countdown-number');

        this.pauseMenu = document.getElementById('pause-menu');
        this.resumeButton = document.getElementById('resume-button');
        this.returnToMenuButtonPause = document.getElementById('return-to-menu-button');
        this.quitButtonPause = document.getElementById('quit-button-pause');

        this.gameOverScreen = document.getElementById('game-over');
        this.restartButton = document.getElementById('restart-button');
        this.returnToMenuButtonGameOver = document.getElementById('return-to-menu-button-gameover');

        this.levelWonScreen = document.getElementById('level-won');
        this.nextLevelButton = document.getElementById('next-level-button');
        this.returnToMenuButtonLevelWon = document.getElementById('return-to-menu-button-levelwon');

        this.sensitivitySlider = document.getElementById('sensitivitySlider');

        // Attach event listeners
        this.startButton.addEventListener('click', () => this.setState(GameState.LEVEL_SELECT));
        this.backToMenuButton.addEventListener('click', () => this.setState(GameState.MENU));
        this.optionsButton.addEventListener('click', () => this.showOptions());
        this.quitButton.addEventListener('click', () => this.quitGame());

        this.resumeButton.addEventListener('click', () => {
            console.log("Resume button clicked"); // Debug log
            this.togglePause('resume'); // Pass 'resume' string to resume game
        });
        this.returnToMenuButtonPause.addEventListener('click', () => this.setState(GameState.MENU));
        this.quitButtonPause.addEventListener('click', () => this.quitGame());

        this.restartButton.addEventListener('click', () => this.restartLevel());
        this.returnToMenuButtonGameOver.addEventListener('click', () => this.setState(GameState.MENU));

        this.nextLevelButton.addEventListener('click', () => this.startNextLevel());
        this.returnToMenuButtonLevelWon.addEventListener('click', () => this.setState(GameState.MENU));

        this.optionsButton.addEventListener('click', () => this.showOptions());
        this.optionsBackButton.addEventListener('click', () => this.hideOptions());


        if (this.sensitivitySlider) {
          this.sensitivitySlider.addEventListener('input', (event) => {
              const sensitivity = parseFloat(event.target.value);
              this.cameraController.setSensitivity(sensitivity);
          });
        }

        // Generate level selection buttons
        this.generateLevelSelectButtons();
    }

    generateLevelSelectButtons() {
      this.levelOptionsContainer.innerHTML = ''; // Clear existing buttons, if any
  
      this.levelConfigs.forEach((config, index) => {
          const button = document.createElement('button');
          button.textContent = `Level ${index + 1}: ${config.name}`;
          button.className = "menu-button";
          button.addEventListener('click', () => this.selectLevel(index));
          this.levelOptionsContainer?.appendChild(button);
      });
    }

    showMainMenu() {
        this.mainMenu.style.display = 'flex';

    }

    hideMainMenu() {
        this.mainMenu.style.display = 'none';
    }

    showLevelSelect() {
        this.levelSelectMenu.style.display = 'flex';
    }

    hideLevelSelect() {
        this.levelSelectMenu.style.display = 'none';
    }

    showCountdown() {
        this.countdownScreen.style.display = 'flex';
    }

    hideCountdown() {
        this.countdownScreen.style.display = 'none';
    }

    showPauseMenu() {
        this.pauseMenu.style.display = 'flex';
    }

    hidePauseMenu() {
        this.pauseMenu.style.display = 'none';
    }

    showGameOver() {
        this.gameOverScreen.style.display = 'flex';
    }

    hideGameOver() {
        this.gameOverScreen.style.display = 'none';
    }

    showLevelWon() {
        this.levelWonScreen.style.display = 'flex';
    }

    hideLevelWon() {
        this.levelWonScreen.style.display = 'none';
    }

    hideAllMenus() {
        this.hideMainMenu();
        this.hideLevelSelect();
        this.hideCountdown();
        this.hidePauseMenu();
        this.hideGameOver();
        this.hideLevelWon();
    }

    showOptions() {
      this.optionsMenu.style.display = 'flex';
      this.mainMenu.style.display = 'none';
    }
    
    hideOptions() {
        this.optionsMenu.style.display = 'none';
        this.setState(GameState.MENU);
    }
    

    quitGame() {
        // Implement quit functionality
        // For web games, this might redirect to another page or close the tab
        window.close(); // Note: This might not work in all browsers
    }

    restartLevel() {
        // Reset current level
        this.currentLevel = null;
        this.bullets.forEach(bullet => bullet.remove());
        this.bullets = [];
        if (this.enemySpawner) {
            this.enemySpawner.removeAllEnemies();
            this.enemySpawner = null;
        }
        // Reset player position, health, etc.
        this.player.mesh.position.set(0, 1, 0); // Example reset position
        this.playerHealth = 100;
        this.setState(GameState.LEVEL_SELECT);
    }

    startNextLevel() {
        // Implement logic to start the next level
        // For simplicity, loop back to level select
        this.hideLevelWon();
        this.setState(GameState.LEVEL_SELECT);
    }

    selectLevel(index) {
        if (index < 0 || index >= this.levelConfigs.length) return;
        this.currentLevel = this.levelConfigs[index];
        console.log(`Selected Level: ${this.currentLevel.name}`);
        this.setState(GameState.COUNTDOWN);
        this.startCountdown();
    }

    startCountdown() {
        this.hideAllMenus();
        this.showCountdown();
        let count = 3;
        this.countdownNumber.textContent = count;
        const countdownInterval = setInterval(() => {
            count--;
            if (count > 0) {
                this.countdownNumber.textContent = count;
            } else {
                clearInterval(countdownInterval);
                this.hideCountdown();
                this.startGame();
            }
        }, 1000);
    }

    start() {
      this.animate();
    }

    startGame() {
        if (!this.currentLevel) {
            console.error('No level selected!');
            return;
        }

        // Initialize the map based on mapType
        this.map.loadMap(this.currentLevel.mapType, this.enemySpawner);
        this.player.setObstacles(this.map.obstacleBoundingBoxes);

        // Initialize Enemy Spawner based on level configurations
        this.enemySpawner = new EnemySpawner(this.scene, this.currentLevel, () => {
            this.setState(GameState.LEVEL_WON);
        });

        // Set game state to playing
        this.setState(GameState.PLAYING);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        const delta = this.clock.getDelta();

        // Update Input
        this.input.update();

        // Update Player
        if (this.state === GameState.PLAYING && this.player && this.player.mesh && this.player.mesh.position) {
          //console.log("Player Position:", this.player.mesh.position);
          this.player.update(delta);
          this.enemySpawner.update(delta, this.player.mesh.position, this.onAttackPlayer.bind(this));
        }

        // Update Camera
        if (this.state !== GameState.PAUSED) {
            this.cameraController.update(delta);
        }

        // Update Enemies via EnemySpawner
        if (this.enemySpawner && this.state === GameState.PLAYING) {
            this.enemySpawner.update(delta);

            // Update HUD enemy count
            this.enemyCountElement.textContent = `Enemies: ${this.enemySpawner.activeEnemies.length}`;

            // Update boss health
            if (this.enemySpawner.boss) {
                this.bossHealthElement.style.display = 'block';
                this.bossHealthElement.textContent = `Boss Health: ${this.enemySpawner.boss.health}`;
            } else {
                this.bossHealthElement.style.display = 'none';
            }

            // Check if level is won
            if (this.enemySpawner.isLevelWon()) {
              // Remove all enemies since the level is won
              this.enemySpawner.removeAllEnemies();
              console.log('Level won!');
          
              // Set the game state to LEVEL_WON
              this.setState(GameState.LEVEL_WON);
            }
          
        }

        // Update Bullets
        if (this.state === GameState.PLAYING) {
            this.updateBullets(delta);
            this.updateShooting(delta);
            
        }

        // Update Shooting Cooldown
        this.updateShooting(delta);

        // Update HUD player health
        this.playerHealthElement.textContent = `Health: ${this.playerHealth}`;

        // Render
        this.renderer.render(this.scene, this.camera);
    }

    isLevelWon() {
        return this.enemySpawner && this.enemySpawner.isLevelWon();
        //iterate over enemies array and remove them all
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    setState(newState) {
        this.state = newState;
        this.updateUI();
    }

    updateUI() {
        switch (this.state) {
            case GameState.MENU:
                this.showMainMenu();
                this.hideLevelSelect();
                this.hideCountdown();
                this.hidePauseMenu();
                this.hideGameOver();
                this.hideLevelWon();
                break;
            case GameState.LEVEL_SELECT:
                this.hideMainMenu();
                this.showLevelSelect();
                break;
            case GameState.COUNTDOWN:
                this.hideLevelSelect();
                this.showCountdown();
                break;
            case GameState.PLAYING:
                this.hideAllMenus();
                break;
            case GameState.PAUSED:
                this.showPauseMenu();
                break;
            case GameState.GAME_OVER:
                this.showGameOver();
                break;
            case GameState.LEVEL_WON:
                this.showLevelWon();
                break;
            default:
                break;
        }
    }

    togglePause(e) {
        if (e.key === 'Escape' || e === 'resume') { // 'resume' used for button click
            if (this.state === GameState.PLAYING) {
                console.log("Pausing game"); // Debug log
                this.setState(GameState.PAUSED);
                this.pauseAllSounds();
            } else if (this.state === GameState.PAUSED) {
                console.log("Resuming game"); // Debug log
                this.setState(GameState.PLAYING);
                this.resumeAllSounds();
            }
        }
    }
    
    pauseAllSounds() {
        if (this.blasterSound && !this.blasterSound.paused) {
            this.blasterSound.pause();
            this.blasterSoundWasPlaying = true;
        } else {
            this.blasterSoundWasPlaying = false;
        }
    
        const backgroundMusic = this.map.getBackgroundMusic();
        if (backgroundMusic && !backgroundMusic.paused) {
            backgroundMusic.pause();
            console.log(`Paused background music at ${backgroundMusic.currentTime}s`);
            this.backgroundMusicWasPlaying = true;
        } else {
            this.backgroundMusicWasPlaying = false;
        }
    }
    
    resumeAllSounds() {
        if (this.blasterSoundWasPlaying) {
            this.blasterSound.play().catch(error => console.error("Audio play error:", error));
        }
    
        const backgroundMusic = this.map.getBackgroundMusic();
        if (this.backgroundMusicWasPlaying && backgroundMusic) {
            console.log(`Resuming background music from ${backgroundMusic.currentTime}s`);
            backgroundMusic.play().catch(error => console.error("Background music play error:", error));
        }
    }

    handleMapClick(event) {
      // Only respond to left clicks (button === 0)
      if (event.button !== 0) return;
  
      // Calculate mouse position in normalized device coordinates
      // (-1 to +1) for both components
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
      // Update the raycaster with the camera and mouse position
      this.raycaster.setFromCamera(this.mouse, this.camera);
  
      // Define objects to intersect with (e.g., ground plane)
      const intersects = this.raycaster.intersectObjects(this.map.getInteractiveObjects());
  
      if (intersects.length > 0) {
          const targetPoint = intersects[0].point;
          console.log(`Shooting at position: (${targetPoint.x.toFixed(2)}, ${targetPoint.y.toFixed(2)}, ${targetPoint.z.toFixed(2)})`);
          
          // Call shootBullet with the target point
          this.shootBullet(targetPoint);
      }
    }
  

    updateBullets(delta) {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.update(delta);

            // Check for collision with enemies
            const enemyMesh = this.checkCollision(bullet.mesh, this.enemySpawner.getActiveEnemies());
            if (enemyMesh) {
                // Get the corresponding enemy instance from the mesh
                const enemy = this.enemySpawner.getEnemyFromMesh(enemyMesh);
                if (enemy) {
                    enemy.takeDamage(50); // Example damage
                    bullet.remove();
                    this.bullets.splice(i, 1);
                    continue;
                }
            }

            // Check for collision with boss
            if (this.enemySpawner.boss && this.checkCollision(bullet.mesh, [this.enemySpawner.boss.mesh])) {
                this.enemySpawner.boss.takeDamage(100); // Example damage
                bullet.remove();
                this.bullets.splice(i, 1);
                continue;
            }

            // Check if the bullet has expired
            if (bullet.isExpired()) {
                bullet.remove();
                this.bullets.splice(i, 1); // Remove from array
                continue;
            }
        }
    }

    checkCollision(mesh, targets) {
      const meshBox = new THREE.Box3().setFromObject(mesh);
  
      for (let target of targets) {
          if (!(target instanceof THREE.Object3D)) {
              console.warn("Non-Object3D target in collision detection:", target);
              continue;
          }
  
          const targetBox = new THREE.Box3().setFromObject(target);
          if (meshBox.intersectsBox(targetBox)) {
              return target;
          }
      }
      return null;
    }

    shootBullet(targetPoint) {
        if (!this.canShoot) return;
        console.log('Attempting to fire bullet'); 

        // Get the player's current position
        const playerPosition = this.player.mesh.position.clone();

        // Calculate direction from player to target
        const direction = targetPoint.clone().sub(playerPosition).normalize();

        // Create a new bullet
        const bullet = new Bullet(this.scene, playerPosition, direction);

        // Add the bullet to the bullets array
        this.bullets.push(bullet);

        // Play blaster sound
        this.playBlasterSound();

        // Reset shooting cooldown
        this.canShoot = false;
        this.shootTimer = 0;

        console.log('Bullet fired!');
    }

    playBlasterSound() {
        if (this.blasterSound) {
            this.blasterSound.currentTime = 0; // Reset sound if already playing
            this.blasterSound.play().catch(error => console.error("Audio play error:", error));
        }
    }

    updateShooting(delta) {
        if (!this.canShoot) {
            this.shootTimer += delta;
            if (this.shootTimer >= this.shootCooldown) {
                this.canShoot = true;
                this.shootTimer = 0;
            }
        }
    }
}

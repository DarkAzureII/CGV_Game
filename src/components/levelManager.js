// File: levelManager.js
import { levels } from './levels.js';
import { Menu } from './menu.js';

export class LevelManager {
  constructor(enemyManager) {
    this.enemyManager = enemyManager;
    this.currentLevelIndex = 1;
    this.spawnInterval = null;
  }

  startLevel() {

    const level = levels[this.currentLevelIndex];

   
    // Create an overlay to display "Level"
    const levelOverlay = document.createElement('div');
    levelOverlay.id = 'level-overlay'; // Set an ID for easy removal later
    levelOverlay.style.position = 'fixed';
    levelOverlay.style.top = '10px';
    levelOverlay.style.left = '10px';
    levelOverlay.style.color = 'white';
    levelOverlay.style.fontSize = '24px';
    levelOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    levelOverlay.style.padding = '8px 16px';
    levelOverlay.style.borderRadius = '4px';
    levelOverlay.innerText = `Level ${this.currentLevelIndex}`;

    // Append the overlay to the document body
    document.body.appendChild(levelOverlay);

    // Remove the overlay after a few seconds
    setTimeout(() => {
      const overlay = document.getElementById('level-overlay');
      if (overlay) {
        document.body.removeChild(overlay);
      }
    }, 5000);
  

    this.enemyManager.spawnEnemies(level.enemyCount);
    this.startEnemySpawning(level.spawnRate);
  }

  startEnemySpawning(spawnRate) {
    this.spawnInterval = setInterval(() => {
      this.enemyManager.spawnEnemy();
      if (this.enemyManager.enemies.length >= this.enemyManager.maxEnemies) {
        clearInterval(this.spawnInterval);
      }
    }, spawnRate);
  }

  levelComplete() {
    clearInterval(this.spawnInterval);
    if (this.currentLevelIndex < levels.length - 1) {
      this.currentLevelIndex++;
      this.startLevel();
    } else {
      console.log('Game Complete!');
      const menu = new Menu();
      menu.render();
    }
  }

  
}

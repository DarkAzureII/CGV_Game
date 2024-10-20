// File: levelManager.js
import { levels } from './levels.js';

export class LevelManager {
  constructor(enemyManager) {
    this.enemyManager = enemyManager;
    this.currentLevelIndex = 0;
    this.spawnInterval = null;
  }

  startLevel() {
    const level = levels[this.currentLevelIndex];
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
    }
  }
}

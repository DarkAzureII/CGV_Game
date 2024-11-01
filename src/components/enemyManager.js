// File: enemyManager.js
import { Enemy } from './Enemy.js';

export class EnemyManager {
  constructor(scene, world) {
    this.scene = scene;
    this.world = world;
    this.enemies = [];
    this.maxEnemies = 10;
  }

  spawnEnemy() {
    if (this.enemies.length < this.maxEnemies) {
      const enemy = new Enemy(this.scene, this.world);
      this.enemies.push(enemy);
    }
  }

  spawnEnemies(count) {
    for (let i = 0; i < count && this.enemies.length < this.maxEnemies; i++) {
      this.spawnEnemy();
    }
  }

  update(playerMesh) {
    this.enemies.forEach(enemy => {
      enemy.moveToward(playerMesh);
      enemy.update();
    });
  }

  removeEnemy(index) {
    const enemy = this.enemies[index];
    this.scene.remove(enemy.mesh);
    this.world.removeBody(enemy.body);
    this.enemies.splice(index, 1);
  }
}
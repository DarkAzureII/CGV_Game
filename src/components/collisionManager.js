// File: collisionManager.js
export class CollisionManager {
    constructor(world, player, enemyManager) {
      this.world = world;
      this.player = player;
      this.enemyManager = enemyManager;
    }
  
    setup() {
      this.world.addEventListener('postStep', () => this.checkCollisions());
    }
  
    checkCollisions() {
      for (let i = this.enemyManager.enemies.length - 1; i >= 0; i--) {
        const enemy = this.enemyManager.enemies[i];
        const distance = this.player.body.position.distanceTo(enemy.body.position);
        if (distance < 6) {
          this.handleDamage(enemy, i);
        }
      }
    }
  
    handleDamage(enemy, index) {
      this.player.health -= 10;
      console.log(`Player health: ${this.player.health}`);
      
      enemy.health -= 10;
      console.log(`Enemy health: ${enemy.health}`);
  
      if (enemy.health <= 0) {
        this.enemyManager.removeEnemy(index);
      }
  
      if (this.player.health <= 0) {
        console.log('Player is dead! Game Over!');
        // Implement game over logic
      }
    }
  }
export class CollisionManager {
  constructor(world, player, enemyManager) {
    this.world = world;
    this.player = player;
    this.enemyManager = enemyManager;

    // Cooldown properties
    this.damageCooldown = 1000; // 1 second cooldown
    this.lastDamageTime = 0; // Timestamp of last damage
  }

  setup() {
    this.world.addEventListener('postStep', () => this.checkCollisions());
  }

  checkCollisions() {
    const currentTime = Date.now(); // Get the current time

    for (let i = this.enemyManager.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemyManager.enemies[i];
      const distance = this.player.body.position.distanceTo(enemy.body.position);

      // Collision damage (e.g., when enemy touches the player)
      if (distance < 2) {
        this.handleCollisionDamage(enemy, i, currentTime);
      }
    }
  }

  handleCollisionDamage(enemy, index, currentTime) {
    const collisionDamage = 10;

    // Apply damage if the cooldown has passed
    if (currentTime - this.lastDamageTime > this.damageCooldown) {
      this.player.health -= collisionDamage;
      this.player.takeDamage(collisionDamage);
      console.log(`Player health: ${this.player.health}`);

      // Update the last damage time
      this.lastDamageTime = currentTime;
    }

    // Damage the enemy if necessary
    // enemy.health -= collisionDamage; // Uncomment if you want to damage the enemy

    // Remove the enemy if its health is below or equal to 0
    if (enemy.health <= 0) {
      this.enemyManager.removeEnemy(index);
    }

    // Check if the player is dead
    if (this.player.health <= 0) {
      console.log('Player is dead! Game Over!');
      // Implement game over logic here
    }
  }

  // Handle damage from shooting
  handleEnemyHit(enemy, index, damage) {
    console.log("Projectile has hit an enemy. Enemy data:", enemy);

    // Deal damage to the enemy
    enemy.health -= damage;
    console.log(`Enemy health after shot: ${enemy.health}`);

    // If the enemy's health reaches 0 or below, remove it
    if (enemy.health <= 0) {
        console.log(`Enemy ${index} killed!`);
        this.enemyManager.removeEnemy(index);
    }
}

}

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

      // Collision damage (e.g., when enemy touches the player)
      if (distance < 6) {
        this.handleCollisionDamage(enemy, i);
      }
    }
  }

  // Handle damage from collisions (e.g., when enemies collide with the player)
  handleCollisionDamage(enemy, index) {
    const collisionDamage = 10;

    // Damage the player when colliding with the enemy
    this.player.health -= collisionDamage;
    console.log(`Player health: ${this.player.health}`);

    // Damage the enemy if necessary
    //enemy.health -= collisionDamage;
    //console.log(`Enemy health: ${enemy.health}`);

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
    console.log("Shot enemy!", enemy);

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

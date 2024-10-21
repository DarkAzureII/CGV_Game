// src/components/Player.js
import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class Player {
  constructor(scene, world) {
    this.scene = scene;
    this.world = world;

    const playerGeometry = new THREE.BoxGeometry(1, 2, 1);
    const playerMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    this.mesh = new THREE.Mesh(playerGeometry, playerMaterial);
    this.scene.add(this.mesh);

    const playerShape = new CANNON.Box(new CANNON.Vec3(0.5, 1, 0.5));
    this.body = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(0, 5, 0), // Start slightly above the ground
      shape: playerShape
    });
    this.world.addBody(this.body);

    this.health = 100; // Player starts with 100 health
    this.isAlive = true; // Track if the player is alive

    this.moveSpeed = 0.5;

    this.shootRange = 10;  // Set the range for shooting
    this.shootCooldown = 0.01; // Cooldown time between shots (in seconds)
    this.lastShotTime = 0;  // Track the time since the last shot
  }

  takeDamage(amount) {
    this.health -= amount;
    console.log(`Player health: ${this.health}`);
    if (this.health <= 0) {
      this.die();
    }
  }

  die() {
    console.log("Player has died.");
    this.isAlive = false;
    // Optionally: Implement logic to reset the game or trigger a game-over screen
  }

  updateMovement(keys) {
    // Use keys to control player movement
    if (keys.forward) this.body.position.z -= this.moveSpeed;
    if (keys.backward) this.body.position.z += this.moveSpeed;
    if (keys.left) this.body.position.x -= this.moveSpeed;
    if (keys.right) this.body.position.x += this.moveSpeed;
    

    // Update mesh position based on physics body
    this.mesh.position.copy(this.body.position);
  }

  shoot(enemyManager, mouse, clock, collisionManager) {
    if (mouse.isRightButtonDown && clock.getElapsedTime() - this.lastShotTime > this.shootCooldown) {
      this.lastShotTime = clock.getElapsedTime();  // Reset the cooldown
  
      for (let i = 0; i < enemyManager.enemies.length; i++) {
        const enemy = enemyManager.enemies[i];
        const distance = this.body.position.distanceTo(enemy.body.position);
  
        if (distance <= this.shootRange) {
          // Deal damage to the enemy using CollisionManager's handleEnemyHit
          collisionManager.handleEnemyHit(enemy, i, 20);  // Assuming 20 is the shooting damage
          break;
        }
      }
    }
  }  
}

// src/components/Player.js
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Projectile } from './projectile';

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
      mass: 1,
      position: new CANNON.Vec3(0, 5, 0), // Start slightly above the ground
      shape: playerShape
    });
    this.world.addBody(this.body);

    this.body.fixedRotation = true;
    this.body.updateMassProperties();

    this.health = 100; // Player starts with 100 health
    this.isAlive = true; // Track if the player is alive

    this.moveSpeed = 0.5;

    this.shootRange = 10;  // Set the range for shooting
    this.shootCooldown = 1; // Cooldown time between shots (in seconds)
    this.lastShotTime = 0;  // Track the time since the last shot

    this.createShootingRangeCircle();
    this.createHealthBar();
  }

  createHealthBar() {
    const barWidth = 1.5; // Width of the health bar
    const barHeight = 0.2; // Height of the health bar
    const healthBarGeometry = new THREE.PlaneGeometry(barWidth, barHeight);
    const healthBarMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // Green color
    this.healthBar = new THREE.Mesh(healthBarGeometry, healthBarMaterial);
    
    // Position the health bar above the player
    this.healthBar.position.y = 2.5; // Adjust height above the player
    this.healthBar.position.z = 0; // Center it in front of the player
    this.scene.add(this.healthBar);
}

updateHealthBar() {
    // Calculate health percentage
    const healthPercentage = this.health / 100; // Assuming max health is 100
    this.healthBar.scale.x = healthPercentage; // Scale the health bar based on health

    // Update color based on health
    if (healthPercentage > 0.5) {
        this.healthBar.material.color.set(0x00ff00); // Green for healthy
    } else if (healthPercentage > 0.25) {
        this.healthBar.material.color.set(0xffff00); // Yellow for caution
    } else {
        this.healthBar.material.color.set(0xff0000); // Red for critical health
    }
}

  takeDamage(amount) {
    this.health -= amount;
    this.updateHealthBar();
    if (this.health <= 0) {
      this.die();
    }
  }

  createShootingRangeCircle() {
    const rangeGeometry = new THREE.CircleGeometry(this.shootRange, 32);
    const rangeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.3 });
    this.rangeCircle = new THREE.Mesh(rangeGeometry, rangeMaterial);
    this.rangeCircle.rotation.x = -Math.PI / 2; // Rotate to lay flat on the ground
    this.rangeCircle.position.y = 0.01; // Slightly above the ground to avoid z-fighting
    this.scene.add(this.rangeCircle);
  }

  die() {
    console.log("Player has died.");
    this.isAlive = false;
    this.onDie();
    // Optionally: Implement logic to reset the game or trigger a game-over screen
  }

  onDie() {
    // Placeholder for the event callback
  }

  updateMovement(keys) {
    // Use keys to control player movement
    if (keys.forward) this.body.position.z -= this.moveSpeed;
    if (keys.backward) this.body.position.z += this.moveSpeed;
    if (keys.left) this.body.position.x -= this.moveSpeed;
    if (keys.right) this.body.position.x += this.moveSpeed;
    

    // Update mesh position based on physics body
    this.mesh.position.copy(this.body.position);
     // Update range circle position to match the player's position
    this.rangeCircle.position.copy(this.mesh.position);
    this.healthBar.position.copy(this.mesh.position);
    this.healthBar.position.y += 2.5;
  }


  shoot(enemyManager, mouse, clock, scene, world, collisionManager) {
      if (mouse.isRightButtonDown && clock.getElapsedTime() - this.lastShotTime > this.shootCooldown) {
          this.lastShotTime = clock.getElapsedTime();  // Reset the cooldown

          // Select the first enemy as a target if it exists
          const targetEnemy = enemyManager.enemies[0];
          if (targetEnemy) {
              // Create a new projectile aimed at the enemy
              const projectile = new Projectile(
                  scene,
                  this.body.position.clone(),
                  targetEnemy.body.position.clone(),
                  20, // Damage dealt by the projectile
                  2,  // Maximum lifetime in seconds
                  enemyManager,
                  collisionManager
              );

              // Add projectile update to the main game loop instead of postStep
              world.addProjectile(projectile); // Assuming world has a projectiles array
          }
      }
  }

}

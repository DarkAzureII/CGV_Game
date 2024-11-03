// src/Enemy.js
import * as THREE from 'three';

export default class Enemy {
    constructor(scene, type) {
        this.scene = scene;
        this.type = type;
        this.speed = this.getSpeedByType(type);
        this.health = this.getHealthByType(type);
        
        // Create enemy mesh with specific color based on type
        const geometry = new THREE.BoxGeometry(1, 2, 1);
        const material = new THREE.MeshStandardMaterial({ color: this.getColorByType(type) });
        this.mesh = new THREE.Mesh(geometry, material);

        // Set initial spawn position for the enemy
        this.mesh.position.copy(this.getSpawnPosition());

        this.scene.add(this.mesh);
        this.attackRange = 2.5; // Define the distance at which the enemy can attack
        this.attackCooldown = 1.5; // Time in seconds between attacks
        this.timeSinceLastAttack = 0;
        this.engageDelay = 1.0;
    }

    getSpeedByType(type) {
        switch(type) {
            case 'grunt': return 2;
            case 'soldier': return 3;
            case 'elite': return 4;
            default: return 2;
        }
    }

    getHealthByType(type) {
        switch(type) {
            case 'grunt': return 50;
            case 'soldier': return 100;
            case 'elite': return 150;
            default: return 50;
        }
    }

    getColorByType(type) {
        switch(type) {
            case 'grunt': return 0x00ff00; // Green
            case 'soldier': return 0x0000ff; // Blue
            case 'elite': return 0xff00ff; // Magenta
            default: return 0x00ff00;
        }
    }

    getSpawnPosition() {
        const distance = 30;
        const angle = Math.random() * Math.PI * 2;
        return new THREE.Vector3(
            Math.cos(angle) * distance,
            1,
            Math.sin(angle) * distance
        );
    }

    update(delta, playerPosition, onAttackPlayer) {
      if (!playerPosition) {
          console.error("playerPosition is undefined in Enemy.update");
          return;
      }

      // Move toward the player
      const direction = new THREE.Vector3().subVectors(playerPosition, this.mesh.position).normalize();
      this.mesh.position.addScaledVector(direction, this.speed * delta);

      // Calculate distance to player
      const distanceToPlayer = this.mesh.position.distanceTo(playerPosition);

      // Check if within attack range
      if (distanceToPlayer <= this.attackRange) {
          if (!this.firstAttack) {
              // Wait for engage delay before the first attack
              if (this.timeSinceLastAttack >= this.engageDelay) {
                  onAttackPlayer();
                  this.timeSinceLastAttack = 0; // Reset timer after first attack
                  this.firstAttack = true;
              }
          } else if (this.timeSinceLastAttack >= this.attackCooldown) {
              // Attack if within cooldown period after the first attack
              onAttackPlayer();
              this.timeSinceLastAttack = 0;
          }
      }

      // Increment the attack timer
      this.timeSinceLastAttack += delta;
    }


    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.remove();
        }
    }

    remove() {
        this.scene.remove(this.mesh);
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }
}

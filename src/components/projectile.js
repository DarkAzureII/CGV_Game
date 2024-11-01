import * as THREE from 'three';

export class Projectile {
  constructor(scene, startPosition, targetPosition, damage, maxLifetime, enemyManager, collisionManager) {
    this.scene = scene;
    this.damage = damage;
    this.maxLifetime = maxLifetime;
    this.enemyManager = enemyManager;
    this.collisionManager = collisionManager;

    // Set the projectile direction
    this.direction = new THREE.Vector3().subVectors(targetPosition, startPosition).normalize();
    this.collisionRadius = 1; // Collision radius for damage detection

    // Create projectile mesh
    const projectileGeometry = new THREE.SphereGeometry(0.2, 8, 8);
    const projectileMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
    this.mesh = new THREE.Mesh(projectileGeometry, projectileMaterial);
    this.mesh.position.copy(startPosition);
    this.scene.add(this.mesh);

    this.startTime = Date.now();
    this.update = this.update.bind(this);
  }

  update(deltaTime) {
    if (!this.enemyManager || !Array.isArray(this.enemyManager.enemies)) {
      console.warn('enemyManager or enemies array is undefined');
      return;
    }

    // Update projectile position based on direction and speed
    const speed = 70; // Adjust as needed
    this.mesh.position.add(this.direction.clone().multiplyScalar(speed * deltaTime));

    // Check for collisions based on distance
    this.enemyManager.enemies.forEach((enemy, index) => {
      if (enemy.mesh) {
        const distance = this.mesh.position.distanceTo(enemy.mesh.position);
        if (distance <= this.collisionRadius) {
          console.log(`Collision detected with enemy at distance ${distance}`);
          this.collisionManager.handleEnemyHit(enemy, index, this.damage);
          this.dispose();
        }
      }
    });

    // Lifetime check and disposal
    const elapsedSeconds = (Date.now() - this.startTime) / 1000;
    if (elapsedSeconds >= this.maxLifetime) {
      this.dispose();
    }
  }

  dispose() {
    this.scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}

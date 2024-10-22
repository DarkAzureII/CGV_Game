// src/components/Enemy.js
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export class Enemy {
  constructor(scene, world) {
    this.scene = scene;
    this.world = world;

    // Load the low-poly wolf model
    const loader = new GLTFLoader();
    loader.load('/assets/LowPolyWolf.glb', (gltf) => {
      this.mesh = gltf.scene;
      this.mesh.scale.set(4, 4, 4); // Scale down if necessary
      this.mesh.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;
        }
      });
      this.scene.add(this.mesh);
    });

    // Create Cannon.js body for physics
    const enemyShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1)); // Match size with Three.js BoxGeometry
    this.body = new CANNON.Body({
      mass: 1, // Small mass to prevent flying away
      position: new CANNON.Vec3(Math.random() * 40 - 20, 1, Math.random() * 40 - 20), // Start at a random position
      shape: enemyShape,
      material: new CANNON.Material({ friction: 0.9, restitution: 0.1 }), // Control friction and bounciness
    });

    // Constrain the enemy to stay on the ground
    this.body.fixedRotation = true; // Prevent the body from rotating
    this.body.updateMassProperties(); // Update mass properties to reflect changes

    this.world.addBody(this.body);
    this.health = 5; // Enemy starts with 5 health
    this.isAlive = true; // Track if enemy is alive

    this.speed = 20; // Control how fast enemies move toward the player
  }

  takeDamage(amount) {
    this.health -= amount;
    console.log(`Enemy health: ${this.health}`);
    if (this.health <= 0) {
      this.die();
    }
  }

  die() {
    console.log("Enemy has died.");
    this.isAlive = false;
    this.scene.remove(this.mesh); // Remove from scene
    this.world.removeBody(this.body); // Remove from physics world
  }

  moveToward(target) {
    // Get the direction vector from the enemy to the player
    const direction = new THREE.Vector3();
    direction.subVectors(target.position, this.body.position).normalize(); // Normalize for consistent movement

    // Set the velocity directly towards the player (XZ plane only)
    this.body.velocity.x = direction.x * this.speed;
    this.body.velocity.z = direction.z * this.speed;

    // Optionally, stop any vertical movement (if they're flying)
    this.body.velocity.y = 0;
  }

  update() {
    if (this.mesh) {
      this.mesh.position.copy(this.body.position);
      this.mesh.quaternion.copy(this.body.quaternion); // Sync rotation if needed
    }
  }
}

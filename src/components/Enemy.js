// src/components/Enemy.js
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export class Enemy {
  constructor(scene, world) {
    this.scene = scene;
    this.world = world;
    this.mesh = null; // Initialize mesh as null
    this.health = 5;
    this.isAlive = true;
    this.speed = 20;

    // Create Cannon.js body for physics
    const enemyShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1));
    this.body = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(Math.random() * 40 - 20, 1, Math.random() * 40 - 20),
      shape: enemyShape,
      material: new CANNON.Material({ friction: 0.9, restitution: 0.1 }),
    });
    this.body.fixedRotation = true;
    this.body.updateMassProperties();
    this.world.addBody(this.body);

    // Load the enemy mesh asynchronously
    const loader = new GLTFLoader();
    loader.load('/assets/LowPolyWolf.glb', (gltf) => {
      this.mesh = gltf.scene;
      this.mesh.scale.set(4, 4, 4);
      this.mesh.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;
        }
      });
      this.scene.add(this.mesh);
    });
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

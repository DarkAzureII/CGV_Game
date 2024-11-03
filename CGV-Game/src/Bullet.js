// src/Bullet.js
import * as THREE from 'three';

export default class Bullet {
    constructor(scene, position, direction, speed = 50) {
        this.scene = scene;
        this.speed = speed; // Units per second
        this.direction = direction.clone().normalize(); // Direction vector

        // Create bullet mesh (e.g., a small sphere)
        const geometry = new THREE.SphereGeometry(0.2, 8, 8);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red color
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);
        this.scene.add(this.mesh);

        // Optionally, add a velocity vector
        this.velocity = this.direction.clone().multiplyScalar(this.speed);

        // Track lifespan (e.g., 5 seconds)
        this.lifespan = 0.3; // seconds
        this.age = 0;
    }

    update(delta) {
        // Move the bullet
        const displacement = this.velocity.clone().multiplyScalar(delta);
        this.mesh.position.add(displacement);

        // Update age
        this.age += delta;
    }

    isExpired() {
        return this.age >= this.lifespan;
    }

    remove() {
        this.scene.remove(this.mesh);
        // Dispose of geometry and material to free memory
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }
}

// src/Boss.js
import * as THREE from 'three';

export default class Boss {
    constructor(scene, type) {
        this.scene = scene;
        this.type = type;
        this.health = 500; // Example health value

        // Boss geometry and material
        const geometry = new THREE.BoxGeometry(5, 10, 5); // Larger size
        const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(0, 5, 0); // Position higher for visibility

        // Add boss to scene
        this.scene.add(this.mesh);

        // Optional point light above the boss
        const bossLight = new THREE.PointLight(0xff0000, 50, 20);
        bossLight.position.set(0, 15, 0);
        bossLight.castShadow = true;

        this.scene.add(bossLight);
    }

    update(delta) {
        // Subtle rotation and bounce for visibility
        this.mesh.rotation.y += delta * 0.5;
        this.mesh.position.y = 5 + Math.sin(delta * 2) * 0.5;
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.remove();
        }
    }

    isDefeated() {
        return this.health <= 0;
    }

    remove() {
        this.scene.remove(this.mesh);
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
        console.log('Boss defeated!');
        if (this.onDefeated) this.onDefeated();
    }
}

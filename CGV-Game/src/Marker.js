// src/Marker.js
import * as THREE from 'three';

export default class Marker {
    constructor(scene, position) {
        this.scene = scene;
        this.position = position.clone();

        // Create a simple sphere as a marker
        const geometry = new THREE.SphereGeometry(0.3, 16, 16);
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00 }); // Yellow color
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        this.scene.add(this.mesh);

        // Optionally, add a label or particle effect

        // Optionally, set a timer to remove the marker after some time
        setTimeout(() => {
            this.remove();
        }, 5000); // Remove after 5 seconds
    }

    remove() {
        this.scene.remove(this.mesh);
    }
}

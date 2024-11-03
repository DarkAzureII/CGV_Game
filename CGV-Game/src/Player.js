// src/Player.js
import * as THREE from 'three';

export default class Player {
    constructor(scene, input, camera) { // Receive camera as a parameter
        this.scene = scene;
        this.input = input;
        this.camera = camera; // Store camera reference
        this.speed = 5;

        // Create Player Mesh
        const geometry = new THREE.BoxGeometry(1, 2, 1);
        const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.y = 1; // Half height to place on ground
        this.scene.add(this.mesh);

        // Initialize spell bindings (optional)
        this.currentSpell = null;
    }

    update(delta) {
        const direction = new THREE.Vector3();

        // Get the camera's forward direction
        const cameraDirection = new THREE.Vector3();
        this.camera.getWorldDirection(cameraDirection);
        cameraDirection.y = 0; // Project onto XZ plane
        cameraDirection.normalize();

        // Get the camera's right direction
        const cameraRight = new THREE.Vector3();
        cameraRight.crossVectors(this.camera.up, cameraDirection).normalize();

        // Determine movement direction based on input
        if (this.input.isKeyPressed('w')) {
            direction.add(cameraDirection);
        }
        if (this.input.isKeyPressed('s')) {
            direction.sub(cameraDirection);
        }
        if (this.input.isKeyPressed('a')) {
            direction.sub(cameraRight);
        }
        if (this.input.isKeyPressed('d')) {
            direction.add(cameraRight);
        }

        // Apply movement if any direction is active
        if (direction.length() > 0) {
            direction.normalize();
            this.mesh.position.addScaledVector(direction, this.speed * delta);

            // Optional: Rotate player to face movement direction
            const angle = Math.atan2(direction.x, direction.z);
            this.mesh.rotation.y = angle;
        }

        // Handle Spell Selection via Keyboard
        for (let i = 1; i <= 4; i++) {
            if (this.input.isKeyPressed(i.toString())) {
                this.castSpell(i);
            }
        }

        // Handle Mouse Clicks for Aiming or Actions
        if (this.input.mouse.clicked) {
            this.handleMouseClick(this.input.mouse.position);
        }
    }

    castSpell(spellNumber) {
        console.log(`Casting spell ${spellNumber}`);
        // Implement spell casting logic
        // For example, instantiate a projectile or apply an effect
    }

    handleMouseClick(position) {
        console.log(`Mouse clicked at (${position.x}, ${position.y})`);
        // Implement aiming or action logic
        // For example, translate screen coordinates to world coordinates and perform an action
    }
}

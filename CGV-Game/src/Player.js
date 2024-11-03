import * as THREE from 'three';

export default class Player {
    constructor(scene, input, camera) {
        this.scene = scene;
        this.input = input;
        this.camera = camera;
        this.speed = 5;
        this.force = new THREE.Vector3(); // To store force applied to the player

        // Create Player Mesh
        const geometry = new THREE.BoxGeometry(1, 2, 1);
        const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.y = 1; // Half height to place on ground
        this.mesh.castShadow = true; // Cast shadows
        
        this.scene.add(this.mesh);

        this.currentSpell = null;
        this.obstacleBoundingBoxes = [];
    }

    setObstacles(obstacleBoundingBoxes) {
        this.obstacleBoundingBoxes = obstacleBoundingBoxes;

        // Check initial spawn collision and apply a repelling force if needed
        this.handleInitialSpawnCollision();
    }

    handleInitialSpawnCollision() {
        const playerBoundingBox = new THREE.Box3().setFromObject(this.mesh);
        
        for (const box of this.obstacleBoundingBoxes) {
            if (playerBoundingBox.intersectsBox(box)) {
                // Calculate the direction to push the player away from the obstacle
                const pushDirection = this.mesh.position.clone().sub(box.getCenter(new THREE.Vector3())).normalize();
                this.applyForce(pushDirection.multiplyScalar(this.speed * 2)); // Apply an initial force
                break;
            }
        }
    }

    applyForce(force) {
        this.force.add(force); // Add the force to the player's force vector
    }

    handleEnemyHit() {
        // Example: Apply a small backward force when hit by an enemy
        const hitForce = this.camera.getWorldDirection(new THREE.Vector3()).negate().multiplyScalar(2); // Opposite of camera direction
        this.applyForce(hitForce);
    }

    update(delta) {
        const direction = new THREE.Vector3();
    
        // Get the camera's forward direction
        const cameraDirection = new THREE.Vector3();
        this.camera.getWorldDirection(cameraDirection);
        cameraDirection.y = 0;
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
            direction.add(cameraRight);
        }
        if (this.input.isKeyPressed('d')) {
            direction.sub(cameraRight);
        }
    
        // Apply movement if any direction is active
        if (direction.length() > 0) {
            direction.normalize();
            const movement = direction.clone().multiplyScalar(this.speed * delta);
            const newPosition = this.mesh.position.clone().add(movement).add(this.force.clone().multiplyScalar(delta)); // Add force
    
            // Create a bounding box for the new position
            const playerBoundingBox = new THREE.Box3().setFromObject(this.mesh);
            playerBoundingBox.translate(movement); // Move bounding box to new position
    
            // Check collision with obstacles
            let isColliding = false;
            for (const box of this.obstacleBoundingBoxes) {
                if (playerBoundingBox.intersectsBox(box)) {
                    isColliding = true;
                    
                    // Apply a push-back force if colliding
                    const pushBack = direction.clone().negate().multiplyScalar(this.speed * delta * 2); // Reverse direction
                    this.applyForce(pushBack); // Apply push-back force
                    
                    break;
                }
            }
    
            // Update player position if no collision
            if (!isColliding) {
                this.mesh.position.copy(newPosition);
                this.force.multiplyScalar(0.9); // Apply friction to slow down the force over time
            }
    
            // Rotate player to face movement direction
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
    }

    handleMouseClick(position) {
        console.log(`Mouse clicked at (${position.x}, ${position.y})`);
    }
}

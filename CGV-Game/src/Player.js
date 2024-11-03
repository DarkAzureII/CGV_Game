// src/Player.js
import * as THREE from 'three';

export default class Player {
    constructor(scene, input, camera) {
        this.scene = scene;
        this.input = input;
        this.camera = camera;
        this.speed = 10;
        this.force = new THREE.Vector3(); // To store force applied to the player
        // Create Player Body Parts
        this.createPlayerMesh();

        // Add a point light to follow the player
        this.light = new THREE.PointLight(0xffaa33, 1, 10); // Orange light
        this.light.position.set(0, 2, 0); // Position it slightly above the player
        this.scene.add(this.light);

        this.currentSpell = null;
        this.obstacleBoundingBoxes = [];
    }

    createPlayerMesh() {
        this.mesh = new THREE.Group();
        // Materials with emissive properties
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ff00,
            emissive: 0x004400,
            emissiveIntensity: 0.5
        });
        const headMaterial = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            emissive: 0x552200,
            emissiveIntensity: 0.5
        });
    
        // Upper Torso (bulkier)
        const upperTorsoGeometry = new THREE.BoxGeometry(1.1, 0.8, 0.7);
        this.upperTorso = new THREE.Mesh(upperTorsoGeometry, bodyMaterial);
        this.upperTorso.position.set(0, 1.75, 0);
    
        // Lower Torso (less bulk)
        const lowerTorsoGeometry = new THREE.BoxGeometry(0.8, 0.7, 0.5);
        this.lowerTorso = new THREE.Mesh(lowerTorsoGeometry, bodyMaterial);
        this.lowerTorso.position.set(0, 1.1, 0);
    
        // Head
        const headGeometry = new THREE.DodecahedronGeometry(0.3, 0);
        this.head = new THREE.Mesh(headGeometry, headMaterial);
        this.head.position.set(0, 2.3, 0);
    
        // Create a group for the left arm
        this.leftArmGroup = new THREE.Group();
        const shoulderGeometry = new THREE.DodecahedronGeometry(0.3, 0);
        this.leftShoulder = new THREE.Mesh(shoulderGeometry, bodyMaterial);
        this.leftShoulder.position.set(0, 0, 0); // Position at the origin of the arm group
        this.leftArmGroup.add(this.leftShoulder); // Add shoulder to arm group
    
        const armGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1, 32);
        this.leftArm = new THREE.Mesh(armGeometry, bodyMaterial);
        this.leftArm.position.set(0, -0.5, 0); // Attach to the shoulder
        this.leftArmGroup.add(this.leftArm); // Add arm to arm group
    
        const handGeometry = new THREE.DodecahedronGeometry(0.2, 0);
        this.leftHand = new THREE.Mesh(handGeometry, bodyMaterial);
        this.leftHand.position.set(0, -1, 0); // Position at the end of the left arm
        this.leftArmGroup.add(this.leftHand); // Add hand to arm group
    
        // Position the entire arm group
        this.leftArmGroup.position.set(-0.8, 2, 0); // Position the arm group at the correct location
        this.mesh.add(this.leftArmGroup); // Add the arm group to the player mesh
    
        // Create a similar group for the right arm
        this.rightArmGroup = new THREE.Group();
        this.rightShoulder = new THREE.Mesh(shoulderGeometry, bodyMaterial);
        this.rightShoulder.position.set(0, 0, 0);
        this.rightArmGroup.add(this.rightShoulder);
    
        this.rightArm = new THREE.Mesh(armGeometry, bodyMaterial);
        this.rightArm.position.set(0, -0.5, 0);
        this.rightArmGroup.add(this.rightArm);
    
        this.rightHand = new THREE.Mesh(handGeometry, bodyMaterial);
        this.rightHand.position.set(0, -1, 0);
        this.rightArmGroup.add(this.rightHand);
    
        this.rightArmGroup.position.set(0.8, 2, 0); // Position the right arm group at the correct location
        this.mesh.add(this.rightArmGroup); // Add the right arm group to the player mesh
    
        // Legs
        const legGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1.2, 32);
        this.leftLeg = new THREE.Mesh(legGeometry, bodyMaterial);
        this.rightLeg = new THREE.Mesh(legGeometry, bodyMaterial);
        this.leftLeg.position.set(-0.2, 0.3, 0);
        this.rightLeg.position.set(0.2, 0.3, 0);
    
        // Grouping all parts together
        this.mesh.add(this.upperTorso);
        this.mesh.add(this.lowerTorso);
        this.mesh.add(this.head);
        this.mesh.add(this.leftLeg);
        this.mesh.add(this.rightLeg);
    
        // **Important:** Only add the group to the scene, not the individual parts
        this.scene.add(this.mesh);
    }    
    

    setObstacles(obstacleBoundingBoxes) {
        this.obstacleBoundingBoxes = obstacleBoundingBoxes;
        this.handleInitialSpawnCollision();
    }

    handleInitialSpawnCollision() {
        const playerBoundingBox = new THREE.Box3().setFromObject(this.mesh);
        
        for (const box of this.obstacleBoundingBoxes) {
            if (playerBoundingBox.intersectsBox(box)) {
                const pushDirection = this.mesh.position.clone().sub(box.getCenter(new THREE.Vector3())).normalize();
                this.applyForce(pushDirection.multiplyScalar(this.speed * 2));
                break;
            }
        }
    }

    applyForce(force) {
        this.force.add(force);
    }

    handleEnemyHit() {
        const hitForce = this.camera.getWorldDirection(new THREE.Vector3()).negate().multiplyScalar(2);
        this.applyForce(hitForce);
    }

    update(delta, isShooting) {
        const direction = new THREE.Vector3();
        const cameraDirection = new THREE.Vector3();
        this.camera.getWorldDirection(cameraDirection);
        cameraDirection.y = 0;
        cameraDirection.normalize();

        const cameraRight = new THREE.Vector3();
        cameraRight.crossVectors(this.camera.up, cameraDirection).normalize();

        if (this.input.isKeyPressed('w')) direction.add(cameraDirection);
        if (this.input.isKeyPressed('s')) direction.sub(cameraDirection);
        if (this.input.isKeyPressed('a')) direction.add(cameraRight);
        if (this.input.isKeyPressed('d')) direction.sub(cameraRight);

        if (direction.length() > 0) {
            direction.normalize();
            const movement = direction.clone().multiplyScalar(this.speed * delta);
            const newPosition = this.mesh.position.clone().add(movement).add(this.force.clone().multiplyScalar(delta));

            const playerBoundingBox = new THREE.Box3().setFromObject(this.mesh);
            playerBoundingBox.translate(movement);

            let isColliding = false;
            for (const box of this.obstacleBoundingBoxes) {
                if (playerBoundingBox.intersectsBox(box)) {
                    isColliding = true;
                    const pushBack = direction.clone().negate().multiplyScalar(this.speed * delta * 2);
                    this.applyForce(pushBack);
                    break;
                }
            }

            if (!isColliding) {
                this.mesh.position.copy(newPosition);
                this.force.multiplyScalar(0.9);
            }

            const angle = Math.atan2(direction.x, direction.z);
            this.mesh.rotation.y = angle;

            console.log('Moving player');
            if (!isShooting) {
                console.log('Lowering arms');
                this.lowerArms(); // Return arms to resting position
            }
            
        }

        // Update light position to follow the player
        this.light.position.copy(this.mesh.position).add(new THREE.Vector3(0, 2, 0));

        for (let i = 1; i <= 4; i++) {
            if (this.input.isKeyPressed(i.toString())) {
                this.castSpell(i);
            }
        }

        if (this.input.mouse.clicked) {
            this.handleMouseClick(this.input.mouse.position);
        }
    }

        // Function to raise arms when shooting
        raiseArms(isShooting) {
            isShooting = true; // Set shooting state
            this.leftArmGroup.rotation.x = -Math.PI / 4; // Raise left arm
            this.rightArmGroup.rotation.x = -Math.PI / 4; // Raise right arm
        }
    
        // Function to lower arms to resting position
        lowerArms() {
            this.isShooting = false; // Reset shooting state
            this.leftArmGroup.rotation.x = 0; // Lower left arm
            this.rightArmGroup.rotation.x = 0; // Lower right arm
        }

    castSpell(spellNumber) {
        console.log(`Casting spell ${spellNumber}`);
    }

    handleMouseClick(position) {
        console.log(`Mouse clicked at (${position.x}, ${position.y})`);
    }
}

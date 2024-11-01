import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Projectile } from './projectile';

export class Player {
    constructor(scene, world) {
        this.scene = scene;
        this.world = world;
        this.moveSpeed = 0.1;

        // Temporary placeholder for `mesh`
        const placeholderGeometry = new THREE.BoxGeometry(1, 2, 1);
        const placeholderMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        this.mesh = new THREE.Mesh(placeholderGeometry, placeholderMaterial);
        this.scene.add(this.mesh);

        // Create the physics body
        this.createPhysicsBody();

        // Load the actual 3D model
        this.loadModel();

        // Initialize player properties
        this.health = 100;
        this.isAlive = true;
        this.shootRange = 10;
        this.shootCooldown = 0.5;
        this.lastShotTime = 0;

        // Create the health bar and shooting range
        this.createShootingRangeCircle();
        this.createHealthBar();
    }

    loadModel() {
      const loader = new GLTFLoader();
      loader.load('/assets/Dragon.glb', (gltf) => {
          this.scene.remove(this.mesh); // Remove placeholder
          this.model = gltf.scene;
          this.mesh = this.model;  // Set `this.mesh` to the loaded model
          this.scene.add(this.mesh);
  
          // Position and scale the model
          this.mesh.scale.set(0.1, 0.1, 0.1);
          this.mesh.position.copy(this.body.position);

          console.log("Available animations:", gltf.animations.map(a => a.name));
  
          // Set up animations if available
          this.mixer = new THREE.AnimationMixer(this.mesh);
          // Access specific animations by name
          this.flyAction = this.mixer.clipAction(gltf.animations.find(clip => clip.name === 'Fly_New'));
          this.idleAction = this.mixer.clipAction(gltf.animations.find(clip => clip.name === 'Idel_New'));
          this.runAction = this.mixer.clipAction(gltf.animations.find(clip => clip.name === 'Run_New'));
          this.walkAction = this.mixer.clipAction(gltf.animations.find(clip => clip.name === 'Walk_New'));

          // Start with idle animation
          this.idleAction.play();
      }, undefined, (error) => {
          console.error("Error loading model:", error);
      });
  }
  

    createPhysicsBody() {
        const playerShape = new CANNON.Box(new CANNON.Vec3(0.5, 1, 0.5));
        this.body = new CANNON.Body({
            mass: 1,
            position: new CANNON.Vec3(0, 5, 0),
            shape: playerShape
        });
        this.world.addBody(this.body);

        this.body.fixedRotation = true;
        this.body.updateMassProperties();
    }

  createHealthBar() {
    const barWidth = 1.5; // Width of the health bar
    const barHeight = 0.2; // Height of the health bar
    const healthBarGeometry = new THREE.PlaneGeometry(barWidth, barHeight);
    const healthBarMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // Green color
    this.healthBar = new THREE.Mesh(healthBarGeometry, healthBarMaterial);
    
    // Position the health bar above the player
    this.healthBar.position.y = 2.5; // Adjust height above the player
    this.healthBar.position.z = 0; // Center it in front of the player
    this.scene.add(this.healthBar);
}

updateHealthBar() {
    // Calculate health percentage
    const healthPercentage = this.health / 100; // Assuming max health is 100
    this.healthBar.scale.x = healthPercentage; // Scale the health bar based on health

    // Update color based on health
    if (healthPercentage > 0.5) {
        this.healthBar.material.color.set(0x00ff00); // Green for healthy
    } else if (healthPercentage > 0.25) {
        this.healthBar.material.color.set(0xffff00); // Yellow for caution
    } else {
        this.healthBar.material.color.set(0xff0000); // Red for critical health
    }
}

  takeDamage(amount) {
    this.health -= amount;
    this.updateHealthBar();
    if (this.health <= 0) {
      this.die();
    }
  }

  createShootingRangeCircle() {
    const rangeGeometry = new THREE.CircleGeometry(this.shootRange, 32);
    const rangeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.3 });
    this.rangeCircle = new THREE.Mesh(rangeGeometry, rangeMaterial);
    this.rangeCircle.rotation.x = -Math.PI / 2; // Rotate to lay flat on the ground
    this.rangeCircle.position.y = 0.01; // Slightly above the ground to avoid z-fighting
    this.scene.add(this.rangeCircle);
  }

  die() {
    console.log("Player has died.");
    this.isAlive = false;
    this.onDie();
    // Optionally: Implement logic to reset the game or trigger a game-over screen
  }

  onDie() {
    // Placeholder for the event callback
  }

  update(keys, delta) {
    this.updateMovement(keys);
    if (this.mixer) this.mixer.update(delta); // Update animations
    // Update the health bar's position
    if (this.healthBar) {
      this.healthBar.position.copy(this.body.position);
      this.healthBar.position.y += 2.5; // Offset to keep it above the player's head
    }

    this.updateHealthBar(); // Update health bar position
  }

  updateMovement(keys) {
    const isMoving = keys.forward || keys.backward || keys.left || keys.right;

    // Convert CANNON.Vec3 position to THREE.Vector3 for operations
    const currentPosition = new THREE.Vector3(this.body.position.x, this.body.position.y, this.body.position.z);

    if (isMoving) {
        if (this.walkAction && !this.walkAction.isRunning()) {
            // Stop other actions before starting walk
            this.idleAction?.stop();
            this.runAction?.stop();
            this.walkAction.reset().play();
        }

        // Update position based on input
        if (keys.forward) this.body.position.z -= this.moveSpeed;
        if (keys.backward) this.body.position.z += this.moveSpeed;
        if (keys.left) this.body.position.x -= this.moveSpeed;
        if (keys.right) this.body.position.x += this.moveSpeed;

        // Determine the direction vector based on movement
        const targetPosition = new THREE.Vector3(this.body.position.x, this.body.position.y, this.body.position.z);
        const direction = targetPosition.clone().sub(currentPosition).normalize().add(targetPosition);

        // Make the model face the direction of movement
        if (this.mesh) {
            this.mesh.lookAt(direction);
        }
    } else {
        // Play idle if not moving
        if (this.idleAction && !this.idleAction.isRunning()) {
            this.walkAction?.stop();
            this.runAction?.stop();
            this.idleAction.reset().play();
        }
    }

    // Sync model with physics body
    if (this.mesh) {
        this.mesh.position.copy(this.body.position);
    }
  }

  shoot(enemyManager, mouse, clock, scene, world, collisionManager) {
      if (mouse.isRightButtonDown && clock.getElapsedTime() - this.lastShotTime > this.shootCooldown) {
          this.lastShotTime = clock.getElapsedTime();  // Reset the cooldown

          // Select the first enemy as a target if it exists
          const targetEnemy = enemyManager.enemies[0];
          if (targetEnemy) {
              // Create a new projectile aimed at the enemy
              const projectile = new Projectile(
                  scene,
                  this.body.position.clone(),
                  targetEnemy.body.position.clone(),
                  20, // Damage dealt by the projectile
                  2,  // Maximum lifetime in seconds
                  enemyManager,
                  collisionManager
              );

              // Add projectile update to the main game loop instead of postStep
              world.addProjectile(projectile); // Assuming world has a projectiles array
          }
      }
  }

}

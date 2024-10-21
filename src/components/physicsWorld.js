// File: physicsWorld.js
import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import CannonDebugger from 'cannon-es-debugger';  // Cannon debugger for visualization

export class PhysicsWorld {
  constructor(sceneManager) {
    this.world = new CANNON.World();
    this.sceneManager = sceneManager;
    this.cannonDebugger = null;
    this.objects = [];  // Array to store { body, mesh } pairs
  }

  setup() {
    this.world.gravity.set(0, -9.82, 0);
    this.addGround();
    // Usage in your scene setup
    this.addTree()

    // Initialize the cannon-es debugger
    this.cannonDebugger = new CannonDebugger(this.sceneManager.scene, this.world);
  }

  addGround() {
    // Physics ground (use a large box instead of a plane for finite size)
    const groundShape = new CANNON.Box(new CANNON.Vec3(500, 0.1, 500));  // Half-extents for 1000x1000 ground
    const groundBody = new CANNON.Body({ mass: 0 });
    groundBody.addShape(groundShape);
    groundBody.position.set(0, -0.1, 0);  // Slightly below to prevent clipping
    this.world.addBody(groundBody);
  
    // Visual ground
    const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    this.sceneManager.scene.add(groundMesh);
  }
  
  // Add a tree to the scene
  addTree() {
    // Create the trunk (physics)
    const trunkShape = new CANNON.Cylinder(0.5, 0.5, 5); // radiusTop, radiusBottom, height
    const trunkBody = new CANNON.Body({
      mass: 0,  // Static object (mass = 0)
    });
    trunkBody.addShape(trunkShape);
    trunkBody.position.set(0, 2.5, 0);  // Adjust height to half the trunk's height

    // Create the foliage (physics)
    const foliageShape = new CANNON.Sphere(2);  // Radius 2 for the foliage
    const foliageBody = new CANNON.Body({
      mass: 0,  // Static object (mass = 0)
    });
    foliageBody.addShape(foliageShape);
    foliageBody.position.set(0, 6.5, 0);  // Positioned above the trunk

    // Create the trunk (visual)
    const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.5, 5);  // Visual trunk
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });  // Brown color
    const trunkMesh = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunkMesh.castShadow = true;
    trunkMesh.receiveShadow = true;

    // Create the foliage (visual)
    const foliageGeometry = new THREE.SphereGeometry(2, 16, 16);  // Visual foliage
    const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });  // Green color
    const foliageMesh = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliageMesh.castShadow = true;
    foliageMesh.receiveShadow = true;

    // Sync positions
    trunkMesh.position.copy(trunkBody.position);
    foliageMesh.position.copy(foliageBody.position);

    // Add to physics and visual world
    this.addObject(trunkBody, trunkMesh);
    this.addObject(foliageBody, foliageMesh);
  }

  


  addObject(body, mesh) {
    // Add physics body and visual mesh pair to the array
    this.world.addBody(body);
    this.sceneManager.scene.add(mesh);
    this.objects.push({ body, mesh });
  }

  update(timeStep) {
    // Step the physics world
    this.world.step(timeStep);

    // Sync the Three.js meshes with Cannon.js bodies
    this.objects.forEach(({ body, mesh }) => {
      mesh.position.copy(body.position);  // Sync position
      mesh.quaternion.copy(body.quaternion);  // Sync rotation
    });

    // Update the cannon debugger to visualize physics bodies
    if (this.cannonDebugger) {
      this.cannonDebugger.update();
    }
  }

  
}

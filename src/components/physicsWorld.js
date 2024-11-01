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
    this.addSkybox();
    // Usage in your scene setup
    this.scatterTrees(20);
    this.addWorldBorders(250);

    // Initialize the cannon-es debugger
    //this.cannonDebugger = new CannonDebugger(this.sceneManager.scene, this.world);
  }

  addSkybox() {
    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
        '/assets/skybox/row-2-column-1.png', // Right
        '/assets/skybox/row-2-column-3.png', // Left
        '/assets/skybox/row-1-column-4.png', // Top
        '/assets/skybox/row-3-column-4.png', // Bottom
        '/assets/skybox/row-2-column-4.png', // Front
        '/assets/skybox/row-2-column-2.png'  // Back
    ]);

    // Disable mipmaps for non-power-of-two textures
    texture.generateMipmaps = false;
    
    // Set filters to avoid mipmapping issues
    texture.minFilter = THREE.LinearFilter;  // Linear filter for minification
    texture.magFilter = THREE.LinearFilter;  // Linear filter for magnification

    // Ensure the wrapping is set to ClampToEdge to handle non-power-of-two textures
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    // Set the scene background to the skybox texture
    this.sceneManager.scene.background = texture;
}


addGround() {
  // Load the grass texture
  const textureLoader = new THREE.TextureLoader();
  const grassTexture = textureLoader.load('/assets/grass.png', (texture) => {
      // Repeat the texture to cover the entire ground
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(10, 10); // Adjust repeat as needed
  });

  // Physics ground (use a large box instead of a plane for finite size)
  const groundShape = new CANNON.Box(new CANNON.Vec3(250, 0.1, 250));  // Half-extents for 1000x1000 ground
  const groundBody = new CANNON.Body({ mass: 0 });
  groundBody.addShape(groundShape);
  groundBody.position.set(0, -0.1, 0);  // Slightly below to prevent clipping
  this.world.addBody(groundBody);

  // Visual ground with grassy texture
  const groundGeometry = new THREE.PlaneGeometry(500, 500);
  const groundMaterial = new THREE.MeshStandardMaterial({ 
      map: grassTexture, // Set the grass texture as the map
      side: THREE.DoubleSide // Optional: to see it from both sides
  });
  
  const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.receiveShadow = true;
  this.sceneManager.scene.add(groundMesh);
}

addWorldBorders(size) {
  const borderThickness = 10;  // Thickness of the walls
  const borderHeight = 50;    // Height of the walls (to ensure player can't jump over)

  // Positions for each border (left, right, front, back)
  const borders = [
    { position: { x: -size / 2, y: borderHeight / 2, z: 0 }, size: [borderThickness, borderHeight, size] }, // Left wall
    { position: { x: size / 2, y: borderHeight / 2, z: 0 }, size: [borderThickness, borderHeight, size] }, // Right wall
    { position: { x: 0, y: borderHeight / 2, z: -size / 2 }, size: [size, borderHeight, borderThickness] }, // Front wall
    { position: { x: 0, y: borderHeight / 2, z: size / 2 }, size: [size, borderHeight, borderThickness] }  // Back wall
  ];

  borders.forEach(border => {
    const shape = new CANNON.Box(new CANNON.Vec3(...border.size.map(dim => dim / 2)));
    const body = new CANNON.Body({ mass: 0 });
    body.addShape(shape);
    body.position.set(border.position.x, border.position.y, border.position.z);
    this.world.addBody(body);
  });
}

  
  addTree(position = { x: 0, y: 0, z: 0 }) {
    // Create the trunk (physics)
    const trunkShape = new CANNON.Cylinder(0.5, 0.5, 5);
    const trunkBody = new CANNON.Body({ mass: 0 });
    trunkBody.addShape(trunkShape);
    trunkBody.position.set(position.x, position.y + 2.5, position.z);  // Adjust height to half the trunk's height

    // Create the foliage (physics)
    const foliageShape = new CANNON.Sphere(2);
    const foliageBody = new CANNON.Body({ mass: 0 });
    foliageBody.addShape(foliageShape);
    foliageBody.position.set(position.x, position.y + 6.5, position.z);  // Positioned above the trunk

    // Create the trunk (visual)
    const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.5, 5);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const trunkMesh = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunkMesh.castShadow = true;
    trunkMesh.receiveShadow = true;

    // Create the foliage (visual)
    const foliageGeometry = new THREE.SphereGeometry(2, 16, 16);
    const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
    const foliageMesh = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliageMesh.castShadow = true;
    foliageMesh.receiveShadow = true;

      // Add a point light to the tree, starting off with 0 intensity
    const light = new THREE.PointLight(0xffd700, 50, 50); // Initially off (intensity = 0)
    light.position.set(position.x, position.y + 7, position.z);
    light.castShadow = true;


    // Sync positions
    trunkMesh.position.copy(trunkBody.position);
    foliageMesh.position.copy(foliageBody.position);

    // Add to physics and visual world
    this.addObject(trunkBody, trunkMesh);
    this.addObject(foliageBody, foliageMesh);
    this.sceneManager.scene.add(light);

    this.objects.push({ body: foliageBody, mesh: foliageMesh, light });

}

  scatterTrees(count) {
    const mapSize = 125;  // Half the size of your map (1000x1000)

    for (let i = 0; i < count; i++) {
        const x = (Math.random() - 0.5) * mapSize * 2;  // Random X position within the map
        const z = (Math.random() - 0.5) * mapSize * 2;  // Random Z position within the map
        const position = { x: x, y: 0, z: z };  // Y is 0, as trees should be placed on the ground

        this.addTree(position);
    }
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
    this.objects.forEach(({ body, mesh , light}) => {
      mesh.position.copy(body.position);  // Sync position
      mesh.quaternion.copy(body.quaternion);  // Sync rotation
    });

    // Update the cannon debugger to visualize physics bodies
    if (this.cannonDebugger) {
      this.cannonDebugger.update();
    }
  }

  
}

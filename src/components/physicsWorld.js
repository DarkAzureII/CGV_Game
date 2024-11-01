import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import CannonDebugger from 'cannon-es-debugger'; // Cannon debugger for visualization

export class PhysicsWorld {
  constructor(sceneManager) {
    this.world = new CANNON.World();
    this.sceneManager = sceneManager;
    this.cannonDebugger = null;
    this.objects = []; // Array to store { body, mesh, light } pairs
    this.projectiles = []; // Array to manage active projectiles
  }

  setup() {
    this.world.gravity.set(0, -9.82, 0);
    this.addGround();
    this.addSkybox();
    this.scatterTrees(50); // Moderate tree count
    this.addWorldBorders(250); // Define play area borders

    // Initialize the cannon-es debugger for development/testing
    // this.cannonDebugger = new CannonDebugger(this.sceneManager.scene, this.world);
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

    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    this.sceneManager.scene.background = texture;
  }

  addGround() {
    const textureLoader = new THREE.TextureLoader();
    const grassTexture = textureLoader.load('/assets/grass.png', (texture) => {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(10, 10);
    });
    // Physics ground
    const groundShape = new CANNON.Box(new CANNON.Vec3(250, 0.1, 250));
    const groundBody = new CANNON.Body({ mass: 0 });
    groundBody.addShape(groundShape);
    groundBody.position.set(0, -0.1, 0);
    this.world.addBody(groundBody);
    // Visual ground
    const groundGeometry = new THREE.PlaneGeometry(500, 500);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      map: grassTexture,
      side: THREE.DoubleSide 
    });
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    this.sceneManager.scene.add(groundMesh);
  }

  addWorldBorders(size) {
    const borderThickness = 10;
    const borderHeight = 50;

    const borders = [
      { position: { x: -size / 2, y: borderHeight / 2, z: 0 }, size: [borderThickness, borderHeight, size] },
      { position: { x: size / 2, y: borderHeight / 2, z: 0 }, size: [borderThickness, borderHeight, size] },
      { position: { x: 0, y: borderHeight / 2, z: -size / 2 }, size: [size, borderHeight, borderThickness] },
      { position: { x: 0, y: borderHeight / 2, z: size / 2 }, size: [size, borderHeight, borderThickness] }
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
    const trunkShape = new CANNON.Cylinder(0.5, 0.5, 5);
    const trunkBody = new CANNON.Body({ mass: 0 });
    trunkBody.addShape(trunkShape);
    trunkBody.position.set(position.x, position.y + 2.5, position.z);

    const foliageShape = new CANNON.Sphere(2);
    const foliageBody = new CANNON.Body({ mass: 0 });
    foliageBody.addShape(foliageShape);
    foliageBody.position.set(position.x, position.y + 6.5, position.z);

    const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.5, 5);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const trunkMesh = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunkMesh.castShadow = true;

    const foliageGeometry = new THREE.SphereGeometry(2, 16, 16);
    const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
    const foliageMesh = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliageMesh.castShadow = true;

    const light = new THREE.PointLight(0xffd700, 50, 50);
    light.position.set(position.x, position.y + 7, position.z);
    light.castShadow = true;

    trunkMesh.position.copy(trunkBody.position);
    foliageMesh.position.copy(foliageBody.position);

    this.addObject(trunkBody, trunkMesh);
    this.addObject(foliageBody, foliageMesh);
    this.sceneManager.scene.add(light);

    this.objects.push({ body: foliageBody, mesh: foliageMesh, light });
  }

  scatterTrees(count = 50) {
    const mapSize = 125;
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * mapSize * 2;
      const z = (Math.random() - 0.5) * mapSize * 2;
      const position = { x: x, y: 0, z: z };
      this.addTree(position);
    }
  }

  addObject(body, mesh) {
    this.world.addBody(body);
    this.sceneManager.scene.add(mesh);
    this.objects.push({ body, mesh });
  }

  addProjectile(projectile) {
    this.projectiles.push(projectile);
  }

  update(timeStep) {
    this.world.step(timeStep);
    this.objects.forEach(({ body, mesh, light }) => {
      mesh.position.copy(body.position);
      mesh.quaternion.copy(body.quaternion);
      if (light) {
        light.position.set(body.position.x, body.position.y + 4, body.position.z);
      }
    });

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      projectile.update(timeStep);

      if (projectile.disposed) {
        this.projectiles.splice(i, 1);
      }
    }

    if (this.cannonDebugger) {
      this.cannonDebugger.update();
    }
  }
}

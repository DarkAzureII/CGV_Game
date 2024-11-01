import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import CannonDebugger from 'cannon-es-debugger';  // Cannon debugger for visualization

export class PhysicsWorld {
  constructor(sceneManager) {
    this.world = new CANNON.World();
    this.sceneManager = sceneManager;
    this.cannonDebugger = null;
    this.objects = [];  // Array to store { body, mesh } pairs
    this.projectiles = []; // Array to manage active projectiles
  }

  setup() {
    this.world.gravity.set(0, -9.82, 0);
    this.addGround();
    this.addSkybox();
    this.scatterTrees(100);

    // Initialize the cannon-es debugger
    this.cannonDebugger = new CannonDebugger(this.sceneManager.scene, this.world);
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

    const groundShape = new CANNON.Box(new CANNON.Vec3(500, 0.1, 500));
    const groundBody = new CANNON.Body({ mass: 0 });
    groundBody.addShape(groundShape);
    groundBody.position.set(0, -0.1, 0);
    this.world.addBody(groundBody);

    const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      map: grassTexture, 
      side: THREE.DoubleSide 
    });
    
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    this.sceneManager.scene.add(groundMesh);
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
    trunkMesh.receiveShadow = true;

    const foliageGeometry = new THREE.SphereGeometry(2, 16, 16);
    const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
    const foliageMesh = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliageMesh.castShadow = true;
    foliageMesh.receiveShadow = true;

    trunkMesh.position.copy(trunkBody.position);
    foliageMesh.position.copy(foliageBody.position);

    this.addObject(trunkBody, trunkMesh);
    this.addObject(foliageBody, foliageMesh);
  }

  scatterTrees(count = 50) {
    const mapSize = 500;

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

    // Sync the Three.js meshes with Cannon.js bodies
    this.objects.forEach(({ body, mesh }) => {
      mesh.position.copy(body.position);
      mesh.quaternion.copy(body.quaternion);
    });

    // Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      projectile.update(timeStep);

      if (projectile.disposed) {
        this.projectiles.splice(i, 1); // Remove disposed projectiles
      }
    }

    if (this.cannonDebugger) {
      this.cannonDebugger.update();
    }
  }
}

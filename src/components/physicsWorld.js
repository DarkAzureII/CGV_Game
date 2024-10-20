// File: physicsWorld.js
import * as CANNON from 'cannon-es';
import * as THREE from 'three';

export class PhysicsWorld {
  constructor(sceneManager) {
    this.world = new CANNON.World();
    this.sceneManager = sceneManager;
  }

  setup() {
    this.world.gravity.set(0, -9.82, 0);
    this.addGround();
  }

  addGround() {
    // Physics ground
    const groundShape = new CANNON.Plane();
    const groundBody = new CANNON.Body({ mass: 0 });
    groundBody.addShape(groundShape);
    groundBody.position.set(0, 0, 0);
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    this.world.addBody(groundBody);

    // Visual ground
    const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    this.sceneManager.scene.add(groundMesh);
  }

  update(timeStep) {
    this.world.step(timeStep);
  }
}
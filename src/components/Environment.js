// src/components/Environment.js
import * as THREE from 'three';

export class Environment {
  constructor(scene) {
    this.scene = scene;
    this.createGround();
    this.createWalls();
    this.addLighting();
  }

  createGround() {
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22, side: THREE.DoubleSide });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2; // Rotate to lie flat
    this.scene.add(ground);
  }

  createWalls() {
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });

    const wall1 = new THREE.Mesh(new THREE.BoxGeometry(1, 5, 100), wallMaterial);
    wall1.position.set(-50, 2.5, 0);
    this.scene.add(wall1);

    const wall2 = new THREE.Mesh(new THREE.BoxGeometry(1, 5, 100), wallMaterial);
    wall2.position.set(50, 2.5, 0);
    this.scene.add(wall2);

    const wall3 = new THREE.Mesh(new THREE.BoxGeometry(100, 5, 1), wallMaterial);
    wall3.position.set(0, 2.5, -50);
    this.scene.add(wall3);

    const wall4 = new THREE.Mesh(new THREE.BoxGeometry(100, 5, 1), wallMaterial);
    wall4.position.set(0, 2.5, 50);
    this.scene.add(wall4);
  }

  addLighting() {
    const ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 10, 10);
    this.scene.add(directionalLight);
  }
}

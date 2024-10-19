// src/components/Player.js
import * as THREE from 'three';

export class Player {
  constructor(scene) {
    const playerGeometry = new THREE.BoxGeometry(5, 1, 5);
    const playerMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    this.mesh = new THREE.Mesh(playerGeometry, playerMaterial);
    this.moveSpeed = 0.3;

    scene.add(this.mesh);
  }

  updateMovement(keys) {
    if (keys.left) this.mesh.position.x -= this.moveSpeed;
    if (keys.right) this.mesh.position.x += this.moveSpeed;
    if (keys.forward) this.mesh.position.z -= this.moveSpeed;
    if (keys.backward) this.mesh.position.z += this.moveSpeed;
  }
}

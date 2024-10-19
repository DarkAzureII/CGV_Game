// src/components/Enemy.js
import * as THREE from 'three';

export class Enemy {
    constructor(scene) {
      const enemyGeometry = new THREE.SphereGeometry(3, 32, 32);
      const enemyMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      this.mesh = new THREE.Mesh(enemyGeometry, enemyMaterial);
      this.mesh.position.set(Math.random() * 40 - 20, 0.5, Math.random() * 40 - 20);
      this.speed = 0.05;
  
      scene.add(this.mesh);
    }
  
    moveToward(target) {
      const direction = new THREE.Vector3();
      direction.subVectors(target.position, this.mesh.position).normalize();
      this.mesh.position.addScaledVector(direction, this.speed);
    }
  }
  
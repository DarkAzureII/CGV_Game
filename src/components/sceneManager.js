// File: sceneManager.js
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class SceneManager {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.controls = new PointerLockControls(this.camera, document.body);
  }

  setup() {
    this.setupRenderer();
    this.setupCamera();
    this.setupLights();
    //this.loadIsland();
  }

  setupRenderer() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
  }

  setupCamera() {
    this.camera.position.set(0, 20, 30);
    this.scene.add(this.controls.getObject());
  }

  setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);
  }

  addToScene(object) {
    this.scene.add(object);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
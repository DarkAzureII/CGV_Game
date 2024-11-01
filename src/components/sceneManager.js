// File: sceneManager.js
import * as THREE from 'three';
export class SceneManager {
  constructor(player) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });

    // Smooth camera transition parameters
    this.cameraLerpSpeed = 0.1; // Control how smoothly the camera follows the player
    this.targetPosition = new THREE.Vector3(); // Used to store target camera position

    // Zoom parameters
    this.zoomSpeed = 0.1; // Speed of zooming
    this.minDistance = 5; // Minimum zoom distance
    this.maxDistance = 50; // Maximum zoom distance
    this.currentDistance = 30; // Current distance from the player

  }

  setup() {
    this.setupRenderer();
    this.setupCamera();
    this.setupLights();
    this.addResizeListener(); // Handle window resize
    this.addMouseWheelListener(); // Handle mouse wheel for zooming
    this.startRenderLoop(); // Start the render loop
  }

  setupRenderer() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
  }

  setupCamera() {
    // Initial camera position: slightly above and behind the player
    this.camera.position.set(0, 15, this.currentDistance);
  }

  setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);
  }

  addResizeListener() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  addMouseWheelListener() {
    window.addEventListener('wheel', (event) => {
      event.preventDefault();
      this.currentDistance += event.deltaY * this.zoomSpeed; 
      this.currentDistance = Math.max(this.minDistance, Math.min(this.currentDistance, this.maxDistance));
    });
  }

  updateCamera(player) {
    if (!player || !player.body) return;
  
    // Offset values for the third-person view
    const offsetX = 0;  // Stay directly behind the player
    const offsetY = 15; // Height above the player (adjust as needed)
    const offsetZ = this.currentDistance; // Distance behind the player based on currentDistance
  
    // Get player's current position
    const playerPosition = player.body.position;
  
    // Calculate the desired camera position based on the player's position
    this.targetPosition.set(
      playerPosition.x + offsetX,
      playerPosition.y + offsetY,
      playerPosition.z + offsetZ
    );
  
    // Smoothly interpolate camera's position toward the target position
    this.camera.position.lerp(this.targetPosition, this.cameraLerpSpeed);
  
    // Make the camera look at the player
    //this.camera.lookAt(playerPosition);
    this.camera.position.set(0 + playerPosition.x, 20, this.currentDistance + playerPosition.z);
  
    // Log the camera position to debug
    console.log(`Camera Position: x=${this.camera.position.x}, y=${this.camera.position.y}, z=${this.camera.position.z}`);
  }
  

  addToScene(object) {
    this.scene.add(object);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  startRenderLoop() {
    const animate = () => {
      requestAnimationFrame(animate);
      this.render(); // Call render on each frame
    };
    animate(); // Start the animation loop
  }
}
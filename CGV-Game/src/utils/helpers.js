// src/utils/helpers.js
// Example: Function to load models, textures, etc.

export function loadTexture(path) {
    const loader = new THREE.TextureLoader();
    return loader.load(path);
  }
  
  // Add more helper functions as needed
  
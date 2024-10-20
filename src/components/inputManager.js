// File: inputManager.js
export class InputManager {
    constructor(controls) {
      this.controls = controls;
      this.keys = { left: false, right: false, forward: false, backward: false };
      this.setupControls();
    }
  
    setupControls() {
      document.addEventListener('click', () => {
        this.controls.lock();
      });
  
      document.addEventListener('keydown', (event) => this.handleKeyDown(event));
      document.addEventListener('keyup', (event) => this.handleKeyUp(event));
    }
  
    handleKeyDown(event) {
      if (event.code === 'ArrowLeft' || event.code === 'KeyA') this.keys.left = true;
      if (event.code === 'ArrowRight' || event.code === 'KeyD') this.keys.right = true;
      if (event.code === 'ArrowUp' || event.code === 'KeyW') this.keys.forward = true;
      if (event.code === 'ArrowDown' || event.code === 'KeyS') this.keys.backward = true;
    }
  
    handleKeyUp(event) {
      if (event.code === 'ArrowLeft' || event.code === 'KeyA') this.keys.left = false;
      if (event.code === 'ArrowRight' || event.code === 'KeyD') this.keys.right = false;
      if (event.code === 'ArrowUp' || event.code === 'KeyW') this.keys.forward = false;
      if (event.code === 'ArrowDown' || event.code === 'KeyS') this.keys.backward = false;
    }
  }
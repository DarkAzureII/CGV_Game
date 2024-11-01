// File: InputManager.js
export class InputManager {
  constructor() {
    this.keys = { left: false, right: false, forward: false, backward: false };
    this.mouse = { x: 0, y: 0, isRightButtonDown: false, isPointerLocked: false };

    // Keyboard events
    document.addEventListener('keydown', (event) => this.handleKeyDown(event));
    document.addEventListener('keyup', (event) => this.handleKeyUp(event));

    // Mouse events
    document.addEventListener('mousedown', (event) => this.handleMouseDown(event));
    document.addEventListener('mouseup', (event) => this.handleMouseUp(event));
    document.addEventListener('mousemove', (event) => this.handleMouseMove(event));
  }

  handleKeyDown(event) {
    if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
      this.keys.left = true;
    }
    if (event.code === 'ArrowRight' || event.code === 'KeyD') {
      this.keys.right = true;
    }
    if (event.code === 'ArrowUp' || event.code === 'KeyW') {
      this.keys.forward = true;
    }
    if (event.code === 'ArrowDown' || event.code === 'KeyS') {
      this.keys.backward = true;
    }
  }

  handleKeyUp(event) {
    if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
      this.keys.left = false;
    }
    if (event.code === 'ArrowRight' || event.code === 'KeyD') {
      this.keys.right = false;
    }
    if (event.code === 'ArrowUp' || event.code === 'KeyW') {
      this.keys.forward = false;
    }
    if (event.code === 'ArrowDown' || event.code === 'KeyS') {
      this.keys.backward = false;
    }
  }

  handleMouseDown(event) {
    if (event.button === 2) {  // Right mouse button
      this.mouse.isRightButtonDown = true;
      console.log('Mouse down: right button');
    } else {
      console.log(`Mouse down: button ${event.button}`);
    }
  }

  handleMouseUp(event) {
    if (event.button === 2) {  // Right mouse button
      this.mouse.isRightButtonDown = false;
      console.log('Mouse up: right button');
    } else {
      console.log(`Mouse up: button ${event.button}`);
    }
  }

  handleMouseMove(event) {
    if (this.mouse.isPointerLocked) {
      // When pointer is locked, track relative movement for aiming or rotating
      this.mouse.x += event.movementX;
      this.mouse.y += event.movementY;
    } else {
      // Update absolute position if not locked
      this.mouse.x = event.clientX;
      this.mouse.y = event.clientY;
    }
  }

  // Enable custom mouse controls when pointer is locked
  enableMouseControls() {
    this.mouse.isPointerLocked = true;
    console.log('Mouse controls enabled. Pointer locked.');
  }

  // Disable custom mouse controls when pointer is unlocked
  disableMouseControls() {
    this.mouse.isPointerLocked = false;
    console.log('Mouse controls disabled. Pointer unlocked.');
  }
}
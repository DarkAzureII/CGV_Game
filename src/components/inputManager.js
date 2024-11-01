export class InputManager {
  constructor(controls) {
    this.controls = controls;
    this.keys = { left: false, right: false, forward: false, backward: false };
    this.mouse = { isRightButtonDown: false };  // Add mouse state

    // Keyboard events
    document.addEventListener('keydown', (event) => this.handleKeyDown(event));
    document.addEventListener('keyup', (event) => this.handleKeyUp(event));

    // Mouse events
    document.addEventListener('mousedown', (event) => this.handleMouseDown(event));
    document.addEventListener('mouseup', (event) => this.handleMouseUp(event));


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

  handleMouseDown(event) {
    if (event.button === 2) {  // Right mouse button
      this.mouse.isRightButtonDown = true;
    }
  }

  handleMouseUp(event) {
    if (event.button === 2) {  // Right mouse button
      this.mouse.isRightButtonDown = false;
    }
  }
}
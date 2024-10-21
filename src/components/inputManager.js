export class InputManager {
  constructor(controls) {
    this.controls = controls;
    this.keys = { left: false, right: false, forward: false, backward: false };
    this.mouse = { isRightButtonDown: false, deltaX: 0, deltaY: 0 }; // Track mouse status
    this.setupControls();
  }

  setupControls() {
    // Lock controls on click
    document.addEventListener('click', () => {
      this.controls.lock();
    });

    // Keyboard events
    document.addEventListener('keydown', (event) => this.handleKeyDown(event));
    document.addEventListener('keyup', (event) => this.handleKeyUp(event));

    // Mouse events
    document.addEventListener('mousedown', (event) => this.handleMouseDown(event));
    document.addEventListener('mouseup', (event) => this.handleMouseUp(event));
    document.addEventListener('mousemove', (event) => this.handleMouseMove(event));
  }

  // Handle keydown events
  handleKeyDown(event) {
    if (event.code === 'ArrowLeft' || event.code === 'KeyA') this.keys.left = true;
    if (event.code === 'ArrowRight' || event.code === 'KeyD') this.keys.right = true;
    if (event.code === 'ArrowUp' || event.code === 'KeyW') this.keys.forward = true;
    if (event.code === 'ArrowDown' || event.code === 'KeyS') this.keys.backward = true;
  }

  // Handle keyup events
  handleKeyUp(event) {
    if (event.code === 'ArrowLeft' || event.code === 'KeyA') this.keys.left = false;
    if (event.code === 'ArrowRight' || event.code === 'KeyD') this.keys.right = false;
    if (event.code === 'ArrowUp' || event.code === 'KeyW') this.keys.forward = false;
    if (event.code === 'ArrowDown' || event.code === 'KeyS') this.keys.backward = false;
  }

  // Handle mouse down events (e.g., right-click for shooting)
  handleMouseDown(event) {
    if (event.button === 2) { // Right-click
      this.mouse.isRightButtonDown = true;
    }
  }

  // Handle mouse up events (e.g., releasing right-click)
  handleMouseUp(event) {
    if (event.button === 2) { // Right-click
      this.mouse.isRightButtonDown = false;
    }
  }

  // Handle mouse movement (e.g., for camera control or aiming)
  handleMouseMove(event) {
    this.mouse.deltaX = event.movementX;
    this.mouse.deltaY = event.movementY;

    // Optional: Reset after processing to prevent accumulation
    this.resetMouseMovement();
  }

  // Optional: Reset mouse movement after each frame
  resetMouseMovement() {
    this.mouse.deltaX = 0;
    this.mouse.deltaY = 0;
  }
}

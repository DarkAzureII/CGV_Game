// src/Input.js
export default class Input {
  constructor(domElement) { // Receive domElement as a parameter
    this.domElement = domElement;
      this.keys = {};
      this.mouse = {
          buttons: {},
          movement: { x: 0, y: 0 },
          clicked: false,
          position: { x: 0, y: 0 }
      };
      this.rmbPressed = false;
      this.wheelDelta = 0; // Initialize wheelDelta
      this.pointerLocked = false;
  
      // Bind event handlers
      this.handleKeyDown = this.handleKeyDown.bind(this);
      this.handleKeyUp = this.handleKeyUp.bind(this);
      this.handleMouseMove = this.handleMouseMove.bind(this);
      this.handleMouseDown = this.handleMouseDown.bind(this);
      this.handleMouseUp = this.handleMouseUp.bind(this);
      this.handleContextMenu = this.handleContextMenu.bind(this);
      this.handleWheel = this.handleWheel.bind(this);
      this.handlePointerLockChange = this.handlePointerLockChange.bind(this);
      this.handlePointerLockError = this.handlePointerLockError.bind(this);
  
      // Keyboard Events
      window.addEventListener('keydown', this.handleKeyDown);
      window.addEventListener('keyup', this.handleKeyUp);
  
      // Mouse Events attached to domElement
      domElement.addEventListener('mousemove', this.handleMouseMove);
      domElement.addEventListener('mousedown', this.handleMouseDown);
      domElement.addEventListener('mouseup', this.handleMouseUp);
      domElement.addEventListener('contextmenu', this.handleContextMenu);
      domElement.addEventListener('wheel', this.handleWheel, { passive: false }); // Prevent default if needed
  
      // Pointer Lock Events
      document.addEventListener('pointerlockchange', this.handlePointerLockChange);
      document.addEventListener('pointerlockerror', this.handlePointerLockError);
  }
  
  handleKeyDown(e) {
      this.keys[e.key.toLowerCase()] = true;
      if (e.key === 'Alt') {
          this.altPressed = true;
          console.log('Alt key pressed');
      }
  }
  
  handleKeyUp(e) {
      this.keys[e.key.toLowerCase()] = false;
      if (e.key === 'Alt') {
          this.altPressed = false;
          console.log('Alt key released');
          // Exit pointer lock when Alt is released
          if (this.pointerLocked) {
              document.exitPointerLock();
          }
      }
  }
  
  handleMouseMove(e) {
      if (this.pointerLocked) {
          this.mouse.movement.x += e.movementX;
          this.mouse.movement.y += e.movementY;
      } else {
          this.mouse.movement.x = e.movementX;
          this.mouse.movement.y = e.movementY;
          this.mouse.position.x = e.clientX;
          this.mouse.position.y = e.clientY;
      }
  
      // Debug log for mouse movement
      //console.log(`Mouse moved: Δx=${e.movementX}, Δy=${e.movementY}`);
  }
  
  handleMouseDown(e) {
      e.preventDefault();
      this.mouse.buttons[e.button] = true;
      this.mouse.clicked = true;

      if (e.button === 0) { // Check for LMB
        console.log('Left Mouse Button pressed');
      }

  
      if (e.button === 2) { // 2 is RMB
          this.rmbPressed = true;
          console.log('Right Mouse Button pressed');
          // Request Pointer Lock when RMB is pressed
          if (!this.pointerLocked) {
              this.domElement.requestPointerLock();
          }
      }
  }
  
  handleMouseUp(e) {
      this.mouse.buttons[e.button] = false;
      this.mouse.clicked = false;
  
      if (e.button === 2) { // 2 is RMB
          this.rmbPressed = false;
          console.log('Right Mouse Button released');
          // Exit Pointer Lock when RMB is released
          if (this.pointerLocked) {
              document.exitPointerLock();
          }
      }
  }
  
  handleContextMenu(e) {
      if (this.pointerLocked) {
          e.preventDefault();
          console.log('Context menu prevented during Pointer Lock');
      }
  }
  
  handleWheel(e) {
      this.wheelDelta = e.deltaY;
      // Optional: Prevent default scrolling behavior
      // e.preventDefault();
      console.log(`Wheel delta: ${this.wheelDelta}`);
  }
  
  handlePointerLockChange() {
      if (document.pointerLockElement === this.domElement) {
          this.pointerLocked = true;
          console.log('Pointer locked');
      } else {
          this.pointerLocked = false;
          console.log('Pointer unlocked');
      }
  }
  
  handlePointerLockError() {
      console.log('Pointer Lock Error');
  }
  
  update() {
      // Reset per-frame states if necessary
      this.mouse.clicked = false;
      // Reset mouse movement after each frame if not pointer locked
      if (!this.pointerLocked) {
          this.mouse.movement.x = 0;
          this.mouse.movement.y = 0;
      }
  }
  
  isKeyPressed(key) {
      return this.keys[key.toLowerCase()] || false;
  }
  
  isRMBPressed() {
      return this.rmbPressed;
  }
  
  isMouseButtonPressed(button) {
      return this.mouse.buttons[button] || false;
  }
  
  isMouseRotating() {
      return this.isMouseButtonPressed(2); // 2 is RMB
  }
  
  getWheelDelta() {
      return this.wheelDelta;
  }
}

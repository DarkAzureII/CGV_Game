import * as THREE from 'three';

export default class CameraController {
    constructor(camera, domElement, input, player = null) {
        this.camera = camera;
        this.domElement = domElement;
        this.input = input;
        this.player = player;

        // Spherical coordinates for the camera
        this.spherical = new THREE.Spherical();
        this.spherical.radius = 20; // Distance from the player
        this.spherical.theta = Math.PI / 4; // Horizontal angle
        this.spherical.phi = Math.PI / 4; // Vertical angle

        // Target the player's position
        this.target = new THREE.Vector3();

        // Rotation parameters
        this.rotationSpeed = 0.002;
        this.sensitivity = 0.1; // Default sensitivity multiplier

        // Damping factor for smooth movement (optional)
        this.damping = 0.1;

        // Current spherical angles
        this.currentTheta = this.spherical.theta;
        this.currentPhi = this.spherical.phi;
        this.currentRadius = this.spherical.radius;

        // Zoom parameters
        this.minRadius = 5;
        this.maxRadius = 50;
        this.followDamping = 0.1;
    }

    setSensitivity(value) {
        this.sensitivity = value; // Adjust sensitivity
    }

    setPlayer(player) {
        this.player = player;
        console.log('CameraController: Player has been set.');
    }

    update(delta) {
        if (!this.player || !this.player.mesh) {
            //console.log('CameraController: No player to follow.');
            return;
        }

        // Update the target to the player's current position
        this.target.copy(this.player.mesh.position);
        //console.log('CameraController: Camera looking at:', this.target);

        // Handle camera rotation
        if (this.input.isMouseRotating()) { // isMouseRotating checks for RMB
            // Adjust rotation based on sensitivity
            this.spherical.theta -= this.input.mouse.movement.x * this.rotationSpeed * this.sensitivity;
            this.spherical.phi -= this.input.mouse.movement.y * this.rotationSpeed * this.sensitivity;

            // Clamp phi to prevent flipping
            this.spherical.phi = Math.max(0.3, Math.min(Math.PI / 2, this.spherical.phi));
        }

        // Handle Zooming
        const wheelDelta = this.input.getWheelDelta();
        if (wheelDelta !== 0) {
            this.spherical.radius += wheelDelta * 0.05;
            this.spherical.radius = Math.max(this.minRadius, Math.min(this.maxRadius, this.spherical.radius));
        }

        // Smoothly interpolate current angles towards target angles
        this.currentTheta += (this.spherical.theta - this.currentTheta) * this.followDamping;
        this.currentPhi += (this.spherical.phi - this.currentPhi) * this.followDamping;
        this.currentRadius += (this.spherical.radius - this.currentRadius) * this.followDamping;

        // Update the camera position based on interpolated angles
        const sinPhiRadius = Math.sin(this.currentPhi) * this.currentRadius;
        this.camera.position.x = sinPhiRadius * Math.sin(this.currentTheta) + this.target.x;
        this.camera.position.y = Math.cos(this.currentPhi) * this.currentRadius + this.target.y;
        this.camera.position.z = sinPhiRadius * Math.cos(this.currentTheta) + this.target.z;

        //console.log('CameraController: Camera position:', this.camera.position);

        // Make the camera look at the player
        this.camera.lookAt(this.target);

        // Reset wheel delta after handling
        this.input.wheelDelta = 0;
    }
}

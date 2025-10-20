class CameraController {
    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;
        
        // Camera configuration
        this.defaultPosition = { x: 8, y: 12, z: 8 };
        this.lookAtTarget = { x: 5, y: 10, z: 0 };
        
        // Camera movement
        this.isAnimating = false;
        this.animationDuration = 1000; // 1 second
        this.animationStartTime = 0;
        this.animationStartPosition = { x: 0, y: 0, z: 0 };
        this.animationTargetPosition = { x: 0, y: 0, z: 0 };
        
        // Rotation capability
        this.rotationEnabled = false;
        this.rotationSpeed = 0.0005; // Slow rotation
        this.rotationRadius = Math.sqrt(this.defaultPosition.x ** 2 + this.defaultPosition.z ** 2);
        this.rotationAngle = Math.atan2(this.defaultPosition.z, this.defaultPosition.x);
        
        // Camera shake for effects
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.shakeStartTime = 0;
        this.originalPosition = { x: 0, y: 0, z: 0 };
        
        this.setOptimalPosition();
    }
    
    setOptimalPosition() {
        // Set camera to optimal position for Tetris gameplay
        this.camera.position.set(
            this.defaultPosition.x,
            this.defaultPosition.y,
            this.defaultPosition.z
        );
        
        this.camera.lookAt(
            this.lookAtTarget.x,
            this.lookAtTarget.y,
            this.lookAtTarget.z
        );
        
        console.log('Camera positioned for optimal gameplay view');
    }
    
    smoothTransition(targetPosition, duration = this.animationDuration) {
        if (this.isAnimating) {
            return; // Don't interrupt ongoing animation
        }
        
        this.isAnimating = true;
        this.animationDuration = duration;
        this.animationStartTime = performance.now();
        
        // Store current position as start
        this.animationStartPosition = {
            x: this.camera.position.x,
            y: this.camera.position.y,
            z: this.camera.position.z
        };
        
        // Set target position
        this.animationTargetPosition = { ...targetPosition };
        
        console.log('Starting smooth camera transition');
    }
    
    update(deltaTime) {
        // Handle smooth transitions
        if (this.isAnimating) {
            this.updateTransition();
        }
        
        // Handle rotation
        if (this.rotationEnabled && !this.isAnimating) {
            this.updateRotation(deltaTime);
        }
        
        // Handle camera shake
        if (this.shakeDuration > 0) {
            this.updateShake();
        }
    }
    
    updateTransition() {
        const currentTime = performance.now();
        const elapsed = currentTime - this.animationStartTime;
        const progress = Math.min(elapsed / this.animationDuration, 1);
        
        // Smooth easing function (ease-in-out)
        const eased = progress < 0.5 
            ? 2 * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        // Interpolate position
        const newPosition = {
            x: this.lerp(this.animationStartPosition.x, this.animationTargetPosition.x, eased),
            y: this.lerp(this.animationStartPosition.y, this.animationTargetPosition.y, eased),
            z: this.lerp(this.animationStartPosition.z, this.animationTargetPosition.z, eased)
        };
        
        this.camera.position.set(newPosition.x, newPosition.y, newPosition.z);
        this.camera.lookAt(this.lookAtTarget.x, this.lookAtTarget.y, this.lookAtTarget.z);
        
        // Check if animation is complete
        if (progress >= 1) {
            this.isAnimating = false;
            console.log('Camera transition complete');
        }
    }
    
    updateRotation(deltaTime) {
        // Rotate camera around the game board
        this.rotationAngle += this.rotationSpeed * deltaTime;
        
        // Calculate new position
        const x = Math.cos(this.rotationAngle) * this.rotationRadius;
        const z = Math.sin(this.rotationAngle) * this.rotationRadius;
        
        this.camera.position.x = x;
        this.camera.position.z = z;
        
        // Keep looking at center
        this.camera.lookAt(this.lookAtTarget.x, this.lookAtTarget.y, this.lookAtTarget.z);
    }
    
    updateShake() {
        const currentTime = performance.now();
        const elapsed = currentTime - this.shakeStartTime;
        
        if (elapsed < this.shakeDuration) {
            // Generate random shake offset
            const intensity = this.shakeIntensity * (1 - elapsed / this.shakeDuration); // Fade out
            const offsetX = (Math.random() - 0.5) * intensity;
            const offsetY = (Math.random() - 0.5) * intensity;
            const offsetZ = (Math.random() - 0.5) * intensity;
            
            // Apply shake to camera
            this.camera.position.set(
                this.originalPosition.x + offsetX,
                this.originalPosition.y + offsetY,
                this.originalPosition.z + offsetZ
            );
        } else {
            // Shake complete, restore original position
            this.camera.position.set(
                this.originalPosition.x,
                this.originalPosition.y,
                this.originalPosition.z
            );
            this.shakeDuration = 0;
        }
        
        this.camera.lookAt(this.lookAtTarget.x, this.lookAtTarget.y, this.lookAtTarget.z);
    }
    
    enableRotation() {
        this.rotationEnabled = true;
        console.log('Camera rotation enabled');
    }
    
    disableRotation() {
        this.rotationEnabled = false;
        console.log('Camera rotation disabled');
    }
    
    setRotationSpeed(speed) {
        this.rotationSpeed = Math.max(0, Math.min(0.005, speed)); // Clamp between 0 and 0.005
    }
    
    // Camera effects
    shake(intensity = 0.5, duration = 500) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
        this.shakeStartTime = performance.now();
        
        // Store original position
        this.originalPosition = {
            x: this.camera.position.x,
            y: this.camera.position.y,
            z: this.camera.position.z
        };
        
        console.log(`Camera shake: intensity=${intensity}, duration=${duration}ms`);
    }
    
    // Quick position presets
    setTopView() {
        const targetPosition = { x: 0, y: 15, z: 0 };
        this.smoothTransition(targetPosition);
    }
    
    setSideView() {
        const targetPosition = { x: 12, y: 10, z: 0 };
        this.smoothTransition(targetPosition);
    }
    
    setIsometricView() {
        const targetPosition = { x: 8, y: 12, z: 8 };
        this.smoothTransition(targetPosition);
    }
    
    setCloseView() {
        const targetPosition = { x: 6, y: 8, z: 6 };
        this.smoothTransition(targetPosition);
    }
    
    // Zoom functions
    zoomIn(factor = 0.8) {
        const currentDistance = Math.sqrt(
            this.camera.position.x ** 2 + 
            this.camera.position.y ** 2 + 
            this.camera.position.z ** 2
        );
        
        const newDistance = currentDistance * factor;
        const direction = {
            x: this.camera.position.x / currentDistance,
            y: this.camera.position.y / currentDistance,
            z: this.camera.position.z / currentDistance
        };
        
        const targetPosition = {
            x: direction.x * newDistance,
            y: direction.y * newDistance,
            z: direction.z * newDistance
        };
        
        this.smoothTransition(targetPosition, 500);
    }
    
    zoomOut(factor = 1.25) {
        this.zoomIn(factor);
    }
    
    // Focus on specific area of the board
    focusOnArea(x, y, z = 0) {
        // Adjust look-at target
        this.lookAtTarget = { x, y, z };
        this.camera.lookAt(x, y, z);
    }
    
    resetFocus() {
        this.lookAtTarget = { x: 5, y: 10, z: 0 };
        this.camera.lookAt(5, 10, 0);
    }
    
    // Game event responses
    onLineClear(lines) {
        // Subtle shake for line clear feedback
        const intensity = Math.min(0.3 + lines.length * 0.1, 1.0);
        this.shake(intensity, 200 + lines.length * 100);
    }
    
    onTetris() {
        // Special effect for Tetris (4 lines)
        this.shake(1.0, 800);
    }
    
    onGameOver() {
        // Dramatic zoom out on game over
        const targetPosition = { x: 12, y: 16, z: 12 };
        this.smoothTransition(targetPosition, 2000);
    }
    
    onLevelUp(newLevel) {
        // Quick zoom in then back out
        this.zoomIn(0.7);
        setTimeout(() => {
            this.zoomOut(1 / 0.7);
        }, 300);
    }
    
    // Utility functions
    lerp(start, end, factor) {
        return start + (end - start) * factor;
    }
    
    getDistance(pos1, pos2) {
        return Math.sqrt(
            (pos1.x - pos2.x) ** 2 + 
            (pos1.y - pos2.y) ** 2 + 
            (pos1.z - pos2.z) ** 2
        );
    }
    
    // Get current camera state
    getState() {
        return {
            position: {
                x: this.camera.position.x,
                y: this.camera.position.y,
                z: this.camera.position.z
            },
            lookAt: { ...this.lookAtTarget },
            isRotating: this.rotationEnabled,
            isAnimating: this.isAnimating,
            rotationSpeed: this.rotationSpeed
        };
    }
    
    // Save/restore camera position
    savePosition() {
        return {
            position: {
                x: this.camera.position.x,
                y: this.camera.position.y,
                z: this.camera.position.z
            },
            lookAt: { ...this.lookAtTarget },
            rotationAngle: this.rotationAngle
        };
    }
    
    restorePosition(savedState) {
        if (savedState) {
            this.camera.position.set(
                savedState.position.x,
                savedState.position.y,
                savedState.position.z
            );
            
            if (savedState.lookAt) {
                this.lookAtTarget = { ...savedState.lookAt };
                this.camera.lookAt(
                    savedState.lookAt.x,
                    savedState.lookAt.y,
                    savedState.lookAt.z
                );
            }
            
            if (savedState.rotationAngle !== undefined) {
                this.rotationAngle = savedState.rotationAngle;
            }
        }
    }
    
    // Performance optimization
    setLowPerformanceMode(enabled) {
        if (enabled) {
            this.disableRotation();
            this.rotationSpeed = 0;
        } else {
            this.rotationSpeed = 0.0005;
        }
    }
}
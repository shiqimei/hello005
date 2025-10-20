class LightingSystem {
    constructor(scene) {
        this.scene = scene;
        this.lights = {};
        this.lightingIntensity = 1.0;
        this.ambientIntensity = 0.4;
        this.directionalIntensity = 0.8;
        
        // Performance settings
        this.shadowsEnabled = true;
        this.highQualityLighting = true;
        
        this.setupGameLighting();
    }
    
    setupGameLighting() {
        console.log('Setting up 3D lighting system...');
        
        // Clear existing lights
        this.clearLights();
        
        // Add ambient lighting for overall illumination
        this.addAmbientLight(this.ambientIntensity);
        
        // Add directional lights for depth and contrast
        this.addPrimaryDirectionalLight();
        this.addSecondaryDirectionalLight();
        this.addFillLight();
        
        // Add subtle rim lighting for better piece definition
        if (this.highQualityLighting) {
            this.addRimLighting();
        }
        
        console.log('Lighting system initialized');
    }
    
    clearLights() {
        // Remove all existing lights from scene
        Object.values(this.lights).forEach(light => {
            if (light.target) {
                this.scene.remove(light.target);
            }
            this.scene.remove(light);
        });
        this.lights = {};
    }
    
    addAmbientLight(intensity = 0.4) {
        const ambientLight = new THREE.AmbientLight(0x404040, intensity);
        this.lights.ambient = ambientLight;
        this.scene.add(ambientLight);
        
        console.log(`Added ambient light: intensity=${intensity}`);
        return ambientLight;
    }
    
    addPrimaryDirectionalLight() {
        // Main directional light from top-right
        const directionalLight = new THREE.DirectionalLight(0xffffff, this.directionalIntensity);
        directionalLight.position.set(10, 15, 5);
        directionalLight.target.position.set(0, 5, 0);
        
        // Configure shadows
        if (this.shadowsEnabled) {
            directionalLight.castShadow = true;
            directionalLight.shadow.mapSize.width = 2048;
            directionalLight.shadow.mapSize.height = 2048;
            directionalLight.shadow.camera.near = 0.1;
            directionalLight.shadow.camera.far = 50;
            directionalLight.shadow.camera.left = -15;
            directionalLight.shadow.camera.right = 15;
            directionalLight.shadow.camera.top = 15;
            directionalLight.shadow.camera.bottom = -15;
            directionalLight.shadow.bias = -0.0005;
        }
        
        this.lights.primary = directionalLight;
        this.scene.add(directionalLight);
        this.scene.add(directionalLight.target);
        
        console.log('Added primary directional light with shadows');
        return directionalLight;
    }
    
    addSecondaryDirectionalLight() {
        // Secondary light from left side for better piece visibility
        const directionalLight = new THREE.DirectionalLight(0x87ceeb, 0.3);
        directionalLight.position.set(-8, 10, 3);
        directionalLight.target.position.set(0, 5, 0);
        
        this.lights.secondary = directionalLight;
        this.scene.add(directionalLight);
        this.scene.add(directionalLight.target);
        
        console.log('Added secondary directional light');
        return directionalLight;
    }
    
    addFillLight() {
        // Fill light from behind to reduce harsh shadows
        const fillLight = new THREE.DirectionalLight(0x404080, 0.2);
        fillLight.position.set(0, 5, -10);
        fillLight.target.position.set(0, 5, 0);
        
        this.lights.fill = fillLight;
        this.scene.add(fillLight);
        this.scene.add(fillLight.target);
        
        console.log('Added fill light');
        return fillLight;
    }
    
    addRimLighting() {
        // Rim lights for better piece definition
        const rimLight1 = new THREE.DirectionalLight(0xffffff, 0.15);
        rimLight1.position.set(-5, 8, -8);
        rimLight1.target.position.set(0, 5, 0);
        
        const rimLight2 = new THREE.DirectionalLight(0xffffff, 0.15);
        rimLight2.position.set(5, 8, -8);
        rimLight2.target.position.set(0, 5, 0);
        
        this.lights.rim1 = rimLight1;
        this.lights.rim2 = rimLight2;
        
        this.scene.add(rimLight1);
        this.scene.add(rimLight1.target);
        this.scene.add(rimLight2);
        this.scene.add(rimLight2.target);
        
        console.log('Added rim lighting');
        return [rimLight1, rimLight2];
    }
    
    // Dynamic lighting effects
    addLineClearEffect(linePositions) {
        // Temporary bright light for line clear effect
        const effectLight = new THREE.PointLight(0xffffff, 2.0, 15);
        
        // Position light at center of cleared lines
        const centerY = linePositions.reduce((sum, y) => sum + y, 0) / linePositions.length;
        effectLight.position.set(0, centerY - 10, 2); // Adjust for world coordinates
        
        this.scene.add(effectLight);
        
        // Animate light intensity
        const startTime = performance.now();
        const duration = 500;
        
        const animate = () => {
            const elapsed = performance.now() - startTime;
            const progress = elapsed / duration;
            
            if (progress < 1) {
                // Fade out effect
                effectLight.intensity = 2.0 * (1 - progress);
                requestAnimationFrame(animate);
            } else {
                // Remove effect light
                this.scene.remove(effectLight);
            }
        };
        
        animate();
        console.log(`Added line clear lighting effect at lines: ${linePositions}`);
    }
    
    addTetrisEffect() {
        // Special dramatic lighting for Tetris clear
        const originalAmbient = this.lights.ambient.intensity;
        const originalPrimary = this.lights.primary.intensity;
        
        // Brighten all lights temporarily
        this.lights.ambient.intensity = originalAmbient * 1.5;
        this.lights.primary.intensity = originalPrimary * 1.3;
        
        // Add pulsing effect
        let pulse = 0;
        const pulseSpeed = 0.01;
        const startTime = performance.now();
        const effectDuration = 1000;
        
        const animate = () => {
            const elapsed = performance.now() - startTime;
            pulse += pulseSpeed;
            
            if (elapsed < effectDuration) {
                const pulseFactor = 1 + Math.sin(pulse) * 0.2;
                this.lights.primary.intensity = originalPrimary * 1.3 * pulseFactor;
                requestAnimationFrame(animate);
            } else {
                // Restore original lighting
                this.lights.ambient.intensity = originalAmbient;
                this.lights.primary.intensity = originalPrimary;
            }
        };
        
        animate();
        console.log('Added Tetris lighting effect');
    }
    
    addGameOverEffect() {
        // Dim all lights for game over
        const targetAmbient = this.lights.ambient.intensity * 0.3;
        const targetPrimary = this.lights.primary.intensity * 0.5;
        
        const originalAmbient = this.lights.ambient.intensity;
        const originalPrimary = this.lights.primary.intensity;
        
        const startTime = performance.now();
        const duration = 2000;
        
        const animate = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            this.lights.ambient.intensity = this.lerp(originalAmbient, targetAmbient, progress);
            this.lights.primary.intensity = this.lerp(originalPrimary, targetPrimary, progress);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
        console.log('Added game over lighting effect');
    }
    
    // Lighting quality settings
    setHighQuality(enabled) {
        this.highQualityLighting = enabled;
        
        if (enabled) {
            this.addRimLighting();
            this.enableShadows(true);
        } else {
            // Remove rim lighting
            if (this.lights.rim1) {
                this.scene.remove(this.lights.rim1);
                this.scene.remove(this.lights.rim1.target);
                delete this.lights.rim1;
            }
            if (this.lights.rim2) {
                this.scene.remove(this.lights.rim2);
                this.scene.remove(this.lights.rim2.target);
                delete this.lights.rim2;
            }
            
            this.enableShadows(false);
        }
        
        console.log(`High quality lighting: ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    enableShadows(enabled) {
        this.shadowsEnabled = enabled;
        
        Object.values(this.lights).forEach(light => {
            if (light.castShadow !== undefined) {
                light.castShadow = enabled;
            }
        });
        
        console.log(`Shadows: ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    // Adaptive lighting based on performance
    setPerformanceMode(mode) {
        switch (mode) {
            case 'high':
                this.setHighQuality(true);
                this.setIntensity(1.0);
                break;
                
            case 'medium':
                this.setHighQuality(false);
                this.enableShadows(true);
                this.setIntensity(0.9);
                break;
                
            case 'low':
                this.setHighQuality(false);
                this.enableShadows(false);
                this.setIntensity(0.8);
                break;
        }
        
        console.log(`Lighting performance mode: ${mode}`);
    }
    
    setIntensity(factor) {
        this.lightingIntensity = factor;
        
        if (this.lights.ambient) {
            this.lights.ambient.intensity = this.ambientIntensity * factor;
        }
        
        if (this.lights.primary) {
            this.lights.primary.intensity = this.directionalIntensity * factor;
        }
        
        if (this.lights.secondary) {
            this.lights.secondary.intensity = 0.3 * factor;
        }
        
        if (this.lights.fill) {
            this.lights.fill.intensity = 0.2 * factor;
        }
        
        console.log(`Lighting intensity set to: ${factor}`);
    }
    
    // Time-based lighting (day/night cycle - for future enhancement)
    setTimeOfDay(hour) {
        // 0-24 hour format
        const normalizedHour = hour % 24;
        let colorTemperature, intensity;
        
        if (normalizedHour >= 6 && normalizedHour < 18) {
            // Daytime: cooler, brighter
            colorTemperature = 0xffffff;
            intensity = 1.0;
        } else {
            // Nighttime: warmer, dimmer
            colorTemperature = 0xffd4a3;
            intensity = 0.7;
        }
        
        if (this.lights.primary) {
            this.lights.primary.color.setHex(colorTemperature);
            this.lights.primary.intensity = this.directionalIntensity * intensity;
        }
        
        console.log(`Lighting adjusted for hour: ${hour}`);
    }
    
    // Helper functions
    lerp(start, end, factor) {
        return start + (end - start) * factor;
    }
    
    // Update lighting based on game state
    updateForGameState(gameState) {
        if (gameState.isGameOver) {
            this.addGameOverEffect();
        } else if (gameState.isPaused) {
            this.setIntensity(0.5);
        } else {
            this.setIntensity(1.0);
        }
    }
    
    // Get current lighting configuration
    getLightingConfig() {
        return {
            intensity: this.lightingIntensity,
            shadowsEnabled: this.shadowsEnabled,
            highQuality: this.highQualityLighting,
            ambientIntensity: this.ambientIntensity,
            directionalIntensity: this.directionalIntensity,
            lightCount: Object.keys(this.lights).length
        };
    }
    
    // Debug information
    debugLighting() {
        console.log('=== Lighting System Debug ===');
        console.log(`Total lights: ${Object.keys(this.lights).length}`);
        console.log(`Shadows enabled: ${this.shadowsEnabled}`);
        console.log(`High quality: ${this.highQualityLighting}`);
        console.log(`Overall intensity: ${this.lightingIntensity}`);
        
        Object.entries(this.lights).forEach(([name, light]) => {
            console.log(`${name}: ${light.constructor.name}, intensity: ${light.intensity || 'N/A'}`);
        });
        console.log('=============================');
    }
    
    // Clean up resources
    dispose() {
        this.clearLights();
        console.log('Lighting system disposed');
    }
}
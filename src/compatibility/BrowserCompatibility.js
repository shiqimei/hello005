class BrowserCompatibility {
    constructor() {
        this.capabilities = {};
        this.browserInfo = {};
        this.deviceInfo = {};
        this.warnings = [];
        this.fallbacksEnabled = [];
        
        this.detectBrowser();
        this.detectDevice();
        this.checkCapabilities();
    }
    
    static checkWebGLSupport() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            
            if (!gl) {
                return { supported: false, version: null, renderer: null };
            }
            
            const version = gl.getParameter(gl.VERSION);
            const renderer = gl.getParameter(gl.RENDERER);
            const vendor = gl.getParameter(gl.VENDOR);
            
            // Check for WebGL 2.0
            const gl2 = canvas.getContext('webgl2');
            
            return {
                supported: true,
                version: gl2 ? '2.0' : '1.0',
                renderer,
                vendor,
                maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
                maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
                maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS)
            };
        } catch (e) {
            return { supported: false, error: e.message };
        }
    }
    
    static checkES6Support() {
        try {
            // Test key ES6 features used in the game
            eval('class Test {}');
            eval('const arrow = () => {};');
            eval('let {destructuring} = {};');
            eval('`template literals`');
            
            return {
                supported: true,
                features: {
                    classes: true,
                    arrowFunctions: true,
                    destructuring: true,
                    templateLiterals: true,
                    const: true,
                    let: true
                }
            };
        } catch (e) {
            return {
                supported: false,
                error: e.message,
                features: {}
            };
        }
    }
    
    detectBrowser() {
        const ua = navigator.userAgent;
        const vendor = navigator.vendor || '';
        
        // Detect browser
        if (ua.includes('Chrome') && !ua.includes('Edg') && !ua.includes('OPR')) {
            this.browserInfo.name = 'Chrome';
            this.browserInfo.version = this.extractVersion(ua, /Chrome\/(\d+)/);
        } else if (ua.includes('Firefox')) {
            this.browserInfo.name = 'Firefox';
            this.browserInfo.version = this.extractVersion(ua, /Firefox\/(\d+)/);
        } else if (ua.includes('Safari') && vendor.includes('Apple')) {
            this.browserInfo.name = 'Safari';
            this.browserInfo.version = this.extractVersion(ua, /Version\/(\d+)/);
        } else if (ua.includes('Edg')) {
            this.browserInfo.name = 'Edge';
            this.browserInfo.version = this.extractVersion(ua, /Edg\/(\d+)/);
        } else if (ua.includes('OPR') || ua.includes('Opera')) {
            this.browserInfo.name = 'Opera';
            this.browserInfo.version = this.extractVersion(ua, /OPR\/(\d+)|Opera\/(\d+)/);
        } else {
            this.browserInfo.name = 'Unknown';
            this.browserInfo.version = 0;
        }
        
        this.browserInfo.userAgent = ua;
        this.browserInfo.vendor = vendor;
    }
    
    detectDevice() {
        const ua = navigator.userAgent;
        
        // Mobile detection
        this.deviceInfo.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
        this.deviceInfo.isTablet = /iPad|Android.*Tablet|Windows.*Touch/i.test(ua) && !this.deviceInfo.isMobile;
        this.deviceInfo.isDesktop = !this.deviceInfo.isMobile && !this.deviceInfo.isTablet;
        
        // OS detection
        if (ua.includes('Windows')) {
            this.deviceInfo.os = 'Windows';
        } else if (ua.includes('Mac OS X') || ua.includes('macOS')) {
            this.deviceInfo.os = 'macOS';
        } else if (ua.includes('Linux')) {
            this.deviceInfo.os = 'Linux';
        } else if (ua.includes('Android')) {
            this.deviceInfo.os = 'Android';
        } else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) {
            this.deviceInfo.os = 'iOS';
        } else {
            this.deviceInfo.os = 'Unknown';
        }
        
        // Hardware information
        this.deviceInfo.cores = navigator.hardwareConcurrency || 1;
        this.deviceInfo.memory = navigator.deviceMemory || null;
        this.deviceInfo.connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
        
        // Screen information
        this.deviceInfo.screen = {
            width: screen.width,
            height: screen.height,
            pixelRatio: window.devicePixelRatio || 1
        };
        
        // Touch support
        this.deviceInfo.touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
    
    checkCapabilities() {
        // WebGL support
        this.capabilities.webgl = BrowserCompatibility.checkWebGLSupport();
        
        // ES6 support
        this.capabilities.es6 = BrowserCompatibility.checkES6Support();
        
        // Canvas support
        this.capabilities.canvas = !!document.createElement('canvas').getContext;
        
        // Audio support
        this.capabilities.audio = {
            webAudio: !!(window.AudioContext || window.webkitAudioContext),
            htmlAudio: !!new Audio()
        };
        
        // Local storage
        this.capabilities.localStorage = (() => {
            try {
                const test = 'test';
                localStorage.setItem(test, test);
                localStorage.removeItem(test);
                return true;
            } catch (e) {
                return false;
            }
        })();
        
        // RequestAnimationFrame
        this.capabilities.raf = !!(window.requestAnimationFrame || 
                                    window.webkitRequestAnimationFrame || 
                                    window.mozRequestAnimationFrame);
        
        // Performance API
        this.capabilities.performance = !!(window.performance && window.performance.now);
        
        // Pointer events
        this.capabilities.pointerEvents = !!window.PointerEvent;
        
        // Gamepad API
        this.capabilities.gamepad = !!navigator.getGamepads;
        
        // Fullscreen API
        this.capabilities.fullscreen = !!(document.documentElement.requestFullscreen ||
                                          document.documentElement.webkitRequestFullscreen ||
                                          document.documentElement.mozRequestFullScreen);
        
        // Web Workers
        this.capabilities.webWorkers = !!window.Worker;
        
        // Check minimum requirements
        this.checkMinimumRequirements();
    }
    
    checkMinimumRequirements() {
        const requirements = {
            webgl: this.capabilities.webgl.supported,
            es6: this.capabilities.es6.supported,
            canvas: this.capabilities.canvas,
            raf: this.capabilities.raf
        };
        
        const browserVersionRequirements = {
            'Chrome': 80,
            'Firefox': 75,
            'Safari': 13,
            'Edge': 80
        };
        
        const minVersion = browserVersionRequirements[this.browserInfo.name];
        const versionOk = !minVersion || this.browserInfo.version >= minVersion;
        
        this.capabilities.meetsMinimumRequirements = Object.values(requirements).every(req => req) && versionOk;
        
        // Generate warnings for missing capabilities
        if (!this.capabilities.meetsMinimumRequirements) {
            Object.entries(requirements).forEach(([feature, supported]) => {
                if (!supported) {
                    this.warnings.push({
                        type: 'capability',
                        feature,
                        message: `${feature} is not supported`,
                        severity: 'high'
                    });
                }
            });
            
            if (!versionOk) {
                this.warnings.push({
                    type: 'version',
                    message: `${this.browserInfo.name} version ${this.browserInfo.version} may not be fully supported (minimum: ${minVersion})`,
                    severity: 'medium'
                });
            }
        }
    }
    
    static provideFallback() {
        const compatibility = new BrowserCompatibility();
        
        if (!compatibility.capabilities.meetsMinimumRequirements) {
            // Show compatibility warning
            const warningDiv = document.createElement('div');
            warningDiv.id = 'compatibility-warning';
            warningDiv.innerHTML = `
                <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); color: white; display: flex; align-items: center; justify-content: center; z-index: 10000;">
                    <div style="text-align: center; padding: 20px; max-width: 500px;">
                        <h2>Compatibility Issue</h2>
                        <p>Your browser may not support all features required for Tetris 3D.</p>
                        <ul style="text-align: left; margin: 20px 0;">
                            ${compatibility.warnings.map(warning => 
                                `<li>${warning.message}</li>`
                            ).join('')}
                        </ul>
                        <p>For the best experience, please use:</p>
                        <ul style="text-align: left;">
                            <li>Chrome 80+ or Firefox 75+ or Safari 13+ or Edge 80+</li>
                            <li>A device with WebGL support</li>
                        </ul>
                        <button onclick="this.parentElement.parentElement.remove()" style="margin-top: 20px; padding: 10px 20px; background: #007cba; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            Continue Anyway
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(warningDiv);
        }
        
        return compatibility;
    }
    
    // Performance tier detection
    getPerformanceTier() {
        let score = 0;
        
        // Browser performance scores
        const browserScores = {
            'Chrome': 3,
            'Edge': 3,
            'Firefox': 2,
            'Safari': 2,
            'Opera': 2
        };
        
        score += browserScores[this.browserInfo.name] || 1;
        
        // Device type scores
        if (this.deviceInfo.isDesktop) score += 2;
        else if (this.deviceInfo.isTablet) score += 1;
        // Mobile gets 0
        
        // Hardware scores
        if (this.deviceInfo.cores >= 8) score += 2;
        else if (this.deviceInfo.cores >= 4) score += 1;
        
        if (this.deviceInfo.memory >= 8) score += 2;
        else if (this.deviceInfo.memory >= 4) score += 1;
        
        // WebGL capability scores
        if (this.capabilities.webgl.supported) {
            if (this.capabilities.webgl.version === '2.0') score += 2;
            else score += 1;
            
            if (this.capabilities.webgl.maxTextureSize >= 4096) score += 1;
        }
        
        // Determine tier
        if (score >= 8) return 'high';
        if (score >= 5) return 'medium';
        return 'low';
    }
    
    // Get recommended settings based on capabilities
    getRecommendedSettings() {
        const tier = this.getPerformanceTier();
        
        const settings = {
            high: {
                targetFPS: 60,
                shadowsEnabled: true,
                highQualityLighting: true,
                cameraRotationEnabled: true,
                maxParticles: 100,
                renderScale: 1.0
            },
            medium: {
                targetFPS: 45,
                shadowsEnabled: true,
                highQualityLighting: false,
                cameraRotationEnabled: true,
                maxParticles: 50,
                renderScale: 0.8
            },
            low: {
                targetFPS: 30,
                shadowsEnabled: false,
                highQualityLighting: false,
                cameraRotationEnabled: false,
                maxParticles: 20,
                renderScale: 0.6
            }
        };
        
        return {
            tier,
            settings: settings[tier],
            warnings: this.warnings
        };
    }
    
    // Utility methods
    extractVersion(userAgent, regex) {
        const match = userAgent.match(regex);
        return match ? parseInt(match[1] || match[2]) : 0;
    }
    
    isMobileDevice() {
        return this.deviceInfo.isMobile;
    }
    
    isTabletDevice() {
        return this.deviceInfo.isTablet;
    }
    
    isDesktopDevice() {
        return this.deviceInfo.isDesktop;
    }
    
    hasWebGLSupport() {
        return this.capabilities.webgl.supported;
    }
    
    hasES6Support() {
        return this.capabilities.es6.supported;
    }
    
    // Feature detection helpers
    supportsTouch() {
        return this.deviceInfo.touchSupport;
    }
    
    supportsGamepad() {
        return this.capabilities.gamepad;
    }
    
    supportsFullscreen() {
        return this.capabilities.fullscreen;
    }
    
    // Debug information
    getDebugInfo() {
        return {
            browser: this.browserInfo,
            device: this.deviceInfo,
            capabilities: this.capabilities,
            warnings: this.warnings,
            performanceTier: this.getPerformanceTier(),
            recommendedSettings: this.getRecommendedSettings()
        };
    }
    
    printDebugInfo() {
        console.group('Browser Compatibility Debug Info');
        
        console.log('Browser:', `${this.browserInfo.name} ${this.browserInfo.version}`);
        console.log('OS:', this.deviceInfo.os);
        console.log('Device Type:', this.deviceInfo.isMobile ? 'Mobile' : this.deviceInfo.isTablet ? 'Tablet' : 'Desktop');
        console.log('WebGL Support:', this.capabilities.webgl.supported ? `Yes (${this.capabilities.webgl.version})` : 'No');
        console.log('ES6 Support:', this.capabilities.es6.supported ? 'Yes' : 'No');
        console.log('Performance Tier:', this.getPerformanceTier());
        
        if (this.warnings.length > 0) {
            console.log('Warnings:');
            this.warnings.forEach(warning => {
                console.warn(`  - ${warning.message}`);
            });
        }
        
        const recommended = this.getRecommendedSettings();
        console.log('Recommended Settings:', recommended.settings);
        
        console.groupEnd();
    }
}
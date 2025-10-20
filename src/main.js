// Tetris 3D MVP - Main Application Entry Point

class TetrisGame {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.gameBoard = null;
        this.gameEngine = null;
        this.uiManager = null;
        this.scoringSystem = null;
        this.cameraController = null;
        this.lightingSystem = null;
        this.performanceMonitor = null;
        this.browserCompatibility = null;
        
        this.isInitialized = false;
        this.gameContainer = null;
        this.canvas = null;
    }
    
    async initialize() {
        console.log('Initializing Tetris 3D MVP...');
        
        try {
            // Check browser compatibility first
            this.checkCompatibility();
            
            // Initialize performance monitoring
            this.initializePerformanceMonitoring();
            
            // Set up Three.js renderer
            await this.initializeRenderer();
            
            // Initialize game systems
            this.initializeGameSystems();
            
            // Set up UI
            this.initializeUI();
            
            // Connect event handlers
            this.connectEventHandlers();
            
            // Apply performance optimizations
            this.applyPerformanceOptimizations();
            
            this.isInitialized = true;
            console.log('Tetris 3D initialized successfully');
            
            // Show start screen
            this.uiManager.setState('start');
            
        } catch (error) {
            console.error('Failed to initialize Tetris 3D:', error);
            this.handleInitializationError(error);
        }
    }
    
    checkCompatibility() {
        console.log('Checking browser compatibility...');
        
        this.browserCompatibility = BrowserCompatibility.provideFallback();
        
        if (!this.browserCompatibility.hasWebGLSupport()) {
            throw new Error('WebGL is not supported by your browser');
        }
        
        if (!this.browserCompatibility.hasES6Support()) {
            throw new Error('Your browser does not support modern JavaScript features');
        }
        
        // Print debug info in development
        this.browserCompatibility.printDebugInfo();
    }
    
    initializePerformanceMonitoring() {
        console.log('Setting up performance monitoring...');
        
        this.performanceMonitor = new PerformanceMonitor();
        
        // Get recommended settings based on device capabilities
        const recommendations = this.browserCompatibility.getRecommendedSettings();
        
        // Set performance targets
        this.performanceMonitor.setTargets(30, recommendations.settings.targetFPS);
        
        // Handle performance changes
        this.performanceMonitor.on('performanceChange', (data) => {
            console.log(`Performance level changed to: ${data.level} (${data.fps} FPS)`);
            this.handlePerformanceChange(data.level);
        });
        
        this.performanceMonitor.on('qualitySuggestions', (data) => {
            console.log('Performance suggestions:', data.suggestions);
            this.applyQualitySuggestions(data.suggestions);
        });
        
        this.performanceMonitor.startMonitoring();
    }
    
    async initializeRenderer() {
        console.log('Setting up Three.js renderer...');
        
        // Get game container
        this.gameContainer = document.getElementById('game-container');
        this.canvas = document.getElementById('game-canvas');
        
        if (!this.gameContainer || !this.canvas) {
            throw new Error('Required DOM elements not found');
        }
        
        // Create Three.js scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a1a);
        
        // Set up camera
        const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
        this.camera = new THREE.OrthographicCamera(
            -aspect * 12, aspect * 12,
            12, -12,
            0.1, 100
        );
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
        
        console.log('Three.js renderer initialized');
    }
    
    initializeGameSystems() {
        console.log('Initializing game systems...');
        
        // Initialize camera controller
        this.cameraController = new CameraController(this.camera, this.scene);
        this.cameraController.setOptimalPosition();
        
        // Initialize lighting system
        this.lightingSystem = new LightingSystem(this.scene);
        
        // Initialize game board
        this.gameBoard = new GameBoard(10, 20, 1);
        this.gameBoard.render(this.scene);
        
        // Initialize scoring system
        this.scoringSystem = new ScoringSystem();
        
        // Initialize game engine
        this.gameEngine = new GameEngine(this.gameBoard, this, null); // UI manager will be set later
        
        console.log('Game systems initialized');
    }
    
    initializeUI() {
        console.log('Initializing UI system...');
        
        this.uiManager = new UIManager(document.getElementById('app'));
        
        // Connect UI manager to game engine
        this.gameEngine.uiManager = this.uiManager;
        
        console.log('UI system initialized');
    }
    
    connectEventHandlers() {
        console.log('Connecting event handlers...');
        
        // UI events
        this.uiManager.on('startGame', () => this.startGame());
        this.uiManager.on('restartGame', () => this.restartGame());
        
        // Game engine events
        this.gameEngine.on('gameStarted', () => {
            this.uiManager.setState('playing');
        });
        
        this.gameEngine.on('gameOver', (stats) => {
            this.handleGameOver(stats);
        });
        
        this.gameEngine.on('pauseToggled', (isPaused) => {
            this.uiManager.setState(isPaused ? 'paused' : 'playing');
        });
        
        this.gameEngine.on('linesCleared', (data) => {
            this.handleLinesCleared(data);
        });
        
        // Scoring system events
        this.scoringSystem.on('scoreChanged', (data) => {
            this.uiManager.updateGameInfo(data);
        });
        
        this.scoringSystem.on('levelUp', (data) => {
            this.handleLevelUp(data);
        });
        
        console.log('Event handlers connected');
    }
    
    applyPerformanceOptimizations() {
        const recommendations = this.browserCompatibility.getRecommendedSettings();
        const settings = recommendations.settings;
        
        console.log(`Applying ${recommendations.tier} performance settings...`);
        
        // Configure lighting based on performance tier
        this.lightingSystem.setPerformanceMode(recommendations.tier);
        
        // Configure camera
        if (settings.cameraRotationEnabled) {
            this.cameraController.enableRotation();
        } else {
            this.cameraController.disableRotation();
        }
        
        // Configure renderer
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, settings.renderScale * 2));
        
        console.log('Performance optimizations applied');
    }
    
    handlePerformanceChange(level) {
        // Adjust quality settings based on performance
        switch (level) {
            case 'low':
                this.lightingSystem.setPerformanceMode('low');
                this.cameraController.setLowPerformanceMode(true);
                this.renderer.setPixelRatio(1);
                break;
                
            case 'medium':
                this.lightingSystem.setPerformanceMode('medium');
                this.cameraController.setLowPerformanceMode(false);
                this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
                break;
                
            case 'high':
                this.lightingSystem.setPerformanceMode('high');
                this.cameraController.setLowPerformanceMode(false);
                this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                break;
        }
    }
    
    applyQualitySuggestions(suggestions) {
        suggestions.forEach(suggestion => {
            switch (suggestion) {
                case 'Disable shadows':
                    this.lightingSystem.enableShadows(false);
                    break;
                    
                case 'Reduce lighting quality':
                    this.lightingSystem.setHighQuality(false);
                    break;
                    
                case 'Disable camera rotation':
                    this.cameraController.disableRotation();
                    break;
                    
                case 'Lower render resolution':
                    this.renderer.setPixelRatio(1);
                    break;
            }
        });
    }
    
    startGame() {
        console.log('Starting new game...');
        
        if (!this.isInitialized) {
            console.error('Game not initialized');
            return;
        }
        
        // Reset systems
        this.scoringSystem.reset();
        this.gameEngine.startGame();
        
        console.log('Game started');
    }
    
    restartGame() {
        console.log('Restarting game...');
        
        // Reset and start new game
        this.gameEngine.resetGame();
        this.startGame();
    }
    
    handleGameOver(stats) {
        console.log('Game over:', stats);
        
        // Stop performance monitoring for final report
        const performanceReport = this.performanceMonitor.getReport();
        console.log('Final performance report:', performanceReport);
        
        // Show game over screen
        this.uiManager.showGameOver(this.scoringSystem.getScore(), {
            ...stats,
            ...this.scoringSystem.getStatistics()
        });
        
        // Camera effect
        this.cameraController.onGameOver();
        
        // Lighting effect
        this.lightingSystem.addGameOverEffect();
    }
    
    handleLinesCleared(data) {
        console.log(`Lines cleared: ${data.lines}`);
        
        // Update scoring
        const points = this.scoringSystem.addLines(data.lines);
        
        // Visual effects
        this.lightingSystem.addLineClearEffect(data.clearedRows);
        this.cameraController.onLineClear(data.clearedRows);
        
        // Special effect for Tetris
        if (data.lines === 4) {
            this.lightingSystem.addTetrisEffect();
            this.cameraController.onTetris();
        }
        
        // UI animation
        this.uiManager.showLinesClearedAnimation(data.lines, data.lines === 4 ? 'tetris' : 'normal');
    }
    
    handleLevelUp(data) {
        console.log(`Level up! New level: ${data.newLevel}`);
        
        // Update game engine fall speed
        this.gameEngine.setFallSpeed(data.fallSpeed);
        
        // Camera effect
        this.cameraController.onLevelUp(data.newLevel);
    }
    
    handleResize() {
        if (!this.renderer || !this.camera) return;
        
        const canvas = this.renderer.domElement;
        const container = canvas.parentElement;
        
        if (!container) return;
        
        // Update canvas size
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        this.renderer.setSize(width, height);
        
        // Update camera
        const aspect = width / height;
        this.camera.left = -aspect * 12;
        this.camera.right = aspect * 12;
        this.camera.updateProjectionMatrix();
        
        // Update UI
        this.uiManager.handleResize();
    }
    
    handleInitializationError(error) {
        console.error('Initialization error:', error);
        
        const errorMessage = this.getErrorMessage(error);
        
        // Show error screen
        if (this.uiManager) {
            this.uiManager.showError(errorMessage);
        } else {
            // Fallback error display
            document.body.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: #1a1a2e; color: white; font-family: Arial, sans-serif;">
                    <div style="text-align: center; max-width: 500px; padding: 20px;">
                        <h1>Unable to Start Tetris 3D</h1>
                        <p>${errorMessage}</p>
                        <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #007cba; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            Reload Page
                        </button>
                    </div>
                </div>
            `;
        }
    }
    
    getErrorMessage(error) {
        if (error.message.includes('WebGL')) {
            return 'Your browser or device does not support WebGL, which is required for 3D graphics. Please try a different browser or device.';
        }
        
        if (error.message.includes('ES6') || error.message.includes('JavaScript')) {
            return 'Your browser does not support modern JavaScript features. Please update your browser or try a different one.';
        }
        
        return `An error occurred while starting the game: ${error.message}`;
    }
    
    // Main game loop (called by game engine)
    render() {
        if (!this.renderer || !this.scene || !this.camera) return;
        
        // Update camera controller
        if (this.cameraController) {
            this.cameraController.update(16.67); // Assume ~60fps
        }
        
        // Track performance
        if (this.performanceMonitor) {
            this.performanceMonitor.trackFrameRate();
        }
        
        // Render the scene
        this.renderer.render(this.scene, this.camera);
    }
    
    // Cleanup
    dispose() {
        console.log('Disposing Tetris 3D resources...');
        
        // Stop performance monitoring
        if (this.performanceMonitor) {
            this.performanceMonitor.stopMonitoring();
        }
        
        // Clean up UI
        if (this.uiManager) {
            this.uiManager.dispose();
        }
        
        // Clean up game engine
        if (this.gameEngine) {
            this.gameEngine.resetGame();
        }
        
        // Clean up Three.js resources
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        // Clean up lighting
        if (this.lightingSystem) {
            this.lightingSystem.dispose();
        }
        
        console.log('Cleanup complete');
    }
}

// Application initialization
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, initializing Tetris 3D...');
    
    // Create and initialize the game
    const game = new TetrisGame();
    
    try {
        await game.initialize();
    } catch (error) {
        console.error('Failed to initialize game:', error);
    }
    
    // Handle page unload
    window.addEventListener('beforeunload', () => {
        game.dispose();
    });
    
    // Make game instance available globally for debugging
    if (typeof window !== 'undefined') {
        window.tetrisGame = game;
    }
});

// Handle uncaught errors
window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

console.log('Tetris 3D MVP script loaded');
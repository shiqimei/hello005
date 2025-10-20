class UIManager {
    constructor(domContainer) {
        this.container = domContainer;
        this.currentState = 'loading';
        
        // UI elements
        this.elements = {
            startScreen: document.getElementById('start-screen'),
            gameOverScreen: document.getElementById('game-over-screen'),
            loadingScreen: document.getElementById('loading-screen'),
            uiContainer: document.getElementById('ui-container'),
            
            // Game info elements
            scoreElement: document.getElementById('score'),
            levelElement: document.getElementById('level'),
            linesElement: document.getElementById('lines'),
            
            // Next piece
            nextPieceCanvas: document.getElementById('next-piece-canvas'),
            
            // Buttons
            startButton: document.getElementById('start-button'),
            restartButton: document.getElementById('restart-button'),
            
            // Final score
            finalScoreElement: document.getElementById('final-score')
        };
        
        // Next piece preview setup
        this.nextPieceRenderer = null;
        this.nextPieceScene = null;
        this.nextPieceCamera = null;
        this.currentNextPiece = null;
        
        // Event callbacks
        this.callbacks = {};
        
        // Accessibility support
        this.highContrastMode = false;
        this.screenReaderMode = this.detectScreenReader();
        
        this.initializeNextPiecePreview();
        this.bindEventHandlers();
        this.setupAccessibility();
    }
    
    initializeNextPiecePreview() {
        if (!this.elements.nextPieceCanvas) {
            console.warn('Next piece canvas not found');
            return;
        }
        
        // Set up Three.js scene for next piece preview
        const canvas = this.elements.nextPieceCanvas;
        this.nextPieceScene = new THREE.Scene();
        
        // Camera setup
        this.nextPieceCamera = new THREE.OrthographicCamera(-3, 3, 3, -3, 0.1, 100);
        this.nextPieceCamera.position.set(0, 0, 10);
        this.nextPieceCamera.lookAt(0, 0, 0);
        
        // Renderer setup
        this.nextPieceRenderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: true
        });
        this.nextPieceRenderer.setSize(120, 120);
        this.nextPieceRenderer.setClearColor(0x000000, 0);
        
        // Lighting for preview
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.nextPieceScene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(2, 2, 5);
        this.nextPieceScene.add(directionalLight);
        
        // Start rendering loop for preview
        this.renderNextPiecePreview();
    }
    
    renderNextPiecePreview() {
        if (this.nextPieceRenderer && this.nextPieceScene && this.nextPieceCamera) {
            this.nextPieceRenderer.render(this.nextPieceScene, this.nextPieceCamera);
        }
        requestAnimationFrame(() => this.renderNextPiecePreview());
    }
    
    bindEventHandlers() {
        // Start button
        if (this.elements.startButton) {
            this.elements.startButton.addEventListener('click', () => {
                this.emit('startGame');
            });
        }
        
        // Restart button
        if (this.elements.restartButton) {
            this.elements.restartButton.addEventListener('click', () => {
                this.emit('restartGame');
            });
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            if (event.code === 'Enter' || event.code === 'Space') {
                if (this.currentState === 'start') {
                    event.preventDefault();
                    this.emit('startGame');
                } else if (this.currentState === 'gameOver') {
                    event.preventDefault();
                    this.emit('restartGame');
                }
            }
            
            // Accessibility shortcuts
            if (event.code === 'KeyH' && event.ctrlKey) {
                event.preventDefault();
                this.toggleHighContrast();
            }
        });
        
        // Window resize handling
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }
    
    setupAccessibility() {
        // Add ARIA labels and roles
        if (this.elements.startScreen) {
            this.elements.startScreen.setAttribute('role', 'dialog');
            this.elements.startScreen.setAttribute('aria-label', 'Game start screen');
        }
        
        if (this.elements.gameOverScreen) {
            this.elements.gameOverScreen.setAttribute('role', 'dialog');
            this.elements.gameOverScreen.setAttribute('aria-label', 'Game over screen');
        }
        
        // Add keyboard navigation hints
        const controlsInfo = document.getElementById('controls-info');
        if (controlsInfo) {
            const accessibilityHint = document.createElement('div');
            accessibilityHint.className = 'control-item';
            accessibilityHint.textContent = 'Ctrl+H High Contrast';
            controlsInfo.appendChild(accessibilityHint);
        }
    }
    
    detectScreenReader() {
        return window.navigator.userAgent.includes('NVDA') || 
               window.navigator.userAgent.includes('JAWS') ||
               window.speechSynthesis;
    }
    
    setState(newState) {
        console.log(`UI State change: ${this.currentState} -> ${newState}`);
        
        // Hide all screens
        this.hideAllScreens();
        
        // Show appropriate screen
        switch (newState) {
            case 'loading':
                this.showElement(this.elements.loadingScreen);
                break;
            case 'start':
                this.showElement(this.elements.startScreen);
                this.announceToScreenReader('Welcome to Tetris 3D. Press Enter or click Start Game to begin.');
                break;
            case 'playing':
                this.showElement(this.elements.uiContainer);
                this.announceToScreenReader('Game started. Use arrow keys to control pieces.');
                break;
            case 'paused':
                this.showElement(this.elements.uiContainer);
                this.showPauseOverlay();
                this.announceToScreenReader('Game paused. Press P or Escape to resume.');
                break;
            case 'gameOver':
                this.showElement(this.elements.gameOverScreen);
                this.announceToScreenReader(`Game over. Final score: ${this.elements.finalScoreElement?.textContent || 0}. Press Enter or click Play Again to restart.`);
                break;
        }
        
        this.currentState = newState;
        this.emit('stateChanged', newState);
    }
    
    hideAllScreens() {
        Object.values(this.elements).forEach(element => {
            if (element && element.classList) {
                element.classList.add('hidden');
            }
        });
    }
    
    showElement(element) {
        if (element && element.classList) {
            element.classList.remove('hidden');
        }
    }
    
    updateScore(score) {
        if (this.elements.scoreElement) {
            this.elements.scoreElement.textContent = score.toLocaleString();
        }
    }
    
    updateLevel(level) {
        if (this.elements.levelElement) {
            this.elements.levelElement.textContent = level.toString();
        }
    }
    
    updateLines(lines) {
        if (this.elements.linesElement) {
            this.elements.linesElement.textContent = lines.toString();
        }
    }
    
    updateGameInfo(gameData) {
        this.updateScore(gameData.score || 0);
        this.updateLevel(gameData.level || 1);
        this.updateLines(gameData.lines || 0);
        
        // Announce score updates to screen reader (throttled)
        if (this.screenReaderMode) {
            this.throttleScreenReaderUpdate(gameData);
        }
    }
    
    throttleScreenReaderUpdate(gameData) {
        if (!this.lastAnnouncement || Date.now() - this.lastAnnouncement > 5000) {
            this.announceToScreenReader(`Score: ${gameData.score}, Level: ${gameData.level}, Lines: ${gameData.lines}`);
            this.lastAnnouncement = Date.now();
        }
    }
    
    showNextPiece(piece) {
        if (!piece || !this.nextPieceScene) {
            return;
        }
        
        // Remove previous piece
        if (this.currentNextPiece) {
            this.currentNextPiece.removeFromScene(this.nextPieceScene);
            this.currentNextPiece.dispose();
        }
        
        // Create preview piece
        this.currentNextPiece = new TetrominoPiece(piece.type, 0, 0, 0);
        this.currentNextPiece.render(this.nextPieceScene);
        
        // Center the piece in preview
        const bounds = this.currentNextPiece.getBoundingBox();
        const centerX = -(bounds.left + bounds.right) / 2;
        const centerY = -(bounds.top + bounds.bottom) / 2;
        this.currentNextPiece.setPosition(centerX, centerY, 0);
        
        // Announce to screen reader
        if (this.screenReaderMode) {
            this.announceToScreenReader(`Next piece: ${piece.getTypeName()}`);
        }
    }
    
    showGameOver(finalScore, gameStats) {
        if (this.elements.finalScoreElement) {
            this.elements.finalScoreElement.textContent = finalScore.toLocaleString();
        }
        
        // Add additional game statistics if needed
        this.displayGameStats(gameStats);
        
        this.setState('gameOver');
    }
    
    displayGameStats(stats) {
        if (!stats) return;
        
        // Create or update stats display
        let statsContainer = document.getElementById('game-stats');
        if (!statsContainer) {
            statsContainer = document.createElement('div');
            statsContainer.id = 'game-stats';
            statsContainer.className = 'game-stats';
            this.elements.gameOverScreen.insertBefore(statsContainer, this.elements.restartButton);
        }
        
        statsContainer.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Lines Cleared:</span>
                <span class="stat-value">${stats.totalLinesCleared || 0}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Max Level:</span>
                <span class="stat-value">${stats.level || 1}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Pieces Placed:</span>
                <span class="stat-value">${stats.totalPiecesPlaced || 0}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Max Combo:</span>
                <span class="stat-value">${stats.maxCombo || 0}</span>
            </div>
        `;
    }
    
    showPauseOverlay() {
        let pauseOverlay = document.getElementById('pause-overlay');
        if (!pauseOverlay) {
            pauseOverlay = document.createElement('div');
            pauseOverlay.id = 'pause-overlay';
            pauseOverlay.className = 'screen';
            pauseOverlay.innerHTML = `
                <h2>Game Paused</h2>
                <p>Press P or Escape to resume</p>
            `;
            document.body.appendChild(pauseOverlay);
        }
        
        this.showElement(pauseOverlay);
    }
    
    hidePauseOverlay() {
        const pauseOverlay = document.getElementById('pause-overlay');
        if (pauseOverlay) {
            pauseOverlay.classList.add('hidden');
        }
    }
    
    toggleHighContrast() {
        this.highContrastMode = !this.highContrastMode;
        
        if (this.highContrastMode) {
            document.body.classList.add('high-contrast');
            this.announceToScreenReader('High contrast mode enabled');
        } else {
            document.body.classList.remove('high-contrast');
            this.announceToScreenReader('High contrast mode disabled');
        }
        
        this.emit('accessibilityChanged', { highContrast: this.highContrastMode });
    }
    
    announceToScreenReader(message) {
        if (this.screenReaderMode && window.speechSynthesis) {
            // Cancel previous announcements
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(message);
            utterance.rate = 1.2;
            utterance.volume = 0.8;
            window.speechSynthesis.speak(utterance);
        }
    }
    
    showLinesClearedAnimation(linesCount, type) {
        const animationContainer = document.getElementById('game-container');
        if (!animationContainer) return;
        
        const animation = document.createElement('div');
        animation.className = 'lines-cleared-animation';
        animation.innerHTML = `
            <div class="animation-text">
                ${this.getLineClearText(linesCount, type)}
                <span class="points">+${this.calculateDisplayPoints(linesCount)}</span>
            </div>
        `;
        
        animationContainer.appendChild(animation);
        
        // Remove animation after delay
        setTimeout(() => {
            if (animation.parentNode) {
                animation.parentNode.removeChild(animation);
            }
        }, 2000);
    }
    
    getLineClearText(linesCount, type) {
        switch (linesCount) {
            case 1: return 'Single!';
            case 2: return 'Double!';
            case 3: return 'Triple!';
            case 4: return 'TETRIS!';
            default: return `${linesCount} Lines!`;
        }
    }
    
    calculateDisplayPoints(linesCount) {
        // This should ideally come from the scoring system
        const basePoints = {1: 100, 2: 300, 3: 500, 4: 800};
        return (basePoints[linesCount] || 0) * (this.currentLevel || 1);
    }
    
    handleResize() {
        // Adjust UI elements for different screen sizes
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            document.body.classList.add('mobile');
        } else {
            document.body.classList.remove('mobile');
        }
        
        // Resize next piece canvas if needed
        if (this.nextPieceRenderer) {
            const canvas = this.elements.nextPieceCanvas;
            if (canvas) {
                const size = isMobile ? 80 : 120;
                canvas.style.width = size + 'px';
                canvas.style.height = size + 'px';
                this.nextPieceRenderer.setSize(size, size);
            }
        }
    }
    
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <div class="error-content">
                <h3>Error</h3>
                <p>${message}</p>
                <button onclick="location.reload()">Reload Game</button>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
        
        this.announceToScreenReader(`Error: ${message}`);
    }
    
    // Event system
    on(event, callback) {
        if (!this.callbacks[event]) {
            this.callbacks[event] = [];
        }
        this.callbacks[event].push(callback);
    }
    
    emit(event, data) {
        if (this.callbacks[event]) {
            this.callbacks[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in UI event listener for ${event}:`, error);
                }
            });
        }
    }
    
    // Cleanup
    dispose() {
        // Clean up next piece preview
        if (this.currentNextPiece) {
            this.currentNextPiece.dispose();
        }
        
        if (this.nextPieceRenderer) {
            this.nextPieceRenderer.dispose();
        }
        
        // Remove event listeners
        this.callbacks = {};
        
        // Cancel any pending speech synthesis
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    }
    
    // Getters
    getCurrentState() {
        return this.currentState;
    }
    
    isHighContrastMode() {
        return this.highContrastMode;
    }
    
    isScreenReaderMode() {
        return this.screenReaderMode;
    }
}
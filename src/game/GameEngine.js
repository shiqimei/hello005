class GameEngine {
    constructor(gameBoard, renderer, uiManager) {
        this.gameBoard = gameBoard;
        this.renderer = renderer;
        this.uiManager = uiManager;
        
        // Game state
        this.isRunning = false;
        this.isPaused = false;
        this.isGameOver = false;
        this.currentPiece = null;
        this.nextPiece = null;
        this.ghostPiece = null;
        
        // Timing
        this.lastFrameTime = 0;
        this.lastFallTime = 0;
        this.fallSpeed = 1000; // Initial fall speed in ms
        this.targetFPS = 60;
        this.fixedTimeStep = 1000 / this.targetFPS;
        
        // Input handling
        this.inputBuffer = [];
        this.lastInputTime = 0;
        this.inputDelay = 100; // Anti-spam delay
        
        // Game statistics
        this.gameStats = {
            startTime: 0,
            totalLinesCleared: 0,
            totalPiecesPlaced: 0,
            maxCombo: 0,
            currentCombo: 0
        };
        
        // Placed pieces for 3D rendering
        this.placedBlocks = new THREE.Group();
        this.placedBlockMeshes = [];
        
        // Event system
        this.eventListeners = {};
        
        this.setupInputHandling();
        this.initializePlacedBlocks();
    }
    
    setupInputHandling() {
        this.inputMap = {
            'ArrowLeft': () => this.movePiece(-1, 0),
            'ArrowRight': () => this.movePiece(1, 0),
            'ArrowDown': () => this.movePiece(0, 1),
            'ArrowUp': () => this.rotatePiece(),
            'Space': () => this.hardDrop(),
            'KeyP': () => this.togglePause(),
            'Escape': () => this.togglePause()
        };
        
        document.addEventListener('keydown', (event) => {
            if (this.isRunning && !this.isPaused && this.inputMap[event.code]) {
                event.preventDefault();
                this.handleInput(event.code);
            }
        });
    }
    
    handleInput(keyCode) {
        const currentTime = performance.now();
        
        // Prevent input spam
        if (currentTime - this.lastInputTime < this.inputDelay) {
            return;
        }
        
        const action = this.inputMap[keyCode];
        if (action) {
            action();
            this.lastInputTime = currentTime;
        }
    }
    
    initializePlacedBlocks() {
        if (this.renderer && this.renderer.scene) {
            this.renderer.scene.add(this.placedBlocks);
        }
    }
    
    startGame() {
        console.log('Starting Tetris 3D game...');
        
        // Initialize game state
        this.isRunning = true;
        this.isPaused = false;
        this.isGameOver = false;
        this.gameStats.startTime = performance.now();
        
        // Reset game board
        this.gameBoard.reset();
        this.clearPlacedBlocks();
        
        // Generate first pieces
        this.nextPiece = TetrominoPiece.createRandomPiece();
        this.spawnNewPiece();
        
        // Start game loop
        requestAnimationFrame(this.gameLoop.bind(this));
        
        // Emit event
        this.emit('gameStarted');
        
        console.log('Game started successfully');
    }
    
    gameLoop(currentTime) {
        if (!this.isRunning) {
            return;
        }
        
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        
        if (!this.isPaused && !this.isGameOver) {
            this.update(deltaTime);
        }
        
        this.render();
        
        // Continue loop
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    update(deltaTime) {
        // Handle automatic piece falling
        const currentTime = performance.now();
        if (currentTime - this.lastFallTime >= this.fallSpeed) {
            this.automaticFall();
            this.lastFallTime = currentTime;
        }
        
        // Update ghost piece position
        this.updateGhostPiece();
        
        // Check for game over
        if (this.gameBoard.isGameOver()) {
            this.endGame();
        }
    }
    
    render() {
        if (this.renderer) {
            this.renderer.render();
        }
    }
    
    spawnNewPiece() {
        // Move next piece to current
        this.currentPiece = this.nextPiece;
        this.currentPiece.setPosition(4, 0, 0); // Start position at top center
        
        // Generate new next piece
        this.nextPiece = TetrominoPiece.createRandomPiece();
        
        // Add current piece to scene
        if (this.renderer && this.renderer.scene) {
            this.currentPiece.render(this.renderer.scene);
        }
        
        // Check immediate game over (piece can't spawn)
        if (!this.gameBoard.isValidPosition(this.currentPiece, this.currentPiece.x, this.currentPiece.y)) {
            this.endGame();
            return;
        }
        
        // Create ghost piece
        this.createGhostPiece();
        
        // Update UI
        if (this.uiManager) {
            this.uiManager.showNextPiece(this.nextPiece);
        }
        
        this.emit('pieceSpawned', this.currentPiece);
    }
    
    createGhostPiece() {
        if (this.ghostPiece) {
            this.ghostPiece.removeFromScene(this.renderer.scene);
            this.ghostPiece.dispose();
        }
        
        this.ghostPiece = this.currentPiece.clone();
        
        // Make ghost piece transparent
        this.ghostPiece.material = new THREE.MeshLambertMaterial({
            color: this.currentPiece.getColor(),
            transparent: true,
            opacity: 0.3
        });
        this.ghostPiece.createBlocks();
        
        if (this.renderer && this.renderer.scene) {
            this.ghostPiece.render(this.renderer.scene);
        }
        
        this.updateGhostPiece();
    }
    
    updateGhostPiece() {
        if (!this.ghostPiece || !this.currentPiece) return;
        
        // Position ghost piece at the landing position
        let ghostY = this.currentPiece.y;
        while (this.gameBoard.isValidPosition(this.currentPiece, this.currentPiece.x, ghostY + 1, this.currentPiece.rotation)) {
            ghostY++;
        }
        
        this.ghostPiece.setPosition(this.currentPiece.x, ghostY, this.currentPiece.z);
        this.ghostPiece.rotation = this.currentPiece.rotation;
        this.ghostPiece.createBlocks();
    }
    
    automaticFall() {
        if (this.currentPiece) {
            if (!this.movePiece(0, 1)) {
                // Piece can't fall further, place it
                this.placePiece();
            }
        }
    }
    
    movePiece(dx, dy) {
        if (!this.currentPiece) return false;
        
        const newX = this.currentPiece.x + dx;
        const newY = this.currentPiece.y + dy;
        
        if (this.gameBoard.isValidPosition(this.currentPiece, newX, newY)) {
            this.currentPiece.move(dx, dy);
            this.emit('pieceMoved', { piece: this.currentPiece, dx, dy });
            return true;
        }
        
        return false;
    }
    
    rotatePiece() {
        if (!this.currentPiece) return false;
        
        if (this.currentPiece.canRotate(this.gameBoard)) {
            this.currentPiece.rotate();
            this.emit('pieceRotated', this.currentPiece);
            return true;
        }
        
        // Try wall kicks (basic implementation)
        const kicks = [-1, 1, -2, 2]; // Try moving left/right to accommodate rotation
        for (const kick of kicks) {
            if (this.gameBoard.isValidPosition(this.currentPiece, this.currentPiece.x + kick, this.currentPiece.y, 
                (this.currentPiece.rotation + 1) % this.currentPiece.config.shapes.length)) {
                this.currentPiece.move(kick, 0);
                this.currentPiece.rotate();
                this.emit('pieceRotated', this.currentPiece);
                return true;
            }
        }
        
        return false;
    }
    
    hardDrop() {
        if (!this.currentPiece) return;
        
        let dropDistance = 0;
        while (this.movePiece(0, 1)) {
            dropDistance++;
        }
        
        // Place piece immediately
        this.placePiece();
        
        this.emit('hardDrop', { piece: this.currentPiece, distance: dropDistance });
    }
    
    placePiece() {
        if (!this.currentPiece) return;
        
        // Place piece on board
        this.gameBoard.placePiece(this.currentPiece, this.currentPiece.x, this.currentPiece.y);
        
        // Create 3D representation of placed blocks
        this.createPlacedBlocks(this.currentPiece);
        
        // Remove current piece from scene
        this.currentPiece.removeFromScene(this.renderer.scene);
        
        // Remove ghost piece
        if (this.ghostPiece) {
            this.ghostPiece.removeFromScene(this.renderer.scene);
            this.ghostPiece.dispose();
            this.ghostPiece = null;
        }
        
        // Update statistics
        this.gameStats.totalPiecesPlaced++;
        
        // Check for completed lines
        const completedLines = this.gameBoard.findCompletedLines();
        if (completedLines.length > 0) {
            this.clearLines(completedLines);
        }
        
        // Spawn next piece
        this.spawnNewPiece();
        
        this.emit('piecePlaced', this.currentPiece);
    }
    
    createPlacedBlocks(piece) {
        const blocks = piece.getBlocks();
        const geometry = new THREE.BoxGeometry(0.9, 0.9, 0.9);
        
        blocks.forEach(block => {
            // Create block mesh
            const material = new THREE.MeshLambertMaterial({
                color: block.color,
                transparent: false
            });
            const blockMesh = new THREE.Mesh(geometry, material);
            
            // Create edges
            const edges = new THREE.EdgesGeometry(geometry);
            const edgeMaterial = new THREE.LineBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.6
            });
            const edgeLines = new THREE.LineSegments(edges, edgeMaterial);
            
            // Position blocks
            const worldX = block.x - this.gameBoard.width / 2;
            const worldY = this.gameBoard.height / 2 - block.y;
            const worldZ = block.z;
            
            blockMesh.position.set(worldX, worldY, worldZ);
            edgeLines.position.set(worldX, worldY, worldZ);
            
            this.placedBlocks.add(blockMesh);
            this.placedBlocks.add(edgeLines);
            
            this.placedBlockMeshes.push({
                block: blockMesh,
                edges: edgeLines,
                x: block.x,
                y: block.y,
                color: block.color
            });
        });
    }
    
    clearLines(lines) {
        if (!lines || lines.length === 0) return 0;
        
        console.log(`Clearing ${lines.length} lines:`, lines);
        
        // Animation: make completed lines flash
        this.animateClearLines(lines, () => {
            // Remove blocks from 3D scene
            this.removePlacedBlocks(lines);
            
            // Clear lines from board
            const clearedCount = this.gameBoard.clearLines(lines);
            
            // Update statistics
            this.gameStats.totalLinesCleared += clearedCount;
            this.gameStats.currentCombo++;
            this.gameStats.maxCombo = Math.max(this.gameStats.maxCombo, this.gameStats.currentCombo);
            
            // Update placed blocks positions after line clearing
            this.updatePlacedBlocksAfterClear(lines);
            
            // Emit event for scoring system
            this.emit('linesCleared', { lines: clearedCount, clearedRows: lines });
        });
        
        return lines.length;
    }
    
    animateClearLines(lines, callback) {
        // Simple flash animation
        const flashCount = 3;
        const flashDuration = 100;
        let currentFlash = 0;
        
        const flash = () => {
            // Toggle opacity of blocks in completed lines
            this.placedBlockMeshes.forEach(blockData => {
                if (lines.includes(blockData.y)) {
                    blockData.block.material.opacity = currentFlash % 2 === 0 ? 0.3 : 1.0;
                    blockData.block.material.transparent = true;
                }
            });
            
            currentFlash++;
            if (currentFlash < flashCount * 2) {
                setTimeout(flash, flashDuration);
            } else {
                callback();
            }
        };
        
        flash();
    }
    
    removePlacedBlocks(lines) {
        // Remove blocks from the specified lines
        this.placedBlockMeshes = this.placedBlockMeshes.filter(blockData => {
            if (lines.includes(blockData.y)) {
                this.placedBlocks.remove(blockData.block);
                this.placedBlocks.remove(blockData.edges);
                blockData.block.material.dispose();
                blockData.edges.material.dispose();
                return false;
            }
            return true;
        });
    }
    
    updatePlacedBlocksAfterClear(clearedLines) {
        // Update Y positions of blocks above cleared lines
        clearedLines.sort((a, b) => b - a); // Sort descending
        
        this.placedBlockMeshes.forEach(blockData => {
            let dropDistance = 0;
            
            // Calculate how far this block should drop
            clearedLines.forEach(clearedLine => {
                if (blockData.y < clearedLine) {
                    dropDistance++;
                }
            });
            
            if (dropDistance > 0) {
                blockData.y += dropDistance;
                const newWorldY = this.gameBoard.height / 2 - blockData.y;
                blockData.block.position.y = newWorldY;
                blockData.edges.position.y = newWorldY;
            }
        });
    }
    
    clearPlacedBlocks() {
        // Remove all placed blocks from scene
        while (this.placedBlocks.children.length > 0) {
            const child = this.placedBlocks.children[0];
            if (child.material) {
                child.material.dispose();
            }
            if (child.geometry) {
                child.geometry.dispose();
            }
            this.placedBlocks.remove(child);
        }
        this.placedBlockMeshes = [];
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        this.emit('pauseToggled', this.isPaused);
    }
    
    endGame() {
        console.log('Game Over!');
        this.isGameOver = true;
        this.isRunning = false;
        
        // Calculate final statistics
        const gameTime = performance.now() - this.gameStats.startTime;
        const finalStats = {
            ...this.gameStats,
            gameTime: gameTime,
            piecesPerMinute: (this.gameStats.totalPiecesPlaced / gameTime) * 60000,
            linesPerMinute: (this.gameStats.totalLinesCleared / gameTime) * 60000
        };
        
        this.emit('gameOver', finalStats);
    }
    
    resetGame() {
        console.log('Resetting game...');
        
        // Clean up current game
        if (this.currentPiece) {
            this.currentPiece.removeFromScene(this.renderer.scene);
            this.currentPiece.dispose();
            this.currentPiece = null;
        }
        
        if (this.ghostPiece) {
            this.ghostPiece.removeFromScene(this.renderer.scene);
            this.ghostPiece.dispose();
            this.ghostPiece = null;
        }
        
        this.clearPlacedBlocks();
        
        // Reset state
        this.isRunning = false;
        this.isPaused = false;
        this.isGameOver = false;
        this.nextPiece = null;
        
        // Reset statistics
        this.gameStats = {
            startTime: 0,
            totalLinesCleared: 0,
            totalPiecesPlaced: 0,
            maxCombo: 0,
            currentCombo: 0
        };
        
        this.emit('gameReset');
    }
    
    // Event system
    on(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }
    
    emit(event, data) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }
    
    // Getters
    getGameState() {
        return {
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            isGameOver: this.isGameOver,
            currentPiece: this.currentPiece,
            nextPiece: this.nextPiece,
            board: this.gameBoard.grid,
            stats: this.gameStats,
            fallSpeed: this.fallSpeed
        };
    }
    
    setFallSpeed(speed) {
        this.fallSpeed = Math.max(50, speed); // Minimum 50ms fall speed
    }
}
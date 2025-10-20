class GameBoard {
    constructor(width = 10, height = 20, depth = 1) {
        this.width = width;
        this.height = height;
        this.depth = depth;
        
        // Initialize 2D grid for game logic
        this.grid = Array(height).fill().map(() => Array(width).fill(0));
        
        // 3D rendering components
        this.boardMesh = new THREE.Group();
        this.cellSize = 1;
        this.borderMaterial = null;
        this.emptyCellMaterial = null;
        
        this.initializeGeometry();
        this.setupMaterials();
    }
    
    initializeGeometry() {
        // Create border lines for the playing field
        const borderGeometry = new THREE.EdgesGeometry(
            new THREE.BoxGeometry(this.width, this.height, this.depth)
        );
        
        // Create grid lines
        this.createGridLines();
        
        // Create back wall for better visibility
        this.createBackWall();
    }
    
    setupMaterials() {
        // Border material
        this.borderMaterial = new THREE.LineBasicMaterial({ 
            color: 0x0f3460,
            linewidth: 2,
            transparent: true,
            opacity: 0.8
        });
        
        // Empty cell material (subtle grid)
        this.emptyCellMaterial = new THREE.LineBasicMaterial({ 
            color: 0x1a1a2e,
            linewidth: 1,
            transparent: true,
            opacity: 0.3
        });
        
        // Back wall material
        this.backWallMaterial = new THREE.MeshLambertMaterial({
            color: 0x0a0a1a,
            transparent: true,
            opacity: 0.2
        });
    }
    
    createGridLines() {
        // Vertical lines
        for (let x = 0; x <= this.width; x++) {
            const geometry = new THREE.BufferGeometry();
            const vertices = new Float32Array([
                x, 0, 0,
                x, this.height, 0
            ]);
            geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
            
            const line = new THREE.Line(geometry, this.emptyCellMaterial);
            line.position.set(-this.width / 2, -this.height / 2, 0);
            this.boardMesh.add(line);
        }
        
        // Horizontal lines
        for (let y = 0; y <= this.height; y++) {
            const geometry = new THREE.BufferGeometry();
            const vertices = new Float32Array([
                0, y, 0,
                this.width, y, 0
            ]);
            geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
            
            const line = new THREE.Line(geometry, this.emptyCellMaterial);
            line.position.set(-this.width / 2, -this.height / 2, 0);
            this.boardMesh.add(line);
        }
        
        // Outer border
        const borderGeometry = new THREE.EdgesGeometry(
            new THREE.BoxGeometry(this.width, this.height, 0.1)
        );
        const borderLines = new THREE.LineSegments(borderGeometry, this.borderMaterial);
        borderLines.position.set(0, 0, 0);
        this.boardMesh.add(borderLines);
    }
    
    createBackWall() {
        const wallGeometry = new THREE.PlaneGeometry(this.width, this.height);
        const wallMesh = new THREE.Mesh(wallGeometry, this.backWallMaterial);
        wallMesh.position.set(0, 0, -0.5);
        this.boardMesh.add(wallMesh);
    }
    
    render(scene) {
        if (!scene.children.includes(this.boardMesh)) {
            scene.add(this.boardMesh);
        }
    }
    
    // Game logic methods
    isValidPosition(piece, x, y, rotation = 0) {
        if (!piece || !piece.getCurrentShape) {
            return false;
        }
        
        const shape = piece.getCurrentShape(rotation);
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const boardX = x + col;
                    const boardY = y + row;
                    
                    // Check bounds
                    if (boardX < 0 || boardX >= this.width || 
                        boardY < 0 || boardY >= this.height) {
                        return false;
                    }
                    
                    // Check collision with placed pieces
                    if (this.grid[boardY][boardX] !== 0) {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }
    
    placePiece(piece, x, y) {
        const shape = piece.getCurrentShape();
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const boardX = x + col;
                    const boardY = y + row;
                    
                    if (boardX >= 0 && boardX < this.width && 
                        boardY >= 0 && boardY < this.height) {
                        this.grid[boardY][boardX] = piece.type;
                    }
                }
            }
        }
    }
    
    findCompletedLines() {
        const completedLines = [];
        
        for (let y = 0; y < this.height; y++) {
            let isComplete = true;
            for (let x = 0; x < this.width; x++) {
                if (this.grid[y][x] === 0) {
                    isComplete = false;
                    break;
                }
            }
            if (isComplete) {
                completedLines.push(y);
            }
        }
        
        return completedLines;
    }
    
    clearLines(lines) {
        if (!lines || lines.length === 0) {
            return 0;
        }
        
        // Sort lines in descending order to clear from bottom to top
        lines.sort((a, b) => b - a);
        
        // Remove completed lines
        for (const line of lines) {
            this.grid.splice(line, 1);
            // Add empty line at the top
            this.grid.unshift(Array(this.width).fill(0));
        }
        
        return lines.length;
    }
    
    isGameOver() {
        // Check if top rows have any placed pieces
        for (let x = 0; x < this.width; x++) {
            if (this.grid[0][x] !== 0 || this.grid[1][x] !== 0) {
                return true;
            }
        }
        return false;
    }
    
    reset() {
        // Clear the grid
        this.grid = Array(this.height).fill().map(() => Array(this.width).fill(0));
    }
    
    // Helper method to get grid value at position
    getCell(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return -1; // Out of bounds
        }
        return this.grid[y][x];
    }
    
    // Helper method to set grid value at position
    setCell(x, y, value) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.grid[y][x] = value;
        }
    }
    
    // Get dimensions for external use
    getDimensions() {
        return {
            width: this.width,
            height: this.height,
            depth: this.depth
        };
    }
    
    // Get 3D mesh for rendering
    getMesh() {
        return this.boardMesh;
    }
}
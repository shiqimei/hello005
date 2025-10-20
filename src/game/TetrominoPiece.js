class TetrominoPiece {
    static PIECE_TYPES = {
        I: {
            shapes: [
                [
                    [0, 0, 0, 0],
                    [1, 1, 1, 1],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0]
                ],
                [
                    [0, 0, 1, 0],
                    [0, 0, 1, 0],
                    [0, 0, 1, 0],
                    [0, 0, 1, 0]
                ]
            ],
            color: 0x00FFFF, // Cyan
            name: 'I'
        },
        O: {
            shapes: [
                [
                    [1, 1],
                    [1, 1]
                ]
            ],
            color: 0xFFFF00, // Yellow
            name: 'O'
        },
        T: {
            shapes: [
                [
                    [0, 1, 0],
                    [1, 1, 1],
                    [0, 0, 0]
                ],
                [
                    [0, 1, 0],
                    [0, 1, 1],
                    [0, 1, 0]
                ],
                [
                    [0, 0, 0],
                    [1, 1, 1],
                    [0, 1, 0]
                ],
                [
                    [0, 1, 0],
                    [1, 1, 0],
                    [0, 1, 0]
                ]
            ],
            color: 0x800080, // Purple
            name: 'T'
        },
        S: {
            shapes: [
                [
                    [0, 1, 1],
                    [1, 1, 0],
                    [0, 0, 0]
                ],
                [
                    [0, 1, 0],
                    [0, 1, 1],
                    [0, 0, 1]
                ]
            ],
            color: 0x00FF00, // Green
            name: 'S'
        },
        Z: {
            shapes: [
                [
                    [1, 1, 0],
                    [0, 1, 1],
                    [0, 0, 0]
                ],
                [
                    [0, 0, 1],
                    [0, 1, 1],
                    [0, 1, 0]
                ]
            ],
            color: 0xFF0000, // Red
            name: 'Z'
        },
        J: {
            shapes: [
                [
                    [1, 0, 0],
                    [1, 1, 1],
                    [0, 0, 0]
                ],
                [
                    [0, 1, 1],
                    [0, 1, 0],
                    [0, 1, 0]
                ],
                [
                    [0, 0, 0],
                    [1, 1, 1],
                    [0, 0, 1]
                ],
                [
                    [0, 1, 0],
                    [0, 1, 0],
                    [1, 1, 0]
                ]
            ],
            color: 0x0000FF, // Blue
            name: 'J'
        },
        L: {
            shapes: [
                [
                    [0, 0, 1],
                    [1, 1, 1],
                    [0, 0, 0]
                ],
                [
                    [0, 1, 0],
                    [0, 1, 0],
                    [0, 1, 1]
                ],
                [
                    [0, 0, 0],
                    [1, 1, 1],
                    [1, 0, 0]
                ],
                [
                    [1, 1, 0],
                    [0, 1, 0],
                    [0, 1, 0]
                ]
            ],
            color: 0xFFA500, // Orange
            name: 'L'
        }
    };
    
    constructor(type, x = 3, y = 0, z = 0) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.z = z;
        this.rotation = 0;
        
        // Get piece configuration
        this.config = TetrominoPiece.PIECE_TYPES[type];
        if (!this.config) {
            throw new Error(`Invalid piece type: ${type}`);
        }
        
        // 3D rendering components
        this.mesh = new THREE.Group();
        this.blocks = [];
        this.geometry = null;
        this.material = null;
        
        this.initializeGeometry();
        this.setupMaterial();
        this.createBlocks();
    }
    
    initializeGeometry() {
        // Shared geometry for all blocks (efficiency)
        this.geometry = new THREE.BoxGeometry(0.9, 0.9, 0.9);
    }
    
    setupMaterial() {
        // Create material with piece color
        this.material = new THREE.MeshLambertMaterial({
            color: this.config.color,
            transparent: true,
            opacity: 0.9
        });
        
        // Edge material for block outlines
        this.edgeMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.8
        });
    }
    
    createBlocks() {
        // Clear existing blocks
        this.clearBlocks();
        
        const shape = this.getCurrentShape();
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    // Create block mesh
                    const blockMesh = new THREE.Mesh(this.geometry, this.material);
                    
                    // Create edges for better visibility
                    const edges = new THREE.EdgesGeometry(this.geometry);
                    const edgeLines = new THREE.LineSegments(edges, this.edgeMaterial);
                    
                    // Position block
                    blockMesh.position.set(col, -row, 0);
                    edgeLines.position.set(col, -row, 0);
                    
                    // Add to group
                    this.mesh.add(blockMesh);
                    this.mesh.add(edgeLines);
                    
                    this.blocks.push({ mesh: blockMesh, edges: edgeLines, x: col, y: row });
                }
            }
        }
        
        // Update mesh position
        this.updateMeshPosition();
    }
    
    clearBlocks() {
        // Remove all blocks from mesh
        while (this.mesh.children.length > 0) {
            this.mesh.remove(this.mesh.children[0]);
        }
        this.blocks = [];
    }
    
    getCurrentShape(rotationOverride = null) {
        const rotation = rotationOverride !== null ? rotationOverride : this.rotation;
        const shapes = this.config.shapes;
        return shapes[rotation % shapes.length];
    }
    
    rotate(direction = 'clockwise') {
        const oldRotation = this.rotation;
        
        if (direction === 'clockwise') {
            this.rotation = (this.rotation + 1) % this.config.shapes.length;
        } else {
            this.rotation = (this.rotation - 1 + this.config.shapes.length) % this.config.shapes.length;
        }
        
        // Recreate blocks with new rotation
        this.createBlocks();
        
        return oldRotation !== this.rotation;
    }
    
    getBlocks() {
        // Return 3D coordinates of all blocks relative to piece position
        const shape = this.getCurrentShape();
        const blocks = [];
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    blocks.push({
                        x: this.x + col,
                        y: this.y + row,
                        z: this.z,
                        color: this.config.color
                    });
                }
            }
        }
        
        return blocks;
    }
    
    move(dx, dy, dz = 0) {
        this.x += dx;
        this.y += dy;
        this.z += dz;
        this.updateMeshPosition();
    }
    
    setPosition(x, y, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.updateMeshPosition();
    }
    
    updateMeshPosition() {
        if (this.mesh) {
            this.mesh.position.set(
                this.x - this.getCurrentShape()[0].length / 2,
                -this.y + this.getCurrentShape().length / 2,
                this.z
            );
        }
    }
    
    render(scene) {
        if (!scene.children.includes(this.mesh)) {
            scene.add(this.mesh);
        }
    }
    
    removeFromScene(scene) {
        if (scene.children.includes(this.mesh)) {
            scene.remove(this.mesh);
        }
    }
    
    clone() {
        const clonedPiece = new TetrominoPiece(this.type, this.x, this.y, this.z);
        clonedPiece.rotation = this.rotation;
        clonedPiece.createBlocks();
        return clonedPiece;
    }
    
    getBoundingBox() {
        const shape = this.getCurrentShape();
        let minX = shape[0].length, maxX = -1;
        let minY = shape.length, maxY = -1;
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    minX = Math.min(minX, col);
                    maxX = Math.max(maxX, col);
                    minY = Math.min(minY, row);
                    maxY = Math.max(maxY, row);
                }
            }
        }
        
        return {
            left: this.x + minX,
            right: this.x + maxX,
            top: this.y + minY,
            bottom: this.y + maxY
        };
    }
    
    // Static methods for piece generation
    static getRandomType() {
        const types = Object.keys(TetrominoPiece.PIECE_TYPES);
        return types[Math.floor(Math.random() * types.length)];
    }
    
    static createRandomPiece(x = 3, y = 0, z = 0) {
        const type = TetrominoPiece.getRandomType();
        return new TetrominoPiece(type, x, y, z);
    }
    
    static createAllTypes() {
        return Object.keys(TetrominoPiece.PIECE_TYPES).map(type => 
            new TetrominoPiece(type)
        );
    }
    
    // Helper method to check if rotation is possible
    canRotate(board, direction = 'clockwise') {
        if (!board) return true;
        
        const oldRotation = this.rotation;
        const newRotation = direction === 'clockwise' 
            ? (this.rotation + 1) % this.config.shapes.length
            : (this.rotation - 1 + this.config.shapes.length) % this.config.shapes.length;
        
        return board.isValidPosition(this, this.x, this.y, newRotation);
    }
    
    // Get piece type name
    getTypeName() {
        return this.config.name;
    }
    
    // Get piece color
    getColor() {
        return this.config.color;
    }
    
    // Dispose of 3D resources
    dispose() {
        this.clearBlocks();
        if (this.geometry) {
            this.geometry.dispose();
        }
        if (this.material) {
            this.material.dispose();
        }
        if (this.edgeMaterial) {
            this.edgeMaterial.dispose();
        }
    }
}
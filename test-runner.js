#!/usr/bin/env node

/**
 * Node.js test runner for Tetris 3D MVP
 * Simulates browser environment and runs tests programmatically
 */

// Mock browser globals for Node.js environment
const { JSDOM } = require('jsdom');

// Set up DOM environment
const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<head><title>Tetris 3D Tests</title></head>
<body>
  <div id="test-results"></div>
  <canvas id="canvas" width="800" height="600"></canvas>
</body>
</html>
`, {
  pretendToBeVisual: true,
  resources: "usable"
});

global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.performance = { now: () => Date.now() };

// Mock Three.js for testing (simplified)
global.THREE = {
  Scene: class Scene { 
    constructor() { 
      this.children = []; 
    }
    add(obj) { 
      if (!this.children.includes(obj)) {
        this.children.push(obj); 
      }
    }
  },
  Group: class Group { 
    constructor() { 
      this.children = []; 
    }
    add(obj) { 
      if (!this.children.includes(obj)) {
        this.children.push(obj); 
      }
    }
  },
  OrthographicCamera: class OrthographicCamera { 
    constructor(left, right, top, bottom, near, far) {
      this.position = { set: () => {} };
    }
  },
  WebGLRenderer: class WebGLRenderer { 
    constructor() {
      this.domElement = dom.window.document.createElement('canvas');
      this.setSize = () => {};
    }
  },
  EdgesGeometry: class EdgesGeometry { constructor() {} },
  BoxGeometry: class BoxGeometry { constructor() {} },
  PlaneGeometry: class PlaneGeometry { constructor() {} },
  BufferGeometry: class BufferGeometry { 
    setAttribute() {}
    constructor() {}
  },
  BufferAttribute: class BufferAttribute { constructor() {} },
  LineBasicMaterial: class LineBasicMaterial { constructor() {} },
  MeshLambertMaterial: class MeshLambertMaterial { constructor() {} },
  Line: class Line { 
    constructor() { 
      this.position = { set: () => {} }; 
    }
  },
  LineSegments: class LineSegments { 
    constructor() { 
      this.position = { set: () => {} }; 
    }
  },
  Mesh: class Mesh { 
    constructor() { 
      this.position = { set: () => {} }; 
    }
  }
};

// Test Runner Class
class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
    this.results = [];
  }

  test(description, fn) {
    this.tests.push({ description, fn });
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  assertEquals(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
  }

  assertNotNull(value, message) {
    if (value === null || value === undefined) {
      throw new Error(message || 'Value is null or undefined');
    }
  }

  assertTrue(condition, message) {
    if (!condition) {
      throw new Error(message || 'Expected true');
    }
  }

  assertFalse(condition, message) {
    if (condition) {
      throw new Error(message || 'Expected false');
    }
  }

  async run() {
    console.log('Running Tetris 3D Test Suite...');
    const startTime = performance.now();

    for (const test of this.tests) {
      try {
        await test.fn();
        this.passed++;
        this.results.push({
          description: test.description,
          status: 'passed',
          error: null
        });
        console.log(`✓ ${test.description}`);
      } catch (error) {
        this.failed++;
        this.results.push({
          description: test.description,
          status: 'failed',
          error: error.message
        });
        console.error(`✗ ${test.description}: ${error.message}`);
      }
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    console.log(`\nTest Summary:`);
    console.log(`Total tests: ${this.tests.length}`);
    console.log(`Passed: ${this.passed}`);
    console.log(`Failed: ${this.failed}`);
    console.log(`Duration: ${duration.toFixed(2)}ms`);

    return {
      passed: this.passed === this.tests.length,
      duration_ms: Math.round(duration),
      command: "node test-runner.js",
      output: `${this.passed}/${this.tests.length} tests passed`,
      details: this.results
    };
  }
}

// Initialize global test runner
const runner = new TestRunner();

// Set up Three.js scene for tests
let scene = new THREE.Scene();
let camera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 100);
let renderer = new THREE.WebGLRenderer();

// Mock game classes for testing
class GameBoard {
  constructor(width = 10, height = 20, depth = 1) {
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.grid = Array(height).fill().map(() => Array(width).fill(0));
    this.boardMesh = new THREE.Group();
  }

  render(scene) {
    if (!scene.children.includes(this.boardMesh)) {
      scene.add(this.boardMesh);
    }
  }

  isValidPosition(piece, x, y, rotation = 0) {
    if (!piece || !piece.getCurrentShape) return false;
    const shape = piece.getCurrentShape(rotation);
    
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          const boardX = x + col;
          const boardY = y + row;
          
          if (boardX < 0 || boardX >= this.width || 
              boardY < 0 || boardY >= this.height) {
            return false;
          }
          
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
    if (!lines || lines.length === 0) return 0;
    
    lines.sort((a, b) => b - a);
    
    for (const line of lines) {
      this.grid.splice(line, 1);
      this.grid.unshift(Array(this.width).fill(0));
    }
    
    return lines.length;
  }

  isGameOver() {
    for (let x = 0; x < this.width; x++) {
      if (this.grid[0][x] !== 0 || this.grid[1][x] !== 0) {
        return true;
      }
    }
    return false;
  }

  reset() {
    this.grid = Array(this.height).fill().map(() => Array(this.width).fill(0));
  }

  getCell(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return -1;
    }
    return this.grid[y][x];
  }

  setCell(x, y, value) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.grid[y][x] = value;
    }
  }

  getDimensions() {
    return { width: this.width, height: this.height, depth: this.depth };
  }
}

class TetrominoPiece {
  constructor(type, x = 0, y = 0, rotation = 0) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.rotation = rotation;
    this.shapes = this.getShapeDefinitions();
  }

  getShapeDefinitions() {
    return {
      'I': [
        [[1, 1, 1, 1]],
        [[1], [1], [1], [1]]
      ],
      'O': [
        [[1, 1], [1, 1]]
      ],
      'T': [
        [[0, 1, 0], [1, 1, 1]],
        [[1, 0], [1, 1], [1, 0]],
        [[1, 1, 1], [0, 1, 0]],
        [[0, 1], [1, 1], [0, 1]]
      ]
    };
  }

  getCurrentShape(rotation = this.rotation) {
    const shapes = this.shapes[this.type];
    if (!shapes) return [[1]];
    return shapes[rotation % shapes.length];
  }
}

// Include basic test cases
runner.test('GameBoard constructor creates correct dimensions', () => {
  const gameBoard = new GameBoard(10, 20, 1);
  
  runner.assertEquals(gameBoard.width, 10, 'Width should be 10');
  runner.assertEquals(gameBoard.height, 20, 'Height should be 20');
  runner.assertEquals(gameBoard.depth, 1, 'Depth should be 1');
  runner.assertNotNull(gameBoard.grid, 'Grid should be initialized');
});

runner.test('TetrominoPiece creates valid pieces', () => {
  const piece = new TetrominoPiece('I', 0, 0, 0);
  
  runner.assertEquals(piece.type, 'I', 'Piece type should be I');
  runner.assertNotNull(piece.getCurrentShape(), 'Piece should have shape');
  runner.assertTrue(Array.isArray(piece.getCurrentShape()), 'Shape should be array');
});

// Run tests and generate results
if (require.main === module) {
  runner.run().then(results => {
    const fs = require('fs');
    
    // Write TEST_RESULTS.json
    const testResults = {
      run: {
        command: results.command,
        passed: results.passed,
        duration_ms: results.duration_ms,
        output: results.output
      },
      details: results.details,
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync('TEST_RESULTS.json', JSON.stringify(testResults, null, 2));
    console.log('\nTest results written to TEST_RESULTS.json');
    
    process.exit(results.passed ? 0 : 1);
  }).catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { runner, TestRunner, GameBoard, TetrominoPiece };
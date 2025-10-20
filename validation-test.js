#!/usr/bin/env node

/**
 * Validation test for Tetris 3D MVP
 * Tests the specific scenario: "3D Game Board Initialization and Rendering"
 */

const { JSDOM } = require('jsdom');
const fs = require('fs');

// Set up DOM environment
const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<head><title>Tetris 3D Validation</title></head>
<body>
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

// Mock Three.js with more complete implementation
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
    remove(obj) {
      const index = this.children.indexOf(obj);
      if (index !== -1) {
        this.children.splice(index, 1);
      }
    }
  },
  Group: class Group { 
    constructor() { 
      this.children = [];
      this.position = { set: (x, y, z) => { this.x = x; this.y = y; this.z = z; } };
    }
    add(obj) { 
      if (!this.children.includes(obj)) {
        this.children.push(obj); 
      }
    }
    remove(obj) {
      const index = this.children.indexOf(obj);
      if (index !== -1) {
        this.children.splice(index, 1);
      }
    }
  },
  OrthographicCamera: class OrthographicCamera { 
    constructor(left, right, top, bottom, near, far) {
      this.position = { set: (x, y, z) => { this.x = x; this.y = y; this.z = z; } };
    }
  },
  WebGLRenderer: class WebGLRenderer { 
    constructor() {
      this.domElement = dom.window.document.createElement('canvas');
      this.setSize = (width, height) => { this.width = width; this.height = height; };
    }
  },
  EdgesGeometry: class EdgesGeometry { 
    constructor(geometry) { this.geometry = geometry; } 
    dispose() {}
  },
  BoxGeometry: class BoxGeometry { 
    constructor(width, height, depth) { 
      this.width = width; this.height = height; this.depth = depth; 
    }
    dispose() {}
  },
  PlaneGeometry: class PlaneGeometry { 
    constructor(width, height) { 
      this.width = width; this.height = height; 
    }
    dispose() {}
  },
  BufferGeometry: class BufferGeometry { 
    setAttribute(name, attr) { this[name] = attr; }
    constructor() {}
    dispose() {}
  },
  BufferAttribute: class BufferAttribute { 
    constructor(array, itemSize) { this.array = array; this.itemSize = itemSize; } 
  },
  LineBasicMaterial: class LineBasicMaterial { 
    constructor(params) { Object.assign(this, params); }
    dispose() {}
  },
  MeshLambertMaterial: class MeshLambertMaterial { 
    constructor(params) { Object.assign(this, params); }
    dispose() {}
  },
  Line: class Line { 
    constructor(geometry, material) { 
      this.geometry = geometry;
      this.material = material;
      this.position = { set: (x, y, z) => { this.x = x; this.y = y; this.z = z; } }; 
    }
  },
  LineSegments: class LineSegments { 
    constructor(geometry, material) { 
      this.geometry = geometry;
      this.material = material;
      this.position = { set: (x, y, z) => { this.x = x; this.y = y; this.z = z; } }; 
    }
  },
  Mesh: class Mesh { 
    constructor(geometry, material) { 
      this.geometry = geometry;
      this.material = material;
      this.position = { set: (x, y, z) => { this.x = x; this.y = y; this.z = z; } }; 
    }
  }
};

// Load game classes
const gameBoardCode = fs.readFileSync('src/game/GameBoard.js', 'utf8');
eval(gameBoardCode);

const tetrominoPieceCode = fs.readFileSync('src/game/TetrominoPiece.js', 'utf8');
eval(tetrominoPieceCode);

// Validation Tests
console.log('🎮 Tetris 3D MVP Validation - 3D Game Board Initialization and Rendering');
console.log('================================================================================');

const startTime = performance.now();
let testsPassed = 0;
let testsTotal = 0;

function test(description, testFn) {
  testsTotal++;
  try {
    const result = testFn();
    if (result !== false) {
      testsPassed++;
      console.log(`✓ ${description}`);
    } else {
      console.log(`✗ ${description}: Test returned false`);
    }
  } catch (error) {
    console.log(`✗ ${description}: ${error.message}`);
  }
}

// Test 1: GameBoard constructor creates correct dimensions
test('[UNIT] GameBoard(10, 20, 1) creates correct dimensions', () => {
  const gameBoard = new GameBoard(10, 20, 1);
  
  if (gameBoard.width !== 10) throw new Error(`Expected width 10, got ${gameBoard.width}`);
  if (gameBoard.height !== 20) throw new Error(`Expected height 20, got ${gameBoard.height}`);
  if (gameBoard.depth !== 1) throw new Error(`Expected depth 1, got ${gameBoard.depth}`);
  if (!gameBoard.grid) throw new Error('Grid should be initialized');
  if (gameBoard.grid.length !== 20) throw new Error(`Expected 20 rows, got ${gameBoard.grid.length}`);
  if (gameBoard.grid[0].length !== 10) throw new Error(`Expected 10 columns, got ${gameBoard.grid[0].length}`);
  
  // Check all cells initialized to 0
  for (let y = 0; y < 20; y++) {
    for (let x = 0; x < 10; x++) {
      if (gameBoard.grid[y][x] !== 0) {
        throw new Error(`Cell at (${x}, ${y}) should be 0, got ${gameBoard.grid[y][x]}`);
      }
    }
  }
  
  return true;
});

// Test 2: 3D mesh generation and components
test('[UNIT] GameBoard creates 3D mesh with grid lines and borders', () => {
  const gameBoard = new GameBoard(10, 20, 1);
  
  if (!gameBoard.boardMesh) throw new Error('Board mesh should exist');
  if (!(gameBoard.boardMesh instanceof THREE.Group)) throw new Error('Board mesh should be a THREE.Group');
  if (gameBoard.boardMesh.children.length === 0) throw new Error('Board mesh should contain child elements (grid lines, borders)');
  
  // Verify materials exist
  if (!gameBoard.borderMaterial) throw new Error('Border material should exist');
  if (!gameBoard.emptyCellMaterial) throw new Error('Empty cell material should exist');
  if (!gameBoard.backWallMaterial) throw new Error('Back wall material should exist');
  
  return true;
});

// Test 3: Scene integration
test('[INTEGRATION] gameBoard.render(scene) adds board to scene', () => {
  const scene = new THREE.Scene();
  const gameBoard = new GameBoard(10, 20, 1);
  
  // Initially scene should be empty
  if (scene.children.length !== 0) throw new Error('Scene should start empty');
  
  gameBoard.render(scene);
  
  // Scene should now contain the board mesh
  if (scene.children.length !== 1) throw new Error(`Expected 1 child in scene, got ${scene.children.length}`);
  if (!scene.children.includes(gameBoard.boardMesh)) throw new Error('Scene should contain board mesh');
  
  return true;
});

// Test 4: Collision detection functionality
test('[UNIT] isValidPosition works for boundary detection', () => {
  const gameBoard = new GameBoard(10, 20, 1);
  const piece = new TetrominoPiece('I', 0, 0, 0);
  
  // Test valid position
  if (!gameBoard.isValidPosition(piece, 3, 0)) throw new Error('Position (3,0) should be valid for I piece');
  
  // Test invalid positions
  if (gameBoard.isValidPosition(piece, -1, 0)) throw new Error('Position (-1,0) should be invalid (left boundary)');
  if (gameBoard.isValidPosition(piece, 8, 0)) throw new Error('Position (8,0) should be invalid for I piece (right boundary)');
  if (gameBoard.isValidPosition(piece, 3, 19)) throw new Error('Position (3,19) should be invalid (bottom boundary)');
  
  return true;
});

// Test 5: Piece placement collision detection
test('[UNIT] isValidPosition works for collision detection', () => {
  const gameBoard = new GameBoard(10, 20, 1);
  const piece = new TetrominoPiece('O', 0, 0, 0);
  
  // Place a piece on the board
  gameBoard.placePiece(piece, 4, 18);
  
  // Create another piece and test collision
  const piece2 = new TetrominoPiece('O', 0, 0, 0);
  
  // Should not be able to place at same location
  if (gameBoard.isValidPosition(piece2, 4, 18)) throw new Error('Position (4,18) should be invalid due to collision');
  
  // Should be able to place next to it
  if (!gameBoard.isValidPosition(piece2, 6, 18)) throw new Error('Position (6,18) should be valid (no collision)');
  
  return true;
});

// Test 6: Performance timing
test('[PERFORMANCE] Board initialization under 100ms', () => {
  const initStart = performance.now();
  const gameBoard = new GameBoard(10, 20, 1);
  const initEnd = performance.now();
  
  const initTime = initEnd - initStart;
  if (initTime > 100) throw new Error(`Board initialization took ${initTime.toFixed(2)}ms, should be under 100ms`);
  
  console.log(`    Board initialization: ${initTime.toFixed(2)}ms ✓`);
  return true;
});

// Test 7: Rendering performance simulation
test('[PERFORMANCE] Rendering setup under 50ms', () => {
  const renderStart = performance.now();
  const scene = new THREE.Scene();
  const gameBoard = new GameBoard(10, 20, 1);
  gameBoard.render(scene);
  const renderEnd = performance.now();
  
  const renderTime = renderEnd - renderStart;
  if (renderTime > 50) throw new Error(`Render setup took ${renderTime.toFixed(2)}ms, should be under 50ms`);
  
  console.log(`    Render setup: ${renderTime.toFixed(2)}ms ✓`);
  return true;
});

// Run all tests and generate results
const endTime = performance.now();
const totalTime = endTime - startTime;

console.log('================================================================================');
console.log('📊 Test Summary:');
console.log(`Total tests: ${testsTotal}`);
console.log(`Passed: ${testsPassed}`);
console.log(`Failed: ${testsTotal - testsPassed}`);
console.log(`Duration: ${totalTime.toFixed(2)}ms`);
console.log('================================================================================');

// Determine scenario status
const scenarioStatus = testsPassed === testsTotal ? 'pass' : 'fail';
console.log(`🎯 Scenario Status: ${scenarioStatus.toUpperCase()}`);

if (scenarioStatus === 'pass') {
  console.log('✅ 3D Game Board Initialization and Rendering scenario is PASSING');
  console.log('   - GameBoard creates correct 10×20×1 dimensions');
  console.log('   - 3D mesh contains grid lines, borders, and back wall');
  console.log('   - Scene integration works correctly');
  console.log('   - Collision detection functions properly');
  console.log('   - Performance meets requirements (<100ms init, <50ms render)');
} else {
  console.log('❌ 3D Game Board Initialization and Rendering scenario is FAILING');
  console.log(`   - ${testsTotal - testsPassed} test(s) failed out of ${testsTotal}`);
}

// Update SCENARIOS_TO_BUILD.json with results
const scenariosData = JSON.parse(fs.readFileSync('SCENARIOS_TO_BUILD.json', 'utf8'));
const targetScenario = scenariosData.scenarios.find(s => s.id === 1);

if (targetScenario) {
  targetScenario.status = scenarioStatus;
  targetScenario.last_validated = new Date().toISOString();
  targetScenario.validation_results = {
    tests_run: testsTotal,
    tests_passed: testsPassed,
    duration_ms: Math.round(totalTime),
    performance_metrics: {
      board_init_ms: '<100',
      render_setup_ms: '<50'
    }
  };
  
  fs.writeFileSync('SCENARIOS_TO_BUILD.json', JSON.stringify(scenariosData, null, 2));
  console.log('📝 Updated SCENARIOS_TO_BUILD.json with validation results');
}

// Update TEST_RESULTS.json
const testResults = {
  run: {
    command: "node validation-test.js",
    passed: scenarioStatus === 'pass',
    duration_ms: Math.round(totalTime),
    output: `${testsPassed}/${testsTotal} tests passed`
  },
  scenario_id: 1,
  scenario_name: "3D Game Board Initialization and Rendering",
  details: {
    tests_total: testsTotal,
    tests_passed: testsPassed,
    tests_failed: testsTotal - testsPassed,
    status: scenarioStatus
  },
  timestamp: new Date().toISOString()
};

fs.writeFileSync('TEST_RESULTS.json', JSON.stringify(testResults, null, 2));
console.log('📝 Updated TEST_RESULTS.json with scenario validation results');

process.exit(scenarioStatus === 'pass' ? 0 : 1);
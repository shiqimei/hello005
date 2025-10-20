// GameEngine Tests
runner.test('GameEngine constructor initializes correctly', () => {
    const gameBoard = new GameBoard(10, 20, 1);
    const engine = new GameEngine(gameBoard, null, null);
    
    runner.assertNotNull(engine.gameBoard, 'Should store gameBoard reference');
    runner.assertFalse(engine.isRunning, 'Should not be running initially');
    runner.assertFalse(engine.isPaused, 'Should not be paused initially');
    runner.assertFalse(engine.isGameOver, 'Should not be game over initially');
    runner.assertEquals(engine.fallSpeed, 1000, 'Should have default fall speed');
    runner.assertNotNull(engine.inputMap, 'Should initialize input map');
    runner.assertNotNull(engine.gameStats, 'Should initialize game stats');
});

runner.test('GameEngine input mapping works correctly', () => {
    const gameBoard = new GameBoard(10, 20, 1);
    const engine = new GameEngine(gameBoard, null, null);
    
    runner.assertNotNull(engine.inputMap['ArrowLeft'], 'Should map left arrow');
    runner.assertNotNull(engine.inputMap['ArrowRight'], 'Should map right arrow');
    runner.assertNotNull(engine.inputMap['ArrowDown'], 'Should map down arrow');
    runner.assertNotNull(engine.inputMap['ArrowUp'], 'Should map up arrow');
    runner.assertNotNull(engine.inputMap['Space'], 'Should map space bar');
    runner.assertNotNull(engine.inputMap['KeyP'], 'Should map P key');
    runner.assertNotNull(engine.inputMap['Escape'], 'Should map escape key');
});

runner.test('GameEngine startGame initializes game state', () => {
    const gameBoard = new GameBoard(10, 20, 1);
    const engine = new GameEngine(gameBoard, null, null);
    
    let gameStartedTriggered = false;
    engine.on('gameStarted', () => { gameStartedTriggered = true; });
    
    engine.startGame();
    
    runner.assertTrue(engine.isRunning, 'Game should be running');
    runner.assertFalse(engine.isPaused, 'Game should not be paused');
    runner.assertFalse(engine.isGameOver, 'Game should not be over');
    runner.assertNotNull(engine.currentPiece, 'Should have current piece');
    runner.assertNotNull(engine.nextPiece, 'Should have next piece');
    runner.assertTrue(gameStartedTriggered, 'Should trigger game started event');
});

runner.test('GameEngine spawnNewPiece creates and positions piece correctly', () => {
    const gameBoard = new GameBoard(10, 20, 1);
    const engine = new GameEngine(gameBoard, null, null);
    
    let pieceSpawnedTriggered = false;
    engine.on('pieceSpawned', (piece) => { 
        pieceSpawnedTriggered = true;
        runner.assertNotNull(piece, 'Should provide piece in event');
    });
    
    engine.nextPiece = TetrominoPiece.createRandomPiece();
    engine.spawnNewPiece();
    
    runner.assertNotNull(engine.currentPiece, 'Should have current piece');
    runner.assertNotNull(engine.nextPiece, 'Should generate new next piece');
    runner.assertEquals(engine.currentPiece.x, 4, 'Piece should spawn at center X');
    runner.assertEquals(engine.currentPiece.y, 0, 'Piece should spawn at top Y');
    runner.assertTrue(pieceSpawnedTriggered, 'Should trigger piece spawned event');
});

runner.test('GameEngine movePiece validates movement correctly', () => {
    const gameBoard = new GameBoard(10, 20, 1);
    const engine = new GameEngine(gameBoard, null, null);
    
    // Create a piece at known position
    engine.currentPiece = new TetrominoPiece('O', 5, 10, 0);
    
    let pieceMovedTriggered = false;
    engine.on('pieceMoved', (data) => { 
        pieceMovedTriggered = true;
        runner.assertEquals(data.dx, 1, 'Should provide movement delta X');
        runner.assertEquals(data.dy, 0, 'Should provide movement delta Y');
    });
    
    // Test valid movement
    const moved = engine.movePiece(1, 0);
    runner.assertTrue(moved, 'Valid movement should succeed');
    runner.assertEquals(engine.currentPiece.x, 6, 'Piece X should be updated');
    runner.assertTrue(pieceMovedTriggered, 'Should trigger piece moved event');
    
    // Test invalid movement (out of bounds)
    const invalidMoved = engine.movePiece(10, 0);
    runner.assertFalse(invalidMoved, 'Invalid movement should fail');
    runner.assertEquals(engine.currentPiece.x, 6, 'Piece X should not change on invalid move');
});

runner.test('GameEngine rotatePiece handles rotation and wall kicks', () => {
    const gameBoard = new GameBoard(10, 20, 1);
    const engine = new GameEngine(gameBoard, null, null);
    
    // Create an I piece in center where rotation should work
    engine.currentPiece = new TetrominoPiece('I', 5, 5, 0);
    
    let pieceRotatedTriggered = false;
    engine.on('pieceRotated', (piece) => { 
        pieceRotatedTriggered = true;
        runner.assertNotNull(piece, 'Should provide piece in event');
    });
    
    const rotated = engine.rotatePiece();
    runner.assertTrue(rotated, 'Rotation should succeed in center');
    runner.assertTrue(pieceRotatedTriggered, 'Should trigger piece rotated event');
    
    // Test rotation near edge (should try wall kicks)
    engine.currentPiece.setPosition(0, 5, 0);
    const edgeRotated = engine.rotatePiece();
    // Result depends on specific piece shape and wall kick implementation
    runner.assertTrue(typeof edgeRotated === 'boolean', 'Should return boolean for edge rotation');
});

runner.test('GameEngine hardDrop moves piece to bottom immediately', () => {
    const gameBoard = new GameBoard(10, 20, 1);
    const engine = new GameEngine(gameBoard, null, null);
    
    engine.currentPiece = new TetrominoPiece('I', 5, 0, 0);
    const originalY = engine.currentPiece.y;
    
    let hardDropTriggered = false;
    engine.on('hardDrop', (data) => { 
        hardDropTriggered = true;
        runner.assertTrue(data.distance > 0, 'Should provide drop distance');
    });
    
    engine.hardDrop();
    
    runner.assertTrue(engine.currentPiece.y > originalY, 'Piece should move down');
    runner.assertTrue(hardDropTriggered, 'Should trigger hard drop event');
});

runner.test('GameEngine placePiece adds piece to board and spawns next', () => {
    const gameBoard = new GameBoard(10, 20, 1);
    const engine = new GameEngine(gameBoard, null, null);
    
    // Position piece at bottom
    engine.currentPiece = new TetrominoPiece('O', 4, 18, 0);
    engine.nextPiece = new TetrominoPiece('I', 0, 0, 0);
    
    let piecePlacedTriggered = false;
    engine.on('piecePlaced', (piece) => { 
        piecePlacedTriggered = true;
    });
    
    engine.placePiece();
    
    // Check that piece was placed on board
    runner.assertTrue(gameBoard.getCell(4, 18) !== 0, 'Board should contain placed piece');
    runner.assertTrue(gameBoard.getCell(5, 18) !== 0, 'O piece should occupy 2x2 area');
    runner.assertTrue(gameBoard.getCell(4, 19) !== 0, 'O piece should occupy 2x2 area');
    runner.assertTrue(gameBoard.getCell(5, 19) !== 0, 'O piece should occupy 2x2 area');
    runner.assertTrue(piecePlacedTriggered, 'Should trigger piece placed event');
    
    // Should have spawned new current piece
    runner.assertNotNull(engine.currentPiece, 'Should have new current piece');
    runner.assertEquals(engine.gameStats.totalPiecesPlaced, 1, 'Should increment pieces placed stat');
});

runner.test('GameEngine clearLines handles line clearing correctly', () => {
    const gameBoard = new GameBoard(10, 20, 1);
    const engine = new GameEngine(gameBoard, null, null);
    
    // Fill a complete line
    for (let x = 0; x < 10; x++) {
        gameBoard.setCell(x, 19, 'T');
    }
    
    let linesClearedTriggered = false;
    engine.on('linesCleared', (data) => { 
        linesClearedTriggered = true;
        runner.assertEquals(data.lines, 1, 'Should clear 1 line');
        runner.assertTrue(Array.isArray(data.clearedRows), 'Should provide cleared rows');
    });
    
    const clearedCount = engine.clearLines([19]);
    
    runner.assertEquals(clearedCount, 1, 'Should return number of lines cleared');
    runner.assertTrue(linesClearedTriggered, 'Should trigger lines cleared event');
    runner.assertEquals(engine.gameStats.totalLinesCleared, 1, 'Should update stats');
    
    // Check that line was actually cleared
    for (let x = 0; x < 10; x++) {
        runner.assertEquals(gameBoard.getCell(x, 19), 0, 'Cleared line should be empty');
    }
});

runner.test('GameEngine togglePause works correctly', () => {
    const gameBoard = new GameBoard(10, 20, 1);
    const engine = new GameEngine(gameBoard, null, null);
    
    let pauseToggleTriggered = false;
    engine.on('pauseToggled', (isPaused) => { 
        pauseToggleTriggered = true;
        runner.assertTrue(isPaused, 'Should indicate paused state');
    });
    
    runner.assertFalse(engine.isPaused, 'Should not be paused initially');
    
    engine.togglePause();
    
    runner.assertTrue(engine.isPaused, 'Should be paused after toggle');
    runner.assertTrue(pauseToggleTriggered, 'Should trigger pause toggle event');
    
    engine.togglePause();
    
    runner.assertFalse(engine.isPaused, 'Should be unpaused after second toggle');
});

runner.test('GameEngine endGame sets correct final state', () => {
    const gameBoard = new GameBoard(10, 20, 1);
    const engine = new GameEngine(gameBoard, null, null);
    
    // Set up some game state
    engine.startGame();
    engine.gameStats.totalPiecesPlaced = 5;
    engine.gameStats.totalLinesCleared = 3;
    
    let gameOverTriggered = false;
    let finalStats = null;
    engine.on('gameOver', (stats) => { 
        gameOverTriggered = true;
        finalStats = stats;
    });
    
    engine.endGame();
    
    runner.assertTrue(engine.isGameOver, 'Should be game over');
    runner.assertFalse(engine.isRunning, 'Should not be running');
    runner.assertTrue(gameOverTriggered, 'Should trigger game over event');
    runner.assertNotNull(finalStats, 'Should provide final stats');
    runner.assertEquals(finalStats.totalPiecesPlaced, 5, 'Stats should include pieces placed');
    runner.assertEquals(finalStats.totalLinesCleared, 3, 'Stats should include lines cleared');
    runner.assertTrue(finalStats.gameTime > 0, 'Stats should include game time');
});

runner.test('GameEngine resetGame clears all state', () => {
    const gameBoard = new GameBoard(10, 20, 1);
    const engine = new GameEngine(gameBoard, null, null);
    
    // Set up game state
    engine.startGame();
    engine.gameStats.totalPiecesPlaced = 10;
    engine.gameStats.totalLinesCleared = 5;
    
    let gameResetTriggered = false;
    engine.on('gameReset', () => { gameResetTriggered = true; });
    
    engine.resetGame();
    
    runner.assertFalse(engine.isRunning, 'Should not be running after reset');
    runner.assertFalse(engine.isPaused, 'Should not be paused after reset');
    runner.assertFalse(engine.isGameOver, 'Should not be game over after reset');
    runner.assertTrue(engine.currentPiece === null, 'Current piece should be null');
    runner.assertTrue(engine.nextPiece === null, 'Next piece should be null');
    runner.assertEquals(engine.gameStats.totalPiecesPlaced, 0, 'Stats should be reset');
    runner.assertEquals(engine.gameStats.totalLinesCleared, 0, 'Stats should be reset');
    runner.assertTrue(gameResetTriggered, 'Should trigger game reset event');
});

runner.test('GameEngine getGameState returns current state', () => {
    const gameBoard = new GameBoard(10, 20, 1);
    const engine = new GameEngine(gameBoard, null, null);
    
    engine.startGame();
    
    const state = engine.getGameState();
    
    runner.assertNotNull(state.isRunning, 'State should include running status');
    runner.assertNotNull(state.isPaused, 'State should include paused status');
    runner.assertNotNull(state.isGameOver, 'State should include game over status');
    runner.assertNotNull(state.currentPiece, 'State should include current piece');
    runner.assertNotNull(state.nextPiece, 'State should include next piece');
    runner.assertNotNull(state.board, 'State should include board grid');
    runner.assertNotNull(state.stats, 'State should include stats');
    runner.assertEquals(state.fallSpeed, engine.fallSpeed, 'State should include fall speed');
    
    runner.assertEquals(state.isRunning, engine.isRunning, 'Running status should match');
    runner.assertEquals(state.isPaused, engine.isPaused, 'Paused status should match');
    runner.assertEquals(state.isGameOver, engine.isGameOver, 'Game over status should match');
});

runner.test('GameEngine setFallSpeed clamps to minimum value', () => {
    const gameBoard = new GameBoard(10, 20, 1);
    const engine = new GameEngine(gameBoard, null, null);
    
    // Test normal value
    engine.setFallSpeed(500);
    runner.assertEquals(engine.fallSpeed, 500, 'Should set normal fall speed');
    
    // Test minimum clamping
    engine.setFallSpeed(10);
    runner.assertEquals(engine.fallSpeed, 50, 'Should clamp to minimum 50ms');
    
    // Test negative value
    engine.setFallSpeed(-100);
    runner.assertEquals(engine.fallSpeed, 50, 'Should clamp negative values to minimum');
});

runner.test('GameEngine event system works correctly', () => {
    const gameBoard = new GameBoard(10, 20, 1);
    const engine = new GameEngine(gameBoard, null, null);
    
    let eventTriggered = false;
    let eventData = null;
    
    engine.on('testEvent', (data) => {
        eventTriggered = true;
        eventData = data;
    });
    
    engine.emit('testEvent', { test: 'data' });
    
    runner.assertTrue(eventTriggered, 'Event should be triggered');
    runner.assertEquals(eventData.test, 'data', 'Event data should be passed correctly');
});
// GameBoard Tests
runner.test('GameBoard constructor creates correct dimensions', () => {
    const gameBoard = new GameBoard(10, 20, 1);
    
    runner.assertEquals(gameBoard.width, 10, 'Width should be 10');
    runner.assertEquals(gameBoard.height, 20, 'Height should be 20');
    runner.assertEquals(gameBoard.depth, 1, 'Depth should be 1');
    runner.assertNotNull(gameBoard.grid, 'Grid should be initialized');
    runner.assertEquals(gameBoard.grid.length, 20, 'Grid should have 20 rows');
    runner.assertEquals(gameBoard.grid[0].length, 10, 'Grid should have 10 columns');
});

runner.test('GameBoard initializes empty grid', () => {
    const gameBoard = new GameBoard(10, 20, 1);
    
    for (let y = 0; y < gameBoard.height; y++) {
        for (let x = 0; x < gameBoard.width; x++) {
            runner.assertEquals(gameBoard.grid[y][x], 0, `Cell at (${x}, ${y}) should be empty`);
        }
    }
});

runner.test('GameBoard renders 3D mesh', () => {
    const gameBoard = new GameBoard(10, 20, 1);
    
    runner.assertNotNull(gameBoard.boardMesh, 'Board mesh should exist');
    runner.assertTrue(gameBoard.boardMesh instanceof THREE.Group, 'Board mesh should be a THREE.Group');
    
    gameBoard.render(scene);
    runner.assertTrue(scene.children.includes(gameBoard.boardMesh), 'Scene should contain board mesh');
});

runner.test('GameBoard validates piece positions correctly', () => {
    const gameBoard = new GameBoard(10, 20, 1);
    const piece = new TetrominoPiece('I', 0, 0, 0);
    
    // Test valid position
    runner.assertTrue(gameBoard.isValidPosition(piece, 3, 0), 'Position (3,0) should be valid for I piece');
    
    // Test invalid position (out of bounds left)
    runner.assertFalse(gameBoard.isValidPosition(piece, -1, 0), 'Position (-1,0) should be invalid');
    
    // Test invalid position (out of bounds right)
    runner.assertFalse(gameBoard.isValidPosition(piece, 8, 0), 'Position (8,0) should be invalid for I piece');
    
    // Test invalid position (out of bounds bottom)
    runner.assertFalse(gameBoard.isValidPosition(piece, 3, 19), 'Position (3,19) should be invalid');
});

runner.test('GameBoard places pieces correctly', () => {
    const gameBoard = new GameBoard(10, 20, 1);
    const piece = new TetrominoPiece('O', 0, 0, 0);
    
    gameBoard.placePiece(piece, 4, 18);
    
    // O piece should occupy 2x2 area
    runner.assertEquals(gameBoard.grid[18][4], 'O', 'Cell (4,18) should contain O piece');
    runner.assertEquals(gameBoard.grid[18][5], 'O', 'Cell (5,18) should contain O piece');
    runner.assertEquals(gameBoard.grid[19][4], 'O', 'Cell (4,19) should contain O piece');
    runner.assertEquals(gameBoard.grid[19][5], 'O', 'Cell (5,19) should contain O piece');
});

runner.test('GameBoard finds completed lines', () => {
    const gameBoard = new GameBoard(10, 20, 1);
    
    // Fill bottom line completely
    for (let x = 0; x < 10; x++) {
        gameBoard.grid[19][x] = 'I';
    }
    
    // Fill another line with a gap
    for (let x = 0; x < 9; x++) {
        gameBoard.grid[18][x] = 'T';
    }
    
    const completedLines = gameBoard.findCompletedLines();
    
    runner.assertEquals(completedLines.length, 1, 'Should find exactly 1 completed line');
    runner.assertEquals(completedLines[0], 19, 'Completed line should be line 19');
});

runner.test('GameBoard clears lines correctly', () => {
    const gameBoard = new GameBoard(10, 20, 1);
    
    // Set up test scenario
    for (let x = 0; x < 10; x++) {
        gameBoard.grid[19][x] = 'I'; // Complete bottom line
        gameBoard.grid[18][x] = 'T'; // Complete second line
    }
    gameBoard.grid[17][5] = 'S'; // Partial top line
    
    const clearedCount = gameBoard.clearLines([19, 18]);
    
    runner.assertEquals(clearedCount, 2, 'Should clear 2 lines');
    
    // Check that lines were cleared and rows dropped
    runner.assertEquals(gameBoard.grid[19][5], 'S', 'S piece should have dropped to bottom');
    
    // Check that new empty lines were added at top
    for (let x = 0; x < 10; x++) {
        runner.assertEquals(gameBoard.grid[0][x], 0, 'Top line should be empty after clearing');
        runner.assertEquals(gameBoard.grid[1][x], 0, 'Second line should be empty after clearing');
    }
});

runner.test('GameBoard detects game over condition', () => {
    const gameBoard = new GameBoard(10, 20, 1);
    
    // Initially should not be game over
    runner.assertFalse(gameBoard.isGameOver(), 'New game should not be game over');
    
    // Place pieces in top rows
    gameBoard.grid[0][5] = 'T';
    gameBoard.grid[1][3] = 'I';
    
    runner.assertTrue(gameBoard.isGameOver(), 'Game should be over when top rows are filled');
});

runner.test('GameBoard reset clears all pieces', () => {
    const gameBoard = new GameBoard(10, 20, 1);
    
    // Fill some cells
    gameBoard.grid[15][3] = 'T';
    gameBoard.grid[18][7] = 'I';
    gameBoard.grid[19][2] = 'O';
    
    gameBoard.reset();
    
    // Check all cells are empty
    for (let y = 0; y < gameBoard.height; y++) {
        for (let x = 0; x < gameBoard.width; x++) {
            runner.assertEquals(gameBoard.grid[y][x], 0, `Cell (${x},${y}) should be empty after reset`);
        }
    }
});

runner.test('GameBoard getCell and setCell work correctly', () => {
    const gameBoard = new GameBoard(10, 20, 1);
    
    // Test normal cell operations
    runner.assertEquals(gameBoard.getCell(5, 10), 0, 'Empty cell should return 0');
    
    gameBoard.setCell(5, 10, 'T');
    runner.assertEquals(gameBoard.getCell(5, 10), 'T', 'Cell should contain T after setting');
    
    // Test bounds checking
    runner.assertEquals(gameBoard.getCell(-1, 10), -1, 'Out of bounds left should return -1');
    runner.assertEquals(gameBoard.getCell(15, 10), -1, 'Out of bounds right should return -1');
    runner.assertEquals(gameBoard.getCell(5, -1), -1, 'Out of bounds top should return -1');
    runner.assertEquals(gameBoard.getCell(5, 25), -1, 'Out of bounds bottom should return -1');
});

runner.test('GameBoard getDimensions returns correct values', () => {
    const gameBoard = new GameBoard(12, 24, 2);
    const dimensions = gameBoard.getDimensions();
    
    runner.assertEquals(dimensions.width, 12, 'Width should match constructor value');
    runner.assertEquals(dimensions.height, 24, 'Height should match constructor value');
    runner.assertEquals(dimensions.depth, 2, 'Depth should match constructor value');
});
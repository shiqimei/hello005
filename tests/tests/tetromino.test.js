// TetrominoPiece Tests
runner.test('TetrominoPiece constructor creates piece with correct properties', () => {
    const piece = new TetrominoPiece('I', 3, 0, 0);
    
    runner.assertEquals(piece.type, 'I', 'Piece type should be I');
    runner.assertEquals(piece.x, 3, 'X position should be 3');
    runner.assertEquals(piece.y, 0, 'Y position should be 0');
    runner.assertEquals(piece.z, 0, 'Z position should be 0');
    runner.assertEquals(piece.rotation, 0, 'Initial rotation should be 0');
    runner.assertNotNull(piece.config, 'Piece config should be loaded');
    runner.assertEquals(piece.config.color, 0x00FFFF, 'I piece should be cyan');
});

runner.test('TetrominoPiece creates 3D mesh correctly', () => {
    const piece = new TetrominoPiece('T', 0, 0, 0);
    
    runner.assertNotNull(piece.mesh, 'Piece mesh should exist');
    runner.assertTrue(piece.mesh instanceof THREE.Group, 'Piece mesh should be a THREE.Group');
    runner.assertTrue(piece.blocks.length > 0, 'Piece should have blocks');
    
    piece.render(scene);
    runner.assertTrue(scene.children.includes(piece.mesh), 'Scene should contain piece mesh');
});

runner.test('TetrominoPiece all standard pieces have correct shapes', () => {
    const pieceTypes = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    
    pieceTypes.forEach(type => {
        const piece = new TetrominoPiece(type, 0, 0, 0);
        runner.assertNotNull(piece.config, `${type} piece should have config`);
        runner.assertTrue(piece.config.shapes.length > 0, `${type} piece should have at least one shape`);
        runner.assertNotNull(piece.config.color, `${type} piece should have color`);
        runner.assertEquals(piece.config.name, type, `${type} piece should have correct name`);
    });
});

runner.test('TetrominoPiece rotation works correctly', () => {
    const piece = new TetrominoPiece('I', 0, 0, 0);
    const initialRotation = piece.rotation;
    const initialShape = piece.getCurrentShape();
    
    // Rotate clockwise
    const rotated = piece.rotate('clockwise');
    runner.assertTrue(rotated, 'Rotation should succeed');
    runner.assertEquals(piece.rotation, 1, 'Rotation should be 1 after clockwise rotation');
    
    const newShape = piece.getCurrentShape();
    runner.assertNotNull(newShape, 'New shape should exist after rotation');
    
    // For I piece, rotation should change the shape
    const shapesAreDifferent = JSON.stringify(initialShape) !== JSON.stringify(newShape);
    runner.assertTrue(shapesAreDifferent, 'Shape should change after rotation');
    
    // Rotate back
    piece.rotate('counterclockwise');
    runner.assertEquals(piece.rotation, 0, 'Rotation should be back to 0');
});

runner.test('TetrominoPiece O piece rotation handling', () => {
    const piece = new TetrominoPiece('O', 0, 0, 0);
    const initialShape = piece.getCurrentShape();
    
    // O piece should have only one shape (doesn't actually rotate)
    runner.assertEquals(piece.config.shapes.length, 1, 'O piece should have only one shape');
    
    piece.rotate('clockwise');
    const rotatedShape = piece.getCurrentShape();
    
    // Shape should be the same since O piece doesn't change
    runner.assertEquals(JSON.stringify(initialShape), JSON.stringify(rotatedShape), 
                       'O piece shape should not change after rotation');
});

runner.test('TetrominoPiece movement updates position correctly', () => {
    const piece = new TetrominoPiece('T', 5, 10, 0);
    
    piece.move(1, 1, 0);
    
    runner.assertEquals(piece.x, 6, 'X should increase by 1');
    runner.assertEquals(piece.y, 11, 'Y should increase by 1');
    runner.assertEquals(piece.z, 0, 'Z should remain the same');
});

runner.test('TetrominoPiece setPosition works correctly', () => {
    const piece = new TetrominoPiece('J', 0, 0, 0);
    
    piece.setPosition(7, 15, 2);
    
    runner.assertEquals(piece.x, 7, 'X should be set to 7');
    runner.assertEquals(piece.y, 15, 'Y should be set to 15');
    runner.assertEquals(piece.z, 2, 'Z should be set to 2');
});

runner.test('TetrominoPiece getBlocks returns correct block positions', () => {
    const piece = new TetrominoPiece('O', 5, 10, 0);
    const blocks = piece.getBlocks();
    
    runner.assertEquals(blocks.length, 4, 'O piece should have 4 blocks');
    
    blocks.forEach(block => {
        runner.assertNotNull(block.x, 'Block should have x coordinate');
        runner.assertNotNull(block.y, 'Block should have y coordinate');
        runner.assertNotNull(block.z, 'Block should have z coordinate');
        runner.assertNotNull(block.color, 'Block should have color');
        runner.assertEquals(block.color, 0xFFFF00, 'O piece blocks should be yellow');
    });
    
    // Check that blocks are positioned relative to piece position
    const minX = Math.min(...blocks.map(b => b.x));
    const maxX = Math.max(...blocks.map(b => b.x));
    runner.assertTrue(minX >= 5, 'Blocks should be positioned relative to piece X');
    runner.assertTrue(maxX <= 6, 'O piece should span 2 columns');
});

runner.test('TetrominoPiece getBoundingBox calculates correctly', () => {
    const piece = new TetrominoPiece('I', 3, 5, 0);
    const bounds = piece.getBoundingBox();
    
    runner.assertNotNull(bounds.left, 'Bounds should have left');
    runner.assertNotNull(bounds.right, 'Bounds should have right');
    runner.assertNotNull(bounds.top, 'Bounds should have top');
    runner.assertNotNull(bounds.bottom, 'Bounds should have bottom');
    
    runner.assertTrue(bounds.left <= bounds.right, 'Left should be <= right');
    runner.assertTrue(bounds.top <= bounds.bottom, 'Top should be <= bottom');
});

runner.test('TetrominoPiece clone creates independent copy', () => {
    const original = new TetrominoPiece('T', 3, 5, 0);
    original.rotate('clockwise');
    
    const clone = original.clone();
    
    runner.assertEquals(clone.type, original.type, 'Clone should have same type');
    runner.assertEquals(clone.x, original.x, 'Clone should have same x position');
    runner.assertEquals(clone.y, original.y, 'Clone should have same y position');
    runner.assertEquals(clone.rotation, original.rotation, 'Clone should have same rotation');
    
    // Modify original and ensure clone is not affected
    original.move(1, 1, 0);
    original.rotate('clockwise');
    
    runner.assertEquals(clone.x, 3, 'Clone x should not change when original moves');
    runner.assertEquals(clone.y, 5, 'Clone y should not change when original moves');
});

runner.test('TetrominoPiece static methods work correctly', () => {
    // Test getRandomType
    const randomType = TetrominoPiece.getRandomType();
    const validTypes = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    runner.assertTrue(validTypes.includes(randomType), 'Random type should be valid');
    
    // Test createRandomPiece
    const randomPiece = TetrominoPiece.createRandomPiece(2, 3, 1);
    runner.assertTrue(validTypes.includes(randomPiece.type), 'Random piece should have valid type');
    runner.assertEquals(randomPiece.x, 2, 'Random piece should have specified x position');
    runner.assertEquals(randomPiece.y, 3, 'Random piece should have specified y position');
    runner.assertEquals(randomPiece.z, 1, 'Random piece should have specified z position');
    
    // Test createAllTypes
    const allPieces = TetrominoPiece.createAllTypes();
    runner.assertEquals(allPieces.length, 7, 'Should create all 7 piece types');
    
    const types = allPieces.map(piece => piece.type);
    validTypes.forEach(type => {
        runner.assertTrue(types.includes(type), `Should include ${type} piece`);
    });
});

runner.test('TetrominoPiece canRotate method works with board collision', () => {
    const gameBoard = new GameBoard(10, 20, 1);
    const piece = new TetrominoPiece('I', 0, 0, 0);
    
    // Test rotation at edge - should fail
    runner.assertFalse(piece.canRotate(gameBoard, 'clockwise'), 
                       'I piece at x=0 should not be able to rotate due to bounds');
    
    // Move to center and test rotation - should succeed
    piece.setPosition(4, 5, 0);
    runner.assertTrue(piece.canRotate(gameBoard, 'clockwise'), 
                      'I piece in center should be able to rotate');
});

runner.test('TetrominoPiece getTypeName and getColor return correct values', () => {
    const piece = new TetrominoPiece('S', 0, 0, 0);
    
    runner.assertEquals(piece.getTypeName(), 'S', 'Type name should match piece type');
    runner.assertEquals(piece.getColor(), 0x00FF00, 'S piece should be green');
});

runner.test('TetrominoPiece invalid type throws error', () => {
    let errorThrown = false;
    try {
        new TetrominoPiece('X', 0, 0, 0);
    } catch (error) {
        errorThrown = true;
        runner.assertTrue(error.message.includes('Invalid piece type'), 
                          'Should throw meaningful error for invalid type');
    }
    runner.assertTrue(errorThrown, 'Should throw error for invalid piece type');
});
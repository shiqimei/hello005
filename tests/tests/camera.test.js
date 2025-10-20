// CameraController Tests
runner.test('CameraController constructor initializes correctly', () => {
    const controller = new CameraController(camera, scene);
    
    runner.assertNotNull(controller.camera, 'Should store camera reference');
    runner.assertNotNull(controller.scene, 'Should store scene reference');
    runner.assertNotNull(controller.defaultPosition, 'Should have default position');
    runner.assertNotNull(controller.lookAtTarget, 'Should have look at target');
    runner.assertFalse(controller.isAnimating, 'Should not be animating initially');
    runner.assertFalse(controller.rotationEnabled, 'Rotation should be disabled initially');
    runner.assertEquals(controller.shakeIntensity, 0, 'Shake intensity should be 0 initially');
});

runner.test('CameraController setOptimalPosition sets camera correctly', () => {
    const controller = new CameraController(camera, scene);
    
    controller.setOptimalPosition();
    
    runner.assertEquals(camera.position.x, controller.defaultPosition.x, 'Camera X should match default');
    runner.assertEquals(camera.position.y, controller.defaultPosition.y, 'Camera Y should match default');
    runner.assertEquals(camera.position.z, controller.defaultPosition.z, 'Camera Z should match default');
});

runner.test('CameraController smoothTransition initiates animation', () => {
    const controller = new CameraController(camera, scene);
    const targetPosition = { x: 10, y: 15, z: 5 };
    
    runner.assertFalse(controller.isAnimating, 'Should not be animating initially');
    
    controller.smoothTransition(targetPosition, 500);
    
    runner.assertTrue(controller.isAnimating, 'Should be animating after transition start');
    runner.assertEquals(controller.animationTargetPosition.x, 10, 'Target X should be set');
    runner.assertEquals(controller.animationTargetPosition.y, 15, 'Target Y should be set');
    runner.assertEquals(controller.animationTargetPosition.z, 5, 'Target Z should be set');
    runner.assertEquals(controller.animationDuration, 500, 'Duration should be set');
});

runner.test('CameraController rotation enable and disable', () => {
    const controller = new CameraController(camera, scene);
    
    runner.assertFalse(controller.rotationEnabled, 'Rotation should be disabled initially');
    
    controller.enableRotation();
    runner.assertTrue(controller.rotationEnabled, 'Rotation should be enabled');
    
    controller.disableRotation();
    runner.assertFalse(controller.rotationEnabled, 'Rotation should be disabled again');
});

runner.test('CameraController rotation speed setting', () => {
    const controller = new CameraController(camera, scene);
    
    controller.setRotationSpeed(0.002);
    runner.assertEquals(controller.rotationSpeed, 0.002, 'Rotation speed should be set');
    
    // Test clamping
    controller.setRotationSpeed(0.01); // Above maximum
    runner.assertTrue(controller.rotationSpeed <= 0.005, 'Speed should be clamped to maximum');
    
    controller.setRotationSpeed(-0.001); // Below minimum
    runner.assertTrue(controller.rotationSpeed >= 0, 'Speed should be clamped to minimum (0)');
});

runner.test('CameraController shake effect', () => {
    const controller = new CameraController(camera, scene);
    const originalPosition = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
    
    controller.shake(0.5, 200);
    
    runner.assertEquals(controller.shakeIntensity, 0.5, 'Shake intensity should be set');
    runner.assertEquals(controller.shakeDuration, 200, 'Shake duration should be set');
    runner.assertTrue(controller.shakeStartTime > 0, 'Shake start time should be recorded');
    
    // Original position should be stored
    runner.assertEquals(controller.originalPosition.x, originalPosition.x, 'Original X should be stored');
    runner.assertEquals(controller.originalPosition.y, originalPosition.y, 'Original Y should be stored');
    runner.assertEquals(controller.originalPosition.z, originalPosition.z, 'Original Z should be stored');
});

runner.test('CameraController position presets work correctly', () => {
    const controller = new CameraController(camera, scene);
    
    // Test top view
    controller.setTopView();
    runner.assertTrue(controller.isAnimating, 'Should start animation for top view');
    runner.assertEquals(controller.animationTargetPosition.y, 15, 'Top view should target high Y position');
    
    // Reset animation state for next test
    controller.isAnimating = false;
    
    // Test side view
    controller.setSideView();
    runner.assertTrue(controller.isAnimating, 'Should start animation for side view');
    runner.assertEquals(controller.animationTargetPosition.x, 12, 'Side view should target side X position');
    
    // Reset animation state for next test
    controller.isAnimating = false;
    
    // Test isometric view
    controller.setIsometricView();
    runner.assertTrue(controller.isAnimating, 'Should start animation for isometric view');
    runner.assertEquals(controller.animationTargetPosition.x, 8, 'Isometric view should target diagonal position');
    runner.assertEquals(controller.animationTargetPosition.z, 8, 'Isometric view should target diagonal position');
});

runner.test('CameraController zoom functions work correctly', () => {
    const controller = new CameraController(camera, scene);
    camera.position.set(8, 12, 8); // Set known position
    
    const originalDistance = Math.sqrt(8*8 + 12*12 + 8*8);
    
    controller.zoomIn(0.8);
    runner.assertTrue(controller.isAnimating, 'Zoom in should start animation');
    
    const targetDistance = Math.sqrt(
        controller.animationTargetPosition.x ** 2 + 
        controller.animationTargetPosition.y ** 2 + 
        controller.animationTargetPosition.z ** 2
    );
    
    runner.assertTrue(targetDistance < originalDistance, 'Zoom in should reduce distance');
});

runner.test('CameraController focus methods work correctly', () => {
    const controller = new CameraController(camera, scene);
    
    controller.focusOnArea(5, -3, 2);
    
    runner.assertEquals(controller.lookAtTarget.x, 5, 'Look at target X should be updated');
    runner.assertEquals(controller.lookAtTarget.y, -3, 'Look at target Y should be updated');
    runner.assertEquals(controller.lookAtTarget.z, 2, 'Look at target Z should be updated');
    
    controller.resetFocus();
    
    runner.assertEquals(controller.lookAtTarget.x, 0, 'Look at target X should be reset');
    runner.assertEquals(controller.lookAtTarget.y, 0, 'Look at target Y should be reset');
    runner.assertEquals(controller.lookAtTarget.z, 0, 'Look at target Z should be reset');
});

runner.test('CameraController game event responses work correctly', () => {
    const controller = new CameraController(camera, scene);
    
    // Test line clear response
    controller.onLineClear([18, 17]);
    runner.assertTrue(controller.shakeDuration > 0, 'Line clear should trigger shake');
    
    // Reset shake
    controller.shakeDuration = 0;
    
    // Test tetris response
    controller.onTetris();
    runner.assertTrue(controller.shakeDuration > 0, 'Tetris should trigger shake');
    runner.assertTrue(controller.shakeIntensity >= 1.0, 'Tetris shake should be intense');
    
    // Test game over response
    controller.onGameOver();
    runner.assertTrue(controller.isAnimating, 'Game over should trigger camera movement');
    
    // Test level up response
    controller.onLevelUp(5);
    runner.assertTrue(controller.isAnimating, 'Level up should trigger camera movement');
});

runner.test('CameraController lerp utility function works correctly', () => {
    const controller = new CameraController(camera, scene);
    
    runner.assertEquals(controller.lerp(0, 10, 0), 0, 'Lerp at 0% should return start');
    runner.assertEquals(controller.lerp(0, 10, 1), 10, 'Lerp at 100% should return end');
    runner.assertEquals(controller.lerp(0, 10, 0.5), 5, 'Lerp at 50% should return middle');
    runner.assertEquals(controller.lerp(5, 15, 0.3), 8, 'Lerp should interpolate correctly');
});

runner.test('CameraController getDistance utility works correctly', () => {
    const controller = new CameraController(camera, scene);
    
    const pos1 = { x: 0, y: 0, z: 0 };
    const pos2 = { x: 3, y: 4, z: 0 };
    
    const distance = controller.getDistance(pos1, pos2);
    runner.assertEquals(distance, 5, 'Distance should be calculated correctly (3-4-5 triangle)');
    
    const pos3 = { x: 1, y: 1, z: 1 };
    const pos4 = { x: 1, y: 1, z: 1 };
    
    const sameDistance = controller.getDistance(pos3, pos4);
    runner.assertEquals(sameDistance, 0, 'Distance between same points should be 0');
});

runner.test('CameraController getState returns current camera state', () => {
    const controller = new CameraController(camera, scene);
    camera.position.set(5, 8, 3);
    controller.rotationEnabled = true;
    controller.rotationSpeed = 0.002;
    
    const state = controller.getState();
    
    runner.assertEquals(state.position.x, 5, 'State should include current X position');
    runner.assertEquals(state.position.y, 8, 'State should include current Y position');
    runner.assertEquals(state.position.z, 3, 'State should include current Z position');
    runner.assertEquals(state.isRotating, true, 'State should include rotation status');
    runner.assertEquals(state.rotationSpeed, 0.002, 'State should include rotation speed');
    runner.assertNotNull(state.lookAt, 'State should include look at target');
});

runner.test('CameraController save and restore position works correctly', () => {
    const controller = new CameraController(camera, scene);
    
    // Set camera to specific position
    camera.position.set(7, 11, 4);
    controller.lookAtTarget = { x: 2, y: -1, z: 3 };
    controller.rotationAngle = 1.5;
    
    // Save position
    const savedState = controller.savePosition();
    
    runner.assertEquals(savedState.position.x, 7, 'Saved state should include X position');
    runner.assertEquals(savedState.position.y, 11, 'Saved state should include Y position');
    runner.assertEquals(savedState.position.z, 4, 'Saved state should include Z position');
    runner.assertEquals(savedState.rotationAngle, 1.5, 'Saved state should include rotation angle');
    
    // Change position
    camera.position.set(0, 0, 0);
    controller.lookAtTarget = { x: 0, y: 0, z: 0 };
    controller.rotationAngle = 0;
    
    // Restore position
    controller.restorePosition(savedState);
    
    runner.assertEquals(camera.position.x, 7, 'Position X should be restored');
    runner.assertEquals(camera.position.y, 11, 'Position Y should be restored');
    runner.assertEquals(camera.position.z, 4, 'Position Z should be restored');
    runner.assertEquals(controller.rotationAngle, 1.5, 'Rotation angle should be restored');
});

runner.test('CameraController low performance mode works correctly', () => {
    const controller = new CameraController(camera, scene);
    
    controller.enableRotation();
    controller.setRotationSpeed(0.003);
    
    runner.assertTrue(controller.rotationEnabled, 'Rotation should be enabled initially');
    runner.assertEquals(controller.rotationSpeed, 0.003, 'Rotation speed should be set');
    
    controller.setLowPerformanceMode(true);
    
    runner.assertFalse(controller.rotationEnabled, 'Rotation should be disabled in low performance mode');
    runner.assertEquals(controller.rotationSpeed, 0, 'Rotation speed should be 0');
    
    controller.setLowPerformanceMode(false);
    
    runner.assertEquals(controller.rotationSpeed, 0.0005, 'Rotation speed should be restored');
});
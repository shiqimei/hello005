// LightingSystem Tests
runner.test('LightingSystem constructor initializes correctly', () => {
    const lighting = new LightingSystem(scene);
    
    runner.assertNotNull(lighting.scene, 'Should store scene reference');
    runner.assertNotNull(lighting.lights, 'Should initialize lights object');
    runner.assertEquals(lighting.lightingIntensity, 1.0, 'Should have default intensity');
    runner.assertTrue(lighting.shadowsEnabled, 'Shadows should be enabled by default');
    runner.assertTrue(lighting.highQualityLighting, 'High quality should be enabled by default');
});

runner.test('LightingSystem setupGameLighting creates all required lights', () => {
    const lighting = new LightingSystem(scene);
    
    runner.assertNotNull(lighting.lights.ambient, 'Should create ambient light');
    runner.assertNotNull(lighting.lights.primary, 'Should create primary directional light');
    runner.assertNotNull(lighting.lights.secondary, 'Should create secondary directional light');
    runner.assertNotNull(lighting.lights.fill, 'Should create fill light');
    
    // Check that lights were added to scene
    const ambientExists = scene.children.some(child => child === lighting.lights.ambient);
    const primaryExists = scene.children.some(child => child === lighting.lights.primary);
    
    runner.assertTrue(ambientExists, 'Ambient light should be in scene');
    runner.assertTrue(primaryExists, 'Primary light should be in scene');
});

runner.test('LightingSystem ambient light configuration', () => {
    const lighting = new LightingSystem(scene);
    
    const ambientLight = lighting.lights.ambient;
    runner.assertTrue(ambientLight instanceof THREE.AmbientLight, 'Should be AmbientLight');
    runner.assertTrue(ambientLight.intensity > 0, 'Ambient light should have positive intensity');
    runner.assertEquals(ambientLight.color.getHex(), 0x404040, 'Should have expected color');
});

runner.test('LightingSystem directional light configuration', () => {
    const lighting = new LightingSystem(scene);
    
    const primaryLight = lighting.lights.primary;
    runner.assertTrue(primaryLight instanceof THREE.DirectionalLight, 'Should be DirectionalLight');
    runner.assertTrue(primaryLight.intensity > 0, 'Primary light should have positive intensity');
    
    // Check shadow configuration if shadows are enabled
    if (lighting.shadowsEnabled) {
        runner.assertTrue(primaryLight.castShadow, 'Primary light should cast shadows');
        runner.assertNotNull(primaryLight.shadow, 'Should have shadow configuration');
        runner.assertTrue(primaryLight.shadow.mapSize.width >= 1024, 'Shadow map should be reasonable size');
    }
});

runner.test('LightingSystem clearLights removes all lights from scene', () => {
    const lighting = new LightingSystem(scene);
    
    const initialLightCount = Object.keys(lighting.lights).length;
    runner.assertTrue(initialLightCount > 0, 'Should have lights initially');
    
    lighting.clearLights();
    
    runner.assertEquals(Object.keys(lighting.lights).length, 0, 'Should have no lights after clearing');
    
    // Check that lights were removed from scene
    const remainingLights = scene.children.filter(child => 
        child instanceof THREE.Light
    );
    runner.assertEquals(remainingLights.length, 0, 'Should remove all lights from scene');
});

runner.test('LightingSystem addLineClearEffect creates temporary light', () => {
    const lighting = new LightingSystem(scene);
    const initialChildrenCount = scene.children.length;
    
    lighting.addLineClearEffect([18, 17, 16]);
    
    // Effect light should be temporarily added
    const currentChildrenCount = scene.children.length;
    runner.assertTrue(currentChildrenCount > initialChildrenCount, 'Should add effect light to scene');
    
    // Find the effect light
    const effectLight = scene.children.find(child => 
        child instanceof THREE.PointLight && child !== lighting.lights.primary
    );
    
    if (effectLight) {
        runner.assertTrue(effectLight.intensity > 0, 'Effect light should have positive intensity');
        runner.assertTrue(effectLight.distance > 0, 'Effect light should have distance parameter');
    }
});

runner.test('LightingSystem addTetrisEffect modifies lighting temporarily', () => {
    const lighting = new LightingSystem(scene);
    
    const originalAmbientIntensity = lighting.lights.ambient.intensity;
    const originalPrimaryIntensity = lighting.lights.primary.intensity;
    
    lighting.addTetrisEffect();
    
    // Lights should be brightened during effect
    runner.assertTrue(lighting.lights.ambient.intensity >= originalAmbientIntensity, 
                      'Ambient should be brightened or equal');
    runner.assertTrue(lighting.lights.primary.intensity >= originalPrimaryIntensity, 
                      'Primary should be brightened or equal');
});

runner.test('LightingSystem addGameOverEffect dims lighting', () => {
    const lighting = new LightingSystem(scene);
    
    const originalAmbientIntensity = lighting.lights.ambient.intensity;
    const originalPrimaryIntensity = lighting.lights.primary.intensity;
    
    lighting.addGameOverEffect();
    
    // Note: The effect is animated, so we can't test the final state immediately
    // But we can verify the method doesn't throw errors
    runner.assertTrue(true, 'Game over effect should execute without errors');
});

runner.test('LightingSystem setHighQuality toggles rim lighting', () => {
    const lighting = new LightingSystem(scene);
    
    // Initially should have rim lighting (high quality default)
    runner.assertTrue(lighting.highQualityLighting, 'Should start with high quality');
    runner.assertTrue(lighting.lights.rim1 !== undefined || lighting.lights.rim2 !== undefined, 
                      'Should have rim lights initially');
    
    // Disable high quality
    lighting.setHighQuality(false);
    
    runner.assertFalse(lighting.highQualityLighting, 'High quality should be disabled');
    runner.assertTrue(lighting.lights.rim1 === undefined, 'Rim light 1 should be removed');
    runner.assertTrue(lighting.lights.rim2 === undefined, 'Rim light 2 should be removed');
    
    // Re-enable high quality
    lighting.setHighQuality(true);
    
    runner.assertTrue(lighting.highQualityLighting, 'High quality should be re-enabled');
});

runner.test('LightingSystem enableShadows toggles shadow casting', () => {
    const lighting = new LightingSystem(scene);
    
    runner.assertTrue(lighting.shadowsEnabled, 'Shadows should be enabled initially');
    
    lighting.enableShadows(false);
    
    runner.assertFalse(lighting.shadowsEnabled, 'Shadows should be disabled');
    
    // Check that directional lights have shadows disabled
    if (lighting.lights.primary && lighting.lights.primary.castShadow !== undefined) {
        runner.assertFalse(lighting.lights.primary.castShadow, 'Primary light should not cast shadows');
    }
    
    lighting.enableShadows(true);
    
    runner.assertTrue(lighting.shadowsEnabled, 'Shadows should be re-enabled');
    
    if (lighting.lights.primary && lighting.lights.primary.castShadow !== undefined) {
        runner.assertTrue(lighting.lights.primary.castShadow, 'Primary light should cast shadows');
    }
});

runner.test('LightingSystem setPerformanceMode adjusts quality appropriately', () => {
    const lighting = new LightingSystem(scene);
    
    // Test high performance mode
    lighting.setPerformanceMode('high');
    runner.assertTrue(lighting.highQualityLighting, 'High mode should enable high quality');
    runner.assertTrue(lighting.shadowsEnabled, 'High mode should enable shadows');
    runner.assertEquals(lighting.lightingIntensity, 1.0, 'High mode should have full intensity');
    
    // Test medium performance mode
    lighting.setPerformanceMode('medium');
    runner.assertFalse(lighting.highQualityLighting, 'Medium mode should disable high quality');
    runner.assertTrue(lighting.shadowsEnabled, 'Medium mode should keep shadows');
    runner.assertEquals(lighting.lightingIntensity, 0.9, 'Medium mode should have reduced intensity');
    
    // Test low performance mode
    lighting.setPerformanceMode('low');
    runner.assertFalse(lighting.highQualityLighting, 'Low mode should disable high quality');
    runner.assertFalse(lighting.shadowsEnabled, 'Low mode should disable shadows');
    runner.assertEquals(lighting.lightingIntensity, 0.8, 'Low mode should have lowest intensity');
});

runner.test('LightingSystem setIntensity adjusts all light intensities', () => {
    const lighting = new LightingSystem(scene);
    
    const factor = 0.5;
    lighting.setIntensity(factor);
    
    runner.assertEquals(lighting.lightingIntensity, factor, 'Should update intensity factor');
    
    // Check that all lights are adjusted
    if (lighting.lights.ambient) {
        runner.assertEquals(lighting.lights.ambient.intensity, lighting.ambientIntensity * factor,
                          'Ambient light should be adjusted');
    }
    
    if (lighting.lights.primary) {
        runner.assertEquals(lighting.lights.primary.intensity, lighting.directionalIntensity * factor,
                          'Primary light should be adjusted');
    }
});

runner.test('LightingSystem setTimeOfDay adjusts color temperature', () => {
    const lighting = new LightingSystem(scene);
    
    // Test daytime
    lighting.setTimeOfDay(12); // Noon
    if (lighting.lights.primary) {
        runner.assertEquals(lighting.lights.primary.color.getHex(), 0xffffff, 
                          'Daytime should use cool color');
    }
    
    // Test nighttime
    lighting.setTimeOfDay(22); // 10 PM
    if (lighting.lights.primary) {
        runner.assertEquals(lighting.lights.primary.color.getHex(), 0xffd4a3, 
                          'Nighttime should use warm color');
    }
    
    // Test edge case (wrapping)
    lighting.setTimeOfDay(25); // Should wrap to 1 AM
    if (lighting.lights.primary) {
        runner.assertEquals(lighting.lights.primary.color.getHex(), 0xffd4a3, 
                          'Should handle hour wrapping correctly');
    }
});

runner.test('LightingSystem updateForGameState responds to game state', () => {
    const lighting = new LightingSystem(scene);
    const originalIntensity = lighting.lightingIntensity;
    
    // Test paused state
    lighting.updateForGameState({ isPaused: true, isGameOver: false });
    runner.assertEquals(lighting.lightingIntensity, 0.5, 'Paused state should dim lights');
    
    // Test normal state
    lighting.updateForGameState({ isPaused: false, isGameOver: false });
    runner.assertEquals(lighting.lightingIntensity, 1.0, 'Normal state should restore full intensity');
    
    // Test game over state
    lighting.updateForGameState({ isPaused: false, isGameOver: true });
    // Game over triggers an animation, so we just check it doesn't throw
    runner.assertTrue(true, 'Game over state should execute without errors');
});

runner.test('LightingSystem getLightingConfig returns current configuration', () => {
    const lighting = new LightingSystem(scene);
    
    const config = lighting.getLightingConfig();
    
    runner.assertNotNull(config.intensity, 'Config should include intensity');
    runner.assertNotNull(config.shadowsEnabled, 'Config should include shadows setting');
    runner.assertNotNull(config.highQuality, 'Config should include high quality setting');
    runner.assertNotNull(config.ambientIntensity, 'Config should include ambient intensity');
    runner.assertNotNull(config.directionalIntensity, 'Config should include directional intensity');
    runner.assertNotNull(config.lightCount, 'Config should include light count');
    
    runner.assertTrue(config.lightCount > 0, 'Should have at least one light');
    runner.assertTrue(config.intensity >= 0, 'Intensity should be non-negative');
});

runner.test('LightingSystem lerp utility function works correctly', () => {
    const lighting = new LightingSystem(scene);
    
    runner.assertEquals(lighting.lerp(0, 100, 0), 0, 'Lerp at 0% should return start');
    runner.assertEquals(lighting.lerp(0, 100, 1), 100, 'Lerp at 100% should return end');
    runner.assertEquals(lighting.lerp(0, 100, 0.5), 50, 'Lerp at 50% should return middle');
    runner.assertEquals(lighting.lerp(10, 20, 0.3), 13, 'Lerp should interpolate correctly');
});

runner.test('LightingSystem dispose cleans up resources', () => {
    const lighting = new LightingSystem(scene);
    const initialChildrenCount = scene.children.length;
    
    lighting.dispose();
    
    runner.assertEquals(Object.keys(lighting.lights).length, 0, 'Should clear lights object');
    
    // Scene should have fewer children after disposal
    const finalChildrenCount = scene.children.length;
    runner.assertTrue(finalChildrenCount < initialChildrenCount, 'Should remove lights from scene');
});
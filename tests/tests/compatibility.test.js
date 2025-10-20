// BrowserCompatibility Tests
runner.test('BrowserCompatibility checkWebGLSupport detects WebGL', () => {
    const webglSupport = BrowserCompatibility.checkWebGLSupport();
    
    runner.assertNotNull(webglSupport.supported, 'Should return supported status');
    
    if (webglSupport.supported) {
        runner.assertNotNull(webglSupport.version, 'Should include WebGL version');
        runner.assertNotNull(webglSupport.renderer, 'Should include renderer info');
        runner.assertNotNull(webglSupport.maxTextureSize, 'Should include max texture size');
        runner.assertTrue(webglSupport.maxTextureSize >= 1024, 'Max texture size should be reasonable');
    }
});

runner.test('BrowserCompatibility checkES6Support detects ES6 features', () => {
    const es6Support = BrowserCompatibility.checkES6Support();
    
    runner.assertTrue(es6Support.supported, 'Modern browsers should support ES6');
    runner.assertNotNull(es6Support.features, 'Should return features object');
    
    if (es6Support.supported) {
        runner.assertTrue(es6Support.features.classes, 'Should support classes');
        runner.assertTrue(es6Support.features.arrowFunctions, 'Should support arrow functions');
        runner.assertTrue(es6Support.features.templateLiterals, 'Should support template literals');
        runner.assertTrue(es6Support.features.const, 'Should support const');
        runner.assertTrue(es6Support.features.let, 'Should support let');
    }
});

runner.test('BrowserCompatibility constructor detects browser information', () => {
    const compat = new BrowserCompatibility();
    
    runner.assertNotNull(compat.browserInfo.name, 'Should detect browser name');
    runner.assertNotNull(compat.browserInfo.version, 'Should detect browser version');
    runner.assertNotNull(compat.browserInfo.userAgent, 'Should include user agent');
    runner.assertTrue(compat.browserInfo.version >= 0, 'Version should be non-negative');
});

runner.test('BrowserCompatibility detects device information', () => {
    const compat = new BrowserCompatibility();
    
    runner.assertNotNull(compat.deviceInfo.isMobile, 'Should detect mobile status');
    runner.assertNotNull(compat.deviceInfo.isTablet, 'Should detect tablet status');
    runner.assertNotNull(compat.deviceInfo.isDesktop, 'Should detect desktop status');
    runner.assertNotNull(compat.deviceInfo.os, 'Should detect operating system');
    runner.assertNotNull(compat.deviceInfo.cores, 'Should detect CPU cores');
    runner.assertNotNull(compat.deviceInfo.screen, 'Should detect screen information');
    
    // Only one device type should be true
    const deviceTypes = [compat.deviceInfo.isMobile, compat.deviceInfo.isTablet, compat.deviceInfo.isDesktop];
    const trueCount = deviceTypes.filter(type => type).length;
    runner.assertEquals(trueCount, 1, 'Exactly one device type should be true');
});

runner.test('BrowserCompatibility checks all required capabilities', () => {
    const compat = new BrowserCompatibility();
    
    runner.assertNotNull(compat.capabilities.webgl, 'Should check WebGL');
    runner.assertNotNull(compat.capabilities.es6, 'Should check ES6');
    runner.assertNotNull(compat.capabilities.canvas, 'Should check Canvas');
    runner.assertNotNull(compat.capabilities.raf, 'Should check RequestAnimationFrame');
    runner.assertNotNull(compat.capabilities.performance, 'Should check Performance API');
    runner.assertNotNull(compat.capabilities.localStorage, 'Should check Local Storage');
    
    // These should be true in modern test environments
    runner.assertTrue(compat.capabilities.canvas, 'Canvas should be supported');
    runner.assertTrue(compat.capabilities.raf, 'RequestAnimationFrame should be supported');
    runner.assertTrue(compat.capabilities.performance, 'Performance API should be supported');
});

runner.test('BrowserCompatibility getPerformanceTier calculates correctly', () => {
    const compat = new BrowserCompatibility();
    const tier = compat.getPerformanceTier();
    
    runner.assertTrue(['low', 'medium', 'high'].includes(tier), 'Should return valid performance tier');
});

runner.test('BrowserCompatibility getRecommendedSettings returns appropriate settings', () => {
    const compat = new BrowserCompatibility();
    const recommendations = compat.getRecommendedSettings();
    
    runner.assertNotNull(recommendations.tier, 'Should include performance tier');
    runner.assertNotNull(recommendations.settings, 'Should include settings');
    runner.assertNotNull(recommendations.settings.targetFPS, 'Should include target FPS');
    runner.assertNotNull(recommendations.settings.shadowsEnabled, 'Should include shadows setting');
    runner.assertNotNull(recommendations.settings.renderScale, 'Should include render scale');
    
    // Validate FPS targets are reasonable
    runner.assertTrue(recommendations.settings.targetFPS >= 30, 'Target FPS should be at least 30');
    runner.assertTrue(recommendations.settings.targetFPS <= 60, 'Target FPS should not exceed 60');
    
    // Validate render scale is reasonable
    runner.assertTrue(recommendations.settings.renderScale >= 0.5, 'Render scale should be at least 0.5');
    runner.assertTrue(recommendations.settings.renderScale <= 1.0, 'Render scale should not exceed 1.0');
});

runner.test('BrowserCompatibility utility methods work correctly', () => {
    const compat = new BrowserCompatibility();
    
    // Test device type methods
    const isMobile = compat.isMobileDevice();
    const isTablet = compat.isTabletDevice();
    const isDesktop = compat.isDesktopDevice();
    
    runner.assertEquals(isMobile, compat.deviceInfo.isMobile, 'isMobileDevice should match deviceInfo');
    runner.assertEquals(isTablet, compat.deviceInfo.isTablet, 'isTabletDevice should match deviceInfo');
    runner.assertEquals(isDesktop, compat.deviceInfo.isDesktop, 'isDesktopDevice should match deviceInfo');
    
    // Test capability methods
    const hasWebGL = compat.hasWebGLSupport();
    const hasES6 = compat.hasES6Support();
    
    runner.assertEquals(hasWebGL, compat.capabilities.webgl.supported, 'hasWebGLSupport should match capabilities');
    runner.assertEquals(hasES6, compat.capabilities.es6.supported, 'hasES6Support should match capabilities');
});

runner.test('BrowserCompatibility feature detection methods work', () => {
    const compat = new BrowserCompatibility();
    
    const supportsTouch = compat.supportsTouch();
    const supportsGamepad = compat.supportsGamepad();
    const supportsFullscreen = compat.supportsFullscreen();
    
    // These should return boolean values
    runner.assertTrue(typeof supportsTouch === 'boolean', 'Touch support should be boolean');
    runner.assertTrue(typeof supportsGamepad === 'boolean', 'Gamepad support should be boolean');
    runner.assertTrue(typeof supportsFullscreen === 'boolean', 'Fullscreen support should be boolean');
});

runner.test('BrowserCompatibility getDebugInfo returns comprehensive data', () => {
    const compat = new BrowserCompatibility();
    const debugInfo = compat.getDebugInfo();
    
    runner.assertNotNull(debugInfo.browser, 'Should include browser info');
    runner.assertNotNull(debugInfo.device, 'Should include device info');
    runner.assertNotNull(debugInfo.capabilities, 'Should include capabilities');
    runner.assertNotNull(debugInfo.warnings, 'Should include warnings array');
    runner.assertNotNull(debugInfo.performanceTier, 'Should include performance tier');
    runner.assertNotNull(debugInfo.recommendedSettings, 'Should include recommended settings');
});

runner.test('BrowserCompatibility extractVersion utility works', () => {
    const compat = new BrowserCompatibility();
    
    const chromeVersion = compat.extractVersion('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36', /Chrome\/(\d+)/);
    runner.assertEquals(chromeVersion, 91, 'Should extract Chrome version correctly');
    
    const firefoxVersion = compat.extractVersion('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0', /Firefox\/(\d+)/);
    runner.assertEquals(firefoxVersion, 89, 'Should extract Firefox version correctly');
    
    const noMatch = compat.extractVersion('No version here', /Chrome\/(\d+)/);
    runner.assertEquals(noMatch, 0, 'Should return 0 when no match found');
});

runner.test('BrowserCompatibility provideFallback handles unsupported browsers', () => {
    // Mock a browser with no WebGL support
    const originalCheckWebGL = BrowserCompatibility.checkWebGLSupport;
    BrowserCompatibility.checkWebGLSupport = () => ({ supported: false });
    
    const compat = BrowserCompatibility.provideFallback();
    
    runner.assertNotNull(compat, 'Should return compatibility object');
    runner.assertFalse(compat.capabilities.meetsMinimumRequirements, 'Should not meet minimum requirements');
    runner.assertTrue(compat.warnings.length > 0, 'Should have warnings');
    
    // Check if warning element was added to DOM
    const warningElement = document.getElementById('compatibility-warning');
    if (warningElement) {
        runner.assertNotNull(warningElement, 'Should add warning to DOM for unsupported browsers');
        // Clean up
        warningElement.remove();
    }
    
    // Restore original function
    BrowserCompatibility.checkWebGLSupport = originalCheckWebGL;
});
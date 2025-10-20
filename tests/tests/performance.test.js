// PerformanceMonitor Tests
runner.test('PerformanceMonitor constructor initializes correctly', () => {
    const monitor = new PerformanceMonitor();
    
    runner.assertEquals(monitor.minFPS, 30, 'Default min FPS should be 30');
    runner.assertEquals(monitor.targetFPS, 60, 'Default target FPS should be 60');
    runner.assertFalse(monitor.isMonitoring, 'Should not be monitoring initially');
    runner.assertEquals(monitor.frames.length, 0, 'Frames array should be empty');
    runner.assertEquals(monitor.performanceLevel, 'high', 'Initial performance level should be high');
    runner.assertNotNull(monitor.metrics, 'Metrics should be initialized');
});

runner.test('PerformanceMonitor start and stop monitoring', () => {
    const monitor = new PerformanceMonitor();
    let startEventTriggered = false;
    let stopEventTriggered = false;
    
    monitor.on('monitoringStarted', () => { startEventTriggered = true; });
    monitor.on('monitoringStopped', () => { stopEventTriggered = true; });
    
    runner.assertFalse(monitor.isMonitoring, 'Should not be monitoring initially');
    
    monitor.startMonitoring();
    runner.assertTrue(monitor.isMonitoring, 'Should be monitoring after start');
    runner.assertTrue(startEventTriggered, 'Should trigger start event');
    
    monitor.stopMonitoring();
    runner.assertFalse(monitor.isMonitoring, 'Should not be monitoring after stop');
    runner.assertTrue(stopEventTriggered, 'Should trigger stop event');
});

runner.test('PerformanceMonitor trackFrameRate updates metrics', () => {
    const monitor = new PerformanceMonitor();
    monitor.startMonitoring();
    
    // Simulate some frame tracking
    monitor.trackFrameRate();
    monitor.trackFrameRate();
    monitor.trackFrameRate();
    
    runner.assertTrue(monitor.frames.length > 0, 'Should have tracked frames');
    runner.assertTrue(monitor.frameCount >= 3, 'Frame count should increase');
    runner.assertTrue(monitor.metrics.currentFPS > 0, 'Current FPS should be calculated');
});

runner.test('PerformanceMonitor performance level detection', () => {
    const monitor = new PerformanceMonitor();
    let performanceChangeTriggered = false;
    let changeData = null;
    
    monitor.on('performanceChange', (data) => {
        performanceChangeTriggered = true;
        changeData = data;
    });
    
    monitor.startMonitoring();
    
    // Simulate poor performance (high frame time = low FPS)
    monitor.checkPerformance(50); // 50ms = 20 FPS, below 30 FPS minimum
    
    runner.assertEquals(monitor.performanceLevel, 'low', 'Should detect low performance');
    runner.assertTrue(performanceChangeTriggered, 'Should trigger performance change event');
    runner.assertNotNull(changeData, 'Should provide change data');
    runner.assertEquals(changeData.level, 'low', 'Event data should indicate low performance');
});

runner.test('PerformanceMonitor quality suggestions', () => {
    const monitor = new PerformanceMonitor();
    let suggestionsTriggered = false;
    let suggestions = null;
    
    monitor.on('qualitySuggestions', (data) => {
        suggestionsTriggered = true;
        suggestions = data.suggestions;
    });
    
    monitor.autoAdjustQuality = true;
    monitor.startMonitoring();
    
    // Trigger low performance
    monitor.checkPerformance(50); // 20 FPS
    
    runner.assertTrue(suggestionsTriggered, 'Should trigger quality suggestions');
    runner.assertNotNull(suggestions, 'Should provide suggestions');
    runner.assertTrue(Array.isArray(suggestions), 'Suggestions should be an array');
    runner.assertTrue(suggestions.length > 0, 'Should have at least one suggestion');
    runner.assertTrue(suggestions.includes('Disable shadows'), 'Should suggest disabling shadows for low performance');
});

runner.test('PerformanceMonitor memory monitoring', () => {
    const monitor = new PerformanceMonitor();
    
    if (performance.memory) {
        monitor.updateMemoryMetrics();
        
        runner.assertTrue(monitor.metrics.memoryUsage > 0, 'Should track memory usage');
        runner.assertTrue(monitor.metrics.memoryLimit > 0, 'Should track memory limit');
    } else {
        runner.assertTrue(true, 'Memory API not available in this environment');
    }
});

runner.test('PerformanceMonitor averages calculation', () => {
    const monitor = new PerformanceMonitor();
    
    // Add some test frame times
    monitor.frames = [16.67, 16.67, 16.67, 33.33, 16.67]; // Mix of 60fps and 30fps frames
    monitor.updateAverages();
    
    runner.assertTrue(monitor.averageFPS > 0, 'Average FPS should be calculated');
    runner.assertTrue(monitor.metrics.minFPS > 0, 'Min FPS should be calculated');
    runner.assertTrue(monitor.metrics.maxFPS > 0, 'Max FPS should be calculated');
    runner.assertTrue(monitor.metrics.frameTimeP95 > 0, 'P95 frame time should be calculated');
    runner.assertTrue(monitor.metrics.frameTimeP99 > 0, 'P99 frame time should be calculated');
});

runner.test('PerformanceMonitor bottleneck detection', () => {
    const monitor = new PerformanceMonitor();
    
    // Set up metrics for bottleneck detection
    monitor.metrics.frameTimeP95 = 50; // High frame time
    monitor.averageFPS = 25; // Low FPS
    
    const bottlenecks = monitor.detectBottlenecks();
    
    runner.assertTrue(Array.isArray(bottlenecks), 'Should return array of bottlenecks');
    
    const cpuBottleneck = bottlenecks.find(b => b.type === 'cpu');
    runner.assertNotNull(cpuBottleneck, 'Should detect CPU bottleneck');
    runner.assertNotNull(cpuBottleneck.description, 'CPU bottleneck should have description');
    runner.assertTrue(Array.isArray(cpuBottleneck.suggestions), 'Should provide suggestions');
});

runner.test('PerformanceMonitor performance targets configuration', () => {
    const monitor = new PerformanceMonitor();
    
    monitor.setTargets(20, 45);
    
    runner.assertEquals(monitor.minFPS, 20, 'Min FPS should be updated');
    runner.assertEquals(monitor.targetFPS, 45, 'Target FPS should be updated');
    runner.assertEquals(monitor.maxFrameTime, 50, 'Max frame time should be calculated correctly (1000/20)');
    
    // Test invalid values
    monitor.setTargets(0, 15);
    runner.assertTrue(monitor.minFPS >= 1, 'Min FPS should be at least 1');
    runner.assertTrue(monitor.targetFPS >= monitor.minFPS, 'Target FPS should be at least min FPS');
});

runner.test('PerformanceMonitor auto quality adjustment setting', () => {
    const monitor = new PerformanceMonitor();
    
    runner.assertTrue(monitor.autoAdjustQuality, 'Auto adjustment should be enabled by default');
    
    monitor.setAutoQualityAdjustment(false);
    runner.assertFalse(monitor.autoAdjustQuality, 'Auto adjustment should be disabled');
    
    monitor.setAutoQualityAdjustment(true);
    runner.assertTrue(monitor.autoAdjustQuality, 'Auto adjustment should be re-enabled');
});

runner.test('PerformanceMonitor measurement utilities', () => {
    const monitor = new PerformanceMonitor();
    
    // Test synchronous function measurement
    const result = monitor.measureFunction(() => {
        let sum = 0;
        for (let i = 0; i < 1000; i++) {
            sum += i;
        }
        return sum;
    }, 'test calculation');
    
    runner.assertEquals(result, 499500, 'Should return correct calculation result');
});

runner.test('PerformanceMonitor async measurement utilities', async () => {
    const monitor = new PerformanceMonitor();
    
    // Test asynchronous function measurement
    const result = await monitor.measureAsync(async () => {
        return new Promise((resolve) => {
            setTimeout(() => resolve(42), 10);
        });
    }, 'async test');
    
    runner.assertEquals(result, 42, 'Should return correct async result');
});

runner.test('PerformanceMonitor getReport provides comprehensive data', () => {
    const monitor = new PerformanceMonitor();
    monitor.startMonitoring();
    monitor.trackFrameRate();
    monitor.trackFrameRate();
    
    const report = monitor.getReport();
    
    runner.assertNotNull(report.metrics, 'Report should include metrics');
    runner.assertNotNull(report.performanceLevel, 'Report should include performance level');
    runner.assertTrue(Array.isArray(report.warnings), 'Report should include warnings array');
    runner.assertTrue(Array.isArray(report.bottlenecks), 'Report should include bottlenecks array');
    runner.assertNotNull(report.isAcceptable, 'Report should include acceptability status');
    runner.assertTrue(report.uptime >= 0, 'Report should include uptime');
    runner.assertTrue(report.framesSampled >= 0, 'Report should include frames sampled');
});

runner.test('PerformanceMonitor reset clears all data', () => {
    const monitor = new PerformanceMonitor();
    
    // Add some data
    monitor.startMonitoring();
    monitor.trackFrameRate();
    monitor.checkPerformance(50); // Add warning
    
    // Reset
    monitor.reset();
    
    runner.assertEquals(monitor.frames.length, 0, 'Frames should be cleared');
    runner.assertEquals(monitor.frameCount, 0, 'Frame count should be reset');
    runner.assertEquals(monitor.warnings.length, 0, 'Warnings should be cleared');
    runner.assertEquals(monitor.performanceLevel, 'high', 'Performance level should be reset');
    runner.assertEquals(monitor.metrics.currentFPS, 60, 'Current FPS should be reset to default');
});

runner.test('PerformanceMonitor isPerformanceAcceptable works correctly', () => {
    const monitor = new PerformanceMonitor();
    
    // Set good performance
    monitor.averageFPS = 45;
    runner.assertTrue(monitor.isPerformanceAcceptable(), 'Should be acceptable at 45 FPS');
    
    // Set poor performance
    monitor.averageFPS = 20;
    runner.assertFalse(monitor.isPerformanceAcceptable(), 'Should not be acceptable at 20 FPS');
});

runner.test('PerformanceMonitor event system works correctly', () => {
    const monitor = new PerformanceMonitor();
    let eventTriggered = false;
    let eventData = null;
    
    monitor.on('testEvent', (data) => {
        eventTriggered = true;
        eventData = data;
    });
    
    monitor.emit('testEvent', { test: 'data' });
    
    runner.assertTrue(eventTriggered, 'Event should be triggered');
    runner.assertEquals(eventData.test, 'data', 'Event data should be passed correctly');
});
class PerformanceMonitor {
    constructor() {
        this.isMonitoring = false;
        this.frames = [];
        this.lastTime = performance.now();
        this.frameCount = 0;
        this.totalFrames = 0;
        
        // Performance targets (from PRD)
        this.minFPS = 30;
        this.targetFPS = 60;
        this.maxFrameTime = 1000 / this.minFPS; // 33.33ms
        
        // Rolling averages
        this.frameTimeWindow = 60; // Number of frames to average
        this.averageFPS = 60;
        this.averageFrameTime = 16.67;
        
        // Performance metrics
        this.metrics = {
            currentFPS: 60,
            averageFPS: 60,
            minFPS: 60,
            maxFPS: 60,
            frameTimeP95: 16.67,
            frameTimeP99: 16.67,
            memoryUsage: 0,
            gpuMemoryUsage: 0,
            renderTime: 0,
            updateTime: 0,
            totalFrames: 0
        };
        
        // Performance warnings and adjustments
        this.warnings = [];
        this.performanceLevel = 'high'; // high, medium, low
        this.autoAdjustQuality = true;
        
        // Memory monitoring
        this.memoryCheckInterval = 5000; // Check every 5 seconds
        this.lastMemoryCheck = 0;
        this.baselineMemory = 0;
        
        // Event system
        this.eventListeners = {};
        
        this.initializeMemoryBaseline();
    }
    
    initializeMemoryBaseline() {
        if (performance.memory) {
            this.baselineMemory = performance.memory.usedJSHeapSize;
        }
    }
    
    startMonitoring() {
        this.isMonitoring = true;
        this.lastTime = performance.now();
        this.frameCount = 0;
        console.log('Performance monitoring started');
        
        this.emit('monitoringStarted');
    }
    
    stopMonitoring() {
        this.isMonitoring = false;
        console.log('Performance monitoring stopped');
        
        this.emit('monitoringStopped', this.getReport());
    }
    
    trackFrameRate() {
        if (!this.isMonitoring) return;
        
        const currentTime = performance.now();
        const frameTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Add to rolling window
        this.frames.push(frameTime);
        if (this.frames.length > this.frameTimeWindow) {
            this.frames.shift();
        }
        
        this.frameCount++;
        this.totalFrames++;
        
        // Update current FPS
        this.metrics.currentFPS = Math.round(1000 / frameTime);
        
        // Update averages every 10 frames
        if (this.frameCount % 10 === 0) {
            this.updateAverages();
        }
        
        // Check for performance issues
        this.checkPerformance(frameTime);
        
        // Memory monitoring
        if (currentTime - this.lastMemoryCheck > this.memoryCheckInterval) {
            this.updateMemoryMetrics();
            this.lastMemoryCheck = currentTime;
        }
    }
    
    updateAverages() {
        if (this.frames.length === 0) return;
        
        // Calculate average frame time
        const avgFrameTime = this.frames.reduce((sum, time) => sum + time, 0) / this.frames.length;
        this.averageFrameTime = avgFrameTime;
        this.averageFPS = Math.round(1000 / avgFrameTime);
        
        // Update metrics
        this.metrics.averageFPS = this.averageFPS;
        this.metrics.minFPS = Math.round(1000 / Math.max(...this.frames));
        this.metrics.maxFPS = Math.round(1000 / Math.min(...this.frames));
        
        // Calculate percentiles
        const sortedFrameTimes = [...this.frames].sort((a, b) => a - b);
        const p95Index = Math.floor(sortedFrameTimes.length * 0.95);
        const p99Index = Math.floor(sortedFrameTimes.length * 0.99);
        
        this.metrics.frameTimeP95 = sortedFrameTimes[p95Index] || avgFrameTime;
        this.metrics.frameTimeP99 = sortedFrameTimes[p99Index] || avgFrameTime;
        this.metrics.totalFrames = this.totalFrames;
    }
    
    updateMemoryMetrics() {
        if (performance.memory) {
            const memory = performance.memory;
            this.metrics.memoryUsage = memory.usedJSHeapSize;
            this.metrics.memoryLimit = memory.jsHeapSizeLimit;
            
            // Check for memory leaks
            const memoryIncrease = memory.usedJSHeapSize - this.baselineMemory;
            const memoryGrowthMB = memoryIncrease / (1024 * 1024);
            
            if (memoryGrowthMB > 50) { // More than 50MB growth
                this.warnings.push({
                    type: 'memory',
                    message: `Memory usage increased by ${memoryGrowthMB.toFixed(1)}MB`,
                    timestamp: performance.now(),
                    severity: memoryGrowthMB > 100 ? 'high' : 'medium'
                });
                
                this.emit('memoryWarning', {
                    growth: memoryGrowthMB,
                    current: memory.usedJSHeapSize,
                    baseline: this.baselineMemory
                });
            }
        }
    }
    
    checkPerformance(frameTime) {
        const fps = 1000 / frameTime;
        
        // Performance level assessment
        if (fps < this.minFPS) {
            if (this.performanceLevel !== 'low') {
                this.performanceLevel = 'low';
                this.addWarning('performance', `FPS dropped below ${this.minFPS}`, 'high');
                this.emit('performanceChange', { level: 'low', fps, frameTime });
                
                if (this.autoAdjustQuality) {
                    this.suggestQualityAdjustments('low');
                }
            }
        } else if (fps < this.targetFPS * 0.8) { // Below 80% of target
            if (this.performanceLevel !== 'medium') {
                this.performanceLevel = 'medium';
                this.addWarning('performance', `FPS below optimal range (${fps}/${this.targetFPS})`, 'medium');
                this.emit('performanceChange', { level: 'medium', fps, frameTime });
                
                if (this.autoAdjustQuality) {
                    this.suggestQualityAdjustments('medium');
                }
            }
        } else {
            if (this.performanceLevel !== 'high' && this.averageFPS >= this.targetFPS * 0.9) {
                this.performanceLevel = 'high';
                this.emit('performanceChange', { level: 'high', fps, frameTime });
            }
        }
    }
    
    addWarning(type, message, severity = 'medium') {
        const warning = {
            type,
            message,
            severity,
            timestamp: performance.now(),
            fps: this.metrics.currentFPS
        };
        
        this.warnings.push(warning);
        
        // Keep only recent warnings
        if (this.warnings.length > 20) {
            this.warnings.shift();
        }
        
        console.warn(`Performance Warning (${severity}): ${message}`);
        this.emit('warning', warning);
    }
    
    suggestQualityAdjustments(performanceLevel) {
        const suggestions = [];
        
        switch (performanceLevel) {
            case 'low':
                suggestions.push('Disable shadows');
                suggestions.push('Reduce lighting quality');
                suggestions.push('Disable camera rotation');
                suggestions.push('Reduce particle effects');
                suggestions.push('Lower render resolution');
                break;
                
            case 'medium':
                suggestions.push('Disable complex lighting');
                suggestions.push('Reduce shadow quality');
                suggestions.push('Limit camera effects');
                break;
        }
        
        this.emit('qualitySuggestions', {
            level: performanceLevel,
            suggestions,
            currentFPS: this.metrics.currentFPS
        });
        
        console.log(`Quality suggestions for ${performanceLevel} performance:`, suggestions);
    }
    
    getAverageFPS() {
        return this.averageFPS;
    }
    
    getCurrentFPS() {
        return this.metrics.currentFPS;
    }
    
    isPerformanceAcceptable() {
        return this.averageFPS >= this.minFPS;
    }
    
    detectBottlenecks() {
        const bottlenecks = [];
        
        // CPU bottleneck (high frame times)
        if (this.metrics.frameTimeP95 > this.maxFrameTime) {
            bottlenecks.push({
                type: 'cpu',
                severity: this.metrics.frameTimeP95 > this.maxFrameTime * 2 ? 'high' : 'medium',
                description: `Frame time P95: ${this.metrics.frameTimeP95.toFixed(2)}ms (target: ${this.maxFrameTime.toFixed(2)}ms)`,
                suggestions: ['Reduce game logic complexity', 'Optimize update loops', 'Use object pooling']
            });
        }
        
        // Memory bottleneck
        if (performance.memory && this.metrics.memoryUsage > this.metrics.memoryLimit * 0.8) {
            bottlenecks.push({
                type: 'memory',
                severity: 'high',
                description: `Memory usage: ${(this.metrics.memoryUsage / (1024 * 1024)).toFixed(1)}MB`,
                suggestions: ['Implement object disposal', 'Reduce texture sizes', 'Clear unused meshes']
            });
        }
        
        // GPU bottleneck (consistent low FPS with acceptable frame times)
        if (this.averageFPS < this.targetFPS && this.metrics.frameTimeP95 < this.maxFrameTime * 0.8) {
            bottlenecks.push({
                type: 'gpu',
                severity: 'medium',
                description: `Low FPS with acceptable CPU performance`,
                suggestions: ['Reduce render complexity', 'Disable shadows', 'Lower texture quality']
            });
        }
        
        return bottlenecks;
    }
    
    logPerformanceMetrics() {
        console.group('Performance Metrics');
        console.log(`Current FPS: ${this.metrics.currentFPS}`);
        console.log(`Average FPS: ${this.metrics.averageFPS}`);
        console.log(`Min/Max FPS: ${this.metrics.minFPS}/${this.metrics.maxFPS}`);
        console.log(`Frame Time P95: ${this.metrics.frameTimeP95.toFixed(2)}ms`);
        console.log(`Frame Time P99: ${this.metrics.frameTimeP99.toFixed(2)}ms`);
        console.log(`Performance Level: ${this.performanceLevel}`);
        
        if (performance.memory) {
            console.log(`Memory Usage: ${(this.metrics.memoryUsage / (1024 * 1024)).toFixed(1)}MB`);
        }
        
        if (this.warnings.length > 0) {
            console.log(`Recent Warnings: ${this.warnings.length}`);
            this.warnings.slice(-3).forEach(warning => {
                console.log(`  - ${warning.type}: ${warning.message}`);
            });
        }
        
        const bottlenecks = this.detectBottlenecks();
        if (bottlenecks.length > 0) {
            console.log('Detected Bottlenecks:');
            bottlenecks.forEach(bottleneck => {
                console.log(`  - ${bottleneck.type}: ${bottleneck.description}`);
            });
        }
        
        console.groupEnd();
    }
    
    getReport() {
        return {
            metrics: { ...this.metrics },
            performanceLevel: this.performanceLevel,
            warnings: [...this.warnings],
            bottlenecks: this.detectBottlenecks(),
            isAcceptable: this.isPerformanceAcceptable(),
            uptime: performance.now(),
            framesSampled: this.frames.length
        };
    }
    
    // Performance optimization helpers
    measureFunction(fn, name = 'function') {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        
        console.log(`${name} took ${(end - start).toFixed(2)}ms`);
        return result;
    }
    
    async measureAsync(asyncFn, name = 'async function') {
        const start = performance.now();
        const result = await asyncFn();
        const end = performance.now();
        
        console.log(`${name} took ${(end - start).toFixed(2)}ms`);
        return result;
    }
    
    // Event system
    on(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }
    
    emit(event, data) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in performance monitor event listener for ${event}:`, error);
                }
            });
        }
    }
    
    // Configuration
    setTargets(minFPS, targetFPS) {
        this.minFPS = Math.max(1, minFPS);
        this.targetFPS = Math.max(this.minFPS, targetFPS);
        this.maxFrameTime = 1000 / this.minFPS;
        
        console.log(`Performance targets updated: ${this.minFPS}/${this.targetFPS} FPS`);
    }
    
    setAutoQualityAdjustment(enabled) {
        this.autoAdjustQuality = enabled;
        console.log(`Auto quality adjustment: ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    // Reset statistics
    reset() {
        this.frames = [];
        this.frameCount = 0;
        this.totalFrames = 0;
        this.warnings = [];
        this.performanceLevel = 'high';
        this.lastTime = performance.now();
        
        // Reset metrics
        this.metrics = {
            currentFPS: 60,
            averageFPS: 60,
            minFPS: 60,
            maxFPS: 60,
            frameTimeP95: 16.67,
            frameTimeP99: 16.67,
            memoryUsage: 0,
            gpuMemoryUsage: 0,
            renderTime: 0,
            updateTime: 0,
            totalFrames: 0
        };
        
        this.initializeMemoryBaseline();
        console.log('Performance monitor reset');
    }
}
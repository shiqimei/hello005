class ScoringSystem {
    constructor() {
        this.score = 0;
        this.level = 1;
        this.linesCleared = 0;
        this.totalLinesCleared = 0;
        
        // Scoring configuration
        this.baseScores = {
            single: 100,    // 1 line
            double: 300,    // 2 lines
            triple: 500,    // 3 lines
            tetris: 800     // 4 lines
        };
        
        this.softDropPoints = 1;
        this.hardDropPoints = 2;
        
        // Level progression
        this.linesPerLevel = 10;
        this.maxLevel = 20;
        
        // Fall speed configuration (in milliseconds)
        this.fallSpeeds = [
            1000, 900, 800, 700, 600,  // Levels 1-5
            500, 450, 400, 350, 300,   // Levels 6-10
            250, 200, 180, 160, 140,   // Levels 11-15
            120, 100, 90, 80, 70       // Levels 16-20
        ];
        
        // Combo system
        this.combo = 0;
        this.maxCombo = 0;
        
        // Event system
        this.eventListeners = {};
    }
    
    calculateScore(clearedLines, currentLevel) {
        let points = 0;
        
        if (clearedLines === 0) {
            this.combo = 0;
            return 0;
        }
        
        // Base points based on number of lines cleared
        switch (clearedLines) {
            case 1:
                points = this.baseScores.single;
                break;
            case 2:
                points = this.baseScores.double;
                break;
            case 3:
                points = this.baseScores.triple;
                break;
            case 4:
                points = this.baseScores.tetris;
                break;
            default:
                // For more than 4 lines (shouldn't happen in standard Tetris)
                points = this.baseScores.tetris * Math.floor(clearedLines / 4) + 
                        this.calculateScore(clearedLines % 4, currentLevel);
        }
        
        // Level multiplier
        points *= currentLevel;
        
        // Combo multiplier
        if (this.combo > 0) {
            points += points * (this.combo * 0.5); // 50% bonus per combo
        }
        
        this.combo++;
        this.maxCombo = Math.max(this.maxCombo, this.combo);
        
        return Math.floor(points);
    }
    
    addScore(points) {
        this.score += points;
        this.emit('scoreChanged', {
            score: this.score,
            points: points,
            level: this.level,
            lines: this.totalLinesCleared
        });
    }
    
    addLines(count) {
        this.linesCleared += count;
        this.totalLinesCleared += count;
        
        // Calculate score for cleared lines
        const points = this.calculateScore(count, this.level);
        this.addScore(points);
        
        // Check for level up
        this.checkLevelUp();
        
        this.emit('linesChanged', {
            lines: this.totalLinesCleared,
            clearedThisTime: count,
            level: this.level,
            combo: this.combo
        });
        
        return points;
    }
    
    checkLevelUp() {
        const newLevel = Math.min(
            Math.floor(this.totalLinesCleared / this.linesPerLevel) + 1,
            this.maxLevel
        );
        
        if (newLevel > this.level) {
            const oldLevel = this.level;
            this.level = newLevel;
            
            this.emit('levelUp', {
                oldLevel: oldLevel,
                newLevel: this.level,
                fallSpeed: this.getFallSpeed(this.level),
                totalLines: this.totalLinesCleared
            });
        }
    }
    
    addSoftDrop(distance) {
        const points = distance * this.softDropPoints;
        this.addScore(points);
        return points;
    }
    
    addHardDrop(distance) {
        const points = distance * this.hardDropPoints;
        this.addScore(points);
        return points;
    }
    
    getFallSpeed(level) {
        if (level <= 0 || level > this.fallSpeeds.length) {
            return this.fallSpeeds[this.fallSpeeds.length - 1]; // Fastest speed
        }
        return this.fallSpeeds[level - 1];
    }
    
    updateLevel(totalLinesCleared) {
        const oldLevel = this.level;
        this.level = Math.min(
            Math.floor(totalLinesCleared / this.linesPerLevel) + 1,
            this.maxLevel
        );
        
        if (this.level !== oldLevel) {
            this.emit('levelUp', {
                oldLevel: oldLevel,
                newLevel: this.level,
                fallSpeed: this.getFallSpeed(this.level),
                totalLines: totalLinesCleared
            });
        }
        
        return this.level;
    }
    
    getScore() {
        return this.score;
    }
    
    getLevel() {
        return this.level;
    }
    
    getLines() {
        return this.totalLinesCleared;
    }
    
    getCombo() {
        return this.combo;
    }
    
    getMaxCombo() {
        return this.maxCombo;
    }
    
    getCurrentFallSpeed() {
        return this.getFallSpeed(this.level);
    }
    
    // Calculate statistics for display
    getStatistics() {
        return {
            score: this.score,
            level: this.level,
            lines: this.totalLinesCleared,
            combo: this.combo,
            maxCombo: this.maxCombo,
            fallSpeed: this.getCurrentFallSpeed(),
            linesForNextLevel: this.linesPerLevel - (this.totalLinesCleared % this.linesPerLevel),
            efficiency: this.totalLinesCleared > 0 ? (this.score / this.totalLinesCleared) : 0
        };
    }
    
    // Get score breakdown for different line clears at current level
    getScoreBreakdown() {
        return {
            single: this.baseScores.single * this.level,
            double: this.baseScores.double * this.level,
            triple: this.baseScores.triple * this.level,
            tetris: this.baseScores.tetris * this.level,
            level: this.level,
            combo: this.combo,
            comboBonus: this.combo > 0 ? Math.floor(this.combo * 0.5 * 100) + '%' : '0%'
        };
    }
    
    // Reset combo (called when no lines are cleared)
    resetCombo() {
        this.combo = 0;
        this.emit('comboReset');
    }
    
    // Reset scoring system for new game
    reset() {
        this.score = 0;
        this.level = 1;
        this.linesCleared = 0;
        this.totalLinesCleared = 0;
        this.combo = 0;
        this.maxCombo = 0;
        
        this.emit('scoreReset', {
            score: this.score,
            level: this.level,
            lines: this.totalLinesCleared
        });
    }
    
    // Load saved state
    loadState(state) {
        if (state) {
            this.score = state.score || 0;
            this.level = state.level || 1;
            this.totalLinesCleared = state.totalLinesCleared || 0;
            this.combo = state.combo || 0;
            this.maxCombo = state.maxCombo || 0;
        }
        
        this.emit('stateLoaded', this.getStatistics());
    }
    
    // Save current state
    saveState() {
        return {
            score: this.score,
            level: this.level,
            totalLinesCleared: this.totalLinesCleared,
            combo: this.combo,
            maxCombo: this.maxCombo,
            timestamp: Date.now()
        };
    }
    
    // Achievement system (basic implementation)
    checkAchievements(gameStats) {
        const achievements = [];
        
        // Score milestones
        const scoreMilestones = [1000, 5000, 10000, 25000, 50000, 100000];
        scoreMilestones.forEach(milestone => {
            if (this.score >= milestone && !this.hasAchievement(`score_${milestone}`)) {
                achievements.push({
                    id: `score_${milestone}`,
                    name: `Score Master ${milestone}`,
                    description: `Reached ${milestone.toLocaleString()} points`,
                    type: 'score'
                });
            }
        });
        
        // Line clearing achievements
        const lineMilestones = [10, 50, 100, 250, 500, 1000];
        lineMilestones.forEach(milestone => {
            if (this.totalLinesCleared >= milestone && !this.hasAchievement(`lines_${milestone}`)) {
                achievements.push({
                    id: `lines_${milestone}`,
                    name: `Line Clearer ${milestone}`,
                    description: `Cleared ${milestone} lines`,
                    type: 'lines'
                });
            }
        });
        
        // Combo achievements
        if (this.combo >= 5 && !this.hasAchievement('combo_5')) {
            achievements.push({
                id: 'combo_5',
                name: 'Combo Master',
                description: 'Achieved a 5x combo',
                type: 'combo'
            });
        }
        
        // Tetris achievements
        if (gameStats && gameStats.tetrisCount >= 1 && !this.hasAchievement('first_tetris')) {
            achievements.push({
                id: 'first_tetris',
                name: 'First Tetris',
                description: 'Cleared 4 lines at once',
                type: 'tetris'
            });
        }
        
        // Level achievements
        const levelMilestones = [5, 10, 15, 20];
        levelMilestones.forEach(milestone => {
            if (this.level >= milestone && !this.hasAchievement(`level_${milestone}`)) {
                achievements.push({
                    id: `level_${milestone}`,
                    name: `Level ${milestone} Master`,
                    description: `Reached level ${milestone}`,
                    type: 'level'
                });
            }
        });
        
        if (achievements.length > 0) {
            this.emit('achievementsUnlocked', achievements);
        }
        
        return achievements;
    }
    
    hasAchievement(achievementId) {
        // Simple check - in a full implementation this would check against saved achievements
        return false;
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
                    console.error(`Error in scoring system event listener for ${event}:`, error);
                }
            });
        }
    }
    
    // Helper methods for external use
    formatScore(score = this.score) {
        return score.toLocaleString();
    }
    
    getNextLevelProgress() {
        const linesInCurrentLevel = this.totalLinesCleared % this.linesPerLevel;
        const linesNeeded = this.linesPerLevel - linesInCurrentLevel;
        const progress = (linesInCurrentLevel / this.linesPerLevel) * 100;
        
        return {
            current: linesInCurrentLevel,
            needed: linesNeeded,
            total: this.linesPerLevel,
            percentage: Math.round(progress)
        };
    }
    
    // Get difficulty rating based on level
    getDifficultyRating() {
        if (this.level <= 5) return 'Beginner';
        if (this.level <= 10) return 'Intermediate';
        if (this.level <= 15) return 'Advanced';
        if (this.level <= 20) return 'Expert';
        return 'Master';
    }
}
// ScoringSystem Tests
runner.test('ScoringSystem constructor initializes correctly', () => {
    const scoring = new ScoringSystem();
    
    runner.assertEquals(scoring.score, 0, 'Initial score should be 0');
    runner.assertEquals(scoring.level, 1, 'Initial level should be 1');
    runner.assertEquals(scoring.totalLinesCleared, 0, 'Initial lines cleared should be 0');
    runner.assertEquals(scoring.combo, 0, 'Initial combo should be 0');
    runner.assertNotNull(scoring.baseScores, 'Base scores should be defined');
});

runner.test('ScoringSystem calculateScore returns correct points for line clears', () => {
    const scoring = new ScoringSystem();
    
    // Test single line clear (level 1)
    const singlePoints = scoring.calculateScore(1, 1);
    runner.assertEquals(singlePoints, 100, 'Single line should give 100 points at level 1');
    
    // Test double line clear
    const doublePoints = scoring.calculateScore(2, 1);
    runner.assertEquals(doublePoints, 300, 'Double lines should give 300 points at level 1');
    
    // Test triple line clear
    const triplePoints = scoring.calculateScore(3, 1);
    runner.assertEquals(triplePoints, 500, 'Triple lines should give 500 points at level 1');
    
    // Test tetris (4 lines)
    const tetrisPoints = scoring.calculateScore(4, 1);
    runner.assertEquals(tetrisPoints, 800, 'Tetris should give 800 points at level 1');
    
    // Test level multiplier
    const levelTwoSingle = scoring.calculateScore(1, 2);
    runner.assertEquals(levelTwoSingle, 200, 'Single line should give 200 points at level 2');
});

runner.test('ScoringSystem combo system works correctly', () => {
    const scoring = new ScoringSystem();
    
    // First line clear
    const firstClear = scoring.calculateScore(1, 1);
    runner.assertEquals(firstClear, 100, 'First clear should be base points');
    runner.assertEquals(scoring.combo, 1, 'Combo should be 1 after first clear');
    
    // Second consecutive line clear should have bonus
    const secondClear = scoring.calculateScore(2, 1);
    runner.assertTrue(secondClear > 300, 'Second clear should have combo bonus');
    runner.assertEquals(scoring.combo, 2, 'Combo should be 2 after second clear');
    
    // No lines cleared should reset combo
    const noLines = scoring.calculateScore(0, 1);
    runner.assertEquals(noLines, 0, 'No lines should give 0 points');
    runner.assertEquals(scoring.combo, 0, 'Combo should reset to 0');
});

runner.test('ScoringSystem addLines updates score and statistics', () => {
    const scoring = new ScoringSystem();
    let scoreChanged = false;
    let linesChanged = false;
    
    scoring.on('scoreChanged', () => { scoreChanged = true; });
    scoring.on('linesChanged', () => { linesChanged = true; });
    
    const points = scoring.addLines(2);
    
    runner.assertTrue(points > 0, 'Should return positive points');
    runner.assertEquals(scoring.totalLinesCleared, 2, 'Total lines should be updated');
    runner.assertTrue(scoreChanged, 'Should emit scoreChanged event');
    runner.assertTrue(linesChanged, 'Should emit linesChanged event');
});

runner.test('ScoringSystem level progression works correctly', () => {
    const scoring = new ScoringSystem();
    let levelUpTriggered = false;
    
    scoring.on('levelUp', (data) => {
        levelUpTriggered = true;
        runner.assertEquals(data.newLevel, 2, 'New level should be 2');
        runner.assertEquals(data.oldLevel, 1, 'Old level should be 1');
        runner.assertNotNull(data.fallSpeed, 'Should include fall speed');
    });
    
    // Clear 10 lines to trigger level up
    scoring.addLines(10);
    
    runner.assertEquals(scoring.level, 2, 'Level should increase to 2');
    runner.assertTrue(levelUpTriggered, 'Level up event should be triggered');
});

runner.test('ScoringSystem getFallSpeed returns correct speeds', () => {
    const scoring = new ScoringSystem();
    
    const level1Speed = scoring.getFallSpeed(1);
    runner.assertEquals(level1Speed, 1000, 'Level 1 should have 1000ms fall speed');
    
    const level5Speed = scoring.getFallSpeed(5);
    runner.assertEquals(level5Speed, 600, 'Level 5 should have 600ms fall speed');
    
    const level20Speed = scoring.getFallSpeed(20);
    runner.assertEquals(level20Speed, 70, 'Level 20 should have 70ms fall speed');
    
    // Test invalid levels
    const invalidSpeed = scoring.getFallSpeed(0);
    runner.assertEquals(invalidSpeed, 70, 'Invalid level should return fastest speed');
    
    const tooHighSpeed = scoring.getFallSpeed(25);
    runner.assertEquals(tooHighSpeed, 70, 'Too high level should return fastest speed');
});

runner.test('ScoringSystem soft and hard drop scoring', () => {
    const scoring = new ScoringSystem();
    const initialScore = scoring.score;
    
    const softDropPoints = scoring.addSoftDrop(5);
    runner.assertEquals(softDropPoints, 5, 'Soft drop should give 1 point per cell');
    runner.assertEquals(scoring.score, initialScore + 5, 'Score should increase by soft drop points');
    
    const hardDropPoints = scoring.addHardDrop(3);
    runner.assertEquals(hardDropPoints, 6, 'Hard drop should give 2 points per cell');
    runner.assertEquals(scoring.score, initialScore + 5 + 6, 'Score should include hard drop points');
});

runner.test('ScoringSystem getStatistics returns complete data', () => {
    const scoring = new ScoringSystem();
    scoring.addLines(5);
    scoring.addSoftDrop(10);
    
    const stats = scoring.getStatistics();
    
    runner.assertNotNull(stats.score, 'Statistics should include score');
    runner.assertNotNull(stats.level, 'Statistics should include level');
    runner.assertNotNull(stats.lines, 'Statistics should include lines');
    runner.assertNotNull(stats.combo, 'Statistics should include combo');
    runner.assertNotNull(stats.maxCombo, 'Statistics should include max combo');
    runner.assertNotNull(stats.fallSpeed, 'Statistics should include fall speed');
    runner.assertNotNull(stats.linesForNextLevel, 'Statistics should include lines for next level');
    runner.assertNotNull(stats.efficiency, 'Statistics should include efficiency');
});

runner.test('ScoringSystem getScoreBreakdown shows current level multipliers', () => {
    const scoring = new ScoringSystem();
    scoring.addLines(15); // Get to level 2
    
    const breakdown = scoring.getScoreBreakdown();
    
    runner.assertEquals(breakdown.single, 200, 'Single should be base * level');
    runner.assertEquals(breakdown.double, 600, 'Double should be base * level');
    runner.assertEquals(breakdown.triple, 1000, 'Triple should be base * level');
    runner.assertEquals(breakdown.tetris, 1600, 'Tetris should be base * level');
    runner.assertEquals(breakdown.level, 2, 'Should show current level');
});

runner.test('ScoringSystem reset clears all data', () => {
    const scoring = new ScoringSystem();
    let resetEventTriggered = false;
    
    scoring.on('scoreReset', () => { resetEventTriggered = true; });
    
    // Add some data
    scoring.addLines(15);
    scoring.addSoftDrop(20);
    
    // Reset
    scoring.reset();
    
    runner.assertEquals(scoring.score, 0, 'Score should be reset to 0');
    runner.assertEquals(scoring.level, 1, 'Level should be reset to 1');
    runner.assertEquals(scoring.totalLinesCleared, 0, 'Lines should be reset to 0');
    runner.assertEquals(scoring.combo, 0, 'Combo should be reset to 0');
    runner.assertEquals(scoring.maxCombo, 0, 'Max combo should be reset to 0');
    runner.assertTrue(resetEventTriggered, 'Reset event should be triggered');
});

runner.test('ScoringSystem saveState and loadState work correctly', () => {
    const scoring = new ScoringSystem();
    
    // Set some state
    scoring.addLines(12);
    scoring.addSoftDrop(5);
    const originalScore = scoring.score;
    
    // Save state
    const savedState = scoring.saveState();
    
    runner.assertNotNull(savedState.score, 'Saved state should include score');
    runner.assertNotNull(savedState.level, 'Saved state should include level');
    runner.assertNotNull(savedState.totalLinesCleared, 'Saved state should include lines');
    runner.assertNotNull(savedState.timestamp, 'Saved state should include timestamp');
    
    // Reset and load
    scoring.reset();
    scoring.loadState(savedState);
    
    runner.assertEquals(scoring.score, originalScore, 'Score should be restored');
    runner.assertEquals(scoring.level, 2, 'Level should be restored');
    runner.assertEquals(scoring.totalLinesCleared, 12, 'Lines should be restored');
});

runner.test('ScoringSystem formatScore formats numbers correctly', () => {
    const scoring = new ScoringSystem();
    
    runner.assertEquals(scoring.formatScore(1000), '1,000', 'Should format thousands with comma');
    runner.assertEquals(scoring.formatScore(123456), '123,456', 'Should format large numbers');
    runner.assertEquals(scoring.formatScore(0), '0', 'Should handle zero');
});

runner.test('ScoringSystem getNextLevelProgress calculates correctly', () => {
    const scoring = new ScoringSystem();
    scoring.addLines(7); // 7 lines towards level 2
    
    const progress = scoring.getNextLevelProgress();
    
    runner.assertEquals(progress.current, 7, 'Current progress should be 7');
    runner.assertEquals(progress.needed, 3, 'Needed should be 3 more');
    runner.assertEquals(progress.total, 10, 'Total should be 10');
    runner.assertEquals(progress.percentage, 70, 'Percentage should be 70%');
});

runner.test('ScoringSystem getDifficultyRating returns correct ratings', () => {
    const scoring = new ScoringSystem();
    
    runner.assertEquals(scoring.getDifficultyRating(), 'Beginner', 'Level 1 should be Beginner');
    
    scoring.addLines(50); // Level 6
    runner.assertEquals(scoring.getDifficultyRating(), 'Intermediate', 'Level 6 should be Intermediate');
    
    scoring.addLines(50); // Level 11
    runner.assertEquals(scoring.getDifficultyRating(), 'Advanced', 'Level 11 should be Advanced');
    
    scoring.addLines(50); // Level 16
    runner.assertEquals(scoring.getDifficultyRating(), 'Expert', 'Level 16 should be Expert');
});
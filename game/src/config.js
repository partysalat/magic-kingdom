export const gameConfig = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    backgroundColor: '#2d2d2d',
    input: {
        gamepad: true
    }
};

// Difficulty level multipliers
export const DIFFICULTY_SETTINGS = {
    EASY: {
        id: 'easy',
        name: 'Easy',
        description: 'For new players - reduced enemy health and damage',
        enemyHealthMultiplier: 0.7,
        enemyDamageMultiplier: 0.7,
        enemyCountMultiplier: 0.8,
        subWaveConfig: {
            startWave: 7,  // Sub-waves start at wave 7
            minSubWaves: 1,
            maxSubWaves: 2
        },
        color: 0x00ff00
    },
    MEDIUM: {
        id: 'medium',
        name: 'Medium',
        description: 'Balanced experience - intended difficulty',
        enemyHealthMultiplier: 1.0,
        enemyDamageMultiplier: 1.0,
        enemyCountMultiplier: 1.0,
        subWaveConfig: {
            startWave: 4,  // Sub-waves start at wave 4
            minSubWaves: 2,
            maxSubWaves: 3
        },
        color: 0xffff00
    },
    HARD: {
        id: 'hard',
        name: 'Hard',
        description: 'For experts - increased challenge and aggression',
        enemyHealthMultiplier: 1.3,
        enemyDamageMultiplier: 1.3,
        enemyCountMultiplier: 1.2,
        subWaveConfig: {
            startWave: 3,  // Sub-waves start at wave 3
            minSubWaves: 3,
            maxSubWaves: 4
        },
        color: 0xff0000
    }
};

// Default difficulty
export const DEFAULT_DIFFICULTY = DIFFICULTY_SETTINGS.MEDIUM;

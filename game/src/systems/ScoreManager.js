export class ScoreManager {
    constructor(scene) {
        this.scene = scene;
        this.score = 0;

        // Point values
        this.ENEMY_KILL_POINTS = 10;
        this.WAVE_SURVIVAL_BONUS = 50;

        console.log('ScoreManager initialized');
    }

    addEnemyKill() {
        this.score += this.ENEMY_KILL_POINTS;
        console.log('Enemy killed! Score:', this.score);
        return this.score;
    }

    addWaveSurvivalBonus() {
        this.score += this.WAVE_SURVIVAL_BONUS;
        console.log('Wave complete bonus! Score:', this.score);
        return this.score;
    }

    getScore() {
        return this.score;
    }

    reset() {
        this.score = 0;
    }
}

export class ScoreManager {
    constructor(scene) {
        this.scene = scene;
        this.score = 0;

        // Point values
        this.ENEMY_KILL_POINTS = 10;
        this.WAVE_SURVIVAL_BONUS = 50;

        // Boss victory bonuses
        this.BOSS_VICTORY_BONUS = {
            boss_iron_shell: 500,
            boss_kraken_arm: 750,
            boss_leviathan: 1000
        };

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

    addBountyKill(bountyValue) {
        this.score += bountyValue;
        console.log('Bounty killed! Bonus:', bountyValue, 'Score:', this.score);
        return this.score;
    }

    addBossVictory(bossType) {
        const bonus = this.BOSS_VICTORY_BONUS[bossType] || 500;
        this.score += bonus;
        console.log('Boss defeated! Bonus:', bonus, 'Score:', this.score);
        return { score: this.score, bonus: bonus };
    }

    getScore() {
        return this.score;
    }

    reset() {
        this.score = 0;
    }
}

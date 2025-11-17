export class ScoreManager {
    constructor(scene) {
        this.scene = scene;
        this.score = 0;
        this.playerScores = {}; // Object keyed by playerIndex

        // Initialize scores for all players
        if (scene.playerManager) {
            scene.playerManager.players.forEach(player => {
                this.playerScores[player.playerIndex] = {
                    name: player.playerName,
                    color: player.color,
                    score: 0,
                    kills: 0,
                    bountiesClaimed: 0,
                    playerIndex: player.playerIndex
                };
            });
        }

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
        this.createScoreboardUI();
    }

    addEnemyKill() {
        this.score += this.ENEMY_KILL_POINTS;
        console.log('Enemy killed! Score:', this.score);
        return this.score;
    }

    addKillToPlayer(playerIndex, points) {
        if (!this.playerScores[playerIndex]) return;

        this.playerScores[playerIndex].score += points;
        this.playerScores[playerIndex].kills += 1;
        this.score += points; // Also update total score for legacy compatibility

        this.updateScoreboardUI();
    }

    addBountyToPlayer(playerIndex, points) {
        if (!this.playerScores[playerIndex]) return;

        this.playerScores[playerIndex].score += points;
        this.playerScores[playerIndex].bountiesClaimed += 1;
        this.score += points; // Also update total score for legacy compatibility

        this.updateScoreboardUI();
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

    createScoreboardUI() {
        const x = 960;
        const y = 20;

        // Title
        this.scoreTitle = this.scene.add.text(x, y, 'SCORES', {
            fontSize: '24px',
            color: '#ffcc00',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0);

        // Player score texts
        this.scoreTexts = {};
        Object.keys(this.playerScores).forEach((playerIndex, index) => {
            const playerData = this.playerScores[playerIndex];
            const scoreText = this.scene.add.text(x, y + 30 + (index * 25), '', {
                fontSize: '18px',
                color: '#ffffff',
                fontFamily: 'Arial'
            }).setOrigin(0.5, 0);

            this.scoreTexts[playerIndex] = scoreText;
        });

        this.updateScoreboardUI();
    }

    updateScoreboardUI() {
        if (!this.scoreTexts) return;

        // Sort players by score
        const sorted = Object.entries(this.playerScores)
            .sort(([,a], [,b]) => b.score - a.score);

        sorted.forEach(([playerIndex, data], index) => {
            const scoreText = this.scoreTexts[playerIndex];
            if (scoreText) {
                const colorName = data.color.charAt(0).toUpperCase() + data.color.slice(1);
                scoreText.setText(`${data.name} (${colorName}): ${data.score}`);
                // Reposition based on sorted order
                scoreText.setPosition(960, 50 + (index * 25));
            }
        });
    }

    getScore() {
        return this.score;
    }

    reset() {
        this.score = 0;
    }
}

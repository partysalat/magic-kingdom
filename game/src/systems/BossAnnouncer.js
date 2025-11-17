export class BossAnnouncer {
    constructor(scene) {
        this.scene = scene;
        this.isAnnouncing = false;
    }

    /**
     * Display boss announcement overlay
     * @param {string} bossName - Name of the boss (e.g., "Iron Shell")
     * @param {string} subtitle - Subtitle text (e.g., "The Armored Terror")
     * @param {number} color - Color for spotlight effect
     */
    announceBoss(bossName, subtitle, color = 0xff0000) {
        if (this.isAnnouncing) return;

        this.isAnnouncing = true;

        // Darken screen
        const overlay = this.scene.add.rectangle(960, 540, 1920, 1080, 0x000000, 0.7);
        overlay.setDepth(1000);

        // Spotlight effect on boss spawn point
        const spotlight = this.scene.add.circle(960, 900, 150, color, 0.4);
        spotlight.setDepth(1001);

        // Pulsing animation for spotlight
        this.scene.tweens.add({
            targets: spotlight,
            scale: { from: 1, to: 1.3 },
            alpha: { from: 0.4, to: 0.6 },
            yoyo: true,
            repeat: -1,
            duration: 800
        });

        // "BOSS WAVE" text
        const bossWaveText = this.scene.add.text(960, 400, 'BOSS WAVE', {
            fontSize: '72px',
            color: '#ff0000',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5);
        bossWaveText.setDepth(1002);
        bossWaveText.setAlpha(0);

        // Boss name
        const nameText = this.scene.add.text(960, 500, bossName.toUpperCase(), {
            fontSize: '96px',
            color: '#ffff00',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 10
        }).setOrigin(0.5);
        nameText.setDepth(1002);
        nameText.setAlpha(0);

        // Subtitle
        const subtitleText = this.scene.add.text(960, 600, subtitle, {
            fontSize: '48px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'italic',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        subtitleText.setDepth(1002);
        subtitleText.setAlpha(0);

        // Screen effects
        this.scene.cameras.main.flash(500, 100, 0, 0);
        this.scene.cameras.main.shake(300, 0.01);

        // Fade in text sequence
        this.scene.tweens.add({
            targets: bossWaveText,
            alpha: 1,
            duration: 300,
            onComplete: () => {
                this.scene.tweens.add({
                    targets: nameText,
                    alpha: 1,
                    duration: 400,
                    onComplete: () => {
                        this.scene.tweens.add({
                            targets: subtitleText,
                            alpha: 1,
                            duration: 300
                        });
                    }
                });
            }
        });

        // Hold for 3 seconds, then fade out
        this.scene.time.delayedCall(3500, () => {
            this.scene.tweens.add({
                targets: [overlay, spotlight, bossWaveText, nameText, subtitleText],
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    overlay.destroy();
                    spotlight.destroy();
                    bossWaveText.destroy();
                    nameText.destroy();
                    subtitleText.destroy();
                    this.isAnnouncing = false;
                }
            });
        });

        console.log(`Boss announced: ${bossName}`);
    }

    /**
     * Show boss victory celebration
     * @param {string} bossName
     * @param {number} bonusPoints
     */
    announceBossVictory(bossName, bonusPoints) {
        // Victory flash
        this.scene.cameras.main.flash(800, 255, 215, 0);

        // Victory text
        const victoryText = this.scene.add.text(960, 400, `${bossName.toUpperCase()} DEFEATED!`, {
            fontSize: '64px',
            color: '#ffff00',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        victoryText.setDepth(1000);

        // Bonus points
        const bonusText = this.scene.add.text(960, 500, `+${bonusPoints} BONUS POINTS`, {
            fontSize: '48px',
            color: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        bonusText.setDepth(1000);

        // Fade out after 2 seconds
        this.scene.time.delayedCall(2000, () => {
            this.scene.tweens.add({
                targets: [victoryText, bonusText],
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    victoryText.destroy();
                    bonusText.destroy();
                }
            });
        });

        console.log(`Boss victory announced: ${bossName} - ${bonusPoints} points`);
    }
}

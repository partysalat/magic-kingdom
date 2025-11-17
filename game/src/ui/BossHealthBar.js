export class BossHealthBar {
    constructor(scene, bossName) {
        this.scene = scene;
        this.bossName = bossName;

        // Background bar
        this.background = scene.add.rectangle(960, 50, 1400, 40, 0x000000, 0.8);
        this.background.setDepth(900);
        this.background.setStrokeStyle(4, 0xffffff);

        // Health bar (foreground)
        this.healthBar = scene.add.rectangle(260, 50, 1390, 32, 0xff0000);
        this.healthBar.setDepth(901);
        this.healthBar.setOrigin(0, 0.5);

        // Boss name label
        this.nameText = scene.add.text(960, 50, bossName, {
            fontSize: '32px',
            color: '#ffff00',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        this.nameText.setDepth(902);

        // Phase indicator (for multi-phase bosses)
        this.phaseText = scene.add.text(1700, 50, '', {
            fontSize: '24px',
            color: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(1, 0.5);
        this.phaseText.setDepth(902);
    }

    /**
     * Update health bar display
     * @param {number} current - Current health
     * @param {number} max - Max health
     * @param {number} phase - Current phase (optional)
     */
    update(current, max, phase = null) {
        const healthPercent = Math.max(0, current / max);
        const barWidth = 1390 * healthPercent;

        this.healthBar.width = barWidth;

        // Color changes based on health
        if (healthPercent > 0.6) {
            this.healthBar.setFillStyle(0xff0000);  // Red
        } else if (healthPercent > 0.3) {
            this.healthBar.setFillStyle(0xff8800);  // Orange
        } else {
            this.healthBar.setFillStyle(0xffff00);  // Yellow (critical)
        }

        // Update phase indicator
        if (phase !== null) {
            this.phaseText.setText(`Phase ${phase}`);
        }
    }

    /**
     * Show the health bar
     */
    show() {
        this.background.setVisible(true);
        this.healthBar.setVisible(true);
        this.nameText.setVisible(true);
        this.phaseText.setVisible(true);
    }

    /**
     * Hide the health bar
     */
    hide() {
        this.background.setVisible(false);
        this.healthBar.setVisible(false);
        this.nameText.setVisible(false);
        this.phaseText.setVisible(false);
    }

    /**
     * Remove the health bar from scene
     */
    destroy() {
        this.background.destroy();
        this.healthBar.destroy();
        this.nameText.destroy();
        this.phaseText.destroy();
    }
}

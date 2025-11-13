export class HealthPickup {
    constructor(scene, x, y) {
        this.scene = scene;

        // Create visual (green cross)
        this.sprite = scene.add.circle(x, y, 15, 0x00ff00);
        this.sprite.setStrokeStyle(3, 0x00aa00);
        scene.physics.add.existing(this.sprite);
        this.sprite.body.setCollideWorldBounds(true);

        // Healing amount
        this.healAmount = 25;
        this.alive = true;

        // Pulse animation
        scene.tweens.add({
            targets: this.sprite,
            scale: { from: 1, to: 1.2 },
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        console.log('Health pickup created at', x, y);
    }

    getSprite() {
        return this.sprite;
    }

    getHealAmount() {
        return this.healAmount;
    }

    isAlive() {
        return this.alive;
    }

    collect() {
        this.alive = false;
        this.sprite.destroy();
        console.log('Health pickup collected');
    }
}

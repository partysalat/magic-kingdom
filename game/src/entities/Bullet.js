export class Bullet {
    constructor(scene, x, y, angle) {
        this.scene = scene;

        // Create bullet sprite (yellow circle)
        this.sprite = scene.add.circle(x, y, 4, 0xffff00);
        scene.physics.add.existing(this.sprite);

        // Set velocity based on angle
        const speed = 800;
        this.sprite.body.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );

        // Bullet properties
        this.damage = 10;
        this.alive = true;
    }

    update() {
        // Destroy if off screen
        const bounds = this.scene.cameras.main.worldView;
        if (this.sprite.x < bounds.x - 50 ||
            this.sprite.x > bounds.right + 50 ||
            this.sprite.y < bounds.y - 50 ||
            this.sprite.y > bounds.bottom + 50) {
            this.destroy();
        }
    }

    getSprite() {
        return this.sprite;
    }

    getDamage() {
        return this.damage;
    }

    isAlive() {
        return this.alive;
    }

    destroy() {
        this.alive = false;
        this.sprite.destroy();
    }
}

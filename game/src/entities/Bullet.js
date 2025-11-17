export class Bullet {
    constructor(scene, x, y, angle, damage = 10) {
        this.scene = scene;

        // Create bullet sprite
        this.sprite = scene.add.image(x, y, 'bullet');
        scene.physics.add.existing(this.sprite);

        // Set collision body to match sprite
        this.sprite.body.setCircle(4);

        // Set velocity based on angle
        const speed = 800;
        this.sprite.body.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );

        // Bullet properties
        this.damage = damage;
        this.alive = true;
        this.piercing = false;

        // Note: Player bullets do not collide with ANY players (no friendly fire)
        // Collision checking is handled in GameScene.checkBulletCollisions()
        // which only checks bullets against enemies, not players
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

    isPiercing() {
        return this.piercing;
    }

    setPiercing(value) {
        this.piercing = value;
    }

    destroy() {
        this.alive = false;
        this.sprite.destroy();
    }
}

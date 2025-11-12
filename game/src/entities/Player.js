export class Player {
    constructor(scene, x, y) {
        this.scene = scene;

        // Create placeholder graphics (red crab)
        this.sprite = scene.add.circle(x, y, 20, 0xff0000);
        scene.physics.add.existing(this.sprite);

        // Physics body configuration
        this.sprite.body.setCollideWorldBounds(true);
        this.sprite.body.setDrag(500);
        this.sprite.body.setMaxVelocity(300);

        // Player properties
        this.speed = 300;
        this.health = 100;
        this.maxHealth = 100;

        // Add a small "hat" indicator (triangle pointing up)
        this.hat = scene.add.triangle(x, y - 25, 0, 10, -8, -5, 8, -5, 0x8b4513);

        console.log('Player created at', x, y);
    }

    update() {
        // Position hat above player
        this.hat.setPosition(this.sprite.x, this.sprite.y - 25);
    }

    getX() {
        return this.sprite.x;
    }

    getY() {
        return this.sprite.y;
    }

    getBody() {
        return this.sprite.body;
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health < 0) this.health = 0;
        console.log('Player health:', this.health);
        return this.health;
    }

    isDead() {
        return this.health <= 0;
    }

    destroy() {
        this.sprite.destroy();
        this.hat.destroy();
    }
}

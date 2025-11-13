export class Enemy {
    constructor(scene, x, y, type = 'lobster') {
        this.scene = scene;
        this.type = type;

        // Create placeholder graphics (orange lobster)
        this.sprite = scene.add.circle(x, y, 15, 0xff6600);
        scene.physics.add.existing(this.sprite);

        // Physics configuration
        this.sprite.body.setCollideWorldBounds(true);

        // Enemy properties (Bandit Lobster stats)
        this.health = 30;
        this.maxHealth = 30;
        this.speed = 80;
        this.damage = 10;
        this.attackRange = 400;
        this.attackCooldown = 1000; // milliseconds
        this.nextAttack = 0;

        // Add claws indicator (two small circles)
        this.claw1 = scene.add.circle(x - 12, y, 5, 0xff3300);
        this.claw2 = scene.add.circle(x + 12, y, 5, 0xff3300);

        this.alive = true;

        console.log('Enemy created:', type, 'at', x, y);
    }

    update(time, playerX, playerY) {
        if (!this.alive) return;

        // Calculate distance to player
        const dx = playerX - this.sprite.x;
        const dy = playerY - this.sprite.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Move toward player (simple seek behavior)
        if (distance > 50) {
            const angle = Math.atan2(dy, dx);
            this.sprite.body.setVelocity(
                Math.cos(angle) * this.speed,
                Math.sin(angle) * this.speed
            );
        } else {
            this.sprite.body.setVelocity(0, 0);
        }

        // Update claw positions
        this.claw1.setPosition(this.sprite.x - 12, this.sprite.y);
        this.claw2.setPosition(this.sprite.x + 12, this.sprite.y);
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            this.kill();
        }
        console.log('Enemy took', amount, 'damage. Health:', this.health);
        return this.health;
    }

    kill() {
        this.alive = false;
        console.log('Enemy killed');
    }

    isAlive() {
        return this.alive;
    }

    getSprite() {
        return this.sprite;
    }

    getDamage() {
        return this.damage;
    }

    destroy() {
        this.sprite.destroy();
        this.claw1.destroy();
        this.claw2.destroy();
    }
}

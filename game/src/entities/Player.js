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

        // Shooting properties
        this.bullets = [];
        this.fireRate = 200; // milliseconds between shots
        this.nextFire = 0;

        // Damage cooldown properties
        this.lastHitTime = 0;
        this.hitCooldown = 1000; // milliseconds between damage (1 second)

        console.log('Player created at', x, y);
    }

    update(keys) {
        // Calculate movement vector
        let velocityX = 0;
        let velocityY = 0;

        if (keys.W.isDown) {
            velocityY = -this.speed;
        } else if (keys.S.isDown) {
            velocityY = this.speed;
        }

        if (keys.A.isDown) {
            velocityX = -this.speed;
        } else if (keys.D.isDown) {
            velocityX = this.speed;
        }

        // Normalize diagonal movement
        if (velocityX !== 0 && velocityY !== 0) {
            velocityX *= 0.707; // 1/sqrt(2)
            velocityY *= 0.707;
        }

        // Apply velocity
        this.sprite.body.setVelocity(velocityX, velocityY);

        // Position hat above player
        this.hat.setPosition(this.sprite.x, this.sprite.y - 25);

        // Update bullets
        this.bullets = this.bullets.filter(bullet => {
            if (bullet.isAlive()) {
                bullet.update();
                return true;
            }
            return false;
        });
    }

    shoot(targetX, targetY, currentTime) {
        if (currentTime < this.nextFire) return null;

        // Calculate angle to mouse
        const angle = Math.atan2(
            targetY - this.sprite.y,
            targetX - this.sprite.x
        );

        // Create bullet
        const bullet = new this.scene.Bullet(
            this.scene,
            this.sprite.x,
            this.sprite.y,
            angle
        );

        this.bullets.push(bullet);
        this.nextFire = currentTime + this.fireRate;

        console.log('Player fired bullet');
        return bullet;
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

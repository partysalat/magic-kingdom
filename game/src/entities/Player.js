export class Player {
    constructor(scene, x, y, color = 'red') {
        this.scene = scene;
        this.color = color;

        // Create sprite (Gisela the kawaii cowboy crab!)
        this.sprite = scene.add.sprite(x, y, `gisela-${color}`);
        this.sprite.play(`gisela-${color}-idle`);

        // Scale down to appropriate size (96x96 sprite -> 48x48 display)
        this.sprite.setScale(0.5);

        scene.physics.add.existing(this.sprite);

        // Physics body configuration - use circular collision
        this.sprite.body.setCircle(20); // Collision radius
        this.sprite.body.setOffset(28, 28); // Center the collision circle (adjusted for 96x96 sprite)
        this.sprite.body.setCollideWorldBounds(true);
        this.sprite.body.setDrag(500);
        this.sprite.body.setMaxVelocity(300);

        // Player properties
        this.speed = 300;
        this.health = 100;
        this.maxHealth = 100;

        // Shooting properties
        this.bullets = [];
        this.fireRate = 200; // milliseconds between shots
        this.nextFire = 0;

        // Damage cooldown properties
        this.lastHitTime = 0;
        this.hitCooldown = 1000; // milliseconds between damage (1 second)

        console.log(`Player created at ${x}, ${y} (${color} Gisela)`);
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

    heal(amount) {
        const oldHealth = this.health;
        this.health = Math.min(this.health + amount, this.maxHealth);
        const actualHealing = this.health - oldHealth;
        console.log('Player healed:', actualHealing, 'New health:', this.health);
        return actualHealing;
    }

    isDead() {
        return this.health <= 0;
    }

    destroy() {
        this.sprite.destroy();
    }
}

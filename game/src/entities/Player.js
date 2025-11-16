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

        // Buff system
        this.activeBuff = null;
        this.buffEndTime = 0;
        this.buffAura = null;
        this.damageRampMultiplier = 1.0;
        this.rampShotsFired = 0;

        // Shooting properties for buff calculations
        this.shootCooldown = this.fireRate;
        this.bulletDamage = 10;
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

        // Update buff aura position
        if (this.buffAura) {
            this.buffAura.setPosition(this.sprite.x, this.sprite.y);
        }

        // Check buff expiration
        this.getActiveBuff();
    }

    shoot(targetEnemy, currentTime) {
        // Check if we have a target
        if (!targetEnemy || !targetEnemy.isAlive()) {
            return;
        }

        // Check cooldown (modified by rapid_fire buff)
        const activeBuff = this.getActiveBuff();
        let cooldown = this.shootCooldown;

        if (activeBuff === 'rapid_fire') {
            cooldown = this.shootCooldown / 2;
        }

        if (currentTime < this.nextFire) {
            return;
        }

        this.nextFire = currentTime + cooldown;

        // Calculate angle to target enemy
        const targetX = targetEnemy.getSprite().x;
        const targetY = targetEnemy.getSprite().y;
        const dx = targetX - this.sprite.x;
        const dy = targetY - this.sprite.y;
        const baseAngle = Math.atan2(dy, dx);

        // Calculate damage with buffs
        let damage = this.bulletDamage;

        if (activeBuff === 'heavy_hitter') {
            damage *= 2;
        } else if (activeBuff === 'damage_ramp') {
            this.rampShotsFired++;
            this.damageRampMultiplier = 1.0 + (this.rampShotsFired * 0.05);
            damage *= this.damageRampMultiplier;
        } else if (activeBuff === 'critical') {
            if (Math.random() < 0.5) {
                damage *= 3;
            }
        }

        // Determine number of bullets and angles based on buff
        const bulletAngles = [];

        if (activeBuff === 'spread_shot') {
            // 5 bullets in fan pattern
            for (let i = -2; i <= 2; i++) {
                bulletAngles.push(baseAngle + (i * Math.PI / 12));
            }
        } else {
            // Single bullet
            bulletAngles.push(baseAngle);
        }

        // Create bullets
        bulletAngles.forEach(angle => {
            const bullet = new this.scene.Bullet(
                this.scene,
                this.sprite.x,
                this.sprite.y,
                angle,
                damage
            );

            // Mark piercing bullets
            if (activeBuff === 'piercing') {
                bullet.piercing = true;
            }

            this.bullets.push(bullet);
        });
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
        return this.health;
    }

    heal(amount) {
        const oldHealth = this.health;
        this.health = Math.min(this.health + amount, this.maxHealth);
        const actualHealing = this.health - oldHealth;
        return actualHealing;
    }

    isDead() {
        return this.health <= 0;
    }

    applyBuff(cocktailConfig) {
        // Remove old buff visuals if any
        if (this.buffAura) {
            this.buffAura.destroy();
        }

        // Set new buff
        this.activeBuff = cocktailConfig.effect;
        this.buffEndTime = Date.now() + cocktailConfig.duration;

        // Reset damage ramp if applicable
        if (this.activeBuff === 'damage_ramp') {
            this.damageRampMultiplier = 1.0;
            this.rampShotsFired = 0;
        }

        // Create aura visual
        this.buffAura = this.scene.add.circle(
            this.sprite.x,
            this.sprite.y,
            30,
            cocktailConfig.color,
            0.4
        );
        this.buffAura.setDepth(-1);
    }

    getActiveBuff() {
        // Check if buff expired
        if (this.activeBuff && Date.now() > this.buffEndTime) {
            this.clearBuff();
        }
        return this.activeBuff;
    }

    clearBuff() {
        this.activeBuff = null;
        this.buffEndTime = 0;
        this.damageRampMultiplier = 1.0;
        this.rampShotsFired = 0;

        if (this.buffAura) {
            this.buffAura.destroy();
            this.buffAura = null;
        }
    }

    destroy() {
        this.sprite.destroy();
    }
}

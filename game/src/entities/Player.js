export class Player {
    constructor(scene, x, y, color = 'red') {
        this.scene = scene;
        this.color = color;

        // For red color, use directional sprites; others use old system
        if (color === 'red') {
            this.sprite = scene.add.sprite(x, y, `gisela-${color}-down`);
            this.currentDirection = 'down'; // Track current facing direction
            this.useDirectionalSprites = true;
        } else {
            this.sprite = scene.add.sprite(x, y, `gisela-${color}`);
            this.sprite.play(`gisela-${color}-idle`);
            this.useDirectionalSprites = false;
        }

        // Scale down to appropriate size
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
        this.speedMultiplier = 1.0;
        this.health = 100;
        this.maxHealth = 100;

        // Multiplayer properties
        this.playerName = 'Player 1'; // Will be set by PlayerManager
        this.playerIndex = 0; // Will be set by PlayerManager
        this.isDead = false;

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

        // Cocktail inventory system
        this.storedCocktail = null;  // { type: 'mojito', config: {...} }
        this.storedCocktailIndicator = null;  // Visual sprite above player
        this.storedCocktailGlow = null;

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

        // Apply speed multiplier (for ink cloud slow effect)
        velocityX *= this.speedMultiplier;
        velocityY *= this.speedMultiplier;

        // Update sprite direction for red Gisela
        if (this.useDirectionalSprites && (velocityX !== 0 || velocityY !== 0)) {
            this.updateDirection(velocityX, velocityY);
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

        // Update stored cocktail indicator position
        if (this.storedCocktailIndicator) {
            this.storedCocktailIndicator.setPosition(this.sprite.x, this.sprite.y - 40);
        }
        if (this.storedCocktailGlow) {
            this.storedCocktailGlow.setPosition(this.sprite.x, this.sprite.y);
        }

        // Check buff expiration
        this.getActiveBuff();
    }

    shoot(targetEnemy, currentTime) {
        // Check if we have a target
        if (!targetEnemy) {
            return;
        }

        // Validate target based on type
        if (targetEnemy.type === 'tentacle') {
            const enemy = targetEnemy.enemy;
            const tentData = enemy.tentacles ? enemy.tentacles[targetEnemy.tentacleIndex] : null;
            if (!enemy || !enemy.isAlive() || !tentData || !tentData.alive) {
                return;
            }
        } else if (targetEnemy.type === 'enemy') {
            if (!targetEnemy.enemy || !targetEnemy.enemy.isAlive()) {
                return;
            }
        } else {
            // Legacy format: plain enemy object
            if (!targetEnemy.isAlive || !targetEnemy.isAlive()) {
                return;
            }
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

        // Calculate angle to target based on type
        let targetX, targetY;

        if (targetEnemy.type === 'tentacle') {
            const enemy = targetEnemy.enemy;
            const tentSprite = enemy.tentacleSprites ? enemy.tentacleSprites[targetEnemy.tentacleIndex] : null;
            if (tentSprite) {
                targetX = tentSprite.x;
                targetY = tentSprite.y;
            } else {
                return; // No sprite available
            }
        } else if (targetEnemy.type === 'enemy') {
            targetX = targetEnemy.enemy.getSprite().x;
            targetY = targetEnemy.enemy.getSprite().y;
        } else {
            // Legacy format: plain enemy object
            targetX = targetEnemy.getSprite().x;
            targetY = targetEnemy.getSprite().y;
        }

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
        const currentTime = this.scene.time.now;

        // Check if still in cooldown
        if (currentTime < this.lastHitTime + this.hitCooldown) {
            return this.health; // No damage taken
        }

        this.health -= amount;
        if (this.health < 0) this.health = 0;
        this.lastHitTime = currentTime;

        // Flash sprite
        this.sprite.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => {
            this.sprite.clearTint();
        });

        // Check for death
        if (this.health <= 0 && !this.isDead) {
            if (this.scene.playerManager) {
                this.scene.playerManager.handlePlayerDeath(this);
            }
        }

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

    updateDirection(velocityX, velocityY) {
        // Determine direction based on velocity (supports 8 directions)
        let newDirection = this.currentDirection;

        // Define threshold for considering movement in a direction
        const threshold = 0.3; // Lower means more sensitive to slight angles

        const absX = Math.abs(velocityX);
        const absY = Math.abs(velocityY);

        // Check for diagonal movement (both X and Y significant)
        if (absX > threshold && absY > threshold) {
            // Diagonal movement
            if (velocityY < 0) {
                // Moving up
                newDirection = velocityX < 0 ? 'up-left' : 'up-right';
            } else {
                // Moving down
                newDirection = velocityX < 0 ? 'down-left' : 'down-right';
            }
        } else if (absY > absX && absY > threshold) {
            // Primarily vertical movement
            newDirection = velocityY < 0 ? 'up' : 'down';
        } else if (absX > absY && absX > threshold) {
            // Primarily horizontal movement
            newDirection = velocityX < 0 ? 'left' : 'right';
        }

        // Only update texture if direction changed
        if (newDirection !== this.currentDirection) {
            this.currentDirection = newDirection;
            this.sprite.setTexture(`gisela-${this.color}-${newDirection}`);
        }
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

    storeCocktail(cocktailType, config) {
        // Remove old indicator if exists
        if (this.storedCocktailIndicator) {
            this.storedCocktailIndicator.destroy();
        }
        if (this.storedCocktailGlow) {
            this.storedCocktailGlow.destroy();
        }

        // Store the cocktail
        this.storedCocktail = {
            type: cocktailType,
            config: config
        };

        // Create subtle glow around player
        this.storedCocktailGlow = this.scene.add.circle(
            this.sprite.x,
            this.sprite.y,
            35,
            config.color,
            0.15  // Very subtle
        );
        this.storedCocktailGlow.setDepth(-1);

        // Create visual indicator (small sprite above player)
        this.storedCocktailIndicator = this.scene.add.image(
            this.sprite.x,
            this.sprite.y - 40,
            config.sprite
        );
        this.storedCocktailIndicator.setScale(0.5); // Small scale for indicator
        this.storedCocktailIndicator.setDepth(15);

        console.log(`Player ${this.playerName} stored cocktail:`, config.name);
    }

    activateStoredCocktail() {
        if (!this.storedCocktail) {
            console.log(`Player ${this.playerName} has no stored cocktail`);
            return false;
        }

        // If already have active buff, warn and don't activate
        if (this.activeBuff && Date.now() < this.buffEndTime) {
            console.log(`Player ${this.playerName} already has active buff`);
            return false;
        }

        // Apply the buff using existing system
        this.applyBuff(this.storedCocktail.config);

        console.log(`Player ${this.playerName} activated:`, this.storedCocktail.config.name);

        // Remove indicator and glow
        if (this.storedCocktailIndicator) {
            this.storedCocktailIndicator.destroy();
            this.storedCocktailIndicator = null;
        }
        if (this.storedCocktailGlow) {
            this.storedCocktailGlow.destroy();
            this.storedCocktailGlow = null;
        }

        // Clear stored cocktail
        this.storedCocktail = null;

        return true;
    }

    setSpeedMultiplier(multiplier) {
        this.speedMultiplier = multiplier;
    }

    destroy() {
        if (this.storedCocktailIndicator) {
            this.storedCocktailIndicator.destroy();
        }
        if (this.storedCocktailGlow) {
            this.storedCocktailGlow.destroy();
        }
        this.sprite.destroy();
    }
}

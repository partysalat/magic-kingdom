export class Cover {
    constructor(scene, x, y, type) {
        this.scene = scene;
        this.type = type;  // 'table', 'bar', 'barrel', 'piano'
        this.alive = true;
        this.x = x;
        this.y = y;

        // Config will be loaded from COVER_TYPES
        this.loadConfig();

        this.health = this.maxHealth;

        // Create visual representation
        this.createSprite();
    }

    loadConfig() {
        const config = COVER_TYPES[this.type];
        if (!config) {
            throw new Error(`Unknown cover type: ${this.type}`);
        }

        this.name = config.name;
        this.maxHealth = config.maxHealth;
        this.width = config.width;
        this.height = config.height;
        this.color = config.color;
        this.explosive = config.explosive || false;
        this.explosionRadius = config.explosionRadius || 0;
        this.explosionDamage = config.explosionDamage || 0;
    }

    createSprite() {
        // Create rectangle sprite
        this.sprite = this.scene.add.rectangle(
            this.x,
            this.y,
            this.width,
            this.height,
            this.color
        );
        this.sprite.setStrokeStyle(3, 0x000000);

        // Enable physics - static body that blocks movement
        this.scene.physics.add.existing(this.sprite, true); // true = static

        // Enable collision on the body
        this.sprite.body.setSize(this.width, this.height);
        this.sprite.body.setOffset(-this.width / 2, -this.height / 2)

        // Create health bar (initially hidden)
        this.healthBarBg = this.scene.add.rectangle(
            this.x,
            this.y - this.height / 2 - 10,
            this.width,
            4,
            0x000000,
            0.5
        );

        this.healthBarFill = this.scene.add.rectangle(
            this.x,
            this.y - this.height / 2 - 10,
            this.width,
            4,
            0x00ff00,
            0.8
        );

        // Hide health bar initially
        this.healthBarBg.setVisible(false);
        this.healthBarFill.setVisible(false);
    }

    takeDamage(amount) {
        if (!this.alive) return;

        this.health -= amount;

        // Show health bar when first damaged
        if (this.healthBarBg && this.healthBarFill) {
            this.healthBarBg.setVisible(true);
            this.healthBarFill.setVisible(true);
        }

        if (this.health <= 0) {
            this.health = 0;
            this.destroy();
        } else {
            this.updateVisualDamage();
        }
    }

    updateVisualDamage() {
        const healthPercent = this.health / this.maxHealth;

        // Update alpha
        if (healthPercent <= 0.25) {
            // Nearly destroyed - very transparent
            this.sprite.setAlpha(0.4);
        } else if (healthPercent <= 0.5) {
            // Heavily damaged - semi-transparent
            this.sprite.setAlpha(0.6);
        } else if (healthPercent <= 0.75) {
            // Moderately damaged - slight transparency
            this.sprite.setAlpha(0.8);
        } else {
            // Pristine
            this.sprite.setAlpha(1.0);
        }

        // Update health bar
        if (this.healthBarFill) {
            this.healthBarFill.width = this.width * healthPercent;
            this.healthBarFill.x = this.x - this.width / 2 + (this.width * healthPercent) / 2;

            // Color transition: green -> yellow -> red
            if (healthPercent > 0.5) {
                this.healthBarFill.setFillStyle(0x00ff00, 0.8); // Green
            } else if (healthPercent > 0.25) {
                this.healthBarFill.setFillStyle(0xffff00, 0.8); // Yellow
            } else {
                this.healthBarFill.setFillStyle(0xff0000, 0.8); // Red
            }
        }
    }

    destroy() {
        if (!this.alive) return;

        this.alive = false;

        // Create destruction particles
        this.createDestructionEffect();

        if (this.explosive) {
            this.explode();
        }

        // Destroy health bar
        if (this.healthBarBg) {
            this.healthBarBg.destroy();
            this.healthBarBg = null;
        }
        if (this.healthBarFill) {
            this.healthBarFill.destroy();
            this.healthBarFill = null;
        }

        // Destroy sprite after particles
        if (this.sprite) {
            this.scene.time.delayedCall(100, () => {
                if (this.sprite) {
                    this.sprite.destroy();
                    this.sprite = null;
                }
            });
        }
    }

    createDestructionEffect() {
        // Create 5-8 debris particles
        const numParticles = 5 + Math.floor(Math.random() * 4);

        for (let i = 0; i < numParticles; i++) {
            const angle = (Math.PI * 2 * i) / numParticles + Math.random() * 0.5;
            const speed = 100 + Math.random() * 100;
            const size = 4 + Math.random() * 6;

            const particle = this.scene.add.circle(
                this.x,
                this.y,
                size,
                this.color,
                0.8
            );

            this.scene.tweens.add({
                targets: particle,
                x: this.x + Math.cos(angle) * speed,
                y: this.y + Math.sin(angle) * speed,
                alpha: 0,
                duration: 400 + Math.random() * 200,
                onComplete: () => particle.destroy()
            });
        }
    }

    explode() {
        // Create explosion visual
        const explosion = this.scene.add.circle(
            this.x,
            this.y,
            this.explosionRadius,
            0xFF4500,
            0.6
        );

        // Explosion animation
        this.scene.tweens.add({
            targets: explosion,
            scale: { from: 0.5, to: 2 },
            alpha: { from: 0.8, to: 0 },
            duration: 400,
            onComplete: () => explosion.destroy()
        });

        // Damage after a tiny delay to allow this explosion to complete
        this.scene.time.delayedCall(50, () => {
            this.damageInRadius();
        });
    }

    damageInRadius() {
        // Damage all living players
        if (this.scene.playerManager) {
            this.scene.playerManager.getLivingPlayers().forEach(player => {
                const dx = player.getX() - this.x;
                const dy = player.getY() - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < this.explosionRadius) {
                    player.takeDamage(this.explosionDamage);
                }
            });
        }

        // Damage enemies
        this.scene.enemies.forEach(enemy => {
            if (!enemy.isAlive()) return;

            const dx = enemy.getSprite().x - this.x;
            const dy = enemy.getSprite().y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < this.explosionRadius) {
                enemy.takeDamage(this.explosionDamage);
            }
        });

        // Damage other cover objects
        if (this.scene.coverManager) {
            this.scene.coverManager.damageInRadius(
                this.x,
                this.y,
                this.explosionRadius,
                this.explosionDamage,
                this // exclude self
            );
        }
    }

    checkBulletCollision(bulletX, bulletY) {
        if (!this.alive) return false;

        // Simple AABB collision check
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;

        return (
            bulletX >= this.x - halfWidth &&
            bulletX <= this.x + halfWidth &&
            bulletY >= this.y - halfHeight &&
            bulletY <= this.y + halfHeight
        );
    }

    isAlive() {
        return this.alive;
    }

    getSprite() {
        return this.sprite;
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

// Cover type configurations
export const COVER_TYPES = {
    table: {
        name: 'Wooden Table',
        maxHealth: 100,
        width: 80,
        height: 40,
        color: 0x8B4513  // Brown
    },
    bar: {
        name: 'Bar Counter',
        maxHealth: 200,
        width: 120,
        height: 50,
        color: 0x654321  // Dark brown
    },
    barrel: {
        name: 'Barrel',
        maxHealth: 50,
        width: 40,
        height: 40,
        color: 0xA0522D,  // Sienna brown
        explosive: true,
        explosionRadius: 60,
        explosionDamage: 20
    },
    piano: {
        name: 'Piano',
        maxHealth: 150,
        width: 90,
        height: 60,
        color: 0x2F4F4F  // Dark slate gray
    }
};

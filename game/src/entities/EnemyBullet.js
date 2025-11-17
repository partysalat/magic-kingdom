/**
 * EnemyBullet.js
 * Projectile fired by enemies (Shrimp and Lobsters)
 * Note: Enemy bullets CAN and SHOULD hit all players
 * Collision checking is handled in GameScene.updateEnemyBullets()
 */

export class EnemyBullet {
    constructor(scene, x, y, targetX, targetY, damage, bulletType = 'normal') {
        this.scene = scene;
        this.damage = damage;
        this.bulletType = bulletType;  // 'normal', 'heavy', 'burst', 'explosive', 'bubble'
        this.alive = true;

        // Set speed based on bullet type
        if (bulletType === 'heavy') {
            this.speed = 250;
        } else if (bulletType === 'bubble') {
            this.speed = 300;  // Boss bubble bullets
        } else {
            this.speed = 400;
        }

        // Calculate direction with inaccuracy
        const dx = targetX - x;
        const dy = targetY - y;

        // Add spread/inaccuracy (bubbles have no inaccuracy)
        const inaccuracy = bulletType === 'heavy' ? 0.05 : (bulletType === 'bubble' ? 0 : 0.1);  // radians
        const baseAngle = Math.atan2(dy, dx);
        const finalAngle = baseAngle + (Math.random() - 0.5) * inaccuracy;

        this.velocityX = Math.cos(finalAngle) * this.speed;
        this.velocityY = Math.sin(finalAngle) * this.speed;
        this.angle = finalAngle;

        // Create Phaser sprite with type-specific visuals
        let size, color;
        if (bulletType === 'heavy') {
            size = 12;
            color = 0xFF4500;
        } else if (bulletType === 'bubble') {
            size = 14;  // Larger than normal
            color = 0x00BFFF;  // Blue-tinted
        } else {
            size = 8;
            color = 0xFFD700;
        }

        this.sprite = scene.add.circle(x, y, size / 2, color);

        // Bubble bullets have a special visual style
        if (bulletType === 'bubble') {
            this.sprite.setStrokeStyle(2, 0x87CEEB, 0.8);
            this.sprite.setAlpha(0.8);
        } else {
            this.sprite.setStrokeStyle(2, 0x000000, 0.5);
        }

        // Add glow effect
        this.sprite.setBlendMode(Phaser.BlendModes.ADD);

        // Lifetime limit (remove if goes off-screen)
        this.maxLifetime = 5000;  // 5 seconds
        this.spawnTime = Date.now();
    }

    update(deltaTime) {
        if (!this.alive) return;

        // Update position
        const dt = deltaTime / 1000;  // Convert to seconds
        this.sprite.x += this.velocityX * dt;
        this.sprite.y += this.velocityY * dt;

        // Check bounds (1920x1080 with margin)
        if (this.sprite.x < -50 || this.sprite.x > 1970 ||
            this.sprite.y < -50 || this.sprite.y > 1130) {
            this.destroy();
            return;
        }

        // Check lifetime
        if (Date.now() - this.spawnTime > this.maxLifetime) {
            this.destroy();
            return;
        }
    }

    checkCollision(targetX, targetY, targetRadius) {
        const dx = this.sprite.x - targetX;
        const dy = this.sprite.y - targetY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        let bulletRadius;
        if (this.bulletType === 'heavy') {
            bulletRadius = 6;
        } else if (this.bulletType === 'bubble') {
            bulletRadius = 7;  // Larger bubble bullets
        } else {
            bulletRadius = 4;
        }

        return distance < (bulletRadius + targetRadius);
    }

    getDamage() {
        return this.damage;
    }

    explode() {
        if (this.bulletType === 'explosive') {
            // Create explosion visual
            const explosion = this.scene.add.circle(
                this.sprite.x,
                this.sprite.y,
                30,
                0xFF4500,
                0.6
            );
            explosion.setBlendMode(Phaser.BlendModes.ADD);

            // Animate explosion
            this.scene.tweens.add({
                targets: explosion,
                scale: { from: 0.5, to: 2 },
                alpha: { from: 0.8, to: 0 },
                duration: 400,
                onComplete: () => explosion.destroy()
            });

            // Return explosion data for AoE damage
            return {
                x: this.sprite.x,
                y: this.sprite.y,
                radius: 30,
                damage: this.damage * 0.5
            };
        }

        return null;
    }

    destroy() {
        this.alive = false;

        if (this.sprite) {
            this.sprite.destroy();
        }
    }

    isActive() {
        return this.alive;
    }

    getSprite() {
        return this.sprite;
    }
}

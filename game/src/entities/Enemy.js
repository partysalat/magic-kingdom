// Enemy type configurations
const ENEMY_TYPES = {
    lobster: {
        name: 'Bandit Lobster',
        health: 30,
        speed: 80,
        damage: 10,
        color: 0xff6600,
        radius: 15,
        behavior: 'basic_shooter',
        attackRange: 400,
        attackCooldown: 1000
    },
    shrimp: {
        name: 'Quick-Draw Shrimp',
        health: 15,
        speed: 200,
        damage: 5,
        color: 0xff9999,
        radius: 10,
        behavior: 'fast_melee',
        attackRange: 50,
        attackCooldown: 500
    },
    hermit: {
        name: 'Hermit Crab Tank',
        health: 100,
        speed: 40,
        damage: 20,
        color: 0x8b4513,
        radius: 25,
        behavior: 'tank',
        attackRange: 100,
        attackCooldown: 2000
    },
    jellyfish: {
        name: 'Jellyfish Ghost',
        health: 40,
        speed: 60,
        damage: 15,
        color: 0xcc99ff,
        radius: 18,
        behavior: 'teleport',
        attackRange: 500,
        attackCooldown: 3000,
        teleportCooldown: 5000
    },
    flyingfish: {
        name: 'Flying Fish',
        health: 20,
        speed: 150,
        damage: 8,
        color: 0x00ccff,
        radius: 12,
        behavior: 'swoop',
        attackRange: 600,
        attackCooldown: 2500,
        swoopDistance: 300
    }
};

export { ENEMY_TYPES };

export class Enemy {
    constructor(scene, x, y, type = 'lobster', isBounty = false, bountyValue = 0) {
        this.scene = scene;
        this.type = type;
        this.isBounty = isBounty;
        this.bountyValue = bountyValue;
        this.bountyName = '';

        // Get configuration for this enemy type
        const config = ENEMY_TYPES[type];
        if (!config) {
            console.error('Unknown enemy type:', type);
            return;
        }

        this.config = config;

        // Create placeholder graphics
        this.sprite = scene.add.circle(x, y, config.radius, config.color);
        scene.physics.add.existing(this.sprite);

        // Physics configuration
        this.sprite.body.setCollideWorldBounds(true);

        // Enemy properties from config
        this.health = config.health;
        this.maxHealth = config.health;
        this.speed = config.speed;
        this.damage = config.damage;
        this.attackRange = config.attackRange;
        this.attackCooldown = config.attackCooldown;
        this.nextAttack = 0;

        // Behavior-specific properties
        this.lastTeleport = 0;
        this.swoopPhase = 'idle'; // for flying fish: 'idle', 'rising', 'swooping'
        this.swoopTarget = { x: 0, y: 0 };

        // Visual indicators based on type
        this.createVisualIndicators();

        // After existing properties, add bounty visual indicator
        if (this.isBounty) {
            this.createBountyIndicator();
        }

        this.alive = true;

        console.log('Enemy created:', config.name, 'at', x, y);
    }

    createVisualIndicators() {
        switch(this.type) {
            case 'lobster':
                // Two claws
                this.claw1 = this.scene.add.circle(this.sprite.x - 12, this.sprite.y, 5, 0xff3300);
                this.claw2 = this.scene.add.circle(this.sprite.x + 12, this.sprite.y, 5, 0xff3300);
                break;
            case 'shrimp':
                // Small antennae
                this.antenna1 = this.scene.add.circle(this.sprite.x - 6, this.sprite.y - 8, 3, 0xff6666);
                this.antenna2 = this.scene.add.circle(this.sprite.x + 6, this.sprite.y - 8, 3, 0xff6666);
                break;
            case 'hermit':
                // Shell outline
                this.shell = this.scene.add.circle(this.sprite.x, this.sprite.y, this.config.radius + 5, 0x654321);
                this.shell.setStrokeStyle(3, 0x4a3a2a);
                this.shell.setFillStyle(0x654321, 0.5);
                this.shell.setDepth(-1);
                break;
            case 'jellyfish':
                // Tentacles
                this.tentacles = [];
                for (let i = 0; i < 4; i++) {
                    const angle = (i / 4) * Math.PI * 2;
                    const tentacle = this.scene.add.circle(
                        this.sprite.x + Math.cos(angle) * 15,
                        this.sprite.y + Math.sin(angle) * 15,
                        4,
                        0x9966cc
                    );
                    this.tentacles.push(tentacle);
                }
                break;
            case 'flyingfish':
                // Wings
                this.wing1 = this.scene.add.circle(this.sprite.x - 10, this.sprite.y, 6, 0x0099cc);
                this.wing2 = this.scene.add.circle(this.sprite.x + 10, this.sprite.y, 6, 0x0099cc);
                break;
        }
    }

    createBountyIndicator() {
        // Wanted poster icon above enemy
        this.bountyIcon = this.scene.add.circle(
            this.sprite.x,
            this.sprite.y - 30,
            10,
            0xffff00
        );
        this.bountyIcon.setStrokeStyle(2, 0xff0000);

        // Spotlight effect
        this.spotLight = this.scene.add.circle(
            this.sprite.x,
            this.sprite.y,
            this.config.radius + 15,
            0xffff00,
            0.3
        );
    }

    updateBountyVisuals() {
        if (this.isBounty && this.bountyIcon && this.spotLight) {
            this.bountyIcon.setPosition(this.sprite.x, this.sprite.y - 30);
            this.spotLight.setPosition(this.sprite.x, this.sprite.y);

            // Pulse animation
            const pulse = Math.sin(Date.now() / 300) * 0.15 + 0.85;
            this.spotLight.setScale(pulse);
        }
    }

    getBountyValue() {
        return this.bountyValue;
    }

    isBountyEnemy() {
        return this.isBounty;
    }

    setBountyName(name) {
        this.bountyName = name;
    }

    getBountyName() {
        return this.bountyName;
    }

    update(time, playerX, playerY) {
        if (!this.alive) return;

        // Route to behavior-specific update
        switch(this.config.behavior) {
            case 'basic_shooter':
                this.updateBasicShooter(time, playerX, playerY);
                break;
            case 'fast_melee':
                this.updateFastMelee(time, playerX, playerY);
                break;
            case 'tank':
                this.updateTank(time, playerX, playerY);
                break;
            case 'teleport':
                this.updateTeleport(time, playerX, playerY);
                break;
            case 'swoop':
                this.updateSwoop(time, playerX, playerY);
                break;
        }

        // Update visual indicators
        this.updateVisuals();
    }

    updateBasicShooter(time, playerX, playerY) {
        const dx = playerX - this.sprite.x;
        const dy = playerY - this.sprite.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Move toward player at medium speed
        if (distance > 50) {
            const angle = Math.atan2(dy, dx);
            this.sprite.body.setVelocity(
                Math.cos(angle) * this.speed,
                Math.sin(angle) * this.speed
            );
        } else {
            this.sprite.body.setVelocity(0, 0);
        }
    }

    updateFastMelee(time, playerX, playerY) {
        const dx = playerX - this.sprite.x;
        const dy = playerY - this.sprite.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Dart quickly toward player
        const angle = Math.atan2(dy, dx);
        this.sprite.body.setVelocity(
            Math.cos(angle) * this.speed,
            Math.sin(angle) * this.speed
        );
    }

    updateTank(time, playerX, playerY) {
        const dx = playerX - this.sprite.x;
        const dy = playerY - this.sprite.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Slow advance toward player
        if (distance > 40) {
            const angle = Math.atan2(dy, dx);
            this.sprite.body.setVelocity(
                Math.cos(angle) * this.speed,
                Math.sin(angle) * this.speed
            );
        } else {
            this.sprite.body.setVelocity(0, 0);
        }
    }

    updateTeleport(time, playerX, playerY) {
        const dx = playerX - this.sprite.x;
        const dy = playerY - this.sprite.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Check if we should teleport
        if (time - this.lastTeleport > this.config.teleportCooldown && distance > 200) {
            // Teleport closer to player (but not too close)
            const angle = Math.atan2(dy, dx);
            const teleportDistance = 150;
            const newX = this.sprite.x + Math.cos(angle) * teleportDistance;
            const newY = this.sprite.y + Math.sin(angle) * teleportDistance;

            // Clamp to world bounds
            const clampedX = Math.max(50, Math.min(1870, newX));
            const clampedY = Math.max(50, Math.min(1030, newY));

            this.sprite.setPosition(clampedX, clampedY);
            this.lastTeleport = time;

            // Visual effect
            this.scene.cameras.main.flash(200, 200, 150, 255);
        }

        // Float slowly toward player
        const angle = Math.atan2(dy, dx);
        this.sprite.body.setVelocity(
            Math.cos(angle) * this.speed,
            Math.sin(angle) * this.speed
        );
    }

    updateSwoop(time, playerX, playerY) {
        const dx = playerX - this.sprite.x;
        const dy = playerY - this.sprite.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        switch(this.swoopPhase) {
            case 'idle':
                // Circle around player at high altitude
                const angle = Math.atan2(dy, dx) + Math.PI / 2;
                this.sprite.body.setVelocity(
                    Math.cos(angle) * this.speed * 0.6,
                    Math.sin(angle) * this.speed * 0.6
                );

                // Prepare swoop if in range
                if (distance < this.attackRange && time - this.nextAttack > this.attackCooldown) {
                    this.swoopPhase = 'swooping';
                    this.swoopTarget = { x: playerX, y: playerY };
                    this.nextAttack = time + this.attackCooldown;
                }
                break;

            case 'swooping':
                // Fast attack toward saved target position
                const swoopAngle = Math.atan2(
                    this.swoopTarget.y - this.sprite.y,
                    this.swoopTarget.x - this.sprite.x
                );
                this.sprite.body.setVelocity(
                    Math.cos(swoopAngle) * this.speed * 1.5,
                    Math.sin(swoopAngle) * this.speed * 1.5
                );

                // Check if reached target
                const targetDist = Math.sqrt(
                    Math.pow(this.swoopTarget.x - this.sprite.x, 2) +
                    Math.pow(this.swoopTarget.y - this.sprite.y, 2)
                );

                if (targetDist < 30) {
                    this.swoopPhase = 'rising';
                }
                break;

            case 'rising':
                // Move away from player after swoop
                const escapeAngle = Math.atan2(dy, dx) + Math.PI;
                this.sprite.body.setVelocity(
                    Math.cos(escapeAngle) * this.speed,
                    Math.sin(escapeAngle) * this.speed
                );

                // Return to idle after getting distance
                if (distance > 200) {
                    this.swoopPhase = 'idle';
                }
                break;
        }
    }

    updateVisuals() {
        switch(this.type) {
            case 'lobster':
                if (this.claw1 && this.claw2) {
                    this.claw1.setPosition(this.sprite.x - 12, this.sprite.y);
                    this.claw2.setPosition(this.sprite.x + 12, this.sprite.y);
                }
                break;
            case 'shrimp':
                if (this.antenna1 && this.antenna2) {
                    this.antenna1.setPosition(this.sprite.x - 6, this.sprite.y - 8);
                    this.antenna2.setPosition(this.sprite.x + 6, this.sprite.y - 8);
                }
                break;
            case 'hermit':
                if (this.shell) {
                    this.shell.setPosition(this.sprite.x, this.sprite.y);
                }
                break;
            case 'jellyfish':
                if (this.tentacles) {
                    this.tentacles.forEach((tentacle, i) => {
                        const angle = (i / 4) * Math.PI * 2 + (Date.now() / 500);
                        tentacle.setPosition(
                            this.sprite.x + Math.cos(angle) * 15,
                            this.sprite.y + Math.sin(angle) * 15
                        );
                    });
                }
                break;
            case 'flyingfish':
                if (this.wing1 && this.wing2) {
                    this.wing1.setPosition(this.sprite.x - 10, this.sprite.y);
                    this.wing2.setPosition(this.sprite.x + 10, this.sprite.y);
                }
                break;
        }

        // Update bounty visuals if this is a bounty enemy
        this.updateBountyVisuals();
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

        // Clean up type-specific visuals
        switch(this.type) {
            case 'lobster':
                if (this.claw1) this.claw1.destroy();
                if (this.claw2) this.claw2.destroy();
                break;
            case 'shrimp':
                if (this.antenna1) this.antenna1.destroy();
                if (this.antenna2) this.antenna2.destroy();
                break;
            case 'hermit':
                if (this.shell) this.shell.destroy();
                break;
            case 'jellyfish':
                if (this.tentacles) {
                    this.tentacles.forEach(t => t.destroy());
                }
                break;
            case 'flyingfish':
                if (this.wing1) this.wing1.destroy();
                if (this.wing2) this.wing2.destroy();
                break;
        }

        // Clean up bounty visuals
        if (this.bountyIcon) this.bountyIcon.destroy();
        if (this.spotLight) this.spotLight.destroy();
    }
}

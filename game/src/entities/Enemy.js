import { EnemyBullet } from './EnemyBullet.js';

// Enemy type configurations
const ENEMY_TYPES = {
    lobster: {
        name: 'Bandit Lobster',
        health: 30,
        speed: 80,
        damage: 10,
        color: 0xff6600,
        radius: 15,
        behavior: 'ranged_shooter',        // CHANGED for ranged combat
        attackRange: 400,
        attackCooldown: 3500,              // CHANGED - 3.5 second cooldown
        shootSpeed: 250,                   // NEW
        bulletDamage: 8,                   // NEW
        telegraphDuration: 400             // NEW - wind-up before shot
    },
    shrimp: {
        name: 'Quick-Draw Shrimp',
        health: 15,
        speed: 200,
        damage: 5,
        color: 0xff9999,
        radius: 10,
        behavior: 'ranged_kiter',          // CHANGED for ranged combat
        attackRange: 350,                  // CHANGED
        attackCooldown: 1500,              // CHANGED - 1.5 second cooldown
        shootSpeed: 400,                   // NEW
        bulletDamage: 4,                   // NEW
        kiteDistance: 200                  // NEW - maintain distance while shooting
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
    },
    boss_iron_shell: {
        name: 'Iron Shell',
        health: 400,
        speed: 60,
        damage: 15,
        color: 0x4a4a4a,
        radius: 45,  // 3x normal hermit (15)
        behavior: 'boss_iron_shell',
        attackRange: 500,
        attackCooldown: 3000,
        isBoss: true,
        // Phase-specific properties
        phase2Speed: 120,
        phase2Cooldown: 2000,
        phase2Threshold: 0.5,  // 50% HP
        chargeSpeed: 400,
        chargeDamage: 20,
        chargeTelegraphDuration: 500,
        chargeDistance: 400,
        bubbleSpeed: 300,
        bubbleDamage: 12,
        bubbleCount: 3
    },
    boss_kraken_arm: {
        name: "The Kraken's Arm",
        health: 300,  // Body health
        speed: 40,
        damage: 20,
        color: 0x9966cc,
        radius: 60,
        behavior: 'boss_kraken_arm',
        attackRange: 600,
        attackCooldown: 4000,
        isBoss: true,
        // Tentacle properties
        tentacleHealth: 80,
        tentacleCount: 4,
        tentacleRegenRate: 5,  // HP per second
        tentacleLength: 40,
        // Ink cloud properties
        inkCloudRadius: 100,
        inkCloudDuration: 8000,
        inkCloudSlowFactor: 0.7,
        inkTrigger1: 0.6,  // 60% body HP
        inkTrigger2: 0.3,  // 30% body HP
        // Sweep attack
        sweepCooldown: 10000,
        sweepDamage: 25
    },
    boss_leviathan: {
        name: 'The Leviathan',
        health: 400,  // Per phase
        speed: 80,
        damage: 25,
        color: 0xff4500,
        radius: 60,
        behavior: 'boss_leviathan',
        attackRange: 700,
        attackCooldown: 5000,
        isBoss: true,
        // Multi-phase
        totalPhases: 2,
        phase2Color: 0x4169e1,  // Changes color in phase 2
        // Attack patterns
        bulletStormCount: 12,
        bulletStormDamage: 8,
        bulletStormCooldown: 5000,
        bulletStormSpeed: 350,
        groundPoundDamage: 30,
        groundPoundRadius: 200,
        groundPoundCooldown: 8000,
        chargeDamage: 25,
        chargeSpeed: 500,
        chargeCooldown: 6000,
        lightningCount: 3,
        lightningDamage: 35,
        lightningRadius: 80,
        lightningCooldown: 7000,
        tidalWaveDamage: 40,
        tidalWaveCooldown: 12000,
        // Minion spawning
        phase2InitialAdds: ['shrimp', 'shrimp', 'lobster', 'lobster'],
        phase2MidAdds: ['shrimp', 'lobster'],
        minionSpawnThreshold: 0.5
    }
};

export { ENEMY_TYPES };

export class Enemy {
    constructor(scene, x, y, type = 'lobster', isBounty = false, bountyValue = 0, difficultyMultipliers = null) {
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

        // Store difficulty multipliers for later use (bullet damage scaling)
        // Use default multipliers if none provided to prevent null issues
        this.difficultyMultipliers = difficultyMultipliers || {
            health: 1.0,
            damage: 1.0,
            count: 1.0
        };

        // Create sprite based on enemy type
        if (type === 'lobster') {
            // Use directional sprites for bandit lobster
            this.sprite = scene.add.sprite(x, y, 'bandit-lobster-down');
            this.currentDirection = 'down';
            this.useDirectionalSprites = true;
            this.spritePrefix = 'bandit-lobster';
        } else if (type === 'hermit') {
            // Use directional sprites for hermit tank
            this.sprite = scene.add.sprite(x, y, 'hermit-tank-down');
            this.currentDirection = 'down';
            this.useDirectionalSprites = true;
            this.spritePrefix = 'hermit-tank';
        } else if (type === 'shrimp') {
            // Use directional sprites for shrimp
            this.sprite = scene.add.sprite(x, y, 'shrimp-down');
            this.currentDirection = 'down';
            this.useDirectionalSprites = true;
            this.spritePrefix = 'shrimp';
        } else {
            // Create placeholder graphics for other enemies
            this.sprite = scene.add.circle(x, y, config.radius, config.color);
            this.useDirectionalSprites = false;
        }
        scene.physics.add.existing(this.sprite);

        // Physics configuration
        this.sprite.body.setCollideWorldBounds(true);

        // Apply difficulty multipliers to stats
        const scaledHealth = Math.ceil(config.health * this.difficultyMultipliers.health);
        const scaledDamage = Math.ceil(config.damage * this.difficultyMultipliers.damage);

        // Enemy properties from config
        this.health = scaledHealth;
        this.maxHealth = scaledHealth;
        this.speed = config.speed;
        this.damage = scaledDamage;
        this.attackRange = config.attackRange;
        this.attackCooldown = config.attackCooldown;
        this.nextAttack = 0;

        // Behavior-specific properties
        this.lastTeleport = 0;
        this.swoopPhase = 'idle'; // for flying fish: 'idle', 'rising', 'swooping'
        this.swoopTarget = { x: 0, y: 0 };

        // Shooting properties
        this.lastShotTime = 0;
        this.isWindingUp = false;
        this.windUpStartTime = 0;

        // Boss-specific properties
        this.bossPhase = 1;
        this.phaseTransitioning = false;
        this.lastAttackType = null;
        this.attackRotation = 0;
        this.chargingAttack = false;
        this.chargeHitPlayer = false;
        this.lastChargeTime = 0;

        // Kraken tentacle system
        this.tentacles = [];
        this.tentacleSprites = [];
        this.bodyInvulnerable = false;
        this.inkClouds = [];
        this.inkTriggered1 = false;
        this.inkTriggered2 = false;
        this.lastSweepTime = 0;

        // Formation system properties
        this.role = null; // 'tank', 'shooter', or null
        this.formationGroup = null; // identifier for which formation this enemy belongs to
        this.formationLeader = null; // reference to tank if this is a shooter
        this.formationMembers = []; // references to shooters if this is a tank

        // Visual indicators based on type
        this.createVisualIndicators();

        // After existing properties, add bounty visual indicator
        if (this.isBounty) {
            this.createBountyIndicator();
        }

        this.alive = true;

        // Spawn animation properties
        this.collisionEnabled = true;
        this.alphaValue = 1.0;

        console.log('Enemy created:', config.name, 'at', x, y);
    }

    createVisualIndicators() {
        switch(this.type) {
            case 'lobster':
                // Lobster now uses sprites, no visual indicators needed
                break;
            case 'shrimp':
                // Shrimp now uses sprites, no visual indicators needed
                break;
            case 'hermit':
                // Hermit now uses sprites, no visual indicators needed
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
            case 'boss_kraken_arm':
                // Create tentacle system
                this.initializeKrakenTentacles();
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

    updateFormationVisuals() {
        if (!this.sprite || !this.config) return;

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

    /**
     * Get the closest living player to this enemy
     */
    getClosestPlayer() {
        if (!this.scene.playerManager) {
            // Fallback to legacy single player
            return this.scene.player;
        }

        const livingPlayers = this.scene.playerManager.getLivingPlayers();
        if (livingPlayers.length === 0) {
            return this.scene.player; // Fallback
        }

        let closestPlayer = livingPlayers[0];
        let closestDistance = Infinity;

        livingPlayers.forEach(player => {
            const dx = player.getX() - this.sprite.x;
            const dy = player.getY() - this.sprite.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < closestDistance) {
                closestDistance = distance;
                closestPlayer = player;
            }
        });

        return closestPlayer;
    }

    update(time, playerX, playerY) {
        if (!this.alive) return;

        // Handle formation positioning for movement
        let formationHandled = false;
        if (this.role === 'shooter' && this.formationLeader) {
            this.updateShooterPosition();
            formationHandled = true;
        } else if (this.role === 'tank' && this.formationMembers.length > 0) {
            this.updateTankPosition();
            formationHandled = true;
        }

        // Route to behavior-specific update for attack logic
        // Pass formationHandled flag to skip movement if already positioned
        switch(this.config.behavior) {
            case 'ranged_shooter':
                this.updateRangedShooter(time, playerX, playerY, formationHandled);
                break;
            case 'ranged_kiter':
                this.updateRangedKiter(time, playerX, playerY, formationHandled);
                break;
            case 'basic_shooter':
                this.updateBasicShooter(time, playerX, playerY, formationHandled);
                break;
            case 'fast_melee':
                this.updateFastMelee(time, playerX, playerY, formationHandled);
                break;
            case 'tank':
                this.updateTank(time, playerX, playerY, formationHandled);
                break;
            case 'teleport':
                this.updateTeleport(time, playerX, playerY, formationHandled);
                break;
            case 'swoop':
                this.updateSwoop(time, playerX, playerY, formationHandled);
                break;
            case 'boss_iron_shell':
                this.updateBossIronShell(time, playerX, playerY);
                break;
            case 'boss_kraken_arm':
                this.updateBossKrakenArm(time, playerX, playerY);
                break;
            case 'boss_leviathan':
                this.updateBossLeviathan(time, playerX, playerY);
                break;
        }

        // Update directional sprites based on velocity
        if (this.useDirectionalSprites && this.sprite.body) {
            this.updateDirection(this.sprite.body.velocity.x, this.sprite.body.velocity.y);
        }

        // Update visual indicators
        this.updateVisuals();
    }

    updateDirection(velocityX, velocityY) {
        // Determine direction based on velocity (supports 8 directions)
        let newDirection = this.currentDirection;

        // Define threshold for considering movement in a direction
        const threshold = 0.3;

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
            this.sprite.setTexture(`${this.spritePrefix}-${newDirection}`);
        }
    }

    updateBasicShooter(time, playerX, playerY, skipMovement = false) {
        // Only handle movement if not in formation
        if (!skipMovement) {
            const dx = playerX - this.sprite.x;
            const dy = playerY - this.sprite.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Shooters maintain optimal distance
            if (this.role === 'shooter') {
                const optimalDistance = 300;

                if (distance < optimalDistance - 50) {
                    // Too close - back away
                    this.sprite.x -= (dx / distance) * this.config.speed * 0.5;
                    this.sprite.y -= (dy / distance) * this.config.speed * 0.5;
                    return;
                }
            }

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
    }

    updateFastMelee(time, playerX, playerY, skipMovement = false) {
        // Only handle movement if not in formation
        if (!skipMovement) {
            const dx = playerX - this.sprite.x;
            const dy = playerY - this.sprite.y;

            // Dart quickly toward player
            const angle = Math.atan2(dy, dx);
            this.sprite.body.setVelocity(
                Math.cos(angle) * this.speed,
                Math.sin(angle) * this.speed
            );
        }
    }

    updateTank(time, playerX, playerY, skipMovement = false) {
        // Only handle movement if not in formation
        if (!skipMovement) {
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
    }

    updateTeleport(time, playerX, playerY, skipMovement = false) {
        const dx = playerX - this.sprite.x;
        const dy = playerY - this.sprite.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Only handle movement/teleport if not in formation
        if (!skipMovement) {
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
    }

    updateSwoop(time, playerX, playerY, skipMovement = false) {
        // Only handle movement if not in formation
        if (!skipMovement) {
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
    }

    updateVisuals() {
        switch(this.type) {
            case 'lobster':
                // Lobster now uses sprites, no visual indicators to update
                break;
            case 'shrimp':
                // Shrimp now uses sprites, no visual indicators to update
                break;
            case 'hermit':
                // Hermit now uses sprites, no visual indicators to update
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

        // Update formation role visuals
        this.updateFormationVisuals();
    }

    /**
     * Update position for shooter in formation
     * Positions shooter 100px behind their tank (away from player)
     */
    updateShooterPosition() {
        // Check if leader is alive
        if (!this.formationLeader || !this.formationLeader.isAlive()) {
            console.log('Formation broken: Shooter lost tank leader');
            this.role = null;
            this.formationLeader = null;
            return;
        }

        const leader = this.formationLeader;
        const leaderPos = { x: leader.getSprite().x, y: leader.getSprite().y };
        const closestPlayer = this.getClosestPlayer();
        const playerPos = { x: closestPlayer.getX(), y: closestPlayer.getY() };

        // Calculate angle from player to tank
        const angleToTank = Math.atan2(
            leaderPos.y - playerPos.y,
            leaderPos.x - playerPos.x
        );

        // Position shooter 100 pixels behind tank (away from player)
        const distance = 100;
        const targetX = leaderPos.x + Math.cos(angleToTank) * distance;
        const targetY = leaderPos.y + Math.sin(angleToTank) * distance;

        // Move toward target position using velocity
        const dx = targetX - this.getSprite().x;
        const dy = targetY - this.getSprite().y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 10) {
            const moveSpeed = this.config.speed;
            this.sprite.body.setVelocity(
                (dx / dist) * moveSpeed,
                (dy / dist) * moveSpeed
            );
        } else {
            this.sprite.body.setVelocity(0, 0);
        }
    }

    /**
     * Update position for tank in formation
     * Tanks move toward player at reduced speed when protecting shooters
     */
    updateTankPosition() {
        // Clean up dead shooters
        this.formationMembers = this.formationMembers.filter(s => s.isAlive());

        if (this.formationMembers.length === 0) {
            console.log('Formation broken: Tank lost all shooters');
            this.role = null;
            return;
        }

        // Tanks simply move toward player at reduced speed using velocity
        // Shooters will position themselves behind the tank
        const closestPlayer = this.getClosestPlayer();
        const playerPos = { x: closestPlayer.getX(), y: closestPlayer.getY() };

        const dx = playerPos.x - this.getSprite().x;
        const dy = playerPos.y - this.getSprite().y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 10) {
            const moveSpeed = this.config.speed * 0.6; // 40% slower when protecting
            this.sprite.body.setVelocity(
                (dx / dist) * moveSpeed,
                (dy / dist) * moveSpeed
            );
        } else {
            this.sprite.body.setVelocity(0, 0);
        }
    }

    takeDamage(amount) {
        // Leviathan phase 1 protection - prevent death, trigger phase 2
        if (this.type === 'boss_leviathan' && this.bossPhase === 1) {
            this.health -= amount;
            if (this.health <= 0) {
                this.health = 0;
                // Don't call kill() - will transition in next update
                return 0;
            }
            console.log('Leviathan took', amount, 'damage. Health:', this.health);
            return this.health;
        }

        // Kraken-specific invulnerability
        if (this.type === 'boss_kraken_arm' && this.bodyInvulnerable) {
            console.log('Kraken body is invulnerable! Damage tentacles first!');
            return this.health;
        }

        // Tanks take reduced damage when protecting shooters
        if (this.role === 'tank' && this.formationMembers.length > 0) {
            amount *= 0.8; // 20% damage reduction

            // Visual feedback for damage reduction
            this.flashProtectionShield();
        }

        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            this.kill();
        }
        console.log('Enemy took', amount, 'damage. Health:', this.health);
        return this.health;
    }

    flashProtectionShield() {
        // Create brief shield flash
        const shield = this.scene.add.circle(
            this.getSprite().x,
            this.getSprite().y,
            this.config.radius + 10,
            0x00ffff,
            0.3
        );

        this.scene.tweens.add({
            targets: shield,
            alpha: 0,
            duration: 200,
            onComplete: () => shield.destroy()
        });
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
            case 'boss_kraken_arm':
                // Destroy tentacle sprites
                if (this.tentacleSprites) {
                    this.tentacleSprites.forEach(sprite => {
                        if (sprite) sprite.destroy();
                    });
                }
                // Destroy ink clouds
                if (this.inkClouds) {
                    this.inkClouds.forEach(cloud => {
                        if (cloud) cloud.destroy();
                    });
                }
                break;
        }

        // Clean up bounty visuals
        if (this.bountyIcon) this.bountyIcon.destroy();
        if (this.spotLight) this.spotLight.destroy();
    }

    /**
     * Ranged Shooter behavior (Bandit Lobster)
     * Advances toward player, stops, winds up, shoots
     */
    updateRangedShooter(time, playerX, playerY, skipMovement = false) {
        const dx = playerX - this.sprite.x;
        const dy = playerY - this.sprite.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const currentTime = Date.now();

        // Shooters maintain optimal distance
        if (!skipMovement && this.role === 'shooter') {
            const optimalDistance = 300;

            if (distance < optimalDistance - 50) {
                // Too close - back away
                this.sprite.x -= (dx / distance) * this.config.speed * 0.5;
                this.sprite.y -= (dy / distance) * this.config.speed * 0.5;
                return;
            }
        }

        // Wind-up animation in progress
        if (this.isWindingUp) {
            const windUpElapsed = currentTime - this.windUpStartTime;

            // Visual: Pulsing/growing during wind-up
            const pulseFactor = 1 + Math.sin(windUpElapsed / 50) * 0.15;
            this.sprite.setScale(pulseFactor);

            if (windUpElapsed >= this.config.telegraphDuration) {
                // Fire!
                this.fireBullet(playerX, playerY, 'heavy');
                this.isWindingUp = false;
                this.sprite.setScale(1);
                this.lastShotTime = currentTime;
            }

            return;  // Don't move during wind-up
        }

        // Check if can shoot
        const canShoot = (currentTime - this.lastShotTime) >= this.config.attackCooldown;

        if (distance <= this.config.attackRange && canShoot) {
            // Start wind-up
            this.isWindingUp = true;
            this.windUpStartTime = currentTime;
            if (!skipMovement) {
                this.sprite.body.setVelocity(0, 0);
            }
        } else if (!skipMovement) {
            // Only handle movement if not in formation
            if (distance > 50) {
                // Move toward player
                const angle = Math.atan2(dy, dx);
                this.sprite.body.setVelocity(
                    Math.cos(angle) * this.config.speed,
                    Math.sin(angle) * this.config.speed
                );
            } else {
                // Close enough, stop
                this.sprite.body.setVelocity(0, 0);
            }
        }
    }

    /**
     * Ranged Kiter behavior (Quick-Draw Shrimp)
     * Maintains distance while shooting rapidly
     */
    updateRangedKiter(time, playerX, playerY, skipMovement = false) {
        const dx = playerX - this.sprite.x;
        const dy = playerY - this.sprite.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const currentTime = Date.now();
        const canShoot = (currentTime - this.lastShotTime) >= this.config.attackCooldown;

        // Shoot if in range
        if (distance <= this.config.attackRange && canShoot) {
            this.fireBullet(playerX, playerY, 'normal');
            this.lastShotTime = currentTime;
        }

        // Only handle movement if not in formation
        if (!skipMovement) {
            // Shooters maintain optimal distance (enhanced kiting for formation shooters)
            if (this.role === 'shooter' && distance < 250) {
                // Too close - back away
                this.sprite.x -= (dx / distance) * this.config.speed * 0.5;
                this.sprite.y -= (dy / distance) * this.config.speed * 0.5;
                return;
            }

            // Kiting behavior: maintain optimal distance
            if (distance < this.config.kiteDistance) {
                // Too close - back away
                const angle = Math.atan2(dy, dx);
                this.sprite.body.setVelocity(
                    -Math.cos(angle) * this.config.speed,
                    -Math.sin(angle) * this.config.speed
                );
            } else if (distance > this.config.attackRange) {
                // Too far - move closer
                const angle = Math.atan2(dy, dx);
                this.sprite.body.setVelocity(
                    Math.cos(angle) * this.config.speed,
                    Math.sin(angle) * this.config.speed
                );
            } else {
                // Good range - strafe
                const angle = Math.atan2(dy, dx);
                const strafeDirection = (Math.random() > 0.5 ? 1 : -1);
                const strafeAngle = angle + (Math.PI / 2) * strafeDirection;

                this.sprite.body.setVelocity(
                    Math.cos(strafeAngle) * this.config.speed * 0.7,
                    Math.sin(strafeAngle) * this.config.speed * 0.7
                );
            }
        }
    }

    /**
     * Fire a bullet at target
     */
    fireBullet(targetX, targetY, bulletType = 'normal') {
        // Check if bounty - use special bullets
        if (this.isBounty && bulletType === 'normal') {
            bulletType = 'burst';  // Desperado shoots 3-round bursts
        } else if (this.isBounty && bulletType === 'heavy') {
            bulletType = 'explosive';  // Big Iron shoots explosive rounds
        }

        // Scale bullet damage with difficulty multiplier
        const baseBulletDamage = this.config.bulletDamage || this.config.damage;
        const scaledBulletDamage = Math.ceil(baseBulletDamage * this.difficultyMultipliers.damage);

        const bullet = new EnemyBullet(
            this.scene,
            this.sprite.x,
            this.sprite.y,
            targetX,
            targetY,
            scaledBulletDamage,
            bulletType
        );

        // Add to scene's bullet array (managed in GameScene)
        if (!this.scene.enemyBullets) {
            this.scene.enemyBullets = [];
        }
        this.scene.enemyBullets.push(bullet);

        // Bounty burst: fire 2 more bullets with slight delay
        if (bulletType === 'burst') {
            setTimeout(() => {
                if (this.alive) this.fireBullet(targetX, targetY, 'normal');
            }, 150);
            setTimeout(() => {
                if (this.alive) this.fireBullet(targetX, targetY, 'normal');
            }, 300);
        }
    }

    /**
     * Iron Shell Boss Behavior (Wave 3)
     * Phase 1 (100-50% HP): Slow tank with bubble spread attacks
     * Phase 2 (50-0% HP): Faster movement with charge attacks
     */
    updateBossIronShell(time, playerX, playerY) {
        const dx = playerX - this.sprite.x;
        const dy = playerY - this.sprite.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const currentTime = Date.now();

        // Check for phase transition at 50% HP
        const healthPercent = this.health / this.maxHealth;
        if (healthPercent <= this.config.phase2Threshold && this.bossPhase === 1) {
            this.transitionToPhase2IronShell();
        }

        // Handle charge attack in progress (Phase 2)
        if (this.chargingAttack) {
            const chargeElapsed = currentTime - this.chargeStartTime;

            if (chargeElapsed < this.config.chargeTelegraphDuration) {
                // Telegraph phase - stay still and glow
                this.sprite.body.setVelocity(0, 0);
                const pulseFactor = 1 + Math.sin(chargeElapsed / 50) * 0.2;
                this.sprite.setScale(pulseFactor);
                return;
            } else if (chargeElapsed < this.config.chargeTelegraphDuration + 800) {
                // Charge phase - rapid movement
                const chargeAngle = Math.atan2(this.chargeTargetY - this.sprite.y, this.chargeTargetX - this.sprite.x);
                this.sprite.body.setVelocity(
                    Math.cos(chargeAngle) * this.config.chargeSpeed,
                    Math.sin(chargeAngle) * this.config.chargeSpeed
                );

                // Check collision with player during charge
                const closestPlayer = this.getClosestPlayer();
                const playerDist = Math.sqrt(
                    Math.pow(closestPlayer.getX() - this.sprite.x, 2) +
                    Math.pow(closestPlayer.getY() - this.sprite.y, 2)
                );
                if (playerDist < this.config.radius + 30 && !this.chargeHitPlayer) {
                    closestPlayer.takeDamage(this.config.chargeDamage);
                    this.chargeHitPlayer = true; // Prevent multiple hits
                }
            } else {
                // End charge
                this.chargingAttack = false;
                this.chargeHitPlayer = false;  // Reset for next charge
                this.sprite.setScale(1);
                this.sprite.body.setVelocity(0, 0);
                this.lastChargeTime = currentTime;
            }
            return;
        }

        // Determine current speed based on phase
        const currentSpeed = this.bossPhase === 1 ? this.config.speed : this.config.phase2Speed;
        const currentCooldown = this.bossPhase === 1 ? this.config.attackCooldown : this.config.phase2Cooldown;

        // Attack logic
        const canAttack = (currentTime - this.lastShotTime) >= currentCooldown;

        if (distance <= this.config.attackRange && canAttack) {
            if (this.bossPhase === 1) {
                // Phase 1: Bubble spread attack
                this.fireBubbleSpread(playerX, playerY);
                this.lastShotTime = currentTime;
            } else {
                // Phase 2: Alternate between bubble attack and charge
                const chargeReady = !this.lastChargeTime || (currentTime - this.lastChargeTime) >= 5000;

                if (this.lastAttackType !== 'charge' && chargeReady) {
                    // Initiate charge attack
                    this.chargingAttack = true;
                    this.chargeStartTime = currentTime;
                    this.chargeTargetX = playerX;
                    this.chargeTargetY = playerY;
                    this.lastAttackType = 'charge';
                } else {
                    // Bubble attack
                    this.fireBubbleSpread(playerX, playerY);
                    this.lastShotTime = currentTime;
                    this.lastAttackType = 'bubble';
                }
            }
        }

        // Movement toward player (when not attacking)
        if (!this.chargingAttack && distance > 100) {
            const angle = Math.atan2(dy, dx);
            this.sprite.body.setVelocity(
                Math.cos(angle) * currentSpeed,
                Math.sin(angle) * currentSpeed
            );
        } else if (!this.chargingAttack) {
            this.sprite.body.setVelocity(0, 0);
        }
    }

    transitionToPhase2IronShell() {
        this.bossPhase = 2;

        // Visual effects
        this.scene.cameras.main.shake(200, 0.01);
        this.scene.cameras.main.flash(200, 255, 100, 100);

        // Add cracks to shell visual
        if (this.shell) {
            this.shell.setStrokeStyle(3, 0xff0000);
        }

        console.log('Iron Shell entered Phase 2!');
    }

    fireBubbleSpread(targetX, targetY) {
        // Calculate base angle to player
        const baseAngle = Math.atan2(targetY - this.sprite.y, targetX - this.sprite.x);

        // Scale bubble damage with difficulty multiplier
        const scaledBubbleDamage = Math.ceil(this.config.bubbleDamage * this.difficultyMultipliers.damage);

        // Fire 3 bubbles in spread pattern
        const spreadAngles = [-0.3, 0, 0.3];  // Radians

        spreadAngles.forEach(spreadOffset => {
            const angle = baseAngle + spreadOffset;
            const bullet = new EnemyBullet(
                this.scene,
                this.sprite.x,
                this.sprite.y,
                this.sprite.x + Math.cos(angle) * 100,
                this.sprite.y + Math.sin(angle) * 100,
                scaledBubbleDamage,
                'bubble'
            );

            if (!this.scene.enemyBullets) {
                this.scene.enemyBullets = [];
            }
            this.scene.enemyBullets.push(bullet);
        });
    }

    initializeKrakenTentacles() {
        const tentacleCount = this.config.tentacleCount || 4;

        for (let i = 0; i < tentacleCount; i++) {
            const angle = (i / tentacleCount) * Math.PI * 2;
            const tentacleX = this.sprite.x + Math.cos(angle) * this.config.tentacleLength;
            const tentacleY = this.sprite.y + Math.sin(angle) * this.config.tentacleLength;

            // Create tentacle visual
            const tentacleSprite = this.scene.add.circle(
                tentacleX,
                tentacleY,
                20,
                0x9966cc
            );
            tentacleSprite.setStrokeStyle(2, 0x663399);

            this.tentacleSprites.push(tentacleSprite);

            // Create tentacle data
            this.tentacles.push({
                health: this.config.tentacleHealth,
                maxHealth: this.config.tentacleHealth,
                angle: angle,
                lastRegenTime: Date.now(),
                alive: true
            });
        }

        // Body starts invulnerable
        this.bodyInvulnerable = true;
    }

    /**
     * Kraken's Arm Boss Behavior (Wave 6)
     * Must damage all tentacles to expose body
     * Ink clouds at 60% and 30% HP
     * Tentacle sweep attack every 10 seconds
     */
    updateBossKrakenArm(time, playerX, playerY) {
        const currentTime = Date.now();
        const healthPercent = this.health / this.maxHealth;

        // Update tentacle positions (writhing animation)
        this.tentacles.forEach((tentacle, i) => {
            if (tentacle.alive && this.tentacleSprites[i]) {
                const baseAngle = tentacle.angle;
                const wobble = Math.sin(currentTime / 500 + i) * 0.3;
                const angle = baseAngle + wobble;

                this.tentacleSprites[i].setPosition(
                    this.sprite.x + Math.cos(angle) * this.config.tentacleLength,
                    this.sprite.y + Math.sin(angle) * this.config.tentacleLength
                );

                // Regeneration
                if (tentacle.health < tentacle.maxHealth) {
                    const regenElapsed = (currentTime - tentacle.lastRegenTime) / 1000;
                    tentacle.health = Math.min(
                        tentacle.maxHealth,
                        tentacle.health + (this.config.tentacleRegenRate * regenElapsed)
                    );
                    tentacle.lastRegenTime = currentTime;
                }
            }
        });

        // Check if body should be vulnerable (when all tentacles destroyed)
        const aliveTentacles = this.tentacles.filter(t => t.alive).length;
        this.bodyInvulnerable = aliveTentacles > 0;

        // Visual indicator for invulnerability
        if (this.bodyInvulnerable) {
            this.sprite.setStrokeStyle(4, 0x00ffff, 0.7);
        } else {
            this.sprite.setStrokeStyle(2, 0x9966cc, 1.0);
        }

        // Ink cloud triggers
        if (healthPercent <= 0.6 && !this.inkTriggered1) {
            this.createInkClouds(3);
            this.inkTriggered1 = true;
        }
        if (healthPercent <= 0.3 && !this.inkTriggered2) {
            this.createInkClouds(3);
            this.inkTriggered2 = true;
        }

        // Tentacle slam attacks (individual)
        this.tentacles.forEach((tentacle, i) => {
            if (tentacle.alive && !tentacle.slamming) {
                const timeSinceLastSlam = currentTime - (tentacle.lastSlamTime || 0);
                if (timeSinceLastSlam >= 4000) {
                    this.tentacleSlam(i, playerX, playerY);
                }
            }
        });

        // Tentacle sweep attack (all at once)
        const sweepReady = (currentTime - this.lastSweepTime) >= this.config.sweepCooldown;
        if (sweepReady) {
            this.tentacleSweep();
            this.lastSweepTime = currentTime;
        }

        // Slow movement toward player
        const dx = playerX - this.sprite.x;
        const dy = playerY - this.sprite.y;
        const angle = Math.atan2(dy, dx);
        this.sprite.body.setVelocity(
            Math.cos(angle) * this.config.speed,
            Math.sin(angle) * this.config.speed
        );
    }

    createInkClouds(count) {
        for (let i = 0; i < count; i++) {
            // Random position in arena
            const x = 300 + Math.random() * 1320;
            const y = 200 + Math.random() * 680;

            const cloud = this.scene.add.circle(x, y, this.config.inkCloudRadius, 0x000000, 0.6);
            cloud.createdAt = Date.now();

            this.inkClouds.push(cloud);

            // Auto-remove after duration
            this.scene.time.delayedCall(this.config.inkCloudDuration, () => {
                const index = this.inkClouds.indexOf(cloud);
                if (index > -1) {
                    this.inkClouds.splice(index, 1);
                    cloud.destroy();
                }
            });
        }

        console.log('Kraken created ink clouds!');
    }

    tentacleSlam(tentacleIndex, targetX, targetY) {
        const tentacle = this.tentacles[tentacleIndex];
        tentacle.slamming = true;
        tentacle.slamTargetX = targetX;
        tentacle.slamTargetY = targetY;

        // Telegraph
        const telegraph = this.scene.add.circle(targetX, targetY, 30, 0xff0000, 0.3);
        telegraph.setStrokeStyle(2, 0xff0000);

        this.scene.time.delayedCall(800, () => {
            // Execute slam
            telegraph.destroy();

            // Check if any player is in slam area
            const closestPlayer = this.getClosestPlayer();
            const dx = closestPlayer.getX() - targetX;
            const dy = closestPlayer.getY() - targetY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 30) {
                closestPlayer.takeDamage(this.config.damage);
            }

            // Impact visual
            const impact = this.scene.add.circle(targetX, targetY, 40, 0x9966cc, 0.6);
            this.scene.tweens.add({
                targets: impact,
                scale: 2,
                alpha: 0,
                duration: 300,
                onComplete: () => impact.destroy()
            });

            tentacle.slamming = false;
            tentacle.lastSlamTime = Date.now();
        });
    }

    tentacleSweep() {
        this.sweepDamageDealt = false;  // Add at start

        // Make all tentacles glow
        this.tentacleSprites.forEach(sprite => {
            sprite.setFillStyle(0xffff00, 0.8);
        });

        // Rotate tentacles 360 degrees
        const sweepDuration = 2000;
        const startTime = Date.now();

        const sweepInterval = this.scene.time.addEvent({
            delay: 50,
            repeat: sweepDuration / 50,
            callback: () => {
                const progress = (Date.now() - startTime) / sweepDuration;
                const rotationOffset = progress * Math.PI * 2;

                this.tentacles.forEach((tentacle, i) => {
                    tentacle.angle = (i / this.tentacles.length) * Math.PI * 2 + rotationOffset;

                    // Check collision with all players
                    if (this.tentacleSprites[i] && this.scene.playerManager) {
                        const tx = this.tentacleSprites[i].x;
                        const ty = this.tentacleSprites[i].y;

                        this.scene.playerManager.getLivingPlayers().forEach(player => {
                            const px = player.getX();
                            const py = player.getY();
                            const dist = Math.sqrt(Math.pow(tx - px, 2) + Math.pow(ty - py, 2));

                            if (dist < 25 && !this.sweepDamageDealt) {
                                player.takeDamage(this.config.sweepDamage);
                                this.sweepDamageDealt = true;
                            }
                        });
                    }
                });

                if (progress >= 1) {
                    // Reset tentacle colors
                    this.tentacleSprites.forEach(sprite => {
                        sprite.setFillStyle(0x9966cc, 1.0);
                    });
                }
            }
        });

        console.log('Kraken performing tentacle sweep!');
    }

    takeTentacleDamage(tentacleIndex, amount) {
        if (tentacleIndex >= 0 && tentacleIndex < this.tentacles.length) {
            const tentacle = this.tentacles[tentacleIndex];
            if (tentacle.alive) {
                tentacle.health -= amount;

                if (tentacle.health <= 0) {
                    tentacle.health = 0;
                    tentacle.alive = false;

                    // Destroy tentacle visual
                    if (this.tentacleSprites[tentacleIndex]) {
                        this.tentacleSprites[tentacleIndex].destroy();
                    }
                }

                return tentacle.health;
            }
        }
        return -1;
    }

    /**
     * Leviathan Boss Behavior (Wave 9 - Final Boss)
     * Phase 1 (400 HP): Bullet storm, ground pound, charge
     * Phase 2 (400 HP): Lightning strikes, tidal wave, spawns minions
     */
    updateBossLeviathan(time, playerX, playerY) {
        const dx = playerX - this.sprite.x;
        const dy = playerY - this.sprite.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const currentTime = Date.now();

        // Check for phase transition at 0 HP (but don't die)
        if (this.health <= 0 && this.bossPhase === 1) {
            this.transitionToPhase2Leviathan();
            return;
        }

        // Phase 2: Check for minion spawn at 50% HP
        if (this.bossPhase === 2 && this.health <= this.maxHealth * this.config.minionSpawnThreshold && !this.minionsSpawned) {
            this.spawnMinions(this.config.phase2MidAdds);
            this.minionsSpawned = true;
        }

        // Handle immunity period during phase transition
        if (this.phaseTransitioning) {
            return;
        }

        // Attack pattern selection based on phase
        if (this.bossPhase === 1) {
            this.leviathanPhase1Attacks(currentTime, playerX, playerY, distance);
        } else {
            this.leviathanPhase2Attacks(currentTime, playerX, playerY, distance);
        }

        // Movement
        if (!this.attackingInProgress && distance > 150) {
            const angle = Math.atan2(dy, dx);
            this.sprite.body.setVelocity(
                Math.cos(angle) * this.config.speed,
                Math.sin(angle) * this.config.speed
            );
        } else if (!this.attackingInProgress) {
            this.sprite.body.setVelocity(0, 0);
        }
    }

    leviathanPhase1Attacks(currentTime, playerX, playerY, distance) {
        // Bullet Storm attack
        const bulletStormReady = (currentTime - (this.lastBulletStorm || 0)) >= this.config.bulletStormCooldown;
        if (bulletStormReady && distance <= this.config.attackRange) {
            this.bulletStormAttack();
            this.lastBulletStorm = currentTime;
            return;
        }

        // Ground Pound attack
        const groundPoundReady = (currentTime - (this.lastGroundPound || 0)) >= this.config.groundPoundCooldown;
        if (groundPoundReady && distance < 300) {
            this.groundPoundAttack(playerX, playerY);
            this.lastGroundPound = currentTime;
            return;
        }

        // Charge attack
        const chargeReady = (currentTime - (this.lastCharge || 0)) >= this.config.chargeCooldown;
        if (chargeReady && distance > 200 && distance <= this.config.attackRange) {
            this.chargeAttack(playerX, playerY);
            this.lastCharge = currentTime;
            return;
        }
    }

    leviathanPhase2Attacks(currentTime, playerX, playerY, distance) {
        // Lightning Strike attack
        const lightningReady = (currentTime - (this.lastLightning || 0)) >= this.config.lightningCooldown;
        if (lightningReady) {
            this.lightningStrikeAttack();
            this.lastLightning = currentTime;
            return;
        }

        // Tidal Wave attack
        const tidalReady = (currentTime - (this.lastTidalWave || 0)) >= this.config.tidalWaveCooldown;
        if (tidalReady) {
            this.tidalWaveAttack();
            this.lastTidalWave = currentTime;
            return;
        }

        // Continue using some Phase 1 attacks
        const bulletStormReady = (currentTime - (this.lastBulletStorm || 0)) >= this.config.bulletStormCooldown * 1.5;
        if (bulletStormReady && distance <= this.config.attackRange) {
            this.bulletStormAttack();
            this.lastBulletStorm = currentTime;
            return;
        }
    }

    bulletStormAttack() {
        console.log('Leviathan: Bullet Storm!');

        // Scale bullet storm damage with difficulty multiplier
        const scaledBulletStormDamage = Math.ceil(this.config.bulletStormDamage * this.difficultyMultipliers.damage);

        const angleStep = (Math.PI * 2) / this.config.bulletStormCount;

        for (let i = 0; i < this.config.bulletStormCount; i++) {
            const angle = angleStep * i;
            const bullet = new EnemyBullet(
                this.scene,
                this.sprite.x,
                this.sprite.y,
                this.sprite.x + Math.cos(angle) * 200,
                this.sprite.y + Math.sin(angle) * 200,
                scaledBulletStormDamage,
                'storm'
            );

            if (!this.scene.enemyBullets) {
                this.scene.enemyBullets = [];
            }
            this.scene.enemyBullets.push(bullet);
        }
    }

    groundPoundAttack(playerX, playerY) {
        console.log('Leviathan: Ground Pound!');
        this.attackingInProgress = true;

        // Rise up visual - change fill color to yellow
        const originalColor = this.sprite.fillColor;
        this.sprite.setFillStyle(0xffff00);
        const originalY = this.sprite.y;

        this.scene.tweens.add({
            targets: this.sprite,
            y: originalY - 50,
            duration: 500,
            yoyo: true,
            onComplete: () => {
                // Impact - restore original color
                this.sprite.setFillStyle(originalColor);
                this.scene.cameras.main.shake(300, 0.02);

                // Create shockwave visual
                const shockwave = this.scene.add.circle(
                    this.sprite.x,
                    this.sprite.y,
                    this.config.groundPoundRadius,
                    0xff4500,
                    0.4
                );

                // Damage cover in radius
                if (this.scene.coverManager) {
                    this.scene.coverManager.damageInRadius(
                        this.sprite.x,
                        this.sprite.y,
                        200,  // shockwave radius
                        50    // damage to cover
                    );
                }

                // Check if any player is in radius - USE CURRENT POSITION
                if (this.scene.playerManager) {
                    this.scene.playerManager.getLivingPlayers().forEach(player => {
                        const dx = player.getX() - this.sprite.x;
                        const dy = player.getY() - this.sprite.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance <= this.config.groundPoundRadius) {
                            player.takeDamage(this.config.groundPoundDamage);
                        }
                    });
                }

                this.scene.tweens.add({
                    targets: shockwave,
                    scale: 1.5,
                    alpha: 0,
                    duration: 400,
                    onComplete: () => {
                        shockwave.destroy();
                        this.attackingInProgress = false;
                    }
                });
            }
        });
    }

    chargeAttack(playerX, playerY) {
        console.log('Leviathan: Charge!');
        this.attackingInProgress = true;

        // Telegraph line showing charge path
        const line = this.scene.add.line(
            0, 0,
            this.sprite.x, this.sprite.y,
            playerX, playerY,
            0xff0000
        );
        line.setLineWidth(4);
        line.setOrigin(0, 0);

        this.scene.time.delayedCall(1000, () => {
            line.destroy();

            // Execute charge
            const angle = Math.atan2(playerY - this.sprite.y, playerX - this.sprite.x);
            const chargeDistance = 400;
            const targetX = this.sprite.x + Math.cos(angle) * chargeDistance;
            const targetY = this.sprite.y + Math.sin(angle) * chargeDistance;

            this.scene.tweens.add({
                targets: this.sprite,
                x: targetX,
                y: targetY,
                duration: 600,
                ease: 'Power2',
                onUpdate: () => {
                    // Check collision with all players during charge
                    if (this.scene.playerManager) {
                        this.scene.playerManager.getLivingPlayers().forEach(player => {
                            const dx = player.getX() - this.sprite.x;
                            const dy = player.getY() - this.sprite.y;
                            const dist = Math.sqrt(dx * dx + dy * dy);

                            if (dist < this.config.radius + 20 && !this.chargeHitPlayer) {
                                player.takeDamage(this.config.chargeDamage);
                                this.chargeHitPlayer = true;
                            }
                        });
                    }
                },
                onComplete: () => {
                    this.attackingInProgress = false;
                    this.chargeHitPlayer = false;
                }
            });
        });
    }

    lightningStrikeAttack() {
        console.log('Leviathan: Lightning Strike!');

        // Prevent multiple hits in single attack
        this.lightningDamageDealt = false;

        for (let i = 0; i < this.config.lightningCount; i++) {
            const targetX = 300 + Math.random() * 1320;
            const targetY = 200 + Math.random() * 680;

            // Telegraph
            const telegraph = this.scene.add.circle(targetX, targetY, this.config.lightningRadius, 0xff0000, 0.3);
            telegraph.setStrokeStyle(2, 0xffff00);

            this.scene.time.delayedCall(1000, () => {
                // Strike
                const lightning = this.scene.add.rectangle(
                    targetX,
                    targetY,
                    this.config.lightningRadius * 2,
                    1080,
                    0xffff00,
                    0.7
                );

                // Damage cover in radius
                if (this.scene.coverManager) {
                    this.scene.coverManager.damageInRadius(
                        targetX,
                        targetY,
                        80,   // lightning radius
                        30    // damage to cover
                    );
                }

                // Check if any player is hit - ONLY DAMAGE ONCE PER ATTACK
                if (this.scene.playerManager) {
                    this.scene.playerManager.getLivingPlayers().forEach(player => {
                        const dx = player.getX() - targetX;
                        const dy = player.getY() - targetY;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance <= this.config.lightningRadius && !this.lightningDamageDealt) {
                            player.takeDamage(this.config.lightningDamage);
                            this.lightningDamageDealt = true;  // Prevent multi-hit
                        }
                    });
                }

                telegraph.destroy();

                this.scene.time.delayedCall(200, () => {
                    lightning.destroy();
                });
            });
        }
    }

    tidalWaveAttack() {
        console.log('Leviathan: Tidal Wave!');
        this.attackingInProgress = true;

        // Move to edge of arena
        const targetEdgeX = this.sprite.x < 960 ? 100 : 1820;

        this.scene.tweens.add({
            targets: this.sprite,
            x: targetEdgeX,
            duration: 1000,
            onComplete: () => {
                // Create wave traveling across screen
                const waveHeight = 200;
                const waveStartX = targetEdgeX < 960 ? 0 : 1920;
                const waveEndX = targetEdgeX < 960 ? 1920 : 0;

                const wave = this.scene.add.rectangle(
                    waveStartX,
                    540,
                    100,
                    waveHeight,
                    0x4169e1,
                    0.6
                );

                // Damage all cover
                if (this.scene.coverManager) {
                    const covers = this.scene.coverManager.getCovers();
                    covers.forEach(cover => {
                        if (cover.isAlive()) {
                            cover.takeDamage(50); // Tidal wave damages all cover
                        }
                    });
                }

                this.scene.tweens.add({
                    targets: wave,
                    x: waveEndX,
                    duration: 2000,
                    onUpdate: () => {
                        // Check collision with all players
                        if (this.scene.playerManager) {
                            this.scene.playerManager.getLivingPlayers().forEach(player => {
                                const px = player.getX();
                                const py = player.getY();

                                if (Math.abs(wave.x - px) < 100 && Math.abs(540 - py) < waveHeight / 2) {
                                    if (!this.waveHitPlayer) {
                                        player.takeDamage(this.config.tidalWaveDamage);
                                        this.waveHitPlayer = true;
                                    }
                                }
                            });
                        }
                    },
                    onComplete: () => {
                        wave.destroy();
                        this.attackingInProgress = false;
                        this.waveHitPlayer = false;
                    }
                });
            }
        });
    }

    transitionToPhase2Leviathan() {
        console.log('Leviathan: PHASE 2!');
        this.bossPhase = 2;
        this.phaseTransitioning = true;

        // Full health restore
        this.health = this.maxHealth;

        // Visual effects
        this.scene.cameras.main.shake(500, 0.03);
        this.scene.cameras.main.flash(500, 100, 150, 255);
        this.sprite.setFillStyle(this.config.phase2Color);

        // Announcement
        const announcement = this.scene.add.text(960, 400, 'THE LEVIATHAN EVOLVES', {
            fontSize: '64px',
            color: '#ff0000',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Spawn initial adds
        this.scene.time.delayedCall(2000, () => {
            this.spawnMinions(this.config.phase2InitialAdds);
        });

        // End transition
        this.scene.time.delayedCall(3000, () => {
            announcement.destroy();
            this.phaseTransitioning = false;
            this.minionsSpawned = false;
        });
    }

    spawnMinions(minionTypes) {
        console.log('Leviathan spawning minions:', minionTypes);

        minionTypes.forEach((type, index) => {
            const angle = (index / minionTypes.length) * Math.PI * 2;
            const spawnX = this.sprite.x + Math.cos(angle) * 150;
            const spawnY = this.sprite.y + Math.sin(angle) * 150;

            const minion = new Enemy(this.scene, spawnX, spawnY, type);
            this.scene.enemies.push(minion);
        });
    }

    /**
     * Get x position
     */
    get x() {
        return this.sprite.x;
    }

    /**
     * Set x position
     */
    set x(value) {
        this.sprite.x = value;
    }

    /**
     * Get y position
     */
    get y() {
        return this.sprite.y;
    }

    /**
     * Set y position
     */
    set y(value) {
        this.sprite.y = value;
    }

    /**
     * Set position (x, y)
     */
    setPosition(x, y) {
        // Use Phaser's setPosition to update both visual and physics body
        this.sprite.setPosition(x, y);
    }

    /**
     * Enable/disable collision during spawn animation
     */
    setCollisionEnabled(enabled) {
        console.log('[Enemy] setCollisionEnabled', enabled, 'for enemy at', this.sprite.x, this.sprite.y, 'type:', this.type);
        this.collisionEnabled = enabled;

        // When enabling collision, restore the alphaValue
        if (enabled) {
            this.sprite.setAlpha(this.alphaValue);
        }
        // When disabling, leave alpha as-is (spawn animation controls it)
    }

    /**
     * Set enemy visibility (0-1)
     */
    setAlpha(alpha) {
        this.alphaValue = Math.max(0, Math.min(1, alpha));

        // Always apply alpha to sprite (spawn animation needs this)
        this.sprite.setAlpha(this.alphaValue);

        // Also update child elements
        if (this.claw1) this.claw1.setAlpha(this.alphaValue);
        if (this.claw2) this.claw2.setAlpha(this.alphaValue);
        if (this.antenna1) this.antenna1.setAlpha(this.alphaValue);
        if (this.antenna2) this.antenna2.setAlpha(this.alphaValue);
        if (this.shell) this.shell.setAlpha(this.alphaValue);
        // Kraken boss tentacle sprites
        if (this.tentacleSprites) {
            this.tentacleSprites.forEach(sprite => {
                if (sprite) sprite.setAlpha(this.alphaValue);
            });
        }
        if (this.wing1) this.wing1.setAlpha(this.alphaValue);
        if (this.wing2) this.wing2.setAlpha(this.alphaValue);
        if (this.bountyIcon) this.bountyIcon.setAlpha(this.alphaValue);
        if (this.spotLight) this.spotLight.setAlpha(this.alphaValue * 0.5);
    }

    /**
     * Check if collision is enabled
     */
    isCollisionEnabled() {
        return this.collisionEnabled;
    }

    /**
     * Assign a formation role to this enemy
     * @param {string} role - 'tank' or 'shooter'
     * @param {string|number} formationGroup - identifier for the formation
     */
    assignRole(role, formationGroup) {
        this.role = role;
        this.formationGroup = formationGroup;
    }

    /**
     * Link formation members (called on tank to link with shooters)
     * @param {Enemy} leader - The tank leader (should be this)
     * @param {Enemy[]} members - Array of shooter enemies
     */
    linkFormation(leader, members) {
        if (this.role === 'tank') {
            this.formationMembers = members;
            members.forEach(shooter => {
                shooter.formationLeader = this;
            });
        }
    }

}

# Phase 1: Boss Waves Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement three boss encounters at waves 3, 6, and 9 with unique mechanics, visual effects, and dramatic announcements.

**Architecture:** Extend existing enemy system with boss-specific behaviors, add boss announcement UI system, integrate boss victory bonuses into scoring, and modify wave compositions.

**Tech Stack:** Phaser 3, JavaScript ES6 modules, existing game systems (Enemy, WaveManager, ScoreManager)

---

## Task 1: Add Boss Type Configurations to Enemy.js

**Files:**
- Modify: `/Users/ben/git/private/magic-kingdom/game/src/entities/Enemy.js:4-68`

**Step 1: Add boss type configurations to ENEMY_TYPES**

Add three new boss types to the ENEMY_TYPES object after the existing enemy types:

```javascript
// Add after flyingfish definition, before closing brace of ENEMY_TYPES
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
```

**Step 2: Run the game to check for syntax errors**

Run: `npm run dev`
Expected: No syntax errors, game loads normally

**Step 3: Commit the configuration changes**

```bash
git add src/entities/Enemy.js
git commit -m "feat: add boss type configurations to Enemy system

- Add boss_iron_shell configuration (Wave 3 boss)
- Add boss_kraken_arm configuration (Wave 6 boss)
- Add boss_leviathan configuration (Wave 9 boss)
- Include all boss-specific properties for behaviors"
```

---

## Task 2: Implement Iron Shell Boss Behavior

**Files:**
- Modify: `/Users/ben/git/private/magic-kingdom/game/src/entities/Enemy.js:220-250`
- Modify: `/Users/ben/git/private/magic-kingdom/game/src/entities/Enemy.js:72-130`

**Step 1: Add boss phase tracking to Enemy constructor**

In the Enemy constructor, after line 113 (`this.windUpStartTime = 0;`), add:

```javascript
        // Boss-specific properties
        this.bossPhase = 1;
        this.phaseTransitioning = false;
        this.lastAttackType = null;
        this.attackRotation = 0;
```

**Step 2: Add boss behavior case to update method**

In the update method's switch statement (around line 224), add:

```javascript
            case 'boss_iron_shell':
                this.updateBossIronShell(time, playerX, playerY);
                break;
```

**Step 3: Implement Iron Shell boss behavior method**

Add this method after the `fireBullet` method (around line 623):

```javascript
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
            } else {
                // End charge
                this.chargingAttack = false;
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
                this.config.bubbleDamage,
                'bubble'
            );

            if (!this.scene.enemyBullets) {
                this.scene.enemyBullets = [];
            }
            this.scene.enemyBullets.push(bullet);
        });
    }
```

**Step 4: Add bubble bullet type to EnemyBullet**

Modify: `/Users/ben/git/private/magic-kingdom/game/src/entities/EnemyBullet.js`

Add handling for 'bubble' bullet type (visual variation - larger, blue-tinted bullets)

**Step 5: Run game and test Iron Shell behavior**

Run: `npm run dev`
Test: Manually spawn Iron Shell boss to verify movement, attacks, and phase transition

**Step 6: Commit Iron Shell implementation**

```bash
git add src/entities/Enemy.js src/entities/EnemyBullet.js
git commit -m "feat: implement Iron Shell boss behavior

- Add phase tracking to Enemy constructor
- Implement two-phase boss mechanics
- Phase 1: slow movement with bubble spread attacks
- Phase 2: faster movement with charge attacks
- Add visual effects for phase transition"
```

---

## Task 3: Implement Kraken's Arm Boss Behavior

**Files:**
- Modify: `/Users/ben/git/private/magic-kingdom/game/src/entities/Enemy.js:72-130`
- Modify: `/Users/ben/git/private/magic-kingdom/game/src/entities/Enemy.js:220-250`

**Step 1: Add tentacle tracking to Enemy constructor**

In the Enemy constructor, after the boss properties added in Task 2:

```javascript
        // Kraken tentacle system
        this.tentacles = [];
        this.tentacleSprites = [];
        this.bodyInvulnerable = false;
        this.inkClouds = [];
        this.inkTriggered1 = false;
        this.inkTriggered2 = false;
        this.lastSweepTime = 0;
```

**Step 2: Add tentacle initialization to createVisualIndicators**

In `createVisualIndicators` method, add a case for boss_kraken_arm:

```javascript
            case 'boss_kraken_arm':
                // Create tentacle system
                this.initializeKrakenTentacles();
                break;
```

**Step 3: Implement Kraken tentacle initialization**

Add after the `fireBubbleSpread` method:

```javascript
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
```

**Step 4: Add Kraken behavior case to update method**

In the update method's switch statement:

```javascript
            case 'boss_kraken_arm':
                this.updateBossKrakenArm(time, playerX, playerY);
                break;
```

**Step 5: Implement Kraken's Arm boss behavior**

Add this method:

```javascript
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

        // Check if body should be vulnerable
        const damagedTentacles = this.tentacles.filter(t => t.alive && t.health < t.maxHealth * 0.5).length;
        this.bodyInvulnerable = damagedTentacles < this.config.tentacleCount;

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

            // Check if player is in slam area
            const dx = this.scene.player.getX() - targetX;
            const dy = this.scene.player.getY() - targetY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 30) {
                this.scene.player.takeDamage(this.config.damage);
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

                    // Check collision with player
                    if (this.tentacleSprites[i]) {
                        const tx = this.tentacleSprites[i].x;
                        const ty = this.tentacleSprites[i].y;
                        const px = this.scene.player.getX();
                        const py = this.scene.player.getY();
                        const dist = Math.sqrt(Math.pow(tx - px, 2) + Math.pow(ty - py, 2));

                        if (dist < 25) {
                            this.scene.player.takeDamage(this.config.sweepDamage);
                        }
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
```

**Step 6: Override takeDamage for Kraken boss**

Modify the `takeDamage` method to handle body invulnerability:

```javascript
    takeDamage(amount) {
        // Kraken-specific invulnerability
        if (this.type === 'boss_kraken_arm' && this.bodyInvulnerable) {
            console.log('Kraken body is invulnerable! Damage tentacles first!');
            return this.health;
        }

        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            this.kill();
        }
        console.log('Enemy took', amount, 'damage. Health:', this.health);
        return this.health;
    }
```

**Step 7: Run game and test Kraken behavior**

Run: `npm run dev`
Test: Tentacle system, invulnerability, ink clouds, attacks

**Step 8: Commit Kraken implementation**

```bash
git add src/entities/Enemy.js
git commit -m "feat: implement Kraken's Arm boss behavior

- Add tentacle system with individual health tracking
- Implement body invulnerability mechanic
- Add ink cloud area denial attacks
- Implement tentacle slam and sweep attacks
- Add tentacle regeneration system"
```

---

## Task 4: Implement Leviathan Boss Behavior (Multi-Phase)

**Files:**
- Modify: `/Users/ben/git/private/magic-kingdom/game/src/entities/Enemy.js:220-250`

**Step 1: Add Leviathan behavior case to update method**

```javascript
            case 'boss_leviathan':
                this.updateBossLeviathan(time, playerX, playerY);
                break;
```

**Step 2: Implement Leviathan boss behavior**

Add this comprehensive method:

```javascript
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

        const angleStep = (Math.PI * 2) / this.config.bulletStormCount;

        for (let i = 0; i < this.config.bulletStormCount; i++) {
            const angle = angleStep * i;
            const bullet = new EnemyBullet(
                this.scene,
                this.sprite.x,
                this.sprite.y,
                this.sprite.x + Math.cos(angle) * 200,
                this.sprite.y + Math.sin(angle) * 200,
                this.config.bulletStormDamage,
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

        // Rise up visual
        this.sprite.setTint(0xffff00);
        const originalY = this.sprite.y;

        this.scene.tweens.add({
            targets: this.sprite,
            y: originalY - 50,
            duration: 500,
            yoyo: true,
            onComplete: () => {
                // Impact
                this.sprite.clearTint();
                this.scene.cameras.main.shake(300, 0.02);

                // Create shockwave visual
                const shockwave = this.scene.add.circle(
                    this.sprite.x,
                    this.sprite.y,
                    this.config.groundPoundRadius,
                    0xff4500,
                    0.4
                );

                // Check if player is in radius
                const dx = playerX - this.sprite.x;
                const dy = playerY - this.sprite.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance <= this.config.groundPoundRadius) {
                    this.scene.player.takeDamage(this.config.groundPoundDamage);
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
                    // Check collision with player during charge
                    const dx = this.scene.player.getX() - this.sprite.x;
                    const dy = this.scene.player.getY() - this.sprite.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < this.config.radius + 20 && !this.chargeHitPlayer) {
                        this.scene.player.takeDamage(this.config.chargeDamage);
                        this.chargeHitPlayer = true;
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

                // Check if player is hit
                const dx = this.scene.player.getX() - targetX;
                const dy = this.scene.player.getY() - targetY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance <= this.config.lightningRadius) {
                    this.scene.player.takeDamage(this.config.lightningDamage);
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

                this.scene.tweens.add({
                    targets: wave,
                    x: waveEndX,
                    duration: 2000,
                    onUpdate: () => {
                        // Check collision with player
                        const px = this.scene.player.getX();
                        const py = this.scene.player.getY();

                        if (Math.abs(wave.x - px) < 100 && Math.abs(540 - py) < waveHeight / 2) {
                            if (!this.waveHitPlayer) {
                                this.scene.player.takeDamage(this.config.tidalWaveDamage);
                                this.waveHitPlayer = true;
                            }
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
```

**Step 3: Run game and test Leviathan behavior**

Run: `npm run dev`
Test: Both phases, all attack patterns, minion spawning, phase transition

**Step 4: Commit Leviathan implementation**

```bash
git add src/entities/Enemy.js
git commit -m "feat: implement Leviathan final boss behavior

- Add two-phase boss mechanics with health restoration
- Phase 1: bullet storm, ground pound, charge attacks
- Phase 2: lightning strikes, tidal wave, minion spawning
- Add dramatic phase transition with announcement
- Implement all unique attack patterns"
```

---

## Task 5: Create Boss Announcement System

**Files:**
- Create: `/Users/ben/git/private/magic-kingdom/game/src/systems/BossAnnouncer.js`

**Step 1: Create BossAnnouncer class**

```javascript
export class BossAnnouncer {
    constructor(scene) {
        this.scene = scene;
        this.isAnnouncing = false;
    }

    /**
     * Display boss announcement overlay
     * @param {string} bossName - Name of the boss (e.g., "Iron Shell")
     * @param {string} subtitle - Subtitle text (e.g., "The Armored Terror")
     * @param {number} color - Color for spotlight effect
     */
    announceBoss(bossName, subtitle, color = 0xff0000) {
        if (this.isAnnouncing) return;

        this.isAnnouncing = true;

        // Darken screen
        const overlay = this.scene.add.rectangle(960, 540, 1920, 1080, 0x000000, 0.7);
        overlay.setDepth(1000);

        // Spotlight effect on boss spawn point
        const spotlight = this.scene.add.circle(960, 900, 150, color, 0.4);
        spotlight.setDepth(1001);

        // Pulsing animation for spotlight
        this.scene.tweens.add({
            targets: spotlight,
            scale: { from: 1, to: 1.3 },
            alpha: { from: 0.4, to: 0.6 },
            yoyo: true,
            repeat: -1,
            duration: 800
        });

        // "BOSS WAVE" text
        const bossWaveText = this.scene.add.text(960, 400, 'BOSS WAVE', {
            fontSize: '72px',
            color: '#ff0000',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5);
        bossWaveText.setDepth(1002);
        bossWaveText.setAlpha(0);

        // Boss name
        const nameText = this.scene.add.text(960, 500, bossName.toUpperCase(), {
            fontSize: '96px',
            color: '#ffff00',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 10
        }).setOrigin(0.5);
        nameText.setDepth(1002);
        nameText.setAlpha(0);

        // Subtitle
        const subtitleText = this.scene.add.text(960, 600, subtitle, {
            fontSize: '48px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'italic',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        subtitleText.setDepth(1002);
        subtitleText.setAlpha(0);

        // Screen effects
        this.scene.cameras.main.flash(500, 100, 0, 0);
        this.scene.cameras.main.shake(300, 0.01);

        // Fade in text sequence
        this.scene.tweens.add({
            targets: bossWaveText,
            alpha: 1,
            duration: 300,
            onComplete: () => {
                this.scene.tweens.add({
                    targets: nameText,
                    alpha: 1,
                    duration: 400,
                    onComplete: () => {
                        this.scene.tweens.add({
                            targets: subtitleText,
                            alpha: 1,
                            duration: 300
                        });
                    }
                });
            }
        });

        // Hold for 3 seconds, then fade out
        this.scene.time.delayedCall(3500, () => {
            this.scene.tweens.add({
                targets: [overlay, spotlight, bossWaveText, nameText, subtitleText],
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    overlay.destroy();
                    spotlight.destroy();
                    bossWaveText.destroy();
                    nameText.destroy();
                    subtitleText.destroy();
                    this.isAnnouncing = false;
                }
            });
        });

        console.log(`Boss announced: ${bossName}`);
    }

    /**
     * Show boss victory celebration
     * @param {string} bossName
     * @param {number} bonusPoints
     */
    announceBossVictory(bossName, bonusPoints) {
        // Victory flash
        this.scene.cameras.main.flash(800, 255, 215, 0);

        // Victory text
        const victoryText = this.scene.add.text(960, 400, `${bossName.toUpperCase()} DEFEATED!`, {
            fontSize: '64px',
            color: '#ffff00',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        victoryText.setDepth(1000);

        // Bonus points
        const bonusText = this.scene.add.text(960, 500, `+${bonusPoints} BONUS POINTS`, {
            fontSize: '48px',
            color: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        bonusText.setDepth(1000);

        // Fade out after 2 seconds
        this.scene.time.delayedCall(2000, () => {
            this.scene.tweens.add({
                targets: [victoryText, bonusText],
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    victoryText.destroy();
                    bonusText.destroy();
                }
            });
        });

        console.log(`Boss victory announced: ${bossName} - ${bonusPoints} points`);
    }
}
```

**Step 2: Run game to check for syntax errors**

Run: `npm run dev`
Expected: No errors

**Step 3: Commit BossAnnouncer**

```bash
git add src/systems/BossAnnouncer.js
git commit -m "feat: add boss announcement system

- Create BossAnnouncer class for dramatic boss intros
- Implement screen darkening and spotlight effects
- Add boss name and subtitle announcements
- Add boss victory celebration display
- Include screen shake and flash effects"
```

---

## Task 6: Update WaveManager for Boss Waves

**Files:**
- Modify: `/Users/ben/git/private/magic-kingdom/game/src/systems/WaveManager.js:10-24`
- Modify: `/Users/ben/git/private/magic-kingdom/game/src/systems/WaveManager.js:26-88`

**Step 1: Import BossAnnouncer in WaveManager**

At the top of WaveManager.js (around line 1):

```javascript
import { SpawnPointManager } from './SpawnPointManager.js';
import { BossAnnouncer } from './BossAnnouncer.js';
```

**Step 2: Initialize BossAnnouncer in constructor**

In the WaveManager constructor (after line 21):

```javascript
        // Initialize boss announcer
        this.bossAnnouncer = new BossAnnouncer(scene);
```

**Step 3: Update wave compositions to include boss waves**

Replace the `getWaveComposition` method (lines 26-88):

```javascript
    getWaveComposition(waveNumber) {
        const compositions = {
            1: [{ type: 'lobster', count: 5 }],
            2: [{ type: 'lobster', count: 7 }],

            // BOSS WAVE 3: Iron Shell
            3: [{ type: 'boss_iron_shell', count: 1, isBoss: true }],

            4: [
                { type: 'lobster', count: 6 },
                { type: 'shrimp', count: 4 }
            ],
            5: [
                { type: 'lobster', count: 5 },
                { type: 'shrimp', count: 3 },
                { type: 'hermit', count: 2 }
            ],

            // BOSS WAVE 6: Kraken's Arm
            6: [{ type: 'boss_kraken_arm', count: 1, isBoss: true }],

            7: [
                { type: 'lobster', count: 5 },
                { type: 'shrimp', count: 5 },
                { type: 'hermit', count: 3 },
                { type: 'jellyfish', count: 2 }
            ],
            8: [
                { type: 'lobster', count: 6 },
                { type: 'shrimp', count: 6 },
                { type: 'hermit', count: 3 },
                { type: 'jellyfish', count: 2 },
                { type: 'flyingfish', count: 3 }
            ],

            // BOSS WAVE 9: The Leviathan
            9: [{ type: 'boss_leviathan', count: 1, isBoss: true }],

            10: [
                { type: 'lobster', count: 8 },
                { type: 'shrimp', count: 8 },
                { type: 'hermit', count: 5 },
                { type: 'jellyfish', count: 4 },
                { type: 'flyingfish', count: 5 }
            ]
        };

        return compositions[waveNumber] || compositions[10];
    }

    /**
     * Check if wave is a boss wave
     */
    isBossWave(waveNumber) {
        return waveNumber === 3 || waveNumber === 6 || waveNumber === 9;
    }

    /**
     * Get boss announcement details
     */
    getBossDetails(bossType) {
        const details = {
            boss_iron_shell: {
                name: 'Iron Shell',
                subtitle: 'The Armored Terror',
                color: 0x4a4a4a
            },
            boss_kraken_arm: {
                name: "The Kraken's Arm",
                subtitle: 'Terror from the Deep',
                color: 0x9966cc
            },
            boss_leviathan: {
                name: 'The Leviathan',
                subtitle: 'The Unstoppable Force',
                color: 0xff4500
            }
        };

        return details[bossType] || { name: 'Unknown Boss', subtitle: '', color: 0xff0000 };
    }
```

**Step 4: Modify startNextWave to handle boss announcements**

In the `startNextWave` method, after line 103:

```javascript
        console.log('Starting wave', this.currentWave);

        // Get composition for this wave
        const composition = this.getWaveComposition(this.currentWave);

        // Check if this is a boss wave
        if (this.isBossWave(this.currentWave)) {
            const bossType = composition[0].type;
            const bossDetails = this.getBossDetails(bossType);

            // Announce boss
            this.bossAnnouncer.announceBoss(
                bossDetails.name,
                bossDetails.subtitle,
                bossDetails.color
            );

            // Delay spawn until after announcement
            this.scene.time.delayedCall(4000, () => {
                this.spawnEnemiesByComposition(composition);
            });
        } else {
            // Normal wave - spawn immediately
            this.spawnEnemiesByComposition(composition);
        }

        // Calculate total enemies
        const totalEnemies = composition.reduce((sum, group) => sum + group.count, 0);

        this.enemiesInWave = totalEnemies;
        this.enemiesRemaining = totalEnemies;

        this.isSpawning = false;
```

**Step 5: Run game and test boss wave announcements**

Run: `npm run dev`
Test: Verify announcements appear at waves 3, 6, 9

**Step 6: Commit WaveManager boss integration**

```bash
git add src/systems/WaveManager.js
git commit -m "feat: integrate boss waves into WaveManager

- Update wave compositions with boss encounters
- Add boss wave detection logic
- Integrate boss announcement system
- Delay boss spawning for dramatic effect
- Add boss details configuration"
```

---

## Task 7: Add Boss Victory Bonuses to ScoreManager

**Files:**
- Modify: `/Users/ben/git/private/magic-kingdom/game/src/systems/ScoreManager.js:1-38`

**Step 1: Add boss victory bonus values**

In ScoreManager constructor (after line 8):

```javascript
        // Point values
        this.ENEMY_KILL_POINTS = 10;
        this.WAVE_SURVIVAL_BONUS = 50;

        // Boss victory bonuses
        this.BOSS_VICTORY_BONUS = {
            boss_iron_shell: 500,
            boss_kraken_arm: 750,
            boss_leviathan: 1000
        };
```

**Step 2: Add boss victory method**

After the `addBountyKill` method (after line 29):

```javascript
    addBossVictory(bossType) {
        const bonus = this.BOSS_VICTORY_BONUS[bossType] || 500;
        this.score += bonus;
        console.log('Boss defeated! Bonus:', bonus, 'Score:', this.score);
        return { score: this.score, bonus: bonus };
    }
```

**Step 3: Run game to check for syntax errors**

Run: `npm run dev`
Expected: No errors

**Step 4: Commit ScoreManager boss bonuses**

```bash
git add src/systems/ScoreManager.js
git commit -m "feat: add boss victory bonuses to ScoreManager

- Add boss-specific bonus point values
- Implement addBossVictory method
- Iron Shell: 500 points
- Kraken's Arm: 750 points
- Leviathan: 1000 points"
```

---

## Task 8: Integrate Boss Victory into GameScene

**Files:**
- Modify: `/Users/ben/git/private/magic-kingdom/game/src/scenes/GameScene.js:20-170`
- Modify: `/Users/ben/git/private/magic-kingdom/game/src/scenes/GameScene.js` (update loop)

**Step 1: Import BossAnnouncer in GameScene**

At the top of GameScene.js (around line 8):

```javascript
import { TargetSelector } from '../systems/TargetSelector.js';
import { BossAnnouncer } from '../systems/BossAnnouncer.js';
```

**Step 2: Initialize BossAnnouncer in create method**

In the create method (after line 82):

```javascript
        // Initialize score manager
        this.scoreManager = new ScoreManager(this);

        // Initialize boss announcer
        this.bossAnnouncer = new BossAnnouncer(this);
```

**Step 3: Find the enemy death handling in update loop**

Search for where enemies are removed when killed. This is typically in the update method. Add boss victory detection:

```javascript
// In update method, where enemy death is handled
this.enemies = this.enemies.filter(enemy => {
    if (!enemy.isAlive()) {
        // Check if this was a boss
        if (enemy.config && enemy.config.isBoss) {
            const result = this.scoreManager.addBossVictory(enemy.type);
            this.bossAnnouncer.announceBossVictory(enemy.config.name, result.bonus);
        } else {
            // Regular enemy
            if (enemy.isBountyEnemy()) {
                this.scoreManager.addBountyKill(enemy.getBountyValue());
            } else {
                this.scoreManager.addEnemyKill();
            }
        }

        this.waveManager.enemyKilled();
        enemy.destroy();
        return false;
    }
    return true;
});
```

**Step 4: Run game and test full boss encounter**

Run: `npm run dev`
Test:
- Play through to wave 3
- Defeat Iron Shell boss
- Verify victory announcement appears
- Verify bonus points awarded

**Step 5: Commit GameScene boss integration**

```bash
git add src/scenes/GameScene.js
git commit -m "feat: integrate boss victory into GameScene

- Import and initialize BossAnnouncer
- Add boss death detection in update loop
- Award boss victory bonuses on defeat
- Display boss victory announcements
- Separate boss kills from regular enemy kills"
```

---

## Task 9: Add Boss Health Bars

**Files:**
- Create: `/Users/ben/git/private/magic-kingdom/game/src/ui/BossHealthBar.js`

**Step 1: Create BossHealthBar component**

```javascript
export class BossHealthBar {
    constructor(scene, bossName) {
        this.scene = scene;
        this.bossName = bossName;

        // Background bar
        this.background = scene.add.rectangle(960, 50, 1400, 40, 0x000000, 0.8);
        this.background.setDepth(900);
        this.background.setStrokeStyle(4, 0xffffff);

        // Health bar (foreground)
        this.healthBar = scene.add.rectangle(260, 50, 1390, 32, 0xff0000);
        this.healthBar.setDepth(901);
        this.healthBar.setOrigin(0, 0.5);

        // Boss name label
        this.nameText = scene.add.text(960, 50, bossName, {
            fontSize: '32px',
            color: '#ffff00',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        this.nameText.setDepth(902);

        // Phase indicator (for multi-phase bosses)
        this.phaseText = scene.add.text(1700, 50, '', {
            fontSize: '24px',
            color: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(1, 0.5);
        this.phaseText.setDepth(902);
    }

    /**
     * Update health bar display
     * @param {number} current - Current health
     * @param {number} max - Max health
     * @param {number} phase - Current phase (optional)
     */
    update(current, max, phase = null) {
        const healthPercent = Math.max(0, current / max);
        const barWidth = 1390 * healthPercent;

        this.healthBar.width = barWidth;

        // Color changes based on health
        if (healthPercent > 0.6) {
            this.healthBar.setFillStyle(0xff0000);  // Red
        } else if (healthPercent > 0.3) {
            this.healthBar.setFillStyle(0xff8800);  // Orange
        } else {
            this.healthBar.setFillStyle(0xffff00);  // Yellow (critical)
        }

        // Update phase indicator
        if (phase !== null) {
            this.phaseText.setText(`Phase ${phase}`);
        }
    }

    /**
     * Show the health bar
     */
    show() {
        this.background.setVisible(true);
        this.healthBar.setVisible(true);
        this.nameText.setVisible(true);
        this.phaseText.setVisible(true);
    }

    /**
     * Hide the health bar
     */
    hide() {
        this.background.setVisible(false);
        this.healthBar.setVisible(false);
        this.nameText.setVisible(false);
        this.phaseText.setVisible(false);
    }

    /**
     * Remove the health bar from scene
     */
    destroy() {
        this.background.destroy();
        this.healthBar.destroy();
        this.nameText.destroy();
        this.phaseText.destroy();
    }
}
```

**Step 2: Integrate BossHealthBar into GameScene**

In GameScene.js, add to create method:

```javascript
        // Boss health bar (created when boss spawns)
        this.bossHealthBar = null;
```

In update loop, add boss health tracking:

```javascript
// Update boss health bar if active
if (this.bossHealthBar) {
    const boss = this.enemies.find(e => e.config && e.config.isBoss);
    if (boss) {
        this.bossHealthBar.update(boss.health, boss.maxHealth, boss.bossPhase);
    } else {
        // Boss defeated, remove health bar
        this.bossHealthBar.destroy();
        this.bossHealthBar = null;
    }
}
```

In enemy spawning (WaveManager or GameScene), create health bar when boss spawns:

```javascript
// After spawning boss enemy
if (enemy.config.isBoss && !this.scene.bossHealthBar) {
    this.scene.bossHealthBar = new BossHealthBar(this.scene, enemy.config.name);
    this.scene.bossHealthBar.show();
}
```

**Step 3: Import BossHealthBar in GameScene**

```javascript
import { BossAnnouncer } from '../systems/BossAnnouncer.js';
import { BossHealthBar } from '../ui/BossHealthBar.js';
```

**Step 4: Run game and test boss health bar**

Run: `npm run dev`
Test: Health bar appears during boss fight and updates correctly

**Step 5: Commit boss health bar**

```bash
git add src/ui/BossHealthBar.js src/scenes/GameScene.js
git commit -m "feat: add boss health bar UI component

- Create BossHealthBar class for top-of-screen display
- Show boss name and current health
- Color-coded health bar (red/orange/yellow)
- Phase indicator for multi-phase bosses
- Auto-remove on boss defeat"
```

---

## Task 10: Playtesting and Balance Adjustments

**Files:**
- Modify: `/Users/ben/git/private/magic-kingdom/game/src/entities/Enemy.js` (boss stats)

**Step 1: Create test checklist**

Document testing approach:

```markdown
## Boss Wave Testing Checklist

### Iron Shell (Wave 3)
- [ ] Boss announces correctly
- [ ] Phase 1 bubble attacks work
- [ ] Phase 2 transitions at 50% HP
- [ ] Charge attack works
- [ ] Boss is beatable but challenging
- [ ] Victory bonus awarded

### Kraken's Arm (Wave 6)
- [ ] Tentacles spawn correctly
- [ ] Body invulnerability works
- [ ] Tentacle regeneration works
- [ ] Ink clouds appear at triggers
- [ ] Tentacle slam and sweep attacks work
- [ ] Boss is beatable but challenging
- [ ] Victory bonus awarded

### Leviathan (Wave 9)
- [ ] Phase 1 all attacks work
- [ ] Phase 2 transition at 0 HP
- [ ] Health restores in phase 2
- [ ] Minions spawn correctly
- [ ] Lightning and tidal wave work
- [ ] Boss is beatable but very challenging
- [ ] Victory bonus awarded

### General
- [ ] Boss health bars display correctly
- [ ] Announcements are dramatic and readable
- [ ] No performance issues
- [ ] No crash bugs
```

**Step 2: Playtest all three bosses**

Run: `npm run dev`
Play through waves 1-9, testing each boss

**Step 3: Record balance issues**

Document any issues:
- Bosses too easy/hard
- Attacks too frequent/infrequent
- Health too high/low
- Attack damage too high/low

**Step 4: Adjust boss stats based on testing**

Make incremental changes to boss configurations in Enemy.js based on feedback

**Step 5: Commit balance changes**

```bash
git add src/entities/Enemy.js docs/plans/2025-11-17-phase1-testing-notes.md
git commit -m "balance: adjust boss difficulty based on playtesting

- [List specific changes made]
- Document testing findings
- Update boss stats for better gameplay"
```

---

## Task 11: Documentation and Completion

**Files:**
- Create: `/Users/ben/git/private/magic-kingdom/game/docs/phase1-boss-implementation.md`

**Step 1: Create completion documentation**

Document what was implemented:

```markdown
# Phase 1: Boss Waves - Implementation Complete

**Completion Date:** [DATE]
**Status:** ✅ Complete and Tested

## Implemented Features

### Boss Types
1. **Iron Shell** (Wave 3)
   - Two-phase boss mechanics
   - Bubble spread attacks
   - Charge attacks in phase 2
   - Visual damage effects

2. **Kraken's Arm** (Wave 6)
   - Tentacle system with individual health
   - Body invulnerability mechanic
   - Ink cloud area denial
   - Tentacle slam and sweep attacks

3. **The Leviathan** (Wave 9)
   - Two phases with full health restoration
   - Phase 1: Bullet storm, ground pound, charge
   - Phase 2: Lightning strikes, tidal wave
   - Minion spawning system

### Systems
- Boss announcement system with dramatic effects
- Boss health bar UI
- Boss victory bonuses
- Wave composition integration

## Testing Results
[Add testing notes here]

## Known Issues
[List any minor issues or future improvements]

## Next Steps
Ready to proceed to Phase 2: Cover System
```

**Step 2: Update main documentation**

Update README.md or main game documentation to reflect new boss features

**Step 3: Final commit**

```bash
git add docs/phase1-boss-implementation.md README.md
git commit -m "docs: document Phase 1 boss waves completion

- Add implementation completion document
- Update main documentation
- Mark Phase 1 as complete and tested"
```

**Step 4: Create summary tag**

```bash
git tag -a phase1-complete -m "Phase 1: Boss Waves Implementation Complete"
```

---

## Verification Steps

After completing all tasks:

1. **Run the game**: `npm run dev`
2. **Test all three boss fights**:
   - Wave 3: Iron Shell
   - Wave 6: Kraken's Arm
   - Wave 9: The Leviathan
3. **Verify all features**:
   - Boss announcements appear
   - Boss behaviors work correctly
   - Health bars display properly
   - Victory bonuses awarded
   - No crashes or major bugs
4. **Check git status**: All changes committed
5. **Review code**: No debug code or TODOs left behind

---

## Success Criteria

Phase 1 is complete when:

- ✅ All three bosses implemented with unique behaviors
- ✅ Boss announcement system working
- ✅ Boss health bars displaying correctly
- ✅ Victory bonuses awarded properly
- ✅ No major bugs or crashes
- ✅ Bosses are challenging but beatable
- ✅ All code committed with clear commit messages
- ✅ Documentation updated

**Estimated Time:** 6-8 hours total

---

## Notes for Implementation

- Use @superpowers:test-driven-development when appropriate for testable components
- Test each boss individually before moving to the next
- Make frequent, small commits after each completed task
- Document any deviations from the plan
- Balance difficulty through playtesting, not guessing
- Visual effects should enhance drama without causing performance issues

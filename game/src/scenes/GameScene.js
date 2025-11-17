import { Player } from '../entities/Player.js';
import { Bullet } from '../entities/Bullet.js';
import { Enemy } from '../entities/Enemy.js';
import { WaveManager } from '../systems/WaveManager.js';
import { ScoreManager } from '../systems/ScoreManager.js';
import { HealthPickup } from '../entities/HealthPickup.js';
import { Cocktail, COCKTAIL_TYPES } from '../entities/Cocktail.js';
import { InputManager } from '../systems/InputManager.js';
import { TargetSelector } from '../systems/TargetSelector.js';
import { BossAnnouncer } from '../systems/BossAnnouncer.js';
import { BossHealthBar } from '../ui/BossHealthBar.js';
import { CoverManager } from '../systems/CoverManager.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // Assets will be loaded here
    }

    create() {
        // Scene setup
        this.cameras.main.setBackgroundColor('#4a3428'); // Wooden saloon floor
        this.isGameOver = false;

        // Create floor grid pattern
        this.createFloorPattern();

        // Create player in center
        this.player = new Player(this, 960, 540);

        // Player name (for single player, just "Player 1")
        this.playerName = 'Player 1';

        // Make classes available globally in scene
        this.Bullet = Bullet;
        this.Enemy = Enemy;
        this.HealthPickup = HealthPickup;
        this.Cocktail = Cocktail;
        this.COCKTAIL_TYPES = COCKTAIL_TYPES;

        // Create input manager
        this.inputManager = new InputManager(this, 0);

        // Create target selector
        this.targetSelector = new TargetSelector(this);

        // Track input mode for UI updates
        this.lastInputMode = 'keyboard';

        // Setup input (WASD keys for player movement)
        this.keys = this.input.keyboard.addKeys({
            W: Phaser.Input.Keyboard.KeyCodes.W,
            A: Phaser.Input.Keyboard.KeyCodes.A,
            S: Phaser.Input.Keyboard.KeyCodes.S,
            D: Phaser.Input.Keyboard.KeyCodes.D
        });

        // Create enemy array
        this.enemies = [];

        // Create enemy bullets array
        this.enemyBullets = [];

        // Create health pickups array
        this.healthPickups = [];

        // Create cocktails array
        this.cocktails = [];

        // Initialize wave manager
        this.waveManager = new WaveManager(this);

        // Initialize score manager
        this.scoreManager = new ScoreManager(this);

        // Initialize boss announcer
        this.bossAnnouncer = new BossAnnouncer(this);

        // Initialize cover manager
        this.coverManager = new CoverManager(this);

        // Create graphics for formation lines
        this.formationGraphics = this.add.graphics();
        this.formationGraphics.setDepth(5); // Above ground, below UI

        // Boss health bar (created when boss spawns)
        this.bossHealthBar = null;

        // Control instructions (updates based on input mode)
        this.controlsText = this.add.text(20, 20, '', {
            fontSize: '20px',
            color: '#ffffff',
            fontFamily: 'Arial',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        });
        this.updateControlsText();

        // Add health display
        this.healthText = this.add.text(20, 60, 'Health: 100', {
            fontSize: '32px',
            color: '#ff0000',
            fontFamily: 'Arial'
        });

        // Add wave display
        this.waveText = this.add.text(960, 20, 'Wave: 0/3', {
            fontSize: '36px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5, 0);

        // Add enemy count display
        this.enemyText = this.add.text(960, 65, 'Enemies: 0', {
            fontSize: '28px',
            color: '#ffaa00',
            fontFamily: 'Arial'
        }).setOrigin(0.5, 0);

        // Add score display
        this.scoreText = this.add.text(1900, 20, 'Score: 0', {
            fontSize: '32px',
            color: '#ffff00',
            fontFamily: 'Arial'
        }).setOrigin(1, 0);

        // Add buff display
        this.buffText = this.add.text(960, 1000, '', {
            fontSize: '28px',
            color: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5, 0);

        // Create leaderboard panel
        this.createLeaderboard();

        // Target lock visuals
        this.targetReticle = this.add.circle(0, 0, 35);
        this.targetReticle.setStrokeStyle(3, 0x00ff00);
        this.targetReticle.setFillStyle(0x00ff00, 0.1);
        this.targetReticle.setVisible(false);

        this.lockedReticle = this.add.circle(0, 0, 40);
        this.lockedReticle.setStrokeStyle(4, 0xffff00);
        this.lockedReticle.setFillStyle(0xffff00, 0.2);
        this.lockedReticle.setVisible(false);

        // Lock line
        this.lockLine = this.add.line(0, 0, 0, 0, 0, 0, 0xffff00);
        this.lockLine.setLineWidth(2);
        this.lockLine.setVisible(false);

        // Target lock display
        this.lockText = this.add.text(960, 100, '', {
            fontSize: '24px',
            color: '#ffff00',
            fontFamily: 'Arial, "Apple Color Emoji", "Segoe UI Emoji"',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5, 0);

        // Set explicit depth values for proper layering
        this.targetReticle.setDepth(10);
        this.lockedReticle.setDepth(10);
        this.lockLine.setDepth(5);
        this.lockText.setDepth(100);

        // Start first wave after brief delay
        this.time.delayedCall(1000, () => {
            this.waveManager.startNextWave();
            this.updateWaveUI();
        });
    }

    createFloorPattern() {
        const graphics = this.add.graphics();

        // Draw wood plank lines
        graphics.lineStyle(2, 0x3a2a1a, 0.3);

        // Horizontal planks
        for (let y = 0; y < 1080; y += 60) {
            graphics.lineBetween(0, y, 1920, y);
        }

        // Vertical grain lines (sparse)
        for (let x = 0; x < 1920; x += 200) {
            graphics.lineBetween(x, 0, x, 1080);
        }

        // Send to back
        graphics.setDepth(-100);
    }

    update(time, delta) {
        if (this.isGameOver) return;

        // Update wave manager (for spawn animations)
        if (this.waveManager) {
            this.waveManager.update(time);
        }

        // Update cover manager
        if (this.coverManager) {
            this.coverManager.update();
        }

        // Update input manager
        this.inputManager.update();

        // Update target selection
        const aimInfluence = this.inputManager.getAimInfluence();
        const inputMode = this.inputManager.getInputMode();
        this.targetSelector.update(
            this.player.getX(),
            this.player.getY(),
            aimInfluence,
            inputMode,
            this.enemies
        );

        // Handle target cycling
        if (this.inputManager.shouldCycleTargetNext()) {
            this.targetSelector.cycleToBountyTarget(
                this.player.getX(),
                this.player.getY(),
                this.enemies,
                'next'
            );
        }
        if (this.inputManager.shouldCycleTargetPrev()) {
            this.targetSelector.cycleToBountyTarget(
                this.player.getX(),
                this.player.getY(),
                this.enemies,
                'prev'
            );
        }

        // Update player with input
        if (this.player) {
            // Check if player is in ink cloud (before player.update call)
            let speedMultiplier = 1.0;
            for (const enemy of this.enemies) {
                if (enemy.type === 'boss_kraken_arm' && enemy.inkClouds) {
                    for (const cloud of enemy.inkClouds) {
                        const dx = this.player.getX() - cloud.x;
                        const dy = this.player.getY() - cloud.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);

                        if (dist < enemy.config.inkCloudRadius) {
                            speedMultiplier = enemy.config.inkCloudSlowFactor;
                            break;
                        }
                    }
                    if (speedMultiplier < 1.0) break;
                }
            }

            // Apply to player (modify player.update call or add method)
            this.player.setSpeedMultiplier(speedMultiplier);

            this.player.update(this.keys);

            // Handle shooting with auto-aim
            if (this.inputManager.isFiringPressed()) {
                const target = this.targetSelector.getCurrentTarget();
                this.player.shoot(target, time);
            }
        }

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

        // Update enemies
        this.enemies = this.enemies.filter(enemy => {
            if (enemy.isAlive() && this.player) {
                enemy.update(time, this.player.getX(), this.player.getY());

                // Check cover collisions for enemies
                if (this.coverManager) {
                    this.coverManager.getCovers().forEach(cover => {
                        if (!cover.isAlive()) return;

                        const dx = enemy.getSprite().x - cover.x;
                        const dy = enemy.getSprite().y - cover.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        const enemyRadius = enemy.config.radius || 15;
                        const coverRadius = Math.max(cover.width, cover.height) / 2;

                        if (distance < (enemyRadius + coverRadius)) {
                            // Push enemy away from cover
                            const pushAngle = Math.atan2(dy, dx);
                            const targetDist = enemyRadius + coverRadius + 1;
                            enemy.getSprite().x = cover.x + Math.cos(pushAngle) * targetDist;
                            enemy.getSprite().y = cover.y + Math.sin(pushAngle) * targetDist;
                        }
                    });
                }

                return true;
            } else if (!enemy.isAlive()) {
                // Check if this was a boss
                if (enemy.config && enemy.config.isBoss) {
                    const result = this.scoreManager.addBossVictory(enemy.type);
                    this.bossAnnouncer.announceBossVictory(enemy.config.name, result.bonus);
                } else if (enemy.isBountyEnemy()) {
                    // Check if this was a bounty enemy
                    const bountyValue = enemy.getBountyValue();
                    const bountyName = enemy.getBountyName();
                    this.scoreManager.addBountyKill(bountyValue);
                    this.showBountyKillFeedback(bountyName, bountyValue);
                } else {
                    // Regular enemy
                    this.scoreManager.addEnemyKill();
                }

                enemy.destroy();
                this.waveManager.enemyKilled();
                this.updateWaveUI();
                this.updateScoreUI();
                return false;
            }
            return true;
        });

        // Render formation lines
        this.renderFormationLines();

        // Update enemy bullets
        this.updateEnemyBullets(delta);

        // Check collisions
        this.checkBulletCollisions();
        this.checkPlayerCollisions(time);

        // Check health pickup collisions
        this.healthPickups = this.healthPickups.filter(pickup => {
            if (!pickup.isAlive()) return false;

            if (this.player && !this.player.isDead()) {
                const dx = this.player.getX() - pickup.getSprite().x;
                const dy = this.player.getY() - pickup.getSprite().y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Collision if distance less than combined radii
                if (distance < 35) { // 20 (player) + 15 (pickup)
                    const healed = this.player.heal(pickup.getHealAmount());
                    pickup.collect();
                    this.updateHealthUI();

                    // Visual feedback
                    this.cameras.main.flash(200, 0, 255, 0);
                    return false;
                }
            }

            return true;
        });

        // Check cocktail collisions
        this.cocktails = this.cocktails.filter(cocktail => {
            if (!cocktail.isAlive()) {
                cocktail.destroy();  // Clean up sprites for non-alive cocktails
                return false;
            }

            if (this.player && !this.player.isDead()) {
                const dx = this.player.getX() - cocktail.getSprite().x;
                const dy = this.player.getY() - cocktail.getSprite().y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Collision if distance less than combined radii
                if (distance < 35) { // 20 (player) + 15 (cocktail)
                    const config = cocktail.getConfig();
                    this.player.applyBuff(config);
                    cocktail.collect();
                    cocktail.destroy();  // Remove visual from scene
                    this.showCocktailFeedback(config);
                    this.updateBuffUI();
                    return false;
                }
            }

            return true;
        });

        // Update buff UI
        this.updateBuffUI();

        // Update target visuals
        const currentTarget = this.targetSelector.getCurrentTarget();
        const lockedTarget = this.targetSelector.getLockedTarget();

        if (lockedTarget) {
            let targetX, targetY;
            let isAlive = false;

            // Get coordinates based on target type
            if (lockedTarget.type === 'tentacle') {
                const enemy = lockedTarget.enemy;
                const tentSprite = enemy.tentacleSprites ? enemy.tentacleSprites[lockedTarget.tentacleIndex] : null;
                const tentData = enemy.tentacles ? enemy.tentacles[lockedTarget.tentacleIndex] : null;

                if (tentSprite && tentData && tentData.alive) {
                    targetX = tentSprite.x;
                    targetY = tentSprite.y;
                    isAlive = true;
                }
            } else if (lockedTarget.type === 'enemy') {
                if (lockedTarget.enemy && lockedTarget.enemy.isAlive()) {
                    targetX = lockedTarget.enemy.getSprite().x;
                    targetY = lockedTarget.enemy.getSprite().y;
                    isAlive = true;
                }
            }

            if (isAlive) {
                // Show locked target reticle
                this.lockedReticle.setPosition(targetX, targetY);
                this.lockedReticle.setVisible(true);

                // Pulse animation
                const pulse = Math.sin(time / 200) * 0.1 + 1.0;
                this.lockedReticle.setScale(pulse);

                // Line from player to locked target
                this.lockLine.setTo(
                    this.player.getX(),
                    this.player.getY(),
                    targetX,
                    targetY
                );
                this.lockLine.setVisible(true);
            } else {
                this.lockedReticle.setVisible(false);
                this.lockLine.setVisible(false);
            }
        } else {
            this.lockedReticle.setVisible(false);
            this.lockLine.setVisible(false);
        }

        if (currentTarget) {
            let targetX, targetY;
            let isAlive = false;

            // Get coordinates based on target type
            if (currentTarget.type === 'tentacle') {
                const enemy = currentTarget.enemy;
                const tentSprite = enemy.tentacleSprites ? enemy.tentacleSprites[currentTarget.tentacleIndex] : null;
                const tentData = enemy.tentacles ? enemy.tentacles[currentTarget.tentacleIndex] : null;

                if (tentSprite && tentData && tentData.alive) {
                    targetX = tentSprite.x;
                    targetY = tentSprite.y;
                    isAlive = true;
                }
            } else if (currentTarget.type === 'enemy') {
                if (currentTarget.enemy && currentTarget.enemy.isAlive()) {
                    targetX = currentTarget.enemy.getSprite().x;
                    targetY = currentTarget.enemy.getSprite().y;
                    isAlive = true;
                } else if (currentTarget.isAlive && currentTarget.isAlive()) {
                    // Legacy format (plain enemy object)
                    targetX = currentTarget.getSprite().x;
                    targetY = currentTarget.getSprite().y;
                    isAlive = true;
                }
            } else if (currentTarget.isAlive && currentTarget.isAlive()) {
                // Legacy format (plain enemy object)
                targetX = currentTarget.getSprite().x;
                targetY = currentTarget.getSprite().y;
                isAlive = true;
            }

            if (isAlive && currentTarget !== lockedTarget) {
                // Show current auto-target reticle
                this.targetReticle.setPosition(targetX, targetY);
                this.targetReticle.setVisible(true);
            } else {
                this.targetReticle.setVisible(false);
            }
        } else {
            this.targetReticle.setVisible(false);
        }

        // Update lock UI
        if (lockedTarget) {
            const label = lockedTarget.label || (lockedTarget.enemy ? lockedTarget.enemy.getBountyName() : 'Unknown');
            this.lockText.setText(`🎯 LOCKED: ${label}`);
        } else {
            this.lockText.setText('');
        }

        // Update controls display if input mode changed
        if (this.lastInputMode !== this.inputManager.getInputMode()) {
            this.updateControlsText();
            this.lastInputMode = this.inputManager.getInputMode();
        }
    }

    checkBulletCollisions() {
        if (!this.player) return;

        const bullets = this.player.bullets;

        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];
            if (!bullet.isAlive()) continue;

            // Check cover collision FIRST
            if (this.coverManager) {
                const hitCover = this.coverManager.checkBulletCollision(
                    bullet.getSprite().x,
                    bullet.getSprite().y,
                    bullet.getDamage()
                );

                if (hitCover) {
                    bullet.destroy();
                    continue; // Skip enemy collision check
                }
            }

            let hitEnemy = false;

            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                if (!enemy.isAlive()) continue;

                // Skip collision if enemy is spawning
                if (!enemy.isCollisionEnabled()) continue;

                // Check distance between bullet and enemy
                const dx = bullet.getSprite().x - enemy.getSprite().x;
                const dy = bullet.getSprite().y - enemy.getSprite().y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Collision if distance less than combined radii
                if (distance < 19) { // 4 (bullet) + 15 (enemy)
                    enemy.takeDamage(bullet.getDamage());
                    hitEnemy = true;

                    // Screen shake on hit
                    this.cameras.main.shake(100, 0.002);

                    // Flash enemy white
                    enemy.getSprite().setFillStyle(0xffffff);
                    this.time.delayedCall(100, () => {
                        if (enemy.isAlive()) {
                            enemy.getSprite().setFillStyle(enemy.config.color);
                        }
                    });

                    // Only destroy bullet if not piercing
                    if (!bullet.isPiercing()) {
                        bullet.destroy();
                        break;
                    }
                }

                // After checking body collision, check tentacles for Kraken boss
                if (enemy.type === 'boss_kraken_arm' && enemy.tentacleSprites) {
                    for (let k = 0; k < enemy.tentacleSprites.length; k++) {
                        const tentSprite = enemy.tentacleSprites[k];
                        if (!tentSprite || !enemy.tentacles[k] || !enemy.tentacles[k].alive) continue;

                        const tdx = bullet.getSprite().x - tentSprite.x;
                        const tdy = bullet.getSprite().y - tentSprite.y;
                        const tdist = Math.sqrt(tdx * tdx + tdy * tdy);

                        if (tdist < 24) { // bullet radius (4) + tentacle radius (20)
                            enemy.takeTentacleDamage(k, bullet.getDamage());
                            hitEnemy = true;

                            // Visual feedback
                            tentSprite.setFillStyle(0xffffff);
                            this.time.delayedCall(100, () => {
                                if (tentSprite && enemy.tentacles[k] && enemy.tentacles[k].alive) {
                                    tentSprite.setFillStyle(0x9966cc);
                                }
                            });

                            if (!bullet.isPiercing()) {
                                bullet.destroy();
                                break;
                            }
                        }
                    }
                }
            }

            // If piercing bullet didn't hit anything this frame, continue
            // Non-piercing bullets already destroyed above
        }
    }

    checkPlayerCollisions(time) {
        if (!this.player || this.player.isDead()) return;

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            if (!enemy.isAlive()) continue;

            // Check distance between player and enemy
            const dx = this.player.getX() - enemy.getSprite().x;
            const dy = this.player.getY() - enemy.getSprite().y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Collision if distance less than combined radii
            if (distance < 35) { // 20 (player) + 15 (enemy)
                // Check damage cooldown to prevent frame-rate dependent damage
                if (time - this.player.lastHitTime >= this.player.hitCooldown) {
                    const health = this.player.takeDamage(enemy.getDamage());
                    this.updateHealthUI();
                    this.player.lastHitTime = time;

                    if (this.player.isDead()) {
                        this.handleGameOver();
                    }
                }

                // Push enemy back to prevent stacking
                const pushAngle = Math.atan2(dy, dx);
                enemy.getSprite().setPosition(
                    enemy.getSprite().x - Math.cos(pushAngle) * 40,
                    enemy.getSprite().y - Math.sin(pushAngle) * 40
                );
            }
        }
    }

    updateHealthUI() {
        if (this.player) {
            this.healthText.setText(`Health: ${this.player.health}`);
        }
    }

    updateWaveUI() {
        const current = this.waveManager.getCurrentWave();
        const max = this.waveManager.getMaxWaves();
        const enemiesAlive = this.enemies.filter(e => e.isAlive()).length;

        this.waveText.setText(`Wave: ${current}/${max}`);
        this.enemyText.setText(`Enemies: ${enemiesAlive}`);
    }

    updateScoreUI() {
        this.scoreText.setText(`Score: ${this.scoreManager.getScore()}`);
        this.updateLeaderboard();
    }

    createLeaderboard() {
        const x = 1700;
        const y = 100;

        // Background panel
        const panel = this.add.rectangle(x, y, 200, 150, 0x000000, 0.7);
        panel.setStrokeStyle(3, 0xffff00);

        // Title
        this.add.text(x, y - 60, 'LEADERBOARD', {
            fontSize: '24px',
            color: '#ffff00',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Player entry
        this.leaderboardEntry = this.add.text(x, y, '', {
            fontSize: '20px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        this.updateLeaderboard();
    }

    updateLeaderboard() {
        if (!this.scoreManager || !this.leaderboardEntry) return;

        const score = this.scoreManager.getScore();
        this.leaderboardEntry.setText(`${this.playerName}: ${score}`);
    }

    showBountyKillFeedback(name, value) {
        // Screen flash
        this.cameras.main.flash(300, 255, 215, 0);

        // Large text announcement
        const announcement = this.add.text(960, 540, `${name}\n+${value} POINTS!`, {
            fontSize: '48px',
            color: '#ffff00',
            fontFamily: 'Arial',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Fade out animation
        this.tweens.add({
            targets: announcement,
            alpha: 0,
            y: 440,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => announcement.destroy()
        });
    }

    showCocktailFeedback(config) {
        // Flash screen with cocktail color
        const r = (config.color >> 16) & 0xff;
        const g = (config.color >> 8) & 0xff;
        const b = config.color & 0xff;
        this.cameras.main.flash(200, r, g, b);

        // Show buff name
        const announcement = this.add.text(960, 400, config.name, {
            fontSize: '36px',
            color: '#' + config.color.toString(16).padStart(6, '0'),
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        const description = this.add.text(960, 450, config.description, {
            fontSize: '24px',
            color: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Fade out
        this.tweens.add({
            targets: [announcement, description],
            alpha: 0,
            duration: 2000,
            onComplete: () => {
                announcement.destroy();
                description.destroy();
            }
        });
    }

    updateBuffUI() {
        if (!this.player) {
            this.buffText.setText('');
            return;
        }

        const buff = this.player.getActiveBuff();
        if (buff) {
            const timeLeft = Math.ceil((this.player.buffEndTime - Date.now()) / 1000);
            this.buffText.setText(`BUFF: ${buff.toUpperCase().replace('_', ' ')} (${timeLeft}s)`);
        } else {
            this.buffText.setText('');
        }
    }

    updateControlsText() {
        if (!this.inputManager) return;

        const mode = this.inputManager.getInputMode();

        if (mode === 'gamepad') {
            this.controlsText.setText(
                'Left Stick: Move | Right Trigger: Fire\n' +
                'Right Stick: Aim Influence | L1/R1: Lock Bounty'
            );
        } else {
            this.controlsText.setText(
                'WASD: Move | Mouse: Fire & Aim Influence | Q/E: Lock Bounty'
            );
        }
    }

    handleVictory() {
        this.isGameOver = true;

        // Black overlay
        const overlay = this.add.rectangle(960, 540, 1920, 1080, 0x000000, 0.8);

        // Victory banner
        const victoryText = this.add.text(960, 200, 'VICTORY!', {
            fontSize: '96px',
            color: '#00ff00',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5);

        // Pulse animation
        this.tweens.add({
            targets: victoryText,
            scale: 1.1,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // MVP Section
        this.add.text(960, 320, 'MVP: ' + this.playerName, {
            fontSize: '48px',
            color: '#ffff00',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Spotlight effect on player
        const spotlight = this.add.circle(
            this.player.getX(),
            this.player.getY(),
            100,
            0xffff00,
            0.3
        );

        this.tweens.add({
            targets: spotlight,
            alpha: 0.5,
            scale: 1.2,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });

        // Score breakdown
        const finalScore = this.scoreManager.getScore();
        const waveCount = this.waveManager.getCurrentWave();

        this.add.text(960, 420, 'SCORE BREAKDOWN', {
            fontSize: '32px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(960, 480, `Waves Completed: ${waveCount}`, {
            fontSize: '24px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        this.add.text(960, 520, `Final Score: ${finalScore}`, {
            fontSize: '32px',
            color: '#ffff00',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Check high score
        const highScore = localStorage.getItem('highScore') || 0;
        if (finalScore > highScore) {
            localStorage.setItem('highScore', finalScore);

            this.add.text(960, 580, 'NEW HIGH SCORE!', {
                fontSize: '36px',
                color: '#ff00ff',
                fontFamily: 'Arial',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 4
            }).setOrigin(0.5);
        } else {
            this.add.text(960, 580, `High Score: ${highScore}`, {
                fontSize: '24px',
                color: '#aaaaaa',
                fontFamily: 'Arial'
            }).setOrigin(0.5);
        }

        this.add.text(960, 700, 'Refresh to Play Again', {
            fontSize: '24px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
    }

    handleGameOver() {
        this.isGameOver = true;

        // Black overlay
        const overlay = this.add.rectangle(960, 540, 1920, 1080, 0x000000, 0.8);

        // Game Over text
        const gameOverText = this.add.text(960, 300, 'GAME OVER', {
            fontSize: '96px',
            color: '#ff0000',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5);

        // Performance summary
        const finalScore = this.scoreManager.getScore();
        const waveReached = this.waveManager.getCurrentWave();

        this.add.text(960, 450, `Survived to Wave ${waveReached}/10`, {
            fontSize: '36px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        this.add.text(960, 520, `Final Score: ${finalScore}`, {
            fontSize: '32px',
            color: '#ffff00',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // High score comparison
        const highScore = localStorage.getItem('highScore') || 0;
        if (finalScore > highScore) {
            localStorage.setItem('highScore', finalScore);

            this.add.text(960, 600, 'NEW HIGH SCORE!', {
                fontSize: '36px',
                color: '#ff00ff',
                fontFamily: 'Arial',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 4
            }).setOrigin(0.5);
        } else {
            this.add.text(960, 600, `High Score: ${highScore}`, {
                fontSize: '24px',
                color: '#aaaaaa',
                fontFamily: 'Arial'
            }).setOrigin(0.5);
        }

        this.add.text(960, 700, 'Refresh to Try Again', {
            fontSize: '24px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Destroy player visually
        if (this.player) {
            this.player.destroy();
        }
    }

    /**
     * Update all enemy bullets and check collisions with player
     */
    updateEnemyBullets(deltaTime) {
        if (!this.enemyBullets) return;

        // Update each bullet
        this.enemyBullets.forEach(bullet => {
            bullet.update(deltaTime);
        });

        // Check collisions with player
        this.enemyBullets = this.enemyBullets.filter(bullet => {
            if (!bullet.isActive()) {
                return false;
            }

            // Check cover collision
            if (this.coverManager) {
                const bulletSprite = bullet.getSprite();
                const hitCover = this.coverManager.checkBulletCollision(
                    bulletSprite.x,
                    bulletSprite.y,
                    bullet.getDamage()
                );

                if (hitCover) {
                    bullet.destroy();
                    return false;
                }
            }

            // Check collision with player
            if (this.player && !this.player.isDead()) {
                const playerRadius = 20;  // Player collision radius
                const bulletSprite = bullet.getSprite();

                if (bullet.checkCollision(this.player.getX(), this.player.getY(), playerRadius)) {
                    // Hit player!
                    console.log('Player hit by bullet! Damage:', bullet.getDamage());
                    const newHealth = this.player.takeDamage(bullet.getDamage());
                    console.log('Player health after hit:', newHealth);

                    // Update health UI
                    this.updateHealthUI();

                    // Screen shake on hit
                    this.cameras.main.shake(150, 0.003);

                    // Check for explosion (bounty lobster bullets)
                    const explosion = bullet.explode();
                    if (explosion) {
                        // Explosion AoE - player already hit, no additional damage needed for single player
                        // In multiplayer, this would damage other players in radius
                    }

                    bullet.destroy();
                    return false;
                }
            }

            return true;  // Keep bullet
        });
    }

    /**
     * Render formation lines from shooters to their tank leaders
     */
    renderFormationLines() {
        if (!this.formationGraphics) return;

        this.formationGraphics.clear();

        // Draw lines from shooters to their tanks
        this.enemies.forEach(enemy => {
            if (enemy.role === 'shooter' && enemy.formationLeader && enemy.formationLeader.isAlive()) {
                const shooter = enemy.getSprite();
                const tank = enemy.formationLeader.getSprite();

                // Draw dotted line
                this.formationGraphics.lineStyle(2, 0x00ff00, 0.3);

                const steps = 10;
                for (let i = 0; i < steps; i += 2) {
                    const t1 = i / steps;
                    const t2 = (i + 1) / steps;

                    const x1 = shooter.x + (tank.x - shooter.x) * t1;
                    const y1 = shooter.y + (tank.y - shooter.y) * t1;
                    const x2 = shooter.x + (tank.x - shooter.x) * t2;
                    const y2 = shooter.y + (tank.y - shooter.y) * t2;

                    this.formationGraphics.lineBetween(x1, y1, x2, y2);
                }
            }
        });
    }
}

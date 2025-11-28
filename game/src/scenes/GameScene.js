import { Player } from '../entities/Player.js';
import { Bullet } from '../entities/Bullet.js';
import { Enemy } from '../entities/Enemy.js';
import { WaveManager } from '../systems/WaveManager.js';
import { ScoreManager } from '../systems/ScoreManager.js';
import { HealthPickup } from '../entities/HealthPickup.js';
import { Cocktail, COCKTAIL_TYPES } from '../entities/Cocktail.js';
import { InputManager } from '../systems/InputManager.js';
import { PlayerManager } from '../systems/PlayerManager.js';
import { TargetSelector } from '../systems/TargetSelector.js';
import { BossAnnouncer } from '../systems/BossAnnouncer.js';
import { BossHealthBar } from '../ui/BossHealthBar.js';
import { CoverManager } from '../systems/CoverManager.js';
import { DEFAULT_DIFFICULTY } from '../config.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // Assets will be loaded here
    }

    create(data) {
        // Scene setup
        this.cameras.main.setBackgroundColor('#4a3428'); // Wooden saloon floor (fallback)
        this.isGameOver = false;

        // Get difficulty from scene data or registry
        this.difficulty = data.difficulty || this.registry.get('difficulty') || DEFAULT_DIFFICULTY;
        console.log('Starting game with difficulty:', this.difficulty.name);

        // Get player configs from StartScene
        const playerConfigs = data.players || [
            { index: 0, color: 'red', name: 'Player 1' } // Fallback for testing
        ];

        // Create tiled floor background
        this.createTiledBackground();

        // Create PlayerManager instead of single player
        this.playerManager = new PlayerManager(this, playerConfigs);

        // Keep reference to first player for legacy code compatibility
        this.player = this.playerManager.players[0];

        // Player name (for single player, just "Player 1")
        this.playerName = 'Player 1';

        // Make classes available globally in scene
        this.Bullet = Bullet;
        this.Enemy = Enemy;
        this.HealthPickup = HealthPickup;
        this.Cocktail = Cocktail;
        this.COCKTAIL_TYPES = COCKTAIL_TYPES;

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

        // Set difficulty
        this.waveManager.setDifficulty(this.difficulty);

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

        // Add wave display (moved left to avoid overlap with scores)
        this.waveText = this.add.text(700, 20, 'Wave: 0/12', {
            fontSize: '36px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5, 0);

        // Add enemy count display (moved left to match wave text)
        this.enemyText = this.add.text(700, 65, 'Enemies: 0', {
            fontSize: '28px',
            color: '#ffaa00',
            fontFamily: 'Arial'
        }).setOrigin(0.5, 0);

        // Difficulty indicator
        this.difficultyText = this.add.text(700, 105, '', {
            fontSize: '24px',
            color: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5, 0);

        // Update difficulty text with color
        if (this.difficulty) {
            const colorHex = '#' + this.difficulty.color.toString(16).padStart(6, '0');
            this.difficultyText.setText(`Difficulty: ${this.difficulty.name}`);
            this.difficultyText.setColor(colorHex);
        }

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

        // Add stored cocktail indicator (bottom left of screen)
        this.storedCocktailHUD = this.add.container(30, 980);

        const hudBg = this.add.rectangle(0, 0, 160, 50, 0x000000, 0.7);
        const hudText = this.add.text(-70, 0, 'READY:', {
            fontSize: '18px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0, 0.5);
        const hudIcon = this.add.image(50, 0, 'cocktail-margarita');
        hudIcon.setScale(0.4); // Scale for HUD size
        hudIcon.setVisible(false); // Hidden until set
        const hudName = this.add.text(0, 20, '', {
            fontSize: '16px',
            color: '#ffff00',
            fontFamily: 'Arial'
        }).setOrigin(0.5, 0);

        this.storedCocktailHUD.add([hudBg, hudText, hudIcon, hudName]);
        this.storedCocktailHUD.setVisible(false);  // Hidden until cocktail stored
        this.storedCocktailHUD.setDepth(100);

        // Store references for updates
        this.storedCocktailHUDIcon = hudIcon;
        this.storedCocktailHUDName = hudName;

        // Create leaderboard panel
        this.createLeaderboard();

        // Create health bars for all players
        this.createPlayerHealthBars();

        // Target lock visuals for each player (color-coded)
        this.playerReticles = {};
        this.playerLockedReticles = {};
        this.playerLockLines = {};

        this.playerManager.players.forEach(player => {
            const colorHex = this.playerManager.getPlayerColorHex(player.color);

            // Current target reticle
            const reticle = this.add.circle(0, 0, 35);
            reticle.setStrokeStyle(3, colorHex);
            reticle.setFillStyle(colorHex, 0.1);
            reticle.setVisible(false);
            this.playerReticles[player.playerIndex] = reticle;

            // Locked target reticle
            const lockedReticle = this.add.circle(0, 0, 40);
            lockedReticle.setStrokeStyle(4, colorHex);
            lockedReticle.setFillStyle(colorHex, 0.2);
            lockedReticle.setVisible(false);
            this.playerLockedReticles[player.playerIndex] = lockedReticle;

            // Line from player to locked target
            const lockLine = this.add.line(0, 0, 0, 0, 0, 0, colorHex, 0.5);
            lockLine.setLineWidth(2);
            lockLine.setVisible(false);
            this.playerLockLines[player.playerIndex] = lockLine;
        });

        // Target lock display
        this.lockText = this.add.text(960, 100, '', {
            fontSize: '24px',
            color: '#ffff00',
            fontFamily: 'Arial, "Apple Color Emoji", "Segoe UI Emoji"',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5, 0);

        // Set explicit depth values for proper layering
        this.lockText.setDepth(100);

        // Set depth for all player reticles
        Object.values(this.playerReticles).forEach(reticle => reticle.setDepth(10));
        Object.values(this.playerLockedReticles).forEach(reticle => reticle.setDepth(10));
        Object.values(this.playerLockLines).forEach(line => line.setDepth(5));

        // Start first wave after brief delay
        this.time.delayedCall(1000, () => {
            this.waveManager.startNextWave();
            this.updateWaveUI();
        });
    }

    createTiledBackground() {
        // Create a tiled sprite that fills the entire game world
        // The environment texture will automatically repeat/tile
        const bg = this.add.tileSprite(
            0,           // x position (top-left)
            0,           // y position (top-left)
            1920,        // width (game world width)
            1080,        // height (game world height)
            'environment' // texture key
        );

        // Set origin to top-left so positioning is easier
        bg.setOrigin(0, 0);

        // Send to back behind everything
        bg.setDepth(-100);

        console.log('Tiled saloon floor background created');
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

        // Update PlayerManager (handles all players and input)
        if (this.playerManager) {
            // Update input managers for all players
            Object.values(this.playerManager.inputManagers).forEach(inputManager => {
                inputManager.update();
            });

            // Update PlayerManager
            this.playerManager.update(time, delta);
        }

        // Update target selection and shooting for all living players
        this.playerManager.getLivingPlayers().forEach(player => {
            const inputManager = this.playerManager.inputManagers[player.playerIndex];
            const targetSelector = this.playerManager.targetSelectors[player.playerIndex];
            if (!inputManager || !targetSelector) return;

            // Update target selector for this player
            const aimInfluence = inputManager.getAimInfluence();
            const inputMode = inputManager.getInputMode();
            targetSelector.update(
                player.getX(),
                player.getY(),
                aimInfluence,
                inputMode,
                this.enemies
            );

            // Handle target cycling
            if (inputManager.shouldCycleTargetNext()) {
                targetSelector.cycleToBountyTarget(
                    player.getX(),
                    player.getY(),
                    this.enemies,
                    'next'
                );
            }
            if (inputManager.shouldCycleTargetPrev()) {
                targetSelector.cycleToBountyTarget(
                    player.getX(),
                    player.getY(),
                    this.enemies,
                    'prev'
                );
            }

            // Check if player is in ink cloud
            let speedMultiplier = 1.0;
            for (const enemy of this.enemies) {
                if (enemy.type === 'boss_kraken_arm' && enemy.inkClouds) {
                    for (const cloud of enemy.inkClouds) {
                        const dx = player.getX() - cloud.x;
                        const dy = player.getY() - cloud.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);

                        if (dist < enemy.config.inkCloudRadius) {
                            speedMultiplier = enemy.config.inkCloudSlowFactor;
                            break;
                        }
                    }
                    if (speedMultiplier < 1.0) break;
                }
            }

            // Apply to player
            player.setSpeedMultiplier(speedMultiplier);

            // Check for cocktail activation input
            if (inputManager && inputManager.shouldActivateCocktail()) {
                const activated = player.activateStoredCocktail();
                if (activated) {
                    // Show activation feedback
                    this.showCocktailActivationFeedback(player);
                    this.updateBuffUI();
                }
            }

            // Handle shooting with auto-aim
            if (inputManager.isFiringPressed()) {
                const target = targetSelector.getCurrentTarget();
                player.shoot(target, time);
            }
        });


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
        let reinforcementCount = 0;
        let totalEnemies = 0;
        let aliveEnemies = 0;
        this.enemies = this.enemies.filter(enemy => {
            totalEnemies++;
            if (enemy.isAlive()) {
                aliveEnemies++;
                // Skip update if enemy is still spawning (collision disabled during spawn animation)
                if (!enemy.isCollisionEnabled()) {
                    reinforcementCount++;
                    return true; // Keep enemy in array but don't update AI
                }

                if (!this.playerManager) {
                    return true; // Keep enemy but skip update if no player manager
                }

                // Get all living players
                const livingPlayers = this.playerManager.getLivingPlayers();
                if (livingPlayers.length > 0) {
                    // Find closest player to this enemy
                    let closestPlayer = livingPlayers[0];
                    let closestDistance = Infinity;

                    livingPlayers.forEach(player => {
                        const dx = player.getX() - enemy.getSprite().x;
                        const dy = player.getY() - enemy.getSprite().y;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance < closestDistance) {
                            closestDistance = distance;
                            closestPlayer = player;
                        }
                    });

                    enemy.update(time, closestPlayer.getX(), closestPlayer.getY());
                } else if (this.player) {
                    // Fallback to legacy single player
                    enemy.update(time, this.player.getX(), this.player.getY());
                }

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
                // Determine which player gets credit for the kill
                const killerPlayerIndex = enemy.lastHitByPlayerIndex !== undefined
                    ? enemy.lastHitByPlayerIndex
                    : this.player.playerIndex; // Default to first player for legacy support

                // Check if this was a boss
                if (enemy.config && enemy.config.isBoss) {
                    const result = this.scoreManager.addBossVictory(enemy.type);
                    this.bossAnnouncer.announceBossVictory(enemy.config.name, result.bonus);
                    // Also credit the player
                    this.scoreManager.addKillToPlayer(killerPlayerIndex, result.bonus);
                } else if (enemy.isBountyEnemy()) {
                    // Check if this was a bounty enemy
                    const bountyValue = enemy.getBountyValue();
                    const bountyName = enemy.getBountyName();
                    this.scoreManager.addBountyKill(bountyValue);
                    this.showBountyKillFeedback(bountyName, bountyValue);
                    // Credit the player with bounty
                    this.scoreManager.addBountyToPlayer(killerPlayerIndex, bountyValue);
                } else {
                    // Regular enemy
                    this.scoreManager.addEnemyKill();
                    // Credit the player
                    this.scoreManager.addKillToPlayer(killerPlayerIndex, this.scoreManager.ENEMY_KILL_POINTS);
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

            // Check collision with all living players
            for (const player of this.playerManager.getLivingPlayers()) {
                const dx = player.getX() - pickup.getSprite().x;
                const dy = player.getY() - pickup.getSprite().y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Collision if distance less than combined radii
                if (distance < 35) { // 20 (player) + 15 (pickup)
                    const healed = player.heal(pickup.getHealAmount());
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

            // Check collision with all living players
            for (const player of this.playerManager.getLivingPlayers()) {
                const dx = player.getX() - cocktail.getSprite().x;
                const dy = player.getY() - cocktail.getSprite().y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Collision if distance less than combined radii
                if (distance < 35) { // 20 (player) + 15 (cocktail)
                    const config = cocktail.getConfig();

                    // Player can store even if they have an active buff
                    // (active buff is separate from stored cocktail)
                    player.storeCocktail(cocktail.getType(), config);

                    cocktail.collect();
                    cocktail.destroy();
                    this.showCocktailPickupFeedback(player, config);

                    return false;
                }
            }

            return true;
        });

        // Update buff UI
        this.updateBuffUI();

        // Update stored cocktail HUD
        this.updateStoredCocktailHUD();

        // Update health bars
        if (this.playerHealthBars) {
            this.playerHealthBars.forEach(bar => {
                const player = bar.player;
                const healthPercent = player.health / player.maxHealth;

                // Update health bar width
                bar.healthFg.width = 180 * Math.max(0, healthPercent);

                // Grey out if dead
                if (player.isDead) {
                    bar.bg.setAlpha(0.4);
                    bar.nameText.setAlpha(0.4);
                    bar.healthBg.setAlpha(0.4);
                    bar.healthFg.setAlpha(0.4);
                }
            });
        }

        // Update target visuals for each player
        this.playerManager.players.forEach(player => {
            const targetSelector = this.playerManager.targetSelectors[player.playerIndex];
            if (!targetSelector || player.isDead) {
                // Hide reticles for dead players or missing target selectors
                if (this.playerReticles[player.playerIndex]) {
                    this.playerReticles[player.playerIndex].setVisible(false);
                }
                if (this.playerLockedReticles[player.playerIndex]) {
                    this.playerLockedReticles[player.playerIndex].setVisible(false);
                }
                if (this.playerLockLines[player.playerIndex]) {
                    this.playerLockLines[player.playerIndex].setVisible(false);
                }
                return;
            }

            const currentTarget = targetSelector.getCurrentTarget();
            const lockedTarget = targetSelector.getLockedTarget();
            const reticle = this.playerReticles[player.playerIndex];
            const lockedReticle = this.playerLockedReticles[player.playerIndex];
            const lockLine = this.playerLockLines[player.playerIndex];

            // Handle locked target
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
                    lockedReticle.setPosition(targetX, targetY);
                    lockedReticle.setVisible(true);

                    // Pulse animation
                    const pulse = Math.sin(time / 200) * 0.1 + 1.0;
                    lockedReticle.setScale(pulse);

                    // Line from player to locked target
                    lockLine.setTo(
                        player.getX(),
                        player.getY(),
                        targetX,
                        targetY
                    );
                    lockLine.setVisible(true);
                } else {
                    lockedReticle.setVisible(false);
                    lockLine.setVisible(false);
                }
            } else {
                lockedReticle.setVisible(false);
                lockLine.setVisible(false);
            }

            // Handle current target
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
                    reticle.setPosition(targetX, targetY);
                    reticle.setVisible(true);
                } else {
                    reticle.setVisible(false);
                }
            } else {
                reticle.setVisible(false);
            }
        });

        // Update lock UI (show first player's lock for now)
        const firstPlayer = this.playerManager.players[0];
        if (firstPlayer) {
            const targetSelector = this.playerManager.targetSelectors[firstPlayer.playerIndex];
            if (targetSelector) {
                const lockedTarget = targetSelector.getLockedTarget();
                if (lockedTarget) {
                    const label = lockedTarget.label || (lockedTarget.enemy ? lockedTarget.enemy.getBountyName() : 'Unknown');
                    this.lockText.setText(`🎯 LOCKED: ${label}`);
                } else {
                    this.lockText.setText('');
                }
            } else {
                this.lockText.setText('');
            }
        } else {
            this.lockText.setText('');
        }

        // Update controls display if input mode changed
        if (firstPlayer) {
            const firstInputManager = this.playerManager.inputManagers[firstPlayer.playerIndex];
            if (firstInputManager && this.lastInputMode !== firstInputManager.getInputMode()) {
                this.updateControlsText();
                this.lastInputMode = firstInputManager.getInputMode();
            }
        }
    }

    checkBulletCollisions() {
        // Check bullet collisions for all players
        // Note: Player bullets only check collision with enemies (no friendly fire)
        this.playerManager.players.forEach(player => {
            const bullets = player.bullets;

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
                    // Track which player hit this enemy (for scoring)
                    enemy.lastHitByPlayerIndex = player.playerIndex;
                    hitEnemy = true;

                    // Screen shake on hit
                    this.cameras.main.shake(100, 0.002);

                    // Flash enemy white (different methods for sprites vs circles)
                    const sprite = enemy.getSprite();
                    if (enemy.useDirectionalSprites) {
                        // For sprites, use tint
                        sprite.setTint(0xffffff);
                        this.time.delayedCall(100, () => {
                            if (enemy.isAlive()) {
                                sprite.clearTint();
                            }
                        });
                    } else {
                        // For circles, use setFillStyle
                        sprite.setFillStyle(0xffffff);
                        this.time.delayedCall(100, () => {
                            if (enemy.isAlive()) {
                                sprite.setFillStyle(enemy.config.color);
                            }
                        });
                    }

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
                            // Track which player hit this enemy (for scoring)
                            enemy.lastHitByPlayerIndex = player.playerIndex;
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
        });
    }

    checkPlayerCollisions(time) {
        // Check collisions for all living players
        this.playerManager.getLivingPlayers().forEach(player => {
            for (let i = this.enemies.length - 1; i >= 0; i--) {
                const enemy = this.enemies[i];
                if (!enemy.isAlive()) continue;

                // Check distance between player and enemy
                const dx = player.getX() - enemy.getSprite().x;
                const dy = player.getY() - enemy.getSprite().y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Collision if distance less than combined radii
                if (distance < 35) { // 20 (player) + 15 (enemy)
                    // takeDamage handles cooldown internally
                    const health = player.takeDamage(enemy.getDamage());
                    this.updateHealthUI();

                    // Check if all players are dead
                    if (this.playerManager.allPlayersDead()) {
                        this.handleGameOver();
                    }

                    // Push enemy back to prevent stacking
                    const pushAngle = Math.atan2(dy, dx);
                    enemy.getSprite().setPosition(
                        enemy.getSprite().x - Math.cos(pushAngle) * 40,
                        enemy.getSprite().y - Math.sin(pushAngle) * 40
                    );
                }
            }
        });
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

    createPlayerHealthBars() {
        this.playerHealthBars = [];

        const players = this.playerManager.players;

        // Position health bars in corners
        const positions = [
            { x: 20, y: 100 },   // P1: Top-left
            { x: 1700, y: 100 }, // P2: Top-right
            { x: 20, y: 980 },   // P3: Bottom-left
            { x: 1700, y: 980 }  // P4: Bottom-right
        ];

        players.forEach((player, index) => {
            const pos = positions[index];
            const healthBar = this.createHealthBar(pos.x, pos.y, player);
            this.playerHealthBars.push(healthBar);
        });
    }

    createHealthBar(x, y, player) {
        // Background
        const bg = this.add.rectangle(x, y, 200, 40, 0x000000, 0.7);
        bg.setOrigin(0, 0);

        // Player name with color
        const colorTints = { red: 0xff6b6b, blue: 0x4dabf7, green: 0x51cf66, yellow: 0xffd43b };
        const nameText = this.add.text(x + 10, y + 5, player.playerName, {
            fontSize: '16px',
            color: '#ffffff',
            fontFamily: 'Arial'
        });
        nameText.setTint(colorTints[player.color]);

        // Health bar (red background)
        const healthBg = this.add.rectangle(x + 10, y + 25, 180, 10, 0x8b0000);
        healthBg.setOrigin(0, 0);

        // Health bar (green foreground)
        const healthFg = this.add.rectangle(x + 10, y + 25, 180, 10, 0x00ff00);
        healthFg.setOrigin(0, 0);

        return {
            player,
            bg,
            nameText,
            healthBg,
            healthFg
        };
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

    showCocktailPickupFeedback(player, config) {
        // Show brief text above player
        const text = this.add.text(
            player.getX(),
            player.getY() - 60,
            `Stored: ${config.name}`,
            {
                fontSize: '20px',
                color: '#ffffff',
                fontFamily: 'Arial',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5);

        // Fade out and destroy
        this.tweens.add({
            targets: text,
            alpha: 0,
            y: text.y - 30,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => text.destroy()
        });
    }

    showCocktailActivationFeedback(player) {
        if (!player.activeBuff) return;

        // Get config from COCKTAIL_TYPES based on active buff
        let config = null;
        for (const [type, cocktailConfig] of Object.entries(this.COCKTAIL_TYPES)) {
            if (cocktailConfig.effect === player.activeBuff) {
                config = cocktailConfig;
                break;
            }
        }

        if (!config) return;

        // Show "ACTIVATED" text
        const text = this.add.text(
            player.getX(),
            player.getY() - 60,
            `ACTIVATED!\n${config.name}`,
            {
                fontSize: '24px',
                color: '#ffff00',
                fontFamily: 'Arial',
                stroke: '#000000',
                strokeThickness: 4,
                align: 'center'
            }
        ).setOrigin(0.5);

        // Pulse and fade
        this.tweens.add({
            targets: text,
            scale: 1.5,
            alpha: 0,
            y: text.y - 40,
            duration: 1200,
            ease: 'Power2',
            onComplete: () => text.destroy()
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

    updateStoredCocktailHUD() {
        // Check first player's stored cocktail (for single player)
        // For multiplayer, could show each player's stored cocktail
        const player = this.playerManager.players[0];

        if (player.storedCocktail) {
            const config = player.storedCocktail.config;
            this.storedCocktailHUDIcon.setTexture(config.sprite);
            this.storedCocktailHUDIcon.setVisible(true);
            this.storedCocktailHUDName.setText(config.name);
            this.storedCocktailHUD.setVisible(true);
        } else {
            this.storedCocktailHUD.setVisible(false);
        }
    }

    updateControlsText() {
        if (!this.playerManager || !this.player) return;

        const firstInputManager = this.playerManager.inputManagers[this.player.playerIndex];
        if (!firstInputManager) return;

        const mode = firstInputManager.getInputMode();

        if (mode === 'gamepad') {
            this.controlsText.setText(
                'Left Stick: Move | Right Trigger: Fire\n' +
                'Right Stick: Aim Influence | L1/R1: Lock Bounty | LB: Activate Cocktail'
            );
        } else {
            this.controlsText.setText(
                'WASD: Move | Mouse: Fire & Aim Influence\n' +
                'Q/E: Lock Bounty | R: Activate Cocktail'
            );
        }
    }

    handleVictory() {
        this.isGameOver = true;

        // Save high scores
        this.saveHighScores();

        // Get final scores sorted by score
        const finalScores = Object.values(this.scoreManager.playerScores)
            .sort((a, b) => b.score - a.score);

        const mvp = finalScores[0];

        // Create victory UI
        const centerX = 960;
        const centerY = 250;

        // Dim background
        const overlay = this.add.rectangle(0, 0, 1920, 1080, 0x000000, 0.8);
        overlay.setOrigin(0, 0);
        overlay.setDepth(1000);

        // VICTORY text
        const victoryText = this.add.text(centerX, centerY, 'VICTORY!', {
            fontSize: '100px',
            color: '#00ff00',
            fontFamily: 'Georgia, serif',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        victoryText.setDepth(1001);

        // Saloon saved text
        this.add.text(centerX, centerY + 100, 'The Saloon is Safe!', {
            fontSize: '36px',
            color: '#ffffff',
            fontFamily: 'Georgia, serif'
        }).setOrigin(0.5).setDepth(1001);

        // Difficulty completed text
        const difficultyColorHex = '#' + this.difficulty.color.toString(16).padStart(6, '0');
        this.add.text(centerX, centerY + 150, `Completed on ${this.difficulty.name} difficulty`, {
            fontSize: '28px',
            color: difficultyColorHex,
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(1001);

        // Final scoreboard
        let yOffset = centerY + 220;
        this.add.text(centerX, yOffset, 'FINAL SCORES', {
            fontSize: '36px',
            color: '#ffcc00',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(1001);

        yOffset += 50;
        finalScores.forEach((playerData, index) => {
            const isMVP = index === 0;
            const player = this.playerManager.players.find(p =>
                p.playerIndex === playerData.playerIndex
            );
            const isDead = player ? player.isDead : false;

            const statusText = isDead ? ' [DEAD]' : ' [ALIVE]';

            const text = this.add.text(centerX, yOffset,
                `${playerData.name}: ${playerData.score} pts${statusText}${isMVP ? ' MVP' : ''}`, {
                fontSize: isMVP ? '28px' : '24px',
                color: isMVP ? '#ffd700' : '#ffffff',
                fontFamily: 'Arial',
                fontStyle: isMVP ? 'bold' : 'normal'
            }).setOrigin(0.5);
            text.setDepth(1001);

            yOffset += 40;
        });

        // Return to lobby instruction
        this.add.text(centerX, centerY + 550, 'Press ENTER to return to lobby', {
            fontSize: '28px',
            color: '#00ff00',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(1001);

        // Listen for ENTER button
        this.input.keyboard.once('keydown-ENTER', () => {
            this.scene.start('StartScene');
        });
    }

    handleGameOver() {
        this.isGameOver = true;

        // Save high scores
        this.saveHighScores();

        // Get final scores sorted by score
        const finalScores = Object.values(this.scoreManager.playerScores)
            .sort((a, b) => b.score - a.score);

        // Find MVP (highest score)
        const mvp = finalScores[0];

        // Create game over UI
        const centerX = 960;
        const centerY = 300;

        // Dim background
        const overlay = this.add.rectangle(0, 0, 1920, 1080, 0x000000, 0.8);
        overlay.setOrigin(0, 0);
        overlay.setDepth(1000);

        // GAME OVER text
        const gameOverText = this.add.text(centerX, centerY, 'GAME OVER', {
            fontSize: '80px',
            color: '#ff0000',
            fontFamily: 'Georgia, serif',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        gameOverText.setDepth(1001);

        // Wave survived
        const waveText = this.add.text(centerX, centerY + 100,
            `Survived to Wave ${this.waveManager.currentWave}/12`, {
            fontSize: '32px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        waveText.setDepth(1001);

        // Difficulty attempted text
        const difficultyColorHex = '#' + this.difficulty.color.toString(16).padStart(6, '0');
        this.add.text(centerX, centerY + 145, `Attempted on ${this.difficulty.name} difficulty`, {
            fontSize: '24px',
            color: difficultyColorHex,
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(1001);

        // Final scoreboard
        let yOffset = centerY + 200;
        this.add.text(centerX, yOffset, 'FINAL SCORES', {
            fontSize: '36px',
            color: '#ffcc00',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(1001);

        yOffset += 50;
        finalScores.forEach((playerData, index) => {
            const isMVP = index === 0;
            const text = this.add.text(centerX, yOffset,
                `${playerData.name}: ${playerData.score} pts (${playerData.kills} kills)${isMVP ? ' MVP' : ''}`, {
                fontSize: isMVP ? '28px' : '24px',
                color: isMVP ? '#ffd700' : '#ffffff',
                fontFamily: 'Arial',
                fontStyle: isMVP ? 'bold' : 'normal'
            }).setOrigin(0.5);
            text.setDepth(1001);

            yOffset += 40;
        });

        // Return to lobby instruction
        this.add.text(centerX, centerY + 500, 'Press ENTER to return to lobby', {
            fontSize: '28px',
            color: '#00ff00',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(1001);

        // Listen for ENTER button
        this.input.keyboard.once('keydown-ENTER', () => {
            this.scene.start('StartScene');
        });
    }

    saveHighScores() {
        try {
            const existing = localStorage.getItem('giselasLastStand_highScores');
            const scores = existing ? JSON.parse(existing) : [];

            // Add all player scores from this game
            Object.values(this.scoreManager.playerScores).forEach(playerData => {
                scores.push({
                    playerName: playerData.name,
                    score: playerData.score,
                    wave: this.waveManager.currentWave,
                    difficulty: this.difficulty.id,  // Add difficulty ID
                    date: new Date().toISOString()
                });
            });

            // Sort and keep top 50
            scores.sort((a, b) => b.score - a.score);
            const topScores = scores.slice(0, 50);

            localStorage.setItem('giselasLastStand_highScores', JSON.stringify(topScores));
        } catch (error) {
            console.error('Error saving high scores:', error);
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

            // Check collision with all living players
            for (const player of this.playerManager.getLivingPlayers()) {
                const playerRadius = 20;  // Player collision radius
                const bulletSprite = bullet.getSprite();

                if (bullet.checkCollision(player.getX(), player.getY(), playerRadius)) {
                    // Hit player!
                    console.log('Player hit by bullet! Damage:', bullet.getDamage());
                    const newHealth = player.takeDamage(bullet.getDamage());
                    console.log('Player health after hit:', newHealth);

                    // Update health UI
                    this.updateHealthUI();

                    // Screen shake on hit
                    this.cameras.main.shake(150, 0.003);

                    // Check for explosion (bounty lobster bullets)
                    const explosion = bullet.explode();
                    if (explosion) {
                        // Explosion AoE - damage other players in radius
                        for (const otherPlayer of this.playerManager.getLivingPlayers()) {
                            if (otherPlayer === player) continue; // Already hit

                            const dx = otherPlayer.getX() - explosion.x;
                            const dy = otherPlayer.getY() - explosion.y;
                            const dist = Math.sqrt(dx * dx + dy * dy);

                            if (dist < explosion.radius) {
                                otherPlayer.takeDamage(explosion.damage);
                            }
                        }
                    }

                    // Check if all players are dead
                    if (this.playerManager.allPlayersDead()) {
                        this.handleGameOver();
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

import { Player } from '../entities/Player.js';
import { Bullet } from '../entities/Bullet.js';
import { Enemy } from '../entities/Enemy.js';
import { WaveManager } from '../systems/WaveManager.js';
import { ScoreManager } from '../systems/ScoreManager.js';
import { HealthPickup } from '../entities/HealthPickup.js';
import { Cocktail, COCKTAIL_TYPES } from '../entities/Cocktail.js';
import { InputManager } from '../systems/InputManager.js';
import { TargetSelector } from '../systems/TargetSelector.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // Assets will be loaded here
    }

    create() {
        console.log('GameScene created');

        // Scene setup
        this.cameras.main.setBackgroundColor('#4a3428'); // Wooden saloon floor
        this.isGameOver = false;

        // Create floor grid pattern
        this.createFloorPattern();

        // Create obstacles
        this.createObstacles();

        // Create player in center
        this.player = new Player(this, 960, 540);

        // Player name (for single player, just "Player 1")
        this.playerName = 'Player 1';

        // Setup obstacle collisions with player
        this.obstacles.forEach(obstacle => {
            this.physics.add.collider(this.player.sprite, obstacle);
        });

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

        // Setup input (WASD keys for player movement)
        this.keys = this.input.keyboard.addKeys({
            W: Phaser.Input.Keyboard.KeyCodes.W,
            A: Phaser.Input.Keyboard.KeyCodes.A,
            S: Phaser.Input.Keyboard.KeyCodes.S,
            D: Phaser.Input.Keyboard.KeyCodes.D
        });

        // Create enemy array
        this.enemies = [];

        // Create health pickups array
        this.healthPickups = [];

        // Create cocktails array
        this.cocktails = [];

        // Initialize wave manager
        this.waveManager = new WaveManager(this);

        // Initialize score manager
        this.scoreManager = new ScoreManager(this);

        // Add UI text
        this.add.text(20, 20, 'WASD: Move | Mouse: Aim & Shoot', {
            fontSize: '24px',
            color: '#ffffff',
            fontFamily: 'Arial'
        });

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

    createObstacles() {
        this.obstacles = [];

        // Create barrel obstacles (brown circles)
        const barrelPositions = [
            { x: 400, y: 300 },
            { x: 1520, y: 300 },
            { x: 400, y: 780 },
            { x: 1520, y: 780 },
            { x: 960, y: 200 },
            { x: 960, y: 880 }
        ];

        barrelPositions.forEach(pos => {
            const barrel = this.add.circle(pos.x, pos.y, 40, 0x654321);
            barrel.setStrokeStyle(4, 0x4a3428);
            this.physics.add.existing(barrel, true); // true = static body
            this.obstacles.push(barrel);
        });

        console.log('Created', this.obstacles.length, 'obstacles');
    }

    update(time, delta) {
        if (this.isGameOver) return;

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
            this.player.update(this.keys);

            // Handle shooting with auto-aim
            if (this.inputManager.isFiringPressed()) {
                const target = this.targetSelector.getCurrentTarget();
                this.player.shoot(target, time);
            }
        }

        // Update enemies
        this.enemies = this.enemies.filter(enemy => {
            if (enemy.isAlive() && this.player) {
                enemy.update(time, this.player.getX(), this.player.getY());

                // Check obstacle collisions for enemy
                this.obstacles.forEach(obstacle => {
                    const dx = enemy.getSprite().x - obstacle.x;
                    const dy = enemy.getSprite().y - obstacle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 55) { // 15 (enemy) + 40 (obstacle)
                        // Push enemy away from obstacle
                        const pushAngle = Math.atan2(dy, dx);
                        enemy.getSprite().x = obstacle.x + Math.cos(pushAngle) * 55;
                        enemy.getSprite().y = obstacle.y + Math.sin(pushAngle) * 55;
                    }
                });

                return true;
            } else if (!enemy.isAlive()) {
                // Check if this was a bounty enemy
                if (enemy.isBountyEnemy()) {
                    const bountyValue = enemy.getBountyValue();
                    const bountyName = enemy.getBountyName();
                    this.scoreManager.addBountyKill(bountyValue);
                    this.showBountyKillFeedback(bountyName, bountyValue);
                } else {
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
                    console.log('Player healed for', healed);
                    return false;
                }
            }

            return true;
        });

        // Check cocktail collisions
        this.cocktails = this.cocktails.filter(cocktail => {
            if (!cocktail.isAlive()) return false;

            if (this.player && !this.player.isDead()) {
                const dx = this.player.getX() - cocktail.getSprite().x;
                const dy = this.player.getY() - cocktail.getSprite().y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Collision if distance less than combined radii
                if (distance < 35) { // 20 (player) + 15 (cocktail)
                    const config = cocktail.getConfig();
                    this.player.applyBuff(config);
                    cocktail.collect();
                    this.showCocktailFeedback(config);
                    this.updateBuffUI();

                    console.log('Player collected:', config.name);
                    return false;
                }
            }

            return true;
        });

        // Update buff UI
        this.updateBuffUI();

        // Debug: visualize current target
        if (this.targetSelector.getCurrentTarget()) {
            const target = this.targetSelector.getCurrentTarget();
            if (!this.debugTargetCircle) {
                this.debugTargetCircle = this.add.circle(0, 0, 30);
                this.debugTargetCircle.setStrokeStyle(3, 0x00ff00);
                this.debugTargetCircle.setFillStyle(0x00ff00, 0);
            }
            this.debugTargetCircle.setPosition(
                target.getSprite().x,
                target.getSprite().y
            );
            this.debugTargetCircle.setVisible(true);
        } else if (this.debugTargetCircle) {
            this.debugTargetCircle.setVisible(false);
        }
    }

    checkBulletCollisions() {
        if (!this.player) return;

        const bullets = this.player.bullets;

        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];
            if (!bullet.isAlive()) continue;

            let hitEnemy = false;

            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                if (!enemy.isAlive()) continue;

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

                    console.log('Bullet hit enemy!');

                    // Only destroy bullet if not piercing
                    if (!bullet.isPiercing()) {
                        bullet.destroy();
                        break;
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

    handleVictory() {
        console.log('Victory!');
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
        console.log('Game Over!');
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
}

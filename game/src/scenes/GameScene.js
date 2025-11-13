import { Player } from '../entities/Player.js';
import { Bullet } from '../entities/Bullet.js';
import { Enemy } from '../entities/Enemy.js';
import { WaveManager } from '../systems/WaveManager.js';
import { ScoreManager } from '../systems/ScoreManager.js';

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

        // Setup obstacle collisions with player
        this.obstacles.forEach(obstacle => {
            this.physics.add.collider(this.player.sprite, obstacle);
        });

        // Make classes available globally in scene
        this.Bullet = Bullet;
        this.Enemy = Enemy;

        // Setup input
        this.keys = this.input.keyboard.addKeys({
            W: Phaser.Input.Keyboard.KeyCodes.W,
            A: Phaser.Input.Keyboard.KeyCodes.A,
            S: Phaser.Input.Keyboard.KeyCodes.S,
            D: Phaser.Input.Keyboard.KeyCodes.D
        });

        // Setup mouse input
        this.input.on('pointerdown', () => {
            this.isShooting = true;
        });

        this.input.on('pointerup', () => {
            this.isShooting = false;
        });

        this.isShooting = false;

        // Create enemy array
        this.enemies = [];

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

        // Update player with input
        if (this.player) {
            this.player.update(this.keys);

            // Handle shooting
            if (this.isShooting) {
                const pointer = this.input.activePointer;
                this.player.shoot(pointer.worldX, pointer.worldY, time);
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
                enemy.destroy();
                this.waveManager.enemyKilled();
                this.scoreManager.addEnemyKill();
                this.updateWaveUI();
                this.updateScoreUI();
                return false;
            }
            return true;
        });

        // Check collisions
        this.checkBulletCollisions();
        this.checkPlayerCollisions(time);
    }

    checkBulletCollisions() {
        if (!this.player) return;

        const bullets = this.player.bullets;

        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];
            if (!bullet.isAlive()) continue;

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
                    bullet.destroy();

                    // Screen shake on hit
                    this.cameras.main.shake(100, 0.002);

                    // Flash enemy white
                    enemy.getSprite().setFillStyle(0xffffff);
                    this.time.delayedCall(100, () => {
                        if (enemy.isAlive()) {
                            enemy.getSprite().setFillStyle(0xff6600);
                        }
                    });

                    console.log('Bullet hit enemy!');
                    break;
                }
            }
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
    }

    handleVictory() {
        console.log('Victory!');
        this.isGameOver = true;

        // Display victory text
        this.add.text(960, 540, 'VICTORY!', {
            fontSize: '96px',
            color: '#00ff00',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Display final score
        this.add.text(960, 640, `Final Score: ${this.scoreManager.getScore()}`, {
            fontSize: '36px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        this.add.text(960, 700, 'Refresh to restart', {
            fontSize: '24px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
    }

    handleGameOver() {
        console.log('Game Over!');
        this.isGameOver = true;

        // Display game over text
        this.add.text(960, 540, 'GAME OVER', {
            fontSize: '96px',
            color: '#ff0000',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Display final score
        this.add.text(960, 640, `Final Score: ${this.scoreManager.getScore()}`, {
            fontSize: '36px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        this.add.text(960, 700, 'Refresh to restart', {
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

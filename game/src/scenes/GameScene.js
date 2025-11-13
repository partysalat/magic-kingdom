import { Player } from '../entities/Player.js';
import { Bullet } from '../entities/Bullet.js';
import { Enemy } from '../entities/Enemy.js';
import { WaveManager } from '../systems/WaveManager.js';

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
        this.cameras.main.setBackgroundColor('#4a3428');
        this.isGameOver = false;

        // Create player in center
        this.player = new Player(this, 960, 540);

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

        // Start first wave after brief delay
        this.time.delayedCall(1000, () => {
            this.waveManager.startNextWave();
            this.updateWaveUI();
        });
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
                return true;
            } else if (!enemy.isAlive()) {
                enemy.destroy();
                this.waveManager.enemyKilled();
                this.updateWaveUI();
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
        this.waveText.setText(`Wave: ${current}/${max}`);
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

        this.add.text(960, 640, 'All waves completed!', {
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

        this.add.text(960, 640, 'Refresh to restart', {
            fontSize: '36px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Destroy player visually
        if (this.player) {
            this.player.destroy();
        }
    }
}

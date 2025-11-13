import { Player } from '../entities/Player.js';
import { Bullet } from '../entities/Bullet.js';
import { Enemy } from '../entities/Enemy.js';

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

        // Make Bullet class available to player
        this.Bullet = Bullet;

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

        // Spawn a test enemy
        const testEnemy = new Enemy(this, 1400, 300, 'lobster');
        this.enemies.push(testEnemy);

        // Add UI text
        this.add.text(20, 20, 'WASD: Move | Mouse: Aim & Shoot', {
            fontSize: '24px',
            color: '#ffffff',
            fontFamily: 'Arial'
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
                return false;
            }
            return true;
        });

        // Check bullet-enemy collisions
        this.checkBulletCollisions();
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
}

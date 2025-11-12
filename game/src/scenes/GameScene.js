import { Player } from '../entities/Player.js';

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

        // Add UI text
        this.add.text(20, 20, 'WASD: Move | Mouse: Aim & Shoot', {
            fontSize: '24px',
            color: '#ffffff',
            fontFamily: 'Arial'
        });
    }

    update(time, delta) {
        if (this.isGameOver) return;

        // Update player
        if (this.player) {
            this.player.update();
        }
    }
}

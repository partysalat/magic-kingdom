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
        this.cameras.main.setBackgroundColor('#4a3428'); // Wooden saloon floor color

        // Initialize scene properties
        this.isGameOver = false;

        // Add temporary text to confirm scene loaded
        this.add.text(960, 540, 'Gisela\'s Last Stand - Phase 1', {
            fontSize: '48px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
    }

    update(time, delta) {
        // Game loop will go here
    }
}

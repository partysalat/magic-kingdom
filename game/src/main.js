import { gameConfig } from './config.js';

class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Placeholder for assets
        this.load.on('complete', () => {
            console.log('Boot complete');
        });
    }

    create() {
        console.log('BootScene created');
        // Will transition to GameScene in next task
    }
}

const config = {
    ...gameConfig,
    scene: [BootScene]
};

const game = new Phaser.Game(config);

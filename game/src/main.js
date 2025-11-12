import { gameConfig } from './config.js';
import { GameScene } from './scenes/GameScene.js';

class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        this.load.on('complete', () => {
            console.log('Boot complete');
        });
    }

    create() {
        console.log('BootScene created - transitioning to GameScene');
        this.scene.start('GameScene');
    }
}

const config = {
    ...gameConfig,
    scene: [BootScene, GameScene]
};

const game = new Phaser.Game(config);

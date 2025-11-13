import { gameConfig } from './config.js';
import { PreloadScene } from './scenes/PreloadScene.js';
import { GameScene } from './scenes/GameScene.js';

const config = {
    ...gameConfig,
    scene: [PreloadScene, GameScene]
};

const game = new Phaser.Game(config);

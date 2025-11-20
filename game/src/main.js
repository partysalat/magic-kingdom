import { gameConfig } from './config.js';
import { PreloadScene } from './scenes/PreloadScene.js';
import { StartScene } from './scenes/StartScene.js';
import { DifficultySelectScene } from './scenes/DifficultySelectScene.js';
import { GameScene } from './scenes/GameScene.js';

const config = {
    ...gameConfig,
    scene: [PreloadScene, StartScene, DifficultySelectScene, GameScene]
};

const game = new Phaser.Game(config);

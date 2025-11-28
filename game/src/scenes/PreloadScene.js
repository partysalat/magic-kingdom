export class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        // Add loading bar (optional but nice)
        this.createLoadingBar();

        // === PLAYER SPRITES ===

        // Load directional sprites for Red Gisela (8 directions)
        this.load.image('gisela-red-down', 'assets/sprites/player/gisela-red-down.png');
        this.load.image('gisela-red-up', 'assets/sprites/player/gisela-red-up.png');
        this.load.image('gisela-red-left', 'assets/sprites/player/gisela-red-left.png');
        this.load.image('gisela-red-right', 'assets/sprites/player/gisela-red-right.png');
        this.load.image('gisela-red-down-left', 'assets/sprites/player/gisela-red-down-left.png');
        this.load.image('gisela-red-down-right', 'assets/sprites/player/gisela-red-down-right.png');
        this.load.image('gisela-red-up-left', 'assets/sprites/player/gisela-red-up-left.png');
        this.load.image('gisela-red-up-right', 'assets/sprites/player/gisela-red-up-right.png');

        // Fallback: old idle sprites for other colors
        this.load.spritesheet('gisela-blue', 'assets/sprites/player/gisela-blue-idle.png', {
            frameWidth: 96,
            frameHeight: 96
        });

        this.load.spritesheet('gisela-green', 'assets/sprites/player/gisela-green-idle.png', {
            frameWidth: 96,
            frameHeight: 96
        });

        this.load.spritesheet('gisela-yellow', 'assets/sprites/player/gisela-yellow-idle.png', {
            frameWidth: 96,
            frameHeight: 96
        });

        // === ENEMY SPRITES ===

        // Load 8-directional sprites for Bandit Lobster
        this.load.image('bandit-lobster-down', 'assets/sprites/enemies/bandit-lobster/bandit-lobster-down.png');
        this.load.image('bandit-lobster-up', 'assets/sprites/enemies/bandit-lobster/bandit-lobster-top.png');
        this.load.image('bandit-lobster-left', 'assets/sprites/enemies/bandit-lobster/bandit-lobster-left.png');
        this.load.image('bandit-lobster-right', 'assets/sprites/enemies/bandit-lobster/bandit-lobster-right.png');
        this.load.image('bandit-lobster-down-left', 'assets/sprites/enemies/bandit-lobster/bandit-lobster-down-left.png');
        this.load.image('bandit-lobster-down-right', 'assets/sprites/enemies/bandit-lobster/bandit-lobster-down-right.png');
        this.load.image('bandit-lobster-up-left', 'assets/sprites/enemies/bandit-lobster/bandit-lobster-top-left.png');
        this.load.image('bandit-lobster-up-right', 'assets/sprites/enemies/bandit-lobster/bandit-lobster-top-right.png');

        // Load 8-directional sprites for Hermit Tank
        this.load.image('hermit-tank-down', 'assets/sprites/enemies/hermit-tank/hermit-tank-down.png');
        this.load.image('hermit-tank-up', 'assets/sprites/enemies/hermit-tank/hermit-tank-up.png');
        this.load.image('hermit-tank-left', 'assets/sprites/enemies/hermit-tank/hermit-tank-left.png');
        this.load.image('hermit-tank-right', 'assets/sprites/enemies/hermit-tank/hermit-tank-right.png');
        this.load.image('hermit-tank-down-left', 'assets/sprites/enemies/hermit-tank/hermit-tank-bottom-left.png');
        this.load.image('hermit-tank-down-right', 'assets/sprites/enemies/hermit-tank/hermit-tank-bottom-right.png');
        this.load.image('hermit-tank-up-left', 'assets/sprites/enemies/hermit-tank/hermit-tank-top-left.png');
        this.load.image('hermit-tank-up-right', 'assets/sprites/enemies/hermit-tank/hermit-tank-top-right.png');

        // Load 8-directional sprites for Shrimp
        this.load.image('shrimp-down', 'assets/sprites/enemies/shrimp/shrimp-down.png');
        this.load.image('shrimp-up', 'assets/sprites/enemies/shrimp/shrimp-top.png');
        this.load.image('shrimp-left', 'assets/sprites/enemies/shrimp/shrimp-left.png');
        this.load.image('shrimp-right', 'assets/sprites/enemies/shrimp/shrimp-right.png');
        this.load.image('shrimp-down-left', 'assets/sprites/enemies/shrimp/shrimp-down-left.png');
        this.load.image('shrimp-down-right', 'assets/sprites/enemies/shrimp/shrimp-down-right.png');
        this.load.image('shrimp-up-left', 'assets/sprites/enemies/shrimp/shrimp-top-left.png');
        this.load.image('shrimp-up-right', 'assets/sprites/enemies/shrimp/shrimp-top-right.png');

        this.load.spritesheet('lobster-bandit', 'assets/sprites/enemies/lobster-bandit-idle.png', {
            frameWidth: 64,
            frameHeight: 48
        });

        // this.load.spritesheet('shrimp-quickdraw', 'assets/sprites/enemies/shrimp-quickdraw-idle.png', {
        //     frameWidth: 32,
        //     frameHeight: 32
        // });

        // this.load.spritesheet('hermit-tank', 'assets/sprites/enemies/hermit-tank-idle.png', {
        //     frameWidth: 56,
        //     frameHeight: 56
        // });

        // this.load.spritesheet('jellyfish-ghost', 'assets/sprites/enemies/jellyfish-ghost-float.png', {
        //     frameWidth: 48,
        //     frameHeight: 64
        // });

        // this.load.spritesheet('flyingfish', 'assets/sprites/enemies/flyingfish-fly.png', {
        //     frameWidth: 48,
        //     frameHeight: 32
        // });

        // === PROJECTILES ===

        this.load.image('bullet', 'assets/sprites/projectiles/bullet.png');

        // === POWERUPS (COCKTAILS) ===

        this.load.image('cocktail-margarita', 'assets/sprites/powerups/cocktail-margarita.png');
        this.load.image('cocktail-mojito', 'assets/sprites/powerups/cocktail-mojito.png');
        this.load.image('cocktail-oldfashioned', 'assets/sprites/powerups/cocktail-oldfashioned.png');
        this.load.image('cocktail-tequilasunrise', 'assets/sprites/powerups/cocktail-tequilasunrise.png');
        this.load.image('cocktail-whiskeysour', 'assets/sprites/powerups/cocktail-whiskeysour.png');
        this.load.image('cocktail-manhattan', 'assets/sprites/powerups/cocktail-manhattan.png');

        // === ENVIRONMENT ===

        this.load.image('environment', 'assets/sprites/environment/environment.png');
        // this.load.image('barrel', 'assets/sprites/environment/barrel.png');
        // this.load.image('saloon-doors', 'assets/sprites/environment/saloon-doors.png');

        // === UI ===

        // this.load.image('bounty-poster', 'assets/ui/bounty-poster.png');
    }

    create() {
        console.log('Assets loaded, creating animations...');

        // === CREATE ANIMATIONS ===

        // Player animations (skip red as it uses directional sprites now)
        // this.createPlayerAnimation('gisela-red'); // Red uses directional images
        this.createPlayerAnimation('gisela-blue');
        this.createPlayerAnimation('gisela-green');
        this.createPlayerAnimation('gisela-yellow');

        // Enemy animations
        this.createEnemyIdleAnimation('lobster-bandit', 2); // 2 frames

        console.log('Starting game...');
        this.scene.start('StartScene');
    }

    createLoadingBar() {
        const width = 400;
        const height = 30;
        const x = (this.cameras.main.width / 2) - (width / 2);
        const y = (this.cameras.main.height / 2) - (height / 2);

        // Background
        const bg = this.add.graphics();
        bg.fillStyle(0x222222, 0.8);
        bg.fillRect(x, y, width, height);

        // Progress bar
        const progressBar = this.add.graphics();

        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(x, y, width * value, height);
        });

        // Loading text
        this.add.text(this.cameras.main.width / 2, y - 30, 'Loading Gisela\'s Last Stand...', {
            fontSize: '24px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
    }

    createPlayerAnimation(spriteKey) {
        // Idle animation (assuming 3 frames)
        this.anims.create({
            key: `${spriteKey}-idle`,
            frames: this.anims.generateFrameNumbers(spriteKey, { start: 0, end: 2 }),
            frameRate: 10,
            repeat: -1
        });

        // Walk animation (if you add walk sprites, uncomment this)
        // this.anims.create({
        //     key: `${spriteKey}-walk`,
        //     frames: this.anims.generateFrameNumbers(`${spriteKey}-walk`, { start: 0, end: 3 }),
        //     frameRate: 12,
        //     repeat: -1
        // });
    }

    createEnemyIdleAnimation(spriteKey, frameCount) {
        const endFrame = frameCount - 1;
        this.anims.create({
            key: `${spriteKey}-idle`,
            frames: this.anims.generateFrameNumbers(spriteKey, { start: 0, end: endFrame }),
            frameRate: 6,
            repeat: -1
        });
    }
}

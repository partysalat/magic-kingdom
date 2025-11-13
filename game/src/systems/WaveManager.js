const BOUNTY_NAMES = [
    { name: 'Big Claw McGraw', type: 'lobster' },
    { name: 'Shelly the Shellfish', type: 'hermit' },
    { name: 'Reef Reaper', type: 'jellyfish' },
    { name: 'Pistol Shrimp Pete', type: 'shrimp' }
];

export class WaveManager {
    constructor(scene) {
        this.scene = scene;
        this.currentWave = 0;
        this.maxWaves = 10;
        this.isSpawning = false;
        this.waveActive = false;
        this.enemiesInWave = 0;
        this.enemiesRemaining = 0;

        console.log('WaveManager initialized');
    }

    getWaveComposition(waveNumber) {
        // Returns array of enemy types to spawn
        // Early waves: mostly lobsters
        // Mid waves: introduce variety
        // Late waves: all enemy types

        const compositions = {
            1: [
                { type: 'lobster', count: 5 }
            ],
            2: [
                { type: 'lobster', count: 7 }
            ],
            3: [
                { type: 'lobster', count: 8 },
                { type: 'shrimp', count: 2 }
            ],
            4: [
                { type: 'lobster', count: 6 },
                { type: 'shrimp', count: 4 }
            ],
            5: [
                { type: 'lobster', count: 5 },
                { type: 'shrimp', count: 3 },
                { type: 'hermit', count: 2 }
            ],
            6: [
                { type: 'lobster', count: 6 },
                { type: 'shrimp', count: 4 },
                { type: 'hermit', count: 2 },
                { type: 'jellyfish', count: 1 }
            ],
            7: [
                { type: 'lobster', count: 5 },
                { type: 'shrimp', count: 5 },
                { type: 'hermit', count: 3 },
                { type: 'jellyfish', count: 2 }
            ],
            8: [
                { type: 'lobster', count: 6 },
                { type: 'shrimp', count: 6 },
                { type: 'hermit', count: 3 },
                { type: 'jellyfish', count: 2 },
                { type: 'flyingfish', count: 3 }
            ],
            9: [
                { type: 'lobster', count: 7 },
                { type: 'shrimp', count: 7 },
                { type: 'hermit', count: 4 },
                { type: 'jellyfish', count: 3 },
                { type: 'flyingfish', count: 4 }
            ],
            10: [
                { type: 'lobster', count: 8 },
                { type: 'shrimp', count: 8 },
                { type: 'hermit', count: 5 },
                { type: 'jellyfish', count: 4 },
                { type: 'flyingfish', count: 5 }
            ]
        };

        return compositions[waveNumber] || compositions[10];
    }

    startNextWave() {
        if (this.currentWave >= this.maxWaves) {
            console.log('All waves completed - Victory!');
            this.scene.handleVictory();
            return;
        }

        this.currentWave++;
        this.waveActive = true;
        this.isSpawning = true;

        console.log('Starting wave', this.currentWave);

        // Get composition for this wave
        const composition = this.getWaveComposition(this.currentWave);

        // Calculate total enemies
        const totalEnemies = composition.reduce((sum, group) => sum + group.count, 0);

        this.enemiesInWave = totalEnemies;
        this.enemiesRemaining = totalEnemies;

        // Spawn enemies by composition
        this.spawnEnemiesByComposition(composition);

        this.isSpawning = false;
    }

    shouldSpawnBounty(waveNumber) {
        // 30% chance to spawn a bounty enemy per wave
        return Math.random() < 0.3;
    }

    getBountyValue(waveNumber) {
        // Scale bounty value with wave number
        return 100 + (waveNumber * 50);
    }

    selectBountyEnemy(composition) {
        // Select a random enemy type from the wave composition
        const types = composition.map(group => group.type);
        const randomType = types[Math.floor(Math.random() * types.length)];

        // Find matching bounty name
        const bountyOptions = BOUNTY_NAMES.filter(b => b.type === randomType);
        if (bountyOptions.length > 0) {
            return bountyOptions[Math.floor(Math.random() * bountyOptions.length)];
        }

        // Fallback to first bounty
        return BOUNTY_NAMES[0];
    }

    spawnEnemiesByComposition(composition) {
        const totalCount = composition.reduce((sum, group) => sum + group.count, 0);
        const spawnPoints = this.getSpawnPoints(totalCount);

        let spawnIndex = 0;
        let bountySpawned = false;

        // Determine if we should spawn a bounty
        const spawnBounty = this.shouldSpawnBounty(this.currentWave);
        const bountyInfo = spawnBounty ? this.selectBountyEnemy(composition) : null;
        const bountyValue = spawnBounty ? this.getBountyValue(this.currentWave) : 0;

        // Random index for bounty spawn
        const bountyIndex = spawnBounty ? Math.floor(Math.random() * totalCount) : -1;

        // Spawn each enemy group
        composition.forEach(group => {
            for (let i = 0; i < group.count; i++) {
                const point = spawnPoints[spawnIndex];

                // Check if this should be the bounty enemy
                const isBounty = spawnBounty && !bountySpawned &&
                               spawnIndex === bountyIndex &&
                               group.type === bountyInfo.type;

                const enemy = new this.scene.Enemy(
                    this.scene,
                    point.x,
                    point.y,
                    group.type,
                    isBounty,
                    isBounty ? bountyValue : 0
                );

                if (isBounty) {
                    enemy.setBountyName(bountyInfo.name);
                    bountySpawned = true;

                    // Announce bounty
                    this.announceBounty(bountyInfo.name, bountyValue);
                }

                this.scene.enemies.push(enemy);
                spawnIndex++;
            }
        });

        console.log('Spawned', totalCount, 'enemies', bountySpawned ? '(including bounty)' : '');
    }

    announceBounty(name, value) {
        console.log(`WANTED: ${name} - ${value} Points!`);

        // Create announcement banner
        const banner = this.scene.add.rectangle(960, 150, 800, 100, 0x000000, 0.8);
        banner.setStrokeStyle(4, 0xffff00);

        const wantedText = this.scene.add.text(960, 130, 'WANTED', {
            fontSize: '32px',
            color: '#ff0000',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const nameText = this.scene.add.text(960, 165, name, {
            fontSize: '36px',
            color: '#ffff00',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        const valueText = this.scene.add.text(960, 200, `${value} POINTS!`, {
            fontSize: '24px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Screen flash
        this.scene.cameras.main.flash(300, 255, 255, 0);

        // Fade out after 3 seconds
        this.scene.time.delayedCall(3000, () => {
            this.scene.tweens.add({
                targets: [banner, wantedText, nameText, valueText],
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    banner.destroy();
                    wantedText.destroy();
                    nameText.destroy();
                    valueText.destroy();
                }
            });
        });
    }

    getSpawnPoints(count) {
        // Spawn enemies around screen edges
        const points = [];
        const margin = 100;
        const width = 1920;
        const height = 1080;

        for (let i = 0; i < count; i++) {
            const side = i % 4; // 0=top, 1=right, 2=bottom, 3=left

            let x, y;
            switch(side) {
                case 0: // top
                    x = margin + Math.random() * (width - margin * 2);
                    y = margin;
                    break;
                case 1: // right
                    x = width - margin;
                    y = margin + Math.random() * (height - margin * 2);
                    break;
                case 2: // bottom
                    x = margin + Math.random() * (width - margin * 2);
                    y = height - margin;
                    break;
                case 3: // left
                    x = margin;
                    y = margin + Math.random() * (height - margin * 2);
                    break;
            }

            points.push({ x, y });
        }

        return points;
    }

    spawnHealthPickup() {
        // Spawn health pickup at random location
        const x = 200 + Math.random() * 1520;
        const y = 200 + Math.random() * 680;

        const pickup = new this.scene.HealthPickup(this.scene, x, y);
        if (!this.scene.healthPickups) {
            this.scene.healthPickups = [];
        }
        this.scene.healthPickups.push(pickup);

        console.log('Health pickup spawned');
    }

    spawnCocktails() {
        console.log('Spawning cocktails...');

        // Get 3 random cocktail types
        const types = Object.keys(this.scene.COCKTAIL_TYPES);
        const selectedTypes = [];

        while (selectedTypes.length < 3 && selectedTypes.length < types.length) {
            const randomType = types[Math.floor(Math.random() * types.length)];
            if (!selectedTypes.includes(randomType)) {
                selectedTypes.push(randomType);
            }
        }

        // Spawn at different locations
        const positions = [
            { x: 400, y: 540 },
            { x: 960, y: 540 },
            { x: 1520, y: 540 }
        ];

        selectedTypes.forEach((type, index) => {
            const pos = positions[index];
            const cocktail = new this.scene.Cocktail(this.scene, pos.x, pos.y, type);
            this.scene.cocktails.push(cocktail);
        });

        console.log('Spawned', selectedTypes.length, 'cocktails');
    }

    enemyKilled() {
        this.enemiesRemaining--;
        console.log('Enemies remaining:', this.enemiesRemaining);

        if (this.enemiesRemaining <= 0 && this.waveActive) {
            this.waveComplete();
        }
    }

    waveComplete() {
        console.log('Wave', this.currentWave, 'complete!');
        this.waveActive = false;

        // Award survival bonus
        if (this.scene.scoreManager) {
            this.scene.scoreManager.addWaveSurvivalBonus();
            this.scene.updateScoreUI();
        }

        // Spawn health pickup every 2 waves
        if (this.currentWave % 2 === 0) {
            this.spawnHealthPickup();
        }

        // Spawn cocktails between waves
        this.spawnCocktails();

        // Show "Get Ready" message
        const readyText = this.scene.add.text(960, 300, 'GRAB A COCKTAIL!', {
            fontSize: '48px',
            color: '#ffff00',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Countdown timer
        let countdown = 10;
        const countdownText = this.scene.add.text(960, 360, `${countdown}`, {
            fontSize: '36px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        const countdownTimer = this.scene.time.addEvent({
            delay: 1000,
            repeat: 9,
            callback: () => {
                countdown--;
                countdownText.setText(`${countdown}`);
            }
        });

        // Start next wave after 10 second delay
        this.scene.time.delayedCall(10000, () => {
            readyText.destroy();
            countdownText.destroy();

            // Clean up any uncollected cocktails
            this.scene.cocktails.forEach(cocktail => {
                if (cocktail.isAlive()) {
                    cocktail.destroy();
                }
            });
            this.scene.cocktails = [];

            this.startNextWave();
            if (this.scene.updateWaveUI) {
                this.scene.updateWaveUI();
            }
        });
    }

    getCurrentWave() {
        return this.currentWave;
    }

    getMaxWaves() {
        return this.maxWaves;
    }

    isActive() {
        return this.waveActive;
    }
}

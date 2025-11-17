import { SpawnPointManager } from './SpawnPointManager.js';
import { BossAnnouncer } from './BossAnnouncer.js';
import { BossHealthBar } from '../ui/BossHealthBar.js';

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

        // Initialize spawn point manager
        this.spawnPointManager = new SpawnPointManager(scene);

        // Initialize boss announcer
        this.bossAnnouncer = new BossAnnouncer(scene);

        console.log('WaveManager initialized');
    }

    getWaveComposition(waveNumber) {
        const compositions = {
            1: [{ type: 'lobster', count: 5 }],
            2: [{ type: 'lobster', count: 7 }],

            // BOSS WAVE 3: Iron Shell
            3: [{ type: 'boss_iron_shell', count: 1, isBoss: true }],

            // Start formations from wave 4
            4: [
                { type: 'lobster', count: 3, role: 'tank' },
                { type: 'shrimp', count: 4, role: 'shooter' }
            ],
            5: [
                { type: 'lobster', count: 3, role: 'tank' },
                { type: 'shrimp', count: 3, role: 'shooter' },
                { type: 'hermit', count: 2 }
            ],

            // BOSS WAVE 6: Kraken's Arm
            6: [{ type: 'boss_kraken_arm', count: 1, isBoss: true }],

            7: [
                { type: 'lobster', count: 3, role: 'tank' },
                { type: 'hermit', count: 2, role: 'tank' },
                { type: 'shrimp', count: 5, role: 'shooter' },
                { type: 'jellyfish', count: 2, role: 'shooter' }
            ],
            8: [
                { type: 'lobster', count: 4, role: 'tank' },
                { type: 'hermit', count: 2, role: 'tank' },
                { type: 'shrimp', count: 6, role: 'shooter' },
                { type: 'jellyfish', count: 2, role: 'shooter' },
                { type: 'flyingfish', count: 3 }
            ],

            // BOSS WAVE 9: The Leviathan
            9: [{ type: 'boss_leviathan', count: 1, isBoss: true }],

            10: [
                { type: 'lobster', count: 5, role: 'tank' },
                { type: 'hermit', count: 3, role: 'tank' },
                { type: 'shrimp', count: 8, role: 'shooter' },
                { type: 'jellyfish', count: 4, role: 'shooter' },
                { type: 'flyingfish', count: 5 }
            ]
        };

        return compositions[waveNumber] || compositions[10];
    }

    /**
     * Check if wave is a boss wave
     */
    isBossWave(waveNumber) {
        return waveNumber === 3 || waveNumber === 6 || waveNumber === 9;
    }

    /**
     * Get boss announcement details
     */
    getBossDetails(bossType) {
        const details = {
            boss_iron_shell: {
                name: 'Iron Shell',
                subtitle: 'The Armored Terror',
                color: 0x4a4a4a
            },
            boss_kraken_arm: {
                name: "The Kraken's Arm",
                subtitle: 'Terror from the Deep',
                color: 0x9966cc
            },
            boss_leviathan: {
                name: 'The Leviathan',
                subtitle: 'The Unstoppable Force',
                color: 0xff4500
            }
        };

        return details[bossType] || { name: 'Unknown Boss', subtitle: '', color: 0xff0000 };
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

        // Spawn cover for this wave
        if (this.scene.coverManager) {
            this.scene.coverManager.spawnCoverForWave();
        }

        // Check if this is a boss wave
        if (this.isBossWave(this.currentWave)) {
            const bossType = composition[0].type;
            const bossDetails = this.getBossDetails(bossType);

            // Announce boss
            this.bossAnnouncer.announceBoss(
                bossDetails.name,
                bossDetails.subtitle,
                bossDetails.color
            );

            // Delay spawn until after announcement
            this.scene.time.delayedCall(4000, () => {
                this.spawnEnemiesByComposition(composition);
            });
        } else {
            // Normal wave - spawn immediately
            this.spawnEnemiesByComposition(composition);
        }

        // Calculate total enemies
        const totalEnemies = composition.reduce((sum, group) => sum + group.count, 0);

        this.enemiesInWave = totalEnemies;
        this.enemiesRemaining = totalEnemies;

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

        // Determine if we should spawn a bounty
        const spawnBounty = this.shouldSpawnBounty(this.currentWave);
        const bountyInfo = spawnBounty ? this.selectBountyEnemy(composition) : null;
        const bountyValue = spawnBounty ? this.getBountyValue(this.currentWave) : 0;

        // Random index for bounty spawn
        const bountyIndex = spawnBounty ? Math.floor(Math.random() * totalCount) : -1;

        // Get spawn points (bountyIndex determines where bounty spawns)
        const spawnPoints = this.getSpawnPoints(totalCount, bountyIndex);

        let spawnIndex = 0;
        let bountySpawned = false;

        // Spawn each enemy group
        composition.forEach(group => {
            for (let i = 0; i < group.count; i++) {
                const spawnData = spawnPoints[spawnIndex];

                // Check if this should be the bounty enemy
                const isBounty = spawnBounty && !bountySpawned &&
                               spawnIndex === bountyIndex &&
                               group.type === bountyInfo.type;

                const enemy = new this.scene.Enemy(
                    this.scene,
                    spawnData.x,
                    spawnData.y,
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

                // Create boss health bar if this is a boss
                if (group.isBoss && enemy.config && enemy.config.isBoss && !this.scene.bossHealthBar) {
                    this.scene.bossHealthBar = new BossHealthBar(this.scene, enemy.config.name);
                    this.scene.bossHealthBar.show();
                }

                // Queue spawn animation
                if (enemy.setCollisionEnabled && enemy.setAlpha) {
                    enemy.setCollisionEnabled(false);  // Disable collision during spawn animation
                    enemy.setAlpha(0);                 // Start invisible

                    this.spawnPointManager.queueSpawn(
                        enemy,
                        spawnData.spawnPoint,
                        spawnData.isBounty
                    );
                }

                this.scene.enemies.push(enemy);
                spawnIndex++;
            }
        });

        console.log('Spawned', totalCount, 'enemies', bountySpawned ? '(including bounty)' : '');

        // After all enemies are spawned, assign formations
        this.assignFormations(composition);
    }

    assignFormations(composition) {
        // Get all tanks and shooters from this wave
        const tanks = [];
        const shooters = [];

        this.scene.enemies.forEach(enemy => {
            const enemyType = enemy.type;

            // Find this enemy's group in composition
            for (let group of composition) {
                if (group.type === enemyType && group.role) {
                    if (group.role === 'tank') {
                        enemy.assignRole('tank', null);
                        tanks.push(enemy);
                    } else if (group.role === 'shooter') {
                        enemy.assignRole('shooter', null);
                        shooters.push(enemy);
                    }
                    break;
                }
            }
        });

        // Link shooters to tanks
        if (tanks.length > 0 && shooters.length > 0) {
            const shootersPerTank = Math.ceil(shooters.length / tanks.length);

            let shooterIndex = 0;
            tanks.forEach(tank => {
                const tankShooters = [];
                for (let i = 0; i < shootersPerTank && shooterIndex < shooters.length; i++) {
                    tankShooters.push(shooters[shooterIndex]);
                    shooterIndex++;
                }

                if (tankShooters.length > 0) {
                    tank.linkFormation(tank, tankShooters);
                }
            });

            console.log(`Formations assigned: ${tanks.length} tanks protecting ${shooters.length} shooters`);
        }
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

    getSpawnPoints(count, bountyIndex = -1) {
        // Use thematic spawn point system (door + windows)
        const spawnPoints = [];

        for (let i = 0; i < count; i++) {
            let spawnPoint;

            // Bounty enemies always spawn at main door
            if (i === bountyIndex) {
                spawnPoint = this.spawnPointManager.getMainDoorSpawnPoint();
            } else {
                // Regular enemies spawn at random available points
                spawnPoint = this.spawnPointManager.getRandomSpawnPoint();
            }

            spawnPoints.push({
                x: spawnPoint.x,
                y: spawnPoint.y,
                spawnPoint: spawnPoint,
                isBounty: i === bountyIndex
            });
        }

        return spawnPoints;
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

    /**
     * Update spawn animations
     * Call this every frame from GameScene
     */
    update(time) {
        this.spawnPointManager.update(time);
    }

    /**
     * Reset spawn point manager
     */
    reset() {
        this.currentWave = 0;
        this.waveActive = false;
        this.isSpawning = false;
        this.enemiesInWave = 0;
        this.enemiesRemaining = 0;

        // Reset spawn point manager
        this.spawnPointManager.reset();
    }
}

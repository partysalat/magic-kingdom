import { SpawnPointManager } from './SpawnPointManager.js';
import { BossAnnouncer } from './BossAnnouncer.js';
import { BossHealthBar } from '../ui/BossHealthBar.js';

const BOUNTY_NAMES = [
    { name: 'Big Claw McGraw', type: 'lobster' },
    { name: 'Shelly the Shellfish', type: 'hermit' },
    { name: 'Reef Reaper', type: 'jellyfish' },
    { name: 'Pistol Shrimp Pete', type: 'shrimp' }
];

// Maximum enemies per group to prevent performance issues
const MAX_ENEMIES_PER_GROUP = 50;

export class WaveManager {
    constructor(scene) {
        this.scene = scene;
        this.currentWave = 0;
        this.maxWaves = 12;
        this.isSpawning = false;
        this.waveActive = false;
        this.enemiesInWave = 0;
        this.enemiesRemaining = 0;

        // Difficulty settings
        this.difficulty = null;
        this.difficultyMultipliers = {
            health: 1.0,
            damage: 1.0,
            count: 1.0
        };

        // Sub-wave tracking
        this.currentSubWaveIndex = 0;
        this.subWavesData = [];
        this.currentSubWaveEnemyCount = 0;
        this.subWaveTriggered = {};
        this.subWaveStartCount = 0;

        // Initialize spawn point manager
        this.spawnPointManager = new SpawnPointManager(scene);

        // Initialize boss announcer
        this.bossAnnouncer = new BossAnnouncer(scene);

        console.log('WaveManager initialized');
    }

    /**
     * Set difficulty level for wave scaling
     * @param {Object} difficulty - Difficulty settings from DIFFICULTY_SETTINGS
     */
    setDifficulty(difficulty) {
        // Validate difficulty object
        if (!difficulty || typeof difficulty !== 'object') {
            console.error('Invalid difficulty object provided');
            return;
        }

        // Validate multipliers are numbers
        if (typeof difficulty.enemyHealthMultiplier !== 'number' ||
            typeof difficulty.enemyDamageMultiplier !== 'number' ||
            typeof difficulty.enemyCountMultiplier !== 'number') {
            console.error('Invalid difficulty multipliers - must be numbers');
            return;
        }

        this.difficulty = difficulty;
        this.difficultyMultipliers = {
            health: difficulty.enemyHealthMultiplier,
            damage: difficulty.enemyDamageMultiplier,
            count: difficulty.enemyCountMultiplier
        };

        console.log('Difficulty set to:', difficulty.name);
        console.log('Multipliers:', this.difficultyMultipliers);
    }

    /**
     * Get current difficulty settings
     */
    getDifficulty() {
        return this.difficulty;
    }

    getWaveComposition(waveNumber) {
        // Get sub-wave config based on difficulty
        const subWaveConfig = this.difficulty
            ? this.difficulty.subWaveConfig
            : { startWave: 4, minSubWaves: 2, maxSubWaves: 3 };

        const compositions = {
            1: {
                mainWave: [{ type: 'lobster', count: 5 }],
                subWaves: []
            },

            2: {
                mainWave: [
                    { type: 'lobster', count: 6 },
                    { type: 'hermit', count: 1 }
                ],
                subWaves: []
            },

            3: {
                mainWave: [
                    { type: 'hermit', count: 2, role: 'tank' },
                    { type: 'shrimp', count: 4, role: 'shooter' },
                    { type: 'lobster', count: 2 }
                ],
                subWaves: waveNumber >= subWaveConfig.startWave && subWaveConfig.maxSubWaves >= 3 ? [
                    {
                        trigger: 0.70,
                        enemies: [
                            { type: 'shrimp', count: 2 },
                            { type: 'jellyfish', count: 1 }
                        ]
                    }
                ] : []
            },

            // BOSS WAVE 4: Iron Shell
            4: {
                mainWave: [{ type: 'boss_iron_shell', count: 1, isBoss: true }],
                subWaves: this.getBossSubWaves(4)
            },

            5: {
                mainWave: [
                    { type: 'hermit', count: 3, role: 'tank' },
                    { type: 'shrimp', count: 5, role: 'shooter' },
                    { type: 'lobster', count: 3 },
                    { type: 'jellyfish', count: 1 }
                ],
                subWaves: waveNumber >= subWaveConfig.startWave ? [
                    {
                        trigger: 0.70,
                        enemies: [{ type: 'shrimp', count: 3 }]
                    },
                    {
                        trigger: 0.40,
                        enemies: [{ type: 'flyingfish', count: 2 }]
                    }
                ].slice(0, subWaveConfig.maxSubWaves) : []
            },

            6: {
                mainWave: [
                    { type: 'hermit', count: 4, role: 'tank' },
                    { type: 'shrimp', count: 5, role: 'shooter' },
                    { type: 'lobster', count: 2 },
                    { type: 'flyingfish', count: 3 }
                ],
                subWaves: waveNumber >= subWaveConfig.startWave ? [
                    {
                        trigger: 0.65,
                        enemies: [
                            { type: 'jellyfish', count: 2 },
                            { type: 'shrimp', count: 1 }
                        ]
                    },
                    {
                        trigger: 0.35,
                        enemies: [{ type: 'flyingfish', count: 3 }]
                    }
                ].slice(0, subWaveConfig.maxSubWaves) : []
            },

            7: {
                mainWave: [
                    { type: 'hermit', count: 4, role: 'tank' },
                    { type: 'shrimp', count: 5, role: 'shooter' },
                    { type: 'jellyfish', count: 3, role: 'shooter' },
                    { type: 'lobster', count: 2 },
                    { type: 'flyingfish', count: 3 }
                ],
                subWaves: waveNumber >= subWaveConfig.startWave ? [
                    {
                        trigger: 0.70,
                        enemies: [{ type: 'shrimp', count: 3 }]
                    },
                    {
                        trigger: 0.45,
                        enemies: [
                            { type: 'jellyfish', count: 2 },
                            { type: 'flyingfish', count: 2 }
                        ]
                    },
                    {
                        trigger: 0.20,
                        enemies: [{ type: 'hermit', count: 2 }]
                    }
                ].slice(0, subWaveConfig.maxSubWaves) : []
            },

            // BOSS WAVE 8: Kraken's Arm
            8: {
                mainWave: [{ type: 'boss_kraken_arm', count: 1, isBoss: true }],
                subWaves: this.getBossSubWaves(8)
            },

            9: {
                mainWave: [
                    { type: 'hermit', count: 5, role: 'tank' },
                    { type: 'shrimp', count: 6, role: 'shooter' },
                    { type: 'jellyfish', count: 4, role: 'shooter' },
                    { type: 'lobster', count: 2 },
                    { type: 'flyingfish', count: 4 }
                ],
                subWaves: waveNumber >= subWaveConfig.startWave ? [
                    {
                        trigger: 0.70,
                        enemies: [
                            { type: 'shrimp', count: 3 },
                            { type: 'jellyfish', count: 2 }
                        ]
                    },
                    {
                        trigger: 0.45,
                        enemies: [{ type: 'flyingfish', count: 3 }]
                    },
                    {
                        trigger: 0.20,
                        enemies: [
                            { type: 'hermit', count: 2 },
                            { type: 'shrimp', count: 2 }
                        ]
                    }
                ].slice(0, subWaveConfig.maxSubWaves) : []
            },

            10: {
                mainWave: [
                    { type: 'hermit', count: 6, role: 'tank' },
                    { type: 'shrimp', count: 7, role: 'shooter' },
                    { type: 'jellyfish', count: 4, role: 'shooter' },
                    { type: 'lobster', count: 3 },
                    { type: 'flyingfish', count: 5 }
                ],
                subWaves: waveNumber >= subWaveConfig.startWave ? [
                    {
                        trigger: 0.70,
                        enemies: [{ type: 'shrimp', count: 4 }]
                    },
                    {
                        trigger: 0.45,
                        enemies: [
                            { type: 'jellyfish', count: 3 },
                            { type: 'flyingfish', count: 3 }
                        ]
                    },
                    {
                        trigger: 0.20,
                        enemies: [
                            { type: 'hermit', count: 3 },
                            { type: 'lobster', count: 2 }
                        ]
                    }
                ].slice(0, subWaveConfig.maxSubWaves) : []
            },

            11: {
                mainWave: [
                    { type: 'hermit', count: 6, role: 'tank' },
                    { type: 'shrimp', count: 8, role: 'shooter' },
                    { type: 'jellyfish', count: 5, role: 'shooter' },
                    { type: 'lobster', count: 3 },
                    { type: 'flyingfish', count: 5 }
                ],
                subWaves: waveNumber >= subWaveConfig.startWave ? [
                    {
                        trigger: 0.65,
                        enemies: [{ type: 'shrimp', count: 5 }]
                    },
                    {
                        trigger: 0.40,
                        enemies: [
                            { type: 'jellyfish', count: 4 },
                            { type: 'flyingfish', count: 3 }
                        ]
                    },
                    {
                        trigger: 0.15,
                        enemies: [
                            { type: 'hermit', count: 4 },
                            { type: 'lobster', count: 2 }
                        ]
                    }
                ].slice(0, subWaveConfig.maxSubWaves) : []
            },

            // BOSS WAVE 12: The Leviathan (FINAL BOSS)
            12: {
                mainWave: [{ type: 'boss_leviathan', count: 1, isBoss: true }],
                subWaves: this.getBossSubWaves(12)
            }
        };

        return compositions[waveNumber] || compositions[12];
    }

    /**
     * Get boss-specific sub-waves based on difficulty
     */
    getBossSubWaves(waveNumber) {
        if (!this.difficulty) return [];

        const difficultyId = this.difficulty.id;

        // Boss wave 4: Iron Shell
        if (waveNumber === 4) {
            if (difficultyId === 'easy') return [];
            if (difficultyId === 'medium') return [
                { trigger: 0.50, enemies: [{ type: 'lobster', count: 3 }] }
            ];
            if (difficultyId === 'hard') return [
                { trigger: 0.50, enemies: [{ type: 'shrimp', count: 4 }] },
                { trigger: 0.25, enemies: [{ type: 'hermit', count: 3 }] }
            ];
        }

        // Boss wave 8: Kraken's Arm
        if (waveNumber === 8) {
            if (difficultyId === 'easy') return [];
            if (difficultyId === 'medium') return [
                { trigger: 0.50, enemies: [{ type: 'jellyfish', count: 4 }] }
            ];
            if (difficultyId === 'hard') return [
                { trigger: 0.60, enemies: [{ type: 'shrimp', count: 5 }] },
                { trigger: 0.30, enemies: [{ type: 'flyingfish', count: 3 }] }
            ];
        }

        // Boss wave 12: Leviathan
        if (waveNumber === 12) {
            if (difficultyId === 'easy') return [];
            if (difficultyId === 'medium') return [
                { trigger: 0.50, enemies: [{ type: 'hermit', count: 4 }] }
            ];
            if (difficultyId === 'hard') return [
                { trigger: 0.50, enemies: [{ type: 'hermit', count: 5 }] },
                { trigger: 0.30, enemies: [{ type: 'flyingfish', count: 6 }] }
            ];
        }

        return [];
    }

    /**
     * Check if wave is a boss wave
     */
    isBossWave(waveNumber) {
        return waveNumber === 4 || waveNumber === 8 || waveNumber === 12;
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
        const compositionData = this.getWaveComposition(this.currentWave);
        const composition = compositionData.mainWave || compositionData;  // Support both formats
        this.subWavesData = compositionData.subWaves || [];
        this.currentSubWaveIndex = 0;
        this.subWaveTriggered = {};

        console.log('Wave', this.currentWave, 'has', this.subWavesData.length, 'sub-waves configured');

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

        // Calculate total enemies in main wave only (AFTER difficulty scaling)
        const totalEnemies = composition.reduce((sum, group) => {
            const scaledCount = Math.min(
                MAX_ENEMIES_PER_GROUP,
                Math.ceil(group.count * this.difficultyMultipliers.count)
            );
            return sum + scaledCount;
        }, 0);

        this.enemiesInWave = totalEnemies;
        this.enemiesRemaining = totalEnemies;
        this.currentSubWaveEnemyCount = totalEnemies;  // Track current sub-wave enemies
        this.subWaveStartCount = totalEnemies;  // Initialize for first sub-wave check

        console.log('Main wave enemies (after scaling):', totalEnemies);

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

    spawnEnemiesByComposition(composition, alreadyScaled = false) {
        // Apply difficulty count multiplier to composition (unless already scaled)
        // Cap at 50 enemies per group to prevent performance issues
        const scaledComposition = alreadyScaled ? composition : composition.map(group => ({
            ...group,
            count: Math.min(
                MAX_ENEMIES_PER_GROUP,
                Math.ceil(group.count * this.difficultyMultipliers.count)
            )
        }));

        const totalCount = scaledComposition.reduce((sum, group) => sum + group.count, 0);

        // Determine if we should spawn a bounty
        const spawnBounty = this.shouldSpawnBounty(this.currentWave);
        const bountyInfo = spawnBounty ? this.selectBountyEnemy(composition) : null;
        const bountyValue = spawnBounty ? this.getBountyValue(this.currentWave) : 0;

        // Random index for bounty spawn
        const bountyIndex = spawnBounty ? Math.floor(Math.random() * totalCount) : -1;

        // Get spawn points (bountyIndex determines where bounty spawns)
        const spawnPoints = this.getSpawnPoints(totalCount, bountyIndex);
        console.log('[WaveManager] Generated spawn points:', spawnPoints.map(sp => `(${sp.x}, ${sp.y})`))

        let spawnIndex = 0;
        let bountySpawned = false;

        // Track newly spawned enemies for formation assignment
        const newlySpawnedEnemies = [];

        // Spawn each enemy group
        scaledComposition.forEach(group => {
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
                    isBounty ? bountyValue : 0,
                    this.difficultyMultipliers  // Pass difficulty multipliers
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
                    enemy.setAlpha(0);                 // Start invisible (do this FIRST)
                    enemy.setCollisionEnabled(false);  // Disable collision during spawn animation

                    this.spawnPointManager.queueSpawn(
                        enemy,
                        spawnData.spawnPoint,
                        spawnData.isBounty
                    );
                }

                this.scene.enemies.push(enemy);
                newlySpawnedEnemies.push(enemy);  // Track newly spawned enemy
                spawnIndex++;
            }
        });

        console.log('[WaveManager] Spawned', totalCount, 'enemies. Total in scene:', this.scene.enemies.length);

        // After all enemies are spawned, assign formations to newly spawned enemies only
        this.assignFormations(scaledComposition, newlySpawnedEnemies);
    }

    assignFormations(composition, enemiesToAssign) {
        // Get all tanks and shooters from newly spawned enemies
        const tanks = [];
        const shooters = [];

        enemiesToAssign.forEach(enemy => {
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

            // Play formation sound effect if available
            if (this.scene.sound && this.scene.cache.audio.exists('formation_established')) {
                this.scene.sound.play('formation_established', { volume: 0.5 });
            }
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
        this.currentSubWaveEnemyCount--;

        console.log('Enemies remaining:', this.enemiesRemaining,
                    '| Current sub-wave:', this.currentSubWaveEnemyCount);

        // Check if we should trigger next sub-wave
        this.checkSubWaveTrigger();

        // Check wave completion
        if (this.enemiesRemaining <= 0 && this.waveActive) {
            this.waveComplete();
        }
    }

    /**
     * Check if conditions met to spawn next sub-wave
     */
    checkSubWaveTrigger() {
        // No sub-waves configured
        if (!this.subWavesData || this.subWavesData.length === 0) return;

        // All sub-waves already spawned
        if (this.currentSubWaveIndex >= this.subWavesData.length) return;

        const nextSubWave = this.subWavesData[this.currentSubWaveIndex];

        // Already triggered this sub-wave
        if (this.subWaveTriggered[this.currentSubWaveIndex]) return;

        // Check if this is a boss wave (1 enemy + isBossWave check)
        const isBossWave = this.enemiesInWave === 1 && this.isBossWave(this.currentWave);

        if (isBossWave) {
            // Boss HP-based trigger
            const boss = this.scene.enemies.find(e => e.config && e.config.isBoss);
            if (!boss || !boss.health) return;

            const hpPercentage = boss.health / boss.maxHealth;
            const hpLost = 1.0 - hpPercentage;

            // Check if trigger threshold reached (trigger is based on HP lost)
            if (hpLost >= nextSubWave.trigger) {
                console.log(`Boss sub-wave ${this.currentSubWaveIndex + 1} triggered at ${Math.floor(hpPercentage * 100)}% HP`);
                this.spawnSubWave(nextSubWave);
                this.subWaveTriggered[this.currentSubWaveIndex] = true;
                this.currentSubWaveIndex++;
            }
        } else {
            // Multi-enemy wave - use kill-count percentage
            // Track enemies alive at start of this sub-wave segment
            if (!this.subWaveStartCount || this.subWaveStartCount === 0) {
                this.subWaveStartCount = this.currentSubWaveEnemyCount;
            }

            // Calculate kill percentage of current sub-wave segment
            const killed = this.subWaveStartCount - this.currentSubWaveEnemyCount;
            const killPercentage = this.subWaveStartCount > 0
                ? killed / this.subWaveStartCount
                : 1.0;

            // Check if trigger threshold reached
            if (killPercentage >= nextSubWave.trigger) {
                console.log(`Sub-wave ${this.currentSubWaveIndex + 1} triggered at ${Math.floor(killPercentage * 100)}% killed`);
                this.spawnSubWave(nextSubWave);
                this.subWaveTriggered[this.currentSubWaveIndex] = true;
                this.currentSubWaveIndex++;
            }
        }
    }

    /**
     * Spawn a sub-wave immediately (no delays)
     */
    spawnSubWave(subWaveData) {
        console.log('=== REINFORCEMENTS INCOMING! ===');
        console.log('Sub-wave data:', JSON.stringify(subWaveData, null, 2));

        // Show notification to player
        this.showReinforcementNotification();

        // Spawn sub-wave enemies
        const subWaveComposition = subWaveData.enemies;
        console.log('Sub-wave composition:', subWaveComposition);

        // Apply difficulty multipliers to sub-wave
        const scaledComposition = subWaveComposition.map(group => ({
            ...group,
            count: Math.ceil(group.count * this.difficultyMultipliers.count)
        }));

        // Calculate sub-wave enemy count
        const subWaveCount = scaledComposition.reduce((sum, group) => sum + group.count, 0);

        // Update tracking
        this.enemiesInWave += subWaveCount;
        this.enemiesRemaining += subWaveCount;
        this.currentSubWaveEnemyCount = subWaveCount;

        // Reset sub-wave start count for next trigger
        this.subWaveStartCount = this.currentSubWaveEnemyCount;

        console.log('Spawning', subWaveCount, 'reinforcement enemies');

        // CRITICAL FIX: Defer spawning to next frame to avoid modifying enemies array during filter
        // This prevents reinforcements from disappearing when spawned mid-update
        this.scene.time.delayedCall(1, () => {
            // Spawn enemies (pass true to indicate composition is already scaled)
            this.spawnEnemiesByComposition(scaledComposition, true);
        });
    }

    /**
     * Show "Reinforcements Incoming!" notification
     */
    showReinforcementNotification() {
        // Flash screen
        this.scene.cameras.main.flash(200, 255, 100, 0);

        // Create notification banner
        const banner = this.scene.add.rectangle(960, 200, 800, 100, 0xff0000, 0.9);
        banner.setStrokeStyle(4, 0xffff00);
        banner.setDepth(1000);

        const text = this.scene.add.text(960, 200, 'REINFORCEMENTS INCOMING!', {
            fontSize: '42px',
            color: '#ffff00',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        text.setDepth(1001);

        // Play audio cue if available
        if (this.scene.sound && this.scene.cache.audio.exists('reinforcement_alarm')) {
            this.scene.sound.play('reinforcement_alarm', { volume: 0.7 });
        }

        // Fade out after 2 seconds
        this.scene.time.delayedCall(2000, () => {
            this.scene.tweens.add({
                targets: [banner, text],
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    banner.destroy();
                    text.destroy();
                }
            });
        });
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

        // Reset sub-wave tracking
        this.currentSubWaveIndex = 0;
        this.subWavesData = [];
        this.currentSubWaveEnemyCount = 0;
        this.subWaveTriggered = {};
        this.subWaveStartCount = 0;

        // Reset spawn point manager
        this.spawnPointManager.reset();
    }
}

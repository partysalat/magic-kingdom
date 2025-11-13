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

    spawnEnemiesByComposition(composition) {
        // Calculate total count for spawn point distribution
        const totalCount = composition.reduce((sum, group) => sum + group.count, 0);
        const spawnPoints = this.getSpawnPoints(totalCount);

        let spawnIndex = 0;

        // Spawn each enemy group
        composition.forEach(group => {
            for (let i = 0; i < group.count; i++) {
                const point = spawnPoints[spawnIndex];
                const enemy = new this.scene.Enemy(
                    this.scene,
                    point.x,
                    point.y,
                    group.type
                );
                this.scene.enemies.push(enemy);
                spawnIndex++;
            }
        });

        console.log('Spawned', totalCount, 'enemies');
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

        // Start next wave after delay
        this.scene.time.delayedCall(2000, () => {
            this.startNextWave();
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

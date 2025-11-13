export class WaveManager {
    constructor(scene) {
        this.scene = scene;
        this.currentWave = 0;
        this.maxWaves = 3;
        this.isSpawning = false;
        this.waveActive = false;
        this.enemiesInWave = 0;
        this.enemiesRemaining = 0;

        console.log('WaveManager initialized');
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

        // Determine enemy count based on wave
        const baseEnemies = 3;
        const enemyCount = baseEnemies + (this.currentWave - 1) * 2;

        this.enemiesInWave = enemyCount;
        this.enemiesRemaining = enemyCount;

        // Spawn enemies
        this.spawnEnemies(enemyCount);

        this.isSpawning = false;
    }

    spawnEnemies(count) {
        const spawnPoints = this.getSpawnPoints(count);

        for (let i = 0; i < count; i++) {
            const point = spawnPoints[i];
            const enemy = new this.scene.Enemy(
                this.scene,
                point.x,
                point.y,
                'lobster'
            );
            this.scene.enemies.push(enemy);
        }

        console.log('Spawned', count, 'enemies');
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

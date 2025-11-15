# Phase 2: Enemy Variety Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement all 5 enemy types with distinct behaviors, 10-wave progression system, enemy spawn patterns, and basic scoring.

**Architecture:** Extend the existing Enemy class with type-specific behavior patterns. Each enemy type will have unique stats (health, speed, damage) and movement/attack behaviors. The WaveManager will be enhanced to spawn mixed enemy types with increasing difficulty across 10 waves. A basic scoring system will track player performance.

**Tech Stack:** Phaser.js 3.x, ES6 modules, arcade physics

---

## Task 1: Refactor Enemy Class for Type-Based Behaviors

**Files:**
- Modify: `src/entities/Enemy.js:1-88`

**Step 1: Add enemy type configurations**

Modify `src/entities/Enemy.js` to add a configuration object at the top of the file with stats for all enemy types:

```javascript
// Enemy type configurations
const ENEMY_TYPES = {
    lobster: {
        name: 'Bandit Lobster',
        health: 30,
        speed: 80,
        damage: 10,
        color: 0xff6600,
        radius: 15,
        behavior: 'basic_shooter',
        attackRange: 400,
        attackCooldown: 1000
    },
    shrimp: {
        name: 'Quick-Draw Shrimp',
        health: 15,
        speed: 200,
        damage: 5,
        color: 0xff9999,
        radius: 10,
        behavior: 'fast_melee',
        attackRange: 50,
        attackCooldown: 500
    },
    hermit: {
        name: 'Hermit Crab Tank',
        health: 100,
        speed: 40,
        damage: 20,
        color: 0x8b4513,
        radius: 25,
        behavior: 'tank',
        attackRange: 100,
        attackCooldown: 2000
    },
    jellyfish: {
        name: 'Jellyfish Ghost',
        health: 40,
        speed: 60,
        damage: 15,
        color: 0xcc99ff,
        radius: 18,
        behavior: 'teleport',
        attackRange: 500,
        attackCooldown: 3000,
        teleportCooldown: 5000
    },
    flyingfish: {
        name: 'Flying Fish',
        health: 20,
        speed: 150,
        damage: 8,
        color: 0x00ccff,
        radius: 12,
        behavior: 'swoop',
        attackRange: 600,
        attackCooldown: 2500,
        swoopDistance: 300
    }
};

export { ENEMY_TYPES };
```

**Step 2: Update Enemy constructor to use type configuration**

Replace the constructor in `src/entities/Enemy.js`:

```javascript
constructor(scene, x, y, type = 'lobster') {
    this.scene = scene;
    this.type = type;

    // Get configuration for this enemy type
    const config = ENEMY_TYPES[type];
    if (!config) {
        console.error('Unknown enemy type:', type);
        return;
    }

    this.config = config;

    // Create placeholder graphics
    this.sprite = scene.add.circle(x, y, config.radius, config.color);
    scene.physics.add.existing(this.sprite);

    // Physics configuration
    this.sprite.body.setCollideWorldBounds(true);

    // Enemy properties from config
    this.health = config.health;
    this.maxHealth = config.health;
    this.speed = config.speed;
    this.damage = config.damage;
    this.attackRange = config.attackRange;
    this.attackCooldown = config.attackCooldown;
    this.nextAttack = 0;

    // Behavior-specific properties
    this.lastTeleport = 0;
    this.swoopPhase = 'idle'; // for flying fish: 'idle', 'rising', 'swooping'
    this.swoopTarget = { x: 0, y: 0 };

    // Visual indicators based on type
    this.createVisualIndicators();

    this.alive = true;

    console.log('Enemy created:', config.name, 'at', x, y);
}
```

**Step 3: Add createVisualIndicators method**

Add after the constructor:

```javascript
createVisualIndicators() {
    switch(this.type) {
        case 'lobster':
            // Two claws
            this.claw1 = this.scene.add.circle(this.sprite.x - 12, this.sprite.y, 5, 0xff3300);
            this.claw2 = this.scene.add.circle(this.sprite.x + 12, this.sprite.y, 5, 0xff3300);
            break;
        case 'shrimp':
            // Small antennae
            this.antenna1 = this.scene.add.circle(this.sprite.x - 6, this.sprite.y - 8, 3, 0xff6666);
            this.antenna2 = this.scene.add.circle(this.sprite.x + 6, this.sprite.y - 8, 3, 0xff6666);
            break;
        case 'hermit':
            // Shell outline
            this.shell = this.scene.add.circle(this.sprite.x, this.sprite.y, this.config.radius + 5, 0x654321);
            this.shell.setStrokeStyle(3, 0x4a3a2a);
            this.shell.setFillStyle(0x654321, 0.5);
            this.shell.setDepth(-1);
            break;
        case 'jellyfish':
            // Tentacles
            this.tentacles = [];
            for (let i = 0; i < 4; i++) {
                const angle = (i / 4) * Math.PI * 2;
                const tentacle = this.scene.add.circle(
                    this.sprite.x + Math.cos(angle) * 15,
                    this.sprite.y + Math.sin(angle) * 15,
                    4,
                    0x9966cc
                );
                this.tentacles.push(tentacle);
            }
            break;
        case 'flyingfish':
            // Wings
            this.wing1 = this.scene.add.circle(this.sprite.x - 10, this.sprite.y, 6, 0x0099cc);
            this.wing2 = this.scene.add.circle(this.sprite.x + 10, this.sprite.y, 6, 0x0099cc);
            break;
    }
}
```

**Step 4: Refactor update method with behavior routing**

Replace the existing update method:

```javascript
update(time, playerX, playerY) {
    if (!this.alive) return;

    // Route to behavior-specific update
    switch(this.config.behavior) {
        case 'basic_shooter':
            this.updateBasicShooter(time, playerX, playerY);
            break;
        case 'fast_melee':
            this.updateFastMelee(time, playerX, playerY);
            break;
        case 'tank':
            this.updateTank(time, playerX, playerY);
            break;
        case 'teleport':
            this.updateTeleport(time, playerX, playerY);
            break;
        case 'swoop':
            this.updateSwoop(time, playerX, playerY);
            break;
    }

    // Update visual indicators
    this.updateVisuals();
}
```

**Step 5: Add behavior methods - Basic Shooter (Lobster)**

```javascript
updateBasicShooter(time, playerX, playerY) {
    const dx = playerX - this.sprite.x;
    const dy = playerY - this.sprite.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Move toward player at medium speed
    if (distance > 50) {
        const angle = Math.atan2(dy, dx);
        this.sprite.body.setVelocity(
            Math.cos(angle) * this.speed,
            Math.sin(angle) * this.speed
        );
    } else {
        this.sprite.body.setVelocity(0, 0);
    }
}
```

**Step 6: Add behavior methods - Fast Melee (Shrimp)**

```javascript
updateFastMelee(time, playerX, playerY) {
    const dx = playerX - this.sprite.x;
    const dy = playerY - this.sprite.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Dart quickly toward player
    const angle = Math.atan2(dy, dx);
    this.sprite.body.setVelocity(
        Math.cos(angle) * this.speed,
        Math.sin(angle) * this.speed
    );
}
```

**Step 7: Add behavior methods - Tank (Hermit Crab)**

```javascript
updateTank(time, playerX, playerY) {
    const dx = playerX - this.sprite.x;
    const dy = playerY - this.sprite.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Slow advance toward player
    if (distance > 40) {
        const angle = Math.atan2(dy, dx);
        this.sprite.body.setVelocity(
            Math.cos(angle) * this.speed,
            Math.sin(angle) * this.speed
        );
    } else {
        this.sprite.body.setVelocity(0, 0);
    }
}
```

**Step 8: Add behavior methods - Teleport (Jellyfish)**

```javascript
updateTeleport(time, playerX, playerY) {
    const dx = playerX - this.sprite.x;
    const dy = playerY - this.sprite.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Check if we should teleport
    if (time - this.lastTeleport > this.config.teleportCooldown && distance > 200) {
        // Teleport closer to player (but not too close)
        const angle = Math.atan2(dy, dx);
        const teleportDistance = 150;
        const newX = this.sprite.x + Math.cos(angle) * teleportDistance;
        const newY = this.sprite.y + Math.sin(angle) * teleportDistance;

        // Clamp to world bounds
        const clampedX = Math.max(50, Math.min(1870, newX));
        const clampedY = Math.max(50, Math.min(1030, newY));

        this.sprite.setPosition(clampedX, clampedY);
        this.lastTeleport = time;

        // Visual effect
        this.scene.cameras.main.flash(200, 200, 150, 255);
    }

    // Float slowly toward player
    const angle = Math.atan2(dy, dx);
    this.sprite.body.setVelocity(
        Math.cos(angle) * this.speed,
        Math.sin(angle) * this.speed
    );
}
```

**Step 9: Add behavior methods - Swoop (Flying Fish)**

```javascript
updateSwoop(time, playerX, playerY) {
    const dx = playerX - this.sprite.x;
    const dy = playerY - this.sprite.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    switch(this.swoopPhase) {
        case 'idle':
            // Circle around player at high altitude
            const angle = Math.atan2(dy, dx) + Math.PI / 2;
            this.sprite.body.setVelocity(
                Math.cos(angle) * this.speed * 0.6,
                Math.sin(angle) * this.speed * 0.6
            );

            // Prepare swoop if in range
            if (distance < this.attackRange && time - this.nextAttack > this.attackCooldown) {
                this.swoopPhase = 'swooping';
                this.swoopTarget = { x: playerX, y: playerY };
                this.nextAttack = time + this.attackCooldown;
            }
            break;

        case 'swooping':
            // Fast attack toward saved target position
            const swoopAngle = Math.atan2(
                this.swoopTarget.y - this.sprite.y,
                this.swoopTarget.x - this.sprite.x
            );
            this.sprite.body.setVelocity(
                Math.cos(swoopAngle) * this.speed * 1.5,
                Math.sin(swoopAngle) * this.speed * 1.5
            );

            // Check if reached target
            const targetDist = Math.sqrt(
                Math.pow(this.swoopTarget.x - this.sprite.x, 2) +
                Math.pow(this.swoopTarget.y - this.sprite.y, 2)
            );

            if (targetDist < 30) {
                this.swoopPhase = 'rising';
            }
            break;

        case 'rising':
            // Move away from player after swoop
            const escapeAngle = Math.atan2(dy, dx) + Math.PI;
            this.sprite.body.setVelocity(
                Math.cos(escapeAngle) * this.speed,
                Math.sin(escapeAngle) * this.speed
            );

            // Return to idle after getting distance
            if (distance > 200) {
                this.swoopPhase = 'idle';
            }
            break;
    }
}
```

**Step 10: Add updateVisuals method**

```javascript
updateVisuals() {
    switch(this.type) {
        case 'lobster':
            if (this.claw1 && this.claw2) {
                this.claw1.setPosition(this.sprite.x - 12, this.sprite.y);
                this.claw2.setPosition(this.sprite.x + 12, this.sprite.y);
            }
            break;
        case 'shrimp':
            if (this.antenna1 && this.antenna2) {
                this.antenna1.setPosition(this.sprite.x - 6, this.sprite.y - 8);
                this.antenna2.setPosition(this.sprite.x + 6, this.sprite.y - 8);
            }
            break;
        case 'hermit':
            if (this.shell) {
                this.shell.setPosition(this.sprite.x, this.sprite.y);
            }
            break;
        case 'jellyfish':
            if (this.tentacles) {
                this.tentacles.forEach((tentacle, i) => {
                    const angle = (i / 4) * Math.PI * 2 + (Date.now() / 500);
                    tentacle.setPosition(
                        this.sprite.x + Math.cos(angle) * 15,
                        this.sprite.y + Math.sin(angle) * 15
                    );
                });
            }
            break;
        case 'flyingfish':
            if (this.wing1 && this.wing2) {
                this.wing1.setPosition(this.sprite.x - 10, this.sprite.y);
                this.wing2.setPosition(this.sprite.x + 10, this.sprite.y);
            }
            break;
    }
}
```

**Step 11: Update destroy method to clean up all visual indicators**

Replace the existing destroy method:

```javascript
destroy() {
    this.sprite.destroy();

    // Clean up type-specific visuals
    switch(this.type) {
        case 'lobster':
            if (this.claw1) this.claw1.destroy();
            if (this.claw2) this.claw2.destroy();
            break;
        case 'shrimp':
            if (this.antenna1) this.antenna1.destroy();
            if (this.antenna2) this.antenna2.destroy();
            break;
        case 'hermit':
            if (this.shell) this.shell.destroy();
            break;
        case 'jellyfish':
            if (this.tentacles) {
                this.tentacles.forEach(t => t.destroy());
            }
            break;
        case 'flyingfish':
            if (this.wing1) this.wing1.destroy();
            if (this.wing2) this.wing2.destroy();
            break;
    }
}
```

**Step 12: Test enemy variety**

Run: `npm run dev`

Expected: Game should run. You should see the same lobster enemies with their new configuration system. The behavior should be identical to Phase 1.

**Step 13: Commit**

```bash
git add src/entities/Enemy.js
git commit -m "refactor: add enemy type system with behavior routing

- Add ENEMY_TYPES configuration object
- Refactor constructor to use type configs
- Add createVisualIndicators for type-specific visuals
- Implement behavior methods for all 5 enemy types
- Update destroy to clean up all visual types"
```

---

## Task 2: Expand WaveManager for 10 Waves and Mixed Enemy Types

**Files:**
- Modify: `src/systems/WaveManager.js:1-124`

**Step 1: Update maxWaves to 10**

In `src/systems/WaveManager.js` constructor, change:

```javascript
this.maxWaves = 10;
```

**Step 2: Add wave composition configurations**

Add after the constructor:

```javascript
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
```

**Step 3: Update startNextWave to use wave composition**

Replace the enemy count calculation in `startNextWave`:

```javascript
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
```

**Step 4: Add spawnEnemiesByComposition method**

Replace the existing `spawnEnemies` method:

```javascript
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
```

**Step 5: Test 10-wave progression**

Run: `npm run dev`

Expected:
- Wave counter should show "Wave: 1/10"
- Later waves should spawn different enemy types with unique visuals
- Wave 1-2 should be lobsters only
- Wave 3+ should introduce other enemy types
- Wave 10 should have all 5 enemy types

**Step 6: Commit**

```bash
git add src/systems/WaveManager.js
git commit -m "feat: expand wave system to 10 waves with mixed enemy types

- Update maxWaves from 3 to 10
- Add getWaveComposition for wave-specific enemy mixes
- Replace spawnEnemies with spawnEnemiesByComposition
- Progressive difficulty: introduce new enemy types each wave"
```

---

## Task 3: Implement Basic Scoring System

**Files:**
- Create: `src/systems/ScoreManager.js`
- Modify: `src/scenes/GameScene.js:1-329`

**Step 1: Create ScoreManager class**

Create new file `src/systems/ScoreManager.js`:

```javascript
export class ScoreManager {
    constructor(scene) {
        this.scene = scene;
        this.score = 0;

        // Point values
        this.ENEMY_KILL_POINTS = 10;
        this.WAVE_SURVIVAL_BONUS = 50;

        console.log('ScoreManager initialized');
    }

    addEnemyKill() {
        this.score += this.ENEMY_KILL_POINTS;
        console.log('Enemy killed! Score:', this.score);
        return this.score;
    }

    addWaveSurvivalBonus() {
        this.score += this.WAVE_SURVIVAL_BONUS;
        console.log('Wave complete bonus! Score:', this.score);
        return this.score;
    }

    getScore() {
        return this.score;
    }

    reset() {
        this.score = 0;
    }
}
```

**Step 2: Import ScoreManager in GameScene**

Add to imports in `src/scenes/GameScene.js`:

```javascript
import { ScoreManager } from '../systems/ScoreManager.js';
```

**Step 3: Initialize ScoreManager in GameScene create()**

Add after WaveManager initialization (around line 63):

```javascript
// Initialize score manager
this.scoreManager = new ScoreManager(this);
```

**Step 4: Add score display UI**

Add after wave display (around line 91):

```javascript
// Add score display
this.scoreText = this.add.text(1900, 20, 'Score: 0', {
    fontSize: '32px',
    color: '#ffff00',
    fontFamily: 'Arial'
}).setOrigin(1, 0);
```

**Step 5: Update score on enemy kill**

In `GameScene.update()`, modify the enemy filter section to add scoring (around line 179):

```javascript
} else if (!enemy.isAlive()) {
    enemy.destroy();
    this.waveManager.enemyKilled();
    this.scoreManager.addEnemyKill(); // ADD THIS LINE
    this.updateWaveUI();
    return false;
}
```

**Step 6: Add updateScoreUI method**

Add after `updateWaveUI()` method (around line 280):

```javascript
updateScoreUI() {
    this.scoreText.setText(`Score: ${this.scoreManager.getScore()}`);
}
```

**Step 7: Update score UI on enemy kill**

Modify the update() method to call updateScoreUI (around line 181):

```javascript
} else if (!enemy.isAlive()) {
    enemy.destroy();
    this.waveManager.enemyKilled();
    this.scoreManager.addEnemyKill();
    this.updateWaveUI();
    this.updateScoreUI(); // ADD THIS LINE
    return false;
}
```

**Step 8: Award wave survival bonus**

In `src/systems/WaveManager.js`, modify `waveComplete()` method:

```javascript
waveComplete() {
    console.log('Wave', this.currentWave, 'complete!');
    this.waveActive = false;

    // Award survival bonus
    if (this.scene.scoreManager) {
        this.scene.scoreManager.addWaveSurvivalBonus();
        this.scene.updateScoreUI();
    }

    // Start next wave after delay
    this.scene.time.delayedCall(2000, () => {
        this.startNextWave();
        if (this.scene.updateWaveUI) {
            this.scene.updateWaveUI();
        }
    });
}
```

**Step 9: Display final score on game over**

In `src/scenes/GameScene.js`, modify `handleGameOver()` (around line 306):

```javascript
handleGameOver() {
    console.log('Game Over!');
    this.isGameOver = true;

    // Display game over text
    this.add.text(960, 540, 'GAME OVER', {
        fontSize: '96px',
        color: '#ff0000',
        fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Display final score
    this.add.text(960, 640, `Final Score: ${this.scoreManager.getScore()}`, {
        fontSize: '36px',
        color: '#ffffff',
        fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.add.text(960, 700, 'Refresh to restart', {
        fontSize: '24px',
        color: '#ffffff',
        fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Destroy player visually
    if (this.player) {
        this.player.destroy();
    }
}
```

**Step 10: Display final score on victory**

Modify `handleVictory()` (around line 282):

```javascript
handleVictory() {
    console.log('Victory!');
this.isGameOver = true;

    // Display victory text
    this.add.text(960, 540, 'VICTORY!', {
        fontSize: '96px',
        color: '#00ff00',
        fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Display final score
    this.add.text(960, 640, `Final Score: ${this.scoreManager.getScore()}`, {
        fontSize: '36px',
        color: '#ffffff',
        fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.add.text(960, 700, 'Refresh to restart', {
        fontSize: '24px',
        color: '#ffffff',
        fontFamily: 'Arial'
    }).setOrigin(0.5);
}
```

**Step 11: Test scoring system**

Run: `npm run dev`

Expected:
- Score display appears in top-right corner
- Score increases by 10 for each enemy killed
- Score increases by 50 when wave completes
- Final score displays on game over and victory screens

**Step 12: Commit**

```bash
git add src/systems/ScoreManager.js src/scenes/GameScene.js src/systems/WaveManager.js
git commit -m "feat: implement basic scoring system

- Create ScoreManager with enemy kill and wave bonus scoring
- Add score display in top-right corner
- Award 10 points per enemy kill
- Award 50 points per wave completion
- Display final score on game over and victory screens"
```

---

## Task 4: Balance Testing and Difficulty Tuning

**Files:**
- Modify: `src/entities/Enemy.js` (if needed for balance)
- Modify: `src/systems/WaveManager.js` (if needed for spawn counts)

**Step 1: Create balance test checklist**

Create a checklist to test:
- [ ] Can player survive wave 1-3 easily?
- [ ] Do waves 4-7 provide moderate challenge?
- [ ] Are waves 8-10 difficult but achievable?
- [ ] Is each enemy type distinguishable visually?
- [ ] Does each enemy behavior feel unique?
- [ ] Are hermit crabs tanky enough?
- [ ] Are shrimp fast enough to be threatening?
- [ ] Do jellyfish teleports create interesting moments?
- [ ] Are flying fish swoop attacks impactful?

**Step 2: Playtest and observe**

Run: `npm run dev`

Play through multiple runs and observe:
- Which enemy types are too weak/strong?
- Which waves feel too easy/hard?
- Do certain enemy combinations create unfair scenarios?
- Is the visual distinction between enemy types clear?

**Step 3: Adjust enemy stats if needed**

If balance issues are found, modify `ENEMY_TYPES` in `src/entities/Enemy.js`:
- Adjust health values (too easy to kill or too tanky?)
- Adjust speed values (too slow or too fast?)
- Adjust damage values (too punishing or too forgiving?)

Example adjustment:

```javascript
shrimp: {
    name: 'Quick-Draw Shrimp',
    health: 15, // Was 20 - reduce if too tanky
    speed: 200, // Was 150 - increase if not threatening enough
    damage: 5, // Was 8 - reduce if too punishing
    // ...
}
```

**Step 4: Adjust wave composition if needed**

If waves feel unbalanced, modify `getWaveComposition` in `src/systems/WaveManager.js`:
- Reduce enemy counts if waves are too hard
- Increase enemy counts if waves are too easy
- Adjust enemy type ratios for better pacing

**Step 5: Test adjusted balance**

Run: `npm run dev`

Expected:
- Waves 1-3 should be tutorial difficulty
- Waves 4-7 should require active dodging and positioning
- Waves 8-10 should be challenging but completable with skill

**Step 6: Document balance changes**

Create notes in a comment at the top of `src/entities/Enemy.js`:

```javascript
// Balance Notes (Phase 2):
// - Shrimp speed increased to 200 to make them more threatening
// - Hermit health increased to 100 for proper tank role
// - Jellyfish teleport cooldown set to 5000ms to prevent spam
// - Flying fish swoop damage balanced at 8 (lower than melee enemies)
```

**Step 7: Commit balance changes**

```bash
git add src/entities/Enemy.js src/systems/WaveManager.js
git commit -m "balance: tune enemy stats and wave composition

- Adjust enemy health/speed/damage for better difficulty curve
- Fine-tune wave compositions for smooth progression
- Document balance decisions in code comments"
```

---

## Task 5: Add Health Pickups (Optional Enhancement)

**Files:**
- Create: `src/entities/HealthPickup.js`
- Modify: `src/scenes/GameScene.js`

**Note:** This task is optional based on playtesting. If the game feels too punishing, implement health pickups.

**Step 1: Create HealthPickup class**

Create `src/entities/HealthPickup.js`:

```javascript
export class HealthPickup {
    constructor(scene, x, y) {
        this.scene = scene;

        // Create visual (green cross)
        this.sprite = scene.add.circle(x, y, 15, 0x00ff00);
        this.sprite.setStrokeStyle(3, 0x00aa00);
        scene.physics.add.existing(this.sprite);
        this.sprite.body.setCollideWorldBounds(true);

        // Healing amount
        this.healAmount = 25;
        this.alive = true;

        // Pulse animation
        scene.tweens.add({
            targets: this.sprite,
            scale: { from: 1, to: 1.2 },
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        console.log('Health pickup created at', x, y);
    }

    getSprite() {
        return this.sprite;
    }

    getHealAmount() {
        return this.healAmount;
    }

    isAlive() {
        return this.alive;
    }

    collect() {
        this.alive = false;
        this.sprite.destroy();
        console.log('Health pickup collected');
    }
}
```

**Step 2: Add health pickup spawning in WaveManager**

In `src/systems/WaveManager.js`, add method:

```javascript
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
```

**Step 3: Import HealthPickup in GameScene**

```javascript
import { HealthPickup } from '../entities/HealthPickup.js';
```

**Step 4: Make HealthPickup available globally**

In `GameScene.create()`, add after line 38:

```javascript
this.HealthPickup = HealthPickup;
```

**Step 5: Initialize health pickup array**

In `GameScene.create()`, add after enemies array:

```javascript
this.healthPickups = [];
```

**Step 6: Spawn health pickups between waves**

In `src/systems/WaveManager.js`, modify `waveComplete()`:

```javascript
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

    // Start next wave after delay
    this.scene.time.delayedCall(2000, () => {
        this.startNextWave();
        if (this.scene.updateWaveUI) {
            this.scene.updateWaveUI();
        }
    });
}
```

**Step 7: Add health pickup collision detection**

In `GameScene.update()`, add before the end of the update method:

```javascript
// Check health pickup collisions
this.healthPickups = this.healthPickups.filter(pickup => {
    if (!pickup.isAlive()) return false;

    if (this.player && !this.player.isDead()) {
        const dx = this.player.getX() - pickup.getSprite().x;
        const dy = this.player.getY() - pickup.getSprite().y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Collision if distance less than combined radii
        if (distance < 35) { // 20 (player) + 15 (pickup)
            const healed = this.player.heal(pickup.getHealAmount());
            pickup.collect();
            this.updateHealthUI();

            // Visual feedback
            this.cameras.main.flash(200, 0, 255, 0);
            console.log('Player healed for', healed);
            return false;
        }
    }

    return true;
});
```

**Step 8: Add heal method to Player**

In `src/entities/Player.js`, add after `takeDamage()`:

```javascript
heal(amount) {
    const oldHealth = this.health;
    this.health = Math.min(this.health + amount, this.maxHealth);
    const actualHealing = this.health - oldHealth;
    console.log('Player healed:', actualHealing, 'New health:', this.health);
    return actualHealing;
}
```

**Step 9: Test health pickups**

Run: `npm run dev`

Expected:
- Green pulsing circles appear after waves 2, 4, 6, 8, 10
- Walking over them heals player by 25 HP
- Health display updates
- Green flash occurs on pickup

**Step 10: Commit health pickups**

```bash
git add src/entities/HealthPickup.js src/systems/WaveManager.js src/scenes/GameScene.js src/entities/Player.js
git commit -m "feat: add health pickup system

- Create HealthPickup entity with pulse animation
- Spawn health pickups after even-numbered waves
- Heal player by 25 HP on collection
- Add visual feedback (green flash) on pickup"
```

---

## Task 6: Final Testing and Documentation

**Files:**
- Modify: `README.md`

**Step 1: Comprehensive playthrough**

Run: `npm run dev`

Test checklist:
- [ ] All 5 enemy types spawn and behave correctly
- [ ] Visual distinction between enemy types is clear
- [ ] Each enemy behavior feels unique and interesting
- [ ] 10 waves progress smoothly in difficulty
- [ ] Scoring system works correctly
- [ ] Health pickups spawn and work (if implemented)
- [ ] Victory screen shows correct final score
- [ ] Game over screen shows correct final score
- [ ] No console errors during gameplay
- [ ] Performance is smooth (60fps with 20+ enemies)

**Step 2: Update README with Phase 2 completion**

In `README.md`, add Phase 2 completion status:

```markdown
## Development Status

### Phase 1: Core Loop ✅ COMPLETE
- Basic twin-stick movement and shooting
- One enemy type (Bandit Lobster)
- Simple wave spawning (3 waves)
- Health system and game over
- Basic saloon environment

### Phase 2: Enemy Variety ✅ COMPLETE
- All 5 enemy types implemented:
  - Bandit Lobster (basic shooter)
  - Quick-Draw Shrimp (fast melee)
  - Hermit Crab Tank (heavy unit)
  - Jellyfish Ghost (teleporter)
  - Flying Fish (swoop attacker)
- 10-wave progression system
- Mixed enemy spawning by wave
- Basic scoring system (kills + wave bonuses)
- Health pickups (optional)

### Phase 3: Competition Features 🚧 TODO
- Full scoring system with leaderboard
- Bounty enemy system
- Cocktail powerup spawning
- All 6 cocktail buffs
- Real-time leaderboard display
- MVP screen
```

**Step 3: Document known issues**

Add any discovered issues to README:

```markdown
## Known Issues (Phase 2)

- Jellyfish teleport may occasionally clip through obstacles
- Flying fish swoop behavior can get stuck if player moves behind obstacle
- Large enemy counts (wave 10) may cause minor frame drops on slower hardware
```

**Step 4: Document gameplay tips**

Add gameplay notes:

```markdown
## Gameplay Tips (Phase 2)

- **Shrimp** are fast - prioritize them before they swarm you
- **Hermit Crabs** are tanks - use obstacles to kite them
- **Jellyfish** teleport when far away - stay at medium range
- **Flying Fish** swoop from a distance - watch for their approach
- **Lobsters** are the most predictable - use them to manage enemy density
- Health pickups spawn after even waves - plan your positioning
```

**Step 5: Commit documentation**

```bash
git add README.md
git commit -m "docs: update README for Phase 2 completion

- Mark Phase 2 as complete
- List all implemented enemy types
- Document known issues
- Add gameplay tips for enemy variety"
```

---

## Verification

After completing all tasks, verify Phase 2 success criteria:

- ✅ All 5 enemy types spawn with distinct visuals
- ✅ Each enemy type has unique behavior
- ✅ 10-wave progression system works
- ✅ Enemy composition changes per wave
- ✅ Basic scoring tracks kills and wave bonuses
- ✅ Difficulty ramps smoothly from wave 1 to 10
- ✅ Game is winnable but challenging

Run final test: `npm run dev`

Play through all 10 waves and confirm smooth gameplay experience.

---

## Notes for Phase 3

Phase 2 establishes the enemy variety foundation. Phase 3 will add:
- Competition features (bounty enemies, MVP system)
- Cocktail powerup system
- Real-time leaderboard
- Enhanced scoring with bounty multipliers

The enemy system and wave manager are now ready to support bounty enemy spawning in Phase 3.
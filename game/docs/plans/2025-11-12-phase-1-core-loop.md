# Phase 1: Core Loop Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a playable prototype with twin-stick combat, one enemy type, 3-wave spawning, health system, and basic environment.

**Architecture:** Browser-based Phaser.js game with modular scene structure. Player entity uses twin-stick controls (WASD + mouse). Enemy AI uses simple seek behavior. Wave manager spawns enemies in phases. Health system tracks player state with game over on death.

**Tech Stack:** Phaser.js 3.80+, vanilla JavaScript (ES6 modules), browser-based (no bundler for Phase 1), local development server

---

## Task 1: Project Setup & Phaser Initialization

**Files:**
- Create: `index.html`
- Create: `src/main.js`
- Create: `src/config.js`
- Create: `.gitignore`

**Step 1: Create HTML entry point**

Create `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gisela's Last Stand</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background-color: #1a1a1a;
        }
        #game-container {
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
        }
    </style>
</head>
<body>
    <div id="game-container"></div>
    <script src="https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.js"></script>
    <script type="module" src="src/main.js"></script>
</body>
</html>
```

**Step 2: Create game configuration**

Create `src/config.js`:

```javascript
export const gameConfig = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    backgroundColor: '#2d2d2d'
};
```

**Step 3: Create main game entry point**

Create `src/main.js`:

```javascript
import { gameConfig } from './config.js';

class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Placeholder for assets
        this.load.on('complete', () => {
            console.log('Boot complete');
        });
    }

    create() {
        console.log('BootScene created');
        // Will transition to GameScene in next task
    }
}

const config = {
    ...gameConfig,
    scene: [BootScene]
};

const game = new Phaser.Game(config);
```

**Step 4: Create .gitignore**

Create `.gitignore`:

```
node_modules/
.DS_Store
*.log
.vscode/
dist/
```

**Step 5: Test basic setup**

Run: `npm run dev`
Open: `http://localhost:8000`
Expected: Black Phaser canvas loads, console shows "Boot complete" and "BootScene created"

**Step 6: Commit**

```bash
git add index.html src/main.js src/config.js .gitignore
git commit -m "feat: initialize Phaser project structure"
```

---

## Task 2: GameScene Foundation

**Files:**
- Create: `src/scenes/GameScene.js`
- Modify: `src/main.js`

**Step 1: Create GameScene skeleton**

Create `src/scenes/GameScene.js`:

```javascript
export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // Assets will be loaded here
    }

    create() {
        console.log('GameScene created');

        // Scene setup
        this.cameras.main.setBackgroundColor('#4a3428'); // Wooden saloon floor color

        // Initialize scene properties
        this.isGameOver = false;

        // Add temporary text to confirm scene loaded
        this.add.text(960, 540, 'Gisela\'s Last Stand - Phase 1', {
            fontSize: '48px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
    }

    update(time, delta) {
        // Game loop will go here
    }
}
```

**Step 2: Wire GameScene into main.js**

Modify `src/main.js`:

```javascript
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
```

**Step 3: Test scene transition**

Run: `npm run dev`
Open: `http://localhost:8000`
Expected: Brown background loads, white text "Gisela's Last Stand - Phase 1" appears centered, console shows "GameScene created"

**Step 4: Commit**

```bash
git add src/scenes/GameScene.js src/main.js
git commit -m "feat: add GameScene with basic setup"
```

---

## Task 3: Player Entity - Visual Placeholder

**Files:**
- Create: `src/entities/Player.js`
- Modify: `src/scenes/GameScene.js`

**Step 1: Create Player entity class**

Create `src/entities/Player.js`:

```javascript
export class Player {
    constructor(scene, x, y) {
        this.scene = scene;

        // Create placeholder graphics (red crab)
        this.sprite = scene.add.circle(x, y, 20, 0xff0000);
        scene.physics.add.existing(this.sprite);

        // Physics body configuration
        this.sprite.body.setCollideWorldBounds(true);
        this.sprite.body.setDrag(500);
        this.sprite.body.setMaxVelocity(300);

        // Player properties
        this.speed = 300;
        this.health = 100;
        this.maxHealth = 100;

        // Add a small "hat" indicator (triangle pointing up)
        this.hat = scene.add.triangle(x, y - 25, 0, 10, -8, -5, 8, -5, 0x8b4513);

        console.log('Player created at', x, y);
    }

    update() {
        // Position hat above player
        this.hat.setPosition(this.sprite.x, this.sprite.y - 25);
    }

    getX() {
        return this.sprite.x;
    }

    getY() {
        return this.sprite.y;
    }

    getBody() {
        return this.sprite.body;
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health < 0) this.health = 0;
        console.log('Player health:', this.health);
        return this.health;
    }

    isDead() {
        return this.health <= 0;
    }

    destroy() {
        this.sprite.destroy();
        this.hat.destroy();
    }
}
```

**Step 2: Add player to GameScene**

Modify `src/scenes/GameScene.js`:

```javascript
import { Player } from '../entities/Player.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // Assets will be loaded here
    }

    create() {
        console.log('GameScene created');

        // Scene setup
        this.cameras.main.setBackgroundColor('#4a3428');
        this.isGameOver = false;

        // Create player in center
        this.player = new Player(this, 960, 540);

        // Add UI text
        this.add.text(20, 20, 'WASD: Move | Mouse: Aim & Shoot', {
            fontSize: '24px',
            color: '#ffffff',
            fontFamily: 'Arial'
        });
    }

    update(time, delta) {
        if (this.isGameOver) return;

        // Update player
        if (this.player) {
            this.player.update();
        }
    }
}
```

**Step 3: Test player spawning**

Run: `npm run dev`
Expected: Red circle appears at screen center with brown triangle "hat" above it, console shows "Player created at 960 540"

**Step 4: Commit**

```bash
git add src/entities/Player.js src/scenes/GameScene.js
git commit -m "feat: add Player entity with visual placeholder"
```

---

## Task 4: Player Movement (WASD)

**Files:**
- Modify: `src/entities/Player.js`
- Modify: `src/scenes/GameScene.js`

**Step 1: Add input handling to GameScene**

Modify `src/scenes/GameScene.js` create method, add after player creation:

```javascript
create() {
    // ... existing code ...

    // Create player in center
    this.player = new Player(this, 960, 540);

    // Setup input
    this.keys = this.input.keyboard.addKeys({
        W: Phaser.Input.Keyboard.KeyCodes.W,
        A: Phaser.Input.Keyboard.KeyCodes.A,
        S: Phaser.Input.Keyboard.KeyCodes.S,
        D: Phaser.Input.Keyboard.KeyCodes.D
    });

    // Add UI text
    // ... rest of existing code ...
}
```

Modify update method:

```javascript
update(time, delta) {
    if (this.isGameOver) return;

    // Update player with input
    if (this.player) {
        this.player.update(this.keys);
    }
}
```

**Step 2: Implement movement in Player entity**

Modify `src/entities/Player.js` update method:

```javascript
update(keys) {
    // Calculate movement vector
    let velocityX = 0;
    let velocityY = 0;

    if (keys.W.isDown) {
        velocityY = -this.speed;
    } else if (keys.S.isDown) {
        velocityY = this.speed;
    }

    if (keys.A.isDown) {
        velocityX = -this.speed;
    } else if (keys.D.isDown) {
        velocityX = this.speed;
    }

    // Normalize diagonal movement
    if (velocityX !== 0 && velocityY !== 0) {
        velocityX *= 0.707; // 1/sqrt(2)
        velocityY *= 0.707;
    }

    // Apply velocity
    this.sprite.body.setVelocity(velocityX, velocityY);

    // Position hat above player
    this.hat.setPosition(this.sprite.x, this.sprite.y - 25);
}
```

**Step 3: Test movement**

Run: `npm run dev`
Test: Press W/A/S/D keys
Expected: Red circle moves in corresponding directions, hat follows, player stops at screen edges

**Step 4: Commit**

```bash
git add src/entities/Player.js src/scenes/GameScene.js
git commit -m "feat: implement WASD movement for player"
```

---

## Task 5: Player Shooting (Mouse)

**Files:**
- Create: `src/entities/Bullet.js`
- Modify: `src/entities/Player.js`
- Modify: `src/scenes/GameScene.js`

**Step 1: Create Bullet entity**

Create `src/entities/Bullet.js`:

```javascript
export class Bullet {
    constructor(scene, x, y, angle) {
        this.scene = scene;

        // Create bullet sprite (yellow circle)
        this.sprite = scene.add.circle(x, y, 4, 0xffff00);
        scene.physics.add.existing(this.sprite);

        // Set velocity based on angle
        const speed = 800;
        this.sprite.body.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );

        // Bullet properties
        this.damage = 10;
        this.alive = true;
    }

    update() {
        // Destroy if off screen
        const bounds = this.scene.cameras.main.worldView;
        if (this.sprite.x < bounds.x - 50 ||
            this.sprite.x > bounds.right + 50 ||
            this.sprite.y < bounds.y - 50 ||
            this.sprite.y > bounds.bottom + 50) {
            this.destroy();
        }
    }

    getSprite() {
        return this.sprite;
    }

    getDamage() {
        return this.damage;
    }

    isAlive() {
        return this.alive;
    }

    destroy() {
        this.alive = false;
        this.sprite.destroy();
    }
}
```

**Step 2: Add shooting to Player**

Modify `src/entities/Player.js`, add to constructor:

```javascript
constructor(scene, x, y) {
    // ... existing code ...

    // Shooting properties
    this.bullets = [];
    this.fireRate = 200; // milliseconds between shots
    this.nextFire = 0;

    console.log('Player created at', x, y);
}
```

Add new method to Player class:

```javascript
shoot(targetX, targetY, currentTime) {
    if (currentTime < this.nextFire) return null;

    // Calculate angle to mouse
    const angle = Math.atan2(
        targetY - this.sprite.y,
        targetX - this.sprite.x
    );

    // Create bullet
    const bullet = new this.scene.Bullet(
        this.scene,
        this.sprite.x,
        this.sprite.y,
        angle
    );

    this.bullets.push(bullet);
    this.nextFire = currentTime + this.fireRate;

    console.log('Player fired bullet');
    return bullet;
}
```

Modify Player update method:

```javascript
update(keys) {
    // ... existing movement code ...

    // Update bullets
    this.bullets = this.bullets.filter(bullet => {
        if (bullet.isAlive()) {
            bullet.update();
            return true;
        }
        return false;
    });
}
```

**Step 3: Wire shooting into GameScene**

Modify `src/scenes/GameScene.js`, add to create method after player creation:

```javascript
create() {
    // ... existing code ...

    // Create player in center
    this.player = new Player(this, 960, 540);

    // Make Bullet class available to player
    this.Bullet = Bullet;

    // Setup input
    this.keys = this.input.keyboard.addKeys({
        W: Phaser.Input.Keyboard.KeyCodes.W,
        A: Phaser.Input.Keyboard.KeyCodes.A,
        S: Phaser.Input.Keyboard.KeyCodes.S,
        D: Phaser.Input.Keyboard.KeyCodes.D
    });

    // Setup mouse input
    this.input.on('pointerdown', () => {
        this.isShooting = true;
    });

    this.input.on('pointerup', () => {
        this.isShooting = false;
    });

    this.isShooting = false;

    // ... rest of existing code ...
}
```

Add import at top:

```javascript
import { Player } from '../entities/Player.js';
import { Bullet } from '../entities/Bullet.js';
```

Modify update method:

```javascript
update(time, delta) {
    if (this.isGameOver) return;

    // Update player with input
    if (this.player) {
        this.player.update(this.keys);

        // Handle shooting
        if (this.isShooting) {
            const pointer = this.input.activePointer;
            this.player.shoot(pointer.worldX, pointer.worldY, time);
        }
    }
}
```

**Step 4: Test shooting**

Run: `npm run dev`
Test: Click and hold mouse button
Expected: Yellow bullets spawn from player and travel toward mouse cursor, console logs "Player fired bullet"

**Step 5: Commit**

```bash
git add src/entities/Bullet.js src/entities/Player.js src/scenes/GameScene.js
git commit -m "feat: implement mouse-aimed shooting for player"
```

---

## Task 6: Enemy Entity - Bandit Lobster

**Files:**
- Create: `src/entities/Enemy.js`
- Modify: `src/scenes/GameScene.js`

**Step 1: Create Enemy entity**

Create `src/entities/Enemy.js`:

```javascript
export class Enemy {
    constructor(scene, x, y, type = 'lobster') {
        this.scene = scene;
        this.type = type;

        // Create placeholder graphics (orange lobster)
        this.sprite = scene.add.circle(x, y, 15, 0xff6600);
        scene.physics.add.existing(this.sprite);

        // Physics configuration
        this.sprite.body.setCollideWorldBounds(true);

        // Enemy properties (Bandit Lobster stats)
        this.health = 30;
        this.maxHealth = 30;
        this.speed = 80;
        this.damage = 10;
        this.attackRange = 400;
        this.attackCooldown = 1000; // milliseconds
        this.nextAttack = 0;

        // Add claws indicator (two small circles)
        this.claw1 = scene.add.circle(x - 12, y, 5, 0xff3300);
        this.claw2 = scene.add.circle(x + 12, y, 5, 0xff3300);

        this.alive = true;

        console.log('Enemy created:', type, 'at', x, y);
    }

    update(time, playerX, playerY) {
        if (!this.alive) return;

        // Calculate distance to player
        const dx = playerX - this.sprite.x;
        const dy = playerY - this.sprite.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Move toward player (simple seek behavior)
        if (distance > 50) {
            const angle = Math.atan2(dy, dx);
            this.sprite.body.setVelocity(
                Math.cos(angle) * this.speed,
                Math.sin(angle) * this.speed
            );
        } else {
            this.sprite.body.setVelocity(0, 0);
        }

        // Update claw positions
        this.claw1.setPosition(this.sprite.x - 12, this.sprite.y);
        this.claw2.setPosition(this.sprite.x + 12, this.sprite.y);
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            this.kill();
        }
        console.log('Enemy took', amount, 'damage. Health:', this.health);
        return this.health;
    }

    kill() {
        this.alive = false;
        console.log('Enemy killed');
    }

    isAlive() {
        return this.alive;
    }

    getSprite() {
        return this.sprite;
    }

    getDamage() {
        return this.damage;
    }

    destroy() {
        this.sprite.destroy();
        this.claw1.destroy();
        this.claw2.destroy();
    }
}
```

**Step 2: Add enemy to GameScene**

Modify `src/scenes/GameScene.js`, add import:

```javascript
import { Enemy } from '../entities/Enemy.js';
```

Modify create method, add after player setup:

```javascript
create() {
    // ... existing code ...

    this.isShooting = false;

    // Create enemy array
    this.enemies = [];

    // Spawn a test enemy
    const testEnemy = new Enemy(this, 1400, 300, 'lobster');
    this.enemies.push(testEnemy);

    // Add UI text
    // ... rest of existing code ...
}
```

Modify update method:

```javascript
update(time, delta) {
    if (this.isGameOver) return;

    // Update player with input
    if (this.player) {
        this.player.update(this.keys);

        // Handle shooting
        if (this.isShooting) {
            const pointer = this.input.activePointer;
            this.player.shoot(pointer.worldX, pointer.worldY, time);
        }
    }

    // Update enemies
    this.enemies = this.enemies.filter(enemy => {
        if (enemy.isAlive()) {
            enemy.update(time, this.player.getX(), this.player.getY());
            return true;
        } else {
            enemy.destroy();
            return false;
        }
    });
}
```

**Step 3: Test enemy spawning and AI**

Run: `npm run dev`
Expected: Orange circle with red "claws" appears on right side of screen, moves toward player (red circle)

**Step 4: Commit**

```bash
git add src/entities/Enemy.js src/scenes/GameScene.js
git commit -m "feat: add Enemy entity with basic seek AI"
```

---

## Task 7: Bullet-Enemy Collision Detection

**Files:**
- Modify: `src/scenes/GameScene.js`

**Step 1: Add collision checking to update loop**

Modify `src/scenes/GameScene.js` update method:

```javascript
update(time, delta) {
    if (this.isGameOver) return;

    // Update player with input
    if (this.player) {
        this.player.update(this.keys);

        // Handle shooting
        if (this.isShooting) {
            const pointer = this.input.activePointer;
            this.player.shoot(pointer.worldX, pointer.worldY, time);
        }
    }

    // Update enemies
    this.enemies = this.enemies.filter(enemy => {
        if (enemy.isAlive()) {
            enemy.update(time, this.player.getX(), this.player.getY());
            return true;
        } else {
            enemy.destroy();
            return false;
        }
    });

    // Check bullet-enemy collisions
    this.checkBulletCollisions();
}
```

**Step 2: Implement collision detection method**

Add new method to GameScene class:

```javascript
checkBulletCollisions() {
    if (!this.player) return;

    const bullets = this.player.bullets;

    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        if (!bullet.isAlive()) continue;

        for (let j = this.enemies.length - 1; j >= 0; j--) {
            const enemy = this.enemies[j];
            if (!enemy.isAlive()) continue;

            // Check distance between bullet and enemy
            const dx = bullet.getSprite().x - enemy.getSprite().x;
            const dy = bullet.getSprite().y - enemy.getSprite().y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Collision if distance less than combined radii
            if (distance < 19) { // 4 (bullet) + 15 (enemy)
                enemy.takeDamage(bullet.getDamage());
                bullet.destroy();
                console.log('Bullet hit enemy!');
                break;
            }
        }
    }
}
```

**Step 3: Test collision detection**

Run: `npm run dev`
Test: Shoot bullets at orange enemy
Expected: After 3 hits (30 health / 10 damage), enemy disappears, console shows "Bullet hit enemy!" and "Enemy took 10 damage" messages

**Step 4: Commit**

```bash
git add src/scenes/GameScene.js
git commit -m "feat: implement bullet-enemy collision detection"
```

---

## Task 8: Player-Enemy Collision & Health System

**Files:**
- Modify: `src/scenes/GameScene.js`
- Modify: `src/entities/Player.js`

**Step 1: Add health UI to GameScene**

Modify `src/scenes/GameScene.js` create method, add after UI text:

```javascript
create() {
    // ... existing code ...

    // Add UI text
    this.add.text(20, 20, 'WASD: Move | Mouse: Aim & Shoot', {
        fontSize: '24px',
        color: '#ffffff',
        fontFamily: 'Arial'
    });

    // Add health display
    this.healthText = this.add.text(20, 60, 'Health: 100', {
        fontSize: '32px',
        color: '#ff0000',
        fontFamily: 'Arial'
    });
}
```

**Step 2: Add player-enemy collision detection**

Add new method to GameScene:

```javascript
checkPlayerCollisions() {
    if (!this.player || this.player.isDead()) return;

    for (let i = this.enemies.length - 1; i >= 0; i--) {
        const enemy = this.enemies[i];
        if (!enemy.isAlive()) continue;

        // Check distance between player and enemy
        const dx = this.player.getX() - enemy.getSprite().x;
        const dy = this.player.getY() - enemy.getSprite().y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Collision if distance less than combined radii
        if (distance < 35) { // 20 (player) + 15 (enemy)
            const health = this.player.takeDamage(enemy.getDamage());
            this.updateHealthUI();

            if (this.player.isDead()) {
                this.handleGameOver();
            }

            // Push enemy back to prevent stacking
            const pushAngle = Math.atan2(dy, dx);
            enemy.getSprite().setPosition(
                enemy.getSprite().x - Math.cos(pushAngle) * 40,
                enemy.getSprite().y - Math.sin(pushAngle) * 40
            );
        }
    }
}
```

Add helper methods:

```javascript
updateHealthUI() {
    if (this.player) {
        this.healthText.setText(`Health: ${this.player.health}`);
    }
}

handleGameOver() {
    console.log('Game Over!');
    this.isGameOver = true;

    // Display game over text
    this.add.text(960, 540, 'GAME OVER', {
        fontSize: '96px',
        color: '#ff0000',
        fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.add.text(960, 640, 'Refresh to restart', {
        fontSize: '36px',
        color: '#ffffff',
        fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Destroy player visually
    if (this.player) {
        this.player.destroy();
    }
}
```

**Step 3: Wire collision check into update loop**

Modify update method:

```javascript
update(time, delta) {
    if (this.isGameOver) return;

    // Update player with input
    if (this.player) {
        this.player.update(this.keys);

        // Handle shooting
        if (this.isShooting) {
            const pointer = this.input.activePointer;
            this.player.shoot(pointer.worldX, pointer.worldY, time);
        }
    }

    // Update enemies
    this.enemies = this.enemies.filter(enemy => {
        if (enemy.isAlive()) {
            enemy.update(time, this.player.getX(), this.player.getY());
            return true;
        } else {
            enemy.destroy();
            return false;
        }
    });

    // Check collisions
    this.checkBulletCollisions();
    this.checkPlayerCollisions();
}
```

**Step 4: Test health system**

Run: `npm run dev`
Test: Let enemy reach player
Expected: Health text decreases by 10, enemy gets pushed back. After 10 collisions (100 health / 10 damage), "GAME OVER" appears, console shows "Game Over!"

**Step 5: Commit**

```bash
git add src/scenes/GameScene.js src/entities/Player.js
git commit -m "feat: implement player-enemy collision and health system"
```

---

## Task 9: Wave Spawning System

**Files:**
- Create: `src/systems/WaveManager.js`
- Modify: `src/scenes/GameScene.js`

**Step 1: Create WaveManager class**

Create `src/systems/WaveManager.js`:

```javascript
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
```

**Step 2: Integrate WaveManager into GameScene**

Modify `src/scenes/GameScene.js`, add import:

```javascript
import { WaveManager } from '../systems/WaveManager.js';
```

Modify create method:

```javascript
create() {
    console.log('GameScene created');

    // Scene setup
    this.cameras.main.setBackgroundColor('#4a3428');
    this.isGameOver = false;

    // Create player in center
    this.player = new Player(this, 960, 540);

    // Make classes available globally in scene
    this.Bullet = Bullet;
    this.Enemy = Enemy;

    // Setup input
    this.keys = this.input.keyboard.addKeys({
        W: Phaser.Input.Keyboard.KeyCodes.W,
        A: Phaser.Input.Keyboard.KeyCodes.A,
        S: Phaser.Input.Keyboard.KeyCodes.S,
        D: Phaser.Input.Keyboard.KeyCodes.D
    });

    // Setup mouse input
    this.input.on('pointerdown', () => {
        this.isShooting = true;
    });

    this.input.on('pointerup', () => {
        this.isShooting = false;
    });

    this.isShooting = false;

    // Create enemy array
    this.enemies = [];

    // Initialize wave manager
    this.waveManager = new WaveManager(this);

    // Add UI text
    this.add.text(20, 20, 'WASD: Move | Mouse: Aim & Shoot', {
        fontSize: '24px',
        color: '#ffffff',
        fontFamily: 'Arial'
    });

    // Add health display
    this.healthText = this.add.text(20, 60, 'Health: 100', {
        fontSize: '32px',
        color: '#ff0000',
        fontFamily: 'Arial'
    });

    // Add wave display
    this.waveText = this.add.text(960, 20, 'Wave: 0/3', {
        fontSize: '36px',
        color: '#ffffff',
        fontFamily: 'Arial'
    }).setOrigin(0.5, 0);

    // Start first wave after brief delay
    this.time.delayedCall(1000, () => {
        this.waveManager.startNextWave();
        this.updateWaveUI();
    });
}
```

**Step 3: Update enemy cleanup to notify wave manager**

Modify update method enemy filtering:

```javascript
update(time, delta) {
    if (this.isGameOver) return;

    // Update player with input
    if (this.player) {
        this.player.update(this.keys);

        // Handle shooting
        if (this.isShooting) {
            const pointer = this.input.activePointer;
            this.player.shoot(pointer.worldX, pointer.worldY, time);
        }
    }

    // Update enemies
    this.enemies = this.enemies.filter(enemy => {
        if (enemy.isAlive()) {
            enemy.update(time, this.player.getX(), this.player.getY());
            return true;
        } else {
            enemy.destroy();
            this.waveManager.enemyKilled();
            this.updateWaveUI();
            return false;
        }
    });

    // Check collisions
    this.checkBulletCollisions();
    this.checkPlayerCollisions();
}
```

**Step 4: Add UI update and victory handler**

Add new methods to GameScene:

```javascript
updateWaveUI() {
    const current = this.waveManager.getCurrentWave();
    const max = this.waveManager.getMaxWaves();
    this.waveText.setText(`Wave: ${current}/${max}`);
}

handleVictory() {
    console.log('Victory!');
    this.isGameOver = true;

    // Display victory text
    this.add.text(960, 540, 'VICTORY!', {
        fontSize: '96px',
        color: '#00ff00',
        fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.add.text(960, 640, 'All waves completed!', {
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

**Step 5: Test wave system**

Run: `npm run dev`
Expected:
- Wave 1: 3 enemies spawn after 1 second
- After defeating all enemies, wave 2 starts after 2 seconds with 5 enemies
- After defeating wave 2, wave 3 starts with 7 enemies
- After wave 3, "VICTORY!" appears
- Console shows wave progress

**Step 6: Commit**

```bash
git add src/systems/WaveManager.js src/scenes/GameScene.js
git commit -m "feat: implement wave spawning system with 3 waves"
```

---

## Task 10: Basic Saloon Environment

**Files:**
- Modify: `src/scenes/GameScene.js`

**Step 1: Add floor visual**

Modify `src/scenes/GameScene.js` create method, add after background color:

```javascript
create() {
    console.log('GameScene created');

    // Scene setup
    this.cameras.main.setBackgroundColor('#4a3428'); // Wooden saloon floor
    this.isGameOver = false;

    // Create floor grid pattern
    this.createFloorPattern();

    // Create obstacles
    this.createObstacles();

    // ... rest of existing code ...
}
```

**Step 2: Implement floor pattern method**

Add new method to GameScene:

```javascript
createFloorPattern() {
    const graphics = this.add.graphics();

    // Draw wood plank lines
    graphics.lineStyle(2, 0x3a2a1a, 0.3);

    // Horizontal planks
    for (let y = 0; y < 1080; y += 60) {
        graphics.lineBetween(0, y, 1920, y);
    }

    // Vertical grain lines (sparse)
    for (let x = 0; x < 1920; x += 200) {
        graphics.lineBetween(x, 0, x, 1080);
    }

    // Send to back
    graphics.setDepth(-100);
}
```

**Step 3: Add obstacles (barrels/tables)**

Add new method to GameScene:

```javascript
createObstacles() {
    this.obstacles = [];

    // Create barrel obstacles (brown circles)
    const barrelPositions = [
        { x: 400, y: 300 },
        { x: 1520, y: 300 },
        { x: 400, y: 780 },
        { x: 1520, y: 780 },
        { x: 960, y: 200 },
        { x: 960, y: 880 }
    ];

    barrelPositions.forEach(pos => {
        const barrel = this.add.circle(pos.x, pos.y, 40, 0x654321);
        barrel.setStrokeStyle(4, 0x4a3428);
        this.physics.add.existing(barrel, true); // true = static body
        this.obstacles.push(barrel);
    });

    console.log('Created', this.obstacles.length, 'obstacles');
}
```

**Step 4: Add obstacle collisions**

Modify create method, add after creating obstacles:

```javascript
create() {
    // ... existing code up to obstacles ...

    // Create obstacles
    this.createObstacles();

    // Create player in center
    this.player = new Player(this, 960, 540);

    // Setup obstacle collisions with player
    this.obstacles.forEach(obstacle => {
        this.physics.add.collider(this.player.sprite, obstacle);
    });

    // ... rest of existing code ...
}
```

**Step 5: Add enemy-obstacle collisions**

Modify update method, add in enemy update section:

```javascript
update(time, delta) {
    // ... existing code ...

    // Update enemies
    this.enemies = this.enemies.filter(enemy => {
        if (enemy.isAlive()) {
            enemy.update(time, this.player.getX(), this.player.getY());

            // Check obstacle collisions for enemy
            this.obstacles.forEach(obstacle => {
                const dx = enemy.getSprite().x - obstacle.x;
                const dy = enemy.getSprite().y - obstacle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 55) { // 15 (enemy) + 40 (obstacle)
                    // Push enemy away from obstacle
                    const pushAngle = Math.atan2(dy, dx);
                    enemy.getSprite().x = obstacle.x + Math.cos(pushAngle) * 55;
                    enemy.getSprite().y = obstacle.y + Math.sin(pushAngle) * 55;
                }
            });

            return true;
        } else {
            enemy.destroy();
            this.waveManager.enemyKilled();
            this.updateWaveUI();
            return false;
        }
    });

    // ... rest of existing code ...
}
```

**Step 6: Test environment**

Run: `npm run dev`
Expected:
- Brown floor with wood grain lines visible
- 6 brown circle "barrels" positioned around arena
- Player cannot pass through barrels
- Enemies path around barrels

**Step 7: Commit**

```bash
git add src/scenes/GameScene.js
git commit -m "feat: add basic saloon environment with floor and obstacles"
```

---

## Task 11: Final Polish & Testing

**Files:**
- Modify: `src/scenes/GameScene.js`
- Create: `README.md`

**Step 1: Add visual feedback for hits**

Modify `src/scenes/GameScene.js` checkBulletCollisions method:

```javascript
checkBulletCollisions() {
    if (!this.player) return;

    const bullets = this.player.bullets;

    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        if (!bullet.isAlive()) continue;

        for (let j = this.enemies.length - 1; j >= 0; j--) {
            const enemy = this.enemies[j];
            if (!enemy.isAlive()) continue;

            // Check distance between bullet and enemy
            const dx = bullet.getSprite().x - enemy.getSprite().x;
            const dy = bullet.getSprite().y - enemy.getSprite().y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Collision if distance less than combined radii
            if (distance < 19) { // 4 (bullet) + 15 (enemy)
                enemy.takeDamage(bullet.getDamage());
                bullet.destroy();

                // Screen shake on hit
                this.cameras.main.shake(100, 0.002);

                // Flash enemy white
                enemy.getSprite().setFillStyle(0xffffff);
                this.time.delayedCall(100, () => {
                    if (enemy.isAlive()) {
                        enemy.getSprite().setFillStyle(0xff6600);
                    }
                });

                console.log('Bullet hit enemy!');
                break;
            }
        }
    }
}
```

**Step 2: Add enemy count to UI**

Modify create method, add after wave text:

```javascript
create() {
    // ... existing code ...

    // Add wave display
    this.waveText = this.add.text(960, 20, 'Wave: 0/3', {
        fontSize: '36px',
        color: '#ffffff',
        fontFamily: 'Arial'
    }).setOrigin(0.5, 0);

    // Add enemy count display
    this.enemyText = this.add.text(960, 65, 'Enemies: 0', {
        fontSize: '28px',
        color: '#ffaa00',
        fontFamily: 'Arial'
    }).setOrigin(0.5, 0);

    // ... rest of code ...
}
```

Modify updateWaveUI method:

```javascript
updateWaveUI() {
    const current = this.waveManager.getCurrentWave();
    const max = this.waveManager.getMaxWaves();
    const enemiesAlive = this.enemies.filter(e => e.isAlive()).length;

    this.waveText.setText(`Wave: ${current}/${max}`);
    this.enemyText.setText(`Enemies: ${enemiesAlive}`);
}
```

**Step 3: Create README with setup instructions**

Create `README.md`:

```markdown
# Gisela's Last Stand - Phase 1 Prototype

A twin-stick wave survival shooter featuring Gisela the cowboy crab defending her saloon from bandit lobsters.

## Phase 1 Features

- ✅ Twin-stick movement (WASD)
- ✅ Mouse-aimed shooting
- ✅ Enemy AI (Bandit Lobsters with seek behavior)
- ✅ 3-wave spawning system
- ✅ Health system with game over
- ✅ Basic saloon environment with obstacles
- ✅ Collision detection (bullets, player, obstacles)

## How to Play

### Setup
1. Clone this repository
2. Run a local web server in the project directory:
   ```bash
   npm run dev
   ```
3. Open browser to `http://localhost:8000`

### Controls
- **WASD** - Move player (red crab)
- **Mouse** - Aim
- **Left Click (hold)** - Shoot

### Objective
Survive 3 waves of increasing enemy counts. Enemies deal damage on contact. Defeat all enemies in a wave to progress.

### Game Over Conditions
- **Victory:** Complete all 3 waves
- **Defeat:** Player health reaches 0

## Project Structure

```
game/
├── index.html           # Entry point
├── src/
│   ├── main.js         # Game initialization
│   ├── config.js       # Phaser configuration
│   ├── scenes/
│   │   └── GameScene.js    # Main game scene
│   ├── entities/
│   │   ├── Player.js       # Player entity
│   │   ├── Enemy.js        # Enemy entity
│   │   └── Bullet.js       # Bullet entity
│   └── systems/
│       └── WaveManager.js  # Wave spawning system
└── docs/
    └── plans/
        └── 2025-11-12-phase-1-core-loop.md  # This implementation plan
```

## Tech Stack

- **Engine:** Phaser.js 3.80.1 (CDN)
- **Language:** JavaScript ES6 modules
- **Platform:** Browser (HTML5)

## Known Limitations (Phase 1)

- Placeholder graphics (colored circles)
- No audio
- Single player only
- Basic collision (circle-based)
- No scoring system
- No powerups/cocktails
- No bounty enemies

These features are planned for later phases.

## Next Steps (Phase 2)

- Add multiple enemy types (5 total)
- Expand to 10 waves
- Implement difficulty scaling
- Add health pickups
- Improve enemy spawn patterns

## Development

See `docs/plans/2025-11-12-phase-1-core-loop.md` for detailed implementation plan.

## License

[Your license here]
```

**Step 4: Full playthrough test**

Run: `npm run dev`
Test checklist:
- ✅ Player spawns at center
- ✅ WASD movement works, stops at edges
- ✅ Clicking shoots bullets toward mouse
- ✅ Wave 1 spawns 3 enemies after 1 second
- ✅ Enemies move toward player
- ✅ Bullets destroy enemies after 3 hits
- ✅ Touching enemies damages player
- ✅ Health UI updates correctly
- ✅ Enemies avoid obstacles
- ✅ Player collides with obstacles
- ✅ Wave 2 starts after killing all wave 1 enemies (5 enemies)
- ✅ Wave 3 starts after wave 2 (7 enemies)
- ✅ Victory screen appears after wave 3
- ✅ Game over appears when health reaches 0

**Step 5: Fix any bugs found during testing**

(Document any bugs found and fixes applied)

**Step 6: Final commit**

```bash
git add README.md src/scenes/GameScene.js
git commit -m "feat: add visual polish and complete Phase 1 prototype"
```

**Step 7: Tag release**

```bash
git tag -a v0.1.0-phase1 -m "Phase 1: Core Loop complete"
```

---

## Implementation Complete

**Phase 1 Success Criteria:**
- ✅ Twin-stick combat feels responsive
- ✅ Movement with WASD is smooth
- ✅ Shooting with mouse is intuitive
- ✅ Enemy AI provides basic challenge
- ✅ Wave progression works correctly
- ✅ Health system creates stakes
- ✅ Environment has basic obstacles
- ✅ Game has clear win/loss states

**Files Created:**
- `index.html` - Entry point
- `src/main.js` - Game initialization
- `src/config.js` - Phaser config
- `src/scenes/GameScene.js` - Main game logic
- `src/entities/Player.js` - Player entity
- `src/entities/Enemy.js` - Enemy entity
- `src/entities/Bullet.js` - Bullet entity
- `src/systems/WaveManager.js` - Wave spawning
- `docs/plans/2025-11-12-phase-1-core-loop.md` - This plan
- `README.md` - Project documentation
- `.gitignore` - Git ignore rules

**Total Commits:** 11

**Estimated Time:** 2-3 hours for experienced developer with zero context

---

## Future Enhancements (Not in Phase 1)

These are explicitly out of scope for Phase 1 but documented for future reference:

- Sprite assets (replacing placeholder circles)
- Additional enemy types (shrimp, hermit crabs, jellyfish, flying fish)
- Bounty enemy system
- Cocktail powerup system
- Scoring system
- Multiplayer (2-4 players)
- Gamepad support
- Audio (music, SFX)
- Particle effects
- More sophisticated enemy AI
- Boss waves
- Victory ceremony
- High score persistence

**Next Phase:** See design document Phase 2 for enemy variety implementation.
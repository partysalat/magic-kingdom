# Local Multiplayer (1-4 Players) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add local multiplayer support (1-4 players) with gamepad join screen, shared camera, competitive scoring, and permanent death spectator mode.

**Architecture:** Create StartScene for player joining, PlayerManager to coordinate multiple Player instances with individual InputManagers, update camera to follow center point of living players, modify UI to show all player stats, and update game over/victory logic for multiplayer.

**Tech Stack:** Phaser.js 3, JavaScript ES6 modules, Phaser Gamepad API, localStorage for high scores

---

## Phase 1: Core Multiplayer Foundation

### Task 1: Create PlayerManager System

**Files:**
- Create: `/Users/ben/git/private/magic-kingdom/game/src/systems/PlayerManager.js`

**Step 1: Create PlayerManager class structure**

Create `/Users/ben/git/private/magic-kingdom/game/src/systems/PlayerManager.js`:

```javascript
import { Player } from '../entities/Player.js';
import { InputManager } from './InputManager.js';

export class PlayerManager {
    constructor(scene, playerConfigs) {
        this.scene = scene;
        this.players = [];
        this.inputManagers = [];

        this.createPlayers(playerConfigs);
    }

    createPlayers(playerConfigs) {
        // Spawn position logic based on player count
        const spawnPositions = this.calculateSpawnPositions(playerConfigs.length);

        playerConfigs.forEach((config, index) => {
            const pos = spawnPositions[index];
            const player = new Player(this.scene, pos.x, pos.y, config.color);
            player.playerName = config.name;
            player.playerIndex = config.index;
            player.isDead = false;

            this.players.push(player);

            // Create InputManager for this player
            const inputManager = new InputManager(this.scene, config.index);
            this.inputManagers.push(inputManager);
        });
    }

    calculateSpawnPositions(playerCount) {
        const centerX = 960;
        const centerY = 540;

        switch(playerCount) {
            case 1:
                return [{ x: centerX, y: centerY }];
            case 2:
                return [
                    { x: 800, y: centerY },
                    { x: 1120, y: centerY }
                ];
            case 3:
                return [
                    { x: centerX, y: 450 },
                    { x: 800, y: 630 },
                    { x: 1120, y: 630 }
                ];
            case 4:
                return [
                    { x: 800, y: 450 },
                    { x: 1120, y: 450 },
                    { x: 800, y: 630 },
                    { x: 1120, y: 630 }
                ];
            default:
                return [{ x: centerX, y: centerY }];
        }
    }

    getLivingPlayers() {
        return this.players.filter(player => !player.isDead);
    }

    getCenterPoint() {
        const living = this.getLivingPlayers();

        if (living.length === 0) {
            // No living players, return last known center or default
            return { x: 960, y: 540 };
        }

        const sumX = living.reduce((sum, p) => sum + p.sprite.x, 0);
        const sumY = living.reduce((sum, p) => sum + p.sprite.y, 0);

        return {
            x: sumX / living.length,
            y: sumY / living.length
        };
    }

    handlePlayerDeath(player) {
        player.isDead = true;
        // Play death animation if it exists
        if (player.sprite.anims.exists(`gisela-${player.color}-death`)) {
            player.sprite.play(`gisela-${player.color}-death`);
        }
        // Disable physics
        player.sprite.body.enable = false;
        // Fade out sprite
        this.scene.tweens.add({
            targets: player.sprite,
            alpha: 0.5,
            duration: 500
        });
    }

    allPlayersDead() {
        return this.players.every(player => player.isDead);
    }

    update(time, delta) {
        // Update all living players
        this.getLivingPlayers().forEach((player, index) => {
            const inputManager = this.inputManagers[player.playerIndex];
            const inputState = inputManager.getInputState();

            // Convert input state to keys format for player update
            const keys = {
                W: { isDown: inputState.movement.up },
                A: { isDown: inputState.movement.left },
                S: { isDown: inputState.movement.down },
                D: { isDown: inputState.movement.right }
            };

            player.update(keys);
        });
    }

    getPlayerByIndex(index) {
        return this.players.find(p => p.playerIndex === index);
    }
}
```

**Step 2: Verify file created**

Run: `ls -la /Users/ben/git/private/magic-kingdom/game/src/systems/PlayerManager.js`

Expected: File exists with above content

**Step 3: Commit**

```bash
git add src/systems/PlayerManager.js
git commit -m "feat: add PlayerManager system for multiplayer coordination"
```

---

### Task 2: Create StartScene for Player Joining

**Files:**
- Create: `/Users/ben/git/private/magic-kingdom/game/src/scenes/StartScene.js`

**Step 1: Create StartScene structure**

Create `/Users/ben/git/private/magic-kingdom/game/src/scenes/StartScene.js`:

```javascript
export class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StartScene' });
    }

    create() {
        this.cameras.main.setBackgroundColor('#2d1810'); // Dark western brown

        // Player join state
        this.joinedPlayers = [];
        this.maxPlayers = 4;
        this.colors = ['red', 'blue', 'green', 'yellow'];

        // Track button states to detect "any button" press
        this.lastGamepadStates = [{}, {}, {}, {}];

        this.createUI();
        this.loadHighScores();
    }

    createUI() {
        const centerX = 960;

        // Title
        this.add.text(centerX, 150, "GISELA'S LAST STAND", {
            fontSize: '80px',
            color: '#ff6b35',
            fontFamily: 'Georgia, serif',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(centerX, 230, 'CRUSTACEAN WESTERN SHOWDOWN', {
            fontSize: '32px',
            color: '#ffffff',
            fontFamily: 'Georgia, serif'
        }).setOrigin(0.5);

        // Player slots (4 boxes)
        this.playerSlots = [];
        const slotStartX = 360;
        const slotY = 400;
        const slotSpacing = 280;

        for (let i = 0; i < 4; i++) {
            const x = slotStartX + (i * slotSpacing);
            const slot = this.createPlayerSlot(x, slotY, i);
            this.playerSlots.push(slot);
        }

        // Join instructions
        this.joinText = this.add.text(centerX, 650, 'Press any button to join (1-4 players)', {
            fontSize: '28px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Start instructions (hidden until at least one player joins)
        this.startText = this.add.text(centerX, 950, 'Press START to begin game', {
            fontSize: '32px',
            color: '#00ff00',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.startText.setVisible(false);

        // High scores section
        this.createHighScoresDisplay();
    }

    createPlayerSlot(x, y, playerIndex) {
        // Background box
        const box = this.add.rectangle(x, y, 200, 180, 0x3d2817, 0.8);
        box.setStrokeStyle(4, 0x8b6f47);

        // Player number
        const numberText = this.add.text(x, y - 60, `PLAYER ${playerIndex + 1}`, {
            fontSize: '20px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Crab sprite placeholder (invisible until player joins)
        const crabSprite = this.add.sprite(x, y, `gisela-${this.colors[playerIndex]}`);
        crabSprite.setScale(0.5);
        crabSprite.setVisible(false);

        // Ready text
        const readyText = this.add.text(x, y + 60, '---', {
            fontSize: '24px',
            color: '#888888',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        return {
            box,
            numberText,
            crabSprite,
            readyText,
            joined: false
        };
    }

    createHighScoresDisplay() {
        const x = 960;
        const y = 750;

        this.add.text(x, y, 'HIGH SCORES', {
            fontSize: '32px',
            color: '#ffcc00',
            fontFamily: 'Georgia, serif',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Display top 5 scores (will populate in loadHighScores)
        this.highScoreTexts = [];
        for (let i = 0; i < 5; i++) {
            const scoreText = this.add.text(x, y + 50 + (i * 30), '', {
                fontSize: '20px',
                color: '#ffffff',
                fontFamily: 'Arial'
            }).setOrigin(0.5);
            this.highScoreTexts.push(scoreText);
        }
    }

    loadHighScores() {
        try {
            const stored = localStorage.getItem('giselasLastStand_highScores');
            const scores = stored ? JSON.parse(stored) : [];

            // Sort by score descending, take top 5
            const topScores = scores.sort((a, b) => b.score - a.score).slice(0, 5);

            topScores.forEach((entry, index) => {
                const dots = '.'.repeat(20 - entry.playerName.length);
                this.highScoreTexts[index].setText(
                    `${index + 1}. ${entry.playerName} ${dots} ${entry.score.toLocaleString()} pts`
                );
            });

            // Fill remaining slots with placeholder
            for (let i = topScores.length; i < 5; i++) {
                this.highScoreTexts[i].setText(`${i + 1}. ........................ --- pts`);
            }
        } catch (error) {
            console.error('Error loading high scores:', error);
        }
    }

    update() {
        // Check for player joins (any button on any gamepad)
        this.checkForPlayerJoins();

        // Check for START button to begin game
        if (this.joinedPlayers.length > 0) {
            this.checkForGameStart();
        }
    }

    checkForPlayerJoins() {
        // Check gamepads 0-3
        for (let i = 0; i < 4; i++) {
            const pad = this.input.gamepad.getPad(i);

            if (!pad) continue;

            // Check if this player already joined
            const alreadyJoined = this.joinedPlayers.some(p => p.index === i);
            if (alreadyJoined) continue;

            // Check if max players reached
            if (this.joinedPlayers.length >= this.maxPlayers) continue;

            // Detect "any button" press (check all buttons)
            const anyButtonPressed = pad.buttons.some((button, btnIndex) => {
                const wasPressed = this.lastGamepadStates[i][btnIndex] || false;
                const isPressed = button.pressed;

                // Update state
                this.lastGamepadStates[i][btnIndex] = isPressed;

                // Return true if button was just pressed (edge detection)
                return isPressed && !wasPressed;
            });

            if (anyButtonPressed) {
                this.addPlayer(i);
            }
        }

        // Also check keyboard for Player 1 (index 0)
        if (this.joinedPlayers.length === 0) {
            const keys = this.input.keyboard.addKeys('W,A,S,D,SPACE,ENTER');
            if (Object.values(keys).some(key => Phaser.Input.Keyboard.JustDown(key))) {
                this.addPlayer(0);
            }
        }
    }

    addPlayer(gamepadIndex) {
        const playerNumber = this.joinedPlayers.length + 1;
        const color = this.colors[this.joinedPlayers.length];

        const playerConfig = {
            index: gamepadIndex,
            color: color,
            name: `Player ${playerNumber}`
        };

        this.joinedPlayers.push(playerConfig);

        // Update UI slot
        const slotIndex = this.joinedPlayers.length - 1;
        const slot = this.playerSlots[slotIndex];
        slot.crabSprite.setVisible(true);
        slot.crabSprite.play(`gisela-${color}-idle`);
        slot.readyText.setText('READY');
        slot.readyText.setColor('#00ff00');
        slot.joined = true;

        // Show start text if first player
        if (this.joinedPlayers.length === 1) {
            this.startText.setVisible(true);
        }

        // Play sound effect (if available)
        // this.sound.play('player-join');
    }

    checkForGameStart() {
        // Check if any joined player presses START button
        for (const playerConfig of this.joinedPlayers) {
            const pad = this.input.gamepad.getPad(playerConfig.index);

            if (pad && pad.buttons[9] && pad.buttons[9].pressed) {
                this.startGame();
                return;
            }
        }

        // Also check keyboard ENTER for Player 1
        if (this.joinedPlayers.some(p => p.index === 0)) {
            if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('ENTER'))) {
                this.startGame();
            }
        }
    }

    startGame() {
        // Transition to GameScene with player configs
        this.scene.start('GameScene', {
            players: this.joinedPlayers
        });
    }
}
```

**Step 2: Verify file created**

Run: `ls -la /Users/ben/git/private/magic-kingdom/game/src/scenes/StartScene.js`

Expected: File exists

**Step 3: Commit**

```bash
git add src/scenes/StartScene.js
git commit -m "feat: add StartScene for multiplayer player joining"
```

---

### Task 3: Update main.js to start with StartScene

**Files:**
- Modify: `/Users/ben/git/private/magic-kingdom/game/src/main.js`

**Step 1: Import StartScene and add to scene array**

Find the scene array in `main.js` and add StartScene as the first scene:

```javascript
import { StartScene } from './scenes/StartScene.js';
import { PreloadScene } from './scenes/PreloadScene.js';
import { GameScene } from './scenes/GameScene.js';

// ... existing config ...

scene: [PreloadScene, StartScene, GameScene]
```

**Step 2: Update PreloadScene to transition to StartScene**

Modify `/Users/ben/git/private/magic-kingdom/game/src/scenes/PreloadScene.js`:

Find where it transitions to GameScene and change to StartScene:

```javascript
// After all assets loaded
this.scene.start('StartScene'); // Changed from 'GameScene'
```

**Step 3: Test in browser**

Run: `npm run dev`

Expected: Game loads to StartScene with title, player slots, and high scores

**Step 4: Commit**

```bash
git add src/main.js src/scenes/PreloadScene.js
git commit -m "feat: set StartScene as initial scene after preload"
```

---

### Task 4: Update GameScene to use PlayerManager

**Files:**
- Modify: `/Users/ben/git/private/magic-kingdom/game/src/scenes/GameScene.js`

**Step 1: Import PlayerManager and update create() method**

At the top of GameScene.js, add import:

```javascript
import { PlayerManager } from '../systems/PlayerManager.js';
```

In the `create()` method, replace single player creation with PlayerManager:

```javascript
create(data) {
    // Scene setup
    this.cameras.main.setBackgroundColor('#4a3428');
    this.isGameOver = false;

    // Get player configs from StartScene
    const playerConfigs = data.players || [
        { index: 0, color: 'red', name: 'Player 1' } // Fallback for testing
    ];

    // Create floor grid pattern
    this.createFloorPattern();

    // Create PlayerManager instead of single player
    this.playerManager = new PlayerManager(this, playerConfigs);

    // Make classes available globally in scene
    this.Bullet = Bullet;
    this.Enemy = Enemy;
    this.HealthPickup = HealthPickup;
    this.Cocktail = Cocktail;
    this.COCKTAIL_TYPES = COCKTAIL_TYPES;

    // Remove old single player input manager
    // this.inputManager = new InputManager(this, 0);

    // Create target selector (will need update for multiplayer)
    this.targetSelector = new TargetSelector(this);

    // ... rest of create() method ...
}
```

**Step 2: Update update() method to use PlayerManager**

In the `update()` method, replace player update with PlayerManager update:

```javascript
update(time, delta) {
    if (this.isGameOver) return;

    // Update PlayerManager (handles all players and input)
    this.playerManager.update(time, delta);

    // Update camera to follow center point of living players
    const center = this.playerManager.getCenterPoint();
    this.cameras.main.centerOn(center.x, center.y);

    // ... rest of update() method ...
}
```

**Step 3: Replace this.player references with playerManager**

Find all references to `this.player` and update for multiplayer:

- Health checks: Change to check if all players dead
- Shooting: Update to loop through living players
- Collision: Update to check against all players

Example for shooting:

```javascript
// OLD:
const inputState = this.inputManager.getInputState();
if (inputState.isFiring && this.targetSelector.currentTarget) {
    this.player.shoot(this.targetSelector.currentTarget, time);
}

// NEW:
this.playerManager.getLivingPlayers().forEach(player => {
    const inputManager = this.playerManager.inputManagers[player.playerIndex];
    const inputState = inputManager.getInputState();

    if (inputState.isFiring && this.targetSelector.currentTarget) {
        player.shoot(this.targetSelector.currentTarget, time);
    }
});
```

**Step 4: Update game over condition**

Find the game over check and update:

```javascript
// OLD:
if (this.player.health <= 0 && !this.isGameOver) {
    this.gameOver();
}

// NEW:
if (this.playerManager.allPlayersDead() && !this.isGameOver) {
    this.gameOver();
}
```

**Step 5: Test in browser**

Run: `npm run dev`

Expected: Can join multiple players in StartScene, game starts with all players spawning

**Step 6: Commit**

```bash
git add src/scenes/GameScene.js
git commit -m "feat: integrate PlayerManager into GameScene for multiplayer"
```

---

### Task 5: Update Player.js to handle playerName and death

**Files:**
- Modify: `/Users/ben/git/private/magic-kingdom/game/src/entities/Player.js`

**Step 1: Add playerName and isDead properties**

In the Player constructor, add after existing properties:

```javascript
constructor(scene, x, y, color = 'red') {
    this.scene = scene;
    this.color = color;

    // ... existing sprite and physics setup ...

    // Player properties
    this.speed = 300;
    this.speedMultiplier = 1.0;
    this.health = 100;
    this.maxHealth = 100;

    // Multiplayer properties
    this.playerName = 'Player 1'; // Will be set by PlayerManager
    this.playerIndex = 0; // Will be set by PlayerManager
    this.isDead = false;

    // ... rest of constructor ...
}
```

**Step 2: Add takeDamage method to notify PlayerManager**

Add method to Player class:

```javascript
takeDamage(amount) {
    const currentTime = this.scene.time.now;

    // Check if still in cooldown
    if (currentTime < this.lastHitTime + this.hitCooldown) {
        return false; // No damage taken
    }

    this.health -= amount;
    this.lastHitTime = currentTime;

    // Flash sprite
    this.sprite.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
        this.sprite.clearTint();
    });

    // Check for death
    if (this.health <= 0 && !this.isDead) {
        this.scene.playerManager.handlePlayerDeath(this);
    }

    return true; // Damage was applied
}
```

**Step 3: Update existing damage logic to use takeDamage**

Find places where player.health is reduced directly and replace with:

```javascript
// OLD:
this.player.health -= 10;

// NEW:
player.takeDamage(10);
```

**Step 4: Commit**

```bash
git add src/entities/Player.js
git commit -m "feat: add death handling and playerName to Player entity"
```

---

### Task 6: Update Bullet.js to skip friendly fire

**Files:**
- Modify: `/Users/ben/git/private/magic-kingdom/game/src/entities/Bullet.js`

**Step 1: Update collision check to skip all players**

Find the collision detection in Bullet.js and update:

```javascript
checkCollision(other) {
    // Skip collision with source player (shooter)
    if (other === this.source) {
        return false;
    }

    // Skip collision with ALL players (no friendly fire)
    if (other.constructor.name === 'Player') {
        return false;
    }

    // ... rest of collision logic ...
}
```

**Step 2: Verify no friendly fire in EnemyBullet**

Check `/Users/ben/git/private/magic-kingdom/game/src/entities/EnemyBullet.js` to ensure it hits players:

```javascript
checkCollision(other) {
    // Enemy bullets should damage players
    if (other.constructor.name === 'Player') {
        return true; // Allow collision
    }

    // ... rest of logic ...
}
```

**Step 3: Test in browser**

Run: `npm run dev`

Expected: Player bullets pass through teammates, enemy bullets hit all players

**Step 4: Commit**

```bash
git add src/entities/Bullet.js src/entities/EnemyBullet.js
git commit -m "feat: disable friendly fire between players"
```

---

## Phase 2: UI and Polish

### Task 7: Update UI to show all player health bars

**Files:**
- Modify: `/Users/ben/git/private/magic-kingdom/game/src/scenes/GameScene.js`

**Step 1: Create health bars for all players**

Add method to GameScene:

```javascript
createPlayerHealthBars() {
    this.playerHealthBars = [];

    const players = this.playerManager.players;

    // Position health bars in corners
    const positions = [
        { x: 20, y: 100 },   // P1: Top-left
        { x: 1700, y: 100 }, // P2: Top-right
        { x: 20, y: 980 },   // P3: Bottom-left
        { x: 1700, y: 980 }  // P4: Bottom-right
    ];

    players.forEach((player, index) => {
        const pos = positions[index];
        const healthBar = this.createHealthBar(pos.x, pos.y, player);
        this.playerHealthBars.push(healthBar);
    });
}

createHealthBar(x, y, player) {
    // Background
    const bg = this.add.rectangle(x, y, 200, 40, 0x000000, 0.7);
    bg.setOrigin(0, 0);

    // Player name with color
    const colorTints = { red: 0xff6b6b, blue: 0x4dabf7, green: 0x51cf66, yellow: 0xffd43b };
    const nameText = this.add.text(x + 10, y + 5, player.playerName, {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'Arial'
    });
    nameText.setTint(colorTints[player.color]);

    // Health bar (red background)
    const healthBg = this.add.rectangle(x + 10, y + 25, 180, 10, 0x8b0000);
    healthBg.setOrigin(0, 0);

    // Health bar (green foreground)
    const healthFg = this.add.rectangle(x + 10, y + 25, 180, 10, 0x00ff00);
    healthFg.setOrigin(0, 0);

    return {
        player,
        bg,
        nameText,
        healthBg,
        healthFg
    };
}
```

**Step 2: Update health bars in update loop**

In update() method:

```javascript
update(time, delta) {
    // ... existing update code ...

    // Update health bars
    if (this.playerHealthBars) {
        this.playerHealthBars.forEach(bar => {
            const player = bar.player;
            const healthPercent = player.health / player.maxHealth;

            // Update health bar width
            bar.healthFg.width = 180 * Math.max(0, healthPercent);

            // Grey out if dead
            if (player.isDead) {
                bar.bg.setAlpha(0.4);
                bar.nameText.setAlpha(0.4);
                bar.healthBg.setAlpha(0.4);
                bar.healthFg.setAlpha(0.4);
            }
        });
    }
}
```

**Step 3: Call createPlayerHealthBars in create()**

In create() method, after PlayerManager creation:

```javascript
create(data) {
    // ... existing setup ...

    this.playerManager = new PlayerManager(this, playerConfigs);

    // Create UI for all players
    this.createPlayerHealthBars();

    // ... rest of create ...
}
```

**Step 4: Test in browser**

Run: `npm run dev`

Expected: Health bars appear in corners for all players, update in real-time

**Step 5: Commit**

```bash
git add src/scenes/GameScene.js
git commit -m "feat: add multiplayer health bars UI"
```

---

### Task 8: Update scoreboard for multiplayer

**Files:**
- Modify: `/Users/ben/git/private/magic-kingdom/game/src/systems/ScoreManager.js`

**Step 1: Update ScoreManager to track per-player scores**

Modify ScoreManager constructor:

```javascript
constructor(scene) {
    this.scene = scene;
    this.playerScores = {}; // Object keyed by playerIndex

    // Initialize scores for all players
    if (scene.playerManager) {
        scene.playerManager.players.forEach(player => {
            this.playerScores[player.playerIndex] = {
                name: player.playerName,
                color: player.color,
                score: 0,
                kills: 0,
                bountiesClaimed: 0
            };
        });
    }

    this.createScoreboardUI();
}
```

**Step 2: Add method to credit kill to specific player**

```javascript
addKillToPlayer(playerIndex, points) {
    if (!this.playerScores[playerIndex]) return;

    this.playerScores[playerIndex].score += points;
    this.playerScores[playerIndex].kills += 1;

    this.updateScoreboardUI();
}

addBountyToPlayer(playerIndex, points) {
    if (!this.playerScores[playerIndex]) return;

    this.playerScores[playerIndex].score += points;
    this.playerScores[playerIndex].bountiesClaimed += 1;

    this.updateScoreboardUI();
}
```

**Step 3: Create scoreboard UI showing all players**

```javascript
createScoreboardUI() {
    const x = 960;
    const y = 20;

    // Title
    this.scoreTitle = this.scene.add.text(x, y, 'SCORES', {
        fontSize: '24px',
        color: '#ffcc00',
        fontFamily: 'Arial',
        fontStyle: 'bold'
    }).setOrigin(0.5, 0);

    // Player score texts
    this.scoreTexts = {};
    Object.keys(this.playerScores).forEach((playerIndex, index) => {
        const playerData = this.playerScores[playerIndex];
        const scoreText = this.scene.add.text(x, y + 30 + (index * 25), '', {
            fontSize: '18px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5, 0);

        this.scoreTexts[playerIndex] = scoreText;
    });

    this.updateScoreboardUI();
}

updateScoreboardUI() {
    // Sort players by score
    const sorted = Object.entries(this.playerScores)
        .sort(([,a], [,b]) => b.score - a.score);

    sorted.forEach(([playerIndex, data], index) => {
        const scoreText = this.scoreTexts[playerIndex];
        if (scoreText) {
            const colorName = data.color.charAt(0).toUpperCase() + data.color.slice(1);
            scoreText.setText(`${data.name} (${colorName}) .... ${data.score}`);
        }
    });
}
```

**Step 4: Update enemy kill logic to credit correct player**

In GameScene, when enemy is killed:

```javascript
// Find which player's bullet killed the enemy
const killerPlayer = this.playerManager.players.find(p =>
    p.bullets.some(b => b.hasHit(enemy))
);

if (killerPlayer) {
    this.scoreManager.addKillToPlayer(killerPlayer.playerIndex, 10);
}
```

**Step 5: Test in browser**

Run: `npm run dev`

Expected: Scoreboard shows all players, updates when enemies killed

**Step 6: Commit**

```bash
git add src/systems/ScoreManager.js src/scenes/GameScene.js
git commit -m "feat: update ScoreManager for multiplayer scoring"
```

---

### Task 9: Update Game Over screen for multiplayer

**Files:**
- Modify: `/Users/ben/git/private/magic-kingdom/game/src/scenes/GameScene.js`

**Step 1: Update gameOver() method to show all player scores**

Find gameOver() method and update:

```javascript
gameOver() {
    this.isGameOver = true;

    // Stop all game activity
    this.waveManager.stopWaves();

    // Get final scores sorted by score
    const finalScores = Object.values(this.scoreManager.playerScores)
        .sort((a, b) => b.score - a.score);

    // Find MVP (highest score)
    const mvp = finalScores[0];

    // Create game over UI
    const centerX = 960;
    const centerY = 300;

    // Dim background
    const overlay = this.add.rectangle(0, 0, 1920, 1080, 0x000000, 0.8);
    overlay.setOrigin(0, 0);
    overlay.setDepth(1000);

    // GAME OVER text
    const gameOverText = this.add.text(centerX, centerY, 'GAME OVER', {
        fontSize: '80px',
        color: '#ff0000',
        fontFamily: 'Georgia, serif',
        fontStyle: 'bold'
    }).setOrigin(0.5);
    gameOverText.setDepth(1001);

    // Wave survived
    const waveText = this.add.text(centerX, centerY + 100,
        `Survived to Wave ${this.waveManager.currentWave}/10`, {
        fontSize: '32px',
        color: '#ffffff',
        fontFamily: 'Arial'
    }).setOrigin(0.5);
    waveText.setDepth(1001);

    // Final scoreboard
    let yOffset = centerY + 180;
    this.add.text(centerX, yOffset, 'FINAL SCORES', {
        fontSize: '36px',
        color: '#ffcc00',
        fontFamily: 'Arial',
        fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(1001);

    yOffset += 50;
    finalScores.forEach((playerData, index) => {
        const isMVP = index === 0;
        const text = this.add.text(centerX, yOffset,
            `${playerData.name}: ${playerData.score} pts (${playerData.kills} kills)${isMVP ? ' 👑 MVP' : ''}`, {
            fontSize: isMVP ? '28px' : '24px',
            color: isMVP ? '#ffd700' : '#ffffff',
            fontFamily: 'Arial',
            fontStyle: isMVP ? 'bold' : 'normal'
        }).setOrigin(0.5);
        text.setDepth(1001);

        yOffset += 40;
    });

    // Return to lobby instruction
    this.add.text(centerX, centerY + 500, 'Press START to return to lobby', {
        fontSize: '28px',
        color: '#00ff00',
        fontFamily: 'Arial'
    }).setOrigin(0.5).setDepth(1001);

    // Listen for START button
    this.input.keyboard.once('keydown-ENTER', () => {
        this.scene.start('StartScene');
    });
}
```

**Step 2: Save high scores to localStorage**

Add method to save scores:

```javascript
saveHighScores() {
    try {
        const existing = localStorage.getItem('giselasLastStand_highScores');
        const scores = existing ? JSON.parse(existing) : [];

        // Add all player scores from this game
        Object.values(this.scoreManager.playerScores).forEach(playerData => {
            scores.push({
                playerName: playerData.name,
                score: playerData.score,
                wave: this.waveManager.currentWave
            });
        });

        // Sort and keep top 50
        scores.sort((a, b) => b.score - a.score);
        const topScores = scores.slice(0, 50);

        localStorage.setItem('giselasLastStand_highScores', JSON.stringify(topScores));
    } catch (error) {
        console.error('Error saving high scores:', error);
    }
}
```

Call in gameOver():

```javascript
gameOver() {
    this.isGameOver = true;

    // Save high scores
    this.saveHighScores();

    // ... rest of gameOver logic ...
}
```

**Step 3: Test in browser**

Run: `npm run dev`

Expected: Game over shows all players, MVP highlighted, can return to lobby

**Step 4: Commit**

```bash
git add src/scenes/GameScene.js
git commit -m "feat: add multiplayer game over screen with MVP"
```

---

### Task 10: Update Victory screen for multiplayer

**Files:**
- Modify: `/Users/ben/git/private/magic-kingdom/game/src/scenes/GameScene.js`

**Step 1: Update victory() method**

Find victory() method and update similarly to gameOver():

```javascript
victory() {
    this.isGameOver = true;

    // Save high scores
    this.saveHighScores();

    // Get final scores sorted by score
    const finalScores = Object.values(this.scoreManager.playerScores)
        .sort((a, b) => b.score - a.score);

    const mvp = finalScores[0];

    // Create victory UI
    const centerX = 960;
    const centerY = 250;

    // Dim background
    const overlay = this.add.rectangle(0, 0, 1920, 1080, 0x000000, 0.8);
    overlay.setOrigin(0, 0);
    overlay.setDepth(1000);

    // VICTORY text
    const victoryText = this.add.text(centerX, centerY, 'VICTORY!', {
        fontSize: '100px',
        color: '#00ff00',
        fontFamily: 'Georgia, serif',
        fontStyle: 'bold'
    }).setOrigin(0.5);
    victoryText.setDepth(1001);

    // Saloon saved text
    this.add.text(centerX, centerY + 100, 'The Saloon is Safe!', {
        fontSize: '36px',
        color: '#ffffff',
        fontFamily: 'Georgia, serif'
    }).setOrigin(0.5).setDepth(1001);

    // Final scoreboard
    let yOffset = centerY + 180;
    this.add.text(centerX, yOffset, 'FINAL SCORES', {
        fontSize: '36px',
        color: '#ffcc00',
        fontFamily: 'Arial',
        fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(1001);

    yOffset += 50;
    finalScores.forEach((playerData, index) => {
        const isMVP = index === 0;
        const isDead = this.playerManager.players.find(p =>
            p.playerIndex === playerData.index
        )?.isDead;

        const statusText = isDead ? ' [DEAD]' : ' [ALIVE]';

        const text = this.add.text(centerX, yOffset,
            `${playerData.name}: ${playerData.score} pts${statusText}${isMVP ? ' 👑 MVP' : ''}`, {
            fontSize: isMVP ? '28px' : '24px',
            color: isMVP ? '#ffd700' : '#ffffff',
            fontFamily: 'Arial',
            fontStyle: isMVP ? 'bold' : 'normal'
        }).setOrigin(0.5);
        text.setDepth(1001);

        yOffset += 40;
    });

    // Return to lobby instruction
    this.add.text(centerX, centerY + 550, 'Press START to return to lobby', {
        fontSize: '28px',
        color: '#00ff00',
        fontFamily: 'Arial'
    }).setOrigin(0.5).setDepth(1001);

    // Listen for START button
    this.input.keyboard.once('keydown-ENTER', () => {
        this.scene.start('StartScene');
    });
}
```

**Step 2: Test in browser**

Run: `npm run dev`

Expected: Victory screen shows all players with alive/dead status, MVP crowned

**Step 3: Commit**

```bash
git add src/scenes/GameScene.js
git commit -m "feat: add multiplayer victory screen with final standings"
```

---

## Phase 3: Testing and Refinement

### Task 11: Manual testing checklist

**Step 1: Test single player regression**

1. Start game, join only 1 player
2. Verify player spawns at center
3. Verify camera follows single player
4. Play through a few waves
5. Verify game over and victory work

**Step 2: Test two player co-op**

1. Start game, join 2 players with gamepads
2. Verify both spawn side-by-side
3. Verify camera follows center between them
4. Move players apart, verify camera adjusts
5. Kill one player, verify camera follows survivor
6. Verify scoreboard updates for both

**Step 3: Test four player co-op**

1. Join 4 players
2. Verify square formation spawn
3. Verify camera follows all four
4. Kill players one by one, verify camera adjusts
5. Verify final screens show all players

**Step 4: Test edge cases**

1. Player joins with keyboard + gamepad 0 → only creates one player?
2. All players same position → camera doesn't jitter?
3. Dead player's buffs expire → no errors?
4. Gamepad disconnect mid-game → player loses control gracefully?

**Step 5: Document any bugs found**

Create file: `/Users/ben/git/private/magic-kingdom/game/docs/testing/multiplayer-test-results.md`

Document test results and any issues found.

---

### Task 12: Camera smoothing

**Files:**
- Modify: `/Users/ben/git/private/magic-kingdom/game/src/scenes/GameScene.js`

**Step 1: Add smooth camera following**

In update() method, replace direct centerOn with lerp:

```javascript
update(time, delta) {
    if (this.isGameOver) return;

    // ... other updates ...

    // Smooth camera following
    const center = this.playerManager.getCenterPoint();
    const camera = this.cameras.main;

    // Lerp camera position for smooth movement
    const lerpFactor = 0.1; // Lower = smoother but slower
    const targetX = center.x;
    const targetY = center.y;

    const newX = Phaser.Math.Linear(camera.scrollX + camera.width / 2, targetX, lerpFactor);
    const newY = Phaser.Math.Linear(camera.scrollY + camera.height / 2, targetY, lerpFactor);

    camera.centerOn(newX, newY);

    // ... rest of update ...
}
```

**Step 2: Test in browser**

Run: `npm run dev`

Expected: Camera follows players smoothly, no jarring jumps

**Step 3: Commit**

```bash
git add src/scenes/GameScene.js
git commit -m "feat: add smooth camera following for multiplayer"
```

---

### Task 13: Final polish and bug fixes

**Step 1: Review all TODO comments**

Run: `grep -r "TODO" src/`

Address any TODO items related to multiplayer

**Step 2: Test all player counts (1, 2, 3, 4)**

Verify each player count works correctly:
- Spawn positions correct
- Camera behavior appropriate
- UI displays properly
- Game over/victory screens correct

**Step 3: Performance check**

Run game with 4 players and many enemies:
- Monitor FPS (should stay near 60)
- Check for memory leaks
- Verify no stuttering

**Step 4: Create final test report**

Document: `/Users/ben/git/private/magic-kingdom/game/docs/testing/multiplayer-final-test.md`

Include:
- Test scenarios executed
- Results (pass/fail)
- Known issues
- Performance metrics

**Step 5: Final commit**

```bash
git add .
git commit -m "test: complete multiplayer testing and polish"
```

---

## Verification Commands

After each task, verify with these commands:

**Check file exists:**
```bash
ls -la /Users/ben/git/private/magic-kingdom/game/src/[file-path]
```

**Run game:**
```bash
cd /Users/ben/git/private/magic-kingdom/game
npm run dev
```

**Check git status:**
```bash
git status
git log --oneline -5
```

**Lint code (if linter configured):**
```bash
npm run lint
```

---

## Success Criteria

Implementation is complete when:

- ✅ StartScene allows 1-4 players to join with gamepad/keyboard
- ✅ PlayerManager coordinates multiple players with individual InputManagers
- ✅ Camera follows center point of living players smoothly
- ✅ UI shows health bars for all players in corners
- ✅ Scoreboard displays and updates for all players
- ✅ Player bullets don't hit teammates (no friendly fire)
- ✅ Dead players become spectators (permanent death)
- ✅ Game over when all players dead
- ✅ Victory possible with single survivor
- ✅ MVP screen highlights highest scorer
- ✅ High scores saved to localStorage
- ✅ Can return to StartScene from game over/victory
- ✅ All player counts (1-4) work correctly
- ✅ No performance issues with 4 players
- ✅ No console errors during gameplay

---

## Implementation Notes

**Phaser Gamepad API:**
- `this.input.gamepad.total` - number of connected gamepads
- `this.input.gamepad.getPad(index)` - get gamepad 0-3
- `pad.buttons[9]` - START button
- `pad.buttons[7]` - R2 trigger

**Scene Data Passing:**
```javascript
// StartScene → GameScene
this.scene.start('GameScene', { players: [...] });

// GameScene receives
create(data) {
  const playerConfigs = data.players;
}
```

**localStorage:**
```javascript
// Save
localStorage.setItem('key', JSON.stringify(data));

// Load
const data = JSON.parse(localStorage.getItem('key'));
```

---

**Document Version:** 1.0
**Created:** 2025-11-17
**Status:** Ready for implementation
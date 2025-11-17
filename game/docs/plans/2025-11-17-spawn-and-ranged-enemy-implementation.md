# Implementation Plan: Spawn System & Ranged Enemy Combat

**Date:** 2025-11-17
**Status:** Ready for Implementation
**Complexity:** High - Multiple interconnected systems
**Estimated Effort:** 8-12 hours

---

## Overview

This plan implements two major feature additions from `game_idea_2_adaptions.md`:

1. **Thematic Spawn System** - Replace edge-based spawning with saloon door/window spawn points with animations
2. **Enemy Ranged Combat** - Add shooting abilities to Quick-Draw Shrimp and Bandit Lobsters

Both systems integrate with existing wave management, bounty system, and enemy behaviors.

---

## Prerequisites

**Files to Understand:**
- `/Users/ben/git/private/magic-kingdom/game/src/systems/WaveManager.js` - Wave spawning logic
- `/Users/ben/git/private/magic-kingdom/game/src/entities/Enemy.js` - Enemy types and behaviors
- `/Users/ben/git/private/magic-kingdom/game/src/scenes/GameScene.js` - Main game scene

**Key Concepts:**
- Current spawning uses `getSpawnPoints()` to distribute enemies around screen edges (4 sides)
- Enemies have behavior methods: `updateBasicShooter()`, `updateFastMelee()`, etc.
- Bounty enemies use existing announcement system (`announceBounty()`)
- Game uses Phaser 3 arcade physics with CSS-based rendering

---

## Implementation Tasks

### Task 1: Create Spawn Point Configuration System

**File:** `/Users/ben/git/private/magic-kingdom/game/src/systems/SpawnPointManager.js` (NEW FILE)

**Purpose:** Define and manage the 2-3 thematic spawn points (door + windows)

**Implementation:**

```javascript
/**
 * SpawnPointManager.js
 * Manages thematic spawn points for saloon arena
 */

export const SPAWN_POINT_TYPES = {
    MAIN_DOOR: 'main_door',
    WINDOW_LEFT: 'window_left',
    WINDOW_RIGHT: 'window_right'
};

export const SPAWN_ANIMATIONS = {
    [SPAWN_POINT_TYPES.MAIN_DOOR]: {
        duration: 600,        // 0.6 seconds
        bountyDuration: 800,  // Extended for bounties
        audio: 'saloon_door',
        stages: ['door_open', 'enemy_enter', 'door_close']
    },
    [SPAWN_POINT_TYPES.WINDOW_LEFT]: {
        duration: 500,        // 0.5 seconds
        firstTimeDuration: 600,  // Longer for glass break
        audio: 'window_crash',
        stages: ['glass_break', 'enemy_crash_through']
    },
    [SPAWN_POINT_TYPES.WINDOW_RIGHT]: {
        duration: 500,
        firstTimeDuration: 600,
        audio: 'window_crash',
        stages: ['glass_break', 'enemy_crash_through']
    }
};

export class SpawnPointManager {
    constructor(scene) {
        this.scene = scene;

        // Spawn point coordinates (positioned outside arena, enemies move in)
        this.spawnPoints = {
            [SPAWN_POINT_TYPES.MAIN_DOOR]: {
                x: 960,              // Center bottom
                y: 1180,             // Below screen (1080 + margin)
                entryX: 960,
                entryY: 980,         // Target position after animation
                type: SPAWN_POINT_TYPES.MAIN_DOOR,
                lastSpawnTime: 0,
                broken: false        // N/A for door
            },
            [SPAWN_POINT_TYPES.WINDOW_LEFT]: {
                x: -100,             // Left of screen
                y: 400,              // Mid-height
                entryX: 200,         // Target position after animation
                entryY: 400,
                type: SPAWN_POINT_TYPES.WINDOW_LEFT,
                lastSpawnTime: 0,
                broken: false
            },
            [SPAWN_POINT_TYPES.WINDOW_RIGHT]: {
                x: 2020,             // Right of screen
                y: 400,              // Mid-height
                entryX: 1720,        // Target position after animation
                entryY: 400,
                type: SPAWN_POINT_TYPES.WINDOW_RIGHT,
                lastSpawnTime: 0,
                broken: false
            }
        };

        // Spawn queue for animation management
        this.spawnQueue = [];
        this.activeAnimations = [];
    }

    /**
     * Get available spawn point for regular enemy
     * Returns spawn point with longest time since last spawn
     */
    getRandomSpawnPoint() {
        const currentTime = Date.now();
        const MIN_SPAWN_DELAY = 500; // 0.5 second between spawns at same point

        // Filter spawn points with sufficient delay
        const availablePoints = Object.values(this.spawnPoints).filter(point => {
            return (currentTime - point.lastSpawnTime) >= MIN_SPAWN_DELAY;
        });

        // If all points are on cooldown, return least recently used
        if (availablePoints.length === 0) {
            return Object.values(this.spawnPoints).reduce((oldest, point) => {
                return point.lastSpawnTime < oldest.lastSpawnTime ? point : oldest;
            });
        }

        // Random selection from available points
        return availablePoints[Math.floor(Math.random() * availablePoints.length)];
    }

    /**
     * Get main door spawn point (for bounties)
     */
    getMainDoorSpawnPoint() {
        return this.spawnPoints[SPAWN_POINT_TYPES.MAIN_DOOR];
    }

    /**
     * Queue an enemy spawn with animation
     */
    queueSpawn(enemy, spawnPoint, isBounty = false) {
        const animationConfig = SPAWN_ANIMATIONS[spawnPoint.type];
        const duration = isBounty && spawnPoint.type === SPAWN_POINT_TYPES.MAIN_DOOR
            ? animationConfig.bountyDuration
            : (spawnPoint.broken ? animationConfig.duration : animationConfig.firstTimeDuration || animationConfig.duration);

        this.spawnQueue.push({
            enemy,
            spawnPoint,
            isBounty,
            duration,
            startTime: null,  // Set when animation begins
            animationConfig
        });

        spawnPoint.lastSpawnTime = Date.now();
    }

    /**
     * Update spawn animations (called every frame)
     */
    update(time) {
        // Start queued spawns
        if (this.spawnQueue.length > 0 && this.activeAnimations.length < 3) {
            const spawn = this.spawnQueue.shift();
            spawn.startTime = time;
            this.activeAnimations.push(spawn);
            this.playSpawnAnimation(spawn);
        }

        // Update active animations
        this.activeAnimations = this.activeAnimations.filter(spawn => {
            const elapsed = time - spawn.startTime;

            if (elapsed >= spawn.duration) {
                // Animation complete - enable enemy
                spawn.enemy.setCollisionEnabled(true);
                spawn.enemy.setPosition(spawn.spawnPoint.entryX, spawn.spawnPoint.entryY);
                spawn.enemy.setAlpha(1);
                return false; // Remove from active animations
            }

            // Update enemy position during animation
            const progress = elapsed / spawn.duration;
            const easeProgress = this.easeOutCubic(progress);

            spawn.enemy.x = spawn.spawnPoint.x + (spawn.spawnPoint.entryX - spawn.spawnPoint.x) * easeProgress;
            spawn.enemy.y = spawn.spawnPoint.y + (spawn.spawnPoint.entryY - spawn.spawnPoint.y) * easeProgress;
            spawn.enemy.setAlpha(easeProgress);

            return true; // Keep in active animations
        });
    }

    /**
     * Play spawn animation effects (visual/audio)
     */
    playSpawnAnimation(spawn) {
        const { spawnPoint, isBounty, animationConfig } = spawn;

        // Play audio
        if (this.scene.sound) {
            const volume = isBounty ? 1.2 : 1.0;
            this.scene.sound.play(animationConfig.audio, { volume });
        }

        // Create visual effects based on spawn type
        if (spawnPoint.type === SPAWN_POINT_TYPES.MAIN_DOOR) {
            this.createDoorAnimation(spawnPoint, isBounty);
        } else {
            this.createWindowAnimation(spawnPoint);
        }

        // Bounty-specific effects
        if (isBounty) {
            this.createBountySpawnEffects(spawnPoint);
        }
    }

    /**
     * Create door swing animation
     */
    createDoorAnimation(spawnPoint, isBounty) {
        const doorElement = document.createElement('div');
        doorElement.className = 'spawn-door-animation';
        doorElement.style.cssText = `
            position: absolute;
            left: ${spawnPoint.x - 60}px;
            top: ${spawnPoint.y - 80}px;
            width: 120px;
            height: 160px;
            background: linear-gradient(to right, #8B4513 0%, #8B4513 48%, #000 49%, #000 51%, #A0522D 52%, #A0522D 100%);
            border: 3px solid #654321;
            transform-origin: center bottom;
            animation: ${isBounty ? 'doorSwingBounty' : 'doorSwing'} 0.6s ease-out;
            z-index: 100;
        `;

        this.scene.game.canvas.parentElement.appendChild(doorElement);

        setTimeout(() => {
            doorElement.remove();
        }, isBounty ? 800 : 600);
    }

    /**
     * Create window crash animation
     */
    createWindowAnimation(spawnPoint) {
        const windowElement = document.createElement('div');
        windowElement.className = 'spawn-window-animation';

        const isFirstBreak = !spawnPoint.broken;

        windowElement.style.cssText = `
            position: absolute;
            left: ${spawnPoint.x}px;
            top: ${spawnPoint.y - 40}px;
            width: 80px;
            height: 80px;
            z-index: 100;
        `;

        if (isFirstBreak) {
            // Glass shatter effect
            for (let i = 0; i < 8; i++) {
                const shard = document.createElement('div');
                shard.className = 'glass-shard';
                const angle = (Math.PI * 2 * i) / 8;
                const distance = 30 + Math.random() * 20;

                shard.style.cssText = `
                    position: absolute;
                    left: 40px;
                    top: 40px;
                    width: 8px;
                    height: 12px;
                    background: rgba(173, 216, 230, 0.8);
                    animation: glassShatter 0.6s ease-out forwards;
                    --target-x: ${Math.cos(angle) * distance}px;
                    --target-y: ${Math.sin(angle) * distance}px;
                `;

                windowElement.appendChild(shard);
            }

            spawnPoint.broken = true;
        }

        this.scene.game.canvas.parentElement.appendChild(windowElement);

        setTimeout(() => {
            windowElement.remove();
        }, isFirstBreak ? 600 : 400);
    }

    /**
     * Create bounty spawn visual effects
     */
    createBountySpawnEffects(spawnPoint) {
        // Flash effect
        const flash = document.createElement('div');
        flash.className = 'bounty-spawn-flash';
        flash.style.cssText = `
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 215, 0, 0.3);
            animation: bountyFlash 0.4s ease-out;
            z-index: 99;
            pointer-events: none;
        `;

        this.scene.game.canvas.parentElement.appendChild(flash);

        setTimeout(() => flash.remove(), 400);

        // "Showdown" music sting
        if (this.scene.sound) {
            this.scene.sound.play('bounty_sting', { volume: 0.8 });
        }
    }

    /**
     * Easing function for smooth animation
     */
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    /**
     * Reset spawn point states (for new game)
     */
    reset() {
        Object.values(this.spawnPoints).forEach(point => {
            point.lastSpawnTime = 0;
            point.broken = false;
        });
        this.spawnQueue = [];
        this.activeAnimations = [];
    }
}
```

**CSS Additions** (add to `/Users/ben/git/private/magic-kingdom/game/index.html` or `/Users/ben/git/private/magic-kingdom/game/style.css`):

```css
@keyframes doorSwing {
    0% { transform: scaleY(0); }
    50% { transform: scaleY(1.1) translateX(-15px); }
    100% { transform: scaleY(1) translateX(0); }
}

@keyframes doorSwingBounty {
    0% { transform: scaleY(0); }
    30% { transform: scaleY(1.15) translateX(-20px); }
    50% { transform: scaleY(1.15) translateX(-20px); }
    100% { transform: scaleY(1) translateX(0); }
}

@keyframes glassShatter {
    0% {
        transform: translate(0, 0) rotate(0deg);
        opacity: 1;
    }
    100% {
        transform: translate(var(--target-x), var(--target-y)) rotate(360deg);
        opacity: 0;
    }
}

@keyframes bountyFlash {
    0% { opacity: 1; }
    100% { opacity: 0; }
}
```

**Verification Steps:**
1. Create `SpawnPointManager.js` with all methods
2. Add CSS animations to stylesheet
3. Verify file structure: `src/systems/SpawnPointManager.js` exists
4. Run `npm run dev` - check for syntax errors

**Success Criteria:**
- File compiles without errors
- Constants and class are exported correctly
- Spawn point coordinates are logical for 1920x1080 canvas

---

### Task 2: Integrate Spawn Point Manager into WaveManager

**File:** `/Users/ben/git/private/magic-kingdom/game/src/systems/WaveManager.js`

**Changes:**

**Step 2.1: Import SpawnPointManager**

Add at top of file (around line 1-5):

```javascript
import { SpawnPointManager } from './SpawnPointManager.js';
```

**Step 2.2: Initialize in constructor**

In `constructor(scene)` method (around line 10-20), add:

```javascript
constructor(scene) {
    this.scene = scene;
    this.currentWave = 0;
    this.totalWaves = 10;
    this.enemies = [];
    this.enemiesRemaining = 0;
    this.waveInProgress = false;

    // NEW: Initialize spawn point manager
    this.spawnPointManager = new SpawnPointManager(scene);
}
```

**Step 2.3: Replace getSpawnPoints() method**

**OLD CODE** (Lines 236-270 - DELETE THIS):

```javascript
getSpawnPoints(count) {
    // ... entire old method with edge-based spawning
}
```

**NEW CODE** (Replace with):

```javascript
/**
 * Get spawn points using thematic spawn system
 * Returns array of spawn point objects with animation data
 */
getSpawnPoints(count, bountyIndex = -1) {
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
```

**Step 2.4: Update spawnEnemiesByComposition() method**

**LOCATE** existing method (around lines 138-186).

**FIND** the line that calls `getSpawnPoints()`:

```javascript
const spawnPoints = this.getSpawnPoints(totalEnemies);
```

**REPLACE WITH**:

```javascript
const spawnPoints = this.getSpawnPoints(totalEnemies, bountyEnemyIndex);
```

**FIND** the enemy creation loop (around line 160-180):

```javascript
// Inside the loop where enemies are created
const enemy = new Enemy(
    this.scene,
    spawnPoints[enemyIndex].x,
    spawnPoints[enemyIndex].y,
    type,
    this.currentWave
);
```

**ADD AFTER** enemy creation (before `enemyIndex++`):

```javascript
// Queue spawn animation
const spawnData = spawnPoints[enemyIndex];
enemy.setCollisionEnabled(false);  // Disable collision during spawn animation
enemy.setAlpha(0);                 // Start invisible

this.spawnPointManager.queueSpawn(
    enemy,
    spawnData.spawnPoint,
    spawnData.isBounty
);
```

**Step 2.5: Add update() method call**

**FIND** where WaveManager is updated in GameScene (or add new method if doesn't exist):

In `WaveManager.js`, add new method:

```javascript
/**
 * Update spawn animations
 * Call this every frame from GameScene
 */
update(time) {
    this.spawnPointManager.update(time);
}
```

**Step 2.6: Add reset() call**

**FIND** `reset()` or `startNewGame()` method in WaveManager (around line 300+):

**ADD**:

```javascript
reset() {
    this.currentWave = 0;
    this.waveInProgress = false;
    this.enemiesRemaining = 0;

    // NEW: Reset spawn point manager
    this.spawnPointManager.reset();
}
```

**Verification Steps:**
1. Save all changes to `WaveManager.js`
2. Check Enemy class has `setCollisionEnabled()` and `setAlpha()` methods (add if missing - see Task 3)
3. Run `npm run dev`
4. Open browser console - check for import errors
5. Start game - verify enemies spawn (even without animations working yet)

**Success Criteria:**
- No import errors in console
- Game starts without crashes
- Enemies still spawn and are playable
- Console shows no errors related to spawn system

---

### Task 3: Add Collision/Visibility Methods to Enemy Class

**File:** `/Users/ben/git/private/magic-kingdom/game/src/entities/Enemy.js`

**Changes:**

**FIND** Enemy class constructor (around line 80-120).

**ADD** new properties in constructor:

```javascript
constructor(scene, x, y, type, wave) {
    // ... existing constructor code ...

    // NEW: Spawn animation properties
    this.collisionEnabled = true;
    this.alpha = 1.0;
}
```

**ADD** new methods at end of class (before closing brace):

```javascript
/**
 * Enable/disable collision during spawn animation
 */
setCollisionEnabled(enabled) {
    this.collisionEnabled = enabled;

    // Update visual to indicate disabled collision
    if (!enabled) {
        this.element.style.opacity = '0.5';
    } else {
        this.element.style.opacity = this.alpha.toString();
    }
}

/**
 * Set enemy visibility (0-1)
 */
setAlpha(alpha) {
    this.alpha = Math.max(0, Math.min(1, alpha));

    if (this.collisionEnabled) {
        this.element.style.opacity = this.alpha.toString();
    }
}

/**
 * Check if collision is enabled
 */
isCollisionEnabled() {
    return this.collisionEnabled;
}
```

**FIND** collision handling in `GameScene.js` (around line 350-400).

**MODIFY** collision checks to respect `collisionEnabled`:

```javascript
// In GameScene update() method, where enemy collisions are checked

// Player bullet vs enemy collision
this.enemies = this.enemies.filter(enemy => {
    // Skip collision if enemy is spawning
    if (!enemy.isCollisionEnabled()) {
        return true;
    }

    // ... existing collision code ...
});
```

**Verification Steps:**
1. Save changes to `Enemy.js`
2. Update collision checks in `GameScene.js`
3. Run `npm run dev`
4. Start game - enemies should fade in when spawning
5. Verify enemies can't be hit during spawn animation

**Success Criteria:**
- Enemies fade from invisible to visible when spawning
- Enemies can't be damaged during spawn animation
- No errors in console
- Game plays normally after spawn animations complete

---

### Task 4: Create Enemy Bullet System

**File:** `/Users/ben/git/private/magic-kingdom/game/src/entities/EnemyBullet.js` (NEW FILE)

**Purpose:** Create bullet projectiles fired by enemies

**Implementation:**

```javascript
/**
 * EnemyBullet.js
 * Projectile fired by enemies (Shrimp and Lobsters)
 */

export class EnemyBullet {
    constructor(scene, x, y, targetX, targetY, damage, bulletType = 'normal') {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.damage = damage;
        this.bulletType = bulletType;  // 'normal', 'heavy', 'burst', 'explosive'
        this.isAlive = true;
        this.speed = bulletType === 'heavy' ? 250 : 400;  // pixels per second

        // Calculate direction with inaccuracy
        const dx = targetX - x;
        const dy = targetY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Add spread/inaccuracy
        const inaccuracy = bulletType === 'heavy' ? 0.05 : 0.1;  // radians
        const baseAngle = Math.atan2(dy, dx);
        const finalAngle = baseAngle + (Math.random() - 0.5) * inaccuracy;

        this.velocityX = Math.cos(finalAngle) * this.speed;
        this.velocityY = Math.sin(finalAngle) * this.speed;

        // Create DOM element
        this.element = document.createElement('div');
        this.element.className = `enemy-bullet ${bulletType}`;

        const size = bulletType === 'heavy' ? 12 : 8;
        const color = bulletType === 'heavy' ? '#FF4500' : '#FFD700';

        this.element.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border: 2px solid rgba(0, 0, 0, 0.5);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            box-shadow: 0 0 10px ${color};
            z-index: 50;
        `;

        // Create trail effect
        this.trail = document.createElement('div');
        this.trail.className = 'bullet-trail';
        this.trail.style.cssText = `
            position: absolute;
            width: ${size * 2}px;
            height: ${size}px;
            background: linear-gradient(to right, transparent, ${color}80);
            transform: translate(-100%, -50%) rotate(${finalAngle}rad);
            border-radius: 50%;
            z-index: 49;
            pointer-events: none;
        `;

        this.updatePosition();

        this.scene.game.canvas.parentElement.appendChild(this.element);
        this.scene.game.canvas.parentElement.appendChild(this.trail);

        // Lifetime limit (remove if goes off-screen)
        this.maxLifetime = 5000;  // 5 seconds
        this.spawnTime = Date.now();
    }

    update(deltaTime) {
        if (!this.isAlive) return;

        // Update position
        const dt = deltaTime / 1000;  // Convert to seconds
        this.x += this.velocityX * dt;
        this.y += this.velocityY * dt;

        this.updatePosition();

        // Check bounds (1920x1080 with margin)
        if (this.x < -50 || this.x > 1970 || this.y < -50 || this.y > 1130) {
            this.destroy();
            return;
        }

        // Check lifetime
        if (Date.now() - this.spawnTime > this.maxLifetime) {
            this.destroy();
            return;
        }

        // Check collision with players (handled in GameScene)
    }

    updatePosition() {
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';

        this.trail.style.left = this.x + 'px';
        this.trail.style.top = this.y + 'px';
    }

    checkCollision(targetX, targetY, targetRadius) {
        const dx = this.x - targetX;
        const dy = this.y - targetY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const bulletRadius = this.bulletType === 'heavy' ? 6 : 4;

        return distance < (bulletRadius + targetRadius);
    }

    getDamage() {
        return this.damage;
    }

    explode() {
        if (this.bulletType === 'explosive') {
            // Create explosion visual
            const explosion = document.createElement('div');
            explosion.className = 'bullet-explosion';
            explosion.style.cssText = `
                position: absolute;
                left: ${this.x}px;
                top: ${this.y}px;
                width: 60px;
                height: 60px;
                background: radial-gradient(circle, #FF4500, transparent);
                border-radius: 50%;
                transform: translate(-50%, -50%);
                animation: explode 0.4s ease-out forwards;
                z-index: 60;
                pointer-events: none;
            `;

            this.scene.game.canvas.parentElement.appendChild(explosion);
            setTimeout(() => explosion.remove(), 400);

            // Return explosion data for AoE damage
            return {
                x: this.x,
                y: this.y,
                radius: 30,
                damage: this.damage * 0.5
            };
        }

        return null;
    }

    destroy() {
        this.isAlive = false;

        if (this.element && this.element.parentElement) {
            this.element.remove();
        }

        if (this.trail && this.trail.parentElement) {
            this.trail.remove();
        }
    }

    isActive() {
        return this.isAlive;
    }
}
```

**CSS Additions:**

```css
.enemy-bullet {
    transition: none;
    will-change: transform, left, top;
}

.enemy-bullet.heavy {
    box-shadow: 0 0 15px #FF4500, 0 0 5px #FF0000;
}

@keyframes explode {
    0% {
        transform: translate(-50%, -50%) scale(0);
        opacity: 1;
    }
    100% {
        transform: translate(-50%, -50%) scale(2);
        opacity: 0;
    }
}
```

**Verification Steps:**
1. Create `EnemyBullet.js` file
2. Add CSS for bullet styling
3. Run `npm run dev` - check for syntax errors
4. File compiles without errors

**Success Criteria:**
- File exists at correct path
- Exports EnemyBullet class
- No syntax errors
- Constructor initializes all properties

---

### Task 5: Add Shooting Behavior to Shrimp and Lobster Enemies

**File:** `/Users/ben/git/private/magic-kingdom/game/src/entities/Enemy.js`

**Changes:**

**Step 5.1: Import EnemyBullet**

Add at top of file:

```javascript
import { EnemyBullet } from './EnemyBullet.js';
```

**Step 5.2: Update ENEMY_TYPES configuration**

**FIND** `ENEMY_TYPES` object (lines 1-60).

**MODIFY** lobster and shrimp entries:

```javascript
lobster: {
    name: 'Bandit Lobster',
    health: 30,
    speed: 80,
    damage: 10,
    behavior: 'ranged_shooter',        // CHANGED from 'basic_shooter'
    color: '#FF4500',
    size: 30,
    attackRange: 400,                   // CHANGED from 400
    attackCooldown: 3500,               // CHANGED from 1000 - 3.5 second cooldown
    shootSpeed: 250,                    // NEW
    bulletDamage: 8,                    // NEW
    telegraphDuration: 400              // NEW - wind-up before shot
},
shrimp: {
    name: 'Quick-Draw Shrimp',
    health: 15,
    speed: 200,
    damage: 5,
    behavior: 'ranged_kiter',          // CHANGED from 'fast_melee'
    color: '#FF69B4',
    size: 20,
    attackRange: 350,                   // CHANGED from 50
    attackCooldown: 1500,               // CHANGED from 500 - 1.5 second cooldown
    shootSpeed: 400,                    // NEW
    bulletDamage: 4,                    // NEW
    kitefistance: 200                  // NEW - maintain distance while shooting
}
```

**Step 5.3: Add shooting properties to constructor**

**FIND** constructor (around line 80-120).

**ADD** after existing properties:

```javascript
constructor(scene, x, y, type, wave) {
    // ... existing constructor code ...

    // NEW: Shooting properties
    this.lastShotTime = 0;
    this.isWindingUp = false;
    this.windUpStartTime = 0;
    this.isShooting = this.stats.behavior === 'ranged_shooter' || this.stats.behavior === 'ranged_kiter';
}
```

**Step 5.4: Add shooting behavior methods**

**ADD** new methods before the closing class brace:

```javascript
/**
 * Ranged Shooter behavior (Bandit Lobster)
 * Advances toward player, stops, winds up, shoots
 */
updateRangedShooter(deltaTime, playerX, playerY) {
    const distance = this.getDistanceToPlayer(playerX, playerY);
    const currentTime = Date.now();

    // Wind-up animation in progress
    if (this.isWindingUp) {
        const windUpElapsed = currentTime - this.windUpStartTime;

        // Visual: Pulsing/growing during wind-up
        const pulseFactor = 1 + Math.sin(windUpElapsed / 100) * 0.1;
        this.element.style.transform = `scale(${pulseFactor})`;

        if (windUpElapsed >= this.stats.telegraphDuration) {
            // Fire!
            this.fireBullet(playerX, playerY, 'heavy');
            this.isWindingUp = false;
            this.element.style.transform = 'scale(1)';
            this.lastShotTime = currentTime;
        }

        return;  // Don't move during wind-up
    }

    // Check if can shoot
    const canShoot = (currentTime - this.lastShotTime) >= this.stats.attackCooldown;

    if (distance <= this.stats.attackRange && canShoot) {
        // Start wind-up
        this.isWindingUp = true;
        this.windUpStartTime = currentTime;
        this.velocityX = 0;
        this.velocityY = 0;
    } else {
        // Move toward player
        this.moveTowardPlayer(playerX, playerY);
    }
}

/**
 * Ranged Kiter behavior (Quick-Draw Shrimp)
 * Maintains distance while shooting rapidly
 */
updateRangedKiter(deltaTime, playerX, playerY) {
    const distance = this.getDistanceToPlayer(playerX, playerY);
    const currentTime = Date.now();
    const canShoot = (currentTime - this.lastShotTime) >= this.stats.attackCooldown;

    // Shoot if in range
    if (distance <= this.stats.attackRange && canShoot) {
        this.fireBullet(playerX, playerY, 'normal');
        this.lastShotTime = currentTime;
    }

    // Kiting behavior: maintain optimal distance
    if (distance < this.stats.kiteDistance) {
        // Too close - back away
        this.moveAwayFromPlayer(playerX, playerY);
    } else if (distance > this.stats.attackRange) {
        // Too far - move closer
        this.moveTowardPlayer(playerX, playerY);
    } else {
        // Good range - strafe
        this.strafeAroundPlayer(playerX, playerY);
    }
}

/**
 * Fire a bullet at target
 */
fireBullet(targetX, targetY, bulletType = 'normal') {
    // Check if bounty - use special bullets
    if (this.isBountyEnemy() && bulletType === 'normal') {
        bulletType = 'burst';  // Desperado shoots 3-round bursts
    } else if (this.isBountyEnemy() && bulletType === 'heavy') {
        bulletType = 'explosive';  // Big Iron shoots explosive rounds
    }

    const bullet = new EnemyBullet(
        this.scene,
        this.x,
        this.y,
        targetX,
        targetY,
        this.stats.bulletDamage,
        bulletType
    );

    // Add to scene's bullet array (managed in GameScene)
    if (!this.scene.enemyBullets) {
        this.scene.enemyBullets = [];
    }
    this.scene.enemyBullets.push(bullet);

    // Play sound effect
    const soundName = bulletType === 'heavy' ? 'gun_heavy' : 'gun_light';
    if (this.scene.sound) {
        this.scene.sound.play(soundName, { volume: 0.3 });
    }

    // Bounty burst: fire 2 more bullets with slight delay
    if (bulletType === 'burst') {
        setTimeout(() => this.fireBullet(targetX, targetY, 'normal'), 150);
        setTimeout(() => this.fireBullet(targetX, targetY, 'normal'), 300);
    }
}

/**
 * Move away from player (kiting)
 */
moveAwayFromPlayer(playerX, playerY) {
    const angle = Math.atan2(this.y - playerY, this.x - playerX);
    this.velocityX = Math.cos(angle) * this.stats.speed;
    this.velocityY = Math.sin(angle) * this.stats.speed;
}

/**
 * Strafe around player (perpendicular movement)
 */
strafeAroundPlayer(playerX, playerY) {
    const angle = Math.atan2(playerY - this.y, playerX - this.x);
    const strafeDirection = Math.random() > 0.5 ? 1 : -1;
    const strafeAngle = angle + (Math.PI / 2) * strafeDirection;

    this.velocityX = Math.cos(strafeAngle) * this.stats.speed * 0.7;
    this.velocityY = Math.sin(strafeAngle) * this.stats.speed * 0.7;
}

/**
 * Get distance to player
 */
getDistanceToPlayer(playerX, playerY) {
    const dx = playerX - this.x;
    const dy = playerY - this.y;
    return Math.sqrt(dx * dx + dy * dy);
}
```

**Step 5.5: Update behavior routing in update() method**

**FIND** the behavior switch statement in `update()` method (around line 200-220):

**MODIFY** to include new behaviors:

```javascript
// Route to behavior-specific update
switch (this.stats.behavior) {
    case 'ranged_shooter':
        this.updateRangedShooter(deltaTime, playerX, playerY);
        break;
    case 'ranged_kiter':
        this.updateRangedKiter(deltaTime, playerX, playerY);
        break;
    case 'tank':
        this.updateTank(deltaTime, playerX, playerY);
        break;
    case 'teleport':
        this.updateTeleport(deltaTime, playerX, playerY);
        break;
    case 'swoop':
        this.updateSwoop(deltaTime, playerX, playerY);
        break;
    default:
        this.moveTowardPlayer(playerX, playerY);
}
```

**Verification Steps:**
1. Save all changes to `Enemy.js`
2. Run `npm run dev`
3. Check console for errors
4. Start game - verify lobsters and shrimp still spawn
5. Check that enemies attempt to shoot (even if bullets don't work yet)

**Success Criteria:**
- No import errors
- Enemies spawn and move
- Lobsters stop and wind up before shooting
- Shrimp kite around players
- Console shows no errors related to enemy behavior

---

### Task 6: Integrate Enemy Bullets into GameScene

**File:** `/Users/ben/git/private/magic-kingdom/game/src/scenes/GameScene.js`

**Changes:**

**Step 6.1: Initialize enemy bullets array**

**FIND** constructor or `create()` method.

**ADD**:

```javascript
create() {
    // ... existing initialization ...

    // NEW: Enemy bullets array
    this.enemyBullets = [];
}
```

**Step 6.2: Update enemy bullets in game loop**

**FIND** `update()` method (around line 210-403).

**ADD** bullet update after enemy updates (around line 270):

```javascript
update(time, delta) {
    // ... existing player/enemy updates ...

    // NEW: Update enemy bullets
    this.updateEnemyBullets(delta);

    // ... rest of update logic ...
}
```

**Step 6.3: Add bullet update method**

**ADD** new method:

```javascript
/**
 * Update all enemy bullets and check collisions
 */
updateEnemyBullets(deltaTime) {
    if (!this.enemyBullets) return;

    // Update each bullet
    this.enemyBullets.forEach(bullet => {
        bullet.update(deltaTime);
    });

    // Check collisions with players
    this.enemyBullets = this.enemyBullets.filter(bullet => {
        if (!bullet.isActive()) {
            return false;
        }

        // Check collision with each player
        for (const player of this.players) {
            if (!player.isAlive()) continue;

            const playerRadius = 15;  // Player collision radius

            if (bullet.checkCollision(player.x, player.y, playerRadius)) {
                // Hit player!
                player.takeDamage(bullet.getDamage());

                // Check for explosion (bounty lobster bullets)
                const explosion = bullet.explode();
                if (explosion) {
                    // Apply AoE damage
                    this.players.forEach(p => {
                        if (!p.isAlive()) return;

                        const dx = p.x - explosion.x;
                        const dy = p.y - explosion.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);

                        if (dist <= explosion.radius) {
                            p.takeDamage(explosion.damage);
                        }
                    });
                }

                bullet.destroy();
                return false;
            }
        }

        return true;  // Keep bullet
    });
}
```

**Step 6.4: Clean up bullets on wave end**

**FIND** wave completion or reset logic.

**ADD**:

```javascript
// When wave ends or game resets
clearEnemyBullets() {
    if (this.enemyBullets) {
        this.enemyBullets.forEach(bullet => bullet.destroy());
        this.enemyBullets = [];
    }
}
```

**Call** this in appropriate places:
- End of wave
- Game reset
- Player death

**Verification Steps:**
1. Save changes to `GameScene.js`
2. Run `npm run dev`
3. Start game
4. Verify lobsters and shrimp fire bullets
5. Verify bullets move across screen
6. Verify bullets damage players on hit
7. Check bullets disappear after hitting or going off-screen

**Success Criteria:**
- Bullets appear when enemies shoot
- Bullets move smoothly across screen
- Bullets damage players on collision
- No performance issues with many bullets
- Bullets clean up properly

---

### Task 7: Add Audio Files (Placeholder Implementation)

**File:** `/Users/ben/git/private/magic-kingdom/game/src/scenes/GameScene.js`

**Purpose:** Ensure audio calls don't crash (even without actual audio files yet)

**Changes:**

**ADD** audio check wrapper:

```javascript
// In create() method or early initialization
playSound(soundName, options = {}) {
    // Placeholder - add actual audio loading later
    const audioMap = {
        'saloon_door': true,
        'window_crash': true,
        'gun_light': true,
        'gun_heavy': true,
        'bounty_sting': true
    };

    if (this.sound && audioMap[soundName]) {
        // TODO: Load actual audio files
        console.log(`Playing sound: ${soundName}`, options);
        // this.sound.play(soundName, options);
    }
}
```

**FIND** all sound.play() calls added in previous tasks.

**REPLACE** with:

```javascript
// OLD
this.scene.sound.play('saloon_door', { volume: 1.0 });

// NEW
this.scene.playSound('saloon_door', { volume: 1.0 });
```

**Verification Steps:**
1. Replace all sound.play() calls with playSound()
2. Run `npm run dev`
3. Verify no audio-related crashes
4. Check console logs show sound triggers

**Success Criteria:**
- No crashes from missing audio files
- Console logs show when sounds would play
- Game functions normally without audio

---

### Task 8: Update Flying Fish Behavior for Top-Down

**File:** `/Users/ben/git/private/magic-kingdom/game/src/entities/Enemy.js`

**Purpose:** Redesign Flying Fish from "swoop from above" to "fast dart across arena"

**Changes:**

**FIND** ENEMY_TYPES.flyingfish configuration (around line 40-60):

**MODIFY**:

```javascript
flyingfish: {
    name: 'Flying Fish',
    health: 20,
    speed: 150,                         // Base speed
    damage: 8,
    behavior: 'dash',                   // CHANGED from 'swoop'
    color: '#00CED1',
    size: 25,
    attackRange: 600,
    attackCooldown: 2500,
    dashSpeed: 300,                     // NEW - speed during dash
    dashDistance: 400,                  // NEW - how far to dash
    dashCooldown: 2500                  // NEW - time between dashes
}
```

**FIND** `updateSwoop()` method (around line 308-366):

**REPLACE** with:

```javascript
/**
 * Dash behavior (Flying Fish)
 * Circles player, then dashes quickly toward them
 */
updateDash(deltaTime, playerX, playerY) {
    const distance = this.getDistanceToPlayer(playerX, playerY);
    const currentTime = Date.now();

    if (!this.dashState) {
        this.dashState = 'circling';
        this.lastDashTime = 0;
        this.dashTargetX = 0;
        this.dashTargetY = 0;
        this.dashStartX = 0;
        this.dashStartY = 0;
        this.dashProgress = 0;
    }

    switch (this.dashState) {
        case 'circling':
            // Circle around player at distance
            const circleAngle = Math.atan2(this.y - playerY, this.x - playerX);
            const targetRadius = 250;
            const angularSpeed = 0.02;  // radians per frame

            const newAngle = circleAngle + angularSpeed;
            const targetX = playerX + Math.cos(newAngle) * targetRadius;
            const targetY = playerY + Math.sin(newAngle) * targetRadius;

            const dx = targetX - this.x;
            const dy = targetY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 5) {
                this.velocityX = (dx / dist) * this.stats.speed;
                this.velocityY = (dy / dist) * this.stats.speed;
            }

            // Check if can dash
            const canDash = (currentTime - this.lastDashTime) >= this.stats.dashCooldown;
            if (canDash && distance <= this.stats.attackRange) {
                this.dashState = 'dashing';
                this.dashStartX = this.x;
                this.dashStartY = this.y;
                this.dashTargetX = playerX;
                this.dashTargetY = playerY;
                this.dashProgress = 0;
                this.lastDashTime = currentTime;

                // Visual indicator
                this.element.style.filter = 'brightness(1.5)';
            }
            break;

        case 'dashing':
            // Rapid dash toward target
            this.dashProgress += deltaTime / 500;  // 0.5 second dash

            if (this.dashProgress >= 1) {
                // Dash complete - retreat
                this.dashState = 'retreating';
                this.element.style.filter = 'brightness(1)';
            } else {
                // Update position along dash path
                const easeProgress = this.easeOutQuad(this.dashProgress);
                this.x = this.dashStartX + (this.dashTargetX - this.dashStartX) * easeProgress;
                this.y = this.dashStartY + (this.dashTargetY - this.dashStartY) * easeProgress;

                // Leave trail effect
                this.createDashTrail();
            }
            break;

        case 'retreating':
            // Move away from player
            const escapeAngle = Math.atan2(this.y - playerY, this.x - playerX);
            this.velocityX = Math.cos(escapeAngle) * this.stats.speed * 1.2;
            this.velocityY = Math.sin(escapeAngle) * this.stats.speed * 1.2;

            // Return to circling when far enough
            if (distance > 300) {
                this.dashState = 'circling';
            }
            break;
    }
}

/**
 * Create visual trail during dash
 */
createDashTrail() {
    const trail = document.createElement('div');
    trail.className = 'fish-dash-trail';
    trail.style.cssText = `
        position: absolute;
        left: ${this.x}px;
        top: ${this.y}px;
        width: ${this.stats.size}px;
        height: ${this.stats.size}px;
        background: ${this.stats.color}80;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        animation: trailFade 0.4s ease-out forwards;
        z-index: 10;
        pointer-events: none;
    `;

    this.scene.game.canvas.parentElement.appendChild(trail);
    setTimeout(() => trail.remove(), 400);
}

/**
 * Easing function for dash
 */
easeOutQuad(t) {
    return t * (2 - t);
}
```

**CSS Addition:**

```css
@keyframes trailFade {
    0% {
        opacity: 0.6;
        transform: translate(-50%, -50%) scale(1);
    }
    100% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.5);
    }
}

.fish-dash-trail {
    box-shadow: 0 0 15px currentColor;
}
```

**UPDATE** behavior routing:

**FIND** switch statement in `update()` method:

**CHANGE**:

```javascript
case 'swoop':
    this.updateSwoop(deltaTime, playerX, playerY);
    break;
```

**TO**:

```javascript
case 'dash':
    this.updateDash(deltaTime, playerX, playerY);
    break;
```

**Verification Steps:**
1. Save changes to `Enemy.js`
2. Add CSS animation
3. Run `npm run dev`
4. Start game - advance to Wave 8 (first flying fish wave)
5. Verify flying fish circle players
6. Verify flying fish dash toward players
7. Verify trail effect appears during dash

**Success Criteria:**
- Flying fish circle players at distance
- Flying fish dash quickly toward players
- Dash has visual trail effect
- Flying fish retreat after dashing
- Behavior feels threatening but dodgeable

---

## Testing & Verification

### Manual Testing Checklist

**Spawn System:**
- [ ] Enemies spawn at door and windows (not screen edges)
- [ ] Door animation plays (swinging doors)
- [ ] Window glass shatters on first use
- [ ] Subsequent window spawns skip glass break
- [ ] Bounties always spawn at main door
- [ ] Bounty spawns have extended animation
- [ ] Yellow flash appears on bounty spawn
- [ ] Enemies can't be hit during spawn animation
- [ ] Enemies fade from invisible to visible

**Ranged Combat - Lobsters:**
- [ ] Lobsters stop moving when in range
- [ ] Lobsters wind up before shooting (pulsing effect)
- [ ] Lobsters fire heavy bullets (orange/red)
- [ ] Heavy bullets move slower than light bullets
- [ ] Bullets damage players on hit
- [ ] Lobsters have 3.5 second cooldown between shots
- [ ] Bounty lobsters ("Big Iron") fire explosive bullets
- [ ] Explosive bullets create AoE damage effect

**Ranged Combat - Shrimp:**
- [ ] Shrimp maintain distance while shooting
- [ ] Shrimp fire rapid light bullets (yellow)
- [ ] Shrimp kite away when too close
- [ ] Shrimp strafe around players
- [ ] Shrimp have 1.5 second cooldown between shots
- [ ] Bounty shrimp ("The Desperado") fire 3-round bursts

**Flying Fish:**
- [ ] Flying fish circle players at distance
- [ ] Flying fish dash toward players
- [ ] Dash creates visual trail effect
- [ ] Flying fish retreat after dash
- [ ] Behavior is threatening but dodgeable

**Integration:**
- [ ] Game starts without errors
- [ ] All 10 waves progress correctly
- [ ] Bounty system still functions
- [ ] Scoring system still functions
- [ ] Multiple players work correctly
- [ ] Performance is acceptable (60fps with many bullets)

### Performance Testing

**Test Scenario:** Wave 10 with all enemies + full bullet storm

**Expected Performance:**
- 60 FPS maintained
- No memory leaks
- Smooth animations
- Responsive controls

**If Performance Issues:**
1. Reduce trail effect frequency
2. Limit max concurrent bullets (pool system)
3. Optimize DOM updates (batch updates)
4. Consider canvas rendering instead of DOM

### Bug Scenarios to Test

1. **Rapid enemy spawns** - Do animations overlap correctly?
2. **Bounty spawn during chaos** - Does door animation still play?
3. **Many bullets on screen** - Does collision detection work?
4. **Player death during spawn** - Do animations clean up?
5. **Wave transition** - Do bullets clear properly?

---

## Rollback Plan

If critical issues occur during implementation:

**Rollback Procedure:**

1. **Revert WaveManager changes:**
   ```bash
   git checkout HEAD -- src/systems/WaveManager.js
   ```

2. **Revert Enemy behavior changes:**
   ```bash
   git checkout HEAD -- src/entities/Enemy.js
   ```

3. **Remove new files:**
   ```bash
   rm src/systems/SpawnPointManager.js
   rm src/entities/EnemyBullet.js
   ```

4. **Revert GameScene changes:**
   ```bash
   git checkout HEAD -- src/scenes/GameScene.js
   ```

**Partial Rollback Options:**

- **Keep spawn system, disable ranged combat:**
  - Comment out `updateRangedShooter()` and `updateRangedKiter()`
  - Revert enemy behavior routing to old methods

- **Keep ranged combat, disable spawn animations:**
  - Set all spawn animation durations to 0
  - Disable collision checks during spawn

---

## Post-Implementation Tasks

After all tasks complete:

1. **Play-test extensively** - 30+ minutes of gameplay
2. **Balance tuning:**
   - Adjust bullet speeds if too fast/slow
   - Tune enemy shot cooldowns
   - Adjust spawn animation durations
3. **Audio integration:**
   - Source/create audio files
   - Replace placeholder sound system
4. **Visual polish:**
   - Refine spawn animations
   - Improve bullet trails
   - Add more particle effects
5. **Documentation:**
   - Update README with new features
   - Document configuration values
   - Add gameplay tips

---

## Configuration Values for Tuning

Centralized config for easy balance adjustments:

```javascript
// In SpawnPointManager.js or separate config file
export const SPAWN_CONFIG = {
    MIN_SPAWN_DELAY: 500,           // ms between spawns at same point
    DOOR_ANIMATION_DURATION: 600,   // ms
    WINDOW_ANIMATION_DURATION: 500, // ms
    BOUNTY_ANIMATION_BONUS: 200,    // ms added to bounty spawns
};

export const BULLET_CONFIG = {
    LIGHT_SPEED: 400,               // pixels/second
    HEAVY_SPEED: 250,               // pixels/second
    LIGHT_DAMAGE: 4,                // damage
    HEAVY_DAMAGE: 8,                // damage
    BURST_COUNT: 3,                 // bullets in burst
    BURST_DELAY: 150,               // ms between burst shots
    EXPLOSION_RADIUS: 30,           // pixels
    EXPLOSION_DAMAGE_MULT: 0.5,     // multiplier for AoE damage
};

export const ENEMY_SHOOT_CONFIG = {
    LOBSTER_COOLDOWN: 3500,         // ms
    SHRIMP_COOLDOWN: 1500,          // ms
    LOBSTER_TELEGRAPH: 400,         // ms wind-up
    SHRIMP_KITE_DISTANCE: 200,      // pixels
    BULLET_INACCURACY: 0.1,         // radians
};
```

---

## Success Metrics

Implementation is successful when:

- [ ] All 8 tasks complete without errors
- [ ] Manual testing checklist 100% passed
- [ ] Performance maintains 60fps in Wave 10
- [ ] No console errors during 30-minute playthrough
- [ ] Spawn system feels thematic and engaging
- [ ] Ranged combat creates spectator moments
- [ ] Game remains fun and balanced

---

**Plan Status:** Ready for Implementation
**Next Step:** Begin Task 1 (Create SpawnPointManager)
**Estimated Time to Complete:** 8-12 hours
**Risk Level:** Medium - Multiple interconnected systems

---

**Notes for Implementation:**

- Implement tasks sequentially (1→2→3→...)
- Test after each task before proceeding
- Keep old code commented for easy rollback
- Use git commits after each task completion
- Focus on functionality first, polish later

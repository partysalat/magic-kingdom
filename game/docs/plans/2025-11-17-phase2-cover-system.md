# Cover System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add destructible cover objects to the saloon that block bullets and create tactical gameplay

**Architecture:** Create a Cover entity class and CoverManager system. Cover objects spawn at wave start, block bullets through collision detection, take damage, and show visual states. Barrels explode when destroyed. Boss attacks can damage cover.

**Tech Stack:** Phaser 3, JavaScript ES6 modules

---

## Task 1: Create Cover Entity Class

**Files:**
- Create: `src/entities/Cover.js`

**Step 1: Write basic Cover class structure**

Create the file with the basic Cover entity:

```javascript
export class Cover {
    constructor(scene, x, y, type) {
        this.scene = scene;
        this.type = type;  // 'table', 'bar', 'barrel', 'piano'
        this.alive = true;
        this.x = x;
        this.y = y;

        // Config will be loaded from COVER_TYPES
        this.loadConfig();

        this.health = this.maxHealth;

        // Create visual representation
        this.createSprite();
    }

    loadConfig() {
        const config = COVER_TYPES[this.type];
        if (!config) {
            throw new Error(`Unknown cover type: ${this.type}`);
        }

        this.name = config.name;
        this.maxHealth = config.maxHealth;
        this.width = config.width;
        this.height = config.height;
        this.color = config.color;
        this.explosive = config.explosive || false;
        this.explosionRadius = config.explosionRadius || 0;
        this.explosionDamage = config.explosionDamage || 0;
    }

    createSprite() {
        // Create rectangle sprite
        this.sprite = this.scene.add.rectangle(
            this.x,
            this.y,
            this.width,
            this.height,
            this.color
        );
        this.sprite.setStrokeStyle(3, 0x000000);

        // Enable physics
        this.scene.physics.add.existing(this.sprite, true); // true = static
    }

    takeDamage(amount) {
        if (!this.alive) return;

        this.health -= amount;

        if (this.health <= 0) {
            this.health = 0;
            this.destroy();
        } else {
            this.updateVisualDamage();
        }
    }

    updateVisualDamage() {
        const healthPercent = this.health / this.maxHealth;

        if (healthPercent <= 0.25) {
            // Nearly destroyed - very transparent
            this.sprite.setAlpha(0.4);
        } else if (healthPercent <= 0.5) {
            // Heavily damaged - semi-transparent
            this.sprite.setAlpha(0.6);
        } else if (healthPercent <= 0.75) {
            // Moderately damaged - slight transparency
            this.sprite.setAlpha(0.8);
        } else {
            // Pristine
            this.sprite.setAlpha(1.0);
        }
    }

    destroy() {
        if (!this.alive) return;

        this.alive = false;

        if (this.explosive) {
            this.explode();
        }

        // Destroy sprite
        if (this.sprite) {
            this.sprite.destroy();
            this.sprite = null;
        }
    }

    explode() {
        // Create explosion visual
        const explosion = this.scene.add.circle(
            this.x,
            this.y,
            this.explosionRadius,
            0xFF4500,
            0.6
        );

        // Explosion animation
        this.scene.tweens.add({
            targets: explosion,
            scale: { from: 0.5, to: 2 },
            alpha: { from: 0.8, to: 0 },
            duration: 400,
            onComplete: () => explosion.destroy()
        });

        // Damage everything in radius
        this.damageInRadius();
    }

    damageInRadius() {
        // Damage player
        if (this.scene.player && !this.scene.player.isDead()) {
            const dx = this.scene.player.getX() - this.x;
            const dy = this.scene.player.getY() - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < this.explosionRadius) {
                this.scene.player.takeDamage(this.explosionDamage);
            }
        }

        // Damage enemies
        this.scene.enemies.forEach(enemy => {
            if (!enemy.isAlive()) return;

            const dx = enemy.getSprite().x - this.x;
            const dy = enemy.getSprite().y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < this.explosionRadius) {
                enemy.takeDamage(this.explosionDamage);
            }
        });

        // Damage other cover objects
        if (this.scene.coverManager) {
            this.scene.coverManager.damageInRadius(
                this.x,
                this.y,
                this.explosionRadius,
                this.explosionDamage,
                this // exclude self
            );
        }
    }

    checkBulletCollision(bulletX, bulletY) {
        if (!this.alive) return false;

        // Simple AABB collision check
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;

        return (
            bulletX >= this.x - halfWidth &&
            bulletX <= this.x + halfWidth &&
            bulletY >= this.y - halfHeight &&
            bulletY <= this.y + halfHeight
        );
    }

    isAlive() {
        return this.alive;
    }

    getSprite() {
        return this.sprite;
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

// Cover type configurations
export const COVER_TYPES = {
    table: {
        name: 'Wooden Table',
        maxHealth: 100,
        width: 80,
        height: 40,
        color: 0x8B4513  // Brown
    },
    bar: {
        name: 'Bar Counter',
        maxHealth: 200,
        width: 120,
        height: 50,
        color: 0x654321  // Dark brown
    },
    barrel: {
        name: 'Barrel',
        maxHealth: 50,
        width: 40,
        height: 40,
        color: 0xA0522D,  // Sienna brown
        explosive: true,
        explosionRadius: 60,
        explosionDamage: 20
    },
    piano: {
        name: 'Piano',
        maxHealth: 150,
        width: 90,
        height: 60,
        color: 0x2F4F4F  // Dark slate gray
    }
};
```

**Step 2: Test Cover class instantiation manually**

Open browser console and verify no syntax errors when the file is loaded. Check that the game still runs.

**Step 3: Commit**

```bash
git add src/entities/Cover.js
git commit -m "feat: add Cover entity class with damage and explosion mechanics"
```

---

## Task 2: Create CoverManager System

**Files:**
- Create: `src/systems/CoverManager.js`

**Step 1: Write CoverManager class**

Create the CoverManager to handle all cover objects:

```javascript
import { Cover, COVER_TYPES } from '../entities/Cover.js';

export class CoverManager {
    constructor(scene) {
        this.scene = scene;
        this.covers = [];
    }

    spawnCoverForWave() {
        // Clear any existing cover
        this.clearAllCover();

        // Spawn cover objects based on fixed positions
        const coverLayout = [
            { type: 'table', x: 700, y: 750 },
            { type: 'piano', x: 1220, y: 750 },
            { type: 'barrel', x: 500, y: 540 },
            { type: 'barrel', x: 1420, y: 540 },
            { type: 'table', x: 650, y: 350 },
            { type: 'bar', x: 960, y: 300 },
            { type: 'table', x: 1270, y: 350 }
        ];

        coverLayout.forEach(layout => {
            const cover = new Cover(this.scene, layout.x, layout.y, layout.type);
            this.covers.push(cover);
        });
    }

    clearAllCover() {
        this.covers.forEach(cover => {
            if (cover.isAlive()) {
                cover.destroy();
            }
        });
        this.covers = [];
    }

    checkBulletCollision(bulletX, bulletY, bulletDamage) {
        for (let i = 0; i < this.covers.length; i++) {
            const cover = this.covers[i];

            if (!cover.isAlive()) continue;

            if (cover.checkBulletCollision(bulletX, bulletY)) {
                // Bullet hit this cover
                cover.takeDamage(bulletDamage);
                return true; // Bullet was blocked
            }
        }

        return false; // Bullet not blocked
    }

    damageInRadius(x, y, radius, damage, excludeCover = null) {
        this.covers.forEach(cover => {
            if (!cover.isAlive()) return;
            if (cover === excludeCover) return;

            const dx = cover.x - x;
            const dy = cover.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < radius) {
                cover.takeDamage(damage);
            }
        });
    }

    update() {
        // Clean up dead cover objects
        this.covers = this.covers.filter(cover => cover.isAlive());
    }

    getCovers() {
        return this.covers;
    }
}
```

**Step 2: Commit**

```bash
git add src/systems/CoverManager.js
git commit -m "feat: add CoverManager system for cover spawning and collision"
```

---

## Task 3: Integrate CoverManager into GameScene

**Files:**
- Modify: `src/scenes/GameScene.js`

**Step 1: Import CoverManager**

At the top of GameScene.js, add the import (around line 11):

```javascript
import { CoverManager } from '../systems/CoverManager.js';
```

**Step 2: Initialize CoverManager in create() method**

After the line that initializes BossAnnouncer (around line 87), add:

```javascript
// Initialize cover manager
this.coverManager = new CoverManager(this);
```

**Step 3: Spawn cover at wave start**

Find the `startWave()` method in GameScene.js and add cover spawning. After the wave announcement, add:

```javascript
// Spawn cover for this wave
this.coverManager.spawnCoverForWave();
```

**Step 4: Update CoverManager in update() method**

In the `update()` method, after updating the WaveManager (around line 226), add:

```javascript
// Update cover manager
if (this.coverManager) {
    this.coverManager.update();
}
```

**Step 5: Test cover spawning**

Run the game and verify that cover objects appear at the start of each wave. Check browser console for errors.

**Step 6: Commit**

```bash
git add src/scenes/GameScene.js
git commit -m "feat: integrate CoverManager into GameScene for wave-based spawning"
```

---

## Task 4: Add Bullet-Cover Collision Detection

**Files:**
- Modify: `src/scenes/GameScene.js`

**Step 1: Modify checkBulletCollisions() for player bullets**

Find the `checkBulletCollisions()` method (around line 523). Before the loop that checks enemy collisions, add cover collision check:

```javascript
checkBulletCollisions() {
    if (!this.player) return;

    const bullets = this.player.bullets;

    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        if (!bullet.isAlive()) continue;

        // Check cover collision FIRST
        if (this.coverManager) {
            const hitCover = this.coverManager.checkBulletCollision(
                bullet.getSprite().x,
                bullet.getSprite().y,
                bullet.getDamage()
            );

            if (hitCover) {
                bullet.destroy();
                continue; // Skip enemy collision check
            }
        }

        let hitEnemy = false;

        // Rest of enemy collision code...
```

**Step 2: Modify updateEnemyBullets() for enemy bullets**

Find the `updateEnemyBullets()` method in GameScene.js. Add cover collision check before player collision:

```javascript
updateEnemyBullets(delta) {
    for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
        const bullet = this.enemyBullets[i];

        if (!bullet.isAlive()) {
            this.enemyBullets.splice(i, 1);
            continue;
        }

        bullet.update(delta);

        // Check cover collision
        if (this.coverManager) {
            const hitCover = this.coverManager.checkBulletCollision(
                bullet.getX(),
                bullet.getY(),
                bullet.getDamage()
            );

            if (hitCover) {
                bullet.destroy();
                this.enemyBullets.splice(i, 1);
                continue;
            }
        }

        // Check player collision
        if (this.player && !this.player.isDead()) {
            // existing player collision code...
```

**Step 3: Test bullet-cover collisions**

Run the game and shoot at cover objects. Verify:
- Bullets hit cover and are destroyed
- Cover takes damage (alpha decreases)
- Enemy bullets are also blocked by cover

**Step 4: Commit**

```bash
git add src/scenes/GameScene.js
git commit -m "feat: add bullet-cover collision detection for player and enemy bullets"
```

---

## Task 5: Add Cover Destruction Visual Effects

**Files:**
- Modify: `src/entities/Cover.js`

**Step 1: Enhance destroy() method with particle effects**

Replace the `destroy()` method in Cover.js:

```javascript
destroy() {
    if (!this.alive) return;

    this.alive = false;

    // Create destruction particles
    this.createDestructionEffect();

    if (this.explosive) {
        this.explode();
    }

    // Destroy sprite after particles
    if (this.sprite) {
        this.scene.time.delayedCall(100, () => {
            if (this.sprite) {
                this.sprite.destroy();
                this.sprite = null;
            }
        });
    }
}

createDestructionEffect() {
    // Create 5-8 debris particles
    const numParticles = 5 + Math.floor(Math.random() * 4);

    for (let i = 0; i < numParticles; i++) {
        const angle = (Math.PI * 2 * i) / numParticles + Math.random() * 0.5;
        const speed = 100 + Math.random() * 100;
        const size = 4 + Math.random() * 6;

        const particle = this.scene.add.circle(
            this.x,
            this.y,
            size,
            this.color,
            0.8
        );

        this.scene.tweens.add({
            targets: particle,
            x: this.x + Math.cos(angle) * speed,
            y: this.y + Math.sin(angle) * speed,
            alpha: 0,
            duration: 400 + Math.random() * 200,
            onComplete: () => particle.destroy()
        });
    }
}
```

**Step 2: Test destruction effects**

Destroy cover objects by shooting them. Verify particles fly out and the cover disappears.

**Step 3: Commit**

```bash
git add src/entities/Cover.js
git commit -m "feat: add particle effects when cover is destroyed"
```

---

## Task 6: Add Boss Attack Interactions with Cover

**Files:**
- Modify: `src/entities/Enemy.js`

**Step 1: Add cover damage to Ground Pound attack (Leviathan)**

Find the `executeGroundPound()` method in Enemy.js (for boss_leviathan behavior). After the shockwave visual is created, add cover damage:

```javascript
// Damage cover in radius
if (this.scene.coverManager) {
    this.scene.coverManager.damageInRadius(
        this.sprite.x,
        this.sprite.y,
        200,  // shockwave radius
        50    // damage to cover
    );
}
```

**Step 2: Add cover damage to Lightning Strike attack (Leviathan)**

Find the `executeLightningStrike()` method. For each lightning bolt position, add cover damage:

```javascript
// After creating each lightning visual
if (this.scene.coverManager) {
    this.scene.coverManager.damageInRadius(
        pos.x,
        pos.y,
        80,   // lightning radius
        30    // damage to cover
    );
}
```

**Step 3: Add cover damage to Tidal Wave attack (Leviathan)**

Find the `executeTidalWave()` method. When the wave hits, damage all cover:

```javascript
// After wave visual, damage all cover
if (this.scene.coverManager) {
    const covers = this.scene.coverManager.getCovers();
    covers.forEach(cover => {
        if (cover.isAlive()) {
            cover.takeDamage(50); // Tidal wave damages all cover
        }
    });
}
```

**Step 4: Test boss attacks on cover**

- Start wave 9 (Leviathan boss)
- Verify Ground Pound destroys nearby cover
- Verify Lightning Strike destroys cover at strike points
- Verify Tidal Wave damages all cover

**Step 5: Commit**

```bash
git add src/entities/Enemy.js
git commit -m "feat: add cover destruction to boss special attacks"
```

---

## Task 7: Remove Old Obstacle System

**Files:**
- Modify: `src/scenes/GameScene.js`

**Step 1: Remove createObstacles() method**

Find and delete the `createObstacles()` method (around line 200-219).

**Step 2: Remove obstacles array initialization**

In the `create()` method, remove the line:

```javascript
// Remove this line:
this.createObstacles();
```

**Step 3: Remove obstacle collision code from enemy update**

In the `update()` method, find the enemy obstacle collision code (around line 310-322) and remove it:

```javascript
// Remove this entire block:
// Check obstacle collisions for enemy
this.obstacles.forEach(obstacle => {
    const dx = enemy.getSprite().x - obstacle.x;
    const dy = enemy.getSprite().y - obstacle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 55) {
        const pushAngle = Math.atan2(dy, dx);
        enemy.getSprite().x = obstacle.x + Math.cos(pushAngle) * 55;
        enemy.getSprite().y = obstacle.y + Math.sin(pushAngle) * 55;
    }
});
```

**Step 4: Remove player-obstacle collision setup**

In the `create()` method, remove:

```javascript
// Remove this block:
// Setup obstacle collisions with player
this.obstacles.forEach(obstacle => {
    this.physics.add.collider(this.player.sprite, obstacle);
});
```

**Step 5: Test that game still works**

Run the game and verify:
- Old barrel obstacles are gone
- New cover system works correctly
- No console errors

**Step 6: Commit**

```bash
git add src/scenes/GameScene.js
git commit -m "refactor: remove old obstacle system replaced by cover system"
```

---

## Task 8: Add Barrel Chain Reactions

**Files:**
- Modify: `src/entities/Cover.js`

**Step 1: Test barrel chain reactions**

The barrel explosion already calls `damageInRadius()` on CoverManager, which should trigger chain reactions. Test this:

1. Place two barrels near each other (already done in layout)
2. Destroy one barrel
3. Verify the explosion damages and potentially destroys the nearby barrel
4. Verify the second barrel also explodes if destroyed

**Step 2: If chain reactions don't work, add delay**

If explosions happen simultaneously and don't chain, modify the `explode()` method in Cover.js to add a small delay to damage:

```javascript
explode() {
    // Create explosion visual
    const explosion = this.scene.add.circle(
        this.x,
        this.y,
        this.explosionRadius,
        0xFF4500,
        0.6
    );

    // Explosion animation
    this.scene.tweens.add({
        targets: explosion,
        scale: { from: 0.5, to: 2 },
        alpha: { from: 0.8, to: 0 },
        duration: 400,
        onComplete: () => explosion.destroy()
    });

    // Damage after a tiny delay to allow this explosion to complete
    this.scene.time.delayedCall(50, () => {
        this.damageInRadius();
    });
}
```

**Step 3: Test chain reactions again**

Verify that barrels can trigger each other's explosions in a chain reaction.

**Step 4: Commit if changes made**

```bash
git add src/entities/Cover.js
git commit -m "feat: add delay to barrel explosions for chain reactions"
```

---

## Task 9: Add Visual Indicators for Cover Health

**Files:**
- Modify: `src/entities/Cover.js`

**Step 1: Add health bar visual to Cover**

Modify the `createSprite()` method to add a health bar:

```javascript
createSprite() {
    // Create rectangle sprite
    this.sprite = this.scene.add.rectangle(
        this.x,
        this.y,
        this.width,
        this.height,
        this.color
    );
    this.sprite.setStrokeStyle(3, 0x000000);

    // Enable physics
    this.scene.physics.add.existing(this.sprite, true);

    // Create health bar (initially hidden)
    this.healthBarBg = this.scene.add.rectangle(
        this.x,
        this.y - this.height / 2 - 10,
        this.width,
        4,
        0x000000,
        0.5
    );

    this.healthBarFill = this.scene.add.rectangle(
        this.x,
        this.y - this.height / 2 - 10,
        this.width,
        4,
        0x00ff00,
        0.8
    );

    // Hide health bar initially
    this.healthBarBg.setVisible(false);
    this.healthBarFill.setVisible(false);
}
```

**Step 2: Show health bar when damaged**

Modify `takeDamage()` to show health bar:

```javascript
takeDamage(amount) {
    if (!this.alive) return;

    this.health -= amount;

    // Show health bar when first damaged
    if (this.healthBarBg && this.healthBarFill) {
        this.healthBarBg.setVisible(true);
        this.healthBarFill.setVisible(true);
    }

    if (this.health <= 0) {
        this.health = 0;
        this.destroy();
    } else {
        this.updateVisualDamage();
    }
}
```

**Step 3: Update health bar in updateVisualDamage()**

Modify `updateVisualDamage()` to update the health bar width:

```javascript
updateVisualDamage() {
    const healthPercent = this.health / this.maxHealth;

    // Update alpha
    if (healthPercent <= 0.25) {
        this.sprite.setAlpha(0.4);
    } else if (healthPercent <= 0.5) {
        this.sprite.setAlpha(0.6);
    } else if (healthPercent <= 0.75) {
        this.sprite.setAlpha(0.8);
    } else {
        this.sprite.setAlpha(1.0);
    }

    // Update health bar
    if (this.healthBarFill) {
        this.healthBarFill.width = this.width * healthPercent;
        this.healthBarFill.x = this.x - this.width / 2 + (this.width * healthPercent) / 2;

        // Color transition: green -> yellow -> red
        if (healthPercent > 0.5) {
            this.healthBarFill.setFillStyle(0x00ff00, 0.8); // Green
        } else if (healthPercent > 0.25) {
            this.healthBarFill.setFillStyle(0xffff00, 0.8); // Yellow
        } else {
            this.healthBarFill.setFillStyle(0xff0000, 0.8); // Red
        }
    }
}
```

**Step 4: Destroy health bar when cover is destroyed**

Modify `destroy()` to clean up health bar:

```javascript
destroy() {
    if (!this.alive) return;

    this.alive = false;

    // Create destruction particles
    this.createDestructionEffect();

    if (this.explosive) {
        this.explode();
    }

    // Destroy health bar
    if (this.healthBarBg) {
        this.healthBarBg.destroy();
        this.healthBarBg = null;
    }
    if (this.healthBarFill) {
        this.healthBarFill.destroy();
        this.healthBarFill = null;
    }

    // Destroy sprite after particles
    if (this.sprite) {
        this.scene.time.delayedCall(100, () => {
            if (this.sprite) {
                this.sprite.destroy();
                this.sprite = null;
            }
        });
    }
}
```

**Step 5: Test health bars**

Shoot cover objects and verify:
- Health bar appears when damaged
- Health bar updates as cover takes more damage
- Health bar color changes from green to yellow to red
- Health bar disappears when cover is destroyed

**Step 6: Commit**

```bash
git add src/entities/Cover.js
git commit -m "feat: add health bars to cover objects showing damage state"
```

---

## Task 10: Final Testing and Polish

**Files:**
- None (testing phase)

**Step 1: Full playthrough test**

Play through waves 1-9:
- [ ] Cover spawns at start of each wave
- [ ] Player bullets blocked by cover
- [ ] Enemy bullets blocked by cover
- [ ] Cover takes damage and visual state updates
- [ ] Cover destroys when health reaches 0
- [ ] Barrels explode and damage nearby entities
- [ ] Barrel chain reactions work
- [ ] Boss attacks damage cover appropriately
- [ ] No console errors
- [ ] Game performance is smooth

**Step 2: Edge case testing**

Test specific scenarios:
- [ ] Shoot barrel until it explodes - verify explosion damages player if nearby
- [ ] Stand behind cover while enemies shoot - verify protection
- [ ] Leviathan ground pound near cover - verify cover destroyed in radius
- [ ] Multiple barrels exploding in chain - verify all explosions trigger
- [ ] Cover objects don't block player movement (they're static)

**Step 3: Document any issues**

If bugs found, create new tasks to fix them. Otherwise, proceed to commit.

**Step 4: Final commit**

```bash
git add -A
git commit -m "test: verify cover system functionality across all waves"
```

---

## Success Criteria

Implementation is successful when:

- [x] Cover spawns at wave start in fixed positions
- [x] Player and enemy bullets collide with cover
- [x] Cover takes damage and shows visual feedback
- [x] Barrels explode when destroyed
- [x] Barrel explosions can trigger chain reactions
- [x] Boss attacks damage cover appropriately
- [x] Health bars show cover damage state
- [x] Old obstacle system removed
- [x] No performance issues or bugs
- [x] Game is playable through all waves with cover

---

## Notes for Engineer

**Phaser 3 Collision System:**
- This game uses manual collision detection (distance calculations), not Phaser's built-in collision system
- All collision checks use `Math.sqrt(dx * dx + dy * dy)` to calculate distance
- Cover uses AABB (Axis-Aligned Bounding Box) collision for bullets

**Cover Placement:**
- Positions are hardcoded in CoverManager based on design doc layout
- Arena size is 1920x1080
- Cover forms a semi-circle around player spawn (960, 540)

**Boss Integration:**
- Phase 1 (Boss Waves) must be completed first
- Boss behaviors are in Enemy.js under boss-specific behavior methods
- Find methods like `executeGroundPound()`, `executeLightningStrike()`, `executeTidalWave()`

**Testing:**
- Use browser console to check for errors
- Game runs at http://localhost:8080 (or similar)
- Use `npm run dev` to start dev server

**Performance:**
- Cover count is low (7 objects per wave)
- Particles are short-lived (400-600ms)
- No physics simulation for static cover objects

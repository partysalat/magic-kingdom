# Phase 3: Competition Features Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add competitive elements including bounty enemies, cocktail powerup system, real-time leaderboard, and MVP ceremony to create engaging bar-friendly competition.

**Architecture:** Build on existing ScoreManager and WaveManager to add bounty enemy spawning, cocktail buff system with visual feedback, UI components for spectator-friendly competition tracking, and victory/MVP ceremony.

**Tech Stack:** Phaser.js, existing entity/system architecture

---

## Task 1: Bounty Enemy System - Data Model

**Files:**
- Modify: `src/entities/Enemy.js` (add bounty properties)
- Modify: `src/systems/ScoreManager.js` (add bounty scoring)

**Step 1: Add bounty enemy data to Enemy.js**

Modify the `Enemy` constructor to accept and handle bounty properties:

```javascript
constructor(scene, x, y, type = 'lobster', isBounty = false, bountyValue = 0) {
    this.scene = scene;
    this.type = type;
    this.isBounty = isBounty;
    this.bountyValue = bountyValue;
    this.bountyName = '';

    // ... existing constructor code ...

    // After existing properties, add bounty visual indicator
    if (this.isBounty) {
        this.createBountyIndicator();
    }
}
```

Add method to Enemy class:

```javascript
createBountyIndicator() {
    // Wanted poster icon above enemy
    this.bountyIcon = this.scene.add.circle(
        this.sprite.x,
        this.sprite.y - 30,
        10,
        0xffff00
    );
    this.bountyIcon.setStrokeStyle(2, 0xff0000);

    // Spotlight effect
    this.spotLight = this.scene.add.circle(
        this.sprite.x,
        this.sprite.y,
        this.config.radius + 15,
        0xffff00,
        0.3
    );
}

updateBountyVisuals() {
    if (this.isBounty && this.bountyIcon && this.spotLight) {
        this.bountyIcon.setPosition(this.sprite.x, this.sprite.y - 30);
        this.spotLight.setPosition(this.sprite.x, this.sprite.y);

        // Pulse animation
        const pulse = Math.sin(Date.now() / 300) * 0.15 + 0.85;
        this.spotLight.setScale(pulse);
    }
}

getBountyValue() {
    return this.bountyValue;
}

isBountyEnemy() {
    return this.isBounty;
}

setBountyName(name) {
    this.bountyName = name;
}

getBountyName() {
    return this.bountyName;
}
```

**Step 2: Update Enemy.update() to handle bounty visuals**

In `updateVisuals()` method, add:

```javascript
updateVisuals() {
    // ... existing visual updates ...

    // Update bounty visuals if this is a bounty enemy
    this.updateBountyVisuals();
}
```

**Step 3: Update Enemy.destroy() to clean up bounty visuals**

In `destroy()` method, add:

```javascript
destroy() {
    // ... existing cleanup ...

    // Clean up bounty visuals
    if (this.bountyIcon) this.bountyIcon.destroy();
    if (this.spotLight) this.spotLight.destroy();
}
```

**Step 4: Add bounty scoring to ScoreManager.js**

```javascript
addBountyKill(bountyValue) {
    this.score += bountyValue;
    console.log('Bounty killed! Bonus:', bountyValue, 'Score:', this.score);
    return this.score;
}
```

**Step 5: Run the game to verify no errors**

Run: `npm run dev`
Expected: Game runs without errors, no visual changes yet

**Step 6: Commit bounty data model**

```bash
git add src/entities/Enemy.js src/systems/ScoreManager.js
git commit -m "feat: add bounty enemy data model and visuals

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 2: Bounty Enemy Spawning Logic

**Files:**
- Modify: `src/systems/WaveManager.js` (add bounty spawn logic)

**Step 1: Add bounty names configuration**

At the top of WaveManager.js, add:

```javascript
const BOUNTY_NAMES = [
    { name: 'Big Claw McGraw', type: 'lobster' },
    { name: 'Shelly the Shellfish', type: 'hermit' },
    { name: 'Reef Reaper', type: 'jellyfish' },
    { name: 'Pistol Shrimp Pete', type: 'shrimp' }
];
```

**Step 2: Add bounty spawning helper method**

```javascript
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
```

**Step 3: Modify spawnEnemiesByComposition to spawn bounty**

Replace existing `spawnEnemiesByComposition` method:

```javascript
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
    // Visual announcement will be added in next task
}
```

**Step 4: Run the game to test bounty spawning**

Run: `npm run dev`
Expected: See yellow spotted enemies occasionally spawn, console shows bounty announcements

**Step 5: Commit bounty spawning**

```bash
git add src/systems/WaveManager.js
git commit -m "feat: implement bounty enemy spawning logic

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 3: Bounty Kill Detection and Scoring

**Files:**
- Modify: `src/scenes/GameScene.js` (update kill detection)

**Step 1: Update enemy kill detection in GameScene.js**

Find the section in `update()` where enemies are filtered (around line 174-202). Modify to detect bounty kills:

```javascript
// Update enemies
this.enemies = this.enemies.filter(enemy => {
    if (enemy.isAlive() && this.player) {
        enemy.update(time, this.player.getX(), this.player.getY());

        // ... existing obstacle collision code ...

        return true;
    } else if (!enemy.isAlive()) {
        // Check if this was a bounty enemy
        if (enemy.isBountyEnemy()) {
            const bountyValue = enemy.getBountyValue();
            const bountyName = enemy.getBountyName();
            this.scoreManager.addBountyKill(bountyValue);
            this.showBountyKillFeedback(bountyName, bountyValue);
        } else {
            this.scoreManager.addEnemyKill();
        }

        enemy.destroy();
        this.waveManager.enemyKilled();
        this.updateWaveUI();
        this.updateScoreUI();
        return false;
    }
    return true;
});
```

**Step 2: Add bounty kill feedback method**

Add new method to GameScene:

```javascript
showBountyKillFeedback(name, value) {
    // Screen flash
    this.cameras.main.flash(300, 255, 215, 0);

    // Large text announcement
    const announcement = this.add.text(960, 540, `${name}\n+${value} POINTS!`, {
        fontSize: '48px',
        color: '#ffff00',
        fontFamily: 'Arial',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 4
    }).setOrigin(0.5);

    // Fade out animation
    this.tweens.add({
        targets: announcement,
        alpha: 0,
        y: 440,
        duration: 2000,
        ease: 'Power2',
        onComplete: () => announcement.destroy()
    });
}
```

**Step 3: Run the game and test bounty kills**

Run: `npm run dev`
Expected: Killing yellow-spotted enemies shows bonus announcement and awards extra points

**Step 4: Commit bounty kill detection**

```bash
git add src/scenes/GameScene.js
git commit -m "feat: add bounty kill detection and feedback

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 4: Cocktail Powerup System - Data Model

**Files:**
- Create: `src/entities/Cocktail.js`

**Step 1: Create Cocktail.js entity**

```javascript
// Cocktail buff configurations
export const COCKTAIL_TYPES = {
    margarita: {
        name: 'Margarita',
        color: 0x00ff00,
        duration: 15000,
        effect: 'spread_shot',
        description: 'Spread Shot - bullets fan out'
    },
    mojito: {
        name: 'Mojito',
        color: 0x0088ff,
        duration: 15000,
        effect: 'rapid_fire',
        description: 'Rapid Fire - 2x fire rate'
    },
    old_fashioned: {
        name: 'Old Fashioned',
        color: 0xff8800,
        duration: 15000,
        effect: 'heavy_hitter',
        description: 'Heavy Hitter - 2x damage'
    },
    tequila_sunrise: {
        name: 'Tequila Sunrise',
        color: 0xffff00,
        duration: 20000,
        effect: 'damage_ramp',
        description: 'Damage Ramp - damage increases'
    },
    whiskey_sour: {
        name: 'Whiskey Sour',
        color: 0xffdd00,
        duration: 15000,
        effect: 'piercing',
        description: 'Piercing - bullets pass through'
    },
    manhattan: {
        name: 'Manhattan',
        color: 0xff0000,
        duration: 15000,
        effect: 'critical',
        description: 'Critical Hits - 50% chance 3x damage'
    }
};

export class Cocktail {
    constructor(scene, x, y, type) {
        this.scene = scene;
        this.type = type;
        this.config = COCKTAIL_TYPES[type];
        this.alive = true;

        // Create visual representation
        this.sprite = scene.add.circle(x, y, 15, this.config.color);
        this.sprite.setStrokeStyle(3, 0xffffff);

        // Add glow effect
        this.glow = scene.add.circle(x, y, 20, this.config.color, 0.3);

        // Floating animation
        scene.tweens.add({
            targets: [this.sprite, this.glow],
            y: y - 10,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        console.log('Cocktail created:', this.config.name, 'at', x, y);
    }

    getSprite() {
        return this.sprite;
    }

    getType() {
        return this.type;
    }

    getConfig() {
        return this.config;
    }

    isAlive() {
        return this.alive;
    }

    collect() {
        this.alive = false;
    }

    destroy() {
        if (this.sprite) this.sprite.destroy();
        if (this.glow) this.glow.destroy();
    }
}
```

**Step 2: Run game to verify no errors**

Run: `npm run dev`
Expected: Game runs without errors

**Step 3: Commit cocktail entity**

```bash
git add src/entities/Cocktail.js
git commit -m "feat: create cocktail powerup entity with types

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 5: Cocktail Spawning Between Waves

**Files:**
- Modify: `src/systems/WaveManager.js` (add cocktail spawn logic)
- Modify: `src/scenes/GameScene.js` (import and handle cocktails)

**Step 1: Import Cocktail in GameScene.js**

Add to imports at top:

```javascript
import { Cocktail, COCKTAIL_TYPES } from '../entities/Cocktail.js';
```

In `create()` method, after line 41, add:

```javascript
this.Cocktail = Cocktail;
this.COCKTAIL_TYPES = COCKTAIL_TYPES;
```

Also in `create()`, after line 66, add:

```javascript
// Create cocktails array
this.cocktails = [];
```

**Step 2: Add cocktail spawning to WaveManager**

Add method to WaveManager:

```javascript
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
```

**Step 3: Modify waveComplete to spawn cocktails**

Replace the `waveComplete()` method in WaveManager:

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
        this.startNextWave();
        if (this.scene.updateWaveUI) {
            this.scene.updateWaveUI();
        }
    });
}
```

**Step 4: Run game and test cocktail spawning**

Run: `npm run dev`
Expected: After completing a wave, 3 colored circles appear with "GRAB A COCKTAIL!" message

**Step 5: Commit cocktail spawning**

```bash
git add src/systems/WaveManager.js src/scenes/GameScene.js
git commit -m "feat: spawn cocktails between waves with countdown

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 6: Player Cocktail Buff System

**Files:**
- Modify: `src/entities/Player.js` (add buff system)

**Step 1: Add buff properties to Player constructor**

In Player constructor, after existing properties, add:

```javascript
// Buff system
this.activeBuff = null;
this.buffEndTime = 0;
this.buffAura = null;
this.damageRampMultiplier = 1.0;
this.rampShotsFired = 0;
```

**Step 2: Add buff application method**

```javascript
applyBuff(cocktailConfig) {
    console.log('Applying buff:', cocktailConfig.name);

    // Remove old buff visuals if any
    if (this.buffAura) {
        this.buffAura.destroy();
    }

    // Set new buff
    this.activeBuff = cocktailConfig.effect;
    this.buffEndTime = Date.now() + cocktailConfig.duration;

    // Reset damage ramp if applicable
    if (this.activeBuff === 'damage_ramp') {
        this.damageRampMultiplier = 1.0;
        this.rampShotsFired = 0;
    }

    // Create aura visual
    this.buffAura = this.scene.add.circle(
        this.sprite.x,
        this.sprite.y,
        30,
        cocktailConfig.color,
        0.4
    );
    this.buffAura.setDepth(-1);
}

getActiveBuff() {
    // Check if buff expired
    if (this.activeBuff && Date.now() > this.buffEndTime) {
        this.clearBuff();
    }
    return this.activeBuff;
}

clearBuff() {
    console.log('Buff expired');
    this.activeBuff = null;
    this.buffEndTime = 0;
    this.damageRampMultiplier = 1.0;
    this.rampShotsFired = 0;

    if (this.buffAura) {
        this.buffAura.destroy();
        this.buffAura = null;
    }
}
```

**Step 3: Update Player.update() to handle buff visuals**

In `update()` method, before the return, add:

```javascript
// Update buff aura position
if (this.buffAura) {
    this.buffAura.setPosition(this.sprite.x, this.sprite.y);
}

// Check buff expiration
this.getActiveBuff();
```

**Step 4: Modify shoot() method to apply buff effects**

Find the `shoot()` method and replace it with:

```javascript
shoot(targetX, targetY, currentTime) {
    // Check cooldown (modified by rapid_fire buff)
    const activeBuff = this.getActiveBuff();
    let cooldown = this.shootCooldown;

    if (activeBuff === 'rapid_fire') {
        cooldown = this.shootCooldown / 2;
    }

    if (currentTime - this.lastShootTime < cooldown) {
        return;
    }

    this.lastShootTime = currentTime;

    // Calculate base angle
    const dx = targetX - this.sprite.x;
    const dy = targetY - this.sprite.y;
    const baseAngle = Math.atan2(dy, dx);

    // Calculate damage with buffs
    let damage = this.bulletDamage;

    if (activeBuff === 'heavy_hitter') {
        damage *= 2;
    } else if (activeBuff === 'damage_ramp') {
        this.rampShotsFired++;
        this.damageRampMultiplier = 1.0 + (this.rampShotsFired * 0.05);
        damage *= this.damageRampMultiplier;
    } else if (activeBuff === 'critical') {
        if (Math.random() < 0.5) {
            damage *= 3;
        }
    }

    // Determine number of bullets and angles based on buff
    const bulletAngles = [];

    if (activeBuff === 'spread_shot') {
        // 5 bullets in fan pattern
        for (let i = -2; i <= 2; i++) {
            bulletAngles.push(baseAngle + (i * Math.PI / 12));
        }
    } else {
        // Single bullet
        bulletAngles.push(baseAngle);
    }

    // Create bullets
    bulletAngles.forEach(angle => {
        const bullet = new this.scene.Bullet(
            this.scene,
            this.sprite.x,
            this.sprite.y,
            angle,
            damage
        );

        // Mark piercing bullets
        if (activeBuff === 'piercing') {
            bullet.piercing = true;
        }

        this.bullets.push(bullet);
    });

    console.log('Player shot', bulletAngles.length, 'bullet(s) at', targetX, targetY);
}
```

**Step 5: Run game to verify no errors**

Run: `npm run dev`
Expected: Game runs without errors, buffs not yet collectible

**Step 6: Commit player buff system**

```bash
git add src/entities/Player.js
git commit -m "feat: add cocktail buff system to player

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 7: Cocktail Collection Detection

**Files:**
- Modify: `src/scenes/GameScene.js` (add collection logic)

**Step 1: Add cocktail collection check in update()**

In GameScene's `update()` method, after the health pickup collision check (around line 231), add:

```javascript
// Check cocktail collisions
this.cocktails = this.cocktails.filter(cocktail => {
    if (!cocktail.isAlive()) return false;

    if (this.player && !this.player.isDead()) {
        const dx = this.player.getX() - cocktail.getSprite().x;
        const dy = this.player.getY() - cocktail.getSprite().y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Collision if distance less than combined radii
        if (distance < 35) { // 20 (player) + 15 (cocktail)
            const config = cocktail.getConfig();
            this.player.applyBuff(config);
            cocktail.collect();
            this.showCocktailFeedback(config);
            this.updateBuffUI();

            console.log('Player collected:', config.name);
            return false;
        }
    }

    return true;
});
```

**Step 2: Add cocktail collection feedback**

Add new method to GameScene:

```javascript
showCocktailFeedback(config) {
    // Flash screen with cocktail color
    const r = (config.color >> 16) & 0xff;
    const g = (config.color >> 8) & 0xff;
    const b = config.color & 0xff;
    this.cameras.main.flash(200, r, g, b);

    // Show buff name
    const announcement = this.add.text(960, 400, config.name, {
        fontSize: '36px',
        color: '#' + config.color.toString(16).padStart(6, '0'),
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 3
    }).setOrigin(0.5);

    const description = this.add.text(960, 450, config.description, {
        fontSize: '24px',
        color: '#ffffff',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 2
    }).setOrigin(0.5);

    // Fade out
    this.tweens.add({
        targets: [announcement, description],
        alpha: 0,
        duration: 2000,
        onComplete: () => {
            announcement.destroy();
            description.destroy();
        }
    });
}
```

**Step 3: Add buff UI display**

In `create()` method, after the score display (around line 107), add:

```javascript
// Add buff display
this.buffText = this.add.text(960, 1000, '', {
    fontSize: '28px',
    color: '#ffffff',
    fontFamily: 'Arial',
    stroke: '#000000',
    strokeThickness: 3
}).setOrigin(0.5, 0);
```

Add new method:

```javascript
updateBuffUI() {
    if (!this.player) {
        this.buffText.setText('');
        return;
    }

    const buff = this.player.getActiveBuff();
    if (buff) {
        const timeLeft = Math.ceil((this.player.buffEndTime - Date.now()) / 1000);
        this.buffText.setText(`BUFF: ${buff.toUpperCase().replace('_', ' ')} (${timeLeft}s)`);
    } else {
        this.buffText.setText('');
    }
}
```

**Step 4: Update buff UI every frame**

In `update()` method, at the end of the main logic (before return), add:

```javascript
// Update buff UI
this.updateBuffUI();
```

**Step 5: Run game and test cocktail collection**

Run: `npm run dev`
Expected: Can collect cocktails after wave, see buff name, aura around player, buff effects work

**Step 6: Commit cocktail collection**

```bash
git add src/scenes/GameScene.js
git commit -m "feat: implement cocktail collection and buff UI

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 8: Piercing Bullets Implementation

**Files:**
- Modify: `src/entities/Bullet.js` (add piercing property)
- Modify: `src/scenes/GameScene.js` (handle piercing collision)

**Step 1: Add piercing property to Bullet**

In Bullet constructor, add:

```javascript
this.piercing = false;
```

Add method:

```javascript
isPiercing() {
    return this.piercing;
}

setPiercing(value) {
    this.piercing = value;
}
```

**Step 2: Modify bullet collision detection**

In GameScene's `checkBulletCollisions()` method, replace the bullet destruction logic:

```javascript
checkBulletCollisions() {
    if (!this.player) return;

    const bullets = this.player.bullets;

    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        if (!bullet.isAlive()) continue;

        let hitEnemy = false;

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
                hitEnemy = true;

                // Screen shake on hit
                this.cameras.main.shake(100, 0.002);

                // Flash enemy white
                enemy.getSprite().setFillStyle(0xffffff);
                this.time.delayedCall(100, () => {
                    if (enemy.isAlive()) {
                        enemy.getSprite().setFillStyle(enemy.config.color);
                    }
                });

                console.log('Bullet hit enemy!');

                // Only destroy bullet if not piercing
                if (!bullet.isPiercing()) {
                    bullet.destroy();
                    break;
                }
            }
        }

        // If piercing bullet didn't hit anything this frame, continue
        // Non-piercing bullets already destroyed above
    }
}
```

**Step 3: Run game and test piercing bullets**

Run: `npm run dev`
Expected: Whiskey Sour cocktail makes bullets pass through enemies

**Step 4: Commit piercing bullets**

```bash
git add src/entities/Bullet.js src/scenes/GameScene.js
git commit -m "feat: implement piercing bullet mechanic

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 9: Real-Time Leaderboard Display

**Files:**
- Modify: `src/scenes/GameScene.js` (add leaderboard UI)

**Step 1: Add player name configuration**

In `create()` method, after player creation (around line 31), add:

```javascript
// Player name (for single player, just "Player 1")
this.playerName = 'Player 1';
```

**Step 2: Create leaderboard UI**

In `create()` method, after buffText creation, add:

```javascript
// Create leaderboard panel
this.createLeaderboard();
```

Add new method:

```javascript
createLeaderboard() {
    const x = 1700;
    const y = 100;

    // Background panel
    const panel = this.add.rectangle(x, y, 200, 150, 0x000000, 0.7);
    panel.setStrokeStyle(3, 0xffff00);

    // Title
    this.add.text(x, y - 60, 'LEADERBOARD', {
        fontSize: '24px',
        color: '#ffff00',
        fontFamily: 'Arial',
        fontStyle: 'bold'
    }).setOrigin(0.5);

    // Player entry
    this.leaderboardEntry = this.add.text(x, y, '', {
        fontSize: '20px',
        color: '#ffffff',
        fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.updateLeaderboard();
}

updateLeaderboard() {
    if (!this.scoreManager || !this.leaderboardEntry) return;

    const score = this.scoreManager.getScore();
    this.leaderboardEntry.setText(`${this.playerName}: ${score}`);
}
```

**Step 3: Update leaderboard on score changes**

Modify `updateScoreUI()` to also update leaderboard:

```javascript
updateScoreUI() {
    this.scoreText.setText(`Score: ${this.scoreManager.getScore()}`);
    this.updateLeaderboard();
}
```

**Step 4: Run game and verify leaderboard**

Run: `npm run dev`
Expected: Yellow-bordered leaderboard panel in top-right showing player name and score

**Step 5: Commit leaderboard**

```bash
git add src/scenes/GameScene.js
git commit -m "feat: add real-time leaderboard display

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 10: MVP Victory Screen

**Files:**
- Modify: `src/scenes/GameScene.js` (enhance victory screen)

**Step 1: Create detailed MVP screen**

Replace the `handleVictory()` method:

```javascript
handleVictory() {
    console.log('Victory!');
    this.isGameOver = true;

    // Black overlay
    const overlay = this.add.rectangle(960, 540, 1920, 1080, 0x000000, 0.8);

    // Victory banner
    const victoryText = this.add.text(960, 200, 'VICTORY!', {
        fontSize: '96px',
        color: '#00ff00',
        fontFamily: 'Arial',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 8
    }).setOrigin(0.5);

    // Pulse animation
    this.tweens.add({
        targets: victoryText,
        scale: 1.1,
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });

    // MVP Section
    this.add.text(960, 320, 'MVP: ' + this.playerName, {
        fontSize: '48px',
        color: '#ffff00',
        fontFamily: 'Arial',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4
    }).setOrigin(0.5);

    // Spotlight effect on player
    const spotlight = this.add.circle(
        this.player.getX(),
        this.player.getY(),
        100,
        0xffff00,
        0.3
    );

    this.tweens.add({
        targets: spotlight,
        alpha: 0.5,
        scale: 1.2,
        duration: 1000,
        yoyo: true,
        repeat: -1
    });

    // Score breakdown
    const finalScore = this.scoreManager.getScore();
    const waveCount = this.waveManager.getCurrentWave();

    this.add.text(960, 420, 'SCORE BREAKDOWN', {
        fontSize: '32px',
        color: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(960, 480, `Waves Completed: ${waveCount}`, {
        fontSize: '24px',
        color: '#ffffff',
        fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.add.text(960, 520, `Final Score: ${finalScore}`, {
        fontSize: '32px',
        color: '#ffff00',
        fontFamily: 'Arial',
        fontStyle: 'bold'
    }).setOrigin(0.5);

    // Check high score
    const highScore = localStorage.getItem('highScore') || 0;
    if (finalScore > highScore) {
        localStorage.setItem('highScore', finalScore);

        this.add.text(960, 580, 'NEW HIGH SCORE!', {
            fontSize: '36px',
            color: '#ff00ff',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
    } else {
        this.add.text(960, 580, `High Score: ${highScore}`, {
            fontSize: '24px',
            color: '#aaaaaa',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
    }

    this.add.text(960, 700, 'Refresh to Play Again', {
        fontSize: '24px',
        color: '#ffffff',
        fontFamily: 'Arial'
    }).setOrigin(0.5);
}
```

**Step 2: Run game and reach victory**

Run: `npm run dev`
Expected: After completing 10 waves, see detailed MVP screen with spotlight and score breakdown

**Step 3: Commit MVP screen**

```bash
git add src/scenes/GameScene.js
git commit -m "feat: implement detailed MVP victory screen with high score

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 11: Enhanced Game Over Screen

**Files:**
- Modify: `src/scenes/GameScene.js` (enhance game over)

**Step 1: Improve game over screen**

Replace `handleGameOver()` method:

```javascript
handleGameOver() {
    console.log('Game Over!');
    this.isGameOver = true;

    // Black overlay
    const overlay = this.add.rectangle(960, 540, 1920, 1080, 0x000000, 0.8);

    // Game Over text
    const gameOverText = this.add.text(960, 300, 'GAME OVER', {
        fontSize: '96px',
        color: '#ff0000',
        fontFamily: 'Arial',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 8
    }).setOrigin(0.5);

    // Performance summary
    const finalScore = this.scoreManager.getScore();
    const waveReached = this.waveManager.getCurrentWave();

    this.add.text(960, 450, `Survived to Wave ${waveReached}/10`, {
        fontSize: '36px',
        color: '#ffffff',
        fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.add.text(960, 520, `Final Score: ${finalScore}`, {
        fontSize: '32px',
        color: '#ffff00',
        fontFamily: 'Arial',
        fontStyle: 'bold'
    }).setOrigin(0.5);

    // High score comparison
    const highScore = localStorage.getItem('highScore') || 0;
    if (finalScore > highScore) {
        localStorage.setItem('highScore', finalScore);

        this.add.text(960, 600, 'NEW HIGH SCORE!', {
            fontSize: '36px',
            color: '#ff00ff',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
    } else {
        this.add.text(960, 600, `High Score: ${highScore}`, {
            fontSize: '24px',
            color: '#aaaaaa',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
    }

    this.add.text(960, 700, 'Refresh to Try Again', {
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

**Step 2: Run game and test game over**

Run: `npm run dev`
Expected: Die to see enhanced game over screen with wave reached and high score

**Step 3: Commit enhanced game over**

```bash
git add src/scenes/GameScene.js
git commit -m "feat: enhance game over screen with wave progress and high score

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 12: Visual Polish - Bounty Announcements

**Files:**
- Modify: `src/systems/WaveManager.js` (add visual announcement)

**Step 1: Enhance announceBounty method**

Replace the `announceBounty()` method:

```javascript
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
```

**Step 2: Run game and verify bounty announcements**

Run: `npm run dev`
Expected: When bounty spawns, see large yellow banner with "WANTED" and enemy name

**Step 3: Commit bounty announcements**

```bash
git add src/systems/WaveManager.js
git commit -m "feat: add visual bounty announcement banner

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 13: Final Testing and Balance

**Files:**
- Test all Phase 3 features

**Step 1: Test bounty system**

Actions:
1. Run game
2. Play through 3 waves
3. Verify bounty enemies spawn with yellow spotlight
4. Kill bounty enemy and verify bonus points and announcement
5. Check score increases correctly

Expected: Bounty system works smoothly, announcements clear, scoring accurate

**Step 2: Test cocktail system**

Actions:
1. Complete first wave
2. Verify 3 cocktails spawn
3. Collect each type and verify buff activation
4. Test each buff effect:
   - Margarita: 5 bullets in spread
   - Mojito: Faster fire rate
   - Old Fashioned: Higher damage
   - Tequila Sunrise: Damage increases over time
   - Whiskey Sour: Bullets pierce
   - Manhattan: Random 3x damage
5. Verify buff expires after duration
6. Check visual aura appears and disappears

Expected: All cocktail buffs work as designed, visuals clear

**Step 3: Test leaderboard and MVP**

Actions:
1. Play full game to victory
2. Verify leaderboard updates in real-time
3. Check MVP screen shows:
   - Player name
   - Final score
   - Wave count
   - High score comparison
   - Spotlight on player
4. Test high score persistence (refresh and check)

Expected: MVP ceremony impressive, high score saves correctly

**Step 4: Test game over screen**

Actions:
1. Die during game
2. Verify game over shows:
   - Wave reached
   - Final score
   - High score comparison

Expected: Game over provides clear feedback on performance

**Step 5: Document any issues found**

If bugs found, create additional commits to fix them.

**Step 6: Final commit if any fixes needed**

```bash
git add .
git commit -m "fix: address any bugs found in Phase 3 testing

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Success Criteria

Phase 3 is complete when:

- ✅ Bounty enemies spawn randomly with visual indicators
- ✅ Killing bounties awards 100-1000 bonus points (scales with wave)
- ✅ 3 cocktails spawn between waves with 10-second grab period
- ✅ All 6 cocktail buffs work and affect gameplay
- ✅ Player has visual aura showing active buff
- ✅ Buff duration displays on UI
- ✅ Real-time leaderboard updates on every kill
- ✅ MVP victory screen shows spotlight, breakdown, high score
- ✅ Enhanced game over screen shows progress
- ✅ High scores persist in localStorage
- ✅ All visuals are spectator-friendly (large, clear, colorful)

---

## Notes

- **DRY**: Reuse existing collision detection patterns
- **YAGNI**: Don't add multiplayer support yet, Phase 3 is single-player
- **Frequent commits**: Each task should have 1-2 commits
- **Testing**: Test after each major feature (bounty, cocktails, screens)
- **Balance**: Bounty values and buff durations can be tuned later in Phase 4

---

## What's Next

After Phase 3, the game will have full competition features ready for single-player testing. Phase 4 will add:
- Visual polish (particles, screen shake, sound effects)
- Western audio theme
- Difficulty balancing
- Spectator UI improvements
# Game Adaptations - Boss Waves, Cover System, and Strategic AI

**Date:** 2025-11-17
**Status:** Design Complete - Ready for Implementation
**Priority Order:** Boss Waves → Cover System → Strategic AI

---

## Overview

Three major features to increase game difficulty and tactical depth:

1. **Boss Waves** - Structured boss encounters replacing normal waves
2. **Cover System** - Destructible obstacles providing tactical positioning
3. **Strategic Enemy AI** - Coordinated enemy formations with tanks and shooters

**Design Philosophy:**
- Implement features sequentially (one at a time)
- Make game significantly harder
- Iterate on difficulty tuning through playtesting
- Boss waves at fixed intervals (not random)

---

## Phase 1: Boss Waves

### Overview
- Replace normal waves 3, 6, and 9 with boss-only encounters
- Players enter boss fights with cocktail buffs from previous wave
- Dramatic announcements and intro sequences
- Bosses are visually distinct (larger, special colors, effects)

### Boss Wave Structure

**Wave 3: First Boss** (after waves 1-2 of normal combat)
- Players have cocktail buff from wave 2
- Boss-only encounter (no additional enemies)
- Moderate difficulty spike

**Wave 6: Mid Boss** (after waves 4-5 of normal combat)
- Players have cocktail buff from wave 5
- More challenging than wave 3 boss
- Introduces new mechanics

**Wave 9: Final Boss** (after waves 7-8 of normal combat)
- Players have cocktail buff from wave 8
- Ultimate challenge
- Multi-phase encounter

### Boss Designs

#### Wave 3: "Iron Shell" (Giant Hermit Crab)

**Visual Design:**
- 3x normal hermit crab size
- Dark metallic shell color
- Glowing weak points
- Particle effects around shell

**Stats:**
- Health: 400 HP
- Speed: 60 (slow)
- Damage: 15 per hit
- Behavior: `boss_iron_shell`

**Phase 1: Armored Tank (100% → 50% HP)**
- Slow movement toward player
- Ranged bubble attacks (shoots 3 bubbles in spread pattern)
- Shell deflects bullets from certain angles
- Attack cooldown: 3 seconds
- Bubble damage: 12 per hit
- Bubble speed: 300 px/s

**Phase 2: Enraged Charge (50% → 0% HP)**
- Shell cracks visually (damage effects)
- Speed increases to 120
- Adds melee charge attacks
- Charge telegraph: 0.5s wind-up, then rapid dash
- Charge damage: 20
- Charge distance: 400px
- Still uses bubble attacks but faster (2s cooldown)

**Boss Announcement:**
```
Screen darkens
Red spotlight on spawn point
Text: "BOSS WAVE"
Text: "IRON SHELL"
"The Armored Terror"
```

**Victory Bonus:**
- 500 points
- Special fanfare
- 3-second celebration before wave 4

---

#### Wave 6: "The Kraken's Arm" (Octopus Boss - New Enemy Type)

**Visual Design:**
- Large central body (60px radius)
- 4 tentacles extending outward (40px each)
- Purple/pink gradient colors
- Tentacles animated (writhing motion)
- Ink particle effects

**Stats:**
- Central Body Health: 300 HP
- Each Tentacle Health: 80 HP
- Speed: 40 (very slow)
- Damage: 20 per tentacle hit
- Behavior: `boss_kraken_arm`

**Mechanics:**

**Tentacle System:**
- 4 tentacles can be targeted independently
- Central body invulnerable until all tentacles damaged to 50% HP
- Tentacles regenerate slowly (5 HP per second) if not attacked
- Each tentacle attacks independently

**Attack Patterns:**
- **Tentacle Slam**: Single tentacle slams at player position (telegraph with shadow)
  - Damage: 20
  - Telegraph time: 0.8s
  - Cooldown per tentacle: 4s

- **Ink Cloud** (triggers at 60% body HP and 30% body HP):
  - Creates 3 dark circles on arena (100px radius each)
  - Obscures vision (darker overlay)
  - Slows player by 30% inside cloud
  - Lasts 8 seconds
  - Players must dodge or fight in clouds

- **Tentacle Sweep** (all tentacles at once):
  - 360° rotating sweep attack
  - Telegraph: tentacles glow bright
  - Damage: 25
  - Cooldown: 10s

**Strategy:**
- Players must damage all tentacles to expose body
- Tentacle regeneration forces aggressive play
- Ink clouds create area denial
- Must balance tentacle damage vs. dodging

**Boss Announcement:**
```
Screen flashes purple
Tentacles emerge from spawn point
Text: "BOSS WAVE"
Text: "THE KRAKEN'S ARM"
"Terror from the Deep"
```

**Victory Bonus:**
- 750 points

---

#### Wave 9: "The Leviathan" (Ultimate Boss)

**Visual Design:**
- Massive composite creature (2x size of other bosses)
- Combination of crab/lobster/sea monster features
- Multiple colors shifting between phases
- Intense particle effects (lightning, water splashes)
- Boss health bar fills entire top of screen

**Stats:**
- Phase 1 Health: 400 HP
- Phase 2 Health: 400 HP (refills)
- Speed: 80 (moderate)
- Behavior: `boss_leviathan`

**Phase 1: The Juggernaut (100% → 0% HP)**

**Attacks:**
- **Bullet Storm**: Fires 12 bullets in all directions
  - Damage: 8 per bullet
  - Bullet speed: 350 px/s
  - Cooldown: 5s

- **Ground Pound**: Jumps and creates shockwave
  - Telegraph: Boss glows and rises
  - Damage: 30 (if hit by shockwave)
  - Shockwave radius: 200px from landing
  - Cooldown: 8s

- **Charge Attack**: Rapid dash across arena
  - Telegraph: 1s wind-up, red line shows path
  - Damage: 25
  - Speed: 500 px/s
  - Cooldown: 6s

**Phase Transition (at 0 HP):**
- Boss doesn't die
- Screen flash
- "THE LEVIATHAN EVOLVES" announcement
- Boss health refills to 400 HP
- 3-second immunity period
- Spawns 4 support enemies (2 Shrimp + 2 Lobsters)

**Phase 2: The Storm (400 HP → 0 HP)**

**New Attacks:**
- **Lightning Strike**: 3 lightning bolts at random arena positions
  - Telegraph: Red circles appear 1s before strike
  - Damage: 35
  - Each bolt 80px radius
  - Cooldown: 7s

- **Tidal Wave**: Horizontal wave crosses entire arena
  - Telegraph: Boss moves to arena edge, water gathers
  - Wave travels from one side to other
  - Damage: 40
  - Must jump/dodge (not implemented, just move perpendicular)
  - Cooldown: 12s

- **Minion Spawn**: Summons 2 more enemies when reaching 50% HP
  - Can only happen once per phase

**Strategy:**
- Two distinct phases with different attack patterns
- Must manage adds while fighting boss
- High damage output forces constant movement
- Longest and most challenging fight

**Boss Announcement:**
```
Screen shakes
Lightning effects
Dramatic music swell
Text: "FINAL BOSS"
Text: "THE LEVIATHAN"
"The Unstoppable Force"
Camera briefly zooms on boss
```

**Victory Bonus:**
- 1000 points
- Victory screen
- Game complete (or continues to endless mode)

---

### Boss Technical Requirements

**ENEMY_TYPES Configuration:**
```javascript
boss_iron_shell: {
    name: 'Iron Shell',
    health: 400,
    speed: 60,
    damage: 15,
    behavior: 'boss_iron_shell',
    color: '#4a4a4a',
    size: 90,  // 3x normal hermit (30)
    isBoss: true,
    attackRange: 500,
    attackCooldown: 3000,
    // Phase 2 changes
    phase2Speed: 120,
    phase2Cooldown: 2000,
    chargeSpeed: 400,
    chargeDamage: 20
}

boss_kraken_arm: {
    name: "The Kraken's Arm",
    health: 300,
    speed: 40,
    damage: 20,
    behavior: 'boss_kraken_arm',
    color: '#9966cc',
    size: 60,
    isBoss: true,
    tentacleHealth: 80,
    tentacleCount: 4,
    tentacleRegenRate: 5,  // HP per second
    inkCloudRadius: 100,
    inkCloudDuration: 8000
}

boss_leviathan: {
    name: 'The Leviathan',
    health: 800,  // 400 per phase
    speed: 80,
    damage: 25,
    behavior: 'boss_leviathan',
    color: '#ff4500',
    size: 120,
    isBoss: true,
    phase2Adds: ['shrimp', 'shrimp', 'lobster', 'lobster'],
    attacks: {
        bulletStorm: { count: 12, damage: 8, cooldown: 5000 },
        groundPound: { damage: 30, radius: 200, cooldown: 8000 },
        charge: { damage: 25, speed: 500, cooldown: 6000 },
        lightning: { count: 3, damage: 35, radius: 80, cooldown: 7000 },
        tidalWave: { damage: 40, cooldown: 12000 }
    }
}
```

**Wave Composition Changes:**
```javascript
// In WaveManager.js
getWaveComposition(waveNumber) {
    const compositions = {
        1: [{ type: 'lobster', count: 5 }],
        2: [{ type: 'lobster', count: 7 }],

        // BOSS WAVE
        3: [{ type: 'boss_iron_shell', count: 1 }],

        4: [
            { type: 'lobster', count: 6 },
            { type: 'shrimp', count: 4 }
        ],
        5: [
            { type: 'lobster', count: 5 },
            { type: 'shrimp', count: 3 },
            { type: 'hermit', count: 2 }
        ],

        // BOSS WAVE
        6: [{ type: 'boss_kraken_arm', count: 1 }],

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

        // BOSS WAVE
        9: [{ type: 'boss_leviathan', count: 1 }],

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

**Boss Spawning:**
- Bosses always spawn at main door (dramatic entrance)
- Extended spawn animation (1.5s instead of 0.8s)
- Special boss announcement overlay
- Screen effects (shake, flash, darkening)

**Victory Rewards:**
```javascript
// In ScoreManager.js
BOSS_VICTORY_BONUS = {
    boss_iron_shell: 500,
    boss_kraken_arm: 750,
    boss_leviathan: 1000
};
```

---

## Phase 2: Cover System

### Overview
- Add destructible obstacles to saloon arena
- Both players and enemies can use cover
- Strategic placement encourages tactical movement
- Cover respawns fresh each wave

### Cover Objects

#### 1. Wooden Table
- **Health:** 100 HP
- **Size:** 80x40px (rectangular)
- **Visual:** Brown wooden table, Western style
- **Destruction:** Breaks into wooden splinters
- **Blocks:** All bullets completely

#### 2. Bar Counter
- **Health:** 200 HP (most durable)
- **Size:** 120x50px (long rectangular)
- **Visual:** Dark wood bar counter, polished
- **Destruction:** Cracks and shatters (takes a while)
- **Blocks:** All bullets completely
- **Special:** Permanent fixture, doesn't move

#### 3. Barrel
- **Health:** 50 HP (weakest)
- **Size:** 40x40px (circular)
- **Visual:** Wooden barrel with metal bands
- **Destruction:** EXPLODES when destroyed
- **Explosion:** 60px radius, 20 damage to everything nearby
- **Blocks:** All bullets completely
- **Risk/Reward:** Can be used tactically to damage enemies

#### 4. Piano
- **Health:** 150 HP
- **Size:** 90x60px (rectangular)
- **Visual:** Upright piano, black/brown
- **Destruction:** Keys scatter, wood breaks
- **Blocks:** All bullets completely
- **Special:** Positioned to one side of arena

### Cover Mechanics

**Bullet Collision:**
- Bullets hit cover instead of passing through
- Cover takes damage equal to bullet damage
- Bullet destroyed on impact
- Visual feedback: impact spark, damage crack

**Visual Damage States:**
- 100-75% HP: Pristine
- 75-50% HP: Minor cracks/scratches
- 50-25% HP: Significant damage, holes
- 25-0% HP: Nearly destroyed, barely standing
- 0% HP: Destruction animation, object removed

**Cover Usage:**
- Player and enemies behind cover are protected
- "Behind" means within 30px of cover on opposite side from attacker
- Cover doesn't block melee attacks
- Flying Fish attacks ignore cover (aerial)

**Cover Respawn:**
- Fresh cover spawns at start of each wave
- Previous damage doesn't carry over
- Boss waves have cover available

**Boss Interactions:**
- Boss special attacks can damage cover
- Ground Pound destroys all cover in radius
- Tidal Wave damages all cover for 50 HP
- Lightning Strike destroys cover at strike location

### Cover Placement Pattern

**Arena Layout (1920x1080):**
```
                [Door - Bottom Center]
                      (960, 1080)


        [Table]                    [Piano]
      (700, 750)                 (1220, 750)

   [Barrel]              [Barrel]
  (500, 540)            (1420, 540)

                    PLAYER
                 (960, 540)

        [Table]       [Bar Counter]      [Table]
      (650, 350)      (960, 300)       (1270, 350)


[Window Left]                            [Window Right]
   (-100, 400)                              (2020, 400)
```

**Total Objects per Wave:** 6-7 pieces
- 3 Tables
- 1 Bar Counter
- 2 Barrels
- 1 Piano

**Strategic Design:**
- Semi-circle around player spawn
- Multiple sight lines and flanking routes
- Barrel placement near enemy paths (risk/reward)
- Bar counter as central strong point
- Doesn't obstruct door/window spawns

### Cover Technical Implementation

**Cover Class:**
```javascript
export class Cover {
    constructor(scene, x, y, type) {
        this.scene = scene;
        this.type = type;  // 'table', 'bar', 'barrel', 'piano'
        this.config = COVER_TYPES[type];
        this.health = this.config.maxHealth;
        this.maxHealth = this.config.maxHealth;
        this.alive = true;

        // Create visual representation (Phaser sprite)
        this.sprite = scene.add.rectangle(
            x, y,
            this.config.width,
            this.config.height,
            this.config.color
        );
        this.sprite.setStrokeStyle(3, 0x000000);

        // Collision bounds
        this.bounds = {
            x: x,
            y: y,
            width: this.config.width,
            height: this.config.height
        };
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.destroy();
        } else {
            this.updateVisualDamage();
        }
    }

    updateVisualDamage() {
        const healthPercent = this.health / this.maxHealth;
        if (healthPercent < 0.25) {
            // Heavy damage visual
            this.sprite.setAlpha(0.5);
        } else if (healthPercent < 0.5) {
            // Medium damage visual
            this.sprite.setAlpha(0.7);
        }
    }

    destroy() {
        if (this.type === 'barrel') {
            this.explode();
        }
        this.alive = false;
        this.sprite.destroy();
    }

    explode() {
        // Create explosion visual
        const explosion = this.scene.add.circle(
            this.bounds.x,
            this.bounds.y,
            60,
            0xFF4500,
            0.6
        );

        // Damage everything in radius
        this.scene.damageInRadius(
            this.bounds.x,
            this.bounds.y,
            60,
            20
        );

        // Explosion animation
        this.scene.tweens.add({
            targets: explosion,
            scale: { from: 0.5, to: 2 },
            alpha: { from: 0.8, to: 0 },
            duration: 400,
            onComplete: () => explosion.destroy()
        });
    }

    checkBulletCollision(bulletX, bulletY) {
        return (
            bulletX >= this.bounds.x - this.bounds.width / 2 &&
            bulletX <= this.bounds.x + this.bounds.width / 2 &&
            bulletY >= this.bounds.y - this.bounds.height / 2 &&
            bulletY <= this.bounds.y + this.bounds.height / 2
        );
    }

    isPlayerBehind(playerX, playerY, attackerX, attackerY) {
        // Check if player is on opposite side of cover from attacker
        // Simple version: check if cover is between them
        const coverX = this.bounds.x;
        const coverY = this.bounds.y;

        const playerDist = Math.sqrt(
            Math.pow(playerX - coverX, 2) +
            Math.pow(playerY - coverY, 2)
        );

        if (playerDist > 50) return false;  // Too far from cover

        // More sophisticated collision line check would go here
        return true;  // Simplified for now
    }
}

export const COVER_TYPES = {
    table: {
        name: 'Wooden Table',
        maxHealth: 100,
        width: 80,
        height: 40,
        color: 0x8B4513,
        explosive: false
    },
    bar: {
        name: 'Bar Counter',
        maxHealth: 200,
        width: 120,
        height: 50,
        color: 0x654321,
        explosive: false
    },
    barrel: {
        name: 'Barrel',
        maxHealth: 50,
        width: 40,
        height: 40,
        color: 0xA0522D,
        explosive: true,
        explosionRadius: 60,
        explosionDamage: 20
    },
    piano: {
        name: 'Piano',
        maxHealth: 150,
        width: 90,
        height: 60,
        color: 0x2F4F4F,
        explosive: false
    }
};
```

---

## Phase 3: Strategic Enemy AI

### Overview
- Coordinated enemy formations
- Shooters position behind tank enemies
- Simple positioning logic (not complex pathfinding)
- Visual indicators for formations
- Starts appearing after first boss (wave 4+)

### Formation System

**Formation Types:**

#### Tank + Shooter Formation
- 1 Tank (Hermit Crab) + 1-2 Shooters (Shrimp or Lobster)
- Shooters stay 30-50px behind tank
- Tank moves 20% slower when shielding
- Formation breaks if >150px separation or tank dies

#### Heavy Formation (Late Waves)
- 2 Tanks + 3-4 Shooters
- Multiple layers of protection
- Shooters spread out behind tanks

### Formation Spawning

**Spawn Coordination:**
```javascript
// In WaveManager.js
getWaveComposition(waveNumber) {
    const compositions = {
        // ...existing waves...

        4: [
            {
                type: 'hermit',
                count: 2,
                role: 'tank'  // NEW: role tag
            },
            {
                type: 'shrimp',
                count: 4,
                role: 'shooter',  // NEW: role tag
                formationWith: 'tank'  // NEW: formation tag
            },
            {
                type: 'lobster',
                count: 2  // Regular enemies, no formation
            }
        ],

        // Wave 5+: More formations
        5: [
            {
                type: 'hermit',
                count: 2,
                role: 'tank'
            },
            {
                type: 'lobster',
                count: 4,
                role: 'shooter',
                formationWith: 'tank'
            },
            {
                type: 'jellyfish',
                count: 2  // No formation
            }
        ]

        // ...later waves have multiple formation groups
    };
}
```

**Spawn Timing:**
1. Tanks spawn first at spawn point
2. 2-second delay
3. Shooters spawn at same spawn point
4. Shooters automatically find nearest tank
5. Formation established

### Formation Behavior

**Shooter Positioning Logic:**
```javascript
// In Enemy.js - for shooters in formation

updateFormationPosition(tank) {
    if (!tank || !tank.isAlive()) {
        this.formationTank = null;
        return;  // Tank dead, break formation
    }

    // Calculate position behind tank
    const playerX = this.scene.player.getX();
    const playerY = this.scene.player.getY();

    // Get angle from tank to player
    const angleToPlayer = Math.atan2(
        playerY - tank.y,
        playerX - tank.x
    );

    // Position behind tank (opposite direction from player)
    const targetX = tank.x - Math.cos(angleToPlayer) * 40;
    const targetY = tank.y - Math.sin(angleToPlayer) * 40;

    // Check distance to target position
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Move toward target position if too far
    if (distance > 15) {
        this.velocityX = (dx / distance) * this.stats.speed * 0.8;
        this.velocityY = (dy / distance) * this.stats.speed * 0.8;
    } else {
        // In position, can shoot
        this.velocityX = tank.velocityX * 0.9;  // Match tank movement
        this.velocityY = tank.velocityY * 0.9;
    }

    // Check if formation should break (too far from tank)
    const distToTank = Math.sqrt(
        Math.pow(this.x - tank.x, 2) +
        Math.pow(this.y - tank.y, 2)
    );

    if (distToTank > 150) {
        this.formationTank = null;  // Break formation
    }
}
```

**Tank Behavior Modification:**
```javascript
// In Enemy.js - for tanks with shooters

updateTankFormation() {
    // Check if any shooters are behind us
    const shootersBehind = this.scene.enemies.filter(enemy => {
        return enemy.formationTank === this && enemy.isAlive();
    });

    if (shootersBehind.length > 0) {
        // Slow down when shielding
        this.speedMultiplier = 0.8;

        // Visual indicator (glow)
        this.sprite.setStrokeStyle(3, 0x00FF00, 0.5);
    } else {
        // Normal speed
        this.speedMultiplier = 1.0;
        this.sprite.setStrokeStyle(2, 0x000000, 0.5);
    }
}
```

### Visual Indicators

**Formation Lines:**
- Faint green line connecting shooter to tank
- Line updates each frame
- Only visible when formation active

**Tank Shield Glow:**
- Green outline on tank when protecting shooters
- Pulsing effect

**Implementation:**
```javascript
// In GameScene.js update loop

updateFormationVisuals() {
    this.formationLines.clear();

    this.enemies.forEach(enemy => {
        if (enemy.formationTank && enemy.formationTank.isAlive()) {
            // Draw line from shooter to tank
            this.formationLines.lineStyle(2, 0x00FF00, 0.3);
            this.formationLines.lineBetween(
                enemy.x, enemy.y,
                enemy.formationTank.x,
                enemy.formationTank.y
            );
        }
    });
}
```

### Formation Wave Progression

**Wave 4-5:** 1 formation (1 tank + 2 shooters)
**Wave 6:** BOSS (no formations)
**Wave 7:** 2 formations
**Wave 8:** 2 formations + some independent enemies
**Wave 9:** BOSS (no formations)
**Wave 10:** 3 formations + independent enemies

### Strategic AI Complexity

**What We're Implementing (Simple):**
- Shooters spawn near tanks
- Shooters move to stay behind tanks
- Formation breaks on distance/death
- Visual indicators

**What We're NOT Implementing (Too Complex):**
- Tanks actively intercepting bullets
- Complex pathfinding around obstacles
- Dynamic formation reformation
- Coordinated attack patterns
- Formations during boss fights

### Formation Interaction with Cover

**Formations + Cover System:**
- Tanks can position themselves at cover
- Shooters position behind tank AND use cover
- Creates very defensive formations
- Player must flank or use explosive barrels

**Example Scenario:**
```
[Cover/Table]
[Hermit Crab Tank]
[Shrimp] [Shrimp]
```
- Tank uses cover for protection
- Shooters behind tank
- Player must destroy table or flank around

---

## Difficulty Tuning Parameters

### Enemy Stat Increases

**Base Enemy Health (30% increase):**
- Lobster: 30 → 40 HP
- Shrimp: 15 → 20 HP
- Hermit: 50 → 65 HP
- Jellyfish: 25 → 33 HP
- Flying Fish: 20 → 26 HP

**Base Enemy Damage (30% increase):**
- Lobster bullets: 8 → 10 damage
- Shrimp bullets: 4 → 5 damage
- Hermit contact: 15 → 20 damage
- Jellyfish poison: 3/tick → 4/tick damage
- Flying Fish dash: 12 → 16 damage

**Enemy Speed (unchanged for now):**
- Keep current speeds
- Will adjust if too easy/hard

### Boss Stats (Covered Above)
- Iron Shell: 400 HP
- Kraken's Arm: 300 HP + (80 HP × 4 tentacles) = 620 total
- Leviathan: 800 HP (400 per phase)

### Wave Composition Adjustments

**Increase enemy counts by 20%:**
- Wave 1: 5 → 6 Lobsters
- Wave 2: 7 → 8 Lobsters
- Wave 4: 6+4 → 7+5 (Lobster + Shrimp)
- Wave 5: 5+3+2 → 6+4+2
- Wave 7: 5+5+3+2 → 6+6+4+3
- Wave 8: 6+6+3+2+3 → 7+7+4+3+4
- Wave 10: 8+8+5+4+5 → 10+10+6+5+6

### Player Cocktail Buffs (unchanged)
- Keep current buff effectiveness
- Buffs are crucial for boss fights
- May adjust duration if needed

### Cover Durability (tuning needed)
- Start with values listed above
- Monitor how quickly cover breaks
- Adjust if cover too weak/strong

### Testing Metrics

**What to Track:**
- Average time to complete each boss
- Number of deaths per wave
- Cover usage patterns
- Formation effectiveness (how often do they kill player)
- Wave completion rates

**Target Difficulty:**
- ~30% death rate on first boss
- ~50% death rate on mid boss
- ~70% death rate on final boss
- Cover should last 50% of wave duration
- Formations should force tactical play

---

## Implementation Order & Dependencies

### Phase 1: Boss Waves
**Dependencies:** None (can start immediately)
**Files to Modify:**
- `src/entities/Enemy.js` - Add boss types and behaviors
- `src/systems/WaveManager.js` - Boss wave compositions
- `src/scenes/GameScene.js` - Boss announcement system
- `src/systems/ScoreManager.js` - Boss victory bonuses

**Estimated Time:** 6-8 hours

---

### Phase 2: Cover System
**Dependencies:** Phase 1 complete (boss attacks interact with cover)
**New Files:**
- `src/entities/Cover.js` - Cover object class
- `src/systems/CoverManager.js` - Cover placement and management

**Files to Modify:**
- `src/scenes/GameScene.js` - Cover collision detection
- `src/entities/Enemy.js` - Enemy cover usage logic
- `src/entities/Bullet.js` - Bullet-cover collision

**Estimated Time:** 4-6 hours

---

### Phase 3: Strategic AI
**Dependencies:** Phase 2 complete (formations use cover)
**Files to Modify:**
- `src/entities/Enemy.js` - Formation behavior
- `src/systems/WaveManager.js` - Formation spawn coordination
- `src/scenes/GameScene.js` - Formation visual indicators

**Estimated Time:** 3-5 hours

---

**Total Estimated Implementation Time:** 13-19 hours

---

## Testing Strategy

### Phase 1 Testing (Boss Waves)
- [ ] Each boss spawns correctly at wave 3, 6, 9
- [ ] Boss announcement displays properly
- [ ] Iron Shell phase transition at 50% HP
- [ ] Kraken tentacle system works
- [ ] Leviathan phase 2 triggers correctly
- [ ] Boss victory bonuses awarded
- [ ] Cocktail buffs persist into boss fights

### Phase 2 Testing (Cover System)
- [ ] All 4 cover types spawn correctly
- [ ] Bullets collide with cover and damage it
- [ ] Cover visual damage states display
- [ ] Barrels explode and damage nearby entities
- [ ] Player protected when behind cover
- [ ] Enemies use cover tactically
- [ ] Cover respawns fresh each wave
- [ ] Boss attacks damage cover appropriately

### Phase 3 Testing (Strategic AI)
- [ ] Formations spawn correctly (tank first, then shooters)
- [ ] Shooters position behind tanks
- [ ] Formation breaks on distance/death
- [ ] Visual indicators (lines, glows) display
- [ ] Tank speed reduction when shielding
- [ ] Multiple formations in late waves
- [ ] Formations interact correctly with cover

### Difficulty Testing
- [ ] Play through all 10 waves
- [ ] Track death count per wave
- [ ] Time boss fights
- [ ] Assess if cover lasts appropriate duration
- [ ] Evaluate formation threat level
- [ ] Adjust stats based on feedback

---

## Future Enhancements (Post-Implementation)

**Not part of current scope, but good ideas for later:**

1. **More Boss Mechanics:**
   - Telegraphed ultimate attacks
   - Environmental hazards during boss fights
   - Boss weak points that must be targeted

2. **Advanced Cover:**
   - Half-height cover (blocks bullets, not vision)
   - Moving cover (barrels that roll)
   - Cover repair pickups

3. **Complex Formations:**
   - Flanking behavior (split and surround)
   - Rotating formations
   - Formation commanders (kill to break formation)

4. **Permanent Upgrades:**
   - Boss victories unlock permanent stat boosts
   - Meta-progression between runs
   - Unlockable weapons/abilities

---

## Success Criteria

Implementation is successful when:

- [ ] All 3 bosses implemented and beatable
- [ ] Boss fights feel epic and challenging
- [ ] Cover system creates tactical decisions
- [ ] Formations force player adaptation
- [ ] Game is significantly harder but fair
- [ ] No major bugs or performance issues
- [ ] Playtesting confirms difficulty is "quite hard"

---

**Status:** Design Document Complete
**Next Step:** Create detailed implementation plan for Phase 1 (Boss Waves)
**Ready for Development:** Yes
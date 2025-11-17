# Phase 3: Strategic Enemy AI Implementation Plan

**Date**: 2025-11-17
**Phase**: Strategic Enemy AI (Formation System)
**Source**: game_idea_2_adaptions2.md (lines 644-883)

## Overview

This plan implements strategic formation-based AI where enemies spawn with assigned roles (tank/shooter) and coordinate their positioning. Shooters stay behind tanks for protection, and tanks position themselves to shield shooters while advancing on the player.

## Prerequisites

- Phase 2 (Cover System) completed
- Enemy.js exists with basic movement and combat
- WaveManager.js handles wave spawning
- GameScene.js manages enemy updates

## Implementation Tasks

### Task 1: Add Formation System to Enemy.js

**File**: `src/entities/Enemy.js`

**Changes**:
1. Add formation properties to constructor:
   - `this.role = null` (will be 'tank', 'shooter', or null)
   - `this.formationGroup = null` (identifier for which formation this enemy belongs to)
   - `this.formationLeader = null` (reference to tank if this is a shooter)
   - `this.formationMembers = []` (references to shooters if this is a tank)

2. Add method `assignRole(role, formationGroup)`:
   ```javascript
   assignRole(role, formationGroup) {
       this.role = role;
       this.formationGroup = formationGroup;

       // Add visual indicator based on role
       if (role === 'tank') {
           this.addTankIndicator();
       } else if (role === 'shooter') {
           this.addShooterIndicator();
       }
   }
   ```

3. Add method `linkFormation(leader, members)`:
   ```javascript
   linkFormation(leader, members) {
       if (this.role === 'tank') {
           this.formationMembers = members;
           members.forEach(shooter => {
               shooter.formationLeader = this;
           });
       }
   }
   ```

4. Add method `addTankIndicator()`:
   - Create pulsing glow effect around tank sprite (blue/cyan tint)
   - Add "TANK" label above sprite (small, subtle)

5. Add method `addShooterIndicator()`:
   - Create subtle orange/red tint for shooter sprite
   - Add "SHOOTER" label above sprite (small, subtle)

**Verification**:
- Run game and verify enemies spawn without errors
- Visual indicators should not appear yet (roles not assigned)

---

### Task 2: Add Formation Positioning Logic to Enemy.js

**File**: `src/entities/Enemy.js`

**Changes**:
1. Modify `update()` method to call formation positioning before normal movement:
   ```javascript
   update() {
       if (!this.alive) return;

       // Formation positioning takes priority
       if (this.role === 'shooter' && this.formationLeader) {
           this.updateShooterPosition();
       } else if (this.role === 'tank' && this.formationMembers.length > 0) {
           this.updateTankPosition();
       } else {
           // Normal movement
           this.moveTowardPlayer();
       }

       // Rest of update logic...
   }
   ```

2. Add method `updateShooterPosition()`:
   ```javascript
   updateShooterPosition() {
       // Check if leader is alive
       if (!this.formationLeader || !this.formationLeader.isAlive()) {
           this.role = null;
           this.formationLeader = null;
           return;
       }

       const leader = this.formationLeader;
       const leaderPos = { x: leader.getSprite().x, y: leader.getSprite().y };
       const playerPos = { x: this.scene.player.getX(), y: this.scene.player.getY() };

       // Calculate angle from player to tank
       const angleToTank = Math.atan2(
           leaderPos.y - playerPos.y,
           leaderPos.x - playerPos.x
       );

       // Position shooter 80-120 pixels behind tank (away from player)
       const distance = 100;
       const targetX = leaderPos.x + Math.cos(angleToTank) * distance;
       const targetY = leaderPos.y + Math.sin(angleToTank) * distance;

       // Move toward target position
       const dx = targetX - this.getSprite().x;
       const dy = targetY - this.getSprite().y;
       const dist = Math.sqrt(dx * dx + dy * dy);

       if (dist > 10) {
           const moveSpeed = this.config.speed;
           this.getSprite().x += (dx / dist) * moveSpeed;
           this.getSprite().y += (dy / dist) * moveSpeed;
       }
   }
   ```

3. Add method `updateTankPosition()`:
   ```javascript
   updateTankPosition() {
       // Clean up dead shooters
       this.formationMembers = this.formationMembers.filter(s => s.isAlive());

       if (this.formationMembers.length === 0) {
           this.role = null;
           return;
       }

       // Calculate centroid of shooters
       let avgX = 0, avgY = 0;
       this.formationMembers.forEach(shooter => {
           avgX += shooter.getSprite().x;
           avgY += shooter.getSprite().y;
       });
       avgX /= this.formationMembers.length;
       avgY /= this.formationMembers.length;

       const playerPos = { x: this.scene.player.getX(), y: this.scene.player.getY() };

       // Calculate angle from shooters to player
       const angleToPlayer = Math.atan2(
           playerPos.y - avgY,
           playerPos.x - avgX
       );

       // Position tank 60-80 pixels ahead of shooters (toward player)
       const distance = 70;
       const targetX = avgX + Math.cos(angleToPlayer) * distance;
       const targetY = avgY + Math.sin(angleToPlayer) * distance;

       // Move toward target position
       const dx = targetX - this.getSprite().x;
       const dy = targetY - this.getSprite().y;
       const dist = Math.sqrt(dx * dx + dy * dy);

       if (dist > 10) {
           const moveSpeed = this.config.speed * 0.8; // Slightly slower when protecting
           this.getSprite().x += (dx / dist) * moveSpeed;
           this.getSprite().y += (dy / dist) * moveSpeed;
       }
   }
   ```

**Verification**:
- No errors when running game
- Formation logic exists but won't activate until roles are assigned

---

### Task 3: Add Formation Assignment to WaveManager.js

**File**: `src/systems/WaveManager.js`

**Changes**:
1. Update wave compositions (lines 32-76) to include role information:
   ```javascript
   getWaveComposition(waveNumber) {
       const compositions = {
           1: [{ type: 'lobster', count: 5 }],
           2: [{ type: 'lobster', count: 7 }],
           3: [{ type: 'boss_iron_shell', count: 1, isBoss: true }],

           // Start formations from wave 4
           4: [
               { type: 'lobster', count: 3, role: 'tank' },
               { type: 'shrimp', count: 4, role: 'shooter' }
           ],
           5: [
               { type: 'lobster', count: 3, role: 'tank' },
               { type: 'shrimp', count: 3, role: 'shooter' },
               { type: 'hermit', count: 2 }
           ],
           6: [{ type: 'boss_kraken_arm', count: 1, isBoss: true }],
           7: [
               { type: 'lobster', count: 3, role: 'tank' },
               { type: 'hermit', count: 2, role: 'tank' },
               { type: 'shrimp', count: 5, role: 'shooter' },
               { type: 'jellyfish', count: 2, role: 'shooter' }
           ],
           8: [
               { type: 'lobster', count: 4, role: 'tank' },
               { type: 'hermit', count: 2, role: 'tank' },
               { type: 'shrimp', count: 6, role: 'shooter' },
               { type: 'jellyfish', count: 2, role: 'shooter' },
               { type: 'flyingfish', count: 3 }
           ],
           9: [{ type: 'boss_leviathan', count: 1, isBoss: true }],
           10: [
               { type: 'lobster', count: 5, role: 'tank' },
               { type: 'hermit', count: 3, role: 'tank' },
               { type: 'shrimp', count: 8, role: 'shooter' },
               { type: 'jellyfish', count: 4, role: 'shooter' },
               { type: 'flyingfish', count: 5 }
           ]
       };

       return compositions[waveNumber] || compositions[10];
   }
   ```

2. Modify `spawnEnemiesByComposition()` method (after line 253) to assign roles and link formations:
   ```javascript
   spawnEnemiesByComposition(composition) {
       // ... existing spawn logic ...

       // After all enemies are spawned, assign formations
       this.assignFormations(composition);
   }
   ```

3. Add new method `assignFormations(composition)`:
   ```javascript
   assignFormations(composition) {
       // Get all tanks and shooters from this wave
       const tanks = [];
       const shooters = [];

       this.scene.enemies.forEach(enemy => {
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
       }
   }
   ```

**Verification**:
- Start game and reach wave 4
- Console should log formation assignment
- Enemies should have visual role indicators (tank glow, shooter tint)

---

### Task 4: Add Formation Visual Indicators to GameScene.js

**File**: `src/scenes/GameScene.js`

**Changes**:
1. Add formation line rendering in `update()` method (after enemy updates):
   ```javascript
   update(time, delta) {
       // ... existing update logic ...

       // Update enemies
       this.enemies.forEach(enemy => {
           enemy.update();
       });

       // Render formation lines
       this.renderFormationLines();

       // ... rest of update logic ...
   }
   ```

2. Initialize graphics object in `create()` method:
   ```javascript
   create() {
       // ... existing create logic ...

       // Create graphics for formation lines
       this.formationGraphics = this.add.graphics();
       this.formationGraphics.setDepth(5); // Above ground, below UI

       // ... rest of create logic ...
   }
   ```

3. Add method `renderFormationLines()`:
   ```javascript
   renderFormationLines() {
       if (!this.formationGraphics) return;

       this.formationGraphics.clear();

       // Draw lines from shooters to their tanks
       this.enemies.forEach(enemy => {
           if (enemy.role === 'shooter' && enemy.formationLeader && enemy.formationLeader.isAlive()) {
               const shooter = enemy.getSprite();
               const tank = enemy.formationLeader.getSprite();

               // Draw dotted line
               this.formationGraphics.lineStyle(2, 0x00ff00, 0.3);

               const steps = 10;
               for (let i = 0; i < steps; i += 2) {
                   const t1 = i / steps;
                   const t2 = (i + 1) / steps;

                   const x1 = shooter.x + (tank.x - shooter.x) * t1;
                   const y1 = shooter.y + (tank.y - shooter.y) * t1;
                   const x2 = shooter.x + (tank.x - shooter.x) * t2;
                   const y2 = shooter.y + (tank.y - shooter.y) * t2;

                   this.formationGraphics.lineBetween(x1, y1, x2, y2);
               }
           }
       });
   }
   ```

**Verification**:
- Wave 4 should show green dotted lines connecting shooters to tanks
- Lines should update in real-time as enemies move
- Lines should disappear when tank or shooter dies

---

### Task 5: Add Tank Protection Behavior

**File**: `src/entities/Enemy.js`

**Changes**:
1. Modify tank damage handling to protect shooters:
   ```javascript
   takeDamage(amount, source = null) {
       if (!this.alive) return;

       // Tanks take reduced damage when protecting shooters
       if (this.role === 'tank' && this.formationMembers.length > 0) {
           amount *= 0.8; // 20% damage reduction

           // Visual feedback for damage reduction
           this.flashProtectionShield();
       }

       this.health -= amount;

       // ... rest of takeDamage logic ...
   }
   ```

2. Add method `flashProtectionShield()`:
   ```javascript
   flashProtectionShield() {
       // Create brief shield flash
       const shield = this.scene.add.circle(
           this.getSprite().x,
           this.getSprite().y,
           this.config.radius + 10,
           0x00ffff,
           0.3
       );

       this.scene.tweens.add({
           targets: shield,
           alpha: 0,
           duration: 200,
           onComplete: () => shield.destroy()
       });
   }
   ```

**Verification**:
- Shoot tanks in formation - they should show blue shield flash
- Tanks should take slightly less damage (verify with console logs if needed)

---

### Task 6: Add Strategic Shooter Behavior

**File**: `src/entities/Enemy.js`

**Changes**:
1. Modify shooter combat behavior to maintain distance:
   ```javascript
   updateCombat() {
       if (!this.alive || !this.scene.player) return;

       const player = this.scene.player;
       const dx = player.getX() - this.getSprite().x;
       const dy = player.getY() - this.getSprite().y;
       const distToPlayer = Math.sqrt(dx * dx + dy * dy);

       // Shooters maintain optimal distance
       if (this.role === 'shooter') {
           const optimalDistance = 300;

           if (distToPlayer < optimalDistance - 50) {
               // Too close - back away
               this.getSprite().x -= (dx / distToPlayer) * this.config.speed * 0.5;
               this.getSprite().y -= (dy / distToPlayer) * this.config.speed * 0.5;
           }
       }

       // ... rest of combat logic (shooting) ...
   }
   ```

**Verification**:
- Shooters should try to maintain ~300 pixel distance from player
- Shooters should back away if player gets too close

---

### Task 7: Testing and Polish

**Testing Checklist**:
1. Wave 1-3: No formations (control test)
2. Wave 4: First formation appears
   - 3 tanks, 4 shooters
   - Green lines connect shooters to tanks
   - Shooters stay behind tanks
   - Tanks advance toward player
3. Wave 5-8: Multiple formations
   - Multiple tank-shooter groups
   - Each shooter linked to nearest tank
   - Formation breaks down gracefully when members die
4. Wave 10: Maximum chaos
   - Large formations with 5+ tanks and 8+ shooters
   - Cover system still functional
   - Performance remains smooth

**Polish Tasks**:
1. Add sound effect when formation is established
2. Add console log feedback when formations break (all tanks/shooters dead)
3. Ensure formation labels are readable but not intrusive
4. Verify formation behavior works with cover system (enemies should still use cover)

**Verification**:
- Play through waves 1-10
- Verify no console errors
- Confirm formations are visually clear and gameplay is more strategic

---

## Implementation Notes

### Formation Assignment Logic
- Formations are assigned AFTER all enemies spawn
- Each tank can protect multiple shooters (distributed evenly)
- Shooters without tanks revert to normal behavior
- Formations dissolve gracefully when members die

### Performance Considerations
- Formation line rendering uses single graphics object (cleared each frame)
- Formation calculations only run for enemies with assigned roles
- Dead enemy cleanup happens automatically in existing update loops

### Design Decisions
1. **Why shooters follow tanks**: Creates dynamic defensive formations that move toward player
2. **Why tanks slow down**: Prevents tanks from leaving shooters behind
3. **Why 80-120 pixel distances**: Provides enough spacing to see formation but keeps group cohesive
4. **Why damage reduction for tanks**: Incentivizes player to prioritize targets strategically

---

## Success Criteria

- [ ] Formations spawn starting wave 4
- [ ] Visual indicators (lines, glows, labels) are clear
- [ ] Shooters position themselves behind tanks relative to player
- [ ] Tanks position themselves between shooters and player
- [ ] Formations adapt when members die
- [ ] No performance degradation
- [ ] Cover system continues to work alongside formations
- [ ] Gameplay feels more strategic and challenging

---

## Files Modified Summary

1. **src/entities/Enemy.js** - Formation logic, positioning, visual indicators
2. **src/systems/WaveManager.js** - Role assignments, formation linking
3. **src/scenes/GameScene.js** - Formation line rendering

## Estimated Completion Time

- Task 1: 30 minutes
- Task 2: 45 minutes
- Task 3: 30 minutes
- Task 4: 30 minutes
- Task 5: 20 minutes
- Task 6: 20 minutes
- Task 7: 45 minutes

**Total**: ~3.5 hours

# Auto-Aim Control System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace twin-stick shooter controls with gamepad-friendly auto-aim system that supports aim influence and bounty targeting.

**Architecture:** Create new InputManager to handle gamepad and keyboard/mouse, implement TargetSelector for auto-aim logic with priority system (bounty locks > influenced targets > nearest enemy), and refactor Player shooting to use selected targets instead of manual aim direction.

**Tech Stack:** Phaser 3 (existing), vanilla JavaScript (ES6 modules)

---

## Current System Analysis

**Existing Input System:**
- GameScene.js:50-66: Keyboard WASD movement
- GameScene.js:58-66: Mouse hold-to-shoot with manual aim
- Player.js:94-161: shoot() method takes targetX/targetY coordinates

**Refactoring Strategy:**
- Keep Player movement logic (works fine for 8-directional)
- Replace shoot() parameters from (targetX, targetY) to (targetEnemy)
- Add new InputManager system to handle gamepad + keyboard/mouse
- Add new TargetSelector system for auto-aim logic
- Update GameScene to wire new systems together

---

## Task 1: Create InputManager System

**Files:**
- Create: `src/systems/InputManager.js`
- Test: Manual testing (no test framework in project)

**Step 1: Write InputManager class structure**

Create `src/systems/InputManager.js`:

```javascript
export class InputManager {
    constructor(scene, playerIndex = 0) {
        this.scene = scene;
        this.playerIndex = playerIndex;

        // Input state
        this.movement = { x: 0, y: 0 };
        this.aimInfluence = { x: 0, y: 0 };
        this.isFiring = false;
        this.cycleTargetNext = false;
        this.cycleTargetPrev = false;

        // Input mode (auto-detected)
        this.inputMode = 'keyboard'; // 'keyboard' or 'gamepad'

        this.setupKeyboard();
        this.setupGamepad();
    }

    setupKeyboard() {
        // WASD movement
        this.keys = this.scene.input.keyboard.addKeys({
            W: Phaser.Input.Keyboard.KeyCodes.W,
            A: Phaser.Input.Keyboard.KeyCodes.A,
            S: Phaser.Input.Keyboard.KeyCodes.S,
            D: Phaser.Input.Keyboard.KeyCodes.D,
            Q: Phaser.Input.Keyboard.KeyCodes.Q,
            E: Phaser.Input.Keyboard.KeyCodes.E
        });

        // Mouse firing
        this.scene.input.on('pointerdown', () => {
            this.isFiring = true;
            this.inputMode = 'keyboard';
        });

        this.scene.input.on('pointerup', () => {
            this.isFiring = false;
        });
    }

    setupGamepad() {
        // Gamepad setup happens in update when pad is detected
        this.gamepad = null;
    }

    update() {
        // Try to get gamepad
        if (!this.gamepad && this.scene.input.gamepad) {
            const pads = this.scene.input.gamepad.gamepads;
            if (pads[this.playerIndex]) {
                this.gamepad = pads[this.playerIndex];
                console.log('Gamepad connected for player', this.playerIndex);
            }
        }

        // Reset cycle flags each frame
        this.cycleTargetNext = false;
        this.cycleTargetPrev = false;

        if (this.gamepad && this.gamepad.connected) {
            this.updateGamepad();
        } else {
            this.updateKeyboard();
        }
    }

    updateKeyboard() {
        // Movement from WASD
        this.movement.x = 0;
        this.movement.y = 0;

        if (this.keys.W.isDown) this.movement.y = -1;
        if (this.keys.S.isDown) this.movement.y = 1;
        if (this.keys.A.isDown) this.movement.x = -1;
        if (this.keys.D.isDown) this.movement.x = 1;

        // Aim influence from mouse position
        const pointer = this.scene.input.activePointer;
        this.aimInfluence.x = pointer.worldX;
        this.aimInfluence.y = pointer.worldY;

        // Target cycling with Q/E
        if (Phaser.Input.Keyboard.JustDown(this.keys.Q)) {
            this.cycleTargetPrev = true;
        }
        if (Phaser.Input.Keyboard.JustDown(this.keys.E)) {
            this.cycleTargetNext = true;
        }
    }

    updateGamepad() {
        this.inputMode = 'gamepad';

        // Left stick for movement
        const leftStick = this.gamepad.leftStick;
        this.movement.x = Math.abs(leftStick.x) > 0.1 ? leftStick.x : 0;
        this.movement.y = Math.abs(leftStick.y) > 0.1 ? leftStick.y : 0;

        // Right stick for aim influence (direction-based)
        const rightStick = this.gamepad.rightStick;
        this.aimInfluence.x = Math.abs(rightStick.x) > 0.1 ? rightStick.x : 0;
        this.aimInfluence.y = Math.abs(rightStick.y) > 0.1 ? rightStick.y : 0;

        // Right trigger for firing
        this.isFiring = this.gamepad.R2 > 0.1;

        // L1/R1 for target cycling
        if (this.gamepad.L1 && !this.lastL1) {
            this.cycleTargetPrev = true;
        }
        if (this.gamepad.R1 && !this.lastR1) {
            this.cycleTargetNext = true;
        }

        this.lastL1 = this.gamepad.L1;
        this.lastR1 = this.gamepad.R1;
    }

    getMovement() {
        return this.movement;
    }

    getAimInfluence() {
        return this.aimInfluence;
    }

    getInputMode() {
        return this.inputMode;
    }

    isFiringPressed() {
        return this.isFiring;
    }

    shouldCycleTargetNext() {
        return this.cycleTargetNext;
    }

    shouldCycleTargetPrev() {
        return this.cycleTargetPrev;
    }
}
```

**Step 2: Test InputManager with placeholder integration**

Add to GameScene.js create() method (after line 47):
```javascript
this.inputManager = new InputManager(this, 0);
```

Import at top of GameScene.js:
```javascript
import { InputManager } from '../systems/InputManager.js';
```

Add to GameScene.js update() method (after line 183):
```javascript
this.inputManager.update();
```

**Step 3: Run game and verify input detection**

Run: `npm run dev`
Expected: Game starts, console shows gamepad connection if present, no errors

**Step 4: Commit InputManager**

```bash
git add src/systems/InputManager.js src/scenes/GameScene.js
git commit -m "feat: add InputManager for gamepad and keyboard/mouse input

- Support left stick / WASD for movement
- Support right trigger / left mouse for firing
- Support right stick / mouse position for aim influence
- Support L1/R1 / Q/E for target cycling"
```

---

## Task 2: Create TargetSelector System

**Files:**
- Create: `src/systems/TargetSelector.js`
- Modify: `src/scenes/GameScene.js` (for integration)

**Step 1: Write TargetSelector class with priority logic**

Create `src/systems/TargetSelector.js`:

```javascript
export class TargetSelector {
    constructor(scene) {
        this.scene = scene;
        this.lockedTarget = null;
        this.currentTarget = null;
        this.maxRange = 500; // Auto-aim search radius
        this.influenceConeAngle = Math.PI / 3; // 60 degree cone
    }

    update(playerX, playerY, aimInfluence, inputMode, enemies) {
        // Remove lock if target is dead
        if (this.lockedTarget && !this.lockedTarget.isAlive()) {
            this.clearLock();
        }

        // Priority 1: Locked bounty target
        if (this.lockedTarget && this.lockedTarget.isAlive()) {
            this.currentTarget = this.lockedTarget;
            return this.currentTarget;
        }

        // Get enemies in range
        const enemiesInRange = enemies.filter(enemy => {
            if (!enemy.isAlive()) return false;
            const dx = enemy.getSprite().x - playerX;
            const dy = enemy.getSprite().y - playerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance <= this.maxRange;
        });

        if (enemiesInRange.length === 0) {
            this.currentTarget = null;
            return null;
        }

        // Priority 2: Influenced target (if aim influence active)
        let influencedTarget = null;

        if (inputMode === 'gamepad') {
            // Right stick direction
            if (Math.abs(aimInfluence.x) > 0.1 || Math.abs(aimInfluence.y) > 0.1) {
                const influenceAngle = Math.atan2(aimInfluence.y, aimInfluence.x);
                influencedTarget = this.findTargetInCone(
                    playerX, playerY,
                    influenceAngle,
                    enemiesInRange
                );
            }
        } else {
            // Mouse cursor position
            const dx = aimInfluence.x - playerX;
            const dy = aimInfluence.y - playerY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 20) { // Dead zone
                const influenceAngle = Math.atan2(dy, dx);
                influencedTarget = this.findTargetInCone(
                    playerX, playerY,
                    influenceAngle,
                    enemiesInRange
                );
            }
        }

        if (influencedTarget) {
            this.currentTarget = influencedTarget;
            return this.currentTarget;
        }

        // Priority 3: Nearest enemy (fallback)
        const nearest = this.findNearestEnemy(playerX, playerY, enemiesInRange);
        this.currentTarget = nearest;
        return this.currentTarget;
    }

    findTargetInCone(playerX, playerY, coneAngle, enemies) {
        let bestTarget = null;
        let bestScore = -Infinity;

        enemies.forEach(enemy => {
            const dx = enemy.getSprite().x - playerX;
            const dy = enemy.getSprite().y - playerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angleToEnemy = Math.atan2(dy, dx);

            // Calculate angle difference
            let angleDiff = Math.abs(angleToEnemy - coneAngle);
            if (angleDiff > Math.PI) {
                angleDiff = 2 * Math.PI - angleDiff;
            }

            // Check if in cone
            if (angleDiff <= this.influenceConeAngle / 2) {
                // Score = closer + more aligned is better
                const score = (1 / distance) * (1 - angleDiff / (this.influenceConeAngle / 2));

                if (score > bestScore) {
                    bestScore = score;
                    bestTarget = enemy;
                }
            }
        });

        return bestTarget;
    }

    findNearestEnemy(playerX, playerY, enemies) {
        let nearest = null;
        let minDistance = Infinity;

        enemies.forEach(enemy => {
            const dx = enemy.getSprite().x - playerX;
            const dy = enemy.getSprite().y - playerY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < minDistance) {
                minDistance = distance;
                nearest = enemy;
            }
        });

        return nearest;
    }

    lockTarget(target) {
        if (target && target.isBountyEnemy()) {
            this.lockedTarget = target;
            console.log('Locked target:', target.getBountyName());
        }
    }

    clearLock() {
        this.lockedTarget = null;
        console.log('Target lock cleared');
    }

    cycleToBountyTarget(playerX, playerY, enemies, direction) {
        // Get all alive bounty enemies
        const bountyEnemies = enemies.filter(e => e.isAlive() && e.isBountyEnemy());

        if (bountyEnemies.length === 0) {
            this.clearLock();
            return;
        }

        // Sort by distance
        bountyEnemies.sort((a, b) => {
            const distA = Math.sqrt(
                Math.pow(a.getSprite().x - playerX, 2) +
                Math.pow(a.getSprite().y - playerY, 2)
            );
            const distB = Math.sqrt(
                Math.pow(b.getSprite().x - playerX, 2) +
                Math.pow(b.getSprite().y - playerY, 2)
            );
            return distA - distB;
        });

        // Find current lock index
        let currentIndex = bountyEnemies.findIndex(e => e === this.lockedTarget);

        if (currentIndex === -1) {
            // No current lock, lock nearest
            this.lockTarget(bountyEnemies[0]);
        } else {
            // Cycle to next/prev
            if (direction === 'next') {
                currentIndex = (currentIndex + 1) % bountyEnemies.length;
            } else {
                currentIndex = (currentIndex - 1 + bountyEnemies.length) % bountyEnemies.length;
            }
            this.lockTarget(bountyEnemies[currentIndex]);
        }
    }

    getCurrentTarget() {
        return this.currentTarget;
    }

    getLockedTarget() {
        return this.lockedTarget;
    }

    isTargetLocked() {
        return this.lockedTarget !== null && this.lockedTarget.isAlive();
    }
}
```

**Step 2: Integrate TargetSelector into GameScene**

Add to GameScene.js imports:
```javascript
import { TargetSelector } from '../systems/TargetSelector.js';
```

Add to GameScene.js create() after InputManager creation:
```javascript
this.targetSelector = new TargetSelector(this);
```

Add to GameScene.js update() after inputManager.update():
```javascript
// Update target selection
const aimInfluence = this.inputManager.getAimInfluence();
const inputMode = this.inputManager.getInputMode();
this.targetSelector.update(
    this.player.getX(),
    this.player.getY(),
    aimInfluence,
    inputMode,
    this.enemies
);

// Handle target cycling
if (this.inputManager.shouldCycleTargetNext()) {
    this.targetSelector.cycleToBountyTarget(
        this.player.getX(),
        this.player.getY(),
        this.enemies,
        'next'
    );
}
if (this.inputManager.shouldCycleTargetPrev()) {
    this.targetSelector.cycleToBountyTarget(
        this.player.getX(),
        this.player.getY(),
        this.enemies,
        'prev'
    );
}
```

**Step 3: Test target selection logic**

Add temporary debug visualization in GameScene.js update():
```javascript
// Debug: visualize current target
if (this.targetSelector.getCurrentTarget()) {
    const target = this.targetSelector.getCurrentTarget();
    if (!this.debugTargetCircle) {
        this.debugTargetCircle = this.add.circle(0, 0, 30);
        this.debugTargetCircle.setStrokeStyle(3, 0x00ff00);
        this.debugTargetCircle.setFillStyle(0x00ff00, 0);
    }
    this.debugTargetCircle.setPosition(
        target.getSprite().x,
        target.getSprite().y
    );
    this.debugTargetCircle.setVisible(true);
} else if (this.debugTargetCircle) {
    this.debugTargetCircle.setVisible(false);
}
```

Run: `npm run dev`
Expected: Green circle appears around auto-targeted enemy, changes based on aim influence

**Step 4: Commit TargetSelector**

```bash
git add src/systems/TargetSelector.js src/scenes/GameScene.js
git commit -m "feat: add TargetSelector for auto-aim logic

- Implement 3-tier priority: locked bounty > influenced > nearest
- Support cone-based aim influence for gamepad and mouse
- Support bounty target cycling with distance sorting
- Add debug visualization (temporary)"
```

---

## Task 3: Refactor Player Shooting to Use Auto-Aim

**Files:**
- Modify: `src/entities/Player.js:94-161`
- Modify: `src/scenes/GameScene.js:188-191`

**Step 1: Update Player.shoot() signature**

In Player.js, replace the shoot() method (lines 94-161):

```javascript
shoot(targetEnemy, currentTime) {
    // Check if we have a target
    if (!targetEnemy || !targetEnemy.isAlive()) {
        return;
    }

    // Check cooldown (modified by rapid_fire buff)
    const activeBuff = this.getActiveBuff();
    let cooldown = this.shootCooldown;

    if (activeBuff === 'rapid_fire') {
        cooldown = this.shootCooldown / 2;
    }

    if (currentTime < this.nextFire) {
        return;
    }

    this.nextFire = currentTime + cooldown;

    // Calculate angle to target enemy
    const targetX = targetEnemy.getSprite().x;
    const targetY = targetEnemy.getSprite().y;
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

    console.log('Player shot', bulletAngles.length, 'bullet(s) at enemy');
}
```

**Step 2: Update GameScene shooting call**

In GameScene.js, replace shooting logic (lines 188-191):

```javascript
// Handle shooting with auto-aim
if (this.inputManager.isFiringPressed()) {
    const target = this.targetSelector.getCurrentTarget();
    this.player.shoot(target, time);
}
```

Remove old mouse input listeners (GameScene.js lines 58-66):
```javascript
// DELETE THESE LINES:
// this.input.on('pointerdown', () => {
//     this.isShooting = true;
// });
//
// this.input.on('pointerup', () => {
//     this.isShooting = false;
// });
//
// this.isShooting = false;
```

**Step 3: Test auto-aim shooting**

Run: `npm run dev`
Expected:
- Holding left mouse or right trigger fires at auto-targeted enemy
- Bullets go toward highlighted (green circle) enemy
- Moving mouse/right stick changes which enemy is targeted
- Q/E or L1/R1 cycles through bounty targets

**Step 4: Commit shooting refactor**

```bash
git add src/entities/Player.js src/scenes/GameScene.js
git commit -m "refactor: convert shooting from manual aim to auto-aim

- Change Player.shoot() to accept target enemy instead of coordinates
- Calculate bullet angle from player to target enemy position
- Remove manual mouse aiming listeners from GameScene
- Wire shooting through InputManager and TargetSelector"
```

---

## Task 4: Add Visual Target Lock Indicators

**Files:**
- Modify: `src/scenes/GameScene.js`

**Step 1: Create reticle graphics for target indicators**

Add to GameScene.js create() method:

```javascript
// Target lock visuals
this.targetReticle = this.add.circle(0, 0, 35);
this.targetReticle.setStrokeStyle(3, 0x00ff00);
this.targetReticle.setFillStyle(0x00ff00, 0.1);
this.targetReticle.setVisible(false);

this.lockedReticle = this.add.circle(0, 0, 40);
this.lockedReticle.setStrokeStyle(4, 0xffff00);
this.lockedReticle.setFillStyle(0xffff00, 0.2);
this.lockedReticle.setVisible(false);

// Lock line
this.lockLine = this.add.line(0, 0, 0, 0, 0, 0, 0xffff00);
this.lockLine.setLineWidth(2);
this.lockLine.setVisible(false);
```

**Step 2: Update target visuals each frame**

Replace debug visualization in GameScene.js update() with production visuals:

```javascript
// Update target visuals
const currentTarget = this.targetSelector.getCurrentTarget();
const lockedTarget = this.targetSelector.getLockedTarget();

if (lockedTarget && lockedTarget.isAlive()) {
    // Show locked target reticle
    this.lockedReticle.setPosition(
        lockedTarget.getSprite().x,
        lockedTarget.getSprite().y
    );
    this.lockedReticle.setVisible(true);

    // Pulse animation
    const pulse = Math.sin(Date.now() / 200) * 0.1 + 1.0;
    this.lockedReticle.setScale(pulse);

    // Line from player to locked target
    this.lockLine.setTo(
        this.player.getX(),
        this.player.getY(),
        lockedTarget.getSprite().x,
        lockedTarget.getSprite().y
    );
    this.lockLine.setVisible(true);
} else {
    this.lockedReticle.setVisible(false);
    this.lockLine.setVisible(false);
}

if (currentTarget && currentTarget.isAlive() && currentTarget !== lockedTarget) {
    // Show current auto-target reticle
    this.targetReticle.setPosition(
        currentTarget.getSprite().x,
        currentTarget.getSprite().y
    );
    this.targetReticle.setVisible(true);
} else {
    this.targetReticle.setVisible(false);
}
```

**Step 3: Add UI text for lock status**

Add to GameScene.js create():

```javascript
// Target lock display
this.lockText = this.add.text(960, 100, '', {
    fontSize: '24px',
    color: '#ffff00',
    fontFamily: 'Arial',
    stroke: '#000000',
    strokeThickness: 3
}).setOrigin(0.5, 0);
```

Add to GameScene.js update():

```javascript
// Update lock UI
if (this.targetSelector.isTargetLocked()) {
    const locked = this.targetSelector.getLockedTarget();
    this.lockText.setText(`🎯 LOCKED: ${locked.getBountyName()}`);
} else {
    this.lockText.setText('');
}
```

**Step 4: Test visual feedback**

Run: `npm run dev`
Expected:
- Green circle shows current auto-target
- Yellow circle + line shows locked bounty target
- Lock persists until target dies
- UI shows locked target name

**Step 5: Commit visual indicators**

```bash
git add src/scenes/GameScene.js
git commit -m "feat: add visual indicators for target selection

- Green reticle for current auto-target
- Yellow reticle + line for locked bounty target
- Pulsing animation on locked target
- UI text showing locked target name"
```

---

## Task 5: Update Input Instructions UI

**Files:**
- Modify: `src/scenes/GameScene.js:84-88`

**Step 1: Update control instructions text**

Replace GameScene.js lines 84-88:

```javascript
// Control instructions (updates based on input mode)
this.controlsText = this.add.text(20, 20, '', {
    fontSize: '20px',
    color: '#ffffff',
    fontFamily: 'Arial',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
});
this.updateControlsText();
```

**Step 2: Add method to update controls text**

Add method to GameScene class:

```javascript
updateControlsText() {
    if (!this.inputManager) return;

    const mode = this.inputManager.getInputMode();

    if (mode === 'gamepad') {
        this.controlsText.setText(
            'Left Stick: Move | Right Trigger: Fire\n' +
            'Right Stick: Aim Influence | L1/R1: Lock Bounty'
        );
    } else {
        this.controlsText.setText(
            'WASD: Move | Mouse: Fire & Aim Influence | Q/E: Lock Bounty'
        );
    }
}
```

**Step 3: Call updateControlsText in update loop**

Add to GameScene.js update() (periodically check for input mode changes):

```javascript
// Update controls display if input mode changed
if (this.lastInputMode !== this.inputManager.getInputMode()) {
    this.updateControlsText();
    this.lastInputMode = this.inputManager.getInputMode();
}
```

Initialize in create():
```javascript
this.lastInputMode = 'keyboard';
```

**Step 4: Test UI updates**

Run: `npm run dev`
Expected:
- UI shows keyboard controls by default
- Pressing gamepad button switches to gamepad controls text
- Moving mouse switches back to keyboard controls text

**Step 5: Commit UI updates**

```bash
git add src/scenes/GameScene.js
git commit -m "feat: update control instructions to show context-aware input

- Dynamically switch between gamepad and keyboard/mouse instructions
- Display current control scheme based on last input detected
- Add background to instructions for better readability"
```

---

## Task 6: Polish and Testing

**Files:**
- Modify: `src/systems/TargetSelector.js` (tuning)
- Manual testing across all game features

**Step 1: Tune auto-aim parameters**

Test and adjust values in TargetSelector.js:
- `maxRange`: Currently 500, may need 400-600 range
- `influenceConeAngle`: Currently 60°, may need 45-90°

Play 2-3 waves and adjust until targeting feels responsive but not twitchy.

**Step 2: Test with all cocktail buffs**

Verify each buff works with auto-aim:
- [ ] Margarita (Spread Shot) - 5 bullets toward target
- [ ] Mojito (Rapid Fire) - Fast auto-targeting
- [ ] Old Fashioned (Heavy Hitter) - Strong shots to target
- [ ] Tequila Sunrise (Damage Ramp) - Ramping damage to targets
- [ ] Whiskey Sour (Piercing) - Bullets pass through to next target
- [ ] Manhattan (Critical Hits) - Crits on auto-attacks

**Step 3: Test bounty targeting**

Verify bounty system:
- [ ] L1/R1 (Q/E) cycles through bounty enemies only
- [ ] Lock persists until target dies
- [ ] Lock clears automatically when target dies
- [ ] Visual indicator shows locked target clearly

**Step 4: Test with multiple enemies and obstacles**

Verify targeting behavior:
- [ ] Auto-aim selects nearest when no influence
- [ ] Aim influence changes target smoothly
- [ ] Target selection ignores dead enemies
- [ ] Works correctly with obstacles in arena

**Step 5: Document any issues found**

Create `docs/phase1-testing-notes.md` with findings:
- Parameters that need adjustment
- Edge cases discovered
- User experience feedback

**Step 6: Commit final tuning**

```bash
git add src/systems/TargetSelector.js docs/phase1-testing-notes.md
git commit -m "polish: tune auto-aim parameters based on testing

- Adjust max range and cone angle for better feel
- Document testing results and parameter choices
- Verify all cocktail buffs work with auto-aim"
```

---

## Task 7: Clean Up and Prepare for Phase 2

**Files:**
- Remove: Debug code
- Document: Phase 2 readiness

**Step 1: Remove debug code**

Remove from GameScene.js if present:
- Debug console logs in target selection
- Temporary visualization code
- Testing comments

**Step 2: Verify game still playable end-to-end**

Run: `npm run dev`
Play through 3 waves, verify:
- [ ] Movement works (WASD or left stick)
- [ ] Shooting works (mouse or right trigger)
- [ ] Auto-aim targets enemies correctly
- [ ] Aim influence changes targets
- [ ] Bounty locking works
- [ ] All cocktails still function
- [ ] Game over / victory screens work

**Step 3: Create Phase 2 preparation notes**

Create `docs/phase2-preparation.md`:

```markdown
# Phase 2 Preparation Notes

## Phase 1 Complete ✓

Control system successfully converted from twin-stick to auto-aim:
- InputManager handles gamepad + keyboard/mouse
- TargetSelector implements 3-tier priority system
- Player shooting refactored for target-based aiming
- Visual indicators show target selection
- UI adapts to input mode

## Ready for Phase 2: Visual Transition to Top-Down

Phase 1 assets can be reused:
- InputManager (no changes needed)
- TargetSelector (no changes needed)
- All gameplay logic (waves, buffs, scoring)

Phase 2 will need:
- Camera angle change to top-down
- Sprite replacements (all entities)
- Environment art (saloon with beach theme)
- Adjust Enemy.updateSwoop() behavior for Flying Fish
- Update visual indicators for top-down perspective

## Known Parameters (From Testing)

- Auto-aim range: [FILL IN]
- Influence cone angle: [FILL IN]
- Target transition smoothness: [Needs Phase 2 testing]
```

**Step 4: Final commit**

```bash
git add docs/phase2-preparation.md src/scenes/GameScene.js
git commit -m "chore: clean up debug code and prepare for Phase 2

- Remove temporary debug visualizations
- Document Phase 1 completion status
- Identify Phase 2 requirements and reusable components"
```

---

## Success Criteria

**Phase 1 is complete when:**

✅ Gamepad controls work:
- Left stick moves character
- Right trigger fires
- Right stick influences target selection
- L1/R1 locks bounty targets

✅ Keyboard + mouse controls work:
- WASD moves character
- Left mouse fires
- Mouse position influences target selection
- Q/E locks bounty targets

✅ Auto-aim system works:
- Selects nearest enemy by default
- Respects aim influence (stick/mouse direction)
- Prioritizes locked bounty targets
- Shows clear visual feedback (reticles)

✅ All existing gameplay preserved:
- Wave system functions
- Cocktail buffs work with auto-aim
- Scoring system intact
- Bounty competition functional

✅ Code quality:
- Clean, commented code
- No debug clutter in production
- Frequent, descriptive commits
- Ready for Phase 2 visual changes

---

## Open Questions for Implementation

**To decide during implementation:**

1. **Target transition smoothness:** Should target switch instantly or lerp between targets?
   - Decision: Start with instant, add lerp if needed in testing

2. **Visual feedback intensity:** How prominent should reticles/lines be?
   - Decision: Test with players, adjust alpha/thickness based on feedback

3. **Auto-aim "stickiness":** Should targets persist for a few frames when influence changes?
   - Decision: Start with no persistence, add if targeting feels too twitchy

4. **Gamepad rumble:** Should we add controller vibration on lock/shoot?
   - Decision: Defer to Phase 3 polish, not critical for Phase 1

---

**Next Steps After Plan Approval:**

Choose execution approach:
1. **Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks
2. **Parallel Session (separate)** - Open new session with executing-plans, batch execution

Which would you prefer?
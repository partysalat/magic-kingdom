# Cocktail Inventory System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the cocktail system from automatic activation on pickup to a manual activation system with single-slot inventory that persists across rounds.

**Architecture:** This implementation adds inventory state to the Player class, modifies collision detection in GameScene to store rather than activate cocktails, adds R key/LB button input handling in InputManager, and creates visual indicators for stored vs active cocktails. The system uses the existing buff infrastructure but separates storage from activation.

**Tech Stack:** Phaser.js 3, vanilla JavaScript (ES6 modules), existing game architecture

---

## Task 1: Add Inventory Data Structure to Player

**Files:**
- Modify: `src/entities/Player.js:1-52`

**Step 1: Add stored cocktail property to Player constructor**

In `src/entities/Player.js`, add the inventory property after line 47:

```javascript
// Buff system
this.activeBuff = null;
this.buffEndTime = 0;
this.buffAura = null;
this.damageRampMultiplier = 1.0;
this.rampShotsFired = 0;

// Cocktail inventory system
this.storedCocktail = null;  // { type: 'mojito', config: {...} }
this.storedCocktailIndicator = null;  // Visual sprite above player
```

**Step 2: Run the game to verify no errors**

Run: `npm start`
Navigate to: `http://localhost:8000`
Expected: Game loads without errors

**Step 3: Commit**

```bash
git add src/entities/Player.js
git commit -m "feat: add cocktail inventory data structure to Player"
```

---

## Task 2: Create Store Cocktail Method in Player

**Files:**
- Modify: `src/entities/Player.js:309-317`

**Step 1: Add storeCocktail method after clearBuff**

Add this new method in `src/entities/Player.js` after line 308:

```javascript
storeCocktail(cocktailType, config) {
    // Remove old indicator if exists
    if (this.storedCocktailIndicator) {
        this.storedCocktailIndicator.destroy();
    }

    // Store the cocktail
    this.storedCocktail = {
        type: cocktailType,
        config: config
    };

    // Create visual indicator (small bubble above player)
    this.storedCocktailIndicator = this.scene.add.circle(
        this.sprite.x,
        this.sprite.y - 40,
        8,
        config.color
    );
    this.storedCocktailIndicator.setStrokeStyle(2, 0xffffff);
    this.storedCocktailIndicator.setDepth(15);

    console.log(`Player ${this.playerName} stored cocktail:`, config.name);
}
```

**Step 2: Test storing cocktails manually in console**

Run: `npm start`
Open browser console and type:
```javascript
const player = game.scene.scenes[1].playerManager.players[0];
player.storeCocktail('mojito', {name: 'Mojito', color: 0x0088ff, duration: 15000});
```
Expected: Small blue bubble appears above player

**Step 3: Commit**

```bash
git add src/entities/Player.js
git commit -m "feat: add storeCocktail method with visual indicator"
```

---

## Task 3: Update Player Update Method for Indicator Positioning

**Files:**
- Modify: `src/entities/Player.js:54-100`

**Step 1: Add indicator position update in Player.update**

In `src/entities/Player.js`, after line 96 (buff aura positioning), add:

```javascript
// Update buff aura position
if (this.buffAura) {
    this.buffAura.setPosition(this.sprite.x, this.sprite.y);
}

// Update stored cocktail indicator position
if (this.storedCocktailIndicator) {
    this.storedCocktailIndicator.setPosition(this.sprite.x, this.sprite.y - 40);
}
```

**Step 2: Run game and move player**

Run: `npm start`
Use console to add cocktail (from Task 2 Step 2)
Move player with WASD
Expected: Indicator follows player above head

**Step 3: Commit**

```bash
git add src/entities/Player.js
git commit -m "feat: update stored cocktail indicator position with player"
```

---

## Task 4: Create Activate Stored Cocktail Method

**Files:**
- Modify: `src/entities/Player.js:309-350`

**Step 1: Add activateStoredCocktail method**

Add after the `storeCocktail` method:

```javascript
activateStoredCocktail() {
    if (!this.storedCocktail) {
        console.log(`Player ${this.playerName} has no stored cocktail`);
        return false;
    }

    // Apply the buff using existing system
    this.applyBuff(this.storedCocktail.config);

    console.log(`Player ${this.playerName} activated:`, this.storedCocktail.config.name);

    // Remove indicator
    if (this.storedCocktailIndicator) {
        this.storedCocktailIndicator.destroy();
        this.storedCocktailIndicator = null;
    }

    // Clear stored cocktail
    this.storedCocktail = null;

    return true;
}
```

**Step 2: Test activation manually**

Run: `npm start`
In console:
```javascript
const player = game.scene.scenes[1].playerManager.players[0];
player.storeCocktail('mojito', game.scene.scenes[1].COCKTAIL_TYPES.mojito);
player.activateStoredCocktail();
```
Expected: Indicator disappears, aura appears, console shows activation

**Step 3: Commit**

```bash
git add src/entities/Player.js
git commit -m "feat: add activateStoredCocktail method"
```

---

## Task 5: Update Player Destroy Method

**Files:**
- Modify: `src/entities/Player.js:314-317`

**Step 1: Add indicator cleanup to destroy method**

Update the `destroy()` method:

```javascript
destroy() {
    if (this.storedCocktailIndicator) {
        this.storedCocktailIndicator.destroy();
    }
    this.sprite.destroy();
}
```

**Step 2: Test destroy doesn't error**

Run: `npm start`
Play until death
Expected: No console errors about destroying null objects

**Step 3: Commit**

```bash
git add src/entities/Player.js
git commit -m "fix: cleanup stored cocktail indicator on player destroy"
```

---

## Task 6: Add R Key Input to InputManager

**Files:**
- Modify: `src/systems/InputManager.js:1-50`

**Step 1: Add R key to keyboard setup**

In `src/systems/InputManager.js`, modify the `setupKeyboard` method around line 26:

```javascript
setupKeyboard() {
    // WASD movement
    this.keys = this.scene.input.keyboard.addKeys({
        W: Phaser.Input.Keyboard.KeyCodes.W,
        A: Phaser.Input.Keyboard.KeyCodes.A,
        S: Phaser.Input.Keyboard.KeyCodes.S,
        D: Phaser.Input.Keyboard.KeyCodes.D,
        Q: Phaser.Input.Keyboard.KeyCodes.Q,
        E: Phaser.Input.Keyboard.KeyCodes.E,
        R: Phaser.Input.Keyboard.KeyCodes.R  // Cocktail activation
    });

    // ... rest of method
}
```

**Step 2: Add activation flag to input state**

In the constructor around line 11, add:

```javascript
// Input state
this.movement = { x: 0, y: 0 };
this.aimInfluence = { x: 0, y: 0 };
this.isFiring = false;
this.cycleTargetNext = false;
this.cycleTargetPrev = false;
this.activateCocktail = false;  // New flag
```

**Step 3: Run game**

Run: `npm start`
Expected: No errors, R key doesn't break anything

**Step 4: Commit**

```bash
git add src/systems/InputManager.js
git commit -m "feat: add R key input binding for cocktail activation"
```

---

## Task 7: Add R Key Detection Logic

**Files:**
- Modify: `src/systems/InputManager.js:51-110`

**Step 1: Reset activation flag in update method**

In `src/systems/InputManager.js`, modify the `update` method around line 61:

```javascript
update() {
    // Try to get gamepad
    if (!this.gamepad && this.scene.input.gamepad) {
        const pads = this.scene.input.gamepad.gamepads;
        if (pads[this.playerIndex]) {
            this.gamepad = pads[this.playerIndex];
        }
    }

    // Reset cycle flags each frame
    this.cycleTargetNext = false;
    this.cycleTargetPrev = false;
    this.activateCocktail = false;  // Reset activation flag

    if (this.gamepad && this.gamepad.connected) {
        this.updateGamepad();
    } else {
        this.updateKeyboard();
    }
}
```

**Step 2: Detect R key press in updateKeyboard**

In the `updateKeyboard` method, after the Q/E target cycling (around line 106):

```javascript
// Target cycling with Q/E
if (Phaser.Input.Keyboard.JustDown(this.keys.Q)) {
    this.cycleTargetPrev = true;
    this.inputMode = 'keyboard';
}
if (Phaser.Input.Keyboard.JustDown(this.keys.E)) {
    this.cycleTargetNext = true;
    this.inputMode = 'keyboard';
}

// Cocktail activation with R
if (Phaser.Input.Keyboard.JustDown(this.keys.R)) {
    this.activateCocktail = true;
    this.inputMode = 'keyboard';
}
```

**Step 3: Test R key detection**

Run: `npm start`
Open console, type:
```javascript
const input = game.scene.scenes[1].playerManager.players[0].inputManager;
// Press R key
```
Expected: No errors when pressing R

**Step 4: Commit**

```bash
git add src/systems/InputManager.js
git commit -m "feat: add R key press detection for cocktail activation"
```

---

## Task 8: Add Left Bumper Gamepad Input

**Files:**
- Modify: `src/systems/InputManager.js:15-20`

**Step 1: Add lastLB button state tracking**

In constructor around line 17:

```javascript
// Button edge detection
this.lastL1 = false;
this.lastR1 = false;
this.lastLB = false;  // For cocktail activation (typically button 4)
```

**Step 2: Add LB detection in updateGamepad**

In `updateGamepad` method, after L1/R1 cycling (around line 134):

```javascript
// L1/R1 for target cycling
if (this.gamepad.L1 && !this.lastL1) {
    this.cycleTargetPrev = true;
}
if (this.gamepad.R1 && !this.lastR1) {
    this.cycleTargetNext = true;
}

// LB (button 4) for cocktail activation
const LB = this.gamepad.buttons[4] ? this.gamepad.buttons[4].pressed : false;
if (LB && !this.lastLB) {
    this.activateCocktail = true;
}

this.lastL1 = this.gamepad.L1;
this.lastR1 = this.gamepad.R1;
this.lastLB = LB;
```

**Step 3: Test with gamepad if available**

Run: `npm start`
Connect gamepad
Press LB
Expected: No errors (activation will be wired up later)

**Step 4: Commit**

```bash
git add src/systems/InputManager.js
git commit -m "feat: add LB button input for gamepad cocktail activation"
```

---

## Task 9: Add Activation Getter Method to InputManager

**Files:**
- Modify: `src/systems/InputManager.js:145-172`

**Step 1: Add shouldActivateCocktail getter**

After the `shouldCycleTargetPrev` method around line 159:

```javascript
shouldCycleTargetPrev() {
    return this.cycleTargetPrev;
}

shouldActivateCocktail() {
    return this.activateCocktail;
}
```

**Step 2: Run game**

Run: `npm start`
Expected: No errors

**Step 3: Commit**

```bash
git add src/systems/InputManager.js
git commit -m "feat: add shouldActivateCocktail getter to InputManager"
```

---

## Task 10: Modify GameScene Cocktail Collision to Store Instead of Activate

**Files:**
- Modify: `src/scenes/GameScene.js:419-445`

**Step 1: Change collision handler to call storeCocktail**

In `src/scenes/GameScene.js`, modify the cocktail collision detection around line 433:

```javascript
// Check collision with all living players
for (const player of this.playerManager.getLivingPlayers()) {
    const dx = player.getX() - cocktail.getSprite().x;
    const dy = player.getY() - cocktail.getSprite().y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Collision if distance less than combined radii
    if (distance < 35) { // 20 (player) + 15 (cocktail)
        const config = cocktail.getConfig();

        // Store cocktail instead of activating
        player.storeCocktail(cocktail.getType(), config);

        cocktail.collect();
        cocktail.destroy();  // Remove visual from scene

        // Optional: Show brief pickup feedback (but not activation feedback)
        this.showCocktailPickupFeedback(player, config);

        return false;
    }
}
```

**Step 2: Run game and test picking up cocktails**

Run: `npm start`
Start game, wait for cocktail spawn
Walk over cocktail
Expected: Small indicator appears above player, no immediate aura

**Step 3: Commit**

```bash
git add src/scenes/GameScene.js
git commit -m "feat: modify cocktail collision to store instead of activate"
```

---

## Task 11: Add Cocktail Pickup Feedback Method

**Files:**
- Modify: `src/scenes/GameScene.js:882-900`

**Step 1: Create showCocktailPickupFeedback method**

Add this new method after `showCocktailFeedback`:

```javascript
showCocktailPickupFeedback(player, config) {
    // Show brief text above player
    const text = this.add.text(
        player.getX(),
        player.getY() - 60,
        `Stored: ${config.name}`,
        {
            fontSize: '20px',
            color: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 3
        }
    ).setOrigin(0.5);

    // Fade out and destroy
    this.tweens.add({
        targets: text,
        alpha: 0,
        y: text.y - 30,
        duration: 1000,
        ease: 'Power2',
        onComplete: () => text.destroy()
    });
}
```

**Step 2: Test pickup feedback**

Run: `npm start`
Pick up cocktail
Expected: "Stored: [Name]" text floats up above player

**Step 3: Commit**

```bash
git add src/scenes/GameScene.js
git commit -m "feat: add cocktail pickup feedback text"
```

---

## Task 12: Wire Up Activation Input in GameScene Update Loop

**Files:**
- Modify: `src/scenes/GameScene.js:350-380`

**Step 1: Add activation check in GameScene update method**

Find the main update loop where players are processed (search for "playerManager.players.forEach"). Add activation logic:

```javascript
// Process each player
this.playerManager.players.forEach(player => {
    if (player.isDead) return;

    const inputManager = player.inputManager;

    // Check for cocktail activation input
    if (inputManager && inputManager.shouldActivateCocktail()) {
        const activated = player.activateStoredCocktail();
        if (activated) {
            // Show activation feedback
            this.showCocktailActivationFeedback(player);
            this.updateBuffUI();
        }
    }

    // ... rest of player update logic
});
```

**Step 2: Run game and test activation**

Run: `npm start`
Pick up cocktail (walk over it)
Press R key
Expected: Indicator disappears, buff aura appears

**Step 3: Commit**

```bash
git add src/scenes/GameScene.js
git commit -m "feat: wire up cocktail activation input in game loop"
```

---

## Task 13: Add Cocktail Activation Feedback Method

**Files:**
- Modify: `src/scenes/GameScene.js:900-920`

**Step 1: Create showCocktailActivationFeedback method**

Add after `showCocktailPickupFeedback`:

```javascript
showCocktailActivationFeedback(player) {
    if (!player.activeBuff) return;

    // Get config from COCKTAIL_TYPES based on active buff
    let config = null;
    for (const [type, cocktailConfig] of Object.entries(this.COCKTAIL_TYPES)) {
        if (cocktailConfig.effect === player.activeBuff) {
            config = cocktailConfig;
            break;
        }
    }

    if (!config) return;

    // Show "ACTIVATED" text
    const text = this.add.text(
        player.getX(),
        player.getY() - 60,
        `ACTIVATED!\n${config.name}`,
        {
            fontSize: '24px',
            color: '#ffff00',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        }
    ).setOrigin(0.5);

    // Pulse and fade
    this.tweens.add({
        targets: text,
        scale: 1.5,
        alpha: 0,
        y: text.y - 40,
        duration: 1200,
        ease: 'Power2',
        onComplete: () => text.destroy()
    });
}
```

**Step 2: Test activation feedback**

Run: `npm start`
Pick up cocktail
Press R
Expected: "ACTIVATED!" text pulses and fades, buff applies

**Step 3: Commit**

```bash
git add src/scenes/GameScene.js
git commit -m "feat: add cocktail activation feedback animation"
```

---

## Task 14: Update Controls Text to Include R Key

**Files:**
- Modify: `src/scenes/GameScene.js:700-750`

**Step 1: Find and update updateControlsText method**

Locate `updateControlsText` method and add R key info:

```javascript
updateControlsText() {
    const inputMode = this.playerManager.players[0].inputManager?.getInputMode();

    if (inputMode === 'keyboard') {
        this.controlsText.setText(
            'WASD: Move | Mouse: Aim | Click: Fire\n' +
            'Q/E: Cycle Targets | R: Activate Cocktail'
        );
    } else {
        this.controlsText.setText(
            'Left Stick: Move | Right Stick: Aim | R2: Fire\n' +
            'L1/R1: Cycle | LB: Activate Cocktail'
        );
    }
}
```

**Step 2: Run game and verify controls text**

Run: `npm start`
Expected: Controls text shows "R: Activate Cocktail" for keyboard

**Step 3: Commit**

```bash
git add src/scenes/GameScene.js
git commit -m "docs: update controls text to include cocktail activation"
```

---

## Task 15: Add HUD Indicator for Stored Cocktail

**Files:**
- Modify: `src/scenes/GameScene.js:140-200`

**Step 1: Create stored cocktail HUD display in create method**

In GameScene `create` method, after the buff text setup (around line 140):

```javascript
// Add buff display
this.buffText = this.add.text(960, 1000, '', {
    fontSize: '28px',
    color: '#ffffff',
    fontFamily: 'Arial',
    stroke: '#000000',
    strokeThickness: 3
}).setOrigin(0.5, 0);

// Add stored cocktail indicator (bottom left of screen)
this.storedCocktailHUD = this.add.container(30, 980);

const hudBg = this.add.rectangle(0, 0, 160, 50, 0x000000, 0.7);
const hudText = this.add.text(-70, 0, 'READY:', {
    fontSize: '18px',
    color: '#ffffff',
    fontFamily: 'Arial'
}).setOrigin(0, 0.5);
const hudIcon = this.add.circle(50, 0, 15, 0x888888);
hudIcon.setStrokeStyle(2, 0xffffff);
const hudName = this.add.text(0, 20, '', {
    fontSize: '16px',
    color: '#ffff00',
    fontFamily: 'Arial'
}).setOrigin(0.5, 0);

this.storedCocktailHUD.add([hudBg, hudText, hudIcon, hudName]);
this.storedCocktailHUD.setVisible(false);  // Hidden until cocktail stored
this.storedCocktailHUD.setDepth(100);

// Store references for updates
this.storedCocktailHUDIcon = hudIcon;
this.storedCocktailHUDName = hudName;
```

**Step 2: Run game**

Run: `npm start`
Expected: HUD element not visible yet (will show when cocktail stored)

**Step 3: Commit**

```bash
git add src/scenes/GameScene.js
git commit -m "feat: add HUD indicator for stored cocktail"
```

---

## Task 16: Update HUD When Cocktail Stored or Activated

**Files:**
- Modify: `src/scenes/GameScene.js:400-450`

**Step 1: Create updateStoredCocktailHUD method**

Add new method in GameScene:

```javascript
updateStoredCocktailHUD() {
    // Check first player's stored cocktail (for single player)
    // For multiplayer, could show each player's stored cocktail
    const player = this.playerManager.players[0];

    if (player.storedCocktail) {
        const config = player.storedCocktail.config;
        this.storedCocktailHUDIcon.setFillStyle(config.color);
        this.storedCocktailHUDName.setText(config.name);
        this.storedCocktailHUD.setVisible(true);
    } else {
        this.storedCocktailHUD.setVisible(false);
    }
}
```

**Step 2: Call updateStoredCocktailHUD in update loop**

In the GameScene update method, after updating buff UI:

```javascript
// Update buff UI
this.updateBuffUI();

// Update stored cocktail HUD
this.updateStoredCocktailHUD();
```

**Step 3: Test HUD updates**

Run: `npm start`
Pick up cocktail
Expected: HUD shows colored circle and cocktail name
Press R
Expected: HUD disappears

**Step 4: Commit**

```bash
git add src/scenes/GameScene.js
git commit -m "feat: update HUD to reflect stored cocktail state"
```

---

## Task 17: Handle Edge Case - Picking Up While Active

**Files:**
- Modify: `src/scenes/GameScene.js:419-445`

**Step 1: Update collision handler to allow storing while active buff**

Currently, storing while an active buff exists should work fine, but let's add explicit handling:

```javascript
// Collision if distance less than combined radii
if (distance < 35) { // 20 (player) + 15 (cocktail)
    const config = cocktail.getConfig();

    // Player can store even if they have an active buff
    // (active buff is separate from stored cocktail)
    player.storeCocktail(cocktail.getType(), config);

    cocktail.collect();
    cocktail.destroy();
    this.showCocktailPickupFeedback(player, config);

    return false;
}
```

**Step 2: Test the edge case**

Run: `npm start`
Pick up cocktail A
Activate it (R key)
Pick up cocktail B while A is active
Expected: Cocktail B stored, A still active with aura

**Step 3: Commit**

```bash
git add src/scenes/GameScene.js
git commit -m "fix: allow storing cocktail while active buff running"
```

---

## Task 18: Handle Edge Case - Activating While Active

**Files:**
- Modify: `src/entities/Player.js:330-350`

**Step 1: Update activateStoredCocktail to handle active buff**

Modify the `activateStoredCocktail` method:

```javascript
activateStoredCocktail() {
    if (!this.storedCocktail) {
        console.log(`Player ${this.playerName} has no stored cocktail`);
        return false;
    }

    // If already have active buff, warn and don't activate
    if (this.activeBuff && Date.now() < this.buffEndTime) {
        console.log(`Player ${this.playerName} already has active buff`);
        return false;
    }

    // Apply the buff using existing system
    this.applyBuff(this.storedCocktail.config);

    console.log(`Player ${this.playerName} activated:`, this.storedCocktail.config.name);

    // Remove indicator
    if (this.storedCocktailIndicator) {
        this.storedCocktailIndicator.destroy();
        this.storedCocktailIndicator = null;
    }

    // Clear stored cocktail
    this.storedCocktail = null;

    return true;
}
```

**Step 2: Test trying to activate during active buff**

Run: `npm start`
Pick up 2 cocktails (grab one, activate, grab another)
Try pressing R while first buff is still active
Expected: Console shows "already has active buff", stored cocktail remains

**Step 3: Commit**

```bash
git add src/entities/Player.js
git commit -m "fix: prevent activating stored cocktail while buff active"
```

---

## Task 19: Visual Polish - Add Subtle Glow to Player When Cocktail Stored

**Files:**
- Modify: `src/entities/Player.js:310-330`

**Step 1: Add glow effect to storeCocktail method**

Modify the `storeCocktail` method to add subtle glow:

```javascript
storeCocktail(cocktailType, config) {
    // Remove old indicator if exists
    if (this.storedCocktailIndicator) {
        this.storedCocktailIndicator.destroy();
    }
    if (this.storedCocktailGlow) {
        this.storedCocktailGlow.destroy();
    }

    // Store the cocktail
    this.storedCocktail = {
        type: cocktailType,
        config: config
    };

    // Create subtle glow around player
    this.storedCocktailGlow = this.scene.add.circle(
        this.sprite.x,
        this.sprite.y,
        35,
        config.color,
        0.15  // Very subtle
    );
    this.storedCocktailGlow.setDepth(-1);

    // Create visual indicator (small bubble above player)
    this.storedCocktailIndicator = this.scene.add.circle(
        this.sprite.x,
        this.sprite.y - 40,
        8,
        config.color
    );
    this.storedCocktailIndicator.setStrokeStyle(2, 0xffffff);
    this.storedCocktailIndicator.setDepth(15);

    console.log(`Player ${this.playerName} stored cocktail:`, config.name);
}
```

**Step 2: Update glow position in update method**

In `Player.update`, add glow positioning:

```javascript
// Update stored cocktail indicator position
if (this.storedCocktailIndicator) {
    this.storedCocktailIndicator.setPosition(this.sprite.x, this.sprite.y - 40);
}
if (this.storedCocktailGlow) {
    this.storedCocktailGlow.setPosition(this.sprite.x, this.sprite.y);
}
```

**Step 3: Cleanup glow in activateStoredCocktail and destroy**

Update `activateStoredCocktail`:

```javascript
// Remove indicator and glow
if (this.storedCocktailIndicator) {
    this.storedCocktailIndicator.destroy();
    this.storedCocktailIndicator = null;
}
if (this.storedCocktailGlow) {
    this.storedCocktailGlow.destroy();
    this.storedCocktailGlow = null;
}
```

Update `destroy`:

```javascript
destroy() {
    if (this.storedCocktailIndicator) {
        this.storedCocktailIndicator.destroy();
    }
    if (this.storedCocktailGlow) {
        this.storedCocktailGlow.destroy();
    }
    this.sprite.destroy();
}
```

**Step 4: Initialize glow property in constructor**

Add to constructor after `storedCocktailIndicator`:

```javascript
// Cocktail inventory system
this.storedCocktail = null;
this.storedCocktailIndicator = null;
this.storedCocktailGlow = null;
```

**Step 5: Test visual polish**

Run: `npm start`
Pick up cocktail
Expected: Subtle colored glow around player + bubble above head
Activate with R
Expected: Both disappear, buff aura appears

**Step 6: Commit**

```bash
git add src/entities/Player.js
git commit -m "feat: add subtle glow effect when cocktail stored"
```

---

## Task 20: End-to-End Testing

**Files:**
- Test: All modified files

**Step 1: Test complete flow - keyboard**

Run: `npm start`
Test sequence:
1. Start game
2. Wait for cocktail spawn between waves
3. Walk over cocktail → verify stored indicator appears
4. Press R → verify activation and buff aura
5. Wait for buff to expire → verify aura disappears
6. Pick up another cocktail → verify can store again
7. Pick up different cocktail → verify replaces stored one
8. Activate new cocktail → verify correct buff applies

**Step 2: Test complete flow - gamepad (if available)**

Same sequence as Step 1, but:
- Use left stick for movement
- Use LB button for activation
- Verify controls text updates

**Step 3: Test edge cases**

1. Try activating with no stored cocktail → verify nothing happens
2. Pick up cocktail during active buff → verify can store
3. Try activating while buff active → verify blocked
4. Pick up multiple cocktails in sequence → verify replaces
5. Die with stored cocktail → verify indicator cleans up

**Step 4: Test multiplayer (if configured)**

With 2+ players:
1. Each player picks up different cocktails
2. Verify each has their own indicator
3. Verify activations work independently
4. Verify HUD shows correct player's cocktail

**Step 5: Document any issues found**

Create: `docs/testing/2025-11-17-cocktail-inventory-testing.md`

Write test results and any bugs discovered.

**Step 6: Commit testing notes**

```bash
git add docs/testing/2025-11-17-cocktail-inventory-testing.md
git commit -m "docs: add cocktail inventory system testing notes"
```

---

## Task 21: Update Game Design Document

**Files:**
- Modify: `game_idea2.md:109-138`

**Step 1: Update cocktail system section**

Replace the "Cocktail Powerup System" section with reference to new design:

```markdown
## Cocktail Powerup System

**Note:** The cocktail system has been updated to use manual activation with inventory. See `game_idea_2_adaptions4.md` for current implementation details.

### Core Mechanics
- Players collect cocktails into a single-slot inventory
- Press R (keyboard) or LB (gamepad) to activate stored cocktail
- Cocktails persist across rounds until activated
- Strategic timing creates risk/reward decisions

### Visual Feedback
- Stored: Small bubble icon above player + subtle glow
- Active: Full colored aura + bullet effect trails
- HUD displays stored cocktail in bottom left

For complete details, see: `game_idea_2_adaptions4.md`
```

**Step 2: Commit documentation update**

```bash
git add game_idea2.md
git commit -m "docs: update cocktail system reference to new design"
```

---

## Task 22: Final Integration Test and Verification

**Files:**
- All modified files

**Step 1: Clean build and full game test**

```bash
# Kill any running servers
pkill -f "npm.*start"

# Start fresh
npm start
```

Open `http://localhost:8000`

**Step 2: Run through full game session**

1. Play through 3 waves
2. Collect and activate cocktails throughout
3. Verify persistence across waves
4. Test all 6 cocktail types if possible
5. Verify no console errors
6. Check for visual glitches

**Step 3: Performance check**

Monitor for:
- Smooth 60 FPS
- No memory leaks (check DevTools)
- Proper cleanup on game over
- No sprite orphaning

**Step 4: Create final summary**

Create: `docs/implementation-summaries/2025-11-17-cocktail-inventory.md`

```markdown
# Cocktail Inventory System Implementation Summary

## Completed
- ✅ Player inventory data structure
- ✅ Store cocktail method with visual indicators
- ✅ Activate stored cocktail method
- ✅ R key input binding (keyboard)
- ✅ LB button input binding (gamepad)
- ✅ GameScene collision handler modified
- ✅ Pickup and activation feedback
- ✅ HUD indicator for stored cocktails
- ✅ Visual polish (glow effects)
- ✅ Edge case handling
- ✅ Controls text updated
- ✅ Documentation updated

## Testing Results
[Document results from Task 20]

## Known Issues
[List any remaining issues]

## Future Enhancements
- Multiple inventory slots (2-3 cocktails)
- Swap between stored cocktails
- Throwing cocktails to teammates
- Auto-activation on low health option
```

**Step 5: Final commit**

```bash
git add docs/implementation-summaries/2025-11-17-cocktail-inventory.md
git commit -m "docs: add cocktail inventory implementation summary"
```

---

## Verification Checklist

Before considering this plan complete, verify:

- [ ] Player can collect cocktails without immediate activation
- [ ] R key activates stored cocktail (keyboard)
- [ ] LB button activates stored cocktail (gamepad)
- [ ] Visual indicators show stored vs active states
- [ ] HUD displays stored cocktail name and color
- [ ] Cocktails persist across rounds until activated
- [ ] Can store new cocktail while buff active
- [ ] Cannot activate while buff already active
- [ ] Picking up new cocktail replaces old stored one
- [ ] All visual elements clean up properly
- [ ] No console errors during normal gameplay
- [ ] Controls text reflects new inputs
- [ ] Documentation updated
- [ ] Full game session completes without issues

---

## Notes for Engineer

### Phaser.js Basics
- `this.scene` accesses the current Phaser scene
- `this.add.circle()` creates circle graphics
- `setDepth()` controls rendering order (higher = in front)
- `destroy()` removes objects from scene and memory
- Phaser uses immediate-mode rendering, update positions each frame

### Input Management
- `JustDown()` detects single press (not hold)
- Gamepad buttons array: [0]=A, [1]=B, [2]=X, [3]=Y, [4]=LB, [5]=RB
- L1/R1 are `.L1` and `.R1` properties on gamepad

### Testing Tips
- Use browser console to manually test methods
- Access game: `game.scene.scenes[1]` (GameScene is usually index 1)
- Access player: `game.scene.scenes[1].playerManager.players[0]`
- Press F12 for DevTools, Console tab for logs

### Common Pitfalls
- Forgetting to call `destroy()` on old sprites → memory leak
- Not updating positions in `update()` → indicators don't follow player
- Using button index instead of property name → gamepad buttons vary
- Not initializing properties in constructor → undefined errors

### DRY Principles Applied
- Reused existing `applyBuff()` infrastructure
- Single source of truth for cocktail configs (`COCKTAIL_TYPES`)
- Consistent visual feedback pattern across pickup/activation

### YAGNI Decisions
- No cocktail stacking (single slot only)
- No cooldown system (immediate activation when pressed)
- No cocktail swapping UI (replacement is automatic)
- Simple distance-based collision (no Phaser physics overlap)

---

**Plan Complete** ✅

Total estimated time: 3-4 hours for experienced developer
Commits: 22 incremental commits following atomic commit principles

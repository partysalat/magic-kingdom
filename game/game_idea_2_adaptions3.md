# Gisela's Last Stand - Multiplayer Adaptation

## Overview

This document describes the local multiplayer (1-4 players) implementation for Gisela's Last Stand, adapting the single-player game into a couch co-op experience with competitive scoring.

**Date:** 2025-11-17
**Status:** Design Complete - Ready for Implementation

---

## Design Decisions

### Join System

**Start Screen Join Flow:**
- New `StartScene` added before `GameScene`
- Players join by pressing any button on their gamepad (or keyboard for Player 1)
- Join timing: Only at start screen - locked once gameplay begins
- Auto-assignment: Players automatically assigned color and name by join order
  - Player 1: Red crab, "Player 1"
  - Player 2: Blue crab, "Player 2"
  - Player 3: Green crab, "Player 3"
  - Player 4: Yellow crab, "Player 4"
- Supported: 1-4 players
- No customization: Fast entry into game, minimal setup

**Rationale:** Classic arcade/couch co-op experience. Fast to start playing, no configuration overhead. Perfect for bar setting where speed matters.

---

### Gameplay Mechanics

**Camera System:**
- Single shared camera (no split-screen)
- Fixed zoom level (maintains current game zoom)
- Follows center point of all **living** players
- Players can move to edges and potentially go slightly off-screen
- Camera smoothly pans as center point shifts

**Death Handling:**
- **Permanent death** - dead players become spectators for remainder of game
- No respawning during waves or between waves
- Dead players stay on scoreboard (score frozen at death)
- Creates dramatic "last stand" moments for spectators
- Victory possible with single survivor

**Friendly Fire:**
- Disabled - player bullets pass through teammates harmlessly
- Encourages cooperative positioning without punishing spray-and-pray
- Keeps focus on enemy threats

**Victory/Loss Conditions:**
- **Loss:** All players dead = Game Over
- **Victory:** Complete wave 10 with at least one player alive
- MVP determined by highest score (living or dead)

---

## Start Screen Design

### Visual Layout

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│          GISELA'S LAST STAND                           │
│       🦀 CRUSTACEAN WESTERN SHOWDOWN 🦀                │
│                                                         │
│                                                         │
│     ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│     │  PLAYER  │  │  PLAYER  │  │  PLAYER  │  ┌────┐ │
│     │    1     │  │    2     │  │    3     │  │ P4 │ │
│     │   🦀    │  │   🦀    │  │   🦀    │  │    │ │
│     │  READY   │  │  READY   │  │  ------  │  │----│ │
│     └──────────┘  └──────────┘  └──────────┘  └────┘ │
│                                                         │
│         Press any button to join (1-4 players)         │
│                                                         │
│                HIGH SCORES                              │
│        1. Player 2 ........ 12,500 pts                 │
│        2. Player 1 ......... 9,800 pts                 │
│        3. Player 3 ......... 8,200 pts                 │
│        4. Player 1 ......... 7,650 pts                 │
│        5. Player 4 ......... 6,900 pts                 │
│                                                         │
│              Press START to begin game                  │
└─────────────────────────────────────────────────────────┘
```

### Components

**Title Section:**
- Game logo/title: "Gisela's Last Stand"
- Subtitle with western/crustacean theme
- Large, readable from distance (spectator-friendly)

**Player Slots (4 boxes):**
- Visual indicator showing which players have joined
- Empty slots show "Press any button" or "---"
- Filled slots show:
  - Player number (1-4)
  - Crab sprite in player's color (red/blue/green/yellow)
  - "READY" status

**Join Instructions:**
- "Press any button to join (1-4 players)"
- Clear prompt for gamepad connection
- Keyboard instructions for Player 1 if needed

**High Scores Leaderboard:**
- Top 5 previous game scores
- Format: "[Player Name] ........ [Score] pts"
- Pulled from localStorage
- Shows mix of player numbers (creates competition)

**Start Instructions:**
- "Press START to begin game" (when at least 1 player joined)
- Player 1's START button initiates GameScene transition

---

## Technical Implementation Changes

### 1. New StartScene

**File:** `/src/scenes/StartScene.js`

**Responsibilities:**
- Display title, high scores, join instructions
- Detect gamepad connections (up to 4)
- Track player join state (array of joined players)
- Handle "any button" press to add player
- Visual feedback when player joins (slot fills with color)
- Listen for START button to transition to GameScene
- Pass player configuration to GameScene via scene data

**Data passed to GameScene:**
```javascript
{
  players: [
    { index: 0, color: 'red', name: 'Player 1' },
    { index: 1, color: 'blue', name: 'Player 2' },
    // ... up to 4 players
  ]
}
```

---

### 2. PlayerManager System

**File:** `/src/systems/PlayerManager.js`

**Responsibilities:**
- Store array of 1-4 Player instances
- Track living/dead status for each player
- Calculate center point of living players (for camera)
- Handle player death (mark as dead, visual feedback, remove from living array)
- Return living players for game logic queries
- Manage individual InputManagers for each player

**Key Methods:**
```javascript
class PlayerManager {
  constructor(scene, playerConfigs) {
    this.scene = scene;
    this.players = []; // Array of Player instances
    this.inputManagers = []; // Array of InputManager instances
    this.createPlayers(playerConfigs);
  }

  createPlayers(configs) {
    // Create Player entities at spawn positions
    // Create InputManager for each player
  }

  getLivingPlayers() {
    // Return array of players where isDead === false
  }

  getCenterPoint() {
    // Calculate average position of living players
    // Used for camera follow
  }

  handlePlayerDeath(player) {
    // Mark player as dead
    // Play death animation
    // Update UI (grey out health bar?)
  }

  allPlayersDead() {
    // Return true if all players dead (game over condition)
  }

  update(time, delta) {
    // Update all living players
    // Update all input managers
  }
}
```

---

### 3. Camera System Update

**File:** `/src/scenes/GameScene.js` (camera setup)

**Changes:**
- Remove fixed camera follow on single player
- Each frame, calculate center point of living players:
  ```javascript
  const centerX = avgX of living players
  const centerY = avgY of living players
  this.cameras.main.centerOn(centerX, centerY);
  ```
- Smooth camera movement with lerp/tween for less jarring transitions
- Camera stays at fixed zoom (no dynamic zoom-out)
- Map bounds respected (camera doesn't show outside world)

**Edge Case:** When last player dies, camera stays at last known center (or focuses on final death position)

---

### 4. InputManager Updates

**File:** `/src/systems/InputManager.js`

**Current State:**
- Already accepts `playerIndex` parameter
- Already handles gamepad detection per-index

**Changes Needed:**
- Ensure multiple InputManager instances work independently
- Player 1 (index 0) can use keyboard OR gamepad 0
- Players 2-4 (index 1-3) use gamepads 1-3 only
- Test that gamepad state doesn't bleed between instances

**No major refactor needed** - architecture already supports this.

---

### 5. Player Entity Updates

**File:** `/src/entities/Player.js`

**Changes:**

**Constructor parameters:**
- Add `color` parameter: 'red' | 'blue' | 'green' | 'yellow'
- Add `playerName` parameter: 'Player 1' | 'Player 2' | etc.
- Add `spawnPosition` parameter: { x, y }

**Spawn positioning:**
- 1 player: Center (960, 540)
- 2 players: Side-by-side (800, 540) and (1120, 540)
- 3 players: Triangle formation (960, 450), (800, 630), (1120, 630)
- 4 players: Square formation (800, 450), (1120, 450), (800, 630), (1120, 630)

**Color sprite handling:**
- Load correct color variant based on `color` parameter
- Current sprite keys: `gisela-red`, `gisela-blue`, `gisela-green`, `gisela-yellow`
- Update animations to use correct color key

**Death handling:**
- Set `this.isDead = true`
- Play death animation
- Disable physics body
- Keep sprite visible (fallen crab) or fade out?
- Notify PlayerManager of death

---

### 6. Collision & Damage Updates

**Files:**
- `/src/entities/Bullet.js`
- `/src/entities/EnemyBullet.js`
- `/src/scenes/GameScene.js` (collision setup)

**Changes:**

**Player bullets:**
- Skip collision detection with other Player entities
- Only collide with Enemy entities and Cover
- Current: Bullet checks `if (other === this.source)` to skip shooter
- Update: `if (other.constructor.name === 'Player')` skip all players

**Enemy bullets:**
- Collide with all Player entities
- Each EnemyBullet can hit multiple players (or just first hit?)
- Decision: First hit destroys bullet (prevents multi-hit unfairness)

**Explosion/AOE damage:**
- Currently has comment: "In multiplayer, this would damage other players in radius"
- Decision: **No friendly fire** - explosions only damage enemies
- Keep current behavior (enemies only)

---

### 7. UI Updates

**File:** `/src/scenes/GameScene.js` (UI creation)

**Health Bars:**
- Display health bar for each player
- Layout options:
  - **Corners:** P1 top-left, P2 top-right, P3 bottom-left, P4 bottom-right
  - **Top row:** All 4 in horizontal row at top
- Each bar shows:
  - Player color (background or border tint)
  - Player name
  - Current health / max health
  - Active cocktail buff icon
- Grey out or dim when player dies

**Scoreboard:**
- Real-time leaderboard shows all players
- Sorted by current score (live updates)
- Format:
  ```
  SCORES
  Player 2 (Blue) .... 1,250
  Player 1 (Red) ..... 1,100
  Player 3 (Green) ..... 850
  Player 4 (Yellow) .... 720
  ```
- Highlight top player?
- Mark dead players with skull icon or "(DEAD)" text?

**Wave Counter:**
- Unchanged - "Wave X/10" display

**Boss Announcements:**
- Unchanged - bounty enemy callouts

---

### 8. Game Over / Victory Screen Updates

**File:** `/src/scenes/GameScene.js` (victory/defeat methods)

**Game Over Screen:**
- Triggered when `playerManager.allPlayersDead() === true`
- Show:
  - "GAME OVER" text
  - Wave reached (e.g., "Survived to Wave 7/10")
  - Final scoreboard with all players
  - MVP spotlight on highest scorer
  - High score comparison (which players made top 5?)
  - "Press START to return to lobby" (goes to StartScene)

**Victory Screen:**
- Triggered when wave 10 cleared AND at least one player alive
- Show:
  - "VICTORY!" text
  - Saloon celebration animation
  - Final scoreboard with all players (living and dead)
  - MVP ceremony spotlight on winner
  - Detailed breakdown:
    - Kills per player
    - Bounties claimed per player
    - Survival status (lived/died on wave X)
  - High score entry if any player beat top 5
  - "Press START to return to lobby"

**Both screens:**
- Return to StartScene (not automatic restart)
- Allows players to drop out or new players to join
- Maintains bar rotation flow

---

## Gameplay Flow

### Pre-Game Flow
1. Game loads → **StartScene**
2. Players press any button to join (1-4)
3. Visual slots fill with player colors as they join
4. Player 1 presses START
5. Transition to **GameScene** with player configs

### In-Game Loop
1. Wave announcement (Wave X/10)
2. Enemies spawn → Combat with all living players
3. Players shoot independently, compete for kills/bounties
4. Dead players become spectators (stay on scoreboard)
5. Wave clear → Cocktail scramble (living players only)
6. Brief rest → Next wave
7. Repeat until victory or all players dead

### Post-Game Flow
1. Victory or Game Over screen
2. MVP ceremony (highest scorer among all players)
3. High score entry if applicable
4. Press START to return to **StartScene**
5. New game can start with same or different players

---

## Testing Scenarios

### Single Player (Regression Test)
- Ensure single player mode still works correctly
- Only one player joins in StartScene
- Camera follows single player as before
- UI shows single health bar
- Victory/defeat screens work for solo play

### Two Players
- Both players spawn side-by-side
- Camera follows center point between them
- Both can shoot, collect pickups, score points
- One player dies → camera follows survivor
- Survivor can complete game solo

### Four Players
- All four players spawn in square formation
- Camera follows center of all four
- Players spread out → some go to screen edges
- Players die one by one → camera adjusts to remaining
- Last player alive gets dramatic final stand

### Edge Cases
- Player joins with keyboard + gamepad → doesn't create two players
- Gamepad disconnects mid-game → player loses control (acceptable)
- All players in exact same position → camera doesn't jitter
- Player off-screen can still shoot/move → bullets appear from edge
- Dead player's cocktail buff expires → no error

---

## Future Enhancements (Out of Scope)

These were considered but NOT included in this implementation:

- Drop-in/drop-out during gameplay
- Split-screen camera
- Player respawning (between waves or mid-wave)
- Friendly fire with reduced damage
- Dynamic camera zoom (zoom out when players spread)
- Character customization (choose color, enter name)
- Player-specific abilities or loadouts
- Team-based scoring
- Online multiplayer
- Spectator mode HUD for dead players

These can be revisited after core multiplayer is stable.

---

## Implementation Priority

### Phase 1: Foundation (Playable Multiplayer)
- Create StartScene with basic join detection
- Implement PlayerManager system
- Update GameScene to create multiple players
- Camera follows center point
- Basic health UI for all players

**Success Criteria:** 2-4 players can join and play together, camera follows them

### Phase 2: Polish (Feature-Complete)
- Full StartScene UI (title, high scores, slots)
- Player death handling and spectator mode
- Updated scoreboard for multiple players
- Victory/defeat screens with MVP ceremony
- Proper spawn positioning for 1-4 players

**Success Criteria:** Complete gameplay loop from join → play → MVP → return to lobby

### Phase 3: Refinement (Bar-Ready)
- Camera smoothing and edge case handling
- UI layout optimization for spectator readability
- Visual feedback for player join/death
- High score persistence with multiplayer scores
- Playtesting and balance tuning

**Success Criteria:** Game feels polished, exciting to watch, no bugs or jank

---

## Success Metrics

A successful multiplayer implementation will:
- ✅ Support 1-4 players with gamepad hot-swap at start screen
- ✅ Maintain all existing gameplay (enemies, waves, cocktails, scoring)
- ✅ Allow single survivor to complete game (dramatic moments)
- ✅ Show clear scoreboard competition throughout game
- ✅ Display intuitive join flow that bar patrons understand instantly
- ✅ Keep spectator-friendly UI (large, readable, color-coded)
- ✅ Preserve 5-10 minute session length
- ✅ Support quick rematch flow (back to lobby, rejoin)
- ✅ Create "coopetition" dynamics (teamwork + competition)
- ✅ Feel arcade-quality and polished

---

## Technical Notes

### Phaser Gamepad API
- `this.input.gamepad.total` returns number of connected gamepads
- `this.input.gamepad.getPad(index)` gets specific gamepad (0-3)
- Gamepad buttons/axes accessible via `.buttons[]` and `.axes[]`
- R2 trigger: `pad.buttons[7].pressed`
- START button: `pad.buttons[9].pressed`

### Scene Data Passing
```javascript
// StartScene → GameScene
this.scene.start('GameScene', {
  players: [...playerConfigs]
});

// GameScene receives data
create(data) {
  const playerConfigs = data.players;
}
```

### localStorage for High Scores
- Key: `giselasLastStand_highScores`
- Format: JSON array of `{ playerName, score, wave }` objects
- Sort by score descending, keep top 5

---

**Document Version:** 1.0
**Author:** Design discussions with Ben
**Status:** Ready for implementation planning phase
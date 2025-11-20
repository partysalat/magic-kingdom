# Difficulty Levels & Sub-Wave System

## Overview
This document describes the addition of three difficulty levels (Easy, Medium, Hard) and a sub-wave reinforcement system to increase replayability and tension. The wave count will be extended from 10 to 12 waves, with boss encounters at waves 4, 8, and 12.

---

## Core Design Goals

### Difficulty Levels
- **Purpose:** Increase replayability by offering different challenge levels
- **Selection:** Chosen at game start, affects entire playthrough
- **Scaling Factors:** Enemy health, damage, count, and sub-wave intensity

### Sub-Wave System
- **Purpose:** Build tension by spawning reinforcements during active waves
- **Trigger:** Based on % of enemies remaining in current sub-wave
- **Behavior:** Immediate spawn (no delays) when trigger threshold reached
- **Completion:** Wave completes only when ALL sub-waves are cleared

---

## Difficulty Level Specifications

### Easy Mode
**Target Audience:** New players, casual sessions, learning mechanics

**Scaling Multipliers:**
- Enemy Health: **0.7x** (30% less HP)
- Enemy Damage: **0.7x** (30% less damage)
- Enemy Count: **0.8x** (20% fewer enemies per composition)
- Sub-Wave Count: **1-2 sub-waves** (only on later waves 7+)

**Philosophy:**
- Forgiving difficulty curve
- More time to practice mechanics
- Minimal reinforcement pressure
- Focus on fun over challenge

### Medium Mode (Baseline)
**Target Audience:** Standard experience, intended balance

**Scaling Multipliers:**
- Enemy Health: **1.0x** (current balance)
- Enemy Damage: **1.0x** (current balance)
- Enemy Count: **1.0x** (current balance)
- Sub-Wave Count: **2-3 sub-waves** (starts from wave 4+)

**Philosophy:**
- Balanced challenge/reward
- Current game feel preserved
- Steady reinforcement pressure
- Strategic buff usage encouraged

### Hard Mode
**Target Audience:** Experienced players, challenge seekers

**Scaling Multipliers:**
- Enemy Health: **1.3x** (30% more HP)
- Enemy Damage: **1.3x** (30% more damage)
- Enemy Count: **1.2x** (20% more enemies per composition)
- Sub-Wave Count: **3-4 sub-waves** (aggressive from wave 3+)

**Philosophy:**
- Punishing difficulty
- Requires mastery of mechanics
- Constant reinforcement pressure
- Cocktail buffs become essential for survival

---

## Wave Structure Redesign

### Extended Wave Count: 12 Waves

**Current System:** 10 waves, bosses at 3, 6, 9
**New System:** 12 waves, bosses at 4, 8, 12

**Wave Progression:**
1. **Waves 1-3:** Normal difficulty ramp (tutorial phase)
2. **Wave 4:** BOSS - Iron Shell (first major test)
3. **Waves 5-7:** Increased difficulty with new enemy types
4. **Wave 8:** BOSS - Kraken's Arm (mid-game challenge)
5. **Waves 9-11:** Hardest normal waves, maximum enemy variety
6. **Wave 12:** FINAL BOSS - Leviathan or new ultimate boss (climax)

**Rationale for Boss Placement:**
- Wave 4: Earlier boss encounter forces players to learn mechanics faster
- Wave 8: Midpoint boss creates clear game arc
- Wave 12: Epic final confrontation with highest stakes

---

## Sub-Wave System Mechanics

### Definition
A **sub-wave** is a group of reinforcement enemies that spawn during an active wave when a trigger condition is met.

### Trigger System

**Trigger Type:** Enemy Count Percentage
- When a certain % of the current sub-wave's enemies are killed, spawn the next sub-wave

**Example Trigger Sequence:**
```javascript
Wave 5 (Medium Difficulty) - 3 Sub-Waves:
├─ Sub-Wave 1 (Main): 5 Hermit Crabs + 3 Lobsters
│  └─ Trigger: 75% killed → Spawn Sub-Wave 2
├─ Sub-Wave 2 (Reinforcement): 3 Shrimp Shooters
│  └─ Trigger: 50% killed → Spawn Sub-Wave 3
└─ Sub-Wave 3 (Final): 2 Jellyfish + 2 Flying Fish
   └─ Wave complete when 100% killed
```

### Sub-Wave Composition Rules

1. **Initial Sub-Wave (Main):**
   - Contains majority of wave's enemies
   - Typically tanks + basic enemies
   - Sets the baseline difficulty

2. **Mid Sub-Waves (Reinforcements):**
   - Smaller groups (3-5 enemies)
   - Often introduces new enemy types or ranged threats
   - Forces tactical adaptation

3. **Final Sub-Wave (Last Push):**
   - Mix of enemy types
   - Often includes fast/flying enemies
   - Creates climactic finish to wave

### Spawn Behavior

**Immediate Spawn:**
- No delays between sub-waves (maintain tension)
- Enemies spawn at designated spawn points (same as current system)
- Spawn animations play as normal (door/window entry)

**Visual/Audio Feedback:**
- **Reinforcements Incoming!** text notification
- Brief audio cue (alarm bell, horn, etc.)
- Optional: Screen flash or edge indicator showing spawn direction

---

## Difficulty-Based Sub-Wave Configuration

### Easy Mode (1-2 Sub-Waves)

**Waves 1-6:** No sub-waves (standard spawn)
**Waves 7-11:** 1-2 sub-waves
**Wave 12 (Boss):** No sub-waves (boss wave)

**Example - Wave 9 (Easy):**
```javascript
Main Wave: 4 Hermit + 5 Shrimp + 2 Lobsters
└─ Trigger at 40% → Sub-Wave: 2 Jellyfish + 1 Flying Fish
```

### Medium Mode (2-3 Sub-Waves)

**Waves 1-3:** No sub-waves
**Waves 4-11:** 2-3 sub-waves
**Waves 4, 8, 12 (Bosses):** Boss-specific sub-waves (see Boss Section)

**Example - Wave 7 (Medium):**
```javascript
Main Wave: 3 Hermit + 4 Shrimp + 2 Lobsters
├─ Trigger at 70% → Sub-Wave 1: 2 Jellyfish + 2 Shrimp
└─ Trigger at 40% → Sub-Wave 2: 3 Flying Fish
```

### Hard Mode (3-4 Sub-Waves)

**Waves 1-2:** No sub-waves
**Waves 3-11:** 3-4 sub-waves
**Waves 4, 8, 12 (Bosses):** Enhanced boss sub-waves

**Example - Wave 6 (Hard):**
```javascript
Main Wave: 4 Hermit + 5 Shrimp + 2 Lobsters
├─ Trigger at 80% → Sub-Wave 1: 3 Shrimp + 2 Jellyfish
├─ Trigger at 60% → Sub-Wave 2: 2 Hermit + 3 Flying Fish
└─ Trigger at 30% → Sub-Wave 3: 4 Flying Fish + 1 Jellyfish
```

---

## Boss Wave Sub-Wave System

### Current Boss Behavior
- Single boss spawns
- No additional enemies (except Leviathan's phase 2 minions)
- Boss health bar UI

### Enhanced Boss Sub-Waves

**Wave 4 - Iron Shell (Boss):**
- **Easy:** Boss only, no sub-waves
- **Medium:** Boss + 1 sub-wave at 50% boss HP (3 Lobsters)
- **Hard:** Boss + 2 sub-waves (50% HP: 4 Shrimp, 25% HP: 3 Hermit)

**Wave 8 - Kraken's Arm (Boss):**
- **Easy:** Boss only (tentacles + body)
- **Medium:** Boss + 1 sub-wave at 50% tentacles destroyed (4 Jellyfish)
- **Hard:** Boss + 2 sub-waves (2 tentacles down: 5 Shrimp, 4 tentacles down: 3 Flying Fish)

**Wave 12 - Leviathan (Final Boss):**
- **Easy:** Boss only, phase 2 minions as designed
- **Medium:** Boss + phase 2 minions + 1 sub-wave at phase 2 start (4 Hermit)
- **Hard:** Boss + phase 2 minions + 2 sub-waves (Phase 2: 5 Hermit, 30% HP: 6 Flying Fish)

**Design Note:** Boss sub-waves should feel like desperate last stands, not overwhelming chaos. Keep sub-wave counts conservative even on Hard mode.

---

## Wave Composition Examples (12-Wave System)

### Wave 1
**Theme:** Tutorial wave, basic enemies only
- **Easy:** 4 Lobsters
- **Medium:** 5 Lobsters
- **Hard:** 6 Lobsters
- **Sub-Waves:** None (all difficulties)

### Wave 2
**Theme:** Introduction to mixed enemy types
- **Easy:** 5 Lobsters
- **Medium:** 6 Lobsters + 1 Hermit
- **Hard:** 7 Lobsters + 2 Hermit
- **Sub-Waves:** None (all difficulties)

### Wave 3
**Theme:** First tactical challenge
- **Easy:** 2 Hermit + 3 Lobsters
- **Medium:** 2 Hermit + 4 Shrimp + 2 Lobsters
- **Hard:** 3 Hermit + 5 Shrimp + 3 Lobsters
- **Sub-Waves:**
  - Easy: None
  - Medium: None
  - Hard: 1 sub-wave (70% → 2 Shrimp + 1 Jellyfish)

### Wave 4 (BOSS)
**Boss:** Iron Shell
- See Boss Sub-Wave section above

### Wave 5
**Theme:** Post-boss difficulty spike
- **Easy:** 3 Hermit + 4 Shrimp + 2 Lobsters
- **Medium:** 3 Hermit + 5 Shrimp + 3 Lobsters + 1 Jellyfish
- **Hard:** 4 Hermit + 6 Shrimp + 4 Lobsters + 2 Jellyfish
- **Sub-Waves:**
  - Easy: None
  - Medium: 2 sub-waves (70% → 3 Shrimp, 40% → 2 Flying Fish)
  - Hard: 3 sub-waves (75% → 3 Shrimp, 50% → 2 Jellyfish, 25% → 3 Flying Fish)

### Wave 6
**Theme:** Introduction to flying enemies
- **Easy:** 3 Hermit + 4 Shrimp + 2 Lobsters + 2 Flying Fish
- **Medium:** 4 Hermit + 5 Shrimp + 2 Lobsters + 3 Flying Fish
- **Hard:** 5 Hermit + 6 Shrimp + 3 Lobsters + 4 Flying Fish
- **Sub-Waves:**
  - Easy: 1 sub-wave (50% → 2 Jellyfish)
  - Medium: 2 sub-waves (65% → 2 Jellyfish + 1 Shrimp, 35% → 3 Flying Fish)
  - Hard: 3 sub-waves (70% → 3 Jellyfish, 50% → 3 Shrimp, 25% → 4 Flying Fish)

### Wave 7
**Theme:** Maximum enemy variety
- **Easy:** 3 Hermit + 4 Shrimp + 2 Jellyfish + 2 Flying Fish
- **Medium:** 4 Hermit + 5 Shrimp + 3 Jellyfish + 3 Flying Fish + 2 Lobsters
- **Hard:** 5 Hermit + 6 Shrimp + 4 Jellyfish + 4 Flying Fish + 3 Lobsters
- **Sub-Waves:**
  - Easy: 1 sub-wave (45% → 2 Hermit + 2 Shrimp)
  - Medium: 3 sub-waves (70% → 3 Shrimp, 45% → 2 Jellyfish + 2 Flying Fish, 20% → 2 Hermit)
  - Hard: 4 sub-waves (80% → 3 Shrimp, 60% → 3 Jellyfish, 35% → 4 Flying Fish, 15% → 3 Hermit)

### Wave 8 (BOSS)
**Boss:** Kraken's Arm
- See Boss Sub-Wave section above

### Wave 9
**Theme:** Post-boss gauntlet
- **Easy:** 4 Hermit + 5 Shrimp + 3 Jellyfish + 3 Flying Fish
- **Medium:** 5 Hermit + 6 Shrimp + 4 Jellyfish + 4 Flying Fish + 2 Lobsters
- **Hard:** 6 Hermit + 8 Shrimp + 5 Jellyfish + 5 Flying Fish + 3 Lobsters
- **Sub-Waves:**
  - Easy: 2 sub-waves (60% → 3 Shrimp + 1 Jellyfish, 30% → 3 Flying Fish)
  - Medium: 3 sub-waves (70% → 3 Shrimp + 2 Jellyfish, 45% → 3 Flying Fish, 20% → 2 Hermit + 2 Shrimp)
  - Hard: 4 sub-waves (75% → 4 Shrimp, 55% → 3 Jellyfish + 2 Flying Fish, 30% → 3 Hermit, 10% → 5 Flying Fish)

### Wave 10
**Theme:** Endurance test
- **Easy:** 4 Hermit + 6 Shrimp + 3 Jellyfish + 3 Flying Fish + 2 Lobsters
- **Medium:** 6 Hermit + 7 Shrimp + 4 Jellyfish + 4 Flying Fish + 3 Lobsters
- **Hard:** 7 Hermit + 9 Shrimp + 5 Jellyfish + 6 Flying Fish + 4 Lobsters
- **Sub-Waves:**
  - Easy: 2 sub-waves (55% → 3 Shrimp + 2 Flying Fish, 25% → 2 Hermit + 2 Jellyfish)
  - Medium: 3 sub-waves (70% → 4 Shrimp, 45% → 3 Jellyfish + 3 Flying Fish, 20% → 3 Hermit + 2 Lobsters)
  - Hard: 4 sub-waves (75% → 5 Shrimp, 55% → 4 Jellyfish, 30% → 4 Flying Fish + 2 Hermit, 10% → 4 Hermit + 3 Lobsters)

### Wave 11
**Theme:** Final gauntlet before boss
- **Easy:** 5 Hermit + 6 Shrimp + 4 Jellyfish + 4 Flying Fish + 2 Lobsters
- **Medium:** 6 Hermit + 8 Shrimp + 5 Jellyfish + 5 Flying Fish + 3 Lobsters
- **Hard:** 8 Hermit + 10 Shrimp + 6 Jellyfish + 6 Flying Fish + 4 Lobsters
- **Sub-Waves:**
  - Easy: 2 sub-waves (50% → 4 Shrimp + 2 Jellyfish, 20% → 3 Flying Fish + 2 Hermit)
  - Medium: 3 sub-waves (65% → 5 Shrimp, 40% → 4 Jellyfish + 3 Flying Fish, 15% → 4 Hermit + 2 Lobsters)
  - Hard: 4 sub-waves (75% → 6 Shrimp, 50% → 5 Jellyfish, 25% → 5 Flying Fish + 3 Hermit, 10% → 5 Hermit + 4 Lobsters)

### Wave 12 (FINAL BOSS)
**Boss:** Leviathan (or new ultimate boss)
- See Boss Sub-Wave section above

---

## Implementation Plan

### Phase 1: Difficulty Configuration System
**Files to Modify:**
- `src/config.js` - Add difficulty constants and multipliers
- `src/scenes/MenuScene.js` (or new DifficultySelectScene) - Difficulty selection UI
- `src/systems/WaveManager.js` - Store selected difficulty

**Implementation:**
1. Create `DIFFICULTY_SETTINGS` config object with multipliers
2. Add difficulty selection menu (buttons: Easy/Medium/Hard)
3. Pass selected difficulty to game scene on start
4. Store difficulty in WaveManager instance

### Phase 2: Wave System Extension
**Files to Modify:**
- `src/systems/WaveManager.js` - Update `maxWaves`, `isBossWave()`, `getWaveComposition()`

**Implementation:**
1. Change `maxWaves` from 10 to 12
2. Update `isBossWave()` to return true for waves 4, 8, 12
3. Add wave compositions for all 12 waves with difficulty variants
4. Apply difficulty multipliers to enemy counts

### Phase 3: Sub-Wave System Core
**Files to Modify:**
- `src/systems/WaveManager.js` - Add sub-wave tracking and spawn logic

**Implementation:**
1. Extend wave composition structure to include sub-wave arrays
2. Add sub-wave counter and tracking variables
3. Implement trigger percentage monitoring in `enemyKilled()` method
4. Create `spawnSubWave()` method for reinforcement spawning
5. Update `waveComplete()` to check all sub-waves cleared

**New Data Structure:**
```javascript
{
  waveNumber: 5,
  mainWave: [
    { type: 'hermit', count: 3, role: 'tank' },
    { type: 'shrimp', count: 5, role: 'shooter' }
  ],
  subWaves: [
    {
      trigger: 0.70,  // Spawn when 70% of current sub-wave killed
      enemies: [
        { type: 'jellyfish', count: 2 },
        { type: 'shrimp', count: 2 }
      ]
    },
    {
      trigger: 0.40,
      enemies: [
        { type: 'flying_fish', count: 3 }
      ]
    }
  ]
}
```

### Phase 4: Difficulty-Based Enemy Scaling
**Files to Modify:**
- `src/systems/WaveManager.js` - `spawnEnemiesByComposition()` method
- `src/entities/Enemy.js` - Apply scaling on enemy creation

**Implementation:**
1. Pass difficulty multipliers to enemy spawn function
2. Scale enemy health: `baseHealth * difficultyHealthMultiplier`
3. Scale enemy damage: `baseDamage * difficultyDamageMultiplier`
4. Scale enemy count: `Math.ceil(baseCount * difficultyCountMultiplier)`
5. Apply scaling to both main waves and sub-waves

### Phase 5: Boss Wave Sub-Waves
**Files to Modify:**
- `src/systems/WaveManager.js` - Boss-specific sub-wave logic
- `src/entities/Enemy.js` - Boss health-based triggers (if needed)

**Implementation:**
1. Add boss sub-wave configurations for waves 4, 8, 12
2. Implement health-based triggers for boss sub-waves
3. Ensure boss health bar remains during sub-wave spawns
4. Test boss + minion interactions

### Phase 6: UI/UX Updates
**Files to Modify:**
- `src/ui/GameHUD.js` - Update wave counter to "X/12"
- `src/scenes/GameScene.js` - Add sub-wave notification system
- Create `DifficultySelectScene.js` (new file) - Difficulty menu

**Implementation:**
1. Update wave counter display
2. Create "Reinforcements Incoming!" notification
3. Add audio cue for sub-wave spawn
4. Build difficulty selection screen with clear descriptions
5. Show selected difficulty in pause menu / HUD

### Phase 7: Balancing & Testing
**Tasks:**
1. Playtest all difficulty levels for wave 1-12 progression
2. Verify sub-wave triggers fire at correct percentages
3. Balance enemy compositions for smooth difficulty curve
4. Test boss waves with sub-waves on all difficulties
5. Ensure cocktail buff system remains valuable on Hard mode
6. Verify bounty enemy system still works with sub-waves

---

## Design Rationale

### Why Reinforce During Waves?
1. **Tension Building:** Current system spawns all enemies at once; sub-waves create dynamic pacing
2. **Tactical Adaptation:** Players must adjust strategy mid-wave
3. **Spectator Excitement:** "Will they survive the next wave?" creates dramatic moments
4. **Cocktail Buff Timing:** Reinforces strategic buff activation decisions

### Why 12 Waves Instead of 10?
1. **Better Boss Pacing:** 4, 8, 12 creates clearer game structure (3 acts)
2. **More Content:** Extended gameplay for replayability
3. **Smoother Difficulty Curve:** More gradual ramp-up between boss encounters

### Why Percentage-Based Triggers?
1. **Consistent Timing:** Triggers at predictable moments regardless of kill speed
2. **Dynamic Pacing:** Fast players get faster reinforcements (rewards efficiency)
3. **Scalable:** Works across all difficulty levels and enemy counts

### Why No Delays Between Sub-Waves?
1. **Maintains Tension:** No breathing room keeps pressure high
2. **Reward Efficiency:** Fast players challenged immediately
3. **User Request:** Explicitly stated "no delays" in requirements

---

## Balancing Considerations

### Risk: Over-Difficulty on Hard Mode
**Problem:** 1.3x health + 1.2x count + 3-4 sub-waves might be overwhelming
**Solution:** Extensive playtesting, consider 1.25x health instead, tune sub-wave timing

### Risk: Easy Mode Too Easy
**Problem:** 0.7x stats might make game trivial
**Solution:** Ensure sub-waves still appear late-game to maintain some challenge

### Risk: Sub-Wave Spam
**Problem:** Too many sub-waves could feel chaotic rather than strategic
**Solution:** Cap at 4 sub-waves max even on Hard, space triggers appropriately

### Risk: Cocktail Buff Balance
**Problem:** Buffs might become too powerful or too weak with new difficulty scaling
**Solution:** Test buff effectiveness at each difficulty, adjust buff power if needed

---

## Success Metrics

The difficulty and sub-wave system succeeds if:
- ✅ Easy mode is accessible to new players without frustration
- ✅ Medium mode preserves current game feel and balance
- ✅ Hard mode provides meaningful challenge for experienced players
- ✅ Sub-waves create noticeable tension spikes during combat
- ✅ Players react to sub-wave spawns ("Oh no, more enemies!")
- ✅ Cocktail buff timing decisions become more strategic
- ✅ Wave 12 feels like an epic final boss encounter
- ✅ Difficulty selection UI is clear and informative
- ✅ All 12 waves have distinct identity and escalation

---

## Testing Checklist

### Difficulty Scaling
- [ ] Easy mode enemy stats correctly reduced (0.7x health/damage)
- [ ] Medium mode matches current baseline
- [ ] Hard mode enemy stats correctly increased (1.3x health/damage)
- [ ] Enemy count scaling applies correctly (0.8x / 1.0x / 1.2x)

### Wave System
- [ ] 12 waves total with proper progression
- [ ] Boss waves correctly identified (4, 8, 12)
- [ ] Wave counter displays "X/12" in HUD
- [ ] All wave compositions defined for all difficulties

### Sub-Wave System
- [ ] Sub-wave triggers fire at correct kill percentages
- [ ] Reinforcements spawn immediately (no delays)
- [ ] Wave completion requires all sub-waves cleared
- [ ] Sub-wave count varies by difficulty (Easy: 1-2, Medium: 2-3, Hard: 3-4)
- [ ] "Reinforcements Incoming!" notification displays correctly
- [ ] Audio cue plays on sub-wave spawn

### Boss Waves
- [ ] Wave 4 boss (Iron Shell) works with sub-waves
- [ ] Wave 8 boss (Kraken's Arm) works with sub-waves
- [ ] Wave 12 boss (Leviathan) works with sub-waves
- [ ] Boss health bar remains visible during sub-wave spawns
- [ ] Boss sub-waves scale with difficulty

### UI/UX
- [ ] Difficulty selection screen clear and functional
- [ ] Selected difficulty displayed in game
- [ ] Sub-wave notifications readable and timely
- [ ] Wave counter updated to show /12
- [ ] Pause menu shows current difficulty

### Balance
- [ ] Easy mode completable by new players
- [ ] Medium mode feels balanced and fair
- [ ] Hard mode challenging but not impossible
- [ ] Cocktail buffs remain valuable across all difficulties
- [ ] Bounty enemy system still functional
- [ ] Formation tactics system still works with sub-waves

---

**Document Version:** 1.0
**Last Updated:** 2025-11-20
**Status:** Design Complete - Ready for Implementation
**Related Documents:** game_idea2.md, game_idea_2_adaptions4.md (cocktail system)

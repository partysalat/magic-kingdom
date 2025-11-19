# Gisela's Last Stand - Game Design Document

## Overview

**Game Title:** Gisela's Last Stand
**Genre:** Twin-stick wave survival shooter
**Platform:** Browser (HTML5)
**Engine:** Phaser.js
**Target Audience:** Bar patrons, casual gamers
**Session Length:** 5-10 minutes
**Players:** 1-4 (local co-op with competitive scoring)

**High Concept:** A crustacean western where Gisela the cowboy crab and friends defend their saloon from waves of outlaw sea creatures. Survive together, compete for MVP, and power up with cocktail buffs in this spectator-friendly arcade shooter.

---

## Theme & Visual Identity

### Crustacean Western
- **Core Concept:** Sea creatures in full western attire
- **Setting:** Classic western saloon with subtle ocean hints
- **Art Style:** Pixel art

### Visual Elements
- **Players:** Colored crabs (red, blue, green, yellow) wearing cowboy hats and bandanas
- **Enemies:** Sea creatures (lobsters, shrimp, hermit crabs, jellyfish, flying fish) dressed as western outlaws
- **Environment:**
  - Classic saloon architecture (wooden floors, swinging doors, poker tables)
  - Barrels and tables as obstacles/cover
  - Subtle ocean decorations (seaweed chandeliers, coral accents, fish tank at bar)
- **Cocktails:** Stylized drinks with glowing colored liquid

---

## Core Gameplay

### Controls
- **Twin-stick shooter mechanics**
  - Movement: WASD or left stick
  - Aim/Shoot: Mouse or right stick
- **Gamepad support:** Full controller compatibility for bar setup

### Objective
Survive 10 waves of increasingly difficult enemies while competing for the highest score.

### Health System
- **Individual health bars** per player
- Players can die independently
- Last crab standing can still complete the wave solo
- Creates dramatic "clutch moment" opportunities for spectators

### Weapons
- **Default:** Six-shooter (unlimited ammo, medium fire rate)
- **Pickups (potential):** Rifle, shotgun, dynamite
  - Higher damage or special effects
  - Limited ammo or temporary powerups

---

## Enemy Types

### Basic Enemies

1. **Bandit Lobsters**
   - Role: Basic shooters
   - Behavior: Slow moving, shoots with claw pistols
   - Health: Medium
   - Threat: Steady ranged damage

2. **Quick-Draw Shrimp**
   - Role: Fast melee attackers
   - Behavior: Dart quickly toward players
   - Health: Low (1-2 shots)
   - Threat: Speed and unpredictability

3. **Hermit Crab Tanks**
   - Role: Heavy units
   - Behavior: Slow advance, high damage resistance
   - Health: High (shell armor)
   - Threat: Bullet sponge, forces focus fire

4. **Jellyfish Ghosts**
   - Role: Supernatural enemies
   - Behavior: Float, teleport short distances
   - Health: Medium
   - Threat: Unpredictable movement, ranged attacks

5. **Flying Fish**
   - Role: Aerial attackers
   - Behavior: Swoop attacks from above
   - Health: Low
   - Threat: Different attack angle, hard to track

### Bounty Enemies

Special "Wanted" enemies with unique names that spawn randomly during waves:
- **"Big Claw McGraw"** - Legendary Lobster (500-1000 pts)
- **"Shelly the Shellfish"** - Armored Hermit Crab (500-1000 pts)
- **"Reef Reaper"** - Ghost Jellyfish (500-1000 pts)
- **"Pistol Shrimp Pete"** - Elite Quick-Draw (500-1000 pts)

**Visual Indicators:**
- Wanted poster icon above enemy
- Spotlight effect
- Audio announcement: "WANTED: [Name] - [Points] Points!"

---

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

### Cocktail Types

| Cocktail | Effect | Duration | Visual Feedback |
|----------|--------|----------|-----------------|
| **Margarita** | Spread Shot - bullets fan out in wide arc | 15 seconds | Lime-green bullet trails + green player aura |
| **Mojito** | Rapid Fire - 2x fire rate | 15 seconds | Blue rapid shots + blue player aura |
| **Old Fashioned** | Heavy Hitter - 2x damage, slightly slower fire | 15 seconds | Orange impact effects + orange player aura |
| **Tequila Sunrise** | Damage Ramp - damage increases while shooting | 20 seconds | Yellow→Red gradient trails + shifting aura |
| **Whiskey Sour** | Piercing Shots - bullets pass through enemies | 15 seconds | Golden trails + yellow player aura |
| **Manhattan** | Critical Hits - 50% chance for 3x damage | 15 seconds | Sparkle effects on shots + red sparkle aura |

For complete details, see: `game_idea_2_adaptions4.md`

---

## Scoring & Competition System

### Point Values
- **Basic enemy kill:** +10 points
- **Bounty enemies:** +100-1000 points (scales with wave number)
- **Survival bonus:** +50 points per wave completed

### Real-Time Leaderboard
- Displays during gameplay
- Shows player color/name and current score
- Updates immediately on kills
- Large, readable for spectators

### MVP System
- **Determination:** Total score at game end
- **Ceremony:** Special spotlight on winner
- **Breakdown:** Shows kills, bounties claimed, waves survived
- **High Score Entry:** If score beats existing records

---

## Wave Structure & Progression

### Wave Count
10 total waves, increasing difficulty

### Wave Phases
1. **Spawn Phase** - Enemies enter through saloon doors
2. **Combat Phase** - Active fighting, bounties may appear
3. **Clear Phase** - Last enemy defeated
4. **Cocktail Phase** - 3 cocktails spawn, players scramble (10-15 sec)
5. **Rest Phase** - Brief 5-second countdown before next wave

### Difficulty Progression

**Early Waves (1-3):**
- Bandit Lobsters primarily
- 5-10 enemies per wave
- Occasional bounty enemy
- Tutorial difficulty

**Mid Waves (4-7):**
- Mix of Lobsters + Shrimp
- Hermit Crab Tanks introduced
- 10-15 enemies per wave
- Bounty values increase (300-500 pts)
- Moderate challenge

**Late Waves (8-10):**
- All enemy types active
- 15-20+ enemies per wave
- Multiple enemy types simultaneously
- High-value bounties (500-1000 pts)
- Intense, requires cocktail buffs and cooperation

---

## Player Experience Flow

### Pre-Game
1. **Difficulty Selection** - Easy / Medium / Hard
2. **Character Selection** - Choose crab color
3. **Ready Up** - All players confirm

### In-Game Loop
1. Wave announcement (Wave X/10)
2. Enemies spawn → Combat → Bounty opportunities
3. Wave clear celebration → Scores update
4. Cocktail scramble → Players race for buffs
5. Brief rest → Next wave starts
6. Repeat through 10 waves

### Game Over (Loss)
- Triggered when all players are eliminated
- Shows wave reached (e.g., "Survived to Wave 7")
- Score breakdown for each player
- High score comparison
- Quick restart option

### Victory (Wave 10 Completion)
- Special victory sequence
  - Saloon celebration animation
  - MVP spotlight ceremony
  - Final scoreboard with detailed breakdown
  - High score entry if applicable
- Rematch option

---

## Bar-Specific Design Features

### Spectator Optimization
- **Large UI:** Readable from 6-10 feet away
- **Clear Player Colors:** Easy to track individuals in chaos
- **Bounty Announcements:** Loud visual + audio cues
- **Real-Time Scoreboard:** Audience can follow competition
- **Wave Progress:** Prominent display (Wave 5/10)

### Social Dynamics
- **Individual Health:** Creates "clutch moment" drama
  - "Can Sarah survive solo?"
  - Crowd can rally behind last player standing
- **Bounty Races:** Mini-competitions within cooperation
  - "Get that lobster!"
  - Visible tension for spectators
- **Cocktail Scramble:** Between-wave excitement
  - "Who got the best drink?"
  - Physical movement creates energy
- **MVP Ceremony:** Clear winner with bragging rights
  - Encourages rematches
  - Creates bar legends

### Session Management
- **5-10 minute rounds:** Perfect for bar rotation
- **Easy to jump in:** Simple controls, clear objective
- **Quick restart:** Minimal downtime between games
- **Scalable players:** Works with 1-4 players

---

## Technical Specifications

### Platform
- **Browser-based** (HTML5)
- **Engine:** Phaser.js (pixel-perfect rendering, arcade physics)
- **Target Resolution:** 1920x1080 (scalable)
- **Frame Rate:** 60 FPS target

### Input Support
- **Keyboard + Mouse:** Primary control scheme
- **Gamepad:** Full support for up to 4 controllers
- **Hot-swap:** Controllers can connect mid-session

### Performance Targets
- Smooth 60 FPS with 20+ enemies on screen
- Minimal load times
- Low-latency input response (critical for twin-stick)

### Asset Requirements
- **Sprites:** Player crabs (4 colors), enemies (5 types + variants), cocktails (6)
- **Environment:** Saloon tileset, obstacles, decorations
- **UI:** HUD elements, leaderboard, menus, bounty posters
- **Audio:** Western music, gunshots, enemy sounds, cocktail pickup, announcements
- **VFX:** Bullet trails, explosions, auras, screen shake

---

## Development Phases

### Phase 1: Core Loop (Playable Prototype)
**Goal:** Prove the twin-stick combat feels good

- Basic twin-stick movement and shooting
- One enemy type (Bandit Lobster)
- Simple wave spawning (3 waves)
- Health system and game over
- Basic saloon environment

**Success Criteria:** Fun to shoot enemies, movement feels responsive

---

### Phase 2: Enemy Variety (Fun Emerging)
**Goal:** Create interesting combat scenarios

- Implement all 5 enemy types with distinct behaviors
- Wave progression system (10 waves)
- Enemy spawn patterns and balancing
- Health pickups (if needed)
- Basic scoring system

**Success Criteria:** Each wave feels different, difficulty ramps smoothly

---

### Phase 3: Competition Features (Bar-Ready)
**Goal:** Add competitive elements and cocktail system

- Full scoring system (kills, bonuses)
- Bounty enemy system with visual indicators
- Cocktail spawning between waves
- All 6 cocktail buffs implemented
- Real-time leaderboard display
- MVP screen at game end

**Success Criteria:** Competition is engaging, cocktails feel impactful, clear winner

---

### Phase 4: Polish (Crowd-Pleaser)
**Goal:** Make it spectacular for spectators

- Visual juice (screen shake, particles, hit effects)
- Western audio (music tracks, sound effects)
- Bounty announcement system (visual + audio)
- Victory/defeat sequences
- UI polish for spectator readability
- Difficulty balancing and tuning
- High score persistence (local storage)

**Success Criteria:** Game feels alive, exciting to watch, polished presentation

---

## Open Questions / Future Considerations

### Potential Additions
- **Boss Waves:** Every 3rd wave is a unique boss fight
- **More Cocktails:** Expand roster with weirder effects
- **Weapon Variety:** Pickups beyond the six-shooter
- **Environmental Hazards:** Swinging saloon doors, breaking glass
- **Character Abilities:** Each colored crab has a unique special move
- **Online Leaderboards:** Global high scores
- **Replay System:** Save and share best runs

### Balance Considerations
- Health values per enemy type
- Damage values per weapon/cocktail
- Spawn rates and wave composition
- Bounty point values
- Cocktail duration tuning

### Accessibility
- Colorblind mode (player identification)
- Difficulty scaling options
- Control remapping
- Visual clarity improvements

---

## Success Metrics

A successful implementation of Gisela's Last Stand will:
- ✅ Be immediately understandable to bar patrons
- ✅ Create spectator-friendly "moment" generators
- ✅ Balance cooperation with competition effectively
- ✅ Complete full games in 5-10 minutes
- ✅ Encourage rematches and rivalry
- ✅ Feel polished and arcade-quality
- ✅ Support 1-4 players seamlessly
- ✅ Generate social energy in a bar setting

---

## Design Pillars

When making decisions during development, prioritize:

1. **Spectator Appeal** - Is this exciting to watch?
2. **Coopetition Balance** - Does it encourage teamwork AND competition?
3. **Bar Context** - Does this work in a loud, social environment?
4. **Readability** - Can you understand what's happening at a glance?
5. **Theme Integration** - Does this reinforce the crustacean western vibe?

---

**Document Version:** 1.0
**Last Updated:** 2025-11-12
**Status:** Design Complete - Ready for Implementation
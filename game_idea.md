# Gisela's Wild Ride - Game Design Document

## Core Concept
A pixel-art platformer game featuring Gisela, a cowboy crab riding a horse. Players navigate through Western-themed levels, collecting cocktail ingredients, defeating enemies via jump combat, and crafting special cocktails for superpowers.

**Target Audience:** Casual gamers at a bar
**Session Length:** 2-5 minutes per level
**Platform:** Browser-based (PixiJS)
**Input:** Keyboard/Mouse

---

## Game Overview

### Genre & Style
- **Type:** Level-based platformer with combat and crafting
- **Art Style:** Pixel art
- **Setting:** Wild West bar/saloon theme
- **Tone:** Fun, accessible, visually clear for bar environment

### Core Gameplay Loop
1. Navigate left-to-right through levels
2. Jump on enemies to defeat them (Mario-style stomp)
3. Collect cocktail ingredients (easy to get, rare ones in harder spots)
4. Auto-craft cocktails from collected ingredients
5. Use cocktails via hotkeys for superpowers
6. Reach checkpoints and complete levels
7. Compete for high scores on leaderboard

---

## Player Character

### Gisela (Cowboy Crab on Horse)
- **Movement:** Left-to-right platformer controls
- **Jump System:** Double or triple jump capability
- **Combat:** Jump-based stomp attacks on enemies
- **Special Abilities:** Cocktail-powered superpowers

---

## Cocktail Crafting System

### Inventory System
- **Always Visible:** Displayed on screen at all times
- **Auto-Craft:** Cocktails automatically created when right ingredients collected
- **Activation:** Hotkeys (1-4) or clicking icons
- **Recipe Transparency:** All recipes shown to player from the start

### The 4 Cocktails & Powers

#### 1. Margarita
- **Ingredients:** Tequila + Lime + Salt
- **Power:** Speed Boost
- **Effect:** Gisela moves significantly faster

#### 2. White Russian
- **Ingredients:** Vodka + Coffee Liqueur + Cream
- **Power:** Slow Motion
- **Effect:** Game slows down for easier timing/jumps

#### 3. Mojito
- **Ingredients:** Rum + Mint + Lime
- **Power:** Jump Boost
- **Effect:** Higher/longer jumps (enhanced beyond triple jump)

#### 4. Old Fashioned
- **Ingredients:** Whiskey + Bitters + Orange
- **Power:** Projectiles
- **Effect:** Gisela can throw/shoot projectiles at enemies

### Ingredients List (12 Total)
- Tequila
- Lime (shared between Margarita & Mojito)
- Salt
- Vodka
- Coffee Liqueur
- Cream
- Rum
- Mint
- Whiskey
- Bitters
- Orange

---

## Enemies & Obstacles

### Enemy Types & Behaviors

#### 1. Bouncer Lobsters
- **Behavior:** Patrol back and forth
- **Role:** Block paths, ground-based threat
- **Drops:** Salt (suggested)

#### 2. Flying Bar Stools
- **Behavior:** Thrown in arcs
- **Role:** Aerial hazard, must dodge or destroy
- **Drops:** Random ingredients

#### 3. Beer Puddles
- **Behavior:** Static hazard on ground
- **Effect:** Slows Gisela's movement, possibly causes slipping

#### 4. Rival Cowboy Shrimp
- **Behavior:** Ride horses, chase/shoot at Gisela
- **Role:** Aggressive mobile threat
- **Drops:** Lime (suggested)

#### 5. Rolling Beer Kegs
- **Behavior:** Roll across platforms Indiana Jones style
- **Role:** Large obstacle, must outrun or avoid
- **Drops:** Various ingredients

### Enemy Mechanics
- **Drop System:** Enemies drop ingredients when defeated
- **Combat:** All defeatable via jump-stomp
- **Health:** TBD (one-hit or tiered health system)

---

## Level Structure

### Overview
- **Total Levels:** 3 regular levels + 1 boss fight
- **Length:** 2-5 minutes each
- **Direction:** Left-to-right progression
- **Checkpoints:** Yes, frequent for casual players
- **Death System:** Respawn at last checkpoint

### Level Themes

#### Level 1: "The Saloon Floor"
- **Purpose:** Tutorial level, easier enemies
- **Setting:** Inside Western saloon, wooden floors, tables, bar counter platforms
- **Enemies:** Bouncer Lobsters, Beer Puddles
- **Focus:** Introduces jump combat & ingredient collection

#### Level 2: "The Stockyard"
- **Purpose:** Medium difficulty, introduces all mechanics
- **Setting:** Outdoor corral area, hay bales, wooden fences
- **Enemies:** Rolling Beer Kegs, Flying Bar Stools, Cowboy Shrimp
- **Hazards:** Cacti, water troughs (possible)

#### Level 3: "The Rooftop Showdown"
- **Purpose:** Hardest level, prepares for boss
- **Setting:** Rooftops of Western town, jumping between buildings
- **Enemies:** All enemy types, dense combat
- **Leads Into:** Boss arena

### Boss Fight
**Options to decide:**
- Giant Bartender Lobster with mechanical arms?
- Sheriff Shrimp on massive horse?
- The Beer Baron throwing kegs/bottles?

---

## Combat System

### Jump-Stomp Mechanics
- **Primary Attack:** Jump on enemies from above (Mario-style)
- **Success:** Defeat enemy, possibly bounce higher
- **Failure:** Hitting enemy from side causes damage
- **Precision:** TBD (tight hitbox vs. forgiving)

### Damage & Health
**To Be Decided:**
- One-hit death with checkpoint restart?
- OR 3-heart health system (recommended for casual players)
  - Screen shake + invincibility flash on hit
  - Checkpoints restore health
  - Healing items (beer mugs?)

---

## Scoring & Leaderboard

### Point System (Suggested)
- **Enemy Defeat:** 10 points each
- **Ingredient Collection:** 5 points each
- **Cocktail Crafted:** 50 point bonus
- **Level Completion:** 100 points
- **Time Bonus:** Faster completion = more points
- **Combo System:** Defeat enemies in quick succession = multiplier

### Leaderboard
- **Display:** Top 10 high scores of day/week
- **Location:** Main menu or dedicated screen
- **Info Shown:** Name + Score (+ Time?)
- **Social:** Competitive element for bar customers

---

## Visual & Audio Design

### Visual Feedback (Critical for Bar Environment)
- **Big Particle Effects:** Clear visual feedback for collections
- **Screen Shake:** On hits, stomps, and impacts
- **Glowing/Pulsing:** When recipes are ready to craft
- **Color-Coded:** Health states, enemy difficulty tiers

### UI Elements
- **Always-Visible Inventory:** Bottom corner of screen
- **Ingredient Slots:** Icons with counts
- **Cocktail Hotbar:** 4 slots for crafted drinks
- **Recipe Guide:** Accessible display showing all 4 recipes
- **Health Display:** Hearts or equivalent (if health system used)
- **Score Counter:** Current points displayed

### Audio (Important for Noisy Bar)
- **Must be clear over bar noise**
- **Satisfying collection sounds**
- **Enemy defeat feedback**
- **Power-up activation sounds**

---

## Controls

### Keyboard (Primary)
- **Movement:** Arrow Keys or A/D (TBD)
- **Jump:** Spacebar / W / Up Arrow (TBD)
- **Use Cocktails:** Number keys 1-4 OR click hotbar icons
- **Pause:** Esc or P (TBD)

### Controller Support?
- **Consider adding** for easier pass-around in bar setting

---

## Technical Implementation

### Framework
- **Engine:** PixiJS
- **Language:** JavaScript

### Asset Requirements
- Gisela sprite sheets (idle, run, jump, attack animations)
- Horse animations (gallop, jump, land)
- All enemy sprites + animations (5 enemy types)
- Ingredient/cocktail icons (12 ingredients + 4 cocktails)
- Level tilesets & backgrounds (3 themes)
- UI elements (inventory, health, buttons)
- Boss sprite + animations

### Asset Source
**To Be Decided:** Create custom, use free assets, or commission?

### Physics
- Gravity strength: TBD
- Jump arc feel: TBD (floaty vs. snappy)
- Horse movement speed: TBD
- Double/triple jump mechanics: TBD

---

## Open Questions & Design Decisions Needed

### Critical Decisions
1. **Cocktail Power Duration:** 5 seconds? 10 seconds? Toggle on/off?
2. **Inventory Capacity:** How many ingredient slots? How many crafted cocktail slots?
3. **Multiple Powers:** Can Gisela use multiple cocktails simultaneously?
4. **Ingredient Persistence:** Keep ingredients after death or lose some?
5. **Boss Selection:** Which boss archetype?

### Balance Questions
6. **Enemy Health:** One-stomp kills all, or tiered (1-3 stomps)?
7. **Player Health:** Instant death or 3-heart system?
8. **Drop Rates:** 100% guaranteed or 50% chance from enemies?
9. **Ingredient Distribution:** Even across levels or level-specific focus?
10. **Specific Enemy Drops:** Random or enemy-type specific?

### Technical Details
11. **Exact Controls:** Which keys for each action?
12. **Controller Support:** Yes or keyboard/mouse only?
13. **Jump Feel:** Floaty or snappy physics?
14. **Stomp Hitbox:** Tight precision or forgiving?
15. **Art Pipeline:** Asset creation strategy?

---

## Design Philosophy

### For Bar Context
- **Quick Onboarding:** Easy to learn, hard to master
- **Forgiving Difficulty:** Checkpoints, possibly health system
- **Spectator-Friendly:** Clear visual language for watchers
- **Low Frustration:** Casual players in social setting
- **Quick Restart:** Minimal game-over animations
- **Competitive Element:** Leaderboard for bar regulars

### Core Pillars
1. **Accessibility:** Anyone can pick up and play
2. **Collection Focus:** Satisfying ingredient gathering
3. **Strategic Depth:** Recipe crafting adds decision-making
4. **Visual Clarity:** Works in noisy, lit bar environment
5. **Replayability:** High score chase, speedrunning potential

---

## Next Steps

1. **Finalize open design decisions** (durations, capacities, boss choice)
2. **Create asset list** with specific sprite requirements
3. **Define exact physics values** (gravity, jump height, speed)
4. **Design specific level layouts** (platform placement, enemy patterns)
5. **Establish progression curve** (difficulty scaling across 3 levels)
6. **Plan UI layout** (exact inventory/HUD positioning)
7. **Begin prototyping** core movement and jump mechanics

---

## Version History
- **v1.0** - Initial brainstorming session complete
- Created: 2025-11-12
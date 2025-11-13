# Gisela's Last Stand - Phase 2 Prototype

A twin-stick wave survival shooter featuring Gisela the cowboy crab defending her saloon from diverse bandit enemies.

## Development Status

### Phase 1: Core Loop ✅ COMPLETE
- Basic twin-stick movement and shooting
- One enemy type (Bandit Lobster)
- Simple wave spawning (3 waves)
- Health system and game over
- Basic saloon environment

### Phase 2: Enemy Variety ✅ COMPLETE
- All 5 enemy types implemented:
  - Bandit Lobster (basic shooter)
  - Quick-Draw Shrimp (fast melee)
  - Hermit Crab Tank (heavy unit)
  - Jellyfish Ghost (teleporter)
  - Flying Fish (swoop attacker)
- 10-wave progression system
- Mixed enemy spawning by wave
- Basic scoring system (kills + wave bonuses)
- Health pickups (optional)

### Phase 3: Competition Features 🚧 TODO
- Full scoring system with leaderboard
- Bounty enemy system
- Cocktail powerup spawning
- All 6 cocktail buffs
- Real-time leaderboard display
- MVP screen

## How to Play

### Setup
1. Clone this repository
2. Run a local web server in the project directory:
   ```bash
   npm run dev
   ```
3. Open browser to `http://localhost:8000`

### Controls
- **WASD** - Move player (red crab)
- **Mouse** - Aim
- **Left Click (hold)** - Shoot

### Objective
Survive 10 waves of increasing enemy counts and variety. Enemies deal damage on contact. Defeat all enemies in a wave to progress. Maximize your score by eliminating enemies and completing waves.

### Game Over Conditions
- **Victory:** Complete all 10 waves
- **Defeat:** Player health reaches 0

## Project Structure

```
game/
├── index.html           # Entry point
├── src/
│   ├── main.js         # Game initialization
│   ├── config.js       # Phaser configuration
│   ├── scenes/
│   │   └── GameScene.js    # Main game scene
│   ├── entities/
│   │   ├── Player.js       # Player entity
│   │   ├── Enemy.js        # Enemy entity
│   │   └── Bullet.js       # Bullet entity
│   └── systems/
│       └── WaveManager.js  # Wave spawning system
└── docs/
    └── plans/
        └── 2025-11-12-phase-1-core-loop.md  # This implementation plan
```

## Tech Stack

- **Engine:** Phaser.js 3.80.1 (CDN)
- **Language:** JavaScript ES6 modules
- **Platform:** Browser (HTML5)

## Gameplay Tips (Phase 2)

- **Shrimp** are fast - prioritize them before they swarm you
- **Hermit Crabs** are tanks - use obstacles to kite them
- **Jellyfish** teleport when far away - stay at medium range
- **Flying Fish** swoop from a distance - watch for their approach
- **Lobsters** are the most predictable - use them to manage enemy density
- Health pickups spawn after even waves - plan your positioning

## Known Issues (Phase 2)

- Jellyfish teleport may occasionally clip through obstacles
- Flying fish swoop behavior can get stuck if player moves behind obstacle
- Large enemy counts (wave 10) may cause minor frame drops on slower hardware

## Known Limitations

- Placeholder graphics (colored circles)
- No audio
- Single player only
- Basic collision (circle-based)
- No bounty enemies yet
- No cocktail powerups yet

These features are planned for Phase 3.

## Development

Implementation plans:
- Phase 1: `docs/plans/2025-11-12-phase-1-core-loop.md`
- Phase 2: `docs/plans/2025-11-13-phase-2-enemy-variety.md`

## License

[Your license here]

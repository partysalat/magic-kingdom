# Gisela's Last Stand - Phase 1 Prototype

A twin-stick wave survival shooter featuring Gisela the cowboy crab defending her saloon from bandit lobsters.

## Phase 1 Features

- ✅ Twin-stick movement (WASD)
- ✅ Mouse-aimed shooting
- ✅ Enemy AI (Bandit Lobsters with seek behavior)
- ✅ 3-wave spawning system
- ✅ Health system with game over
- ✅ Basic saloon environment with obstacles
- ✅ Collision detection (bullets, player, obstacles)

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
Survive 3 waves of increasing enemy counts. Enemies deal damage on contact. Defeat all enemies in a wave to progress.

### Game Over Conditions
- **Victory:** Complete all 3 waves
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

## Known Limitations (Phase 1)

- Placeholder graphics (colored circles)
- No audio
- Single player only
- Basic collision (circle-based)
- No scoring system
- No powerups/cocktails
- No bounty enemies

These features are planned for later phases.

## Next Steps (Phase 2)

- Add multiple enemy types (5 total)
- Expand to 10 waves
- Implement difficulty scaling
- Add health pickups
- Improve enemy spawn patterns

## Development

See `docs/plans/2025-11-12-phase-1-core-loop.md` for detailed implementation plan.

## License

[Your license here]

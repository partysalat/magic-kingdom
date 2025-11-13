# Sprite Asset Checklist

Use this checklist to track your art creation progress.

## Priority 1: MVP (Minimum Viable Art)

- [ ] **Gisela Red Idle** - `sprites/player/gisela-red-idle.png` (48x48, 3-4 frames)
- [ ] **Bandit Lobster Idle** - `sprites/enemies/lobster-bandit-idle.png` (64x48, 2 frames)
- [ ] **Bullet** - `sprites/projectiles/bullet.png` (8x8, single image)
- [ ] **Margarita** - `sprites/powerups/cocktail-margarita.png` (24x32, single image)

**Test Milestone:** Replace all circles with sprites, game looks like a game!

---

## Priority 2: Core Variety

- [ ] **Gisela Blue Idle** - `sprites/player/gisela-blue-idle.png` (48x48)
- [ ] **Gisela Green Idle** - `sprites/player/gisela-green-idle.png` (48x48)
- [ ] **Gisela Yellow Idle** - `sprites/player/gisela-yellow-idle.png` (48x48)
- [ ] **Quick-Draw Shrimp Idle** - `sprites/enemies/shrimp-quickdraw-idle.png` (32x32, 2 frames)
- [ ] **Hermit Crab Tank Idle** - `sprites/enemies/hermit-tank-idle.png` (56x56, 2 frames)
- [ ] **Mojito** - `sprites/powerups/cocktail-mojito.png` (24x32)
- [ ] **Old Fashioned** - `sprites/powerups/cocktail-oldfashioned.png` (24x32)
- [ ] **Tequila Sunrise** - `sprites/powerups/cocktail-tequilasunrise.png` (24x32)
- [ ] **Whiskey Sour** - `sprites/powerups/cocktail-whiskeysour.png` (24x32)
- [ ] **Manhattan** - `sprites/powerups/cocktail-manhattan.png` (24x32)
- [ ] **Barrel** - `sprites/environment/barrel.png` (64x64)

**Test Milestone:** All game elements have unique visual identity!

---

## Priority 3: Animation & Polish

- [ ] **Gisela Red Walk** - `sprites/player/gisela-red-walk.png` (48x48, 4 frames)
- [ ] **Gisela Blue Walk** - `sprites/player/gisela-blue-walk.png` (48x48, 4 frames)
- [ ] **Gisela Green Walk** - `sprites/player/gisela-green-walk.png` (48x48, 4 frames)
- [ ] **Gisela Yellow Walk** - `sprites/player/gisela-yellow-walk.png` (48x48, 4 frames)
- [ ] **Bandit Lobster Walk** - `sprites/enemies/lobster-bandit-walk.png` (64x48, 4 frames)
- [ ] **Quick-Draw Shrimp Dash** - `sprites/enemies/shrimp-quickdraw-dash.png` (32x32, 3 frames)
- [ ] **Hermit Tank Walk** - `sprites/enemies/hermit-tank-walk.png` (56x56, 2 frames)
- [ ] **Jellyfish Ghost Float** - `sprites/enemies/jellyfish-ghost-float.png` (48x64, 4 frames)
- [ ] **Flying Fish Fly** - `sprites/enemies/flyingfish-fly.png` (48x32, 3 frames)
- [ ] **Flying Fish Swoop** - `sprites/enemies/flyingfish-swoop.png` (48x32, 4 frames)
- [ ] **Bounty Poster** - `ui/bounty-poster.png` (32x40)

**Test Milestone:** Game feels alive with smooth animations!

---

## Priority 4: Juice & Effects (Optional)

- [ ] **Gisela Death Animation** - `sprites/player/gisela-{color}-death.png` (48x48, 3-4 frames)
- [ ] **Explosion Effect** - `sprites/effects/explosion.png` (32x32, 4-6 frames)
- [ ] **Cocktail Pickup Effect** - `sprites/effects/pickup-sparkle.png` (24x24, 4 frames)
- [ ] **Saloon Doors** - `sprites/environment/saloon-doors.png` (128x96)
- [ ] **Wood Table** - `sprites/environment/table.png` (96x64)
- [ ] **Title Screen Logo** - `ui/title-logo.png` (variable size)
- [ ] **Colored Bullet Trails** - Create variants for cocktail buffs

**Test Milestone:** Game looks professional and polished!

---

## Quick Tips

- Start with Priority 1, get it in-game, then move to Priority 2
- Don't create all Gisela colors at once - make red first, test it, then clone
- Cocktails can share the same glass template, just change liquid color
- Enemy idle animations can be 2 frames (super simple)
- Test sprites in-game frequently - don't make all assets before integrating

---

## File Naming Convention

**Pattern:** `{entity}-{variant}-{animation}.png`

**Examples:**
- `gisela-red-idle.png`
- `gisela-blue-walk.png`
- `lobster-bandit-idle.png`
- `shrimp-quickdraw-dash.png`
- `cocktail-margarita.png` (no animation = just name)

**Why:** Consistent naming makes Phaser preloading easier and prevents confusion
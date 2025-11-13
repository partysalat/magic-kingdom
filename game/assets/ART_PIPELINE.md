# Art Pipeline Guide - Gisela's Last Stand

## Quick Start

1. Open Piskel: https://www.piskelapp.com/
2. Start with Gisela (see Phase 1 below)
3. Export sprites to appropriate folders
4. Update PreloadScene.js to load sprites
5. Update entity classes to use sprites instead of circles

---

## Directory Structure

```
assets/
├── sprites/
│   ├── player/          # Gisela in 4 colors (red, blue, green, yellow)
│   ├── enemies/         # All enemy types
│   ├── projectiles/     # Bullets, effects
│   ├── powerups/        # Cocktails (6 types)
│   └── environment/     # Barrels, doors, decorations
├── ui/                  # UI elements, bounty posters, fonts
└── audio/
    ├── music/          # Background tracks
    └── sfx/            # Sound effects
```

---

## Sprite Specifications

### Player (Gisela)
- **File naming:** `gisela-{color}-{animation}.png`
  - Example: `gisela-red-idle.png`, `gisela-blue-walk.png`
- **Canvas:** 48x48 pixels
- **Crab design:** ~40x40 actual sprite (leave padding)
- **Colors:** Red, Blue, Green, Yellow variants
- **Animations:**
  - `idle`: 3-4 frames, subtle breathing
  - `walk`: 4 frames, crab scuttle motion
  - `death` (optional): 3-4 frames, collapse

**Western Gear:**
- Cowboy hat on top
- Bandana around body
- Maybe tiny boots on some legs (optional detail)

---

### Enemies

#### Bandit Lobster
- **Files:** `lobster-bandit-idle.png`, `lobster-bandit-walk.png`
- **Canvas:** 64x48 pixels
- **Design:**
  - Elongated red/brown lobster body
  - Large claws positioned like holding pistols
  - Small cowboy hat
  - Angry/mean expression
- **Animations:**
  - Idle: 2 frames
  - Walk: 4 frames

#### Quick-Draw Shrimp
- **Files:** `shrimp-quickdraw-idle.png`, `shrimp-quickdraw-dash.png`
- **Canvas:** 32x32 pixels (small and fast)
- **Design:**
  - Pink/orange shrimp
  - Bandana over face (outlaw style)
  - Lean, aggressive posture
  - Small hat or no hat
- **Animations:**
  - Idle: 2 frames
  - Dash: 3 frames with motion blur

#### Hermit Crab Tank
- **Files:** `hermit-tank-idle.png`, `hermit-tank-walk.png`
- **Canvas:** 56x56 pixels (square, bulky)
- **Design:**
  - Large shell (brown/gray)
  - Small crab legs peeking out
  - Sheriff star badge on shell
  - Heavy, armored look
- **Animations:**
  - Idle: 2 frames
  - Walk: 2 frames (slow, heavy)

#### Jellyfish Ghost
- **Files:** `jellyfish-ghost-float.png`, `jellyfish-ghost-teleport.png`
- **Canvas:** 48x64 pixels (vertical)
- **Design:**
  - Translucent jellyfish body (use low opacity or dithering)
  - Ghostly white/blue glow
  - Tattered ghost-cowboy hat floating above
  - Wispy tentacles
- **Animations:**
  - Float: 4 frames, gentle wave motion
  - Teleport: 3 frames, fade in/out

#### Flying Fish
- **Files:** `flyingfish-fly.png`, `flyingfish-swoop.png`
- **Canvas:** 48x32 pixels (horizontal)
- **Design:**
  - Blue/silver fish with wing-fins extended
  - Small aviator goggles or tiny hat
  - Sleek, aerodynamic
- **Animations:**
  - Fly: 3 frames, gliding
  - Swoop: 4 frames, diving attack

---

### Bounty Enemies

Same sprites as above but with visual indicators:
- Use Phaser to add glow/spotlight effect in code
- Create separate bounty poster sprite: `bounty-poster.png` (32x40)
  - "WANTED" text at top
  - Empty frame (will overlay on enemy)

---

### Projectiles

#### Bullet
- **File:** `bullet.png`
- **Canvas:** 8x8 pixels
- **Design:** Simple yellow/orange dot or small bullet shape
- **Note:** May want colored variants for cocktail buffs

---

### Powerups (Cocktails)

All cocktails: **24x32 pixels**

| File | Description | Colors |
|------|-------------|--------|
| `cocktail-margarita.png` | Margarita glass, lime green liquid | Lime green, white salt rim |
| `cocktail-mojito.png` | Highball glass, blue liquid, mint leaves | Light blue, green mint |
| `cocktail-oldfashioned.png` | Rocks glass, orange liquid, cherry | Orange/amber, red cherry |
| `cocktail-tequilasunrise.png` | Tall glass, gradient yellow to red | Yellow→Orange→Red |
| `cocktail-whiskeysour.png` | Coupe glass, golden liquid | Golden yellow, lemon wedge |
| `cocktail-manhattan.png` | Martini glass, red liquid, cherry | Deep red, red cherry |

**Design notes:**
- Keep glass simple and recognizable
- Bold, contrasting colors for visibility
- Small garnish details (mint, cherry, lime)
- Make them look appealing and distinct from distance

---

### Environment

#### Barrel
- **File:** `barrel.png`
- **Canvas:** 64x64 pixels
- **Design:**
  - Brown wooden barrel
  - Horizontal wood grain lines
  - Metal bands around top/bottom
  - Simple 3/4 view or top-down

#### Saloon Doors (Optional)
- **File:** `saloon-doors.png`
- **Canvas:** 128x96 pixels
- **Design:**
  - Classic swinging western doors
  - Wood texture
  - Simple geometric shapes

---

## Piskel Workflow

### Creating a Sprite

1. **Open Piskel** - https://www.piskelapp.com/

2. **Set Canvas Size**
   - Click "Resize" in right panel
   - Enter dimensions (e.g., 48x48)
   - Choose "Anchor center"

3. **Design First Frame**
   - Use Pen tool for outlines (black, 1px)
   - Use Fill tool for colors
   - Keep colors limited (3-5 per sprite)
   - Use high contrast for readability

4. **Create Animation Frames**
   - Click "Duplicate frame" to copy current frame
   - Make small adjustments for motion
   - Preview animation (play button)
   - Adjust timing if needed (default 100ms is good)

5. **Export**
   - Click "Export"
   - Choose "PNG" tab
   - Select "Download spritesheet"
   - Save to appropriate assets folder

### Piskel Tips

- **Pixel-perfect:** Zoom in (400-800%) while drawing
- **Symmetry:** Use the "Vertical mirroring" pen for symmetrical sprites
- **Onion skin:** Enable to see previous frame while animating
- **Layers:** Use layers for complex sprites (body, gear, accessories)
- **Palette:** Define your color palette first, stick to it

---

## Exporting & Integration

### Export Settings (Piskel)

- **Format:** PNG Spritesheet
- **Layout:** Horizontal strip (all frames in one row)
- **Note the details:**
  - Frame width & height
  - Number of frames
  - You'll need these for Phaser

### Example Export

If you export `gisela-red-idle.png` with 3 frames at 48x48:
- Image dimensions: 144x48 (3 frames × 48px wide)
- Frame size: 48x48
- Frames: 3

---

## Integrating into Phaser

### Step 1: Create PreloadScene (if you don't have one)

Create `src/scenes/PreloadScene.js`:

```javascript
export class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        // Load player sprites
        this.load.spritesheet('gisela-red', 'assets/sprites/player/gisela-red-idle.png', {
            frameWidth: 48,
            frameHeight: 48
        });

        // Load enemy sprites
        this.load.spritesheet('lobster-bandit', 'assets/sprites/enemies/lobster-bandit-idle.png', {
            frameWidth: 64,
            frameHeight: 48
        });

        // Load cocktails
        this.load.image('cocktail-margarita', 'assets/sprites/powerups/cocktail-margarita.png');

        // etc...
    }

    create() {
        // Setup animations
        this.anims.create({
            key: 'gisela-idle',
            frames: this.anims.generateFrameNumbers('gisela-red', { start: 0, end: 2 }),
            frameRate: 10,
            repeat: -1
        });

        // Start game scene
        this.scene.start('GameScene');
    }
}
```

### Step 2: Update Your Game Config

In `src/config.js` or `src/main.js`, add PreloadScene:

```javascript
import { PreloadScene } from './scenes/PreloadScene.js';
import { GameScene } from './scenes/GameScene.js';

const config = {
    // ... other config
    scene: [PreloadScene, GameScene]  // PreloadScene first!
};
```

### Step 3: Update Entity Classes

In `src/entities/Player.js`, replace circles with sprites:

```javascript
// OLD: this.sprite = scene.add.circle(x, y, 20, 0xff0000);
// NEW:
this.sprite = scene.add.sprite(x, y, 'gisela-red');
this.sprite.play('gisela-idle');
```

---

## Art Creation Priority

Create assets in this order for fastest playable results:

### Priority 1: Minimum Viable Art (MVP)
1. ✅ Gisela (one color, idle animation)
2. ✅ Bandit Lobster (idle animation)
3. ✅ Bullet sprite
4. ✅ One cocktail (test powerup visuals)

**Goal:** Replace all circles with sprites, game is recognizable

### Priority 2: Core Variety
5. ✅ Gisela (all 4 colors)
6. ✅ Quick-Draw Shrimp
7. ✅ Hermit Crab Tank
8. ✅ All 6 cocktails
9. ✅ Barrel sprite

**Goal:** All enemy types and powerups have unique sprites

### Priority 3: Polish
10. ✅ Jellyfish Ghost
11. ✅ Flying Fish
12. ✅ Walk animations for Gisela
13. ✅ Walk animations for enemies
14. ✅ Death animations
15. ✅ UI elements (bounty posters, fonts)

**Goal:** Game looks polished and animated

### Priority 4: Juice
16. ✅ Visual effects (explosions, impacts, auras)
17. ✅ Environment decorations
18. ✅ Victory/defeat screens
19. ✅ Menu graphics

**Goal:** Game feels professional

---

## Color Palette Recommendations

### Western Theme
- **Wood:** #8B4513, #A0522D, #654321
- **Metal:** #696969, #A9A9A9, #C0C0C0
- **Accents:** #DAA520 (gold), #8B0000 (dark red)

### Gisela Colors
- **Red Gisela:** #DC143C (shell), #8B0000 (dark accents)
- **Blue Gisela:** #4169E1, #000080
- **Green Gisela:** #32CD32, #006400
- **Yellow Gisela:** #FFD700, #DAA520

### Enemies
- **Lobster:** #8B0000, #DC143C
- **Shrimp:** #FFA07A, #FF6347
- **Hermit Crab:** #8B7355, #A0522D
- **Jellyfish:** #E0E0FF, #9370DB (translucent)
- **Flying Fish:** #4682B4, #87CEEB

### Cocktails
- Match the design doc colors

---

## Common Pitfalls

❌ **Making sprites too detailed** - At small sizes, simple shapes read better
❌ **Inconsistent scale** - Keep similar-sized creatures at similar pixel dimensions
❌ **Low contrast** - Sprites need to pop against the brown saloon background
❌ **Forgetting padding** - Leave 2-4px empty space around sprites in canvas
❌ **Too many animation frames** - 2-4 frames is usually enough for pixel art

✅ **Do:** Bold outlines, simple shapes, high contrast, limited colors
✅ **Do:** Test at actual game size (zoom out to 100% in Piskel)
✅ **Do:** Use references (look at other pixel art games)
✅ **Do:** Iterate - your first Gisela doesn't need to be perfect

---

## Resources

- **Piskel:** https://www.piskelapp.com/
- **Lospec Palette List:** https://lospec.com/palette-list (find western-themed color palettes)
- **Pixel Art Tutorials:** https://blog.studiominiboss.com/pixelart
- **Reference Games:**
  - Enter the Gungeon (top-down pixel shooter)
  - Nuclear Throne (simple, readable sprites)
  - Duck Game (party game with clear sprites)

---

## Next Steps

1. **Start with Gisela!** Open Piskel and create your hero
2. **Test in game** - Replace the red circle in Player.js
3. **Iterate** - Get one sprite working before making all variants
4. **Build systematically** - Follow the priority list above

Once you have Gisela working in-game, the rest will follow naturally!

---

**Questions?** Check the main game design doc (`game_idea2.md`) or ask for help!
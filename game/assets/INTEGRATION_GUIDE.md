# Sprite Integration Guide

Once you've created your first sprite (Gisela!), follow these steps to integrate it into your game.

---

## Step 1: Update Game Config

Your game needs to load the PreloadScene before GameScene.

**File:** `src/main.js`

```javascript
import Phaser from 'phaser';
import { PreloadScene } from './scenes/PreloadScene.js';  // ADD THIS
import { GameScene } from './scenes/GameScene.js';

const config = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [PreloadScene, GameScene],  // PRELOAD FIRST!
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(config);
```

---

## Step 2: Enable Sprite in PreloadScene

**File:** `src/scenes/PreloadScene.js`

Uncomment the Gisela red sprite loader:

```javascript
preload() {
    this.createLoadingBar();

    // UNCOMMENT THIS:
    this.load.spritesheet('gisela-red', 'assets/sprites/player/gisela-red-idle.png', {
        frameWidth: 48,
        frameHeight: 48
    });
}

create() {
    // UNCOMMENT THIS:
    this.createPlayerAnimation('gisela-red');

    this.scene.start('GameScene');
}
```

---

## Step 3: Update Player.js to Use Sprites

**File:** `src/entities/Player.js`

Replace the circle creation with sprite:

### Before (using circle):
```javascript
constructor(scene, x, y) {
    this.scene = scene;
    this.sprite = scene.add.circle(x, y, 20, 0xff0000);
    scene.physics.add.existing(this.sprite);
    // ...
}
```

### After (using sprite):
```javascript
constructor(scene, x, y) {
    this.scene = scene;

    // Create sprite instead of circle
    this.sprite = scene.add.sprite(x, y, 'gisela-red');
    this.sprite.play('gisela-red-idle');

    // Scale if needed (optional)
    // this.sprite.setScale(1.0);

    scene.physics.add.existing(this.sprite);

    // Important: Set collision body size to match sprite
    this.sprite.body.setCircle(20); // or use setSize(40, 40) for rectangle

    // Rest of your constructor...
    this.health = 100;
    this.speed = 300;
    this.bullets = [];
    this.lastHitTime = 0;
    this.hitCooldown = 500;
}
```

**Key changes:**
- `scene.add.circle()` → `scene.add.sprite()`
- Added `.play('gisela-red-idle')` to start animation
- Added `setCircle(20)` to keep collision detection working correctly

---

## Step 4: Update Enemy.js to Use Sprites

**File:** `src/entities/Enemy.js`

Similar changes for enemies:

### Before:
```javascript
constructor(scene, x, y) {
    this.scene = scene;
    this.sprite = scene.add.circle(x, y, 15, 0xff0000);
    scene.physics.add.existing(this.sprite);
    // ...
}
```

### After:
```javascript
constructor(scene, x, y, enemyType = 'lobster-bandit') {
    this.scene = scene;
    this.enemyType = enemyType;

    // Create sprite
    this.sprite = scene.add.sprite(x, y, enemyType);
    this.sprite.play(`${enemyType}-idle`);

    scene.physics.add.existing(this.sprite);
    this.sprite.body.setCircle(15); // Adjust size per enemy type

    // Rest of constructor...
    this.health = 30;
    this.speed = 100;
    this.damage = 10;
    this.alive = true;
}
```

---

## Step 5: Update Bullet.js (Optional)

If you created a bullet sprite:

**File:** `src/entities/Bullet.js`

### Before:
```javascript
this.sprite = scene.add.circle(x, y, 4, 0xffff00);
```

### After:
```javascript
this.sprite = scene.add.image(x, y, 'bullet');
this.sprite.setScale(1.0); // Adjust if needed
```

---

## Testing Your Sprites

1. **Start with Gisela only:**
   - Create `gisela-red-idle.png`
   - Uncomment in PreloadScene
   - Update Player.js
   - Test - you should see animated Gisela!

2. **Then add one enemy:**
   - Create `lobster-bandit-idle.png`
   - Uncomment in PreloadScene
   - Update Enemy.js
   - Test - enemies should be lobsters!

3. **Then add more:**
   - Work through the priority checklist
   - Uncomment each sprite as you create it
   - Test frequently

---

## Troubleshooting

### Sprite doesn't appear
- Check browser console for loading errors
- Verify file path matches exactly (case-sensitive!)
- Confirm sprite is in correct folder
- Check that PreloadScene is loading before GameScene

### Sprite appears but doesn't animate
- Make sure you called `.play('animation-name')`
- Verify animation was created in PreloadScene
- Check frameWidth/frameHeight match your exported sprite

### Collision doesn't work
- Remember to call `setCircle()` or `setSize()` on sprite body
- The sprite size might be different from your old circle size
- Adjust collision radius to match visual sprite size

### Sprite is too big/small
- Use `.setScale(0.5)` to make smaller (or 2.0 for bigger)
- Or adjust your sprite canvas size in Piskel and re-export

---

## Size Adjustments

Your current collision sizes:
- Player: 20px radius circle
- Enemy: 15px radius circle
- Bullet: 4px radius circle

With sprites, you might need to adjust:

```javascript
// Player (48x48 sprite, ~40x40 visible)
this.sprite.body.setCircle(20);  // Keep same as before

// Enemy - Bandit Lobster (64x48 sprite)
this.sprite.body.setCircle(25);  // Slightly larger

// Enemy - Shrimp (32x32 sprite)
this.sprite.body.setCircle(12);  // Smaller, fast enemy

// Bullet (8x8 sprite)
this.sprite.body.setCircle(4);   // Keep same
```

---

## Next Steps After First Sprite Works

1. ✅ Get Gisela working
2. ✅ Get one enemy working
3. ✅ Create all 4 Gisela colors
4. ✅ Update Player.js to accept color parameter
5. ✅ Create remaining enemy types
6. ✅ Update Enemy.js to support different types
7. ✅ Add cocktail sprites
8. ✅ Create cocktail pickup system
9. ✅ Polish with more animations

---

## Pro Tips

- **Test early, test often** - Don't create 20 sprites before testing one
- **Keep backup circles** - Comment out circle code, don't delete it yet
- **Use setScale()** - Easier than re-exporting sprites if size is wrong
- **Physics debug mode** - Temporarily enable in config to see collision bodies
- **Console.log** - Add logs in PreloadScene to confirm sprites loaded

---

You're ready to bring Gisela to life! 🦀🤠
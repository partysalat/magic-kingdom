# Piskel Quick Reference

Your cheat sheet for creating sprites efficiently!

## Getting Started

1. Go to https://www.piskelapp.com/
2. Click "Create Sprite" or "Try Piskel" (no account needed!)
3. Set your canvas size first (resize tool in right panel)

---

## Essential Tools (Left Sidebar)

| Tool | Shortcut | Use For |
|------|----------|---------|
| Pen | `P` | Drawing outlines, pixel-by-pixel work |
| Fill | `B` | Filling areas with color |
| Eraser | `E` | Removing pixels |
| Stroke | `L` | Drawing straight lines |
| Rectangle | `R` | Drawing rectangles (hold Shift = square) |
| Circle | `C` | Drawing circles/ovals (hold Shift = perfect circle) |
| Move | `M` | Moving entire frame content |
| Selection | `S` | Selecting and moving specific areas |

---

## Canvas Setup

### Resize Canvas
1. Click "Resize" (right panel, above frame list)
2. Enter dimensions (48x48 for Gisela, etc.)
3. **Choose "Anchor: Center"** - keeps sprite centered when resizing
4. Click "Resize"

### Set Background
- Click the checkerboard icon (top right) for transparent background
- Click the color square to set a temporary background color (helps see sprite)

---

## Drawing Tips

### Starting a New Sprite
1. **Outline first** - Use Pen tool with black (or dark color)
2. **Fill areas** - Use Fill tool for large color areas
3. **Add details** - Switch back to Pen for small details
4. **Refine** - Zoom in (200-800%) for pixel-perfect work

### Using the Pen Tool
- **Left click** - Draw with primary color (left color box)
- **Right click** - Draw with secondary color (right color box)
- **Click color box** - Opens color picker

### Symmetry Tool
- Click pen icon dropdown → "Vertical mirroring pen"
- Perfect for symmetrical sprites (like Gisela looking straight ahead)
- Anything you draw on left appears on right automatically

### Color Palette
- Bottom of screen shows your current colors
- Click `+ Add color` to build your palette
- Click any color to make it active
- Right-click color to delete from palette

---

## Animation

### Frame Management
- **Duplicate frame** - Copies current frame (bottom right, copy icon)
- **Add frame** - Creates blank frame (bottom right, + icon)
- **Delete frame** - Removes current frame (trash icon)
- **Reorder** - Drag frames in the timeline

### Animation Workflow
1. Draw first frame (key pose)
2. Duplicate it
3. Make small changes on frame 2
4. Duplicate frame 2
5. Make more changes on frame 3
6. Repeat until animation complete

### Preview Animation
- Click **Play** button (bottom center)
- Adjust FPS if needed (default 12 is usually good)
- For idle animations: 6-10 FPS
- For action animations: 12-15 FPS

### Onion Skin
- Click **onion** icon (bottom right)
- Shows previous frame in transparent overlay
- Super helpful for smooth animations
- Adjust opacity with slider

---

## Helpful Features

### Layers
- Click **layers** tab (right panel)
- Add new layer for complex sprites
- Example: Body on layer 1, hat on layer 2
- Merge layers when done (right-click layer)

### Grid
- Click **grid** icon (top bar)
- Helps align pixels
- Useful for consistent proportions

### Transform
- **Flip Horizontal** - Mirror sprite left/right
- **Flip Vertical** - Flip sprite upside down
- **Rotate 90°** - Quarter turn rotations
- Found in Edit menu (top left)

### Undo/Redo
- **Ctrl+Z** (Windows) or **Cmd+Z** (Mac) - Undo
- **Ctrl+Shift+Z** or **Cmd+Shift+Z** - Redo
- Piskel saves lots of history!

---

## Exporting

### For Phaser (Spritesheet)
1. Click **Export** (top right)
2. Go to **PNG** tab
3. Select **Download spritesheet**
4. Choose **horizontal strip** layout
5. Click **Download**
6. Save to appropriate assets folder

### Export Settings
- **Scale:** Usually keep at 1x (export actual size)
- **PNG** is always correct format
- **Spritesheet** for animations (multiple frames)
- **Single PNG** for static images (1 frame)

### What to Note
When you export, remember:
- Frame count (you'll need this for Phaser)
- Frame size (width × height)
- Example: 3 frames at 48×48 = image will be 144×48

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Undo | `Ctrl+Z` / `Cmd+Z` |
| Redo | `Ctrl+Shift+Z` / `Cmd+Shift+Z` |
| Pen tool | `P` |
| Fill tool | `B` |
| Eraser | `E` |
| Move tool | `M` |
| Line tool | `L` |
| Rectangle | `R` |
| Circle | `C` |
| Selection | `S` |
| Zoom in | `+` |
| Zoom out | `-` |
| Play animation | `Spacebar` |

---

## Pro Workflow for Gisela

### Step-by-Step: Creating Gisela Idle

1. **Setup**
   - Canvas: 48×48
   - Zoom: 400%
   - Grid: On (optional)

2. **Frame 1: Base Pose**
   - Draw black outline: round crab body (~30×30)
   - Add 8 legs (4 per side, simple lines)
   - Add 2 claws (small circles at front)
   - Add cowboy hat on top (simple brown shape)
   - Add bandana (triangle below "head")
   - Fill with colors

3. **Frame 2: Breathing Up**
   - Duplicate frame 1
   - Move body up 1-2 pixels
   - Slightly adjust legs

4. **Frame 3: Breathing Down**
   - Duplicate frame 1
   - Move body down 1 pixel (or just use frame 1 again)

5. **Preview**
   - Play animation
   - Adjust timing (FPS: 8-10 for gentle breathing)

6. **Export**
   - Export → PNG → Spritesheet
   - Save as `gisela-red-idle.png`
   - Remember: 3 frames, 48×48 each

---

## Common Mistakes

❌ **Canvas too small** - Make sure you set size BEFORE drawing
❌ **Forgetting to duplicate** - Always duplicate before editing frame
❌ **Too many colors** - Keep palette limited (3-5 colors per sprite)
❌ **No outlines** - Dark outlines make sprites readable
❌ **Exporting as GIF** - Use PNG spritesheet for Phaser
❌ **Wrong layout** - Use horizontal strip, not grid

---

## Color Palette Presets

Copy these hex codes into Piskel for quick western theme:

### Gisela Red
```
#DC143C (red shell)
#8B0000 (dark red)
#8B4513 (brown hat)
#000000 (black outline)
#FFD700 (gold star badge)
```

### Gisela Blue
```
#4169E1 (blue shell)
#000080 (navy)
#8B4513 (brown hat)
#000000 (black outline)
#FFD700 (gold)
```

### Bandit Lobster
```
#8B0000 (dark red body)
#DC143C (bright red)
#654321 (brown hat)
#000000 (black outline)
#C0C0C0 (silver gun metal)
```

### Cocktails - Margarita
```
#98FB98 (pale green liquid)
#32CD32 (lime green)
#FFFFFF (white salt)
#87CEEB (light blue glass)
#228B22 (lime)
```

---

## Saving Your Work

**Important:** Piskel is browser-based!

### Save to Your Computer
1. Click **Save** (top right)
2. Choose **Download .piskel file**
3. Save to your project folder (e.g., `game/art-source/gisela-red.piskel`)
4. You can reload this later to make changes

### Load Saved Work
1. Click **Open** (top right)
2. Choose **Upload .piskel file**
3. Select your saved .piskel file
4. Continue editing

**Pro tip:** Keep your .piskel source files separate from exported PNGs!

---

## Performance Tips

- **Work at actual size** (48×48) not larger
- **Use limited colors** (faster to fill, easier to modify)
- **Test in-game frequently** (what looks good at 800% zoom might not work at 100%)
- **Keep animations short** (2-4 frames for most things)
- **Duplicate efficiently** (clone working frame rather than redraw)

---

## Resources

- **Piskel:** https://www.piskelapp.com/
- **Piskel Docs:** https://www.piskelapp.com/doc
- **Video Tutorial:** Search "Piskel tutorial" on YouTube
- **Color Picker:** Use the built-in picker or https://coolors.co/ for palettes

---

## Quick Start Checklist

- [ ] Open Piskel
- [ ] Set canvas size (48×48 for Gisela)
- [ ] Choose color palette (3-5 colors)
- [ ] Draw frame 1 (outline → fill → details)
- [ ] Duplicate and animate (2-3 more frames)
- [ ] Preview animation
- [ ] Export as PNG spritesheet
- [ ] Save .piskel source file
- [ ] Integrate into game!

---

**You're ready to create! Start with Gisela and have fun! 🦀🎨**
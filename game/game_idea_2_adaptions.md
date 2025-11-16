# Gisela's Last Stand - Control & Visual Adaptations

**Date:** 2025-11-15
**Status:** Design Complete - Ready for Implementation
**Purpose:** Document changes to control scheme and visual style for existing game

---

## Overview of Changes

This document outlines adaptations to the existing Gisela's Last Stand implementation to:
1. Replace twin-stick shooter controls with gamepad-friendly auto-aim system
2. Shift visual style to top-down perspective with RimWorld-inspired presentation
3. Maintain all core gameplay systems (waves, cocktails, scoring, bounties)

---

## Control Scheme Redesign

### From Twin-Stick to Auto-Aim with Influence

**Problem:** Twin-stick controls don't align with desired gamepad experience
**Solution:** Smart auto-aim system with player influence and bounty targeting

### New Control Scheme

#### Gamepad Controls
```
Left Stick:        Character movement (8-directional)
Right Trigger:     Hold to fire at auto-targeted enemy
Right Stick:       Aim influence - nudge targeting priority toward a direction
L1 / R1:          Snap-lock to next/previous active bounty target
```

#### Keyboard + Mouse Controls
```
WASD:             Character movement
Left Mouse:       Hold to fire at auto-targeted enemy
Mouse Position:   Aim influence - cursor position influences target priority
Q / E (or Tab):   Cycle through active bounty targets
```

### Auto-Aim Logic

**Target Selection Priority:**
1. **Locked bounty target** (if player used L1/R1 to snap-lock)
2. **Influenced target** (nearest enemy in the direction of right stick/mouse)
3. **Nearest enemy** (default fallback)

**Implementation Details:**
- Auto-aim searches within a reasonable range (e.g., 400-600 pixels)
- Aim influence creates a cone/sector in the indicated direction
- Enemies within influenced sector get priority boost
- Lock-on shows clear visual indicator (reticle, highlight, line to target)
- Lock automatically releases when bounty dies
- Smooth target transition (slight lerp/easing, not instant snapping)

**Design Goals:**
- Simple enough for casual bar players (just move + hold trigger)
- Deep enough for competitive play (influence aiming + bounty locking)
- Preserves bounty hunting competition (race to lock high-value targets)
- Works seamlessly with cocktail buffs

---

## Visual Style Redesign

### From Side-View Pixel Art to Top-Down Detailed Sprites

**Previous Style:**
- Side/angled view pixel art
- Cartoony crustacean characters
- Traditional twin-stick shooter presentation

**New Style:**
- **Perspective:** Top-down (similar to RimWorld, Hotline Miami)
- **Character Scale:** RimWorld-inspired sizing (characters visible but arena takes priority)
- **Art Style:** Stylized but detailed, comic-like rendering
- **Detail Level:** More texture and definition than simple pixel art, but still illustrative
- **Theme:** Wild west saloon with integrated beach/ocean elements

### Theme Integration: Stylized Wild West Beach

**Option Selected:** Stylized But Detailed

**Character Design:**
- Anthropomorphic crabs with clear personality and detail
- Cowboy hats, bandanas, western accessories with visible texture
- Shell patterns and natural details (but not photorealistic)
- Four distinct player colors (red, blue, green, yellow) via accessories
- Enemy sea creatures in outlaw gear (lobsters, shrimp, hermit crabs, jellyfish, flying fish)

**Environment Design:**
- Classic saloon architecture (wooden floors, bar, tables)
- Ocean integration: coral growing on posts, seaweed curtains, sand on floor, water visible at edges
- Weathered wood with texture detail
- Driftwood furniture, nets, nautical decorations
- Comic-like shading and outlines for visual clarity

**Technical Approach:**
- Assets generated via LLMs (Stable Diffusion, DALL-E, Midjourney, etc.)
- Consistent style maintained through prompt engineering
- Iterative generation as needed
- Sprite sizes scaled appropriately for RimWorld-like presentation

### Player Identification (Spectator-Friendly)

**Current Approach (Keep for Now):**
- Colored crab bodies (red, blue, green, yellow)
- Colored auras when cocktail buffs active
- UI indicators above players

**Future Refinements (If Needed):**
- Prominent colored bandanas/scarves
- Colored particle trails when moving
- Larger/clearer UI nameplates

---

## Gameplay Adjustments

### Enemy Behavior Changes

**Flying Fish Redesign:**
- **Old:** Swoop attacks "from above" (doesn't work in top-down)
- **New:** Fast-moving aerial units that dart across the arena
- **Behavior:** Quick dashes toward players, harder to track and hit
- **Visual:** Clear "shadow" or outline showing they're airborne

**Other Enemies:**
- **Bandit Lobsters:** Minimal changes, work fine top-down
- **Quick-Draw Shrimp:** Dart behavior still works
- **Hermit Crab Tanks:** Slow advance, works perfectly
- **Jellyfish Ghosts:** Teleporting translates well to top-down

### Cocktail Buffs (No Changes Needed)

All cocktail effects work with auto-aim system:

| Cocktail | Effect | Auto-Aim Compatibility |
|----------|--------|------------------------|
| **Margarita** | Spread Shot | Auto-targets multiple enemies in arc |
| **Mojito** | Rapid Fire | Faster auto-target acquisition |
| **Old Fashioned** | Heavy Hitter | Stronger shots at auto-target |
| **Tequila Sunrise** | Damage Ramp | Ramping damage to auto-targets |
| **Whiskey Sour** | Piercing | Bullet passes through first target to next |
| **Manhattan** | Critical Hits | 50% crit chance on auto-attacks |

Visual feedback (colored auras, particle effects) remains the same.

### Core Systems (No Changes)

**Keep As-Is:**
- Wave structure (10 waves, progressive difficulty)
- Bounty enemy system (Wanted targets with high point values)
- Cocktail spawn system (3 cocktails between waves, competitive scramble)
- Scoring system (kills, bounties, survival bonuses)
- MVP determination and ceremony
- Health system (individual health bars, last crab standing)
- Leaderboard display

---

## Technical Implementation Strategy

### What to Keep
- Wave spawning and progression logic
- Enemy AI pathfinding (may need minor tweaks for top-down)
- Scoring and leaderboard systems
- Cocktail buff timing and effect application
- Health and damage systems
- UI/HUD elements (may need repositioning)

### What to Rebuild/Refactor
- **Input system:** Complete overhaul for auto-aim
- **Aiming/shooting logic:** New target selection with influence system
- **Camera system:** Top-down view instead of side-view
- **Rendering layer:** Sprites and environment for new perspective
- **Asset pipeline:** Integration of LLM-generated graphics

### Development Approach

**Phase 1: Control System Prototype**
- Implement auto-aim targeting logic
- Add aim influence system (stick/mouse)
- Implement bounty snap-lock (L1/R1, Q/E)
- Test with placeholder graphics
- Verify gamepad + keyboard controls feel good

**Phase 2: Visual Transition**
- Generate initial sprite set (1 player character, 1 enemy type)
- Build top-down rendering pipeline
- Test scale and readability
- Iterate on art style via LLM prompts

**Phase 3: Full Asset Replacement**
- Generate all player characters (4 colors)
- Generate all enemy types (5 types + bounty variants)
- Generate environment tileset and props
- Generate cocktail sprites
- Generate UI elements (bounty posters, HUD)

**Phase 4: Enemy Behavior Updates**
- Adjust Flying Fish behavior for top-down
- Tune enemy spawn positions for new perspective
- Verify all enemy types feel distinct

**Phase 5: Polish & Testing**
- Visual effects (bullet trails, explosions, auras) for top-down
- Camera shake and screen effects
- Spectator readability testing
- Multiplayer controller testing (4 gamepads)
- Balance tuning

---

## Art Generation Guidelines

### LLM Prompt Strategy

**Character Sprites:**
```
"Top-down view sprite of [COLOR] cartoon crab wearing cowboy hat and bandana,
stylized but detailed comic book art style, wild west beach theme,
cel-shaded, clear outlines, [SIZE] resolution"
```

**Enemy Sprites:**
```
"Top-down view sprite of [CREATURE] sea creature dressed as western outlaw,
comic book style with detailed textures, anthropomorphic but natural features,
clear silhouette, [SIZE] resolution"
```

**Environment Assets:**
```
"Top-down view of western saloon interior with beach/ocean theme,
wooden floor with sand, coral decorations, comic book style with texture detail,
modular tileset piece, [SIZE] resolution"
```

**Consistency Tips:**
- Maintain same style descriptor across all prompts
- Generate in batches with similar seeds
- Use reference images from early generations
- Iterate based on what works

---

## Success Criteria

### Controls Must:
- ✅ Feel responsive and intuitive with gamepad
- ✅ Allow skilled players to influence targeting meaningfully
- ✅ Make bounty hunting competitive and exciting
- ✅ Support 4 simultaneous gamepad players without confusion
- ✅ Work equally well with keyboard + mouse

### Visuals Must:
- ✅ Clearly show all 4 players at once
- ✅ Be readable from 6-10 feet away (spectator distance)
- ✅ Maintain wild west beach theme cohesively
- ✅ Look polished and comic-book quality
- ✅ Distinguish enemy types at a glance

### Gameplay Must:
- ✅ Preserve the fun of the original design
- ✅ Maintain competition and cooperation balance
- ✅ Keep 5-10 minute session length
- ✅ Feel arcade-quality and bar-appropriate

---

## Open Questions

### To Be Determined During Implementation:
- Exact character sprite size (64x64? 96x96? 128x128?)
- Auto-aim search radius and influence cone angle
- Transition smoothness between targets (easing duration)
- Bounty lock-on visual indicator design
- Camera zoom level for optimal arena view
- Specific LLM tool/workflow (Stable Diffusion? DALL-E 3?)

### Testing Priorities:
- Does auto-aim feel good? Too easy? Too restrictive?
- Are 4 players distinguishable in chaotic moments?
- Do spectators understand what's happening?
- Does the art style look cohesive across all assets?

---

## Design Pillars (Unchanged)

When making implementation decisions, prioritize:

1. **Spectator Appeal** - Is this exciting to watch?
2. **Coopetition Balance** - Does it encourage teamwork AND competition?
3. **Bar Context** - Does this work in a loud, social environment?
4. **Readability** - Can you understand what's happening at a glance?
5. **Theme Integration** - Does this reinforce the crustacean western vibe?

---

**Next Steps:**
1. Review and approve this adaptation plan
2. Create detailed implementation plan for Phase 1 (Control System)
3. Begin prototyping auto-aim with placeholder graphics
4. Test control scheme with multiple controllers
5. Generate initial art assets and validate style

---

**Document Version:** 1.0
**Last Updated:** 2025-11-15
**Status:** Design Complete - Ready for Implementation
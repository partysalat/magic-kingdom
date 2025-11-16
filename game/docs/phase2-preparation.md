# Phase 2 Preparation Notes

## Phase 1 Complete

Control system successfully converted from twin-stick to auto-aim:
- InputManager handles gamepad + keyboard/mouse
- TargetSelector implements 3-tier priority system
- Player shooting refactored for target-based aiming
- Visual indicators show target selection
- UI adapts to input mode

## Ready for Phase 2: Visual Transition to Top-Down

Phase 1 assets can be reused:
- InputManager (no changes needed)
- TargetSelector (no changes needed)
- All gameplay logic (waves, buffs, scoring)

Phase 2 will need:
- Camera angle change to top-down
- Sprite replacements (all entities)
- Environment art (saloon with beach theme)
- Adjust Enemy.updateSwoop() behavior for Flying Fish
- Update visual indicators for top-down perspective

## Known Parameters (From Testing)

- Auto-aim range: 500 pixels
- Influence cone angle: 60 degrees (Math.PI / 3)
- Target transition smoothness: Instant (no lerp currently)

# Cocktail System Redesign - Manual Activation & Inventory

## Overview
This document describes the revised cocktail system that shifts from automatic activation on pickup to a manual activation system with single-slot inventory. This change adds strategic depth through risk management and timing decisions.

---

## Core Mechanics

### Inventory System
- **Capacity:** Single slot per player
- **Behavior:** New cocktail pickup overwrites current stored cocktail
- **Persistence:** Cocktails persist across rounds until manually activated
- **No Penalties:** No movement or combat penalties for holding a cocktail

### Activation Controls
- **Keyboard:** R key
- **Gamepad:** Left Bumper (LB/L1)
  - Natural position for quick access during combat
  - Non-intrusive button that doesn't interfere with twin-stick controls

### Activation Rules
- **Limitation:** Only one active buff at a time
- **Timing:** Can be activated anytime during combat or between waves
- **Consumption:** Cocktail is consumed from inventory upon activation
- **Duration:** Same as original design (15-20 seconds depending on cocktail type)
- **Immediate Effect:** Buff applies instantly when activated

---

## Visual Feedback

### Stored Cocktail (Inactive)
**Player Indicators:**
- Subtle glow/shimmer effect around player character
- Small bubble icon floating above player head showing cocktail type
- HUD icon next to health bar displaying stored cocktail

**Spectator Clarity:**
- Icon should be visible from distance
- Distinct from active buff visuals
- Color-coded to cocktail type

### Active Cocktail
**Player Indicators:**
- Full colored aura matching cocktail type (existing design)
- Larger HUD icon with duration timer countdown
- Visual effect trails on bullets (existing design)
- Enhanced glow effect

**Distinction:**
- Clear visual difference between "stored" and "active" states
- Spectators can instantly see who has cocktails ready vs. who's buffed

---

## Gameplay Flow Changes

### Between Waves (Cocktail Phase)
**Spawn Behavior:**
- 3 cocktails spawn at different saloon locations (unchanged)
- Players can grab cocktails even if inventory slot is occupied
- New cocktail automatically replaces stored cocktail

**Strategic Decisions:**
1. **Keep or Swap:** "Do I keep my Old Fashioned or grab this Mojito?"
2. **Positioning:** Race to preferred cocktail vs. convenience
3. **Hoarding:** Save for tougher waves vs. use immediately

**Reduced Scramble Pressure:**
- Less frantic than original "use it or lose it" system
- Adds deliberate decision-making layer
- Still competitive (only 3 cocktails for potentially 4 players)

### During Combat
**Activation Moments:**
- Press R (keyboard) or LB (gamepad) to activate
- Immediate buff application with full duration
- Inventory slot becomes empty
- Can collect new cocktail in next between-wave phase

**Clutch Opportunities:**
- "Emergency button" feel during overwhelming waves
- Coordinated team activations for synchronized pushes
- High-tension decision: "Use now or save for later?"

---

## Strategic Depth

### Early Game (Waves 1-3)
- **Incentive to Save:** Waves are easier, cocktails less necessary
- **Strategic Hoarding:** "I'll keep this Whiskey Sour for Wave 5"
- **Risk Assessment:** Do I use it now to secure more kills for points?

### Mid Game (Waves 4-7)
- **Activation Timing:** When is the optimal moment to pop the buff?
- **Swap Decisions:** More complex risk/reward on cocktail replacement
- **Team Coordination:** "I've got Mojito ready for the big push"

### Late Game (Waves 8-10)
- **Survival Priority:** Cocktails become critical for survival
- **Clutch Plays:** Last player standing uses stored cocktail to complete wave
- **Spectator Drama:** Audience can see who has emergency buffs ready

### Competitive Dynamics
- **Point Competition:** Save strong DPS buffs (Mojito, Manhattan) for bounty enemies
- **Team Communication:** "Don't activate yet, wait for the bounty spawn"
- **Swap Mind Games:** Grab cocktail another player was running toward

---

## Implementation Changes

### 1. Player Data Structure
```javascript
// Add to player object
storedCocktail: null,  // { type: 'mojito', name: 'Mojito', effect: {...} }
activeCocktail: null,  // Current active buff with timer
```

### 2. Pickup Behavior Modification
**Old System:**
- Collision with cocktail → Immediate activation → Buff applied

**New System:**
- Collision with cocktail → Store in inventory → Replace if slot full
- No immediate buff application
- Visual feedback shows cocktail stored

### 3. Activation Input Binding
**Keyboard:**
- Add 'R' key listener
- Check if player has stored cocktail
- Apply buff if available

**Gamepad:**
- Bind to Left Bumper (button index varies by controller)
- Same logic as keyboard

### 4. Visual Indicator System
**Stored Cocktail:**
- Add small sprite/icon above player (offset Y: -40px)
- Add subtle particle emitter for glow effect
- Update HUD element next to health bar

**Active Cocktail:**
- Existing aura system (no changes)
- Add duration timer overlay to HUD icon
- Enhance particle effects

### 5. Between-Wave Logic Updates
**Spawn Phase:**
- Keep existing cocktail spawn locations/logic
- Modify pickup to allow replacement

**UI Updates:**
- Show "SWAP" indicator when player with full inventory approaches cocktail
- Brief text notification: "Replaced [Old] with [New]"

### 6. HUD Modifications
**New Elements:**
- Stored cocktail icon slot (small, next to health)
- Active cocktail icon with timer (larger, more prominent)
- Visual differentiation between states

---

## Design Rationale

### Why Manual Activation?
1. **Player Agency:** Players control when they get powerful, not random timing
2. **Strategic Depth:** Adds risk/reward decision layer
3. **Clutch Moments:** Creates dramatic "hero plays" for spectators
4. **Reduced Waste:** No more "I grabbed it at the end of the wave" waste

### Why Single Slot?
1. **Simplicity:** Easy to understand and explain
2. **Meaningful Choices:** Every cocktail pickup is a decision
3. **No Hoarding:** Prevents excessive stockpiling
4. **Maintains Competition:** Still incentive to grab good cocktails first

### Why Persistence Across Rounds?
1. **Long-Term Planning:** "I'm saving this for Wave 8"
2. **Comeback Mechanics:** Struggling players can save buffs for critical moments
3. **Spectator Tension:** Audience knows who has secret weapons ready
4. **Reduces Pressure:** Don't have to use immediately or lose it

---

## Balancing Considerations

### Potential Issues
1. **Over-Saving:** Players might hoard too conservatively
   - **Solution:** Ensure later waves are difficult enough to force usage

2. **Activation Confusion:** Players forget they have cocktail stored
   - **Solution:** Strong visual feedback, tutorial prompts

3. **Button Accessibility:** R key or LB might conflict with other actions
   - **Solution:** Allow key remapping, ensure LB isn't used elsewhere

4. **Reduced Scramble Energy:** Less frenetic between-wave competition
   - **Solution:** Keep spawn positions spread out, maintain swap decisions

### Tuning Parameters
- Cocktail spawn count per wave (currently 3)
- Duration timers (currently 15-20 sec)
- Visual indicator prominence
- Swap notification duration

---

## Testing Priorities

### Core Functionality
- [ ] Cocktail pickup stores instead of activates
- [ ] R key / LB button triggers activation correctly
- [ ] Inventory slot properly replaces on new pickup
- [ ] Buffs apply with correct duration on activation

### Visual Feedback
- [ ] Stored cocktail icon visible and clear
- [ ] Active cocktail aura distinct from stored state
- [ ] HUD elements readable from typical playing distance
- [ ] Spectator can identify who has cocktails ready

### Balance
- [ ] Players use cocktails at appropriate timing (not over-hoarding)
- [ ] Strategic depth feels rewarding, not overwhelming
- [ ] Competitive element maintained despite reduced scramble
- [ ] Clutch activation moments create exciting plays

### Edge Cases
- [ ] Picking up cocktail while one is active (should store new one)
- [ ] Activating during active buff (should queue or block)
- [ ] Multiple players activating simultaneously
- [ ] Player death with stored cocktail (lost or persistent?)

---

## Success Metrics

The revised cocktail system succeeds if:
- ✅ Players regularly make activation timing decisions
- ✅ Stored cocktails create visible tension for spectators
- ✅ "Clutch activation" moments generate excitement
- ✅ Strategic depth feels natural, not complex
- ✅ Tutorial/onboarding clearly explains new system
- ✅ Competitive element remains engaging
- ✅ Controls feel responsive and intuitive

---

## Future Considerations

### Potential Expansions
- **Cocktail Stacking:** Allow 2-3 slots (increases complexity)
- **Combo Effects:** Activating multiple stored cocktails in sequence
- **Cooldowns:** Add cooldown after activation before collecting new one
- **Shared Pool:** Team cocktail bank that anyone can access
- **Charges:** Some cocktails could have multiple uses

### Alternative Activation Mechanics
- **Auto-Activation Triggers:** Activate automatically when health drops below threshold
- **Charging System:** Hold button to "sip" cocktail for longer but weaker effect
- **Throwable Buffs:** Share stored cocktail with teammate by throwing

---

**Document Version:** 1.0
**Last Updated:** 2025-11-17
**Status:** Design Complete - Ready for Implementation
**Related Documents:** game_idea2.md (base design)

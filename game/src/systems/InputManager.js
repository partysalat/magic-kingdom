export class InputManager {
    constructor(scene, playerIndex = 0) {
        this.scene = scene;
        this.playerIndex = playerIndex;

        // Input state
        this.movement = { x: 0, y: 0 };
        this.aimInfluence = { x: 0, y: 0 };
        this.isFiring = false;
        this.cycleTargetNext = false;
        this.cycleTargetPrev = false;
        this.activateCocktail = false;  // New flag

        // Input mode (auto-detected)
        this.inputMode = 'keyboard'; // 'keyboard' or 'gamepad'

        // Button edge detection
        this.lastL1 = false;
        this.lastR1 = false;
        this.lastXButton = false;  // For cocktail activation (X button)

        this.setupKeyboard();
        this.setupGamepad();
    }

    setupKeyboard() {
        // WASD movement
        this.keys = this.scene.input.keyboard.addKeys({
            W: Phaser.Input.Keyboard.KeyCodes.W,
            A: Phaser.Input.Keyboard.KeyCodes.A,
            S: Phaser.Input.Keyboard.KeyCodes.S,
            D: Phaser.Input.Keyboard.KeyCodes.D,
            Q: Phaser.Input.Keyboard.KeyCodes.Q,
            E: Phaser.Input.Keyboard.KeyCodes.E,
            R: Phaser.Input.Keyboard.KeyCodes.R  // Cocktail activation
        });

        // Mouse firing
        this.scene.input.on('pointerdown', () => {
            this.isFiring = true;
            this.inputMode = 'keyboard';
        });

        this.scene.input.on('pointerup', () => {
            this.isFiring = false;
        });
    }

    setupGamepad() {
        // Gamepad setup happens in update when pad is detected
        this.gamepad = null;
    }

    update() {
        // Try to get gamepad
        if (!this.gamepad && this.scene.input.gamepad) {
            const pads = this.scene.input.gamepad.gamepads;
            if (pads[this.playerIndex]) {
                this.gamepad = pads[this.playerIndex];
            }
        }

        // Reset cycle flags each frame
        this.cycleTargetNext = false;
        this.cycleTargetPrev = false;
        this.activateCocktail = false;  // Reset activation flag

        if (this.gamepad && this.gamepad.connected) {
            this.updateGamepad();
        } else {
            this.updateKeyboard();
        }
    }

    updateKeyboard() {
        // Movement from WASD
        this.movement.x = 0;
        this.movement.y = 0;

        if (this.keys.W.isDown) {
            this.movement.y = -1;
            this.inputMode = 'keyboard';
        }
        if (this.keys.S.isDown) {
            this.movement.y = 1;
            this.inputMode = 'keyboard';
        }
        if (this.keys.A.isDown) {
            this.movement.x = -1;
            this.inputMode = 'keyboard';
        }
        if (this.keys.D.isDown) {
            this.movement.x = 1;
            this.inputMode = 'keyboard';
        }

        // Aim influence from mouse position
        const pointer = this.scene.input.activePointer;
        this.aimInfluence.x = pointer.worldX;
        this.aimInfluence.y = pointer.worldY;

        // Target cycling with Q/E
        if (Phaser.Input.Keyboard.JustDown(this.keys.Q)) {
            this.cycleTargetPrev = true;
            this.inputMode = 'keyboard';
        }
        if (Phaser.Input.Keyboard.JustDown(this.keys.E)) {
            this.cycleTargetNext = true;
            this.inputMode = 'keyboard';
        }

        // Cocktail activation with R
        if (Phaser.Input.Keyboard.JustDown(this.keys.R)) {
            this.activateCocktail = true;
            this.inputMode = 'keyboard';
        }
    }

    updateGamepad() {
        this.inputMode = 'gamepad';

        // Left stick for movement (axis 0 = X, axis 1 = Y)
        const leftStickX = this.gamepad.axes.length > 0 ? this.gamepad.axes[0].value : 0;
        const leftStickY = this.gamepad.axes.length > 1 ? this.gamepad.axes[1].value : 0;
        this.movement.x = Math.abs(leftStickX) > 0.1 ? leftStickX : 0;
        this.movement.y = Math.abs(leftStickY) > 0.1 ? leftStickY : 0;

        // Right stick for aim influence (axis 2 = X, axis 3 = Y)
        const rightStickX = this.gamepad.axes.length > 2 ? this.gamepad.axes[2].value : 0;
        const rightStickY = this.gamepad.axes.length > 3 ? this.gamepad.axes[3].value : 0;
        this.aimInfluence.x = Math.abs(rightStickX) > 0.1 ? rightStickX : 0;
        this.aimInfluence.y = Math.abs(rightStickY) > 0.1 ? rightStickY : 0;

        // Right trigger (R2) for firing - button 1 on most controllers
        this.isFiring = this.gamepad.buttons[2] ? this.gamepad.buttons[2].pressed : false;

        // L1 (button 4) and R1 (button 5) for target cycling
        const L1 = this.gamepad.buttons[4] ? this.gamepad.buttons[4].pressed : false;
        const R1 = this.gamepad.buttons[5] ? this.gamepad.buttons[5].pressed : false;

        if (L1 && !this.lastL1) {
            this.cycleTargetPrev = true;
        }
        if (R1 && !this.lastR1) {
            this.cycleTargetNext = true;
        }

        // X button (button 2) for cocktail activation
        const XButton = this.gamepad.buttons[1] ? this.gamepad.buttons[1].pressed : false;
        if (XButton && !this.lastXButton) {
            this.activateCocktail = true;
        }

        this.lastL1 = L1;
        this.lastR1 = R1;
        this.lastXButton = XButton;
    }

    getMovement() {
        return this.movement;
    }

    getAimInfluence() {
        return this.aimInfluence;
    }

    getInputMode() {
        return this.inputMode;
    }

    isFiringPressed() {
        return this.isFiring;
    }

    shouldCycleTargetNext() {
        return this.cycleTargetNext;
    }

    shouldCycleTargetPrev() {
        return this.cycleTargetPrev;
    }

    shouldActivateCocktail() {
        return this.activateCocktail;
    }

    getInputState() {
        return {
            movement: {
                up: this.movement.y < -0.1,
                down: this.movement.y > 0.1,
                left: this.movement.x < -0.1,
                right: this.movement.x > 0.1
            },
            isFiring: this.isFiring
        };
    }

    destroy() {
        // Remove event listeners to prevent memory leaks
        this.scene.input.off('pointerdown');
        this.scene.input.off('pointerup');
    }
}
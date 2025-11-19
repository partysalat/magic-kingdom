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

        // Left stick for movement
        const leftStick = this.gamepad.leftStick;
        this.movement.x = Math.abs(leftStick.x) > 0.1 ? leftStick.x : 0;
        this.movement.y = Math.abs(leftStick.y) > 0.1 ? leftStick.y : 0;

        // Right stick for aim influence (direction-based)
        const rightStick = this.gamepad.rightStick;
        this.aimInfluence.x = Math.abs(rightStick.x) > 0.1 ? rightStick.x : 0;
        this.aimInfluence.y = Math.abs(rightStick.y) > 0.1 ? rightStick.y : 0;

        // Right trigger for firing
        this.isFiring = this.gamepad.R2 > 0.1;

        // L1/R1 for target cycling
        if (this.gamepad.L1 && !this.lastL1) {
            this.cycleTargetPrev = true;
        }
        if (this.gamepad.R1 && !this.lastR1) {
            this.cycleTargetNext = true;
        }

        this.lastL1 = this.gamepad.L1;
        this.lastR1 = this.gamepad.R1;
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
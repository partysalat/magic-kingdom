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

        // Input mode (auto-detected)
        this.inputMode = 'keyboard'; // 'keyboard' or 'gamepad'

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
            E: Phaser.Input.Keyboard.KeyCodes.E
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
                console.log('Gamepad connected for player', this.playerIndex);
            }
        }

        // Reset cycle flags each frame
        this.cycleTargetNext = false;
        this.cycleTargetPrev = false;

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

        if (this.keys.W.isDown) this.movement.y = -1;
        if (this.keys.S.isDown) this.movement.y = 1;
        if (this.keys.A.isDown) this.movement.x = -1;
        if (this.keys.D.isDown) this.movement.x = 1;

        // Aim influence from mouse position
        const pointer = this.scene.input.activePointer;
        this.aimInfluence.x = pointer.worldX;
        this.aimInfluence.y = pointer.worldY;

        // Target cycling with Q/E
        if (Phaser.Input.Keyboard.JustDown(this.keys.Q)) {
            this.cycleTargetPrev = true;
        }
        if (Phaser.Input.Keyboard.JustDown(this.keys.E)) {
            this.cycleTargetNext = true;
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
}
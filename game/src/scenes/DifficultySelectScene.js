import { DIFFICULTY_SETTINGS } from '../config.js';

export class DifficultySelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'DifficultySelectScene' });
        this.selectedDifficulty = null;
        this.playerConfigs = null;
    }

    init(data) {
        // Receive player configs from StartScene
        this.playerConfigs = data.players || [];
    }

    create() {
        this.cameras.main.setBackgroundColor('#2d1810');

        const centerX = 960;

        // Title
        this.add.text(centerX, 150, 'SELECT DIFFICULTY', {
            fontSize: '64px',
            color: '#ff6b35',
            fontFamily: 'Georgia, serif',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Create difficulty option buttons
        const difficulties = [
            DIFFICULTY_SETTINGS.EASY,
            DIFFICULTY_SETTINGS.MEDIUM,
            DIFFICULTY_SETTINGS.HARD
        ];

        const buttonStartY = 350;
        const buttonSpacing = 200;

        this.difficultyButtons = [];

        difficulties.forEach((difficulty, index) => {
            const y = buttonStartY + (index * buttonSpacing);
            const button = this.createDifficultyButton(centerX, y, difficulty);
            this.difficultyButtons.push(button);
        });

        // Instructions
        this.add.text(centerX, 950, 'Press button or SPACE/ENTER to select', {
            fontSize: '28px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Auto-select Medium by default
        this.selectDifficulty(1);
    }

    createDifficultyButton(x, y, difficulty) {
        // Container for button elements
        const container = { difficulty };

        // Background box
        const box = this.add.rectangle(x, y, 700, 150, 0x3d2817, 0.8);
        box.setStrokeStyle(4, 0x8b6f47);
        container.box = box;

        // Difficulty name
        const nameText = this.add.text(x, y - 35, difficulty.name.toUpperCase(), {
            fontSize: '42px',
            color: '#ffffff',
            fontFamily: 'Georgia, serif',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        container.nameText = nameText;

        // Description
        const descText = this.add.text(x, y + 15, difficulty.description, {
            fontSize: '20px',
            color: '#cccccc',
            fontFamily: 'Arial',
            wordWrap: { width: 650 },
            align: 'center'
        }).setOrigin(0.5);
        container.descText = descText;

        // Selection indicator (hidden by default)
        const indicator = this.add.text(x - 370, y, '>', {
            fontSize: '48px',
            color: '#ffff00',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        indicator.setVisible(false);
        container.indicator = indicator;

        return container;
    }

    selectDifficulty(index) {
        // Hide all indicators
        this.difficultyButtons.forEach(btn => {
            btn.indicator.setVisible(false);
            btn.box.setStrokeStyle(4, 0x8b6f47);
        });

        // Show selected indicator
        const selected = this.difficultyButtons[index];
        selected.indicator.setVisible(true);
        selected.box.setStrokeStyle(6, selected.difficulty.color);

        this.selectedIndex = index;
        this.selectedDifficulty = selected.difficulty;
    }

    update() {
        this.handleInput();
    }

    handleInput() {
        // Initialize button state tracking if needed
        if (!this.lastButtonStates) {
            this.lastButtonStates = {};
        }

        // Gamepad navigation
        if (this.input.gamepad && this.input.gamepad.total > 0) {
            const pad = this.input.gamepad.gamepads[0];

            if (pad && pad.connected && pad.buttons) {
                // Up/Down navigation (D-pad)
                const upButton = pad.buttons[12];
                const downButton = pad.buttons[13];
                const aButton = pad.buttons[0];
                const startButton = pad.buttons[9];

                // Check D-pad up
                if (upButton) {
                    const wasPressed = this.lastButtonStates[12] || false;
                    const isPressed = upButton.pressed;
                    this.lastButtonStates[12] = isPressed;

                    if (isPressed && !wasPressed) {
                        this.selectedIndex = Math.max(0, this.selectedIndex - 1);
                        this.selectDifficulty(this.selectedIndex);
                    }
                }

                // Check D-pad down
                if (downButton) {
                    const wasPressed = this.lastButtonStates[13] || false;
                    const isPressed = downButton.pressed;
                    this.lastButtonStates[13] = isPressed;

                    if (isPressed && !wasPressed) {
                        this.selectedIndex = Math.min(2, this.selectedIndex + 1);
                        this.selectDifficulty(this.selectedIndex);
                    }
                }

                // Check A button
                if (aButton) {
                    const wasPressed = this.lastButtonStates[0] || false;
                    const isPressed = aButton.pressed;
                    this.lastButtonStates[0] = isPressed;

                    if (isPressed && !wasPressed) {
                        this.confirmSelection();
                    }
                }

                // Check START button
                if (startButton) {
                    const wasPressed = this.lastButtonStates[9] || false;
                    const isPressed = startButton.pressed;
                    this.lastButtonStates[9] = isPressed;

                    if (isPressed && !wasPressed) {
                        this.confirmSelection();
                    }
                }
            }
        }

        // Keyboard navigation
        const upKey = this.input.keyboard.addKey('UP');
        const downKey = this.input.keyboard.addKey('DOWN');
        const spaceKey = this.input.keyboard.addKey('SPACE');
        const enterKey = this.input.keyboard.addKey('ENTER');

        if (Phaser.Input.Keyboard.JustDown(upKey)) {
            this.selectedIndex = Math.max(0, this.selectedIndex - 1);
            this.selectDifficulty(this.selectedIndex);
        }
        if (Phaser.Input.Keyboard.JustDown(downKey)) {
            this.selectedIndex = Math.min(2, this.selectedIndex + 1);
            this.selectDifficulty(this.selectedIndex);
        }
        if (Phaser.Input.Keyboard.JustDown(spaceKey) || Phaser.Input.Keyboard.JustDown(enterKey)) {
            this.confirmSelection();
        }
    }

    confirmSelection() {
        // Store selected difficulty in registry for access across scenes
        this.registry.set('difficulty', this.selectedDifficulty);

        // Save to localStorage for persistence
        localStorage.setItem('giselasLastStand_difficulty', this.selectedDifficulty.id);

        console.log('Selected difficulty:', this.selectedDifficulty.name);

        // Transition to GameScene with player configs and difficulty
        this.scene.start('GameScene', {
            players: this.playerConfigs,
            difficulty: this.selectedDifficulty
        });
    }
}

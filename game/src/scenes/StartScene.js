export class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StartScene' });
    }

    create() {
        this.cameras.main.setBackgroundColor('#2d1810'); // Dark western brown

        // Player join state
        this.joinedPlayers = [];
        this.maxPlayers = 4;
        this.colors = ['red', 'blue', 'green', 'yellow'];

        // Track button states to detect "any button" press
        this.lastGamepadStates = [{}, {}, {}, {}];

        this.createUI();
        this.loadHighScores();
    }

    createUI() {
        const centerX = 960;

        // Title
        this.add.text(centerX, 150, "GISELA'S LAST STAND", {
            fontSize: '80px',
            color: '#ff6b35',
            fontFamily: 'Georgia, serif',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(centerX, 230, 'CRUSTACEAN WESTERN SHOWDOWN', {
            fontSize: '32px',
            color: '#ffffff',
            fontFamily: 'Georgia, serif'
        }).setOrigin(0.5);

        // Player slots (4 boxes)
        this.playerSlots = [];
        const slotStartX = 360;
        const slotY = 400;
        const slotSpacing = 280;

        for (let i = 0; i < 4; i++) {
            const x = slotStartX + (i * slotSpacing);
            const slot = this.createPlayerSlot(x, slotY, i);
            this.playerSlots.push(slot);
        }

        // Join instructions
        this.joinText = this.add.text(centerX, 650, 'Press any button to join (1-4 players)', {
            fontSize: '28px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Start instructions (hidden until at least one player joins)
        this.startText = this.add.text(centerX, 950, 'Press START to begin game', {
            fontSize: '32px',
            color: '#00ff00',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.startText.setVisible(false);

        // High scores section
        this.createHighScoresDisplay();
    }

    createPlayerSlot(x, y, playerIndex) {
        // Background box
        const box = this.add.rectangle(x, y, 200, 180, 0x3d2817, 0.8);
        box.setStrokeStyle(4, 0x8b6f47);

        // Player number
        const numberText = this.add.text(x, y - 60, `PLAYER ${playerIndex + 1}`, {
            fontSize: '20px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Crab sprite placeholder (invisible until player joins)
        const crabSprite = this.add.sprite(x, y, `gisela-${this.colors[playerIndex]}`);
        crabSprite.setScale(0.5);
        crabSprite.setVisible(false);

        // Ready text
        const readyText = this.add.text(x, y + 60, '---', {
            fontSize: '24px',
            color: '#888888',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        return {
            box,
            numberText,
            crabSprite,
            readyText,
            joined: false
        };
    }

    createHighScoresDisplay() {
        const x = 960;
        const y = 750;

        this.add.text(x, y, 'HIGH SCORES', {
            fontSize: '32px',
            color: '#ffcc00',
            fontFamily: 'Georgia, serif',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Display top 5 scores (will populate in loadHighScores)
        this.highScoreTexts = [];
        for (let i = 0; i < 5; i++) {
            const scoreText = this.add.text(x, y + 50 + (i * 30), '', {
                fontSize: '20px',
                color: '#ffffff',
                fontFamily: 'Arial'
            }).setOrigin(0.5);
            this.highScoreTexts.push(scoreText);
        }
    }

    loadHighScores() {
        try {
            const stored = localStorage.getItem('giselasLastStand_highScores');
            const scores = stored ? JSON.parse(stored) : [];

            // Sort by score descending, take top 5
            const topScores = scores.sort((a, b) => b.score - a.score).slice(0, 5);

            topScores.forEach((entry, index) => {
                // Add difficulty badge if available
                const diffBadge = entry.difficulty
                    ? ` [${entry.difficulty.toUpperCase()}]`
                    : '';

                const nameWithBadge = entry.playerName + diffBadge;
                const dots = '.'.repeat(Math.max(1, 25 - nameWithBadge.length));

                this.highScoreTexts[index].setText(
                    `${index + 1}. ${nameWithBadge} ${dots} ${entry.score.toLocaleString()} pts`
                );
            });

            // Fill remaining slots with placeholder
            for (let i = topScores.length; i < 5; i++) {
                this.highScoreTexts[i].setText(`${i + 1}. ........................ --- pts`);
            }
        } catch (error) {
            console.error('Error loading high scores:', error);
        }
    }

    update() {
        // Check for player joins (any button on any gamepad)
        this.checkForPlayerJoins();

        // Check for START button to begin game
        if (this.joinedPlayers.length > 0) {
            this.checkForGameStart();
        }
    }

    checkForPlayerJoins() {
        // Check gamepads 0-3
        if (this.input.gamepad && this.input.gamepad.total > 0) {
            const gamepads = this.input.gamepad.gamepads;

            for (let i = 0; i < 4; i++) {
                const pad = gamepads[i];

                if (!pad || !pad.connected) continue;

                // Check if this player already joined
                const alreadyJoined = this.joinedPlayers.some(p => p.index === i);
                if (alreadyJoined) {
                    // Still need to update button states to prevent false triggers
                    if (pad.buttons) {
                        pad.buttons.forEach((button, btnIndex) => {
                            this.lastGamepadStates[i][btnIndex] = button.pressed;
                        });
                    }
                    continue;
                }

                // Check if max players reached
                if (this.joinedPlayers.length >= this.maxPlayers) continue;

                // Detect "any button" press (check all buttons EXCEPT button 9 which is START)
                const anyButtonPressed = pad.buttons.some((button, btnIndex) => {
                    // Skip START button (button 9) for joining
                    if (btnIndex === 9) {
                        // Still update state for START button
                        this.lastGamepadStates[i][btnIndex] = button.pressed;
                        return false;
                    }

                    const wasPressed = this.lastGamepadStates[i][btnIndex] || false;
                    const isPressed = button.pressed;

                    // Update state
                    this.lastGamepadStates[i][btnIndex] = isPressed;

                    // Return true if button was just pressed (edge detection)
                    return isPressed && !wasPressed;
                });

                if (anyButtonPressed) {
                    this.addPlayer(i);
                }
            }
        }

        // Also check keyboard for Player 1 (index 0)
        if (this.joinedPlayers.length === 0) {
            const keys = this.input.keyboard.addKeys('W,A,S,D,SPACE,ENTER');
            if (Object.values(keys).some(key => Phaser.Input.Keyboard.JustDown(key))) {
                this.addPlayer(0);
            }
        }
    }

    addPlayer(gamepadIndex) {
        const playerNumber = this.joinedPlayers.length + 1;
        const color = this.colors[this.joinedPlayers.length];

        const playerConfig = {
            index: gamepadIndex,
            color: color,
            name: `Player ${playerNumber}`
        };

        this.joinedPlayers.push(playerConfig);

        // Update UI slot
        const slotIndex = this.joinedPlayers.length - 1;
        const slot = this.playerSlots[slotIndex];
        slot.crabSprite.setVisible(true);
        slot.crabSprite.play(`gisela-${color}-idle`);
        slot.readyText.setText('READY');
        slot.readyText.setColor('#00ff00');
        slot.joined = true;

        // Show start text if first player
        if (this.joinedPlayers.length === 1) {
            this.startText.setVisible(true);
        }

        // Play sound effect (if available)
        // this.sound.play('player-join');
    }

    checkForGameStart() {
        // Initialize last START button states if not exists
        if (!this.lastStartStates) {
            this.lastStartStates = [false, false, false, false];
        }

        // Check if any joined player presses START button
        if (this.input.gamepad && this.input.gamepad.total > 0) {
            const gamepads = this.input.gamepad.gamepads;

            for (const playerConfig of this.joinedPlayers) {
                const pad = gamepads[playerConfig.index];

                if (pad && pad.connected && pad.buttons[9]) {
                    const wasPressed = this.lastStartStates[playerConfig.index];
                    const isPressed = pad.buttons[9].pressed;

                    // Update state
                    this.lastStartStates[playerConfig.index] = isPressed;

                    // Only start if button was just pressed (edge detection)
                    if (isPressed && !wasPressed) {
                        this.startGame();
                        return;
                    }
                }
            }
        }

        // Also check keyboard ENTER for Player 1
        if (this.joinedPlayers.some(p => p.index === 0)) {
            if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('ENTER'))) {
                this.startGame();
            }
        }
    }

    startGame() {
        // Transition to DifficultySelectScene with player configs
        this.scene.start('DifficultySelectScene', {
            players: this.joinedPlayers
        });
    }
}

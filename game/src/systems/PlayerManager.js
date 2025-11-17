import { Player } from '../entities/Player.js';
import { InputManager } from './InputManager.js';
import { TargetSelector } from './TargetSelector.js';

export class PlayerManager {
    constructor(scene, playerConfigs) {
        this.scene = scene;
        this.players = [];
        this.inputManagers = {};
        this.targetSelectors = {};

        this.createPlayers(playerConfigs);
    }

    createPlayers(playerConfigs) {
        // Spawn position logic based on player count
        const spawnPositions = this.calculateSpawnPositions(playerConfigs.length);

        playerConfigs.forEach((config, index) => {
            const pos = spawnPositions[index];
            const player = new Player(this.scene, pos.x, pos.y, config.color);
            player.playerName = config.name;
            player.playerIndex = config.index;
            player.isDead = false;

            this.players.push(player);

            // Create InputManager for this player
            const inputManager = new InputManager(this.scene, config.index);
            this.inputManagers[player.playerIndex] = inputManager;

            // Create TargetSelector for this player
            const targetSelector = new TargetSelector(this.scene);
            this.targetSelectors[player.playerIndex] = targetSelector;
        });
    }

    calculateSpawnPositions(playerCount) {
        const centerX = 960;
        const centerY = 540;

        switch(playerCount) {
            case 1:
                return [{ x: centerX, y: centerY }];
            case 2:
                return [
                    { x: 800, y: centerY },
                    { x: 1120, y: centerY }
                ];
            case 3:
                return [
                    { x: centerX, y: 450 },
                    { x: 800, y: 630 },
                    { x: 1120, y: 630 }
                ];
            case 4:
                return [
                    { x: 800, y: 450 },
                    { x: 1120, y: 450 },
                    { x: 800, y: 630 },
                    { x: 1120, y: 630 }
                ];
            default:
                return [{ x: centerX, y: centerY }];
        }
    }

    getLivingPlayers() {
        return this.players.filter(player => !player.isDead);
    }

    getCenterPoint() {
        const living = this.getLivingPlayers();

        if (living.length === 0) {
            // No living players, return last known center or default
            return { x: 960, y: 540 };
        }

        const sumX = living.reduce((sum, p) => sum + p.sprite.x, 0);
        const sumY = living.reduce((sum, p) => sum + p.sprite.y, 0);

        return {
            x: sumX / living.length,
            y: sumY / living.length
        };
    }

    handlePlayerDeath(player) {
        player.isDead = true;
        // Play death animation if it exists
        if (player.sprite.anims.exists(`gisela-${player.color}-death`)) {
            player.sprite.play(`gisela-${player.color}-death`);
        }
        // Disable physics
        if (player.sprite.body) {
            player.sprite.body.enable = false;
        }
        // Fade out sprite
        this.scene.tweens.add({
            targets: player.sprite,
            alpha: 0.5,
            duration: 500
        });
    }

    allPlayersDead() {
        return this.players.every(player => player.isDead);
    }

    update(time, delta) {
        // Update all living players
        this.getLivingPlayers().forEach((player, index) => {
            const inputManager = this.inputManagers[player.playerIndex];
            const inputState = inputManager.getInputState();

            // Convert input state to keys format for player update
            const keys = {
                W: { isDown: inputState.movement.up },
                A: { isDown: inputState.movement.left },
                S: { isDown: inputState.movement.down },
                D: { isDown: inputState.movement.right }
            };

            player.update(keys);
        });
    }

    getPlayerByIndex(index) {
        return this.players.find(p => p.playerIndex === index);
    }

    getPlayerColorHex(color) {
        const colorMap = {
            'red': 0xff0000,
            'blue': 0x0000ff,
            'green': 0x00ff00,
            'yellow': 0xffff00
        };
        return colorMap[color] || 0xffffff;
    }
}
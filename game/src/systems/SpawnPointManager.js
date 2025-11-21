/**
 * SpawnPointManager.js
 * Manages thematic spawn points for saloon arena
 */

export const SPAWN_POINT_TYPES = {
    MAIN_DOOR: 'main_door',
    WINDOW_LEFT: 'window_left',
    WINDOW_RIGHT: 'window_right'
};

export const SPAWN_ANIMATIONS = {
    [SPAWN_POINT_TYPES.MAIN_DOOR]: {
        duration: 600,        // 0.6 seconds
        bountyDuration: 800,  // Extended for bounties
        audio: 'saloon_door',
        stages: ['door_open', 'enemy_enter', 'door_close']
    },
    [SPAWN_POINT_TYPES.WINDOW_LEFT]: {
        duration: 500,        // 0.5 seconds
        firstTimeDuration: 600,  // Longer for glass break
        audio: 'window_crash',
        stages: ['glass_break', 'enemy_crash_through']
    },
    [SPAWN_POINT_TYPES.WINDOW_RIGHT]: {
        duration: 500,
        firstTimeDuration: 600,
        audio: 'window_crash',
        stages: ['glass_break', 'enemy_crash_through']
    }
};

export class SpawnPointManager {
    constructor(scene) {
        this.scene = scene;

        // Spawn point coordinates (positioned outside arena, enemies move in)
        this.spawnPoints = {
            [SPAWN_POINT_TYPES.MAIN_DOOR]: {
                x: 960,              // Center bottom
                y: 1180,             // Below screen (1080 + margin)
                entryX: 960,
                entryY: 980,         // Target position after animation
                type: SPAWN_POINT_TYPES.MAIN_DOOR,
                lastSpawnTime: 0,
                broken: false        // N/A for door
            },
            [SPAWN_POINT_TYPES.WINDOW_LEFT]: {
                x: -100,             // Left of screen
                y: 400,              // Mid-height
                entryX: 200,         // Target position after animation
                entryY: 400,
                type: SPAWN_POINT_TYPES.WINDOW_LEFT,
                lastSpawnTime: 0,
                broken: false
            },
            [SPAWN_POINT_TYPES.WINDOW_RIGHT]: {
                x: 2020,             // Right of screen
                y: 400,              // Mid-height
                entryX: 1720,        // Target position after animation
                entryY: 400,
                type: SPAWN_POINT_TYPES.WINDOW_RIGHT,
                lastSpawnTime: 0,
                broken: false
            }
        };

        // Spawn queue for animation management
        this.spawnQueue = [];
        this.activeAnimations = [];
    }

    /**
     * Get available spawn point for regular enemy
     * Returns spawn point with longest time since last spawn
     */
    getRandomSpawnPoint() {
        const currentTime = Date.now();
        const MIN_SPAWN_DELAY = 500; // 0.5 second between spawns at same point

        // Filter spawn points with sufficient delay
        const availablePoints = Object.values(this.spawnPoints).filter(point => {
            return (currentTime - point.lastSpawnTime) >= MIN_SPAWN_DELAY;
        });

        // If all points are on cooldown, return least recently used
        if (availablePoints.length === 0) {
            return Object.values(this.spawnPoints).reduce((oldest, point) => {
                return point.lastSpawnTime < oldest.lastSpawnTime ? point : oldest;
            });
        }

        // Random selection from available points
        return availablePoints[Math.floor(Math.random() * availablePoints.length)];
    }

    /**
     * Get main door spawn point (for bounties)
     */
    getMainDoorSpawnPoint() {
        return this.spawnPoints[SPAWN_POINT_TYPES.MAIN_DOOR];
    }

    /**
     * Queue an enemy spawn with animation
     */
    queueSpawn(enemy, spawnPoint, isBounty = false) {
        const animationConfig = SPAWN_ANIMATIONS[spawnPoint.type];
        const duration = isBounty && spawnPoint.type === SPAWN_POINT_TYPES.MAIN_DOOR
            ? animationConfig.bountyDuration
            : (spawnPoint.broken ? animationConfig.duration : animationConfig.firstTimeDuration || animationConfig.duration);

        this.spawnQueue.push({
            enemy,
            spawnPoint,
            isBounty,
            duration,
            startTime: null,  // Set when animation begins
            animationConfig
        });

        spawnPoint.lastSpawnTime = Date.now();
    }

    /**
     * Update spawn animations (called every frame)
     */
    update(time) {
        // Start queued spawns (allow up to 10 concurrent to handle sub-waves)
        while (this.spawnQueue.length > 0 && this.activeAnimations.length < 10) {
            const spawn = this.spawnQueue.shift();
            spawn.startTime = time;
            this.activeAnimations.push(spawn);
            this.playSpawnAnimation(spawn);
        }

        // Update active animations
        this.activeAnimations = this.activeAnimations.filter(spawn => {
            const elapsed = time - spawn.startTime;

            if (elapsed < 0 || !isFinite(elapsed)) {
                console.error('[SpawnPointManager] ERROR: Invalid elapsed time!', 'elapsed:', elapsed, 'time:', time, 'startTime:', spawn.startTime);
                return true; // Keep trying
            }

            if (elapsed >= spawn.duration) {
                // Animation complete - enable enemy
                spawn.enemy.setPosition(spawn.spawnPoint.entryX, spawn.spawnPoint.entryY);
                spawn.enemy.setAlpha(1);

                // Zero out velocity before enabling collision
                if (spawn.enemy.getSprite().body) {
                    spawn.enemy.getSprite().body.setVelocity(0, 0);
                }

                spawn.enemy.setCollisionEnabled(true);
                console.log('[SpawnPointManager] Spawn animation COMPLETE at', time, 'elapsed:', elapsed, 'duration:', spawn.duration);
                return false; // Remove from active animations
            }

            // Animation in progress (removed excessive logging)

            // Update enemy position during animation
            const progress = elapsed / spawn.duration;
            const easeProgress = this.easeOutCubic(progress);

            const newX = spawn.spawnPoint.x + (spawn.spawnPoint.entryX - spawn.spawnPoint.x) * easeProgress;
            const newY = spawn.spawnPoint.y + (spawn.spawnPoint.entryY - spawn.spawnPoint.y) * easeProgress;

            // Use setPosition to update both sprite and physics body
            spawn.enemy.setPosition(newX, newY);

            // Zero out physics velocity during spawn animation to prevent drift
            if (spawn.enemy.getSprite().body) {
                spawn.enemy.getSprite().body.setVelocity(0, 0);
            }

            spawn.enemy.setAlpha(easeProgress);

            return true; // Keep in active animations
        });
    }

    /**
     * Play spawn animation effects (visual/audio)
     */
    playSpawnAnimation(spawn) {
        const { spawnPoint, isBounty, animationConfig } = spawn;

        // Play audio (check if sound exists first)
        if (this.scene.sound && this.scene.cache.audio.exists(animationConfig.audio)) {
            const volume = isBounty ? 1.2 : 1.0;
            this.scene.sound.play(animationConfig.audio, { volume });
        }

        // Create visual effects based on spawn type
        if (spawnPoint.type === SPAWN_POINT_TYPES.MAIN_DOOR) {
            this.createDoorAnimation(spawnPoint, isBounty);
        } else {
            this.createWindowAnimation(spawnPoint);
        }

        // Bounty-specific effects
        if (isBounty) {
            this.createBountySpawnEffects(spawnPoint);
        }
    }

    /**
     * Create door swing animation
     */
    createDoorAnimation(spawnPoint, isBounty) {
        const doorElement = document.createElement('div');
        doorElement.className = 'spawn-door-animation';
        doorElement.style.cssText = `
            position: absolute;
            left: ${spawnPoint.x - 60}px;
            top: ${spawnPoint.y - 80}px;
            width: 120px;
            height: 160px;
            background: linear-gradient(to right, #8B4513 0%, #8B4513 48%, #000 49%, #000 51%, #A0522D 52%, #A0522D 100%);
            border: 3px solid #654321;
            transform-origin: center bottom;
            animation: ${isBounty ? 'doorSwingBounty' : 'doorSwing'} 0.6s ease-out;
            z-index: 100;
        `;

        this.scene.game.canvas.parentElement.appendChild(doorElement);

        setTimeout(() => {
            doorElement.remove();
        }, isBounty ? 800 : 600);
    }

    /**
     * Create window crash animation
     */
    createWindowAnimation(spawnPoint) {
        const windowElement = document.createElement('div');
        windowElement.className = 'spawn-window-animation';

        const isFirstBreak = !spawnPoint.broken;

        windowElement.style.cssText = `
            position: absolute;
            left: ${spawnPoint.x}px;
            top: ${spawnPoint.y - 40}px;
            width: 80px;
            height: 80px;
            z-index: 100;
        `;

        if (isFirstBreak) {
            // Glass shatter effect
            for (let i = 0; i < 8; i++) {
                const shard = document.createElement('div');
                shard.className = 'glass-shard';
                const angle = (Math.PI * 2 * i) / 8;
                const distance = 30 + Math.random() * 20;

                shard.style.cssText = `
                    position: absolute;
                    left: 40px;
                    top: 40px;
                    width: 8px;
                    height: 12px;
                    background: rgba(173, 216, 230, 0.8);
                    animation: glassShatter 0.6s ease-out forwards;
                    --target-x: ${Math.cos(angle) * distance}px;
                    --target-y: ${Math.sin(angle) * distance}px;
                `;

                windowElement.appendChild(shard);
            }

            spawnPoint.broken = true;
        }

        this.scene.game.canvas.parentElement.appendChild(windowElement);

        setTimeout(() => {
            windowElement.remove();
        }, isFirstBreak ? 600 : 400);
    }

    /**
     * Create bounty spawn visual effects
     */
    createBountySpawnEffects(spawnPoint) {
        // Flash effect
        const flash = document.createElement('div');
        flash.className = 'bounty-spawn-flash';
        flash.style.cssText = `
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 215, 0, 0.3);
            animation: bountyFlash 0.4s ease-out;
            z-index: 99;
            pointer-events: none;
        `;

        this.scene.game.canvas.parentElement.appendChild(flash);

        setTimeout(() => flash.remove(), 400);

        // "Showdown" music sting (check if sound exists first)
        if (this.scene.sound && this.scene.cache.audio.exists('bounty_sting')) {
            this.scene.sound.play('bounty_sting', { volume: 0.8 });
        }
    }

    /**
     * Easing function for smooth animation
     */
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    /**
     * Reset spawn point states (for new game)
     */
    reset() {
        Object.values(this.spawnPoints).forEach(point => {
            point.lastSpawnTime = 0;
            point.broken = false;
        });
        this.spawnQueue = [];
        this.activeAnimations = [];
    }
}

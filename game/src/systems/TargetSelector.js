export class TargetSelector {
    constructor(scene) {
        this.scene = scene;
        this.lockedTarget = null;
        this.currentTarget = null;
        this.maxRange = 500; // Auto-aim search radius
        this.influenceConeAngle = Math.PI / 3; // 60 degree cone
    }

    update(playerX, playerY, aimInfluence, inputMode, enemies) {
        // Remove lock if target is dead
        if (this.lockedTarget && !this.lockedTarget.isAlive()) {
            this.clearLock();
        }

        // Priority 1: Locked bounty target
        if (this.lockedTarget && this.lockedTarget.isAlive()) {
            this.currentTarget = this.lockedTarget;
            return this.currentTarget;
        }

        // Get enemies in range
        const enemiesInRange = enemies.filter(enemy => {
            if (!enemy.isAlive()) return false;
            const dx = enemy.getSprite().x - playerX;
            const dy = enemy.getSprite().y - playerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance <= this.maxRange;
        });

        if (enemiesInRange.length === 0) {
            this.currentTarget = null;
            return null;
        }

        // Priority 2: Influenced target (if aim influence active)
        let influencedTarget = null;

        if (inputMode === 'gamepad') {
            // Right stick direction
            if (Math.abs(aimInfluence.x) > 0.1 || Math.abs(aimInfluence.y) > 0.1) {
                const influenceAngle = Math.atan2(aimInfluence.y, aimInfluence.x);
                influencedTarget = this.findTargetInCone(
                    playerX, playerY,
                    influenceAngle,
                    enemiesInRange
                );
            }
        } else {
            // Mouse cursor position
            const dx = aimInfluence.x - playerX;
            const dy = aimInfluence.y - playerY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 20) { // Dead zone
                const influenceAngle = Math.atan2(dy, dx);
                influencedTarget = this.findTargetInCone(
                    playerX, playerY,
                    influenceAngle,
                    enemiesInRange
                );
            }
        }

        if (influencedTarget) {
            this.currentTarget = influencedTarget;
            return this.currentTarget;
        }

        // Priority 3: Nearest enemy (fallback)
        const nearest = this.findNearestEnemy(playerX, playerY, enemiesInRange);
        this.currentTarget = nearest;
        return this.currentTarget;
    }

    findTargetInCone(playerX, playerY, coneAngle, enemies) {
        let bestTarget = null;
        let bestScore = -Infinity;

        enemies.forEach(enemy => {
            const dx = enemy.getSprite().x - playerX;
            const dy = enemy.getSprite().y - playerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angleToEnemy = Math.atan2(dy, dx);

            // Calculate angle difference
            let angleDiff = Math.abs(angleToEnemy - coneAngle);
            if (angleDiff > Math.PI) {
                angleDiff = 2 * Math.PI - angleDiff;
            }

            // Check if in cone
            if (angleDiff <= this.influenceConeAngle / 2) {
                // Score = closer + more aligned is better
                const score = (1 / distance) * (1 - angleDiff / (this.influenceConeAngle / 2));

                if (score > bestScore) {
                    bestScore = score;
                    bestTarget = enemy;
                }
            }
        });

        return bestTarget;
    }

    findNearestEnemy(playerX, playerY, enemies) {
        let nearest = null;
        let minDistance = Infinity;

        enemies.forEach(enemy => {
            const dx = enemy.getSprite().x - playerX;
            const dy = enemy.getSprite().y - playerY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < minDistance) {
                minDistance = distance;
                nearest = enemy;
            }
        });

        return nearest;
    }

    lockTarget(target) {
        if (target && target.isBountyEnemy()) {
            this.lockedTarget = target;
            console.log('Locked target:', target.getBountyName());
        }
    }

    clearLock() {
        this.lockedTarget = null;
        console.log('Target lock cleared');
    }

    cycleToBountyTarget(playerX, playerY, enemies, direction) {
        // Get all alive bounty enemies
        const bountyEnemies = enemies.filter(e => e.isAlive() && e.isBountyEnemy());

        if (bountyEnemies.length === 0) {
            this.clearLock();
            return;
        }

        // Sort by distance
        bountyEnemies.sort((a, b) => {
            const distA = Math.sqrt(
                Math.pow(a.getSprite().x - playerX, 2) +
                Math.pow(a.getSprite().y - playerY, 2)
            );
            const distB = Math.sqrt(
                Math.pow(b.getSprite().x - playerX, 2) +
                Math.pow(b.getSprite().y - playerY, 2)
            );
            return distA - distB;
        });

        // Find current lock index
        let currentIndex = bountyEnemies.findIndex(e => e === this.lockedTarget);

        if (currentIndex === -1) {
            // No current lock, lock nearest
            this.lockTarget(bountyEnemies[0]);
        } else {
            // Cycle to next/prev
            if (direction === 'next') {
                currentIndex = (currentIndex + 1) % bountyEnemies.length;
            } else {
                currentIndex = (currentIndex - 1 + bountyEnemies.length) % bountyEnemies.length;
            }
            this.lockTarget(bountyEnemies[currentIndex]);
        }
    }

    getCurrentTarget() {
        return this.currentTarget;
    }

    getLockedTarget() {
        return this.lockedTarget;
    }

    isTargetLocked() {
        return this.lockedTarget !== null && this.lockedTarget.isAlive();
    }
}

import { Cover, COVER_TYPES } from '../entities/Cover.js';

export class CoverManager {
    constructor(scene) {
        this.scene = scene;
        this.covers = [];
    }

    spawnCoverForWave() {
        // Clear any existing cover
        this.clearAllCover();

        // Spawn cover objects based on fixed positions
        const coverLayout = [
            { type: 'table', x: 700, y: 750 },
            { type: 'piano', x: 1220, y: 750 },
            { type: 'barrel', x: 500, y: 540 },
            { type: 'barrel', x: 1420, y: 540 },
            { type: 'table', x: 650, y: 350 },
            { type: 'bar', x: 960, y: 300 },
            { type: 'table', x: 1270, y: 350 }
        ];

        coverLayout.forEach(layout => {
            const cover = new Cover(this.scene, layout.x, layout.y, layout.type);
            this.covers.push(cover);

            // Add collision with player
            if (this.scene.player) {
                this.scene.physics.add.collider(this.scene.player.sprite, cover.getSprite());
            }
        });
    }

    clearAllCover() {
        this.covers.forEach(cover => {
            if (cover.isAlive()) {
                cover.destroy();
            }
        });
        this.covers = [];
    }

    checkBulletCollision(bulletX, bulletY, bulletDamage) {
        for (let i = 0; i < this.covers.length; i++) {
            const cover = this.covers[i];

            if (!cover.isAlive()) continue;

            if (cover.checkBulletCollision(bulletX, bulletY)) {
                // Bullet hit this cover
                cover.takeDamage(bulletDamage);
                return true; // Bullet was blocked
            }
        }

        return false; // Bullet not blocked
    }

    damageInRadius(x, y, radius, damage, excludeCover = null) {
        this.covers.forEach(cover => {
            if (!cover.isAlive()) return;
            if (cover === excludeCover) return;

            const dx = cover.x - x;
            const dy = cover.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < radius) {
                cover.takeDamage(damage);
            }
        });
    }

    update() {
        // Clean up dead cover objects
        this.covers = this.covers.filter(cover => cover.isAlive());
    }

    getCovers() {
        return this.covers;
    }
}

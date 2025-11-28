// Cocktail buff configurations
export const COCKTAIL_TYPES = {
    margarita: {
        name: 'Margarita',
        color: 0x00ff00,
        sprite: 'cocktail-margarita',
        duration: 15000,
        effect: 'spread_shot',
        description: 'Spread Shot - bullets fan out'
    },
    mojito: {
        name: 'Mojito',
        color: 0x0088ff,
        sprite: 'cocktail-mojito',
        duration: 15000,
        effect: 'rapid_fire',
        description: 'Rapid Fire - 2x fire rate'
    },
    old_fashioned: {
        name: 'Old Fashioned',
        color: 0xff8800,
        sprite: 'cocktail-oldfashioned',
        duration: 15000,
        effect: 'heavy_hitter',
        description: 'Heavy Hitter - 2x damage'
    },
    tequila_sunrise: {
        name: 'Tequila Sunrise',
        color: 0xffff00,
        sprite: 'cocktail-tequilasunrise',
        duration: 20000,
        effect: 'damage_ramp',
        description: 'Damage Ramp - damage increases'
    },
    whiskey_sour: {
        name: 'Whiskey Sour',
        color: 0xffdd00,
        sprite: 'cocktail-whiskeysour',
        duration: 15000,
        effect: 'piercing',
        description: 'Piercing - bullets pass through'
    },
    manhattan: {
        name: 'Manhattan',
        color: 0xff0000,
        sprite: 'cocktail-manhattan',
        duration: 15000,
        effect: 'critical',
        description: 'Critical Hits - 50% chance 3x damage'
    }
};

export class Cocktail {
    constructor(scene, x, y, type) {
        this.scene = scene;
        this.type = type;
        this.config = COCKTAIL_TYPES[type];
        this.alive = true;

        // Create visual representation using sprite image
        this.sprite = scene.add.image(x, y, this.config.sprite);
        this.sprite.setScale(1.2); // Scale up for better visibility

        // Add glow effect
        this.glow = scene.add.circle(x, y, 40, this.config.color, 0.3);

        // Floating animation
        scene.tweens.add({
            targets: [this.sprite, this.glow],
            y: y - 10,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        console.log('Cocktail created:', this.config.name, 'at', x, y);
    }

    getSprite() {
        return this.sprite;
    }

    getType() {
        return this.type;
    }

    getConfig() {
        return this.config;
    }

    isAlive() {
        return this.alive;
    }

    collect() {
        this.alive = false;
    }

    destroy() {
        if (this.sprite) this.sprite.destroy();
        if (this.glow) this.glow.destroy();
    }
}

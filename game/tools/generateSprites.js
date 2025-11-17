import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

// Helper function to ensure directory exists
function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

// Helper to draw a pixel
function drawPixel(ctx, x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
}

// Helper to draw a filled circle (pixel art style)
function drawCircle(ctx, cx, cy, radius, color) {
    ctx.fillStyle = color;
    for (let y = -radius; y <= radius; y++) {
        for (let x = -radius; x <= radius; x++) {
            if (x * x + y * y <= radius * radius) {
                ctx.fillRect(cx + x, cy + y, 1, 1);
            }
        }
    }
}

// Helper to draw outline
function drawOutline(ctx, pixels, color) {
    ctx.fillStyle = color;
    pixels.forEach(([x, y]) => {
        ctx.fillRect(x, y, 1, 1);
    });
}

// Generate Gisela sprite (kawaii cowboy crab - front view, based on reference)
function generateGisela(color, colorName) {
    const frameWidth = 96;
    const frameHeight = 96;
    const frames = 3; // idle animation

    const canvas = createCanvas(frameWidth * frames, frameHeight);
    const ctx = canvas.getContext('2d');

    // Colors - matching the reference image
    const colors = {
        shell: color, // Main body color
        shellMid: darkenColor(color, 0.15), // Mid tone
        shellDark: darkenColor(color, 0.35), // Shadow
        shellLight: lightenColor(color, 0.2), // Highlight
        hat: '#C19A6B', // Tan/beige cowboy hat
        hatDark: '#9B7653', // Hat shadow
        bandana: '#8B0000', // Dark red bandana
        outline: '#000000',
        eye: '#FFFFFF',
        eyePupil: '#000000',
        eyeShine: '#FFFFFF',
        belly: lightenColor(color, 0.3)
    };

    // Draw 3 frames
    for (let frame = 0; frame < frames; frame++) {
        const offsetX = frame * frameWidth;
        const bobOffset = frame === 1 ? -1 : 0; // Subtle bob

        ctx.save();
        ctx.translate(offsetX, 0);

        const cx = 48;
        const cy = 50 + bobOffset;

        // === LEGS (simple rectangles at bottom) ===
        ctx.fillStyle = colors.outline;
        const legBob = frame === 1 ? 1 : 0;
        // Left legs
        ctx.fillRect(cx - 24, cy + 22 + legBob, 6, 8);
        ctx.fillRect(cx - 14, cy + 24 - legBob, 6, 8);
        // Right legs
        ctx.fillRect(cx + 8, cy + 24 - legBob, 6, 8);
        ctx.fillRect(cx + 18, cy + 22 + legBob, 6, 8);

        // === MAIN BODY (large oval/round) ===
        // Body outline
        ctx.fillStyle = colors.outline;
        ctx.fillRect(cx - 26, cy - 4, 52, 28); // Main body box
        ctx.fillRect(cx - 24, cy - 6, 48, 2); // Top extension
        ctx.fillRect(cx - 22, cy - 8, 44, 2); // Top extension 2
        ctx.fillRect(cx - 28, cy + 0, 2, 20); // Left side
        ctx.fillRect(cx + 26, cy + 0, 2, 20); // Right side
        ctx.fillRect(cx - 24, cy + 24, 48, 2); // Bottom

        // Main body fill
        ctx.fillStyle = colors.shell;
        ctx.fillRect(cx - 24, cy - 4, 48, 26);
        ctx.fillRect(cx - 22, cy - 6, 44, 2);
        ctx.fillRect(cx - 26, cy + 0, 52, 20);

        // Body mid-tone (shading)
        ctx.fillStyle = colors.shellMid;
        ctx.fillRect(cx - 22, cy + 4, 44, 16);

        // Body dark shading (bottom)
        ctx.fillStyle = colors.shellDark;
        ctx.fillRect(cx - 20, cy + 12, 40, 8);

        // Belly highlight
        ctx.fillStyle = colors.belly;
        ctx.fillRect(cx - 12, cy + 14, 24, 6);

        // === CLAWS (large, prominent) ===
        const clawOffset = frame === 1 ? -1 : 0;

        // Left claw
        ctx.fillStyle = colors.outline;
        ctx.fillRect(cx - 40, cy + 0 + clawOffset, 16, 20);
        ctx.fillRect(cx - 42, cy + 2 + clawOffset, 2, 16);
        ctx.fillStyle = colors.shell;
        ctx.fillRect(cx - 38, cy + 2 + clawOffset, 12, 16);
        ctx.fillStyle = colors.shellMid;
        ctx.fillRect(cx - 36, cy + 4 + clawOffset, 8, 12);
        // Pincer
        ctx.fillStyle = colors.outline;
        ctx.fillRect(cx - 42, cy - 2 + clawOffset, 8, 4);
        ctx.fillRect(cx - 42, cy + 18 + clawOffset, 8, 4);
        ctx.fillStyle = colors.shellLight;
        ctx.fillRect(cx - 40, cy + 0 + clawOffset, 6, 2);
        ctx.fillRect(cx - 40, cy + 18 + clawOffset, 6, 2);

        // Right claw
        ctx.fillStyle = colors.outline;
        ctx.fillRect(cx + 24, cy + 0 - clawOffset, 16, 20);
        ctx.fillRect(cx + 40, cy + 2 - clawOffset, 2, 16);
        ctx.fillStyle = colors.shell;
        ctx.fillRect(cx + 26, cy + 2 - clawOffset, 12, 16);
        ctx.fillStyle = colors.shellMid;
        ctx.fillRect(cx + 28, cy + 4 - clawOffset, 8, 12);
        // Pincer
        ctx.fillStyle = colors.outline;
        ctx.fillRect(cx + 34, cy - 2 - clawOffset, 8, 4);
        ctx.fillRect(cx + 34, cy + 18 - clawOffset, 8, 4);
        ctx.fillStyle = colors.shellLight;
        ctx.fillRect(cx + 34, cy + 0 - clawOffset, 6, 2);
        ctx.fillRect(cx + 34, cy + 18 - clawOffset, 6, 2);

        // === EYES (simple circles) ===
        // Left eye
        ctx.fillStyle = colors.outline;
        drawCircle(ctx, cx - 10, cy - 2, 9, colors.outline);
        ctx.fillStyle = colors.eye;
        drawCircle(ctx, cx - 10, cy - 2, 7, colors.eye);
        // Pupil
        ctx.fillStyle = colors.eyePupil;
        drawCircle(ctx, cx - 10, cy - 1, 4, colors.eyePupil);
        // Shine
        ctx.fillStyle = colors.eyeShine;
        ctx.fillRect(cx - 8, cy - 4, 2, 2);

        // Right eye
        ctx.fillStyle = colors.outline;
        drawCircle(ctx, cx + 10, cy - 2, 9, colors.outline);
        ctx.fillStyle = colors.eye;
        drawCircle(ctx, cx + 10, cy - 2, 7, colors.eye);
        // Pupil
        ctx.fillStyle = colors.eyePupil;
        drawCircle(ctx, cx + 10, cy - 1, 4, colors.eyePupil);
        // Shine
        ctx.fillStyle = colors.eyeShine;
        ctx.fillRect(cx + 12, cy - 4, 2, 2);

        // === MOUTH (simple smile) ===
        ctx.fillStyle = colors.outline;
        ctx.fillRect(cx - 6, cy + 8, 3, 2);
        ctx.fillRect(cx - 3, cy + 9, 2, 2);
        ctx.fillRect(cx + 1, cy + 9, 2, 2);
        ctx.fillRect(cx + 3, cy + 8, 3, 2);

        // === BANDANA/VEST (dark red detail) ===
        ctx.fillStyle = colors.bandana;
        ctx.fillRect(cx - 16, cy + 6, 32, 8);
        // Bandana pattern (small dots)
        ctx.fillStyle = colors.shellLight;
        ctx.fillRect(cx - 10, cy + 8, 2, 2);
        ctx.fillRect(cx - 4, cy + 9, 2, 2);
        ctx.fillRect(cx + 2, cy + 8, 2, 2);
        ctx.fillRect(cx + 8, cy + 9, 2, 2);

        // === COWBOY HAT ===
        ctx.fillStyle = colors.outline;
        // Hat brim outline
        ctx.fillRect(cx - 28, cy - 22, 56, 10);
        ctx.fillRect(cx - 26, cy - 24, 52, 2);
        ctx.fillStyle = colors.hat;
        // Hat brim
        ctx.fillRect(cx - 26, cy - 22, 52, 8);
        ctx.fillRect(cx - 24, cy - 24, 48, 2);

        // Hat crown outline
        ctx.fillStyle = colors.outline;
        ctx.fillRect(cx - 18, cy - 44, 36, 24);
        ctx.fillRect(cx - 16, cy - 46, 32, 2);
        ctx.fillStyle = colors.hat;
        // Hat crown fill
        ctx.fillRect(cx - 16, cy - 44, 32, 22);
        ctx.fillRect(cx - 14, cy - 46, 28, 2);

        // Hat shading
        ctx.fillStyle = colors.hatDark;
        ctx.fillRect(cx - 14, cy - 34, 28, 10);

        // Hat band (dark red)
        ctx.fillStyle = colors.bandana;
        ctx.fillRect(cx - 16, cy - 24, 32, 4);

        ctx.restore();
    }

    return canvas;
}

// Helper to lighten a color
function lightenColor(hex, factor) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    const newR = Math.min(255, Math.floor(r + (255 - r) * factor));
    const newG = Math.min(255, Math.floor(g + (255 - g) * factor));
    const newB = Math.min(255, Math.floor(b + (255 - b) * factor));

    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

// Generate Bandit Lobster
function generateBanditLobster() {
    const frameWidth = 64;
    const frameHeight = 48;
    const frames = 2;

    const canvas = createCanvas(frameWidth * frames, frameHeight);
    const ctx = canvas.getContext('2d');

    const colors = {
        body: '#DC143C',
        bodyDark: '#8B0000',
        hat: '#654321',
        claw: '#FF6347',
        outline: '#000000',
        eye: '#FF0000'
    };

    for (let frame = 0; frame < frames; frame++) {
        const offsetX = frame * frameWidth;
        const moveOffset = frame === 1 ? 1 : 0;

        ctx.save();
        ctx.translate(offsetX, 0);

        const cx = 32;
        const cy = 24;

        // Body (elongated lobster)
        ctx.fillStyle = colors.body;
        ctx.fillRect(cx - 16, cy - 6 + moveOffset, 32, 12);
        ctx.fillStyle = colors.bodyDark;
        ctx.fillRect(cx - 14, cy - 4 + moveOffset, 28, 8);

        // Segments
        ctx.fillStyle = colors.outline;
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(cx - 10 + i * 8, cy - 6 + moveOffset, 1, 12);
        }

        // Tail
        ctx.fillStyle = colors.body;
        ctx.fillRect(cx + 16, cy - 4 + moveOffset, 6, 8);
        ctx.fillRect(cx + 20, cy - 2 + moveOffset, 4, 4);

        // Big claws (like guns)
        ctx.fillStyle = colors.claw;
        // Left claw
        ctx.fillRect(cx - 20, cy - 4 + moveOffset, 8, 6);
        ctx.fillRect(cx - 24, cy - 2 + moveOffset, 4, 2);
        // Right claw
        ctx.fillRect(cx - 20, cy + 4 + moveOffset, 8, 6);
        ctx.fillRect(cx - 24, cy + 6 + moveOffset, 4, 2);

        // Cowboy hat
        ctx.fillStyle = colors.hat;
        ctx.fillRect(cx - 6, cy - 14 + moveOffset, 12, 2); // Brim
        ctx.fillRect(cx - 4, cy - 18 + moveOffset, 8, 6); // Crown

        // Eyes (angry)
        ctx.fillStyle = colors.eye;
        ctx.fillRect(cx - 8, cy - 2 + moveOffset, 2, 2);
        ctx.fillRect(cx - 2, cy - 2 + moveOffset, 2, 2);

        ctx.restore();
    }

    return canvas;
}

// Generate bullet
function generateBullet() {
    const canvas = createCanvas(8, 8);
    const ctx = canvas.getContext('2d');

    // Yellow bullet
    drawCircle(ctx, 4, 4, 3, '#FFD700');
    drawCircle(ctx, 4, 4, 2, '#FFA500');

    return canvas;
}

// Generate cocktail
function generateCocktail(type) {
    const canvas = createCanvas(24, 32);
    const ctx = canvas.getContext('2d');

    const cocktails = {
        margarita: {
            glass: '#87CEEB',
            liquid: '#98FB98',
            accent: '#32CD32',
            garnish: '#228B22'
        },
        mojito: {
            glass: '#B0E0E6',
            liquid: '#00CED1',
            accent: '#20B2AA',
            garnish: '#228B22'
        },
        oldfashioned: {
            glass: '#DEB887',
            liquid: '#FF8C00',
            accent: '#D2691E',
            garnish: '#DC143C'
        },
        tequilasunrise: {
            glass: '#FFE4B5',
            liquid: '#FFD700',
            accent: '#FF6347',
            garnish: '#FFA500'
        },
        whiskeysour: {
            glass: '#F5DEB3',
            liquid: '#DAA520',
            accent: '#B8860B',
            garnish: '#FFD700'
        },
        manhattan: {
            glass: '#D3D3D3',
            liquid: '#8B0000',
            accent: '#DC143C',
            garnish: '#DC143C'
        }
    };

    const colors = cocktails[type];

    // Glass outline
    ctx.fillStyle = colors.glass;
    // Margarita = wide glass, others = tall glass
    if (type === 'margarita') {
        ctx.fillRect(6, 12, 12, 16);
        ctx.fillRect(4, 28, 16, 2);
        // Salt rim
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(6, 12, 12, 2);
    } else if (type === 'manhattan') {
        // Martini glass
        ctx.fillRect(10, 8, 4, 16);
        ctx.fillRect(6, 24, 12, 2);
        ctx.fillRect(8, 26, 8, 2);
    } else {
        // Tall glass
        ctx.fillRect(8, 8, 8, 20);
        ctx.fillRect(7, 28, 10, 2);
    }

    // Liquid
    ctx.fillStyle = colors.liquid;
    if (type === 'margarita') {
        ctx.fillRect(7, 14, 10, 12);
    } else if (type === 'manhattan') {
        ctx.fillRect(7, 20, 10, 6);
    } else if (type === 'tequilasunrise') {
        // Gradient effect
        ctx.fillRect(9, 10, 6, 8);
        ctx.fillStyle = colors.accent;
        ctx.fillRect(9, 18, 6, 8);
    } else {
        ctx.fillRect(9, 10, 6, 16);
    }

    // Garnish
    ctx.fillStyle = colors.garnish;
    if (type === 'margarita' || type === 'whiskeysour') {
        // Lime wedge
        ctx.fillRect(16, 10, 4, 4);
    } else if (type === 'mojito') {
        // Mint leaves
        ctx.fillRect(14, 8, 2, 3);
        ctx.fillRect(16, 7, 2, 3);
    } else {
        // Cherry
        drawCircle(ctx, 16, 10, 2, colors.garnish);
    }

    return canvas;
}

// Utility to darken a color
function darkenColor(hex, factor) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    const newR = Math.floor(r * (1 - factor));
    const newG = Math.floor(g * (1 - factor));
    const newB = Math.floor(b * (1 - factor));

    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

// Main generation function
async function generateAllSprites() {
    console.log('🎨 Starting sprite generation...\n');

    const basePath = path.join(process.cwd(), 'assets');

    // Generate Gisela variants
    console.log('🦀 Generating Gisela sprites...');
    const giselaColors = {
        red: '#DC143C',
        blue: '#4169E1',
        green: '#32CD32',
        yellow: '#FFD700'
    };

    for (const [colorName, color] of Object.entries(giselaColors)) {
        const canvas = generateGisela(color, colorName);
        const filePath = path.join(basePath, 'sprites', 'player', `gisela-${colorName}-idle.png`);
        ensureDir(path.dirname(filePath));

        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(filePath, buffer);
        console.log(`  ✓ Created gisela-${colorName}-idle.png (96x96, 3 frames)`);
    }

    // Generate Bandit Lobster
    console.log('\n🦞 Generating Bandit Lobster...');
    const lobsterCanvas = generateBanditLobster();
    const lobsterPath = path.join(basePath, 'sprites', 'enemies', 'lobster-bandit-idle.png');
    ensureDir(path.dirname(lobsterPath));
    fs.writeFileSync(lobsterPath, lobsterCanvas.toBuffer('image/png'));
    console.log('  ✓ Created lobster-bandit-idle.png (64x48, 2 frames)');

    // Generate Bullet
    console.log('\n💥 Generating bullet...');
    const bulletCanvas = generateBullet();
    const bulletPath = path.join(basePath, 'sprites', 'projectiles', 'bullet.png');
    ensureDir(path.dirname(bulletPath));
    fs.writeFileSync(bulletPath, bulletCanvas.toBuffer('image/png'));
    console.log('  ✓ Created bullet.png (8x8)');

    // Generate Cocktails
    console.log('\n🍹 Generating cocktails...');
    const cocktailTypes = ['margarita', 'mojito', 'oldfashioned', 'tequilasunrise', 'whiskeysour', 'manhattan'];

    for (const type of cocktailTypes) {
        const canvas = generateCocktail(type);
        const filePath = path.join(basePath, 'sprites', 'powerups', `cocktail-${type}.png`);
        ensureDir(path.dirname(filePath));
        fs.writeFileSync(filePath, canvas.toBuffer('image/png'));
        console.log(`  ✓ Created cocktail-${type}.png (24x32)`);
    }

    console.log('\n✨ All sprites generated successfully!');
    console.log('\n📁 Sprites saved to:');
    console.log(`   ${path.join(basePath, 'sprites')}`);
    console.log('\n🎮 Next steps:');
    console.log('   1. Open src/scenes/PreloadScene.js');
    console.log('   2. Uncomment the sprite loaders');
    console.log('   3. Update your game config to use PreloadScene');
    console.log('   4. Update Player.js and Enemy.js to use sprites!');
}

// Run generation
generateAllSprites().catch(console.error);
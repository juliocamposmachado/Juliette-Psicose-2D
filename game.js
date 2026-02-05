// =====================================================
// CLASSIC ARCADE FIGHTING GAME - PIXEL WARRIORS
// Inspired by early 1990s CPS-era arcade fighters
// =====================================================

// Game constants
const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 480;
const GROUND_Y = 380;
const GRAVITY = 0.8;
const JUMP_FORCE = -16;

// Fighter constants
const FIGHTER_WIDTH = 64;
const FIGHTER_HEIGHT = 96;
const FIGHTER_SPEED = 3;
const ATTACK_RANGE = 80;

// Game state
const gameState = {
    currentState: 'menu', // menu, fighting, roundEnd, gameOver
    player1: null,
    player2: null,
    camera: { x: 0, y: 0 },
    stage: null,
    round: 1,
    maxRounds: 3,
    roundTimer: 99,
    frameCount: 0,
    paused: false,
    winner: null
};

// Input handling
const keys = {};
const gamepadState = {
    player1: null,
    player2: null
};

// Canvas and context
let canvas, ctx;

// =====================================================
// FIGHTER CLASS
// =====================================================

class Fighter {
    constructor(x, y, controls, color, name) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.facing = 1; // 1 = right, -1 = left
        this.onGround = false;
        
        // Fighter stats
        this.health = 100;
        this.maxHealth = 100;
        this.energy = 100;
        this.maxEnergy = 100;
        
        // Visual properties
        this.color = color;
        this.name = name;
        this.width = FIGHTER_WIDTH;
        this.height = FIGHTER_HEIGHT;
        
        // Animation system
        this.currentAnimation = 'idle';
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.animationSpeed = 8; // frames per animation frame
        
        // Combat system
        this.state = 'idle'; // idle, walking, jumping, attacking, blocking, hit, special
        this.attackCooldown = 0;
        this.blockCooldown = 0;
        this.hitStun = 0;
        this.invulnerable = 0;
        
        // Controls
        this.controls = controls;
        
        // Hitboxes
        this.hitbox = { x: 0, y: 0, width: 48, height: 80 };
        this.hurtbox = { x: 0, y: 0, width: 40, height: 88 };
        
        // Special moves
        this.specialCooldown = 0;
        this.comboCount = 0;
        
        // Visual effects
        this.flashTimer = 0;
        this.particles = [];
    }
    
    update() {
        this.frameCount++;
        
        // Update timers
        if (this.attackCooldown > 0) this.attackCooldown--;
        if (this.blockCooldown > 0) this.blockCooldown--;
        if (this.hitStun > 0) this.hitStun--;
        if (this.invulnerable > 0) this.invulnerable--;
        if (this.specialCooldown > 0) this.specialCooldown--;
        if (this.flashTimer > 0) this.flashTimer--;
        
        // Handle input only if not in hitstun
        if (this.hitStun === 0) {
            this.handleInput();
        }
        
        // Apply physics
        this.applyPhysics();
        
        // Update animation
        this.updateAnimation();
        
        // Update particles
        this.updateParticles();
        
        // Update hitboxes
        this.updateHitboxes();
        
        // Regenerate energy slowly
        if (this.energy < this.maxEnergy) {
            this.energy += 0.1;
        }
    }
    
    handleInput() {
        const left = keys[this.controls.left];
        const right = keys[this.controls.right];
        const up = keys[this.controls.up];
        const down = keys[this.controls.down];
        const punch = keys[this.controls.punch];
        const kick = keys[this.controls.kick];
        const block = keys[this.controls.block];
        const special = keys[this.controls.special];
        
        // Reset velocity
        this.vx = 0;
        
        // Blocking
        if (block && this.onGround && this.state !== 'attacking') {
            this.state = 'blocking';
            this.currentAnimation = 'block';
            return;
        }
        
        // Special moves
        if (special && this.specialCooldown === 0 && this.energy >= 25) {
            this.performSpecialAttack();
            return;
        }
        
        // Attacks
        if ((punch || kick) && this.attackCooldown === 0 && this.onGround) {
            this.performAttack(punch ? 'punch' : 'kick');
            return;
        }
        
        // Jumping
        if (up && this.onGround) {
            this.vy = JUMP_FORCE;
            this.onGround = false;
            this.state = 'jumping';
            this.currentAnimation = 'jump';
        }
        
        // Crouching
        if (down && this.onGround) {
            this.state = 'crouching';
            this.currentAnimation = 'crouch';
            return;
        }
        
        // Movement
        if (left && !right) {
            this.vx = -FIGHTER_SPEED;
            this.facing = -1;
            if (this.onGround && this.state !== 'attacking') {
                this.state = 'walking';
                this.currentAnimation = 'walk';
            }
        } else if (right && !left) {
            this.vx = FIGHTER_SPEED;
            this.facing = 1;
            if (this.onGround && this.state !== 'attacking') {
                this.state = 'walking';
                this.currentAnimation = 'walk';
            }
        } else if (this.onGround && this.state !== 'attacking') {
            this.state = 'idle';
            this.currentAnimation = 'idle';
        }
    }
    
    performAttack(type) {
        this.state = 'attacking';
        this.currentAnimation = type;
        this.attackCooldown = type === 'punch' ? 20 : 30;
        this.animationFrame = 0;
        this.animationTimer = 0;
        
        // Create attack hitbox
        setTimeout(() => {
            this.checkAttackHit(type);
        }, type === 'punch' ? 100 : 150);
        
        // Create attack particles
        this.createAttackParticles();
    }
    
    performSpecialAttack() {
        this.state = 'special';
        this.currentAnimation = 'special';
        this.specialCooldown = 180; // 3 seconds
        this.energy -= 25;
        this.attackCooldown = 60;
        this.animationFrame = 0;
        this.animationTimer = 0;
        
        // Special attack effects
        setTimeout(() => {
            this.checkSpecialHit();
        }, 200);
        
        // Create special particles
        this.createSpecialParticles();
    }
    
    checkAttackHit(attackType) {
        const opponent = this === gameState.player1 ? gameState.player2 : gameState.player1;
        
        // Calculate attack range
        const attackX = this.x + (this.facing > 0 ? this.width : -ATTACK_RANGE);
        const attackY = this.y;
        const attackWidth = ATTACK_RANGE;
        const attackHeight = this.height;
        
        // Check collision with opponent
        if (this.checkCollision(
            attackX, attackY, attackWidth, attackHeight,
            opponent.x, opponent.y, opponent.width, opponent.height
        )) {
            const damage = attackType === 'punch' ? 8 : 12;
            opponent.takeDamage(damage, this.facing);
        }
    }
    
    checkSpecialHit() {
        const opponent = this === gameState.player1 ? gameState.player2 : gameState.player1;
        
        // Wider range for special attacks
        const attackX = this.x + (this.facing > 0 ? this.width : -ATTACK_RANGE * 1.5);
        const attackY = this.y - 20;
        const attackWidth = ATTACK_RANGE * 1.5;
        const attackHeight = this.height + 40;
        
        if (this.checkCollision(
            attackX, attackY, attackWidth, attackHeight,
            opponent.x, opponent.y, opponent.width, opponent.height
        )) {
            opponent.takeDamage(20, this.facing);
        }
    }
    
    takeDamage(damage, attackerFacing) {
        if (this.invulnerable > 0) return;
        
        // Reduce damage if blocking
        if (this.state === 'blocking' && 
            ((attackerFacing > 0 && this.facing < 0) || (attackerFacing < 0 && this.facing > 0))) {
            damage *= 0.3;
        } else {
            // Full damage, enter hitstun
            this.hitStun = 15;
            this.state = 'hit';
            this.currentAnimation = 'hit';
            this.animationFrame = 0;
            
            // Knockback
            this.vx = attackerFacing * 4;
        }
        
        this.health -= damage;
        this.flashTimer = 10;
        this.invulnerable = 20;
        
        // Create hit particles
        this.createHitParticles();
        
        if (this.health <= 0) {
            this.health = 0;
            this.state = 'defeated';
            this.currentAnimation = 'defeat';
        }
    }
    
    applyPhysics() {
        // Apply gravity
        if (!this.onGround) {
            this.vy += GRAVITY;
        }
        
        // Apply velocity
        this.x += this.vx;
        this.y += this.vy;
        
        // Ground collision
        if (this.y >= GROUND_Y - this.height) {
            this.y = GROUND_Y - this.height;
            this.vy = 0;
            this.onGround = true;
            
            if (this.state === 'jumping') {
                this.state = 'idle';
                this.currentAnimation = 'idle';
            }
        } else {
            this.onGround = false;
        }
        
        // Screen boundaries
        this.x = Math.max(50, Math.min(CANVAS_WIDTH - this.width - 50, this.x));
    }
    
    updateAnimation() {
        this.animationTimer++;
        
        if (this.animationTimer >= this.animationSpeed) {
            this.animationTimer = 0;
            this.animationFrame++;
            
            // Animation frame limits
            const frameLimits = {
                idle: 4,
                walk: 6,
                jump: 3,
                punch: 4,
                kick: 5,
                block: 2,
                hit: 3,
                special: 8,
                crouch: 2,
                defeat: 6
            };
            
            const maxFrames = frameLimits[this.currentAnimation] || 4;
            
            if (this.animationFrame >= maxFrames) {
                if (this.currentAnimation === 'punch' || this.currentAnimation === 'kick' || 
                    this.currentAnimation === 'hit' || this.currentAnimation === 'special') {
                    // Return to idle after attack/hit animations
                    this.state = 'idle';
                    this.currentAnimation = 'idle';
                    this.animationFrame = 0;
                } else if (this.currentAnimation !== 'defeat') {
                    this.animationFrame = 0;
                }
            }
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.2; // gravity
            particle.life--;
            particle.alpha -= 0.02;
            
            if (particle.life <= 0 || particle.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    updateHitboxes() {
        // Update hitbox positions relative to fighter
        this.hitbox.x = this.x + (this.width - this.hitbox.width) / 2;
        this.hitbox.y = this.y + (this.height - this.hitbox.height);
        
        this.hurtbox.x = this.x + (this.width - this.hurtbox.width) / 2;
        this.hurtbox.y = this.y + (this.height - this.hurtbox.height);
    }
    
    createAttackParticles() {
        const particleCount = 5;
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: this.x + this.width/2 + (this.facing * 30),
                y: this.y + this.height/2 + (Math.random() - 0.5) * 40,
                vx: this.facing * (2 + Math.random() * 3),
                vy: (Math.random() - 0.5) * 4,
                life: 20,
                alpha: 1,
                color: '#FFD700',
                size: 3 + Math.random() * 2
            });
        }
    }
    
    createSpecialParticles() {
        const particleCount = 15;
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: this.x + this.width/2,
                y: this.y + this.height/2,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 40,
                alpha: 1,
                color: '#FF4444',
                size: 4 + Math.random() * 3
            });
        }
    }
    
    createHitParticles() {
        const particleCount = 8;
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: this.x + this.width/2,
                y: this.y + this.height/2,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 25,
                alpha: 1,
                color: '#FF0000',
                size: 2 + Math.random() * 2
            });
        }
    }
    
    checkCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
        return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
    }
    
    draw() {
        ctx.save();
        
        // Flash effect when hit
        if (this.flashTimer > 0 && this.flashTimer % 4 < 2) {
            ctx.globalAlpha = 0.5;
        }
        
        // Draw fighter sprite (simplified pixel art representation)
        this.drawPixelFighter();
        
        // Draw particles
        this.drawParticles();
        
        ctx.restore();
    }
    
    drawPixelFighter() {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height;
        
        ctx.save();
        
        // Flip sprite if facing left
        if (this.facing < 0) {
            ctx.scale(-1, 1);
            ctx.translate(-centerX * 2, 0);
        }
        
        // Draw based on current animation
        this.drawAnimationFrame(centerX, centerY);
        
        ctx.restore();
    }
    
    drawAnimationFrame(centerX, centerY) {
        const colors = {
            primary: this.color,
            secondary: this.adjustColor(this.color, -30),
            highlight: this.adjustColor(this.color, 50),
            skin: '#FFDBAC',
            dark: '#2C1810'
        };
        
        // Draw based on animation state
        switch (this.currentAnimation) {
            case 'idle':
                this.drawIdleFrame(centerX, centerY, colors);
                break;
            case 'walk':
                this.drawWalkFrame(centerX, centerY, colors);
                break;
            case 'jump':
                this.drawJumpFrame(centerX, centerY, colors);
                break;
            case 'punch':
                this.drawPunchFrame(centerX, centerY, colors);
                break;
            case 'kick':
                this.drawKickFrame(centerX, centerY, colors);
                break;
            case 'block':
                this.drawBlockFrame(centerX, centerY, colors);
                break;
            case 'hit':
                this.drawHitFrame(centerX, centerY, colors);
                break;
            case 'special':
                this.drawSpecialFrame(centerX, centerY, colors);
                break;
            case 'crouch':
                this.drawCrouchFrame(centerX, centerY, colors);
                break;
            case 'defeat':
                this.drawDefeatFrame(centerX, centerY, colors);
                break;
            default:
                this.drawIdleFrame(centerX, centerY, colors);
        }
    }
    
    drawIdleFrame(x, y, colors) {
        // Head
        this.drawPixelRect(x - 8, y - 80, 16, 16, colors.skin);
        this.drawPixelRect(x - 6, y - 78, 2, 2, colors.dark); // Left eye
        this.drawPixelRect(x + 4, y - 78, 2, 2, colors.dark); // Right eye
        
        // Body
        this.drawPixelRect(x - 12, y - 64, 24, 32, colors.primary);
        this.drawPixelRect(x - 10, y - 62, 20, 28, colors.secondary);
        
        // Arms
        this.drawPixelRect(x - 20, y - 60, 8, 24, colors.skin);
        this.drawPixelRect(x + 12, y - 60, 8, 24, colors.skin);
        
        // Legs
        this.drawPixelRect(x - 8, y - 32, 6, 32, colors.primary);
        this.drawPixelRect(x + 2, y - 32, 6, 32, colors.primary);
        
        // Feet
        this.drawPixelRect(x - 10, y - 4, 8, 4, colors.dark);
        this.drawPixelRect(x + 2, y - 4, 8, 4, colors.dark);
    }
    
    drawWalkFrame(x, y, colors) {
        const walkOffset = Math.sin(this.animationFrame * 0.5) * 2;
        
        // Head (slight bob)
        this.drawPixelRect(x - 8, y - 80 + walkOffset, 16, 16, colors.skin);
        this.drawPixelRect(x - 6, y - 78 + walkOffset, 2, 2, colors.dark);
        this.drawPixelRect(x + 4, y - 78 + walkOffset, 2, 2, colors.dark);
        
        // Body
        this.drawPixelRect(x - 12, y - 64, 24, 32, colors.primary);
        
        // Arms (swinging)
        const armSwing = Math.sin(this.animationFrame * 0.8) * 4;
        this.drawPixelRect(x - 20, y - 60 + armSwing, 8, 24, colors.skin);
        this.drawPixelRect(x + 12, y - 60 - armSwing, 8, 24, colors.skin);
        
        // Legs (walking motion)
        const legOffset = this.animationFrame % 2 === 0 ? 2 : -2;
        this.drawPixelRect(x - 8 + legOffset, y - 32, 6, 32, colors.primary);
        this.drawPixelRect(x + 2 - legOffset, y - 32, 6, 32, colors.primary);
        
        // Feet
        this.drawPixelRect(x - 10 + legOffset, y - 4, 8, 4, colors.dark);
        this.drawPixelRect(x + 2 - legOffset, y - 4, 8, 4, colors.dark);
    }
    
    drawPunchFrame(x, y, colors) {
        // Head
        this.drawPixelRect(x - 8, y - 80, 16, 16, colors.skin);
        this.drawPixelRect(x - 6, y - 78, 2, 2, colors.dark);
        this.drawPixelRect(x + 4, y - 78, 2, 2, colors.dark);
        
        // Body
        this.drawPixelRect(x - 12, y - 64, 24, 32, colors.primary);
        
        // Arms (punching pose)
        this.drawPixelRect(x - 20, y - 60, 8, 24, colors.skin); // Back arm
        this.drawPixelRect(x + 16, y - 58, 12, 8, colors.skin); // Extended punch arm
        
        // Legs
        this.drawPixelRect(x - 8, y - 32, 6, 32, colors.primary);
        this.drawPixelRect(x + 2, y - 32, 6, 32, colors.primary);
        
        // Feet
        this.drawPixelRect(x - 10, y - 4, 8, 4, colors.dark);
        this.drawPixelRect(x + 2, y - 4, 8, 4, colors.dark);
    }
    
    drawKickFrame(x, y, colors) {
        // Head
        this.drawPixelRect(x - 8, y - 80, 16, 16, colors.skin);
        this.drawPixelRect(x - 6, y - 78, 2, 2, colors.dark);
        this.drawPixelRect(x + 4, y - 78, 2, 2, colors.dark);
        
        // Body (leaning back)
        this.drawPixelRect(x - 14, y - 64, 24, 32, colors.primary);
        
        // Arms
        this.drawPixelRect(x - 22, y - 60, 8, 24, colors.skin);
        this.drawPixelRect(x + 10, y - 60, 8, 24, colors.skin);
        
        // Legs (kicking pose)
        this.drawPixelRect(x - 8, y - 32, 6, 32, colors.primary); // Standing leg
        this.drawPixelRect(x + 8, y - 40, 16, 8, colors.primary); // Kicking leg
        
        // Feet
        this.drawPixelRect(x - 10, y - 4, 8, 4, colors.dark);
        this.drawPixelRect(x + 20, y - 44, 8, 4, colors.dark); // Kicking foot
    }
    
    drawBlockFrame(x, y, colors) {
        // Head
        this.drawPixelRect(x - 8, y - 80, 16, 16, colors.skin);
        this.drawPixelRect(x - 6, y - 78, 2, 2, colors.dark);
        this.drawPixelRect(x + 4, y - 78, 2, 2, colors.dark);
        
        // Body
        this.drawPixelRect(x - 12, y - 64, 24, 32, colors.primary);
        
        // Arms (defensive position)
        this.drawPixelRect(x - 16, y - 70, 8, 20, colors.skin);
        this.drawPixelRect(x + 8, y - 70, 8, 20, colors.skin);
        
        // Legs
        this.drawPixelRect(x - 8, y - 32, 6, 32, colors.primary);
        this.drawPixelRect(x + 2, y - 32, 6, 32, colors.primary);
        
        // Feet
        this.drawPixelRect(x - 10, y - 4, 8, 4, colors.dark);
        this.drawPixelRect(x + 2, y - 4, 8, 4, colors.dark);
    }
    
    drawHitFrame(x, y, colors) {
        // Head (recoiling)
        this.drawPixelRect(x - 10, y - 80, 16, 16, colors.skin);
        this.drawPixelRect(x - 8, y - 78, 2, 2, colors.dark);
        this.drawPixelRect(x + 2, y - 78, 2, 2, colors.dark);
        
        // Body (bent back)
        this.drawPixelRect(x - 14, y - 64, 24, 32, colors.primary);
        
        // Arms (recoiling)
        this.drawPixelRect(x - 24, y - 58, 8, 24, colors.skin);
        this.drawPixelRect(x + 8, y - 58, 8, 24, colors.skin);
        
        // Legs
        this.drawPixelRect(x - 8, y - 32, 6, 32, colors.primary);
        this.drawPixelRect(x + 2, y - 32, 6, 32, colors.primary);
        
        // Feet
        this.drawPixelRect(x - 10, y - 4, 8, 4, colors.dark);
        this.drawPixelRect(x + 2, y - 4, 8, 4, colors.dark);
    }
    
    drawSpecialFrame(x, y, colors) {
        // Enhanced version with energy effects
        this.drawIdleFrame(x, y, colors);
        
        // Energy aura
        const auraSize = 4 + Math.sin(this.animationFrame * 0.5) * 2;
        ctx.globalAlpha = 0.3;
        this.drawPixelRect(x - 16 - auraSize, y - 84 - auraSize, 32 + auraSize * 2, 84 + auraSize * 2, '#FF4444');
        ctx.globalAlpha = 1;
    }
    
    drawCrouchFrame(x, y, colors) {
        // Head (lowered)
        this.drawPixelRect(x - 8, y - 60, 16, 16, colors.skin);
        this.drawPixelRect(x - 6, y - 58, 2, 2, colors.dark);
        this.drawPixelRect(x + 4, y - 58, 2, 2, colors.dark);
        
        // Body (compressed)
        this.drawPixelRect(x - 12, y - 44, 24, 20, colors.primary);
        
        // Arms
        this.drawPixelRect(x - 20, y - 40, 8, 16, colors.skin);
        this.drawPixelRect(x + 12, y - 40, 8, 16, colors.skin);
        
        // Legs (crouched)
        this.drawPixelRect(x - 12, y - 24, 10, 24, colors.primary);
        this.drawPixelRect(x + 2, y - 24, 10, 24, colors.primary);
        
        // Feet
        this.drawPixelRect(x - 14, y - 4, 12, 4, colors.dark);
        this.drawPixelRect(x + 2, y - 4, 12, 4, colors.dark);
    }
    
    drawDefeatFrame(x, y, colors) {
        // Fallen fighter
        ctx.save();
        ctx.translate(x, y - 20);
        ctx.rotate(Math.PI / 2);
        
        // Head
        this.drawPixelRect(-8, -40, 16, 16, colors.skin);
        this.drawPixelRect(-6, -38, 2, 2, colors.dark);
        this.drawPixelRect(4, -38, 2, 2, colors.dark);
        
        // Body
        this.drawPixelRect(-12, -24, 24, 32, colors.primary);
        
        // Arms
        this.drawPixelRect(-20, -20, 8, 24, colors.skin);
        this.drawPixelRect(12, -20, 8, 24, colors.skin);
        
        // Legs
        this.drawPixelRect(-8, 8, 6, 32, colors.primary);
        this.drawPixelRect(2, 8, 6, 32, colors.primary);
        
        ctx.restore();
    }
    
    drawPixelRect(x, y, width, height, color) {
        ctx.fillStyle = color;
        ctx.fillRect(Math.floor(x), Math.floor(y), width, height);
        
        // Add pixel-perfect outline
        ctx.strokeStyle = this.adjustColor(color, -40);
        ctx.lineWidth = 1;
        ctx.strokeRect(Math.floor(x), Math.floor(y), width, height);
    }
    
    drawParticles() {
        for (const particle of this.particles) {
            ctx.save();
            ctx.globalAlpha = particle.alpha;
            ctx.fillStyle = particle.color;
            ctx.fillRect(
                Math.floor(particle.x - particle.size/2), 
                Math.floor(particle.y - particle.size/2), 
                particle.size, 
                particle.size
            );
            ctx.restore();
        }
    }
    
    adjustColor(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
        const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
        const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
}

// =====================================================
// STAGE CLASS
// =====================================================

class Stage {
    constructor(name, theme) {
        this.name = name;
        this.theme = theme;
        this.backgroundLayers = [];
        this.foregroundElements = [];
        this.spectators = [];
        this.animationFrame = 0;
        
        this.initializeStage();
    }
    
    initializeStage() {
        // Create multi-layer parallax background
        switch (this.theme) {
            case 'tropical':
                this.createTropicalStage();
                break;
            case 'urban':
                this.createUrbanStage();
                break;
            case 'festival':
                this.createFestivalStage();
                break;
            default:
                this.createTropicalStage();
        }
        
        // Add animated spectators
        this.createSpectators();
    }
    
    createTropicalStage() {
        // Sky gradient
        this.backgroundLayers.push({
            type: 'gradient',
            colors: ['#87CEEB', '#FFE4B5'],
            parallax: 0
        });
        
        // Distant mountains
        this.backgroundLayers.push({
            type: 'mountains',
            color: '#8B7355',
            parallax: 0.1,
            points: [
                {x: 0, y: 200}, {x: 150, y: 150}, {x: 300, y: 180},
                {x: 450, y: 120}, {x: 600, y: 160}, {x: 800, y: 140}
            ]
        });
        
        // Palm trees
        this.backgroundLayers.push({
            type: 'trees',
            parallax: 0.3,
            trees: [
                {x: 100, y: 280, height: 100},
                {x: 500, y: 290, height: 120},
                {x: 750, y: 275, height: 90}
            ]
        });
        
        // Beach/ground
        this.backgroundLayers.push({
            type: 'ground',
            color: '#F4A460',
            y: GROUND_Y,
            parallax: 1
        });
    }
    
    createUrbanStage() {
        // Sky
        this.backgroundLayers.push({
            type: 'gradient',
            colors: ['#4A4A4A', '#2C2C2C'],
            parallax: 0
        });
        
        // Distant buildings
        this.backgroundLayers.push({
            type: 'buildings',
            parallax: 0.2,
            buildings: [
                {x: 0, y: 100, width: 80, height: 200},
                {x: 100, y: 80, width: 60, height: 220},
                {x: 180, y: 120, width: 100, height: 180},
                {x: 300, y: 60, width: 70, height: 240},
                {x: 400, y: 90, width: 90, height: 210}
            ]
        });
        
        // Street level
        this.backgroundLayers.push({
            type: 'ground',
            color: '#555555',
            y: GROUND_Y,
            parallax: 1
        });
        
        // Street lights
        this.foregroundElements.push({
            type: 'streetlights',
            lights: [
                {x: 150, y: GROUND_Y - 120},
                {x: 450, y: GROUND_Y - 120}
            ]
        });
    }
    
    createFestivalStage() {
        // Evening sky
        this.backgroundLayers.push({
            type: 'gradient',
            colors: ['#FF6B35', '#F7931E'],
            parallax: 0
        });
        
        // Festival tents
        this.backgroundLayers.push({
            type: 'tents',
            parallax: 0.4,
            tents: [
                {x: 80, y: 250, width: 120, height: 80, color: '#FF4444'},
                {x: 250, y: 260, width: 100, height: 70, color: '#4444FF'},
                {x: 420, y: 245, width: 140, height: 85, color: '#44FF44'}
            ]
        });
        
        // Festival ground
        this.backgroundLayers.push({
            type: 'ground',
            color: '#8B4513',
            y: GROUND_Y,
            parallax: 1
        });
        
        // Decorative banners
        this.foregroundElements.push({
            type: 'banners',
            banners: [
                {x: 200, y: 100, width: 80, color: '#FFD700'},
                {x: 400, y: 120, width: 60, color: '#FF69B4'}
            ]
        });
    }
    
    createSpectators() {
        const spectatorCount = 8;
        for (let i = 0; i < spectatorCount; i++) {
            this.spectators.push({
                x: 50 + i * 70,
                y: GROUND_Y - 40,
                color: this.getRandomSpectatorColor(),
                animationOffset: Math.random() * 60,
                type: Math.floor(Math.random() * 3) // Different spectator types
            });
        }
    }
    
    getRandomSpectatorColor() {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    update() {
        this.animationFrame++;
    }
    
    draw() {
        // Draw background layers with parallax
        for (const layer of this.backgroundLayers) {
            this.drawLayer(layer);
        }
        
        // Draw spectators
        this.drawSpectators();
        
        // Draw foreground elements
        for (const element of this.foregroundElements) {
            this.drawForegroundElement(element);
        }
    }
    
    drawLayer(layer) {
        ctx.save();
        
        switch (layer.type) {
            case 'gradient':
                this.drawGradientBackground(layer);
                break;
            case 'mountains':
                this.drawMountains(layer);
                break;
            case 'trees':
                this.drawTrees(layer);
                break;
            case 'buildings':
                this.drawBuildings(layer);
                break;
            case 'tents':
                this.drawTents(layer);
                break;
            case 'ground':
                this.drawGround(layer);
                break;
        }
        
        ctx.restore();
    }
    
    drawGradientBackground(layer) {
        const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
        gradient.addColorStop(0, layer.colors[0]);
        gradient.addColorStop(1, layer.colors[1]);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
    
    drawMountains(layer) {
        ctx.fillStyle = layer.color;
        ctx.beginPath();
        ctx.moveTo(0, CANVAS_HEIGHT);
        
        for (const point of layer.points) {
            ctx.lineTo(point.x, point.y);
        }
        
        ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.closePath();
        ctx.fill();
        
        // Add mountain outline
        ctx.strokeStyle = this.adjustColor(layer.color, -30);
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    drawTrees(layer) {
        for (const tree of layer.trees) {
            // Tree trunk
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(tree.x - 8, tree.y, 16, tree.height * 0.6);
            
            // Tree crown (simplified palm fronds)
            ctx.fillStyle = '#228B22';
            for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI) / 3;
                const frondLength = tree.height * 0.4;
                const endX = tree.x + Math.cos(angle) * frondLength;
                const endY = tree.y - Math.sin(angle) * frondLength * 0.5;
                
                ctx.beginPath();
                ctx.moveTo(tree.x, tree.y);
                ctx.lineTo(endX, endY);
                ctx.lineWidth = 6;
                ctx.strokeStyle = '#228B22';
                ctx.stroke();
            }
        }
    }
    
    drawBuildings(layer) {
        for (const building of layer.buildings) {
            // Building body
            ctx.fillStyle = '#666666';
            ctx.fillRect(building.x, building.y, building.width, building.height);
            
            // Building outline
            ctx.strokeStyle = '#444444';
            ctx.lineWidth = 2;
            ctx.strokeRect(building.x, building.y, building.width, building.height);
            
            // Windows
            const windowRows = Math.floor(building.height / 30);
            const windowCols = Math.floor(building.width / 25);
            
            for (let row = 0; row < windowRows; row++) {
                for (let col = 0; col < windowCols; col++) {
                    const windowX = building.x + 5 + col * 25;
                    const windowY = building.y + 10 + row * 30;
                    
                    // Random window lights
                    ctx.fillStyle = Math.random() > 0.3 ? '#FFFF88' : '#333333';
                    ctx.fillRect(windowX, windowY, 15, 20);
                }
            }
        }
    }
    
    drawTents(layer) {
        for (const tent of layer.tents) {
            // Tent body
            ctx.fillStyle = tent.color;
            ctx.beginPath();
            ctx.moveTo(tent.x, tent.y + tent.height);
            ctx.lineTo(tent.x + tent.width/2, tent.y);
            ctx.lineTo(tent.x + tent.width, tent.y + tent.height);
            ctx.closePath();
            ctx.fill();
            
            // Tent outline
            ctx.strokeStyle = this.adjustColor(tent.color, -40);
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Tent pole
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(tent.x + tent.width/2 - 2, tent.y, 4, tent.height);
        }
    }
    
    drawGround(layer) {
        ctx.fillStyle = layer.color;
        ctx.fillRect(0, layer.y, CANVAS_WIDTH, CANVAS_HEIGHT - layer.y);
        
        // Ground texture (simple pattern)
        ctx.strokeStyle = this.adjustColor(layer.color, -20);
        ctx.lineWidth = 1;
        for (let x = 0; x < CANVAS_WIDTH; x += 20) {
            ctx.beginPath();
            ctx.moveTo(x, layer.y);
            ctx.lineTo(x, CANVAS_HEIGHT);
            ctx.stroke();
        }
    }
    
    drawSpectators() {
        for (const spectator of this.spectators) {
            const animFrame = (this.animationFrame + spectator.animationOffset) % 120;
            const bounce = Math.sin(animFrame * 0.1) * 2;
            
            // Simple spectator sprite
            ctx.fillStyle = spectator.color;
            ctx.fillRect(spectator.x - 6, spectator.y - 30 + bounce, 12, 30);
            
            // Head
            ctx.fillStyle = '#FFDBAC';
            ctx.fillRect(spectator.x - 4, spectator.y - 40 + bounce, 8, 8);
            
            // Arms (cheering motion)
            if (animFrame % 60 < 30) {
                ctx.fillStyle = '#FFDBAC';
                ctx.fillRect(spectator.x - 10, spectator.y - 35 + bounce, 4, 8);
                ctx.fillRect(spectator.x + 6, spectator.y - 35 + bounce, 4, 8);
            }
        }
    }
    
    drawForegroundElement(element) {
        switch (element.type) {
            case 'streetlights':
                for (const light of element.lights) {
                    // Light pole
                    ctx.fillStyle = '#333333';
                    ctx.fillRect(light.x - 2, light.y, 4, 120);
                    
                    // Light fixture
                    ctx.fillStyle = '#666666';
                    ctx.fillRect(light.x - 8, light.y - 10, 16, 10);
                    
                    // Light glow
                    ctx.fillStyle = '#FFFF88';
                    ctx.globalAlpha = 0.3;
                    ctx.fillRect(light.x - 12, light.y - 8, 24, 6);
                    ctx.globalAlpha = 1;
                }
                break;
            case 'banners':
                for (const banner of element.banners) {
                    const wave = Math.sin(this.animationFrame * 0.1) * 3;
                    
                    ctx.fillStyle = banner.color;
                    ctx.beginPath();
                    ctx.moveTo(banner.x, banner.y);
                    ctx.lineTo(banner.x + banner.width, banner.y + wave);
                    ctx.lineTo(banner.x + banner.width, banner.y + 20 + wave);
                    ctx.lineTo(banner.x, banner.y + 20);
                    ctx.closePath();
                    ctx.fill();
                }
                break;
        }
    }
    
    adjustColor(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
        const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
        const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
}

// =====================================================
// HUD SYSTEM
// =====================================================

class HUD {
    constructor() {
        this.font = '16px monospace';
        this.smallFont = '12px monospace';
    }
    
    draw() {
        this.drawHealthBars();
        this.drawTimer();
        this.drawPlayerNames();
        this.drawRoundInfo();
        this.drawEnergyBars();
    }
    
    drawHealthBars() {
        const barWidth = 200;
        const barHeight = 20;
        const barY = 30;
        
        // Player 1 health bar (left)
        const p1HealthPercent = gameState.player1.health / gameState.player1.maxHealth;
        
        // Background
        ctx.fillStyle = '#333333';
        ctx.fillRect(50, barY, barWidth, barHeight);
        
        // Health fill
        ctx.fillStyle = p1HealthPercent > 0.3 ? '#00FF00' : '#FF0000';
        ctx.fillRect(50, barY, barWidth * p1HealthPercent, barHeight);
        
        // Border
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(50, barY, barWidth, barHeight);
        
        // Player 2 health bar (right)
        const p2HealthPercent = gameState.player2.health / gameState.player2.maxHealth;
        
        // Background
        ctx.fillStyle = '#333333';
        ctx.fillRect(CANVAS_WIDTH - 250, barY, barWidth, barHeight);
        
        // Health fill
        ctx.fillStyle = p2HealthPercent > 0.3 ? '#00FF00' : '#FF0000';
        ctx.fillRect(CANVAS_WIDTH - 250, barY, barWidth * p2HealthPercent, barHeight);
        
        // Border
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(CANVAS_WIDTH - 250, barY, barWidth, barHeight);
    }
    
    drawEnergyBars() {
        const barWidth = 150;
        const barHeight = 8;
        const barY = 55;
        
        // Player 1 energy bar
        const p1EnergyPercent = gameState.player1.energy / gameState.player1.maxEnergy;
        
        ctx.fillStyle = '#222222';
        ctx.fillRect(50, barY, barWidth, barHeight);
        
        ctx.fillStyle = '#00AAFF';
        ctx.fillRect(50, barY, barWidth * p1EnergyPercent, barHeight);
        
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.strokeRect(50, barY, barWidth, barHeight);
        
        // Player 2 energy bar
        const p2EnergyPercent = gameState.player2.energy / gameState.player2.maxEnergy;
        
        ctx.fillStyle = '#222222';
        ctx.fillRect(CANVAS_WIDTH - 200, barY, barWidth, barHeight);
        
        ctx.fillStyle = '#00AAFF';
        ctx.fillRect(CANVAS_WIDTH - 200, barY, barWidth * p2EnergyPercent, barHeight);
        
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.strokeRect(CANVAS_WIDTH - 200, barY, barWidth, barHeight);
    }
    
    drawTimer() {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(gameState.roundTimer.toString().padStart(2, '0'), CANVAS_WIDTH / 2, 35);
        
        // Timer background
        ctx.fillStyle = '#000000';
        ctx.globalAlpha = 0.5;
        ctx.fillRect(CANVAS_WIDTH / 2 - 25, 10, 50, 30);
        ctx.globalAlpha = 1;
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(gameState.roundTimer.toString().padStart(2, '0'), CANVAS_WIDTH / 2, 35);
    }
    
    drawPlayerNames() {
        ctx.font = this.font;
        ctx.fillStyle = '#FFFFFF';
        
        // Player 1 name
        ctx.textAlign = 'left';
        ctx.fillText(gameState.player1.name, 50, 20);
        
        // Player 2 name
        ctx.textAlign = 'right';
        ctx.fillText(gameState.player2.name, CANVAS_WIDTH - 50, 20);
    }
    
    drawRoundInfo() {
        ctx.font = this.smallFont;
        ctx.fillStyle = '#FFFF00';
        ctx.textAlign = 'center';
        ctx.fillText(`ROUND ${gameState.round}`, CANVAS_WIDTH / 2, 60);
    }
}

// =====================================================
// GAME INITIALIZATION
// =====================================================

function initGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    
    // Disable image smoothing for pixel-perfect rendering
    ctx.imageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    
    // Initialize game objects
    initializeFighters();
    initializeStage();
    initializeHUD();
    
    // Set initial game state
    gameState.currentState = 'fighting';
    gameState.roundTimer = 99;
    
    // Start game loop
    gameLoop();
    
    console.log('🥊 Classic Arcade Fighting Game initialized!');
}

function initializeFighters() {
    // Player 1 controls
    const p1Controls = {
        left: 'ArrowLeft',
        right: 'ArrowRight',
        up: 'ArrowUp',
        down: 'ArrowDown',
        punch: 'KeyZ',
        kick: 'KeyX',
        block: 'KeyC',
        special: 'KeyV'
    };
    
    // Player 2 controls
    const p2Controls = {
        left: 'KeyA',
        right: 'KeyD',
        up: 'KeyW',
        down: 'KeyS',
        punch: 'KeyF',
        kick: 'KeyG',
        block: 'KeyH',
        special: 'KeyT'
    };
    
    // Create fighters
    gameState.player1 = new Fighter(150, GROUND_Y - FIGHTER_HEIGHT, p1Controls, '#FF4444', 'WARRIOR');
    gameState.player2 = new Fighter(450, GROUND_Y - FIGHTER_HEIGHT, p2Controls, '#4444FF', 'CHAMPION');
    
    // Make fighters face each other
    gameState.player1.facing = 1;
    gameState.player2.facing = -1;
}

function initializeStage() {
    const stages = ['tropical', 'urban', 'festival'];
    const randomStage = stages[Math.floor(Math.random() * stages.length)];
    gameState.stage = new Stage('Arena', randomStage);
}

function initializeHUD() {
    gameState.hud = new HUD();
}

// =====================================================
// GAME LOOP
// =====================================================

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    if (gameState.paused) return;
    
    gameState.frameCount++;
    
    // Update round timer
    if (gameState.frameCount % 60 === 0 && gameState.roundTimer > 0) {
        gameState.roundTimer--;
    }
    
    // Check for round end conditions
    checkRoundEnd();
    
    if (gameState.currentState === 'fighting') {
        // Update fighters
        gameState.player1.update();
        gameState.player2.update();
        
        // Update stage
        gameState.stage.update();
        
        // Make fighters face each other
        if (gameState.player1.x < gameState.player2.x) {
            gameState.player1.facing = 1;
            gameState.player2.facing = -1;
        } else {
            gameState.player1.facing = -1;
            gameState.player2.facing = 1;
        }
    }
}

function checkRoundEnd() {
    if (gameState.player1.health <= 0 || gameState.player2.health <= 0 || gameState.roundTimer <= 0) {
        // Determine winner
        if (gameState.player1.health > gameState.player2.health) {
            gameState.winner = gameState.player1;
        } else if (gameState.player2.health > gameState.player1.health) {
            gameState.winner = gameState.player2;
        } else {
            gameState.winner = null; // Draw
        }
        
        gameState.currentState = 'roundEnd';
        
        // Reset for next round after delay
        setTimeout(() => {
            if (gameState.round < gameState.maxRounds) {
                startNextRound();
            } else {
                gameState.currentState = 'gameOver';
            }
        }, 3000);
    }
}

function startNextRound() {
    gameState.round++;
    gameState.roundTimer = 99;
    gameState.currentState = 'fighting';
    
    // Reset fighter positions and health
    gameState.player1.x = 150;
    gameState.player1.y = GROUND_Y - FIGHTER_HEIGHT;
    gameState.player1.health = gameState.player1.maxHealth;
    gameState.player1.energy = gameState.player1.maxEnergy;
    gameState.player1.state = 'idle';
    gameState.player1.currentAnimation = 'idle';
    
    gameState.player2.x = 450;
    gameState.player2.y = GROUND_Y - FIGHTER_HEIGHT;
    gameState.player2.health = gameState.player2.maxHealth;
    gameState.player2.energy = gameState.player2.maxEnergy;
    gameState.player2.state = 'idle';
    gameState.player2.currentAnimation = 'idle';
}

// =====================================================
// RENDERING
// =====================================================

function draw() {
    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw stage
    gameState.stage.draw();
    
    // Draw fighters
    gameState.player1.draw();
    gameState.player2.draw();
    
    // Draw HUD
    gameState.hud.draw();
    
    // Draw game state overlays
    drawGameStateOverlays();
}

function drawGameStateOverlays() {
    if (gameState.currentState === 'roundEnd') {
        drawRoundEndScreen();
    } else if (gameState.currentState === 'gameOver') {
        drawGameOverScreen();
    }
}

function drawRoundEndScreen() {
    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Winner text
    ctx.fillStyle = '#FFFF00';
    ctx.font = '48px monospace';
    ctx.textAlign = 'center';
    
    if (gameState.winner) {
        ctx.fillText(`${gameState.winner.name} WINS!`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
    } else {
        ctx.fillText('DRAW!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
    }
    
    // Next round text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '24px monospace';
    if (gameState.round < gameState.maxRounds) {
        ctx.fillText('Next Round Starting...', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
    } else {
        ctx.fillText('Final Round Complete!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
    }
}

function drawGameOverScreen() {
    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Game over text
    ctx.fillStyle = '#FF0000';
    ctx.font = '64px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 100);
    
    // Final winner
    ctx.fillStyle = '#FFFF00';
    ctx.font = '36px monospace';
    if (gameState.winner) {
        ctx.fillText(`${gameState.winner.name} IS THE CHAMPION!`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
    } else {
        ctx.fillText('NO CHAMPION!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
    }
    
    // Restart instruction
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '18px monospace';
    ctx.fillText('Press R to restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
}

// =====================================================
// INPUT HANDLING
// =====================================================

document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    
    // System controls
    if (e.code === 'KeyP') {
        gameState.paused = !gameState.paused;
    }
    
    if (e.code === 'KeyR' && gameState.currentState === 'gameOver') {
        restartGame();
    }
    
    e.preventDefault();
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

function restartGame() {
    gameState.round = 1;
    gameState.roundTimer = 99;
    gameState.currentState = 'fighting';
    gameState.winner = null;
    
    // Reset fighters
    initializeFighters();
    
    // New random stage
    initializeStage();
}

// =====================================================
// MOBILE CONTROLS ADAPTATION
// =====================================================

// Detect mobile device
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                 (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);

if (isMobile) {
    // Show mobile controls
    const mobileControls = document.getElementById('mobileControls');
    if (mobileControls) {
        mobileControls.classList.add('active');
        setupMobileControls();
    }
}

function setupMobileControls() {
    // Add touch event listeners for mobile controls
    const buttons = document.querySelectorAll('.dpad-button, .action-button, .weapon-button');
    
    buttons.forEach(button => {
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const key = button.getAttribute('data-key');
            if (key) {
                keys[key] = true;
                button.classList.add('pressed');
            }
        });
        
        button.addEventListener('touchend', (e) => {
            e.preventDefault();
            const key = button.getAttribute('data-key');
            if (key) {
                keys[key] = false;
                button.classList.remove('pressed');
            }
        });
    });
}

// =====================================================
// FULLSCREEN SUPPORT
// =====================================================

const fullscreenBtn = document.getElementById('fullscreenBtn');
if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', toggleFullscreen);
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}

// Update fullscreen button state
document.addEventListener('fullscreenchange', () => {
    const btn = document.getElementById('fullscreenBtn');
    if (btn) {
        btn.classList.toggle('fullscreen-active', !!document.fullscreenElement);
    }
});

// =====================================================
// GAME INITIALIZATION
// =====================================================

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    initGame();
});

// Handle window resize
window.addEventListener('resize', () => {
    // Maintain aspect ratio and center canvas
    const container = document.getElementById('gameContainer');
    if (container) {
        const containerRect = container.getBoundingClientRect();
        const aspectRatio = CANVAS_WIDTH / CANVAS_HEIGHT;
        
        let newWidth = containerRect.width;
        let newHeight = containerRect.width / aspectRatio;
        
        if (newHeight > containerRect.height) {
            newHeight = containerRect.height;
            newWidth = containerRect.height * aspectRatio;
        }
        
        canvas.style.width = newWidth + 'px';
        canvas.style.height = newHeight + 'px';
    }
});

console.log('🥊 Classic Arcade Fighting Game - Pixel Warriors loaded!');
console.log('🎮 Player 1: Arrow Keys + Z/X/C/V');
console.log('🎮 Player 2: WASD + F/G/H/T');
console.log('⚔️ Fight for glory in authentic 16-bit style!');
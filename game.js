const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Configurações da tela adaptável
let CANVAS_WIDTH = 800;  // Valor inicial, será atualizado
let CANVAS_HEIGHT = 600; // Valor inicial, será atualizado

const frameWidth = 48;
const frameHeight = 64;
const scale = 1.5; // Personagem menor, mais próximo do Contra original

// Sistema de jogo inspirado no Contra
const gameState = {
    score: 0,
    lives: 3,
    level: 1,
    paused: false,
    gameOver: false
};

// === SISTEMA DE SONS ===
const gameAudio = {
    enabled: true,
    volume: 0.3,
    sounds: {
        // Sons básicos
        shoot: new Audio(),
        enemyHit: new Audio(),
        enemyDestroy: new Audio(),
        playerHit: new Audio(),
        jump: new Audio(),
        powerup: new Audio(),
        
        // Sons especiais
        chainAttack: new Audio(),
        celebration: new Audio(),
        levelUp: new Audio(),
        gameOver: new Audio(),
        
        // Sons de fundo
        bgMusic: new Audio()
    }
};

// Configurar sons (usando geradores de frequência como fallback)
function initializeSounds() {
    // Configurar caminhos dos sons (quando disponíveis)
    gameAudio.sounds.shoot.src = 'assets/sounds/shoot.mp3';
    gameAudio.sounds.enemyHit.src = 'assets/sounds/enemy_hit.mp3';
    gameAudio.sounds.enemyDestroy.src = 'assets/sounds/enemy_destroy.mp3';
    gameAudio.sounds.playerHit.src = 'assets/sounds/player_hit.mp3';
    gameAudio.sounds.jump.src = 'assets/sounds/jump.mp3';
    gameAudio.sounds.powerup.src = 'assets/sounds/powerup.mp3';
    gameAudio.sounds.chainAttack.src = 'assets/sounds/chain_attack.mp3';
    gameAudio.sounds.celebration.src = 'assets/sounds/celebration.mp3';
    gameAudio.sounds.levelUp.src = 'assets/sounds/level_up.mp3';
    gameAudio.sounds.gameOver.src = 'assets/sounds/game_over.mp3';
    gameAudio.sounds.bgMusic.src = 'assets/sounds/background.mp3';
    
    // Configurar propriedades dos sons
    gameAudio.sounds.bgMusic.loop = true;
    gameAudio.sounds.bgMusic.volume = 0.1;
    
    // Configurar volumes individuais
    Object.values(gameAudio.sounds).forEach(sound => {
        if (sound !== gameAudio.sounds.bgMusic) {
            sound.volume = gameAudio.volume;
        }
    });
}

// Função para tocar som com fallback para geração de frequência
function playSound(soundName, frequency = 440, duration = 200) {
    if (!gameAudio.enabled) return;
    
    const sound = gameAudio.sounds[soundName];
    if (sound && sound.src && sound.readyState >= 2) {
        // Som carregado, tocar normalmente
        sound.currentTime = 0;
        sound.play().catch(e => console.log('Erro ao tocar som:', e));
    } else {
        // Fallback: gerar som com Web Audio API
        generateSound(frequency, duration);
    }
}

// Gerador de som usando Web Audio API
function generateSound(frequency, duration, type = 'sine') {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(gameAudio.volume * 0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (e) {
        console.log('Web Audio não suportado:', e);
    }
}

// Arrays para gerenciar elementos do jogo
const bullets = [];
const enemies = [];
const powerups = [];
const explosions = [];
const particles = [];

// Imagens do jogo - Sistema avançado com sprites específicas
const playerImages = {
    // Spritesheet original para animação básica
    spritesheet: new Image(),
    
    // Sprites específicas para ações especiais
    corrente_mao_esquerda: new Image(),
    corrente_duas_maos: new Image(),
    maos_para_cima: new Image(),
    arma_para_cima: new Image(),
    
    // === NOVAS IMAGENS DE TIRO EM MÚLTIPLOS ÂNGULOS ===
    arma_disparando_cima: new Image(),
    arma_disparando_frente: new Image(),
    arma_disparando_60_baixo: new Image(),
    arma_disparando_90_graus: new Image()
};

// Carregar todas as imagens da Juliette
playerImages.spritesheet.src = 'assets/juliette_animated_spritesheet.png';
playerImages.corrente_mao_esquerda.src = 'assets/01 corrente mao esquerda.png';
playerImages.corrente_duas_maos.src = 'assets/01 corrente nas 2 maos.png';
playerImages.maos_para_cima.src = 'assets/01 maos para cima.png';
playerImages.arma_para_cima.src = 'assets/02 arma para cima.png';

// === CARREGAR NOVAS IMAGENS DE TIRO ===
playerImages.arma_disparando_cima.src = 'assets/03 arma para cima disparando.png';
playerImages.arma_disparando_frente.src = 'assets/03 arma disparando para frente.png';
playerImages.arma_disparando_60_baixo.src = 'assets/03 arma para cima disparando 60 graus para baixo.png';
playerImages.arma_disparando_90_graus.src = 'assets/03 arma para cima disparando 90 graus.png';

// Imagens de fundo
const backgroundImg = new Image();
backgroundImg.src = 'assets/fundo 2d.png';

const backgroundImgA = new Image();
backgroundImgA.src = 'assets/fundo 2d a.png';

const sceneImg = new Image();
sceneImg.src = 'assets/cena01.jpg';

// Sistema de animações avançado com sprites específicas
const animations = {
    // === ANIMAÇÕES BÁSICAS (spritesheet) ===
    // SEM ARMA
    idle_noweapon: { 
        type: 'spritesheet', 
        start: 0, end: 0, speed: 60, row: 0,
        description: 'Parada sem arma' 
    },
    walk_noweapon: { 
        type: 'spritesheet', 
        start: 0, end: 0, speed: 12, row: 0,
        description: 'Caminhada sem arma' 
    },
    
    // COM ARMA
    idle_weapon: { 
        type: 'spritesheet', 
        start: 1, end: 1, speed: 60, row: 0,
        description: 'Parada com arma' 
    },
    walk_weapon: { 
        type: 'spritesheet', 
        start: 1, end: 5, speed: 12, row: 0,
        description: 'Caminhada com arma' 
    },
    attack_weapon: { 
        type: 'spritesheet', 
        start: 1, end: 5, speed: 8, row: 1,
        description: 'Ataque com arma horizontal' 
    },
    
    // === ANIMAÇÕES ESPECIAIS (sprites individuais) ===
    // Ações com correntes
    chain_left_hand: { 
        type: 'sprite', 
        image: 'corrente_mao_esquerda', 
        duration: 30,
        description: 'Corrente na mão esquerda' 
    },
    chain_both_hands: { 
        type: 'sprite', 
        image: 'corrente_duas_maos', 
        duration: 45,
        description: 'Corrente nas duas mãos' 
    },
    
    // Ações com as mãos para cima
    hands_up: { 
        type: 'sprite', 
        image: 'maos_para_cima', 
        duration: 40,
        description: 'Mãos para cima (celebração/rendição)' 
    },
    
    // Ações com arma para cima
    weapon_up: { 
        type: 'sprite', 
        image: 'arma_para_cima', 
        duration: 35,
        description: 'Arma apontada para cima' 
    },
    
    // === NOVAS ANIMAÇÕES DE TIRO EM MÚLTIPLOS ÂNGULOS ===
    weapon_shoot_up: { 
        type: 'sprite', 
        image: 'arma_disparando_cima', 
        duration: 15,
        description: 'Disparando para cima' 
    },
    weapon_shoot_front: { 
        type: 'sprite', 
        image: 'arma_disparando_frente', 
        duration: 15,
        description: 'Disparando para frente' 
    },
    weapon_shoot_diagonal_down: { 
        type: 'sprite', 
        image: 'arma_disparando_60_baixo', 
        duration: 15,
        description: 'Disparando 60° para baixo' 
    },
    weapon_shoot_90: { 
        type: 'sprite', 
        image: 'arma_disparando_90_graus', 
        duration: 15,
        description: 'Disparando em 90 graus' 
    }
};

// Variáveis de controle do jogador
let hasWeapon = false;
let currentAnim = 'idle_noweapon';  // Começa parado SEM ARMA
let frameIndex = 0;
let frameCounter = 0;
let posX = 100;
let posY = 0; // Será calculado dinamicamente
let moving = false;
let attacking = false;
let facingRight = true;
let playerSpeed = 4;
let playerHealth = 100;
let canShoot = true;
let shootCooldown = 0;
let weaponType = 'none'; // none, normal, spread, laser, machine
let invulnerable = false;
let invulnerableTime = 0;

// === NOVAS VARIÁVEIS PARA ANIMAÇÕES ESPECIAIS ===
let specialAnimTimer = 0;  // Timer para animações especiais
let isInSpecialAnim = false;  // Flag para controlar animações especiais
let previousAnim = 'idle_noweapon';  // Para voltar à animação anterior

// Sistema de armas especiais/correntes
let chainWeaponActive = false;
let chainWeaponType = 'none'; // 'left_hand', 'both_hands'
let chainAttackCooldown = 0;

// Sistema de celebração/vitória
let celebrationMode = false;
let celebrationTimer = 0;

// Sistema de tiro vertical
let shootingUp = false;
let shootingUpTimer = 0;

// Física do jogador (estilo Contra)
let velocityY = 0;
let onGround = false;
let jumpPower = -12;
const gravity = 0.6;
const groundLevel = CANVAS_HEIGHT - (frameHeight * scale) - 20;
let maxJumpHeight = 150;

// Sistema de plataformas (como no Contra)
const platforms = [
    // Plataformas principais (chão)
    { x: 0, y: groundLevel + (frameHeight * scale), width: CANVAS_WIDTH * 3, height: 50, type: 'ground' },
    
    // Plataformas elevadas (degraus)
    { x: 200, y: groundLevel - 80, width: 150, height: 20, type: 'platform' },
    { x: 450, y: groundLevel - 120, width: 180, height: 20, type: 'platform' },
    { x: 700, y: groundLevel - 60, width: 120, height: 20, type: 'platform' },
    { x: 900, y: groundLevel - 100, width: 160, height: 20, type: 'platform' },
    { x: 1150, y: groundLevel - 140, width: 140, height: 20, type: 'platform' },
    { x: 1400, y: groundLevel - 80, width: 200, height: 20, type: 'platform' },
    
    // Plataformas mais altas
    { x: 350, y: groundLevel - 200, width: 100, height: 20, type: 'platform' },
    { x: 600, y: groundLevel - 180, width: 120, height: 20, type: 'platform' },
    { x: 1000, y: groundLevel - 220, width: 110, height: 20, type: 'platform' },
    
    // Plataformas de dificuldade (mais distantes)
    { x: 1300, y: groundLevel - 200, width: 80, height: 20, type: 'platform' },
    { x: 1500, y: groundLevel - 160, width: 100, height: 20, type: 'platform' }
];

// Configurações de armas (inspirado no Contra)
const weapons = {
    normal: { damage: 20, speed: 8, cooldown: 10, color: '#ffff00' },
    spread: { damage: 15, speed: 7, cooldown: 8, color: '#ff4444' },
    laser: { damage: 30, speed: 12, cooldown: 15, color: '#44ff44' },
    machine: { damage: 12, speed: 10, cooldown: 4, color: '#4444ff' }
};

// Variáveis da animação do cenário
let backgroundX = 0;
let backgroundSpeed = 2.5; // Velocidade aumentada
let backgroundScrolling = false;
let parallaxOffset = 0; // Para efeito parallax

// Controles do teclado
const keys = {};

document.addEventListener('keydown', e => {
    keys[e.code] = true;
    
    // === CONTROLES BÁSICOS ===
    if (e.code === 'ArrowRight') {
        if (!isInSpecialAnim) {
            moving = true;
            facingRight = true;
            backgroundScrolling = true;
        }
    }
    if (e.code === 'ArrowLeft') {
        if (!isInSpecialAnim) {
            moving = true;
            facingRight = false;
            backgroundScrolling = true;
        }
    }
    if (e.code === 'ArrowUp') {
        // NOVO: Tiro para cima + pulo
        if (hasWeapon && onGround && !isInSpecialAnim) {
            // Ativa animação de tiro para cima
            startSpecialAnimation('weapon_up');
        } else if (!isInSpecialAnim) {
            jump();
        }
    }
    if (e.code === 'ArrowDown') {
        // Agachar (manter funcionalidade original)
        if (posY < CANVAS_HEIGHT - (frameHeight * scale) - 100) posY += playerSpeed;
    }
    
    // === CONTROLES DE COMBATE ===
    if (e.code === 'Space' || e.code === 'KeyX') {
        if (!isInSpecialAnim) {
            // Tiro normal ou tiro para cima
            if (keys['ArrowUp'] && hasWeapon) {
                shootUp();
                startSpecialAnimation('weapon_shoot_up');
            } else {
                shoot();
                attacking = true;
            }
        }
    }
    
    if (e.code === 'KeyZ') {
        if (!isInSpecialAnim) {
            jump();
        }
    }
    
    // === NOVOS CONTROLES ESPECIAIS ===
    if (e.code === 'KeyA') {
        // Ataque com corrente (mão esquerda)
        if (!isInSpecialAnim && chainAttackCooldown === 0) {
            chainAttack('left_hand');
        }
    }
    
    if (e.code === 'KeyS') {
        // Ataque com corrente (ambas as mãos)
        if (!isInSpecialAnim && chainAttackCooldown === 0) {
            chainAttack('both_hands');
        }
    }
    
    if (e.code === 'KeyC') {
        // Celebração/Mãos para cima
        if (!isInSpecialAnim) {
            startSpecialAnimation('hands_up');
            celebrationMode = true;
            
            // Som de celebração
            playSound('celebration', 550, 500);
        }
    }
    
    // === CONTROLES DE SISTEMA ===
    if (e.code === 'KeyR' && gameState.gameOver) {
        restartGame();
    }
    
    if (e.code === 'KeyP') {
        gameState.paused = !gameState.paused;
    }
    
    if (e.code === 'F11') {
        e.preventDefault();
        toggleFullscreen();
    }
    
    if (e.code === 'KeyM') {
        // Alternar sons
        gameAudio.enabled = !gameAudio.enabled;
        console.log('Sons:', gameAudio.enabled ? 'Ligados' : 'Desligados');
    }
    
    // === CHEAT CODES PARA TESTE ===
    if (e.code === 'Digit1') {
        weaponType = 'normal';
    }
    if (e.code === 'Digit2') {
        weaponType = 'spread';
    }
    if (e.code === 'Digit3') {
        weaponType = 'laser';
    }
    if (e.code === 'Digit4') {
        weaponType = 'machine';
    }
});

document.addEventListener('keyup', e => {
    keys[e.code] = false;
    
    if (e.code === 'ArrowRight' || e.code === 'ArrowLeft') {
        moving = false;
        backgroundScrolling = false;
    }
    if (e.code === 'Space') {
        attacking = false;
    }
});

// Função de tiro (inspirada no Contra)
function shoot() {
    if (!canShoot || shootCooldown > 0 || weaponType === 'none') return;
    
    const weapon = weapons[weaponType];
    const playerCenterX = posX + (frameWidth * scale) / 2;
    const playerCenterY = posY + (frameHeight * scale) / 2;
    
    // Som de tiro baseado na arma
    let shootFreq = 440;
    switch(weaponType) {
        case 'normal': shootFreq = 440; break;
        case 'spread': shootFreq = 520; break;
        case 'laser': shootFreq = 660; break;
        case 'machine': shootFreq = 380; break;
    }
    playSound('shoot', shootFreq, 150);
    
    // Determinar direção do tiro baseado nas teclas pressionadas
    let shootDirection = getShootDirection();
    
    // === NOVO: SISTEMA DE ANIMAÇÃO INTELIGENTE BASEADO NO ÂNGULO ===
    triggerShootAnimation(shootDirection.angle);
    
    switch(weaponType) {
        case 'normal':
            createDirectionalBullet(playerCenterX, playerCenterY, shootDirection, weapon);
            break;
            
        case 'spread':
            // Tiro triplo como no Contra, mas com direção
            createDirectionalBullet(playerCenterX, playerCenterY, shootDirection, weapon);
            // Tiros adicionais com pequeno ângulo
            createDirectionalBullet(playerCenterX, playerCenterY, 
                { angle: shootDirection.angle + 15, speed: shootDirection.speed }, weapon);
            createDirectionalBullet(playerCenterX, playerCenterY, 
                { angle: shootDirection.angle - 15, speed: shootDirection.speed }, weapon);
            break;
            
        case 'laser':
            createDirectionalBullet(playerCenterX, playerCenterY, shootDirection, weapon, 'laser');
            break;
            
        case 'machine':
            createDirectionalBullet(playerCenterX, playerCenterY, shootDirection, weapon);
            break;
    }
    
    shootCooldown = weapon.cooldown;
}

// Função para determinar direção do tiro baseado nas teclas
function getShootDirection() {
    const baseSpeed = weapons[weaponType].speed;
    
    // === SISTEMA DE TIRO MULTI-DIRECIONAL AVANÇADO ===
    
    // Direções transversais para cima + lado direito com variação completa
    if (keys['ArrowUp'] && keys['ArrowRight']) {
        // Múltiplos ângulos para nordeste: 15°, 22.5°, 30°, 37.5°, 45°
        const angles = [-15, -22.5, -30, -37.5, -45];
        const chosenAngle = angles[Math.floor(Math.random() * angles.length)];
        return { angle: chosenAngle, speed: baseSpeed };
    }
    
    // Direções transversais para cima + lado esquerdo com variação
    if (keys['ArrowUp'] && keys['ArrowLeft']) {
        // Múltiplos ângulos para noroeste: 135°, 142.5°, 150°, 157.5°, 165°
        const angles = [-135, -142.5, -150, -157.5, -165];
        const chosenAngle = angles[Math.floor(Math.random() * angles.length)];
        return { angle: chosenAngle, speed: baseSpeed };
    }
    
    // Direções transversais para baixo + lado direito com variação
    if (keys['ArrowDown'] && keys['ArrowRight']) {
        // Múltiplos ângulos para sudeste: 15°, 22.5°, 30°, 37.5°, 45°
        const angles = [15, 22.5, 30, 37.5, 45];
        const chosenAngle = angles[Math.floor(Math.random() * angles.length)];
        return { angle: chosenAngle, speed: baseSpeed };
    }
    
    // Direções transversais para baixo + lado esquerdo com variação
    if (keys['ArrowDown'] && keys['ArrowLeft']) {
        // Múltiplos ângulos para sudoeste: 135°, 142.5°, 150°, 157.5°, 165°
        const angles = [135, 142.5, 150, 157.5, 165];
        const chosenAngle = angles[Math.floor(Math.random() * angles.length)];
        return { angle: chosenAngle, speed: baseSpeed };
    }
    
    // === DIREÇÕES CARDEAIS COM VARIAÇÕES ===
    
    // Tiro para cima com pequenas variações
    if (keys['ArrowUp']) {
        const angles = [-90, -85, -95]; // Principalmente vertical com leve variação
        const chosenAngle = angles[Math.floor(Math.random() * angles.length)];
        return { angle: chosenAngle, speed: baseSpeed };
    }
    
    // Tiro para baixo com pequenas variações
    if (keys['ArrowDown']) {
        const angles = [90, 85, 95]; // Principalmente vertical com leve variação
        const chosenAngle = angles[Math.floor(Math.random() * angles.length)];
        return { angle: chosenAngle, speed: baseSpeed };
    }
    
    // Tiro para esquerda com variações
    if (keys['ArrowLeft']) {
        const angles = [180, 175, 185, 170, 190]; // Horizontal com variações
        const chosenAngle = angles[Math.floor(Math.random() * angles.length)];
        return { angle: chosenAngle, speed: baseSpeed };
    }
    
    // Tiro para direita com variações
    if (keys['ArrowRight']) {
        const angles = [0, -5, 5, -10, 10]; // Horizontal com variações
        const chosenAngle = angles[Math.floor(Math.random() * angles.length)];
        return { angle: chosenAngle, speed: baseSpeed };
    }
    
    // === DIREÇÃO PADRÃO COM VARIAÇÃO BASEADA NA DIREÇÃO ===
    if (facingRight) {
        // Tiro padrão para direita com leve variação
        const angles = [0, -3, 3, -7, 7];
        const chosenAngle = angles[Math.floor(Math.random() * angles.length)];
        return { angle: chosenAngle, speed: baseSpeed };
    } else {
        // Tiro padrão para esquerda com leve variação
        const angles = [180, 177, 183, 173, 187];
        const chosenAngle = angles[Math.floor(Math.random() * angles.length)];
        return { angle: chosenAngle, speed: baseSpeed };
    }
}

// Criar bala com direção específica
function createDirectionalBullet(x, y, direction, weapon, type = 'normal') {
    const angleRad = (direction.angle * Math.PI) / 180;
    const vx = Math.cos(angleRad) * direction.speed;
    const vy = Math.sin(angleRad) * direction.speed;
    
    createBullet(x, y, vx, vy, weapon, type);
}

// Criar bala
function createBullet(x, y, vx, vy, weapon, type = 'normal') {
    bullets.push({
        x: x,
        y: y,
        vx: vx,
        vy: vy,
        damage: weapon.damage,
        color: weapon.color,
        type: type,
        size: type === 'laser' ? 8 : 4,
        life: 120
    });
}

// Função de pulo (nova física)
function jump() {
    if (onGround) {
        velocityY = jumpPower;
        onGround = false;
        
        // Som de pulo
        playSound('jump', 330, 200);
    }
}

// Verificar colisão com plataformas
function checkPlatformCollisions() {
    const playerRect = {
        x: posX,
        y: posY,
        width: frameWidth * scale,
        height: frameHeight * scale
    };
    
    onGround = false;
    
    for (const platform of platforms) {
        // Ajustar posição da plataforma com o scroll
        const platformX = platform.x + backgroundX;
        
        // Verifica se está sobre a plataforma
        if (playerRect.x + playerRect.width > platformX && 
            playerRect.x < platformX + platform.width) {
            
            // Colisão por cima (pousando na plataforma)
            if (playerRect.y + playerRect.height > platform.y && 
                playerRect.y + playerRect.height < platform.y + platform.height + 10 &&
                velocityY >= 0) {
                
                posY = platform.y - playerRect.height;
                velocityY = 0;
                onGround = true;
            }
        }
    }
    
    // Verifica colisão com o chão (usando valor dinâmico)
    const currentGroundLevel = CANVAS_HEIGHT - (frameHeight * scale) - 20;
    if (posY + playerRect.height >= currentGroundLevel) {
        posY = currentGroundLevel - playerRect.height;
        velocityY = 0;
        onGround = true;
    }
}

// Desenhar plataformas com efeitos cyberpunk
function drawPlatforms() {
    const time = Date.now() * 0.005;
    
    for (const platform of platforms) {
        const platformX = platform.x + backgroundX;
        
        // Só desenha se estiver visível na tela
        if (platformX + platform.width > -50 && platformX < CANVAS_WIDTH + 50) {
            // Efeito cyberpunk piscante verde brilhante
            const glowIntensity = Math.sin(time * 3) * 0.3 + 0.7;
            const pulseIntensity = Math.sin(time * 5 + platform.x * 0.01) * 0.2 + 0.8;
            
            // Cor base da plataforma com efeito piscante
            const baseColor = `rgba(0, ${Math.floor(255 * glowIntensity)}, 0, ${pulseIntensity})`;
            const edgeColor = `rgba(0, ${Math.floor(255 * glowIntensity * 1.2)}, 50, ${pulseIntensity * 1.1})`;
            
            // Sombra/glow cyberpunk
            ctx.save();
            ctx.shadowColor = `rgb(0, ${Math.floor(255 * glowIntensity)}, 0)`;
            ctx.shadowBlur = 15 * glowIntensity;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            
            // Corpo principal da plataforma
            ctx.fillStyle = baseColor;
            ctx.fillRect(platformX, platform.y, platform.width, platform.height);
            
            // Borda superior brilhante
            ctx.fillStyle = edgeColor;
            ctx.fillRect(platformX, platform.y, platform.width, 3);
            
            // Linhas de energia piscantes
            for (let i = 0; i < platform.width; i += 30) {
                const lineIntensity = Math.sin(time * 4 + i * 0.1) * 0.3 + 0.7;
                ctx.fillStyle = `rgba(0, ${Math.floor(255 * lineIntensity)}, 100, ${lineIntensity})`;
                ctx.fillRect(platformX + i + 2, platform.y + 2, 2, platform.height - 4);
            }
            
            // Partículas de energia
            for (let i = 0; i < 3; i++) {
                const particleX = platformX + (Math.sin(time * 2 + i) * platform.width * 0.3) + platform.width * 0.5;
                const particleY = platform.y - 5 - (Math.abs(Math.sin(time * 3 + i)) * 8);
                const particleSize = 2 + Math.sin(time * 4 + i) * 1;
                
                ctx.fillStyle = `rgba(0, 255, 0, ${glowIntensity})`;
                ctx.beginPath();
                ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
        }
    }
}

// Desenhar limite de solo (linha preta abaixo do jogo)
function drawGroundLimit() {
    const groundY = CANVAS_HEIGHT - (frameHeight * scale) - 20;
    const time = Date.now() * 0.003;
    
    ctx.save();
    
    // Linha preta principal do solo
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(0, groundY + (frameHeight * scale));
    ctx.lineTo(CANVAS_WIDTH, groundY + (frameHeight * scale));
    ctx.stroke();
    
    // Linha adicional mais espessa para delimitar bem
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(0, groundY + (frameHeight * scale) + 5);
    ctx.lineTo(CANVAS_WIDTH, groundY + (frameHeight * scale) + 5);
    ctx.stroke();
    
    // Efeito cyberpunk no limite - linhas piscantes verdes
    const glowIntensity = Math.sin(time * 4) * 0.4 + 0.6;
    ctx.shadowColor = `rgb(0, ${Math.floor(255 * glowIntensity)}, 0)`;
    ctx.shadowBlur = 10;
    ctx.strokeStyle = `rgba(0, ${Math.floor(255 * glowIntensity)}, 0, ${glowIntensity})`;
    ctx.lineWidth = 2;
    
    // Linhas de energia correndo ao longo do limite
    for (let x = 0; x < CANVAS_WIDTH; x += 50) {
        const offset = Math.sin(time * 3 + x * 0.01) * 3;
        ctx.beginPath();
        ctx.moveTo(x, groundY + (frameHeight * scale) + offset);
        ctx.lineTo(x + 30, groundY + (frameHeight * scale) + offset);
        ctx.stroke();
    }
    
    ctx.restore();
}

// Atualizar física do jogador
function updatePlayerPhysics() {
    // Aplicar gravidade
    if (!onGround) {
        velocityY += gravity;
    }
    
    // Atualizar posição vertical
    posY += velocityY;
    
    // Verificar colisões com plataformas
    checkPlatformCollisions();
    
    // Limitar a altura máxima (teto)
    if (posY < 80) {
        posY = 80;
        velocityY = 0;
    }
}

// Criar inimigo
function createEnemy(type = 'soldier') {
    const enemyTypes = {
        soldier: {
            health: 30,
            damage: 15,
            speed: 2,
            color: '#ff4444',
            size: 20,
            shootChance: 0.02
        },
        robot: {
            health: 60,
            damage: 25,
            speed: 1,
            color: '#4444ff',
            size: 30,
            shootChance: 0.01
        }
    };
    
    const enemy = enemyTypes[type];
    enemies.push({
        x: CANVAS_WIDTH + 50,
        y: Math.random() * (CANVAS_HEIGHT - 200) + 100,
        vx: -enemy.speed,
        vy: 0,
        health: enemy.health,
        maxHealth: enemy.health,
        damage: enemy.damage,
        color: enemy.color,
        size: enemy.size,
        type: type,
        shootChance: enemy.shootChance,
        shootCooldown: 0,
        
        // === NOVO: SISTEMA DE ÁTOMOS ORBITANTES ===
        atomOrbs: {
            count: type === 'robot' ? 4 : 3, // Robôs têm mais átomos
            orbs: [],
            rotationSpeed: type === 'robot' ? 0.03 : 0.05, // Robôs giram mais devagar
            radius: type === 'robot' ? 45 : 35,
            initialized: false
        }
    });
    
    // Inicializar átomos orbitantes
    const newEnemy = enemies[enemies.length - 1];
    initializeEnemyAtoms(newEnemy);
}

// === NOVA FUNÇÃO: INICIALIZAR ÁTOMOS ORBITANTES DOS INIMIGOS ===
function initializeEnemyAtoms(enemy) {
    enemy.atomOrbs.orbs = [];
    
    for (let i = 0; i < enemy.atomOrbs.count; i++) {
        const angle = (i / enemy.atomOrbs.count) * Math.PI * 2;
        const orb = {
            angle: angle,
            initialAngle: angle,
            radius: enemy.atomOrbs.radius,
            size: Math.random() * 3 + 2, // Tamanho variado
            speed: enemy.atomOrbs.rotationSpeed + (Math.random() * 0.02 - 0.01), // Velocidade variada
            color: enemy.type === 'robot' ? 
                ['#00FFFF', '#0080FF', '#4040FF'][i % 3] : 
                ['#FF4040', '#FF8040', '#FFFF40'][i % 3],
            pulse: Math.random() * Math.PI * 2, // Para efeito pulsante
            orbit: {
                // Órbitas variadas para efeito mais realista
                radiusVariation: Math.random() * 10 + 5,
                tiltAngle: Math.random() * Math.PI * 0.3, // Inclinação da órbita
                eccentricity: Math.random() * 0.3 // Excentricidade da órbita
            }
        };
        enemy.atomOrbs.orbs.push(orb);
    }
    
    enemy.atomOrbs.initialized = true;
}

// Criar power-up
function createPowerup(x, y, type = 'random') {
    const powerupTypes = ['normal', 'spread', 'laser', 'machine', 'health', 'life'];
    if (type === 'random') {
        type = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
    }
    
    powerups.push({
        x: x,
        y: y,
        type: type,
        size: 15,
        bounce: 0,
        collected: false
    });
}

// Criar explosão
function createExplosion(x, y, size = 30) {
    explosions.push({
        x: x,
        y: y,
        size: 5,
        maxSize: size,
        life: 20,
        maxLife: 20
    });
    
    // Criar partículas
    for (let i = 0; i < 8; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            life: 30,
            color: Math.random() > 0.5 ? '#ff6644' : '#ffaa44',
            size: Math.random() * 4 + 2
        });
    }
}

// Atualizar balas
function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;
        bullet.life--;
        
        // Remove bala se saiu da tela ou morreu
        if (bullet.x < -20 || bullet.x > CANVAS_WIDTH + 20 || 
            bullet.y < -20 || bullet.y > CANVAS_HEIGHT + 20 || 
            bullet.life <= 0) {
            bullets.splice(i, 1);
        }
    }
}

// Atualizar inimigos
function updateEnemies() {
    const time = Date.now() * 0.001;
    
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.x += enemy.vx;
        enemy.y += enemy.vy;
        
        // === ATUALIZAR ÁTOMOS ORBITANTES ===
        updateEnemyAtoms(enemy, time);
        
        // IA básica do inimigo
        if (enemy.shootCooldown > 0) enemy.shootCooldown--;
        
        // Inimigo atira ocasionalmente
        if (Math.random() < enemy.shootChance && enemy.shootCooldown === 0) {
            createEnemyBullet(enemy.x, enemy.y + enemy.size/2, -5, 0);
            enemy.shootCooldown = 60;
        }
        
        // Remove inimigo se saiu da tela
        if (enemy.x < -50) {
            enemies.splice(i, 1);
        }
    }
}

// === NOVA FUNÇÃO: ATUALIZAR ÁTOMOS ORBITANTES ===
function updateEnemyAtoms(enemy, time) {
    if (!enemy.atomOrbs.initialized) return;
    
    const centerX = enemy.x + enemy.size / 2;
    const centerY = enemy.y + enemy.size / 2;
    
    // Atualizar cada átomo orbitante
    for (let orb of enemy.atomOrbs.orbs) {
        // Atualizar ângulo de rotação
        orb.angle += orb.speed;
        
        // Atualizar pulso para efeito piscante
        orb.pulse += 0.1;
        
        // Calcular posição com órbita elíptica e inclinada
        const baseRadius = orb.radius + Math.sin(orb.pulse) * orb.orbit.radiusVariation;
        const eccentricRadius = baseRadius * (1 + orb.orbit.eccentricity * Math.cos(orb.angle * 2));
        
        // Posição da órbita com inclinação
        const orbX = Math.cos(orb.angle) * eccentricRadius;
        const orbY = Math.sin(orb.angle) * eccentricRadius * Math.cos(orb.orbit.tiltAngle);
        
        // Posição final do átomo
        orb.x = centerX + orbX;
        orb.y = centerY + orbY;
        
        // Tamanho pulsante
        orb.currentSize = orb.size + Math.sin(orb.pulse) * 0.5;
        
        // Alpha pulsante para efeito de energia
        orb.alpha = 0.6 + Math.sin(orb.pulse * 1.5) * 0.4;
    }
}

// Criar bala inimiga
function createEnemyBullet(x, y, vx, vy) {
    bullets.push({
        x: x,
        y: y,
        vx: vx,
        vy: vy,
        damage: 20,
        color: '#ff4444',
        type: 'enemy',
        size: 3,
        life: 120
    });
}

// Atualizar power-ups
function updatePowerups() {
    for (let i = powerups.length - 1; i >= 0; i--) {
        const powerup = powerups[i];
        powerup.bounce += 0.2;
        powerup.y += Math.sin(powerup.bounce) * 0.5;
        
        // Remove power-up se saiu da tela
        if (powerup.x < -30) {
            powerups.splice(i, 1);
        }
    }
}

// Atualizar explosões
function updateExplosions() {
    for (let i = explosions.length - 1; i >= 0; i--) {
        const explosion = explosions[i];
        explosion.life--;
        explosion.size = (explosion.maxSize * explosion.life) / explosion.maxLife;
        
        if (explosion.life <= 0) {
            explosions.splice(i, 1);
        }
    }
}

// Atualizar partículas
function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.98;
        particle.vy *= 0.98;
        particle.life--;
        
        if (particle.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

// Função para desenhar o fundo com scroll
function drawBackground() {
    // Atualiza posição do fundo se estiver movendo
    if (backgroundScrolling) {
        if (facingRight) {
            backgroundX -= backgroundSpeed;
        } else {
            backgroundX += backgroundSpeed;
        }
    }
    
    // Desenha o fundo principal (repetindo para criar scroll infinito)
    const bgWidth = CANVAS_WIDTH;
    const bgHeight = CANVAS_HEIGHT;
    
    // Calcula quantas repetições do fundo são necessárias
    const numRepeats = Math.ceil(CANVAS_WIDTH / bgWidth) + 2;
    
    for (let i = -1; i < numRepeats; i++) {
        const x = (backgroundX % bgWidth) + (i * bgWidth);
        
        // Desenha a cena como fundo
        if (sceneImg.complete) {
            ctx.drawImage(sceneImg, x, 0, bgWidth, bgHeight);
        }
        
        // Sobrepõe o fundo 2D se disponível
        if (backgroundImg.complete) {
            ctx.globalAlpha = 0.7;
            ctx.drawImage(backgroundImg, x, 0, bgWidth, bgHeight);
            ctx.globalAlpha = 1.0;
        }
    }
}

// === NOVAS FUNÇÕES PARA ANIMAÇÕES ESPECIAIS ===

// === NOVA FUNÇÃO: SISTEMA INTELIGENTE DE ANIMAÇÃO DE TIRO ===
function triggerShootAnimation(angle) {
    if (!hasWeapon || isInSpecialAnim) return;
    
    // Normalizar ângulo para range 0-360
    let normalizedAngle = angle;
    while (normalizedAngle < 0) normalizedAngle += 360;
    while (normalizedAngle >= 360) normalizedAngle -= 360;
    
    // Selecionar animação baseada no ângulo
    let selectedAnimation = 'weapon_shoot_front'; // padrão
    
    // Mapear ângulos para animações específicas
    if ((normalizedAngle >= 315 && normalizedAngle <= 360) || (normalizedAngle >= 0 && normalizedAngle <= 45)) {
        // Tiros horizontais (direita e diagonais próximas) - 0°, ±15°, ±30°, ±45°
        selectedAnimation = 'weapon_shoot_front';
    } else if (normalizedAngle >= 46 && normalizedAngle <= 134) {
        // Tiros para baixo (45° a 135°) - usa animação de 60° para baixo
        selectedAnimation = 'weapon_shoot_diagonal_down';
    } else if (normalizedAngle >= 135 && normalizedAngle <= 225) {
        // Tiros para esquerda e diagonais (135° a 225°)
        selectedAnimation = 'weapon_shoot_front'; // Mesmo sprite, mas espelhado
    } else if (normalizedAngle >= 226 && normalizedAngle <= 314) {
        // Tiros para cima (226° a 314°) - usa animações para cima
        if (normalizedAngle >= 270 - 20 && normalizedAngle <= 270 + 20) {
            // Tiro vertical puro (90°) - usa animação específica de 90°
            selectedAnimation = 'weapon_shoot_90';
        } else {
            // Tiros diagonais para cima - usa animação geral para cima
            selectedAnimation = 'weapon_shoot_up';
        }
    }
    
    // Trigger da animação selecionada
    startSpecialAnimation(selectedAnimation);
    
    // Debug: mostrar qual animação foi selecionada
    console.log(`Ângulo: ${angle.toFixed(1)}° → Animação: ${selectedAnimation}`);
}

// Iniciar animação especial
function startSpecialAnimation(animName) {
    const anim = animations[animName];
    if (anim && anim.type === 'sprite') {
        previousAnim = currentAnim;
        currentAnim = animName;
        specialAnimTimer = anim.duration;
        isInSpecialAnim = true;
        frameIndex = 0;
        frameCounter = 0;
    }
}

// Ataque com corrente
function chainAttack(handType) {
    const animName = handType === 'left_hand' ? 'chain_left_hand' : 'chain_both_hands';
    startSpecialAnimation(animName);
    chainWeaponType = handType;
    chainWeaponActive = true;
    chainAttackCooldown = 60;
    
    // Som de ataque com corrente
    playSound('chainAttack', handType === 'both_hands' ? 280 : 320, 400);
    
    // Criar efeitos visuais de corrente
    createChainEffect(handType);
    
    // Dano aos inimigos próximos
    dealChainDamage(handType);
}

// Tiro para cima
function shootUp() {
    if (!canShoot || shootCooldown > 0 || weaponType === 'none') return;
    
    const weapon = weapons[weaponType];
    const playerCenterX = posX + (frameWidth * scale) / 2;
    const playerCenterY = posY + (frameHeight * scale) / 4; // Mais alto para tiro vertical
    
    // Tiro direto para cima
    createBullet(playerCenterX, playerCenterY, 0, -weapon.speed, weapon, 'vertical');
    
    shootCooldown = weapon.cooldown;
    shootingUpTimer = 20;
    shootingUp = true;
}

// Criar efeito visual da corrente
function createChainEffect(handType) {
    const damage = handType === 'both_hands' ? 40 : 25;
    const range = handType === 'both_hands' ? 100 : 70;
    
    // Criar partículas de corrente
    for (let i = 0; i < (handType === 'both_hands' ? 12 : 8); i++) {
        particles.push({
            x: posX + (frameWidth * scale) / 2,
            y: posY + (frameHeight * scale) / 2,
            vx: (Math.random() - 0.5) * 15,
            vy: (Math.random() - 0.5) * 15,
            life: 25,
            color: '#C0C0C0', // Cor prata da corrente
            size: Math.random() * 3 + 2,
            type: 'chain'
        });
    }
}

// Dano da corrente aos inimigos
function dealChainDamage(handType) {
    const damage = handType === 'both_hands' ? 40 : 25;
    const range = handType === 'both_hands' ? 100 : 70;
    
    const playerCenterX = posX + (frameWidth * scale) / 2;
    const playerCenterY = posY + (frameHeight * scale) / 2;
    
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        const distance = Math.sqrt(
            Math.pow(enemy.x + enemy.size/2 - playerCenterX, 2) +
            Math.pow(enemy.y + enemy.size/2 - playerCenterY, 2)
        );
        
        if (distance <= range) {
            enemy.health -= damage;
            createExplosion(enemy.x + enemy.size/2, enemy.y + enemy.size/2, 20);
            
            if (enemy.health <= 0) {
                gameState.score += enemy.type === 'robot' ? 200 : 100;
                enemies.splice(i, 1);
            }
        }
    }
}

// Atualizar animações especiais
function updateSpecialAnimations() {
    // Atualizar timer de animação especial
    if (isInSpecialAnim && specialAnimTimer > 0) {
        specialAnimTimer--;
        
        if (specialAnimTimer <= 0) {
            // Voltar à animação anterior
            currentAnim = previousAnim;
            isInSpecialAnim = false;
            
            // Resetar estados especiais
            chainWeaponActive = false;
            celebrationMode = false;
            shootingUp = false;
        }
    }
    
    // Atualizar cooldowns
    if (chainAttackCooldown > 0) chainAttackCooldown--;
    if (shootingUpTimer > 0) shootingUpTimer--;
    if (celebrationTimer > 0) celebrationTimer--;
}

// Função avançada para desenhar o jogador
function drawPlayer() {
    const anim = animations[currentAnim];
    
    // Verificar se é animação especial (sprite individual)
    if (anim.type === 'sprite') {
        const spriteImage = playerImages[anim.image];
        if (spriteImage && spriteImage.complete) {
            ctx.save();
            
            // Espelhar se necessário
            if (!facingRight) {
                ctx.scale(-1, 1);
                ctx.drawImage(
                    spriteImage,
                    -(posX + frameWidth * scale), posY,
                    frameWidth * scale, frameHeight * scale
                );
            } else {
                ctx.drawImage(
                    spriteImage,
                    posX, posY,
                    frameWidth * scale, frameHeight * scale
                );
            }
            
            ctx.restore();
        }
    } else {
        // Animação normal do spritesheet
        if (playerImages.spritesheet.complete) {
            const sx = frameIndex * frameWidth;
            const sy = anim.row * frameHeight;
            
            ctx.save();
            
            if (!facingRight) {
                ctx.scale(-1, 1);
                ctx.drawImage(
                    playerImages.spritesheet,
                    sx, sy, frameWidth, frameHeight,
                    -(posX + frameWidth * scale), posY,
                    frameWidth * scale, frameHeight * scale
                );
            } else {
                ctx.drawImage(
                    playerImages.spritesheet,
                    sx, sy, frameWidth, frameHeight,
                    posX, posY,
                    frameWidth * scale, frameHeight * scale
                );
            }
            
            ctx.restore();
        }
    }
    
    // Efeitos visuais especiais
    if (chainWeaponActive) {
        drawChainEffect();
    }
    
    if (shootingUp) {
        drawShootingUpEffect();
    }
}

// Efeito visual da corrente
function drawChainEffect() {
    const centerX = posX + (frameWidth * scale) / 2;
    const centerY = posY + (frameHeight * scale) / 2;
    
    ctx.save();
    ctx.strokeStyle = '#C0C0C0';
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.7;
    
    // Desenhar linhas de corrente
    const range = chainWeaponType === 'both_hands' ? 100 : 70;
    const numLines = chainWeaponType === 'both_hands' ? 8 : 4;
    
    for (let i = 0; i < numLines; i++) {
        const angle = (i / numLines) * Math.PI * 2;
        const endX = centerX + Math.cos(angle) * range;
        const endY = centerY + Math.sin(angle) * range;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
    }
    
    ctx.restore();
}

// Efeito visual do tiro para cima
function drawShootingUpEffect() {
    const centerX = posX + (frameWidth * scale) / 2;
    const centerY = posY;
    
    ctx.save();
    ctx.fillStyle = '#FFD700';
    ctx.globalAlpha = 0.6;
    
    // Raio de luz para cima
    ctx.beginPath();
    ctx.moveTo(centerX - 5, centerY);
    ctx.lineTo(centerX + 5, centerY);
    ctx.lineTo(centerX + 2, centerY - 50);
    ctx.lineTo(centerX - 2, centerY - 50);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
}

// Função para atualizar o estado da animação
function updateAnimationState() {
    // Atualiza se tem arma equipada
    hasWeapon = (weaponType !== 'none');
    
    let newAnim = currentAnim;
    
    // Determina qual animação deve estar ativa baseada no estado e na arma
    if (attacking && hasWeapon) {
        newAnim = 'attack_weapon';
    } else if (moving && hasWeapon) {
        newAnim = 'walk_weapon';
    } else if (moving && !hasWeapon) {
        newAnim = 'walk_noweapon';
    } else if (!moving && hasWeapon) {
        newAnim = 'idle_weapon';
    } else {
        newAnim = 'idle_noweapon';
    }
    
    // Se mudou de animação, reseta o frame
    if (newAnim !== currentAnim) {
        currentAnim = newAnim;
        frameIndex = animations[currentAnim].start;
        frameCounter = 0;
    }
}

// Verificar colisões
function checkCollisions() {
    const playerRect = {
        x: posX,
        y: posY,
        width: frameWidth * scale,
        height: frameHeight * scale
    };
    
    // Colisão bala do jogador vs inimigos
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        if (bullet.type !== 'enemy') {
            for (let j = enemies.length - 1; j >= 0; j--) {
                const enemy = enemies[j];
                if (bullet.x < enemy.x + enemy.size &&
                    bullet.x + bullet.size > enemy.x &&
                    bullet.y < enemy.y + enemy.size &&
                    bullet.y + bullet.size > enemy.y) {
                    
        // Inimigo levou dano
                    enemy.health -= bullet.damage;
                    bullets.splice(i, 1);
                    
                    // Som de acerto no inimigo
                    playSound('enemyHit', 600, 100);
                    
                    if (enemy.health <= 0) {
                        // Inimigo morreu
                        createExplosion(enemy.x + enemy.size/2, enemy.y + enemy.size/2);
                        gameState.score += enemy.type === 'robot' ? 200 : 100;
                        
                        // Som de destruição do inimigo
                        playSound('enemyDestroy', 300, 300);
                        
                        // Chance de dropar power-up
                        if (Math.random() < 0.3) {
                            createPowerup(enemy.x, enemy.y);
                        }
                        
                        enemies.splice(j, 1);
                    }
                    break;
                }
            }
        }
    }
    
    // Colisão bala inimiga vs jogador
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        if (bullet.type === 'enemy' && !invulnerable) {
            if (bullet.x < playerRect.x + playerRect.width &&
                bullet.x + bullet.size > playerRect.x &&
                bullet.y < playerRect.y + playerRect.height &&
                bullet.y + bullet.size > playerRect.y) {
                
                // Jogador levou dano
                playerHealth -= bullet.damage;
                bullets.splice(i, 1);
                invulnerable = true;
                invulnerableTime = 120; // 2 segundos de invulnerabilidade
                
                // Som de dano no jogador
                playSound('playerHit', 200, 400);
                
                if (playerHealth <= 0) {
                    gameState.lives--;
                    if (gameState.lives <= 0) {
                        gameState.gameOver = true;
                        playSound('gameOver', 150, 1000);
                    } else {
                        playerHealth = 100;
                        weaponType = 'normal'; // Perde power-ups
                    }
                }
            }
        }
    }
    
    // Colisão jogador vs power-ups
    for (let i = powerups.length - 1; i >= 0; i--) {
        const powerup = powerups[i];
        if (powerup.x < playerRect.x + playerRect.width &&
            powerup.x + powerup.size > playerRect.x &&
            powerup.y < playerRect.y + playerRect.height &&
            powerup.y + powerup.size > playerRect.y) {
            
            // Coletou power-up
            switch(powerup.type) {
                case 'normal':
                case 'spread':
                case 'laser':
                case 'machine':
                    weaponType = powerup.type;
                    break;
                case 'health':
                    playerHealth = Math.min(100, playerHealth + 50);
                    break;
                case 'life':
                    gameState.lives++;
                    break;
            }
            
            gameState.score += 50;
            powerups.splice(i, 1);
            
            // Som de coleta de power-up
            playSound('powerup', 800, 200);
        }
    }
}

// Desenhar balas
function drawBullets() {
    for (const bullet of bullets) {
        ctx.fillStyle = bullet.color;
        if (bullet.type === 'laser') {
            // Laser mais largo
            ctx.fillRect(bullet.x - bullet.size/2, bullet.y - bullet.size/2, 
                        bullet.size * 2, bullet.size);
        } else {
            // Bala normal
            ctx.beginPath();
            ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// Desenhar inimigos com efeitos cyberpunk
function drawEnemies() {
    const time = Date.now() * 0.008;
    
    for (const enemy of enemies) {
        // === DESENHAR ÁTOMOS ORBITANTES PRIMEIRO (ATRÁS DO INIMIGO) ===
        drawEnemyAtoms(enemy);
        
        // Efeito cyberpunk piscante para os inimigos
        const glowIntensity = Math.sin(time * 2 + enemy.x * 0.01) * 0.3 + 0.7;
        const pulseIntensity = Math.sin(time * 4 + enemy.y * 0.01) * 0.2 + 0.8;
        
        ctx.save();
        
        // Sombra/glow cyberpunk nos inimigos
        ctx.shadowColor = enemy.type === 'robot' ? `rgba(0, 0, 255, ${glowIntensity})` : `rgba(255, 0, 0, ${glowIntensity})`;
        ctx.shadowBlur = 8 * glowIntensity;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Corpo do inimigo com efeito piscante
        const baseAlpha = pulseIntensity;
        if (enemy.type === 'robot') {
            ctx.fillStyle = `rgba(0, 0, ${Math.floor(255 * glowIntensity)}, ${baseAlpha})`;
        } else {
            ctx.fillStyle = `rgba(${Math.floor(255 * glowIntensity)}, 0, 0, ${baseAlpha})`;
        }
        ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);
        
        // Linhas de energia nos inimigos
        for (let i = 0; i < enemy.size; i += 8) {
            const lineIntensity = Math.sin(time * 3 + i * 0.2) * 0.4 + 0.6;
            if (enemy.type === 'robot') {
                ctx.fillStyle = `rgba(0, 100, ${Math.floor(255 * lineIntensity)}, ${lineIntensity})`;
            } else {
                ctx.fillStyle = `rgba(${Math.floor(255 * lineIntensity)}, 100, 0, ${lineIntensity})`;
            }
            ctx.fillRect(enemy.x + i, enemy.y + 2, 2, enemy.size - 4);
        }
        
        ctx.restore();
        
        // Barra de vida do inimigo com efeito cyberpunk
        const healthPercent = enemy.health / enemy.maxHealth;
        
        // Fundo da barra de vida
        ctx.fillStyle = 'rgba(100, 0, 0, 0.8)';
        ctx.fillRect(enemy.x - 2, enemy.y - 10, enemy.size + 4, 6);
        
        // Barra de vida com efeito piscante verde
        const healthGlow = Math.sin(time * 5) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(0, ${Math.floor(255 * healthGlow)}, 0, ${healthGlow})`;
        ctx.fillRect(enemy.x, enemy.y - 8, (enemy.size * healthPercent), 4);
        
        // Olhos cyberpunk piscantes
        const eyeGlow = Math.sin(time * 6 + enemy.x * 0.02) * 0.4 + 0.6;
        if (enemy.type === 'robot') {
            ctx.fillStyle = `rgba(0, 255, 255, ${eyeGlow})`;
        } else {
            ctx.fillStyle = `rgba(255, 255, 0, ${eyeGlow})`;
        }
        ctx.fillRect(enemy.x + 3, enemy.y + 3, 4, 4);
        ctx.fillRect(enemy.x + enemy.size - 7, enemy.y + 3, 4, 4);
        
        // Partículas de energia flutuando ao redor dos inimigos
        for (let i = 0; i < 2; i++) {
            const particleX = enemy.x + enemy.size/2 + Math.sin(time * 2 + i) * (enemy.size * 0.6);
            const particleY = enemy.y + enemy.size/2 + Math.cos(time * 2.5 + i) * (enemy.size * 0.4);
            const particleSize = 1 + Math.sin(time * 3 + i) * 0.5;
            
            ctx.save();
            ctx.globalAlpha = glowIntensity * 0.8;
            if (enemy.type === 'robot') {
                ctx.fillStyle = '#00FFFF';
            } else {
                ctx.fillStyle = '#FFFF00';
            }
            ctx.beginPath();
            ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
}

// === NOVA FUNÇÃO: DESENHAR ÁTOMOS ORBITANTES ===
function drawEnemyAtoms(enemy) {
    if (!enemy.atomOrbs.initialized || enemy.atomOrbs.orbs.length === 0) return;
    
    const time = Date.now() * 0.005;
    
    ctx.save();
    
    for (let orb of enemy.atomOrbs.orbs) {
        // Configurar estilo do átomo
        ctx.globalAlpha = orb.alpha;
        ctx.fillStyle = orb.color;
        
        // Efeito glow nos átomos
        ctx.shadowColor = orb.color;
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Desenhar o átomo (esfera)
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.currentSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Núcleo do átomo (mais brilhante)
        ctx.globalAlpha = orb.alpha * 1.5;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.currentSize * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Trilha da órbita (linha semi-transparente)
        if (orb === enemy.atomOrbs.orbs[0]) { // Só desenha uma trilha por inimigo
            ctx.globalAlpha = 0.1;
            ctx.strokeStyle = enemy.type === 'robot' ? '#00FFFF' : '#FF4040';
            ctx.lineWidth = 1;
            ctx.beginPath();
            
            const centerX = enemy.x + enemy.size / 2;
            const centerY = enemy.y + enemy.size / 2;
            
            // Desenhar órbita elíptica
            for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
                const radius = orb.radius * (1 + orb.orbit.eccentricity * Math.cos(angle * 2));
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius * Math.cos(orb.orbit.tiltAngle);
                
                if (angle === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();
            ctx.stroke();
        }
    }
    
    ctx.restore();
}

// Desenhar power-ups
function drawPowerups() {
    for (const powerup of powerups) {
        // Efeito de brilho
        ctx.save();
        ctx.globalAlpha = 0.8 + Math.sin(Date.now() * 0.01) * 0.2;
        
        // Cor do power-up baseada no tipo
        switch(powerup.type) {
            case 'spread': ctx.fillStyle = '#ff4444'; break;
            case 'laser': ctx.fillStyle = '#44ff44'; break;
            case 'machine': ctx.fillStyle = '#4444ff'; break;
            case 'health': ctx.fillStyle = '#ff44ff'; break;
            case 'life': ctx.fillStyle = '#ffaa44'; break;
            default: ctx.fillStyle = '#ffffff';
        }
        
        // Desenha power-up como losango
        ctx.translate(powerup.x + powerup.size/2, powerup.y + powerup.size/2);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-powerup.size/2, -powerup.size/2, powerup.size, powerup.size);
        
        // Texto do tipo
        ctx.restore();
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(powerup.type[0].toUpperCase(), powerup.x + powerup.size/2, powerup.y + powerup.size/2 + 3);
    }
}

// Desenhar explosões
function drawExplosions() {
    for (const explosion of explosions) {
        const alpha = explosion.life / explosion.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        
        // Círculo de explosão
        ctx.fillStyle = '#ff6644';
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, explosion.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Círculo interno mais claro
        ctx.fillStyle = '#ffaa44';
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, explosion.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// Desenhar partículas
function drawParticles() {
    for (const particle of particles) {
        const alpha = particle.life / 30;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Desenhar HUD
function drawHUD() {
    // Fundo do HUD principal
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, 60);
    
    // Informações do jogo
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(`SCORE: ${gameState.score.toString().padStart(8, '0')}`, 10, 20);
    ctx.fillText(`LIVES: ${gameState.lives}`, 10, 40);
    
    // Barra de vida
    ctx.fillText('HEALTH:', 250, 20);
    ctx.fillStyle = 'red';
    ctx.fillRect(330, 10, 100, 10);
    ctx.fillStyle = 'green';
    ctx.fillRect(330, 10, playerHealth, 10);
    
    // Arma atual
    ctx.fillStyle = 'white';
    ctx.fillText(`WEAPON: ${weaponType.toUpperCase()}`, 450, 20);
    
    // Level
    ctx.fillText(`LEVEL: ${gameState.level}`, 600, 20);
    
    // Status do som
    ctx.fillStyle = gameAudio.enabled ? '#00FF00' : '#FF4444';
    ctx.fillText(`🔊 SOM: ${gameAudio.enabled ? 'ON' : 'OFF'}`, 600, 40);
    
    // Cooldown de tiro (só mostra se tem arma)
    if (shootCooldown > 0 && weaponType !== 'none') {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(330, 35, (shootCooldown / weapons[weaponType].cooldown) * 100, 5);
    }
    
    // === PAINEL DE INSTRUÇÕES ===
    drawControlsPanel();
}

// Desenhar painel de controles na parte inferior da tela
function drawControlsPanel() {
    const panelHeight = 140; // Aumentado para mais espaço
    const panelY = CANVAS_HEIGHT - panelHeight;
    
    // Fundo do painel de controles
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, panelY, CANVAS_WIDTH, panelHeight);
    
    // Título
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('🎮 CONTROLES ESPECIAIS DA JULIETTE:', 10, panelY + 15);
    
    // Calcular larguras das colunas baseado na largura da tela
    const numCols = CANVAS_WIDTH > 1400 ? 4 : (CANVAS_WIDTH > 1000 ? 3 : 2);
    const colWidth = Math.floor((CANVAS_WIDTH - 40) / numCols); // Margem de 20px cada lado
    const fontSize = CANVAS_WIDTH > 1200 ? '12px' : '11px';
    const lineHeight = CANVAS_WIDTH > 1200 ? 16 : 14;
    
    ctx.font = fontSize + ' Arial';
    const startY = panelY + 35;
    
    // Coluna 1 - Controles básicos
    ctx.fillStyle = '#87CEEB';
    ctx.fillText('⚡ BÁSICOS:', 10, startY);
    ctx.fillStyle = 'white';
    ctx.fillText('⬅️➡️ Mover | Z: Pular', 10, startY + lineHeight);
    ctx.fillText('X/SPACE: Atirar | M: Som', 10, startY + lineHeight * 2);
    ctx.fillText('⬆️+X: ⬇️+X: ↗️+X: ↙️+X', 10, startY + lineHeight * 3);
    
    // Coluna 2 - Ataques especiais
    ctx.fillStyle = '#FF6B6B';
    ctx.fillText('🔥 ESPECIAIS:', colWidth + 10, startY);
    ctx.fillStyle = 'white';
    ctx.fillText('A: Corrente (1 Mão)', colWidth + 10, startY + lineHeight);
    ctx.fillText('S: Corrente (2 Mãos)', colWidth + 10, startY + lineHeight * 2);
    ctx.fillText('C: Celebração', colWidth + 10, startY + lineHeight * 3);
    
    // Coluna 3 - Sistema (se houver espaço)
    if (numCols >= 3) {
        ctx.fillStyle = '#6BCF7F';
        ctx.fillText('⚙️ SISTEMA:', colWidth * 2 + 10, startY);
        ctx.fillStyle = 'white';
        ctx.fillText('P: Pausar', colWidth * 2 + 10, startY + lineHeight);
        ctx.fillText('R: Reiniciar (Game Over)', colWidth * 2 + 10, startY + lineHeight * 2);
        ctx.fillText('F11: Tela Cheia', colWidth * 2 + 10, startY + lineHeight * 3);
    }
    
    // Coluna 4 - Cheats (se houver espaço)
    if (numCols >= 4) {
        ctx.fillStyle = '#FFA500';
        ctx.fillText('🛠️ ARMAS:', colWidth * 3 + 10, startY);
        ctx.fillStyle = 'white';
        ctx.fillText('1: Normal | 2: Spread', colWidth * 3 + 10, startY + lineHeight);
        ctx.fillText('3: Laser | 4: Machine', colWidth * 3 + 10, startY + lineHeight * 2);
    }
    
    // Status na parte inferior
    const statusY = startY + lineHeight * 4.5;
    ctx.fillStyle = '#87CEEB';
    ctx.font = (CANVAS_WIDTH > 1200 ? '11px' : '10px') + ' Arial';
    const statusText = isInSpecialAnim ? `🎭 ${animations[currentAnim].description}` : '🎭 Modo Normal';
    ctx.fillText(statusText, 10, statusY);
    
    // Cooldown de corrente e outros status
    if (chainAttackCooldown > 0) {
        ctx.fillStyle = '#FF6B6B';
        ctx.fillText(`⛓️ Cooldown: ${Math.ceil(chainAttackCooldown/60)}s`, colWidth + 10, statusY);
    }
    
    // Status do som
    ctx.fillStyle = gameAudio.enabled ? '#00FF00' : '#FF4444';
    const soundStatus = gameAudio.enabled ? '🔊 ON' : '🔇 OFF';
    const soundX = numCols >= 3 ? colWidth * 2 + 10 : 10;
    const soundY = chainAttackCooldown > 0 ? statusY : statusY;
    if (numCols >= 3 || chainAttackCooldown === 0) {
        ctx.fillText(`Som: ${soundStatus}`, soundX, soundY);
    }
}

// Sistema de spawn de inimigos
let enemySpawnTimer = 0;
function spawnEnemies() {
    enemySpawnTimer++;
    
    // Spawn baseado no nível
    const spawnRate = Math.max(60 - gameState.level * 5, 30);
    
    if (enemySpawnTimer >= spawnRate) {
        enemySpawnTimer = 0;
        
        // Escolhe tipo de inimigo baseado no nível
        const enemyType = gameState.level > 3 && Math.random() > 0.7 ? 'robot' : 'soldier';
        createEnemy(enemyType);
    }
    
    // Aumenta nível baseado na pontuação
    const newLevel = Math.floor(gameState.score / 1000) + 1;
    if (newLevel > gameState.level) {
        gameState.level = newLevel;
        
        // Som de level up
        playSound('levelUp', 700, 600);
        
        // Poder ser adicionar efeitos visuais de level up
    }
}

// Função principal do loop do jogo
function gameLoop() {
    if (gameState.paused || gameState.gameOver) {
        // Desenha tela de game over ou pause
        if (gameState.gameOver) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            ctx.fillStyle = 'white';
            ctx.font = 'bold 48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', CANVAS_WIDTH/2, CANVAS_HEIGHT/2);
            ctx.font = '24px Arial';
            ctx.fillText(`Final Score: ${gameState.score}`, CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 50);
            ctx.fillText('Press R to Restart', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 100);
        }
        requestAnimationFrame(gameLoop);
        return;
    }
    
    // Limpa a tela
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Atualiza cooldowns
    if (shootCooldown > 0) shootCooldown--;
    if (invulnerableTime > 0) invulnerableTime--;
    if (invulnerableTime === 0) invulnerable = false;
    
    // Desenha o fundo animado
    drawBackground();
    
    // Desenha plataformas
    drawPlatforms();
    
    // Desenha limite de solo
    drawGroundLimit();
    
    // Atualiza física do jogador
    updatePlayerPhysics();
    
    // Atualiza elementos do jogo
    updateBullets();
    updateEnemies();
    updatePowerups();
    updateExplosions();
    updateParticles();
    
    // Spawn de inimigos
    spawnEnemies();
    
    // Verificar colisões
    checkCollisions();
    
    // Atualiza animações especiais
    updateSpecialAnimations();
    
    // Atualiza estado da animação (só se não estiver em animação especial)
    if (!isInSpecialAnim) {
        updateAnimationState();
    }
    
    // Atualiza animação do jogador
    const anim = animations[currentAnim];
    
    if (currentAnim !== 'idle' || anim.end > anim.start) {
        frameCounter++;
        if (frameCounter >= anim.speed) {
            frameCounter = 0;
            frameIndex++;
            if (frameIndex > anim.end) {
                frameIndex = anim.start;
                if (currentAnim === 'attack') {
                    attacking = false;
                }
            }
        }
    }
    
    // Atualiza posição do jogador
    if (moving && !attacking) {
        posX = CANVAS_WIDTH / 2 - (frameWidth * scale) / 2;
    }
    
    // Desenha todos os elementos
    drawParticles();
    drawExplosions();
    drawBullets();
    drawEnemies();
    drawPowerups();
    
    // Desenha o jogador com efeito de invulnerabilidade
    if (invulnerable && Math.floor(Date.now() / 100) % 2) {
        // Pisca quando invulnerável
        ctx.save();
        ctx.globalAlpha = 0.5;
        drawPlayer();
        ctx.restore();
    } else {
        drawPlayer();
    }
    
    // Desenha HUD
    drawHUD();
    
    requestAnimationFrame(gameLoop);
}

// Função para reiniciar o jogo
function restartGame() {
    // Resetar estado do jogo
    gameState.score = 0;
    gameState.lives = 3;
    gameState.level = 1;
    gameState.paused = false;
    gameState.gameOver = false;
    
    // Resetar jogador
    currentAnim = 'idle_noweapon';
    frameIndex = 0;
    frameCounter = 0;
    posX = 100;
    
    // Posicionar jogador no solo usando a nova função
    positionPlayerOnGround();
    
    moving = false;
    attacking = false;
    facingRight = true;
    playerHealth = 100;
    shootCooldown = 0;
    weaponType = 'normal';
    invulnerable = false;
    invulnerableTime = 0;
    
    // Resetar cenário
    backgroundX = 0;
    backgroundScrolling = false;
    
    // Limpar arrays
    bullets.length = 0;
    enemies.length = 0;
    powerups.length = 0;
    explosions.length = 0;
    particles.length = 0;
    
    // Resetar spawn timer
    enemySpawnTimer = 0;
}

// Inicia o jogo quando todas as imagens carregarem
let imagesLoaded = 0;
const totalImages = 12; // Total de imagens: 3 de fundo + 9 da Juliette (incluindo novas de tiro)

function checkImagesLoaded() {
    imagesLoaded++;
    console.log(`Imagem carregada: ${imagesLoaded}/${totalImages}`);
    if (imagesLoaded === totalImages) {
        frameIndex = animations.idle_noweapon.start;
        console.log('Todas as imagens carregadas! Iniciando jogo...');
        gameLoop();
    }
}

// Carregar imagens de fundo
sceneImg.onload = checkImagesLoaded;
backgroundImg.onload = checkImagesLoaded;
backgroundImgA.onload = checkImagesLoaded;

// Carregar sprites da Juliette
playerImages.spritesheet.onload = checkImagesLoaded;
playerImages.corrente_mao_esquerda.onload = checkImagesLoaded;
playerImages.corrente_duas_maos.onload = checkImagesLoaded;
playerImages.maos_para_cima.onload = checkImagesLoaded;
playerImages.arma_para_cima.onload = checkImagesLoaded;

// Carregar novas imagens de tiro
playerImages.arma_disparando_cima.onload = checkImagesLoaded;
playerImages.arma_disparando_frente.onload = checkImagesLoaded;
playerImages.arma_disparando_60_baixo.onload = checkImagesLoaded;
playerImages.arma_disparando_90_graus.onload = checkImagesLoaded;

// === SISTEMA DE TELA CHEIA ===
let isFullscreen = false;

function toggleFullscreen() {
    const gameContainer = document.getElementById('gameContainer');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    
    if (!document.fullscreenElement) {
        // Entrar em tela cheia
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen();
        }
        isFullscreen = true;
        fullscreenBtn.textContent = '📺 SAIR TELA CHEIA';
        fullscreenBtn.classList.add('fullscreen-active');
    } else {
        // Sair da tela cheia
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        isFullscreen = false;
        fullscreenBtn.textContent = '📺 TELA CHEIA';
        fullscreenBtn.classList.remove('fullscreen-active');
    }
}

// Detectar mudanças de tela cheia pelo navegador (F11, ESC, etc.)
document.addEventListener('fullscreenchange', () => {
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    
    if (document.fullscreenElement) {
        isFullscreen = true;
        fullscreenBtn.textContent = '📺 SAIR TELA CHEIA';
        fullscreenBtn.classList.add('fullscreen-active');
    } else {
        isFullscreen = false;
        fullscreenBtn.textContent = '📺 TELA CHEIA';
        fullscreenBtn.classList.remove('fullscreen-active');
    }
});

// === SISTEMA DE REDIMENSIONAMENTO AUTOMÁTICO ===
function resizeCanvas() {
    // Obter dimensões da janela
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // NOVO: Usar toda a área disponível do navegador
    let newWidth = Math.floor(windowWidth * 0.98); // 98% da largura total
    let newHeight = Math.floor(windowHeight * 0.95); // 95% da altura total (espaço para barra de endereço)
    
    // Definir tamanhos mínimos para garantir jogabilidade
    newWidth = Math.max(newWidth, 800);
    newHeight = Math.max(newHeight, 500);
    
    // Atualizar as dimensões do canvas
    CANVAS_WIDTH = newWidth;
    CANVAS_HEIGHT = newHeight;
    
    canvas.width = newWidth;
    canvas.height = newHeight;
    
    // Reposicionar elementos que dependem das dimensões
    updateGameElementsForResize();
    
    console.log(`Canvas redimensionado para: ${CANVAS_WIDTH}x${CANVAS_HEIGHT} (${(newWidth/windowWidth*100).toFixed(1)}% x ${(newHeight/windowHeight*100).toFixed(1)}%)`);
}

// Função para posicionar jogador no solo
function positionPlayerOnGround() {
    // Recalcular o nível do chão com base na altura atual do canvas
    const newGroundLevel = CANVAS_HEIGHT - (frameHeight * scale) - 20;
    posY = newGroundLevel - (frameHeight * scale);
    onGround = true;
    velocityY = 0;
    
    console.log(`Reposicionando jogador: Canvas Height: ${CANVAS_HEIGHT}, Ground Level: ${newGroundLevel}, Player Y: ${posY}`);
}

// Atualizar elementos do jogo após redimensionamento
function updateGameElementsForResize() {
    // Recalcular o nível do chão baseado na nova altura
    const newGroundLevel = CANVAS_HEIGHT - (frameHeight * scale) - 20;
    
    // Posicionar jogador no solo após redimensionamento
    positionPlayerOnGround();
    
    // Atualizar todas as plataformas para nova altura
    for (let platform of platforms) {
        if (platform.type === 'ground') {
            // Plataforma do chão deve estar logo abaixo do nível do solo
            platform.y = newGroundLevel + (frameHeight * scale);
            platform.width = CANVAS_WIDTH * 3; // Expandir plataforma principal
        } else {
            // Manter plataformas proporcionais à nova altura, mas ajustar baseado no novo chão
            const originalHeight = 600; // Altura original de referência
            const originalGroundLevel = originalHeight - (frameHeight * scale) - 20;
            
            // Calcular a distância relativa da plataforma ao chão original
            const distanceFromOriginalGround = originalGroundLevel - platform.y;
            
            // Aplicar a mesma distância relativa ao novo chão
            platform.y = newGroundLevel - distanceFromOriginalGround;
        }
    }
    
    console.log(`Elementos atualizados para nova altura: ${CANVAS_HEIGHT}, Novo nível do chão: ${newGroundLevel}`);
}

// Event listeners para redimensionamento
window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', () => {
    setTimeout(resizeCanvas, 100); // Pequeno delay para orientação mudar completamente
});

// Inicializar botão de tela cheia e redimensionamento quando DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', toggleFullscreen);
    }
    
    // Inicializar sistema de sons
    initializeSounds();
    
    // Redimensionar canvas inicialmente
    resizeCanvas();
});

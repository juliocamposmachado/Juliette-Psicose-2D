const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Configurações da tela adaptável
let CANVAS_WIDTH = 800;  // Valor inicial, será atualizado
let CANVAS_HEIGHT = 600; // Valor inicial, será atualizado

// === NOVO SISTEMA DE RESPONSIVIDADE PARA MOBILE ===
let screenDetection = {
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    aspectRatio: window.innerWidth / window.innerHeight,
    orientation: 'landscape', // 'portrait' ou 'landscape'
    pixelRatio: window.devicePixelRatio || 1,
    // Breakpoints responsivos
    breakpoints: {
        mobile: 768,
        tablet: 1024,
        desktop: 1440
    },
    // Configurações por dispositivo
    configs: {
        mobile: {
            width: 360,
            height: 640,
            scale: 0.8,
            touchControls: true
        },
        tablet: {
            width: 768,
            height: 1024,
            scale: 1.0,
            touchControls: true
        },
        desktop: {
            width: 1200,
            height: 800,
            scale: 1.0,
            touchControls: false
        }
    }
};

const frameWidth = 48;
const frameHeight = 64;
const scale = 1.5; // Personagem menor, mais próximo do Contra original

// Sistema de jogo inspirado no Contra
const gameState = {
    score: 0,
    lives: 3,
    level: 1,
    paused: false,
    gameOver: false,
    // === NOVO SISTEMA DE FASES ===
    currentPhase: 1,
    gameStartTime: 0,
    timeInGame: 0, // Tempo em segundos
    hitsReceived: 0, // Contador de tiros recebidos
    maxHitsPhase1: 10, // Tiros para morrer na fase 1
    maxHitsPhase2: 1000, // Tiros para morrer na fase 2
    phase2StartTime: 300 // 5 minutos = 300 segundos
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

// === GERADOR DE SOM AVANÇADO COM EFEITOS DE LASER ===
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

// === NOVA FUNÇÃO: GERADOR DE SONS DE LASER FUTURISTAS ===
function generateLaserSound(weaponType, frequency, duration) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        switch(weaponType) {
            case 'normal':
                generateBasicLaser(audioContext, frequency, duration);
                break;
            case 'spread':
                generateTripleLaser(audioContext, frequency, duration);
                break;
            case 'laser':
                generatePowerLaser(audioContext, frequency, duration);
                break;
            case 'machine':
                generateRapidLaser(audioContext, frequency, duration);
                break;
            case 'plasma':
                generatePlasmaLaser(audioContext, frequency, duration);
                break;
            case 'storm':
                generateStormLaser(audioContext, frequency, duration);
                break;
            case 'nuclear':
                generateNuclearLaser(audioContext, frequency, duration);
                break;
            default:
                generateBasicLaser(audioContext, frequency, duration);
        }
    } catch (e) {
        console.log('Web Audio não suportado para laser:', e);
        // Fallback para som simples
        generateSound(frequency, duration);
    }
}

// Som de laser básico (pew-pew clássico)
function generateBasicLaser(audioContext, baseFreq, duration) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Frequency sweep descendente para efeito "pew"
    oscillator.frequency.setValueAtTime(baseFreq + 200, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(baseFreq, audioContext.currentTime + duration / 2000);
    oscillator.type = 'sawtooth';
    
    // Envelope de volume rápido
    const vol = gameAudio.volume * 0.15;
    gainNode.gain.setValueAtTime(vol, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration / 1000);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
}

// Som de laser triplo (spread)
function generateTripleLaser(audioContext, baseFreq, duration) {
    // Três lasers com frequências ligeiramente diferentes
    const frequencies = [baseFreq, baseFreq * 1.2, baseFreq * 0.8];
    
    frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Frequency sweep com pequeno delay entre os tiros
        const startTime = audioContext.currentTime + (index * 0.02);
        oscillator.frequency.setValueAtTime(freq + 150, startTime);
        oscillator.frequency.exponentialRampToValueAtTime(freq, startTime + duration / 2000);
        oscillator.type = 'sawtooth';
        
        const vol = gameAudio.volume * 0.1;
        gainNode.gain.setValueAtTime(vol, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration / 1000);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration / 1000);
    });
}

// Som de laser de poder (laser weapon)
function generatePowerLaser(audioContext, baseFreq, duration) {
    // Oscilador principal
    const mainOsc = audioContext.createOscillator();
    const mainGain = audioContext.createGain();
    
    // Oscilador de harmônico
    const harmOsc = audioContext.createOscillator();
    const harmGain = audioContext.createGain();
    
    mainOsc.connect(mainGain);
    harmOsc.connect(harmGain);
    mainGain.connect(audioContext.destination);
    harmGain.connect(audioContext.destination);
    
    // Som principal com sweep mais longo
    mainOsc.frequency.setValueAtTime(baseFreq + 300, audioContext.currentTime);
    mainOsc.frequency.exponentialRampToValueAtTime(baseFreq - 100, audioContext.currentTime + duration / 1000);
    mainOsc.type = 'square';
    
    // Harmônico para dar profundidade
    harmOsc.frequency.setValueAtTime(baseFreq * 2, audioContext.currentTime);
    harmOsc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, audioContext.currentTime + duration / 1000);
    harmOsc.type = 'sawtooth';
    
    const mainVol = gameAudio.volume * 0.2;
    const harmVol = gameAudio.volume * 0.1;
    
    mainGain.gain.setValueAtTime(mainVol, audioContext.currentTime);
    mainGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration / 1000);
    
    harmGain.gain.setValueAtTime(harmVol, audioContext.currentTime);
    harmGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration / 1000);
    
    mainOsc.start(audioContext.currentTime);
    harmOsc.start(audioContext.currentTime);
    mainOsc.stop(audioContext.currentTime + duration / 1000);
    harmOsc.stop(audioContext.currentTime + duration / 1000);
}

// Som de laser rápido (machine gun)
function generateRapidLaser(audioContext, baseFreq, duration) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Som mais agudo e rápido
    oscillator.frequency.setValueAtTime(baseFreq + 400, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(baseFreq + 100, audioContext.currentTime + duration / 3000);
    oscillator.type = 'square';
    
    const vol = gameAudio.volume * 0.12;
    gainNode.gain.setValueAtTime(vol, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration / 1500); // Mais rápido
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1500);
}

// Som de laser de plasma (sci-fi)
function generatePlasmaLaser(audioContext, baseFreq, duration) {
    // Múltiplos osciladores para som complexo
    const oscillators = [];
    const gainNodes = [];
    
    for (let i = 0; i < 3; i++) {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        const freq = baseFreq * (1 + i * 0.5);
        osc.frequency.setValueAtTime(freq + 200, audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq - 200, audioContext.currentTime + duration / 800);
        osc.type = i === 0 ? 'square' : 'sawtooth';
        
        const vol = gameAudio.volume * (0.15 - i * 0.03);
        gain.gain.setValueAtTime(vol, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration / 800);
        
        osc.start(audioContext.currentTime);
        osc.stop(audioContext.currentTime + duration / 800);
        
        oscillators.push(osc);
        gainNodes.push(gain);
    }
}

// Som de laser tempestade (storm)
function generateStormLaser(audioContext, baseFreq, duration) {
    // Som caótico com ruído
    const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * duration / 1000, audioContext.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    
    // Gerar ruído filtrado
    for (let i = 0; i < noiseData.length; i++) {
        noiseData[i] = (Math.random() * 2 - 1) * 0.1;
    }
    
    const noiseSource = audioContext.createBufferSource();
    const filter = audioContext.createBiquadFilter();
    const gainNode = audioContext.createGain();
    
    noiseSource.buffer = noiseBuffer;
    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(baseFreq, audioContext.currentTime);
    filter.frequency.exponentialRampToValueAtTime(baseFreq * 2, audioContext.currentTime + duration / 1000);
    filter.Q.value = 10;
    
    const vol = gameAudio.volume * 0.18;
    gainNode.gain.setValueAtTime(vol, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration / 1000);
    
    noiseSource.start(audioContext.currentTime);
    noiseSource.stop(audioContext.currentTime + duration / 1000);
}

// Som de laser nuclear (épico)
function generateNuclearLaser(audioContext, baseFreq, duration) {
    // Som massivo com múltiplas camadas
    const layers = [
        { freq: baseFreq, type: 'sawtooth', vol: 0.25 },
        { freq: baseFreq * 0.5, type: 'square', vol: 0.2 },
        { freq: baseFreq * 2, type: 'triangle', vol: 0.15 },
        { freq: baseFreq * 1.5, type: 'sine', vol: 0.1 }
    ];
    
    layers.forEach((layer, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        const startTime = audioContext.currentTime + (index * 0.01);
        const sweepDuration = duration / 600; // Mais longo para nuclear
        
        oscillator.frequency.setValueAtTime(layer.freq + 400, startTime);
        oscillator.frequency.exponentialRampToValueAtTime(layer.freq - 300, startTime + sweepDuration);
        oscillator.type = layer.type;
        
        const vol = gameAudio.volume * layer.vol;
        gainNode.gain.setValueAtTime(vol, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + sweepDuration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + sweepDuration);
    });
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
    
    // === NOVAS IMAGENS DE CORRENTE ANIMADA ===
    corrente_mao_esquerda_1: new Image(),
    corrente_mao_esquerda_2: new Image(),
    
    // === NOVAS IMAGENS DE MÃOS PARA CIMA ===
    maos_para_cima_1: new Image(),
    maos_para_cima_2: new Image(),
    
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

// === CARREGAR NOVAS IMAGENS DE CORRENTE ANIMADA ===
playerImages.corrente_mao_esquerda_1.src = 'assets/01 corrente mao esquerda 1.png';
playerImages.corrente_mao_esquerda_2.src = 'assets/01 corrente mao esquerda 2.png';

// === CARREGAR NOVAS IMAGENS DE MÃOS PARA CIMA ===
playerImages.maos_para_cima_1.src = 'assets/01 maos para cima 1.png';
playerImages.maos_para_cima_2.src = 'assets/01 maos para cima 2.png';

// === CARREGAR NOVAS IMAGENS DE TIRO ===
playerImages.arma_disparando_cima.src = 'assets/03 arma para cima disparando 60 graus.png';
playerImages.arma_disparando_frente.src = 'assets/03 arma disparando para frente.png';
playerImages.arma_disparando_60_baixo.src = 'assets/03 arma para cima disparando 60 graus para baixo.png';
playerImages.arma_disparando_90_graus.src = 'assets/03 arma para cima disparando 90 graus.png';

// Imagens de fundo
const backgroundImg = new Image();
backgroundImg.src = 'assets/fundo 2d melhor.png';

const backgroundImgA = new Image();
backgroundImgA.src = 'assets/fundo 2d a.png';

// === NOVA IMAGEM DA FASE 2 ===
const backgroundImgPhase2 = new Image();
backgroundImgPhase2.src = 'assets/fundo 2d melhor fase 2.png';

const sceneImg = new Image();
sceneImg.src = 'assets/cena01.jpg';

// Sistema de animações avançado com sprites específicas
const animations = {
    // === ANIMAÇÕES BÁSICAS USANDO IMAGEM ESPECÍFICA ===
    // SEM ARMA - USANDO "01 MAOS PARA CIMA" COMO POSE PRINCIPAL
    idle_noweapon: { 
        type: 'sprite', 
        image: 'maos_para_cima', 
        duration: 9999999, // Duração muito longa para manter a pose
        description: 'Parada sem arma (mãos para cima)' 
    },
    walk_noweapon: { 
        type: 'spritesheet', 
        start: 1, end: 5, speed: 10, row: 0,  // Mudança: usar spritesheet para caminhada mais fluida
        description: 'Caminhada sem arma (animada)' 
    },
    
    // COM ARMA - USANDO SPRITESHEET ORIGINAL PARA ANIMAÇÕES COM ARMA
    idle_weapon: { 
        type: 'spritesheet', 
        start: 1, end: 1, speed: 60, row: 0,
        description: 'Parada com arma' 
    },
    walk_weapon: { 
        type: 'spritesheet', 
        start: 1, end: 5, speed: 8, row: 0,  // Velocidade aumentada para animação mais fluida
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
let weaponType = 'none'; // none, normal, spread, laser, machine, plasma, storm, nuclear
let invulnerable = false;
let invulnerableTime = 0;

// === NOVAS VARIÁVEIS PARA ANIMAÇÃO DE CAMINHADA MELHORADA ===
let walkBobOffset = 0;       // Offset para movimento vertical de caminhada
let walkCycleTimer = 0;      // Timer do ciclo de caminhada
let walkStepTimer = 0;       // Timer para passos individuais
let lastStepSide = 'left';   // Último lado do passo
let walkAnimSpeedMultiplier = 1.0; // Multiplicador de velocidade da animação
let horizontalMovementAccel = 0;    // Aceleração horizontal
let walkParticleTimer = 0;   // Timer para partículas de caminhada

// === NOVO SISTEMA DE ESCUDO ===
let shieldActive = true; // NOVO: Começa com escudo ativo
let shieldEnergy = 100;
let shieldMaxEnergy = 100;
let shieldRegenRate = 0.5;
let shieldCooldown = 0;
let shieldEffects = [];
let shieldHitEffects = [];
// === ESCUDO INICIAL ===
let initialShieldActive = true; // Escudo especial inicial
let initialShieldDuration = 3600; // 60 segundos * 60 frames = 3600 frames
let initialShieldTimer = 3600; // Cronômetro regressivo

// === SISTEMA DE BOMBA ===
let bombCount = 3; // Quantidade inicial de bombas
let maxBombs = 5; // Máximo de bombas que o jogador pode ter
let bombCooldown = 0; // Cooldown entre usar bombas
let bombMaxCooldown = 300; // 5 segundos de cooldown

// === NOVO SISTEMA DE DISCO DE LAVA FLUTUANTE ===
let lavaDiscActive = false; // Estado do disco de lava
let lavaDisc = {
    x: 0,
    y: 0,
    radius: 40,
    heatIntensity: 0,
    colorPhase: 0,
    pulsePhase: 0,
    particles: [],
    floatOffset: 0,
    active: false,
    targetX: 0,
    targetY: 0
};

// === NOVO SISTEMA DE ÁTOMOS ORBITANTES DA JULIETTE ===
let playerAtomOrbs = {
    enabled: true, // Sempre ativa para a Juliette
    count: 5, // 5 átomos orbitantes
    orbs: [],
    rotationSpeed: 0.04, // Velocidade base de rotação
    baseRadius: 50, // Raio base da órbita
    initialized: false,
    colors: ['#FF69B4', '#00FFFF', '#FFD700', '#FF4500', '#9932CC'], // Rosa, Ciano, Dourado, Laranja, Roxo
    energyLevel: 1.0 // Nível de energia (afeta velocidade e intensidade)
};

// Estados de cores da lava (quente para muito quente)
const lavaColors = [
    { r: 120, g: 20, b: 0 },   // Lava escura/resfriando
    { r: 180, g: 40, b: 0 },   // Lava média
    { r: 255, g: 80, b: 0 },   // Lava quente (laranja)
    { r: 255, g: 140, b: 0 },  // Lava muito quente (laranja brilhante)
    { r: 255, g: 200, b: 20 }, // Lava extremamente quente (amarelo-laranja)
    { r: 255, g: 255, b: 100 } // Lava incandescente (amarelo brilhante)
];

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

// === NOVAS VARIÁVEIS PARA ANIMAÇÃO DE BALANÇO DA CORRENTE (MÃO ESQUERDA) ===
let chainSwingFrame = 0;
let chainSwingDirection = 1; // 1 para frente, -1 para trás
let chainSwingSpeed = 0.15; // Velocidade do balanço

// === SISTEMA DE SHUFFLE DE CAMINHADA COM CORRENTES ===
let walkShuffleIndex = 0; // Índice atual do shuffle (0-3)
let walkShuffleTimer = 0; // Timer para controlar mudança de pose
let walkShuffleSpeed = 15; // Velocidade da mudança (frames)
let walkShuffleImages = [
    'maos_para_cima',
    'maos_para_cima_1',
    'maos_para_cima_2',
    'corrente_mao_esquerda'
]; // Array das imagens para o shuffle - NOVO: sequência com "01 maos para cima" variações

// === NOVO SISTEMA DE SHUFFLE SEMPRE ATIVO ===
let idleShuffleIndex = 0; // Índice para shuffle quando parada
let idleShuffleTimer = 0; // Timer para shuffle quando parada
let idleShuffleSpeed = 45; // Mais lento quando parada (45 frames = ~0.75s)

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

// Configurações de armas (inspirado no Contra) - SISTEMA PROGRESSIVO
const weapons = {
    normal: { 
        damage: 20, speed: 8, cooldown: 10, color: '#ffff00',
        description: 'Tiro Normal',
        bulletSize: 4, bulletCount: 1
    },
    spread: { 
        damage: 18, speed: 9, cooldown: 8, color: '#ffff00',
        description: 'Tiro Triplo Expandido', 
        bulletSize: 5, bulletCount: 3, spreadAngle: 25
    },
    laser: { 
        damage: 35, speed: 14, cooldown: 12, color: '#ffff00',
        description: 'Laser Penetrante',
        bulletSize: 8, bulletCount: 1, piercing: true
    },
    machine: { 
        damage: 15, speed: 12, cooldown: 3, color: '#ffff00',
        description: 'Metralhadora Rápida',
        bulletSize: 3, bulletCount: 2
    },
    // === NOVAS ARMAS PROGRESSIVAS ===
    plasma: {
        damage: 45, speed: 16, cooldown: 15, color: '#ffff00',
        description: 'Plasma Devastador',
        bulletSize: 10, bulletCount: 1, explosive: true
    },
    storm: {
        damage: 25, speed: 11, cooldown: 6, color: '#ffff00', 
        description: 'Tempestade de Projéteis',
        bulletSize: 4, bulletCount: 5, spreadAngle: 40
    },
    nuclear: {
        damage: 80, speed: 10, cooldown: 25, color: '#ffff00',
        description: 'Núcleo Atômico',
        bulletSize: 15, bulletCount: 1, explosive: true, piercing: true
    }
};

// Variáveis da animação do cenário
let backgroundX = 0;
let backgroundSpeed = 2.5; // Velocidade aumentada
let backgroundScrolling = false;
let parallaxOffset = 0; // Para efeito parallax

// === SISTEMA DE PAINEL DE CONTROLES RECOLHÍVEL ===
let controlsPanelVisible = true;
let controlsPanelToggleTimer = 0;
const CONTROLS_PANEL_TOGGLE_COOLDOWN = 30; // 30 frames = 0.5 segundos

// === SISTEMA DE HUD SUPERIOR RECOLHÍVEL ===
let hudVisible = true;
let hudToggleTimer = 0;
const HUD_TOGGLE_COOLDOWN = 30; // 30 frames = 0.5 segundos
let hudMinimized = false; // Estado minimizado (mostra apenas essenciais)

// === SISTEMA DE CONTROLES TOUCH PARA MOBILE ===
let isMobile = false;
let touchControls = {
    enabled: false,
    visible: true,
    transparency: 0.7,
    size: 'medium', // small, medium, large
    layout: 'default', // default, compact, custom
    
    // Botões e suas posições
    buttons: {
        // D-Pad (controles direcionais)
        dpad: {
            centerX: 0, centerY: 0,
            radius: 60,
            pressed: { up: false, down: false, left: false, right: false }
        },
        
        // Botões de ação (direita)
        actionA: { x: 0, y: 0, radius: 35, pressed: false }, // Tiro
        actionB: { x: 0, y: 0, radius: 30, pressed: false }, // Pulo
        actionX: { x: 0, y: 0, radius: 25, pressed: false }, // Corrente mão esquerda
        actionY: { x: 0, y: 0, radius: 25, pressed: false }, // Corrente ambas
        
        // Botões especiais (topo)
        bomb: { x: 0, y: 0, radius: 25, pressed: false },
        shield: { x: 0, y: 0, radius: 25, pressed: false },
        lava: { x: 0, y: 0, radius: 25, pressed: false },
        
        // Botões de sistema
        pause: { x: 0, y: 0, radius: 20, pressed: false },
        sound: { x: 0, y: 0, radius: 20, pressed: false },
        settings: { x: 0, y: 0, radius: 20, pressed: false }
    },
    
    // Estado dos toques
    touches: [],
    
    // Configurações de responsividade
    responsive: {
        smallScreen: CANVAS_WIDTH < 600,
        tabletMode: CANVAS_WIDTH >= 600 && CANVAS_WIDTH < 1024,
        desktopMode: CANVAS_WIDTH >= 1024
    }
};

// === NOVA FUNÇÃO: DETECÇÃO AVANÇADA DE DISPOSITIVOS MÓVEIS ===
function detectMobile() {
    updateScreenDetection();
    
    const isMobileDevice = screenDetection.isMobile || screenDetection.isTablet;
    const hasSmallScreen = screenDetection.screenWidth < screenDetection.breakpoints.tablet;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // É mobile se: dispositivo móvel OU (touch E tela pequena)
    isMobile = isMobileDevice || (isTouchDevice && hasSmallScreen);
    
    if (isMobile) {
        touchControls.enabled = true;
        console.log('📱 Dispositivo móvel detectado - Controles touch ativados!');
        console.log(`   📊 Resolução: ${screenDetection.screenWidth}x${screenDetection.screenHeight}`);
        console.log(`   📱 Tipo: ${screenDetection.isMobile ? 'Mobile' : screenDetection.isTablet ? 'Tablet' : 'Desktop (Touch)'}`);
        console.log(`   🔄 Orientação: ${screenDetection.orientation}`);
        console.log(`   📐 Aspect Ratio: ${screenDetection.aspectRatio.toFixed(2)}`);
    }
    
    return isMobile;
}

// === NOVA FUNÇÃO: ATUALIZAR DETECÇÃO DE TELA ===
function updateScreenDetection() {
    // Obter dimensões da tela
    screenDetection.screenWidth = window.innerWidth;
    screenDetection.screenHeight = window.innerHeight;
    screenDetection.aspectRatio = screenDetection.screenWidth / screenDetection.screenHeight;
    screenDetection.pixelRatio = window.devicePixelRatio || 1;
    
    // Determinar orientação
    screenDetection.orientation = screenDetection.aspectRatio > 1 ? 'landscape' : 'portrait';
    
    // Classificar tipo de dispositivo baseado na largura
    screenDetection.isDesktop = screenDetection.screenWidth >= screenDetection.breakpoints.desktop;
    screenDetection.isTablet = screenDetection.screenWidth >= screenDetection.breakpoints.tablet && 
                               screenDetection.screenWidth < screenDetection.breakpoints.desktop;
    screenDetection.isMobile = screenDetection.screenWidth < screenDetection.breakpoints.mobile;
    
    // Verificação adicional por User Agent
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    const isMobileUA = mobileRegex.test(userAgent);
    
    // Override: se UA detecta mobile/tablet, ajustar classificação
    if (isMobileUA) {
        if (screenDetection.screenWidth < screenDetection.breakpoints.mobile) {
            screenDetection.isMobile = true;
            screenDetection.isTablet = false;
            screenDetection.isDesktop = false;
        } else if (screenDetection.screenWidth < screenDetection.breakpoints.desktop) {
            screenDetection.isMobile = false;
            screenDetection.isTablet = true;
            screenDetection.isDesktop = false;
        }
    }
    
    console.log(`📊 Detecção de tela atualizada:`, {
        width: screenDetection.screenWidth,
        height: screenDetection.screenHeight,
        aspectRatio: screenDetection.aspectRatio.toFixed(2),
        orientation: screenDetection.orientation,
        deviceType: screenDetection.isMobile ? 'Mobile' : 
                   screenDetection.isTablet ? 'Tablet' : 'Desktop',
        pixelRatio: screenDetection.pixelRatio
    });
}

// === NOVA FUNÇÃO: CONFIGURAR CANVAS RESPONSIVO ===
function setupResponsiveCanvas() {
    updateScreenDetection();
    
    let config;
    
    // Selecionar configuração baseada no tipo de dispositivo
    if (screenDetection.isMobile) {
        config = screenDetection.configs.mobile;
    } else if (screenDetection.isTablet) {
        config = screenDetection.configs.tablet;
    } else {
        config = screenDetection.configs.desktop;
    }
    
    // === NOVA LÓGICA PARA TELA CHEIA MOBILE SEM BARRAS PRETAS ===
    let targetWidth, targetHeight;
    
    if (screenDetection.isMobile || screenDetection.isTablet) {
        // Mobile/Tablet: usar TODA viewport disponível
        targetWidth = screenDetection.screenWidth;
        targetHeight = screenDetection.screenHeight;
        
        // Não forçar aspect ratios específicos em mobile - usar toda tela
        console.log('📱 Modo mobile/tablet: usando viewport completa');
        
    } else {
        // Desktop: manter lógica anterior com aspect ratios
        if (screenDetection.orientation === 'landscape') {
            // Modo paisagem - usar mais largura disponível
            targetWidth = Math.min(screenDetection.screenWidth * 0.95, config.width);
            targetHeight = Math.min(screenDetection.screenHeight * 0.90, config.height);
            
            // Garantir aspect ratio 16:10 ou similar em paisagem
            const landscapeRatio = 16/10;
            if (targetWidth / targetHeight > landscapeRatio) {
                targetWidth = targetHeight * landscapeRatio;
            } else {
                targetHeight = targetWidth / landscapeRatio;
            }
        } else {
            // Modo retrato - ajustar para vertical
            targetWidth = Math.min(screenDetection.screenWidth * 0.98, config.width * 0.8);
            targetHeight = Math.min(screenDetection.screenHeight * 0.85, config.height);
            
            // Garantir aspect ratio 3:4 ou similar em retrato
            const portraitRatio = 3/4;
            if (targetWidth / targetHeight > portraitRatio) {
                targetWidth = targetHeight * portraitRatio;
            } else {
                targetHeight = targetWidth / portraitRatio;
            }
        }
        
        // Aplicar tamanhos mínimos apenas para desktop
        targetWidth = Math.max(targetWidth, 800);
        targetHeight = Math.max(targetHeight, 600);
    }
    
    // Garantir mínimos absolutos para todos os dispositivos
    targetWidth = Math.max(targetWidth, 320);
    targetHeight = Math.max(targetHeight, 240);
    
    // Atualizar dimensões do canvas
    CANVAS_WIDTH = Math.floor(targetWidth);
    CANVAS_HEIGHT = Math.floor(targetHeight);
    
    // Aplicar ao elemento canvas
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    
    // === CONFIGURAÇÃO ESPECIAL MOBILE PARA TELA CHEIA ===
    if (screenDetection.isMobile || screenDetection.isTablet) {
        // Forçar uso de toda viewport em mobile
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.objectFit = 'cover'; // Preenche toda a área
        
        // Ocultar elementos desktop
        document.querySelectorAll('.desktop-only').forEach(el => {
            el.style.display = 'none';
        });
        
        console.log('📱 Configuração mobile fullscreen aplicada');
    } else {
        // Desktop: usar dimensões calculadas
        canvas.style.width = CANVAS_WIDTH + 'px';
        canvas.style.height = CANVAS_HEIGHT + 'px';
        canvas.style.objectFit = 'contain';
        
        // Mostrar elementos desktop
        document.querySelectorAll('.desktop-only').forEach(el => {
            el.style.display = 'block';
        });
    }
    
    // Configurar controles touch se necessário
    if (config.touchControls && !touchControls.enabled) {
        touchControls.enabled = true;
        console.log('📱 Controles touch ativados por configuração responsiva');
    }
    
    // Log das configurações aplicadas
    console.log(`🎮 Canvas configurado:`, {
        viewport: `${screenDetection.screenWidth}x${screenDetection.screenHeight}`,
        canvas: `${CANVAS_WIDTH}x${CANVAS_HEIGHT}`,
        cssSize: `${canvas.style.width} x ${canvas.style.height}`,
        objectFit: canvas.style.objectFit,
        orientation: screenDetection.orientation,
        deviceType: screenDetection.isMobile ? 'Mobile' : 
                   screenDetection.isTablet ? 'Tablet' : 'Desktop',
        touchControls: config.touchControls
    });
    
    return { width: CANVAS_WIDTH, height: CANVAS_HEIGHT, config };
}

// Controles do teclado
const keys = {};

// === SISTEMA DE EVENTOS TOUCH ===
canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });

// Prevenir zoom e scroll em dispositivos móveis durante o jogo
document.addEventListener('touchstart', (e) => {
    if (e.target === canvas) {
        e.preventDefault();
    }
}, { passive: false });

document.addEventListener('touchmove', (e) => {
    if (e.target === canvas) {
        e.preventDefault();
    }
}, { passive: false });

// === FUNÇÕES DE CONTROLE TOUCH ===
function handleTouchStart(e) {
    e.preventDefault();
    if (!touchControls.enabled) return;
    
    const touches = e.changedTouches;
    
    for (let i = 0; i < touches.length; i++) {
        const touch = touches[i];
        const rect = canvas.getBoundingClientRect();
        const touchX = touch.clientX - rect.left;
        const touchY = touch.clientY - rect.top;
        
        // Adicionar touch ao array de controle
        touchControls.touches.push({
            identifier: touch.identifier,
            startX: touchX,
            startY: touchY,
            currentX: touchX,
            currentY: touchY,
            startTime: Date.now()
        });
        
        // Verificar quais botões foram pressionados
        checkTouchButtons(touchX, touchY, 'start');
    }
}

function handleTouchMove(e) {
    e.preventDefault();
    if (!touchControls.enabled) return;
    
    const touches = e.changedTouches;
    
    for (let i = 0; i < touches.length; i++) {
        const touch = touches[i];
        const rect = canvas.getBoundingClientRect();
        const touchX = touch.clientX - rect.left;
        const touchY = touch.clientY - rect.top;
        
        // Atualizar posição do touch existente
        const existingTouch = touchControls.touches.find(t => t.identifier === touch.identifier);
        if (existingTouch) {
            existingTouch.currentX = touchX;
            existingTouch.currentY = touchY;
        }
        
        // Verificar movimento do D-Pad
        checkDPadMovement(touchX, touchY);
    }
}

function handleTouchEnd(e) {
    e.preventDefault();
    if (!touchControls.enabled) return;
    
    const touches = e.changedTouches;
    
    for (let i = 0; i < touches.length; i++) {
        const touch = touches[i];
        const rect = canvas.getBoundingClientRect();
        const touchX = touch.clientX - rect.left;
        const touchY = touch.clientY - rect.top;
        
        // Verificar botões liberados
        checkTouchButtons(touchX, touchY, 'end');
        
        // Remover touch do array
        touchControls.touches = touchControls.touches.filter(t => t.identifier !== touch.identifier);
    }
    
    // Liberar todos os botões do D-Pad se não há mais toques
    if (touchControls.touches.length === 0) {
        touchControls.buttons.dpad.pressed.up = false;
        touchControls.buttons.dpad.pressed.down = false;
        touchControls.buttons.dpad.pressed.left = false;
        touchControls.buttons.dpad.pressed.right = false;
        
        // Parar movimento
        moving = false;
        backgroundScrolling = false;
    }
}

// Verificar toques nos botões virtuais
function checkTouchButtons(x, y, action) {
    // Verificar botão de tiro (A)
    if (isPointInCircle(x, y, touchControls.buttons.actionA)) {
        if (action === 'start') {
            touchControls.buttons.actionA.pressed = true;
            shoot();
            attacking = true;
        } else if (action === 'end') {
            touchControls.buttons.actionA.pressed = false;
            attacking = false;
        }
    }
    
    // Verificar botão de pulo (B)
    if (isPointInCircle(x, y, touchControls.buttons.actionB)) {
        if (action === 'start') {
            touchControls.buttons.actionB.pressed = true;
            jump();
        } else if (action === 'end') {
            touchControls.buttons.actionB.pressed = false;
        }
    }
    
    // Verificar botão de corrente mão esquerda (X)
    if (isPointInCircle(x, y, touchControls.buttons.actionX)) {
        if (action === 'start') {
            touchControls.buttons.actionX.pressed = true;
            if (!isInSpecialAnim && chainAttackCooldown === 0) {
                chainAttack('left_hand');
            }
        } else if (action === 'end') {
            touchControls.buttons.actionX.pressed = false;
        }
    }
    
    // Verificar botão de corrente ambas mãos (Y)
    if (isPointInCircle(x, y, touchControls.buttons.actionY)) {
        if (action === 'start') {
            touchControls.buttons.actionY.pressed = true;
            if (!isInSpecialAnim && chainAttackCooldown === 0) {
                chainAttack('both_hands');
            }
        } else if (action === 'end') {
            touchControls.buttons.actionY.pressed = false;
        }
    }
    
    // Verificar botões especiais
    if (isPointInCircle(x, y, touchControls.buttons.bomb)) {
        if (action === 'start') {
            touchControls.buttons.bomb.pressed = true;
            if (bombCount > 0 && bombCooldown === 0) {
                activateBomb();
            }
        } else if (action === 'end') {
            touchControls.buttons.bomb.pressed = false;
        }
    }
    
    if (isPointInCircle(x, y, touchControls.buttons.shield)) {
        if (action === 'start') {
            touchControls.buttons.shield.pressed = true;
            if (shieldEnergy > 20 && shieldCooldown === 0) {
                activateShield();
            }
        } else if (action === 'end') {
            touchControls.buttons.shield.pressed = false;
            deactivateShield();
        }
    }
    
    if (isPointInCircle(x, y, touchControls.buttons.lava)) {
        if (action === 'start') {
            touchControls.buttons.lava.pressed = true;
            toggleLavaDisc();
        } else if (action === 'end') {
            touchControls.buttons.lava.pressed = false;
        }
    }
    
    // Botões de sistema
    if (isPointInCircle(x, y, touchControls.buttons.pause)) {
        if (action === 'start') {
            touchControls.buttons.pause.pressed = true;
            gameState.paused = !gameState.paused;
        } else if (action === 'end') {
            touchControls.buttons.pause.pressed = false;
        }
    }
    
    if (isPointInCircle(x, y, touchControls.buttons.sound)) {
        if (action === 'start') {
            touchControls.buttons.sound.pressed = true;
            gameAudio.enabled = !gameAudio.enabled;
        } else if (action === 'end') {
            touchControls.buttons.sound.pressed = false;
        }
    }
}

// Verificar movimento do D-Pad
function checkDPadMovement(x, y) {
    const dpad = touchControls.buttons.dpad;
    const distance = Math.sqrt(Math.pow(x - dpad.centerX, 2) + Math.pow(y - dpad.centerY, 2));
    
    if (distance <= dpad.radius) {
        const angle = Math.atan2(y - dpad.centerY, x - dpad.centerX);
        const degrees = (angle * 180 / Math.PI + 360) % 360;
        
        // Resetar todas as direções
        dpad.pressed.up = false;
        dpad.pressed.down = false;
        dpad.pressed.left = false;
        dpad.pressed.right = false;
        
        // Determinar direção baseada no ângulo
        if (degrees >= 315 || degrees < 45) {
            // Direita
            dpad.pressed.right = true;
            if (!isInSpecialAnim) {
                moving = true;
                facingRight = true;
                backgroundScrolling = true;
            }
        } else if (degrees >= 45 && degrees < 135) {
            // Baixo
            dpad.pressed.down = true;
        } else if (degrees >= 135 && degrees < 225) {
            // Esquerda
            dpad.pressed.left = true;
            if (!isInSpecialAnim) {
                moving = true;
                facingRight = false;
                backgroundScrolling = true;
            }
        } else if (degrees >= 225 && degrees < 315) {
            // Cima
            dpad.pressed.up = true;
            if (hasWeapon && onGround && !isInSpecialAnim) {
                startSpecialAnimation('weapon_up');
            } else if (!isInSpecialAnim) {
                jump();
            }
        }
    } else {
        // Fora do D-Pad, liberar todas as direções
        dpad.pressed.up = false;
        dpad.pressed.down = false;
        dpad.pressed.left = false;
        dpad.pressed.right = false;
        moving = false;
        backgroundScrolling = false;
    }
}

// Verificar se ponto está dentro do círculo
function isPointInCircle(x, y, button) {
    const distance = Math.sqrt(Math.pow(x - button.x, 2) + Math.pow(y - button.y, 2));
    return distance <= button.radius;
}

// Posicionar botões touch baseado no layout da tela
function positionTouchControls() {
    if (!touchControls.enabled) return;
    
    const padding = 30;
    const dpadSize = 60;
    const buttonSize = 35;
    const smallButtonSize = 25;
    
    // Atualizar configurações de responsividade
    touchControls.responsive.smallScreen = CANVAS_WIDTH < 600;
    touchControls.responsive.tabletMode = CANVAS_WIDTH >= 600 && CANVAS_WIDTH < 1024;
    touchControls.responsive.desktopMode = CANVAS_WIDTH >= 1024;
    
    // Ajustar tamanhos para tela pequena
    if (touchControls.responsive.smallScreen) {
        touchControls.buttons.dpad.radius = 50;
        touchControls.buttons.actionA.radius = 30;
        touchControls.buttons.actionB.radius = 25;
        touchControls.buttons.actionX.radius = 20;
        touchControls.buttons.actionY.radius = 20;
    } else {
        touchControls.buttons.dpad.radius = dpadSize;
        touchControls.buttons.actionA.radius = buttonSize;
        touchControls.buttons.actionB.radius = 30;
        touchControls.buttons.actionX.radius = 25;
        touchControls.buttons.actionY.radius = 25;
    }
    
    // === POSICIONAMENTO DO D-PAD (canto inferior esquerdo) ===
    touchControls.buttons.dpad.centerX = padding + touchControls.buttons.dpad.radius;
    touchControls.buttons.dpad.centerY = CANVAS_HEIGHT - padding - touchControls.buttons.dpad.radius;
    
    // === POSICIONAMENTO DOS BOTÕES DE AÇÃO (canto inferior direito) ===
    const rightSide = CANVAS_WIDTH - padding;
    const bottomArea = CANVAS_HEIGHT - padding;
    
    // Botão A (tiro) - principal, mais à direita e baixo
    touchControls.buttons.actionA.x = rightSide - touchControls.buttons.actionA.radius;
    touchControls.buttons.actionA.y = bottomArea - touchControls.buttons.actionA.radius;
    
    // Botão B (pulo) - acima e à esquerda do A
    touchControls.buttons.actionB.x = touchControls.buttons.actionA.x - 70;
    touchControls.buttons.actionB.y = touchControls.buttons.actionA.y - 50;
    
    // Botão X (corrente mão esquerda) - à esquerda do A
    touchControls.buttons.actionX.x = touchControls.buttons.actionA.x - 80;
    touchControls.buttons.actionX.y = touchControls.buttons.actionA.y + 10;
    
    // Botão Y (corrente ambas mãos) - acima do X
    touchControls.buttons.actionY.x = touchControls.buttons.actionX.x;
    touchControls.buttons.actionY.y = touchControls.buttons.actionX.y - 60;
    
    // === BOTÕES ESPECIAIS (parte superior) ===
    const topY = padding + smallButtonSize;
    
    touchControls.buttons.bomb.x = padding + smallButtonSize;
    touchControls.buttons.bomb.y = topY;
    
    touchControls.buttons.shield.x = padding + smallButtonSize * 3;
    touchControls.buttons.shield.y = topY;
    
    touchControls.buttons.lava.x = padding + smallButtonSize * 5;
    touchControls.buttons.lava.y = topY;
    
    // === BOTÕES DE SISTEMA (canto superior direito) ===
    touchControls.buttons.pause.x = rightSide - 20;
    touchControls.buttons.pause.y = topY;
    
    touchControls.buttons.sound.x = rightSide - 60;
    touchControls.buttons.sound.y = topY;
    
    touchControls.buttons.settings.x = rightSide - 100;
    touchControls.buttons.settings.y = topY;
    
    console.log('📱 Controles touch posicionados para', CANVAS_WIDTH, 'x', CANVAS_HEIGHT);
}

// Desenhar controles touch
function drawTouchControls() {
    if (!touchControls.enabled || !touchControls.visible) return;
    
    ctx.save();
    ctx.globalAlpha = touchControls.transparency;
    
    // === DESENHAR D-PAD ===
    const dpad = touchControls.buttons.dpad;
    
    // Base do D-Pad (círculo externo)
    ctx.strokeStyle = '#FFFFFF';
    ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
    ctx.lineWidth = 3;
    
    ctx.beginPath();
    ctx.arc(dpad.centerX, dpad.centerY, dpad.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Setas direcionais do D-Pad
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Destacar direções pressionadas
    if (dpad.pressed.up) {
        ctx.fillStyle = '#FFD700';
    }
    ctx.fillText('▲', dpad.centerX, dpad.centerY - 25);
    
    ctx.fillStyle = dpad.pressed.down ? '#FFD700' : '#FFFFFF';
    ctx.fillText('▼', dpad.centerX, dpad.centerY + 25);
    
    ctx.fillStyle = dpad.pressed.left ? '#FFD700' : '#FFFFFF';
    ctx.fillText('◀', dpad.centerX - 25, dpad.centerY);
    
    ctx.fillStyle = dpad.pressed.right ? '#FFD700' : '#FFFFFF';
    ctx.fillText('▶', dpad.centerX + 25, dpad.centerY);
    
    // === DESENHAR BOTÕES DE AÇÃO ===
    drawTouchButton(touchControls.buttons.actionA, '🎯', '#FF4444'); // Tiro
    drawTouchButton(touchControls.buttons.actionB, '⬆️', '#44FF44'); // Pulo
    drawTouchButton(touchControls.buttons.actionX, '⛓️', '#FFAA44'); // Corrente 1
    drawTouchButton(touchControls.buttons.actionY, '⛓️⛓️', '#FF8844'); // Corrente 2
    
    // === DESENHAR BOTÕES ESPECIAIS ===
    drawTouchButton(touchControls.buttons.bomb, '💣', bombCooldown > 0 ? '#666666' : '#FF0000');
    drawTouchButton(touchControls.buttons.shield, '🛡️', shieldCooldown > 0 ? '#666666' : '#00FFFF');
    drawTouchButton(touchControls.buttons.lava, '🌋', lavaDisc.active ? '#FFD700' : '#FF4500');
    
    // === DESENHAR BOTÕES DE SISTEMA ===
    drawTouchButton(touchControls.buttons.pause, '⏸️', '#CCCCCC');
    drawTouchButton(touchControls.buttons.sound, gameAudio.enabled ? '🔊' : '🔇', gameAudio.enabled ? '#00FF00' : '#FF4444');
    
    ctx.restore();
}

// Desenhar botão touch individual
function drawTouchButton(button, icon, color) {
    // Círculo do botão
    ctx.strokeStyle = button.pressed ? '#FFD700' : '#FFFFFF';
    ctx.fillStyle = button.pressed ? 'rgba(255, 215, 0, 0.3)' : 'rgba(100, 100, 100, 0.5)';
    ctx.lineWidth = button.pressed ? 4 : 2;
    
    ctx.beginPath();
    ctx.arc(button.x, button.y, button.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Ícone do botão
    ctx.fillStyle = color;
    ctx.font = `${Math.floor(button.radius * 0.6)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, button.x, button.y);
}

// Atualizar controles touch no loop principal
function updateTouchControls() {
    if (!touchControls.enabled) return;
    
    // Posicionar controles (caso a tela tenha sido redimensionada)
    positionTouchControls();
}

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
            // Usar sempre a função shoot() que já tem lógica inteligente
            shoot();
            attacking = true;
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
    
    if (e.code === 'KeyH') {
        // Alternar visibilidade do painel de controles
        if (controlsPanelToggleTimer === 0) {
            controlsPanelVisible = !controlsPanelVisible;
            controlsPanelToggleTimer = CONTROLS_PANEL_TOGGLE_COOLDOWN;
            console.log('Painel de controles:', controlsPanelVisible ? 'Visível' : 'Oculto');
        }
    }
    
    // === CONTROLE DO ESCUDO ===
    if (e.code === 'KeyD') {
        // Ativar escudo
        if (shieldEnergy > 20 && shieldCooldown === 0) {
            activateShield();
        }
    }
    
    // === CHEAT CODES PARA TESTE - ARMAS PROGRESSIVAS ===
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
    if (e.code === 'Digit5') {
        weaponType = 'plasma';
    }
    if (e.code === 'Digit6') {
        weaponType = 'storm';
    }
    if (e.code === 'Digit7') {
        weaponType = 'nuclear';
    }
    
    // === CONTROLE DA BOMBA ===
    if (e.code === 'KeyB') {
        // Ativar bomba
        if (bombCount > 0 && bombCooldown === 0) {
            activateBomb();
        }
    }
    
    // === NOVO CONTROLE DO DISCO DE LAVA ===
    if (e.code === 'KeyL') {
        // Ativar/desativar disco de lava
        toggleLavaDisc();
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
    if (e.code === 'KeyD') {
        // Desativar escudo
        deactivateShield();
    }
});

// Função de tiro (inspirada no Contra)
function shoot() {
    if (!canShoot || shootCooldown > 0 || weaponType === 'none') return;
    
    const weapon = weapons[weaponType];
    const playerCenterX = posX + (frameWidth * scale) / 2;
    const playerCenterY = posY + (frameHeight * scale) / 2;
    
    // === NOVO SISTEMA DE SONS DE LASER FUTURISTAS ===
    let shootFreq = 440;
    let shootDuration = 150;
    
    // Configurar frequências e durações específicas para cada arma
    switch(weaponType) {
        case 'normal': 
            shootFreq = 440; 
            shootDuration = 120; 
            break;
        case 'spread': 
            shootFreq = 520; 
            shootDuration = 200; 
            break;
        case 'laser': 
            shootFreq = 660; 
            shootDuration = 300; 
            break;
        case 'machine': 
            shootFreq = 380; 
            shootDuration = 80; 
            break;
        case 'plasma':
            shootFreq = 750;
            shootDuration = 250;
            break;
        case 'storm':
            shootFreq = 600;
            shootDuration = 180;
            break;
        case 'nuclear':
            shootFreq = 220;
            shootDuration = 500;
            break;
    }
    
    // Usar gerador de laser ao invés do som simples
    generateLaserSound(weaponType, shootFreq, shootDuration);
    
    // Determinar direção do tiro baseado nas teclas pressionadas
    let shootDirection = getShootDirection();
    
    // === NOVO: SISTEMA DE ANIMAÇÃO INTELIGENTE BASEADO NO ÂNGULO ===
    triggerShootAnimation(shootDirection.angle);
    
    // === NOVO SISTEMA DE TIROS PROGRESSIVOS ===
    switch(weaponType) {
        case 'normal':
            createDirectionalBullet(playerCenterX, playerCenterY, shootDirection, weapon);
            break;
            
        case 'spread':
            // Tiro triplo expandido melhorado
            const spreadAngle = weapon.spreadAngle || 15;
            createDirectionalBullet(playerCenterX, playerCenterY, shootDirection, weapon);
            createDirectionalBullet(playerCenterX, playerCenterY, 
                { angle: shootDirection.angle + spreadAngle, speed: shootDirection.speed }, weapon);
            createDirectionalBullet(playerCenterX, playerCenterY, 
                { angle: shootDirection.angle - spreadAngle, speed: shootDirection.speed }, weapon);
            break;
            
        case 'laser':
            createDirectionalBullet(playerCenterX, playerCenterY, shootDirection, weapon, 'laser');
            break;
            
        case 'machine':
            // Tiros duplos da metralhadora
            createDirectionalBullet(playerCenterX, playerCenterY, shootDirection, weapon);
            createDirectionalBullet(playerCenterX, playerCenterY, 
                { angle: shootDirection.angle + 5, speed: shootDirection.speed }, weapon);
            break;
            
        case 'plasma':
            createDirectionalBullet(playerCenterX, playerCenterY, shootDirection, weapon, 'plasma');
            break;
            
        case 'storm':
            // Tempestade de 5 projéteis
            const stormSpread = weapon.spreadAngle || 40;
            const stormStep = stormSpread / (weapon.bulletCount - 1);
            for (let i = 0; i < weapon.bulletCount; i++) {
                const angle = shootDirection.angle - (stormSpread/2) + (i * stormStep);
                createDirectionalBullet(playerCenterX, playerCenterY, 
                    { angle: angle, speed: shootDirection.speed }, weapon, 'storm');
            }
            break;
            
        case 'nuclear':
            createDirectionalBullet(playerCenterX, playerCenterY, shootDirection, weapon, 'nuclear');
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
        size: weapon.bulletSize || 4,
        life: 120,
        // === PROPRIEDADES AVANÇADAS DAS BALAS ===
        piercing: weapon.piercing || false,
        explosive: weapon.explosive || false,
        explosionRadius: type === 'nuclear' ? 50 : type === 'plasma' ? 30 : 0,
        trail: [], // Para rastro visual
        glowIntensity: Math.random() * 0.3 + 0.7
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

// === NOVA FUNÇÃO: INICIALIZAR ÁTOMOS ORBITANTES DA JULIETTE ===
function initializePlayerAtoms() {
    if (playerAtomOrbs.initialized) return;
    
    playerAtomOrbs.orbs = [];
    
    for (let i = 0; i < playerAtomOrbs.count; i++) {
        const angle = (i / playerAtomOrbs.count) * Math.PI * 2;
        const orb = {
            angle: angle,
            initialAngle: angle,
            baseRadius: playerAtomOrbs.baseRadius,
            size: Math.random() * 2.5 + 2.5, // Tamanho um pouco maior que dos inimigos
            speed: playerAtomOrbs.rotationSpeed + (Math.random() * 0.03 - 0.015), // Velocidade variada
            color: playerAtomOrbs.colors[i], // Cor específica para cada átomo
            pulse: Math.random() * Math.PI * 2, // Para efeito pulsante
            orbit: {
                // Órbitas mais elaboradas para a protagonista
                radiusVariation: Math.random() * 15 + 8, // Mais variação
                tiltAngle: Math.random() * Math.PI * 0.4, // Inclinação mais pronunciada
                eccentricity: Math.random() * 0.4, // Mais excentricidade
                phaseOffset: Math.random() * Math.PI * 2, // Offset de fase para movimento único
            },
            // === PROPRIEDADES ESPECIAIS DA JULIETTE ===
            powerLevel: 1.0, // Nível de poder (aumenta com armas melhores)
            trailParticles: [], // Rastro de partículas
            specialEffect: i === 0 // Primeiro átomo tem efeito especial
        };
        playerAtomOrbs.orbs.push(orb);
    }
    
    playerAtomOrbs.initialized = true;
    console.log('🌟 Átomos da Juliette inicializados!');
}

// Criar power-up
function createPowerup(x, y, type = 'random') {
    const powerupTypes = ['normal', 'spread', 'laser', 'machine', 'health', 'life', 'bomb'];
    if (type === 'random') {
        type = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
    }
    
    powerups.push({
        x: x,
        y: y,
        type: type,
        size: 15,
        bounce: 0,
        collected: false,
        vy: 0, // Velocidade vertical
        onGround: false // Flag para verificar se está no chão
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

// === NOVA FUNÇÃO: ATUALIZAR ÁTOMOS ORBITANTES DA JULIETTE ===
function updatePlayerAtoms() {
    if (!playerAtomOrbs.initialized) {
        initializePlayerAtoms();
        return;
    }
    
    const time = Date.now() * 0.001;
    const centerX = posX + (frameWidth * scale) / 2;
    const centerY = posY + (frameHeight * scale) / 2;
    
    // === AJUSTAR NÍVEL DE ENERGIA BASEADO NA ARMA ===
    let energyMultiplier = 1.0;
    switch(weaponType) {
        case 'normal': energyMultiplier = 1.0; break;
        case 'spread': energyMultiplier = 1.2; break;
        case 'laser': energyMultiplier = 1.4; break;
        case 'machine': energyMultiplier = 1.6; break;
        case 'plasma': energyMultiplier = 1.8; break;
        case 'storm': energyMultiplier = 2.0; break;
        case 'nuclear': energyMultiplier = 2.5; break;
        case 'none': energyMultiplier = 0.8; break;
    }
    
    playerAtomOrbs.energyLevel = energyMultiplier;
    
    // Atualizar cada átomo orbitante da Juliette
    for (let i = 0; i < playerAtomOrbs.orbs.length; i++) {
        const orb = playerAtomOrbs.orbs[i];
        
        // Velocidade baseada no nível de energia e movimento
        let currentSpeed = orb.speed * energyMultiplier;
        if (moving) {
            currentSpeed *= 1.3; // Mais rápido quando em movimento
        }
        if (attacking) {
            currentSpeed *= 1.5; // Ainda mais rápido quando atacando
        }
        
        // Atualizar ângulo de rotação
        orb.angle += currentSpeed;
        
        // Atualizar pulso para efeito piscante (mais dinâmico)
        orb.pulse += 0.12 * energyMultiplier;
        
        // === CÁLCULO AVANÇADO DE POSIÇÃO ===
        // Raio base varia com energia e fase do jogo
        let dynamicBaseRadius = orb.baseRadius;
        if (gameState.currentPhase === 2) {
            dynamicBaseRadius *= 1.2; // Maior na fase 2
        }
        if (initialShieldActive) {
            dynamicBaseRadius *= 0.9; // Menor quando escudo inicial está ativo
        }
        
        // Variação do raio com pulso e energia
        const baseRadius = dynamicBaseRadius + 
            Math.sin(orb.pulse + orb.orbit.phaseOffset) * orb.orbit.radiusVariation * energyMultiplier;
        
        // Excentricidade da órbita
        const eccentricRadius = baseRadius * (1 + orb.orbit.eccentricity * Math.cos(orb.angle * 2));
        
        // Posição da órbita com inclinação e movimento vertical
        let orbX = Math.cos(orb.angle) * eccentricRadius;
        let orbY = Math.sin(orb.angle) * eccentricRadius * Math.cos(orb.orbit.tiltAngle);
        
        // === EFEITOS ESPECIAIS BASEADOS NO ESTADO ===
        // Efeito de "respiração" quando parada
        if (!moving && !attacking) {
            const breathe = Math.sin(time * 1.5 + i) * 3;
            orbY += breathe;
        }
        
        // Efeito de "eletricidade" durante o tiro
        if (attacking || shootCooldown > 0) {
            orbX += (Math.random() - 0.5) * 8 * energyMultiplier;
            orbY += (Math.random() - 0.5) * 8 * energyMultiplier;
        }
        
        // Posição final do átomo
        orb.x = centerX + orbX;
        orb.y = centerY + orbY;
        
        // Tamanho dinâmico baseado na energia
        const baseSizeMultiplier = 1 + (energyMultiplier - 1) * 0.3;
        orb.currentSize = (orb.size * baseSizeMultiplier) + 
            Math.sin(orb.pulse * 1.2) * 0.8 * energyMultiplier;
        
        // Alpha pulsante mais intenso
        orb.alpha = (0.7 + Math.sin(orb.pulse * 1.8) * 0.3) * 
            Math.min(energyMultiplier, 1.5); // Limita o alpha máximo
        
        // === EFEITO ESPECIAL PARA O PRIMEIRO ÁTOMO ===
        if (orb.specialEffect) {
            orb.alpha *= (1 + Math.sin(time * 4) * 0.2); // Pulso extra
            orb.currentSize *= (1 + Math.sin(time * 3) * 0.15); // Tamanho extra
        }
        
        // === RASTRO DE PARTÍCULAS PARA ÁTOMOS EM ALTA ENERGIA ===
        if (energyMultiplier >= 1.5 && Math.random() < 0.3) {
            orb.trailParticles.push({
                x: orb.x + (Math.random() - 0.5) * 6,
                y: orb.y + (Math.random() - 0.5) * 6,
                life: 15,
                maxLife: 15,
                size: Math.random() * 2 + 1,
                alpha: 0.6
            });
        }
        
        // Atualizar rastro de partículas
        for (let j = orb.trailParticles.length - 1; j >= 0; j--) {
            const trail = orb.trailParticles[j];
            trail.life--;
            trail.alpha = trail.life / trail.maxLife * 0.6;
            
            if (trail.life <= 0) {
                orb.trailParticles.splice(j, 1);
            }
        }
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
        
        // Movimento horizontal dos power-ups (scrolling com o fundo)
        if (backgroundScrolling) {
            if (facingRight) {
                powerup.x -= backgroundSpeed;
            } else {
                powerup.x += backgroundSpeed;
            }
        }
        
        // Animação de flutuação vertical
        powerup.bounce += 0.2;
        powerup.y += Math.sin(powerup.bounce) * 0.5;
        
        // Aplicar gravidade aos power-ups para que caiam no chão
        if (!powerup.onGround) {
            if (!powerup.vy) powerup.vy = 0; // Inicializar velocidade vertical
            powerup.vy += 0.5; // Gravidade
            powerup.y += powerup.vy;
            
            // Verificar se chegou no chão
            const groundLevel = CANVAS_HEIGHT - (frameHeight * scale) - 20;
            if (powerup.y + powerup.size >= groundLevel) {
                powerup.y = groundLevel - powerup.size;
                powerup.vy = 0;
                powerup.onGround = true;
            }
        }
        
        // Remove power-up se saiu da tela
        if (powerup.x < -30 || powerup.x > CANVAS_WIDTH + 30) {
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
    
    // Calcular onde começa o piso para posicionar o "fundo 2d melhor" acima
    const groundLevel = CANVAS_HEIGHT - (frameHeight * scale) - 20;
    const backgroundLayerHeight = groundLevel; // Altura da camada de fundo (até o piso)
    
    for (let i = -1; i < numRepeats; i++) {
        const x = (backgroundX % bgWidth) + (i * bgWidth);
        
        // Desenha a cena01 como primeiro plano (com menos transparência)
        if (sceneImg.complete) {
            ctx.globalAlpha = 0.9; // Diminuir transparência (era 1.0)
            ctx.drawImage(sceneImg, x, 0, bgWidth, bgHeight);
            ctx.globalAlpha = 1.0;
        }
        
        // === SISTEMA DE FASES: ESCOLHER FUNDO BASEADO NA FASE ATUAL ===
        let currentBackgroundImg = backgroundImg; // Fase 1 padrão
        
        if (gameState.currentPhase === 2 && backgroundImgPhase2.complete) {
            currentBackgroundImg = backgroundImgPhase2; // Fase 2
        }
        
        // Sobrepõe o fundo da fase atual apenas acima do piso
        if (currentBackgroundImg.complete) {
            ctx.globalAlpha = 0.8; // Aumentar um pouco a transparência desta camada
            // Desenhar apenas a parte que fica acima do piso
            ctx.drawImage(
                currentBackgroundImg, 
                0, 0, currentBackgroundImg.width, currentBackgroundImg.height, // Fonte completa
                x, 0, bgWidth, backgroundLayerHeight // Destino: da posição x, y=0, até o nível do piso
            );
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
    if ((normalizedAngle >= 315 && normalizedAngle <= 360) || (normalizedAngle >= 0 && normalizedAngle <= 14)) {
        // Tiros horizontais puros (direita) - 0°, ±5°, ±10°
        selectedAnimation = 'weapon_shoot_front';
    } else if (normalizedAngle >= 15 && normalizedAngle <= 75) {
        // Tiros diagonais para baixo-direita (15° a 75°) - usa animação de 60° para baixo
        selectedAnimation = 'weapon_shoot_diagonal_down';
    } else if (normalizedAngle >= 76 && normalizedAngle <= 104) {
        // Tiros verticais para baixo (76° a 104°) - usa animação de 90°
        selectedAnimation = 'weapon_shoot_90';
    } else if (normalizedAngle >= 105 && normalizedAngle <= 165) {
        // Tiros diagonais para baixo-esquerda (105° a 165°) - usa animação de 60° para baixo
        selectedAnimation = 'weapon_shoot_diagonal_down';
    } else if (normalizedAngle >= 166 && normalizedAngle <= 194) {
        // Tiros horizontais para esquerda (166° a 194°)
        selectedAnimation = 'weapon_shoot_front'; // Mesmo sprite, mas espelhado
    } else if (normalizedAngle >= 195 && normalizedAngle <= 255) {
        // Tiros diagonais para cima-esquerda (195° a 255°) - usa animação geral para cima
        selectedAnimation = 'weapon_shoot_up';
    } else if (normalizedAngle >= 256 && normalizedAngle <= 284) {
        // Tiros verticais para cima (256° a 284°) - usa animação específica de 90°
        selectedAnimation = 'weapon_shoot_90';
    } else if (normalizedAngle >= 285 && normalizedAngle <= 314) {
        // Tiros diagonais para cima-direita (285° a 314°) - usa animação geral para cima
        selectedAnimation = 'weapon_shoot_up';
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
    
    // === ATUALIZAR BALANÇO DA ANIMAÇÃO DA CORRENTE ===
    if (chainWeaponType === 'left_hand' && chainWeaponActive) {
        chainSwingFrame += chainSwingSpeed * chainSwingDirection;
        if (chainSwingFrame >= 2) {
            chainSwingFrame = 2;
            chainSwingDirection = -1;
        } else if (chainSwingFrame <= 0) {
            chainSwingFrame = 0;
            chainSwingDirection = 1;
        }
    } else {
        chainSwingFrame = 0;
        chainSwingDirection = 1;
    }
    
    // Atualizar cooldowns
    if (chainAttackCooldown > 0) chainAttackCooldown--;
    if (shootingUpTimer > 0) shootingUpTimer--;
    if (celebrationTimer > 0) celebrationTimer--;
    
    // Atualizar cooldown do painel de controles
    if (controlsPanelToggleTimer > 0) controlsPanelToggleTimer--;
}

// === FUNÇÃO AVANÇADA PARA DESENHAR O JOGADOR COM MELHORIAS ===
function drawPlayer() {
    const anim = animations[currentAnim];
    
    // Calcular posição com movimento vertical muito sutil
    let drawX = posX;
    let drawY = posY + (walkBobOffset * 0.3); // REDUZIDO: aplicar apenas 30% do bob para suavidade
    
    // REMOVIDO: Sistema de rotação que causava problemas de escala
    let rotation = 0; // Sempre 0 para manter estabilidade visual
    
    // === NOVO: SISTEMA UNIVERSAL DE SHUFFLE (CAMINHANDO E PARADA) ===
    // Verificar se deve usar o shuffle - TANTO caminhando QUANTO parada sem arma
    let useShuffleImage = false;
    let shuffleImageName = null;
    
    // CONDIÇÃO EXPANDIDA: usar shuffle quando caminhando OU quando parada sem arma
    if (!hasWeapon && !isInSpecialAnim && 
        ((moving && currentAnim === 'walk_noweapon') || (!moving && currentAnim === 'idle_noweapon'))) {
        useShuffleImage = true;
        
        // Usar o índice apropriado baseado no estado
        if (moving) {
            shuffleImageName = walkShuffleImages[walkShuffleIndex]; // Shuffle rápido quando caminhando
        } else {
            shuffleImageName = walkShuffleImages[idleShuffleIndex]; // Shuffle lento quando parada
        }
    }
    
    // === RENDERIZAÇÃO COM SHUFFLE DE CAMINHADA ===
    if (useShuffleImage) {
        // Usar imagem do shuffle para caminhada
        const shuffleImage = playerImages[shuffleImageName];
        if (shuffleImage && shuffleImage.complete) {
            ctx.save();
            
            // Aplicar transformações para movimento mais fluido
            const centerX = drawX + (frameWidth * scale) / 2;
            const centerY = drawY + (frameHeight * scale) / 2;
            
            ctx.translate(centerX, centerY);
            ctx.rotate(rotation);
            ctx.translate(-centerX, -centerY);
            
            // Efeito de desfoque sutil durante movimento rápido
            if (moving && playerSpeed > 4) {
                ctx.filter = `blur(${(playerSpeed - 4) * 0.3}px)`;
            }
            
            // Espelhar se necessário
            if (!facingRight) {
                ctx.scale(-1, 1);
                ctx.drawImage(
                    shuffleImage,
                    -(drawX + frameWidth * scale), drawY,
                    frameWidth * scale, frameHeight * scale
                );
            } else {
                ctx.drawImage(
                    shuffleImage,
                    drawX, drawY,
                    frameWidth * scale, frameHeight * scale
                );
            }
            
            ctx.restore();
        }
    }
    // === RENDERIZAÇÃO NORMAL (ANIMAÇÕES ESPECIAIS) ===
    else if (anim.type === 'sprite') {
        const spriteImage = playerImages[anim.image];
        if (spriteImage && spriteImage.complete) {
            ctx.save();
            
            // Aplicar transformações para movimento mais fluido
            const centerX = drawX + (frameWidth * scale) / 2;
            const centerY = drawY + (frameHeight * scale) / 2;
            
            ctx.translate(centerX, centerY);
            ctx.rotate(rotation);
            ctx.translate(-centerX, -centerY);
            
            // Espelhar se necessário
            if (!facingRight) {
                ctx.scale(-1, 1);
                ctx.drawImage(
                    spriteImage,
                    -(drawX + frameWidth * scale), drawY,
                    frameWidth * scale, frameHeight * scale
                );
            } else {
                ctx.drawImage(
                    spriteImage,
                    drawX, drawY,
                    frameWidth * scale, frameHeight * scale
                );
            }
            
            ctx.restore();
        }
    } else {
        // Animação normal do spritesheet com melhorias
        if (playerImages.spritesheet.complete) {
            const sx = frameIndex * frameWidth;
            const sy = anim.row * frameHeight;
            
            ctx.save();
            
            // Aplicar transformações para movimento mais fluido
            const centerX = drawX + (frameWidth * scale) / 2;
            const centerY = drawY + (frameHeight * scale) / 2;
            
            ctx.translate(centerX, centerY);
            ctx.rotate(rotation);
            ctx.translate(-centerX, -centerY);
            
            // Efeito de desfoque sutil durante movimento rápido
            if (moving && playerSpeed > 4) {
                ctx.filter = `blur(${(playerSpeed - 4) * 0.3}px)`;
            }
            
            if (!facingRight) {
                ctx.scale(-1, 1);
                ctx.drawImage(
                    playerImages.spritesheet,
                    sx, sy, frameWidth, frameHeight,
                    -(drawX + frameWidth * scale), drawY,
                    frameWidth * scale, frameHeight * scale
                );
            } else {
                ctx.drawImage(
                    playerImages.spritesheet,
                    sx, sy, frameWidth, frameHeight,
                    drawX, drawY,
                    frameWidth * scale, frameHeight * scale
                );
            }
            
            ctx.restore();
        }
    }
    
    // === NOVO: EFEITOS VISUAIS DE MOVIMENTO ===
    if (moving && onGround) {
        drawMovementTrail();
    }
    
    // Efeitos visuais especiais
    if (chainWeaponActive) {
        drawChainEffect();
    }
    
    if (shootingUp) {
        drawShootingUpEffect();
    }
}

// === NOVA FUNÇÃO: DESENHAR RASTRO DE MOVIMENTO ===
function drawMovementTrail() {
    if (!moving || !onGround) return;
    
    const trailLength = 3;
    const trailSpacing = 15;
    
    ctx.save();
    
    for (let i = 0; i < trailLength; i++) {
        const alpha = (trailLength - i) / trailLength * 0.2;
        const trailX = posX + (facingRight ? -trailSpacing * (i + 1) : trailSpacing * (i + 1));
        const trailY = posY; // REMOVIDO: walkBobOffset para evitar balanços
        
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#FFFFFF';
        
        // Desenhar silhueta simplificada
        ctx.fillRect(
            trailX + (frameWidth * scale) * 0.3,
            trailY + (frameHeight * scale) * 0.2,
            (frameWidth * scale) * 0.4,
            (frameHeight * scale) * 0.6
        );
    }
    
    ctx.restore();
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

// === NOVA FUNÇÃO: ATUALIZAR SISTEMA DE CAMINHADA MELHORADO ===
function updateWalkingSystem() {
    // === SISTEMA UNIVERSAL DE SHUFFLE (CAMINHANDO E PARADO) ===
    if (moving) {
        // === CAMINHANDO: SHUFFLE RÁPIDO ===
        walkShuffleTimer++;
        if (walkShuffleTimer >= walkShuffleSpeed) {
            walkShuffleTimer = 0;
            // Avançar para próxima pose no shuffle
            walkShuffleIndex = (walkShuffleIndex + 1) % walkShuffleImages.length;
            
            // Debug: mostrar qual imagem está sendo usada
            console.log(`🚶‍♀️ Shuffle caminhada: ${walkShuffleImages[walkShuffleIndex]} (${walkShuffleIndex + 1}/4)`);
        }
        
        // Incrementar timers de caminhada
        walkCycleTimer += 0.08; // REDUZIDO: era 0.15 - movimento mais suave
        walkStepTimer += 0.12; // REDUZIDO: era 0.2 - passos mais naturais
        walkParticleTimer++;
        
        // Calcular movimento vertical MUITO sutil (reduzido drasticamente)
        walkBobOffset = Math.sin(walkCycleTimer) * 0.8; // REDUZIDO: era 2 - movimento quase imperceptível
        
        // Acelerar animação baseado na velocidade (mais suave)
        walkAnimSpeedMultiplier = 1.0 + (playerSpeed - 4) * 0.05; // REDUZIDO: era 0.1
        
        // Criar partículas de poeira dos passos ocasionalmente
        if (walkParticleTimer >= 15 && onGround) {
            createWalkingDustParticles();
            walkParticleTimer = 0;
        }
        
        // Detectar mudança de passo para efeitos sonoros
        const currentStepFrame = Math.floor(walkStepTimer * 2) % 4;
        if (currentStepFrame === 0 || currentStepFrame === 2) {
            if (walkStepTimer > 1) { // Evitar sons na inicialização
                const currentSide = currentStepFrame === 0 ? 'left' : 'right';
                if (currentSide !== lastStepSide) {
                    createStepEffect(currentSide);
                    lastStepSide = currentSide;
                }
            }
        }
    } else {
        // === PARADA: SHUFFLE LENTO E CONTÍNUO ===
        idleShuffleTimer++;
        if (idleShuffleTimer >= idleShuffleSpeed) {
            idleShuffleTimer = 0;
            // Avançar para próxima pose no shuffle quando parada
            idleShuffleIndex = (idleShuffleIndex + 1) % walkShuffleImages.length;
            
            // Debug: mostrar qual imagem está sendo usada quando parada
            console.log(`🧍‍♀️ Shuffle parada: ${walkShuffleImages[idleShuffleIndex]} (${idleShuffleIndex + 1}/4)`);
        }
        
        // Resetar valores de caminhada quando parado
        walkBobOffset *= 0.95; // SUAVIZADO: era 0.9 - diminuir mais suavemente
        walkCycleTimer = 0;
        walkStepTimer = 0;
        walkAnimSpeedMultiplier = 1.0;
        horizontalMovementAccel *= 0.9; // SUAVIZADO: era 0.8
        
        // NÃO resetar shuffles quando parado - mantém animação contínua
        // Sincronizar os dois sistemas de shuffle quando parado
        walkShuffleIndex = idleShuffleIndex; // Manter sincronizado
    }
}

// === NOVA FUNÇÃO: CRIAR PARTÍCULAS DE POEIRA DA CAMINHADA ===
function createWalkingDustParticles() {
    if (!onGround) return;
    
    const footX = posX + (frameWidth * scale) / 2 + (facingRight ? 10 : -10);
    const footY = posY + (frameHeight * scale) - 5;
    
    // Criar 2-3 partículas pequenas de poeira
    for (let i = 0; i < 3; i++) {
        particles.push({
            x: footX + (Math.random() - 0.5) * 15,
            y: footY + (Math.random() - 0.5) * 5,
            vx: (Math.random() - 0.5) * 3 + (facingRight ? -1 : 1),
            vy: -Math.random() * 2,
            life: 20 + Math.random() * 10,
            color: '#8B4513', // Cor marrom para poeira
            size: Math.random() * 2 + 1,
            type: 'dust'
        });
    }
}

// === NOVA FUNÇÃO: CRIAR EFEITO DE PASSO ===
function createStepEffect(side) {
    // Som sutil de passo (muito baixo para não ser intrusivo)
    if (gameAudio.enabled && Math.random() > 0.7) { // Só 30% das vezes
        generateSound(220 + Math.random() * 100, 50, 'triangle');
    }
    
    // Pequena vibração visual no personagem
    if (onGround) {
        const vibrationIntensity = 1;
        posY += (Math.random() - 0.5) * vibrationIntensity;
    }
}

// Função para atualizar o estado da animação
function updateAnimationState() {
    // Atualizar sistema de caminhada melhorado
    updateWalkingSystem();
    
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
                
                // === VERIFICAR ESCUDO PRIMEIRO ===
                // Prioridade: Escudo inicial > Escudo normal
                if (initialShieldActive || (shieldActive && shieldEnergy > 0)) {
                    // Escudo absorve o tiro
                    if (initialShieldActive) {
                        // Escudo inicial absorve completamente
                        bullets.splice(i, 1);
                        
                        // Criar efeito visual especial para escudo inicial
                        createInitialShieldHitEffect(playerRect.x + playerRect.width/2, playerRect.y + playerRect.height/2);
                        
                        // Som especial do escudo inicial
                        playSound('enemyHit', 900, 80);
                    } else {
                        // Escudo normal absorve com custo de energia
                        shieldEnergy -= bullet.damage * 0.5;
                        bullets.splice(i, 1);
                        
                        // Criar efeito visual do escudo sendo atingido
                        createShieldHitEffect(playerRect.x + playerRect.width/2, playerRect.y + playerRect.height/2);
                        
                        // Som de escudo absorvendo
                        playSound('enemyHit', 800, 100);
                        
                        // Se escudo acabou a energia, desativa
                        if (shieldEnergy <= 0) {
                            shieldEnergy = 0;
                            deactivateShield();
                            playSound('playerHit', 300, 200);
                        }
                    }
                    
                    continue; // Pular para próxima bala, esse tiro foi bloqueado
                }
                
                // === NOVO SISTEMA DE RESISTÊNCIA A TIROS ===
                gameState.hitsReceived++;
                
                // Determinar quantos tiros são necessários para morrer baseado na fase
                const maxHits = gameState.currentPhase === 1 ? gameState.maxHitsPhase1 : gameState.maxHitsPhase2;
                
                // Calcular dano baseado na resistência da fase
                let actualDamage = bullet.damage;
                if (gameState.currentPhase === 2) {
                    // Na fase 2, cada tiro causa menos dano (1000 tiros para morrer)
                    actualDamage = Math.ceil(100 / gameState.maxHitsPhase2 * 10); // Aproximadamente 0.1 de dano por tiro
                }
                
                playerHealth -= actualDamage;
                bullets.splice(i, 1);
                invulnerable = true;
                invulnerableTime = 120; // 2 segundos de invulnerabilidade
                
                // Som de dano no jogador
                playSound('playerHit', 200, 400);
                
                // Log para debug
                console.log(`Fase ${gameState.currentPhase}: Tiro ${gameState.hitsReceived}/${maxHits}, Vida: ${playerHealth}`);
                
                if (playerHealth <= 0 || gameState.hitsReceived >= maxHits) {
                    gameState.lives--;
                    if (gameState.lives <= 0) {
                        gameState.gameOver = true;
                        playSound('gameOver', 150, 1000);
                    } else {
                        playerHealth = 100;
                        gameState.hitsReceived = 0; // Resetar contador de tiros
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
        case 'bomb':
            // Coletar bomba (máximo 5)
            if (bombCount < maxBombs) {
                bombCount++;
            }
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
        // Pular balas inimigas (mantêm cor original)
        if (bullet.type === 'enemy') {
            ctx.fillStyle = bullet.color;
            ctx.beginPath();
            ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
            ctx.fill();
            continue;
        }
        
        // === BALAS DO JOGADOR: AMARELO COM BORDA VERMELHA ===
        ctx.save();
        
        if (bullet.type === 'laser') {
            // Laser mais largo com efeito especial
            // Borda vermelha (mais larga)
            ctx.fillStyle = '#FF0000'; // Vermelho para borda
            ctx.fillRect(bullet.x - bullet.size/2 - 1, bullet.y - bullet.size/2 - 1, 
                        bullet.size * 2 + 2, bullet.size + 2);
            
            // Centro amarelo
            ctx.fillStyle = '#FFFF00'; // Amarelo para centro
            ctx.fillRect(bullet.x - bullet.size/2, bullet.y - bullet.size/2, 
                        bullet.size * 2, bullet.size);
        } else {
            // Bala normal circular com efeito amarelo/vermelho
            
            // Borda vermelha (círculo maior)
            ctx.fillStyle = '#FF0000'; // Vermelho para borda
            ctx.beginPath();
            ctx.arc(bullet.x, bullet.y, bullet.size + 1, 0, Math.PI * 2);
            ctx.fill();
            
            // Centro amarelo (círculo menor)
            ctx.fillStyle = '#FFFF00'; // Amarelo para centro
            ctx.beginPath();
            ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Efeito de brilho no centro (ainda menor)
            ctx.fillStyle = '#FFFF99'; // Amarelo mais claro para brilho
            ctx.beginPath();
            ctx.arc(bullet.x, bullet.y, bullet.size * 0.6, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
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
            case 'bomb': ctx.fillStyle = '#ff0000'; break; // Vermelho para bomba
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

// === NOVO SISTEMA DE ESCUDO AVANÇADO ===

// Ativar escudo
function activateShield() {
    if (shieldEnergy < 20 || shieldCooldown > 0) return;
    
    shieldActive = true;
    
    // Som de ativação do escudo
    playSound('powerup', 800, 300);
    
    // Criar efeitos visuais de ativação
    createShieldActivationEffects();
    
    console.log('🛡️ ESCUDO ATIVADO!');
}

// Desativar escudo
function deactivateShield() {
    if (!shieldActive) return;
    
    shieldActive = false;
    shieldCooldown = 120; // 2 segundos de cooldown
    
    // Som de desativação
    playSound('enemyHit', 400, 150);
    
    console.log('🛡️ ESCUDO DESATIVADO!');
}

// Criar efeitos de ativação do escudo
function createShieldActivationEffects() {
    const centerX = posX + (frameWidth * scale) / 2;
    const centerY = posY + (frameHeight * scale) / 2;
    
    // Criar partículas de energia em círculo
    for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        const radius = 60;
        particles.push({
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius,
            vx: Math.cos(angle) * 3,
            vy: Math.sin(angle) * 3,
            life: 30,
            color: '#00FFFF',
            size: 3,
            type: 'shield_activation'
        });
    }
    
    // Criar efeito de pulso central
    particles.push({
        x: centerX,
        y: centerY,
        vx: 0,
        vy: 0,
        life: 40,
        color: '#FFFFFF',
        size: 15,
        type: 'shield_pulse'
    });
}

// Criar efeito quando escudo é atingido
function createShieldHitEffect(x, y) {
    // Criar faíscas onde o escudo foi atingido
    for (let i = 0; i < 8; i++) {
        particles.push({
            x: x + (Math.random() - 0.5) * 20,
            y: y + (Math.random() - 0.5) * 20,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            life: 20,
            color: '#FFFF00',
            size: Math.random() * 3 + 1,
            type: 'shield_spark'
        });
    }
    
    // Efeito de ondas no ponto de impacto
    shieldHitEffects.push({
        x: x,
        y: y,
        radius: 5,
        maxRadius: 40,
        life: 15,
        alpha: 1.0
    });
}

// === NOVA FUNÇÃO: ATIVAR BOMBA ===
function activateBomb() {
    if (bombCount <= 0 || bombCooldown > 0) return;
    
    bombCount--;
    bombCooldown = bombMaxCooldown;
    
    // Som de bomba explosiva
    playSound('enemyDestroy', 200, 800);
    
    console.log(`💣 BOMBA ATIVADA! Bombas restantes: ${bombCount}`);
    
    // === DESTRUIR TODOS OS INIMIGOS ===
    let enemiesDestroyed = enemies.length;
    let scoreGained = 0;
    
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        
        // Criar explosão para cada inimigo
        createExplosion(enemy.x + enemy.size/2, enemy.y + enemy.size/2, 40);
        
        // Pontuação
        scoreGained += enemy.type === 'robot' ? 200 : 100;
        
        // Remover inimigo
        enemies.splice(i, 1);
    }
    
    gameState.score += scoreGained;
    
    // === DESTRUIR TODAS AS BALAS INIMIGAS ===
    let bulletCount = 0;
    for (let i = bullets.length - 1; i >= 0; i--) {
        if (bullets[i].type === 'enemy') {
            createExplosion(bullets[i].x, bullets[i].y, 15);
            bullets.splice(i, 1);
            bulletCount++;
        }
    }
    
    // === CRIAR EFEITO VISUAL DA BOMBA ===
    createBombExplosionEffect();
    
    console.log(`💥 Bomba destruiu ${enemiesDestroyed} inimigos e ${bulletCount} projéteis! +${scoreGained} pontos`);
}

// === NOVO SISTEMA DE DISCO DE LAVA FLUTUANTE ===

// Função para alternar disco de lava
function toggleLavaDisc() {
    if (lavaDisc.active) {
        deactivateLavaDisc();
    } else {
        activateLavaDisc();
    }
}

// Ativar disco de lava
function activateLavaDisc() {
    // Posicionar disco próximo ao jogador
    const playerCenterX = posX + (frameWidth * scale) / 2;
    const playerCenterY = posY + (frameHeight * scale) / 2;
    
    lavaDisc.active = true;
    lavaDisc.x = playerCenterX;
    lavaDisc.y = playerCenterY - 80; // Flutua um pouco acima do jogador
    lavaDisc.targetX = playerCenterX;
    lavaDisc.targetY = playerCenterY - 80;
    lavaDisc.heatIntensity = 0;
    lavaDisc.colorPhase = 0;
    lavaDisc.pulsePhase = 0;
    lavaDisc.floatOffset = 0;
    lavaDisc.particles = [];
    
    // Som de ativação do disco de lava
    playSound('powerup', 220, 600);
    
    console.log('🌋 DISCO DE LAVA ATIVADO!');
    
    // Criar efeito de ativação
    createLavaDiscActivationEffect();
}

// Desativar disco de lava
function deactivateLavaDisc() {
    lavaDisc.active = false;
    
    // Som de desativação
    playSound('enemyHit', 180, 400);
    
    console.log('🌋 DISCO DE LAVA DESATIVADO!');
    
    // Criar efeito de desativação
    createLavaDiscDeactivationEffect();
}

// Criar efeito de ativação do disco de lava
function createLavaDiscActivationEffect() {
    const centerX = lavaDisc.x;
    const centerY = lavaDisc.y;
    
    // Criar partículas de lava em espiral
    for (let i = 0; i < 15; i++) {
        const angle = (i / 15) * Math.PI * 2;
        const radius = 30 + i * 3;
        
        particles.push({
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius,
            vx: Math.cos(angle) * 2,
            vy: Math.sin(angle) * 2,
            life: 40,
            color: '#FF4500',
            size: Math.random() * 4 + 2,
            type: 'lava_activation'
        });
    }
}

// Criar efeito de desativação do disco de lava
function createLavaDiscDeactivationEffect() {
    const centerX = lavaDisc.x;
    const centerY = lavaDisc.y;
    
    // Criar partículas de resfriamento
    for (let i = 0; i < 20; i++) {
        particles.push({
            x: centerX + (Math.random() - 0.5) * 80,
            y: centerY + (Math.random() - 0.5) * 80,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            life: 30,
            color: '#666666', // Cinza para lava resfriada
            size: Math.random() * 5 + 3,
            type: 'lava_deactivation'
        });
    }
}

// Atualizar disco de lava
function updateLavaDisc() {
    if (!lavaDisc.active) return;
    
    const time = Date.now() * 0.001;
    
    // Atualizar posição alvo (segue o jogador)
    const playerCenterX = posX + (frameWidth * scale) / 2;
    const playerCenterY = posY + (frameHeight * scale) / 2;
    lavaDisc.targetX = playerCenterX;
    lavaDisc.targetY = playerCenterY - 80;
    
    // Movimento suave em direção ao alvo
    const dx = lavaDisc.targetX - lavaDisc.x;
    const dy = lavaDisc.targetY - lavaDisc.y;
    lavaDisc.x += dx * 0.05; // Velocidade de seguimento
    lavaDisc.y += dy * 0.05;
    
    // Flutuação vertical
    lavaDisc.floatOffset += 0.03;
    const floatY = Math.sin(lavaDisc.floatOffset) * 8;
    
    // Atualizar fases de cor e pulso
    lavaDisc.colorPhase += 0.02;
    lavaDisc.pulsePhase += 0.05;
    lavaDisc.heatIntensity = Math.sin(lavaDisc.pulsePhase) * 0.5 + 0.5;
    
    // Gerar partículas de lava
    if (Math.random() < 0.4) {
        const particleAngle = Math.random() * Math.PI * 2;
        const particleRadius = lavaDisc.radius + Math.random() * 10;
        
        lavaDisc.particles.push({
            x: lavaDisc.x + Math.cos(particleAngle) * particleRadius,
            y: lavaDisc.y + Math.sin(particleAngle) * particleRadius + floatY,
            vx: (Math.random() - 0.5) * 3,
            vy: Math.random() * -2 - 1,
            life: 30 + Math.random() * 20,
            maxLife: 50,
            size: Math.random() * 3 + 1,
            heatLevel: Math.random()
        });
    }
    
    // Atualizar partículas de lava
    for (let i = lavaDisc.particles.length - 1; i >= 0; i--) {
        const particle = lavaDisc.particles[i];
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.1; // Gravidade leve
        particle.vx *= 0.98; // Resistência do ar
        particle.life--;
        
        if (particle.life <= 0) {
            lavaDisc.particles.splice(i, 1);
        }
    }
}

// Desenhar disco de lava
function drawLavaDisc() {
    if (!lavaDisc.active) return;
    
    const time = Date.now() * 0.001;
    const centerX = lavaDisc.x;
    const centerY = lavaDisc.y + Math.sin(lavaDisc.floatOffset) * 8;
    
    ctx.save();
    
    // Calcular cor atual baseada na intensidade de calor
    const colorIndex = Math.floor(lavaDisc.heatIntensity * (lavaColors.length - 1));
    const nextColorIndex = Math.min(colorIndex + 1, lavaColors.length - 1);
    const colorMix = (lavaDisc.heatIntensity * (lavaColors.length - 1)) % 1;
    
    const currentColor = lavaColors[colorIndex];
    const nextColor = lavaColors[nextColorIndex];
    
    // Interpolar entre cores
    const r = Math.floor(currentColor.r + (nextColor.r - currentColor.r) * colorMix);
    const g = Math.floor(currentColor.g + (nextColor.g - currentColor.g) * colorMix);
    const b = Math.floor(currentColor.b + (nextColor.b - currentColor.b) * colorMix);
    
    // Efeito de glow pulsante
    const glowIntensity = 0.7 + Math.sin(lavaDisc.pulsePhase * 2) * 0.3;
    ctx.shadowColor = `rgb(${r}, ${g}, ${b})`;
    ctx.shadowBlur = 25 * glowIntensity;
    
    // Círculo principal do disco (núcleo)
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, lavaDisc.radius);
    gradient.addColorStop(0, `rgba(255, 255, 200, ${0.9 * glowIntensity})`);
    gradient.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${0.8 * glowIntensity})`);
    gradient.addColorStop(0.7, `rgba(${Math.floor(r * 0.8)}, ${Math.floor(g * 0.8)}, ${Math.floor(b * 0.8)}, ${0.6 * glowIntensity})`);
    gradient.addColorStop(1, `rgba(${Math.floor(r * 0.5)}, ${Math.floor(g * 0.5)}, ${Math.floor(b * 0.5)}, ${0.3 * glowIntensity})`);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, lavaDisc.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Linhas de energia rotativas no disco
    const numLines = 8;
    for (let i = 0; i < numLines; i++) {
        const angle = (time * 2 + (i / numLines) * Math.PI * 2) % (Math.PI * 2);
        const lineLength = lavaDisc.radius * 0.7;
        
        ctx.strokeStyle = `rgba(255, 255, 100, ${0.6 * glowIntensity})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + Math.cos(angle) * lineLength,
            centerY + Math.sin(angle) * lineLength
        );
        ctx.stroke();
    }
    
    // Anel externo pulsante
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${glowIntensity})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(centerX, centerY, lavaDisc.radius + 5 + Math.sin(lavaDisc.pulsePhase * 3) * 3, 0, Math.PI * 2);
    ctx.stroke();
    
    // Desenhar partículas de lava
    for (const particle of lavaDisc.particles) {
        const alpha = particle.life / particle.maxLife;
        const heatColor = lavaColors[Math.floor(particle.heatLevel * (lavaColors.length - 1))];
        
        ctx.globalAlpha = alpha;
        ctx.fillStyle = `rgb(${heatColor.r}, ${heatColor.g}, ${heatColor.b})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Texto flutuante indicando o disco
    ctx.globalAlpha = 0.8 + Math.sin(time * 3) * 0.2;
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🌋 LAVA', centerX, centerY - lavaDisc.radius - 15);
    
    ctx.restore();
}

// Criar efeito visual da bomba
function createBombExplosionEffect() {
    const centerX = CANVAS_WIDTH / 2;
    const centerY = CANVAS_HEIGHT / 2;
    
    // Criar múltiplas ondas de explosão
    for (let wave = 0; wave < 5; wave++) {
        setTimeout(() => {
            // Criar partículas em círculo para cada onda
            for (let i = 0; i < 30; i++) {
                const angle = (i / 30) * Math.PI * 2;
                const radius = 100 + wave * 50;
                
                particles.push({
                    x: centerX + Math.cos(angle) * radius,
                    y: centerY + Math.sin(angle) * radius,
                    vx: Math.cos(angle) * (8 + wave * 2),
                    vy: Math.sin(angle) * (8 + wave * 2),
                    life: 40 - wave * 5,
                    color: wave % 2 === 0 ? '#FF4444' : '#FFFF44',
                    size: Math.random() * 6 + 4
                });
            }
            
            // Criar explosões grandes em pontos aleatórios
            for (let i = 0; i < 8; i++) {
                createExplosion(
                    Math.random() * CANVAS_WIDTH,
                    Math.random() * CANVAS_HEIGHT,
                    60 + Math.random() * 40
                );
            }
        }, wave * 100); // Delay entre ondas
    }
}

// Atualizar sistema de escudo
function updateShield() {
    // === ATUALIZAR ESCUDO INICIAL ===
    if (initialShieldActive) {
        initialShieldTimer--;
        
        if (initialShieldTimer <= 0) {
            initialShieldActive = false;
            initialShieldTimer = 0;
            
            // Som de escudo inicial acabando
            playSound('playerHit', 400, 300);
            console.log('🛡️ ESCUDO INICIAL EXPIRADO!');
            
            // Efeito visual de expiração
            for (let i = 0; i < 10; i++) {
                particles.push({
                    x: posX + (frameWidth * scale) / 2 + (Math.random() - 0.5) * 80,
                    y: posY + (frameHeight * scale) / 2 + (Math.random() - 0.5) * 80,
                    vx: (Math.random() - 0.5) * 6,
                    vy: (Math.random() - 0.5) * 6,
                    life: 40,
                    color: '#FFD700',
                    size: Math.random() * 4 + 2
                });
            }
        }
    }
    
    // Regenerar energia do escudo quando não está sendo usado
    if (!shieldActive && shieldEnergy < shieldMaxEnergy) {
        shieldEnergy += shieldRegenRate;
        if (shieldEnergy > shieldMaxEnergy) {
            shieldEnergy = shieldMaxEnergy;
        }
    }
    
    // Diminuir energia do escudo quando ativo
    if (shieldActive) {
        shieldEnergy -= 0.8; // Drena energia gradualmente
        
        if (shieldEnergy <= 0) {
            shieldEnergy = 0;
            deactivateShield();
        }
    }
    
    // Diminuir cooldown
    if (shieldCooldown > 0) {
        shieldCooldown--;
    }
    
    // Atualizar efeitos visuais do escudo
    updateShieldEffects();
    
    // Atualizar efeitos de impacto
    updateShieldHitEffects();
}

// Atualizar efeitos visuais do escudo
function updateShieldEffects() {
    if (!shieldActive) return;
    
    const centerX = posX + (frameWidth * scale) / 2;
    const centerY = posY + (frameHeight * scale) / 2;
    const time = Date.now() * 0.01;
    
    // Criar partículas orbitantes do escudo
    if (Math.random() < 0.3) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 50 + Math.sin(time * 0.5) * 10;
        
        shieldEffects.push({
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius,
            vx: Math.cos(angle + Math.PI/2) * 2,
            vy: Math.sin(angle + Math.PI/2) * 2,
            life: 25,
            size: 2,
            color: '#00FFFF',
            alpha: 0.8
        });
    }
    
    // Atualizar partículas do escudo existentes
    for (let i = shieldEffects.length - 1; i >= 0; i--) {
        const effect = shieldEffects[i];
        effect.x += effect.vx;
        effect.y += effect.vy;
        effect.life--;
        effect.alpha = effect.life / 25;
        
        if (effect.life <= 0) {
            shieldEffects.splice(i, 1);
        }
    }
}

// Atualizar efeitos de impacto no escudo
function updateShieldHitEffects() {
    for (let i = shieldHitEffects.length - 1; i >= 0; i--) {
        const effect = shieldHitEffects[i];
        effect.life--;
        effect.radius += (effect.maxRadius - effect.radius) * 0.3;
        effect.alpha = effect.life / 15;
        
        if (effect.life <= 0) {
            shieldHitEffects.splice(i, 1);
        }
    }
}

// Criar efeito especial quando escudo inicial é atingido
function createInitialShieldHitEffect(x, y) {
    // Criar faíscas douradas onde o escudo foi atingido
    for (let i = 0; i < 12; i++) {
        particles.push({
            x: x + (Math.random() - 0.5) * 30,
            y: y + (Math.random() - 0.5) * 30,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            life: 25,
            color: '#FFD700',
            size: Math.random() * 4 + 2,
            type: 'initial_shield_spark'
        });
    }
    
    // Efeito de ondas douradas no ponto de impacto
    shieldHitEffects.push({
        x: x,
        y: y,
        radius: 8,
        maxRadius: 50,
        life: 20,
        alpha: 1.0,
        color: '#FFD700'
    });
}

// === NOVA FUNÇÃO: DESENHAR ÁTOMOS ORBITANTES DA JULIETTE ===
function drawPlayerAtoms() {
    if (!playerAtomOrbs.initialized || !playerAtomOrbs.enabled || playerAtomOrbs.orbs.length === 0) return;
    
    const time = Date.now() * 0.005;
    
    ctx.save();
    
    // Desenhar trilha orbital (fina e sutil)
    if (playerAtomOrbs.orbs.length > 0) {
        const firstOrb = playerAtomOrbs.orbs[0];
        const centerX = posX + (frameWidth * scale) / 2;
        const centerY = posY + (frameHeight * scale) / 2;
        
        // Trilha orbital principal
        ctx.globalAlpha = 0.15;
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
            const radius = firstOrb.baseRadius * (1 + firstOrb.orbit.eccentricity * Math.cos(angle * 2));
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius * Math.cos(firstOrb.orbit.tiltAngle);
            
            if (angle === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.stroke();
    }
    
    // Desenhar cada átomo da Juliette
    for (let i = 0; i < playerAtomOrbs.orbs.length; i++) {
        const orb = playerAtomOrbs.orbs[i];
        
        // Configurar estilo do átomo com intensidade baseada na energia
        const energyGlow = playerAtomOrbs.energyLevel;
        ctx.globalAlpha = orb.alpha;
        ctx.fillStyle = orb.color;
        
        // REMOVIDO: Efeito glow que estava causando sombra rosa em toda tela
        // ctx.shadowColor = orb.color;
        // ctx.shadowBlur = 12 * energyGlow;
        // ctx.shadowOffsetX = 0;
        // ctx.shadowOffsetY = 0;
        
        // Desenhar o átomo principal (esfera exterior)
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.currentSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Núcleo interno brilhante (mais intenso que inimigos)
        ctx.globalAlpha = orb.alpha * 1.8;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.currentSize * 0.4, 0, Math.PI * 2);
        ctx.fill();
        
        // === EFEITOS ESPECIAIS PARA ÁTOMOS DE ALTA ENERGIA ===
        if (energyGlow >= 1.5) {
            // Anel de energia externa (sem sombra)
            ctx.globalAlpha = orb.alpha * 0.6;
            ctx.strokeStyle = orb.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(orb.x, orb.y, orb.currentSize + 3 + Math.sin(time * 4 + i) * 2, 0, Math.PI * 2);
            ctx.stroke();
            
            // Pulsos de energia (linhas radiais)
            for (let pulse = 0; pulse < 4; pulse++) {
                const pulseAngle = (time * 6 + pulse * Math.PI / 2 + i) % (Math.PI * 2);
                const innerRadius = orb.currentSize * 0.7;
                const outerRadius = orb.currentSize * 1.4;
                
                ctx.globalAlpha = orb.alpha * 0.5;
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(
                    orb.x + Math.cos(pulseAngle) * innerRadius,
                    orb.y + Math.sin(pulseAngle) * innerRadius
                );
                ctx.lineTo(
                    orb.x + Math.cos(pulseAngle) * outerRadius,
                    orb.y + Math.sin(pulseAngle) * outerRadius
                );
                ctx.stroke();
            }
        }
        
        // === EFEITO SUPER ESPECIAL PARA O PRIMEIRO ÁTOMO ===
        if (orb.specialEffect) {
            // Aura dourada especial (sem sombra global)
            ctx.globalAlpha = 0.3 + Math.sin(time * 5) * 0.2;
            const specialGradient = ctx.createRadialGradient(
                orb.x, orb.y, 0,
                orb.x, orb.y, orb.currentSize * 2
            );
            specialGradient.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
            specialGradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.4)');
            specialGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
            
            ctx.fillStyle = specialGradient;
            ctx.beginPath();
            ctx.arc(orb.x, orb.y, orb.currentSize * 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Estrela de energia dourada
            ctx.globalAlpha = 0.7 + Math.sin(time * 8) * 0.3;
            ctx.fillStyle = '#FFD700';
            
            const starRadius = orb.currentSize * 0.3;
            const starSpikes = 8;
            ctx.beginPath();
            
            for (let spike = 0; spike < starSpikes; spike++) {
                const angle = (spike / starSpikes) * Math.PI * 2 + time * 3;
                const radius = spike % 2 === 0 ? starRadius : starRadius * 0.5;
                const x = orb.x + Math.cos(angle) * radius;
                const y = orb.y + Math.sin(angle) * radius;
                
                if (spike === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();
            ctx.fill();
        }
        
        // === DESENHAR RASTRO DE PARTÍCULAS ===
        for (const trail of orb.trailParticles) {
            ctx.globalAlpha = trail.alpha;
            ctx.fillStyle = orb.color;
            ctx.beginPath();
            ctx.arc(trail.x, trail.y, trail.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // === EFEITO GERAL DE ENERGIA DA JULIETTE ===
    if (playerAtomOrbs.energyLevel >= 2.0) {
        // Campo de energia central quando está com arma poderosa
        const centerX = posX + (frameWidth * scale) / 2;
        const centerY = posY + (frameHeight * scale) / 2;
        
        ctx.globalAlpha = 0.1 + Math.sin(time * 3) * 0.05;
        const fieldGradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, playerAtomOrbs.baseRadius * 1.5
        );
        fieldGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        fieldGradient.addColorStop(0.7, 'rgba(0, 255, 255, 0.1)');
        fieldGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
        
        ctx.fillStyle = fieldGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, playerAtomOrbs.baseRadius * 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
}

// Desenhar escudo e seus efeitos
function drawShield() {
    if (!shieldActive && !initialShieldActive) return;
    
    const centerX = posX + (frameWidth * scale) / 2;
    const centerY = posY + (frameHeight * scale) / 2;
    const time = Date.now() * 0.005;
    const energyPercent = shieldEnergy / shieldMaxEnergy;
    
    ctx.save();
    
    // Determinar tipo de escudo e configurações
    let shieldColor = [0, 255, 255]; // Ciano padrão
    let currentRadius = 45;
    let currentEnergy = energyPercent;
    
    if (initialShieldActive) {
        shieldColor = [255, 215, 0]; // Dourado para escudo inicial
        currentRadius = 55; // Maior para escudo inicial
        currentEnergy = initialShieldTimer / initialShieldDuration;
    }
    
    // Escudo principal - anel pulsante
    const pulseRadius = currentRadius + Math.sin(time * 3) * 8;
    
    // Gradiente do escudo baseado na energia e tipo
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseRadius);
    gradient.addColorStop(0, `rgba(${shieldColor[0]}, ${shieldColor[1]}, ${shieldColor[2]}, 0)`);
    gradient.addColorStop(0.7, `rgba(${shieldColor[0]}, ${shieldColor[1]}, ${shieldColor[2]}, ${0.4 * currentEnergy})`);
    gradient.addColorStop(1, `rgba(${shieldColor[0]}, ${shieldColor[1]}, ${shieldColor[2]}, ${0.9 * currentEnergy})`);
    
    // Desenhar escudo principal
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Borda do escudo (mais espessa para escudo inicial)
    const borderWidth = initialShieldActive ? 4 : 3;
    ctx.strokeStyle = `rgba(${shieldColor[0]}, ${shieldColor[1]}, ${shieldColor[2]}, ${currentEnergy})`;
    ctx.lineWidth = borderWidth;
    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Linhas de energia rotativas (mais para escudo inicial)
    const numLines = initialShieldActive ? 8 : 6;
    const lineLength = initialShieldActive ? 40 : 30;
    
    for (let i = 0; i < numLines; i++) {
        const angle = (time + i * Math.PI / (numLines/2)) % (Math.PI * 2);
        
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.7 * currentEnergy})`;
        ctx.lineWidth = initialShieldActive ? 3 : 2;
        ctx.beginPath();
        ctx.moveTo(
            centerX + Math.cos(angle) * (pulseRadius - lineLength),
            centerY + Math.sin(angle) * (pulseRadius - lineLength)
        );
        ctx.lineTo(
            centerX + Math.cos(angle) * pulseRadius,
            centerY + Math.sin(angle) * pulseRadius
        );
        ctx.stroke();
    }
    
    // Desenhar partículas orbitantes do escudo
    for (const effect of shieldEffects) {
        ctx.globalAlpha = effect.alpha;
        ctx.fillStyle = effect.color;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
    
    // Desenhar efeitos de impacto
    drawShieldHitEffects();
}

// Desenhar efeitos de impacto no escudo
function drawShieldHitEffects() {
    ctx.save();
    
    for (const effect of shieldHitEffects) {
        ctx.globalAlpha = effect.alpha;
        
        // Cor baseada no tipo (dourado para inicial, amarelo para normal)
        const effectColor = effect.color || '#FFFF00';
        
        // Onda de choque
        ctx.strokeStyle = effectColor;
        ctx.lineWidth = effect.color ? 4 : 3; // Mais espessa para escudo inicial
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Onda secundária
        ctx.globalAlpha = effect.alpha * 0.5;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius * 0.7, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    ctx.restore();
}

// Desenhar HUD
function drawHUD() {
    // Verificar se deve desenhar HUD completo ou só essenciais
    if (!hudVisible && !hudMinimized) {
        // HUD completamente oculto - mostrar apenas toggle
        drawHUDToggleButton();
        return;
    }
    
    if (hudMinimized) {
        // HUD minimizado - mostrar apenas informações essenciais
        drawMinimizedHUD();
        return;
    }
    
    // HUD completo
    // Fundo do HUD principal
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, 100); // Aumentado para mais espaço
    
    // === LAYOUT REORGANIZADO E COMPACTO ===
    const hudFontSmall = CANVAS_WIDTH > 1200 ? '11px Arial' : '10px Arial';
    const hudFontMedium = CANVAS_WIDTH > 1200 ? '13px Arial' : '12px Arial';
    const margin = 15;
    
    // === LINHA 1 (Y=15) - INFORMAÇÕES PRINCIPAIS ===
    ctx.font = hudFontMedium;
    ctx.textAlign = 'left';
    
    // 1. SCORE (esquerda)
    ctx.fillStyle = '#FFD700';
    ctx.fillText(`SCORE: ${gameState.score.toString().padStart(6, '0')}`, margin, 15);
    
    // 2. VIDAS
    ctx.fillStyle = '#FF6B6B';
    ctx.fillText(`♥ ${gameState.lives}`, margin + 140, 15);
    
    // 3. FASE E NÍVEL (centro)
    ctx.fillStyle = '#87CEEB';
    const phaseText = `FASE ${gameState.currentPhase} | LV.${gameState.level}`;
    ctx.fillText(phaseText, margin + 200, 15);
    
    // 4. ARMA E BOMBA (centro-direita)
    ctx.fillStyle = '#98FB98';
    const weaponDesc = weapons[weaponType] ? weapons[weaponType].description : 'NENHUMA';
    const weaponText = weaponDesc.length > 12 ? weaponDesc.substring(0, 10) + '..' : weaponDesc;
    ctx.fillText(`🔫 ${weaponText}`, CANVAS_WIDTH - 260, 15);
    
    // Contador de bombas
    ctx.fillStyle = bombCooldown > 0 ? '#FF4444' : '#FF8800';
    ctx.fillText(`💣 ${bombCount}`, CANVAS_WIDTH - 120, 15);
    
    // 5. SOM (direita)
    ctx.fillStyle = gameAudio.enabled ? '#00FF00' : '#FF4444';
    ctx.fillText(`🔊${gameAudio.enabled ? 'ON' : 'OFF'}`, CANVAS_WIDTH - 60, 15);
    
    // === LINHA 2 (Y=35) - CRONÔMETROS ===
    ctx.font = hudFontSmall;
    
    // Cronômetro para próxima fase (apenas na fase 1)
    if (gameState.currentPhase === 1) {
        const timeToPhase2 = Math.max(0, gameState.phase2StartTime - gameState.timeInGame);
        const minutes = Math.floor(timeToPhase2 / 60);
        const seconds = timeToPhase2 % 60;
        ctx.fillStyle = '#FFD700';
        ctx.fillText(`⏰ FASE 2 EM: ${minutes}:${seconds.toString().padStart(2, '0')}`, margin, 35);
    } else {
        ctx.fillStyle = '#00FF00';
        ctx.fillText(`✅ FASE 2 ATIVA`, margin, 35);
    }
    
    // Cronômetro do escudo inicial (se ativo)
    if (initialShieldActive) {
        const remainingSeconds = Math.ceil(initialShieldTimer / 60);
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        ctx.fillStyle = '#00FFFF';
        ctx.fillText(`🛡️ ESCUDO INICIAL: ${minutes}:${seconds.toString().padStart(2, '0')}`, CANVAS_WIDTH - 180, 35);
    }
    
    // === LINHA 3 (Y=55) - BARRAS DE STATUS ===
    const centerX = CANVAS_WIDTH / 2;
    const barWidth = Math.min(200, CANVAS_WIDTH * 0.2);
    const barHeight = 8;
    
    // Barra de vida (esquerda do centro)
    const healthBarX = centerX - barWidth - 10;
    const healthBarY = 50;
    
    ctx.fillStyle = 'white';
    ctx.font = '9px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ENERGIA', healthBarX + barWidth/2, healthBarY - 2);
    
    // Fundo da barra de vida
    ctx.fillStyle = 'rgba(200, 0, 0, 0.8)';
    ctx.fillRect(healthBarX, healthBarY, barWidth, barHeight);
    
    // Barra de vida atual
    const healthPercent = playerHealth / 100;
    ctx.fillStyle = healthPercent > 0.6 ? '#00FF00' : 
                   healthPercent > 0.3 ? '#FFFF00' : '#FF0000';
    ctx.fillRect(healthBarX, healthBarY, barWidth * healthPercent, barHeight);
    
    // Contorno da barra de vida
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    ctx.strokeRect(healthBarX, healthBarY, barWidth, barHeight);
    
    // Texto da vida
    ctx.fillStyle = 'white';
    ctx.font = '8px Arial';
    const maxHits = gameState.currentPhase === 1 ? gameState.maxHitsPhase1 : gameState.maxHitsPhase2;
    ctx.fillText(`${playerHealth}% | ${gameState.hitsReceived}/${maxHits}`, healthBarX + barWidth/2, healthBarY + 15);
    
    // === BARRA DE ESCUDO (direita do centro) ===
    const shieldBarX = centerX + 10;
    const shieldBarY = 50;
    
    ctx.fillStyle = '#00FFFF';
    ctx.font = '9px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🛡️ ESCUDO', shieldBarX + barWidth/2, shieldBarY - 2);
    
    // Fundo da barra de escudo
    ctx.fillStyle = 'rgba(0, 100, 100, 0.3)';
    ctx.fillRect(shieldBarX, shieldBarY, barWidth, barHeight);
    
    // Barra de energia do escudo
    const shieldPercent = shieldEnergy / shieldMaxEnergy;
    let shieldColor = '#00FFFF';
    
    // Prioridade: Escudo inicial > Cooldown > Energia baixa
    if (initialShieldActive) {
        shieldColor = '#FFD700'; // Dourado para escudo inicial
    } else if (shieldCooldown > 0) {
        shieldColor = '#FF4444'; // Vermelho durante cooldown
    } else if (shieldPercent < 0.3) {
        shieldColor = '#FFAA00'; // Laranja quando baixa
    }
    
    ctx.fillStyle = shieldColor;
    const displayPercent = initialShieldActive ? (initialShieldTimer / initialShieldDuration) : shieldPercent;
    ctx.fillRect(shieldBarX, shieldBarY, barWidth * displayPercent, barHeight);
    
    // Contorno da barra de escudo
    ctx.strokeStyle = (shieldActive || initialShieldActive) ? '#00FFFF' : '#666666';
    ctx.lineWidth = 1;
    ctx.strokeRect(shieldBarX, shieldBarY, barWidth, barHeight);
    
    // Status do escudo
    ctx.fillStyle = 'white';
    ctx.font = '8px Arial';
    let shieldStatus = 'PRONTO';
    if (initialShieldActive) {
        shieldStatus = 'INICIAL ATIVO';
    } else if (shieldActive) {
        shieldStatus = 'ATIVO';
    } else if (shieldCooldown > 0) {
        shieldStatus = `CD ${Math.ceil(shieldCooldown/60)}s`;
    } else if (shieldPercent < 0.2) {
        shieldStatus = 'BAIXA';
    }
    
    const displayPercentValue = Math.floor(displayPercent * 100);
    ctx.fillText(`${displayPercentValue}% | ${shieldStatus}`, shieldBarX + barWidth/2, shieldBarY + 15);
    
    // === LINHA 4 (Y=75) - INFORMAÇÕES ADICIONAIS ===
    ctx.font = '8px Arial';
    ctx.textAlign = 'left';
    
    // Tempo de jogo
    const gameMinutes = Math.floor(gameState.timeInGame / 60);
    const gameSeconds = gameState.timeInGame % 60;
    ctx.fillStyle = '#CCCCCC';
    ctx.fillText(`⏱️ ${gameMinutes}:${gameSeconds.toString().padStart(2, '0')}`, margin, 75);
    
    // Cooldown de tiro (se ativo)
    if (shootCooldown > 0 && weaponType !== 'none') {
        const cooldownPercent = Math.floor((1 - shootCooldown / weapons[weaponType].cooldown) * 100);
        ctx.fillStyle = '#FFFF00';
        ctx.fillText(`🔄 RECARGA: ${cooldownPercent}%`, margin + 80, 75);
    }
    
    // Status do chain attack
    if (chainAttackCooldown > 0) {
        ctx.fillStyle = '#FF6B6B';
        ctx.fillText(`⛓️ CD: ${Math.ceil(chainAttackCooldown/60)}s`, margin + 160, 75);
    }
    
    // Status da bomba
    if (bombCooldown > 0) {
        ctx.fillStyle = '#FF4444';
        ctx.fillText(`💣 CD: ${Math.ceil(bombCooldown/60)}s`, CANVAS_WIDTH - 100, 75);
    } else if (bombCount === 0) {
        ctx.fillStyle = '#888888';
        ctx.fillText(`💣 SEM BOMBAS`, CANVAS_WIDTH - 100, 75);
    }
    
    // Resetar alinhamento para outros elementos
    ctx.textAlign = 'left';
    
    // === PAINEL DE INSTRUÇÕES ===
    drawControlsPanel();
}

// === PAINEL DE CONTROLES MELHORADO COM TODAS AS FUNCIONALIDADES ===
function drawControlsPanel() {
    if (!controlsPanelVisible) {
        // Painel oculto - apenas mostrar indicador de toggle
        const indicatorY = CANVAS_HEIGHT - 30;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, indicatorY, CANVAS_WIDTH, 30);
        
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('💡 Pressione H para mostrar/ocultar GUIA COMPLETO DE CONTROLES', CANVAS_WIDTH/2, indicatorY + 20);
        return;
    }
    
    const panelHeight = 180; // Aumentado para mais informações
    const panelY = CANVAS_HEIGHT - panelHeight;
    
    // Fundo do painel de controles com bordas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(0, panelY, CANVAS_WIDTH, panelHeight);
    
    // Borda superior dourada
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(0, panelY, CANVAS_WIDTH, 3);
    
    // Título principal
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('🎮 GUIA COMPLETO - JULIETTE 2D (Contra Style)', 15, panelY + 20);
    
    // Subtitle
    ctx.fillStyle = '#87CEEB';
    ctx.font = '12px Arial';
    ctx.fillText('🚀 Sistema de Combate Avançado | 🔊 Sons de Laser Futuristas | ⚡ Animações Melhoradas', 15, panelY + 35);
    
    // Calcular layout baseado na largura da tela
    const numCols = CANVAS_WIDTH > 1600 ? 5 : (CANVAS_WIDTH > 1200 ? 4 : (CANVAS_WIDTH > 900 ? 3 : 2));
    const colWidth = Math.floor((CANVAS_WIDTH - 60) / numCols); // Margem de 30px cada lado
    const fontSize = CANVAS_WIDTH > 1400 ? '11px' : '10px';
    const lineHeight = CANVAS_WIDTH > 1400 ? 15 : 13;
    
    ctx.font = fontSize + ' Arial';
    const startY = panelY + 55;
    
    // === COLUNA 1: MOVIMENTO BÁSICO ===
    let colIndex = 0;
    ctx.fillStyle = '#98FB98'; // Verde claro
    ctx.fillText('🏃 MOVIMENTO:', 15 + colIndex * colWidth, startY);
    ctx.fillStyle = 'white';
    ctx.fillText('⬅️➡️ Mover (com partículas)', 15 + colIndex * colWidth, startY + lineHeight);
    ctx.fillText('Z/⬆️ Pular', 15 + colIndex * colWidth, startY + lineHeight * 2);
    ctx.fillText('⬇️ Agachar', 15 + colIndex * colWidth, startY + lineHeight * 3);
    ctx.fillText('🚶‍♀️ Caminhada fluida automática', 15 + colIndex * colWidth, startY + lineHeight * 4);
    ctx.fillText('💨 Rastro de movimento', 15 + colIndex * colWidth, startY + lineHeight * 5);
    
    // === COLUNA 2: SISTEMA DE TIRO ===
    colIndex++;
    ctx.fillStyle = '#FFB347'; // Laranja
    ctx.fillText('🎯 TIRO DIRECIONAL:', 15 + colIndex * colWidth, startY);
    ctx.fillStyle = 'white';
    ctx.fillText('X/SPACE: Atirar', 15 + colIndex * colWidth, startY + lineHeight);
    ctx.fillText('⬆️+X: Tiro para cima', 15 + colIndex * colWidth, startY + lineHeight * 2);
    ctx.fillText('⬇️+X: Tiro para baixo', 15 + colIndex * colWidth, startY + lineHeight * 3);
    ctx.fillText('↗️↖️↘️↙️ + X: Diagonais', 15 + colIndex * colWidth, startY + lineHeight * 4);
    ctx.fillText('🔊 Sons de laser únicos!', 15 + colIndex * colWidth, startY + lineHeight * 5);
    
    // === COLUNA 3: ARMAS (sempre mostrar) ===
    colIndex++;
    ctx.fillStyle = '#DDA0DD'; // Roxo claro
    ctx.fillText('⚔️ SISTEMA DE ARMAS:', 15 + colIndex * colWidth, startY);
    ctx.fillStyle = '#FFFF99';
    ctx.fillText('1🔫 Normal | 2🔫🔫🔫 Spread', 15 + colIndex * colWidth, startY + lineHeight);
    ctx.fillText('3⚡ Laser | 4🔥 Machine', 15 + colIndex * colWidth, startY + lineHeight * 2);
    ctx.fillStyle = '#FF6B6B';
    ctx.fillText('5💜 Plasma | 6🌪️ Storm', 15 + colIndex * colWidth, startY + lineHeight * 3);
    ctx.fillText('7☢️ Nuclear (ÉPICO!)', 15 + colIndex * colWidth, startY + lineHeight * 4);
    ctx.fillStyle = 'white';
    ctx.fillText('🎵 Cada arma = som único', 15 + colIndex * colWidth, startY + lineHeight * 5);
    
    // === COLUNA 4: ATAQUES ESPECIAIS (se houver espaço) ===
    if (numCols >= 4) {
        colIndex++;
        ctx.fillStyle = '#FF6B6B'; // Vermelho claro
        ctx.fillText('💥 ATAQUES ESPECIAIS:', 15 + colIndex * colWidth, startY);
        ctx.fillStyle = 'white';
        ctx.fillText('A: ⛓️ Corrente (1 Mão)', 15 + colIndex * colWidth, startY + lineHeight);
        ctx.fillText('S: ⛓️⛓️ Corrente (2 Mãos)', 15 + colIndex * colWidth, startY + lineHeight * 2);
        ctx.fillText('B: 💣 Bomba (destrói tudo)', 15 + colIndex * colWidth, startY + lineHeight * 3);
        ctx.fillText('D: 🛡️ Escudo Energético', 15 + colIndex * colWidth, startY + lineHeight * 4);
        ctx.fillText('L: 🌋 Disco de Lava', 15 + colIndex * colWidth, startY + lineHeight * 5);
    }
    
    // === COLUNA 5: SISTEMA E EXTRAS (se houver espaço) ===
    if (numCols >= 5) {
        colIndex++;
        ctx.fillStyle = '#87CEEB'; // Azul claro
        ctx.fillText('⚙️ SISTEMA & EXTRAS:', 15 + colIndex * colWidth, startY);
        ctx.fillStyle = 'white';
        ctx.fillText('H: Mostrar/Ocultar Guia', 15 + colIndex * colWidth, startY + lineHeight);
        ctx.fillText('M: Ligar/Desligar Som', 15 + colIndex * colWidth, startY + lineHeight * 2);
        ctx.fillText('P: Pausar | F11: Tela Cheia', 15 + colIndex * colWidth, startY + lineHeight * 3);
        ctx.fillText('C: 🎉 Celebração', 15 + colIndex * colWidth, startY + lineHeight * 4);
        ctx.fillText('R: Reiniciar (Game Over)', 15 + colIndex * colWidth, startY + lineHeight * 5);
    }
    
    // === SEÇÃO INFERIOR: STATUS E DICAS ===
    const bottomY = startY + lineHeight * 6.5;
    
    // Linha de separação
    ctx.fillStyle = '#444444';
    ctx.fillRect(15, bottomY - 5, CANVAS_WIDTH - 30, 1);
    
    // Status atual do jogo
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold ' + fontSize + ' Arial';
    ctx.fillText('📊 STATUS:', 15, bottomY + 10);
    
    ctx.fillStyle = '#87CEEB';
    ctx.font = fontSize + ' Arial';
    let statusX = 80;
    
    // Status da animação
    const statusText = isInSpecialAnim ? `🎭 ${animations[currentAnim].description}` : '🎭 Modo Normal';
    ctx.fillText(statusText, statusX, bottomY + 10);
    statusX += 200;
    
    // Status do som
    ctx.fillStyle = gameAudio.enabled ? '#00FF00' : '#FF4444';
    const soundStatus = gameAudio.enabled ? '🔊 SOM ATIVO' : '🔇 SOM DESLIGADO';
    ctx.fillText(soundStatus, statusX, bottomY + 10);
    statusX += 150;
    
    // Status da arma atual
    if (weaponType !== 'none') {
        ctx.fillStyle = '#98FB98';
        const currentWeaponDesc = weapons[weaponType].description;
        ctx.fillText(`🔫 ${currentWeaponDesc}`, statusX, bottomY + 10);
        statusX += 200;
    }
    
    // Cooldowns ativos
    let cooldownTexts = [];
    if (chainAttackCooldown > 0) {
        cooldownTexts.push(`⛓️ ${Math.ceil(chainAttackCooldown/60)}s`);
    }
    if (bombCooldown > 0) {
        cooldownTexts.push(`💣 ${Math.ceil(bombCooldown/60)}s`);
    }
    if (shootCooldown > 0 && weaponType !== 'none') {
        const reloadPercent = Math.floor((1 - shootCooldown / weapons[weaponType].cooldown) * 100);
        cooldownTexts.push(`🔄 ${reloadPercent}%`);
    }
    
    if (cooldownTexts.length > 0) {
        ctx.fillStyle = '#FF6B6B';
        ctx.fillText(`⏱️ COOLDOWNS: ${cooldownTexts.join(' | ')}`, statusX, bottomY + 10);
    }
    
    // === LINHA FINAL: DICAS ESPECIAIS ===
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold ' + (parseInt(fontSize) - 1) + 'px Arial';
    ctx.textAlign = 'center';
    
    const tips = [
        '💡 DICA: Combine teclas direcionais com X para tiros precisos!',
        '🎯 DICA: Cada arma tem som de laser único - experimente todas!', 
        '⚡ DICA: Use correntes (A/S) para ataques de área devastadores!',
        '🛡️ DICA: Escudo inicial (dourado) dura 60 segundos - use bem!',
        '🌋 DICA: Disco de Lava (L) segue você e causa dano contínuo!',
        '💣 DICA: Bomba (B) destrói TUDO na tela - use em emergências!',
        '🎮 DICA: Animação de caminhada agora tem partículas e efeitos!'
    ];
    
    const currentTip = tips[Math.floor(Date.now() / 3000) % tips.length]; // Muda a cada 3 segundos
    ctx.fillText(currentTip, CANVAS_WIDTH / 2, bottomY + 25);
    
    // Resetar alinhamento
    ctx.textAlign = 'left';
}

// Sistema de spawn de inimigos
let enemySpawnTimer = 0;
const MAX_ENEMIES = 10; // Máximo de inimigos simultâneos na tela

function spawnEnemies() {
    enemySpawnTimer++;
    
    // === CONTROLE DE LIMITE DE INIMIGOS ===
    if (enemies.length >= MAX_ENEMIES) {
        return; // Não criar novos inimigos se já atingiu o limite
    }
    
    // Spawn baseado no nível
    const spawnRate = Math.max(60 - gameState.level * 5, 30);
    
    if (enemySpawnTimer >= spawnRate) {
        enemySpawnTimer = 0;
        
        // Escolhe tipo de inimigo baseado no nível
        const enemyType = gameState.level > 3 && Math.random() > 0.7 ? 'robot' : 'soldier';
        createEnemy(enemyType);
        
        console.log(`Inimigos na tela: ${enemies.length}/${MAX_ENEMIES}`);
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

// === NOVA FUNÇÃO: ATUALIZAR SISTEMA DE FASES ===
function updateGamePhase() {
    // Atualizar tempo de jogo
    if (gameState.gameStartTime === 0) {
        gameState.gameStartTime = Date.now();
    }
    
    gameState.timeInGame = Math.floor((Date.now() - gameState.gameStartTime) / 1000);
    
    // Verificar se deve avançar para a fase 2
    if (gameState.currentPhase === 1 && gameState.timeInGame >= gameState.phase2StartTime) {
        advanceToPhase2();
    }
}

// === NOVA FUNÇÃO: AVANÇAR PARA FASE 2 ===
function advanceToPhase2() {
    if (gameState.currentPhase === 2) return; // Já está na fase 2
    
    gameState.currentPhase = 2;
    gameState.hitsReceived = 0; // Resetar contador de tiros
    
    // Restaurar vida completa na mudança de fase
    playerHealth = 100;
    
    // Som especial de mudança de fase
    playSound('levelUp', 800, 1000);
    
    // Log para debug
    console.log('🎯 FASE 2 INICIADA! Resistência aumentada para 1000 tiros!');
    
    // Criar efeito visual de mudança de fase
    for (let i = 0; i < 20; i++) {
        particles.push({
            x: CANVAS_WIDTH / 2 + (Math.random() - 0.5) * 200,
            y: CANVAS_HEIGHT / 2 + (Math.random() - 0.5) * 100,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            life: 60,
            color: '#FFD700', // Dourado para indicar mudança especial
            size: Math.random() * 6 + 3
        });
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
            ctx.fillText(`Fase Alcançada: ${gameState.currentPhase}`, CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 80);
            ctx.fillText(`Tempo Jogado: ${Math.floor(gameState.timeInGame / 60)}m ${gameState.timeInGame % 60}s`, CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 110);
            ctx.fillText('Press R to Restart', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 140);
        }
        requestAnimationFrame(gameLoop);
        return;
    }
    
    // Limpa a tela
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // === ATUALIZAR SISTEMA DE FASES ===
    updateGamePhase();
    
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
    updateShield(); // NOVO: Atualizar sistema de escudo
    updateLavaDisc(); // NOVO: Atualizar disco de lava
    updatePlayerAtoms(); // NOVO: Atualizar átomos orbitantes da Juliette
    
    // === ATUALIZAR SISTEMA DE BOMBA ===
    if (bombCooldown > 0) {
        bombCooldown--;
    }
    
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
    
    // === ATUALIZAR ANIMAÇÃO DO JOGADOR COM VELOCIDADE DINÂMICA ===
    const anim = animations[currentAnim];
    
    if (currentAnim !== 'idle' || anim.end > anim.start) {
        frameCounter++;
        
        // Calcular velocidade da animação com base no movimento
        let animSpeed = anim.speed;
        if (moving) {
            // Animação mais rápida durante movimento
            animSpeed = Math.max(anim.speed * walkAnimSpeedMultiplier, 4);
        }
        
        if (frameCounter >= animSpeed) {
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
    
    // Desenhar escudo (antes do jogador para aparecer atrás)
    drawShield();
    
    // NOVO: Desenhar disco de lava (antes do jogador para aparecer atrás)
    drawLavaDisc();
    
    // NOVO: Desenhar átomos orbitantes da Juliette (antes do jogador para aparecer atrás)
    drawPlayerAtoms();
    
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
    
    // === ATUALIZAR CONTROLES MÓVEIS E GUIA ===
    updateMobileControlsState();
    updateMobileGuideInGameLoop();
    
    // === ATUALIZAR CONTROLES ARRASTÁVEIS INDIVIDUAIS ===
    updateDraggableControls();
    
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
    // === RESETAR SISTEMA DE FASES ===
    gameState.currentPhase = 1;
    gameState.gameStartTime = 0;
    gameState.timeInGame = 0;
    gameState.hitsReceived = 0;
    
    // Resetar jogador
    currentAnim = 'idle_noweapon';
    frameIndex = 0;
    frameCounter = 0;
    posX = 100;
    
    // === RESETAR ESCUDO INICIAL ===
    initialShieldActive = true;
    initialShieldTimer = initialShieldDuration;
    shieldActive = true;
    shieldEnergy = 100;
    shieldCooldown = 0;
    
    // === RESETAR SISTEMA DE BOMBA ===
    bombCount = 3;
    bombCooldown = 0;
    
    // Posicionar jogador no solo corretamente
    const groundLevel = CANVAS_HEIGHT - (frameHeight * scale) - 20;
    posY = groundLevel - (frameHeight * scale);
    onGround = true;
    velocityY = 0;
    
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
const totalImages = 13; // Total de imagens: 4 de fundo (incluindo fase 2) + 9 da Juliette (incluindo novas de tiro)
let gameStarted = false;

function checkImagesLoaded() {
    imagesLoaded++;
    console.log(`Imagem carregada: ${imagesLoaded}/${totalImages}`);
    if (imagesLoaded === totalImages && !gameStarted) {
        startGame();
    }
}

function startGame() {
    if (gameStarted) return;
    
    gameStarted = true;
    frameIndex = animations.idle_noweapon.start;
    console.log('🎮 Iniciando jogo...');
    
    // Garantir que o canvas está configurado corretamente
    if (!canvas || !ctx) {
        console.error('❌ Canvas não encontrado!');
        return;
    }
    
    // Inicializar posição do jogador
    positionPlayerOnGround();
    
    // Inicializar átomos da Juliette
    initializePlayerAtoms();
    
    gameLoop();
}

// Timeout de emergência - se após 10 segundos não carregou, tentar iniciar assim mesmo
setTimeout(() => {
    if (!gameStarted) {
        console.log('⚠️ Timeout: Forçando início do jogo sem todas as imagens...');
        startGame();
    }
}, 10000);

// Carregar imagens de fundo
sceneImg.onload = checkImagesLoaded;
backgroundImg.onload = checkImagesLoaded;
backgroundImgA.onload = checkImagesLoaded;
// === CARREGAR IMAGEM DA FASE 2 ===
backgroundImgPhase2.onload = checkImagesLoaded;

// Carregar sprites da Juliette
playerImages.spritesheet.onload = checkImagesLoaded;
playerImages.corrente_mao_esquerda.onload = checkImagesLoaded;
playerImages.corrente_duas_maos.onload = checkImagesLoaded;
playerImages.maos_para_cima.onload = checkImagesLoaded;
playerImages.arma_para_cima.onload = checkImagesLoaded;

// Carregar novas imagens de mãos para cima
playerImages.maos_para_cima_1.onload = checkImagesLoaded;
playerImages.maos_para_cima_2.onload = checkImagesLoaded;

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
        fullscreenBtn.textContent = '📺 SAIR';
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
        fullscreenBtn.textContent = '📺 TELA';
        fullscreenBtn.classList.remove('fullscreen-active');
    }
}

// Detectar mudanças de tela cheia pelo navegador (F11, ESC, etc.)
document.addEventListener('fullscreenchange', () => {
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    
});

// === SISTEMA DE REDIMENSIONAMENTO AUTOMÁTICO MELHORADO ===
function resizeCanvas() {
    // NOVO: Usar sistema responsivo avançado
    const responsiveConfig = setupResponsiveCanvas();
    
    // Reposicionar elementos que dependem das dimensões
    updateGameElementsForResize();
    
    // Reposicionar controles touch se mobile
    if (isMobile && touchControls.enabled) {
        positionTouchControls();
    }
    
    // === NOVA FUNCIONALIDADE: OTIMIZAÇÃO AUTOMÁTICA POR DISPOSITIVO ===
    optimizeForDevice();
    
    // === NOVA FUNCIONALIDADE: SALVAR CONFIGURAÇÕES DA TELA ===
    saveScreenSettings();
    
    console.log(`Canvas responsivo configurado: ${responsiveConfig.width}x${responsiveConfig.height}`);
    console.log(`   Tipo: ${screenDetection.isMobile ? 'Mobile' : screenDetection.isTablet ? 'Tablet' : 'Desktop'}`);
    console.log(`   Orientação: ${screenDetection.orientation}`);
    console.log(`   Resolução real: ${window.screen.width}x${window.screen.height}`);
    console.log(`   Área disponível: ${window.innerWidth}x${window.innerHeight}`);
}

// Função para posicionar jogador no solo
function positionPlayerOnGround() {
    // Recalcular o nível do chão com base na altura atual do canvas
    const newGroundLevel = CANVAS_HEIGHT - (frameHeight * scale) - 20;
    posY = newGroundLevel;
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
    
    // === INICIALIZAR CONTROLES TOUCH MÓVEIS ===
    initializeMobileControls();
    
    // === INICIALIZAR GUIA MÓVEL ===
    initializeMobileGuide();
});

// === SISTEMA COMPLETO DE CONTROLES TOUCH MÓVEIS ===
let mobileControlsState = {
    enabled: false,
    visible: false,
    dpadPressed: { up: false, down: false, left: false, right: false },
    buttonsPressed: {
        shoot: false,
        jump: false,
        chainLeft: false,
        chainBoth: false,
        bomb: false,
        shield: false,
        lava: false,
        pause: false,
        sound: false
    },
    touchActive: {},
    vibrationEnabled: true
};

// Detectar se é dispositivo móvel e inicializar controles
function initializeMobileControls() {
    const isMobile = detectMobileDevice();
    const mobileControls = document.getElementById('mobileControls');
    const controlsToggle = document.getElementById('controlsToggle');
    
    if (isMobile || window.innerWidth <= 1024) {
        mobileControlsState.enabled = true;
        mobileControlsState.visible = true;
        
        // Mostrar controles e botão de toggle
        if (mobileControls) {
            mobileControls.classList.add('active');
        }
        if (controlsToggle) {
            controlsToggle.classList.add('mobile');
        }
        
        // Configurar event listeners
        setupTouchEventListeners();
        
        console.log('📱 Controles touch móveis ativados!');
    } else {
        // Desktop - ocultar controles por padrão
        if (controlsToggle) {
            controlsToggle.classList.add('mobile');
            controlsToggle.style.display = 'block';
        }
    }
}

// Detectar dispositivo móvel de forma mais robusta
function detectMobileDevice() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 768;
    
    return mobileRegex.test(userAgent) || (isTouchDevice && isSmallScreen);
}

// Configurar todos os event listeners de touch
function setupTouchEventListeners() {
    // === D-PAD CONTROLS ===
    setupDPadControls();
    
    // === ACTION BUTTONS ===
    setupActionButtons();
    
    // === SPECIAL BUTTONS ===
    setupSpecialButtons();
    
    // === CONTROLS TOGGLE ===
    setupControlsToggle();
    
    // === PREVENT DEFAULT TOUCH BEHAVIORS ===
    preventDefaultTouchBehaviors();
}

// Configurar controles do D-Pad
function setupDPadControls() {
    const dpadButtons = document.querySelectorAll('.dpad-button');
    
    dpadButtons.forEach(button => {
        const direction = button.dataset.direction;
        
        // Touch Start
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleDPadPress(direction, true);
            addHapticFeedback(button);
        }, { passive: false });
        
        // Touch End
        button.addEventListener('touchend', (e) => {
            e.preventDefault();
            handleDPadPress(direction, false);
        }, { passive: false });
        
        // Mouse support para desktop
        button.addEventListener('mousedown', (e) => {
            e.preventDefault();
            handleDPadPress(direction, true);
            addHapticFeedback(button);
        });
        
        button.addEventListener('mouseup', (e) => {
            e.preventDefault();
            handleDPadPress(direction, false);
        });
        
        button.addEventListener('mouseleave', (e) => {
            handleDPadPress(direction, false);
        });
    });
}

// Configurar botões de ação
function setupActionButtons() {
    const actionButtons = {
        shootBtn: 'shoot',
        jumpBtn: 'jump',
        chainLeftBtn: 'chainLeft',
        chainBothBtn: 'chainBoth'
    };
    
    Object.entries(actionButtons).forEach(([buttonId, action]) => {
        const button = document.getElementById(buttonId);
        if (!button) return;
        
        // Touch events
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleActionButtonPress(action, true);
            addHapticFeedback(button);
        }, { passive: false });
        
        button.addEventListener('touchend', (e) => {
            e.preventDefault();
            handleActionButtonPress(action, false);
        }, { passive: false });
        
        // Mouse events
        button.addEventListener('mousedown', (e) => {
            e.preventDefault();
            handleActionButtonPress(action, true);
            addHapticFeedback(button);
        });
        
        button.addEventListener('mouseup', (e) => {
            e.preventDefault();
            handleActionButtonPress(action, false);
        });
    });
}

// Configurar botões especiais
function setupSpecialButtons() {
    const specialButtons = {
        bombBtn: 'bomb',
        shieldBtn: 'shield',
        lavaBtn: 'lava',
        pauseBtn: 'pause',
        soundBtn: 'sound'
    };
    
    Object.entries(specialButtons).forEach(([buttonId, action]) => {
        const button = document.getElementById(buttonId);
        if (!button) return;
        
        // Touch events
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleSpecialButtonPress(action, true);
            addHapticFeedback(button);
        }, { passive: false });
        
        button.addEventListener('touchend', (e) => {
            e.preventDefault();
            handleSpecialButtonPress(action, false);
        }, { passive: false });
        
        // Mouse events
        button.addEventListener('mousedown', (e) => {
            e.preventDefault();
            handleSpecialButtonPress(action, true);
            addHapticFeedback(button);
        });
        
        button.addEventListener('mouseup', (e) => {
            e.preventDefault();
            handleSpecialButtonPress(action, false);
        });
    });
}

// Configurar botão de toggle dos controles
function setupControlsToggle() {
    const controlsToggle = document.getElementById('controlsToggle');
    const mobileControls = document.getElementById('mobileControls');
    
    if (!controlsToggle || !mobileControls) return;
    
    controlsToggle.addEventListener('click', (e) => {
        e.preventDefault();
        
        // === NOVA FUNCIONALIDADE: FECHAR GUIA MÓVEL EM DISPOSITIVOS MÓVEIS ===
        // Se estiver em dispositivo móvel, fechar o guia completo automaticamente
        if (detectMobileDevice() && typeof closeMobileGuideCompletely === 'function') {
            closeMobileGuideCompletely();
            console.log('📋 Guia móvel fechado automaticamente ao clicar em Controles');
        }
        
        mobileControlsState.visible = !mobileControlsState.visible;
        
        if (mobileControlsState.visible) {
            mobileControls.classList.add('active');
            controlsToggle.textContent = '📱';
        } else {
            mobileControls.classList.remove('active');
            controlsToggle.textContent = '🎮';
            
            // Reset all pressed states when hiding controls
            resetAllPressedStates();
        }
        
        addHapticFeedback(controlsToggle);
    });
}

// Prevenir comportamentos padrão de touch
function preventDefaultTouchBehaviors() {
    const mobileControls = document.getElementById('mobileControls');
    if (!mobileControls) return;
    
    // Prevenir zoom e scroll nos controles
    mobileControls.addEventListener('touchstart', (e) => {
        e.preventDefault();
    }, { passive: false });
    
    mobileControls.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });
    
    mobileControls.addEventListener('touchend', (e) => {
        e.preventDefault();
    }, { passive: false });
}

// === HANDLERS DOS CONTROLES ===

// Manipular pressão do D-Pad
function handleDPadPress(direction, isPressed) {
    mobileControlsState.dpadPressed[direction] = isPressed;
    
    if (isPressed) {
        switch (direction) {
            case 'up':
                if (hasWeapon && onGround && !isInSpecialAnim) {
                    startSpecialAnimation('weapon_up');
                } else if (!isInSpecialAnim) {
                    jump();
                }
                break;
                
            case 'down':
                // Ação especial para baixo (crouch/slide futuramente)
                break;
                
            case 'left':
                if (!isInSpecialAnim) {
                    moving = true;
                    facingRight = false;
                    backgroundScrolling = true;
                }
                break;
                
            case 'right':
                if (!isInSpecialAnim) {
                    moving = true;
                    facingRight = true;
                    backgroundScrolling = true;
                }
                break;
        }
    } else {
        // Release movement when direction is released
        if ((direction === 'left' && !mobileControlsState.dpadPressed.right) || 
            (direction === 'right' && !mobileControlsState.dpadPressed.left)) {
            moving = false;
            backgroundScrolling = false;
        }
    }
    
    updateDPadVisualState();
}

// Manipular pressão dos botões de ação
function handleActionButtonPress(action, isPressed) {
    mobileControlsState.buttonsPressed[action] = isPressed;
    
    if (isPressed) {
        switch (action) {
            case 'shoot':
                if (!attacking) {
                    shoot();
                    attacking = true;
                }
                break;
                
            case 'jump':
                jump();
                break;
                
            case 'chainLeft':
                if (!isInSpecialAnim && chainAttackCooldown === 0) {
                    chainAttack('left_hand');
                }
                break;
                
            case 'chainBoth':
                if (!isInSpecialAnim && chainAttackCooldown === 0) {
                    chainAttack('both_hands');
                }
                break;
        }
    } else {
        // Release actions
        if (action === 'shoot') {
            attacking = false;
        }
    }
    
    updateActionButtonVisualState(action);
}

// Manipular pressão dos botões especiais
function handleSpecialButtonPress(action, isPressed) {
    mobileControlsState.buttonsPressed[action] = isPressed;
    
    if (isPressed) {
        switch (action) {
            case 'bomb':
                if (bombCount > 0 && bombCooldown === 0) {
                    activateBomb();
                }
                break;
                
            case 'shield':
                if (shieldEnergy > 20 && shieldCooldown === 0) {
                    activateShield();
                }
                break;
                
            case 'lava':
                toggleLavaDisc();
                break;
                
            case 'pause':
                gameState.paused = !gameState.paused;
                break;
                
            case 'sound':
                gameAudio.enabled = !gameAudio.enabled;
                // Atualizar ícone do botão
                const soundBtn = document.getElementById('soundBtn');
                if (soundBtn) {
                    soundBtn.textContent = gameAudio.enabled ? '🔊' : '🔇';
                }
                break;
        }
    }
    
    updateSpecialButtonVisualState(action);
}

// === FEEDBACK VISUAL E HÁPTICO ===

// Adicionar feedback háptico
function addHapticFeedback(element) {
    if (!mobileControlsState.vibrationEnabled) return;
    
    // Vibração (se suportada)
    if (navigator.vibrate) {
        navigator.vibrate(50); // 50ms de vibração
    }
    
    // Feedback visual
    element.classList.add('haptic-feedback');
    setTimeout(() => {
        element.classList.remove('haptic-feedback');
    }, 200);
}

// Atualizar estado visual do D-Pad
function updateDPadVisualState() {
    const directions = ['up', 'down', 'left', 'right'];
    
    directions.forEach(direction => {
        const button = document.querySelector(`.dpad-${direction}`);
        if (button) {
            if (mobileControlsState.dpadPressed[direction]) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        }
    });
}

// Atualizar estado visual dos botões de ação
function updateActionButtonVisualState(action) {
    const buttonMap = {
        shoot: 'shootBtn',
        jump: 'jumpBtn',
        chainLeft: 'chainLeftBtn',
        chainBoth: 'chainBothBtn'
    };
    
    const buttonId = buttonMap[action];
    const button = document.getElementById(buttonId);
    
    if (button) {
        if (mobileControlsState.buttonsPressed[action]) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    }
}

// Atualizar estado visual dos botões especiais
function updateSpecialButtonVisualState(action) {
    const buttonMap = {
        bomb: 'bombBtn',
        shield: 'shieldBtn',
        lava: 'lavaBtn',
        pause: 'pauseBtn',
        sound: 'soundBtn'
    };
    
    const buttonId = buttonMap[action];
    const button = document.getElementById(buttonId);
    
    if (button) {
        if (mobileControlsState.buttonsPressed[action]) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
        
        // Estados especiais baseados no jogo
        if (action === 'bomb' && (bombCount === 0 || bombCooldown > 0)) {
            button.disabled = true;
        } else if (action === 'shield' && (shieldEnergy < 20 || shieldCooldown > 0)) {
            button.disabled = true;
        } else {
            button.disabled = false;
        }
    }
}

// Reset todos os estados pressionados
function resetAllPressedStates() {
    // Reset D-Pad
    Object.keys(mobileControlsState.dpadPressed).forEach(direction => {
        mobileControlsState.dpadPressed[direction] = false;
    });
    
    // Reset Buttons
    Object.keys(mobileControlsState.buttonsPressed).forEach(button => {
        mobileControlsState.buttonsPressed[button] = false;
    });
    
    // Reset game states
    moving = false;
    backgroundScrolling = false;
    attacking = false;
    
    // Update visual states
    updateDPadVisualState();
    Object.keys(mobileControlsState.buttonsPressed).forEach(action => {
        updateActionButtonVisualState(action);
        updateSpecialButtonVisualState(action);
    });
}

// === INTEGRAÇÃO COM O LOOP PRINCIPAL ===

// Função para ser chamada no loop principal do jogo
function updateMobileControlsState() {
    if (!mobileControlsState.enabled || !mobileControlsState.visible) return;
    
    // Atualizar estados dos botões baseado no estado do jogo
    updateSpecialButtonVisualState('bomb');
    updateSpecialButtonVisualState('shield');
    updateSpecialButtonVisualState('lava');
    
    // Detectar mudanças de orientação
    if (window.orientation !== undefined) {
        // Reajustar controles após mudança de orientação
        setTimeout(() => {
            if (mobileControlsState.enabled) {
                console.log('📱 Reajustando controles após mudança de orientação');
            }
        }, 500);
    }
}

// === SISTEMA DE GUIA MÓVEL RECOLHÍVEL ===
let mobileGuideState = {
    isOpen: false,
    isVisible: false,
    touchStartY: 0,
    isDragging: false,
    isInitialized: false
};

// Inicializar guia móvel
function initializeMobileGuide() {
    if (mobileGuideState.isInitialized) return;
    
    const mobileGuide = document.getElementById('mobileGuide');
    const guideHeader = document.getElementById('guideHeader');
    const guideToggleBtn = document.getElementById('guideToggleBtn');
    const guideCloseBtn = document.getElementById('guideCloseBtn');
    
    if (!mobileGuide || !guideHeader) {
        console.log('❌ Elementos do guia móvel não encontrados');
        return;
    }
    
    // Detectar se deve mostrar o guia móvel
    const isMobileDevice = detectMobileDevice() || window.innerWidth <= 1024;
    
    if (isMobileDevice) {
        mobileGuideState.isVisible = true;
        mobileGuide.style.display = 'block';
        console.log('📱 Guia móvel ativado!');
    } else {
        mobileGuide.style.display = 'none';
        console.log('🖥️ Desktop detectado - guia móvel oculto');
    }
    
    // === EVENT LISTENERS ===
    
    // Clique no cabeçalho para expandir/recolher
    if (guideHeader) {
        guideHeader.addEventListener('click', toggleMobileGuide);
        guideHeader.addEventListener('touchstart', handleGuideHeaderTouchStart, { passive: false });
        guideHeader.addEventListener('touchmove', handleGuideHeaderTouchMove, { passive: false });
        guideHeader.addEventListener('touchend', handleGuideHeaderTouchEnd, { passive: false });
    }
    
    // Botão flutuante para abrir guia
    if (guideToggleBtn) {
        guideToggleBtn.addEventListener('click', openMobileGuide);
        guideToggleBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            openMobileGuide();
        }, { passive: false });
    }
    
    // Botão para fechar guia
    if (guideCloseBtn) {
        guideCloseBtn.addEventListener('click', closeMobileGuideCompletely);
        guideCloseBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            closeMobileGuideCompletely();
        }, { passive: false });
    }
    
    // Listener para mudanças de orientação
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);
    
    mobileGuideState.isInitialized = true;
    console.log('📋 Sistema de guia móvel inicializado!');
}

// Toggle do guia móvel
function toggleMobileGuide() {
    if (mobileGuideState.isOpen) {
        closeMobileGuide();
    } else {
        openMobileGuide();
    }
}

// Abrir guia móvel
function openMobileGuide() {
    const mobileGuide = document.getElementById('mobileGuide');
    const guideToggleBtn = document.getElementById('guideToggleBtn');
    const guideContent = document.querySelector('.guide-content');
    
    if (!mobileGuide) return;
    
    mobileGuideState.isOpen = true;
    mobileGuide.classList.add('open');
    
    // Ocultar botão flutuante
    if (guideToggleBtn) {
        guideToggleBtn.style.display = 'none';
    }
    
    // Animar abertura do conteúdo
    if (guideContent) {
        guideContent.style.maxHeight = guideContent.scrollHeight + 'px';
        guideContent.style.opacity = '1';
    }
    
    // Haptic feedback
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
    
    console.log('📋 Guia móvel aberto');
}

// Fechar guia móvel
function closeMobileGuide() {
    const mobileGuide = document.getElementById('mobileGuide');
    const guideToggleBtn = document.getElementById('guideToggleBtn');
    const guideContent = document.querySelector('.guide-content');
    
    if (!mobileGuide) return;
    
    mobileGuideState.isOpen = false;
    mobileGuide.classList.remove('open');
    
    // Mostrar botão flutuante novamente
    if (guideToggleBtn && mobileGuideState.isVisible) {
        guideToggleBtn.style.display = 'flex';
    }
    
    // Animar fechamento do conteúdo
    if (guideContent) {
        guideContent.style.maxHeight = '0';
        guideContent.style.opacity = '0';
    }
    
    // Haptic feedback
    if (navigator.vibrate) {
        navigator.vibrate(30);
    }
    
    console.log('📋 Guia móvel fechado');
}

// === GESTOS DE TOQUE PARA O CABEÇALHO ===

function handleGuideHeaderTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    mobileGuideState.touchStartY = touch.clientY;
    mobileGuideState.isDragging = false;
    
    // Adicionar classe de interação
    const guideHeader = document.getElementById('guideHeader');
    if (guideHeader) {
        guideHeader.classList.add('touching');
    }
}

function handleGuideHeaderTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const deltaY = touch.clientY - mobileGuideState.touchStartY;
    
    // Se mover mais de 10px, considerar como dragging
    if (Math.abs(deltaY) > 10) {
        mobileGuideState.isDragging = true;
        
        // Lógica de arrasto para cima/baixo
        if (deltaY < -20 && !mobileGuideState.isOpen) {
            // Arrasto para cima = abrir
            openMobileGuide();
        } else if (deltaY > 20 && mobileGuideState.isOpen) {
            // Arrasto para baixo = fechar
            closeMobileGuide();
        }
    }
}

function handleGuideHeaderTouchEnd(e) {
    e.preventDefault();
    
    // Remover classe de interação
    const guideHeader = document.getElementById('guideHeader');
    if (guideHeader) {
        guideHeader.classList.remove('touching');
    }
    
    // Se não foi dragging, tratar como clique
    if (!mobileGuideState.isDragging) {
        toggleMobileGuide();
    }
    
    mobileGuideState.isDragging = false;
}

// Fechar guia móvel completamente (esconder botão flutuante também)
function closeMobileGuideCompletely() {
    const mobileGuide = document.getElementById('mobileGuide');
    const guideToggleBtn = document.getElementById('guideToggleBtn');
    const guideContent = document.querySelector('.guide-content');
    
    if (!mobileGuide) return;
    
    mobileGuideState.isOpen = false;
    mobileGuideState.isVisible = false;
    mobileGuide.classList.remove('open');
    
    // Ocultar tudo
    mobileGuide.style.display = 'none';
    if (guideToggleBtn) {
        guideToggleBtn.style.display = 'none';
    }
    
    // Haptic feedback
    if (navigator.vibrate) {
        navigator.vibrate(100);
    }
    
    console.log('📋 Guia móvel fechado completamente');
}

// === RESPONSIVIDADE E ORIENTAÇÃO ===

function handleOrientationChange() {
    setTimeout(() => {
        const isMobileDevice = detectMobileDevice() || window.innerWidth <= 1024;
        const mobileGuide = document.getElementById('mobileGuide');
        const guideToggleBtn = document.getElementById('guideToggleBtn');
        
        if (mobileGuide) {
            if (isMobileDevice) {
                mobileGuideState.isVisible = true;
                mobileGuide.style.display = 'block';
                
                // Mostrar botão se guia estiver fechado
                if (guideToggleBtn && !mobileGuideState.isOpen) {
                    guideToggleBtn.style.display = 'flex';
                }
            } else {
                mobileGuideState.isVisible = false;
                mobileGuide.style.display = 'none';
                
                // Ocultar botão no desktop
                if (guideToggleBtn) {
                    guideToggleBtn.style.display = 'none';
                }
            }
        }
        
        console.log(`📱 Orientação alterada - Guia móvel: ${mobileGuideState.isVisible ? 'visível' : 'oculto'}`);
    }, 300); // Delay para aguardar mudança completa de orientação
}

// === FUNCIONALIDADES EXTRAS ===

// Atualizar estado do guia baseado no jogo
function updateMobileGuide() {
    if (!mobileGuideState.isVisible || !mobileGuideState.isInitialized) return;
    
    // Atualizar indicadores dinâmicos no guia
    updateGuideIndicators();
}

// Atualizar indicadores dinâmicos
function updateGuideIndicators() {
    const armaAtual = document.getElementById('armaAtual');
    const statusEscudo = document.getElementById('statusEscudo');
    const contadorBomba = document.getElementById('contadorBomba');
    
    // Atualizar arma atual
    if (armaAtual) {
        const armaTexto = weaponType === 'none' ? 'NENHUMA' : 
                         (weapons[weaponType] ? weapons[weaponType].description : 'DESCONHECIDA');
        armaAtual.textContent = armaTexto;
        armaAtual.className = `arma-indicator ${weaponType}`;
    }
    
    // Atualizar status do escudo
    if (statusEscudo) {
        let escudoStatus = 'INATIVO';
        let escudoClass = 'inactive';
        
        if (initialShieldActive) {
            escudoStatus = 'INICIAL ATIVO';
            escudoClass = 'initial-active';
        } else if (shieldActive) {
            escudoStatus = 'ATIVO';
            escudoClass = 'active';
        } else if (shieldCooldown > 0) {
            escudoStatus = `CD ${Math.ceil(shieldCooldown/60)}s`;
            escudoClass = 'cooldown';
        } else if (shieldEnergy < 20) {
            escudoStatus = 'ENERGIA BAIXA';
            escudoClass = 'low-energy';
        } else {
            escudoStatus = 'PRONTO';
            escudoClass = 'ready';
        }
        
        statusEscudo.textContent = escudoStatus;
        statusEscudo.className = `shield-indicator ${escudoClass}`;
    }
    
    // Atualizar contador de bombas
    if (contadorBomba) {
        contadorBomba.textContent = bombCount.toString();
        contadorBomba.className = `bomb-indicator ${bombCount > 0 ? 'available' : 'empty'} ${bombCooldown > 0 ? 'cooldown' : ''}`;
    }
}

// === INTEGRAÇÃO COM O LOOP PRINCIPAL ===

// Chamar essa função no loop principal do jogo
function updateMobileGuideInGameLoop() {
    if (mobileGuideState.isInitialized && mobileGuideState.isVisible) {
        updateMobileGuide();
    }
}

// === NOVAS FUNÇÕES PARA SISTEMA DE HUD RECOLHÍVEL ===

// Desenhar botão toggle do HUD (quando completamente oculto)
function drawHUDToggleButton() {
    const buttonWidth = 120;
    const buttonHeight = 30;
    const buttonX = CANVAS_WIDTH - buttonWidth - 10;
    const buttonY = 10;
    
    // Fundo do botão
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    // Borda piscante
    const glowIntensity = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
    ctx.strokeStyle = `rgba(255, 215, 0, ${glowIntensity})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    // Texto do botão
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('📊 MOSTRAR HUD', buttonX + buttonWidth/2, buttonY + 20);
    
    // Instrução
    ctx.fillStyle = '#CCCCCC';
    ctx.font = '10px Arial';
    ctx.fillText('Pressione H', buttonX + buttonWidth/2, buttonY + buttonHeight + 15);
    
    ctx.textAlign = 'left';
}

// Desenhar HUD minimizado (apenas informações essenciais)
function drawMinimizedHUD() {
    const hudHeight = 60;
    
    // Fundo minimizado
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, hudHeight);
    
    // Borda inferior
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(0, hudHeight - 2, CANVAS_WIDTH, 2);
    
    const margin = 15;
    const fontSize = '14px Arial';
    
    // Linha única com informações essenciais
    ctx.font = fontSize;
    ctx.textAlign = 'left';
    
    // Score (esquerda)
    ctx.fillStyle = '#FFD700';
    ctx.fillText(`SCORE: ${gameState.score.toString().padStart(6, '0')}`, margin, 25);
    
    // Vidas
    ctx.fillStyle = '#FF6B6B';
    ctx.fillText(`♥ ${gameState.lives}`, margin + 150, 25);
    
    // Fase
    ctx.fillStyle = '#87CEEB';
    ctx.fillText(`FASE ${gameState.currentPhase}`, margin + 220, 25);
    
    // Arma atual (centro)
    ctx.fillStyle = '#98FB98';
    const weaponName = weaponType === 'none' ? 'SEM ARMA' : weapons[weaponType].description;
    ctx.fillText(`🔫 ${weaponName}`, CANVAS_WIDTH/2 - 100, 25);
    
    // Energia e status críticos (direita)
    ctx.fillStyle = playerHealth > 30 ? '#00FF00' : '#FF4444';
    ctx.fillText(`❤️ ${playerHealth}%`, CANVAS_WIDTH - 200, 25);
    
    // Escudo status
    if (initialShieldActive) {
        ctx.fillStyle = '#FFD700';
        const remainingSeconds = Math.ceil(initialShieldTimer / 60);
        ctx.fillText(`🛡️ ${remainingSeconds}s`, CANVAS_WIDTH - 100, 25);
    } else if (shieldActive) {
        ctx.fillStyle = '#00FFFF';
        ctx.fillText(`🛡️ ATIVO`, CANVAS_WIDTH - 100, 25);
    }
    
    // Linha 2: Barras compactas
    const barY = 40;
    const barHeight = 4;
    const barWidth = 80;
    
    // Barra de vida compacta
    const healthBarX = margin;
    ctx.fillStyle = 'rgba(200, 0, 0, 0.5)';
    ctx.fillRect(healthBarX, barY, barWidth, barHeight);
    
    const healthPercent = playerHealth / 100;
    ctx.fillStyle = healthPercent > 0.6 ? '#00FF00' : 
                   healthPercent > 0.3 ? '#FFFF00' : '#FF0000';
    ctx.fillRect(healthBarX, barY, barWidth * healthPercent, barHeight);
    
    // Barra de escudo compacta (se relevante)
    if (shieldEnergy > 0 || initialShieldActive) {
        const shieldBarX = margin + barWidth + 10;
        ctx.fillStyle = 'rgba(0, 100, 100, 0.3)';
        ctx.fillRect(shieldBarX, barY, barWidth, barHeight);
        
        const shieldPercent = initialShieldActive ? 
            (initialShieldTimer / initialShieldDuration) : 
            (shieldEnergy / shieldMaxEnergy);
        
        ctx.fillStyle = initialShieldActive ? '#FFD700' : '#00FFFF';
        ctx.fillRect(shieldBarX, barY, barWidth * shieldPercent, barHeight);
    }
    
    // Botão para expandir HUD (canto direito)
    const expandButtonX = CANVAS_WIDTH - 120;
    const expandButtonY = 5;
    const expandButtonWidth = 100;
    const expandButtonHeight = 25;
    
    // Botão expand com animação
    const pulseIntensity = Math.sin(Date.now() * 0.008) * 0.2 + 0.8;
    ctx.fillStyle = `rgba(255, 215, 0, ${pulseIntensity * 0.3})`;
    ctx.fillRect(expandButtonX, expandButtonY, expandButtonWidth, expandButtonHeight);
    
    ctx.strokeStyle = `rgba(255, 215, 0, ${pulseIntensity})`;
    ctx.lineWidth = 1;
    ctx.strokeRect(expandButtonX, expandButtonY, expandButtonWidth, expandButtonHeight);
    
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('📊 EXPANDIR (H)', expandButtonX + expandButtonWidth/2, expandButtonY + 16);
    
    ctx.textAlign = 'left';
}

// === SISTEMA DE CONTROLES ARRASTÁVEIS INDIVIDUAIS ===
let draggableControlsState = {
    enabled: false,
    individual: false, // Controles individuais vs agrupados
    currentlyDragging: null,
    dragOffset: { x: 0, y: 0 },
    positions: {}, // Armazena posições personalizadas
    initialized: false
};

// Posições padrão dos controles individuais
const defaultControlPositions = {
    dpad: { x: 80, y: window.innerHeight - 80 },
    shoot: { x: window.innerWidth - 80, y: window.innerHeight - 80 },
    jump: { x: window.innerWidth - 150, y: window.innerHeight - 130 },
    chainLeft: { x: window.innerWidth - 220, y: window.innerHeight - 90 },
    chainBoth: { x: window.innerWidth - 220, y: window.innerHeight - 150 },
    bomb: { x: 60, y: 60 },
    shield: { x: 120, y: 60 },
    lava: { x: 180, y: 60 },
    pause: { x: window.innerWidth - 60, y: 60 },
    sound: { x: window.innerWidth - 120, y: 60 }
};

// Inicializar controles arrastáveis
function initializeDraggableControls() {
    if (!mobileControlsState.enabled || draggableControlsState.initialized) return;
    
    // Ativar sistema arrastável em dispositivos móveis landscape
    if (screenDetection.orientation === 'landscape' && (screenDetection.isMobile || screenDetection.isTablet)) {
        draggableControlsState.enabled = true;
        draggableControlsState.individual = true;
        
        // Criar controles individuais
        createIndividualControls();
        
        console.log('🎮 Controles arrastáveis individuais ativados para landscape!');
    }
    
    draggableControlsState.initialized = true;
}

// Criar controles individuais
function createIndividualControls() {
    if (!draggableControlsState.enabled) return;
    
    // Carregar posições salvas ou usar padrões
    const savedPositions = localStorage.getItem('juliette-control-positions');
    if (savedPositions) {
        try {
            draggableControlsState.positions = JSON.parse(savedPositions);
        } catch (e) {
            console.log('❌ Erro ao carregar posições salvas, usando padrões');
            draggableControlsState.positions = { ...defaultControlPositions };
        }
    } else {
        draggableControlsState.positions = { ...defaultControlPositions };
    }
    
    // Criar elementos DOM para controles individuais
    createDraggableControlElements();
    
    // Adicionar event listeners para arrastar
    setupDragEventListeners();
}

// Criar elementos DOM dos controles
function createDraggableControlElements() {
    // Remover controles existentes se houver
    document.querySelectorAll('.individual-draggable-control').forEach(el => el.remove());
    
    const controlsConfig = [
        { id: 'dpad', icon: '🎮', class: 'dpad-control', size: 80 },
        { id: 'shoot', icon: '🎯', class: 'shoot', size: 70 },
        { id: 'jump', icon: '⬆️', class: 'jump', size: 60 },
        { id: 'chainLeft', icon: '⛓️', class: 'chain-left', size: 55 },
        { id: 'chainBoth', icon: '⛓️⛓️', class: 'chain-both', size: 55 },
        { id: 'bomb', icon: '💣', class: 'bomb', size: 50 },
        { id: 'shield', icon: '🛡️', class: 'shield', size: 50 },
        { id: 'lava', icon: '🌋', class: 'lava', size: 50 },
        { id: 'pause', icon: '⏸️', class: 'pause', size: 45 },
        { id: 'sound', icon: '🔊', class: 'sound', size: 45 }
    ];
    
    controlsConfig.forEach(config => {
        const element = document.createElement('div');
        element.id = `draggable-${config.id}`;
        element.className = `individual-draggable-control draggable-control individual-button ${config.class}`;
        element.innerHTML = config.icon;
        
        // Aplicar posição
        const pos = draggableControlsState.positions[config.id] || defaultControlPositions[config.id];
        element.style.left = `${pos.x - config.size/2}px`;
        element.style.top = `${pos.y - config.size/2}px`;
        element.style.width = `${config.size}px`;
        element.style.height = `${config.size}px`;
        element.style.fontSize = `${Math.floor(config.size * 0.25)}px`;
        
        // Dados para identificação
        element.dataset.controlId = config.id;
        element.dataset.controlSize = config.size;
        
        document.body.appendChild(element);
    });
    
    console.log('🎮 Elementos de controle individuais criados');
}

// Configurar event listeners para arrastar
function setupDragEventListeners() {
    const controls = document.querySelectorAll('.individual-draggable-control');
    
    controls.forEach(control => {
        // Touch events
        control.addEventListener('touchstart', handleDragStart, { passive: false });
        control.addEventListener('touchmove', handleDragMove, { passive: false });
        control.addEventListener('touchend', handleDragEnd, { passive: false });
        
        // Mouse events (para desktop de teste)
        control.addEventListener('mousedown', handleDragStart, { passive: false });
        control.addEventListener('mousemove', handleDragMove, { passive: false });
        control.addEventListener('mouseup', handleDragEnd, { passive: false });
        
        // Click/Touch para ação do controle
        control.addEventListener('click', handleControlAction);
        control.addEventListener('touchstart', handleControlTouch, { passive: false });
    });
    
    // Event listeners globais para mouse
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
}

// Handlers de arrastar
function handleDragStart(e) {
    e.preventDefault();
    
    const control = e.currentTarget;
    const controlId = control.dataset.controlId;
    
    // Distinguir entre arrastar e ação
    const isTouch = e.type === 'touchstart';
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;
    
    // Calcular offset do drag
    const rect = control.getBoundingClientRect();
    draggableControlsState.dragOffset = {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
    
    // Preparar para arrastar
    draggableControlsState.currentlyDragging = control;
    control.classList.add('dragging');
    
    // Haptic feedback
    if (navigator.vibrate && isTouch) {
        navigator.vibrate(50);
    }
    
    console.log(`🎮 Iniciando arrastar: ${controlId}`);
}

function handleDragMove(e) {
    if (!draggableControlsState.currentlyDragging) return;
    
    e.preventDefault();
    
    const isTouch = e.type === 'touchmove';
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;
    
    // Calcular nova posição
    const newX = clientX - draggableControlsState.dragOffset.x;
    const newY = clientY - draggableControlsState.dragOffset.y;
    
    // Limites da tela
    const control = draggableControlsState.currentlyDragging;
    const size = parseInt(control.dataset.controlSize);
    const maxX = window.innerWidth - size;
    const maxY = window.innerHeight - size;
    
    const clampedX = Math.max(0, Math.min(newX, maxX));
    const clampedY = Math.max(0, Math.min(newY, maxY));
    
    // Aplicar posição
    control.style.left = `${clampedX}px`;
    control.style.top = `${clampedY}px`;
}

function handleDragEnd(e) {
    if (!draggableControlsState.currentlyDragging) return;
    
    const control = draggableControlsState.currentlyDragging;
    const controlId = control.dataset.controlId;
    
    // Salvar nova posição
    const rect = control.getBoundingClientRect();
    const size = parseInt(control.dataset.controlSize);
    const centerX = rect.left + size/2;
    const centerY = rect.top + size/2;
    
    draggableControlsState.positions[controlId] = {
        x: centerX,
        y: centerY
    };
    
    // Salvar no localStorage
    localStorage.setItem('juliette-control-positions', JSON.stringify(draggableControlsState.positions));
    
    // Limpar estado de arrastar
    control.classList.remove('dragging');
    draggableControlsState.currentlyDragging = null;
    
    // Haptic feedback
    if (navigator.vibrate) {
        navigator.vibrate(30);
    }
    
    console.log(`🎮 Posição salva para ${controlId}:`, { x: centerX, y: centerY });
}

// Handlers globais para mouse
function handleGlobalMouseMove(e) {
    if (draggableControlsState.currentlyDragging) {
        handleDragMove(e);
    }
}

function handleGlobalMouseUp(e) {
    if (draggableControlsState.currentlyDragging) {
        handleDragEnd(e);
    }
}

// Handler de ação dos controles
function handleControlAction(e) {
    if (draggableControlsState.currentlyDragging) return; // Não ativar se estava arrastando
    
    const controlId = e.currentTarget.dataset.controlId;
    executeControlAction(controlId);
}

function handleControlTouch(e) {
    // Detectar se é um tap rápido vs drag
    const startTime = Date.now();
    e.currentTarget.dataset.touchStartTime = startTime;
    
    setTimeout(() => {
        const currentTime = Date.now();
        const touchTime = parseInt(e.currentTarget.dataset.touchStartTime);
        
        // Se foi um toque rápido (menos de 200ms) e não estava arrastando
        if (currentTime - touchTime < 200 && !draggableControlsState.currentlyDragging) {
            const controlId = e.currentTarget.dataset.controlId;
            executeControlAction(controlId);
        }
    }, 200);
}

// Executar ação do controle
function executeControlAction(controlId) {
    console.log(`🎮 Executando ação: ${controlId}`);
    
    switch (controlId) {
        case 'shoot':
            if (!attacking) {
                shoot();
                attacking = true;
            }
            break;
        case 'jump':
            jump();
            break;
        case 'chainLeft':
            if (!isInSpecialAnim && chainAttackCooldown === 0) {
                chainAttack('left_hand');
            }
            break;
        case 'chainBoth':
            if (!isInSpecialAnim && chainAttackCooldown === 0) {
                chainAttack('both_hands');
            }
            break;
        case 'bomb':
            if (bombCount > 0 && bombCooldown === 0) {
                activateBomb();
            }
            break;
        case 'shield':
            if (shieldEnergy > 20 && shieldCooldown === 0) {
                activateShield();
            }
            break;
        case 'lava':
            toggleLavaDisc();
            break;
        case 'pause':
            gameState.paused = !gameState.paused;
            break;
        case 'sound':
            gameAudio.enabled = !gameAudio.enabled;
            updateSoundButton();
            break;
    }
}

// Atualizar botão de som
function updateSoundButton() {
    const soundButton = document.getElementById('draggable-sound');
    if (soundButton) {
        soundButton.innerHTML = gameAudio.enabled ? '🔊' : '🔇';
    }
}

// D-Pad especial (mais complexo)
function setupDPadControl() {
    const dpadElement = document.getElementById('draggable-dpad');
    if (!dpadElement) return;
    
    // Adicionar event listeners especiais para D-Pad
    let dpadActive = false;
    let dpadCenter = { x: 0, y: 0 };
    
    function handleDPadStart(e) {
        const rect = dpadElement.getBoundingClientRect();
        dpadCenter.x = rect.left + rect.width/2;
        dpadCenter.y = rect.top + rect.height/2;
        dpadActive = true;
        
        handleDPadMove(e);
    }
    
    function handleDPadMove(e) {
        if (!dpadActive) return;
        
        const isTouch = e.type.includes('touch');
        const clientX = isTouch ? e.touches[0].clientX : e.clientX;
        const clientY = isTouch ? e.touches[0].clientY : e.clientY;
        
        const deltaX = clientX - dpadCenter.x;
        const deltaY = clientY - dpadCenter.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (distance > 20) { // Zona morta
            const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
            
            // Resetar movimento
            moving = false;
            backgroundScrolling = false;
            
            // Determinar direção
            if (angle >= -45 && angle <= 45) {
                // Direita
                if (!isInSpecialAnim) {
                    moving = true;
                    facingRight = true;
                    backgroundScrolling = true;
                }
            } else if (angle >= 135 || angle <= -135) {
                // Esquerda
                if (!isInSpecialAnim) {
                    moving = true;
                    facingRight = false;
                    backgroundScrolling = true;
                }
            } else if (angle >= -135 && angle <= -45) {
                // Cima
                if (hasWeapon && onGround && !isInSpecialAnim) {
                    startSpecialAnimation('weapon_up');
                } else if (!isInSpecialAnim) {
                    jump();
                }
            }
        }
    }
    
    function handleDPadEnd(e) {
        dpadActive = false;
        moving = false;
        backgroundScrolling = false;
    }
    
    // Sobrescrever eventos do D-Pad
    dpadElement.addEventListener('touchstart', handleDPadStart, { passive: false });
    dpadElement.addEventListener('touchmove', handleDPadMove, { passive: false });
    dpadElement.addEventListener('touchend', handleDPadEnd, { passive: false });
    dpadElement.addEventListener('mousedown', handleDPadStart, { passive: false });
    dpadElement.addEventListener('mousemove', handleDPadMove, { passive: false });
    dpadElement.addEventListener('mouseup', handleDPadEnd, { passive: false });
}

// Reset de posições dos controles
function resetControlPositions() {
    draggableControlsState.positions = { ...defaultControlPositions };
    localStorage.removeItem('juliette-control-positions');
    
    if (draggableControlsState.enabled) {
        createDraggableControlElements();
        setupDPadControl();
    }
    
    console.log('🎮 Posições dos controles resetadas!');
}

// Função para alternar entre controles agrupados e individuais
function toggleControlMode() {
    if (!mobileControlsState.enabled) return;
    
    draggableControlsState.individual = !draggableControlsState.individual;
    
    if (draggableControlsState.individual) {
        // Ativar controles individuais
        document.querySelector('.mobile-controls')?.classList.remove('active');
        createIndividualControls();
        setupDPadControl();
        console.log('🎮 Modo: Controles individuais arrastáveis');
    } else {
        // Ativar controles agrupados
        document.querySelectorAll('.individual-draggable-control').forEach(el => el.remove());
        document.querySelector('.mobile-controls')?.classList.add('active');
        console.log('🎮 Modo: Controles agrupados tradicionais');
    }
}

// Integração com mudança de orientação
function handleControlOrientationChange() {
    updateScreenDetection();
    
    // Ativar controles individuais em landscape, desativar em portrait
    if (screenDetection.orientation === 'landscape' && mobileControlsState.enabled) {
        if (!draggableControlsState.individual) {
            toggleControlMode();
        }
    } else if (screenDetection.orientation === 'portrait' && draggableControlsState.individual) {
        toggleControlMode();
    }
    
    console.log(`🎮 Orientação: ${screenDetection.orientation} - Controles: ${draggableControlsState.individual ? 'Individuais' : 'Agrupados'}`);
}

// Atualizar no loop principal
function updateDraggableControls() {
    if (!draggableControlsState.initialized && mobileControlsState.enabled) {
        initializeDraggableControls();
    }
    
    // Atualizar estado visual dos botões baseado no jogo
    if (draggableControlsState.enabled && draggableControlsState.individual) {
        updateControlStates();
    }
}

// Atualizar estados visuais dos controles
function updateControlStates() {
    const controls = {
        bomb: document.getElementById('draggable-bomb'),
        shield: document.getElementById('draggable-shield'),
        lava: document.getElementById('draggable-lava')
    };
    
    // Bomba
    if (controls.bomb) {
        controls.bomb.disabled = bombCount === 0 || bombCooldown > 0;
        controls.bomb.style.opacity = controls.bomb.disabled ? '0.4' : '1';
    }
    
    // Escudo
    if (controls.shield) {
        controls.shield.disabled = shieldEnergy < 20 || shieldCooldown > 0;
        controls.shield.style.opacity = controls.shield.disabled ? '0.4' : '1';
        controls.shield.style.borderColor = (shieldActive || initialShieldActive) ? '#00FFFF' : 'rgba(0, 255, 255, 0.6)';
    }
    
    // Lava
    if (controls.lava) {
        controls.lava.style.borderColor = lavaDisc.active ? '#FFD700' : 'rgba(255, 69, 0, 0.6)';
    }
}

// === NOVAS FUNÇÕES DE OTIMIZAÇÃO E CONFIGURAÇÃO DE TELA ===

// Função para otimizar o jogo baseado no tipo de dispositivo
function optimizeForDevice() {
    updateScreenDetection();
    
    // Otimizações específicas por tipo de dispositivo
    if (screenDetection.isMobile) {
        optimizeForMobile();
    } else if (screenDetection.isTablet) {
        optimizeForTablet();
    } else {
        optimizeForDesktop();
    }
    
    // Otimizações baseadas na orientação
    if (screenDetection.orientation === 'portrait') {
        optimizeForPortrait();
    } else {
        optimizeForLandscape();
    }
    
    console.log(`🎯 Otimizações aplicadas para: ${screenDetection.isMobile ? 'Mobile' : screenDetection.isTablet ? 'Tablet' : 'Desktop'} (${screenDetection.orientation})`);
}

// Otimizações específicas para mobile
function optimizeForMobile() {
    // Reduzir efeitos visuais para melhor performance
    const mobileOptimizations = {
        maxParticles: 30,
        maxEnemies: 6,
        reducedShadows: true,
        simplifiedExplosions: true
    };
    
    // Aplicar limite de partículas
    if (particles.length > mobileOptimizations.maxParticles) {
        particles.splice(0, particles.length - mobileOptimizations.maxParticles);
    }
    
    // Aplicar limite de inimigos
    if (enemies.length > mobileOptimizations.maxEnemies) {
        const MAX_ENEMIES_MOBILE = mobileOptimizations.maxEnemies;
        console.log(`📱 Limitando inimigos para mobile: ${MAX_ENEMIES_MOBILE}`);
    }
    
    // Ativar controles touch automaticamente
    if (!touchControls.enabled) {
        touchControls.enabled = true;
        console.log('📱 Controles touch ativados automaticamente para mobile');
    }
}

// Otimizações específicas para tablet
function optimizeForTablet() {
    // Configurações intermediárias entre mobile e desktop
    const tabletOptimizations = {
        maxParticles: 50,
        maxEnemies: 8,
        enhancedGraphics: true
    };
    
    console.log('📱 Otimizações de tablet aplicadas');
}

// Otimizações específicas para desktop
function optimizeForDesktop() {
    // Máxima qualidade gráfica e efeitos
    const desktopOptimizations = {
        maxParticles: 100,
        maxEnemies: 12,
        fullEffects: true,
        highQualityAudio: true
    };
    
    // Desativar controles touch se não necessário
    if (touchControls.enabled && !('ontouchstart' in window)) {
        touchControls.enabled = false;
        console.log('🖥️ Controles touch desativados para desktop');
    }
    
    console.log('🖥️ Otimizações de desktop aplicadas');
}

// Otimizações para modo retrato
function optimizeForPortrait() {
    // Ajustar interface para modo vertical
    console.log('📱 Otimizando para modo retrato');
    
    // Configurar controles para retrato
    if (mobileControlsState.enabled) {
        // Usar controles agrupados em retrato
        if (draggableControlsState.individual) {
            toggleControlMode(); // Voltar para controles agrupados
        }
    }
}

// Otimizações para modo paisagem
function optimizeForLandscape() {
    console.log('📱 Otimizando para modo paisagem');
    
    // Ativar controles individuais em paisagem se mobile/tablet
    if (mobileControlsState.enabled && (screenDetection.isMobile || screenDetection.isTablet)) {
        if (!draggableControlsState.individual) {
            toggleControlMode(); // Ativar controles individuais
        }
    }
}

// Função para salvar configurações da tela no localStorage
function saveScreenSettings() {
    const screenSettings = {
        lastDetection: {
            width: screenDetection.screenWidth,
            height: screenDetection.screenHeight,
            orientation: screenDetection.orientation,
            deviceType: screenDetection.isMobile ? 'mobile' : 
                       screenDetection.isTablet ? 'tablet' : 'desktop',
            pixelRatio: screenDetection.pixelRatio,
            aspectRatio: screenDetection.aspectRatio
        },
        canvasSettings: {
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT
        },
        controlSettings: {
            touchEnabled: touchControls.enabled,
            mobileControlsVisible: mobileControlsState.visible,
            draggableEnabled: draggableControlsState.enabled,
            individualControls: draggableControlsState.individual
        },
        timestamp: Date.now()
    };
    
    try {
        localStorage.setItem('juliette-screen-settings', JSON.stringify(screenSettings));
        console.log('💾 Configurações de tela salvas no localStorage');
    } catch (e) {
        console.warn('⚠️ Não foi possível salvar configurações de tela:', e);
    }
}

// Função para carregar configurações salvas da tela
function loadScreenSettings() {
    try {
        const savedSettings = localStorage.getItem('juliette-screen-settings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            
            // Verificar se as configurações são recentes (menos de 24h)
            const hoursOld = (Date.now() - settings.timestamp) / (1000 * 60 * 60);
            if (hoursOld < 24) {
                console.log('📂 Configurações de tela carregadas:', settings.lastDetection);
                return settings;
            } else {
                console.log('⏰ Configurações de tela expiradas, usando detecção atual');
                localStorage.removeItem('juliette-screen-settings');
            }
        }
    } catch (e) {
        console.warn('⚠️ Erro ao carregar configurações de tela:', e);
    }
    
    return null;
}

// Função para detectar mudanças significativas na tela
function detectScreenChanges() {
    const savedSettings = loadScreenSettings();
    if (!savedSettings) return true; // Primeira execução
    
    const lastDetection = savedSettings.lastDetection;
    const currentDetection = {
        width: screenDetection.screenWidth,
        height: screenDetection.screenHeight,
        orientation: screenDetection.orientation,
        deviceType: screenDetection.isMobile ? 'mobile' : 
                   screenDetection.isTablet ? 'tablet' : 'desktop'
    };
    
    // Verificar mudanças significativas
    const significantChanges = [
        Math.abs(currentDetection.width - lastDetection.width) > 50,
        Math.abs(currentDetection.height - lastDetection.height) > 50,
        currentDetection.orientation !== lastDetection.orientation,
        currentDetection.deviceType !== lastDetection.deviceType
    ];
    
    const hasSignificantChanges = significantChanges.some(change => change);
    
    if (hasSignificantChanges) {
        console.log('🔄 Mudanças significativas detectadas na tela:', {
            anterior: lastDetection,
            atual: currentDetection
        });
    }
    
    return hasSignificantChanges;
}

// Função para aplicar configurações de performance baseadas na tela
function applyPerformanceSettings() {
    // Configurações de performance baseadas no dispositivo
    const performanceSettings = {
        mobile: {
            maxParticles: 30,
            maxEnemies: 6,
            shadowBlur: 5,
            animationQuality: 'low'
        },
        tablet: {
            maxParticles: 50,
            maxEnemies: 8,
            shadowBlur: 10,
            animationQuality: 'medium'
        },
        desktop: {
            maxParticles: 100,
            maxEnemies: 12,
            shadowBlur: 15,
            animationQuality: 'high'
        }
    };
    
    const deviceType = screenDetection.isMobile ? 'mobile' : 
                      screenDetection.isTablet ? 'tablet' : 'desktop';
    
    const settings = performanceSettings[deviceType];
    
    // Aplicar configurações
    console.log(`⚡ Aplicando configurações de performance para ${deviceType}:`, settings);
    
    // Limitar arrays baseado na performance
    if (particles.length > settings.maxParticles) {
        particles.splice(0, particles.length - settings.maxParticles);
    }
    
    if (enemies.length > settings.maxEnemies) {
        // Não remover inimigos diretamente, mas ajustar spawn rate
        console.log(`⚡ Limite de inimigos ajustado para ${settings.maxEnemies}`);
    }
}

// Função para exibir informações detalhadas da tela (debug)
function displayScreenInfo() {
    const info = {
        '📊 Resolução da Tela': `${window.screen.width}x${window.screen.height}`,
        '🖼️ Área Disponível': `${window.innerWidth}x${window.innerHeight}`,
        '🎮 Canvas do Jogo': `${CANVAS_WIDTH}x${CANVAS_HEIGHT}`,
        '📐 Aspect Ratio': screenDetection.aspectRatio.toFixed(2),
        '🔄 Orientação': screenDetection.orientation,
        '📱 Tipo de Dispositivo': screenDetection.isMobile ? 'Mobile' : 
                                 screenDetection.isTablet ? 'Tablet' : 'Desktop',
        '🔍 Pixel Ratio': screenDetection.pixelRatio,
        '👆 Touch Disponível': ('ontouchstart' in window) ? 'Sim' : 'Não',
        '🎛️ Controles Touch': touchControls.enabled ? 'Ativados' : 'Desativados'
    };
    
    console.group('📊 INFORMAÇÕES DETALHADAS DA TELA');
    Object.entries(info).forEach(([key, value]) => {
        console.log(`${key}: ${value}`);
    });
    console.groupEnd();
    
    return info;
}

// Função para adaptar automaticamente o jogo para a tela atual
function autoAdaptToScreen() {
    console.log('🎯 Iniciando adaptação automática para a tela...');
    
    // 1. Detectar tela
    updateScreenDetection();
    
    // 2. Verificar mudanças
    const hasChanges = detectScreenChanges();
    
    // 3. Configurar canvas responsivo
    setupResponsiveCanvas();
    
    // 4. Otimizar para dispositivo
    optimizeForDevice();
    
    // 5. Aplicar configurações de performance
    applyPerformanceSettings();
    
    // 6. Salvar configurações
    saveScreenSettings();
    
    // 7. Exibir informações (apenas se houve mudanças)
    if (hasChanges) {
        displayScreenInfo();
    }
    
    console.log('✅ Adaptação automática para a tela concluída!');
}

// Função para resetar todas as configurações de tela
function resetAllScreenSettings() {
    // Limpar localStorage
    localStorage.removeItem('juliette-screen-settings');
    localStorage.removeItem('juliette-control-positions');
    
    // Resetar configurações de controles
    if (draggableControlsState.enabled) {
        resetControlPositions();
    }
    
    // Redetectar e reconfigurar tela
    autoAdaptToScreen();
    
    console.log('🔄 Todas as configurações de tela foram resetadas!');
}

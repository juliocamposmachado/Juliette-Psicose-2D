const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Configurações da tela adaptável
let CANVAS_WIDTH = 800;  // Valor inicial, será atualizado
let CANVAS_HEIGHT = 600; // Valor inicial, será atualizado

// === SISTEMA AVANÇADO DE ADAPTAÇÃO MOBILE ===
let mobileAdaptation = {
    // Estado atual do dispositivo
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    
    // Dimensões reais da tela
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    availableWidth: window.innerWidth,
    availableHeight: window.innerHeight,
    
    // Informações da viewport
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    aspectRatio: window.innerWidth / window.innerHeight,
    orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
    pixelRatio: window.devicePixelRatio || 1,
    
    // Área segura para controles (1cm = ~37.8px)
    safeAreaMargin: Math.round(37.8), // 1cm em pixels
    
    // Breakpoints para detecção
    breakpoints: {
        mobile: 768,
        tablet: 1024,
        desktop: 1440
    },
    
    // User Agent detection
    userAgent: navigator.userAgent || navigator.vendor || window.opera,
    
    // Recursos do dispositivo
    hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    hasOrientationAPI: 'orientation' in window,
    hasDeviceMotion: 'DeviceMotionEvent' in window,
    
    // Estado da adaptação
    isFullscreen: false,
    adaptationApplied: false,
    
    // Configurações por tipo de dispositivo
    configs: {
        mobile: {
            useFullViewport: true,
            controlMargin: 37.8, // 1cm
            minButtonSize: 60,
            optimalButtonSize: 70,
            touchControls: true,
            hideDesktopElements: true
        },
        tablet: {
            useFullViewport: true,
            controlMargin: 37.8, // 1cm
            minButtonSize: 70,
            optimalButtonSize: 80,
            touchControls: true,
            hideDesktopElements: false
        },
        desktop: {
            useFullViewport: false,
            controlMargin: 0,
            minButtonSize: 0,
            optimalButtonSize: 0,
            touchControls: false,
            hideDesktopElements: false
        }
    }
};

// === SISTEMA DE DETECÇÃO AVANÇADA ===
function detectDeviceType() {
    const ua = mobileAdaptation.userAgent.toLowerCase();
    const width = window.innerWidth;
    const height = window.innerHeight;
    const hasTouch = mobileAdaptation.hasTouch;
    
    // Detecção por User Agent
    const isMobileUA = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua);
    const isTabletUA = /ipad|android(?!.*mobile)|tablet|kindle|silk|playbook/i.test(ua);
    
    // Detecção por tamanho de tela e recursos
    const isSmallScreen = width <= 768;
    const isMediumScreen = width > 768 && width <= 1024;
    const hasCoarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    
    // Lógica de detecção combinada
    if (isMobileUA || (isSmallScreen && hasTouch)) {
        mobileAdaptation.isMobile = true;
        mobileAdaptation.isTablet = false;
        mobileAdaptation.isDesktop = false;
    } else if (isTabletUA || (isMediumScreen && hasTouch && hasCoarsePointer)) {
        mobileAdaptation.isMobile = false;
        mobileAdaptation.isTablet = true;
        mobileAdaptation.isDesktop = false;
    } else {
        mobileAdaptation.isMobile = false;
        mobileAdaptation.isTablet = false;
        mobileAdaptation.isDesktop = true;
    }
    
    console.log('📱 Detecção de dispositivo:', {
        mobile: mobileAdaptation.isMobile,
        tablet: mobileAdaptation.isTablet,
        desktop: mobileAdaptation.isDesktop,
        userAgent: ua.substring(0, 50),
        screenSize: `${width}x${height}`,
        hasTouch: hasTouch
    });
}

// === FUNÇÃO PRINCIPAL DE ADAPTAÇÃO MOBILE ===
function adaptGameForMobile() {
    detectDeviceType();
    updateViewportDimensions();
    
    if (mobileAdaptation.isMobile || mobileAdaptation.isTablet) {
        console.log('📱 Iniciando adaptação para dispositivo móvel...');
        
        // 1. Configurar viewport para usar 100% da tela
        setupMobileViewport();
        
        // 2. Adaptar canvas do jogo
        adaptCanvasForMobile();
        
        // 3. Ocultar elementos desktop
        hideDesktopElements();
        
        // 4. Configurar controles mobile
        setupMobileGameControls();
        
        // 5. Aplicar estilos mobile
        applyMobileStyles();
        
        mobileAdaptation.adaptationApplied = true;
        console.log('✅ Adaptação mobile concluída!');
        
    } else {
        console.log('🖥️ Desktop detectado - usando configuração padrão');
        setupDesktopCanvas();
    }
}

// === ATUALIZAR DIMENSÕES DA VIEWPORT ===
function updateViewportDimensions() {
    mobileAdaptation.screenWidth = screen.width;
    mobileAdaptation.screenHeight = screen.height;
    mobileAdaptation.viewportWidth = window.innerWidth;
    mobileAdaptation.viewportHeight = window.innerHeight;
    mobileAdaptation.availableWidth = window.innerWidth;
    mobileAdaptation.availableHeight = window.innerHeight;
    mobileAdaptation.aspectRatio = mobileAdaptation.viewportWidth / mobileAdaptation.viewportHeight;
    mobileAdaptation.orientation = mobileAdaptation.viewportWidth > mobileAdaptation.viewportHeight ? 'landscape' : 'portrait';
    
    console.log('📐 Dimensões atualizadas:', {
        screen: `${mobileAdaptation.screenWidth}x${mobileAdaptation.screenHeight}`,
        viewport: `${mobileAdaptation.viewportWidth}x${mobileAdaptation.viewportHeight}`,
        orientation: mobileAdaptation.orientation,
        aspectRatio: mobileAdaptation.aspectRatio.toFixed(2)
    });
}

// === CONFIGURAR VIEWPORT MOBILE ===
function setupMobileViewport() {
    // Atualizar meta viewport para garantir escala correta
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
        viewportMeta.setAttribute('content', 
            'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover, shrink-to-fit=no'
        );
    }
    
    // Configurar body para usar tela completa
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.width = '100vw';
    document.body.style.height = '100vh';
    document.body.style.overflow = 'hidden';
    
    // Configurar html para tela completa
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
    document.documentElement.style.width = '100%';
    document.documentElement.style.height = '100%';
    
    console.log('📱 Viewport mobile configurado para tela completa');
}

// === ADAPTAR CANVAS PARA MOBILE ===
function adaptCanvasForMobile() {
    const canvas = document.getElementById('gameCanvas');
    const gameContainer = document.getElementById('gameContainer');
    
    if (!canvas || !gameContainer) {
        console.error('❌ Canvas ou container não encontrado!');
        return;
    }
    
    // Usar 100% da viewport disponível
    CANVAS_WIDTH = mobileAdaptation.viewportWidth;
    CANVAS_HEIGHT = mobileAdaptation.viewportHeight;
    
<<<<<<< HEAD
    // Configurar canvas com alta DPI
    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = CANVAS_WIDTH * devicePixelRatio;
    canvas.height = CANVAS_HEIGHT * devicePixelRatio;
    
    // Escalar contexto para alta DPI
    const ctx = canvas.getContext('2d');
    ctx.scale(devicePixelRatio, devicePixelRatio);
    
    // Configurar estilos CSS
=======
    // Configurar canvas
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
>>>>>>> ce5b39cb910dd86effc9b261c66604a0330e4827
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.display = 'block';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '1';
<<<<<<< HEAD
    canvas.style.imageRendering = 'pixelated';
=======
>>>>>>> ce5b39cb910dd86effc9b261c66604a0330e4827
    
    // Configurar container
    gameContainer.style.width = '100vw';
    gameContainer.style.height = '100vh';
    gameContainer.style.position = 'fixed';
    gameContainer.style.top = '0';
    gameContainer.style.left = '0';
    gameContainer.style.margin = '0';
    gameContainer.style.padding = '0';
    
<<<<<<< HEAD
    console.log(`🎮 Canvas mobile adaptado: ${CANVAS_WIDTH}x${CANVAS_HEIGHT} (DPR: ${devicePixelRatio})`);
=======
    console.log(`🎮 Canvas adaptado: ${CANVAS_WIDTH}x${CANVAS_HEIGHT}`);
>>>>>>> ce5b39cb910dd86effc9b261c66604a0330e4827
}

// === OCULTAR ELEMENTOS DESKTOP ===
function hideDesktopElements() {
    // Ocultar elementos marcados como desktop-only
    document.querySelectorAll('.desktop-only').forEach(element => {
        element.style.display = 'none';
    });
    
    // Ocultar informações de controles desktop
    const gameInfo = document.querySelector('.game-info');
    if (gameInfo) {
        gameInfo.style.display = 'none';
    }
    
    const controls = document.querySelector('.controls');
    if (controls) {
        controls.style.display = 'none';
    }
    
    console.log('🖥️ Elementos desktop ocultados');
}

// === CONFIGURAR CONTROLES MOBILE DO JOGO ===
function setupMobileGameControls() {
    const deviceType = mobileAdaptation.isMobile ? 'mobile' : 'tablet';
    const config = mobileAdaptation.configs[deviceType];
    
    // Calcular posições dos controles com margem de 1cm
    const margin = config.controlMargin;
    
    // Área disponível para controles (descontando margens)
    const availableWidth = CANVAS_WIDTH - (margin * 2);
    const availableHeight = CANVAS_HEIGHT - (margin * 2);
    
    // Configurar posições dos controles
    const controlPositions = {
        leftControls: {
            x: margin,
            y: CANVAS_HEIGHT - margin - config.optimalButtonSize
        },
        rightControls: {
            x: CANVAS_WIDTH - margin - config.optimalButtonSize,
            y: CANVAS_HEIGHT - margin - config.optimalButtonSize
        },
        topControls: {
            x: margin,
            y: margin
        }
    };
    
    // Aplicar configurações globais
    window.mobileControlPositions = controlPositions;
    window.mobileButtonSize = config.optimalButtonSize;
    window.mobileControlMargin = margin;
    
    console.log('🎮 Controles mobile configurados:', {
        buttonSize: config.optimalButtonSize,
        margin: margin,
        positions: controlPositions
    });
}

// === APLICAR ESTILOS MOBILE ===
function applyMobileStyles() {
    // Criar ou atualizar estilos mobile dinâmicos
    let mobileStyleSheet = document.getElementById('mobile-dynamic-styles');
    if (!mobileStyleSheet) {
        mobileStyleSheet = document.createElement('style');
        mobileStyleSheet.id = 'mobile-dynamic-styles';
        document.head.appendChild(mobileStyleSheet);
    }
    
    const deviceType = mobileAdaptation.isMobile ? 'mobile' : 'tablet';
    const config = mobileAdaptation.configs[deviceType];
    const margin = config.controlMargin;
    const buttonSize = config.optimalButtonSize;
    
    const mobileCSS = `
        /* === ADAPTAÇÃO MOBILE DINÂMICA === */
        .mobile-controls-new {
            width: 100vw !important;
            height: 100vh !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            z-index: 1000 !important;
        }
        
        .controls-left {
            left: ${margin}px !important;
            bottom: ${margin}px !important;
        }
        
        .controls-right {
            right: ${margin}px !important;
            bottom: ${margin}px !important;
        }
        
        .controls-top {
            top: ${margin}px !important;
            left: ${margin}px !important;
        }
        
        .control-btn {
            width: ${buttonSize}px !important;
            height: ${buttonSize}px !important;
        }
        
        .controls-toggle {
            top: ${margin}px !important;
            right: ${margin}px !important;
            width: 50px !important;
            height: 50px !important;
        }
        
        /* === GARANTIR CANVAS COMPLETO === */
        #gameCanvas {
            width: 100vw !important;
            height: 100vh !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            z-index: 1 !important;
        }
        
        #gameContainer {
            width: 100vw !important;
            height: 100vh !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
        }
        
        /* === OCULTAR ELEMENTOS DESKTOP === */
        .desktop-only {
            display: none !important;
        }
        
        /* === FORÇAR TELA COMPLETA === */
        body, html {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: 100% !important;
            overflow: hidden !important;
        }
    `;
    
    mobileStyleSheet.textContent = mobileCSS;
    console.log('🎨 Estilos mobile aplicados dinamicamente');
}

// === CONFIGURAR CANVAS DESKTOP ===
function setupDesktopCanvas() {
    const canvas = document.getElementById('gameCanvas');
    
    // Configuração padrão desktop
    CANVAS_WIDTH = 1200;
    CANVAS_HEIGHT = 800;
    
    if (canvas) {
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        canvas.style.width = CANVAS_WIDTH + 'px';
        canvas.style.height = CANVAS_HEIGHT + 'px';
        canvas.style.position = 'relative';
    }
    
    console.log(`🖥️ Canvas desktop configurado: ${CANVAS_WIDTH}x${CANVAS_HEIGHT}`);
}

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


// === SISTEMA DE HUD SUPERIOR RECOLHÍVEL ===
let hudVisible = true;
let hudToggleTimer = 0;
const HUD_TOGGLE_COOLDOWN = 30; // 30 frames = 0.5 segundos
let hudMinimized = false; // Estado minimizado (mostra apenas essenciais)

// === SISTEMA DE CONTROLES TOUCH REMOVIDO COMPLETAMENTE ===

// === DETECÇÃO DE MOBILE REMOVIDA ===

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
    
    // Controles touch removidos
    
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

// === EVENTOS TOUCH REMOVIDOS ===

// === FUNÇÕES TOUCH REMOVIDAS ===

// === VERIFICAÇÃO DE BOTÕES TOUCH REMOVIDA ===

// === MOVIMENTO D-PAD REMOVIDO ===

// === DETECÇÃO DE CLIQUE EM CÍRCULO REMOVIDA ===

// === POSICIONAMENTO DE CONTROLES TOUCH REMOVIDO ===

// === DESENHAR CONTROLES TOUCH REMOVIDO ===

// === DESENHAR BOTÃO TOUCH INDIVIDUAL REMOVIDO ===

// === ATUALIZAR CONTROLES TOUCH REMOVIDO ===

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
        // Alternar visibilidade do HUD
        if (hudToggleTimer === 0) {
            if (hudVisible && !hudMinimized) {
                // HUD completo -> HUD minimizado
                hudMinimized = true;
            } else if (hudMinimized) {
                // HUD minimizado -> HUD oculto
                hudVisible = false;
                hudMinimized = false;
            } else {
                // HUD oculto -> HUD completo
                hudVisible = true;
                hudMinimized = false;
            }
            
            hudToggleTimer = HUD_TOGGLE_COOLDOWN;
            console.log('HUD Estado:', hudVisible ? (hudMinimized ? 'Minimizado' : 'Completo') : 'Oculto');
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
        
<<<<<<< HEAD
        // === APLICAR IA AVANÇADA DO GEMINI ===
        // Usar IA avançada ocasionalmente para não sobrecarregar a API
        if (Math.random() < 0.1) { // 10% de chance por frame
            applyAdvancedAI(enemy).catch(error => {
                // Silenciosamente continuar com IA básica se houver erro
                console.warn('⚠️ IA avançada falhou, usando IA básica:', error.message);
            });
        }
        
        // IA básica do inimigo (fallback e comportamento padrão)
        if (enemy.shootCooldown > 0) enemy.shootCooldown--;
        
        // Inimigo atira ocasionalmente (IA básica)
        if (Math.random() < enemy.shootChance && enemy.shootCooldown === 0) {
            // Verificar se tem bonus de mira da IA avançada
            if (enemy.aimingBonus) {
                // Tiro mais preciso direcionado ao jogador
                const dx = gameContext.player ? gameContext.player.x - enemy.x : posX - enemy.x;
                const dy = gameContext.player ? gameContext.player.y - enemy.y : posY - enemy.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0) {
                    const vx = (dx / distance) * 6;
                    const vy = (dy / distance) * 6;
                    createEnemyBullet(enemy.x, enemy.y + enemy.size/2, vx, vy);
                } else {
                    createEnemyBullet(enemy.x, enemy.y + enemy.size/2, -5, 0);
                }
                
                enemy.aimingBonus = false; // Resetar bonus
            } else {
                // Tiro básico padrão
                createEnemyBullet(enemy.x, enemy.y + enemy.size/2, -5, 0);
            }
            
=======
        // IA básica do inimigo
        if (enemy.shootCooldown > 0) enemy.shootCooldown--;
        
        // Inimigo atira ocasionalmente
        if (Math.random() < enemy.shootChance && enemy.shootCooldown === 0) {
            createEnemyBullet(enemy.x, enemy.y + enemy.size/2, -5, 0);
>>>>>>> ce5b39cb910dd86effc9b261c66604a0330e4827
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
        
<<<<<<< HEAD
        // === INIMIGOS EM FORMA DE TRIÂNGULO ===
=======
        // Corpo do inimigo com efeito piscante
>>>>>>> ce5b39cb910dd86effc9b261c66604a0330e4827
        const baseAlpha = pulseIntensity;
        if (enemy.type === 'robot') {
            ctx.fillStyle = `rgba(0, 0, ${Math.floor(255 * glowIntensity)}, ${baseAlpha})`;
        } else {
            ctx.fillStyle = `rgba(${Math.floor(255 * glowIntensity)}, 0, 0, ${baseAlpha})`;
        }
<<<<<<< HEAD
        
        // Desenhar triângulo ao invés de quadrado
        const centerX = enemy.x + enemy.size / 2;
        const centerY = enemy.y + enemy.size / 2;
        const triangleSize = enemy.size * 0.8; // Tamanho do triângulo
        
        ctx.beginPath();
        // Ponto superior do triângulo
        ctx.moveTo(centerX, centerY - triangleSize / 2);
        // Ponto inferior esquerdo
        ctx.lineTo(centerX - triangleSize / 2, centerY + triangleSize / 2);
        // Ponto inferior direito
        ctx.lineTo(centerX + triangleSize / 2, centerY + triangleSize / 2);
        // Fechar o triângulo
        ctx.closePath();
        ctx.fill();
        
        // Borda do triângulo
        ctx.strokeStyle = enemy.type === 'robot' ? '#00FFFF' : '#FFFF00';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // === EFEITOS DE ENERGIA NO TRIÂNGULO ===
        // Linhas de energia internas do triângulo
        const lineIntensity = Math.sin(time * 3 + enemy.x * 0.02) * 0.4 + 0.6;
        if (enemy.type === 'robot') {
            ctx.fillStyle = `rgba(0, 100, ${Math.floor(255 * lineIntensity)}, ${lineIntensity})`;
        } else {
            ctx.fillStyle = `rgba(${Math.floor(255 * lineIntensity)}, 100, 0, ${lineIntensity})`;
        }
        
        // Desenhar linhas de energia dentro do triângulo
        const innerSize = triangleSize * 0.4;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - innerSize / 3);
        ctx.lineTo(centerX - innerSize / 3, centerY + innerSize / 3);
        ctx.lineTo(centerX + innerSize / 3, centerY + innerSize / 3);
        ctx.closePath();
        ctx.fill();
        
=======
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
        
>>>>>>> ce5b39cb910dd86effc9b261c66604a0330e4827
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
        
<<<<<<< HEAD
        // === OLHOS CYBERPUNK ADAPTADOS PARA TRIÂNGULO ===
=======
        // Olhos cyberpunk piscantes
>>>>>>> ce5b39cb910dd86effc9b261c66604a0330e4827
        const eyeGlow = Math.sin(time * 6 + enemy.x * 0.02) * 0.4 + 0.6;
        if (enemy.type === 'robot') {
            ctx.fillStyle = `rgba(0, 255, 255, ${eyeGlow})`;
        } else {
            ctx.fillStyle = `rgba(255, 255, 0, ${eyeGlow})`;
        }
<<<<<<< HEAD
        
        // Posicionar olhos no terço superior do triângulo
        const eyeY = centerY - triangleSize * 0.15;
        const eyeSpacing = triangleSize * 0.25;
        
        // Olho esquerdo
        ctx.beginPath();
        ctx.arc(centerX - eyeSpacing, eyeY, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Olho direito
        ctx.beginPath();
        ctx.arc(centerX + eyeSpacing, eyeY, 3, 0, Math.PI * 2);
        ctx.fill();
=======
        ctx.fillRect(enemy.x + 3, enemy.y + 3, 4, 4);
        ctx.fillRect(enemy.x + enemy.size - 7, enemy.y + 3, 4, 4);
>>>>>>> ce5b39cb910dd86effc9b261c66604a0330e4827
        
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
    
    // === PAINEL DE CONTROLES REMOVIDO ===
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
    
<<<<<<< HEAD
    // === NOVO: GERAÇÃO PROCEDURAL COM GEMINI ===
    if (Math.random() < 0.1) { // 10% de chance por frame
        generateProceduralContent().catch(error => {
            console.warn('⚠️ Erro na geração procedural:', error);
        });
    }
    
    // === ATUALIZAR ELEMENTOS PROCEDURAIS ===
    updateProceduralObstacles();
    updateProceduralEnemies();
    
    // Verificar colisões
    checkCollisions();
    checkProceduralObstacleCollisions(); // NOVO: Colisões com obstáculos procedurais
=======
    // Verificar colisões
    checkCollisions();
>>>>>>> ce5b39cb910dd86effc9b261c66604a0330e4827
    
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
    
    // === ATUALIZAR CONTROLES MÓVEIS ===
    if (typeof updateMobileControls === 'function') {
        updateMobileControls();
    }
    
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

// === SISTEMA DE TELA CHEIA APRIMORADO ===
let isFullscreen = false;

// === NOVA FUNÇÃO: ATIVAR INTERFACE MOBILE ===
function activateMobileInterface() {
    // Ocultar elementos desktop
    document.querySelectorAll('.desktop-only').forEach(el => {
        el.style.display = 'none';
    });
    
    // Mostrar elementos mobile
    document.querySelectorAll('.mobile-only').forEach(el => {
        el.style.display = 'block';
    });
    
    console.log('📱 Interface mobile ativada!');
}

// === NOVA FUNÇÃO: DETECÇÃO APRIMORADA DE DISPOSITIVO MÓVEL ===
function detectMobileDevice() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    // Regex mais abrangente para detectar dispositivos móveis
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|Tablet|tablet/i;
    const isUserAgentMobile = mobileRegex.test(userAgent);
    
    // Detecção por características da tela
    const hasSmallScreen = window.innerWidth <= 768 || window.innerHeight <= 500;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const hasCoarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    
    // Detecção por orientação (comum em dispositivos móveis)
    const hasOrientationAPI = 'orientation' in window;
    const isPortrait = window.innerHeight > window.innerWidth;
    
    // Detecção por APIs específicas de mobile
    const hasDeviceMotion = 'DeviceMotionEvent' in window;
    const hasDeviceOrientation = 'DeviceOrientationEvent' in window;
    
    // Verificar se está em PWA mode (comum em mobile)
    const isPWAMode = window.matchMedia('(display-mode: standalone)').matches || 
                      window.navigator.standalone === true;
    
    // Sistema de pontuação para determinar se é mobile
    let mobileScore = 0;
    
    if (isUserAgentMobile) mobileScore += 3;
    if (hasSmallScreen) mobileScore += 2;
    if (isTouchDevice) mobileScore += 2;
    if (hasCoarsePointer) mobileScore += 2;
    if (hasOrientationAPI) mobileScore += 1;
    if (hasDeviceMotion) mobileScore += 1;
    if (hasDeviceOrientation) mobileScore += 1;
    if (isPWAMode) mobileScore += 1;
    
    const isMobile = mobileScore >= 4; // Threshold ajustável
    
    console.log('🔍 Detecção de dispositivo móvel:', {
        userAgent: isUserAgentMobile,
        smallScreen: hasSmallScreen,
        touch: isTouchDevice,
        coarsePointer: hasCoarsePointer,
        orientation: hasOrientationAPI,
        deviceMotion: hasDeviceMotion,
        deviceOrientation: hasDeviceOrientation,
        pwaMode: isPWAMode,
        score: mobileScore,
        isMobile: isMobile
    });
    
    return isMobile;
}

// Função de toggle de tela cheia universal
function toggleFullscreen() {
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const mobileFullscreenBtn = document.getElementById('mobileFullscreenBtn');
    
    if (!document.fullscreenElement) {
        // Entrar em tela cheia
        enterFullscreen();
    } else {
        // Sair da tela cheia
        exitFullscreen();
    }
}

// === NOVA FUNÇÃO: ENTRAR EM TELA CHEIA ===
function enterFullscreen() {
    const element = document.documentElement;
    
    try {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        }
        
        isFullscreen = true;
        updateFullscreenButtons(true);
        
        // Vibração para feedback em mobile
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
        
        console.log('📺 Modo tela cheia ativado');
        
    } catch (error) {
        console.error('❌ Erro ao entrar em tela cheia:', error);
        
        // Fallback para dispositivos que não suportam fullscreen API
        attemptMobileSafariFullscreen();
    }
}

// === NOVA FUNÇÃO: SAIR DE TELA CHEIA ===
function exitFullscreen() {
    try {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        }
        
        isFullscreen = false;
        updateFullscreenButtons(false);
        
        console.log('📺 Modo tela cheia desativado');
        
    } catch (error) {
        console.error('❌ Erro ao sair de tela cheia:', error);
    }
}

// === NOVA FUNÇÃO: ATUALIZAR BOTÕES DE TELA CHEIA ===
function updateFullscreenButtons(isActive) {
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const mobileFullscreenBtn = document.getElementById('mobileFullscreenBtn');
    
    const text = isActive ? 'SAIR' : 'TELA';
    const mobileText = isActive ? '📱 SAIR' : '📱 TELA';
    
    if (fullscreenBtn) {
        fullscreenBtn.textContent = `📺 ${text}`;
        fullscreenBtn.classList.toggle('fullscreen-active', isActive);
    }
    
    if (mobileFullscreenBtn) {
        mobileFullscreenBtn.textContent = mobileText;
        mobileFullscreenBtn.classList.toggle('fullscreen-active', isActive);
    }
}

// === NOVA FUNÇÃO: FALLBACK PARA MOBILE SAFARI ===
function attemptMobileSafariFullscreen() {
    // Mobile Safari não suporte fullscreen API, mas podemos tentar outras abordagens
    const canvas = document.getElementById('gameCanvas');
    const gameContainer = document.getElementById('gameContainer');
    
    if (canvas && gameContainer) {
        // Expandir canvas para viewport completa
        document.body.style.overflow = 'hidden';
        gameContainer.style.position = 'fixed';
        gameContainer.style.top = '0';
        gameContainer.style.left = '0';
        gameContainer.style.width = '100vw';
        gameContainer.style.height = '100vh';
        gameContainer.style.zIndex = '9999';
        
        // Ocultar barras do navegador (funciona em alguns casos)
        window.scrollTo(0, 1);
        
        console.log('📱 Fallback de tela cheia para Mobile Safari aplicado');
        
        isFullscreen = true;
        updateFullscreenButtons(true);
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

<<<<<<< HEAD
// === FUNÇÃO PARA REDIMENSIONAMENTO CHAMADA PELO FULLSCREEN-HANDLER ===
function resizeCanvas(width, height, pixelRatio) {
    // Atualizar variáveis globais do canvas
    if (width && height) {
        CANVAS_WIDTH = width;
        CANVAS_HEIGHT = height;
    } else {
        CANVAS_WIDTH = window.innerWidth;
        CANVAS_HEIGHT = window.innerHeight;
    }
    
    // Atualizar canvas físico
    const dpr = pixelRatio || window.devicePixelRatio || 1;
    canvas.width = CANVAS_WIDTH * dpr;
    canvas.height = CANVAS_HEIGHT * dpr;
    
    // Ajustar contexto para alta DPI
    ctx.scale(dpr, dpr);
    
    // Reposicionar elementos do jogo
    updateGameElementsForResize();
    
    console.log(`🎮 Canvas redimensionado: ${CANVAS_WIDTH}x${CANVAS_HEIGHT} (DPR: ${dpr})`);
}

=======
>>>>>>> ce5b39cb910dd86effc9b261c66604a0330e4827
// Inicializar botão de tela cheia e redimensionamento quando DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', toggleFullscreen);
    }
    
    // === NOVO: INICIALIZAR BOTÃO DE TELA CHEIA MOBILE ===
    const mobileFullscreenBtn = document.getElementById('mobileFullscreenBtn');
    if (mobileFullscreenBtn) {
        mobileFullscreenBtn.addEventListener('click', toggleFullscreen);
        mobileFullscreenBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            toggleFullscreen();
        }, { passive: false });
        console.log('📱 Botão de tela cheia mobile inicializado!');
    }
    
// Inicializar sistema de sons
    initializeSounds();
    
    // === NOVO: SISTEMA COMPLETO DE ADAPTAÇÃO MOBILE ===
    // Adaptar o jogo para dispositivos móveis
    adaptGameForMobile();
    
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
        
// === NOVA FUNCIONALIDADE: INTEGRAÇÃO COM BOTÕES MOBILE ===
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
<<<<<<< HEAD

// === SISTEMA DE IA AVANÇADA COM GOOGLE GEMINI ===

// Configuração da API do Gemini
const GEMINI_CONFIG = {
    API_KEY: 'AIzaSyBYzJOBZdXJ3awJMNxgkn-NbVqVEjQiJnE', // Sua chave da API
    API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    enabled: true,
    maxCacheSize: 150, // Aumentado para suportar mais dados
    cacheDuration: 45000, // 45 segundos
    requestCooldown: 800, // Reduzido para mais responsividade
    lastRequestTime: 0,
    // === NOVOS PARÂMETROS PARA GERAÇÃO PROCEDURAL ===
    obstacleGeneration: {
        enabled: true,
        frequency: 0.3, // 30% de chance por spawn
        complexityFactor: 1.0 // Multiplicador de complexidade
    },
    enemyShapeGeneration: {
        enabled: true,
        diversityLevel: 0.7, // Nível de diversidade de formas
        adaptToPlayerSkill: true
    }
};

// Cache de decisões da IA para melhorar performance
const aiDecisionCache = new Map();

// Sistema de contexto do jogo para a IA
let gameContext = {
    player: {
        x: 0, y: 0, health: 100, weapon: 'none', 
        moving: false, attacking: false, shielded: false
    },
    enemies: [],
    powerups: [],
    phase: 1,
    difficulty: 1,
    lastUpdate: 0
};

// Função para fazer request à API do Gemini
async function callGeminiAPI(prompt) {
    if (!GEMINI_CONFIG.enabled) {
        return null;
    }
    
    // Verificar cooldown
    const now = Date.now();
    if (now - GEMINI_CONFIG.lastRequestTime < GEMINI_CONFIG.requestCooldown) {
        return null;
    }
    
    try {
        const response = await fetch(`${GEMINI_CONFIG.API_URL}?key=${GEMINI_CONFIG.API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });
        
        if (!response.ok) {
            console.warn('⚠️ Erro na API do Gemini:', response.status);
            return null;
        }
        
        const data = await response.json();
        GEMINI_CONFIG.lastRequestTime = now;
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        }
        
        return null;
    } catch (error) {
        console.warn('⚠️ Erro ao chamar API do Gemini:', error);
        return null;
    }
}

// Função para atualizar contexto do jogo
function updateGameContext() {
    gameContext = {
        player: {
            x: Math.round(posX),
            y: Math.round(posY),
            health: playerHealth,
            weapon: weaponType,
            moving: moving,
            attacking: attacking,
            shielded: shieldActive || initialShieldActive
        },
        enemies: enemies.map(e => ({
            x: Math.round(e.x),
            y: Math.round(e.y),
            type: e.type,
            health: e.health,
            maxHealth: e.maxHealth
        })),
        powerups: powerups.map(p => ({
            x: Math.round(p.x),
            y: Math.round(p.y),
            type: p.type
        })),
        phase: gameState.currentPhase,
        difficulty: gameState.level,
        screenWidth: CANVAS_WIDTH,
        screenHeight: CANVAS_HEIGHT,
        lastUpdate: Date.now()
    };
}

// Função para gerar chave de cache baseada no estado
function generateCacheKey(enemy, action) {
    const playerPos = `${Math.floor(gameContext.player.x / 50)}x${Math.floor(gameContext.player.y / 50)}`;
    const enemyPos = `${Math.floor(enemy.x / 50)}x${Math.floor(enemy.y / 50)}`;
    const state = `${gameContext.player.weapon}_${gameContext.player.health > 50 ? 'healthy' : 'hurt'}_${gameContext.phase}`;
    return `${enemy.type}_${action}_${playerPos}_${enemyPos}_${state}`;
}

// Função para obter decisão da IA com cache
async function getAIDecision(enemy, action) {
    const cacheKey = generateCacheKey(enemy, action);
    
    // Verificar cache
    const cached = aiDecisionCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < GEMINI_CONFIG.cacheDuration) {
        return cached.decision;
    }
    
    // Preparar prompt contextual
    let prompt = createContextualPrompt(enemy, action);
    
    // Chamar API
    const response = await callGeminiAPI(prompt);
    if (response) {
        const decision = parseAIResponse(response, action);
        
        // Salvar no cache
        aiDecisionCache.set(cacheKey, {
            decision: decision,
            timestamp: Date.now()
        });
        
        // Limpar cache se ficou muito grande
        if (aiDecisionCache.size > GEMINI_CONFIG.maxCacheSize) {
            const oldestKey = aiDecisionCache.keys().next().value;
            aiDecisionCache.delete(oldestKey);
        }
        
        return decision;
    }
    
    return null;
}

// Função para criar prompt contextual para a IA
function createContextualPrompt(enemy, action) {
    const ctx = gameContext;
    
    let prompt = `Você é uma IA controlando um ${enemy.type === 'robot' ? 'robô combatente' : 'soldado'} no jogo Juliette Psicose 2D.

SITUAÇÃO ATUAL:
`;
    
    prompt += `- Jogador: posição (${ctx.player.x}, ${ctx.player.y}), vida ${ctx.player.health}%, arma ${ctx.player.weapon}
`;
    prompt += `- Inimigo: posição (${Math.round(enemy.x)}, ${Math.round(enemy.y)}), vida ${enemy.health}/${enemy.maxHealth}
`;
    prompt += `- Fase: ${ctx.phase}, Dificuldade: ${ctx.difficulty}
`;
    prompt += `- Jogador ${ctx.player.moving ? 'em movimento' : 'parado'}, ${ctx.player.attacking ? 'atacando' : 'não atacando'}
`;
    prompt += `- Jogador ${ctx.player.shielded ? 'tem escudo ativo' : 'sem escudo'}
`;
    
    if (ctx.powerups.length > 0) {
        prompt += `- Power-ups disponíveis: ${ctx.powerups.map(p => `${p.type} em (${p.x}, ${p.y})`).join(', ')}\n`;
    }
    
    switch (action) {
        case 'movement':
            prompt += `\nDECIDA O MOVIMENTO: Baseado na situação, qual seria a melhor estratégia de movimento?
Resposta em JSON: {"action": "move_left|move_right|move_up|move_down|hold_position|retreat|charge", "intensity": 1-5, "reason": "explicação"}`;
            break;
            
        case 'attack':
            prompt += `\nDECIDA O ATAQUE: Quando e como atacar?
Resposta em JSON: {"action": "shoot|burst_fire|wait|aim|special_attack", "target_x": ${ctx.player.x}, "target_y": ${ctx.player.y}, "urgency": 1-5, "reason": "explicação"}`;
            break;
            
        case 'strategy':
            prompt += `\nDECIDA A ESTRATÉGIA: Qual comportamento adotar?
Resposta em JSON: {"strategy": "aggressive|defensive|tactical|evasive|opportunistic", "priority": "attack|defense|positioning|powerup", "reason": "explicação"}`;
            break;
    }
    
    return prompt;
}

// Função para interpretar resposta da IA
function parseAIResponse(response, action) {
    try {
        // Tentar extrair JSON da resposta
        const jsonMatch = response.match(/\{[^}]+\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return { ...parsed, action_type: action };
        }
        
        // Fallback: interpretar resposta texto simples
        const fallback = {
            action_type: action,
            reason: response.substring(0, 100)
        };
        
        if (action === 'movement') {
            if (response.includes('esquerda') || response.includes('left')) fallback.action = 'move_left';
            else if (response.includes('direita') || response.includes('right')) fallback.action = 'move_right';
            else if (response.includes('cima') || response.includes('up')) fallback.action = 'move_up';
            else if (response.includes('baixo') || response.includes('down')) fallback.action = 'move_down';
            else if (response.includes('recuar') || response.includes('retreat')) fallback.action = 'retreat';
            else if (response.includes('atacar') || response.includes('charge')) fallback.action = 'charge';
            else fallback.action = 'hold_position';
            
            fallback.intensity = response.includes('rápido') || response.includes('urgente') ? 4 : 2;
        } else if (action === 'attack') {
            if (response.includes('atirar') || response.includes('shoot')) fallback.action = 'shoot';
            else if (response.includes('esperar') || response.includes('wait')) fallback.action = 'wait';
            else if (response.includes('mirar') || response.includes('aim')) fallback.action = 'aim';
            else fallback.action = 'shoot';
            
            fallback.urgency = response.includes('imediato') || response.includes('agora') ? 5 : 3;
        } else if (action === 'strategy') {
            if (response.includes('agressiv') || response.includes('aggressive')) fallback.strategy = 'aggressive';
            else if (response.includes('defensiv') || response.includes('defensive')) fallback.strategy = 'defensive';
            else if (response.includes('tático') || response.includes('tactical')) fallback.strategy = 'tactical';
            else if (response.includes('evasiv') || response.includes('evasive')) fallback.strategy = 'evasive';
            else fallback.strategy = 'opportunistic';
        }
        
        return fallback;
    } catch (error) {
        console.warn('⚠️ Erro ao interpretar resposta da IA:', error);
        return null;
    }
}

// Função principal para aplicar IA avançada aos inimigos
async function applyAdvancedAI(enemy) {
    if (!enemy || !GEMINI_CONFIG.enabled) return;
    
    // Atualizar contexto do jogo
    updateGameContext();
    
    // Aplicar decisões baseadas no tipo de inimigo
    if (enemy.type === 'robot') {
        await applyRobotAI(enemy);
    } else {
        await applySoldierAI(enemy);
    }
}

// IA específica para robôs (mais tática e defensiva)
async function applyRobotAI(enemy) {
    // Robôs são mais lentos mas mais inteligentes
    if (Math.random() < 0.3) { // 30% de chance de usar IA avançada
        const strategy = await getAIDecision(enemy, 'strategy');
        if (strategy) {
            applyRobotStrategy(enemy, strategy);
        }
    }
    
    // Decisões de movimento mais calculadas
    if (Math.random() < 0.2) {
        const movement = await getAIDecision(enemy, 'movement');
        if (movement) {
            applyMovementDecision(enemy, movement);
        }
    }
    
    // Ataques mais precisos
    if (enemy.shootCooldown === 0 && Math.random() < 0.15) {
        const attack = await getAIDecision(enemy, 'attack');
        if (attack) {
            applyAttackDecision(enemy, attack);
        }
    }
}

// IA específica para soldados (mais agressiva e rápida)
async function applySoldierAI(enemy) {
    // Soldados são mais rápidos e agressivos
    if (Math.random() < 0.4) { // 40% de chance de usar IA avançada
        const strategy = await getAIDecision(enemy, 'strategy');
        if (strategy) {
            applySoldierStrategy(enemy, strategy);
        }
    }
    
    // Movimentos mais impulsivos
    if (Math.random() < 0.3) {
        const movement = await getAIDecision(enemy, 'movement');
        if (movement) {
            applyMovementDecision(enemy, movement, 1.2); // Multiplicador de velocidade
        }
    }
    
    // Ataques mais frequentes
    if (enemy.shootCooldown === 0 && Math.random() < 0.25) {
        const attack = await getAIDecision(enemy, 'attack');
        if (attack) {
            applyAttackDecision(enemy, attack);
        }
    }
}

// Aplicar estratégia de robô
function applyRobotStrategy(enemy, strategy) {
    enemy.aiStrategy = strategy.strategy || 'defensive';
    enemy.aiPriority = strategy.priority || 'defense';
    
    switch (strategy.strategy) {
        case 'defensive':
            enemy.vx = Math.abs(enemy.vx) * -0.7; // Movimento mais lento e cauteloso
            enemy.shootChance *= 0.8; // Menos agressivo nos tiros
            break;
            
        case 'tactical':
            // Manter distância ideal para atirar
            const distance = Math.abs(enemy.x - gameContext.player.x);
            if (distance < 200) {
                enemy.vx = Math.abs(enemy.vx) * -0.5; // Recuar
            } else if (distance > 400) {
                enemy.vx = Math.abs(enemy.vx) * 0.8; // Aproximar
            }
            break;
            
        case 'aggressive':
            enemy.vx *= 1.5; // Movimento mais rápido
            enemy.shootChance *= 1.3; // Mais agressivo
            break;
    }
}

// Aplicar estratégia de soldado
function applySoldierStrategy(enemy, strategy) {
    enemy.aiStrategy = strategy.strategy || 'aggressive';
    enemy.aiPriority = strategy.priority || 'attack';
    
    switch (strategy.strategy) {
        case 'aggressive':
            enemy.vx *= 1.3;
            enemy.shootChance *= 1.4;
            break;
            
        case 'evasive':
            // Movimento vertical para evadir
            enemy.vy = Math.sin(Date.now() * 0.01) * 2;
            break;
            
        case 'opportunistic':
            // Focar em power-ups se jogador estiver longe
            const playerDistance = Math.abs(enemy.x - gameContext.player.x);
            if (playerDistance > 300 && gameContext.powerups.length > 0) {
                const nearestPowerup = gameContext.powerups[0];
                if (nearestPowerup.y < enemy.y) enemy.vy = -1;
                else if (nearestPowerup.y > enemy.y) enemy.vy = 1;
            }
            break;
    }
}

// Aplicar decisão de movimento
function applyMovementDecision(enemy, movement, speedMultiplier = 1) {
    const intensity = movement.intensity || 2;
    const speed = (intensity / 5) * 2 * speedMultiplier;
    
    switch (movement.action) {
        case 'move_left':
            enemy.vx = -speed;
            break;
        case 'move_right':
            enemy.vx = speed;
            break;
        case 'move_up':
            enemy.vy = -speed;
            break;
        case 'move_down':
            enemy.vy = speed;
            break;
        case 'retreat':
            enemy.vx = enemy.x > gameContext.player.x ? speed : -speed;
            break;
        case 'charge':
            enemy.vx = enemy.x > gameContext.player.x ? -speed * 1.5 : speed * 1.5;
            break;
        case 'hold_position':
            enemy.vx *= 0.5;
            enemy.vy *= 0.5;
            break;
    }
}

// Aplicar decisão de ataque
function applyAttackDecision(enemy, attack) {
    const urgency = attack.urgency || 3;
    
    switch (attack.action) {
        case 'shoot':
            if (enemy.shootCooldown === 0) {
                // Calcular direção para o jogador
                const dx = gameContext.player.x - enemy.x;
                const dy = gameContext.player.y - enemy.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0) {
                    const vx = (dx / distance) * 8;
                    const vy = (dy / distance) * 8;
                    
                    createEnemyBullet(enemy.x, enemy.y, vx, vy);
                    enemy.shootCooldown = Math.max(20, 80 - urgency * 10);
                    
                    // Efeito visual de mira inteligente
                    for (let i = 0; i < 3; i++) {
                        particles.push({
                            x: enemy.x + (Math.random() - 0.5) * 10,
                            y: enemy.y + (Math.random() - 0.5) * 10,
                            vx: vx * 0.3,
                            vy: vy * 0.3,
                            life: 15,
                            color: enemy.type === 'robot' ? '#00FFFF' : '#FF4040',
                            size: 2
                        });
                    }
                }
            }
            break;
            
        case 'burst_fire':
            if (enemy.shootCooldown === 0 && urgency >= 4) {
                // Tiro triplo
                for (let i = -1; i <= 1; i++) {
                    const angle = Math.atan2(gameContext.player.y - enemy.y, gameContext.player.x - enemy.x) + i * 0.2;
                    const vx = Math.cos(angle) * 8;
                    const vy = Math.sin(angle) * 8;
                    
                    createEnemyBullet(enemy.x, enemy.y, vx, vy);
                }
                enemy.shootCooldown = 100;
            }
            break;
            
        case 'aim':
            // Reduzir cooldown para próximo tiro mais preciso
            enemy.shootCooldown = Math.max(0, enemy.shootCooldown - 5);
            enemy.aimingBonus = true;
            break;
            
        case 'wait':
            // Aumentar cooldown, estratégia defensiva
            enemy.shootCooldown = Math.max(enemy.shootCooldown, 40);
            break;
    }
}

// Limpar cache periodicamente
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of aiDecisionCache.entries()) {
        if (now - value.timestamp > GEMINI_CONFIG.cacheDuration * 2) {
            aiDecisionCache.delete(key);
        }
    }
    
    if (aiDecisionCache.size === 0) {
        console.log('🤖 Cache de IA limpo');
    }
}, 60000); // Limpar a cada minuto

// === SISTEMA DE GERAÇÃO PROCEDURAL COM GEMINI ===

// Configuração para geração procedural
const PROCEDURAL_CONFIG = {
    obstacleShapes: ['circle', 'triangle', 'square', 'hexagon', 'star', 'diamond', 'oval', 'plus'],
    enemyShapes: ['circle', 'triangle', 'square', 'hexagon', 'pentagon', 'octagon', 'diamond', 'cross'],
    colors: ['#FF4444', '#44FF44', '#4444FF', '#FFFF44', '#FF44FF', '#44FFFF', '#FF8844', '#8844FF'],
    complexity: {
        simple: 3, // Lados/pontos mínimos
        complex: 8  // Lados/pontos máximos
    },
    generationInterval: 5000, // 5 segundos entre gerações
    lastGeneration: 0
};

// Arrays para armazenar elementos procedurais
const proceduralObstacles = [];
const proceduralEnemies = [];
const shapeDefinitions = new Map();

// === FUNÇÃO PRINCIPAL DE GERAÇÃO PROCEDURAL ===
async function generateProceduralContent() {
    if (!GEMINI_CONFIG.enabled) return;
    
    const now = Date.now();
    if (now - PROCEDURAL_CONFIG.lastGeneration < PROCEDURAL_CONFIG.generationInterval) {
        return;
    }
    
    PROCEDURAL_CONFIG.lastGeneration = now;
    
    try {
        // Gerar obstáculos se necessário
        if (proceduralObstacles.length < 3 && Math.random() < GEMINI_CONFIG.obstacleGeneration.frequency) {
            await generateProceduralObstacle();
        }
        
        // Gerar inimigos se necessário
        if (enemies.length < MAX_ENEMIES * 0.7 && Math.random() < 0.4) {
            await generateProceduralEnemy();
        }
    } catch (error) {
        console.warn('⚠️ Erro na geração procedural:', error);
    }
}

// === GERAÇÃO DE OBSTÁCULOS PROCEDURAIS ===
async function generateProceduralObstacle() {
    const prompt = createObstacleGenerationPrompt();
    const aiResponse = await callGeminiAPI(prompt);
    
    if (aiResponse) {
        const obstacleData = parseObstacleResponse(aiResponse);
        if (obstacleData) {
            createProceduralObstacle(obstacleData);
            console.log('🔧 Obstáculo procedural gerado:', obstacleData.shape);
        }
    }
}

// Criar prompt para geração de obstáculos
function createObstacleGenerationPrompt() {
    const gameInfo = {
        phase: gameState.currentPhase,
        playerHealth: playerHealth,
        playerWeapon: weaponType,
        difficulty: gameState.level,
        existingObstacles: proceduralObstacles.length,
        screenWidth: CANVAS_WIDTH,
        screenHeight: CANVAS_HEIGHT
    };
    
    return `Você é um gerador de obstáculos para o jogo Juliette Psicose 2D. 

CONTEXTO DO JOGO:
- Fase: ${gameInfo.phase}
- Nível de dificuldade: ${gameInfo.difficulty}
- Vida do jogador: ${gameInfo.playerHealth}%
- Arma atual: ${gameInfo.playerWeapon}
- Obstáculos existentes: ${gameInfo.existingObstacles}
- Área do jogo: ${gameInfo.screenWidth}x${gameInfo.screenHeight}

GERE UM OBSTÁCULO GEOMÉTRICO:
Formas disponíveis: ${PROCEDURAL_CONFIG.obstacleShapes.join(', ')}
Cores disponíveis: ${PROCEDURAL_CONFIG.colors.join(', ')}

O obstáculo deve:
1. Ter uma forma geométrica interessante
2. Ser proporcional à dificuldade atual
3. Não ser muito fácil nem impossível de superar
4. Ter propriedades únicas baseadas na situação

Resposta em JSON:
{
  "shape": "circle|triangle|square|hexagon|star|diamond|oval|plus",
  "size": 30-100,
  "color": "cor_hex",
  "behavior": "static|rotating|pulsing|moving",
  "special_effect": "none|electric|magnetic|explosive|healing",
  "difficulty_rating": 1-10,
  "description": "descrição criativa do obstáculo"
}`;
}

// Interpretar resposta de obstáculo
function parseObstacleResponse(response) {
    try {
        const jsonMatch = response.match(/{[^}]*}/s);
        if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            
            // Validar e ajustar dados
            return {
                shape: data.shape || PROCEDURAL_CONFIG.obstacleShapes[Math.floor(Math.random() * PROCEDURAL_CONFIG.obstacleShapes.length)],
                size: Math.max(30, Math.min(100, data.size || 50)),
                color: data.color || PROCEDURAL_CONFIG.colors[Math.floor(Math.random() * PROCEDURAL_CONFIG.colors.length)],
                behavior: data.behavior || 'static',
                specialEffect: data.special_effect || 'none',
                difficultyRating: Math.max(1, Math.min(10, data.difficulty_rating || 5)),
                description: data.description || 'Obstáculo geométrico'
            };
        }
    } catch (error) {
        console.warn('⚠️ Erro ao interpretar resposta de obstáculo:', error);
    }
    
    // Fallback: gerar obstáculo aleatório
    return generateRandomObstacle();
}

// Gerar obstáculo aleatório (fallback)
function generateRandomObstacle() {
    return {
        shape: PROCEDURAL_CONFIG.obstacleShapes[Math.floor(Math.random() * PROCEDURAL_CONFIG.obstacleShapes.length)],
        size: 30 + Math.random() * 40,
        color: PROCEDURAL_CONFIG.colors[Math.floor(Math.random() * PROCEDURAL_CONFIG.colors.length)],
        behavior: ['static', 'rotating', 'pulsing'][Math.floor(Math.random() * 3)],
        specialEffect: ['none', 'electric', 'magnetic'][Math.floor(Math.random() * 3)],
        difficultyRating: Math.floor(Math.random() * 5) + gameState.level,
        description: 'Obstáculo gerado aleatoriamente'
    };
}

// Criar obstáculo procedural no jogo
function createProceduralObstacle(data) {
    const obstacle = {
        id: `obstacle_${Date.now()}`,
        ...data,
        x: CANVAS_WIDTH + 100 + Math.random() * 200, // Spawna fora da tela à direita
        y: Math.random() * (CANVAS_HEIGHT - 200) + 100, // Altura aleatória
        vx: -1 - Math.random() * 2, // Movimento para esquerda
        vy: 0,
        rotation: 0,
        rotationSpeed: data.behavior === 'rotating' ? (Math.random() - 0.5) * 0.1 : 0,
        pulsePhase: 0,
        life: 600 + Math.random() * 300, // Vida útil
        maxLife: 600 + Math.random() * 300,
        health: data.difficultyRating * 10,
        maxHealth: data.difficultyRating * 10,
        particles: [],
        lastEffect: 0
    };
    
    // Registrar definição da forma se não existe
    if (!shapeDefinitions.has(data.shape)) {
        registerShapeDefinition(data.shape);
    }
    
    proceduralObstacles.push(obstacle);
}

// === GERAÇÃO DE INIMIGOS PROCEDURAIS ===
async function generateProceduralEnemy() {
    const prompt = createEnemyGenerationPrompt();
    const aiResponse = await callGeminiAPI(prompt);
    
    if (aiResponse) {
        const enemyData = parseEnemyResponse(aiResponse);
        if (enemyData) {
            createProceduralEnemy(enemyData);
            console.log('👾 Inimigo procedural gerado:', enemyData.shape);
        }
    }
}

// Criar prompt para geração de inimigos
function createEnemyGenerationPrompt() {
    const playerSkillEstimate = calculatePlayerSkill();
    
    return `Você é um gerador de inimigos para o jogo Juliette Psicose 2D.

CONTEXTO ATUAL:
- Fase: ${gameState.currentPhase}
- Nível: ${gameState.level}
- Habilidade estimada do jogador: ${playerSkillEstimate}/10
- Vida do jogador: ${playerHealth}%
- Arma: ${weaponType}
- Inimigos ativos: ${enemies.length}/${MAX_ENEMIES}
- Tempo de jogo: ${Math.floor(gameState.timeInGame / 60)} minutos

GERE UM INIMIGO COM FORMA GEOMÉTRICA:
Formas: ${PROCEDURAL_CONFIG.enemyShapes.join(', ')}

O inimigo deve:
1. Ter desafio apropriado para a habilidade do jogador
2. Forma geométrica interessante e única
3. Comportamento inteligente
4. Balanceamento adequado

Resposta em JSON:
{
  "shape": "circle|triangle|square|hexagon|pentagon|octagon|diamond|cross",
  "size": 15-50,
  "color": "cor_hex",
  "health": 20-150,
  "speed": 0.5-4,
  "attack_pattern": "linear|curved|burst|spiral|homing",
  "ai_behavior": "aggressive|defensive|tactical|erratic|adaptive",
  "special_ability": "none|shield|teleport|split|regenerate|camouflage",
  "difficulty_score": 1-10,
  "description": "descrição do inimigo"
}`;
}

// Calcular habilidade estimada do jogador
function calculatePlayerSkill() {
    let skillScore = 5; // Base
    
    // Baseado no tempo sobrevivido
    skillScore += Math.min(3, gameState.timeInGame / 120); // +3 para 4+ minutos
    
    // Baseado na pontuação
    skillScore += Math.min(2, gameState.score / 5000); // +2 para 10k+ pontos
    
    // Baseado na vida atual
    if (playerHealth > 80) skillScore += 1;
    else if (playerHealth < 30) skillScore -= 1;
    
    // Baseado na arma
    const weaponSkill = {
        'none': -2, 'normal': 0, 'spread': 1, 'laser': 1.5,
        'machine': 2, 'plasma': 2.5, 'storm': 3, 'nuclear': 3.5
    };
    skillScore += weaponSkill[weaponType] || 0;
    
    return Math.max(1, Math.min(10, Math.round(skillScore)));
}

// Interpretar resposta de inimigo
function parseEnemyResponse(response) {
    try {
        const jsonMatch = response.match(/{[^}]*}/s);
        if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            
            return {
                shape: data.shape || PROCEDURAL_CONFIG.enemyShapes[Math.floor(Math.random() * PROCEDURAL_CONFIG.enemyShapes.length)],
                size: Math.max(15, Math.min(50, data.size || 25)),
                color: data.color || PROCEDURAL_CONFIG.colors[Math.floor(Math.random() * PROCEDURAL_CONFIG.colors.length)],
                health: Math.max(20, Math.min(150, data.health || 50)),
                speed: Math.max(0.5, Math.min(4, data.speed || 2)),
                attackPattern: data.attack_pattern || 'linear',
                aiBehavior: data.ai_behavior || 'aggressive',
                specialAbility: data.special_ability || 'none',
                difficultyScore: Math.max(1, Math.min(10, data.difficulty_score || 5)),
                description: data.description || 'Inimigo geométrico'
            };
        }
    } catch (error) {
        console.warn('⚠️ Erro ao interpretar resposta de inimigo:', error);
    }
    
    // Fallback: gerar inimigo aleatório
    return generateRandomEnemy();
}

// Gerar inimigo aleatório (fallback)
function generateRandomEnemy() {
    return {
        shape: PROCEDURAL_CONFIG.enemyShapes[Math.floor(Math.random() * PROCEDURAL_CONFIG.enemyShapes.length)],
        size: 15 + Math.random() * 25,
        color: PROCEDURAL_CONFIG.colors[Math.floor(Math.random() * PROCEDURAL_CONFIG.colors.length)],
        health: 30 + Math.random() * 60,
        speed: 1 + Math.random() * 2,
        attackPattern: ['linear', 'curved', 'burst'][Math.floor(Math.random() * 3)],
        aiBehavior: ['aggressive', 'defensive', 'tactical'][Math.floor(Math.random() * 3)],
        specialAbility: ['none', 'shield', 'split'][Math.floor(Math.random() * 3)],
        difficultyScore: Math.floor(Math.random() * 5) + 3,
        description: 'Inimigo gerado aleatoriamente'
    };
}

// Criar inimigo procedural no jogo
function createProceduralEnemy(data) {
    const enemy = {
        id: `enemy_${Date.now()}`,
        x: CANVAS_WIDTH + 50,
        y: Math.random() * (CANVAS_HEIGHT - 200) + 100,
        vx: -data.speed,
        vy: 0,
        health: data.health,
        maxHealth: data.health,
        damage: Math.floor(data.difficultyScore * 3),
        color: data.color,
        size: data.size,
        type: 'procedural',
        shape: data.shape,
        attackPattern: data.attackPattern,
        aiBehavior: data.aiBehavior,
        specialAbility: data.specialAbility,
        shootChance: 0.01 + (data.difficultyScore / 1000),
        shootCooldown: 0,
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 0.05,
        specialCooldown: 0,
        lastSpecialUse: 0,
        // Propriedades específicas do comportamento
        targetX: gameContext.player ? gameContext.player.x : posX,
        targetY: gameContext.player ? gameContext.player.y : posY,
        patrolDirection: Math.random() > 0.5 ? 1 : -1,
        // Sistema de átomos orbitantes adaptado
        atomOrbs: {
            count: Math.floor(data.difficultyScore / 2) + 2,
            orbs: [],
            rotationSpeed: 0.03,
            radius: data.size + 15,
            initialized: false
        }
    };
    
    // Registrar definição da forma
    if (!shapeDefinitions.has(data.shape)) {
        registerShapeDefinition(data.shape);
    }
    
    // Inicializar átomos orbitantes
    initializeEnemyAtoms(enemy);
    
    // Adicionar às listas apropriadas
    enemies.push(enemy);
    proceduralEnemies.push(enemy);
}

// === SISTEMA DE DEFINIÇÕES DE FORMAS GEOMÉTRICAS ===

// Registrar definição de forma geométrica
function registerShapeDefinition(shapeName) {
    const definitions = {
        circle: {
            draw: (ctx, x, y, size) => {
                ctx.beginPath();
                ctx.arc(x, y, size/2, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }
        },
        triangle: {
            draw: (ctx, x, y, size) => {
                const height = size * 0.866; // Altura de triângulo equilátero
                ctx.beginPath();
                ctx.moveTo(x, y - height/2);
                ctx.lineTo(x - size/2, y + height/2);
                ctx.lineTo(x + size/2, y + height/2);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
        },
        square: {
            draw: (ctx, x, y, size) => {
                ctx.fillRect(x - size/2, y - size/2, size, size);
                ctx.strokeRect(x - size/2, y - size/2, size, size);
            }
        },
        hexagon: {
            draw: (ctx, x, y, size) => {
                drawPolygon(ctx, x, y, size/2, 6);
            }
        },
        pentagon: {
            draw: (ctx, x, y, size) => {
                drawPolygon(ctx, x, y, size/2, 5);
            }
        },
        octagon: {
            draw: (ctx, x, y, size) => {
                drawPolygon(ctx, x, y, size/2, 8);
            }
        },
        diamond: {
            draw: (ctx, x, y, size) => {
                ctx.beginPath();
                ctx.moveTo(x, y - size/2);
                ctx.lineTo(x + size/2, y);
                ctx.lineTo(x, y + size/2);
                ctx.lineTo(x - size/2, y);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
        },
        star: {
            draw: (ctx, x, y, size) => {
                drawStar(ctx, x, y, 5, size/2, size/4);
            }
        },
        cross: {
            draw: (ctx, x, y, size) => {
                const thickness = size/4;
                // Cruz horizontal
                ctx.fillRect(x - size/2, y - thickness/2, size, thickness);
                // Cruz vertical
                ctx.fillRect(x - thickness/2, y - size/2, thickness, size);
                // Bordas
                ctx.strokeRect(x - size/2, y - thickness/2, size, thickness);
                ctx.strokeRect(x - thickness/2, y - size/2, thickness, size);
            }
        },
        oval: {
            draw: (ctx, x, y, size) => {
                ctx.beginPath();
                ctx.ellipse(x, y, size/2, size/3, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }
        },
        plus: {
            draw: (ctx, x, y, size) => {
                const thickness = size/5;
                ctx.fillRect(x - size/2, y - thickness/2, size, thickness);
                ctx.fillRect(x - thickness/2, y - size/2, thickness, size);
                ctx.strokeRect(x - size/2, y - thickness/2, size, thickness);
                ctx.strokeRect(x - thickness/2, y - size/2, thickness, size);
            }
        }
    };
    
    if (definitions[shapeName]) {
        shapeDefinitions.set(shapeName, definitions[shapeName]);
    }
}

// Função auxiliar para desenhar polígonos
function drawPolygon(ctx, x, y, radius, sides) {
    const angle = (Math.PI * 2) / sides;
    
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
        const vertexX = x + radius * Math.cos(i * angle - Math.PI / 2);
        const vertexY = y + radius * Math.sin(i * angle - Math.PI / 2);
        
        if (i === 0) {
            ctx.moveTo(vertexX, vertexY);
        } else {
            ctx.lineTo(vertexX, vertexY);
        }
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

// Função auxiliar para desenhar estrelas
function drawStar(ctx, x, y, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    const step = Math.PI / spikes;
    
    ctx.beginPath();
    ctx.moveTo(x, y - outerRadius);
    
    for (let i = 0; i < spikes; i++) {
        const outerX = x + Math.cos(rot) * outerRadius;
        const outerY = y + Math.sin(rot) * outerRadius;
        ctx.lineTo(outerX, outerY);
        rot += step;
        
        const innerX = x + Math.cos(rot) * innerRadius;
        const innerY = y + Math.sin(rot) * innerRadius;
        ctx.lineTo(innerX, innerY);
        rot += step;
    }
    
    ctx.lineTo(x, y - outerRadius);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

// === ATUALIZAÇÃO E RENDERIZAÇÃO DE ELEMENTOS PROCEDURAIS ===

// Atualizar obstáculos procedurais
function updateProceduralObstacles() {
    for (let i = proceduralObstacles.length - 1; i >= 0; i--) {
        const obstacle = proceduralObstacles[i];
        
        // Movimento
        obstacle.x += obstacle.vx;
        obstacle.y += obstacle.vy;
        
        // Comportamentos especiais
        updateObstacleBehavior(obstacle);
        
        // Efeitos especiais
        updateObstacleEffects(obstacle);
        
        // Remover se saiu da tela ou morreu
        if (obstacle.x < -100 || obstacle.health <= 0 || obstacle.life <= 0) {
            proceduralObstacles.splice(i, 1);
            continue;
        }
        
        obstacle.life--;
    }
}

// Atualizar comportamento do obstáculo
function updateObstacleBehavior(obstacle) {
    switch (obstacle.behavior) {
        case 'rotating':
            obstacle.rotation += obstacle.rotationSpeed;
            break;
            
        case 'pulsing':
            obstacle.pulsePhase += 0.05;
            break;
            
        case 'moving':
            // Movimento senoidal
            obstacle.y += Math.sin(Date.now() * 0.003 + obstacle.id.charCodeAt(0)) * 2;
            break;
    }
}

// Atualizar efeitos especiais do obstáculo
function updateObstacleEffects(obstacle) {
    const now = Date.now();
    
    switch (obstacle.specialEffect) {
        case 'electric':
            if (now - obstacle.lastEffect > 100) {
                // Criar faíscas elétricas
                for (let i = 0; i < 2; i++) {
                    obstacle.particles.push({
                        x: obstacle.x + (Math.random() - 0.5) * obstacle.size,
                        y: obstacle.y + (Math.random() - 0.5) * obstacle.size,
                        vx: (Math.random() - 0.5) * 4,
                        vy: (Math.random() - 0.5) * 4,
                        life: 10,
                        color: '#FFFF00',
                        size: 2
                    });
                }
                obstacle.lastEffect = now;
            }
            break;
            
        case 'magnetic':
            // Atração/repulsão com balas próximas
            bullets.forEach(bullet => {
                if (bullet.type !== 'enemy') {
                    const dx = bullet.x - obstacle.x;
                    const dy = bullet.y - obstacle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < obstacle.size * 2) {
                        const force = 0.3;
                        bullet.vx += (dx / distance) * force;
                        bullet.vy += (dy / distance) * force;
                    }
                }
            });
            break;
    }
    
    // Atualizar partículas do obstáculo
    for (let i = obstacle.particles.length - 1; i >= 0; i--) {
        const particle = obstacle.particles[i];
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life--;
        
        if (particle.life <= 0) {
            obstacle.particles.splice(i, 1);
        }
    }
}

// Atualizar inimigos procedurais
function updateProceduralEnemies() {
    proceduralEnemies.forEach(enemy => {
        updateProceduralEnemyBehavior(enemy);
        updateProceduralEnemyAttack(enemy);
        updateProceduralEnemySpecialAbility(enemy);
    });
}

// Atualizar comportamento do inimigo procedural
function updateProceduralEnemyBehavior(enemy) {
    switch (enemy.aiBehavior) {
        case 'adaptive':
            // Adaptar comportamento baseado na situação
            const playerDistance = Math.abs(enemy.x - (gameContext.player?.x || posX));
            if (playerDistance < 150) {
                enemy.vx = enemy.vx > 0 ? -Math.abs(enemy.vx) * 0.8 : enemy.vx; // Recuar
            } else if (playerDistance > 300) {
                enemy.vx = enemy.vx < 0 ? -Math.abs(enemy.vx) * 1.2 : enemy.vx; // Avançar
            }
            break;
            
        case 'erratic':
            // Movimento imprevisível
            if (Math.random() < 0.05) {
                enemy.vy = (Math.random() - 0.5) * 3;
                enemy.vx *= (Math.random() * 0.6 + 0.7);
            }
            break;
            
        case 'tactical':
            // Posicionamento estratégico
            const optimalDistance = 200;
            const currentDistance = Math.abs(enemy.x - (gameContext.player?.x || posX));
            
            if (currentDistance < optimalDistance - 50) {
                enemy.vx = Math.abs(enemy.vx) * -0.7; // Afastar
            } else if (currentDistance > optimalDistance + 50) {
                enemy.vx = Math.abs(enemy.vx) * 0.9; // Aproximar
            }
            break;
    }
    
    // Rotação baseada na forma
    enemy.rotation += enemy.rotationSpeed;
}

// Atualizar padrão de ataque do inimigo procedural
function updateProceduralEnemyAttack(enemy) {
    if (enemy.shootCooldown > 0) {
        enemy.shootCooldown--;
        return;
    }
    
    if (Math.random() > enemy.shootChance) return;
    
    const playerX = gameContext.player?.x || posX;
    const playerY = gameContext.player?.y || posY;
    
    switch (enemy.attackPattern) {
        case 'linear':
            // Tiro direto
            createEnemyBullet(enemy.x, enemy.y, -6, 0);
            enemy.shootCooldown = 60;
            break;
            
        case 'curved':
            // Tiro com curva
            const dx = playerX - enemy.x;
            const dy = playerY - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                const vx = (dx / distance) * 5;
                const vy = (dy / distance) * 5;
                createEnemyBullet(enemy.x, enemy.y, vx, vy);
            }
            enemy.shootCooldown = 45;
            break;
            
        case 'burst':
            // Rajada de tiros
            for (let i = -1; i <= 1; i++) {
                const angle = Math.atan2(playerY - enemy.y, playerX - enemy.x) + i * 0.3;
                const vx = Math.cos(angle) * 6;
                const vy = Math.sin(angle) * 6;
                createEnemyBullet(enemy.x, enemy.y, vx, vy);
            }
            enemy.shootCooldown = 90;
            break;
            
        case 'spiral':
            // Tiro em espiral
            const spiralAngle = Date.now() * 0.01;
            for (let i = 0; i < 3; i++) {
                const angle = spiralAngle + i * Math.PI * 2 / 3;
                const vx = Math.cos(angle) * 4;
                const vy = Math.sin(angle) * 4;
                createEnemyBullet(enemy.x, enemy.y, vx, vy);
            }
            enemy.shootCooldown = 70;
            break;
            
        case 'homing':
            // Tiro que segue o jogador (implementar lógica de homing nas balas)
            const homingBullet = {
                x: enemy.x,
                y: enemy.y,
                vx: -4,
                vy: 0,
                damage: enemy.damage,
                color: enemy.color,
                type: 'enemy',
                size: 4,
                life: 120,
                homing: true,
                target: { x: playerX, y: playerY }
            };
            bullets.push(homingBullet);
            enemy.shootCooldown = 80;
            break;
    }
}

// Atualizar habilidade especial do inimigo procedural
function updateProceduralEnemySpecialAbility(enemy) {
    const now = Date.now();
    
    if (now - enemy.lastSpecialUse < 3000) return; // Cooldown de 3 segundos
    
    switch (enemy.specialAbility) {
        case 'teleport':
            if (Math.random() < 0.02) { // 2% de chance por frame
                enemy.x = CANVAS_WIDTH * 0.7 + Math.random() * (CANVAS_WIDTH * 0.2);
                enemy.y = Math.random() * (CANVAS_HEIGHT - 100) + 50;
                
                // Efeito visual de teleporte
                for (let i = 0; i < 10; i++) {
                    particles.push({
                        x: enemy.x + (Math.random() - 0.5) * 30,
                        y: enemy.y + (Math.random() - 0.5) * 30,
                        vx: (Math.random() - 0.5) * 6,
                        vy: (Math.random() - 0.5) * 6,
                        life: 20,
                        color: enemy.color,
                        size: 3
                    });
                }
                
                enemy.lastSpecialUse = now;
            }
            break;
            
        case 'split':
            if (enemy.health < enemy.maxHealth * 0.3 && Math.random() < 0.05) {
                // Dividir em inimigos menores
                for (let i = 0; i < 2; i++) {
                    const splitEnemy = {
                        ...enemy,
                        x: enemy.x + (i === 0 ? -20 : 20),
                        health: enemy.health / 3,
                        maxHealth: enemy.maxHealth / 3,
                        size: enemy.size * 0.7,
                        specialAbility: 'none', // Evitar split infinito
                        id: `${enemy.id}_split_${i}`
                    };
                    enemies.push(splitEnemy);
                }
                
                // Remover inimigo original
                const index = enemies.indexOf(enemy);
                if (index > -1) enemies.splice(index, 1);
                
                const procIndex = proceduralEnemies.indexOf(enemy);
                if (procIndex > -1) proceduralEnemies.splice(procIndex, 1);
                
                enemy.lastSpecialUse = now;
            }
            break;
            
        case 'regenerate':
            if (Math.random() < 0.01 && enemy.health < enemy.maxHealth) {
                enemy.health = Math.min(enemy.maxHealth, enemy.health + 2);
                
                // Efeito visual de regeneração
                particles.push({
                    x: enemy.x,
                    y: enemy.y,
                    vx: 0,
                    vy: -1,
                    life: 30,
                    color: '#00FF00',
                    size: 4
                });
            }
            break;
    }
}

// === RENDERIZAÇÃO DE ELEMENTOS PROCEDURAIS ===

// Desenhar obstáculos procedurais
function drawProceduralObstacles() {
    for (const obstacle of proceduralObstacles) {
        drawProceduralObstacle(obstacle);
    }
}

// Desenhar obstáculo individual
function drawProceduralObstacle(obstacle) {
    const shapeDef = shapeDefinitions.get(obstacle.shape);
    if (!shapeDef) return;
    
    ctx.save();
    
    // Aplicar transformações
    ctx.translate(obstacle.x, obstacle.y);
    ctx.rotate(obstacle.rotation);
    
    // Efeito de pulso
    let currentSize = obstacle.size;
    if (obstacle.behavior === 'pulsing') {
        currentSize *= (1 + Math.sin(obstacle.pulsePhase) * 0.3);
    }
    
    // Configurar estilo
    ctx.fillStyle = obstacle.color;
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    
    // Efeito especial de cor
    if (obstacle.specialEffect === 'electric') {
        const glowIntensity = Math.sin(Date.now() * 0.02) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(255, 255, 0, ${glowIntensity})`;
        ctx.shadowColor = '#FFFF00';
        ctx.shadowBlur = 10;
    }
    
    // Desenhar forma
    shapeDef.draw(ctx, 0, 0, currentSize);
    
    ctx.restore();
    
    // Desenhar partículas do obstáculo
    for (const particle of obstacle.particles) {
        ctx.save();
        ctx.globalAlpha = particle.life / 10;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    
    // Barra de vida se tiver vida dinâmica
    if (obstacle.health < obstacle.maxHealth) {
        const healthPercent = obstacle.health / obstacle.maxHealth;
        const barWidth = obstacle.size;
        const barHeight = 4;
        const barX = obstacle.x - barWidth / 2;
        const barY = obstacle.y - obstacle.size / 2 - 10;
        
        ctx.fillStyle = 'rgba(200, 0, 0, 0.8)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
    }
}

// Desenhar inimigos procedurais (override da função de inimigos normais)
function drawProceduralEnemies() {
    proceduralEnemies.forEach(enemy => {
        drawProceduralEnemy(enemy);
    });
}

// Desenhar inimigo procedural individual
function drawProceduralEnemy(enemy) {
    const shapeDef = shapeDefinitions.get(enemy.shape);
    if (!shapeDef) {
        // Fallback para quadrado
        drawEnemyFallback(enemy);
        return;
    }
    
    ctx.save();
    
    // Desenhar átomos orbitantes primeiro (atrás do inimigo)
    drawEnemyAtoms(enemy);
    
    // Configurações de renderização
    ctx.translate(enemy.x + enemy.size / 2, enemy.y + enemy.size / 2);
    ctx.rotate(enemy.rotation);
    
    // Configurar cores e efeitos
    const time = Date.now() * 0.008;
    const glowIntensity = Math.sin(time * 2 + enemy.x * 0.01) * 0.3 + 0.7;
    
    ctx.fillStyle = enemy.color;
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    
    // Efeitos especiais por habilidade
    if (enemy.specialAbility === 'shield' && enemy.health > enemy.maxHealth * 0.5) {
        ctx.shadowColor = '#00FFFF';
        ctx.shadowBlur = 10 * glowIntensity;
    } else if (enemy.specialAbility === 'camouflage') {
        const alphaVariation = Math.sin(time * 4) * 0.3 + 0.7;
        ctx.globalAlpha = alphaVariation;
    }
    
    // Desenhar forma principal
    shapeDef.draw(ctx, 0, 0, enemy.size);
    
    // Indicador de habilidade especial
    if (enemy.specialAbility !== 'none') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        const abilityIcon = getSpecialAbilityIcon(enemy.specialAbility);
        ctx.fillText(abilityIcon, 0, -enemy.size / 2 - 15);
    }
    
    ctx.restore();
    
    // Barra de vida
    drawEnemyHealthBar(enemy);
}

// Fallback para inimigos sem forma definida
function drawEnemyFallback(enemy) {
    ctx.fillStyle = enemy.color;
    ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);
    ctx.strokeStyle = 'white';
    ctx.strokeRect(enemy.x, enemy.y, enemy.size, enemy.size);
}

// Obter ícone da habilidade especial
function getSpecialAbilityIcon(ability) {
    const icons = {
        'shield': '🛡️',
        'teleport': '⚡',
        'split': '💥',
        'regenerate': '❤️',
        'camouflage': '👻',
        'none': ''
    };
    return icons[ability] || '?';
}

// Desenhar barra de vida do inimigo
function drawEnemyHealthBar(enemy) {
    const healthPercent = enemy.health / enemy.maxHealth;
    const barWidth = enemy.size + 4;
    const barHeight = 4;
    const barX = enemy.x - 2;
    const barY = enemy.y - 10;
    
    // Fundo da barra
    ctx.fillStyle = 'rgba(200, 0, 0, 0.8)';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // Barra de vida
    const healthColor = healthPercent > 0.6 ? '#00FF00' : 
                       healthPercent > 0.3 ? '#FFFF00' : '#FF0000';
    ctx.fillStyle = healthColor;
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
    
    // Borda
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
}

// Verificar colisões com obstáculos procedurais
function checkProceduralObstacleCollisions() {
    const playerRect = {
        x: posX,
        y: posY,
        width: frameWidth * scale,
        height: frameHeight * scale
    };
    
    for (let i = proceduralObstacles.length - 1; i >= 0; i--) {
        const obstacle = proceduralObstacles[i];
        
        // Colisão com balas do jogador
        for (let j = bullets.length - 1; j >= 0; j--) {
            const bullet = bullets[j];
            if (bullet.type !== 'enemy') {
                const distance = Math.sqrt(
                    Math.pow(bullet.x - obstacle.x, 2) + 
                    Math.pow(bullet.y - obstacle.y, 2)
                );
                
                if (distance < obstacle.size / 2 + bullet.size) {
                    // Obstáculo foi atingido
                    obstacle.health -= bullet.damage || 20;
                    bullets.splice(j, 1);
                    
                    // Efeito visual de impacto
                    createExplosion(obstacle.x, obstacle.y, 20);
                    
                    // Som de impacto
                    playSound('enemyHit', 500, 100);
                    
                    if (obstacle.health <= 0) {
                        // Obstáculo destruído
                        gameState.score += obstacle.difficultyRating * 25;
                        createExplosion(obstacle.x, obstacle.y, obstacle.size);
                        
                        // Chance de dropar power-up
                        if (Math.random() < 0.2) {
                            createPowerup(obstacle.x, obstacle.y);
                        }
                        
                        proceduralObstacles.splice(i, 1);
                        playSound('enemyDestroy', 400, 200);
                    }
                    break;
                }
            }
        }
        
        // Colisão com jogador
        const distance = Math.sqrt(
            Math.pow(playerRect.x + playerRect.width/2 - obstacle.x, 2) + 
            Math.pow(playerRect.y + playerRect.height/2 - obstacle.y, 2)
        );
        
        if (distance < obstacle.size / 2 + Math.min(playerRect.width, playerRect.height) / 2) {
            // Jogador colidiu com obstáculo
            if (!invulnerable && !initialShieldActive && !shieldActive) {
                playerHealth -= obstacle.difficultyRating * 5;
                invulnerable = true;
                invulnerableTime = 60;
                
                playSound('playerHit', 250, 300);
                
                if (playerHealth <= 0) {
                    gameState.lives--;
                    if (gameState.lives <= 0) {
                        gameState.gameOver = true;
                    } else {
                        playerHealth = 100;
                    }
                }
            }
        }
    }
}

// Inicializar definições de formas básicas
function initializeShapeDefinitions() {
    PROCEDURAL_CONFIG.obstacleShapes.forEach(shape => {
        registerShapeDefinition(shape);
    });
    
    PROCEDURAL_CONFIG.enemyShapes.forEach(shape => {
        registerShapeDefinition(shape);
    });
    
    console.log('🔷 Definições de formas geométricas inicializadas');
}
=======
>>>>>>> ce5b39cb910dd86effc9b261c66604a0330e4827

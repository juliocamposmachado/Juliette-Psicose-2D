/* ==========================================================================
   SISTEMA COMPLETO DE CONTROLES MÓVEIS PARA JULIETTE 2D
   ========================================================================== */

// === ESTADO GLOBAL DOS CONTROLES MÓVEIS ===
let mobileControlsState = {
    enabled: false,
    visible: false,
    buttonsPressed: {},
    touchActive: {},
    vibrationEnabled: true,
    lastTouchTime: 0,
    gameInstance: null // Referência para o jogo
};

// === DETECTAR DISPOSITIVO MÓVEL ===
function detectMobileDevice() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 1024;
    
    return mobileRegex.test(userAgent) || (isTouchDevice && isSmallScreen);
}

// === INICIALIZAR CONTROLES MÓVEIS ===
function initializeMobileControls() {
    if (mobileControlsState.enabled) return;
    
    console.log('🎮 Inicializando controles móveis...');
    
    const isMobile = detectMobileDevice();
    const mobileControls = document.getElementById('mobileControls');
    
    if (isMobile && mobileControls) {
        mobileControlsState.enabled = true;
        mobileControlsState.visible = true;
        
        // Ativar controles
        mobileControls.classList.add('active');
        
        // Configurar event listeners
        setupTouchEventListeners();
        
        // Configurar toggle
        setupControlsToggle();
        
        console.log('📱 Controles móveis ativados!');
        
        // Feedback visual de inicialização
        showControlsInitialization();
        
    } else if (mobileControls) {
        console.log('🖥️ Desktop detectado - controles móveis ocultos');
        mobileControls.style.display = 'none';
    }
}

// === CONFIGURAR EVENT LISTENERS ===
function setupTouchEventListeners() {
    // Botões de direção
    setupDirectionControls();
    
    // Botões de ação
    setupActionControls();
    
    // Botões especiais
    setupSpecialControls();
    
    // Prevenir comportamentos padrão
    preventDefaultTouchBehaviors();
}

// === CONFIGURAR CONTROLES DE DIREÇÃO ===
function setupDirectionControls() {
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    
    if (leftBtn) {
        setupButtonEvents(leftBtn, 'left', handleDirectionPress);
    }
    
    if (rightBtn) {
        setupButtonEvents(rightBtn, 'right', handleDirectionPress);
    }
}

// === CONFIGURAR CONTROLES DE AÇÃO ===
function setupActionControls() {
    const jumpBtn = document.getElementById('jumpBtn');
    const shootBtn = document.getElementById('shootBtn');
    
    if (jumpBtn) {
        setupButtonEvents(jumpBtn, 'jump', handleActionPress);
    }
    
    if (shootBtn) {
        setupButtonEvents(shootBtn, 'shoot', handleActionPress);
    }
}

// === CONFIGURAR CONTROLES ESPECIAIS ===
function setupSpecialControls() {
    const fullscreenBtn = document.getElementById('mobileFullscreenBtn');
    
    if (fullscreenBtn) {
        setupButtonEvents(fullscreenBtn, 'fullscreen', handleSpecialPress);
        console.log('📺 Botão de tela cheia móvel configurado!');
    }
}

// === CONFIGURAR EVENTOS DE BOTÃO ===
function setupButtonEvents(button, action, handler) {
    // Touch events
    button.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handler(action, true, e);
        addHapticFeedback(button);
    }, { passive: false });
    
    button.addEventListener('touchend', (e) => {
        e.preventDefault();
        handler(action, false, e);
    }, { passive: false });
    
    // Mouse events (para teste no desktop)
    button.addEventListener('mousedown', (e) => {
        e.preventDefault();
        handler(action, true, e);
        addHapticFeedback(button);
    });
    
    button.addEventListener('mouseup', (e) => {
        e.preventDefault();
        handler(action, false, e);
    });
    
    // Prevenir context menu
    button.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
}

// === MANIPULAR PRESSÃO DE DIREÇÃO ===
function handleDirectionPress(direction, isPressed, event) {
    mobileControlsState.buttonsPressed[direction] = isPressed;
    
    console.log(`📱 Direção ${direction}: ${isPressed ? 'PRESSIONADO' : 'SOLTO'}`);
    
    // Integração com o jogo
    if (typeof window !== 'undefined' && window.keys) {
        if (direction === 'left') {
            window.keys['ArrowLeft'] = isPressed;
            
            if (isPressed && !isInSpecialAnim) {
                moving = true;
                facingRight = false;
                backgroundScrolling = true;
            } else if (!mobileControlsState.buttonsPressed['right']) {
                moving = false;
                backgroundScrolling = false;
            }
        } else if (direction === 'right') {
            window.keys['ArrowRight'] = isPressed;
            
            if (isPressed && !isInSpecialAnim) {
                moving = true;
                facingRight = true;
                backgroundScrolling = true;
            } else if (!mobileControlsState.buttonsPressed['left']) {
                moving = false;
                backgroundScrolling = false;
            }
        }
    }
    
    // Feedback visual
    updateButtonVisualState(event.target, isPressed);
}

// === MANIPULAR PRESSÃO DE AÇÃO ===
function handleActionPress(action, isPressed, event) {
    mobileControlsState.buttonsPressed[action] = isPressed;
    
    console.log(`🎯 Ação ${action}: ${isPressed ? 'PRESSIONADO' : 'SOLTO'}`);
    
    if (isPressed) {
        switch (action) {
            case 'shoot':
                // Integração com sistema de tiro
                if (typeof shoot === 'function') {
                    shoot();
                    if (typeof window !== 'undefined') {
                        attacking = true;
                    }
                }
                break;
                
            case 'jump':
                // Integração com sistema de pulo
                if (typeof jump === 'function') {
                    jump();
                }
                break;
        }
    } else {
        // Liberar ações
        if (action === 'shoot' && typeof window !== 'undefined') {
            attacking = false;
        }
    }
    
    // Feedback visual
    updateButtonVisualState(event.target, isPressed);
}

// === MANIPULAR PRESSÃO DE CONTROLES ESPECIAIS ===
function handleSpecialPress(action, isPressed, event) {
    mobileControlsState.buttonsPressed[action] = isPressed;
    
    console.log(`🎯 Especial ${action}: ${isPressed ? 'PRESSIONADO' : 'SOLTO'}`);
    
    if (isPressed) {
        switch (action) {
            case 'fullscreen':
                // Ativar/desativar tela cheia
                if (typeof toggleFullscreen === 'function') {
                    toggleFullscreen();
                } else {
                    // Fallback: usar função global de tela cheia
                    toggleMobileFullscreen();
                }
                
                // Feedback visual especial
                const fullscreenBtn = document.getElementById('mobileFullscreenBtn');
                if (fullscreenBtn) {
                    fullscreenBtn.classList.add('fullscreen-active');
                    setTimeout(() => {
                        fullscreenBtn.classList.remove('fullscreen-active');
                    }, 500);
                }
                
                console.log('📺 Tela cheia ativada via controle móvel!');
                break;
        }
    }
    
    // Feedback visual
    updateButtonVisualState(event.target, isPressed);
}

// === FUNÇÃO DE TELA CHEIA MÓVEL ===
function toggleMobileFullscreen() {
    const element = document.documentElement;
    
    try {
        if (!document.fullscreenElement) {
            // Entrar em tela cheia
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            }
            
            console.log('📺 Entrando em tela cheia móvel...');
            
            // Feedback háptico
            if (navigator.vibrate) {
                navigator.vibrate([100, 50, 100]);
            }
            
        } else {
            // Sair da tela cheia
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            }
            
            console.log('📺 Saindo da tela cheia móvel...');
            
            // Feedback háptico
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
        }
        
    } catch (error) {
        console.error('❌ Erro ao alternar tela cheia móvel:', error);
        
        // Fallback para dispositivos que não suportam fullscreen API
        attemptMobileSafariFullscreen();
    }
}

// === FALLBACK PARA MOBILE SAFARI ===
function attemptMobileSafariFullscreen() {
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
        
        // Feedback háptico
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
        }
    }
}

// === CONFIGURAR TOGGLE DOS CONTROLES ===
function setupControlsToggle() {
    const controlsToggle = document.getElementById('controlsToggle');
    
    if (!controlsToggle) return;
    
    controlsToggle.addEventListener('click', toggleControlsVisibility);
    controlsToggle.addEventListener('touchstart', (e) => {
        e.preventDefault();
        toggleControlsVisibility();
    }, { passive: false });
}

// === ALTERNAR VISIBILIDADE DOS CONTROLES ===
function toggleControlsVisibility() {
    const mobileControls = document.getElementById('mobileControls');
    const controlsToggle = document.getElementById('controlsToggle');
    
    if (!mobileControls) return;
    
    mobileControlsState.visible = !mobileControlsState.visible;
    
    if (mobileControlsState.visible) {
        mobileControls.classList.add('active');
        if (controlsToggle) {
            controlsToggle.textContent = '📱';
        }
    } else {
        mobileControls.classList.remove('active');
        if (controlsToggle) {
            controlsToggle.textContent = '🎮';
        }
        
        // Reset de todos os estados quando oculto
        resetAllButtonStates();
    }
    
    // Haptic feedback
    if (navigator.vibrate && mobileControlsState.vibrationEnabled) {
        navigator.vibrate(50);
    }
    
    console.log(`📱 Controles ${mobileControlsState.visible ? 'MOSTRADOS' : 'OCULTOS'}`);
}

// === ADICIONAR FEEDBACK HÁPTICO ===
function addHapticFeedback(element) {
    if (!mobileControlsState.vibrationEnabled) return;
    
    // Vibração
    if (navigator.vibrate) {
        navigator.vibrate(30);
    }
    
    // Feedback visual
    element.classList.add('haptic-feedback');
    setTimeout(() => {
        element.classList.remove('haptic-feedback');
    }, 200);
}

// === ATUALIZAR ESTADO VISUAL DO BOTÃO ===
function updateButtonVisualState(button, isPressed) {
    if (isPressed) {
        button.classList.add('active');
    } else {
        button.classList.remove('active');
    }
}

// === RESETAR TODOS OS ESTADOS DOS BOTÕES ===
function resetAllButtonStates() {
    // Reset estado interno
    mobileControlsState.buttonsPressed = {};
    
    // Reset variáveis do jogo
    if (typeof window !== 'undefined') {
        moving = false;
        backgroundScrolling = false;
        attacking = false;
        
        // Reset keys
        if (window.keys) {
            window.keys['ArrowLeft'] = false;
            window.keys['ArrowRight'] = false;
        }
    }
    
    // Reset visual dos botões
    document.querySelectorAll('.control-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    console.log('🔄 Estados dos controles resetados');
}

// === PREVENIR COMPORTAMENTOS PADRÃO ===
function preventDefaultTouchBehaviors() {
    const mobileControls = document.getElementById('mobileControls');
    if (!mobileControls) return;
    
    // Prevenir zoom e scroll
    mobileControls.addEventListener('touchstart', (e) => {
        mobileControlsState.lastTouchTime = Date.now();
    }, { passive: true });
    
    mobileControls.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });
    
    // Prevenir seleção de texto
    mobileControls.addEventListener('selectstart', (e) => {
        e.preventDefault();
    });
}

// === MOSTRAR INICIALIZAÇÃO DOS CONTROLES ===
function showControlsInitialization() {
    const mobileControls = document.getElementById('mobileControls');
    if (!mobileControls) return;
    
    // Adicionar classe de animação
    mobileControls.classList.add('initializing');
    
    setTimeout(() => {
        mobileControls.classList.remove('initializing');
    }, 1000);
    
    // Feedback háptico de boas-vindas
    if (navigator.vibrate && mobileControlsState.vibrationEnabled) {
        navigator.vibrate([100, 50, 100]);
    }
}

// === ATUALIZAR CONTROLES NO LOOP DO JOGO ===
function updateMobileControls() {
    if (!mobileControlsState.enabled || !mobileControlsState.visible) return;
    
    // Atualizar estados baseados no jogo
    // Pode ser chamada no loop principal se necessário
}

// === LIDAR COM MUDANÇA DE ORIENTAÇÃO ===
function handleOrientationChange() {
    if (!mobileControlsState.enabled) return;
    
    setTimeout(() => {
        console.log('📱 Orientação alterada - reajustando controles');
        
        // Verificar se ainda é dispositivo móvel
        const isMobile = detectMobileDevice();
        const mobileControls = document.getElementById('mobileControls');
        
        if (isMobile && mobileControls) {
            mobileControls.classList.add('active');
        } else if (mobileControls) {
            mobileControls.classList.remove('active');
        }
    }, 300); // Delay para aguardar mudança completa
}

// === CONFIGURAR EVENTOS DE SISTEMA ===
window.addEventListener('orientationchange', handleOrientationChange);
window.addEventListener('resize', handleOrientationChange);

// === INICIALIZAÇÃO QUANDO DOM CARREGADO ===
document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 Sistema de controles móveis carregado!');
    
    // Delay para garantir que o jogo foi carregado
    setTimeout(() => {
        initializeMobileControls();
    }, 1000);
});

// === EXPOR FUNÇÕES GLOBALMENTE ===
window.mobileControlsState = mobileControlsState;
window.initializeMobileControls = initializeMobileControls;
window.toggleControlsVisibility = toggleControlsVisibility;
window.resetAllButtonStates = resetAllButtonStates;
window.updateMobileControls = updateMobileControls;

console.log('🎮 Sistema de controles móveis carregado e pronto!');

// === DEBUG: FUNÇÃO PARA TESTAR CONTROLES ===
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.debugMobileControls = function() {
        console.log('🔍 Estado atual dos controles:', mobileControlsState);
        
        const mobileControls = document.getElementById('mobileControls');
        if (mobileControls) {
            mobileControls.classList.add('debug-show');
            console.log('🔧 Controles forçadamente visíveis para debug');
        }
    };
}

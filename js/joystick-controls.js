/* ==========================================================================
   SISTEMA JOYSTICK VIRTUAL PARA JULIETTE 2D
   ========================================================================== */

// === ESTADO GLOBAL DO JOYSTICK ===
let joystickState = {
    enabled: false,
    visible: false,
    activeDirections: {},
    activeActions: {},
    touchActive: {},
    vibrationEnabled: true,
    lastTouchTime: 0,
    gameInstance: null
};

// === DETECTAR DISPOSITIVO MÓVEL ===
function detectMobileDevice() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 1024;
    
    return mobileRegex.test(userAgent) || (isTouchDevice && isSmallScreen);
}

// === INICIALIZAR JOYSTICK ===
function initializeJoystickControls() {
    if (joystickState.enabled) return;
    
    console.log('🕹️ Inicializando controles joystick...');
    
    const isMobile = detectMobileDevice();
    const joystickControls = document.getElementById('joystickControls');
    
    if (isMobile && joystickControls) {
        joystickState.enabled = true;
        joystickState.visible = true;
        
        // Ativar controles
        joystickControls.classList.add('active');
        
        // Configurar event listeners
        setupJoystickEventListeners();
        
        // Configurar toggle
        setupJoystickToggle();
        
        console.log('🕹️ Controles joystick ativados!');
        
        // Feedback visual de inicialização
        showJoystickInitialization();
        
    } else if (joystickControls) {
        console.log('🖥️ Desktop detectado - joystick oculto');
        joystickControls.style.display = 'none';
    }
}

// === CONFIGURAR EVENT LISTENERS ===
function setupJoystickEventListeners() {
    // Setas direcionais do joystick
    setupJoystickArrows();
    
    // Botões de ação
    setupActionButtons();
    
    // Botão de tela cheia
    setupFullscreenButton();
    
    // Seletor de armas
    setupWeaponSelector();
    
    // Prevenir comportamentos padrão
    preventJoystickDefaultBehaviors();
}

// === CONFIGURAR SETAS DIRECIONAIS ===
function setupJoystickArrows() {
    const arrows = {
        'arrowUp': 'up',
        'arrowDown': 'down', 
        'arrowLeft': 'left',
        'arrowRight': 'right'
    };
    
    Object.entries(arrows).forEach(([id, direction]) => {
        const arrow = document.getElementById(id);
        if (arrow) {
            setupJoystickButtonEvents(arrow, direction, handleDirectionPress);
        }
    });
}

// === CONFIGURAR BOTÕES DE AÇÃO ===
function setupActionButtons() {
    const actions = {
        'joystickShootBtn': 'shoot',
        'joystickJumpBtn': 'jump',
        'joystickWeaponBtn': 'weapon'
    };
    
    Object.entries(actions).forEach(([id, action]) => {
        const button = document.getElementById(id);
        if (button) {
            setupJoystickButtonEvents(button, action, handleActionPress);
        }
    });
}

// === CONFIGURAR BOTÃO DE TELA CHEIA ===
function setupFullscreenButton() {
    const fullscreenBtn = document.getElementById('joystickFullscreenBtn');
    
    if (fullscreenBtn) {
        setupJoystickButtonEvents(fullscreenBtn, 'fullscreen', handleSpecialPress);
        console.log('📺 Botão de tela cheia joystick configurado!');
    }
}

// === CONFIGURAR EVENTOS DE BOTÃO ===
function setupJoystickButtonEvents(button, action, handler) {
    // Touch events
    button.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handler(action, true, e);
        addJoystickHapticFeedback(button);
    }, { passive: false });
    
    button.addEventListener('touchend', (e) => {
        e.preventDefault();
        handler(action, false, e);
    }, { passive: false });
    
    button.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        handler(action, false, e);
    }, { passive: false });
    
    // Mouse events (para teste no desktop)
    button.addEventListener('mousedown', (e) => {
        e.preventDefault();
        handler(action, true, e);
        addJoystickHapticFeedback(button);
    });
    
    button.addEventListener('mouseup', (e) => {
        e.preventDefault();
        handler(action, false, e);
    });
    
    button.addEventListener('mouseleave', (e) => {
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
    joystickState.activeDirections[direction] = isPressed;
    
    console.log(`🕹️ Direção ${direction}: ${isPressed ? 'PRESSIONADO' : 'SOLTO'}`);
    
    // Integração com o jogo
    if (typeof window !== 'undefined' && window.keys) {
        switch (direction) {
            case 'left':
                window.keys['ArrowLeft'] = isPressed;
                
                if (isPressed && !isInSpecialAnim) {
                    moving = true;
                    facingRight = false;
                    backgroundScrolling = true;
                } else if (!joystickState.activeDirections['right']) {
                    moving = false;
                    backgroundScrolling = false;
                }
                break;
                
            case 'right':
                window.keys['ArrowRight'] = isPressed;
                
                if (isPressed && !isInSpecialAnim) {
                    moving = true;
                    facingRight = true;
                    backgroundScrolling = true;
                } else if (!joystickState.activeDirections['left']) {
                    moving = false;
                    backgroundScrolling = false;
                }
                break;
                
            case 'up':
                window.keys['ArrowUp'] = isPressed;
                // Para mirar para cima se necessário
                break;
                
            case 'down':
                window.keys['ArrowDown'] = isPressed;
                // Para agachar se necessário
                break;
        }
    }
    
    // Feedback visual
    updateJoystickButtonVisualState(event.target, isPressed);
}

// === MANIPULAR PRESSÃO DE AÇÃO ===
function handleActionPress(action, isPressed, event) {
    joystickState.activeActions[action] = isPressed;
    
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
                // Integração with sistema de pulo
                if (typeof jump === 'function') {
                    jump();
                }
                break;
                
            case 'weapon':
                // Trocar arma
                if (typeof switchWeapon === 'function') {
                    switchWeapon();
                } else if (typeof cycleWeapon === 'function') {
                    cycleWeapon();
                } else {
                    // Fallback global
                    handleWeaponSwitch();
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
    updateJoystickButtonVisualState(event.target, isPressed);
}

// === MANIPULAR PRESSÃO DE CONTROLES ESPECIAIS ===
function handleSpecialPress(action, isPressed, event) {
    console.log(`🎯 Especial ${action}: ${isPressed ? 'PRESSIONADO' : 'SOLTO'}`);
    
    if (isPressed) {
        switch (action) {
            case 'fullscreen':
                // Ativar/desativar tela cheia
                if (typeof toggleFullscreen === 'function') {
                    toggleFullscreen();
                } else {
                    // Fallback: usar função global de tela cheia
                    toggleJoystickFullscreen();
                }
                
                // Feedback visual especial
                const fullscreenBtn = document.getElementById('joystickFullscreenBtn');
                if (fullscreenBtn) {
                    fullscreenBtn.classList.add('fullscreen-active');
                    setTimeout(() => {
                        fullscreenBtn.classList.remove('fullscreen-active');
                    }, 500);
                }
                
                console.log('📺 Tela cheia ativada via joystick!');
                break;
        }
    }
    
    // Feedback visual
    updateJoystickButtonVisualState(event.target, isPressed);
}

// === FUNÇÃO DE TELA CHEIA JOYSTICK ===
function toggleJoystickFullscreen() {
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
            
            console.log('📺 Entrando em tela cheia via joystick...');
            
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
            
            console.log('📺 Saindo da tela cheia via joystick...');
            
            // Feedback háptico
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
        }
        
    } catch (error) {
        console.error('❌ Erro ao alternar tela cheia via joystick:', error);
        
        // Fallback para dispositivos que não suportam fullscreen API
        attemptJoystickMobileSafariFullscreen();
    }
}

// === FALLBACK PARA MOBILE SAFARI ===
function attemptJoystickMobileSafariFullscreen() {
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
        
        console.log('📱 Fallback de tela cheia para joystick no Mobile Safari aplicado');
        
        // Feedback háptico
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
        }
    }
}

// === CONFIGURAR TOGGLE DO JOYSTICK ===
function setupJoystickToggle() {
    const joystickToggle = document.getElementById('joystickToggle');
    
    if (!joystickToggle) return;
    
    joystickToggle.addEventListener('click', toggleJoystickVisibility);
    joystickToggle.addEventListener('touchstart', (e) => {
        e.preventDefault();
        toggleJoystickVisibility();
    }, { passive: false });
}

// === ALTERNAR VISIBILIDADE DO JOYSTICK ===
function toggleJoystickVisibility() {
    const joystickControls = document.getElementById('joystickControls');
    const joystickToggle = document.getElementById('joystickToggle');
    
    if (!joystickControls) return;
    
    joystickState.visible = !joystickState.visible;
    
    if (joystickState.visible) {
        joystickControls.classList.add('active');
        if (joystickToggle) {
            joystickToggle.textContent = '🕹️';
        }
    } else {
        joystickControls.classList.remove('active');
        if (joystickToggle) {
            joystickToggle.textContent = '🎮';
        }
        
        // Reset de todos os estados quando oculto
        resetAllJoystickStates();
    }
    
    // Haptic feedback
    if (navigator.vibrate && joystickState.vibrationEnabled) {
        navigator.vibrate(50);
    }
    
    console.log(`🕹️ Joystick ${joystickState.visible ? 'MOSTRADO' : 'OCULTO'}`);
}

// === ADICIONAR FEEDBACK HÁPTICO ===
function addJoystickHapticFeedback(element) {
    if (!joystickState.vibrationEnabled) return;
    
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
function updateJoystickButtonVisualState(button, isPressed) {
    if (isPressed) {
        button.classList.add('active');
    } else {
        button.classList.remove('active');
    }
}

// === RESETAR TODOS OS ESTADOS DO JOYSTICK ===
function resetAllJoystickStates() {
    // Reset estado interno
    joystickState.activeDirections = {};
    joystickState.activeActions = {};
    
    // Reset variáveis do jogo
    if (typeof window !== 'undefined') {
        moving = false;
        backgroundScrolling = false;
        attacking = false;
        
        // Reset keys
        if (window.keys) {
            window.keys['ArrowLeft'] = false;
            window.keys['ArrowRight'] = false;
            window.keys['ArrowUp'] = false;
            window.keys['ArrowDown'] = false;
        }
    }
    
    // Reset visual dos botões
    document.querySelectorAll('.joystick-arrow, .action-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    console.log('🔄 Estados do joystick resetados');
}

// === PREVENIR COMPORTAMENTOS PADRÃO ===
function preventJoystickDefaultBehaviors() {
    const joystickControls = document.getElementById('joystickControls');
    if (!joystickControls) return;
    
    // Prevenir zoom e scroll
    joystickControls.addEventListener('touchstart', (e) => {
        joystickState.lastTouchTime = Date.now();
    }, { passive: true });
    
    joystickControls.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });
    
    // Prevenir seleção de texto
    joystickControls.addEventListener('selectstart', (e) => {
        e.preventDefault();
    });
}

// === MOSTRAR INICIALIZAÇÃO DO JOYSTICK ===
function showJoystickInitialization() {
    const joystickControls = document.getElementById('joystickControls');
    if (!joystickControls) return;
    
    // Adicionar classe de animação
    joystickControls.classList.add('initializing');
    
    setTimeout(() => {
        joystickControls.classList.remove('initializing');
    }, 1000);
    
    // Feedback háptico de boas-vindas
    if (navigator.vibrate && joystickState.vibrationEnabled) {
        navigator.vibrate([100, 50, 100]);
    }
}

// === ATUALIZAR JOYSTICK NO LOOP DO JOGO ===
function updateJoystickControls() {
    if (!joystickState.enabled || !joystickState.visible) return;
    
    // Atualizar estados baseados no jogo
    // Pode ser chamada no loop principal se necessário
}

// === LIDAR COM MUDANÇA DE ORIENTAÇÃO ===
function handleJoystickOrientationChange() {
    if (!joystickState.enabled) return;
    
    setTimeout(() => {
        console.log('🕹️ Orientação alterada - reajustando joystick');
        
        // Verificar se ainda é dispositivo móvel
        const isMobile = detectMobileDevice();
        const joystickControls = document.getElementById('joystickControls');
        
        if (isMobile && joystickControls) {
            joystickControls.classList.add('active');
        } else if (joystickControls) {
            joystickControls.classList.remove('active');
        }
    }, 300); // Delay para aguardar mudança completa
}

// === CONFIGURAR EVENTOS DE SISTEMA ===
window.addEventListener('orientationchange', handleJoystickOrientationChange);
window.addEventListener('resize', handleJoystickOrientationChange);

// === INICIALIZAÇÃO QUANDO DOM CARREGADO ===
document.addEventListener('DOMContentLoaded', function() {
    console.log('🕹️ Sistema de joystick virtual carregado!');
    
    // Delay para garantir que o jogo foi carregado
    setTimeout(() => {
        initializeJoystickControls();
    }, 1000);
});

// === CONFIGURAR SELETOR DE ARMAS ===
function setupWeaponSelector() {
    const weaponSelectorBtn = document.getElementById('weaponSelectorBtn');
    const weaponList = document.getElementById('weaponList');
    
    if (!weaponSelectorBtn || !weaponList) return;
    
    // Estado do seletor
    let selectorOpen = false;
    
    // Event listener do botão principal
    weaponSelectorBtn.addEventListener('click', () => {
        toggleWeaponSelector();
    });
    
    weaponSelectorBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        toggleWeaponSelector();
        addJoystickHapticFeedback(weaponSelectorBtn);
    }, { passive: false });
    
    // Event listeners dos itens de arma
    const weaponItems = document.querySelectorAll('.weapon-item');
    weaponItems.forEach(item => {
        item.addEventListener('click', () => {
            selectWeapon(item.dataset.weapon);
        });
        
        item.addEventListener('touchstart', (e) => {
            e.preventDefault();
            selectWeapon(item.dataset.weapon);
            addJoystickHapticFeedback(item);
        }, { passive: false });
    });
    
    // Função para alternar o seletor
    function toggleWeaponSelector() {
        selectorOpen = !selectorOpen;
        
        if (selectorOpen) {
            weaponList.classList.add('show');
            weaponSelectorBtn.style.transform = 'translateY(-50%) scale(0.95)';
        } else {
            weaponList.classList.remove('show');
            weaponSelectorBtn.style.transform = 'translateY(-50%) scale(1)';
        }
        
        // Feedback háptico
        if (navigator.vibrate) {
            navigator.vibrate(40);
        }
        
        console.log(`🔫 Seletor de armas ${selectorOpen ? 'ABERTO' : 'FECHADO'}`);
    }
    
    // Função para selecionar arma
    function selectWeapon(weaponName) {
        // Atualizar arma no jogo
        if (typeof window !== 'undefined') {
            if (typeof window.weaponType !== 'undefined') {
                window.weaponType = weaponName;
                console.log(`🎯 Arma selecionada: ${weaponName}`);
            }
        }
        
        // Atualizar hasWeapon se não for 'none'
        if (typeof window.hasWeapon !== 'undefined') {
            window.hasWeapon = weaponName !== 'none';
        }
        
        // Atualizar visual dos itens
        weaponItems.forEach(item => {
            item.classList.remove('selected');
        });
        
        const selectedItem = document.querySelector(`[data-weapon="${weaponName}"]`);
        if (selectedItem) {
            selectedItem.classList.add('selected');
        }
        
        // Atualizar ícone do botão principal
        updateWeaponSelectorIcon(weaponName);
        
        // Fechar seletor
        selectorOpen = false;
        weaponList.classList.remove('show');
        weaponSelectorBtn.style.transform = 'translateY(-50%) scale(1)';
        
        // Feedback háptico de seleção
        if (navigator.vibrate) {
            navigator.vibrate([50, 30, 50]);
        }
    }
    
    // Função para atualizar ícone do seletor
    function updateWeaponSelectorIcon(weaponName) {
        const weaponIcon = weaponSelectorBtn.querySelector('.weapon-icon');
        if (!weaponIcon) return;
        
        const iconMap = {
            normal: '🔫',
            spread: '💥',
            laser: '⚡',
            machine: '🔥',
            plasma: '🌟',
            storm: '⛈️',
            nuclear: '☢️'
        };
        
        weaponIcon.textContent = iconMap[weaponName] || '🔫';
    }
    
    // Fechar seletor ao clicar fora
    document.addEventListener('click', (e) => {
        if (selectorOpen && !weaponSelectorBtn.contains(e.target) && !weaponList.contains(e.target)) {
            selectorOpen = false;
            weaponList.classList.remove('show');
            weaponSelectorBtn.style.transform = 'translateY(-50%) scale(1)';
        }
    });
    
    console.log('🔫 Seletor de armas configurado!');
}

// === EXPOR FUNÇÕES GLOBALMENTE ===
window.joystickState = joystickState;
window.initializeJoystickControls = initializeJoystickControls;
window.toggleJoystickVisibility = toggleJoystickVisibility;
window.resetAllJoystickStates = resetAllJoystickStates;
window.updateJoystickControls = updateJoystickControls;

console.log('🕹️ Sistema de joystick virtual carregado e pronto!');

// === DEBUG: FUNÇÃO PARA TESTAR JOYSTICK ===
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.debugJoystickControls = function() {
        console.log('🔍 Estado atual do joystick:', joystickState);
        
        const joystickControls = document.getElementById('joystickControls');
        if (joystickControls) {
            joystickControls.classList.add('debug-show');
            console.log('🔧 Joystick forçadamente visível para debug');
        }
    };
}

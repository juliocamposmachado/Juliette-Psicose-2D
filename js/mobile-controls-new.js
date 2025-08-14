// Novos Controles Móveis Reorganizados
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 Inicializando novos controles móveis...');

    // Estado dos controles
    const controlState = {
        movement: {
            up: false,
            down: false,
            left: false,
            right: false
        },
        actions: {
            jump: false,
            shoot: false,
            chainLeft: false,
            chainBoth: false,
            bomb: false,
            shield: false,
            lava: false,
            pause: false,
            sound: false
        }
    };

    // === CONTROLES DE MOVIMENTO === 
    function setupMovementControls() {
        const moveButtons = {
            moveUp: document.getElementById('moveUp'),
            moveDown: document.getElementById('moveDown'),
            moveLeft: document.getElementById('moveLeft'),
            moveRight: document.getElementById('moveRight')
        };

        Object.keys(moveButtons).forEach(buttonId => {
            const button = moveButtons[buttonId];
            const action = button?.getAttribute('data-action');
            
            if (button && action) {
                // Touch events
                button.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    controlState.movement[action] = true;
                    simulateKeyDown(getKeyForAction(action));
                    button.classList.add('pressed');
                });

                button.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    controlState.movement[action] = false;
                    simulateKeyUp(getKeyForAction(action));
                    button.classList.remove('pressed');
                });

                // Mouse events (para teste em desktop)
                button.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    controlState.movement[action] = true;
                    simulateKeyDown(getKeyForAction(action));
                    button.classList.add('pressed');
                });

                button.addEventListener('mouseup', (e) => {
                    e.preventDefault();
                    controlState.movement[action] = false;
                    simulateKeyUp(getKeyForAction(action));
                    button.classList.remove('pressed');
                });

                button.addEventListener('mouseleave', (e) => {
                    controlState.movement[action] = false;
                    simulateKeyUp(getKeyForAction(action));
                    button.classList.remove('pressed');
                });
            }
        });
    }

    // === CONTROLES DE AÇÃO (PULAR, ATIRAR, ETC.) ===
    function setupActionControls() {
        const actionButtons = {
            jumpBtn: 'jump',
            shootBtn: 'shoot',
            chainLeftBtn: 'chainLeft',
            chainBothBtn: 'chainBoth'
        };

        Object.keys(actionButtons).forEach(buttonId => {
            const button = document.getElementById(buttonId);
            const action = actionButtons[buttonId];
            
            if (button) {
                // Touch events
                button.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    controlState.actions[action] = true;
                    simulateKeyDown(getKeyForAction(action));
                    button.classList.add('pressed');
                });

                button.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    controlState.actions[action] = false;
                    simulateKeyUp(getKeyForAction(action));
                    button.classList.remove('pressed');
                });

                // Mouse events
                button.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    controlState.actions[action] = true;
                    simulateKeyDown(getKeyForAction(action));
                    button.classList.add('pressed');
                });

                button.addEventListener('mouseup', (e) => {
                    e.preventDefault();
                    controlState.actions[action] = false;
                    simulateKeyUp(getKeyForAction(action));
                    button.classList.remove('pressed');
                });

                button.addEventListener('mouseleave', (e) => {
                    controlState.actions[action] = false;
                    simulateKeyUp(getKeyForAction(action));
                    button.classList.remove('pressed');
                });
            }
        });
    }

    // === CONTROLES ESPECIAIS ===
    function setupSpecialControls() {
        const specialButtons = {
            bombBtn: 'bomb',
            shieldBtn: 'shield',
            lavaBtn: 'lava',
            pauseBtn: 'pause',
            soundBtn: 'sound'
        };

        Object.keys(specialButtons).forEach(buttonId => {
            const button = document.getElementById(buttonId);
            const action = specialButtons[buttonId];
            
            if (button) {
                // Touch events (toque único para especiais)
                button.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    handleSpecialAction(action);
                    button.classList.add('pressed');
                    setTimeout(() => button.classList.remove('pressed'), 150);
                });

                // Mouse events
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    handleSpecialAction(action);
                    button.classList.add('pressed');
                    setTimeout(() => button.classList.remove('pressed'), 150);
                });
            }
        });
    }

    // === MAPEAMENTO DE AÇÕES PARA TECLAS ===
    function getKeyForAction(action) {
        const keyMap = {
            // Movimento
            'up': 'ArrowUp',
            'down': 'ArrowDown', 
            'left': 'ArrowLeft',
            'right': 'ArrowRight',
            // Ações
            'jump': 'KeyZ',
            'shoot': 'Space',
            'chainLeft': 'KeyC',
            'chainBoth': 'KeyV',
            // Especiais
            'bomb': 'KeyB',
            'shield': 'KeyS',
            'lava': 'KeyL',
            'pause': 'KeyP',
            'sound': 'KeyM'
        };
        
        return keyMap[action] || 'Space';
    }

    // === SIMULAÇÃO DE EVENTOS DE TECLADO ===
    function simulateKeyDown(keyCode) {
        const event = new KeyboardEvent('keydown', {
            code: keyCode,
            key: getKeyFromCode(keyCode),
            keyCode: getKeyCodeFromCode(keyCode),
            which: getKeyCodeFromCode(keyCode),
            bubbles: true
        });
        document.dispatchEvent(event);
    }

    function simulateKeyUp(keyCode) {
        const event = new KeyboardEvent('keyup', {
            code: keyCode,
            key: getKeyFromCode(keyCode),
            keyCode: getKeyCodeFromCode(keyCode),
            which: getKeyCodeFromCode(keyCode),
            bubbles: true
        });
        document.dispatchEvent(event);
    }

    // === CONVERSÃO DE CÓDIGOS ===
    function getKeyFromCode(code) {
        const codeMap = {
            'ArrowUp': 'ArrowUp',
            'ArrowDown': 'ArrowDown',
            'ArrowLeft': 'ArrowLeft',
            'ArrowRight': 'ArrowRight',
            'Space': ' ',
            'KeyZ': 'z',
            'KeyC': 'c',
            'KeyV': 'v',
            'KeyB': 'b',
            'KeyS': 's',
            'KeyL': 'l',
            'KeyP': 'p',
            'KeyM': 'm'
        };
        return codeMap[code] || ' ';
    }

    function getKeyCodeFromCode(code) {
        const codeMap = {
            'ArrowUp': 38,
            'ArrowDown': 40,
            'ArrowLeft': 37,
            'ArrowRight': 39,
            'Space': 32,
            'KeyZ': 90,
            'KeyC': 67,
            'KeyV': 86,
            'KeyB': 66,
            'KeyS': 83,
            'KeyL': 76,
            'KeyP': 80,
            'KeyM': 77
        };
        return codeMap[code] || 32;
    }

    // === AÇÕES ESPECIAIS ===
    function handleSpecialAction(action) {
        switch(action) {
            case 'bomb':
                simulateKeyPress('KeyB');
                break;
            case 'shield':
                simulateKeyPress('KeyS');
                break;
            case 'lava':
                simulateKeyPress('KeyL');
                break;
            case 'pause':
                simulateKeyPress('KeyP');
                break;
            case 'sound':
                simulateKeyPress('KeyM');
                break;
        }
    }

    function simulateKeyPress(keyCode) {
        simulateKeyDown(keyCode);
        setTimeout(() => simulateKeyUp(keyCode), 50);
    }

    // === GERENCIAMENTO DE VISIBILIDADE DOS CONTROLES ===
    const controlsToggle = document.getElementById('controlsToggle');
    const mobileControls = document.getElementById('mobileControls');

    if (controlsToggle && mobileControls) {
        // Iniciar com controles ocultos
        mobileControls.style.display = 'none';

        controlsToggle.addEventListener('click', function() {
            const isVisible = mobileControls.style.display === 'block';
            mobileControls.style.display = isVisible ? 'none' : 'block';
            this.textContent = isVisible ? '📱' : '❌';
            console.log('Controles móveis:', isVisible ? 'ocultos' : 'visíveis');
        });
    }

    // === INICIALIZAÇÃO ===
    function initializeControls() {
        setupMovementControls();
        setupActionControls();
        setupSpecialControls();
        
        // Adicionar classe CSS para feedback visual
        const style = document.createElement('style');
        style.textContent = `
            .move-btn.pressed,
            .jump-btn.pressed,
            .shoot-btn.pressed,
            .chain-btn.pressed,
            .special-btn.pressed {
                opacity: 0.7;
                transform: scale(0.95);
            }
        `;
        document.head.appendChild(style);
        
        console.log('✅ Novos controles móveis inicializados');
    }

    // === DETECÇÃO DE DISPOSITIVO MÓVEL ===
    function isMobileDevice() {
        return window.innerWidth <= 768;
    }

    // Inicializar apenas em dispositivos móveis
    if (isMobileDevice()) {
        initializeControls();
    } else {
        console.log('🖥️ Desktop detectado - controles móveis não inicializados');
    }

    // Reinicializar se a tela mudar de tamanho
    window.addEventListener('resize', function() {
        if (isMobileDevice()) {
            initializeControls();
        }
    });
});

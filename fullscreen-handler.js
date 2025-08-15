/**
 * SISTEMA AVANÇADO DE TELA CHEIA UNIVERSAL
 * 
 * Este script garante que o jogo sempre use 100% da tela disponível
 * em qualquer dispositivo ou orientação, adaptando-se automaticamente.
 */

// Estado do sistema de tela cheia
const fullscreenState = {
    isFullscreen: false,
    lastScreenWidth: window.innerWidth,
    lastScreenHeight: window.innerHeight,
    lastOrientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
    hasNotch: false,
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1),
    viewportHeight: window.innerHeight,
    initialized: false,
    resizeCount: 0
};

// Elementos principais
let gameCanvas;
let gameContainer;

/**
 * Inicializa o sistema de tela cheia
 */
function initFullscreenSystem() {
    if (fullscreenState.initialized) return;

    // Obter elementos principais
    gameCanvas = document.getElementById('gameCanvas');
    gameContainer = document.getElementById('gameContainer');
    
    if (!gameCanvas || !gameContainer) {
        console.error('❌ Elementos principais não encontrados!');
        return;
    }
    
    // Configurar ouvintes de eventos
    window.addEventListener('resize', handleScreenResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // iOS específico - workaround para vh instável
    if (fullscreenState.isIOS) {
        setupIOSViewportFix();
    }
    
    // Chamar configuração inicial
    setupFullscreen();
    detectNotch();
    
    // Configurar botões de tela cheia
    setupFullscreenButtons();
    
    console.log('✅ Sistema de tela cheia inicializado');
    fullscreenState.initialized = true;

    // Forçar resize inicial após pequeno delay para garantir dimensões corretas
    setTimeout(() => {
        forceCanvasFullscreen();
    }, 100);
}

/**
 * Configura botões de tela cheia
 */
function setupFullscreenButtons() {
    const desktopButton = document.getElementById('fullscreenBtn');
    const mobileButton = document.getElementById('mobileFullscreenBtn');
    const joystickButton = document.getElementById('joystickFullscreenBtn');
    
    const buttons = [desktopButton, mobileButton, joystickButton].filter(btn => btn);
    
    buttons.forEach(button => {
        button.addEventListener('click', toggleFullscreenMode);
    });
}

/**
 * Alterna entre modo tela cheia e normal
 */
function toggleFullscreenMode() {
    if (!document.fullscreenElement && 
        !document.webkitFullscreenElement && 
        !document.mozFullScreenElement) {
        // Entrar em tela cheia
        const docElm = document.documentElement;
        
        if (docElm.requestFullscreen) {
            docElm.requestFullscreen();
        } else if (docElm.webkitRequestFullscreen) {
            docElm.webkitRequestFullscreen();
        } else if (docElm.mozRequestFullScreen) {
            docElm.mozRequestFullScreen();
        } else if (docElm.msRequestFullscreen) {
            docElm.msRequestFullscreen();
        }
        
        fullscreenState.isFullscreen = true;
        updateFullscreenButtons(true);
    } else {
        // Sair da tela cheia
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        
        fullscreenState.isFullscreen = false;
        updateFullscreenButtons(false);
    }
    
    // Força redimensionamento do canvas após mudança de estado
    setTimeout(forceCanvasFullscreen, 300);
}

/**
 * Atualiza o texto e aparência dos botões de tela cheia
 */
function updateFullscreenButtons(isFullscreen) {
    const desktopButton = document.getElementById('fullscreenBtn');
    const mobileButton = document.getElementById('mobileFullscreenBtn');
    const joystickButton = document.getElementById('joystickFullscreenBtn');
    
    const buttons = [desktopButton, mobileButton, joystickButton].filter(btn => btn);
    
    buttons.forEach(button => {
        if (isFullscreen) {
            if (button.id === 'fullscreenBtn') {
                button.textContent = '📺 SAIR';
            } else {
                button.textContent = '📱 SAIR';
            }
            button.classList.add('fullscreen-active');
        } else {
            if (button.id === 'fullscreenBtn') {
                button.textContent = '📺 TELA';
            } else {
                button.textContent = '📱 TELA';
            }
            button.classList.remove('fullscreen-active');
        }
    });
}

/**
 * Manipula eventos de redimensionamento de tela
 */
function handleScreenResize() {
    fullscreenState.resizeCount++;
    const currentCount = fullscreenState.resizeCount;
    
    // Detecta alterações significativas
    const widthChanged = Math.abs(window.innerWidth - fullscreenState.lastScreenWidth) > 50;
    const heightChanged = Math.abs(window.innerHeight - fullscreenState.lastScreenHeight) > 50;
    
    if (widthChanged || heightChanged) {
        console.log(`📱 Redimensionamento detectado: ${window.innerWidth}x${window.innerHeight}`);
        
        // Atualizar dimensões
        fullscreenState.lastScreenWidth = window.innerWidth;
        fullscreenState.lastScreenHeight = window.innerHeight;
        
        // Atualizar orientação
        const newOrientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
        const orientationChanged = newOrientation !== fullscreenState.lastOrientation;
        
        if (orientationChanged) {
            fullscreenState.lastOrientation = newOrientation;
            console.log(`📱 Orientação alterada para: ${newOrientation}`);
        }
        
        // Usar pequeno delay para assegurar que as dimensões estão estáveis
        setTimeout(() => {
            // Apenas prosseguir se este for o resize mais recente
            if (currentCount === fullscreenState.resizeCount) {
                forceCanvasFullscreen();
            }
        }, 200);
    }
}

/**
 * Manipula eventos de mudança de orientação
 */
function handleOrientationChange() {
    console.log('📱 Evento de mudança de orientação detectado');
    
    // Em dispositivos móveis, este evento é mais confiável que resize
    if (fullscreenState.isMobile) {
        // Usar delay maior para mudança de orientação em mobile
        setTimeout(() => {
            forceCanvasFullscreen();
            detectNotch();
        }, 300);
    }
}

/**
 * Configura o jogo para tela cheia
 */
function setupFullscreen() {
    if (!gameCanvas || !gameContainer) return;
    
    // Remover margens e paddings
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
    
    // Configurar meta viewport para tela cheia
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
        viewportMeta.setAttribute('content', 
            'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
    }
    
    // Aplicar dimensões de tela cheia
    forceCanvasFullscreen();
}

/**
 * Força o canvas a usar 100% da tela disponível com adaptação inteligente
 */
function forceCanvasFullscreen() {
    if (!gameCanvas || !gameContainer) return;
    
    // Obter dimensões reais da viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    // Calcular dimensões físicas do canvas para alta qualidade
    const physicalWidth = Math.floor(viewportWidth * devicePixelRatio);
    const physicalHeight = Math.floor(viewportHeight * devicePixelRatio);
    
    // Aplicar configurações ao container
    gameContainer.style.width = '100vw';
    gameContainer.style.height = '100vh';
    gameContainer.style.position = 'fixed';
    gameContainer.style.top = '0';
    gameContainer.style.left = '0';
    gameContainer.style.margin = '0';
    gameContainer.style.padding = '0';
    gameContainer.style.borderRadius = '0';
    gameContainer.style.overflow = 'hidden';
    gameContainer.style.zIndex = '1';
    
    // Configuração avançada do canvas
    // Definir resolução interna (física) do canvas
    gameCanvas.width = physicalWidth;
    gameCanvas.height = physicalHeight;
    
    // Configurar estilos CSS do canvas
    gameCanvas.style.width = '100vw';
    gameCanvas.style.height = '100vh';
    gameCanvas.style.display = 'block';
    gameCanvas.style.position = 'fixed';
    gameCanvas.style.top = '0';
    gameCanvas.style.left = '0';
    gameCanvas.style.objectFit = 'cover';
    gameCanvas.style.border = 'none';
    gameCanvas.style.borderRadius = '0';
    gameCanvas.style.imageRendering = 'pixelated'; // Para jogos pixel art
    gameCanvas.style.zIndex = '1';
    
    // Ajustar contexto para alta DPI
    const ctx = gameCanvas.getContext('2d');
    if (ctx && devicePixelRatio > 1) {
        ctx.scale(devicePixelRatio, devicePixelRatio);
        console.log(`🎨 Canvas escalado para DPR: ${devicePixelRatio}`);
    }
    
    // Aplicar ajustes específicos para iOS
    if (fullscreenState.isIOS) {
        const iosHeight = fullscreenState.viewportHeight || viewportHeight;
        gameCanvas.style.height = `${iosHeight}px`;
        gameContainer.style.height = `${iosHeight}px`;
        
        // Usar CSS custom property para altura dinâmica
        document.documentElement.style.setProperty('--vh', `${iosHeight * 0.01}px`);
    }
    
    console.log(`📏 Canvas responsivo configurado:`);
    console.log(`   📐 Viewport: ${viewportWidth}x${viewportHeight}`);
    console.log(`   📱 Físico: ${physicalWidth}x${physicalHeight}`);
    console.log(`   🔍 DPR: ${devicePixelRatio}`);
    
    // Aplicar safe areas para dispositivos com notch
    if (fullscreenState.hasNotch) {
        applyNotchSafeArea();
    }
    
    // Armazenar dimensões atuais
    fullscreenState.lastScreenWidth = viewportWidth;
    fullscreenState.lastScreenHeight = viewportHeight;
    
    // Atualizar variáveis globais do jogo se existirem
    if (typeof CANVAS_WIDTH !== 'undefined') {
        window.CANVAS_WIDTH = viewportWidth;
        window.CANVAS_HEIGHT = viewportHeight;
    }
    
    // Notificar o jogo sobre mudança de dimensões
    if (typeof resizeCanvas === 'function') {
        try {
            resizeCanvas(viewportWidth, viewportHeight, devicePixelRatio);
            console.log('🎮 Função resizeCanvas do jogo chamada com novos parâmetros');
        } catch (e) {
            console.warn('⚠️ Erro ao chamar resizeCanvas:', e);
        }
    }
    
    // Disparar evento customizado para outros sistemas
    window.dispatchEvent(new CustomEvent('canvasResized', {
        detail: {
            width: viewportWidth,
            height: viewportHeight,
            physicalWidth: physicalWidth,
            physicalHeight: physicalHeight,
            devicePixelRatio: devicePixelRatio,
            orientation: viewportWidth > viewportHeight ? 'landscape' : 'portrait'
        }
    }));
}

/**
 * Detecta presença de notch (iPhone X+)
 */
function detectNotch() {
    const hasNotch = (
        // iPhone X+ detection
        fullscreenState.isIOS && 
        window.screen.height >= 812 && 
        window.devicePixelRatio >= 2 && 
        (window.innerWidth === 375 || window.innerWidth === 390 || window.innerWidth === 414)
    ) || (
        // Android notch detection (estimativa)
        navigator.userAgent.includes('Android') && 
        window.innerHeight / window.innerWidth < 1.8 && 
        window.innerWidth / window.innerHeight < 1.8
    );
    
    fullscreenState.hasNotch = hasNotch;
    
    if (hasNotch) {
        console.log('📱 Notch detectado - aplicando safe areas');
        applyNotchSafeArea();
    }
}

/**
 * Aplica safe areas para dispositivos com notch
 */
function applyNotchSafeArea() {
    if (!gameContainer) return;
    
    // Aplicar padding para safe areas
    gameContainer.style.paddingTop = 'env(safe-area-inset-top, 0px)';
    gameContainer.style.paddingRight = 'env(safe-area-inset-right, 0px)';
    gameContainer.style.paddingBottom = 'env(safe-area-inset-bottom, 0px)';
    gameContainer.style.paddingLeft = 'env(safe-area-inset-left, 0px)';
}

/**
 * Configuração específica para iOS para resolver problemas com vh
 */
function setupIOSViewportFix() {
    // Obter altura real da viewport
    fullscreenState.viewportHeight = window.innerHeight;
    
    // Função para atualizar altura da viewport em iOS
    function updateIOSViewportHeight() {
        fullscreenState.viewportHeight = window.innerHeight;
        document.documentElement.style.setProperty('--vh', `${fullscreenState.viewportHeight * 0.01}px`);
        
        // Aplicar altura correta
        if (gameCanvas && gameContainer) {
            gameCanvas.style.height = `${fullscreenState.viewportHeight}px`;
            gameContainer.style.height = `${fullscreenState.viewportHeight}px`;
        }
    }
    
    // Atualizar em resize e scroll (para barras de endereço iOS)
    window.addEventListener('resize', updateIOSViewportHeight);
    window.addEventListener('scroll', updateIOSViewportHeight);
    window.addEventListener('orientationchange', () => {
        setTimeout(updateIOSViewportHeight, 300);
    });
    
    // Atualizar inicialmente
    updateIOSViewportHeight();
    
    // Inserir CSS personalizado para usar --vh
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
        :root {
            --vh: ${fullscreenState.viewportHeight * 0.01}px;
        }
        .vh-fix {
            height: calc(var(--vh, 1vh) * 100) !important;
        }
    `;
    document.head.appendChild(styleEl);
    
    // Adicionar classe vh-fix
    if (gameCanvas) gameCanvas.classList.add('vh-fix');
    if (gameContainer) gameContainer.classList.add('vh-fix');
}

// Inicializar sistema quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initFullscreenSystem);

// Verificação de segurança para garantir inicialização
window.addEventListener('load', () => {
    if (!fullscreenState.initialized) {
        console.warn('⚠️ Inicialização atrasada - tentando novamente');
        initFullscreenSystem();
    }
    
    // Forçar dimensionamento correto após carregamento completo
    setTimeout(forceCanvasFullscreen, 300);
});

// Expor funções úteis globalmente
window.forceCanvasFullscreen = forceCanvasFullscreen;
window.toggleFullscreenMode = toggleFullscreenMode;

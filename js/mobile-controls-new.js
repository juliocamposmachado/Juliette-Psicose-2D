// Estrutura Básica dos Controles Móveis - Limpo para Recriação
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 Estrutura básica dos controles móveis carregada...');

    // === ESTRUTURA DE CONTROLES ===
    const mobileControls = document.getElementById('mobileControls');
    
    if (mobileControls) {
        // Iniciar com controles visíveis por padrão
        mobileControls.style.display = 'block';
    }

    // === DETECÇÃO DE DISPOSITIVO MÓVEL ===
    function isMobileDevice() {
        return window.innerWidth <= 768;
    }

    if (isMobileDevice()) {
        console.log('📱 Dispositivo móvel detectado - pronto para novos controles');
    } else {
        console.log('🖥️ Desktop detectado - controles móveis desativados');
    }
});

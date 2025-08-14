// Estrutura Básica dos Controles Móveis - Limpo para Recriação
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 Estrutura básica dos controles móveis carregada...');

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

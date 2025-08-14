// Complete Guide Management
document.addEventListener('DOMContentLoaded', function() {
    // Get all guide elements
    const guideElements = {
        mobileGuide: document.getElementById('mobileGuide'),
        mobileGuideContent: document.getElementById('mobileGuideContent'),
        desktopGuide: document.querySelector('.game-info.desktop-only'),
        desktopControls: document.querySelector('.controls.desktop-only')
    };

    // Hide all guide elements by default
    if (guideElements.mobileGuide) {
        guideElements.mobileGuide.style.display = 'none';
    }
    if (guideElements.mobileGuideContent) {
        guideElements.mobileGuideContent.style.display = 'none';
    }
    if (guideElements.desktopGuide) {
        guideElements.desktopGuide.style.display = 'none';
    }
    if (guideElements.desktopControls) {
        guideElements.desktopControls.style.display = 'none';
    }

    // Add toggle button for desktop
    const toggleButton = document.createElement('button');
    toggleButton.id = 'toggleGuideBtn';
    toggleButton.className = 'toggle-guide-btn desktop-only';
    toggleButton.innerHTML = '📖 GUIA';
    toggleButton.title = 'Mostrar/Ocultar Guia Completo';
    document.body.appendChild(toggleButton);

    // Toggle functionality for desktop
    toggleButton.addEventListener('click', function() {
        const isVisible = guideElements.desktopGuide.style.display === 'block';
        guideElements.desktopGuide.style.display = isVisible ? 'none' : 'block';
        guideElements.desktopControls.style.display = isVisible ? 'none' : 'block';
        this.innerHTML = isVisible ? '📖 GUIA' : '❌ FECHAR';
    });
});

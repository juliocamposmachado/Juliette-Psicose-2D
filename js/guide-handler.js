// Guide Handler
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const guideElements = {
        mobileGuide: document.getElementById('mobileGuide'),
        mobileGuideContent: document.getElementById('mobileGuideContent'),
        mobileGuideToggle: document.getElementById('mobileGuideToggle'),
        guideFab: document.getElementById('mobileGuideFab')
    };

    // Make sure guide starts collapsed
    function collapseGuide() {
        if (guideElements.mobileGuide) {
            guideElements.mobileGuide.classList.add('collapsed');
            guideElements.mobileGuide.style.display = 'none';
        }
        if (guideElements.mobileGuideContent) {
            guideElements.mobileGuideContent.classList.add('collapsed');
            guideElements.mobileGuideContent.style.display = 'none';
        }
        if (guideElements.mobileGuideToggle) {
            guideElements.mobileGuideToggle.textContent = '▼';
        }
        // Show FAB button when guide is collapsed
        if (guideElements.guideFab) {
            guideElements.guideFab.style.display = 'block';
        }
    }

    // Initialize collapsed state
    collapseGuide();

    // Toggle functionality
    if (guideElements.mobileGuideToggle) {
        guideElements.mobileGuideToggle.addEventListener('click', function() {
            const isCollapsed = guideElements.mobileGuideContent.classList.contains('collapsed');
            if (isCollapsed) {
                guideElements.mobileGuideContent.classList.remove('collapsed');
                guideElements.mobileGuideContent.style.display = 'block';
                this.textContent = '▲';
            } else {
                guideElements.mobileGuideContent.classList.add('collapsed');
                guideElements.mobileGuideContent.style.display = 'none';
                this.textContent = '▼';
            }
        });
    }

    // Close button functionality
    const closeButtons = document.querySelectorAll('.mobile-guide-close, #mobileCloseGuideBtn');
    closeButtons.forEach(button => {
        button.addEventListener('click', collapseGuide);
    });

    // FAB button functionality
    if (guideElements.guideFab) {
        guideElements.guideFab.addEventListener('click', function() {
            if (guideElements.mobileGuide) {
                guideElements.mobileGuide.classList.remove('collapsed');
                guideElements.mobileGuide.style.display = 'block';
                this.style.display = 'none';
            }
        });
    }

    // Handle page load and navigation
    window.addEventListener('load', collapseGuide);
    window.addEventListener('pageshow', collapseGuide);
});

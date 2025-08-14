// Mobile Guide Controls
document.addEventListener('DOMContentLoaded', function() {
    // Hide mobile controls by default
    const mobileControls = document.getElementById('mobileControls');
    if (mobileControls) {
        mobileControls.style.display = 'none';
    }
    const mobileGuide = document.getElementById('mobileGuide');
    const mobileGuideContent = document.getElementById('mobileGuideContent');
    const mobileGuideToggle = document.getElementById('mobileGuideToggle');
    const mobileGuideClose = document.getElementById('mobileGuideClose');
    const mobileGuideFab = document.getElementById('mobileGuideFab');

    // Start with guide hidden
    if (mobileGuide) {
        mobileGuide.classList.remove('show');
    }
    if (mobileGuideContent) {
        mobileGuideContent.classList.remove('show');
    }

    // Toggle button functionality
    if (mobileGuideToggle) {
        mobileGuideToggle.addEventListener('click', function() {
            mobileGuideContent.classList.toggle('show');
            this.textContent = mobileGuideContent.classList.contains('show') ? '▼' : '▲';
        });
    }

    // Close button functionality
    if (mobileGuideClose) {
        mobileGuideClose.addEventListener('click', function() {
            mobileGuide.classList.remove('show');
            if (mobileGuideFab) {
                mobileGuideFab.style.display = 'block';
            }
        });
    }

    // FAB button functionality
    if (mobileGuideFab) {
        mobileGuideFab.addEventListener('click', function() {
            mobileGuide.classList.add('show');
            this.style.display = 'none';
        });
    }

    // Additional close button functionality
    const mobileCloseGuideBtn = document.getElementById('mobileCloseGuideBtn');
    if (mobileCloseGuideBtn) {
        mobileCloseGuideBtn.addEventListener('click', function() {
            mobileGuide.classList.remove('show');
            if (mobileGuideFab) {
                mobileGuideFab.style.display = 'block';
            }
        });
    }
});

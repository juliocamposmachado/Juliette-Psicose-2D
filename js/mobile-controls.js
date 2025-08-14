// Mobile Controls Management
document.addEventListener('DOMContentLoaded', function() {
    const controlsToggle = document.getElementById('controlsToggle');
    const mobileControls = document.getElementById('mobileControls');

    // Start with controls hidden
    if (mobileControls) {
        mobileControls.style.display = 'none';
    }

    // Toggle controls visibility
    if (controlsToggle) {
        controlsToggle.addEventListener('click', function() {
            if (mobileControls) {
                const isVisible = mobileControls.style.display === 'block';
                mobileControls.style.display = isVisible ? 'none' : 'block';
                
                // Update toggle button text
                this.textContent = isVisible ? '📱' : '❌';
            }
        });
    }
});

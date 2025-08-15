/* ==========================================================================
   SISTEMA GLOBAL DE TROCA DE ARMAS PARA JULIETTE 2D
   ========================================================================== */

// === LISTA DE ARMAS DISPONÍVEIS ===
const availableWeapons = ['normal', 'spread', 'laser', 'machine', 'plasma', 'storm'];
let currentWeaponIndex = 0;

// === FUNÇÃO GLOBAL PARA TROCAR ARMAS ===
function handleWeaponSwitch() {
    // Avançar para próxima arma na lista
    currentWeaponIndex = (currentWeaponIndex + 1) % availableWeapons.length;
    const newWeapon = availableWeapons[currentWeaponIndex];
    
    // Atualizar arma no jogo
    if (typeof window !== 'undefined') {
        if (typeof window.weaponType !== 'undefined') {
            window.weaponType = newWeapon;
            console.log(`🔄 Arma trocada para: ${newWeapon}`);
            
            // Atualizar hasWeapon
            if (typeof window.hasWeapon !== 'undefined') {
                window.hasWeapon = newWeapon !== 'none';
            }
            
            // Feedback visual
            showWeaponSwitchFeedback(newWeapon);
            
            // Feedback háptico
            if (navigator.vibrate) {
                navigator.vibrate([60, 30, 60]);
            }
        }
    }
}

// === FUNÇÃO PARA ALTERNAR ARMA (ALIAS) ===
function switchWeapon() {
    handleWeaponSwitch();
}

// === FUNÇÃO PARA CYCLAR ARMA (ALIAS) ===
function cycleWeapon() {
    handleWeaponSwitch();
}

// === FEEDBACK VISUAL DA TROCA DE ARMA ===
function showWeaponSwitchFeedback(weaponName) {
    // Criar elemento de feedback temporário
    const feedback = document.createElement('div');
    feedback.className = 'weapon-switch-feedback';
    feedback.innerHTML = `
        <div class="weapon-switch-icon">${getWeaponIcon(weaponName)}</div>
        <div class="weapon-switch-name">${getWeaponDisplayName(weaponName)}</div>
    `;
    
    // Adicionar estilos inline
    Object.assign(feedback.style, {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        padding: '20px',
        borderRadius: '15px',
        border: '2px solid rgba(255, 215, 0, 0.8)',
        textAlign: 'center',
        zIndex: '9999',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.4)',
        backdropFilter: 'blur(10px)',
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        fontWeight: 'bold',
        animation: 'weaponSwitchPop 1s ease-out forwards'
    });
    
    // Adicionar ao DOM
    document.body.appendChild(feedback);
    
    // Remover após animação
    setTimeout(() => {
        if (feedback.parentNode) {
            feedback.parentNode.removeChild(feedback);
        }
    }, 1000);
}

// === OBTER ÍCONE DA ARMA ===
function getWeaponIcon(weaponName) {
    const iconMap = {
        normal: '🔫',
        spread: '💥',
        laser: '⚡',
        machine: '🔥',
        plasma: '🌟',
        storm: '⛈️',
        nuclear: '☢️'
    };
    
    return iconMap[weaponName] || '🔫';
}

// === OBTER NOME DE EXIBIÇÃO DA ARMA ===
function getWeaponDisplayName(weaponName) {
    const nameMap = {
        normal: 'Normal',
        spread: 'Spread',
        laser: 'Laser',
        machine: 'Machine Gun',
        plasma: 'Plasma',
        storm: 'Storm',
        nuclear: 'Nuclear'
    };
    
    return nameMap[weaponName] || 'Unknown';
}

// === ADICIONAR ESTILO CSS PARA ANIMAÇÃO ===
const style = document.createElement('style');
style.textContent = `
@keyframes weaponSwitchPop {
    0% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.5);
    }
    30% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1.1);
    }
    100% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(1);
    }
}

.weapon-switch-icon {
    font-size: 32px;
    margin-bottom: 8px;
}

.weapon-switch-name {
    font-size: 18px;
    text-transform: uppercase;
    letter-spacing: 1px;
}
`;
document.head.appendChild(style);

// === EXPOR FUNÇÕES GLOBALMENTE ===
window.handleWeaponSwitch = handleWeaponSwitch;
window.switchWeapon = switchWeapon;
window.cycleWeapon = cycleWeapon;

console.log('🔫 Sistema global de troca de armas carregado!');

/* ==========================================================================
   SISTEMA DE CORAÇÃO ESPECIAL PARA JULIETTE 2D
   ========================================================================== */

// === CONFIGURAÇÃO DO CORAÇÃO ESPECIAL ===
const SPECIAL_HEART_CONFIG = {
    lives: 3,
    ammoReload: 5000,
    glowSpeed: 0.1,
    bounceHeight: 10,
    collectRadius: 50,
    lifetime: 30000, // 30 segundos antes de desaparecer
    sparkleCount: 8
};

// === CLASSE DO CORAÇÃO ESPECIAL ===
class SpecialHeart {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.originalY = y;
        this.width = 40;
        this.height = 40;
        this.type = 'special_heart';
        this.collected = false;
        
        // Propriedades especiais
        this.lives = SPECIAL_HEART_CONFIG.lives;
        this.ammoReload = SPECIAL_HEART_CONFIG.ammoReload;
        
        // Animações
        this.glowPhase = 0;
        this.bouncePhase = 0;
        this.rotationAngle = 0;
        this.sparkles = [];
        this.pulseScale = 1;
        
        // Tempo de vida
        this.createdTime = Date.now();
        this.lifetime = SPECIAL_HEART_CONFIG.lifetime;
        this.blinkWarning = false;
        
        // Inicializar sparkles
        this.initializeSparkles();
        
        console.log('❤️ Coração especial criado!');
    }
    
    // === INICIALIZAR SPARKLES ===
    initializeSparkles() {
        for (let i = 0; i < SPECIAL_HEART_CONFIG.sparkleCount; i++) {
            this.sparkles.push({
                x: 0,
                y: 0,
                angle: (i / SPECIAL_HEART_CONFIG.sparkleCount) * Math.PI * 2,
                distance: 30 + Math.random() * 20,
                speed: 0.02 + Math.random() * 0.03,
                size: 2 + Math.random() * 3,
                alpha: 0.5 + Math.random() * 0.5
            });
        }
    }
    
    // === ATUALIZAR CORAÇÃO ===
    update(deltaTime) {
        const currentTime = Date.now();
        const elapsedTime = currentTime - this.createdTime;
        
        // Verificar se deve desaparecer
        if (elapsedTime > this.lifetime) {
            this.expire();
            return false;
        }
        
        // Aviso de expiração
        if (elapsedTime > this.lifetime * 0.8) {
            this.blinkWarning = true;
        }
        
        // Atualizar animações
        this.updateAnimations(deltaTime);
        
        return true;
    }
    
    // === ATUALIZAR ANIMAÇÕES ===
    updateAnimations(deltaTime) {
        const dt = deltaTime / 16.67; // Normalizar para 60fps
        
        // Brilho pulsante
        this.glowPhase += SPECIAL_HEART_CONFIG.glowSpeed * dt;
        if (this.glowPhase > Math.PI * 2) this.glowPhase = 0;
        
        // Movimento de bounce
        this.bouncePhase += 0.05 * dt;
        if (this.bouncePhase > Math.PI * 2) this.bouncePhase = 0;
        
        this.y = this.originalY + Math.sin(this.bouncePhase) * SPECIAL_HEART_CONFIG.bounceHeight;
        
        // Rotação suave
        this.rotationAngle += 0.02 * dt;
        if (this.rotationAngle > Math.PI * 2) this.rotationAngle = 0;
        
        // Pulso de escala
        this.pulseScale = 1 + Math.sin(this.glowPhase * 2) * 0.1;
        
        // Atualizar sparkles
        this.sparkles.forEach(sparkle => {
            sparkle.angle += sparkle.speed * dt;
            if (sparkle.angle > Math.PI * 2) sparkle.angle = 0;
            
            sparkle.x = this.x + Math.cos(sparkle.angle) * sparkle.distance;
            sparkle.y = this.y + Math.sin(sparkle.angle) * sparkle.distance;
            
            // Pulsação da transparência
            sparkle.alpha = 0.3 + Math.sin(sparkle.angle * 3) * 0.4;
        });
    }
    
    // === VERIFICAR COLISÃO COM JOGADOR ===
    checkCollision(playerX, playerY) {
        const distance = Math.sqrt(
            Math.pow(playerX - this.x, 2) + Math.pow(playerY - this.y, 2)
        );
        
        return distance < SPECIAL_HEART_CONFIG.collectRadius;
    }
    
    // === COLETAR CORAÇÃO ===
    collect(player) {
        if (this.collected) return false;
        
        this.collected = true;
        
        // Aplicar benefícios ao jogador
        this.applyBenefits(player);
        
        // Efeito visual de coleta
        this.createCollectionEffect();
        
        // Efeito sonoro
        this.playCollectionSound();
        
        console.log(`❤️ Coração especial coletado! +${this.lives} vidas, +${this.ammoReload} munições`);
        
        return true;
    }
    
    // === APLICAR BENEFÍCIOS ===
    applyBenefits(player) {
        // Adicionar vidas
        if (typeof player.lives !== 'undefined') {
            player.lives += this.lives;
        } else if (typeof window.lives !== 'undefined') {
            window.lives += this.lives;
        }
        
        // Recarregar munições de todas as armas
        if (typeof player.ammo !== 'undefined') {
            if (typeof player.ammo === 'object') {
                // Sistema de munição por tipo de arma
                Object.keys(player.ammo).forEach(weaponType => {
                    player.ammo[weaponType] += this.ammoReload;
                });
            } else {
                // Sistema de munição única
                player.ammo += this.ammoReload;
            }
        } else if (typeof window.ammo !== 'undefined') {
            if (typeof window.ammo === 'object') {
                Object.keys(window.ammo).forEach(weaponType => {
                    window.ammo[weaponType] += this.ammoReload;
                });
            } else {
                window.ammo += this.ammoReload;
            }
        }
        
        // Mostrar notificação
        this.showCollectionNotification();
    }
    
    // === CRIAR EFEITO DE COLETA ===
    createCollectionEffect() {
        const particles = [];
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: this.x,
                y: this.y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1.0,
                decay: 0.02 + Math.random() * 0.03,
                size: 3 + Math.random() * 5,
                color: `hsl(${Math.random() * 60 + 300}, 100%, 70%)` // Rosa/vermelho
            });
        }
        
        // Adicionar partículas ao sistema global (se existir)
        if (typeof window.addParticles === 'function') {
            window.addParticles(particles);
        }
        
        // Efeito de flash
        this.createFlashEffect();
    }
    
    // === CRIAR EFEITO DE FLASH ===
    createFlashEffect() {
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: radial-gradient(circle at 50% 50%, 
                rgba(255, 20, 147, 0.3) 0%, 
                rgba(255, 105, 180, 0.2) 30%, 
                transparent 70%);
            pointer-events: none;
            z-index: 9998;
            animation: heartFlash 0.5s ease-out forwards;
        `;
        
        // Adicionar animação CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes heartFlash {
                0% { opacity: 1; transform: scale(0.8); }
                50% { opacity: 0.7; transform: scale(1.2); }
                100% { opacity: 0; transform: scale(1.5); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(flash);
        
        // Remover após animação
        setTimeout(() => {
            if (flash.parentNode) {
                flash.parentNode.removeChild(flash);
            }
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        }, 500);
    }
    
    // === MOSTRAR NOTIFICAÇÃO DE COLETA ===
    showCollectionNotification() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, 
                rgba(255, 20, 147, 0.95) 0%, 
                rgba(220, 20, 60, 0.95) 100%);
            color: white;
            padding: 20px 30px;
            border-radius: 15px;
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            z-index: 10000;
            border: 2px solid rgba(255, 255, 255, 0.3);
            box-shadow: 
                0 8px 25px rgba(255, 20, 147, 0.6),
                inset 0 1px 3px rgba(255, 255, 255, 0.3);
            animation: heartCollectNotify 3s ease-out forwards;
        `;
        
        notification.innerHTML = `
            ❤️ CORAÇÃO ESPECIAL! ❤️<br>
            <div style="font-size: 14px; margin-top: 8px; opacity: 0.9;">
                +${this.lives} Vidas | +${this.ammoReload} Munições<br>
                <span style="color: #FFD700;">Todas as armas recarregadas!</span>
            </div>
        `;
        
        // Adicionar animação
        const style = document.createElement('style');
        style.textContent = `
            @keyframes heartCollectNotify {
                0% { 
                    opacity: 0; 
                    transform: translateX(-50%) translateY(-50px) scale(0.8); 
                }
                20% { 
                    opacity: 1; 
                    transform: translateX(-50%) translateY(0) scale(1.1); 
                }
                80% { 
                    opacity: 1; 
                    transform: translateX(-50%) translateY(0) scale(1); 
                }
                100% { 
                    opacity: 0; 
                    transform: translateX(-50%) translateY(30px) scale(0.9); 
                }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Remover após animação
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        }, 3000);
    }
    
    // === REPRODUZIR SOM DE COLETA ===
    playCollectionSound() {
        // Tentar reproduzir som via sistema do jogo
        if (typeof window.playSound === 'function') {
            window.playSound('special_heart_collect');
        } else if (typeof window.audioEnabled !== 'undefined' && window.audioEnabled) {
            // Fallback para WebAudio API
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                // Som especial de coleta (acorde harmonioso)
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
                oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
                oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
                
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.5);
            } catch (error) {
                console.warn('Não foi possível reproduzir som de coleta:', error);
            }
        }
    }
    
    // === EXPIRAR CORAÇÃO ===
    expire() {
        console.log('❤️ Coração especial expirou');
        
        // Efeito visual de expiração
        this.createExpirationEffect();
        
        // Marcar como coletado para remoção
        this.collected = true;
    }
    
    // === CRIAR EFEITO DE EXPIRAÇÃO ===
    createExpirationEffect() {
        // Partículas de desaparecimento
        const particles = [];
        for (let i = 0; i < 15; i++) {
            particles.push({
                x: this.x,
                y: this.y,
                vx: (Math.random() - 0.5) * 3,
                vy: -Math.random() * 5 - 2,
                life: 1.0,
                decay: 0.03,
                size: 2 + Math.random() * 3,
                color: 'rgba(255, 255, 255, 0.8)'
            });
        }
        
        if (typeof window.addParticles === 'function') {
            window.addParticles(particles);
        }
    }
    
    // === RENDERIZAR CORAÇÃO ===
    render(ctx) {
        if (this.collected) return;
        
        ctx.save();
        
        // Efeito de aviso de expiração
        if (this.blinkWarning) {
            const blinkAlpha = Math.sin(Date.now() * 0.01) * 0.5 + 0.5;
            ctx.globalAlpha = blinkAlpha;
        }
        
        // Transladar para posição do coração
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotationAngle);
        ctx.scale(this.pulseScale, this.pulseScale);
        
        // Efeito de brilho
        const glowIntensity = Math.sin(this.glowPhase) * 0.5 + 0.5;
        ctx.shadowBlur = 20 + glowIntensity * 15;
        ctx.shadowColor = '#FF1493';
        
        // Renderizar sparkles
        this.renderSparkles(ctx);
        
        // Desenhar coração
        this.drawHeart(ctx);
        
        // Desenhar aura
        this.drawAura(ctx);
        
        // Desenhar indicadores de benefícios
        this.drawBenefitIndicators(ctx);
        
        ctx.restore();
    }
    
    // === RENDERIZAR SPARKLES ===
    renderSparkles(ctx) {
        ctx.save();
        ctx.scale(1/this.pulseScale, 1/this.pulseScale); // Compensar escala
        ctx.rotate(-this.rotationAngle); // Compensar rotação
        
        this.sparkles.forEach(sparkle => {
            ctx.save();
            ctx.globalAlpha = sparkle.alpha;
            ctx.fillStyle = '#FFD700';
            
            const sparkleX = sparkle.x - this.x;
            const sparkleY = sparkle.y - this.y;
            
            ctx.translate(sparkleX, sparkleY);
            ctx.rotate(sparkle.angle * 2);
            
            // Desenhar sparkle como estrela
            ctx.beginPath();
            for (let i = 0; i < 4; i++) {
                const angle = (i * Math.PI) / 2;
                const x = Math.cos(angle) * sparkle.size;
                const y = Math.sin(angle) * sparkle.size;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            
            ctx.restore();
        });
        
        ctx.restore();
    }
    
    // === DESENHAR CORAÇÃO ===
    drawHeart(ctx) {
        const size = this.width / 2;
        
        // Coração principal
        ctx.fillStyle = '#FF1493';
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        
        ctx.beginPath();
        ctx.moveTo(0, size * 0.3);
        
        // Lado esquerdo
        ctx.bezierCurveTo(-size, -size * 0.3, -size, size * 0.3, 0, size);
        
        // Lado direito
        ctx.bezierCurveTo(size, size * 0.3, size, -size * 0.3, 0, size * 0.3);
        
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Brilho interno
        const gradient = ctx.createRadialGradient(-size/3, -size/3, 0, 0, 0, size);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 20, 147, 0.4)');
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.fill();
    }
    
    // === DESENHAR AURA ===
    drawAura(ctx) {
        const auraSize = this.width * 1.5;
        const auraAlpha = (Math.sin(this.glowPhase * 2) * 0.3 + 0.4);
        
        ctx.save();
        ctx.globalAlpha = auraAlpha;
        
        // Aura externa
        const auraGradient = ctx.createRadialGradient(0, 0, auraSize * 0.3, 0, 0, auraSize);
        auraGradient.addColorStop(0, 'rgba(255, 20, 147, 0.6)');
        auraGradient.addColorStop(0.7, 'rgba(255, 105, 180, 0.3)');
        auraGradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = auraGradient;
        ctx.beginPath();
        ctx.arc(0, 0, auraSize, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    // === DESENHAR INDICADORES DE BENEFÍCIOS ===
    drawBenefitIndicators(ctx) {
        ctx.save();
        ctx.scale(1/this.pulseScale, 1/this.pulseScale);
        ctx.rotate(-this.rotationAngle);
        
        // Indicador de vidas
        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.textAlign = 'center';
        
        const livesText = `+${this.lives} ❤️`;
        ctx.strokeText(livesText, 0, -this.width);
        ctx.fillText(livesText, 0, -this.width);
        
        // Indicador de munição
        const ammoText = `+${this.ammoReload} 🔫`;
        ctx.strokeText(ammoText, 0, this.width + 15);
        ctx.fillText(ammoText, 0, this.width + 15);
        
        ctx.restore();
    }
}

// === SISTEMA DE GERENCIAMENTO DE CORAÇÕES ===
class SpecialHeartManager {
    constructor() {
        this.hearts = [];
    }
    
    // === ADICIONAR CORAÇÃO ===
    addHeart(x, y) {
        const heart = new SpecialHeart(x, y);
        this.hearts.push(heart);
        return heart;
    }
    
    // === ATUALIZAR TODOS OS CORAÇÕES ===
    update(deltaTime) {
        this.hearts = this.hearts.filter(heart => {
            return heart.update(deltaTime);
        });
    }
    
    // === VERIFICAR COLISÕES ===
    checkCollisions(playerX, playerY, player) {
        let collected = false;
        
        this.hearts.forEach((heart, index) => {
            if (!heart.collected && heart.checkCollision(playerX, playerY)) {
                if (heart.collect(player)) {
                    collected = true;
                    this.hearts.splice(index, 1);
                }
            }
        });
        
        return collected;
    }
    
    // === RENDERIZAR TODOS OS CORAÇÕES ===
    render(ctx) {
        this.hearts.forEach(heart => {
            heart.render(ctx);
        });
    }
    
    // === LIMPAR TODOS OS CORAÇÕES ===
    clear() {
        this.hearts = [];
    }
    
    // === OBTER QUANTIDADE DE CORAÇÕES ===
    getHeartCount() {
        return this.hearts.filter(heart => !heart.collected).length;
    }
}

// === INTEGRAÇÃO GLOBAL ===
let specialHeartManager = new SpecialHeartManager();

// === FUNÇÕES GLOBAIS ===
function createSpecialHeart(x, y) {
    return specialHeartManager.addHeart(x, y);
}

function updateSpecialHearts(deltaTime) {
    specialHeartManager.update(deltaTime);
}

function checkSpecialHeartCollisions(playerX, playerY, player) {
    return specialHeartManager.checkCollisions(playerX, playerY, player);
}

function renderSpecialHearts(ctx) {
    specialHeartManager.render(ctx);
}

function clearAllSpecialHearts() {
    specialHeartManager.clear();
}

// === EXPOR GLOBALMENTE ===
window.SpecialHeart = SpecialHeart;
window.SpecialHeartManager = SpecialHeartManager;
window.specialHeartManager = specialHeartManager;
window.createSpecialHeart = createSpecialHeart;
window.updateSpecialHearts = updateSpecialHearts;
window.checkSpecialHeartCollisions = checkSpecialHeartCollisions;
window.renderSpecialHearts = renderSpecialHearts;
window.clearAllSpecialHearts = clearAllSpecialHearts;

console.log('❤️ Sistema de Coração Especial carregado!');

/* ==========================================================================
   INTEGRAÇÃO DO SISTEMA DE IA COM O JOGO PRINCIPAL - JULIETTE 2D
   ========================================================================== */

// === ESTADO DA INTEGRAÇÃO ===
let aiIntegrationState = {
    initialized: false,
    gameLoopHooked: false,
    collisionSystemHooked: false,
    renderSystemHooked: false,
    originalFunctions: {},
    statsDisplay: null
};

// === INICIALIZAR INTEGRAÇÃO ===
function initializeAIIntegration() {
    if (aiIntegrationState.initialized) {
        console.log('⚠️ Sistema de IA já foi inicializado');
        return;
    }

    console.log('🔗 Inicializando integração do sistema de IA...');

    // Aguardar que os sistemas estejam carregados
    if (typeof initializeEnemyAI !== 'function') {
        console.log('⏳ Aguardando carregamento do sistema de IA...');
        setTimeout(initializeAIIntegration, 1000);
        return;
    }

    // Inicializar sistemas de IA
    initializeEnemyAI();
    
    // Inicializar gerador de mapas
    if (typeof initializeMapGenerator === 'function') {
        initializeMapGenerator();
    }

    // Hook no loop principal do jogo
    hookGameLoop();
    
    // Hook no sistema de colisões
    hookCollisionSystem();
    
    // Hook no sistema de renderização
    hookRenderSystem();
    
    // Criar display de estatísticas
    createStatsDisplay();
    
    // Adicionar controles de debug
    addDebugControls();

    aiIntegrationState.initialized = true;
    console.log('✅ Sistema de IA integrado com sucesso!');
}

// === HOOK NO LOOP PRINCIPAL ===
function hookGameLoop() {
    if (aiIntegrationState.gameLoopHooked) return;

    // Procurar pela função de game loop
    const possibleLoopNames = ['gameLoop', 'update', 'mainLoop', 'tick'];
    let gameLoopFunction = null;
    
    for (const name of possibleLoopNames) {
        if (typeof window[name] === 'function') {
            gameLoopFunction = window[name];
            aiIntegrationState.originalFunctions[name] = gameLoopFunction;
            console.log(`🔄 Hook encontrado na função: ${name}`);
            break;
        }
    }

    if (gameLoopFunction) {
        // Criar nova função que inclui a IA
        const originalLoop = gameLoopFunction;
        
        window[possibleLoopNames.find(name => window[name] === originalLoop)] = function(...args) {
            // Executar loop original
            const result = originalLoop.apply(this, args);
            
            // Atualizar sistema de IA
            updateAISystems();
            
            return result;
        };
        
        aiIntegrationState.gameLoopHooked = true;
        console.log('🔄 Game loop integrado com sistema de IA');
    } else {
        // Fallback: criar nosso próprio loop de IA
        console.log('⚠️ Game loop não encontrado, criando loop independente');
        startIndependentAILoop();
    }
}

// === ATUALIZAR SISTEMAS DE IA ===
function updateAISystems() {
    if (!enemySpawner) return;

    try {
        // Obter posição do jogador
        const playerPos = getPlayerPosition();
        if (!playerPos) return;

        const deltaTime = 16.67; // ~60fps

        // Atualizar spawner de inimigos
        enemySpawner.update(deltaTime);
        
        // Atualizar todos os inimigos
        enemySpawner.updateEnemies(playerPos.x, playerPos.y, deltaTime);
        
        // Atualizar corações especiais
        if (typeof updateSpecialHearts === 'function') {
            updateSpecialHearts(deltaTime);
        }

        // Verificar colisões com corações especiais
        if (typeof checkSpecialHeartCollisions === 'function') {
            const player = getPlayerObject();
            checkSpecialHeartCollisions(playerPos.x, playerPos.y, player);
        }
        
        // Verificar colisões com mapa procedural
        if (typeof checkMapCollisions === 'function') {
            const mapCollisions = checkMapCollisions(playerPos.x, playerPos.y);
            handleMapCollisions(mapCollisions);
        }

        // Atualizar estatísticas
        updateStatsDisplay();

    } catch (error) {
        console.warn('❌ Erro ao atualizar sistemas de IA:', error);
    }
}

// === OBTER POSIÇÃO DO JOGADOR ===
function getPlayerPosition() {
    // Tentar várias maneiras de obter a posição do jogador
    if (typeof player !== 'undefined' && player.x !== undefined) {
        return { x: player.x, y: player.y };
    }
    
    if (typeof window.player !== 'undefined' && window.player.x !== undefined) {
        return { x: window.player.x, y: window.player.y };
    }
    
    if (typeof playerX !== 'undefined' && typeof playerY !== 'undefined') {
        return { x: playerX, y: playerY };
    }
    
    if (typeof window.playerX !== 'undefined' && typeof window.playerY !== 'undefined') {
        return { x: window.playerX, y: window.playerY };
    }

    // Fallback para center da tela
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
        return { x: canvas.width / 2, y: canvas.height / 2 };
    }

    return { x: 400, y: 300 };
}

// === OBTER OBJETO DO JOGADOR ===
function getPlayerObject() {
    if (typeof player !== 'undefined') {
        return player;
    }
    
    if (typeof window.player !== 'undefined') {
        return window.player;
    }

    // Retornar objeto simulado
    return {
        x: getPlayerPosition().x,
        y: getPlayerPosition().y,
        lives: window.lives || 3,
        ammo: window.ammo || 1000
    };
}

// === HOOK NO SISTEMA DE COLISÕES ===
function hookCollisionSystem() {
    if (aiIntegrationState.collisionSystemHooked) return;

    // Interceptar função de colisão de projéteis (se existir)
    const possibleCollisionNames = ['checkCollisions', 'handleCollisions', 'updateCollisions', 'checkBulletCollisions'];
    
    for (const name of possibleCollisionNames) {
        if (typeof window[name] === 'function') {
            const originalFunction = window[name];
            aiIntegrationState.originalFunctions[name] = originalFunction;
            
            window[name] = function(...args) {
                // Executar função original
                const result = originalFunction.apply(this, args);
                
                // Verificar colisões com nossos inimigos de IA
                checkAIEnemyCollisions();
                
                return result;
            };
            
            console.log(`🎯 Sistema de colisões integrado via ${name}`);
            aiIntegrationState.collisionSystemHooked = true;
            break;
        }
    }

    if (!aiIntegrationState.collisionSystemHooked) {
        console.log('⚠️ Sistema de colisões não encontrado, usando verificação independente');
    }
}

// === VERIFICAR COLISÕES COM INIMIGOS DE IA ===
function checkAIEnemyCollisions() {
    if (!enemySpawner || !enemySpawner.enemies) return;

    try {
        // Verificar colisões com projéteis do jogador
        const bullets = getBullets();
        if (bullets && bullets.length > 0) {
            enemySpawner.enemies.forEach((enemy, enemyIndex) => {
                bullets.forEach((bullet, bulletIndex) => {
                    if (checkBulletEnemyCollision(bullet, enemy)) {
                        // Aplicar dano ao inimigo
                        const died = enemy.takeDamage(bullet.damage || 20);
                        
                        if (died) {
                            enemySpawner.removeEnemy(enemyIndex);
                        }
                        
                        // Remover projétil
                        if (typeof removeBullet === 'function') {
                            removeBullet(bulletIndex);
                        } else if (bullets.splice) {
                            bullets.splice(bulletIndex, 1);
                        }
                        
                        // Efeitos de impacto
                        createImpactEffect(bullet.x, bullet.y);
                    }
                });
            });
        }

        // Verificar colisões com o jogador
        const playerPos = getPlayerPosition();
        enemySpawner.enemies.forEach((enemy, index) => {
            const distance = Math.sqrt(
                Math.pow(playerPos.x - enemy.x, 2) + Math.pow(playerPos.y - enemy.y, 2)
            );
            
            if (distance < (enemy.size + 25)) { // 25px de raio do jogador
                // Jogador tocou no inimigo - aplicar dano
                handlePlayerEnemyCollision(enemy);
            }
        });

    } catch (error) {
        console.warn('❌ Erro ao verificar colisões de IA:', error);
    }
}

// === VERIFICAR COLISÃO PROJÉTIL-INIMIGO ===
function checkBulletEnemyCollision(bullet, enemy) {
    if (!bullet || !enemy) return false;
    
    const distance = Math.sqrt(
        Math.pow(bullet.x - enemy.x, 2) + Math.pow(bullet.y - enemy.y, 2)
    );
    
    return distance < (enemy.size + (bullet.size || 5));
}

// === OBTER PROJÉTEIS ===
function getBullets() {
    // Tentar várias maneiras de obter os projéteis
    if (typeof bullets !== 'undefined') {
        return bullets;
    }
    
    if (typeof window.bullets !== 'undefined') {
        return window.bullets;
    }
    
    if (typeof projectiles !== 'undefined') {
        return projectiles;
    }
    
    if (typeof window.projectiles !== 'undefined') {
        return window.projectiles;
    }
    
    return [];
}

// === CRIAR EFEITO DE IMPACTO ===
function createImpactEffect(x, y) {
    // Criar partículas de impacto
    const particles = [];
    for (let i = 0; i < 10; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            life: 1.0,
            decay: 0.05,
            size: 2 + Math.random() * 4,
            color: `hsl(${Math.random() * 60 + 15}, 100%, 50%)`
        });
    }
    
    if (typeof window.addParticles === 'function') {
        window.addParticles(particles);
    }
}

// === LIDAR COM COLISÃO JOGADOR-INIMIGO ===
function handlePlayerEnemyCollision(enemy) {
    // Aplicar dano ao jogador
    if (typeof window.lives !== 'undefined' && window.lives > 0) {
        window.lives--;
        console.log(`💔 Jogador perdeu 1 vida! Vidas restantes: ${window.lives}`);
    }
    
    // Efeito de impacto no jogador
    const playerPos = getPlayerPosition();
    createImpactEffect(playerPos.x, playerPos.y);
    
    // Feedback háptico
    if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
    }
}

// === LIDAR COM COLISÕES DO MAPA PROCEDURAL ===
function handleMapCollisions(collisions) {
    if (!collisions || Object.keys(collisions).length === 0) return;
    
    try {
        // Aplicar colisões de plataformas
        if (collisions.platforms) {
            // Ajustar posição do jogador se necessário
            const playerPos = getPlayerPosition();
            
            collisions.platforms.forEach(platform => {
                if (platform.blocked) {
                    // Impedir movimento em direção bloqueada
                    if (typeof updatePlayerPosition === 'function') {
                        updatePlayerPosition(platform.correctedX, platform.correctedY);
                    }
                }
            });
        }
        
        // Lidar com obstáculos especiais
        if (collisions.obstacles) {
            collisions.obstacles.forEach(obstacle => {
                switch (obstacle.type) {
                    case 'spikes':
                        // Aplicar dano de espinhos
                        if (typeof window.lives !== 'undefined' && window.lives > 0) {
                            window.lives--;
                            console.log('⚡ Jogador pisou em espinhos!');
                            
                            // Feedback visual e háptico
                            const playerPos = getPlayerPosition();
                            createImpactEffect(playerPos.x, playerPos.y);
                            if (navigator.vibrate) {
                                navigator.vibrate([100, 50, 100, 50, 100]);
                            }
                        }
                        break;
                        
                    case 'lava':
                        // Dano contínuo de lava
                        if (typeof window.lives !== 'undefined' && window.lives > 0) {
                            window.lives -= 2; // Dano dobrado
                            console.log('🌋 Jogador tocou na lava!');
                            
                            const playerPos = getPlayerPosition();
                            createImpactEffect(playerPos.x, playerPos.y);
                            if (navigator.vibrate) {
                                navigator.vibrate([200, 100, 200, 100, 200]);
                            }
                        }
                        break;
                        
                    case 'teleport':
                        // Teletransporte
                        if (obstacle.teleportTo && typeof updatePlayerPosition === 'function') {
                            updatePlayerPosition(obstacle.teleportTo.x, obstacle.teleportTo.y);
                            console.log('🌀 Jogador foi teletransportado!');
                        }
                        break;
                }
            });
        }
        
        // Lidar com elementos de decoração interativos
        if (collisions.decorations) {
            collisions.decorations.forEach(decoration => {
                if (decoration.interactive) {
                    // Pode implementar efeitos especiais de decorações
                    console.log(`🎨 Interação com decoração: ${decoration.type}`);
                }
            });
        }
        
    } catch (error) {
        console.warn('❌ Erro ao lidar com colisões do mapa:', error);
    }
}

// === HOOK NO SISTEMA DE RENDERIZAÇÃO ===
function hookRenderSystem() {
    if (aiIntegrationState.renderSystemHooked) return;

    // Procurar função de renderização
    const possibleRenderNames = ['render', 'draw', 'paint', 'renderGame'];
    
    for (const name of possibleRenderNames) {
        if (typeof window[name] === 'function') {
            const originalFunction = window[name];
            aiIntegrationState.originalFunctions[name] = originalFunction;
            
            window[name] = function(...args) {
                // Executar renderização original
                const result = originalFunction.apply(this, args);
                
                // Renderizar elementos de IA
                renderAIElements();
                
                return result;
            };
            
            console.log(`🎨 Sistema de renderização integrado via ${name}`);
            aiIntegrationState.renderSystemHooked = true;
            break;
        }
    }

    if (!aiIntegrationState.renderSystemHooked) {
        console.log('⚠️ Sistema de renderização não encontrado, usando canvas direto');
        // Fallback: renderizar diretamente no canvas
        startIndependentRender();
    }
}

// === RENDERIZAR ELEMENTOS DE IA ===
function renderAIElements() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
        // Renderizar mapa procedural (primeiro, no fundo)
        if (typeof renderCurrentMap === 'function') {
            renderCurrentMap(ctx);
        }
        
        // Renderizar inimigos de IA
        if (enemySpawner) {
            enemySpawner.renderEnemies(ctx);
        }
        
        // Renderizar corações especiais
        if (typeof renderSpecialHearts === 'function') {
            renderSpecialHearts(ctx);
        }

    } catch (error) {
        console.warn('❌ Erro ao renderizar elementos de IA:', error);
    }
}

// === CRIAR DISPLAY DE ESTATÍSTICAS ===
function createStatsDisplay() {
    const statsDiv = document.createElement('div');
    statsDiv.id = 'ai-stats-display';
    statsDiv.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 10px;
        border-radius: 5px;
        font-family: monospace;
        font-size: 12px;
        z-index: 9999;
        pointer-events: none;
        display: none;
    `;
    
    document.body.appendChild(statsDiv);
    aiIntegrationState.statsDisplay = statsDiv;
    
    console.log('📊 Display de estatísticas criado');
}

// === ATUALIZAR DISPLAY DE ESTATÍSTICAS ===
function updateStatsDisplay() {
    if (!aiIntegrationState.statsDisplay) return;

    const stats = {
        'Inimigos Spawned': enemyAIState.totalEnemiesSpawned,
        'Inimigos Mortos': enemyAIState.totalEnemiesKilled,
        'Inimigos Ativos': enemySpawner ? enemySpawner.enemies.length : 0,
        'Chefe Ativo': enemyAIState.bossSpawned ? '👑 SIM' : 'Não',
        'API Gemini': enemyAIState.aiEnabled ? '🤖 ATIVA' : '❌ OFF',
        'Corações': specialHeartManager ? specialHeartManager.getHeartCount() : 0,
        '---MAPAS---': '---',
        'Mapa Atual': typeof getMapGeneratorStats === 'function' ? 
            getMapGeneratorStats().currentMapId?.substring(0, 15) + '...' : 'N/A',
        'Tema/Diff': typeof getMapGeneratorStats === 'function' ?
            `${getMapGeneratorStats().currentTheme}/${getMapGeneratorStats().currentDifficulty}` : 'N/A',
        'Mapas Gerados': typeof getMapGeneratorStats === 'function' ? 
            getMapGeneratorStats().mapsGenerated : 0,
        'API Mapas': typeof mapGeneratorState !== 'undefined' && mapGeneratorState.apiEnabled ? '🗺️ ON' : '❌ OFF'
    };

    let html = '<strong>🤖 IA STATUS</strong><br>';
    Object.entries(stats).forEach(([key, value]) => {
        html += `${key}: ${value}<br>`;
    });

    aiIntegrationState.statsDisplay.innerHTML = html;
}

// === ADICIONAR CONTROLES DE DEBUG ===
function addDebugControls() {
    // Adicionar tecla F12 para toggle do display de stats
    document.addEventListener('keydown', (e) => {
        if (e.key === 'F12') {
            e.preventDefault();
            toggleStatsDisplay();
        }
        
        // Tecla F11 para toggle da IA
        if (e.key === 'F11') {
            e.preventDefault();
            if (typeof toggleAI === 'function') {
                const isEnabled = toggleAI();
                showDebugMessage(`IA ${isEnabled ? 'ATIVADA' : 'DESATIVADA'}`);
            }
        }
        
        // Tecla F10 para spawnar chefe manualmente
        if (e.key === 'F10') {
            e.preventDefault();
            if (enemySpawner && !enemyAIState.bossSpawned) {
                enemySpawner.spawnBoss();
                showDebugMessage('👑 CHEFE SPAWNED MANUALMENTE!');
            }
        }
        
        // Tecla F9 para limpar todos os inimigos
        if (e.key === 'F9') {
            e.preventDefault();
            if (enemySpawner) {
                enemySpawner.clearAllEnemies();
                showDebugMessage('🧹 Todos os inimigos removidos');
            }
        }
        
        // Tecla F8 para gerar novo mapa
        if (e.key === 'F8') {
            e.preventDefault();
            if (typeof forceRegenerateMap === 'function') {
                forceRegenerateMap();
                showDebugMessage('🗺️ NOVO MAPA GERADO!');
            }
        }
        
        // Tecla F7 para toggle da API de mapas
        if (e.key === 'F7') {
            e.preventDefault();
            if (typeof toggleMapGeneratorAPI === 'function') {
                const isEnabled = toggleMapGeneratorAPI();
                showDebugMessage(`API MAPAS ${isEnabled ? 'ATIVADA' : 'DESATIVADA'}`);
            }
        }
    });

    console.log('🎮 Controles de debug adicionados (F9-F12)');
}

// === TOGGLE DO DISPLAY DE ESTATÍSTICAS ===
function toggleStatsDisplay() {
    if (!aiIntegrationState.statsDisplay) return;
    
    const isVisible = aiIntegrationState.statsDisplay.style.display !== 'none';
    aiIntegrationState.statsDisplay.style.display = isVisible ? 'none' : 'block';
    
    console.log(`📊 Display de stats ${isVisible ? 'OCULTO' : 'MOSTRADO'}`);
}

// === MOSTRAR MENSAGEM DE DEBUG ===
function showDebugMessage(message) {
    const debugMsg = document.createElement('div');
    debugMsg.style.cssText = `
        position: fixed;
        top: 50px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 255, 255, 0.9);
        color: black;
        padding: 10px 20px;
        border-radius: 5px;
        font-weight: bold;
        z-index: 10000;
        animation: debugFade 2s ease-out forwards;
    `;
    
    debugMsg.textContent = message;
    
    // Adicionar animação
    const style = document.createElement('style');
    style.textContent = `
        @keyframes debugFade {
            0% { opacity: 1; transform: translateX(-50%) translateY(0); }
            80% { opacity: 1; }
            100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(debugMsg);
    
    setTimeout(() => {
        if (debugMsg.parentNode) debugMsg.parentNode.removeChild(debugMsg);
        if (style.parentNode) style.parentNode.removeChild(style);
    }, 2000);
}

// === LOOP INDEPENDENTE PARA IA ===
function startIndependentAILoop() {
    console.log('🔄 Iniciando loop independente para IA');
    
    function independentLoop() {
        updateAISystems();
        requestAnimationFrame(independentLoop);
    }
    
    requestAnimationFrame(independentLoop);
}

// === RENDERIZAÇÃO INDEPENDENTE ===
function startIndependentRender() {
    console.log('🎨 Iniciando renderização independente para IA');
    
    function independentRender() {
        renderAIElements();
        requestAnimationFrame(independentRender);
    }
    
    requestAnimationFrame(independentRender);
}

// === INICIALIZAÇÃO AUTOMÁTICA ===
document.addEventListener('DOMContentLoaded', () => {
    // Aguardar um pouco para o jogo carregar
    setTimeout(() => {
        initializeAIIntegration();
    }, 2000);
});

// === EXPOR FUNÇÕES GLOBALMENTE ===
window.aiIntegrationState = aiIntegrationState;
window.initializeAIIntegration = initializeAIIntegration;
window.updateAISystems = updateAISystems;
window.toggleStatsDisplay = toggleStatsDisplay;

console.log('🔗 Sistema de integração de IA carregado!');

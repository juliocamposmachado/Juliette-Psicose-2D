/* ==========================================================================
   SISTEMA DE INTELIGÊNCIA ARTIFICIAL PARA INIMIGOS - JULIETTE 2D
   ========================================================================== */

// === CONFIGURAÇÃO DA API GEMINI ===
const GEMINI_CONFIG = {
    API_URL: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent",
    API_KEY: "AIzaSyAWkTqpCr3kNcvgHg3AYjfxcaWvjObbOiw"
};

// === ESTADO GLOBAL DOS INIMIGOS ===
let enemyAIState = {
    totalEnemiesSpawned: 0,
    totalEnemiesKilled: 0,
    bossSpawned: false,
    currentBoss: null,
    aiResponses: new Map(), // Cache de respostas da IA
    lastAIRequest: 0,
    requestCooldown: 2000, // 2 segundos entre requests
    aiEnabled: true
};

// === TIPOS DE INIMIGOS ===
const ENEMY_TYPES = {
    NORMAL: {
        name: 'Normal',
        health: 100,
        speed: 2,
        damage: 20,
        color: '#FF4444',
        size: 30,
        ai: 'basic'
    },
    SMART: {
        name: 'Smart',
        health: 150,
        speed: 2.5,
        damage: 25,
        color: '#44FF44',
        size: 35,
        ai: 'advanced'
    },
    TANK: {
        name: 'Tank',
        health: 300,
        speed: 1,
        damage: 40,
        color: '#4444FF',
        size: 50,
        ai: 'defensive'
    },
    BOSS: {
        name: 'Boss',
        health: 1000,
        speed: 1.5,
        damage: 60,
        color: '#FF00FF',
        size: 80,
        ai: 'boss'
    }
};

// === CLASSE BASE DO INIMIGO COM IA ===
class AIEnemy {
    constructor(x, y, type = 'NORMAL') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.config = ENEMY_TYPES[type];
        this.health = this.config.health;
        this.maxHealth = this.config.health;
        this.speed = this.config.speed;
        this.damage = this.config.damage;
        this.color = this.config.color;
        this.size = this.config.size;
        this.aiType = this.config.ai;
        
        // Estados de IA
        this.aiState = 'hunting';
        this.lastAIUpdate = 0;
        this.aiUpdateInterval = 1000; // Atualizar IA a cada 1 segundo
        this.targetX = x;
        this.targetY = y;
        this.lastPlayerDistance = Infinity;
        this.stuckCounter = 0;
        this.retreatTimer = 0;
        this.attackCooldown = 0;
        
        // Estados específicos do chefe
        this.isBoss = type === 'BOSS';
        this.bossPhase = 1;
        this.specialAttackCooldown = 0;
        this.minions = [];
        
        // Animação e efeitos
        this.angle = 0;
        this.glowIntensity = 0;
        this.lastHitTime = 0;
        
        console.log(`🤖 Inimigo ${this.config.name} criado com IA ${this.aiType}`);
    }
    
    // === ATUALIZAR IA DO INIMIGO ===
    async update(playerX, playerY, deltaTime) {
        const currentTime = Date.now();
        
        // Atualizar cooldowns
        if (this.attackCooldown > 0) this.attackCooldown -= deltaTime;
        if (this.specialAttackCooldown > 0) this.specialAttackCooldown -= deltaTime;
        if (this.retreatTimer > 0) this.retreatTimer -= deltaTime;
        
        // Calcular distância do jogador
        const distanceToPlayer = Math.sqrt(
            Math.pow(playerX - this.x, 2) + Math.pow(playerY - this.y, 2)
        );
        
        // Atualizar IA baseada no tipo
        if (currentTime - this.lastAIUpdate > this.aiUpdateInterval) {
            await this.updateAIBehavior(playerX, playerY, distanceToPlayer);
            this.lastAIUpdate = currentTime;
        }
        
        // Executar movimento baseado na IA
        this.executeMovement(deltaTime);
        
        // Atualizar animações
        this.updateAnimations(deltaTime);
        
        // Verificar se está preso
        this.checkIfStuck(distanceToPlayer);
        
        this.lastPlayerDistance = distanceToPlayer;
    }
    
    // === ATUALIZAR COMPORTAMENTO DA IA ===
    async updateAIBehavior(playerX, playerY, distanceToPlayer) {
        if (!enemyAIState.aiEnabled) {
            this.basicAI(playerX, playerY, distanceToPlayer);
            return;
        }
        
        try {
            switch (this.aiType) {
                case 'basic':
                    this.basicAI(playerX, playerY, distanceToPlayer);
                    break;
                    
                case 'advanced':
                    await this.advancedAI(playerX, playerY, distanceToPlayer);
                    break;
                    
                case 'defensive':
                    await this.defensiveAI(playerX, playerY, distanceToPlayer);
                    break;
                    
                case 'boss':
                    await this.bossAI(playerX, playerY, distanceToPlayer);
                    break;
            }
        } catch (error) {
            console.warn('❌ Erro na IA, usando comportamento básico:', error);
            this.basicAI(playerX, playerY, distanceToPlayer);
        }
    }
    
    // === IA BÁSICA (SEM API) ===
    basicAI(playerX, playerY, distanceToPlayer) {
        if (this.health < this.maxHealth * 0.3 && distanceToPlayer < 100) {
            // Fugir se com pouca vida
            this.aiState = 'retreating';
            this.targetX = this.x + (this.x - playerX) * 0.1;
            this.targetY = this.y + (this.y - playerY) * 0.1;
        } else if (distanceToPlayer < 200) {
            // Perseguir jogador
            this.aiState = 'hunting';
            this.targetX = playerX;
            this.targetY = playerY;
        } else {
            // Patrulhar
            this.aiState = 'patrolling';
            if (Math.random() < 0.1) {
                this.targetX = this.x + (Math.random() - 0.5) * 200;
                this.targetY = this.y + (Math.random() - 0.5) * 200;
            }
        }
    }
    
    // === IA AVANÇADA (COM API GEMINI) ===
    async advancedAI(playerX, playerY, distanceToPlayer) {
        const aiKey = `advanced_${Math.floor(distanceToPlayer/50)}_${this.health < this.maxHealth * 0.5 ? 'low' : 'high'}`;
        
        let response = enemyAIState.aiResponses.get(aiKey);
        if (!response && this.canMakeAIRequest()) {
            response = await this.requestAIDecision({
                enemyType: 'Smart Enemy',
                playerDistance: distanceToPlayer,
                enemyHealth: this.health,
                maxHealth: this.maxHealth,
                context: 'Advanced combat AI that can predict player movements and use tactical positioning'
            });
            
            if (response) {
                enemyAIState.aiResponses.set(aiKey, response);
            }
        }
        
        if (response) {
            this.applyAIResponse(response, playerX, playerY, distanceToPlayer);
        } else {
            this.basicAI(playerX, playerY, distanceToPlayer);
        }
    }
    
    // === IA DEFENSIVA (COM API GEMINI) ===
    async defensiveAI(playerX, playerY, distanceToPlayer) {
        const aiKey = `defensive_${this.aiState}_${distanceToPlayer < 150 ? 'close' : 'far'}`;
        
        let response = enemyAIState.aiResponses.get(aiKey);
        if (!response && this.canMakeAIRequest()) {
            response = await this.requestAIDecision({
                enemyType: 'Tank Enemy',
                playerDistance: distanceToPlayer,
                enemyHealth: this.health,
                maxHealth: this.maxHealth,
                context: 'Heavy tank enemy that prioritizes defense and area control over speed'
            });
            
            if (response) {
                enemyAIState.aiResponses.set(aiKey, response);
            }
        }
        
        if (response) {
            this.applyAIResponse(response, playerX, playerY, distanceToPlayer);
        } else {
            this.basicAI(playerX, playerY, distanceToPlayer);
        }
    }
    
    // === IA DO CHEFE (COM API GEMINI) ===
    async bossAI(playerX, playerY, distanceToPlayer) {
        // Determinar fase do chefe baseada na vida
        const healthPercentage = this.health / this.maxHealth;
        let newPhase = 1;
        if (healthPercentage < 0.7) newPhase = 2;
        if (healthPercentage < 0.4) newPhase = 3;
        if (healthPercentage < 0.2) newPhase = 4; // Fase final desesperada
        
        if (newPhase !== this.bossPhase) {
            this.bossPhase = newPhase;
            console.log(`👑 Chefe entrou na fase ${this.bossPhase}!`);
        }
        
        const aiKey = `boss_phase${this.bossPhase}_${distanceToPlayer < 200 ? 'close' : 'far'}`;
        
        let response = enemyAIState.aiResponses.get(aiKey);
        if (!response && this.canMakeAIRequest()) {
            response = await this.requestAIDecision({
                enemyType: 'Boss Enemy',
                playerDistance: distanceToPlayer,
                enemyHealth: this.health,
                maxHealth: this.maxHealth,
                bossPhase: this.bossPhase,
                context: `Powerful boss enemy in phase ${this.bossPhase}. Each phase should have unique tactics and abilities.`
            });
            
            if (response) {
                enemyAIState.aiResponses.set(aiKey, response);
            }
        }
        
        if (response) {
            this.applyAIResponse(response, playerX, playerY, distanceToPlayer);
            this.executeBossSpecialAbilities(playerX, playerY);
        } else {
            this.basicBossAI(playerX, playerY, distanceToPlayer);
        }
    }
    
    // === SOLICITAR DECISÃO DA IA (API GEMINI) ===
    async requestAIDecision(context) {
        if (!this.canMakeAIRequest()) return null;
        
        const prompt = `
You are an AI controlling an enemy in a 2D action game. Based on the context below, provide a tactical decision.

Context:
- Enemy Type: ${context.enemyType}
- Player Distance: ${context.playerDistance} pixels
- Enemy Health: ${context.enemyHealth}/${context.maxHealth}
- Additional Context: ${context.context}
${context.bossPhase ? `- Boss Phase: ${context.bossPhase}` : ''}

Respond with a JSON object containing:
{
    "action": "hunting/retreating/flanking/ambushing/defensive",
    "priority": "high/medium/low",
    "targetOffset": {"x": number, "y": number},
    "specialAction": "attack/defend/summon/none",
    "reasoning": "brief explanation"
}

Keep responses tactical and varied based on the situation.`;

        try {
            enemyAIState.lastAIRequest = Date.now();
            
            const response = await fetch(GEMINI_CONFIG.API_URL + '?key=' + GEMINI_CONFIG.API_KEY, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 200,
                    }
                })
            });
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            
            const data = await response.json();
            const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (aiResponse) {
                // Extrair JSON da resposta
                const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const aiDecision = JSON.parse(jsonMatch[0]);
                    console.log(`🤖 IA ${context.enemyType}: ${aiDecision.reasoning}`);
                    return aiDecision;
                }
            }
            
        } catch (error) {
            console.warn('❌ Erro na API Gemini:', error);
            // Fallback para IA básica em caso de erro
        }
        
        return null;
    }
    
    // === APLICAR RESPOSTA DA IA ===
    applyAIResponse(response, playerX, playerY, distanceToPlayer) {
        this.aiState = response.action;
        
        switch (response.action) {
            case 'hunting':
                this.targetX = playerX + (response.targetOffset?.x || 0);
                this.targetY = playerY + (response.targetOffset?.y || 0);
                this.speed = this.config.speed * 1.2;
                break;
                
            case 'retreating':
                this.targetX = this.x + (this.x - playerX) * 0.5 + (response.targetOffset?.x || 0);
                this.targetY = this.y + (this.y - playerY) * 0.5 + (response.targetOffset?.y || 0);
                this.speed = this.config.speed * 1.5;
                this.retreatTimer = 2000;
                break;
                
            case 'flanking':
                const angle = Math.atan2(playerY - this.y, playerX - this.x) + Math.PI/2;
                this.targetX = playerX + Math.cos(angle) * 150 + (response.targetOffset?.x || 0);
                this.targetY = playerY + Math.sin(angle) * 150 + (response.targetOffset?.y || 0);
                this.speed = this.config.speed * 1.1;
                break;
                
            case 'ambushing':
                // Ficar parado e esperar o jogador se aproximar
                this.targetX = this.x;
                this.targetY = this.y;
                this.speed = this.config.speed * 0.3;
                break;
                
            case 'defensive':
                this.targetX = this.x + (response.targetOffset?.x || 0);
                this.targetY = this.y + (response.targetOffset?.y || 0);
                this.speed = this.config.speed * 0.8;
                break;
        }
        
        // Executar ação especial se especificada
        if (response.specialAction && response.specialAction !== 'none') {
            this.executeSpecialAction(response.specialAction, playerX, playerY);
        }
    }
    
    // === EXECUTAR AÇÃO ESPECIAL ===
    executeSpecialAction(action, playerX, playerY) {
        switch (action) {
            case 'attack':
                if (this.attackCooldown <= 0) {
                    this.performAttack(playerX, playerY);
                    this.attackCooldown = 1000;
                }
                break;
                
            case 'defend':
                this.glowIntensity = 1;
                this.speed *= 0.5;
                // Reduzir dano recebido temporariamente
                break;
                
            case 'summon':
                if (this.isBoss && this.specialAttackCooldown <= 0) {
                    this.summonMinions();
                    this.specialAttackCooldown = 5000;
                }
                break;
        }
    }
    
    // === EXECUTAR MOVIMENTO ===
    executeMovement(deltaTime) {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) {
            const moveX = (dx / distance) * this.speed * (deltaTime / 16.67);
            const moveY = (dy / distance) * this.speed * (deltaTime / 16.67);
            
            this.x += moveX;
            this.y += moveY;
        }
        
        // Manter dentro dos limites da tela
        this.x = Math.max(this.size, Math.min(canvas.width - this.size, this.x));
        this.y = Math.max(this.size, Math.min(canvas.height - this.size, this.y));
    }
    
    // === ATUALIZAR ANIMAÇÕES ===
    updateAnimations(deltaTime) {
        this.angle += 0.02 * (deltaTime / 16.67);
        
        if (this.glowIntensity > 0) {
            this.glowIntensity -= 0.02 * (deltaTime / 16.67);
        }
        
        // Efeito de hit
        if (Date.now() - this.lastHitTime < 200) {
            this.glowIntensity = Math.max(this.glowIntensity, 0.8);
        }
    }
    
    // === VERIFICAR SE ESTÁ PRESO ===
    checkIfStuck(currentDistance) {
        if (Math.abs(currentDistance - this.lastPlayerDistance) < 5) {
            this.stuckCounter++;
            if (this.stuckCounter > 60) { // ~1 segundo a 60fps
                // Escolher nova posição aleatória para destravar
                this.targetX = this.x + (Math.random() - 0.5) * 200;
                this.targetY = this.y + (Math.random() - 0.5) * 200;
                this.stuckCounter = 0;
            }
        } else {
            this.stuckCounter = 0;
        }
    }
    
    // === HABILIDADES ESPECIAIS DO CHEFE ===
    executeBossSpecialAbilities(playerX, playerY) {
        if (this.specialAttackCooldown > 0) return;
        
        switch (this.bossPhase) {
            case 2:
                if (Math.random() < 0.3) {
                    this.createShockwave();
                    this.specialAttackCooldown = 3000;
                }
                break;
                
            case 3:
                if (Math.random() < 0.4) {
                    this.teleportAttack(playerX, playerY);
                    this.specialAttackCooldown = 4000;
                }
                break;
                
            case 4:
                if (Math.random() < 0.5) {
                    this.berserkMode();
                    this.specialAttackCooldown = 6000;
                }
                break;
        }
    }
    
    // === IA BÁSICA DO CHEFE ===
    basicBossAI(playerX, playerY, distanceToPlayer) {
        if (distanceToPlayer < 100) {
            this.aiState = 'attacking';
            this.targetX = playerX;
            this.targetY = playerY;
        } else if (distanceToPlayer > 300) {
            this.aiState = 'hunting';
            this.targetX = playerX;
            this.targetY = playerY;
        } else {
            this.aiState = 'circling';
            const angle = Math.atan2(playerY - this.y, playerX - this.x) + Math.PI/4;
            this.targetX = playerX + Math.cos(angle) * 200;
            this.targetY = playerY + Math.sin(angle) * 200;
        }
    }
    
    // === VERIFICAR SE PODE FAZER REQUEST À API ===
    canMakeAIRequest() {
        return enemyAIState.aiEnabled && 
               (Date.now() - enemyAIState.lastAIRequest > enemyAIState.requestCooldown);
    }
    
    // === RECEBER DANO ===
    takeDamage(damage) {
        this.health -= damage;
        this.lastHitTime = Date.now();
        
        if (this.health <= 0) {
            return this.die();
        }
        
        return false;
    }
    
    // === MORRER ===
    die() {
        console.log(`💀 Inimigo ${this.config.name} morreu`);
        enemyAIState.totalEnemiesKilled++;
        
        // Se for um chefe, dropar coração especial
        if (this.isBoss) {
            this.dropSpecialHeart();
            enemyAIState.bossSpawned = false;
            enemyAIState.currentBoss = null;
        }
        
        return true;
    }
    
    // === DROPAR CORAÇÃO ESPECIAL ===
    dropSpecialHeart() {
        const heart = {
            x: this.x,
            y: this.y,
            width: 40,
            height: 40,
            type: 'special_heart',
            collected: false,
            glowPhase: 0,
            lives: 3,
            ammoReload: 5000
        };
        
        // Adicionar à lista de power-ups do jogo
        if (typeof window.powerUps !== 'undefined') {
            window.powerUps.push(heart);
        }
        
        console.log('❤️ Coração especial dropado! +3 vidas, +5000 munições');
        return heart;
    }
    
    // === RENDERIZAR INIMIGO ===
    render(ctx) {
        ctx.save();
        
        // Efeito de brilho
        if (this.glowIntensity > 0) {
            ctx.shadowBlur = 20 * this.glowIntensity;
            ctx.shadowColor = this.color;
        }
        
        // Desenhar corpo do inimigo
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        if (this.isBoss) {
            // Boss tem formato especial
            ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            
            // Coroa do chefe
            this.renderBossCrown(ctx);
        } else {
            ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
        }
        
        // Barra de vida
        this.renderHealthBar(ctx);
        
        // Indicador de IA
        this.renderAIIndicator(ctx);
        
        ctx.restore();
    }
    
    // === RENDERIZAR COROA DO CHEFE ===
    renderBossCrown(ctx) {
        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = '#FFA500';
        ctx.lineWidth = 2;
        
        const crownY = this.y - this.size - 15;
        ctx.beginPath();
        ctx.moveTo(this.x - 20, crownY);
        ctx.lineTo(this.x - 10, crownY - 15);
        ctx.lineTo(this.x, crownY - 10);
        ctx.lineTo(this.x + 10, crownY - 15);
        ctx.lineTo(this.x + 20, crownY);
        ctx.lineTo(this.x + 15, crownY + 5);
        ctx.lineTo(this.x - 15, crownY + 5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
    
    // === RENDERIZAR BARRA DE VIDA ===
    renderHealthBar(ctx) {
        const barWidth = this.size * 2;
        const barHeight = 6;
        const barY = this.y - this.size - 25;
        
        // Fundo da barra
        ctx.fillStyle = '#333333';
        ctx.fillRect(this.x - barWidth/2, barY, barWidth, barHeight);
        
        // Barra de vida
        const healthPercent = this.health / this.maxHealth;
        let barColor = '#00FF00';
        if (healthPercent < 0.6) barColor = '#FFFF00';
        if (healthPercent < 0.3) barColor = '#FF0000';
        
        ctx.fillStyle = barColor;
        ctx.fillRect(this.x - barWidth/2, barY, barWidth * healthPercent, barHeight);
        
        // Borda da barra
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x - barWidth/2, barY, barWidth, barHeight);
    }
    
    // === RENDERIZAR INDICADOR DE IA ===
    renderAIIndicator(ctx) {
        const indicators = {
            'basic': '🤖',
            'advanced': '🧠',
            'defensive': '🛡️',
            'boss': '👑'
        };
        
        ctx.font = '16px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText(
            indicators[this.aiType] || '🤖',
            this.x,
            this.y - this.size - 35
        );
        
        // Estado da IA
        ctx.font = '10px Arial';
        ctx.fillStyle = '#CCCCCC';
        ctx.fillText(
            this.aiState.toUpperCase(),
            this.x,
            this.y + this.size + 15
        );
    }
}

// === SISTEMA DE SPAWN DE INIMIGOS ===
class EnemySpawner {
    constructor() {
        this.enemies = [];
        this.spawnTimer = 0;
        this.spawnInterval = 2000; // 2 segundos
        this.maxEnemies = 15;
    }
    
    // === ATUALIZAR SPAWNER ===
    update(deltaTime) {
        this.spawnTimer += deltaTime;
        
        if (this.spawnTimer >= this.spawnInterval && this.enemies.length < this.maxEnemies) {
            this.spawnEnemy();
            this.spawnTimer = 0;
        }
        
        // Verificar se deve spawnar chefe
        this.checkBossSpawn();
    }
    
    // === SPAWNAR INIMIGO ===
    spawnEnemy() {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return;
        
        // Posição aleatória nas bordas da tela
        let x, y;
        const side = Math.floor(Math.random() * 4);
        
        switch (side) {
            case 0: // Top
                x = Math.random() * canvas.width;
                y = -50;
                break;
            case 1: // Right
                x = canvas.width + 50;
                y = Math.random() * canvas.height;
                break;
            case 2: // Bottom
                x = Math.random() * canvas.width;
                y = canvas.height + 50;
                break;
            case 3: // Left
                x = -50;
                y = Math.random() * canvas.height;
                break;
        }
        
        // Determinar tipo do inimigo
        let enemyType = 'NORMAL';
        const rand = Math.random();
        
        if (rand < 0.1) enemyType = 'TANK';
        else if (rand < 0.3) enemyType = 'SMART';
        
        const enemy = new AIEnemy(x, y, enemyType);
        this.enemies.push(enemy);
        enemyAIState.totalEnemiesSpawned++;
        
        console.log(`👾 Inimigo ${enemy.config.name} spawned (Total: ${enemyAIState.totalEnemiesSpawned})`);
    }
    
    // === VERIFICAR SPAWN DO CHEFE ===
    checkBossSpawn() {
        // A cada 30 inimigos, spawnar 1 chefe
        const shouldSpawnBoss = (enemyAIState.totalEnemiesSpawned % 30 === 0) && 
                               (enemyAIState.totalEnemiesSpawned > 0) &&
                               !enemyAIState.bossSpawned &&
                               !enemyAIState.currentBoss;
        
        if (shouldSpawnBoss) {
            this.spawnBoss();
        }
    }
    
    // === SPAWNAR CHEFE ===
    spawnBoss() {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return;
        
        // Spawnar chefe no centro-superior da tela
        const x = canvas.width / 2;
        const y = 100;
        
        const boss = new AIEnemy(x, y, 'BOSS');
        this.enemies.push(boss);
        
        enemyAIState.bossSpawned = true;
        enemyAIState.currentBoss = boss;
        enemyAIState.totalEnemiesSpawned++;
        
        console.log('👑 CHEFE SPAWNED! Prepare-se para a batalha!');
        
        // Mostrar aviso na tela
        this.showBossWarning();
        
        return boss;
    }
    
    // === MOSTRAR AVISO DO CHEFE ===
    showBossWarning() {
        const warning = document.createElement('div');
        warning.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 30px;
            border-radius: 15px;
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            z-index: 10000;
            border: 3px solid #FFD700;
            box-shadow: 0 0 30px rgba(255, 0, 0, 0.8);
        `;
        
        warning.innerHTML = `
            👑 BOSS BATTLE! 👑<br>
            <div style="font-size: 16px; margin-top: 10px;">
                Um chefe poderoso apareceu!<br>
                Derrote-o para ganhar recompensas especiais!
            </div>
        `;
        
        document.body.appendChild(warning);
        
        // Remover aviso após 3 segundos
        setTimeout(() => {
            if (warning.parentNode) {
                warning.parentNode.removeChild(warning);
            }
        }, 3000);
        
        // Efeito sonoro (se disponível)
        if (typeof playSound === 'function') {
            playSound('boss_warning');
        }
    }
    
    // === ATUALIZAR TODOS OS INIMIGOS ===
    async updateEnemies(playerX, playerY, deltaTime) {
        const updates = this.enemies.map(enemy => 
            enemy.update(playerX, playerY, deltaTime)
        );
        
        await Promise.all(updates);
    }
    
    // === RENDERIZAR TODOS OS INIMIGOS ===
    renderEnemies(ctx) {
        this.enemies.forEach(enemy => {
            enemy.render(ctx);
        });
    }
    
    // === REMOVER INIMIGO ===
    removeEnemy(index) {
        if (index >= 0 && index < this.enemies.length) {
            const enemy = this.enemies[index];
            if (enemy.isBoss) {
                enemyAIState.bossSpawned = false;
                enemyAIState.currentBoss = null;
            }
            this.enemies.splice(index, 1);
        }
    }
    
    // === LIMPAR TODOS OS INIMIGOS ===
    clearAllEnemies() {
        this.enemies = [];
        enemyAIState.bossSpawned = false;
        enemyAIState.currentBoss = null;
    }
}

// === INTEGRAÇÃO COM O JOGO PRINCIPAL ===
let enemySpawner = null;

// === INICIALIZAR SISTEMA DE IA ===
function initializeEnemyAI() {
    enemySpawner = new EnemySpawner();
    
    console.log('🤖 Sistema de IA de Inimigos inicializado!');
    console.log(`📡 API Gemini: ${enemyAIState.aiEnabled ? 'ATIVA' : 'DESATIVADA'}`);
    
    // Testar conectividade da API
    testGeminiAPI();
}

// === TESTAR API GEMINI ===
async function testGeminiAPI() {
    try {
        const testEnemy = new AIEnemy(0, 0, 'NORMAL');
        const response = await testEnemy.requestAIDecision({
            enemyType: 'Test',
            playerDistance: 100,
            enemyHealth: 100,
            maxHealth: 100,
            context: 'Testing API connectivity'
        });
        
        if (response) {
            console.log('✅ API Gemini funcionando corretamente!');
        } else {
            throw new Error('No response received');
        }
    } catch (error) {
        console.warn('⚠️ API Gemini indisponível, usando IA básica:', error);
        enemyAIState.aiEnabled = false;
    }
}

// === TOGGLE DA IA ===
function toggleAI() {
    enemyAIState.aiEnabled = !enemyAIState.aiEnabled;
    console.log(`🤖 IA ${enemyAIState.aiEnabled ? 'ATIVADA' : 'DESATIVADA'}`);
    return enemyAIState.aiEnabled;
}

// === EXPOR FUNÇÕES GLOBALMENTE ===
window.enemyAIState = enemyAIState;
window.AIEnemy = AIEnemy;
window.EnemySpawner = EnemySpawner;
window.enemySpawner = enemySpawner;
window.initializeEnemyAI = initializeEnemyAI;
window.toggleAI = toggleAI;

console.log('🤖 Sistema de IA de Inimigos carregado!');

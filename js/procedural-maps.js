/* ==========================================================================
   SISTEMA AVANÇADO DE GERAÇÃO PROCEDURAL - JULIETTE 2D
   Mapas, Inimigos Geométricos e Chefes Únicos via API Gemini
   ========================================================================== */

// === CONFIGURAÇÃO DO SISTEMA PROCEDURAL ===
const PROCEDURAL_CONFIG = {
    API_URL: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent",
    API_KEY: "AIzaSyAWkTqpCr3kNcvgHg3AYjfxcaWvjObbOiw",
    
    // Configurações gerais
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    GENERATION_INTERVAL: 15000, // 15 segundos
    REQUEST_COOLDOWN: 2000, // 2 segundos entre requests
    
    // Tipos de conteúdo gerado
    CONTENT_TYPES: {
        MAP: 'map',
        ENEMIES: 'enemies', 
        BOSS: 'boss',
        OBSTACLES: 'obstacles'
    },
    
    // Formas geométricas para inimigos
    ENEMY_SHAPES: [
        'triangle', 'square', 'pentagon', 'hexagon', 'octagon', 
        'circle', 'ellipse', 'star', 'diamond', 'cross',
        'spiral', 'zigzag', 'wave', 'gear', 'crystal'
    ],
    
    // Tipos de movimento
    MOVEMENT_PATTERNS: [
        'linear', 'circular', 'spiral', 'zigzag', 'wave',
        'bounce', 'orbit', 'chase', 'patrol', 'teleport'
    ],
    
    // Temas visuais
    THEMES: [
        'cyberpunk', 'neon', 'industrial', 'organic', 'crystal',
        'lava', 'ice', 'electric', 'void', 'rainbow'
    ]
};

// === ESTADO GLOBAL DO SISTEMA PROCEDURAL ===
let proceduralState = {
    initialized: false,
    currentLevel: 1,
    currentMap: null,
    generatedEnemies: [],
    currentBoss: null,
    
    // Contadores
    mapsGenerated: 0,
    enemiesGenerated: 0,
    bossesGenerated: 0,
    
    // Controle de API
    lastRequestTime: 0,
    apiEnabled: true,
    requestQueue: [],
    
    // Cache de conteúdo
    mapCache: new Map(),
    enemyTemplateCache: new Map(),
    bossTemplateCache: new Map(),
    
    // Timer de geração automática
    autoGenerateTimer: null,
    
    // Configurações dinâmicas
    difficulty: 1.0,
    theme: 'cyberpunk'
};

// === CLASSE DE MAPA PROCEDURAL AVANÇADO ===
class ProceduralMap {
    constructor(mapData) {
        this.id = mapData.id || `map_${Date.now()}`;
        this.theme = mapData.theme || 'cyberpunk';
        this.difficulty = mapData.difficulty || 1.0;
        this.layout = mapData.layout || {};
        this.platforms = mapData.platforms || [];
        this.obstacles = mapData.obstacles || [];
        this.decorations = mapData.decorations || [];
        this.enemySpawns = mapData.enemySpawns || [];
        this.backgroundElements = mapData.backgroundElements || [];
        this.lighting = mapData.lighting || { ambient: 0.5, points: [] };
        this.particles = mapData.particles || { systems: [] };
        this.music = mapData.music || { tempo: 120, key: 'minor' };
        
        console.log(`🎨 Mapa procedural criado: ${this.id} (${this.theme})`);
    }
    
    // === RENDERIZAR MAPA COMPLETO ===
    render(ctx) {
        ctx.save();
        
        // Aplicar iluminação ambiente
        this.applyAmbientLighting(ctx);
        
        // Renderizar fundo procedural
        this.renderProceduralBackground(ctx);
        
        // Renderizar plataformas com estilo
        this.renderStyledPlatforms(ctx);
        
        // Renderizar obstáculos únicos
        this.renderUniqueObstacles(ctx);
        
        // Renderizar decorações procedurais
        this.renderProceduralDecorations(ctx);
        
        // Aplicar efeitos de iluminação
        this.renderLightingEffects(ctx);
        
        // Renderizar sistemas de partículas
        this.renderParticleSystems(ctx);
        
        ctx.restore();
    }
    
    // === APLICAR ILUMINAÇÃO AMBIENTE ===
    applyAmbientLighting(ctx) {
        const overlay = ctx.createLinearGradient(0, 0, 0, PROCEDURAL_CONFIG.CANVAS_HEIGHT);
        const ambientAlpha = 1 - this.lighting.ambient;
        
        overlay.addColorStop(0, `rgba(0, 0, 0, ${ambientAlpha * 0.3})`);
        overlay.addColorStop(1, `rgba(0, 0, 0, ${ambientAlpha * 0.7})`);
        
        ctx.fillStyle = overlay;
        ctx.fillRect(0, 0, PROCEDURAL_CONFIG.CANVAS_WIDTH, PROCEDURAL_CONFIG.CANVAS_HEIGHT);
    }
    
    // === RENDERIZAR FUNDO PROCEDURAL ===
    renderProceduralBackground(ctx) {
        this.backgroundElements.forEach(element => {
            this.renderBackgroundElement(ctx, element);
        });
    }
    
    renderBackgroundElement(ctx, element) {
        ctx.save();
        ctx.globalAlpha = element.opacity || 0.5;
        
        switch (element.type) {
            case 'gradient_sweep':
                this.renderGradientSweep(ctx, element);
                break;
            case 'geometric_pattern':
                this.renderGeometricPattern(ctx, element);
                break;
            case 'noise_field':
                this.renderNoiseField(ctx, element);
                break;
            case 'energy_lines':
                this.renderEnergyLines(ctx, element);
                break;
        }
        
        ctx.restore();
    }
}

// === CLASSE DE INIMIGO GEOMÉTRICO PROCEDURAL ===
class GeometricEnemy {
    constructor(enemyData) {
        this.id = enemyData.id || `enemy_${Date.now()}`;
        this.shape = enemyData.shape || 'triangle';
        this.size = enemyData.size || 30;
        this.color = enemyData.color || '#FF4444';
        this.health = enemyData.health || 100;
        this.maxHealth = this.health;
        this.damage = enemyData.damage || 25;
        
        // Posição e movimento
        this.x = enemyData.x || Math.random() * PROCEDURAL_CONFIG.CANVAS_WIDTH;
        this.y = enemyData.y || Math.random() * PROCEDURAL_CONFIG.CANVAS_HEIGHT;
        this.vx = enemyData.vx || 0;
        this.vy = enemyData.vy || 0;
        this.movementPattern = enemyData.movementPattern || 'linear';
        this.speed = enemyData.speed || 2;
        
        // Propriedades visuais
        this.rotation = 0;
        this.rotationSpeed = enemyData.rotationSpeed || 0.02;
        this.scale = 1;
        this.pulsePhase = Math.random() * Math.PI * 2;
        
        // Comportamento
        this.aiType = enemyData.aiType || 'basic';
        this.attackPattern = enemyData.attackPattern || 'simple';
        this.abilities = enemyData.abilities || [];
        
        // Estado interno
        this.movementTimer = 0;
        this.attackCooldown = 0;
        this.stateTimer = 0;
        
        console.log(`👾 Inimigo geométrico criado: ${this.shape} (${this.id})`);
    }
    
    // === ATUALIZAR INIMIGO ===
    update(deltaTime, playerX, playerY) {
        this.movementTimer += deltaTime;
        this.stateTimer += deltaTime;
        
        // Atualizar movimento baseado no padrão
        this.updateMovement(deltaTime, playerX, playerY);
        
        // Atualizar rotação e efeitos visuais
        this.updateVisualEffects(deltaTime);
        
        // Atualizar comportamento de IA
        this.updateAI(deltaTime, playerX, playerY);
        
        // Atualizar cooldowns
        if (this.attackCooldown > 0) this.attackCooldown -= deltaTime;
        
        // Manter dentro dos limites
        this.clampToBounds();
    }
    
    // === ATUALIZAR MOVIMENTO ===
    updateMovement(deltaTime, playerX, playerY) {
        const time = this.movementTimer * 0.001;
        
        switch (this.movementPattern) {
            case 'circular':
                const radius = 100;
                this.x += Math.cos(time * this.speed * 0.5) * radius * 0.01;
                this.y += Math.sin(time * this.speed * 0.5) * radius * 0.01;
                break;
                
            case 'spiral':
                const spiralRadius = 50 + Math.sin(time * 0.5) * 30;
                this.x += Math.cos(time * this.speed) * spiralRadius * 0.01;
                this.y += Math.sin(time * this.speed) * spiralRadius * 0.01;
                break;
                
            case 'zigzag':
                this.x += this.speed * Math.cos(time * 2) * 0.5;
                this.y += this.speed * Math.sin(time * 4) * 0.3;
                break;
                
            case 'wave':
                this.x += this.speed * 0.5;
                this.y += Math.sin(time * this.speed) * 2;
                break;
                
            case 'chase':
                const dx = playerX - this.x;
                const dy = playerY - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance > 0) {
                    this.vx = (dx / distance) * this.speed;
                    this.vy = (dy / distance) * this.speed;
                }
                this.x += this.vx;
                this.y += this.vy;
                break;
                
            case 'orbit':
                const centerX = PROCEDURAL_CONFIG.CANVAS_WIDTH / 2;
                const centerY = PROCEDURAL_CONFIG.CANVAS_HEIGHT / 2;
                const orbitRadius = 150;
                this.x = centerX + Math.cos(time * this.speed * 0.3) * orbitRadius;
                this.y = centerY + Math.sin(time * this.speed * 0.3) * orbitRadius;
                break;
                
            default: // linear
                this.x += this.vx;
                this.y += this.vy;
                break;
        }
    }
    
    // === ATUALIZAR EFEITOS VISUAIS ===
    updateVisualEffects(deltaTime) {
        this.rotation += this.rotationSpeed;
        this.pulsePhase += 0.05;
        this.scale = 1 + Math.sin(this.pulsePhase) * 0.1;
    }
    
    // === RENDERIZAR INIMIGO GEOMÉTRICO ===
    render(ctx) {
        ctx.save();
        
        // Transladar para posição
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);
        
        // Aplicar cor com efeito de saúde
        const healthPercent = this.health / this.maxHealth;
        const glowIntensity = Math.sin(this.pulsePhase) * 0.5 + 0.5;
        
        // Efeito de glow
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15 * glowIntensity;
        
        // Desenhar forma geométrica
        this.renderShape(ctx);
        
        // Desenhar aura de saúde
        this.renderHealthAura(ctx, healthPercent);
        
        ctx.restore();
        
        // Desenhar barra de vida
        this.renderHealthBar(ctx);
    }
    
    // === RENDERIZAR FORMA GEOMÉTRICA ===
    renderShape(ctx) {
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.lightenColor(this.color, 0.3);
        ctx.lineWidth = 3;
        
        ctx.beginPath();
        
        switch (this.shape) {
            case 'triangle':
                this.drawTriangle(ctx, this.size);
                break;
            case 'square':
                this.drawSquare(ctx, this.size);
                break;
            case 'pentagon':
                this.drawPolygon(ctx, this.size, 5);
                break;
            case 'hexagon':
                this.drawPolygon(ctx, this.size, 6);
                break;
            case 'octagon':
                this.drawPolygon(ctx, this.size, 8);
                break;
            case 'circle':
                this.drawCircle(ctx, this.size);
                break;
            case 'star':
                this.drawStar(ctx, this.size, 5);
                break;
            case 'diamond':
                this.drawDiamond(ctx, this.size);
                break;
            case 'cross':
                this.drawCross(ctx, this.size);
                break;
            case 'spiral':
                this.drawSpiral(ctx, this.size);
                break;
            case 'gear':
                this.drawGear(ctx, this.size, 8);
                break;
            case 'crystal':
                this.drawCrystal(ctx, this.size);
                break;
        }
        
        ctx.fill();
        ctx.stroke();
    }
    
    // === FORMAS GEOMÉTRICAS ESPECÍFICAS ===
    drawTriangle(ctx, size) {
        ctx.moveTo(0, -size);
        ctx.lineTo(-size * 0.866, size * 0.5);
        ctx.lineTo(size * 0.866, size * 0.5);
        ctx.closePath();
    }
    
    drawSquare(ctx, size) {
        ctx.rect(-size, -size, size * 2, size * 2);
    }
    
    drawPolygon(ctx, size, sides) {
        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2;
            const x = Math.cos(angle) * size;
            const y = Math.sin(angle) * size;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
    }
    
    drawCircle(ctx, size) {
        ctx.arc(0, 0, size, 0, Math.PI * 2);
    }
    
    drawStar(ctx, size, points) {
        const outerRadius = size;
        const innerRadius = size * 0.4;
        
        for (let i = 0; i < points * 2; i++) {
            const angle = (i / (points * 2)) * Math.PI * 2;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
    }
    
    drawDiamond(ctx, size) {
        ctx.moveTo(0, -size);
        ctx.lineTo(size, 0);
        ctx.lineTo(0, size);
        ctx.lineTo(-size, 0);
        ctx.closePath();
    }
    
    drawCross(ctx, size) {
        const thickness = size * 0.3;
        // Vertical
        ctx.rect(-thickness, -size, thickness * 2, size * 2);
        ctx.rect(-size, -thickness, size * 2, thickness * 2);
    }
    
    drawSpiral(ctx, size) {
        const turns = 3;
        const steps = 50;
        
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const angle = t * turns * Math.PI * 2;
            const radius = t * size;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
    }
    
    drawGear(ctx, size, teeth) {
        const outerRadius = size;
        const innerRadius = size * 0.7;
        const toothHeight = size * 0.2;
        
        for (let i = 0; i < teeth * 2; i++) {
            const angle = (i / (teeth * 2)) * Math.PI * 2;
            const isOuter = i % 2 === 0;
            const radius = isOuter ? outerRadius + toothHeight : innerRadius;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
    }
    
    drawCrystal(ctx, size) {
        // Cristal com múltiplas facetas
        const facets = 8;
        const layers = 3;
        
        for (let layer = 0; layer < layers; layer++) {
            const layerRadius = size * (0.3 + layer * 0.35);
            const offset = (layer * Math.PI) / facets;
            
            ctx.beginPath();
            for (let i = 0; i < facets; i++) {
                const angle = (i / facets) * Math.PI * 2 + offset;
                const x = Math.cos(angle) * layerRadius;
                const y = Math.sin(angle) * layerRadius;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            
            ctx.globalAlpha = 0.7 - layer * 0.2;
            ctx.fill();
            ctx.stroke();
        }
    }
    
    // === UTILITÁRIOS ===
    lightenColor(color, amount) {
        // Implementação simplificada
        return color.replace(/[0-9A-F]/g, (char) => {
            const val = parseInt(char, 16);
            const newVal = Math.min(15, Math.floor(val + (15 * amount)));
            return newVal.toString(16);
        });
    }
    
    clampToBounds() {
        const margin = this.size + 10;
        this.x = Math.max(margin, Math.min(PROCEDURAL_CONFIG.CANVAS_WIDTH - margin, this.x));
        this.y = Math.max(margin, Math.min(PROCEDURAL_CONFIG.CANVAS_HEIGHT - margin, this.y));
    }
    
    renderHealthBar(ctx) {
        const barWidth = this.size * 2;
        const barHeight = 4;
        const barY = this.y - this.size - 15;
        
        // Fundo da barra
        ctx.fillStyle = '#333333';
        ctx.fillRect(this.x - barWidth/2, barY, barWidth, barHeight);
        
        // Barra de vida
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = healthPercent > 0.5 ? '#00FF00' : '#FF0000';
        ctx.fillRect(this.x - barWidth/2, barY, barWidth * healthPercent, barHeight);
    }
    
    renderHealthAura(ctx, healthPercent) {
        if (healthPercent < 0.3) {
            ctx.save();
            ctx.globalAlpha = 0.3;
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.arc(0, 0, this.size + 5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    }
}

// === CLASSE DE CHEFE PROCEDURAL ===
class ProceduralBoss extends GeometricEnemy {
    constructor(bossData) {
        super(bossData);
        
        this.size = bossData.size || 80;
        this.health = bossData.health || 1000;
        this.maxHealth = this.health;
        this.damage = bossData.damage || 50;
        
        // Propriedades específicas do chefe
        this.phases = bossData.phases || [];
        this.currentPhase = 0;
        this.specialAbilities = bossData.specialAbilities || [];
        this.minions = [];
        this.weakPoints = bossData.weakPoints || [];
        
        // Timers especiais
        this.phaseTimer = 0;
        this.abilityTimer = 0;
        this.minionSpawnTimer = 0;
        
        console.log(`👑 Chefe procedural criado: ${this.shape} (${this.id})`);
    }
    
    // === ATUALIZAR CHEFE ===
    update(deltaTime, playerX, playerY) {
        super.update(deltaTime, playerX, playerY);
        
        // Atualizar fase baseada na vida
        this.updatePhase();
        
        // Executar habilidades especiais
        this.updateSpecialAbilities(deltaTime, playerX, playerY);
        
        // Gerenciar subordinados
        this.updateMinions(deltaTime, playerX, playerY);
        
        this.phaseTimer += deltaTime;
        this.abilityTimer += deltaTime;
        this.minionSpawnTimer += deltaTime;
    }
    
    updatePhase() {
        const healthPercent = this.health / this.maxHealth;
        const newPhase = Math.floor((1 - healthPercent) * this.phases.length);
        
        if (newPhase !== this.currentPhase && newPhase < this.phases.length) {
            this.currentPhase = newPhase;
            this.onPhaseChange();
        }
    }
    
    onPhaseChange() {
        console.log(`👑 Chefe entrou na fase ${this.currentPhase + 1}!`);
        
        const phase = this.phases[this.currentPhase];
        if (phase) {
            this.speed = phase.speed || this.speed;
            this.rotationSpeed = phase.rotationSpeed || this.rotationSpeed;
            this.movementPattern = phase.movementPattern || this.movementPattern;
        }
    }
    
    updateSpecialAbilities(deltaTime, playerX, playerY) {
        if (this.abilityTimer > 3000) { // A cada 3 segundos
            this.executeRandomAbility(playerX, playerY);
            this.abilityTimer = 0;
        }
    }
    
    executeRandomAbility(playerX, playerY) {
        const ability = this.specialAbilities[Math.floor(Math.random() * this.specialAbilities.length)];
        if (!ability) return;
        
        switch (ability.type) {
            case 'projectile_burst':
                this.projectileBurst(playerX, playerY, ability);
                break;
            case 'summon_minions':
                this.summonMinions(ability);
                break;
            case 'teleport_attack':
                this.teleportAttack(playerX, playerY);
                break;
            case 'shield_mode':
                this.activateShield(ability.duration || 5000);
                break;
        }
    }
    
    render(ctx) {
        super.render(ctx);
        
        // Desenhar corona de chefe
        this.renderBossCorona(ctx);
        
        // Desenhar pontos fracos
        this.renderWeakPoints(ctx);
        
        // Renderizar subordinados
        this.minions.forEach(minion => minion.render(ctx));
    }
    
    renderBossCorona(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y - this.size - 20);
        
        const coronaSize = 30;
        const spikes = 7;
        
        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = '#FF8C00';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        for (let i = 0; i < spikes; i++) {
            const angle = (i / spikes) * Math.PI * 2;
            const radius = i % 2 === 0 ? coronaSize : coronaSize * 0.6;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        ctx.restore();
    }
    
    renderWeakPoints(ctx) {
        this.weakPoints.forEach((point, index) => {
            ctx.save();
            ctx.translate(this.x + point.x, this.y + point.y);
            
            const pulseScale = 1 + Math.sin(Date.now() * 0.01 + index) * 0.2;
            ctx.scale(pulseScale, pulseScale);
            
            ctx.fillStyle = '#FF00FF';
            ctx.beginPath();
            ctx.arc(0, 0, point.size || 10, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        });
    }
}

// === GERADOR PROCEDURAL PRINCIPAL ===
class ProceduralGenerator {
    constructor() {
        this.requestQueue = [];
        this.processing = false;
    }
    
    // === GERAR CONTEÚDO VIA API GEMINI ===
    async generateContent(type, options = {}) {
        if (!this.canMakeRequest()) {
            return this.generateFallbackContent(type, options);
        }
        
        const prompt = this.buildPrompt(type, options);
        
        try {
            const response = await this.makeAPIRequest(prompt);
            if (response) {
                return this.parseResponse(type, response);
            }
        } catch (error) {
            console.warn(`❌ Erro na geração ${type}:`, error);
        }
        
        return this.generateFallbackContent(type, options);
    }
    
    // === CONSTRUIR PROMPT BASEADO NO TIPO ===
    buildPrompt(type, options) {
        switch (type) {
            case 'map':
                return this.buildMapPrompt(options);
            case 'enemies':
                return this.buildEnemyPrompt(options);
            case 'boss':
                return this.buildBossPrompt(options);
            default:
                return this.buildGenericPrompt(type, options);
        }
    }
    
    buildMapPrompt(options) {
        return `
Generate a procedural 2D side-scrolling level with these specifications:

THEME: ${options.theme || proceduralState.theme}
DIFFICULTY: ${options.difficulty || proceduralState.difficulty}/5.0
CANVAS: ${PROCEDURAL_CONFIG.CANVAS_WIDTH}x${PROCEDURAL_CONFIG.CANVAS_HEIGHT}
LEVEL: ${proceduralState.currentLevel}

Create a JSON response:
{
    "id": "map_${Date.now()}",
    "theme": "${options.theme || proceduralState.theme}",
    "difficulty": ${options.difficulty || proceduralState.difficulty},
    "platforms": [
        {"x": number, "y": number, "width": number, "height": number, "type": "solid|moving|breakable", "style": "normal|textured|glowing"}
    ],
    "obstacles": [
        {"x": number, "y": number, "width": number, "height": number, "type": "spikes|laser|rotating|moving", "damage": number, "pattern": "static|pulsing|rotating"}
    ],
    "decorations": [
        {"x": number, "y": number, "type": "crystal|pipe|antenna|screen", "size": number, "color": "#RRGGBB", "animated": boolean}
    ],
    "backgroundElements": [
        {"type": "gradient_sweep|geometric_pattern|energy_lines", "opacity": 0.1-0.8, "colors": ["#RRGGBB"], "pattern": "description"}
    ],
    "enemySpawns": [
        {"x": number, "y": number, "type": "basic|advanced|flying", "count": 1-3, "interval": 1000-5000}
    ],
    "lighting": {
        "ambient": 0.3-0.8,
        "points": [{"x": number, "y": number, "color": "#RRGGBB", "intensity": 0.5-2.0, "radius": 50-200}]
    },
    "particles": {
        "systems": [{"type": "sparks|smoke|energy", "x": number, "y": number, "count": 10-50, "color": "#RRGGBB"}]
    }
}

Design principles:
- Create challenging but fair layouts
- Use ${options.theme || proceduralState.theme} aesthetic consistently
- Balance open areas with tight passages
- Include vertical and horizontal challenges
- Add interactive elements that enhance gameplay
- Ensure multiple paths when possible
- Scale difficulty to ${options.difficulty || proceduralState.difficulty}/5.0

Generate creative and engaging level architecture!`;
    }
    
    buildEnemyPrompt(options) {
        return `
Generate ${options.count || 3} unique geometric enemies with these specifications:

THEME: ${options.theme || proceduralState.theme}
DIFFICULTY: ${options.difficulty || proceduralState.difficulty}/5.0
SHAPES: Use varied geometric forms
LEVEL: ${proceduralState.currentLevel}

Create a JSON array of enemies:
[
    {
        "id": "enemy_${Date.now()}_1",
        "shape": "${PROCEDURAL_CONFIG.ENEMY_SHAPES.join('|')}",
        "size": 20-60,
        "color": "#RRGGBB",
        "health": ${Math.floor(50 + (options.difficulty || 1) * 30)},
        "damage": ${Math.floor(15 + (options.difficulty || 1) * 10)},
        "speed": 1-5,
        "movementPattern": "${PROCEDURAL_CONFIG.MOVEMENT_PATTERNS.join('|')}",
        "rotationSpeed": 0.01-0.1,
        "aiType": "basic|aggressive|defensive|smart",
        "attackPattern": "simple|burst|charging|projectile",
        "abilities": ["dash", "split", "shield", "teleport", "heal"],
        "x": 100-700,
        "y": 100-500,
        "vx": -2 to 2,
        "vy": -2 to 2
    }
]

Design principles:
- Each enemy should have unique visual and behavioral characteristics
- Use ${options.theme || proceduralState.theme} color palette
- Vary sizes and shapes for visual interest
- Balance different movement patterns
- Scale stats to difficulty ${options.difficulty || proceduralState.difficulty}/5.0
- Include at least one enemy with special ability
- Ensure enemies complement each other in combat

Create diverse and challenging geometric adversaries!`;
    }
    
    buildBossPrompt(options) {
        return `
Generate a unique procedural boss with these specifications:

THEME: ${options.theme || proceduralState.theme}
DIFFICULTY: ${options.difficulty || proceduralState.difficulty}/5.0
BOSS_TYPE: Major encounter
LEVEL: ${proceduralState.currentLevel}

Create a JSON boss definition:
{
    "id": "boss_${Date.now()}",
    "name": "Epic boss name",
    "shape": "${PROCEDURAL_CONFIG.ENEMY_SHAPES.join('|')}",
    "size": 80-150,
    "color": "#RRGGBB",
    "health": ${Math.floor(800 + (options.difficulty || 1) * 400)},
    "damage": ${Math.floor(40 + (options.difficulty || 1) * 20)},
    "speed": 1-3,
    "movementPattern": "${PROCEDURAL_CONFIG.MOVEMENT_PATTERNS.join('|')}",
    "phases": [
        {
            "healthThreshold": 0.75,
            "speed": number,
            "movementPattern": "pattern",
            "rotationSpeed": number,
            "description": "Phase description"
        }
    ],
    "specialAbilities": [
        {
            "type": "projectile_burst|summon_minions|teleport_attack|shield_mode|laser_sweep",
            "damage": number,
            "cooldown": 3000-8000,
            "description": "Ability description",
            "duration": 1000-5000
        }
    ],
    "weakPoints": [
        {"x": -20 to 20, "y": -20 to 20, "size": 8-15, "damage": 150-300}
    ],
    "description": "Epic boss description and lore",
    "rewards": {
        "score": ${Math.floor(1000 + (options.difficulty || 1) * 500)},
        "specialDrop": "heart|weapon|powerup"
    }
}

Design principles:
- Create a memorable and challenging boss encounter  
- Use ${options.theme || proceduralState.theme} aesthetic
- Include multiple distinct phases with different behaviors
- Add strategic weak points for skill-based combat
- Balance difficulty at ${options.difficulty || proceduralState.difficulty}/5.0
- Include unique abilities that require different strategies
- Create visual spectacle with impressive scale and effects
- Provide meaningful rewards for victory

Design an epic and unforgettable boss battle!`;
    }
    
    // === FAZER REQUEST À API ===
    async makeAPIRequest(prompt) {
        proceduralState.lastRequestTime = Date.now();
        
        const response = await fetch(PROCEDURAL_CONFIG.API_URL + '?key=' + PROCEDURAL_CONFIG.API_KEY, {
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
                    temperature: 0.8,
                    maxOutputTokens: 3000,
                }
            })
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text;
    }
    
    // === PARSEAR RESPOSTA ===
    parseResponse(type, response) {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                console.log(`🤖 Conteúdo ${type} gerado pela IA:`, parsed.name || parsed.id || 'success');
                return parsed;
            }
        } catch (error) {
            console.warn(`❌ Erro ao parsear resposta ${type}:`, error);
        }
        return null;
    }
    
    // === VERIFICAR SE PODE FAZER REQUEST ===
    canMakeRequest() {
        return proceduralState.apiEnabled && 
               (Date.now() - proceduralState.lastRequestTime > PROCEDURAL_CONFIG.REQUEST_COOLDOWN);
    }
    
    // === GERAR CONTEÚDO FALLBACK ===
    generateFallbackContent(type, options) {
        switch (type) {
            case 'map':
                return this.generateFallbackMap(options);
            case 'enemies':
                return this.generateFallbackEnemies(options);
            case 'boss':
                return this.generateFallbackBoss(options);
            default:
                return null;
        }
    }
    
    generateFallbackMap(options) {
        console.log('🛠️ Gerando mapa fallback local...');
        
        return {
            id: `fallback_map_${Date.now()}`,
            theme: options.theme || proceduralState.theme,
            difficulty: options.difficulty || proceduralState.difficulty,
            platforms: this.generateRandomPlatforms(5 + Math.floor(Math.random() * 5)),
            obstacles: this.generateRandomObstacles(2 + Math.floor(Math.random() * 3)),
            decorations: this.generateRandomDecorations(8 + Math.floor(Math.random() * 10)),
            backgroundElements: [
                { type: 'energy_lines', opacity: 0.3, colors: ['#00FFFF', '#0080FF'] },
                { type: 'geometric_pattern', opacity: 0.2, colors: ['#404040'] }
            ],
            lighting: { ambient: 0.6, points: [] },
            particles: { systems: [] }
        };
    }
    
    generateFallbackEnemies(options) {
        console.log('🛠️ Gerando inimigos fallback locais...');
        
        const enemies = [];
        const count = options.count || 3;
        
        for (let i = 0; i < count; i++) {
            enemies.push({
                id: `fallback_enemy_${Date.now()}_${i}`,
                shape: PROCEDURAL_CONFIG.ENEMY_SHAPES[Math.floor(Math.random() * PROCEDURAL_CONFIG.ENEMY_SHAPES.length)],
                size: 20 + Math.random() * 30,
                color: `hsl(${Math.random() * 360}, 70%, 50%)`,
                health: 60 + Math.random() * 40,
                damage: 20 + Math.random() * 15,
                speed: 1 + Math.random() * 2,
                movementPattern: PROCEDURAL_CONFIG.MOVEMENT_PATTERNS[Math.floor(Math.random() * PROCEDURAL_CONFIG.MOVEMENT_PATTERNS.length)],
                rotationSpeed: 0.01 + Math.random() * 0.05,
                x: 100 + Math.random() * 600,
                y: 100 + Math.random() * 400,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2
            });
        }
        
        return enemies;
    }
    
    generateFallbackBoss(options) {
        console.log('🛠️ Gerando chefe fallback local...');
        
        return {
            id: `fallback_boss_${Date.now()}`,
            name: `${options.theme || proceduralState.theme} Guardian`,
            shape: 'gear',
            size: 100,
            color: '#FF4444',
            health: 1200,
            damage: 60,
            speed: 1.5,
            movementPattern: 'orbit',
            phases: [
                { healthThreshold: 0.75, speed: 1.5, movementPattern: 'orbit' },
                { healthThreshold: 0.5, speed: 2.0, movementPattern: 'chase' },
                { healthThreshold: 0.25, speed: 2.5, movementPattern: 'zigzag' }
            ],
            specialAbilities: [
                { type: 'projectile_burst', damage: 30, cooldown: 4000 },
                { type: 'summon_minions', cooldown: 8000 }
            ],
            weakPoints: [
                { x: 0, y: -40, size: 12, damage: 200 }
            ]
        };
    }
    
    // === UTILITÁRIOS DE GERAÇÃO ===
    generateRandomPlatforms(count) {
        const platforms = [];
        for (let i = 0; i < count; i++) {
            platforms.push({
                x: Math.random() * 600 + 100,
                y: Math.random() * 400 + 150,
                width: 80 + Math.random() * 120,
                height: 20,
                type: 'solid',
                style: 'normal'
            });
        }
        return platforms;
    }
    
    generateRandomObstacles(count) {
        const obstacles = [];
        const types = ['spikes', 'laser', 'rotating'];
        
        for (let i = 0; i < count; i++) {
            obstacles.push({
                x: Math.random() * 600 + 100,
                y: Math.random() * 300 + 200,
                width: 40 + Math.random() * 40,
                height: 30 + Math.random() * 30,
                type: types[Math.floor(Math.random() * types.length)],
                damage: 25 + Math.random() * 25
            });
        }
        return obstacles;
    }
    
    generateRandomDecorations(count) {
        const decorations = [];
        const types = ['crystal', 'antenna', 'screen'];
        
        for (let i = 0; i < count; i++) {
            decorations.push({
                x: Math.random() * PROCEDURAL_CONFIG.CANVAS_WIDTH,
                y: Math.random() * PROCEDURAL_CONFIG.CANVAS_HEIGHT,
                type: types[Math.floor(Math.random() * types.length)],
                size: 10 + Math.random() * 20,
                color: `hsl(${Math.random() * 360}, 50%, 60%)`,
                animated: Math.random() > 0.5
            });
        }
        return decorations;
    }
}

// === SISTEMA DE GESTÃO PROCEDURAL ===
class ProceduralManager {
    constructor() {
        this.generator = new ProceduralGenerator();
        this.activeEnemies = [];
        this.currentBoss = null;
        this.autoGenerateEnabled = true;
    }
    
    // === INICIALIZAR SISTEMA ===
    async initialize() {
        console.log('🎲 Inicializando sistema procedural avançado...');
        
        // Gerar conteúdo inicial
        await this.generateInitialContent();
        
        // Iniciar timer de geração automática
        this.startAutoGeneration();
        
        proceduralState.initialized = true;
        console.log('✅ Sistema procedural inicializado!');
    }
    
    // === GERAR CONTEÚDO INICIAL ===
    async generateInitialContent() {
        console.log('🎨 Gerando conteúdo inicial...');
        
        // Gerar mapa inicial
        const mapData = await this.generator.generateContent('map', {
            theme: proceduralState.theme,
            difficulty: proceduralState.difficulty
        });
        
        if (mapData) {
            proceduralState.currentMap = new ProceduralMap(mapData);
            proceduralState.mapsGenerated++;
        }
        
        // Gerar inimigos iniciais
        const enemiesData = await this.generator.generateContent('enemies', {
            count: 3,
            theme: proceduralState.theme,
            difficulty: proceduralState.difficulty
        });
        
        if (enemiesData && Array.isArray(enemiesData)) {
            enemiesData.forEach(enemyData => {
                const enemy = new GeometricEnemy(enemyData);
                this.activeEnemies.push(enemy);
            });
            proceduralState.enemiesGenerated += enemiesData.length;
        }
    }
    
    // === INICIAR GERAÇÃO AUTOMÁTICA ===
    startAutoGeneration() {
        if (proceduralState.autoGenerateTimer) {
            clearInterval(proceduralState.autoGenerateTimer);
        }
        
        proceduralState.autoGenerateTimer = setInterval(() => {
            if (this.autoGenerateEnabled) {
                this.generatePeriodicContent();
            }
        }, PROCEDURAL_CONFIG.GENERATION_INTERVAL);
    }
    
    // === GERAR CONTEÚDO PERIÓDICO ===
    async generatePeriodicContent() {
        const contentTypes = ['map', 'enemies'];
        
        // Adicionar boss ocasionalmente
        if (Math.random() < 0.2 && !this.currentBoss) {
            contentTypes.push('boss');
        }
        
        const selectedType = contentTypes[Math.floor(Math.random() * contentTypes.length)];
        
        switch (selectedType) {
            case 'map':
                await this.generateNewMap();
                break;
            case 'enemies':
                await this.generateNewEnemies();
                break;
            case 'boss':
                await this.generateNewBoss();
                break;
        }
    }
    
    // === GERAR NOVO MAPA ===
    async generateNewMap() {
        console.log('🗺️ Gerando novo mapa procedural...');
        
        const mapData = await this.generator.generateContent('map', {
            theme: this.selectRandomTheme(),
            difficulty: this.calculateCurrentDifficulty()
        });
        
        if (mapData) {
            proceduralState.currentMap = new ProceduralMap(mapData);
            proceduralState.mapsGenerated++;
            
            console.log(`✅ Novo mapa gerado: ${mapData.id}`);
            
            // Notificar sistema principal
            if (typeof showDebugMessage === 'function') {
                showDebugMessage(`🗺️ NOVO MAPA: ${mapData.theme}`);
            }
        }
    }
    
    // === GERAR NOVOS INIMIGOS ===
    async generateNewEnemies() {
        console.log('👾 Gerando novos inimigos geométricos...');
        
        const enemiesData = await this.generator.generateContent('enemies', {
            count: 2 + Math.floor(Math.random() * 3),
            theme: this.selectRandomTheme(),
            difficulty: this.calculateCurrentDifficulty()
        });
        
        if (enemiesData && Array.isArray(enemiesData)) {
            enemiesData.forEach(enemyData => {
                const enemy = new GeometricEnemy(enemyData);
                this.activeEnemies.push(enemy);
            });
            
            proceduralState.enemiesGenerated += enemiesData.length;
            console.log(`✅ ${enemiesData.length} novos inimigos gerados`);
        }
    }
    
    // === GERAR NOVO CHEFE ===
    async generateNewBoss() {
        if (this.currentBoss) return;
        
        console.log('👑 Gerando novo chefe procedural...');
        
        const bossData = await this.generator.generateContent('boss', {
            theme: this.selectRandomTheme(),
            difficulty: this.calculateCurrentDifficulty()
        });
        
        if (bossData) {
            this.currentBoss = new ProceduralBoss(bossData);
            proceduralState.bossesGenerated++;
            
            console.log(`✅ Chefe gerado: ${bossData.name}`);
            
            // Notificar aparição do chefe
            if (typeof showDebugMessage === 'function') {
                showDebugMessage(`👑 BOSS: ${bossData.name}`);
            }
        }
    }
    
    // === UTILITÁRIOS ===
    selectRandomTheme() {
        return PROCEDURAL_CONFIG.THEMES[Math.floor(Math.random() * PROCEDURAL_CONFIG.THEMES.length)];
    }
    
    calculateCurrentDifficulty() {
        return Math.min(5.0, 1.0 + (proceduralState.currentLevel - 1) * 0.3);
    }
    
    // === ATUALIZAR SISTEMA ===
    update(deltaTime, playerX, playerY) {
        // Atualizar inimigos geométricos
        this.activeEnemies.forEach((enemy, index) => {
            enemy.update(deltaTime, playerX, playerY);
            
            // Remover inimigos que saíram dos limites ou morreram
            if (enemy.health <= 0 || this.isOutOfBounds(enemy)) {
                this.activeEnemies.splice(index, 1);
            }
        });
        
        // Atualizar chefe
        if (this.currentBoss) {
            this.currentBoss.update(deltaTime, playerX, playerY);
            
            if (this.currentBoss.health <= 0) {
                console.log('👑 Chefe derrotado!');
                this.onBossDefeated(this.currentBoss);
                this.currentBoss = null;
            }
        }
    }
    
    isOutOfBounds(entity) {
        const margin = 100;
        return entity.x < -margin || 
               entity.x > PROCEDURAL_CONFIG.CANVAS_WIDTH + margin ||
               entity.y < -margin || 
               entity.y > PROCEDURAL_CONFIG.CANVAS_HEIGHT + margin;
    }
    
    onBossDefeated(boss) {
        // Criar recompensa especial
        if (typeof createSpecialHeart === 'function') {
            createSpecialHeart(boss.x, boss.y);
        }
        
        // Aumentar nível
        proceduralState.currentLevel++;
        proceduralState.difficulty = Math.min(5.0, proceduralState.difficulty + 0.2);
    }
    
    // === RENDERIZAR SISTEMA ===
    render(ctx) {
        // Renderizar mapa atual
        if (proceduralState.currentMap) {
            proceduralState.currentMap.render(ctx);
        }
        
        // Renderizar inimigos geométricos
        this.activeEnemies.forEach(enemy => {
            enemy.render(ctx);
        });
        
        // Renderizar chefe
        if (this.currentBoss) {
            this.currentBoss.render(ctx);
        }
    }
}

// === INSTÂNCIA GLOBAL DO SISTEMA ===
let proceduralManager = new ProceduralManager();

// === FUNÇÕES DE INTEGRAÇÃO ===
async function initializeProceduralSystem() {
    console.log('🎲 Inicializando sistema procedural...');
    
    if (proceduralState.initialized) {
        console.log('⚠️ Sistema procedural já inicializado');
        return;
    }
    
    try {
        await proceduralManager.initialize();
        
        console.log('✅ Sistema procedural totalmente inicializado!');
        
        // Expor estatísticas
        logProceduralStats();
        
    } catch (error) {
        console.error('❌ Erro ao inicializar sistema procedural:', error);
    }
}

function updateProceduralSystem(deltaTime, playerX, playerY) {
    if (proceduralState.initialized) {
        proceduralManager.update(deltaTime, playerX, playerY);
    }
}

function renderProceduralSystem(ctx) {
    if (proceduralState.initialized) {
        proceduralManager.render(ctx);
    }
}

function logProceduralStats() {
    console.group('📊 ESTATÍSTICAS DO SISTEMA PROCEDURAL');
    console.log(`🗺️ Mapas gerados: ${proceduralState.mapsGenerated}`);
    console.log(`👾 Inimigos gerados: ${proceduralState.enemiesGenerated}`);
    console.log(`👑 Chefes gerados: ${proceduralState.bossesGenerated}`);
    console.log(`🎚️ Nível atual: ${proceduralState.currentLevel}`);
    console.log(`⚡ Dificuldade: ${proceduralState.difficulty.toFixed(1)}/5.0`);
    console.log(`🎨 Tema atual: ${proceduralState.theme}`);
    console.log(`🔧 API Gemini: ${proceduralState.apiEnabled ? 'ATIVA' : 'DESATIVADA'}`);
    console.groupEnd();
}

// === CONTROLES DE DEBUG ===
function toggleProceduralGeneration() {
    proceduralManager.autoGenerateEnabled = !proceduralManager.autoGenerateEnabled;
    console.log(`🎲 Geração procedural: ${proceduralManager.autoGenerateEnabled ? 'ATIVA' : 'PAUSADA'}`);
    return proceduralManager.autoGenerateEnabled;
}

async function forceGenerateNewContent(type = 'map') {
    console.log(`🔧 Forçando geração de ${type}...`);
    
    switch (type) {
        case 'map':
            await proceduralManager.generateNewMap();
            break;
        case 'enemies':
            await proceduralManager.generateNewEnemies();
            break;
        case 'boss':
            await proceduralManager.generateNewBoss();
            break;
    }
}

// === EXPOR FUNÇÕES GLOBALMENTE ===
window.proceduralState = proceduralState;
window.proceduralManager = proceduralManager;
window.ProceduralMap = ProceduralMap;
window.GeometricEnemy = GeometricEnemy;
window.ProceduralBoss = ProceduralBoss;
window.initializeProceduralSystem = initializeProceduralSystem;
window.updateProceduralSystem = updateProceduralSystem;
window.renderProceduralSystem = renderProceduralSystem;
window.toggleProceduralGeneration = toggleProceduralGeneration;
window.forceGenerateNewContent = forceGenerateNewContent;
window.logProceduralStats = logProceduralStats;

console.log('🎲 Sistema avançado de geração procedural carregado!');

/* ==========================================================================
   SISTEMA DE GERAÇÃO PROCEDURAL DE MAPAS - JULIETTE 2D
   ========================================================================== */

// === CONFIGURAÇÃO DO GERADOR DE MAPAS ===
const MAP_GENERATOR_CONFIG = {
    API_URL: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent",
    API_KEY: "AIzaSyAWkTqpCr3kNcvgHg3AYjfxcaWvjObbOiw",
    
    // Configurações de mapa
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    TILE_SIZE: 32,
    CACHE_SIZE: 5, // Quantos mapas manter em cache
    GENERATION_COOLDOWN: 3000, // 3 segundos entre gerações
    
    // Tipos de elementos
    ELEMENT_TYPES: {
        PLATFORM: 'platform',
        STAIRS: 'stairs',
        OBSTACLE: 'obstacle',
        DECORATION: 'decoration',
        ENEMY_SPAWN: 'enemy_spawn',
        POWERUP: 'powerup',
        CHECKPOINT: 'checkpoint'
    },
    
    // Dificuldades
    DIFFICULTY_LEVELS: ['easy', 'medium', 'hard', 'nightmare'],
    
    // Temas
    THEMES: ['urban', 'industrial', 'forest', 'cave', 'space', 'desert']
};

// === ESTADO GLOBAL DO GERADOR ===
let mapGeneratorState = {
    initialized: false,
    currentMap: null,
    mapCache: new Map(),
    lastGenerationTime: 0,
    generationCount: 0,
    currentDifficulty: 'easy',
    currentTheme: 'urban',
    apiEnabled: true,
    generatedMaps: []
};

// === CLASSE DO MAPA GERADO ===
class GeneratedMap {
    constructor(mapData) {
        this.id = mapData.id || `map_${Date.now()}`;
        this.theme = mapData.theme || 'urban';
        this.difficulty = mapData.difficulty || 'easy';
        this.elements = mapData.elements || [];
        this.backgroundLayers = mapData.backgroundLayers || [];
        this.spawnPoints = mapData.spawnPoints || { player: { x: 100, y: 400 } };
        this.objectives = mapData.objectives || [];
        this.metadata = mapData.metadata || {};
        this.createdTime = Date.now();
        
        console.log(`🗺️ Mapa gerado: ${this.id} (${this.theme}/${this.difficulty})`);
    }
    
    // === RENDERIZAR MAPA ===
    render(ctx) {
        ctx.save();
        
        // Renderizar background
        this.renderBackground(ctx);
        
        // Renderizar elementos do mapa
        this.elements.forEach(element => {
            this.renderElement(ctx, element);
        });
        
        // Renderizar decorações
        this.renderDecorations(ctx);
        
        ctx.restore();
    }
    
    // === RENDERIZAR FUNDO ===
    renderBackground(ctx) {
        // Gradiente baseado no tema
        const gradient = ctx.createLinearGradient(0, 0, 0, MAP_GENERATOR_CONFIG.CANVAS_HEIGHT);
        
        switch (this.theme) {
            case 'urban':
                gradient.addColorStop(0, '#1a1a2e');
                gradient.addColorStop(1, '#16213e');
                break;
            case 'industrial':
                gradient.addColorStop(0, '#2c1810');
                gradient.addColorStop(1, '#1a0e0a');
                break;
            case 'forest':
                gradient.addColorStop(0, '#0f3460');
                gradient.addColorStop(1, '#0f5132');
                break;
            case 'cave':
                gradient.addColorStop(0, '#212529');
                gradient.addColorStop(1, '#000000');
                break;
            case 'space':
                gradient.addColorStop(0, '#000428');
                gradient.addColorStop(1, '#004e92');
                break;
            case 'desert':
                gradient.addColorStop(0, '#f7931e');
                gradient.addColorStop(1, '#ffd200');
                break;
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, MAP_GENERATOR_CONFIG.CANVAS_WIDTH, MAP_GENERATOR_CONFIG.CANVAS_HEIGHT);
        
        // Renderizar camadas de fundo
        this.backgroundLayers.forEach(layer => {
            this.renderBackgroundLayer(ctx, layer);
        });
    }
    
    // === RENDERIZAR CAMADA DE FUNDO ===
    renderBackgroundLayer(ctx, layer) {
        ctx.save();
        ctx.globalAlpha = layer.opacity || 0.5;
        
        switch (layer.type) {
            case 'stars':
                this.renderStars(ctx, layer);
                break;
            case 'clouds':
                this.renderClouds(ctx, layer);
                break;
            case 'buildings':
                this.renderBuildings(ctx, layer);
                break;
            case 'mountains':
                this.renderMountains(ctx, layer);
                break;
        }
        
        ctx.restore();
    }
    
    // === RENDERIZAR ESTRELAS ===
    renderStars(ctx, layer) {
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < (layer.count || 100); i++) {
            const x = Math.random() * MAP_GENERATOR_CONFIG.CANVAS_WIDTH;
            const y = Math.random() * MAP_GENERATOR_CONFIG.CANVAS_HEIGHT * 0.6;
            const size = Math.random() * 3 + 1;
            
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // === RENDERIZAR ELEMENTO DO MAPA ===
    renderElement(ctx, element) {
        ctx.save();
        
        switch (element.type) {
            case 'platform':
                this.renderPlatform(ctx, element);
                break;
            case 'stairs':
                this.renderStairs(ctx, element);
                break;
            case 'obstacle':
                this.renderObstacle(ctx, element);
                break;
            case 'decoration':
                this.renderDecoration(ctx, element);
                break;
        }
        
        ctx.restore();
    }
    
    // === RENDERIZAR PLATAFORMA ===
    renderPlatform(ctx, element) {
        const { x, y, width, height, style } = element;
        
        // Cor baseada no tema
        let color = '#666666';
        switch (this.theme) {
            case 'urban': color = '#4a5568'; break;
            case 'industrial': color = '#8b4513'; break;
            case 'forest': color = '#654321'; break;
            case 'cave': color = '#2d2d2d'; break;
            case 'space': color = '#718096'; break;
            case 'desert': color = '#cd853f'; break;
        }
        
        // Renderizar plataforma
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width, height);
        
        // Borda superior brilhante
        ctx.fillStyle = this.lightenColor(color, 0.3);
        ctx.fillRect(x, y, width, 4);
        
        // Borda inferior escura
        ctx.fillStyle = this.darkenColor(color, 0.3);
        ctx.fillRect(x, y + height - 4, width, 4);
        
        // Decoração baseada no estilo
        if (style === 'textured') {
            this.addPlatformTexture(ctx, element);
        }
    }
    
    // === RENDERIZAR ESCADAS ===
    renderStairs(ctx, element) {
        const { x, y, width, height, steps, direction } = element;
        const stepHeight = height / steps;
        const stepWidth = width / steps;
        
        let color = '#555555';
        switch (this.theme) {
            case 'industrial': color = '#8b4513'; break;
            case 'forest': color = '#654321'; break;
            case 'cave': color = '#2d2d2d'; break;
        }
        
        ctx.fillStyle = color;
        
        for (let i = 0; i < steps; i++) {
            const stepX = direction === 'up' ? x + (i * stepWidth) : x + width - ((i + 1) * stepWidth);
            const stepY = y + height - ((i + 1) * stepHeight);
            
            ctx.fillRect(stepX, stepY, stepWidth, stepHeight * (i + 1));
            
            // Borda do degrau
            ctx.strokeStyle = this.lightenColor(color, 0.2);
            ctx.lineWidth = 2;
            ctx.strokeRect(stepX, stepY, stepWidth, stepHeight);
        }
    }
    
    // === RENDERIZAR OBSTÁCULO ===
    renderObstacle(ctx, element) {
        const { x, y, width, height, obstacleType } = element;
        
        switch (obstacleType) {
            case 'spikes':
                this.renderSpikes(ctx, element);
                break;
            case 'rotating':
                this.renderRotatingObstacle(ctx, element);
                break;
            case 'moving':
                this.renderMovingObstacle(ctx, element);
                break;
            default:
                // Obstáculo sólido padrão
                ctx.fillStyle = '#8B0000';
                ctx.fillRect(x, y, width, height);
                break;
        }
    }
    
    // === RENDERIZAR ESPINHOS ===
    renderSpikes(ctx, element) {
        const { x, y, width, height } = element;
        const spikeCount = Math.floor(width / 20);
        const spikeWidth = width / spikeCount;
        
        ctx.fillStyle = '#DC143C';
        
        for (let i = 0; i < spikeCount; i++) {
            const spikeX = x + (i * spikeWidth);
            
            ctx.beginPath();
            ctx.moveTo(spikeX, y + height);
            ctx.lineTo(spikeX + spikeWidth / 2, y);
            ctx.lineTo(spikeX + spikeWidth, y + height);
            ctx.closePath();
            ctx.fill();
            
            // Borda dos espinhos
            ctx.strokeStyle = '#8B0000';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }
    
    // === UTILITÁRIOS DE COR ===
    lightenColor(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + (255 * amount));
        const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + (255 * amount));
        const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + (255 * amount));
        
        return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
    }
    
    darkenColor(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - (255 * amount));
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - (255 * amount));
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - (255 * amount));
        
        return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
    }
    
    // === VERIFICAR COLISÃO COM ELEMENTO ===
    checkCollision(playerX, playerY, playerWidth = 32, playerHeight = 48) {
        const collisions = [];
        
        this.elements.forEach(element => {
            if (this.isColliding(
                playerX, playerY, playerWidth, playerHeight,
                element.x, element.y, element.width, element.height
            )) {
                collisions.push(element);
            }
        });
        
        return collisions;
    }
    
    // === VERIFICAR COLISÃO RETANGULAR ===
    isColliding(x1, y1, w1, h1, x2, y2, w2, h2) {
        return x1 < x2 + w2 &&
               x1 + w1 > x2 &&
               y1 < y2 + h2 &&
               y1 + h1 > y2;
    }
}

// === GERADOR DE MAPAS ===
class MapGenerator {
    constructor() {
        this.mapCache = new Map();
        this.lastRequestTime = 0;
    }
    
    // === GERAR NOVO MAPA ===
    async generateMap(difficulty = 'easy', theme = 'urban', forceNew = false) {
        if (!this.canGenerateMap() && !forceNew) {
            console.log('⏳ Aguardando cooldown do gerador de mapas');
            return this.getRandomCachedMap();
        }
        
        console.log(`🎲 Gerando novo mapa: ${theme}/${difficulty}`);
        
        try {
            // Solicitar geração à API Gemini
            const mapData = await this.requestMapGeneration(difficulty, theme);
            
            if (mapData) {
                const generatedMap = new GeneratedMap(mapData);
                this.cacheMap(generatedMap);
                mapGeneratorState.currentMap = generatedMap;
                mapGeneratorState.generationCount++;
                
                return generatedMap;
            }
        } catch (error) {
            console.warn('❌ Erro na geração via API, usando gerador local:', error);
        }
        
        // Fallback para geração local
        return this.generateLocalMap(difficulty, theme);
    }
    
    // === VERIFICAR SE PODE GERAR MAPA ===
    canGenerateMap() {
        return mapGeneratorState.apiEnabled && 
               (Date.now() - this.lastRequestTime > MAP_GENERATOR_CONFIG.GENERATION_COOLDOWN);
    }
    
    // === SOLICITAR GERAÇÃO VIA API GEMINI ===
    async requestMapGeneration(difficulty, theme) {
        if (!this.canGenerateMap()) return null;
        
        const prompt = `
Generate a 2D side-scrolling game level layout with the following specifications:

THEME: ${theme} (affects visual style and atmosphere)
DIFFICULTY: ${difficulty} (easy=simple layouts, hard=complex challenges)
CANVAS: 800x600 pixels
TILE_SIZE: 32 pixels

Create a JSON response with this structure:
{
    "id": "unique_map_id",
    "theme": "${theme}",
    "difficulty": "${difficulty}",
    "elements": [
        {
            "type": "platform|stairs|obstacle|decoration",
            "x": number,
            "y": number,
            "width": number,
            "height": number,
            "steps": number (for stairs only),
            "direction": "up|down" (for stairs),
            "obstacleType": "spikes|rotating|moving" (for obstacles),
            "style": "normal|textured|decorated"
        }
    ],
    "backgroundLayers": [
        {
            "type": "stars|clouds|buildings|mountains",
            "opacity": 0.1-0.8,
            "count": number (for stars/clouds)
        }
    ],
    "spawnPoints": {
        "player": {"x": 100, "y": 400}
    },
    "metadata": {
        "description": "brief level description",
        "estimatedDifficulty": 1-10,
        "recommendedWeapons": ["weapon1", "weapon2"]
    }
}

DESIGN PRINCIPLES:
- Create interesting platforming challenges
- Balance difficulty appropriately
- Ensure player can navigate the level
- Add visual variety with decorations
- Include strategic enemy spawn locations
- Make use of vertical space with stairs and platforms
- Theme should influence element positioning and density

Generate a creative and challenging level!`;

        try {
            this.lastRequestTime = Date.now();
            
            const response = await fetch(MAP_GENERATOR_CONFIG.API_URL + '?key=' + MAP_GENERATOR_CONFIG.API_KEY, {
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
                        maxOutputTokens: 2000,
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
                    const mapData = JSON.parse(jsonMatch[0]);
                    console.log(`🤖 Mapa gerado pela IA: ${mapData.metadata?.description}`);
                    return mapData;
                }
            }
            
        } catch (error) {
            console.warn('❌ Erro na API Gemini para mapas:', error);
            mapGeneratorState.apiEnabled = false;
            
            // Reativar API após 1 minuto
            setTimeout(() => {
                mapGeneratorState.apiEnabled = true;
                console.log('🔄 API Gemini reativada para geração de mapas');
            }, 60000);
        }
        
        return null;
    }
    
    // === GERAÇÃO LOCAL (FALLBACK) ===
    generateLocalMap(difficulty = 'easy', theme = 'urban') {
        console.log(`🛠️ Gerando mapa local: ${theme}/${difficulty}`);
        
        const mapData = {
            id: `local_map_${Date.now()}`,
            theme: theme,
            difficulty: difficulty,
            elements: this.generateLocalElements(difficulty, theme),
            backgroundLayers: this.generateLocalBackground(theme),
            spawnPoints: { player: { x: 100, y: 400 } },
            metadata: {
                description: `Local generated ${theme} level (${difficulty})`,
                estimatedDifficulty: this.getDifficultyValue(difficulty),
                recommendedWeapons: ['normal', 'spread']
            }
        };
        
        const generatedMap = new GeneratedMap(mapData);
        this.cacheMap(generatedMap);
        mapGeneratorState.currentMap = generatedMap;
        mapGeneratorState.generationCount++;
        
        return generatedMap;
    }
    
    // === GERAR ELEMENTOS LOCAIS ===
    generateLocalElements(difficulty, theme) {
        const elements = [];
        const difficultyValue = this.getDifficultyValue(difficulty);
        
        // Plataformas básicas
        const platformCount = 3 + difficultyValue;
        for (let i = 0; i < platformCount; i++) {
            elements.push({
                type: 'platform',
                x: Math.random() * 600 + 100,
                y: Math.random() * 400 + 150,
                width: Math.random() * 120 + 80,
                height: 20,
                style: Math.random() > 0.5 ? 'textured' : 'normal'
            });
        }
        
        // Escadas
        const stairCount = Math.floor(difficultyValue / 2) + 1;
        for (let i = 0; i < stairCount; i++) {
            elements.push({
                type: 'stairs',
                x: Math.random() * 500 + 150,
                y: Math.random() * 300 + 200,
                width: 80 + Math.random() * 40,
                height: 60 + Math.random() * 40,
                steps: Math.floor(Math.random() * 4) + 3,
                direction: Math.random() > 0.5 ? 'up' : 'down'
            });
        }
        
        // Obstáculos (aumenta com dificuldade)
        const obstacleCount = Math.floor(difficultyValue / 3);
        for (let i = 0; i < obstacleCount; i++) {
            const obstacleTypes = ['spikes', 'rotating', 'moving'];
            elements.push({
                type: 'obstacle',
                x: Math.random() * 600 + 100,
                y: Math.random() * 300 + 250,
                width: 40 + Math.random() * 40,
                height: 20 + Math.random() * 30,
                obstacleType: obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)]
            });
        }
        
        return elements;
    }
    
    // === GERAR FUNDO LOCAL ===
    generateLocalBackground(theme) {
        const layers = [];
        
        switch (theme) {
            case 'space':
                layers.push({ type: 'stars', opacity: 0.8, count: 150 });
                break;
            case 'urban':
                layers.push({ type: 'buildings', opacity: 0.4 });
                layers.push({ type: 'clouds', opacity: 0.3, count: 5 });
                break;
            case 'forest':
                layers.push({ type: 'mountains', opacity: 0.5 });
                layers.push({ type: 'clouds', opacity: 0.2, count: 8 });
                break;
        }
        
        return layers;
    }
    
    // === OBTER VALOR NUMÉRICO DA DIFICULDADE ===
    getDifficultyValue(difficulty) {
        const values = { easy: 1, medium: 3, hard: 5, nightmare: 8 };
        return values[difficulty] || 1;
    }
    
    // === CACHEAR MAPA ===
    cacheMap(map) {
        // Limitar tamanho do cache
        if (this.mapCache.size >= MAP_GENERATOR_CONFIG.CACHE_SIZE) {
            const oldestKey = this.mapCache.keys().next().value;
            this.mapCache.delete(oldestKey);
        }
        
        this.mapCache.set(map.id, map);
        console.log(`💾 Mapa ${map.id} adicionado ao cache`);
    }
    
    // === OBTER MAPA ALEATÓRIO DO CACHE ===
    getRandomCachedMap() {
        const maps = Array.from(this.mapCache.values());
        if (maps.length === 0) {
            return this.generateLocalMap();
        }
        
        const randomMap = maps[Math.floor(Math.random() * maps.length)];
        console.log(`📁 Usando mapa do cache: ${randomMap.id}`);
        return randomMap;
    }
    
    // === OBTER MAPA ATUAL ===
    getCurrentMap() {
        return mapGeneratorState.currentMap || this.generateLocalMap();
    }
    
    // === LIMPAR CACHE ===
    clearCache() {
        this.mapCache.clear();
        console.log('🧹 Cache de mapas limpo');
    }
}

// === GERENCIADOR DE MAPAS GLOBAL ===
let mapGenerator = new MapGenerator();

// === INICIALIZAR SISTEMA DE MAPAS ===
function initializeMapGenerator() {
    console.log('🗺️ Inicializando gerador de mapas procedurais...');
    
    mapGeneratorState.initialized = true;
    
    // Gerar primeiro mapa
    generateInitialMap();
    
    console.log('✅ Sistema de geração de mapas inicializado!');
}

// === GERAR MAPA INICIAL ===
async function generateInitialMap() {
    const initialMap = await mapGenerator.generateMap('easy', 'urban');
    mapGeneratorState.currentMap = initialMap;
    
    console.log('🎮 Mapa inicial gerado e pronto!');
    return initialMap;
}

// === GERAR PRÓXIMO MAPA ===
async function generateNextMap() {
    // Aumentar dificuldade gradualmente
    const difficultyIndex = Math.min(
        Math.floor(mapGeneratorState.generationCount / 3),
        MAP_GENERATOR_CONFIG.DIFFICULTY_LEVELS.length - 1
    );
    
    const difficulty = MAP_GENERATOR_CONFIG.DIFFICULTY_LEVELS[difficultyIndex];
    const theme = MAP_GENERATOR_CONFIG.THEMES[
        Math.floor(Math.random() * MAP_GENERATOR_CONFIG.THEMES.length)
    ];
    
    console.log(`🚀 Gerando próximo mapa: ${theme}/${difficulty}`);
    
    const nextMap = await mapGenerator.generateMap(difficulty, theme);
    mapGeneratorState.currentMap = nextMap;
    
    return nextMap;
}

// === RENDERIZAR MAPA ATUAL ===
function renderCurrentMap(ctx) {
    if (mapGeneratorState.currentMap) {
        mapGeneratorState.currentMap.render(ctx);
    }
}

// === VERIFICAR COLISÕES DO MAPA ===
function checkMapCollisions(playerX, playerY, playerWidth = 32, playerHeight = 48) {
    if (mapGeneratorState.currentMap) {
        return mapGeneratorState.currentMap.checkCollision(playerX, playerY, playerWidth, playerHeight);
    }
    return [];
}

// === OBTER SPAWN POINT DO JOGADOR ===
function getPlayerSpawnPoint() {
    if (mapGeneratorState.currentMap && mapGeneratorState.currentMap.spawnPoints.player) {
        return mapGeneratorState.currentMap.spawnPoints.player;
    }
    return { x: 100, y: 400 };
}

// === OBTER ESTATÍSTICAS DO GERADOR ===
function getMapGeneratorStats() {
    return {
        mapsGenerated: mapGeneratorState.generationCount,
        currentMapId: mapGeneratorState.currentMap?.id || 'none',
        cacheSize: mapGenerator.mapCache.size,
        apiEnabled: mapGeneratorState.apiEnabled,
        currentDifficulty: mapGeneratorState.currentMap?.difficulty || 'unknown',
        currentTheme: mapGeneratorState.currentMap?.theme || 'unknown'
    };
}

// === FORÇAR GERAÇÃO DE NOVO MAPA ===
async function forceGenerateNewMap() {
    console.log('🔧 Forçando geração de novo mapa...');
    const newMap = await mapGenerator.generateMap(
        mapGeneratorState.currentDifficulty,
        mapGeneratorState.currentTheme,
        true
    );
    
    // Mostrar notificação
    if (typeof showDebugMessage === 'function') {
        showDebugMessage(`🗺️ NOVO MAPA: ${newMap.theme}/${newMap.difficulty}`);
    }
    
    return newMap;
}

// === TOGGLE API GEMINI PARA MAPAS ===
function toggleMapAPI() {
    mapGeneratorState.apiEnabled = !mapGeneratorState.apiEnabled;
    console.log(`🗺️ API Gemini para mapas ${mapGeneratorState.apiEnabled ? 'ATIVA' : 'DESATIVADA'}`);
    
    if (typeof showDebugMessage === 'function') {
        showDebugMessage(`API Mapas ${mapGeneratorState.apiEnabled ? 'ON' : 'OFF'}`);
    }
    
    return mapGeneratorState.apiEnabled;
}

// === EXPOR FUNÇÕES GLOBALMENTE ===
window.mapGeneratorState = mapGeneratorState;
window.mapGenerator = mapGenerator;
window.GeneratedMap = GeneratedMap;
window.MapGenerator = MapGenerator;
window.initializeMapGenerator = initializeMapGenerator;
window.generateNextMap = generateNextMap;
window.renderCurrentMap = renderCurrentMap;
window.checkMapCollisions = checkMapCollisions;
window.getPlayerSpawnPoint = getPlayerSpawnPoint;
window.getMapGeneratorStats = getMapGeneratorStats;
window.forceGenerateNewMap = forceGenerateNewMap;
window.toggleMapAPI = toggleMapAPI;

console.log('🗺️ Sistema de geração procedural de mapas carregado!');

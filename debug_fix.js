// Debug e correções para o jogo Juliette 2D

// 1. Verificar se as imagens existem
console.log("🔍 Iniciando debug do jogo...");

// 2. Verificar carregamento das imagens
const debugImages = () => {
    const imageFiles = [
        'assets/juliette_animated_spritesheet.png',
        'assets/01 corrente mao esquerda.png',
        'assets/01 corrente nas 2 maos.png',
        'assets/01 maos para cima.png',
        'assets/02 arma para cima.png',
        'assets/03 arma para cima disparando 60 graus.png',
        'assets/03 arma disparando para frente.png',
        'assets/03 arma para cima disparando 60 graus para baixo.png',
        'assets/03 arma para cima disparando 90 graus.png',
        'assets/fundo 2d melhor.png',
        'assets/fundo 2d melhor fase 2.png',
        'assets/cena01.jpg'
    ];
    
    imageFiles.forEach((src, index) => {
        const img = new Image();
        img.onload = () => console.log(`✅ Imagem ${index + 1} carregada: ${src}`);
        img.onerror = () => console.error(`❌ ERRO: Não foi possível carregar: ${src}`);
        img.src = src;
    });
};

// 3. Função alternativa para iniciar o jogo sem esperar todas as imagens
const forceStartGame = () => {
    console.log("🚀 Forçando início do jogo...");
    
    // Resetar contador de imagens
    window.imagesLoaded = window.totalImages || 13;
    
    // Iniciar o gameLoop se não estiver rodando
    if (typeof gameLoop === 'function') {
        console.log("🎮 Iniciando loop do jogo...");
        gameLoop();
    } else {
        console.error("❌ Função gameLoop não encontrada!");
    }
};

// 4. Verificar se o gameLoop está rodando
const checkGameStatus = () => {
    console.log("📊 Status do jogo:");
    console.log("- Game State:", window.gameState);
    console.log("- Canvas Width:", window.CANVAS_WIDTH);
    console.log("- Canvas Height:", window.CANVAS_HEIGHT);
    console.log("- Images Loaded:", window.imagesLoaded, "/", window.totalImages);
    console.log("- Player Position X:", window.posX);
    console.log("- Player Position Y:", window.posY);
    console.log("- Current Animation:", window.currentAnim);
};

// 5. Função de emergência para reiniciar
const emergencyRestart = () => {
    console.log("🆘 Reinício de emergência...");
    
    if (typeof restartGame === 'function') {
        restartGame();
        forceStartGame();
    } else {
        window.location.reload();
    }
};

// 6. Detectar erros JavaScript
window.addEventListener('error', (e) => {
    console.error("🚨 ERRO DETECTADO:", e.error);
    console.error("Arquivo:", e.filename, "Linha:", e.lineno);
    console.log("Tentando corrigir automaticamente...");
});

// 7. Executar debug após 2 segundos
setTimeout(() => {
    console.log("🔧 Executando diagnósticos...");
    debugImages();
    checkGameStatus();
    
    // Se o jogo não iniciou após 5 segundos, forçar início
    setTimeout(() => {
        if (!window.gameState || window.gameState.gameOver !== false) {
            console.log("⚠️ Jogo não iniciou automaticamente. Forçando início...");
            forceStartGame();
        }
    }, 3000);
}, 2000);

// 8. Adicionar controles de debug no console
console.log(`
🎮 COMANDOS DE DEBUG DISPONÍVEIS:
- debugImages(): Verificar carregamento de imagens  
- checkGameStatus(): Ver status atual do jogo
- forceStartGame(): Forçar início do jogo
- emergencyRestart(): Reiniciar completamente
- Pressione F12 para abrir o console e usar estes comandos
`);

// Tornar funções disponíveis globalmente
window.debugImages = debugImages;
window.checkGameStatus = checkGameStatus;
window.forceStartGame = forceStartGame;
window.emergencyRestart = emergencyRestart;

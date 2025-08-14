// =====================================================
// SERVICE WORKER - JULIETTE PSICOSE 2D PWA
// Sistema de cache offline avançado para jogos
// =====================================================

const CACHE_NAME = 'juliette-2d-pwa-v2.1.0';
const GAME_CACHE = 'juliette-game-assets-v2.1.0';
const STATIC_CACHE = 'juliette-static-v2.1.0';

// === RECURSOS CRÍTICOS (SEMPRE EM CACHE) ===
const CRITICAL_RESOURCES = [
    './',
    './index.html',
    './game.js',
    './style.css',
    './manifest.json'
];

// === ASSETS DO JOGO (CACHE COM ESTRATÉGIA ESPECÍFICA) ===
const GAME_ASSETS = [
    // Imagens da Juliette
    './assets/juliette_animated_spritesheet.png',
    './assets/01 corrente mao esquerda.png',
    './assets/01 corrente nas 2 maos.png',
    './assets/01 maos para cima.png',
    './assets/02 arma para cima.png',
    './assets/01 corrente mao esquerda 1.png',
    './assets/01 corrente mao esquerda 2.png',
    './assets/01 maos para cima 1.png',
    './assets/01 maos para cima 2.png',
    './assets/03 arma para cima disparando 60 graus.png',
    './assets/03 arma disparando para frente.png',
    './assets/03 arma para cima disparando 60 graus para baixo.png',
    './assets/03 arma para cima disparando 90 graus.png',
    
    // Backgrounds
    './assets/fundo 2d melhor.png',
    './assets/fundo 2d a.png',
    './assets/fundo 2d melhor fase 2.png',
    './assets/cena01.jpg',
    
    // Ícones PWA
    './assets/icons/icon-192x192.png',
    './assets/icons/icon-512x512.png'
];

// === RECURSOS DE FONTES E BIBLIOTECAS ===
const EXTERNAL_RESOURCES = [
    'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap',
    'https://fonts.gstatic.com/s/orbitron/v29/yMJMMIlzdpvBhQQL_SC3X9yhF25-T1nyGy6BoWgz.woff2'
];

// =====================================================
// EVENTO DE INSTALAÇÃO
// =====================================================
self.addEventListener('install', (event) => {
    console.log('🚀 Service Worker: Instalando...');
    
    event.waitUntil(
        Promise.all([
            // Cache crítico
            caches.open(STATIC_CACHE).then((cache) => {
                console.log('📦 Cacheando recursos críticos...');
                return cache.addAll(CRITICAL_RESOURCES);
            }),
            
            // Cache de assets do jogo
            caches.open(GAME_CACHE).then((cache) => {
                console.log('🎮 Cacheando assets do jogo...');
                return cache.addAll(GAME_ASSETS);
            }),
            
            // Cache de recursos externos
            caches.open(CACHE_NAME).then((cache) => {
                console.log('🌐 Cacheando recursos externos...');
                return Promise.allSettled(
                    EXTERNAL_RESOURCES.map(url => cache.add(url))
                );
            })
        ]).then(() => {
            console.log('✅ Service Worker: Instalação completa!');
            return self.skipWaiting();
        })
    );
});

// =====================================================
// EVENTO DE ATIVAÇÃO
// =====================================================
self.addEventListener('activate', (event) => {
    console.log('⚡ Service Worker: Ativando...');
    
    event.waitUntil(
        Promise.all([
            // Limpar caches antigos
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME && 
                            cacheName !== GAME_CACHE && 
                            cacheName !== STATIC_CACHE) {
                            console.log('🗑️ Removendo cache antigo:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            
            // Assumir controle imediato
            self.clients.claim()
        ]).then(() => {
            console.log('✅ Service Worker: Ativado e controlando todas as abas!');
        })
    );
});

// =====================================================
// INTERCEPTAÇÃO DE REQUISIÇÕES (FETCH)
// =====================================================
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // Ignorar requisições de outros domínios não relacionadas
    if (!url.origin.includes('localhost') && 
        !url.origin.includes('127.0.0.1') && 
        !url.origin.includes('fonts.googleapis.com') &&
        !url.origin.includes('fonts.gstatic.com') &&
        !url.hostname.includes(self.location.hostname)) {
        return;
    }
    
    event.respondWith(handleFetch(event.request));
});

// =====================================================
// ESTRATÉGIAS DE CACHE INTELIGENTES
// =====================================================

async function handleFetch(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    try {
        // === ESTRATÉGIA 1: RECURSOS CRÍTICOS (Cache First) ===
        if (CRITICAL_RESOURCES.some(resource => pathname.endsWith(resource.replace('./', '')))) {
            return await cacheFirst(request, STATIC_CACHE);
        }
        
        // === ESTRATÉGIA 2: ASSETS DO JOGO (Cache First com Update) ===
        if (GAME_ASSETS.some(asset => pathname.includes(asset.replace('./', '')))) {
            return await cacheFirstWithUpdate(request, GAME_CACHE);
        }
        
        // === ESTRATÉGIA 3: FONTES EXTERNAS (Stale While Revalidate) ===
        if (url.hostname.includes('fonts.googleapis.com') || 
            url.hostname.includes('fonts.gstatic.com')) {
            return await staleWhileRevalidate(request, CACHE_NAME);
        }
        
        // === ESTRATÉGIA 4: NAVEGAÇÃO (Network First com Fallback) ===
        if (request.mode === 'navigate') {
            return await networkFirstWithFallback(request, STATIC_CACHE);
        }
        
        // === ESTRATÉGIA 5: OUTROS RECURSOS (Network First) ===
        return await networkFirst(request, CACHE_NAME);
        
    } catch (error) {
        console.error('❌ Erro no fetch:', error);
        return await getOfflineFallback(request);
    }
}

// =====================================================
// IMPLEMENTAÇÃO DAS ESTRATÉGIAS DE CACHE
// =====================================================

// Cache First - Prioriza cache, fallback para network
async function cacheFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
        console.log('📦 Cache hit:', request.url);
        return cachedResponse;
    }
    
    console.log('🌐 Cache miss, buscando na network:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
}

// Cache First com Update em Background
async function cacheFirstWithUpdate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    // Retorna do cache imediatamente se disponível
    if (cachedResponse) {
        // Atualiza em background
        fetch(request).then(networkResponse => {
            if (networkResponse.ok) {
                cache.put(request, networkResponse.clone());
            }
        }).catch(() => {}); // Silenciar erros de network em background
        
        console.log('📦 Cache hit (updating bg):', request.url);
        return cachedResponse;
    }
    
    // Se não está em cache, busca na network
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
}

// Network First - Prioriza network, fallback para cache
async function networkFirst(request, cacheName) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('🌐 Network failed, tentando cache:', request.url);
        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        throw error;
    }
}

// Network First com Fallback para navegação
async function networkFirstWithFallback(request, cacheName) {
    try {
        const networkResponse = await fetch(request);
        return networkResponse;
    } catch (error) {
        console.log('🌐 Network failed para navegação, usando cache');
        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match('./index.html');
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        throw error;
    }
}

// Stale While Revalidate - Retorna cache e atualiza em background
async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    // Busca na network em paralelo
    const networkPromise = fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch(() => {});
    
    // Retorna cache se disponível, senão espera network
    if (cachedResponse) {
        console.log('📦 Stale cache hit:', request.url);
        networkPromise; // Atualiza em background
        return cachedResponse;
    }
    
    return await networkPromise;
}

// =====================================================
// FALLBACKS OFFLINE
// =====================================================

async function getOfflineFallback(request) {
    // Para navegação, retorna a página principal
    if (request.mode === 'navigate') {
        const cache = await caches.open(STATIC_CACHE);
        const fallback = await cache.match('./index.html');
        if (fallback) {
            return fallback;
        }
    }
    
    // Para imagens, pode retornar uma imagem placeholder
    if (request.destination === 'image') {
        return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">' +
            '<rect width="200" height="200" fill="#1a1a2e"/>' +
            '<text x="100" y="100" font-family="Arial" font-size="14" fill="#fff" text-anchor="middle">' +
            'Imagem offline' +
            '</text></svg>',
            { headers: { 'Content-Type': 'image/svg+xml' } }
        );
    }
    
    // Response genérica para outros tipos
    return new Response('Conteúdo indisponível offline', {
        status: 408,
        statusText: 'Offline'
    });
}

// =====================================================
// MENSAGENS DO CLIENTE
// =====================================================

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('📱 Recebido comando para atualizar SW');
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
    
    if (event.data && event.data.type === 'CACHE_STATS') {
        getCacheStats().then(stats => {
            event.ports[0].postMessage(stats);
        });
    }
});

// =====================================================
// UTILITÁRIOS E ESTATÍSTICAS
// =====================================================

async function getCacheStats() {
    const cacheNames = await caches.keys();
    const stats = {};
    
    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        stats[cacheName] = requests.length;
    }
    
    return {
        caches: stats,
        total: Object.values(stats).reduce((a, b) => a + b, 0),
        version: CACHE_NAME
    };
}

// =====================================================
// SYNC BACKGROUND (PARA FUTURAS IMPLEMENTAÇÕES)
// =====================================================

self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        console.log('🔄 Background sync executando...');
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    // Implementar sync de dados do jogo (scores, saves, etc.)
    console.log('🎮 Sincronizando dados do jogo...');
}

// =====================================================
// PUSH NOTIFICATIONS (PARA FUTURAS IMPLEMENTAÇÕES)  
// =====================================================

self.addEventListener('push', (event) => {
    console.log('📬 Push notification recebida');
    
    const options = {
        body: event.data ? event.data.text() : 'Nova atualização disponível!',
        icon: './assets/icons/icon-192x192.png',
        badge: './assets/icons/icon-72x72.png',
        vibrate: [100, 50, 100],
        tag: 'juliette-notification'
    };
    
    event.waitUntil(
        self.registration.showNotification('Juliette Psicose 2D', options)
    );
});

self.addEventListener('notificationclick', (event) => {
    console.log('🔔 Notification clicked');
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow('./')
    );
});

console.log('🎮 Service Worker Juliette 2D carregado - Versão:', CACHE_NAME);

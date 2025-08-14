// Configurações dos consoles
const consoleConfig = {
    nes: {
        title: "NES | Famicom Disk System",
        extensions: [".fds", ".nes", ".unif", ".unf"],
        bios: "disksys.rom (MD5 sum: ca30b50f880eb660a320674ed365ef7a)",
        cores: ["mesen", "nestopia"],
        sampleGames: [
            { name: "Super Mario Bros", url: "roms/nes/smb.nes" },
            { name: "The Legend of Zelda", url: "roms/nes/zelda.nes" },
            { name: "Metroid", url: "roms/nes/metroid.nes" }
        ]
    },
    snes: {
        title: "SNES",
        extensions: [".smc", ".sfc", ".fig", ".swc"],
        bios: "Not required",
        cores: ["snes9x"],
        sampleGames: [
            { name: "Super Mario World", url: "roms/snes/smw.smc" },
            { name: "The Legend of Zelda: A Link to the Past", url: "roms/snes/alttp.smc" }
        ]
    },
    gb: {
        title: "Game Boy | Color",
        extensions: [".gb", ".gbc", ".sgb"],
        bios: "gb_bios.bin (optional)",
        cores: ["gambatte"],
        sampleGames: [
            { name: "Tetris", url: "roms/gb/tetris.gb" },
            { name: "Pokémon Red", url: "roms/gb/pokemon_red.gb" }
        ]
    },
    gba: {
        title: "Game Boy Advance",
        extensions: [".gba"],
        bios: "gba_bios.bin (MD5 sum: a860e8c0b6d573d191e4ec7db1b1e4f6)",
        cores: ["mgba"],
        sampleGames: [
            { name: "Pokémon Ruby", url: "roms/gba/pokemon_ruby.gba" },
            { name: "Super Mario Advance", url: "roms/gba/sma.gba" }
        ]
    },
    n64: {
        title: "Nintendo 64",
        extensions: [".n64", ".v64", ".z64"],
        bios: "Not required",
        cores: ["mupen64plus"],
        sampleGames: [
            { name: "Super Mario 64", url: "roms/n64/sm64.n64" },
            { name: "The Legend of Zelda: Ocarina of Time", url: "roms/n64/oot.n64" }
        ]
    },
    segamd: {
        title: "Sega Mega Drive",
        extensions: [".md", ".bin", ".gen", ".smd"],
        bios: "Not required",
        cores: ["genesis_plus_gx"],
        sampleGames: [
            { name: "Sonic the Hedgehog", url: "roms/md/sonic.bin" },
            { name: "Streets of Rage", url: "roms/md/sor.bin" }
        ]
    },
    psx: {
        title: "PlayStation",
        extensions: [".bin", ".cue", ".img", ".mdf", ".pbp", ".toc", ".cbn", ".m3u"],
        bios: "scph1001.bin (MD5 sum: 924e392ed05558ffdb115408c263dccf)",
        cores: ["beetle_psx_hw"],
        sampleGames: [
            { name: "Final Fantasy VII", url: "roms/psx/ff7.bin" },
            { name: "Crash Bandicoot", url: "roms/psx/crash.bin" }
        ]
    }
};

// Estado atual do emulador
let currentConsole = 'nes';
let currentGameUrl = '';
let emulatorLoaded = false;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeEmulator();
    setupEventListeners();
    loadConsole('nes'); // Console padrão
});

function initializeEmulator() {
    console.log('Inicializando emulador...');
    
    // Configurar EmulatorJS
    if (typeof EJS_player === 'undefined') {
        window.EJS_player = '#game';
        window.EJS_core = 'nes';
        window.EJS_gameUrl = '';
        window.EJS_biosUrl = '';
        window.EJS_lightgun = false;
        window.EJS_mouse = false;
        window.EJS_multitap = false;
        window.EJS_softPatching = true;
        window.EJS_cheats = true;
        window.EJS_netplay = true;
        window.EJS_fullscreenOnDoubleClick = true;
    }
}

function setupEventListeners() {
    // Links dos consoles
    document.querySelectorAll('.console-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const console = this.getAttribute('data-console');
            loadConsole(console);
            
            // Atualizar visual do menu
            document.querySelectorAll('.console-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Upload de ROM
    const romUpload = document.getElementById('romUpload');
    if (romUpload) {
        romUpload.addEventListener('change', handleRomUpload);
    }

    // Controles do emulador
    setupEmulatorControls();
}

function loadConsole(consoleName) {
    if (!consoleConfig[consoleName]) {
        console.error('Console não suportado:', consoleName);
        return;
    }

    currentConsole = consoleName;
    const config = consoleConfig[consoleName];

    // Atualizar título
    document.getElementById('console-title').textContent = config.title;

    // Atualizar extensões
    const extensionsList = document.getElementById('file-extensions');
    if (extensionsList) {
        extensionsList.innerHTML = '';
        config.extensions.forEach(ext => {
            const li = document.createElement('li');
            li.textContent = ext;
            extensionsList.appendChild(li);
        });
    }

    // Atualizar informações de BIOS
    const biosInfo = document.getElementById('bios-info');
    if (biosInfo) {
        biosInfo.textContent = config.bios;
    }

    // Atualizar código de exemplo
    updateCodeExample(consoleName);

    // Configurar EmulatorJS
    window.EJS_core = consoleName;
    
    console.log(`Console ${config.title} carregado`);
}

function updateCodeExample(consoleName) {
    const codeExample = document.querySelector('.prettyprint');
    if (codeExample) {
        const exampleCode = `<div style="width:640px;height:480px;max-width:100%">
  <div id="game"></div>
</div>
<script type="text/javascript">
    EJS_player = '#game';
    EJS_biosUrl = ''; // URL para BIOS se necessário
    EJS_gameUrl = 'path/to/your/game.rom'; // URL para ROM do jogo
    EJS_core = '${consoleName}'; // Core do emulador
    EJS_lightgun = false; // Suporte a lightgun
</script>
<script src="https://www.emulatorjs.com/loader.js"></script>`;

        // Aplicar syntax highlighting básico
        codeExample.innerHTML = exampleCode
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/(".*?")/g, '<span class="str">$1</span>')
            .replace(/(&lt;\/?[^&]*&gt;)/g, '<span class="tag">$1</span>')
            .replace(/(\/\/.*)/g, '<span class="com">$1</span>');
    }
}

function handleRomUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const fileName = file.name;
    const fileExtension = '.' + fileName.split('.').pop().toLowerCase();

    // Verificar se a extensão é suportada pelo console atual
    const config = consoleConfig[currentConsole];
    if (!config.extensions.includes(fileExtension)) {
        alert(`Arquivo não suportado para ${config.title}. Extensões suportadas: ${config.extensions.join(', ')}`);
        return;
    }

    // Criar URL temporária para o arquivo
    const fileUrl = URL.createObjectURL(file);
    
    // Carregar o jogo
    loadGame(fileUrl, fileName);
}

function loadGame(gameUrl, gameName) {
    console.log('Carregando jogo:', gameName);
    
    currentGameUrl = gameUrl;
    
    // Configurar EmulatorJS
    window.EJS_gameUrl = gameUrl;
    
    try {
        // Recarregar o emulador com o novo jogo
        const iframe = document.getElementById('ejs-content-frame');
        if (iframe) {
            iframe.src = 'https://www.emulatorjs.com/embed/content.html';
        }
        
        // Recarregar o loader do EmulatorJS
        const script = document.createElement('script');
        script.src = 'https://www.emulatorjs.com/loader.js';
        script.crossOrigin = 'anonymous';
        document.body.appendChild(script);
        
        console.log('Jogo carregado:', gameName);
        
    } catch (error) {
        console.error('Erro ao carregar jogo:', error);
        alert('Erro ao carregar o jogo. Verifique se o arquivo está correto.');
    }
}

function setupEmulatorControls() {
    // Botão Play/Pause
    const playBtn = document.getElementById('playBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    
    if (playBtn) {
        playBtn.addEventListener('click', function() {
            // Implementar play/pause via EmulatorJS API
            try {
                if (window.EJS_emulator) {
                    window.EJS_emulator.play();
                }
            } catch (error) {
                console.log('Função play não disponível');
            }
        });
    }
    
    if (pauseBtn) {
        pauseBtn.addEventListener('click', function() {
            try {
                if (window.EJS_emulator) {
                    window.EJS_emulator.pause();
                }
            } catch (error) {
                console.log('Função pause não disponível');
            }
        });
    }

    // Botão Reset
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            try {
                if (window.EJS_emulator) {
                    window.EJS_emulator.restart();
                }
            } catch (error) {
                console.log('Função restart não disponível');
                // Alternativa: recarregar iframe
                const iframe = document.getElementById('ejs-content-frame');
                if (iframe) {
                    iframe.src = iframe.src;
                }
            }
        });
    }

    // Botão Fullscreen
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', function() {
            const gameContainer = document.getElementById('game');
            if (gameContainer) {
                if (gameContainer.requestFullscreen) {
                    gameContainer.requestFullscreen();
                } else if (gameContainer.webkitRequestFullscreen) {
                    gameContainer.webkitRequestFullscreen();
                } else if (gameContainer.msRequestFullscreen) {
                    gameContainer.msRequestFullscreen();
                }
            }
        });
    }

    // Botão Save State
    const saveStateBtn = document.getElementById('saveStateBtn');
    if (saveStateBtn) {
        saveStateBtn.addEventListener('click', function() {
            try {
                if (window.EJS_emulator) {
                    window.EJS_emulator.saveState();
                    alert('Estado salvo com sucesso!');
                }
            } catch (error) {
                console.log('Função saveState não disponível');
            }
        });
    }

    // Botão Load State
    const loadStateBtn = document.getElementById('loadStateBtn');
    if (loadStateBtn) {
        loadStateBtn.addEventListener('click', function() {
            try {
                if (window.EJS_emulator) {
                    window.EJS_emulator.loadState();
                    alert('Estado carregado com sucesso!');
                }
            } catch (error) {
                console.log('Função loadState não disponível');
            }
        });
    }
}

// Funções utilitárias
function showMessage(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 1000;
        font-weight: bold;
        box-shadow: 0 3px 10px rgba(0,0,0,0.3);
    `;

    document.body.appendChild(notification);

    // Remover após 3 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Eventos do EmulatorJS (quando disponível)
window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'emulator') {
        switch (event.data.action) {
            case 'loaded':
                console.log('Emulador carregado com sucesso');
                emulatorLoaded = true;
                break;
            case 'error':
                console.error('Erro no emulador:', event.data.error);
                showMessage('Erro ao carregar o emulador', 'error');
                break;
            case 'gameLoaded':
                console.log('Jogo carregado com sucesso');
                showMessage('Jogo carregado com sucesso!');
                break;
        }
    }
});

console.log('EmulatorJS Manager inicializado');

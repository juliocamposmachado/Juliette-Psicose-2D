# Emulador de Jogos Retro

Este projeto é um emulador de jogos retro baseado em EmulatorJS que suporta múltiplos consoles e sistemas.

## 🎮 Consoles Suportados

### **Consoles Nintendo**
- **NES** | Famicom Disk System (.fds, .nes, .unif, .unf)
- **SNES** (.smc, .sfc, .fig, .swc)
- **Game Boy | Color** (.gb, .gbc, .sgb)
- **Game Boy Advance** (.gba)
- **Virtual Boy** (.vb)
- **Nintendo 64** (.n64, .v64, .z64)
- **Nintendo DS** (.nds)

### **Consoles Sega**
- **Master System** (.sms)
- **Game Gear** (.gg)
- **Mega Drive** (.md, .bin, .gen, .smd)
- **32X** (.32x)
- **Saturn** (.iso, .chd)
- **CD** (.iso, .chd)

### **Consoles Atari**
- **2600** (.a26)
- **5200** (.a52)
- **7800** (.a78)
- **Lynx** (.lnx)
- **Jaguar** (.j64)
- **8bit** (.xex, .atr)

### **Outros Consoles**
- **PlayStation** (.bin, .cue, .img, .mdf, .pbp)
- **TurboGrafx-16** | PC Engine (.pce)
- **Neo Geo Pocket** (.ngp, .ngc)
- **WonderSwan** | Color (.ws, .wsc)
- **3DO** (.iso, .chd)
- **Arcade** (.zip)

### **Computadores**
- **MS-DOS** (.exe, .com)
- **Amiga** (.adf, .adz)
- **Atari ST** (.st)
- **MSX** (.rom, .mx1, .mx2)
- **Apple Computer** (.dsk)
- **Sinclair ZX Spectrum** (.z80, .sna)

## 🚀 Como Usar

### 1. **Abrir o Emulador**
```bash
# Abra o arquivo emulador.html em seu navegador
emulador.html
```

### 2. **Selecionar Console**
- Clique em um console no menu lateral esquerdo
- As informações do console serão atualizadas automaticamente

### 3. **Carregar ROM**
- **Opção 1:** Use o campo "Upload ROM" no menu lateral
- **Opção 2:** Arraste e solte o arquivo ROM na área do emulador

### 4. **Controles Disponíveis**
- **▶ Play**: Inicia/Resume o jogo
- **⏸ Pause**: Pausa o jogo
- **🔄 Reset**: Reinicia o jogo
- **⛶ Fullscreen**: Modo tela cheia
- **💾 Save State**: Salva o estado atual
- **📁 Load State**: Carrega estado salvo

## 💻 Código de Exemplo

```html
<div style="width:640px;height:480px;max-width:100%">
  <div id="game"></div>
</div>
<script type="text/javascript">
    EJS_player = '#game';
    EJS_biosUrl = ''; // URL para BIOS se necessário
    EJS_gameUrl = 'path/to/your/game.rom'; // URL para ROM do jogo
    EJS_core = 'nes'; // Core do emulador
    EJS_lightgun = false; // Suporte a lightgun
</script>
<script src="https://www.emulatorjs.com/loader.js"></script>
```

## 📋 Requisitos de BIOS

Alguns consoles requerem arquivos BIOS para funcionar:

### **Obrigatórios:**
- **NES/Famicom**: `disksys.rom` (MD5: ca30b50f880eb660a320674ed365ef7a)
- **Game Boy Advance**: `gba_bios.bin` (MD5: a860e8c0b6d573d191e4ec7db1b1e4f6)
- **PlayStation**: `scph1001.bin` (MD5: 924e392ed05558ffdb115408c263dccf)

### **Opcionais:**
- **Game Boy**: `gb_bios.bin`
- **Game Boy Color**: `gbc_bios.bin`

## 🛠️ Arquivos do Projeto

```
📁 Projeto/
├── 📄 emulador.html       # Página principal
├── 🎨 emulator-styles.css # Estilos CSS
├── 📜 emulator.js         # Lógica JavaScript
└── 📖 README_EMULADOR.md  # Este arquivo
```

## 🎯 Funcionalidades

### ✅ **Implementadas**
- ✅ Interface responsiva
- ✅ Suporte a múltiplos consoles
- ✅ Upload de ROM por drag & drop
- ✅ Controles de emulação básicos
- ✅ Detecção automática de formato
- ✅ Syntax highlighting no código
- ✅ Design moderno e intuitivo

### 🔄 **Em Desenvolvimento**
- 🔄 Lista de jogos pré-configurados
- 🔄 Sistema de favoritos
- 🔄 Controles customizáveis
- 🔄 Multiplayer online
- 🔄 Achievements/conquistas

## 🎨 Personalização

### **Cores e Temas**
Edite o arquivo `emulator-styles.css` para personalizar:

```css
:root {
    --primary-color: #3498db;
    --secondary-color: #2c3e50;
    --accent-color: #e74c3c;
    --background: linear-gradient(135deg, #1e3c72, #2a5298);
}
```

### **Adicionar Novos Consoles**
No arquivo `emulator.js`, adicione uma nova entrada em `consoleConfig`:

```javascript
novoConsole: {
    title: "Novo Console",
    extensions: [".ext1", ".ext2"],
    bios: "bios_file.bin (MD5: hash)",
    cores: ["core_name"],
    sampleGames: [
        { name: "Jogo 1", url: "roms/console/game1.rom" }
    ]
}
```

## 🔧 Problemas Comuns

### **Jogo não carrega**
1. Verifique se a extensão é suportada
2. Confirme se o arquivo BIOS está presente (se necessário)
3. Teste com outro arquivo ROM

### **Performance baixa**
1. Feche outras abas do navegador
2. Use navegadores baseados em Chromium (Chrome, Edge)
3. Verifique a especificação do hardware

### **Controles não funcionam**
1. Clique na área do jogo primeiro
2. Verifique se o emulador está carregado
3. Teste diferentes combinações de teclas

## 🌐 Compatibilidade

### **Navegadores Suportados**
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Edge 80+
- ✅ Safari 13+
- ⚠️ Internet Explorer (não suportado)

### **Sistemas Operacionais**
- ✅ Windows 10/11
- ✅ macOS 10.15+
- ✅ Linux (Ubuntu 18+)
- ✅ Android 8+
- ✅ iOS 13+

## 📞 Suporte

Para problemas ou sugestões:
1. Verifique o console do navegador (F12)
2. Confirme se todos os arquivos estão no local correto
3. Teste com ROMs conhecidas como funcionais

## ⚖️ Aviso Legal

Este emulador é apenas uma interface para EmulatorJS. Os usuários são responsáveis por possuir legalmente os jogos que executam. ROMs de jogos devem ser obtidas de cópias próprias dos cartuchos/discos originais.

## 🎮 Divirta-se!

Aproveite sua coleção de jogos retro com este emulador moderno e funcional!

# Juliette Psicose 2D

🎮 **Um jogo 2D side-scrolling avançado inspirado em Contra**, desenvolvido em JavaScript com HTML5 Canvas, apresentando a personagem Juliette com sistema de combate complexo e múltiplas fases.

## 🌟 Características Principais

- **🎯 Sistema de Fases**: Progressão automática com resistência variável
- **🎭 Animação Avançada**: Sistema dual spritesheet + sprites individuais
- **📱 Responsividade Total**: Detecção avançada mobile/tablet/desktop
- **🎮 Controles Universais**: Teclado + touch screen + mouse
- **💥 Sistema de Combate**: Armas progressivas, escudo e ataques especiais
- **🏰 Plataformas Dinâmicas**: Sistema de física com pulo e gravidade
- **🎨 Visual Cyberpunk**: Efeitos de partículas e glow piscante
- **🔊 Sistema de Áudio**: Sons procedurais com Web Audio API
- **🌋 Efeitos Especiais**: Disco de lava, correntes e bombas
- **📋 Interface Móvel**: Guia interativo e controles touch

## 🎮 Controles Completos

### ⚡ Controles Básicos (Teclado)
- **⬅️➡️ Setas**: Movimento horizontal
- **Z**: Pular
- **X/SPACE**: Atirar
- **⬆️+X**: Tiro para cima
- **⬇️+X**: Tiro para baixo
- **↗️+X, ↙️+X**: Tiros diagonais

### 📱 Controles Touch (Mobile)
#### 📲 **Modo Tradicional (Portrait)**
- **🕹️ D-Pad Virtual**: Movimento em 4 direções
- **🎯 Botão Atirar**: Disparo principal
- **⬆️ Botão Pular**: Pulo e navegação vertical
- **⛓️ Corrente Esquerda**: Ataque especial 1 mão
- **⛓️⛓️ Corrente Dupla**: Ataque especial 2 mãos
- **💣 Bomba**: Eliminação total de inimigos
- **🛡️ Escudo**: Proteção energética
- **🌋 Lava**: Disco de lava flutuante
- **⏸️ Pause**: Pausa do jogo
- **🔊 Som**: Toggle de áudio

#### 🎮 **Modo Arrastável Individual (Landscape)** - ✨ NOVO!
- **🎯 Drag & Drop**: Reposicione livremente cada controle na tela
- **💾 Posições Salvas**: Suas configurações persistem entre sessões
- **📳 Feedback Háptico**: Vibração ao tocar e mover controles
- **🎨 Estados Dinâmicos**: Botões mudam cor baseado no estado do jogo
- **🕹️ D-Pad Inteligente**: Zona morta e detecção direcional precisa
- **🎛️ 10 Controles Individuais**: Cada botão pode ser posicionado independentemente
- **🔄 Auto-Adaptação**: Ativa automaticamente em modo paisagem
- **⚡ Tap vs Drag**: Toque rápido = ação, arrastar = reposicionar

### 🔥 Ataques Especiais
- **A**: Corrente (1 mão) - Dano em área
- **S**: Corrente (2 mãos) - Dano maior em área
- **D**: Escudo energético
- **B**: Bomba - Destrói todos os inimigos
- **C**: Celebração
- **L**: Disco de lava flutuante

### ⚙️ Sistema
- **P**: Pausar jogo
- **M**: Ligar/Desligar sons
- **H**: Mostrar/Ocultar painel de controles
- **F11**: Tela cheia
- **R**: Reiniciar (quando Game Over)

### 🛠️ Armas (1-7)
- **1**: Normal - **2**: Spread - **3**: Laser - **4**: Machine
- **5**: Plasma - **6**: Storm - **7**: Nuclear

## 🏗️ Estrutura do Projeto

```
Juliette_Psicose_2D/
├── index.html          # Página principal do jogo
├── game.js             # Lógica principal do jogo
├── style.css           # Estilos e visual
├── README.md           # Este arquivo
└── assets/
    ├── juliette_anim_spritesheet.png  # Animações do personagem
    ├── fundo 2d.png                   # Fundo secundário
    ├── cena01.jpg                     # Cenário principal
    └── sprites 2.png                  # Sprites adicionais
```

## 🎯 Sistema de Fases e Progressão

### 🚀 **Fase 1** - Iniciante (0-5 minutos)
- **💪 Resistência**: 10 tiros para eliminar Juliette
- **🛡️ Escudo Inicial**: 60 segundos de proteção total
- **🎯 Objetivo**: Sobreviver e se adaptar aos controles

### ⚔️ **Fase 2** - Guerreira (5+ minutos)
- **💪 Resistência Ultra**: 1000 tiros para eliminar
- **🌋 Acesso Completo**: Todos os poderes liberados
- **🎯 Objetivo**: Dominar o campo de batalha

## 🔧 Funcionalidades Técnicas Avançadas

### 🎭 Sistema de Animação Híbrido
- **Spritesheet**: Animações tradicionais (com arma)
- **Sprites Individuais**: Ações especiais (correntes, celebração)
- **Pose Principal**: "01 maos para cima" como animação padrão
- **Triggers Inteligentes**: Animações baseadas em ângulo de tiro
- **Estados Dinâmicos**: Transições fluidas entre animações

### 🌍 Sistema de Cenário Dinâmico
- **Scroll Infinito**: Background que se adapta ao movimento
- **Múltiplas Fases**: Fundos específicos para cada fase
- **Parallax Avançado**: Múltiplas camadas com profundidade
- **Plataformas Cyberpunk**: Efeitos neon piscantes
- **Partículas de Energia**: Sistema procedural de efeitos

### ⚔️ Sistema de Combate Progressivo
- **7 Tipos de Arma**: Normal → Spread → Laser → Machine → Plasma → Storm → Nuclear
- **Tiro Multi-Direcional**: 8 direções + variações aleatórias
- **Balas Personalizadas**: Todas amarelas com borda vermelha
- **Propriedades Especiais**: Perfuração, explosão, rastros

### 🛡️ Sistema de Defesa Multicamada
- **Escudo Inicial**: 60s de proteção absoluta (dourado)
- **Escudo Energético**: Ativação manual com energia limitada
- **💣 Sistema de Bombas**: Eliminação de todos inimigos/projéteis
- **Regeneração**: Sistema de recuperação automática

### 👾 IA Inimiga Avançada
- **Átomos Orbitantes**: Sistema visual de partículas orbitais
- **Comportamento Variado**: Soldiers vs Robots
- **Limite Dinâmico**: Máximo de 10 inimigos simultâneos
- **Drop System**: Power-ups aleatórios ao derrotar

### 🎮 Interface e UX
- **HUD Compacto**: Informações organizadas em 4 linhas
- **Painel Retrátil**: Controles mostráveis com H
- **Resolução Adaptativa**: 98% da tela disponível
- **Cronômetros**: Fase, escudo e tempo de jogo
- **Barras Visuais**: Energia e escudo com cores dinâmicas

### 📱 Sistema de Responsividade Ultra-Avançada
- **Detecção Inteligente**: User Agent + Dimensões + Pixel Ratio + Touch
- **Breakpoints Dinâmicos**: Mobile (768px), Tablet (1024px), Desktop (1440px+)
- **Canvas Adaptativo**: Redimensiona automaticamente para qualquer tela
- **Orientação Automática**: Portrait/Landscape com reposicionamento
- **Aspect Ratio Flexível**: Adapta-se perfeitamente a qualquer dispositivo
- **🆕 Tela Cheia Mobile**: 100% viewport sem barras pretas em mobile/tablet
- **🆕 Safe-Area Support**: Compatibilidade com notch de iPhone e bordas
- **🆕 Dynamic Viewport**: Altura dinâmica (100dvh) para navegadores mobile
- **🆕 PWA Aprimorado**: Orientação flexível e instalação otimizada
- **🆕 Detecção Condicional**: Interface adapta elementos por tipo de dispositivo

### 📲 Interface Móvel Ultra-Completa
- **Controles Touch**: D-Pad virtual + botões de ação responsivos
- **Feedback Háptico**: Vibração em dispositivos suportados
- **Guia Interativo**: Painel deslizante com gestos touch
- **Estados Visuais**: Botões com animações press/release
- **Prevenção de Zoom**: Bloqueia gestos indesejados do navegador
- **Toggle de Visibilidade**: Controles ocultáveis para mais tela
- **🆕 Fullscreen Nativo**: Usa 100% da tela disponível sem bordas
- **🆕 Elementos Condicionais**: Interface desktop oculta automaticamente
- **🆕 Object-Fit Cover**: Preenchimento total da tela sem distorções
- **🆕 Notch Compatibility**: Suporte para iPhone X+ e dispositivos similares
- **🆕 PWA Standalone**: Experiência de app nativo quando instalado

### 🎯 Recursos do Guia Móvel
- **📋 Expansão por Toque**: Clique/toque no cabeçalho para abrir
- **👆 Gestos de Deslize**: Arrastar para cima/baixo para controlar
- **📊 Indicadores Dinâmicos**: Status em tempo real de arma/escudo/bombas
- **❌ Fechamento Completo**: Botão para ocultar guia completamente
- **🔄 Auto-Reposicionamento**: Adapta-se a mudanças de orientação
- **🎨 Visual Responsivo**: Cores e ícones que refletem estado do jogo

### 🎮 Sistema de Controles Arrastáveis - ⭐ DESTAQUE
- **🎯 Drag & Drop Inteligente**: Cada controle pode ser reposicionado livremente na tela
- **💾 Persistência Local**: Posições são salvas no localStorage e restauradas automaticamente
- **📳 Feedback Háptico Avançado**: Vibração precisa ao tocar, arrastar e soltar controles
- **🔄 Detecção de Orientação**: Auto-ativa em landscape, desativa em portrait
- **⚡ Diferenciação Tap vs Drag**: Toque rápido executa ação, arrastar reposiciona
- **🎨 Estados Visuais Dinâmicos**: Cores e opacidade mudam baseado no estado do jogo
- **🛡️ Limitação de Bordas**: Controles não podem ser arrastados para fora da tela
- **🕹️ D-Pad Especializado**: Zona morta e detecção direcional com precisão angular
- **🎛️ 10 Controles Independentes**: Cada botão é um elemento DOM individual arrastável
- **🔧 Reset de Posições**: Função para restaurar posições padrão ergonômicas

## 🚀 Como Executar

1. Abra o arquivo `index.html` em um navegador moderno
2. O jogo carregará automaticamente quando todos os assets estiverem prontos
3. Use as setas e espaço para jogar

## 🎨 Assets e Processamento

### Assets Necessários
Certifique-se de que todos os arquivos de imagem estão na pasta `assets/`:
- `sprites 2.png` (imagem original do personagem)
- `juliette_transparent_spritesheet.png` (spritesheet processado - 192x128px)
- `fundo 2d.png` (800x600px)
- `cena01.jpg` (800x600px)

### Processamento de Sprites
O projeto inclui um script Python (`process_sprites.py`) que:
- ✅ **Usa imagem já sem fundo** (transparência já removida pelo usuário)
- ✅ **Redimensiona para game** mantendo qualidade pixel art
- ✅ **Gera animações** com 4 frames de caminhada e 4 de ataque
- ✅ **Layout otimizado** 4x2 (192x128px total)
- ✅ **Variações sutis** para simular movimento

Para reprocessar os sprites:
```bash
python process_sprites.py
```

## ⚡ Performance e Otimizações

- **📏 Frame Rate**: 60 FPS estável
- **📱 Resolução Adaptativa**: 98% da tela (mínimo 800x600)
- **🎨 Renderização**: Canvas 2D com otimizações avançadas
- **🏽 Scroll Suave**: 2.5px por frame com parallax
- **👾 Limite de Inimigos**: Máximo 10 simultâneos
- **♾️ Garbage Collection**: Limpeza automática de objetos
- **🔊 Áudio Otimizado**: Web Audio API + fallbacks

## ✅ Recursos Completamente Implementados

- ✅ **Sistema de Física**: Gravidade, pulos, plataformas
- ✅ **Múltiplas Fases**: Fase 1 e 2 com transição automática
- ✅ **Sistema de Pontuação**: Score dinâmico com níveis
- ✅ **Efeitos Sonoros**: Sistema completo procedural
- ✅ **Inimigos e Colisões**: IA avançada com átomos orbitantes
- ✅ **Power-ups**: 7 tipos com drop aleatório
- ✅ **HUD Completo**: Interface responsiva e informativa
- ✅ **Sistema de Escudo**: Duplo (inicial + energético)
- ✅ **Ataques Especiais**: Correntes, bombas, disco de lava
- ✅ **Visual Cyberpunk**: Partículas, glow e efeitos

## 🔮 Recursos Especiais Únicos

### 🌋 **Disco de Lava Flutuante**
- 🔥 Simulação térmica com 6 estágios de calor
- 🌊 Flutuação suave seguindo a jogadora
- ⚡ Linhas de energia rotativas
- 🌈 Transição dinâmica de cores
- 💫 Partículas procedurais de lava

### ⛓️ **Sistema de Correntes**
- 🤜 Corrente em 1 mão: Dano 25, alcance 70px
- 👍 Corrente em 2 mãos: Dano 40, alcance 100px
- ✨ Efeitos visuais com partículas prateadas
- 🎯 Dano em área com detecção de distância

### 💣 **Sistema de Bombas**
- 🎯 Eliminação instantânea de todos inimigos
- 🎆 5 ondas explosivas sucessivas
- 💫 Partículas em círculo com delays
- 🏆 Sistema de cooldown e limitação (5 máximo)

## 🕰️ Versionamento e Updates

### ✨ **Última Atualização**: Tela Cheia Mobile sem Barras Pretas + PWA Aprimorado
- 📱 **Fullscreen Mobile Total**: Uso de 100% da viewport disponível em mobile/tablet
- 🎯 **Detecção Inteligente Dispositivos**: Diferenciação automática mobile vs desktop
- 🖥️ **Elementos Desktop Condicionais**: Interface adapta-se automaticamente ao dispositivo
- 📏 **Object-Fit Adaptativo**: Cover em mobile, contain em desktop
- 🌐 **PWA Otimizado**: Orientação flexível e meta tags aprimoradas
- 🔧 **Safe-Area Support**: Compatibilidade com notch e bordas arredondadas
- 📱 **Dynamic Viewport**: Altura dinâmica (100dvh) para mobile moderno
- ⚡ **Performance Mobile**: Otimizações específicas para dispositivos móveis
- 🎨 **Interface Responsiva**: Canvas sem distorções em qualquer resolução
- 🔄 **Auto-Adaptação**: Transições suaves entre orientações

### 🔥 **Atualização Anterior**: Sistema de Controles Arrastáveis Individuais
- 🎯 **Drag & Drop Avançado**: Cada controle pode ser reposicionado livremente na tela
- 💾 **Persistência Inteligente**: Posições salvas no localStorage entre sessões
- 📳 **Feedback Háptico Premium**: Vibração precisa em cada interação
- 🔄 **Auto-Adaptação por Orientação**: Landscape = individual, Portrait = agrupado
- ⚡ **Detecção Tap vs Drag**: Toque rápido = ação, arrastar = reposicionar
- 🎨 **Estados Visuais Avançados**: Cores e opacidade dinâmicas por estado
- 🕹️ **D-Pad Especializado**: Zona morta e detecção angular precisa
- 🛡️ **Sistema de Limites**: Controles não podem sair da tela
- 🎛️ **10 Controles Independentes**: Cada elemento DOM arrastável individual
- 🔧 **Reset Ergonômico**: Restauração de posições padrão otimizadas

### 📅 **Atualizações Anteriores**
#### 🎭 **Animação Principal**
- 🎭 Personagem usa "01 maos para cima" como pose padrão
- 🎯 Animações idle/walk sem arma atualizadas
- ⚙️ Sistema híbrido spritesheet + sprites individuais
- 🎨 Transições fluidas mantidas

---

Desenvolvido com HTML5 Canvas e JavaScript puro.

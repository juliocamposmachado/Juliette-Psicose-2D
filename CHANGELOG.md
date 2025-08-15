# Changelog - Juliette Psicose 2D

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

## [2.2.0] - 2025-01-13

### 🆕 Adicionado
- **📱 Tela Cheia Mobile**: Sistema fullscreen para mobile/tablet usando 100% da viewport
- **🎯 Detecção Inteligente de Dispositivos**: Diferenciação automática mobile vs desktop
- **🖥️ Interface Condicional**: Elementos desktop ocultados automaticamente em mobile
- **📏 Object-Fit Adaptativo**: Cover em mobile, contain em desktop
- **🌐 PWA Otimizado**: Orientação flexível (any) em vez de landscape-primary
- **🔧 Safe-Area Support**: Compatibilidade com notch de iPhone e bordas arredondadas
- **📱 Dynamic Viewport**: Altura dinâmica (100dvh) para navegadores mobile modernos
- **⚡ Performance Mobile**: Otimizações específicas para dispositivos móveis
- **🎨 Interface Responsiva**: Canvas sem distorções em qualquer resolução
- **🔄 Auto-Adaptação**: Transições suaves entre orientações

### 🔄 Modificado
- `manifest.json`: Orientação alterada de "landscape-primary" para "any"
- `index.html`: Meta tags PWA aprimoradas com viewport-fit=cover
- `style.css`: CSS mobile fullscreen sem barras pretas
- `game.js`: Lógica de responsividade completamente reescrita
- `README.md`: Documentação atualizada com novas funcionalidades

### 🐛 Corrigido
- Barras pretas em dispositivos mobile/tablet
- Distorções de canvas em diferentes resoluções
- Interface desktop aparecendo em mobile
- Problemas de viewport em dispositivos com notch

## [2.1.0] - 2025-01-12

### 🆕 Adicionado
- **🎮 Sistema de Controles Arrastáveis**: Cada controle pode ser reposicionado individualmente
- **💾 Persistência Local**: Posições salvas no localStorage
- **📳 Feedback Háptico Avançado**: Vibração precisa em interações
- **🔄 Auto-Adaptação por Orientação**: Landscape/Portrait automático
- **⚡ Detecção Tap vs Drag**: Toque rápido vs arrastar
- **🎨 Estados Visuais Dinâmicos**: Cores e opacidade por estado
- **🕹️ D-Pad Especializado**: Zona morta e detecção angular
- **🛡️ Sistema de Limites**: Controles não saem da tela
- **🎛️ 10 Controles Independentes**: Elementos DOM individuais
- **🔧 Reset Ergonômico**: Restauração de posições padrão

## [2.0.0] - 2025-01-10

### 🆕 Adicionado
- **🎭 Sistema de Animação Híbrido**: Spritesheet + sprites individuais
- **📱 Responsividade Avançada**: Detecção mobile/tablet/desktop
- **🎮 Controles Touch Completos**: D-Pad virtual + botões especiais
- **🔊 Sistema de Áudio Procedural**: Geração dinâmica de sons
- **🌋 Efeitos Especiais**: Disco de lava, correntes, bombas
- **👾 IA Inimiga**: Sistema de átomos orbitantes
- **🛡️ Sistema de Escudo Duplo**: Inicial + energético
- **🎯 Sistema de Fases**: Progressão automática de dificuldade
- **🌍 Cenários Dinâmicos**: Scroll infinito com parallax
- **⚔️ 7 Tipos de Armas**: Sistema progressivo de poder

### 🔄 Modificado
- Estrutura completa do jogo reescrita
- Interface responsiva implementada
- Sistema de física aprimorado

## [1.0.0] - 2024-12-15

### 🆕 Adicionado
- **🎮 Jogo Base**: Personagem Juliette em mundo 2D
- **🏃‍♀️ Movimento**: Sistema básico de caminhada e pulo
- **🔫 Sistema de Tiro**: Múltiplas direções
- **👾 Inimigos**: IA básica de perseguição
- **🎨 Visual**: Canvas 2D com sprites animados
- **⭐ Pontuação**: Sistema básico de score
- **🏁 Game Over**: Reinício de partida

---

## Legenda de Ícones

- 🆕 **Adicionado**: Novas funcionalidades
- 🔄 **Modificado**: Mudanças em funcionalidades existentes
- 🐛 **Corrigido**: Correções de bugs
- 🗑️ **Removido**: Funcionalidades removidas
- ⚠️ **Depreciado**: Funcionalidades que serão removidas
- 🔒 **Segurança**: Correções de vulnerabilidades

## Formato

Este changelog segue o formato [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

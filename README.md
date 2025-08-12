# Juliette Psicose 2D

Um jogo 2D side-scrolling desenvolvido em JavaScript com HTML5 Canvas.

## 📋 Características

- **Resolução**: 800x600 pixels
- **Animação de personagem**: Sistema de spritesheet com animações de caminhada e ataque
- **Cenário animado**: Background com scroll infinito e efeito parallax
- **Controles responsivos**: Movimento suave e animações fluidas
- **Visual retrô**: Estilo pixel art com rendering pixelado

## 🎮 Controles

- **Seta Direita**: Move para a direita
- **Seta Esquerda**: Move para a esquerda  
- **Barra de Espaço**: Ataque

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

## 🔧 Funcionalidades Técnicas

### Sistema de Animação
- **Spritesheet**: Sistema baseado em frames para animações
- **Estados**: Walk (caminhada) e Attack (ataque)
- **Timing**: Controle de velocidade de animação configurável

### Sistema de Cenário
- **Scroll infinito**: Background que se repete continuamente
- **Parallax**: Efeito de profundidade com múltiplas camadas
- **Performance**: Otimizado para 60fps

### Sistema de Controles
- **Responsivo**: Detecção de keydown/keyup
- **Estado**: Controle de estado do personagem
- **Direção**: Sprite flip para movimento bidirecional

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

## ⚡ Performance

- **Frame rate**: 60 FPS
- **Resolução fixa**: 800x600
- **Renderização**: Canvas 2D otimizado
- **Scroll suave**: 2.5px por frame

## 🔄 Próximas Melhorias

- [ ] Sistema de física
- [ ] Múltiplas fases
- [ ] Sistema de pontuação
- [ ] Efeitos sonoros
- [ ] Inimigos e colisões
- [ ] Power-ups

---

Desenvolvido com HTML5 Canvas e JavaScript puro.

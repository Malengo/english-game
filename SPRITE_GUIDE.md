# 🎮 Sprite Guide - English Game

## Como Usar Imagem PNG Customizada como Sprite

### Passo 1: Preparar a Imagem

1. **Criar ou obter uma imagem PNG** de um personagem
   - **Sprite Sheet 4x4 (Recomendado):** 128×128 pixels (4 direções × 4 frames de movimento)
   - **Sprite Simples:** 64×64 ou 128×128 pixels com fundo transparente
   - Formato: PNG com fundo transparente
   - O personagem deve estar centralizado em cada frame

2. **Fontes de imagens:**
   - Pixel art: https://itch.io (buscar "pixel character spritesheet 4x4")
   - Desenhos: Qualquer PNG com fundo transparente
   - Gerar: AI tools (Midjourney, Leonardo.ai)

### Passo 2: Adicionar a Imagem ao Projeto

1. Salve a imagem como `player.png`
2. Coloque em: `assets/images/player.png`

### Passo 3: Ativar o Sprite Customizado

No arquivo `src/screens/MapScreen.js`, altere:

```javascript
<Player
    x={position.x}
    y={position.y}
    direction={lastDirection}
    character="🧑‍🦱"
    isMoving={isMoving}
    useImage={true}  // ✅ MUDE PARA true
/>
```

### Passo 4: Teste

```bash
npm start
# Pressione 'w' para web
# Mova em qualquer direção - deve animar!
```

---

## 🎬 Sistema de Animação - Sprite Sheet 4x4

### Estrutura da Sprite Sheet

A sprite sheet é organizada em **4 linhas (direções) × 4 colunas (frames de movimento)**:

```
Sprite Sheet 128×128px (com frames de 32×32px):
┌────┬────┬────┬────┐
│ ↑1 │ ↑2 │ ↑3 │ ↑4 │ Linha 0: UP (para cima)
├────┼────┼────┼────┤
│ ←1 │ ←2 │ ←3 │ ←4 │ Linha 1: LEFT (para esquerda)
├────┼────┼────┼────┤
│ ↓1 │ ↓2 │ ↓3 │ ↓4 │ Linha 2: DOWN (para baixo)
├────┼────┼────┼────┤
│ →1 │ →2 │ →3 │ →4 │ Linha 3: RIGHT (para direita)
└────┴────┴────┴────┘
```

### Como Funciona

- **Direction**: Define qual LINHA mostrar (up=0, left=1, down=2, right=3)
- **Frame Index**: Define qual COLUNA mostrar (0, 1, 2, 3)
- **Animation Loop**: Cicla 0→1→2→3→0... a cada 100ms

### Suporte a Tamanho Customizado

Se sua sprite sheet tiver frames de tamanho diferente, edite `src/components/Player.js`:

```javascript
// Se cada frame for 64×64 em vez de 32×32:
const FRAME_SIZE = 64;

// A fórmula se adapta automaticamente!
```

---

## 📐 Direções Suportadas

```javascript
direction = "up"     // Linha 0 da sprite sheet
direction = "left"   // Linha 1 da sprite sheet
direction = "down"   // Linha 2 da sprite sheet (padrão)
direction = "right"  // Linha 3 da sprite sheet
```

---

## 🎨 Alternativas de Personagem

### Opção 1: Continuar com Emoji
```javascript
<Player character="🧙" isMoving={isMoving} />
// Opções: 🧑‍🦱, 🧔, 👨, 👩, 🧙, 🗡️
```

### Opção 2: Usar Sprite Sheet Customizado
```javascript
<Player useImage={true} isMoving={isMoving} />
// Certifique que assets/images/player.png é uma sprite sheet 4x4
```

---

## 🔧 Ajustar Velocidade de Animação

No arquivo `src/screens/MapScreen.js`:

```javascript
// Altere este valor (em ms) para mudar a duração DO MOVIMENTO:
setTimeout(() => setIsMoving(false), 200);  // 200ms = duração atual
```

No arquivo `src/components/Player.js`:

```javascript
// Altere este valor (em ms) para mudar a velocidade DOS FRAMES:
const animationInterval = setInterval(() => {
    setFrameIndex((prev) => (prev + 1) % 4);
}, 100);  // 100ms = intervalo entre frames
```

---

## ⚙️ Técnico: Como a Animação Funciona

```javascript
// Mapeamento de direções:
const directionRowMap = {
    up: 0,       // Índice da linha para movimento UP
    left: 1,     // Índice da linha para movimento LEFT
    down: 2,     // Índice da linha para movimento DOWN
    right: 3,    // Índice da linha para movimento RIGHT
};

// Cálculo dos offsets (marginLeft e marginTop):
const offsetX = -frameIndex * FRAME_SIZE;      // Move horizontalmente
const offsetY = -rowIndex * FRAME_SIZE;        // Move verticalmente

// Exemplo: Se frameIndex=2 e rowIndex=1 (LEFT, frame 3):
// offsetX = -2 * 32 = -64px (mostra coluna 2)
// offsetY = -1 * 32 = -32px (mostra linha 1)
```

**O container tem `overflow: hidden`**, então apenas 1 frame (32×32) é visível por vez.

---

## 📦 Formato de Sprite Sheet Recomendado

- **Tamanho:** 128×128 pixels
- **Frames por linha:** 4 (32×32 cada)
- **Linhas:** 4 (uma por direção)
- **Formato:** PNG com fundo transparente
- **Ordem de direções:** UP, LEFT, DOWN, RIGHT (de cima para baixo)

---

## 🚀 Próximos Passos

1. **Adicionar mais personagens:** Crie um seletor de personagem para mudar o player.png
2. **Customizar tamanho de frame:** Altere `FRAME_SIZE` se sua sprite sheet for diferente
3. **Efeitos:** Adicionar partículas ou luz durante movimento
4. **Som:** Adicionar efeitos de som ao se mover (requer `expo-av`)
5. **Sprite Sheet 8x4:** Expandir para 8 frames por direção para animação mais suave



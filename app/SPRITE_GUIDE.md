# Sprite Guide - English Game

## Como Usar Imagem PNG Customizada como Sprite

### Passo 1: Preparar a Imagem

1. Crie ou obtenha uma imagem PNG de um personagem.
   - Sprite sheet recomendado: 144x256 pixels, em grade 3x4.
   - Cada frame atual: 48x64 pixels.
   - Formato: PNG com fundo transparente.
   - O personagem deve estar centralizado em cada frame.

2. Fontes de imagens:
   - Pixel art: https://itch.io
   - Desenhos proprios ou PNGs com fundo transparente
   - Ferramentas de geracao de imagem

### Passo 2: Adicionar a Imagem ao Projeto

1. Salve a imagem como `player.png`.
2. Coloque em `assets/images/player.png`.

### Passo 3: Ativar o Sprite Customizado

No arquivo `src/screens/MapScreen.js`, use:

```javascript
<Player
    x={position.x}
    y={position.y}
    direction={lastDirection}
    character="🧑‍🦱"
    isMoving={isMoving}
    useImage={true}
/>
```

### Passo 4: Teste

```bash
npm start
# Pressione "w" para web
# Mova em qualquer direcao para ver a animacao.
```

## Sistema de Animacao

O `Player.js` atual trata a sprite sheet como uma grade 3x4:

- 3 colunas de frames.
- 4 linhas de direcoes.
- Ordem das linhas: `up`, `right`, `down`, `left`.
- Frame parado: coluna 1.
- Sequencia andando: `0, 1, 2, 1`.

```text
Sprite sheet 144x256

Linha 0: up
Linha 1: right
Linha 2: down
Linha 3: left

Colunas: frame 0, frame 1, frame 2
```

## Direcoes Suportadas

```javascript
direction = "up"
direction = "right"
direction = "down"
direction = "left"
```

## Alternativas de Personagem

### Usar Emoji

```javascript
<Player character="🧙" isMoving={isMoving} useImage={false} />
```

Exemplos: `🧑‍🦱`, `🧔`, `👨`, `👩`, `🧙`, `🗡️`.

### Usar Sprite Sheet

```javascript
<Player useImage={true} isMoving={isMoving} />
```

Confirme que `assets/images/player.png` existe e segue a grade esperada.

## Ajustar Velocidade de Animacao

No arquivo `src/components/Player.js`:

```javascript
const animationInterval = setInterval(() => {
    step = (step + 1) % walkFrames.length;
    setFrameIndex(walkFrames[step]);
}, 90);
```

## Como os Offsets Funcionam

```javascript
const offsetX = -frameIndex * FRAME_WIDTH * scaleX;
const offsetY = -rowIndex * FRAME_HEIGHT * scaleY;
```

O container usa `overflow: "hidden"`, entao apenas um frame fica visivel por vez.

## Proximos Passos

1. Adicionar seletor de personagem.
2. Criar sprites para NPCs adicionais.
3. Adicionar efeitos visuais curtos durante movimento.
4. Adicionar feedback sonoro quando houver pacote de audio configurado.

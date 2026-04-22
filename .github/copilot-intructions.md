# Copilot Intructions

Este arquivo define os padroes que devem ser aplicados daqui para frente no projeto `english-game`.

## Objetivo

Manter consistencia de arquitetura React Native/Expo, melhorar performance de renderizacao e acessibilidade, e evitar regressao de padrao entre telas/componentes.

## Padroes obrigatorios

### 1) Hooks e estabilidade de render

- Sempre manter Hooks no topo do componente, sem chamadas condicionais.
- Usar `useCallback` para handlers passados para filhos ou usados em efeitos (`onPress`, `onMove`, etc.).
- Usar `useMemo` para calculos derivados caros e blocos de UI dinamica que dependem de estado (`HUD`, geometria, distancias).
- Respeitar `react-hooks/exhaustive-deps`; nao ignorar warning sem justificativa tecnica.

### 2) Responsividade e layout

- Preferir `useWindowDimensions()` ao inves de `Dimensions.get(...)` quando o layout depende de tamanho de tela.
- Em overlays/dialogos flutuantes, aplicar limite de borda (clamp) para evitar corte fora da viewport.
- Manter posicionamento absoluto apenas para elementos de jogo (player, mapa, HUD, joystick).

### 3) Acessibilidade minima

- Todo botao interativo deve ter `accessibilityRole="button"`.
- Todo CTA importante deve ter `accessibilityLabel` claro em portugues.
- Modal e elementos-chave de navegacao devem ser legiveis por leitor de tela.

### 4) Debug e producao

- Elementos de debug (coordenadas, distancia, marcadores) devem ser exibidos apenas em desenvolvimento usando `__DEV__`.
- Nao deixar HUD de debug ativo em producao.

### 5) Robustez de props/callbacks

- Em callbacks opcionais, usar chamada segura (`onMove?.(...)`, `onClose?.(...)`) para evitar quebra.
- Validar fallback de dados externos (Tiled/JSON/config) antes de renderizar ou calcular.

### 6) Navegacao e fluxo de missao

- Manter padrao: entrada em area de trigger -> modal/contexto -> `navigation.navigate(...)` para missao.
- Ao retornar da missao, preservar fluxo com `navigation.goBack()`.

### 7) Lint e qualidade

- Toda alteracao deve terminar com validacao de lint (`npm run lint`).
- Nao concluir tarefa com erro de `rules-of-hooks` ou warning critico de dependencias de Hook.

## Checklist rapido antes de finalizar PR/commit

- [ ] Hooks corretos e sem condicional
- [ ] Handlers memoizados quando necessario
- [ ] Componentes com acessibilidade minima
- [ ] Debug protegido por `__DEV__`
- [ ] Layout responsivo com `useWindowDimensions` quando aplicavel
- [ ] `npm run lint` sem erros

## Escopo

Estas instrucoes se aplicam principalmente a:

- `src/screens/MapScreen.js`
- `src/components/FloatingJoystick.js`
- `src/components/PlayerDialog.js`
- `src/screens/SchoolMissionScreen.js`

E devem ser reaplicadas em novos componentes/telas criados no mesmo estilo.


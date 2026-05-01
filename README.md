# English Game

Um jogo mobile gamificado para aprendizagem de ingles. Explore uma cidade, complete missoes educacionais em diferentes locais e avance por licoes curtas dentro de uma experiencia de mapa 2D.

## Sobre o Projeto

**English Game** e um aplicativo React Native educacional que transforma o aprendizado de ingles em uma aventura gamificada. O jogador navega por uma cidade virtual onde cada local oferece oportunidades de aprendizado, missoes e progresso.

### Caracteristicas

- Exploracao de cidade com mapa 2D
- Missoes educacionais em multiplos locais
- Progressao por estagios e locais desbloqueaveis
- NPCs, dialogos e objetivos no mapa
- Suporte multiplataforma: iOS, Android e Web
- Construido com Expo e React Native

## Getting Started

1. Instale as dependencias:

   ```bash
   npm install
   ```

2. Inicie o app:

   ```bash
   npm start
   ```

No menu do Expo, voce pode abrir o app no Android, iOS, Web, Expo Go ou em uma development build.

## Desenvolvimento

### Scripts Disponiveis

```bash
npm start             # Inicia Expo com menu interativo
npm run android       # Abre no Android
npm run ios           # Abre no iOS
npm run web           # Abre a versao web
npm run lint          # Verifica codigo
npm test              # Executa testes uma vez
npm run test:watch    # Modo watch para TDD
npm run test:coverage # Gera relatorio de cobertura
npm run tdd           # Watch + cobertura
```

## Testes e TDD

### Politica do projeto

- Toda funcionalidade nova deve comecar com especificacao e teste automatizado quando fizer sentido.
- Meta inicial de cobertura global: **60%**.
- A fase atual foca em dados, utilitarios, logica de mapa e telas de missao.

### Fluxo padrao

1. Especificar o comportamento esperado.
2. Escrever um teste que represente o comportamento.
3. Implementar o minimo para passar.
4. Refatorar mantendo os testes verdes.
5. Validar cobertura quando a mudanca for relevante.

### Template rapido

```text
Funcionalidade:
Contexto:
Given:
When:
Then:
Criterios de aceite:
```

## Arquitetura

O jogo e estruturado em torno de um **sistema de cidade e missoes**:

- **Mapa Principal:** cidade explorada pelo jogador com joystick.
- **Locais:** pontos como Escola, Casa e Padaria.
- **Missoes:** desafios educacionais relacionados a ingles.
- **Progressao:** locais liberados conforme missoes sao concluidas.
- **NPCs:** personagens que guiam o jogador e podem liberar objetivos no mapa.

### Stack Tecnico

- React Native 0.81.5 + React 19.1.0
- Expo 54.0.33
- React Navigation 7.x
- AsyncStorage
- Jest + `@testing-library/react-native`
- TypeScript configurado em modo strict, embora a base atual esteja em JavaScript

## Mecanicas Principais

1. **Navegacao no mapa:** jogador se move por uma cidade 2D.
2. **Colisao:** o mapa usa objetos exportados do Tiled para bloquear movimento.
3. **Entrada em locais:** ao entrar em uma area, o jogador pode iniciar uma missao.
4. **Missoes gamificadas:** completar desafios educacionais marca progresso.
5. **Desbloqueio:** concluir locais libera proximos estagios.
6. **Objetivos no mapa:** apos licoes, o jogador pode coletar itens relacionados ao conteudo aprendido.

Veja `AGENTS.md` para detalhes tecnicos completos.

## Aprender Mais

- [Expo documentation](https://docs.expo.dev/)
- `AGENTS.md` - guia tecnico completo para agentes e mantenedores
- `src/` - codigo ativo do jogo

# English Game 🎮

Um jogo mobile gamificado para aprendizagem de inglês! Explore uma cidade dinâmica, complete missões educacionais em diferentes locais e domine o alfabeto inglês através de gameplay interativo.

## 🎯 Sobre o Projeto

**English Game** é um aplicativo React Native educacional que transforma o aprendizado de inglês em uma aventura gamificada. O jogador navega por uma cidade virtual onde cada bairro/local oferece diferentes missões para completar. O jogo usa um sistema de navegação baseado em mapa onde explorar diferentes áreas da cidade leva a novas oportunidades de aprendizado.

### Características
- 🗺️ Exploração de cidade com mapa 2D
- 🎓 Missões educacionais em múltiplos locais
- 🎮 Gamificação com progressão de nível
- 📱 Suporte multiplataforma (iOS, Android, Web)
- ⚡ Construído com Expo e React Native

## 🚀 Getting Started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo


## 📂 Desenvolvimento

### Scripts Disponíveis

```bash
npm start             # Inicia Expo com menu interativo
npm run android       # Build para Android
npm run ios           # Build para iOS
npm run web           # Versão web
npm run lint          # Verifica código
npm run reset-project # Reseta para projeto em branco
npm test              # Executa testes uma vez
npm run test:watch    # Modo watch para TDD
npm run test:coverage # Gera relatório de cobertura
npm run tdd           # Watch + cobertura (fluxo TDD)
```

## ✅ Testes e TDD

### Política do projeto

- Toda funcionalidade nova deve começar com especificação e teste automatizado.
- Meta inicial de cobertura global: **60%** (branches, functions, lines, statements).
- Esta fase de estabilização foca nas camadas de dados/utilitários e telas de missão.

### Fluxo padrão (TDD)

1. **Especificar** comportamento esperado (Given/When/Then em PR/issue).
2. **Escrever teste que falha** representando o comportamento.
3. **Implementar o mínimo** para o teste passar.
4. **Refatorar** mantendo todos os testes verdes.
5. **Validar cobertura** com `npm run test:coverage`.

### Template rápido de especificação

```text
Funcionalidade:
Contexto:
Given:
When:
Then:
Critérios de aceite:
```

### Comandos de uso rápido

```bash
npm test
npm run test:watch
npm run test:coverage
```

## 🏗️ Arquitetura

O jogo é estruturado em torno de um **sistema de cidades e missões**:

- **Mapa Principal:** Cidade explorada pelo jogador com múltiplas áreas
- **Áreas/Locais:** Diferentes bairros (Escola, Biblioteca, Parque, etc.) que funcionam como pontos de encontro
- **Missões:** Cada local oferece desafios educacionais relacionados a inglês
- **Progressão:** Sistema de níveis e recompensas (XP, moedas)

### Stack Técnico

- React Native 0.81.5 + React 19.1.0
- Expo 54.0.33 (iOS, Android, Web)
- React Navigation 7.x
- TypeScript (strict mode)

## 🎮 Mechanics Principais

1. **Navegação no Mapa:** Jogador se move em uma cidade 2D
2. **Detecção de Colisão:** Entrar em um local inicia uma missão
3. **Missões Gamificadas:** Completar desafios educacionais
4. **Sistema de Recompensas:** Ganhar XP e moedas ao terminar

Veja `AGENTS.md` para detalhes técnicos completos.

## 📚 Aprender Mais

- [Expo documentation](https://docs.expo.dev/)
- `AGENTS.md` - Guia completo para desenvolvedores IA
- Inspecione `src/` para estrutura do código

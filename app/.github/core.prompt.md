# 📄 core.prompt.md

Project: **EnglishGameCM**

---

# 🧠 REASONS — Structured Prompt Context

## R — Requirements (Requisitos)

O sistema é um **jogo educativo infantil** focado no ensino de inglês, onde o usuário (criança) aprende através de lições e explora um mapa com progressão gamificada.

Objetivo principal:

* Ensinar inglês de forma interativa
* Integrar aprendizado + gameplay
* Garantir evolução progressiva do usuário

Fora de escopo:

* Multiplayer
* Integrações externas complexas
* Sistemas financeiros

Resultado esperado:

* Usuário completa lições
* Progresso salvo
* Desbloqueio de novas áreas/missões

---

## E — Entities (Entidades principais)

* Player
* Lesson
* Mission
* Map
* Progress
* Reward

Relacionamentos:

* Player possui Progress
* Progress controla acesso a Lessons e Missions
* Missions desbloqueiam áreas do Map
* Lessons são pré-requisito para Missions

---

## A — Approach (Abordagem técnica)

Stack obrigatória:

* Mobile: React Native com Expo
* Backend: Java com Spring Boot
* Banco: PostgreSQL

Regras técnicas:

* Backend:

    * Usar DTO para comunicação
    * Controller NÃO deve conter regra de negócio
    * Service concentra regras
    * Repository apenas acesso a dados

* Frontend (React Native):

    * Separar lógica de estado da UI
    * Componentes devem ser o mais puros possível
    * Evitar lógica pesada em componentes visuais

* Testes:

    * TDD obrigatório no backend
    * Testes unitários para regras de negócio

---

## S — Structure (Estrutura do sistema)

Arquitetura dividida em:

* Mobile App (React Native)
* API Backend (Spring Boot)

Tipo de desenvolvimento:

* Nova feature development com evolução contínua

Organização esperada:

Backend:

* controller/
* service/
* repository/
* dto/
* domain/

Frontend:

* components/
* screens/
* hooks/
* services/

---

## O — Operations (Fluxos principais)

Fluxo base do jogo:

1. Player inicia o jogo
2. Interage com NPC (mago)
3. Recebe instrução para realizar uma Lesson
4. Completa a Lesson
5. Desbloqueia Mission
6. Explora o Map
7. Ganha Reward
8. Progresso é salvo no backend

---

## N — Norms (Padrões de código)

* Código em inglês
* Comentários em português
* Clean Code com flexibilidade (sem overengineering)
* Evitar duplicação de lógica
* Métodos pequenos e coesos
* Nomes descritivos

---

## S — Safeguards (Restrições e garantias)

NUNCA permitir:

* Perda de progresso do usuário
* Dados inconsistentes entre backend e frontend
* Regras de negócio dentro de controllers
* Lógica acoplada diretamente na UI
* Persistência sem validação

SEMPRE garantir:

* Validação de entrada de dados
* Integridade do progresso
* Separação clara de responsabilidades
* Código testável

---

# 🤖 INSTRUÇÕES PARA USO COM IA

Ao gerar código, a IA DEVE:

* Seguir estritamente este contexto
* Respeitar arquitetura definida
* Gerar código completo (não parcial)
* Incluir DTOs, services e testes quando aplicável
* Evitar decisões fora do padrão definido

Se houver conflito:
👉 Ajustar o código para respeitar este documento
👉 NUNCA ignorar estas regras

---

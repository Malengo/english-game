# 📄 lesson.prompt.md

Project: **EnglishGameCM**

---

# 🧠 REASONS — Lesson System

## R — Requirements

Sistema responsável por:

* Gerenciar lições de inglês para crianças
* Permitir completar lições
* Validar respostas
* Liberar progresso no jogo

Objetivo:

* Garantir aprendizado antes de liberar missões

Fora de escopo:

* Sistema de áudio avançado
* IA adaptativa de dificuldade

Resultado esperado:

* Lição completada com sucesso
* Progresso atualizado
* Liberação de missão

---

## E — Entities

* Lesson
* Question
* Answer
* PlayerProgress

Relacionamentos:

* Lesson possui várias Questions
* Question possui múltiplas Answers (1 correta)
* PlayerProgress registra conclusão de Lesson

---

## A — Approach

Backend:

* Spring Boot
* Service com regra de validação
* DTO para entrada/saída

Frontend:

* Tela separada para lição
* Estado isolado (hook)

---

## S — Structure

Backend:

* controller/LessonController
* service/LessonService
* dto/
* domain/

Frontend:

* screen/LessonScreen
* hooks/useLesson

---

## O — Operations

Fluxo:

1. Backend retorna uma Lesson
2. App exibe perguntas
3. Usuário responde
4. Backend valida
5. Atualiza progresso
6. Retorna sucesso/falha

---

## N — Norms

* Código em inglês
* Comentários em português
* Métodos pequenos
* DTO obrigatório

---

## S — Safeguards

* Não aceitar respostas inválidas
* Garantir apenas 1 resposta correta
* Não duplicar progresso

---

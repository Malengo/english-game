# English Game Backend

Backend Spring Boot para gerenciar licoes, exercicios e audios do English Game.

## Requisitos

- Java 17+
- Maven 3.9+
- Docker
- Python com `edge-tts`

## Rodando localmente

```bash
docker compose up -d
mvn spring-boot:run
```

Depois abra:

```text
http://localhost:8082/
```

A pagina inicial abre o fluxo completo de cadastro:

1. Criar a licao.
2. Criar uma pergunta `MULTIPLE_CHOICE`.
3. Gerar audio da pergunta com Edge TTS e salvar no R2.
4. Gerar audio de cada alternativa com Edge TTS e salvar no R2.
5. Revisar os players de audio.
6. Publicar a licao.

No JSON da licao, a pergunta retorna `promptAudioUrl` e cada alternativa retorna `audioUrl`.

## Banco

O projeto usa PostgreSQL e Flyway. As migrations ficam em:

```text
src/main/resources/db/migration
```

## Audio

Audios sao gerados com Edge TTS por meio do script:

```text
scripts/generate_audio.py
```

Instale a dependencia Python:

```bash
pip install edge-tts
```

## R2

Configure as variaveis:

```env
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=english-game-audios
R2_PUBLIC_BASE_URL=https://cdn.seudominio.com
```

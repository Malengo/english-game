# Backend Spring Boot para Licoes, Audios e Cloudflare R2

Este documento define um projeto backend em Spring Boot com PostgreSQL para gerenciar licoes do jogo de ingles. O backend tambem sera responsavel por gerar audios com Edge TTS e salvar os arquivos no Cloudflare R2.

## Objetivo

Criar uma API backend para:

- Cadastrar, editar, listar e publicar licoes.
- Organizar conteudo por modulos, fases, locais do jogo ou temas.
- Criar frases, vocabulario, alternativas e exercicios.
- Gerar audio automaticamente usando Edge TTS.
- Salvar os audios no Cloudflare R2.
- Expor URLs dos audios para o app consumir.
- Persistir dados em PostgreSQL.

## Stack Proposta

- Java 17+
- Spring Boot 3.x
- Spring Web
- Spring Data JPA
- PostgreSQL
- Flyway para migrations
- Bean Validation
- Spring Security com JWT
- Cloudflare R2 via SDK S3-compatible da AWS
- Edge TTS chamado por processo externo ou microservico Python
- Docker Compose para ambiente local

## Estrutura Inicial do Projeto

```text
english-game-backend/
|-- docker-compose.yml
|-- pom.xml
|-- src/
|   |-- main/
|   |   |-- java/
|   |   |   `-- com/englishgame/backend/
|   |   |       |-- EnglishGameBackendApplication.java
|   |   |       |-- config/
|   |   |       |-- controller/
|   |   |       |-- dto/
|   |   |       |-- entity/
|   |   |       |-- exception/
|   |   |       |-- repository/
|   |   |       |-- security/
|   |   |       |-- service/
|   |   |       `-- storage/
|   |   `-- resources/
|   |       |-- application.yml
|   |       `-- db/migration/
|   `-- test/
```

## Dominios Principais

### Lesson

Representa uma licao completa.

Campos sugeridos:

- `id`
- `title`
- `slug`
- `description`
- `locationId`
- `stageRequired`
- `topic`
- `status`: `DRAFT`, `PUBLISHED`, `ARCHIVED`
- `createdAt`
- `updatedAt`

### LessonItem

Representa uma unidade dentro da licao, como uma palavra, frase ou pergunta.

Campos sugeridos:

- `id`
- `lessonId`
- `type`: `VOCABULARY`, `PHRASE`, `QUESTION`, `DIALOG`
- `text`
- `translation`
- `orderIndex`
- `audioId`
- `createdAt`
- `updatedAt`

### Exercise

Representa uma atividade interativa.

Campos sugeridos:

- `id`
- `lessonId`
- `prompt`
- `type`: `MULTIPLE_CHOICE`, `LISTEN_AND_CHOOSE`, `MATCHING`, `WRITE_ANSWER`
- `correctAnswer`
- `orderIndex`

### ExerciseOption

Alternativas de exercicios.

Campos sugeridos:

- `id`
- `exerciseId`
- `text`
- `isCorrect`
- `orderIndex`

### AudioAsset

Metadados do audio gerado e salvo no R2.

Campos sugeridos:

- `id`
- `text`
- `voice`
- `language`
- `format`
- `r2Key`
- `publicUrl`
- `durationMs`
- `status`: `PENDING`, `GENERATED`, `FAILED`
- `errorMessage`
- `createdAt`
- `updatedAt`

## Banco de Dados

Usar PostgreSQL com Flyway.

Exemplo de migration inicial:

```sql
CREATE TABLE lessons (
    id UUID PRIMARY KEY,
    title VARCHAR(160) NOT NULL,
    slug VARCHAR(180) NOT NULL UNIQUE,
    description TEXT,
    location_id VARCHAR(80),
    stage_required INTEGER NOT NULL DEFAULT 1,
    topic VARCHAR(80),
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE audio_assets (
    id UUID PRIMARY KEY,
    text TEXT NOT NULL,
    voice VARCHAR(120) NOT NULL,
    language VARCHAR(20) NOT NULL,
    format VARCHAR(20) NOT NULL DEFAULT 'mp3',
    r2_key VARCHAR(500),
    public_url TEXT,
    duration_ms INTEGER,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE lesson_items (
    id UUID PRIMARY KEY,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    audio_id UUID REFERENCES audio_assets(id),
    type VARCHAR(40) NOT NULL,
    text TEXT NOT NULL,
    translation TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE exercises (
    id UUID PRIMARY KEY,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    type VARCHAR(40) NOT NULL,
    correct_answer TEXT,
    order_index INTEGER NOT NULL
);

CREATE TABLE exercise_options (
    id UUID PRIMARY KEY,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    order_index INTEGER NOT NULL
);
```

## Endpoints da API

### Licoes

```http
GET /api/lessons
GET /api/lessons/{id}
GET /api/lessons/slug/{slug}
POST /api/lessons
PUT /api/lessons/{id}
PATCH /api/lessons/{id}/publish
PATCH /api/lessons/{id}/archive
DELETE /api/lessons/{id}
```

### Itens da Licao

```http
POST /api/lessons/{lessonId}/items
PUT /api/lessons/{lessonId}/items/{itemId}
DELETE /api/lessons/{lessonId}/items/{itemId}
POST /api/lessons/{lessonId}/items/{itemId}/generate-audio
```

### Exercicios

```http
POST /api/lessons/{lessonId}/exercises
PUT /api/lessons/{lessonId}/exercises/{exerciseId}
DELETE /api/lessons/{lessonId}/exercises/{exerciseId}
```

### Audios

```http
POST /api/audios/generate
GET /api/audios/{id}
POST /api/audios/{id}/regenerate
DELETE /api/audios/{id}
```

## Fluxo de Geracao de Audio

1. O admin cria ou edita um item de licao.
2. O backend recebe o texto, idioma e voz desejada.
3. O backend cria um registro `AudioAsset` com status `PENDING`.
4. O servico de audio chama Edge TTS para gerar um arquivo `.mp3`.
5. O arquivo gerado e enviado para o Cloudflare R2.
6. O backend salva `r2Key`, `publicUrl` e status `GENERATED`.
7. O app consome a URL do audio junto com os dados da licao.

## Edge TTS

O Edge TTS normalmente e mais simples de usar via Python com o pacote `edge-tts`.

Opcao recomendada:

- Criar um pequeno script Python chamado pelo backend.
- O Spring Boot passa texto, voz e caminho de saida.
- O script gera o `.mp3`.
- O Spring Boot faz upload do arquivo para o R2.

Exemplo de comando esperado:

```bash
python scripts/generate_audio.py \
  --text "The book is red." \
  --voice "en-US-JennyNeural" \
  --output "/tmp/audio/lesson-item-id.mp3"
```

Vozes iniciais sugeridas:

- `en-US-JennyNeural`
- `en-US-GuyNeural`
- `en-GB-SoniaNeural`
- `en-GB-RyanNeural`

## Cloudflare R2

O R2 e compativel com a API S3. No Spring Boot, usar o AWS SDK S3 apontando para o endpoint do R2.

Variaveis de ambiente:

```env
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=english-game-audios
R2_PUBLIC_BASE_URL=https://cdn.seudominio.com
```

Chaves dos arquivos:

```text
audios/lessons/{lessonId}/items/{lessonItemId}/{voice}.mp3
audios/generated/{audioAssetId}.mp3
```

Servico sugerido:

```java
public interface AudioStorageService {
    UploadedAudio upload(byte[] content, String key, String contentType);
    void delete(String key);
}
```

## Configuracao Local

`docker-compose.yml`:

```yaml
services:
  postgres:
    image: postgres:16
    container_name: english-game-postgres
    environment:
      POSTGRES_DB: english_game
      POSTGRES_USER: english_game
      POSTGRES_PASSWORD: english_game
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

`application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/english_game
    username: english_game
    password: english_game
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        format_sql: true
  flyway:
    enabled: true

app:
  r2:
    endpoint: ${R2_ENDPOINT}
    access-key-id: ${R2_ACCESS_KEY_ID}
    secret-access-key: ${R2_SECRET_ACCESS_KEY}
    bucket: ${R2_BUCKET}
    public-base-url: ${R2_PUBLIC_BASE_URL}
  tts:
    python-command: ${TTS_PYTHON_COMMAND:python}
    script-path: ${TTS_SCRIPT_PATH:scripts/generate_audio.py}
```

## Variaveis de Ambiente e Arquivos .env

### Setup Inicial

1. **Crie o arquivo `.env`** na raiz do projeto backend:
   ```bash
   cp .env.example .env
   ```

2. **Previsão**: O arquivo `.env` deve NUNCA ser commitado (já está em `.gitignore`).

3. **Compartilhamento**: Use o arquivo `.env.example` para documentar quais variáveis são necessárias.

### ⚠️ IMPORTANTE: Manter `.env.example` Sincronizado

**Toda vez que você adicionar, remover ou modificar uma variável de ambiente no `.env`, TAMBÉM ATUALIZE o arquivo `.env.example`.**

#### Exemplo:
Se você precisa adicionar uma nova variável:

1. Adicione em `.env`:
   ```env
   NOVA_FEATURE_API_KEY=seu-valor-secreto-aqui
   ```

2. Adicione em `.env.example` (SEM o valor secreto):
   ```env
   NOVA_FEATURE_API_KEY=
   ```

3. Atualize a documentação em `SPRINGBOOT_GUIDE.md` se necessário.

### Arquivos Relacionados

- **`.env`**: Arquivo LOCAL com valores reais (NUNCA commitar)
- **`.env.example`**: Arquivo de REFERÊNCIA sem valores secretos (SEMPRE commitar)
- **`.gitignore`**: Já contém `.env` para evitar uploads acidentais

## Seguranca

Para o primeiro MVP:

- Proteger rotas de escrita com JWT.
- Deixar rotas publicas de leitura para o app:
  - `GET /api/lessons`
  - `GET /api/lessons/{id}`
  - `GET /api/lessons/slug/{slug}`
- Criar um usuario admin inicial via seed ou variavel de ambiente.

Papeis:

- `ADMIN`: cria, edita, publica e remove licoes.
- `PLAYER`: futuramente pode salvar progresso no backend.

### Proteção de Variáveis Sensíveis

- **Nunca versione `.env`**: Está em `.gitignore` para sua segurança.
- **Use `.env.example`**: Compartilhe com o time como referência.
- **Em produção**: Configure variáveis via plataforma (Docker, AWS, Heroku, etc.).
- **Em CI/CD**: Use secrets gerenciados, nunca `.env`.

## DTO de Resposta para o App

Exemplo de licao publicada:

```json
{
  "id": "uuid",
  "title": "Colors at School",
  "slug": "colors-at-school",
  "description": "Learn basic colors using school objects.",
  "locationId": "school",
  "stageRequired": 1,
  "topic": "colors",
  "items": [
    {
      "id": "uuid",
      "type": "VOCABULARY",
      "text": "Red",
      "translation": "Vermelho",
      "audioUrl": "https://cdn.seudominio.com/audios/generated/audio-id.mp3"
    }
  ],
  "exercises": [
    {
      "id": "uuid",
      "type": "MULTIPLE_CHOICE",
      "prompt": "What color is this?",
      "options": [
        { "id": "uuid", "text": "Red" },
        { "id": "uuid", "text": "Blue" }
      ]
    }
  ]
}
```

## Ordem Recomendada de Implementacao

1. Criar projeto Spring Boot com Web, JPA, PostgreSQL, Flyway e Validation.
2. Subir PostgreSQL com Docker Compose.
3. Criar entidades e migrations iniciais.
4. Implementar CRUD de licoes.
5. Implementar CRUD de itens e exercicios.
6. Configurar Cloudflare R2 com AWS SDK.
7. Implementar upload e delete de audio no R2.
8. Criar script Python com Edge TTS.
9. Implementar servico `AudioGenerationService`.
10. Integrar geracao de audio aos itens de licao.
11. Adicionar JWT para proteger rotas administrativas.
12. Criar testes de repository, service e controller.

## Dependencias Maven Sugeridas

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>org.flywaydb</groupId>
        <artifactId>flyway-core</artifactId>
    </dependency>
    <dependency>
        <groupId>org.flywaydb</groupId>
        <artifactId>flyway-database-postgresql</artifactId>
    </dependency>
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>software.amazon.awssdk</groupId>
        <artifactId>s3</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

## Script Python Edge TTS

Arquivo sugerido: `scripts/generate_audio.py`

```python
import argparse
import asyncio
import edge_tts


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--text", required=True)
    parser.add_argument("--voice", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    communicate = edge_tts.Communicate(args.text, args.voice)
    await communicate.save(args.output)


if __name__ == "__main__":
    asyncio.run(main())
```

Dependencia:

```bash
pip install edge-tts
```

## Decisoes Importantes

- O backend nao deve gerar audio de novo se o texto, voz e idioma ja tiverem um `AudioAsset` valido.
- O app deve consumir apenas licoes publicadas.
- O R2 deve guardar os arquivos, e o banco deve guardar apenas metadados e URLs.
- A URL publica pode vir de um dominio customizado no Cloudflare.
- Para MVP, a geracao pode ser sincrona. Depois, migrar para fila com status assincrono.

## Evolucoes Futuras

- Painel admin web para editar licoes.
- Sistema de progresso do jogador no backend.
- Fila com RabbitMQ, Redis Queue ou SQS para geracao de audio.
- Cache CDN para audios.
- Suporte a multiplas vozes por personagem.
- Revisao manual antes de publicar uma licao.
- Importacao de licoes via CSV ou JSON.
- Versionamento de licoes publicadas.

# Docker Deployment Guide

## 📦 Arquivos Criados

1. **`Dockerfile`** - Imagem Docker multi-stage para build e runtime
2. **`.dockerignore`** - Otimização de build, ignora arquivos desnecessários
3. **`docker-compose.yml`** (atualizado) - Orquestra PostgreSQL + Backend

## 🚀 Como usar

### Pré-requisitos
- Docker e Docker Compose instalados
- Arquivo `.env` preenchido com credenciais do R2

### Build e Deploy local

```bash
# 1. Certifique-se de ter o .env preenchido
cp .env.example .env
# Edite o .env com seus valores de R2

# 2. Build da imagem
docker build -t english-game-backend:latest .

# OU use docker-compose para orchestrar tudo
docker-compose up -d

# 3. Verificar logs
docker-compose logs -f backend

# 4. Parar os serviços
docker-compose down
```

### Variáveis de Ambiente no Docker

O `docker-compose.yml` carrega do `.env`:
- `R2_ENDPOINT`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`
- `R2_PUBLIC_BASE_URL`

As demais variáveis têm valores padrão configurados.

## 📋 O que o Dockerfile faz

### Stage 1: Builder
- Usa imagem Maven com Java 17
- Faz download das dependências Maven
- Compila o código e gera o JAR
- Copia scripts Python

### Stage 2: Runtime
- Usa JRE 17 (menor que JDK)
- Instala Python 3 e pip
- Instala edge-tts (dependência Python)
- Copia JAR e scripts
- Expõe porta 8082
- Configurado com health check

## 🏗️ Estrutura Multi-Stage

A abordagem multi-stage reduz o tamanho da imagem final:
- **Builder**: ~500MB (com Maven, JDK completo)
- **Final**: ~200MB (apenas JRE + Python + app)

## 🔗 Services no docker-compose.yml

### PostgreSQL
- Host: `postgres` (dentro da rede Docker)
- Porta: 5432
- Database: `english_game`
- Usuário: `english_game`
- Senha: `english_game`
- Health check incluído

### Backend
- Host: `backend`
- Porta: 8082 (mapeada)
- Depende do PostgreSQL (aguarda saúde)
- Volume para arquivos temporários de áudio
- Restart automático
- Health check incluído

## ✅ Health Checks

Ambos os serviços têm health checks:
- **PostgreSQL**: Verifica se está pronto para conexões
- **Backend**: Chama `/actuator/health` (requer spring-boot-starter-actuator)

Para adicionar actuator, atualize o `pom.xml`:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

## 🐛 Troubleshooting

### Backend não consegue conectar ao PostgreSQL
```bash
# Verifi se PostgreSQL está saudável
docker-compose ps
docker-compose logs postgres
```

### Erro ao gerar áudio (Python/edge-tts)
```bash
# Entre no container e teste
docker-compose exec backend python3 -c "import edge_tts; print(edge_tts.__version__)"
```

### Limpar tudo e recomeçar
```bash
docker-compose down -v  # Remove volumes também
rm -rf target/  # Limpa build local
docker-compose up --build  # Rebuild do zero
```

## 📦 Push para Registry (produção)

```bash
# Tag a imagem
docker tag english-game-backend:latest seu-registro.azurecr.io/english-game:latest

# Push
docker push seu-registro.azurecr.io/english-game:latest
```

## 🔐 Segurança em Produção

- ✅ Nunca commitar `.env` com valores reais
- ✅ Usar secrets do Docker Swarm ou Kubernetes
- ✅ Usar multi-stage build (menor superfície de ataque)
- ✅ Limitar recursos de CPU/memória
- ✅ Usar read-only filesystem onde possível
- ✅ Executar como non-root user (considere adicionar ao Dockerfile)

Exemplo para non-root:
```dockerfile
RUN useradd -m -u 1001 appuser
USER appuser
```

## 📚 Referências

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Multi-stage builds](https://docs.docker.com/build/building/multi-stage/)
- [Spring Boot + Docker](https://spring.io/guides/gs/spring-boot-docker/)


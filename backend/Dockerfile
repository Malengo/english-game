# Stage 1: Build
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /app

# Copy Maven files first to keep dependency downloads cached.
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build the Spring Boot application.
COPY src/ ./src
COPY scripts/ ./scripts
RUN mvn clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Python is used by scripts/generate_audio.py. curl is used by the container healthcheck.
RUN apt-get update && apt-get install -y \
    curl \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir edge-tts

COPY --from=builder /app/target/*.jar app.jar
COPY --from=builder /app/scripts/ ./scripts/

RUN mkdir -p /tmp/english-game-audios

EXPOSE 8082

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD-SHELL curl -f "http://localhost:${SERVER_PORT:-${PORT:-8082}}/actuator/health" || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]

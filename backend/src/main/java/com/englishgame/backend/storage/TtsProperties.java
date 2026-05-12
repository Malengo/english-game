package com.englishgame.backend.storage;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.tts")
public record TtsProperties(
        String pythonCommand,
        String scriptPath,
        String tempDir
) {
}

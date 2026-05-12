package com.englishgame.backend.config;

import com.englishgame.backend.storage.R2Properties;
import com.englishgame.backend.storage.TtsProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties({R2Properties.class, TtsProperties.class})
public class AppPropertiesConfig {
}

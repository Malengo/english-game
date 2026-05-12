package com.englishgame.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record GenerateLessonItemAudioRequest(
        @NotBlank String voice,
        @NotBlank String language
) {
}

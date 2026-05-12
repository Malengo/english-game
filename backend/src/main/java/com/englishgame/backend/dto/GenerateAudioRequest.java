package com.englishgame.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record GenerateAudioRequest(
        @NotBlank String text,
        @NotBlank String voice,
        @NotBlank String language
) {
}

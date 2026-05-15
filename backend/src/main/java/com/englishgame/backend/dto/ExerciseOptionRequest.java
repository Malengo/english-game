package com.englishgame.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record ExerciseOptionRequest(
        @NotBlank String text,
        String color,
        @NotNull Boolean correct,
        @NotNull @PositiveOrZero Integer orderIndex
) {
}

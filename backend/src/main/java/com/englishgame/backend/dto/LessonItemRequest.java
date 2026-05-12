package com.englishgame.backend.dto;

import com.englishgame.backend.entity.LessonItemType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record LessonItemRequest(
        @NotNull LessonItemType type,
        @NotBlank String text,
        String translation,
        @NotNull @PositiveOrZero Integer orderIndex
) {
}

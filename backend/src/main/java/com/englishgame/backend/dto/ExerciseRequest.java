package com.englishgame.backend.dto;

import com.englishgame.backend.entity.ExerciseType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.util.List;

public record ExerciseRequest(
        @NotBlank String prompt,
        @Size(max = 32) String emoji,
        @NotNull ExerciseType type,
        String correctAnswer,
        @NotNull @PositiveOrZero Integer orderIndex,
        @Valid List<ExerciseOptionRequest> options
) {
}

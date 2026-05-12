package com.englishgame.backend.dto;

import com.englishgame.backend.entity.Exercise;
import com.englishgame.backend.entity.ExerciseType;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

public record ExerciseResponse(
        UUID id,
        String prompt,
        String promptAudioUrl,
        ExerciseType type,
        String correctAnswer,
        Integer orderIndex,
        List<ExerciseOptionResponse> options
) {
    public static ExerciseResponse from(Exercise exercise) {
        return new ExerciseResponse(
                exercise.getId(),
                exercise.getPrompt(),
                exercise.getPromptAudio() == null ? null : exercise.getPromptAudio().getPublicUrl(),
                exercise.getType(),
                exercise.getCorrectAnswer(),
                exercise.getOrderIndex(),
                exercise.getOptions().stream()
                        .sorted(Comparator.comparing(option -> option.getOrderIndex()))
                        .map(ExerciseOptionResponse::from)
                        .toList()
        );
    }
}

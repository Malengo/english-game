package com.englishgame.backend.dto;

import com.englishgame.backend.entity.ExerciseOption;
import java.util.UUID;

public record ExerciseOptionResponse(
        UUID id,
        String text,
        String audioUrl,
        Boolean correct,
        Integer orderIndex
) {
    public static ExerciseOptionResponse from(ExerciseOption option) {
        return new ExerciseOptionResponse(
                option.getId(),
                option.getText(),
                option.getAudio() == null ? null : option.getAudio().getPublicUrl(),
                option.getCorrect(),
                option.getOrderIndex()
        );
    }
}

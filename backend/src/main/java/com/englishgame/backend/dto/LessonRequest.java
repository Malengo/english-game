package com.englishgame.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LessonRequest(
        @NotBlank @Size(max = 160) String title,
        @Size(max = 180) String slug,
        String description,
        @Size(max = 80) String locationId,
        @Min(1) Integer stageRequired,
        @Size(max = 80) String topic,
        LessonMissionRequest mission
) {
}

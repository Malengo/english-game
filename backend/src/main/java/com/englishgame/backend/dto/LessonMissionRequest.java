package com.englishgame.backend.dto;

import com.englishgame.backend.entity.LessonMissionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record LessonMissionRequest(
        @NotNull LessonMissionType type,
        @NotBlank @Size(max = 160) String title,
        @Size(max = 500) String description,
        @NotBlank @Size(max = 80) String npcId,
        @Size(max = 40) String targetSource,
        @Size(max = 40) String collectibleType
) {
}



package com.englishgame.backend.dto;

import com.englishgame.backend.entity.LessonMission;
import com.englishgame.backend.entity.LessonMissionType;
import java.util.UUID;

public record LessonMissionResponse(
        UUID id,
        LessonMissionType type,
        String title,
        String description,
        String npcId,
        String targetSource,
        String collectibleType
) {
    public static LessonMissionResponse from(LessonMission mission) {
        if (mission == null) {
            return null;
        }
        return new LessonMissionResponse(
                mission.getId(),
                mission.getType(),
                mission.getTitle(),
                mission.getDescription(),
                mission.getNpcId(),
                mission.getTargetSource(),
                mission.getCollectibleType()
        );
    }
}



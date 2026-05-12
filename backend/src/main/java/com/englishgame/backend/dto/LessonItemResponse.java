package com.englishgame.backend.dto;

import com.englishgame.backend.entity.LessonItem;
import com.englishgame.backend.entity.LessonItemType;
import java.util.UUID;

public record LessonItemResponse(
        UUID id,
        LessonItemType type,
        String text,
        String translation,
        Integer orderIndex,
        String audioUrl
) {
    public static LessonItemResponse from(LessonItem item) {
        return new LessonItemResponse(
                item.getId(),
                item.getType(),
                item.getText(),
                item.getTranslation(),
                item.getOrderIndex(),
                item.getAudio() == null ? null : item.getAudio().getPublicUrl()
        );
    }
}

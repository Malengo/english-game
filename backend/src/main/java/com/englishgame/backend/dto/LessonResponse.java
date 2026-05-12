package com.englishgame.backend.dto;

import com.englishgame.backend.entity.Lesson;
import com.englishgame.backend.entity.LessonStatus;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

public record LessonResponse(
        UUID id,
        String title,
        String slug,
        String description,
        String locationId,
        Integer stageRequired,
        String topic,
        LessonStatus status,
        List<LessonItemResponse> items,
        List<ExerciseResponse> exercises,
        Instant createdAt,
        Instant updatedAt
) {
    public static LessonResponse from(Lesson lesson) {
        return new LessonResponse(
                lesson.getId(),
                lesson.getTitle(),
                lesson.getSlug(),
                lesson.getDescription(),
                lesson.getLocationId(),
                lesson.getStageRequired(),
                lesson.getTopic(),
                lesson.getStatus(),
                lesson.getItems().stream()
                        .sorted(Comparator.comparing(item -> item.getOrderIndex()))
                        .map(LessonItemResponse::from)
                        .toList(),
                lesson.getExercises().stream()
                        .sorted(Comparator.comparing(exercise -> exercise.getOrderIndex()))
                        .map(ExerciseResponse::from)
                        .toList(),
                lesson.getCreatedAt(),
                lesson.getUpdatedAt()
        );
    }
}

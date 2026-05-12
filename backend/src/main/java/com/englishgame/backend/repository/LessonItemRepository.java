package com.englishgame.backend.repository;

import com.englishgame.backend.entity.LessonItem;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LessonItemRepository extends JpaRepository<LessonItem, UUID> {
    List<LessonItem> findByLessonIdOrderByOrderIndexAsc(UUID lessonId);
}

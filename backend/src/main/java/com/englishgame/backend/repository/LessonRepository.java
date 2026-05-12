package com.englishgame.backend.repository;

import com.englishgame.backend.entity.Lesson;
import com.englishgame.backend.entity.LessonStatus;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LessonRepository extends JpaRepository<Lesson, UUID> {
    Optional<Lesson> findBySlug(String slug);

    List<Lesson> findByStatusOrderByStageRequiredAscTitleAsc(LessonStatus status);

    boolean existsBySlug(String slug);
}

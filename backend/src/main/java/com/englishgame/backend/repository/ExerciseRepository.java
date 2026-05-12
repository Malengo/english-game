package com.englishgame.backend.repository;

import com.englishgame.backend.entity.Exercise;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExerciseRepository extends JpaRepository<Exercise, UUID> {
    List<Exercise> findByLessonIdOrderByOrderIndexAsc(UUID lessonId);
}

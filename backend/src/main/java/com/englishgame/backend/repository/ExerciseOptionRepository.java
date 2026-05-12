package com.englishgame.backend.repository;

import com.englishgame.backend.entity.ExerciseOption;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExerciseOptionRepository extends JpaRepository<ExerciseOption, UUID> {
}

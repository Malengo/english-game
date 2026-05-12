package com.englishgame.backend.controller;

import com.englishgame.backend.dto.ExerciseRequest;
import com.englishgame.backend.dto.ExerciseResponse;
import com.englishgame.backend.service.ExerciseService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/lessons/{lessonId}/exercises")
public class ExerciseController {

    private final ExerciseService exerciseService;

    public ExerciseController(ExerciseService exerciseService) {
        this.exerciseService = exerciseService;
    }

    @PostMapping
    public ResponseEntity<ExerciseResponse> create(
            @PathVariable UUID lessonId,
            @Valid @RequestBody ExerciseRequest request
    ) {
        ExerciseResponse response = ExerciseResponse.from(exerciseService.create(lessonId, request));
        return ResponseEntity.created(URI.create("/api/lessons/" + lessonId + "/exercises/" + response.id()))
                .body(response);
    }

    @PutMapping("/{exerciseId}")
    public ExerciseResponse update(
            @PathVariable UUID lessonId,
            @PathVariable UUID exerciseId,
            @Valid @RequestBody ExerciseRequest request
    ) {
        return ExerciseResponse.from(exerciseService.update(lessonId, exerciseId, request));
    }

    @DeleteMapping("/{exerciseId}")
    public ResponseEntity<Void> delete(@PathVariable UUID lessonId, @PathVariable UUID exerciseId) {
        exerciseService.delete(lessonId, exerciseId);
        return ResponseEntity.noContent().build();
    }
}

package com.englishgame.backend.controller;

import com.englishgame.backend.dto.AudioResponse;
import com.englishgame.backend.dto.ExerciseRequest;
import com.englishgame.backend.dto.ExerciseResponse;
import com.englishgame.backend.dto.GenerateLessonItemAudioRequest;
import com.englishgame.backend.service.AudioGenerationService;
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
    private final AudioGenerationService audioGenerationService;

    public ExerciseController(ExerciseService exerciseService, AudioGenerationService audioGenerationService) {
        this.exerciseService = exerciseService;
        this.audioGenerationService = audioGenerationService;
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

    @PostMapping("/{exerciseId}/generate-prompt-audio")
    public AudioResponse generatePromptAudio(
            @PathVariable UUID lessonId,
            @PathVariable UUID exerciseId,
            @Valid @RequestBody GenerateLessonItemAudioRequest request
    ) {
        return AudioResponse.from(audioGenerationService.generateForExercisePrompt(
                lessonId,
                exerciseId,
                request.voice(),
                request.language()
        ));
    }

    @PostMapping("/{exerciseId}/options/{optionId}/generate-audio")
    public AudioResponse generateOptionAudio(
            @PathVariable UUID lessonId,
            @PathVariable UUID exerciseId,
            @PathVariable UUID optionId,
            @Valid @RequestBody GenerateLessonItemAudioRequest request
    ) {
        return AudioResponse.from(audioGenerationService.generateForExerciseOption(
                lessonId,
                exerciseId,
                optionId,
                request.voice(),
                request.language()
        ));
    }
}

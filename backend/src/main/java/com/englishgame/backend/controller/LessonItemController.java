package com.englishgame.backend.controller;

import com.englishgame.backend.dto.AudioResponse;
import com.englishgame.backend.dto.GenerateAudioRequest;
import com.englishgame.backend.dto.LessonItemRequest;
import com.englishgame.backend.dto.LessonItemResponse;
import com.englishgame.backend.service.AudioGenerationService;
import com.englishgame.backend.service.LessonItemService;
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
@RequestMapping("/api/lessons/{lessonId}/items")
public class LessonItemController {

    private final LessonItemService lessonItemService;
    private final AudioGenerationService audioGenerationService;

    public LessonItemController(
            LessonItemService lessonItemService,
            AudioGenerationService audioGenerationService
    ) {
        this.lessonItemService = lessonItemService;
        this.audioGenerationService = audioGenerationService;
    }

    @PostMapping
    public ResponseEntity<LessonItemResponse> create(
            @PathVariable UUID lessonId,
            @Valid @RequestBody LessonItemRequest request
    ) {
        LessonItemResponse response = LessonItemResponse.from(lessonItemService.create(lessonId, request));
        return ResponseEntity.created(URI.create("/api/lessons/" + lessonId + "/items/" + response.id()))
                .body(response);
    }

    @PutMapping("/{itemId}")
    public LessonItemResponse update(
            @PathVariable UUID lessonId,
            @PathVariable UUID itemId,
            @Valid @RequestBody LessonItemRequest request
    ) {
        return LessonItemResponse.from(lessonItemService.update(lessonId, itemId, request));
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> delete(@PathVariable UUID lessonId, @PathVariable UUID itemId) {
        lessonItemService.delete(lessonId, itemId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{itemId}/generate-audio")
    public AudioResponse generateAudio(
            @PathVariable UUID lessonId,
            @PathVariable UUID itemId,
            @Valid @RequestBody GenerateAudioRequest request
    ) {
        return AudioResponse.from(audioGenerationService.generateForLessonItem(
                lessonId,
                itemId,
                request.voice(),
                request.language()
        ));
    }
}

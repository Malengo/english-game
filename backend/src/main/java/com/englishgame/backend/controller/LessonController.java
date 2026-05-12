package com.englishgame.backend.controller;

import com.englishgame.backend.dto.LessonRequest;
import com.englishgame.backend.dto.LessonResponse;
import com.englishgame.backend.service.LessonService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/lessons")
public class LessonController {

    private final LessonService lessonService;

    public LessonController(LessonService lessonService) {
        this.lessonService = lessonService;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<LessonResponse> findAll(@RequestParam(defaultValue = "false") Boolean publishedOnly) {
        return lessonService.findAll(publishedOnly).stream()
                .map(LessonResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public LessonResponse getById(@PathVariable UUID id) {
        return LessonResponse.from(lessonService.getById(id));
    }

    @GetMapping("/slug/{slug}")
    @Transactional(readOnly = true)
    public LessonResponse getBySlug(@PathVariable String slug) {
        return LessonResponse.from(lessonService.getBySlug(slug));
    }

    @PostMapping
    public ResponseEntity<LessonResponse> create(@Valid @RequestBody LessonRequest request) {
        LessonResponse response = LessonResponse.from(lessonService.create(request));
        return ResponseEntity.created(URI.create("/api/lessons/" + response.id())).body(response);
    }

    @PutMapping("/{id}")
    public LessonResponse update(@PathVariable UUID id, @Valid @RequestBody LessonRequest request) {
        return LessonResponse.from(lessonService.update(id, request));
    }

    @PatchMapping("/{id}/publish")
    public LessonResponse publish(@PathVariable UUID id) {
        return LessonResponse.from(lessonService.publish(id));
    }

    @PatchMapping("/{id}/archive")
    public LessonResponse archive(@PathVariable UUID id) {
        return LessonResponse.from(lessonService.archive(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        lessonService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

package com.englishgame.backend.controller;

import com.englishgame.backend.dto.AudioResponse;
import com.englishgame.backend.dto.GenerateAudioRequest;
import com.englishgame.backend.service.AudioGenerationService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/audios")
public class AudioController {

    private final AudioGenerationService audioGenerationService;

    public AudioController(AudioGenerationService audioGenerationService) {
        this.audioGenerationService = audioGenerationService;
    }

    @PostMapping("/generate")
    public ResponseEntity<AudioResponse> generate(@Valid @RequestBody GenerateAudioRequest request) {
        AudioResponse response = AudioResponse.from(audioGenerationService.generate(request));
        return ResponseEntity.created(URI.create("/api/audios/" + response.id())).body(response);
    }

    @GetMapping("/{id}")
    public AudioResponse getById(@PathVariable UUID id) {
        return AudioResponse.from(audioGenerationService.getById(id));
    }

    @PostMapping("/{id}/regenerate")
    public AudioResponse regenerate(@PathVariable UUID id) {
        return AudioResponse.from(audioGenerationService.regenerate(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        audioGenerationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

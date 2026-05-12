package com.englishgame.backend.service;

import com.englishgame.backend.dto.GenerateAudioRequest;
import com.englishgame.backend.entity.AudioAsset;
import com.englishgame.backend.entity.AudioAssetStatus;
import com.englishgame.backend.entity.LessonItem;
import com.englishgame.backend.exception.ResourceNotFoundException;
import com.englishgame.backend.repository.AudioAssetRepository;
import com.englishgame.backend.repository.LessonItemRepository;
import com.englishgame.backend.storage.AudioStorageService;
import com.englishgame.backend.storage.TtsProperties;
import com.englishgame.backend.storage.UploadedAudio;
import jakarta.transaction.Transactional;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class AudioGenerationService {

    private static final String DEFAULT_FORMAT = "mp3";
    private static final String MP3_CONTENT_TYPE = "audio/mpeg";

    private final AudioAssetRepository audioAssetRepository;
    private final LessonItemRepository lessonItemRepository;
    private final AudioStorageService audioStorageService;
    private final TtsProperties ttsProperties;

    public AudioGenerationService(
            AudioAssetRepository audioAssetRepository,
            LessonItemRepository lessonItemRepository,
            AudioStorageService audioStorageService,
            TtsProperties ttsProperties
    ) {
        this.audioAssetRepository = audioAssetRepository;
        this.lessonItemRepository = lessonItemRepository;
        this.audioStorageService = audioStorageService;
        this.ttsProperties = ttsProperties;
    }

    @Transactional
    public AudioAsset generate(GenerateAudioRequest request) {
        return audioAssetRepository.findFirstByTextAndVoiceAndLanguageAndStatus(
                request.text(),
                request.voice(),
                request.language(),
                AudioAssetStatus.GENERATED
        ).orElseGet(() -> generateNew(request.text(), request.voice(), request.language()));
    }

    @Transactional
    public AudioAsset generateForLessonItem(UUID lessonId, UUID itemId, String voice, String language) {
        LessonItem item = lessonItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson item not found"));
        if (!item.getLesson().getId().equals(lessonId)) {
            throw new ResourceNotFoundException("Lesson item not found");
        }

        AudioAsset audio = generate(new GenerateAudioRequest(item.getText(), voice, language));
        item.setAudio(audio);
        lessonItemRepository.save(item);
        return audio;
    }

    public AudioAsset getById(UUID id) {
        return audioAssetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Audio not found"));
    }

    @Transactional
    public AudioAsset regenerate(UUID id) {
        AudioAsset audio = getById(id);
        return generateNew(audio.getText(), audio.getVoice(), audio.getLanguage());
    }

    @Transactional
    public void delete(UUID id) {
        AudioAsset audio = getById(id);
        if (audio.getR2Key() != null) {
            audioStorageService.delete(audio.getR2Key());
        }
        audioAssetRepository.delete(audio);
    }

    private AudioAsset generateNew(String text, String voice, String language) {
        AudioAsset audio = new AudioAsset();
        audio.setText(text);
        audio.setVoice(voice);
        audio.setLanguage(language);
        audio.setFormat(DEFAULT_FORMAT);
        audio.setStatus(AudioAssetStatus.PENDING);
        audio = audioAssetRepository.save(audio);

        try {
            Path outputFile = generateAudioFile(audio);
            byte[] content = Files.readAllBytes(outputFile);
            String key = "audios/generated/" + audio.getId() + "." + DEFAULT_FORMAT;
            UploadedAudio uploaded = audioStorageService.upload(content, key, MP3_CONTENT_TYPE);

            audio.setR2Key(uploaded.key());
            audio.setPublicUrl(uploaded.publicUrl());
            audio.setStatus(AudioAssetStatus.GENERATED);
            audio.setErrorMessage(null);
            Files.deleteIfExists(outputFile);
        } catch (IOException | InterruptedException exception) {
            if (exception instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            audio.setStatus(AudioAssetStatus.FAILED);
            audio.setErrorMessage(exception.getMessage());
        }

        return audioAssetRepository.save(audio);
    }

    private Path generateAudioFile(AudioAsset audio) throws IOException, InterruptedException {
        Path tempDir = Path.of(ttsProperties.tempDir());
        Files.createDirectories(tempDir);
        Path outputFile = tempDir.resolve(audio.getId() + "." + DEFAULT_FORMAT);

        List<String> command = List.of(
                ttsProperties.pythonCommand(),
                ttsProperties.scriptPath(),
                "--text", audio.getText(),
                "--voice", audio.getVoice(),
                "--output", outputFile.toString()
        );

        Process process = new ProcessBuilder(command)
                .redirectErrorStream(true)
                .start();

        int exitCode = process.waitFor();
        if (exitCode != 0) {
            String output = new String(process.getInputStream().readAllBytes());
            throw new IOException("Edge TTS failed: " + output);
        }

        return outputFile;
    }
}

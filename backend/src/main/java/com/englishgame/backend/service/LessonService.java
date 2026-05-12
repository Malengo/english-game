package com.englishgame.backend.service;

import com.englishgame.backend.dto.LessonRequest;
import com.englishgame.backend.entity.Lesson;
import com.englishgame.backend.entity.LessonStatus;
import com.englishgame.backend.exception.BadRequestException;
import com.englishgame.backend.exception.ResourceNotFoundException;
import com.englishgame.backend.repository.LessonRepository;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class LessonService {

    private final LessonRepository lessonRepository;
    private final SlugService slugService;

    public LessonService(LessonRepository lessonRepository, SlugService slugService) {
        this.lessonRepository = lessonRepository;
        this.slugService = slugService;
    }

    public List<Lesson> findAll(Boolean publishedOnly) {
        if (Boolean.TRUE.equals(publishedOnly)) {
            return lessonRepository.findByStatusOrderByStageRequiredAscTitleAsc(LessonStatus.PUBLISHED);
        }
        return lessonRepository.findAll();
    }

    public Lesson getById(UUID id) {
        return lessonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found"));
    }

    public Lesson getBySlug(String slug) {
        return lessonRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found"));
    }

    @Transactional
    public Lesson create(LessonRequest request) {
        Lesson lesson = new Lesson();
        applyRequest(lesson, request);
        ensureSlugAvailable(lesson.getSlug(), null);
        return lessonRepository.save(lesson);
    }

    @Transactional
    public Lesson update(UUID id, LessonRequest request) {
        Lesson lesson = getById(id);
        applyRequest(lesson, request);
        ensureSlugAvailable(lesson.getSlug(), id);
        return lessonRepository.save(lesson);
    }

    @Transactional
    public Lesson publish(UUID id) {
        Lesson lesson = getById(id);
        lesson.setStatus(LessonStatus.PUBLISHED);
        return lessonRepository.save(lesson);
    }

    @Transactional
    public Lesson archive(UUID id) {
        Lesson lesson = getById(id);
        lesson.setStatus(LessonStatus.ARCHIVED);
        return lessonRepository.save(lesson);
    }

    @Transactional
    public void delete(UUID id) {
        if (!lessonRepository.existsById(id)) {
            throw new ResourceNotFoundException("Lesson not found");
        }
        lessonRepository.deleteById(id);
    }

    private void applyRequest(Lesson lesson, LessonRequest request) {
        lesson.setTitle(request.title());
        lesson.setSlug(resolveSlug(request));
        lesson.setDescription(request.description());
        lesson.setLocationId(request.locationId());
        lesson.setStageRequired(request.stageRequired() == null ? 1 : request.stageRequired());
        lesson.setTopic(request.topic());
    }

    private String resolveSlug(LessonRequest request) {
        if (request.slug() != null && !request.slug().isBlank()) {
            return slugService.fromTitle(request.slug());
        }
        return slugService.fromTitle(request.title());
    }

    private void ensureSlugAvailable(String slug, UUID currentLessonId) {
        lessonRepository.findBySlug(slug).ifPresent(existing -> {
            if (!existing.getId().equals(currentLessonId)) {
                throw new BadRequestException("Lesson slug already exists");
            }
        });
    }
}

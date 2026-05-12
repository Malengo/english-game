package com.englishgame.backend.service;

import com.englishgame.backend.dto.LessonItemRequest;
import com.englishgame.backend.entity.Lesson;
import com.englishgame.backend.entity.LessonItem;
import com.englishgame.backend.exception.ResourceNotFoundException;
import com.englishgame.backend.repository.LessonItemRepository;
import jakarta.transaction.Transactional;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class LessonItemService {

    private final LessonService lessonService;
    private final LessonItemRepository lessonItemRepository;

    public LessonItemService(LessonService lessonService, LessonItemRepository lessonItemRepository) {
        this.lessonService = lessonService;
        this.lessonItemRepository = lessonItemRepository;
    }

    @Transactional
    public LessonItem create(UUID lessonId, LessonItemRequest request) {
        Lesson lesson = lessonService.getById(lessonId);
        LessonItem item = new LessonItem();
        item.setLesson(lesson);
        applyRequest(item, request);
        return lessonItemRepository.save(item);
    }

    @Transactional
    public LessonItem update(UUID lessonId, UUID itemId, LessonItemRequest request) {
        LessonItem item = getItemForLesson(lessonId, itemId);
        applyRequest(item, request);
        return lessonItemRepository.save(item);
    }

    @Transactional
    public void delete(UUID lessonId, UUID itemId) {
        LessonItem item = getItemForLesson(lessonId, itemId);
        lessonItemRepository.delete(item);
    }

    public LessonItem getItemForLesson(UUID lessonId, UUID itemId) {
        LessonItem item = lessonItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson item not found"));
        if (!item.getLesson().getId().equals(lessonId)) {
            throw new ResourceNotFoundException("Lesson item not found");
        }
        return item;
    }

    private void applyRequest(LessonItem item, LessonItemRequest request) {
        item.setType(request.type());
        item.setText(request.text());
        item.setTranslation(request.translation());
        item.setOrderIndex(request.orderIndex());
    }
}

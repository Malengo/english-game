package com.englishgame.backend.service;

import com.englishgame.backend.dto.ExerciseOptionRequest;
import com.englishgame.backend.dto.ExerciseRequest;
import com.englishgame.backend.entity.Exercise;
import com.englishgame.backend.entity.ExerciseOption;
import com.englishgame.backend.entity.Lesson;
import com.englishgame.backend.exception.ResourceNotFoundException;
import com.englishgame.backend.repository.ExerciseRepository;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class ExerciseService {

    private final LessonService lessonService;
    private final ExerciseRepository exerciseRepository;

    public ExerciseService(LessonService lessonService, ExerciseRepository exerciseRepository) {
        this.lessonService = lessonService;
        this.exerciseRepository = exerciseRepository;
    }

    @Transactional
    public Exercise create(UUID lessonId, ExerciseRequest request) {
        Lesson lesson = lessonService.getById(lessonId);
        Exercise exercise = new Exercise();
        exercise.setLesson(lesson);
        applyRequest(exercise, request);
        return exerciseRepository.save(exercise);
    }

    @Transactional
    public Exercise update(UUID lessonId, UUID exerciseId, ExerciseRequest request) {
        Exercise exercise = getExerciseForLesson(lessonId, exerciseId);
        applyRequest(exercise, request);
        return exerciseRepository.save(exercise);
    }

    @Transactional
    public void delete(UUID lessonId, UUID exerciseId) {
        Exercise exercise = getExerciseForLesson(lessonId, exerciseId);
        exerciseRepository.delete(exercise);
    }

    private Exercise getExerciseForLesson(UUID lessonId, UUID exerciseId) {
        Exercise exercise = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new ResourceNotFoundException("Exercise not found"));
        if (!exercise.getLesson().getId().equals(lessonId)) {
            throw new ResourceNotFoundException("Exercise not found");
        }
        return exercise;
    }

    private void applyRequest(Exercise exercise, ExerciseRequest request) {
        exercise.setPrompt(request.prompt());
        exercise.setEmoji(request.emoji());
        exercise.setType(request.type());
        exercise.setCorrectAnswer(request.correctAnswer());
        exercise.setOrderIndex(request.orderIndex());
        exercise.getOptions().clear();

        List<ExerciseOptionRequest> options = request.options();
        if (options == null) {
            return;
        }

        for (ExerciseOptionRequest optionRequest : options) {
            ExerciseOption option = new ExerciseOption();
            option.setExercise(exercise);
            option.setText(optionRequest.text());
            option.setColor(optionRequest.color());
            option.setCorrect(optionRequest.correct());
            option.setOrderIndex(optionRequest.orderIndex());
            exercise.getOptions().add(option);
        }
    }
}

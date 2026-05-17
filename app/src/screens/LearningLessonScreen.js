import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { getFirstLessonForLocation, getLessonById, getNextLessonInLocation } from "../data/lessonCatalog";
import { useLessonCatalog } from "../hooks/useLessonCatalog";
import { playCachedAudio } from "../utils/audioPlayer";
import { markLessonCompleted, markLocationCompleted } from "../utils/progressStorage";
import { showLessonMissionUnlockNotice } from "../utils/lessonMissionNotice";

const TYPE_LABELS = {
  VOCABULARY: "Palavra",
  PHRASE: "Exemplo",
  DIALOG: "Dialogo",
};

function buildSteps(lesson) {
  if (Array.isArray(lesson?.steps) && lesson.steps.length > 0) {
    return lesson.steps;
  }

  return (lesson?.questions ?? []).map((question, index) => ({
    ...question,
    type: "question",
    orderIndex: index,
  }));
}

export default function LearningLessonScreen({
  navigation,
  route,
  locationId,
  screenName,
  screenIcon,
  defaultBackgroundColor = "#FFF8E1",
  defaultBorderColor = "#FFB300",
  defaultWelcome,
  autoStartMessage,
  onAfterLessonCompleted,
}) {
  const { loading: lessonsLoading, error: lessonsError } = useLessonCatalog();
  const autoStart = route?.params?.autoStart;
  const lessonId = route?.params?.lessonId ?? getFirstLessonForLocation(locationId)?.id;
  const lesson = getLessonById(lessonId);
  const steps = useMemo(() => buildSteps(lesson), [lesson]);
  const questions = steps.filter((step) => step.type === "question");
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(lesson?.introMessage ?? "");
  const [isCompleting, setIsCompleting] = useState(false);

  const currentStep = steps[stepIndex];
  const currentQuestionIndex = currentStep?.type === "question"
    ? questions.findIndex((question) => question.id === currentStep.id)
    : -1;
  const isLastStep = stepIndex === steps.length - 1;

  useEffect(() => {
    setStepIndex(0);
    setSelectedOptionIndex(null);
    setIsAnswerCorrect(false);
    setFeedbackMessage(lesson?.introMessage ?? "");
    setIsCompleting(false);
  }, [lesson?.id, lesson?.introMessage]);

  useEffect(() => {
    const audioUrl = currentStep?.type === "teaching" ? currentStep.audioUrl : currentStep?.promptAudioUrl;
    if (!audioUrl) return;
    void playCachedAudio(audioUrl);
  }, [currentStep?.audioUrl, currentStep?.promptAudioUrl, currentStep?.type, stepIndex, lesson?.id]);

  const handleCompleteLesson = async () => {
    if (isCompleting || !lesson) return;

    setIsCompleting(true);

    try {
      await markLessonCompleted({ lessonId: lesson.id, locationId });
      if (onAfterLessonCompleted) {
        await onAfterLessonCompleted();
      }

      if (lesson?.mission?.type) {
        await showLessonMissionUnlockNotice(lesson);
        navigation.goBack();
        return;
      }

      await markLocationCompleted(locationId);

      const nextLesson = getNextLessonInLocation(locationId, lesson.id);
      if (nextLesson) {
        navigation.replace(screenName, {
          autoStart: true,
          locationId,
          lessonId: nextLesson.id,
        });
        return;
      }

      navigation.goBack();
    } catch (_error) {
      setIsCompleting(false);
    }
  };

  const handleContinue = () => {
    if (isCompleting || !lesson) return;

    if (isLastStep) {
      void handleCompleteLesson();
      return;
    }

    setStepIndex((prev) => prev + 1);
    setSelectedOptionIndex(null);
    setIsAnswerCorrect(false);
    setFeedbackMessage(lesson.introMessage);
  };

  const handleSelectOption = (optionIndex) => {
    if (isAnswerCorrect || isCompleting || currentStep?.type !== "question") return;

    setSelectedOptionIndex(optionIndex);

    const selectedOption = currentStep.options?.[optionIndex];
    if (selectedOption?.audioUrl) {
      void playCachedAudio(selectedOption.audioUrl);
    }

    if (optionIndex === currentStep.correctIndex) {
      setIsAnswerCorrect(true);
      setFeedbackMessage(currentStep.successMessage);
      return;
    }

    setFeedbackMessage(currentStep.tryAgainMessage);
  };

  if (!lesson && lessonsLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: defaultBackgroundColor, padding: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>Carregando licao...</Text>
      </View>
    );
  }

  if (!lesson || !currentStep) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: defaultBackgroundColor, padding: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>
          {lessonsError ? "Falha ao carregar a licao" : "Licao nao encontrada"}
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Voltar ao mapa"
          style={{ backgroundColor: "#FF7043", borderRadius: 10, paddingVertical: 12, paddingHorizontal: 24 }}
        >
          <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Voltar ao mapa</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderTeachingStep = () => (
    <>
      <View style={{ alignSelf: "center", backgroundColor: "#FFF3CD", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6, marginBottom: 18 }}>
        <Text style={{ color: "#8A5A00", fontWeight: "bold" }}>
          {TYPE_LABELS[currentStep.itemType] ?? "Ensinamento"} {stepIndex + 1} de {steps.length}
        </Text>
      </View>

      <View style={{ backgroundColor: "#F7F9FC", borderRadius: 20, padding: 18, borderWidth: 2, borderColor: "#D8E2EC", marginBottom: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center", color: "#263238", marginBottom: 8 }}>
          {currentStep.text}
        </Text>
        {!!currentStep.translation && (
          <Text style={{ fontSize: 16, textAlign: "center", color: "#607D8B", lineHeight: 22 }}>
            {currentStep.translation}
          </Text>
        )}
        {currentStep.audioUrl && (
          <TouchableOpacity
            onPress={() => void playCachedAudio(currentStep.audioUrl)}
            accessibilityRole="button"
            accessibilityLabel="Ouvir ensinamento"
            style={{
              alignSelf: "center",
              marginTop: 12,
              backgroundColor: "#E3F2FD",
              borderRadius: 12,
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderWidth: 1,
              borderColor: "#90CAF9",
            }}
          >
            <Text style={{ color: "#1E88E5", fontWeight: "bold" }}>Ouvir novamente</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        onPress={handleContinue}
        accessibilityRole="button"
        accessibilityLabel={isLastStep ? "Concluir licao" : "Continuar licao"}
        disabled={isCompleting}
        style={{ backgroundColor: isCompleting ? "#BDBDBD" : "#FF7043", borderRadius: 16, paddingVertical: 14, alignItems: "center" }}
      >
        <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
          {isCompleting ? "Concluindo..." : isLastStep ? "Concluir licao" : "Continuar"}
        </Text>
      </TouchableOpacity>
    </>
  );

  const renderQuestionStep = () => (
    <>
      <View style={{ alignSelf: "center", backgroundColor: "#FFF3CD", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6, marginBottom: 18 }}>
        <Text style={{ color: "#8A5A00", fontWeight: "bold" }}>
          Pergunta {currentQuestionIndex + 1} de {questions.length}
        </Text>
      </View>

      <View style={{ backgroundColor: "#F7F9FC", borderRadius: 20, padding: 18, borderWidth: 2, borderColor: "#D8E2EC", marginBottom: 16 }}>
        <Text style={{ fontSize: 42, textAlign: "center", marginBottom: 8 }}>{currentStep.emoji}</Text>
        <Text style={{ fontSize: 22, fontWeight: "bold", textAlign: "center", color: "#263238", marginBottom: 6 }}>
          {currentStep.prompt}
        </Text>
        <Text style={{ fontSize: 15, textAlign: "center", color: "#607D8B", lineHeight: 22 }}>
          {currentStep.helperText}
        </Text>
        {currentStep.promptAudioUrl && (
          <TouchableOpacity
            onPress={() => void playCachedAudio(currentStep.promptAudioUrl)}
            accessibilityRole="button"
            accessibilityLabel="Ouvir novamente"
            style={{
              alignSelf: "center",
              marginTop: 10,
              backgroundColor: "#E3F2FD",
              borderRadius: 12,
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderWidth: 1,
              borderColor: "#90CAF9",
            }}
          >
            <Text style={{ color: "#1E88E5", fontWeight: "bold" }}>Ouvir novamente</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={{ marginBottom: 16 }}>
        {(currentStep.options ?? []).map((option, optionIndex) => {
          const isSelected = selectedOptionIndex === optionIndex;
          const isCorrectOption = optionIndex === currentStep.correctIndex;
          const isWrongSelection = isSelected && !isAnswerCorrect && !isCorrectOption;
          const isSuccessSelection = isAnswerCorrect && isCorrectOption;

          return (
            <TouchableOpacity
              key={option.label}
              onPress={() => handleSelectOption(optionIndex)}
              accessibilityRole="button"
              accessibilityLabel={`Resposta ${option.label}`}
              disabled={isAnswerCorrect || isCompleting}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: isSuccessSelection ? "#E8F5E9" : isWrongSelection ? "#FFEBEE" : "#FFFFFF",
                borderWidth: 3,
                borderColor: isSuccessSelection ? "#2E7D32" : isWrongSelection ? "#C62828" : option.color,
                borderRadius: 18,
                paddingHorizontal: 16,
                paddingVertical: 14,
                marginBottom: 12,
              }}
            >
              <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: option.color, marginRight: 14 }} />
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "#263238" }}>{option.label}</Text>
              {isSuccessSelection && <Text style={{ marginLeft: "auto", fontSize: 18 }}>OK</Text>}
              {isWrongSelection && <Text style={{ marginLeft: "auto", fontSize: 18 }}>X</Text>}
            </TouchableOpacity>
          );
        })}
      </View>

      <View
        style={{
          backgroundColor: isAnswerCorrect ? "#E8F5E9" : selectedOptionIndex === null ? "#E3F2FD" : "#FFF3E0",
          borderRadius: 16,
          padding: 14,
          marginBottom: 18,
          borderWidth: 1,
          borderColor: isAnswerCorrect ? "#A5D6A7" : selectedOptionIndex === null ? "#90CAF9" : "#FFCC80",
        }}
      >
        <Text style={{ textAlign: "center", color: "#37474F", fontSize: 15, lineHeight: 21 }}>{feedbackMessage}</Text>
      </View>

      {isAnswerCorrect && (
        <TouchableOpacity
          onPress={handleContinue}
          accessibilityRole="button"
          accessibilityLabel={isLastStep ? "Concluir licao" : "Ir para a proxima pergunta"}
          disabled={isCompleting}
          style={{ backgroundColor: isCompleting ? "#BDBDBD" : "#FF7043", borderRadius: 16, paddingVertical: 14, alignItems: "center" }}
        >
          <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
            {isCompleting ? "Concluindo..." : isLastStep ? "Concluir licao" : "Proxima pergunta"}
          </Text>
        </TouchableOpacity>
      )}
    </>
  );

  return (
    <View style={{ flex: 1, backgroundColor: defaultBackgroundColor }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 20 }}>
        <View style={{ backgroundColor: "white", borderRadius: 24, padding: 20, borderWidth: 3, borderColor: defaultBorderColor }}>
          <Text style={{ fontSize: 52, marginBottom: 10, textAlign: "center" }}>{screenIcon}</Text>
          <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 8, textAlign: "center", color: "#E65100" }}>
            {lesson.title}
          </Text>
          <Text style={{ fontSize: 16, color: "#444", textAlign: "center", lineHeight: 22, marginBottom: 14 }}>
            {autoStart ? autoStartMessage : defaultWelcome}
          </Text>

          {currentStep.type === "teaching" ? renderTeachingStep() : renderQuestionStep()}

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Voltar sem concluir"
            style={{ marginTop: 12, paddingVertical: 10, alignItems: "center" }}
          >
            <Text style={{ color: "#6D4C41", fontSize: 14, fontWeight: "bold" }}>Voltar sem concluir</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

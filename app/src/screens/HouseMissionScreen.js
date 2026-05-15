import React, { useMemo, useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { markLocationCompleted, markLessonCompleted } from "../utils/progressStorage";
import { getFirstLessonForLocation, getLessonById, getNextLessonInLocation } from "../data/lessonCatalog";
import { useLessonCatalog } from "../hooks/useLessonCatalog";
import { playCachedAudio } from "../utils/audioPlayer";
import { showLessonMissionUnlockNotice } from "../utils/lessonMissionNotice";

const LOCATION_ID = "house";

export default function HouseMissionScreen({ navigation, route }) {
  const { loading: lessonsLoading, error: lessonsError, version } = useLessonCatalog();
  const autoStart = route?.params?.autoStart;
  const lessonId = route?.params?.lessonId ?? getFirstLessonForLocation(LOCATION_ID)?.id;
  const lesson = useMemo(() => getLessonById(lessonId), [lessonId, version]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(lesson?.introMessage ?? "");
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    setQuestionIndex(0);
    setSelectedOptionIndex(null);
    setIsAnswerCorrect(false);
    setFeedbackMessage(lesson?.introMessage ?? "");
    setIsCompleting(false);
  }, [lesson?.id]);

  const questions = lesson?.questions ?? [];
  const currentQuestion = questions[questionIndex];
  const isLastQuestion = questionIndex === questions.length - 1;

  useEffect(() => {
    if (!currentQuestion?.promptAudioUrl) return;
    void playCachedAudio(currentQuestion.promptAudioUrl);
  }, [currentQuestion?.promptAudioUrl, questionIndex, lesson?.id]);

  const handleSelectOption = (optionIndex) => {
    if (isAnswerCorrect || isCompleting || !currentQuestion) return;

    setSelectedOptionIndex(optionIndex);

    const selectedOption = currentQuestion.options?.[optionIndex];
    if (selectedOption?.audioUrl) {
      void playCachedAudio(selectedOption.audioUrl);
    }

    if (optionIndex === currentQuestion.correctIndex) {
      setIsAnswerCorrect(true);
      setFeedbackMessage(currentQuestion.successMessage);
      return;
    }

    setFeedbackMessage(currentQuestion.tryAgainMessage);
  };

  const handleNextQuestion = () => {
    if (!isAnswerCorrect || isCompleting || !lesson) return;

    if (isLastQuestion) {
      void handleCompleteMission();
      return;
    }

    const nextQuestionIndex = questionIndex + 1;
    setQuestionIndex(nextQuestionIndex);
    setSelectedOptionIndex(null);
    setIsAnswerCorrect(false);
    setFeedbackMessage(lesson.introMessage);
  };

  const handleCompleteMission = async () => {
    if (isCompleting || !lesson) return;

    setIsCompleting(true);

    try {
      await markLessonCompleted({ lessonId: lesson.id, locationId: LOCATION_ID });

      if (lesson?.mission?.type) {
        await showLessonMissionUnlockNotice(lesson);
        navigation.goBack();
        return;
      }

      await markLocationCompleted(LOCATION_ID);

      const nextLesson = getNextLessonInLocation(LOCATION_ID, lesson.id);
      if (nextLesson) {
        navigation.replace("HouseMission", {
          autoStart: true,
          locationId: LOCATION_ID,
          lessonId: nextLesson.id,
        });
        return;
      }

      navigation.goBack();
    } catch (_error) {
      setIsCompleting(false);
    }
  };

  if (!lesson && lessonsLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF3E0", padding: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>Carregando licao...</Text>
      </View>
    );
  }

  if (!lesson || !currentQuestion) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF3E0", padding: 20 }}>
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

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF3E0" }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 20 }}>
        <View style={{ backgroundColor: "white", borderRadius: 24, padding: 20, borderWidth: 3, borderColor: "#FFB300" }}>
          <Text style={{ fontSize: 52, marginBottom: 10, textAlign: "center" }}>🏠</Text>
          <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 8, textAlign: "center", color: "#E65100" }}>
            {lesson.title}
          </Text>
          <Text style={{ fontSize: 16, color: "#444", textAlign: "center", lineHeight: 22, marginBottom: 14 }}>
            {autoStart ? "Licao iniciada! Continue a trilha da Casa." : "Bem-vindo a Casa!"}
          </Text>

          <View style={{ alignSelf: "center", backgroundColor: "#FFF3CD", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6, marginBottom: 18 }}>
            <Text style={{ color: "#8A5A00", fontWeight: "bold" }}>Pergunta {questionIndex + 1} de {questions.length}</Text>
          </View>

          <View style={{ backgroundColor: "#F7F9FC", borderRadius: 20, padding: 18, borderWidth: 2, borderColor: "#D8E2EC", marginBottom: 16 }}>
            <Text style={{ fontSize: 42, textAlign: "center", marginBottom: 8 }}>{currentQuestion.emoji}</Text>
            <Text style={{ fontSize: 22, fontWeight: "bold", textAlign: "center", color: "#263238", marginBottom: 6 }}>{currentQuestion.prompt}</Text>
            <Text style={{ fontSize: 15, textAlign: "center", color: "#607D8B", lineHeight: 22 }}>{currentQuestion.helperText}</Text>
            {currentQuestion.promptAudioUrl && (
              <TouchableOpacity
                onPress={() => void playCachedAudio(currentQuestion.promptAudioUrl)}
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
            {currentQuestion.options.map((option, optionIndex) => {
              const isSelected = selectedOptionIndex === optionIndex;
              const isCorrectOption = optionIndex === currentQuestion.correctIndex;
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
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={{ backgroundColor: isAnswerCorrect ? "#E8F5E9" : selectedOptionIndex === null ? "#E3F2FD" : "#FFF3E0", borderRadius: 16, padding: 14, marginBottom: 18, borderWidth: 1, borderColor: isAnswerCorrect ? "#A5D6A7" : selectedOptionIndex === null ? "#90CAF9" : "#FFCC80" }}>
            <Text style={{ textAlign: "center", color: "#37474F", fontSize: 15, lineHeight: 21 }}>{feedbackMessage}</Text>
          </View>

          {isAnswerCorrect && (
            <TouchableOpacity
              onPress={handleNextQuestion}
              accessibilityRole="button"
              accessibilityLabel={isLastQuestion ? "Concluir licao da casa" : "Ir para a proxima pergunta"}
              disabled={isCompleting}
              style={{ backgroundColor: isCompleting ? "#BDBDBD" : "#FF7043", borderRadius: 16, paddingVertical: 14, alignItems: "center" }}
            >
              <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
                {isCompleting ? "Concluindo..." : isLastQuestion ? "Concluir licao" : "Proxima pergunta"}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Voltar sem concluir" style={{ marginTop: 12, paddingVertical: 10, alignItems: "center" }}>
            <Text style={{ color: "#6D4C41", fontSize: 14, fontWeight: "bold" }}>Voltar sem concluir</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

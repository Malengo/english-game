import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { markLocationCompleted, markSchoolVisited } from "../utils/progressStorage";
import { schoolColorsLesson } from "../data/schoolColorsLesson";

export default function SchoolMissionScreen({ navigation, route }) {
  const autoStart = route?.params?.autoStart;
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(schoolColorsLesson.introMessage);
  const [isCompleting, setIsCompleting] = useState(false);

  const questions = schoolColorsLesson.questions;
  const currentQuestion = questions[questionIndex];
  const isLastQuestion = questionIndex === questions.length - 1;

  const handleSelectOption = (optionIndex) => {
    if (isAnswerCorrect || isCompleting) return;

    setSelectedOptionIndex(optionIndex);

    if (optionIndex === currentQuestion.correctIndex) {
      setIsAnswerCorrect(true);
      setFeedbackMessage(currentQuestion.successMessage);
      return;
    }

    setFeedbackMessage(currentQuestion.tryAgainMessage);
  };

  const handleNextQuestion = () => {
    if (!isAnswerCorrect || isCompleting) return;

    if (isLastQuestion) {
      void handleCompleteMission();
      return;
    }

    const nextQuestionIndex = questionIndex + 1;
    setQuestionIndex(nextQuestionIndex);
    setSelectedOptionIndex(null);
    setIsAnswerCorrect(false);
    setFeedbackMessage(schoolColorsLesson.introMessage);
  };

  const handleCompleteMission = async () => {
    if (isCompleting) return;

    setIsCompleting(true);

    try {
      await markLocationCompleted("school");
      await markSchoolVisited();
      navigation.goBack();
    } catch (_error) {
      setIsCompleting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF8E1" }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 20 }}>
        <View style={{ backgroundColor: "white", borderRadius: 24, padding: 20, borderWidth: 3, borderColor: "#FFB300" }}>
          <Text style={{ fontSize: 52, marginBottom: 10, textAlign: "center" }}>🎨</Text>
          <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 8, textAlign: "center", color: "#E65100" }}>
            {schoolColorsLesson.title}
          </Text>
          <Text style={{ fontSize: 16, color: "#444", textAlign: "center", lineHeight: 22, marginBottom: 14 }}>
            {autoStart
              ? "Tutorial iniciado! Vamos aprender as cores em ingles."
              : "Bem-vindo a Escola!"}
          </Text>

          <View
            style={{
              alignSelf: "center",
              backgroundColor: "#FFF3CD",
              borderRadius: 999,
              paddingHorizontal: 14,
              paddingVertical: 6,
              marginBottom: 18,
            }}
          >
            <Text style={{ color: "#8A5A00", fontWeight: "bold" }}>
              Pergunta {questionIndex + 1} de {questions.length}
            </Text>
          </View>

          <View
            style={{
              backgroundColor: "#F7F9FC",
              borderRadius: 20,
              padding: 18,
              borderWidth: 2,
              borderColor: "#D8E2EC",
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 42, textAlign: "center", marginBottom: 8 }}>{currentQuestion.emoji}</Text>
            <Text style={{ fontSize: 22, fontWeight: "bold", textAlign: "center", color: "#263238", marginBottom: 6 }}>
              {currentQuestion.prompt}
            </Text>
            <Text style={{ fontSize: 15, textAlign: "center", color: "#607D8B", lineHeight: 22 }}>
              {currentQuestion.helperText}
            </Text>
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
                  <View
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 13,
                      backgroundColor: option.color,
                      marginRight: 14,
                    }}
                  />
                  <Text style={{ fontSize: 18, fontWeight: "bold", color: "#263238" }}>{option.label}</Text>
                  {isSuccessSelection && <Text style={{ marginLeft: "auto", fontSize: 18 }}>✅</Text>}
                  {isWrongSelection && <Text style={{ marginLeft: "auto", fontSize: 18 }}>❌</Text>}
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
            <Text style={{ textAlign: "center", color: "#37474F", fontSize: 15, lineHeight: 21 }}>
              {feedbackMessage}
            </Text>
          </View>

          {isAnswerCorrect && (
            <TouchableOpacity
              onPress={handleNextQuestion}
              accessibilityRole="button"
              accessibilityLabel={isLastQuestion ? "Concluir lição de cores" : "Ir para a próxima pergunta"}
              disabled={isCompleting}
              style={{
                backgroundColor: isCompleting ? "#BDBDBD" : "#FF7043",
                borderRadius: 16,
                paddingVertical: 14,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
                {isCompleting ? "Concluindo..." : isLastQuestion ? "Concluir lição" : "Próxima pergunta"}
              </Text>
            </TouchableOpacity>
          )}

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

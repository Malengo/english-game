import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { getLessonMissionById } from "../data/lessonMissionCatalog";
import { markLessonMissionCompleted } from "../utils/progressStorage";

const ICON_EMOJI_MAP = {
  bed: "🛏️",
  chair: "🪑",
  lamp: "💡",
  table: "🪟",
};

function getIconEmoji(iconName, fallback = "❔") {
  if (!iconName) return fallback;
  return ICON_EMOJI_MAP[iconName] ?? fallback;
}

export default function LessonMissionScreen({ navigation, route }) {
  const missionId = route?.params?.missionId ?? null;
  const mission = useMemo(() => (missionId ? getLessonMissionById(missionId) : null), [missionId]);
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedWords, setSelectedWords] = useState([]);
  const [feedbackMessage, setFeedbackMessage] = useState(
    mission?.feedbackRules?.guideMessage ?? "Missao iniciada."
  );
  const [isCompleting, setIsCompleting] = useState(false);

  if (!mission) {
    return (
      <View style={{ flex: 1, backgroundColor: "#FFF8E1", justifyContent: "center", alignItems: "center", padding: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 12 }}>Missao nao encontrada</Text>
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

  const handleCompleteMission = async () => {
    if (isCompleting) return;

    setIsCompleting(true);

    try {
      await markLessonMissionCompleted(mission.missionId);
      setFeedbackMessage(mission.feedbackRules?.completionMessage ?? "Missao concluida!");
    } catch (_error) {
      setIsCompleting(false);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const renderMatching = () => {
    const pairs = mission.target?.pairs ?? [];
    const currentPair = pairs[stepIndex];
    const options = pairs.map((pair) => pair.word);

    if (pairs.length === 0) {
      return (
        <Text style={{ textAlign: "center", color: "#444" }}>
          Esta missao ainda nao tem pares configurados.
        </Text>
      );
    }

    const handleSelect = async (word) => {
      if (isCompleting) return;

      if (word === currentPair?.word) {
        setFeedbackMessage(mission.feedbackRules?.correctMessage ?? "Muito bem!");

        if (stepIndex >= pairs.length - 1) {
          await handleCompleteMission();
          return;
        }

        setStepIndex((prev) => prev + 1);
        return;
      }

      setFeedbackMessage(mission.feedbackRules?.wrongMessage ?? "Tente novamente.");
    };

    return (
      <View style={{ width: "100%" }}>
        <Text style={{ fontSize: 18, fontWeight: "bold", textAlign: "center", marginBottom: 12 }}>
          {mission.title}
        </Text>
        <Text style={{ fontSize: 64, textAlign: "center", marginBottom: 16 }}>
          {getIconEmoji(currentPair?.iconName)}
        </Text>
        {options.map((word) => (
          <TouchableOpacity
            key={word}
            onPress={() => handleSelect(word)}
            accessibilityRole="button"
            accessibilityLabel={`Opcao ${word}`}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderWidth: 2,
              borderColor: "#FFCC80",
              marginBottom: 10,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "bold", textAlign: "center", color: "#263238" }}>{word}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderSentence = () => {
    const targetSentence = mission.target?.sentence ?? "";
    const targetWords = targetSentence.split(" ").filter(Boolean);
    const options = mission.target?.options ?? [];

    const handleSelectWord = async (word) => {
      if (isCompleting) return;

      const nextWords = [...selectedWords, word];
      setSelectedWords(nextWords);

      if (nextWords.length < targetWords.length) return;

      const isCorrect = nextWords.join(" ") === targetSentence;
      if (isCorrect) {
        setFeedbackMessage(mission.feedbackRules?.correctMessage ?? "Muito bem!");
        await handleCompleteMission();
        return;
      }

      setFeedbackMessage(mission.feedbackRules?.wrongMessage ?? "Tente novamente.");
    };

    const handleReset = () => {
      setSelectedWords([]);
      setFeedbackMessage(mission.feedbackRules?.guideMessage ?? "Monte a frase correta.");
    };

    return (
      <View style={{ width: "100%" }}>
        <Text style={{ fontSize: 18, fontWeight: "bold", textAlign: "center", marginBottom: 12 }}>
          {mission.title}
        </Text>
        <View
          style={{
            backgroundColor: "#F7F9FC",
            borderRadius: 16,
            padding: 14,
            borderWidth: 2,
            borderColor: "#D8E2EC",
            marginBottom: 12,
            minHeight: 60,
            justifyContent: "center",
          }}
        >
          <Text style={{ textAlign: "center", fontSize: 16, fontWeight: "bold" }}>
            {selectedWords.join(" ") || "..."}
          </Text>
        </View>
        {options.map((word) => (
          <TouchableOpacity
            key={word}
            onPress={() => handleSelectWord(word)}
            accessibilityRole="button"
            accessibilityLabel={`Selecionar ${word}`}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderWidth: 2,
              borderColor: "#90CAF9",
              marginBottom: 10,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "bold", textAlign: "center", color: "#263238" }}>{word}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          onPress={handleReset}
          accessibilityRole="button"
          accessibilityLabel="Limpar frase"
          style={{
            backgroundColor: "#FFE0B2",
            borderRadius: 16,
            paddingVertical: 10,
            paddingHorizontal: 16,
            marginTop: 6,
          }}
        >
          <Text style={{ textAlign: "center", fontWeight: "bold", color: "#6D4C41" }}>Limpar</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderListening = () => {
    const options = mission.spawnRules?.options ?? [];
    const expectedLabel = mission.target?.expectedLabel;

    if (options.length === 0) {
      return (
        <Text style={{ textAlign: "center", color: "#444" }}>
          Esta missao ainda nao tem opcoes configuradas.
        </Text>
      );
    }

    const handleSelect = async (label) => {
      if (isCompleting) return;

      if (label === expectedLabel) {
        setFeedbackMessage(mission.feedbackRules?.correctMessage ?? "Muito bem!");
        await handleCompleteMission();
        return;
      }

      setFeedbackMessage(mission.feedbackRules?.wrongMessage ?? "Tente novamente.");
    };

    return (
      <View style={{ width: "100%" }}>
        <Text style={{ fontSize: 18, fontWeight: "bold", textAlign: "center", marginBottom: 12 }}>
          {mission.title}
        </Text>
        <TouchableOpacity
          onPress={() => setFeedbackMessage("Audio reproduzido. Escolha o objeto correto.")}
          accessibilityRole="button"
          accessibilityLabel="Ouvir audio"
          style={{
            backgroundColor: "#E3F2FD",
            borderRadius: 16,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderWidth: 2,
            borderColor: "#90CAF9",
            marginBottom: 12,
          }}
        >
          <Text style={{ textAlign: "center", fontWeight: "bold", color: "#1E88E5" }}>Ouca</Text>
        </TouchableOpacity>
        {options.map((option) => (
          <TouchableOpacity
            key={option.label}
            onPress={() => handleSelect(option.label)}
            accessibilityRole="button"
            accessibilityLabel={`Opcao ${option.label}`}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderWidth: 2,
              borderColor: "#FFCC80",
              marginBottom: 10,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "bold", textAlign: "center", color: "#263238" }}>
              {getIconEmoji(option.iconName)} {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderMissionBody = () => {
    if (mission.type === "matching") return renderMatching();
    if (mission.type === "sentence") return renderSentence();
    if (mission.type === "listening") return renderListening();

    return (
      <Text style={{ textAlign: "center", color: "#444" }}>
        Este tipo de missao ainda nao esta disponivel.
      </Text>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF8E1", padding: 20, justifyContent: "center" }}>
      <View
        style={{
          backgroundColor: "white",
          borderRadius: 24,
          padding: 20,
          borderWidth: 3,
          borderColor: "#FFB300",
        }}
      >
        {renderMissionBody()}
        <View
          style={{
            backgroundColor: "#FFF3E0",
            borderRadius: 16,
            padding: 12,
            marginTop: 12,
            borderWidth: 1,
            borderColor: "#FFCC80",
          }}
        >
          <Text style={{ textAlign: "center", color: "#6D4C41" }}>{feedbackMessage}</Text>
        </View>

        {isCompleting && (
          <TouchableOpacity
            onPress={handleGoBack}
            accessibilityRole="button"
            accessibilityLabel="Voltar ao mapa"
            style={{
              marginTop: 16,
              backgroundColor: "#FF7043",
              borderRadius: 16,
              paddingVertical: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Voltar ao mapa</Text>
          </TouchableOpacity>
        )}

        {!isCompleting && (
          <TouchableOpacity
            onPress={handleGoBack}
            accessibilityRole="button"
            accessibilityLabel="Voltar sem concluir"
            style={{
              marginTop: 12,
              paddingVertical: 10,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#6D4C41", fontSize: 14, fontWeight: "bold" }}>Voltar sem concluir</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}


import { Alert } from "react-native";

export function showLessonMissionUnlockNotice(lesson) {
  if (!lesson?.mission?.type) {
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    Alert.alert(
      "Missao desbloqueada",
      "Converse com o mage para iniciar a missao.",
      [{ text: "Entendi", onPress: () => resolve(true) }],
      { cancelable: true, onDismiss: () => resolve(true) }
    );
  });
}

void showLessonMissionUnlockNotice;


import React from "react";
import LearningLessonScreen from "./LearningLessonScreen";

const LOCATION_ID = "bakery";

export default function BakeryMissionScreen({ navigation, route }) {
  return (
    <LearningLessonScreen
      navigation={navigation}
      route={route}
      locationId={LOCATION_ID}
      screenName="BakeryMission"
      screenIcon="ðŸ¥"
      defaultBackgroundColor="#FFF8E1"
      defaultBorderColor="#FFB300"
      defaultWelcome="Bem-vindo a Padaria!"
      autoStartMessage="Licao iniciada! Continue a trilha da Padaria."
    />
  );
}


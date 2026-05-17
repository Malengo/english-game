import React from "react";
import LearningLessonScreen from "./LearningLessonScreen";

const LOCATION_ID = "house";

export default function HouseMissionScreen({ navigation, route }) {
  return (
    <LearningLessonScreen
      navigation={navigation}
      route={route}
      locationId={LOCATION_ID}
      screenName="HouseMission"
      screenIcon={"\uD83C\uDFE0"}
      defaultBackgroundColor="#FFF3E0"
      defaultBorderColor="#FFB300"
      defaultWelcome="Bem-vindo a Casa!"
      autoStartMessage="Licao iniciada! Continue a trilha da Casa."
    />
  );
}

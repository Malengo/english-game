import React from "react";
import LearningLessonScreen from "./LearningLessonScreen";
import { markSchoolVisited } from "../utils/progressStorage";

const LOCATION_ID = "school";

export default function SchoolMissionScreen({ navigation, route }) {
  return (
    <LearningLessonScreen
      navigation={navigation}
      route={route}
      locationId={LOCATION_ID}
      screenName="SchoolMission"
      screenIcon={"\uD83C\uDFA8"}
      defaultBackgroundColor="#FFF8E1"
      defaultBorderColor="#FFB300"
      defaultWelcome="Bem-vindo a Escola!"
      autoStartMessage="Licao iniciada! Continue a trilha da Escola."
      onAfterLessonCompleted={() => markSchoolVisited()}
    />
  );
}

import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import LearningLessonScreen from "../LearningLessonScreen";
import { playCachedAudio } from "../../utils/audioPlayer";

jest.mock("../../hooks/useLessonCatalog", () => ({
  useLessonCatalog: () => ({ loading: false, error: null, version: 1 }),
}));

jest.mock("../../data/lessonCatalog", () => ({
  getFirstLessonForLocation: jest.fn(() => ({ id: "lesson-with-steps" })),
  getLessonById: jest.fn(() => ({
    id: "lesson-with-steps",
    title: "Colors",
    introMessage: "Vamos aprender.",
    steps: [
      {
        id: "teach-red",
        type: "teaching",
        itemType: "VOCABULARY",
        text: "Red",
        translation: "Vermelho",
        audioUrl: "https://example.test/red.mp3",
      },
      {
        id: "question-red",
        type: "question",
        emoji: "apple",
        prompt: "What color is the apple?",
        helperText: "Apple significa maca.",
        options: [
          { label: "Red", color: "#E53935", audioUrl: "https://example.test/red-option.mp3" },
          { label: "Blue", color: "#1E88E5" },
        ],
        correctIndex: 0,
        successMessage: "Isso!",
        tryAgainMessage: "Tente novamente.",
      },
    ],
  })),
  getNextLessonInLocation: jest.fn(() => null),
}));

jest.mock("../../utils/audioPlayer", () => ({
  playCachedAudio: jest.fn(),
}));

jest.mock("../../utils/progressStorage", () => ({
  markLessonCompleted: jest.fn(),
  markLocationCompleted: jest.fn(),
}));

jest.mock("../../utils/lessonMissionNotice", () => ({
  showLessonMissionUnlockNotice: jest.fn(),
}));

describe("LearningLessonScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("mostra ensinamento com audio antes da pergunta", async () => {
    const navigation = { goBack: jest.fn(), replace: jest.fn() };
    const { getByText, getByLabelText } = render(
      <LearningLessonScreen
        navigation={navigation}
        route={{ params: {} }}
        locationId="school"
        screenName="SchoolMission"
        screenIcon="icon"
        defaultWelcome="Bem-vindo"
        autoStartMessage="Continue"
      />
    );

    expect(getByText("Red")).toBeTruthy();
    expect(getByText("Vermelho")).toBeTruthy();

    await waitFor(() => {
      expect(playCachedAudio).toHaveBeenCalledWith("https://example.test/red.mp3");
    });

    fireEvent.press(getByLabelText("Continuar licao"));

    expect(getByText("What color is the apple?")).toBeTruthy();
    fireEvent.press(getByLabelText("Resposta Red"));

    expect(getByText("Isso!")).toBeTruthy();
    expect(playCachedAudio).toHaveBeenCalledWith("https://example.test/red-option.mp3");
  });
});


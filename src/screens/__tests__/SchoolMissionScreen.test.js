import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import SchoolMissionScreen from "../SchoolMissionScreen";
import { markLocationCompleted, markSchoolVisited, markLessonCompleted } from "../../utils/progressStorage";
import { schoolColorsLesson } from "../../data/schoolColorsLesson";

jest.mock("../../utils/progressStorage", () => ({
  markLocationCompleted: jest.fn(),
  markSchoolVisited: jest.fn(),
  markLessonCompleted: jest.fn(),
}));

describe("SchoolMissionScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    markLocationCompleted.mockResolvedValue({ completedLocationIds: ["school"] });
    markLessonCompleted.mockResolvedValue({
      lessonCompletions: [{ lessonId: schoolColorsLesson.id, locationId: "school" }],
    });
    markSchoolVisited.mockResolvedValue({
      completedLocationIds: ["school"],
      lastSchoolVisit: "2026-04-28T00:00:00.000Z",
    });
  });

  function renderScreen(routeParams = {}) {
    const navigation = { goBack: jest.fn() };
    const route = { params: routeParams };

    const utils = render(<SchoolMissionScreen navigation={navigation} route={route} />);
    return { ...utils, navigation };
  }

  it("mostra o tutorial de cores quando autoStart for true", () => {
    const { getByText } = renderScreen({ autoStart: true });

    expect(getByText(/Vamos aprender as cores em ingles/i)).toBeTruthy();
    expect(getByText("Qual cor e a apple?")).toBeTruthy();
  });

  it("mostra texto padrao quando autoStart nao for informado", () => {
    const { getByText } = renderScreen();

    expect(getByText("Bem-vindo a Escola!")).toBeTruthy();
  });

  it("mostra feedback quando a resposta esta errada e permite tentar de novo", () => {
    const { getByText, getByLabelText, queryByText } = renderScreen({ autoStart: true });

    fireEvent.press(getByLabelText("Resposta Blue"));

    expect(getByText("Quase! Tente outra vez.")).toBeTruthy();
    expect(queryByText("Próxima pergunta")).toBeNull();
    expect(markLocationCompleted).not.toHaveBeenCalled();
    expect(markSchoolVisited).not.toHaveBeenCalled();
  });

  it("avanca por todas as perguntas e conclui a licao", async () => {
    const { getByLabelText, getByText, navigation } = renderScreen({ autoStart: true });

    fireEvent.press(getByLabelText("Resposta Red"));
    fireEvent.press(getByText("Próxima pergunta"));

    expect(getByText("Qual cor e o sky?")).toBeTruthy();

    fireEvent.press(getByLabelText("Resposta Blue"));
    fireEvent.press(getByText("Próxima pergunta"));

    expect(getByText("Qual cor e a banana?")).toBeTruthy();

    fireEvent.press(getByLabelText("Resposta Yellow"));
    fireEvent.press(getByText("Concluir lição"));

    await waitFor(() => {
      expect(markLocationCompleted).toHaveBeenCalledWith("school");
      expect(markLessonCompleted).toHaveBeenCalledWith({ lessonId: schoolColorsLesson.id, locationId: "school" });
      expect(markSchoolVisited).toHaveBeenCalledTimes(1);
      expect(navigation.goBack).toHaveBeenCalledTimes(1);
    });
  });

  it("volta sem concluir", () => {
    const { getByText, navigation } = renderScreen();

    fireEvent.press(getByText("Voltar sem concluir"));

    expect(markLocationCompleted).not.toHaveBeenCalled();
    expect(markSchoolVisited).not.toHaveBeenCalled();
    expect(navigation.goBack).toHaveBeenCalledTimes(1);
  });
});

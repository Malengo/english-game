import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import SchoolMissionScreen from "../SchoolMissionScreen";
import { markLocationCompleted, markSchoolVisited } from "../../utils/progressStorage";

jest.mock("../../utils/progressStorage", () => ({
  markLocationCompleted: jest.fn(),
  markSchoolVisited: jest.fn(),
}));

describe("SchoolMissionScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    markLocationCompleted.mockResolvedValue({ completedLocationIds: ["school"] });
    markSchoolVisited.mockResolvedValue({ completedLocationIds: ["school"], lastSchoolVisit: "2026-04-28T00:00:00.000Z" });
  });

  function renderScreen(routeParams = {}) {
    const navigation = { goBack: jest.fn() };
    const route = { params: routeParams };

    const utils = render(<SchoolMissionScreen navigation={navigation} route={route} />);
    return { ...utils, navigation };
  }

  it("mostra texto de tutorial quando autoStart for true", () => {
    const { getByText } = renderScreen({ autoStart: true });

    expect(getByText(/Tutorial iniciado!/i)).toBeTruthy();
  });

  it("mostra texto padrao quando autoStart nao for informado", () => {
    const { getByText } = renderScreen();

    expect(getByText("Bem-vindo a Escola!")).toBeTruthy();
  });

  it("conclui missao e volta ao mapa", async () => {
    const { getByText, navigation } = renderScreen({ autoStart: true });

    fireEvent.press(getByText("Concluir e voltar"));

    await waitFor(() => {
      expect(markLocationCompleted).toHaveBeenCalledWith("school");
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


import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";

const mockLoadProgress = jest.fn();
let mockLocations = [];

jest.mock("../../data/locationConfig", () => ({
  get locations() {
    return mockLocations;
  },
}));

jest.mock("../../utils/progressStorage", () => ({
  loadProgress: (...args) => mockLoadProgress(...args),
  markSchoolVisited: () => Promise.resolve(),
  markLessonMissionCompleted: () => Promise.resolve(),
  getLatestLessonCompletion: () => null,
  hasCompletedLessonMission: () => false,
}));

jest.mock("../../data/npcConfig", () => ({
  npcConfigs: [],
}));

jest.mock("../../components/Player", () => {
  return function MockPlayer() {
    return null;
  };
});

jest.mock("../../components/Npc", () => {
  return function MockNpc() {
    return null;
  };
});

jest.mock("../../components/FloatingJoystick", () => {
  return function MockFloatingJoystick() {
    return null;
  };
});

jest.mock("../../components/PlayerDialog", () => {
  return function MockPlayerDialog() {
    return null;
  };
});

jest.mock("@react-navigation/native", () => {
  const actual = jest.requireActual("@react-navigation/native");
  const React = require("react");
  return {
    ...actual,
    useFocusEffect: (callback) => {
      React.useEffect(() => callback(), [callback]);
    },
  };
});

const MapScreen = require("../MapScreen").default;

describe("MapScreen integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLoadProgress.mockResolvedValue({ completedLocationIds: [] });
  });

  it("abre modal de local desbloqueado e navega ao continuar", async () => {
    mockLocations = [
      {
        id: "test-school",
        name: "Escola Teste",
        emoji: "📚",
        tileX: 56,
        tileY: 53,
        width: 80,
        height: 80,
        screenRoute: "SchoolMission",
        stageRequired: 1,
        description: "Descricao da escola teste",
      },
    ];

    const navigation = { navigate: jest.fn() };
    const { getByText } = render(<MapScreen navigation={navigation} />);

    await waitFor(() => {
      expect(getByText("Escola Teste")).toBeTruthy();
    });

    fireEvent.press(getByText("Continuar"));

    expect(navigation.navigate).toHaveBeenCalledWith("SchoolMission", {
      autoStart: true,
      locationId: "test-school",
    });
  });

  it("abre modal de local bloqueado quando stage ainda nao foi liberado", async () => {
    mockLocations = [
      {
        id: "test-house",
        name: "Casa Teste",
        emoji: "🏠",
        tileX: 56,
        tileY: 53,
        width: 80,
        height: 80,
        screenRoute: "HouseMission",
        stageRequired: 2,
        description: "Descricao da casa teste",
      },
    ];

    const navigation = { navigate: jest.fn() };
    const { getByText, queryByText } = render(<MapScreen navigation={navigation} />);

    await waitFor(() => {
      expect(getByText("Casa Teste bloqueado")).toBeTruthy();
    });

    fireEvent.press(getByText("Entendi"));

    await waitFor(() => {
      expect(queryByText("Casa Teste bloqueado")).toBeNull();
    });

    expect(navigation.navigate).not.toHaveBeenCalled();
  });
});


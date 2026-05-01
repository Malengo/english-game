import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import BakeryMissionScreen from "../BakeryMissionScreen";

describe("BakeryMissionScreen", () => {
  function renderScreen(routeParams = {}) {
    const navigation = { goBack: jest.fn() };
    const route = { params: routeParams };

    const utils = render(<BakeryMissionScreen navigation={navigation} route={route} />);
    return { ...utils, navigation };
  }

  it("mostra texto de licao iniciada quando autoStart for true", () => {
    const { getByText } = renderScreen({ autoStart: true });

    expect(getByText(/Licao iniciada!/i)).toBeTruthy();
  });

  it("mostra texto padrao sem autoStart", () => {
    const { getByText } = renderScreen();

    expect(getByText("Bem-vindo a Padaria!")).toBeTruthy();
  });

  it("volta ao mapa ao pressionar botao", () => {
    const { getByText, navigation } = renderScreen();

    fireEvent.press(getByText("Voltar ao mapa"));

    expect(navigation.goBack).toHaveBeenCalledTimes(1);
  });
});

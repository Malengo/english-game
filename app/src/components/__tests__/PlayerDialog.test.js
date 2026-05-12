import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import PlayerDialog from "../PlayerDialog";

describe("PlayerDialog", () => {
  it("aciona CTA e fecha dialogo quando ha onClose", () => {
    const onPressCta = jest.fn();
    const onClose = jest.fn();
    const { getByLabelText } = render(
      <PlayerDialog
        visible={true}
        message="Teste"
        ctaLabel="Ir para Escola"
        onPressCta={onPressCta}
        onClose={onClose}
      />
    );

    fireEvent.press(getByLabelText("Ir para Escola"));

    expect(onPressCta).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

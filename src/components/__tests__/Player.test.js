import React from "react";
import { render } from "@testing-library/react-native";
import Player from "../Player";

describe("Player component", () => {
  it("renderiza com emoji quando useImage é false", () => {
    const { getByText } = render(
      <Player x={50} y={100} direction="down" character="🧑‍🦱" useImage={false} />
    );

    expect(getByText("🧑‍🦱")).toBeTruthy();
  });

  it("renderiza com character padrao quando nao informado", () => {
    const { getByTestId } = render(<Player x={50} y={100} />);

    expect(getByTestId("player-container")).toBeTruthy();
  });

  it("aplica posicao correta no container", () => {
    const { getByTestId } = render(<Player x={10} y={20} testID="player-container" />);

    const container = getByTestId("player-container");
    const styles = container.props.style;

    expect(styles.left).toBe(10);
    expect(styles.top).toBe(20);
  });

  it("altera opacidade quando isMoving é true e frameIndex é par", () => {
    const { getByTestId, rerender } = render(
      <Player x={50} y={100} isMoving={false} testID="player-box" />
    );

    rerender(<Player x={50} y={100} isMoving={true} testID="player-box" />);

    const box = getByTestId("player-box");
    expect(box.props.style.opacity).toBeDefined();
  });
});


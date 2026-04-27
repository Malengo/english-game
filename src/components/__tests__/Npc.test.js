import React from "react";
import { render } from "@testing-library/react-native";
import Npc from "../Npc";

describe("Npc component", () => {
  it("renderiza container na posicao esperada", () => {
    const { getByTestId } = render(
      <Npc x={100} y={120} direction="right" isMoving={false} testID="npc-box" />
    );

    const container = getByTestId("npc-box");
    const style = container.props.style;

    expect(style.left).toBe(100);
    expect(style.top).toBe(120);
  });
});


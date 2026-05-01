import React from "react";
import { render } from "@testing-library/react-native";
import Collectible from "../Collectible";

describe("Collectible", () => {
  it("posiciona o item no mapa e expoe label acessivel", () => {
    const { getByTestId, getByLabelText } = render(
      <Collectible
        testID="collectible"
        collectible={{
          id: "item-1",
          type: "balloon",
          label: "Balao Blue",
          color: "#1E88E5",
          x: 120,
          y: 220,
          width: 40,
          height: 40,
        }}
      />
    );

    const root = getByTestId("collectible");

    expect(getByLabelText("Balao Blue")).toBeTruthy();
    expect(root.props.style.left).toBe(120);
    expect(root.props.style.top).toBe(220);
  });
});

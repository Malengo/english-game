import React from "react";
import { render } from "@testing-library/react-native";
import ColoredBalloon from "../ColoredBalloon";

describe("ColoredBalloon", () => {
  it("usa a cor recebida no corpo e no no do balao", () => {
    const { getByTestId } = render(<ColoredBalloon color="#1E88E5" testID="blue-balloon" />);

    const root = getByTestId("blue-balloon");
    const body = root.props.children[0];
    const knot = root.props.children[1];

    expect(body.props.style.backgroundColor).toBe("#1E88E5");
    expect(knot.props.style.borderTopColor).toBe("#1E88E5");
  });
});

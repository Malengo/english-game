import React from "react";
import { Text, View } from "react-native";
import ColoredBalloon from "./ColoredBalloon";

export default function Collectible({ collectible, testID }) {
  if (!collectible) return null;

  const width = collectible.width ?? 40;
  const height = collectible.height ?? 40;

  return (
    <View
      testID={testID}
      accessibilityRole="image"
      accessibilityLabel={collectible.label}
      style={{
        position: "absolute",
        left: collectible.x,
        top: collectible.y,
        width,
        height,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {collectible.type === "balloon" ? (
        <ColoredBalloon color={collectible.color} width={width} height={height} />
      ) : (
        <Text style={{ fontSize: Math.round(Math.min(width, height) * 0.6) }}>
          {collectible.emoji ?? "•"}
        </Text>
      )}
    </View>
  );
}

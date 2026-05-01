import React from "react";
import { View } from "react-native";

export default function ColoredBalloon({ color, width = 40, height = 40, testID }) {
  const balloonWidth = Math.round(width * 0.72);
  const balloonHeight = Math.round(height * 0.82);
  const knotSize = Math.max(5, Math.round(width * 0.14));

  return (
    <View
      testID={testID}
      style={{
        width,
        height,
        alignItems: "center",
        justifyContent: "flex-start",
      }}
    >
      <View
        style={{
          width: balloonWidth,
          height: balloonHeight,
          borderRadius: balloonWidth / 2,
          backgroundColor: color,
          borderWidth: 2,
          borderColor: "rgba(0,0,0,0.18)",
          shadowColor: "#000",
          shadowOpacity: 0.22,
          shadowRadius: 3,
          shadowOffset: { width: 0, height: 2 },
          elevation: 3,
        }}
      >
        <View
          style={{
            position: "absolute",
            left: Math.round(balloonWidth * 0.22),
            top: Math.round(balloonHeight * 0.16),
            width: Math.max(6, Math.round(balloonWidth * 0.22)),
            height: Math.max(10, Math.round(balloonHeight * 0.26)),
            borderRadius: 999,
            backgroundColor: "rgba(255,255,255,0.45)",
          }}
        />
      </View>
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: knotSize,
          borderRightWidth: knotSize,
          borderTopWidth: knotSize + 1,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderTopColor: color,
          marginTop: -1,
        }}
      />
    </View>
  );
}

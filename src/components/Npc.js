import React, { useEffect, useMemo, useState } from "react";
import { Image, View } from "react-native";

const DEFAULT_SPRITE = {
  source: require("../../assets/images/npc/mage-SWEN.png"),
  sheetWidth: 96,
  sheetHeight: 128,
  cols: 3,
  rows: 4,
  displayWidth: 32,
  displayHeight: 32,
  hitboxSize: 32,
  idleFrame: 1,
  directionRows: {
    up: 0,
    right: 1,
    down: 2,
    left: 3,
  },
};

export default function Npc({
  x,
  y,
  direction = "down",
  isMoving = false,
  sprite = DEFAULT_SPRITE,
  testID = "npc-container",
}) {
  const [frameIndex, setFrameIndex] = useState(sprite.idleFrame ?? 1);

  useEffect(() => {
    const idleFrame = sprite.idleFrame ?? 1;

    if (!isMoving) {
      setFrameIndex(idleFrame);
      return;
    }

    const walkFrames = [0, 1, 2, 1];
    let step = 0;
    setFrameIndex(walkFrames[step]);

    const animationInterval = setInterval(() => {
      step = (step + 1) % walkFrames.length;
      setFrameIndex(walkFrames[step]);
    }, 90);

    return () => clearInterval(animationInterval);
  }, [isMoving, sprite.idleFrame]);

  const frame = useMemo(() => {
    const cols = sprite.cols ?? 3;
    const rows = sprite.rows ?? 4;
    const frameWidth = (sprite.sheetWidth ?? 96) / cols;
    const frameHeight = (sprite.sheetHeight ?? 128) / rows;
    const displayWidth = sprite.displayWidth ?? DEFAULT_SPRITE.displayWidth;
    const displayHeight = sprite.displayHeight ?? DEFAULT_SPRITE.displayHeight;
    const hitboxSize = sprite.hitboxSize ?? DEFAULT_SPRITE.hitboxSize;
    const directionRows = sprite.directionRows ?? DEFAULT_SPRITE.directionRows;
    const rowIndex = directionRows[direction] ?? directionRows.down ?? 2;

    return {
      cols,
      rows,
      frameWidth,
      frameHeight,
      displayWidth,
      displayHeight,
      hitboxSize,
      rowIndex,
    };
  }, [direction, sprite]);

  const scaleX = frame.displayWidth / frame.frameWidth;
  const scaleY = frame.displayHeight / frame.frameHeight;
  const offsetX = -frameIndex * frame.frameWidth * scaleX;
  const offsetY = -frame.rowIndex * frame.frameHeight * scaleY;

  return (
    <View
      testID={testID}
      style={{
        position: "absolute",
        left: x - (frame.displayWidth - frame.hitboxSize) / 2,
        top: y - (frame.displayHeight - frame.hitboxSize),
        width: frame.displayWidth,
        height: frame.displayHeight,
        overflow: "hidden",
      }}
    >
      <Image
        source={sprite.source}
        style={{
          width: (sprite.sheetWidth ?? 96) * scaleX,
          height: (sprite.sheetHeight ?? 128) * scaleY,
          marginLeft: offsetX,
          marginTop: offsetY,
        }}
      />
    </View>
  );
}


import React, { useEffect, useMemo, useState } from "react";
import { Image, View } from "react-native";

const DEFAULT_SPRITE = {
  source: require("../../assets/images/npc/mage-SWEN.png"),
  // Updated sprite: each frame is 48x64 (cols x rows remain 3x4)
  sheetWidth: 144, // 3 * 48
  sheetHeight: 256, // 4 * 64
  cols: 3,
  rows: 4,
  displayWidth: 48,
  displayHeight: 64,
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
  sprite,
  testID = "npc-container",
}) {
  // Merge com DEFAULT_SPRITE para garantir todas as propriedades
  const mergedSprite = useMemo(
    () => ({ ...DEFAULT_SPRITE, ...(sprite || {}) }),
    [sprite]
  );

  const [frameIndex, setFrameIndex] = useState(mergedSprite.idleFrame ?? 1);

  useEffect(() => {
    const idleFrame = mergedSprite.idleFrame ?? 1;

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
  }, [isMoving, mergedSprite.idleFrame]);

  const frame = useMemo(() => {
    const cols = mergedSprite.cols ?? 3;
    const rows = mergedSprite.rows ?? 4;
    const frameWidth = (mergedSprite.sheetWidth ?? 96) / cols;
    const frameHeight = (mergedSprite.sheetHeight ?? 128) / rows;
    const displayWidth = mergedSprite.displayWidth ?? DEFAULT_SPRITE.displayWidth;
    const displayHeight = mergedSprite.displayHeight ?? DEFAULT_SPRITE.displayHeight;
    const hitboxSize = mergedSprite.hitboxSize ?? DEFAULT_SPRITE.hitboxSize;
    const directionRows = mergedSprite.directionRows ?? DEFAULT_SPRITE.directionRows;
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
  }, [direction, mergedSprite]);

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
        source={mergedSprite.source}
        style={{
          width: (mergedSprite.sheetWidth ?? 96) * scaleX,
          height: (mergedSprite.sheetHeight ?? 128) * scaleY,
          marginLeft: offsetX,
          marginTop: offsetY,
        }}
      />
    </View>
  );
}


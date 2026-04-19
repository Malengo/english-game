import React, { useMemo, useState } from "react";
import { PanResponder, View, Dimensions } from "react-native";

function clampToRadius(dx, dy, maxRadius) {
    const distance = Math.hypot(dx, dy);

    if (distance <= maxRadius) {
        return { x: dx, y: dy };
    }

    const factor = maxRadius / distance;
    return { x: dx * factor, y: dy * factor };
}

export default function FloatingJoystick({ onMove }) {
    const [thumbOffset, setThumbOffset] = useState({ x: 0, y: 0 });

    const baseSize = 110;
    const thumbSize = 44;
    const maxRadius = (baseSize - thumbSize) / 2;
    const deadZone = 0.1;

    // Base position constants (must match MapScreen placement)
    const BASE_LEFT = 24;
    const BASE_BOTTOM = 28;
    const window = Dimensions.get("window");
    // Calculate absolute center of the joystick base in screen coordinates
    const baseCenter = {
        x: BASE_LEFT + baseSize / 2,
        y: window.height - BASE_BOTTOM - baseSize / 2,
    };

    const panResponder = useMemo(
        () =>
            PanResponder.create({
                onStartShouldSetPanResponder: () => true,
                onMoveShouldSetPanResponder: () => true,
                onPanResponderMove: (_, gestureState) => {
                    // Use absolute touch position (moveX/moveY) relative to base center so diagonals
                    // work regardless of where the user started the touch inside the base.
                    const touchX = gestureState.moveX ?? (gestureState.x0 + (gestureState.dx || 0));
                    const touchY = gestureState.moveY ?? (gestureState.y0 + (gestureState.dy || 0));

                    const dx = touchX - baseCenter.x;
                    const dy = touchY - baseCenter.y;

                    const clamped = clampToRadius(dx, dy, maxRadius);
                    const normalizedX = clamped.x / maxRadius;
                    const normalizedY = clamped.y / maxRadius;

                    setThumbOffset(clamped);

                    if (Math.hypot(normalizedX, normalizedY) < deadZone) {
                        onMove({ x: 0, y: 0 });
                        return;
                    }

                    onMove({ x: normalizedX, y: normalizedY });
                },
                onPanResponderRelease: () => {
                    setThumbOffset({ x: 0, y: 0 });
                    onMove({ x: 0, y: 0 });
                },
                onPanResponderTerminate: () => {
                    setThumbOffset({ x: 0, y: 0 });
                    onMove({ x: 0, y: 0 });
                },
            }),
        [maxRadius, deadZone, onMove, baseCenter.x, baseCenter.y]
    );

    return (
        <View
            style={{
                position: "absolute",
                left: 24,
                bottom: 28,
                width: baseSize,
                height: baseSize,
                borderRadius: baseSize / 2,
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                borderWidth: 2,
                borderColor: "rgba(255, 255, 255, 0.35)",
                justifyContent: "center",
                alignItems: "center",
            }}
            {...panResponder.panHandlers}
        >
            <View
                style={{
                    width: thumbSize,
                    height: thumbSize,
                    borderRadius: thumbSize / 2,
                    backgroundColor: "rgba(255, 255, 255, 0.75)",
                    transform: [
                        { translateX: thumbOffset.x },
                        { translateY: thumbOffset.y },
                    ],
                }}
            />
        </View>
    );
}


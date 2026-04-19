// src/components/Player.js
import React, { useState, useEffect } from "react";
import { View, Text, Image } from "react-native";

/**
 * Componente Player com animação de sprite sheet 4x4
 * (4 direções × 4 frames de movimento)
 */
export default function Player({
    x,
    y,
    direction = "down",
    character = "🧑‍🦱",
    isMoving = false,
    useImage = false,
}) {
    const [frameIndex, setFrameIndex] = useState(1); // Centro (idle) para sprite 3-colunas

    // Animação: cicla entre 4 frames
    useEffect(() => {
        if (!isMoving) {
            setFrameIndex(1);
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
    }, [isMoving]);

    if (useImage) {
        // Sprite sheet real: 144x256 em grade 3x4
        const SPRITE_WIDTH = 144;
        const SPRITE_HEIGHT = 256;
        const COLS = 3;
        const ROWS = 4;

        const FRAME_WIDTH = SPRITE_WIDTH / COLS;   // 48
        const FRAME_HEIGHT = SPRITE_HEIGHT / ROWS; // 64

        // Tamanho final no mapa (mantem proporcao do frame)
        const DISPLAY_WIDTH = 48;
        const DISPLAY_HEIGHT = 64;

        // Mantem compatibilidade com a logica antiga de posicao (hitbox 40x40)
        const HITBOX_SIZE = 40;

        // Ordem das linhas conforme a sheet enviada: up, right, down, left
        const directionRowMap = {
            up: 0,
            right: 1,
            down: 2,
            left: 3,
        };

        const rowIndex = directionRowMap[direction] ?? 2;

        const scaleX = DISPLAY_WIDTH / FRAME_WIDTH;
        const scaleY = DISPLAY_HEIGHT / FRAME_HEIGHT;

        const offsetX = -frameIndex * FRAME_WIDTH * scaleX;
        const offsetY = -rowIndex * FRAME_HEIGHT * scaleY;

        return (
            <View
                style={{
                    position: "absolute",
                    left: x - (DISPLAY_WIDTH - HITBOX_SIZE) / 2,
                    top: y - (DISPLAY_HEIGHT - HITBOX_SIZE),
                    width: DISPLAY_WIDTH,
                    height: DISPLAY_HEIGHT,
                    overflow: "hidden",
                }}
            >
                <Image
                    source={require("../../assets/images/player.png")}
                    style={{
                        width: SPRITE_WIDTH * scaleX,
                        height: SPRITE_HEIGHT * scaleY,
                        marginLeft: offsetX,
                        marginTop: offsetY,
                    }}
                />
            </View>
        );
    }

    // Fallback para emoji
    return (
        <View
            style={{
                position: "absolute",
                left: x,
                top: y,
                width: 40,
                height: 40,
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 20,
                backgroundColor: "rgba(100, 150, 255, 0.3)",
                opacity: isMoving && frameIndex % 2 === 0 ? 0.7 : 1,
            }}
        >
            <Text style={{ fontSize: 32 }}>{character}</Text>
        </View>
    );
}
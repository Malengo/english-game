// src/screens/MapScreen.js
import React, { useState, useEffect, useRef } from "react";
import { View, Text, useWindowDimensions } from "react-native";
import Player from "../components/Player";
import FloatingJoystick from "../components/FloatingJoystick";

const WORLD_WIDTH = 1200;
const WORLD_HEIGHT = 900;
const PLAYER_HITBOX = 40;

function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
}

const escolaArea = {
    x: 200,
    y: 100,
    width: 80,
    height: 80,
};

export default function MapScreen({ navigation }) {
    const { width: viewportWidth, height: viewportHeight } = useWindowDimensions();
    const [position, setPosition] = useState({ x: 50, y: 100 });
    const [lastDirection, setLastDirection] = useState("down");
    const [isMoving, setIsMoving] = useState(false);
    const [moveVector, setMoveVector] = useState({ x: 0, y: 0 });
    const [camera, setCamera] = useState({ x: 0, y: 0 });
    const hasInitializedCamera = useRef(false);

    // Aplica movimento continuo baseado no vetor do joystick
    useEffect(() => {
        const intensity = Math.hypot(moveVector.x, moveVector.y);

        if (intensity < 0.1) {
            setIsMoving(false);
            return;
        }

        setIsMoving(true);

        if (Math.abs(moveVector.x) > Math.abs(moveVector.y)) {
            setLastDirection(moveVector.x > 0 ? "right" : "left");
        } else {
            setLastDirection(moveVector.y > 0 ? "down" : "up");
        }

        const speed = 5;
        const intervalId = setInterval(() => {
            setPosition((prev) => ({
                x: clamp(prev.x + moveVector.x * speed, 0, WORLD_WIDTH - PLAYER_HITBOX),
                y: clamp(prev.y + moveVector.y * speed, 0, WORLD_HEIGHT - PLAYER_HITBOX),
            }));
        }, 50);

        return () => clearInterval(intervalId);
    }, [moveVector]);

    // Detecta entrada na escola
    useEffect(() => {
        const dentro =
            position.x > escolaArea.x &&
            position.x < escolaArea.x + escolaArea.width &&
            position.y > escolaArea.y &&
            position.y < escolaArea.y + escolaArea.height;

        if (dentro) {
            navigation.navigate("Escola");
        }
    }, [position, navigation]);

    const playerCenterX = position.x + PLAYER_HITBOX / 2;
    const playerCenterY = position.y + PLAYER_HITBOX / 2;

    const cameraX = clamp(
        playerCenterX - viewportWidth / 2,
        0,
        Math.max(0, WORLD_WIDTH - viewportWidth)
    );

    const cameraY = clamp(
        playerCenterY - viewportHeight / 2,
        0,
        Math.max(0, WORLD_HEIGHT - viewportHeight)
    );

    // Camera suave: interpola a camera renderizada ate o alvo
    useEffect(() => {
        const LERP_FACTOR = 0.18;
        const SNAP_EPSILON = 0.5;

        if (!hasInitializedCamera.current) {
            hasInitializedCamera.current = true;
            setCamera({ x: cameraX, y: cameraY });
            return;
        }

        let rafId;

        const animate = () => {
            setCamera((prev) => {
                const nextX = prev.x + (cameraX - prev.x) * LERP_FACTOR;
                const nextY = prev.y + (cameraY - prev.y) * LERP_FACTOR;

                const doneX = Math.abs(cameraX - nextX) < SNAP_EPSILON;
                const doneY = Math.abs(cameraY - nextY) < SNAP_EPSILON;

                if (doneX && doneY) {
                    return { x: cameraX, y: cameraY };
                }

                rafId = requestAnimationFrame(animate);
                return { x: nextX, y: nextY };
            });
        };

        rafId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafId);
    }, [cameraX, cameraY]);

    return (
        <View style={{ flex: 1, backgroundColor: "#bfc7d1", overflow: "hidden" }}>
            {/* Mundo com camera seguindo o player */}
            <View
                style={{
                    position: "absolute",
                    width: WORLD_WIDTH,
                    height: WORLD_HEIGHT,
                    backgroundColor: "#ddd",
                    transform: [{ translateX: -camera.x }, { translateY: -camera.y }],
                }}
            >
                {/* Escola */}
                <View
                    style={{
                        position: "absolute",
                        left: escolaArea.x,
                        top: escolaArea.y,
                        width: escolaArea.width,
                        height: escolaArea.height,
                        backgroundColor: "orange",
                        borderRadius: 8,
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <Text style={{ fontSize: 24 }}>📚</Text>
                </View>

                {/* Player com sprite e animação */}
                <Player
                    x={position.x}
                    y={position.y}
                    direction={lastDirection}
                    character="🧑‍🦱"
                    isMoving={isMoving}
                    useImage={true}
                />
            </View>

            {/* Joystick flutuante */}
            <FloatingJoystick onMove={setMoveVector} />
        </View>
    );
}
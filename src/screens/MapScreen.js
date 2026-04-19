// src/screens/MapScreen.js
import React, { useState, useEffect, useRef } from "react";
import { View, Image, useWindowDimensions } from "react-native";
import Player from "../components/Player";
import FloatingJoystick from "../components/FloatingJoystick";

const victorianMapData = require("../../assets/lpc-victorian-preview-see-readme/lpc-victorian-preview/victorian-preview.json");
const MAP_BACKGROUND = require("../../assets/lpc-victorian-preview-see-readme/lpc-victorian-preview/victorian-preview.png");

const WORLD_WIDTH = victorianMapData.width * victorianMapData.tilewidth;
const WORLD_HEIGHT = victorianMapData.height * victorianMapData.tileheight;
const PLAYER_HITBOX = 40;
const PLAYER_COLLISION_WIDTH = 48;
const PLAYER_COLLISION_HEIGHT = 64;
const PLAYER_COLLISION_OFFSET_X = -(PLAYER_COLLISION_WIDTH - PLAYER_HITBOX) / 2;
const PLAYER_COLLISION_OFFSET_Y = -(PLAYER_COLLISION_HEIGHT - PLAYER_HITBOX);
const SPAWN_TILE_X = 56;
const SPAWN_TILE_Y = 53;

const collisionLayers = victorianMapData.layers.filter((layer) => {
    const layerName = layer.name?.toLowerCase() ?? "";
    return layer.type === "objectgroup" && layerName.includes("collision");
});

const collisionRects = collisionLayers
    .flatMap((layer) => layer.objects ?? [])
    .filter((obj) => obj.visible !== false && obj.width > 0 && obj.height > 0)
    .map((obj) => ({
        x: obj.x,
        y: obj.y,
        width: obj.width,
        height: obj.height,
    }));

const INITIAL_POSITION = {
    x: SPAWN_TILE_X * victorianMapData.tilewidth,
    y: SPAWN_TILE_Y * victorianMapData.tileheight,
};

function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
}

function rectsOverlap(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

function getPlayerCollisionRect(position) {
    return {
        x: position.x + PLAYER_COLLISION_OFFSET_X,
        y: position.y + PLAYER_COLLISION_OFFSET_Y,
        width: PLAYER_COLLISION_WIDTH,
        height: PLAYER_COLLISION_HEIGHT,
    };
}

function collidesWithAny(position) {
    const playerRect = getPlayerCollisionRect(position);
    return collisionRects.some((rect) => rectsOverlap(playerRect, rect));
}

export default function MapScreen() {
    const { width: viewportWidth, height: viewportHeight } = useWindowDimensions();
    const [position, setPosition] = useState(INITIAL_POSITION);
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
            setPosition((prev) => {
                const minX = -PLAYER_COLLISION_OFFSET_X;
                const maxX =
                    WORLD_WIDTH - (PLAYER_COLLISION_WIDTH + PLAYER_COLLISION_OFFSET_X);
                const minY = -PLAYER_COLLISION_OFFSET_Y;
                const maxY =
                    WORLD_HEIGHT - (PLAYER_COLLISION_HEIGHT + PLAYER_COLLISION_OFFSET_Y);

                const wantedX = clamp(prev.x + moveVector.x * speed, minX, maxX);
                const wantedY = clamp(prev.y + moveVector.y * speed, minY, maxY);

                let nextX = wantedX;
                let nextY = prev.y;

                if (collidesWithAny({ x: nextX, y: nextY })) {
                    nextX = prev.x;
                }

                nextY = wantedY;
                if (collidesWithAny({ x: nextX, y: nextY })) {
                    nextY = prev.y;
                }

                return { x: nextX, y: nextY };
            });
        }, 50);

        return () => clearInterval(intervalId);
    }, [moveVector]);


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
                    transform: [{ translateX: -camera.x }, { translateY: -camera.y }],
                }}
            >
                <Image
                    source={MAP_BACKGROUND}
                    style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        width: WORLD_WIDTH,
                        height: WORLD_HEIGHT,
                    }}
                />


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
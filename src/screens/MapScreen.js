// src/screens/MapScreen.js
import React, { useState, useEffect, useMemo, useRef } from "react";
import { View, Image, useWindowDimensions, Text, Modal, TouchableOpacity } from "react-native";
import { locations } from "../data/locationConfig";
import Player from "../components/Player";
import FloatingJoystick from "../components/FloatingJoystick";
import PlayerDialog from "../components/PlayerDialog";

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

const schoolLayer = victorianMapData.layers.find(
    (layer) => layer.type === "objectgroup" && layer.name?.toLowerCase() === "school"
);
const schoolObject = schoolLayer?.objects?.[0] ?? null;
const SCHOOL_TRIGGER_SIZE = 96;

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

export default function MapScreen({ navigation }) {
    const { width: viewportWidth, height: viewportHeight } = useWindowDimensions();
    const [position, setPosition] = useState(INITIAL_POSITION);
    const [lastDirection, setLastDirection] = useState("down");
    const [isMoving, setIsMoving] = useState(false);
    const moveVectorRef = useRef({ x: 0, y: 0 });
    const [showSchoolModal, setShowSchoolModal] = useState(false);
    const [playerDialog, setPlayerDialog] = useState({ visible: false, message: "" });
    const dialogTimeoutRef = useRef(null);
    const wasInsideSchool = useRef(false);

    const hidePlayerDialog = () => {
        if (dialogTimeoutRef.current) {
            clearTimeout(dialogTimeoutRef.current);
            dialogTimeoutRef.current = null;
        }
        setPlayerDialog((prev) => ({ ...prev, visible: false }));
    };

    const showPlayerDialog = (message, options = {}) => {
        const { autoHideMs = 0 } = options;

        if (dialogTimeoutRef.current) {
            clearTimeout(dialogTimeoutRef.current);
            dialogTimeoutRef.current = null;
        }

        setPlayerDialog({ visible: true, message });

        if (autoHideMs > 0) {
            dialogTimeoutRef.current = setTimeout(() => {
                setPlayerDialog((prev) => ({ ...prev, visible: false }));
                dialogTimeoutRef.current = null;
            }, autoHideMs);
        }
    };

    const handleContinueToSchoolTutorial = () => {
        setShowSchoolModal(false);
        if (navigation?.navigate) {
            navigation.navigate("SchoolMission", {
                autoStart: true,
                locationId: "school",
            });
        }
    };

    const handleJoystickMove = (nextVector) => {
        moveVectorRef.current = nextVector;
        const intensity = Math.hypot(nextVector.x, nextVector.y);

        if (intensity < 0.1) {
            setIsMoving(false);
            return;
        }

        setIsMoving(true);

        if (Math.abs(nextVector.x) > Math.abs(nextVector.y)) {
            setLastDirection(nextVector.x > 0 ? "right" : "left");
        } else {
            setLastDirection(nextVector.y > 0 ? "down" : "up");
        }
    };

    // Mensagem inicial acima do player ao abrir o mapa
    useEffect(() => {
        const firstMessage = "Bem-vindo! Explore a cidade para encontrar locais e iniciar missoes. Siga em direção da escola";

        showPlayerDialog(firstMessage, { autoHideMs: 10000 });

        return () => {
            if (dialogTimeoutRef.current) {
                clearTimeout(dialogTimeoutRef.current);
            }
        };
    }, []);

    // Loop unico de movimento para evitar recriar intervalos a cada frame do joystick
    useEffect(() => {
        const speed = 5;
        const intervalId = setInterval(() => {
            const moveVector = moveVectorRef.current;
            const intensity = Math.hypot(moveVector.x, moveVector.y);

            if (intensity < 0.1) return;

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
    }, []);


    const playerCenterX = position.x + PLAYER_HITBOX / 2;
    const playerCenterY = position.y + PLAYER_HITBOX / 2;
    const playerHeadX = playerCenterX;
    const playerHeadY = position.y + PLAYER_COLLISION_OFFSET_Y;

    // compute school center in world coordinates (prefer Tiled object; fallback to config)
    const schoolLocation = locations.find((l) => l.id === "school");
    const schoolCenter = useMemo(
        () =>
            schoolLocation
                ? {
                      x: schoolLocation.tileX * victorianMapData.tilewidth + (schoolLocation.width || 0) / 2,
                      y: schoolLocation.tileY * victorianMapData.tileheight + (schoolLocation.height || 0) / 2,
                  }
                : null,
        [schoolLocation]
    );

    const schoolCenterFromObject = useMemo(
        () =>
            schoolObject
                ? {
                      x: schoolObject.x,
                      y: schoolObject.y,
                  }
                : null,
        []
    );

    const finalSchoolCenter = useMemo(() => schoolCenterFromObject ?? schoolCenter, [schoolCenterFromObject, schoolCenter]);

    const schoolTriggerRect = useMemo(() => {
        if (schoolObject) {
            // Object in Tiled is a point; use a square trigger around it
            return {
                x: schoolObject.x - SCHOOL_TRIGGER_SIZE / 2,
                y: schoolObject.y - SCHOOL_TRIGGER_SIZE / 2,
                width: SCHOOL_TRIGGER_SIZE,
                height: SCHOOL_TRIGGER_SIZE,
            };
        }

        if (schoolLocation) {
            return {
                x: schoolLocation.tileX * victorianMapData.tilewidth,
                y: schoolLocation.tileY * victorianMapData.tileheight,
                width: schoolLocation.width,
                height: schoolLocation.height,
            };
        }

        return null;
    }, [schoolLocation]);

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

    // Show welcome modal when entering school trigger area
    useEffect(() => {
        if (!schoolTriggerRect) return;

        const playerRect = getPlayerCollisionRect(position);
        const isInside = rectsOverlap(playerRect, schoolTriggerRect);

        if (isInside && !wasInsideSchool.current) {
            setShowSchoolModal(true);
        }

        wasInsideSchool.current = isInside;
    }, [position, schoolTriggerRect]);

    return (
        <View style={{ flex: 1, backgroundColor: "#bfc7d1", overflow: "hidden" }}>
            <Modal
                visible={showSchoolModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowSchoolModal(false)}
            >
                <View
                    style={{
                        flex: 1,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        justifyContent: "center",
                        alignItems: "center",
                        paddingHorizontal: 24,
                    }}
                >
                    <View
                        style={{
                            width: "100%",
                            maxWidth: 360,
                            backgroundColor: "white",
                            borderRadius: 14,
                            padding: 20,
                            borderWidth: 2,
                            borderColor: "#FF7043",
                        }}
                    >
                        <Text style={{ fontSize: 24, textAlign: "center", marginBottom: 10 }}>📚</Text>
                        <Text style={{ fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 10 }}>
                            Escola
                        </Text>
                        <Text style={{ fontSize: 15, color: "#444", textAlign: "center", lineHeight: 22 }}>
                            Bem-vindo a Escola! Aqui voce vai aprender o alfabeto e ganhar moedas para desbloquear novas areas.
                        </Text>

                        <TouchableOpacity
                            onPress={handleContinueToSchoolTutorial}
                            style={{
                                marginTop: 18,
                                backgroundColor: "#FF7043",
                                borderRadius: 10,
                                paddingVertical: 12,
                                alignItems: "center",
                            }}
                        >
                            <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Continuar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Mundo com camera seguindo o player */}
            <View
                style={{
                    position: "absolute",
                    width: WORLD_WIDTH,
                    height: WORLD_HEIGHT,
                    transform: [
                        { translateX: -Math.round(cameraX) },
                        { translateY: -Math.round(cameraY) },
                    ],
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

                <PlayerDialog
                    visible={playerDialog.visible}
                    message={playerDialog.message}
                    anchorX={playerHeadX}
                    anchorY={playerHeadY}
                    onClose={hidePlayerDialog}
                />

                {/* debug marker removed */}
            </View>

            {/* Small debug overlay: player coords and distance to school (shows when debugging) */}
            <View style={{ position: "absolute", left: 8, top: 8, backgroundColor: "rgba(0,0,0,0.5)", padding: 8, borderRadius: 6 }}>
                <Text style={{ color: "white", fontSize: 12 }}>x: {Math.round(position.x)} y: {Math.round(position.y)}</Text>
                {finalSchoolCenter && (
                    <Text style={{ color: "white", fontSize: 12 }}>dist: {Math.round(Math.hypot(finalSchoolCenter.x - playerCenterX, finalSchoolCenter.y - playerCenterY))} px</Text>
                )}
            </View>

            {/* Direction arrow HUD pointing to School (hidden when near) */}
            {finalSchoolCenter && (() => {
                const dx = finalSchoolCenter.x - playerCenterX;
                const dy = finalSchoolCenter.y - playerCenterY;
                const dist = Math.hypot(dx, dy);
                const angle = Math.atan2(dy, dx);
                const nearThreshold = schoolTriggerRect ? Math.max(schoolTriggerRect.width, schoolTriggerRect.height) / 2 : 56;
                const isNear = dist < nearThreshold + 16;
                if (isNear) return null;
                return (
                    <View style={{ position: "absolute", right: 18, bottom: 90, width: 56, height: 56, justifyContent: "center", alignItems: "center" }}>
                        <Text style={{ fontSize: 36, transform: [{ rotate: `${angle}rad` }], color: "#FF7043" }}>➤</Text>
                        <View style={{ position: "absolute", top: 42, backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                            <Text style={{ color: "white", fontSize: 12 }}>Escola</Text>
                        </View>
                    </View>
                );
            })()}

            {/* Joystick flutuante */}
            <FloatingJoystick onMove={handleJoystickMove} />
        </View>
    );
}
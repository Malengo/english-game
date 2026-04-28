// src/screens/MapScreen.js
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { View, Image, useWindowDimensions, Text, Modal, TouchableOpacity } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { locations } from "../data/locationConfig";
import { npcConfigs } from "../data/npcConfig";
import Player from "../components/Player";
import Npc from "../components/Npc";
import FloatingJoystick from "../components/FloatingJoystick";
import PlayerDialog from "../components/PlayerDialog";
import { loadProgress } from "../utils/progressStorage";
import {
    clamp,
    resolveMovementStep,
    calculateCurrentStage,
    selectObjectiveLocation,
    resolveLocationEntryAction,
    resolveNpcPatrolStep,
    isPlayerNearNpc,
    getAabbRect,
} from "./mapScreen.logic";

const victorianMapData = require("../../assets/lpc-victorian-preview-see-readme/lpc-victorian-preview/victorian-preview.json");
const MAP_BACKGROUND = require("../../assets/lpc-victorian-preview-see-readme/lpc-victorian-preview/victorian-preview.png");

const WORLD_WIDTH = victorianMapData.width * victorianMapData.tilewidth;
const WORLD_HEIGHT = victorianMapData.height * victorianMapData.tileheight;
const PLAYER_HITBOX = 40;
const PLAYER_SPRITE_HEIGHT = 64;
const PLAYER_HEAD_OFFSET_Y = -(PLAYER_SPRITE_HEIGHT - PLAYER_HITBOX);
const PLAYER_COLLISION_WIDTH = 28;
const PLAYER_COLLISION_HEIGHT = 16;
const PLAYER_COLLISION_OFFSET_X = (PLAYER_HITBOX - PLAYER_COLLISION_WIDTH) / 2;
const PLAYER_COLLISION_OFFSET_Y = PLAYER_HITBOX - PLAYER_COLLISION_HEIGHT;
const SPAWN_TILE_X = 56;
const SPAWN_TILE_Y = 53;
const LOCATION_TRIGGER_SIZE = 96;
const NPC_TICK_MS = 80;
// When player interrupts a moving NPC, pause duration in ms
const NPC_PAUSE_MS = 3000;

const collisionLayers = victorianMapData.layers.filter((layer) => {
    const layerName = layer.name?.toLowerCase() ?? "";
    return layer.type === "objectgroup" && layerName.includes("collision");
});

const collisionShapes = collisionLayers
    .flatMap((layer) => layer.objects ?? [])
    .filter((obj) => obj.visible !== false)
    .map((obj) => {
        if (Array.isArray(obj.polygon) && obj.polygon.length >= 3) {
            return {
                type: "polygon",
                // Polygon points in Tiled are relative to object origin.
                points: obj.polygon.map((point) => ({ x: obj.x + point.x, y: obj.y + point.y })),
            };
        }

        if (obj.width > 0 && obj.height > 0) {
            return {
                type: "rect",
                x: obj.x,
                y: obj.y,
                width: obj.width,
                height: obj.height,
            };
        }

        return null;
    })
    .filter(Boolean);

const INITIAL_POSITION = {
    x: SPAWN_TILE_X * victorianMapData.tilewidth,
    y: SPAWN_TILE_Y * victorianMapData.tileheight,
};

const SHOW_DEBUG_HUD = typeof __DEV__ !== "undefined" ? __DEV__ : false;

const PLAYER_COLLISION_BOX = {
    width: PLAYER_COLLISION_WIDTH,
    height: PLAYER_COLLISION_HEIGHT,
    offsetX: PLAYER_COLLISION_OFFSET_X,
    offsetY: PLAYER_COLLISION_OFFSET_Y,
};

const npcRoutesLayer = victorianMapData.layers.find(
    (layer) => layer.type === "objectgroup" && layer.name?.toLowerCase() === "npc_routes"
);

function buildNpcRouteMap(layer) {
    const routeMap = {};

    for (const obj of layer?.objects ?? []) {
        if (!obj || obj.visible === false) continue;

        const key = String(obj.name ?? "").trim().toLowerCase();
        if (!key) continue;

        // Aceita polygon ou polyline (ambas as exportações Tiled)
        const pathPoints = obj.polyline ?? obj.polygon ?? [];
        if (!Array.isArray(pathPoints) || pathPoints.length < 2) continue;

        const path = pathPoints.map((point) => ({
            x: obj.x + point.x,
            y: obj.y + point.y,
        }));

        routeMap[key] = path;
    }

    return routeMap;
}

const npcRouteMapByName = buildNpcRouteMap(npcRoutesLayer);

const npcConfigById = npcConfigs.reduce((acc, npc) => {
    acc[npc.id] = npc;
    return acc;
}, {});

function resolveNpcPatrolPath(config) {
    const routeKeys = [config.routeObjectName, config.id, config.name]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase());

    for (const key of routeKeys) {
        const route = npcRouteMapByName[key];
        if (Array.isArray(route) && route.length > 0) {
            return route;
        }
    }

    return Array.isArray(config.patrolPath) ? config.patrolPath : [];
}

// Exposed helper to run one NPC tick deterministically (useful for tests).
// Returns { newNpcStates, newNpcPausedMap, dialogs }
export function processNpcTick({ npcStates, position, npcPausedMap = {}, npcNearMap = {}, now = Date.now(), npcPauseMs = NPC_PAUSE_MS }) {
    const newNpcPausedMap = { ...npcPausedMap };
    const newNpcNearMap = { ...npcNearMap };
    const dialogs = [];
    const exitedNpcIds = [];

    const playerRect = getAabbRect(position, PLAYER_COLLISION_BOX);
    const playerCenter = {
        x: playerRect.x + playerRect.width / 2,
        y: playerRect.y + playerRect.height / 2,
    };

    const newNpcStates = npcStates.map((npcState) => {
        const config = npcConfigById[npcState.id];
        if (!config) return npcState;

        const wasNear = Boolean(npcNearMap[npcState.id]);
        let near = false;

        try {
            near = isPlayerNearNpc({
                playerPosition: position,
                playerHitbox: PLAYER_COLLISION_BOX,
                npcPosition: { x: npcState.x, y: npcState.y },
                npcHitbox: config.hitbox,
                padding: config.proximityPaddingPx ?? 0,
            });
        } catch (e) {
            near = false;
        }

        if (wasNear && !near) {
            exitedNpcIds.push(npcState.id);
        }

        newNpcNearMap[npcState.id] = near;

        const patrolPath = resolveNpcPatrolPath(config);
        const hasPatrol = patrolPath.length > 1;

        const step = resolveNpcPatrolStep({
            position: { x: npcState.x, y: npcState.y },
            patrolPath,
            targetIndex: npcState.targetIndex,
            speed: config.speedPxPerTick,
            arriveDistance: config.arriveDistancePx,
        });

        if (near) {
            if (!wasNear && hasPatrol) {
                const npcRect = getAabbRect({ x: npcState.x, y: npcState.y }, config.hitbox);
                const npcCenter = {
                    x: npcRect.x + npcRect.width / 2,
                    y: npcRect.y + npcRect.height / 2,
                };
                const distance = Math.hypot(npcCenter.x - playerCenter.x, npcCenter.y - playerCenter.y);
                const anchorX = step.position.x + (config.hitbox?.width ?? 16) / 2;
                const anchorY = step.position.y - 8;
                const message = config.onNearbyMessage ?? "Oi! Espera um instante...";

                dialogs.push({ npcId: npcState.id, message, anchorX, anchorY, autoHideMs: 0, distance });
            }

            if (wasNear) {
                return {
                    ...npcState,
                    isMoving: false,
                };
            }

            return {
                ...npcState,
                x: step.position.x,
                y: step.position.y,
                targetIndex: step.targetIndex,
                direction: step.direction,
                isMoving: false,
            };
        }

        return {
            ...npcState,
            x: step.position.x,
            y: step.position.y,
            targetIndex: step.targetIndex,
            direction: step.direction,
            isMoving: step.isMoving,
        };
    });

    let selectedDialogs = [];
    if (dialogs.length > 0) {
        const closest = dialogs.reduce((best, current) => {
            if (!best) return current;
            if (current.distance < best.distance) return current;
            if (current.distance === best.distance) {
                return String(current.npcId) < String(best.npcId) ? current : best;
            }
            return best;
        }, null);
        selectedDialogs = closest ? [closest] : [];
    }

    return { newNpcStates, newNpcPausedMap, newNpcNearMap, dialogs: selectedDialogs, exitedNpcIds };
}

export function buildInitialNpcState(config) {
    const patrolPath = resolveNpcPatrolPath(config);
    const spawn = patrolPath[0] ?? { x: 0, y: 0 };
    const hasPatrol = patrolPath.length > 1;

    return {
        id: config.id,
        x: spawn.x,
        y: spawn.y,
        targetIndex: hasPatrol ? 1 : 0,
        direction: "down",
        // Start moving immediately when a patrol path exists so proximity checks can react
        isMoving: hasPatrol,
    };
}

function getMapPointForLocation(locationId) {
    const locationLayer = victorianMapData.layers.find(
        (layer) =>
            layer.type === "objectgroup" && layer.name?.toLowerCase() === String(locationId).toLowerCase()
    );

    return locationLayer?.objects?.[0] ?? null;
}

function buildFallbackRect(location) {
    if (
        typeof location.tileX !== "number" ||
        typeof location.tileY !== "number" ||
        typeof location.width !== "number" ||
        typeof location.height !== "number"
    ) {
        return null;
    }

    return {
        x: location.tileX * victorianMapData.tilewidth,
        y: location.tileY * victorianMapData.tileheight,
        width: location.width,
        height: location.height,
    };
}

export default function MapScreen({ navigation }) {
    const { width: viewportWidth, height: viewportHeight } = useWindowDimensions();
    const [position, setPosition] = useState(INITIAL_POSITION);
    const [lastDirection, setLastDirection] = useState("down");
    const [isMoving, setIsMoving] = useState(false);
    const moveVectorRef = useRef({ x: 0, y: 0 });
    const positionRef = useRef(INITIAL_POSITION);
    const [activeLocationId, setActiveLocationId] = useState(null);
    const [blockedLocationId, setBlockedLocationId] = useState(null);
    const [completedLocationIds, setCompletedLocationIds] = useState([]);
    const [playerDialog, setPlayerDialog] = useState({ visible: false, message: "" });
    const [npcDialog, setNpcDialog] = useState({ visible: false, message: "" });
    const [npcStates, setNpcStates] = useState(() => npcConfigs.map(buildInitialNpcState));
    const dialogTimeoutRef = useRef(null);
    const npcDialogTimeoutRef = useRef(null);
    const insideLocationsRef = useRef({});
    // Track paused until timestamp per NPC id (ms since epoch)
    const npcPausedRef = useRef({});
    const npcNearRef = useRef({});
    const npcDialogRef = useRef(npcDialog);

    const locationTriggers = useMemo(
        () =>
            locations
                .map((location) => {
                    const mapPoint = getMapPointForLocation(location.id);
                    const triggerRect = mapPoint
                        ? {
                              x: mapPoint.x - LOCATION_TRIGGER_SIZE / 2,
                              y: mapPoint.y - LOCATION_TRIGGER_SIZE / 2,
                              width: LOCATION_TRIGGER_SIZE,
                              height: LOCATION_TRIGGER_SIZE,
                          }
                        : buildFallbackRect(location);

                    if (!triggerRect) return null;

                    return {
                        ...location,
                        triggerRect,
                        center: {
                            x: triggerRect.x + triggerRect.width / 2,
                            y: triggerRect.y + triggerRect.height / 2,
                        },
                    };
                })
                .filter(Boolean),
        []
    );

    const activeLocation = useMemo(
        () => locationTriggers.find((location) => location.id === activeLocationId) ?? null,
        [locationTriggers, activeLocationId]
    );

    const blockedLocation = useMemo(
        () => locationTriggers.find((location) => location.id === blockedLocationId) ?? null,
        [locationTriggers, blockedLocationId]
    );

    const currentStage = useMemo(
        () => calculateCurrentStage(locations, completedLocationIds),
        [completedLocationIds]
    );

    const refreshProgress = useCallback(async () => {
        const progress = await loadProgress();
        setCompletedLocationIds(progress.completedLocationIds ?? []);
    }, []);

    useFocusEffect(
        useCallback(() => {
            refreshProgress();
        }, [refreshProgress])
    );

    const hidePlayerDialog = useCallback(() => {
        if (dialogTimeoutRef.current) {
            clearTimeout(dialogTimeoutRef.current);
            dialogTimeoutRef.current = null;
        }
        setPlayerDialog((prev) => ({ ...prev, visible: false }));
    }, []);

    const hideNpcDialog = useCallback(() => {
        if (npcDialogTimeoutRef.current) {
            clearTimeout(npcDialogTimeoutRef.current);
            npcDialogTimeoutRef.current = null;
        }
        setNpcDialog((prev) => ({ ...prev, visible: false, npcId: undefined }));
    }, []);

    const showPlayerDialog = useCallback((message, options = {}) => {
        const {
            autoHideMs = 0,
            anchorX = null,
            anchorY = null,
            ctaLabel = undefined,
            onPressCta = undefined,
            width = undefined,
        } = options;

        if (dialogTimeoutRef.current) {
            clearTimeout(dialogTimeoutRef.current);
            dialogTimeoutRef.current = null;
        }

        setPlayerDialog({ visible: true, message, anchorX, anchorY, ctaLabel, onPressCta, width });

        if (autoHideMs > 0) {
            dialogTimeoutRef.current = setTimeout(() => {
                setPlayerDialog((prev) => ({ ...prev, visible: false }));
                dialogTimeoutRef.current = null;
            }, autoHideMs);
        }
    }, []);

    const showNpcDialog = useCallback((message, options = {}) => {
        const {
            autoHideMs = 0,
            anchorX = null,
            anchorY = null,
            ctaLabel = undefined,
            onPressCta = undefined,
            width = undefined,
            npcId = undefined,
        } = options;

        if (npcDialogTimeoutRef.current) {
            clearTimeout(npcDialogTimeoutRef.current);
            npcDialogTimeoutRef.current = null;
        }

        setNpcDialog({ visible: true, message, anchorX, anchorY, ctaLabel, onPressCta, width, npcId });

        if (autoHideMs > 0) {
            npcDialogTimeoutRef.current = setTimeout(() => {
                setNpcDialog((prev) => ({ ...prev, visible: false, npcId: undefined }));
                npcDialogTimeoutRef.current = null;
            }, autoHideMs);
        }
    }, []);

    const handleContinueToMission = useCallback(() => {
        if (!activeLocation) return;

        setActiveLocationId(null);

        if (navigation?.navigate && activeLocation.screenRoute) {
            navigation.navigate(activeLocation.screenRoute, {
                autoStart: true,
                locationId: activeLocation.id,
            });
        }
    }, [activeLocation, navigation]);

    const handleJoystickMove = useCallback((nextVector) => {
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
    }, []);

    // Mensagem inicial acima do player ao abrir o mapa
    useEffect(() => {
        const firstMessage =
            "Bem-vindo! Explore a cidade para encontrar locais e iniciar missoes. Siga em direcao da escola.";

        showPlayerDialog(firstMessage, { autoHideMs: 10000 });

        return () => {
            if (dialogTimeoutRef.current) {
                clearTimeout(dialogTimeoutRef.current);
            }
            if (npcDialogTimeoutRef.current) {
                clearTimeout(npcDialogTimeoutRef.current);
            }
        };
    }, [showPlayerDialog]);

    useEffect(() => {
        positionRef.current = position;
    }, [position]);

    // Loop unico de movimento para evitar recriar intervalos a cada frame do joystick
    useEffect(() => {
        const speed = 4;
        const intervalId = setInterval(() => {
            const moveVector = moveVectorRef.current;
            const intensity = Math.hypot(moveVector.x, moveVector.y);

            if (intensity < 0.1) return;

            setPosition((prev) => {
                const bounds = {
                    minX: -PLAYER_COLLISION_OFFSET_X,
                    maxX: WORLD_WIDTH - (PLAYER_COLLISION_WIDTH + PLAYER_COLLISION_OFFSET_X),
                    minY: -PLAYER_COLLISION_OFFSET_Y,
                    maxY: WORLD_HEIGHT - (PLAYER_COLLISION_HEIGHT + PLAYER_COLLISION_OFFSET_Y),
                };

                return resolveMovementStep({
                    prev,
                    moveVector,
                    speed,
                    bounds,
                    collisionShapes,
                    collisionBox: PLAYER_COLLISION_BOX,
                });
            });
        }, 50);

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        npcDialogRef.current = npcDialog;
    }, [npcDialog]);

    useEffect(() => {
        if (!npcConfigs.length) return undefined;

        const intervalId = setInterval(() => {
            // Use the deterministic tick processor to compute next npc states and any dialogs
            setNpcStates((prevStates) => {
                const { newNpcStates, newNpcPausedMap, newNpcNearMap, dialogs, exitedNpcIds } = processNpcTick({
                    npcStates: prevStates,
                    position: positionRef.current,
                    npcPausedMap: npcPausedRef.current,
                    npcNearMap: npcNearRef.current,
                    now: Date.now(),
                    npcPauseMs: NPC_PAUSE_MS,
                });

                // Apply paused map updates
                npcPausedRef.current = { ...npcPausedRef.current, ...newNpcPausedMap };
                npcNearRef.current = newNpcNearMap;

                if (npcDialogRef.current?.npcId && exitedNpcIds.includes(npcDialogRef.current.npcId)) {
                    hideNpcDialog();
                }

                // If any dialog requests were produced, show the first one (UI supports one at a time)
                if (Array.isArray(dialogs) && dialogs.length > 0) {
                    const d = dialogs[0];
                    try {
                        showNpcDialog(d.message, { anchorX: d.anchorX, anchorY: d.anchorY, autoHideMs: d.autoHideMs, npcId: d.npcId });
                    } catch (e) {
                        // ignore dialog failures during ticks
                    }
                }

                return newNpcStates;
            });
        }, NPC_TICK_MS);

        return () => clearInterval(intervalId);
    }, [showNpcDialog, hideNpcDialog]);


    const playerCenterX = position.x + PLAYER_HITBOX / 2;
    const playerCenterY = position.y + PLAYER_HITBOX / 2;
    const playerHeadX = playerCenterX;
    const playerHeadY = position.y + PLAYER_HEAD_OFFSET_Y;

    const objectiveLocation = useMemo(
        () => selectObjectiveLocation(locationTriggers, currentStage),
        [locationTriggers, currentStage]
    );

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

    const resolveDialogAnchor = useCallback(
        (anchorX, anchorY, fallbackX, fallbackY) => {
            const worldX = typeof anchorX === "number" ? anchorX : fallbackX;
            const worldY = typeof anchorY === "number" ? anchorY : fallbackY;

            return {
                x: worldX - cameraX,
                y: worldY - cameraY,
            };
        },
        [cameraX, cameraY]
    );

    const playerDialogAnchor = resolveDialogAnchor(
        playerDialog.anchorX,
        playerDialog.anchorY,
        playerHeadX,
        playerHeadY
    );

    const npcDialogAnchor = resolveDialogAnchor(
        npcDialog.anchorX,
        npcDialog.anchorY,
        playerHeadX,
        playerHeadY
    );

    // Detecta entrada nas areas de localizacao e abre modal quando permitido
    useEffect(() => {
        if (!locationTriggers.length) return;

        const playerCenter = { x: playerCenterX, y: playerCenterY };

        for (const location of locationTriggers) {
            const isInside =
                playerCenter.x >= location.triggerRect.x &&
                playerCenter.x <= location.triggerRect.x + location.triggerRect.width &&
                playerCenter.y >= location.triggerRect.y &&
                playerCenter.y <= location.triggerRect.y + location.triggerRect.height;
            const wasInside = Boolean(insideLocationsRef.current[location.id]);

            const action = resolveLocationEntryAction({
                isInside,
                wasInside,
                activeLocationId,
                blockedLocationId,
                currentStage,
                requiredStage: location.stageRequired ?? 1,
            });

            if (action === "activate") {
                setActiveLocationId(location.id);
            }

            if (action === "block") {
                setBlockedLocationId(location.id);
            }

            insideLocationsRef.current[location.id] = isInside;
        }
    }, [position, locationTriggers, activeLocationId, blockedLocationId, currentStage, playerCenterX, playerCenterY]);

    const directionHud = useMemo(() => {
        if (!objectiveLocation) return null;

        const dx = objectiveLocation.center.x - playerCenterX;
        const dy = objectiveLocation.center.y - playerCenterY;
        const dist = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx);
        const nearThreshold = objectiveLocation.triggerRect
            ? Math.max(objectiveLocation.triggerRect.width, objectiveLocation.triggerRect.height) / 2
            : 56;
        const isNear = dist < nearThreshold + 16;

        if (isNear) return null;

        return (
            <View
                style={{
                    position: "absolute",
                    right: 18,
                    bottom: 90,
                    width: 56,
                    height: 56,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Text
                    style={{ fontSize: 36, transform: [{ rotate: `${angle}rad` }], color: "#FF7043" }}
                    accessibilityLabel={`Direcao para ${objectiveLocation.name}`}
                >
                    ➤
                </Text>
                <View
                    style={{
                        position: "absolute",
                        top: 42,
                        backgroundColor: "rgba(0,0,0,0.6)",
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 8,
                    }}
                >
                    <Text style={{ color: "white", fontSize: 12 }}>{objectiveLocation.name}</Text>
                </View>
            </View>
        );
    }, [objectiveLocation, playerCenterX, playerCenterY]);

    const isNearAnyNpc = useMemo(() => {
        return npcStates.some((npcState) => {
            const config = npcConfigById[npcState.id];
            if (!config?.hitbox) return false;

            return isPlayerNearNpc({
                playerPosition: position,
                playerHitbox: PLAYER_COLLISION_BOX,
                npcPosition: { x: npcState.x, y: npcState.y },
                npcHitbox: config.hitbox,
                padding: config.proximityPaddingPx ?? 0,
            });
        });
    }, [npcStates, position]);

    return (
        <View style={{ flex: 1, backgroundColor: "#bfc7d1", overflow: "hidden" }}>
            <Modal
                visible={Boolean(activeLocation)}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setActiveLocationId(null)}
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
                        <Text style={{ fontSize: 24, textAlign: "center", marginBottom: 10 }}>
                            {activeLocation?.emoji ?? "📍"}
                        </Text>
                        <Text style={{ fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 10 }}>
                            {activeLocation?.name ?? "Local"}
                        </Text>
                        <Text style={{ fontSize: 15, color: "#444", textAlign: "center", lineHeight: 22 }}>
                            {activeLocation?.description ?? "Inicie a missao deste local para ganhar recompensas."}
                        </Text>

                        <TouchableOpacity
                            onPress={handleContinueToMission}
                            accessibilityRole="button"
                            accessibilityLabel={`Continuar para missao de ${activeLocation?.name ?? "local"}`}
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

            <Modal
                visible={Boolean(blockedLocation)}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setBlockedLocationId(null)}
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
                            borderColor: "#B0BEC5",
                        }}
                    >
                        <Text style={{ fontSize: 24, textAlign: "center", marginBottom: 10 }}>
                            {blockedLocation?.emoji ?? "🔒"}
                        </Text>
                        <Text style={{ fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 10 }}>
                            {blockedLocation?.name ?? "Local"} bloqueado
                        </Text>
                        <Text style={{ fontSize: 15, color: "#444", textAlign: "center", lineHeight: 22 }}>
                            {blockedLocation?.id === "house"
                                ? "Conclua a Escola primeiro para liberar a licao da Casa."
                                : "Complete os locais anteriores para desbloquear esta missao."}
                        </Text>

                        <TouchableOpacity
                            onPress={() => setBlockedLocationId(null)}
                            accessibilityRole="button"
                            accessibilityLabel="Fechar aviso de local bloqueado"
                            style={{
                                marginTop: 18,
                                backgroundColor: "#607D8B",
                                borderRadius: 10,
                                paddingVertical: 12,
                                alignItems: "center",
                            }}
                        >
                            <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Entendi</Text>
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

                {npcStates.map((npcState) => {
                    const config = npcConfigById[npcState.id];
                    if (!config) return null;

                    return (
                        <Npc
                            key={npcState.id}
                            x={npcState.x}
                            y={npcState.y}
                            direction={npcState.direction}
                            isMoving={npcState.isMoving}
                            sprite={config.sprite}
                            testID={`npc-${npcState.id}`}
                        />
                    );
                })}


                {/* Player com sprite e animação */}
                <Player
                    x={position.x}
                    y={position.y}
                    direction={lastDirection}
                    character="🧑‍🦱"
                    isMoving={isMoving}
                    useImage={true}
                />

                {/* debug marker removed */}
            </View>

            <PlayerDialog
                visible={playerDialog.visible}
                message={playerDialog.message}
                anchorX={playerDialogAnchor.x}
                anchorY={playerDialogAnchor.y}
                ctaLabel={playerDialog.ctaLabel}
                onPressCta={playerDialog.onPressCta}
                width={playerDialog.width}
                onClose={hidePlayerDialog}
                variant="player"
            />

            <PlayerDialog
                visible={npcDialog.visible}
                message={npcDialog.message}
                anchorX={npcDialogAnchor.x}
                anchorY={npcDialogAnchor.y}
                ctaLabel={npcDialog.ctaLabel}
                onPressCta={npcDialog.onPressCta}
                width={npcDialog.width}
                onClose={undefined}
                variant="npc"
                avatarSource={npcConfigById[npcDialog.npcId]?.dialogAvatarSource ?? npcConfigById[npcDialog.npcId]?.sprite?.source}
                avatarAlt={npcConfigById[npcDialog.npcId]?.name}
            />

            {/* Debug overlay em modo de desenvolvimento */}
            {SHOW_DEBUG_HUD && (
                <View
                    style={{
                        position: "absolute",
                        left: 8,
                        top: 8,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        padding: 8,
                        borderRadius: 6,
                    }}
                >
                    <Text style={{ color: "white", fontSize: 12 }}>
                        x: {Math.round(position.x)} y: {Math.round(position.y)} | stage: {currentStage}
                    </Text>
                    {objectiveLocation && (
                        <Text style={{ color: "white", fontSize: 12 }}>
                            alvo: {objectiveLocation.name} | dist: {Math.round(Math.hypot(objectiveLocation.center.x - playerCenterX, objectiveLocation.center.y - playerCenterY))} px
                        </Text>
                    )}
                    <Text style={{ color: "white", fontSize: 12 }}>npc perto: {isNearAnyNpc ? "sim" : "nao"}</Text>
                </View>
            )}

            {/* Direction arrow HUD pointing to School (hidden when near) */}
            {directionHud}

            {/* Joystick flutuante */}
            <FloatingJoystick onMove={handleJoystickMove} />
        </View>
    );
}

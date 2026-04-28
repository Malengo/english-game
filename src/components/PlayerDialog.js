import React from "react";
import { View, Text, TouchableOpacity, useWindowDimensions, Image } from "react-native";

const DEFAULT_WIDTH = 220;
const DIALOG_OFFSET_Y = 120;

export default function PlayerDialog({
    visible,
    message,
    anchorX = 0,
    anchorY = 0,
    onClose,
    ctaLabel,
    onPressCta,
    width = DEFAULT_WIDTH,
    variant = "player", // 'player' | 'npc'
    avatarSource = null,
    avatarAlt = "",
}) {
    const { width: viewportWidth, height: viewportHeight } = useWindowDimensions();
    const safeMargin = 8;

    const themes = {
        player: { borderColor: "#FF7043", triangleColor: "#FF7043", backgroundColor: "white", textColor: "#333" },
        npc: { borderColor: "#B0BEC5", triangleColor: "#B0BEC5", backgroundColor: "white", textColor: "#333" },
    };

    const theme = themes[variant] ?? themes.player;

    const left = Math.max(safeMargin, Math.min(anchorX - width / 2, viewportWidth - width - safeMargin));

    // Simple vertical clamp so dialog stays on screen
    const estimatedDialogHeight = 120; // heuristic, adjust if you change styling
    const topUnclamped = anchorY - DIALOG_OFFSET_Y;
    const top = Math.max(safeMargin, Math.min(topUnclamped, viewportHeight - estimatedDialogHeight - safeMargin));

    if (!visible || !message) return null;

    return (
        <View
            pointerEvents="box-none"
            style={{
                position: "absolute",
                left,
                top,
                width,
                alignItems: "center",
            }}
        >
            <View
                style={{
                    width: "100%",
                    backgroundColor: theme.backgroundColor,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: theme.borderColor,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    shadowColor: "#000",
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 3,
                }}
            >
                {/* For NPC variant we show a small avatar to the left */}
                {variant === "npc" ? (
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        {avatarSource ? (
                            <View
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 18,
                                    overflow: "hidden",
                                    marginRight: 10,
                                }}
                            >
                                <Image
                                    source={avatarSource}
                                    style={{ width: 36, height: 36 }}
                                    resizeMode="cover"
                                    accessibilityLabel={avatarAlt}
                                />
                            </View>
                        ) : (
                            <View
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 18,
                                    backgroundColor: theme.borderColor,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    marginRight: 10,
                                }}
                            >
                                <Text style={{ color: "white", fontWeight: "bold" }}>{(avatarAlt || "?").slice(0, 1)}</Text>
                            </View>
                        )}

                        <Text style={{ color: theme.textColor, fontSize: 13, lineHeight: 18, flex: 1 }}>{message}</Text>
                    </View>
                ) : (
                    <Text style={{ color: theme.textColor, fontSize: 13, textAlign: "center", lineHeight: 18 }}>
                        {message}
                    </Text>
                )}

                {ctaLabel && onPressCta && (
                    <TouchableOpacity
                        onPress={onPressCta}
                        accessibilityRole="button"
                        accessibilityLabel={ctaLabel}
                        style={{
                            marginTop: 10,
                            backgroundColor: variant === "player" ? "#FF7043" : "#607D8B",
                            borderRadius: 8,
                            paddingVertical: 8,
                            paddingHorizontal: 10,
                            alignItems: "center",
                        }}
                    >
                        <Text style={{ color: "white", fontSize: 13, fontWeight: "bold" }}>
                            {ctaLabel}
                        </Text>
                    </TouchableOpacity>
                )}

                {!!onClose && (
                    <TouchableOpacity
                        onPress={onClose}
                        accessibilityRole="button"
                        accessibilityLabel="Fechar dialogo"
                        style={{ alignSelf: "center", marginTop: 8 }}
                    >
                        <Text style={{ color: "#777", fontSize: 12 }}>Fechar</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View
                style={{
                    width: 0,
                    height: 0,
                    borderLeftWidth: 9,
                    borderRightWidth: 9,
                    borderTopWidth: 10,
                    borderLeftColor: "transparent",
                    borderRightColor: "transparent",
                    borderTopColor: theme.triangleColor,
                    marginTop: -1,
                }}
            />
        </View>
    );
}


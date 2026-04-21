import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

const DEFAULT_WIDTH = 220;
const DIALOG_OFFSET_Y = 120;

export default function PlayerDialog({
    visible,
    message,
    anchorX,
    anchorY,
    onClose,
    ctaLabel,
    onPressCta,
    width = DEFAULT_WIDTH,
}) {
    if (!visible || !message) return null;

    return (
        <View
            pointerEvents="box-none"
            style={{
                position: "absolute",
                left: anchorX - width / 2,
                top: anchorY - DIALOG_OFFSET_Y,
                width,
                alignItems: "center",
            }}
        >
            <View
                style={{
                    width: "100%",
                    backgroundColor: "white",
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: "#FF7043",
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    shadowColor: "#000",
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 3,
                }}
            >
                <Text style={{ color: "#333", fontSize: 13, textAlign: "center", lineHeight: 18 }}>
                    {message}
                </Text>

                {ctaLabel && onPressCta && (
                    <TouchableOpacity
                        onPress={onPressCta}
                        style={{
                            marginTop: 10,
                            backgroundColor: "#FF7043",
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
                    borderTopColor: "#FF7043",
                    marginTop: -1,
                }}
            />
        </View>
    );
}


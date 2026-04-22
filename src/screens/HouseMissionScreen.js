import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

export default function HouseMissionScreen({ navigation, route }) {
  const autoStart = route?.params?.autoStart;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#FFF3E0",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <Text style={{ fontSize: 52, marginBottom: 10 }}>🏠</Text>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 8, textAlign: "center" }}>
        Casa
      </Text>
      <Text style={{ fontSize: 16, color: "#444", textAlign: "center", lineHeight: 22, marginBottom: 20 }}>
        {autoStart
          ? "Licao iniciada! Aqui voce vai aprender vocabulario da casa em ingles."
          : "Bem-vindo a Casa!"}
      </Text>

      <TouchableOpacity
        onPress={() => navigation.goBack()}
        accessibilityRole="button"
        accessibilityLabel="Voltar ao mapa"
        style={{ backgroundColor: "#FF7043", borderRadius: 10, paddingVertical: 12, paddingHorizontal: 24 }}
      >
        <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Voltar ao mapa</Text>
      </TouchableOpacity>
    </View>
  );
}


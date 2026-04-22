import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { markLocationCompleted } from "../utils/progressStorage";

export default function SchoolMissionScreen({ navigation, route }) {
  const autoStart = route?.params?.autoStart;

  const handleCompleteMission = async () => {
    await markLocationCompleted("school");
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#E8F5E9", justifyContent: "center", alignItems: "center", padding: 20 }}>
      <Text style={{ fontSize: 52, marginBottom: 10 }}>📚</Text>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 8, textAlign: "center" }}>
        Escola
      </Text>
      <Text style={{ fontSize: 16, color: "#444", textAlign: "center", lineHeight: 22, marginBottom: 20 }}>
        {autoStart
          ? "Tutorial iniciado! Aqui voce vai aprender o alfabeto e como ganhar moedas para liberar novas areas."
          : "Bem-vindo a Escola!"}
      </Text>

      <TouchableOpacity
        onPress={handleCompleteMission}
        accessibilityRole="button"
        accessibilityLabel="Concluir licao da escola e voltar ao mapa"
        style={{ backgroundColor: "#FF7043", borderRadius: 10, paddingVertical: 12, paddingHorizontal: 24 }}
      >
        <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Concluir e voltar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.goBack()}
        accessibilityRole="button"
        accessibilityLabel="Voltar sem concluir"
        style={{ marginTop: 10, paddingVertical: 10, paddingHorizontal: 16 }}
      >
        <Text style={{ color: "#666", fontSize: 14 }}>Voltar sem concluir</Text>
      </TouchableOpacity>
    </View>
  );
}


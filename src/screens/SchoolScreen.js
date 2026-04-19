// src/screens/SchoolScreen.js
import React, { useState } from "react";
import { View, Text, Button } from "react-native";
import { alphabet } from "../data/alphabet";

export default function SchoolScreen({ navigation }) {
    const [index, setIndex] = useState(0);

    const proxima = () => {
        if (index < alphabet.length - 1) {
            setIndex(index + 1);
        } else {
            // terminou aula
            alert("Você ganhou XP + moedas!");
            navigation.goBack();
        }
    };

    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Text style={{ fontSize: 24 }}>👩‍🏫 Professora</Text>

            <Text style={{ fontSize: 80, marginVertical: 20 }}>
                {alphabet[index]}
            </Text>

            <Button title="Próxima letra" onPress={proxima} />
        </View>
    );
}
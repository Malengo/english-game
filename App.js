import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MapScreen from "./src/screens/MapScreen";

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator id={"main"}>
                <Stack.Screen name="Mapa" component={MapScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
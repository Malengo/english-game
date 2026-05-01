import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MapScreen from "./src/screens/MapScreen";
import SchoolMissionScreen from "./src/screens/SchoolMissionScreen";
import HouseMissionScreen from "./src/screens/HouseMissionScreen";
import BakeryMissionScreen from "./src/screens/BakeryMissionScreen";
import {SafeAreaProvider} from "react-native-safe-area-context";

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <SafeAreaProvider>
            <NavigationContainer>
                <Stack.Navigator id={"main"}  screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="MAPAS" component={MapScreen}/>
                    <Stack.Screen name="SchoolMission" component={SchoolMissionScreen} options={{title: "School"}}/>
                    <Stack.Screen name="HouseMission" component={HouseMissionScreen} options={{title: "Casa"}}/>
                    <Stack.Screen name="BakeryMission" component={BakeryMissionScreen} options={{title: "Padaria"}}/>
                </Stack.Navigator>
            </NavigationContainer>
        </SafeAreaProvider>
    );
}

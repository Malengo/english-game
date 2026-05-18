import React, { useEffect, useState } from "react";
import { ImageBackground, StyleSheet, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MapScreen from "./src/screens/MapScreen";
import SchoolMissionScreen from "./src/screens/SchoolMissionScreen";
import HouseMissionScreen from "./src/screens/HouseMissionScreen";
import BakeryMissionScreen from "./src/screens/BakeryMissionScreen";
import LessonMissionScreen from "./src/screens/LessonMissionScreen";
import {SafeAreaProvider} from "react-native-safe-area-context";

const Stack = createNativeStackNavigator();
const APP_SPLASH_DURATION_MS = 4200;

export default function App() {
    const [showAppSplash, setShowAppSplash] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setShowAppSplash(false), APP_SPLASH_DURATION_MS);
        return () => clearTimeout(timer);
    }, []);

    if (showAppSplash) {
        return (
            <View style={styles.splashContainer}>
                <ImageBackground
                    source={require("./assets/images/splash-icon.png")}
                    style={styles.splashImage}
                    resizeMode="contain"
                />
            </View>
        );
    }

    return (
        <SafeAreaProvider>
            <NavigationContainer>
                <Stack.Navigator id={"main"}  screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="MAPAS" component={MapScreen}/>
                    <Stack.Screen name="SchoolMission" component={SchoolMissionScreen} options={{title: "School"}}/>
                    <Stack.Screen name="HouseMission" component={HouseMissionScreen} options={{title: "Casa"}}/>
                    <Stack.Screen name="BakeryMission" component={BakeryMissionScreen} options={{title: "Padaria"}}/>
                    <Stack.Screen name="LessonMission" component={LessonMissionScreen} options={{title: "Missao"}}/>
                </Stack.Navigator>
            </NavigationContainer>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    splashContainer: {
        flex: 1,
        backgroundColor: "#000000",
    },
    splashImage: {
        flex: 1,
        width: "100%",
        height: "100%",
    },
});

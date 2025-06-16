import { Stack } from "expo-router";
import { Dimensions, StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView>
      <Stack screenOptions={{
        contentStyle: {
          backgroundColor: "black",
          paddingBottom: Dimensions.get("screen").height - Dimensions.get("window").height - (StatusBar.currentHeight ?? 0)
        },
        headerStyle: {
          backgroundColor: "black"
        },
        headerBackButtonDisplayMode: "minimal",
        headerTitleStyle: {
          fontFamily: "monospace",
          fontWeight: "bold",
          fontSize: 18
        },
        headerTintColor: "white",
        headerTitleAlign: "center"
      }} />
    </GestureHandlerRootView>
  );
}

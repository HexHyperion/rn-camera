import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView>
      <Stack screenOptions={{
        contentStyle: {
          backgroundColor: "black"
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

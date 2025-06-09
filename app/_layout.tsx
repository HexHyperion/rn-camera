import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack screenOptions={{
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
  }} />;
}

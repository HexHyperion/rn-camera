import RectangularButton from "@/components/RectangularButton";
import { useRouter } from "expo-router";
import { StatusBar, StyleSheet, Text, View } from "react-native";

export default function Index() {
  const router = useRouter();

  return (
    <>
    <StatusBar barStyle="light-content"/>
    <View style={styles.body}>
      <Text style={styles.header}>e kamer</Text>
      <View>
        <Text style={styles.text}>Your absolute best camera app out there.</Text>
        <Text style={styles.text}>Ready for this awesome adventure?</Text>
      </View>
      <RectangularButton title="Yes!" onPress={() => router.navigate("/gallery")}/>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  body: {
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 10
  },
  header: {
    fontFamily: "monospace",
    fontWeight: "bold",
    fontSize: 20,
    color: "white",
    textAlign: "center"
  },
  text: {
    fontFamily: "monospace",
    color: "white",
    textAlign: "center"
  }
});
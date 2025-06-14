import CircularButton from "@/components/CircularButton";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Dimensions, Easing, StatusBar, StyleSheet, View } from "react-native";

export default function Index() {
  const router = useRouter();

  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [rotateAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <>
    <StatusBar barStyle="light-content"/>
    <View style={styles.body}>
      <View style={styles.iconContainer}>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <MaterialIcons name="camera" size={screenWidth*2} color="#0f0f0f" />
        </Animated.View>
      </View>
      <CircularButton title="kamera sztart" size={100} onPress={() => router.navigate("/gallery")}/>
    </View>
    </>
  );
}

const screenWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  body: {
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 10
  },
  iconContainer: {
    width: screenWidth * 2,
    height: screenWidth * 2,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -screenWidth }, { translateY: -screenWidth }],
    zIndex: -1,
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
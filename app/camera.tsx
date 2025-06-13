import CircularButton from "@/components/CircularButton";
import Ionicons from "@expo/vector-icons/Ionicons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { useNavigation, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Platform, StatusBar, StyleSheet, Text, ToastAndroid, View } from "react-native";

type CameraFacing = "back" | "front";

export default function Camera() {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraFacing, setCameraFacing] = useState<CameraFacing>("back")
  const [cameraReady, setCameraReady] = useState(false);

  const navigation = useNavigation();
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        await MediaLibrary.createAssetAsync(photo.uri);
      }
      catch (error) {
        ToastAndroid.showWithGravity(
          "Failed to take picture: " + error,
          ToastAndroid.LONG,
          ToastAndroid.CENTER
        );
      }
    }
  }

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
    else if (permission?.granted) {
      setCameraReady(true);
    }
  }, [permission, requestPermission]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        position: "relative"
      }}
    >
      {!permission && (
        <Text style={styles.text}>No access to the camera!</Text>
      )}
      {cameraReady && (
        <CameraView
          ref={cameraRef}
          style={{ flex: 1, width: "100%", height: "100%" }}
          facing={cameraFacing}
        />
      )}

      <View style={styles.buttonRow}>
        <CircularButton size={75} style={styles.button} onPress={() => {
          router.back();
        }}>
          <Ionicons name="images-outline" size={30} color="white"/>
        </CircularButton>

        <CircularButton size={95} onPress={takePicture} style={styles.bigButton}/>

        <CircularButton size={75} style={styles.button} onPress={() => {
          setCameraFacing(prev => prev === "back" ? "front" : "back")
        }}>
          <Ionicons name="camera-reverse-outline" size={35} color="white"/>
        </CircularButton>
      </View>

      <CircularButton size={60} style={styles.loneButton} onPress={() => {

      }}>
        <Ionicons name="map-outline" size={26} color="white"/>
      </CircularButton>
    </View>
  );
}


const statusbarHeight = Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 20;

const styles = StyleSheet.create({
  text: {
    fontFamily: "monospace",
    color: "white"
  },
  button: {
    backgroundColor: "transparent",
    borderWidth: 3,
    borderColor: "white",
  },
  bigButton: {
    backgroundColor: "transparent",
    borderWidth: 5,
    borderColor: "white"
  },
  loneButton: {
    position: "absolute",
    top: 10 + statusbarHeight,
    right: 20,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "white"
  },
  buttonRow: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly"
  }
});
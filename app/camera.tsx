import CircularButton from "@/components/CircularButton";
import { CameraRatio, CameraView, useCameraPermissions } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { useRouteInfo } from "expo-router/build/hooks";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, ToastAndroid, View } from "react-native";

type CameraFacing = "back" | "front";

export default function Camera() {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraFacing, setCameraFacing] = useState<CameraFacing>("back")
  const [cameraReady, setCameraReady] = useState(false);

  const routeInfo = useRouteInfo();
  const cameraRef = useRef<CameraView>(null);

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
          ratio={"3:4" as CameraRatio}
          facing={cameraFacing}
        />
      )}

      <CircularButton size={100} title="" onPress={takePicture} style={styles.shutterButton}/>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: "monospace",
    color: "white"
  },
  shutterButton: {
    position: "absolute",
    bottom: 50,
    left: "50%",
    transform: [{ translateX: -50 }],
    backgroundColor: "transparent",
    borderWidth: 5,
    borderColor: "white"
  }
});
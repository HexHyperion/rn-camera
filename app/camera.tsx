import { CameraRatio, CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

type CameraFacing = "back" | "front";

export default function Camera() {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraFacing, setCameraFacing] = useState<CameraFacing>("back")
  const [cameraReady, setCameraReady] = useState(false);

  const cameraRef = useRef<CameraView>(null);

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
        >
        </CameraView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: "monospace",
    color: "white"
  }
});
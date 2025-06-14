import CircularButton from "@/components/CircularButton";
import RadioButtonGroup from "@/components/RadioButtonGroup";
import Ionicons from "@expo/vector-icons/Ionicons";
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { CameraRatio, CameraView, useCameraPermissions } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { useNavigation, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Platform, StatusBar, StyleSheet, Text, ToastAndroid, View } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

type CameraFacing = "back" | "front";

const ALBUM_NAME = "SU Camera App";

export default function Camera() {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraFacing, setCameraFacing] = useState<CameraFacing>("back")
  const [cameraReady, setCameraReady] = useState(false);

  const [zoom, setZoom] = useState(0);
  const [torch, setTorch] = useState(false);
  const [availableSizes, setAvailableSizes] = useState<string[]>([
    "640x480", "800x600", "1024x768",
    "1280x720", "1600x1200", "1920x1080",
    "2560x1920", "4000x3000", "6000x4000",
    "6400x4800", "7680x4320", "8192x6144"
  ]);
  const [size, setSize] = useState("4000x3000");
  const [ratio, setRatio] = useState<CameraRatio>("4:3");

  const navigation = useNavigation();
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const bottomSheetRef = useRef<BottomSheetMethods>(null);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });

    // Doesn't work
    (async () => {
      if (cameraRef.current) {
        const sizes = await cameraRef.current.getAvailablePictureSizesAsync();
        setAvailableSizes(sizes);
      }
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        let album = await MediaLibrary.getAlbumAsync(ALBUM_NAME);
        if (!album) {
          const asset = await MediaLibrary.createAssetAsync(photo.uri);
          album = await MediaLibrary.createAlbumAsync(ALBUM_NAME, asset, false);
        }
        else {
          await MediaLibrary.createAssetAsync(photo.uri, album);
        }
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
    <GestureHandlerRootView>
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
          zoom={zoom}
          enableTorch={torch}
          pictureSize={size}
          ratio={ratio}
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
        router.navigate("/map");
      }}>
        <Ionicons name="map-outline" size={26} color="white"/>
      </CircularButton>

      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={["4%", "30%", "60%"]}
        backgroundStyle={{ backgroundColor: "#000000dd" }}
        handleIndicatorStyle={{ backgroundColor: "white" }}>
        <BottomSheetView style={{ padding: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 25 }}>
          <Text/>
          <RadioButtonGroup
            title="camera zoom"
            columns={6}
            data={["0", "0.25", "0.5", "0.75", "1"]}
            initialSelected={zoom.toString()}
            onChange={(value) => setZoom(parseFloat(value) ?? 0)}/>
          <RadioButtonGroup
            title="torch mode"
            columns={2}
            data={["torch off", "torch on"]}
            initialSelected={torch ? "torch on" : "torch off"}
            onChange={(value) => setTorch(value === "torch on")}/>
          <RadioButtonGroup
            title="aspect ratio"
            columns={3}
            data={["4:3", "16:9", "1:1"]}
            initialSelected={ratio}
            onChange={(value) => setRatio(value as CameraRatio)}/>
          <RadioButtonGroup
            title="picture size"
            columns={3}
            data={availableSizes}
            initialSelected={size}
            onChange={(value) => setSize(value)}/>

        </BottomSheetView>
      </BottomSheet>
    </View>
    </GestureHandlerRootView>
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
    borderWidth: 2,
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
    bottom: 70,
    left: 0,
    right: 0,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly"
  }
});
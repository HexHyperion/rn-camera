import CircularButton from "@/components/CircularButton";
import RadioButtonGroup from "@/components/RadioButtonGroup";
import Ionicons from "@expo/vector-icons/Ionicons";
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraRatio, CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import * as MediaLibrary from "expo-media-library";
import { useFocusEffect, useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Dimensions, Platform, StatusBar, StyleSheet, Text, ToastAndroid, View } from "react-native";

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
  const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);
  const [instanceKey, setInstanceKey] = useState(0);
  const [layoutFix, setLayoutFix] = useState(0);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation();
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const bottomSheetRef = useRef<BottomSheetMethods>(null);
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  useEffect(() => {
    let isMounted = true;
    navigation.setOptions({
      headerShown: false,
    });
    (async () => {
      if (cameraRef.current) {
        const sizes = await cameraRef.current.getAvailablePictureSizesAsync();
        if (isMounted) setAvailableSizes(sizes);
      }
    })();
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (isMounted) setLocationPermission(status);
    })();
    setLoading(false);
    return () => { isMounted = false; };
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        let album = await MediaLibrary.getAlbumAsync(ALBUM_NAME);
        let asset;
        if (!album) {
          asset = await MediaLibrary.createAssetAsync(photo.uri);
          album = await MediaLibrary.createAlbumAsync(ALBUM_NAME, asset, false);
        }
        else {
          asset = await MediaLibrary.createAssetAsync(photo.uri, album);
        }

        try {
          if (locationPermission === "granted") {
            const location = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Low,
              timeInterval: 5000,
            });
            const photoLocation = {
              id: asset.id,
              uri: asset.uri,
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              timestamp: Date.now()
            };
            const key = "photoLocations";
            const prev = await AsyncStorage.getItem(key);
            let arr = [];
            if (prev) {
              arr = JSON.parse(prev);
            }
            arr.push(photoLocation);
            await AsyncStorage.setItem(key, JSON.stringify(arr));
          }
          else {
            ToastAndroid.showWithGravity(
              "Location permission not granted, location data not saved.",
              ToastAndroid.SHORT,
              ToastAndroid.CENTER
            );
          }
        }
        catch (e) {
          ToastAndroid.showWithGravity(
            "Failed to save location data.",
            ToastAndroid.SHORT,
            ToastAndroid.CENTER
          );
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

  useFocusEffect(
    useCallback(() => {
      setInstanceKey(k => k + 1);
    }, [])
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "black" }}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return (
    <View
      key={instanceKey}
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        position: "relative"
      }}
      onLayout={() => setLayoutFix(f => f + 1)}
    >
      {!permission && (
        <Text style={styles.text}>No access to the camera!</Text>
      )}
      {cameraReady && (
        <CameraView
          ref={cameraRef}
          style={
            ratio === "1:1"
              ? {
                  width: Math.min(screenWidth, screenHeight),
                  height: Math.min(screenWidth, screenHeight),
                  alignSelf: "center",
                }
              : { flex: 1, width: "100%", height: "100%" }
          }
          facing={cameraFacing}
          zoom={zoom}
          enableTorch={torch}
          pictureSize={size}
          ratio={ratio}
          key={layoutFix}
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
        snapPoints={["4%"]}
        backgroundStyle={{ backgroundColor: "#000000dd" }}
        handleIndicatorStyle={{ backgroundColor: "white" }}>
        <BottomSheetView style={{ padding: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 25 }}>
          <Text/>
          <RadioButtonGroup
            title="camera zoom"
            columns={6}
            data={["0", "0.15", "0.25", "0.5", "0.75", "1"]}
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
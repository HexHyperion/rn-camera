import CircularButton from "@/components/CircularButton";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as MediaLibrary from "expo-media-library";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, ToastAndroid, View } from "react-native";

export default function Viewer() {
  const [photo, setPhoto] = useState<MediaLibrary.Asset | null>(null);
  const [loading, setLoading] = useState(true);

  const params = useLocalSearchParams();
  const id = typeof params.id === "string" ? params.id : undefined;
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        const asset = await MediaLibrary.getAssetInfoAsync(id);
        if (isMounted) setPhoto(asset as MediaLibrary.Asset);
      }
      catch (e) {
        ToastAndroid.showWithGravity(
          "Failed to load photo.",
          ToastAndroid.SHORT,
          ToastAndroid.CENTER
        );
        if (isMounted) router.back();
      }
      finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [id, router]);

  const handleDelete = useCallback(async () => {
    if (!photo) {
      return;
    }
    try {
      await MediaLibrary.deleteAssetsAsync([photo.id]);
      const key = "photoLocations";
      const data = await AsyncStorage.getItem(key);
      if (data) {
        let photoLocations = JSON.parse(data);
        photoLocations = photoLocations.filter((p: any) => p.id !== photo.id);
        await AsyncStorage.setItem(key, JSON.stringify(photoLocations));
      }
      ToastAndroid.showWithGravity(
        "Photo deleted.",
        ToastAndroid.SHORT,
        ToastAndroid.CENTER
      );
      router.back();
    }
    catch (e) {
      ToastAndroid.showWithGravity(
        "Failed to delete photo.",
        ToastAndroid.LONG,
        ToastAndroid.CENTER
      );
    }
  }, [photo, router]);

  const handleShare = useCallback(async () => {
    if (!photo) {
      return;
    }
    try {
      await Sharing.shareAsync(photo.uri);
    }
    catch (e) {
      ToastAndroid.showWithGravity(
        "Failed to share photo.",
        ToastAndroid.LONG,
        ToastAndroid.CENTER
      );
    }
  }, [photo]);

  return (
    <View style={{ flex: 1, backgroundColor: "black", position: "relative" }}>
      {loading && (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="white" />
        </View>
      )}
      {!loading && !photo && (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={styles.text}>Photo not found.</Text>
          <CircularButton size={80} onPress={() => router.back()}>
            <Ionicons name="arrow-back-outline" size={32} color="white" />
          </CircularButton>
        </View>
      )}
      {!loading && photo && (
        <>
          <Text style={{...styles.text, textAlign: "center", position: "absolute", width: "100%"}} numberOfLines={1}>
            {photo.width && photo.height ? `${photo.width}x${photo.height}` : "Photo"}
          </Text>
          <Image
            source={{ uri: photo.uri }}
            style={{ flex: 1, width: "100%", resizeMode: "contain" }}
          />
        </>
      )}
      {!loading && photo && (
        <View style={styles.buttonRow}>
          <CircularButton size={80} onPress={handleShare}>
            <Ionicons name="share-outline" size={32} color="white" />
          </CircularButton>
          <CircularButton size={80} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={32} color="white" />
          </CircularButton>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: "monospace",
    color: "white"
  },
  buttonRow: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingBlock: 12,
    maxHeight: 90,
  }
});
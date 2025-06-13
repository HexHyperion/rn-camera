import CircularButton from "@/components/CircularButton";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as MediaLibrary from "expo-media-library";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, ToastAndroid, View } from "react-native";

export default function Viewer() {
  const [photo, setPhoto] = useState<MediaLibrary.Asset | null>(null);
  const [loading, setLoading] = useState(true);

  const { id } = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      if (!id || typeof id !== "string") {
        return;
      }
      try {
        const asset = await MediaLibrary.getAssetInfoAsync(id);
        setPhoto(asset as MediaLibrary.Asset);
      }
      catch (e) {
        ToastAndroid.showWithGravity(
          "Failed to load photo.",
          ToastAndroid.SHORT,
          ToastAndroid.CENTER
        );
        router.back();
      }
      finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleDelete = async () => {
    if (!photo) {
      return;
    }
    try {
      await MediaLibrary.deleteAssetsAsync([photo.id]);
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
  };

  const handleShare = async () => {
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
  };

  return (
    <View style={{ flex: 1, backgroundColor: "black", position: "relative" }}>
      {loading && (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={styles.text}>Loading...</Text>
        </View>
      )}
      {!loading && photo && (
        <>
          <Text style={{...styles.text, textAlign: "center", position: "absolute", width: "100%"}} numberOfLines={1}>
            {`${photo.width}x${photo.height}` || "Photo"}
          </Text>
          <Image
            source={{ uri: photo.uri }}
            style={{ flex: 1, width: "100%", resizeMode: "contain" }}
          />
        </>
      )}
      <View style={styles.buttonRow}>
        <CircularButton size={80} onPress={handleShare}>
          <Ionicons name="share-outline" size={32} color="white" />
        </CircularButton>
        <CircularButton size={80} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={32} color="white" />
        </CircularButton>
      </View>
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
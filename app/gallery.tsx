import CircularButton from "@/components/CircularButton";
import RectangularButton from "@/components/RectangularButton";
import * as MediaLibrary from "expo-media-library";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, ToastAndroid, View } from "react-native";

export default function Gallery() {
  const [hasPermissions, setHasPermissions] = useState(false);
  const [photos, setPhotos] = useState<MediaLibrary.Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [galleryColumns, setGalleryColumns] = useState(3);

  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setHasPermissions(status === "granted");
      if (status !== "granted") {
        ToastAndroid.showWithGravity(
          "Permission to access media library is required.",
          ToastAndroid.SHORT,
          ToastAndroid.CENTER
        );
      }
    })();
  }, []);

  const getPhotos = async () => {
    const readPhotos = await MediaLibrary.getAssetsAsync({
      mediaType: MediaLibrary.MediaType.photo,
      first: 99,
      sortBy: [MediaLibrary.SortBy.creationTime],
    });
    setPhotos(readPhotos.assets);
    setLoading(false);
    if (readPhotos.assets.length === 0) {
      ToastAndroid.showWithGravity(
        "No photos found in the media library.",
        ToastAndroid.SHORT,
        ToastAndroid.CENTER
      );
    }
    else {
      ToastAndroid.showWithGravity(
        `Found ${readPhotos.assets.length} photos.`,
        ToastAndroid.SHORT,
        ToastAndroid.CENTER
      );
    }
  }

  useEffect(() => {
    if (hasPermissions) {
      getPhotos();
      ToastAndroid.showWithGravity(
        "Access to media library granted, loading photos...",
        ToastAndroid.SHORT,
        ToastAndroid.CENTER
      );
    }
  }, [hasPermissions]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {loading && <Text style={styles.text}>Loading...</Text>}
      {!loading && !hasPermissions && (
        <Text style={styles.text}>No access to the media library!</Text>
      )}
      {!loading && hasPermissions && photos.length === 0 && (
        <Text style={styles.text}>No photos found in the media library.</Text>
      )}
      {!loading && hasPermissions && (
        <FlatList
        numColumns={galleryColumns}
        style={{ flex: 1, width: "100%" }}
        key={galleryColumns}
        data={photos}
        renderItem={({ item }) => (
          <View
            style={{
              flex: 1,
              margin: 5,
              aspectRatio: 1,
              backgroundColor: "#ccc",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image source={{ uri: item.uri }} style={{ width: "100%", height: "100%", backgroundColor: "#1a1a1a" }} />
          </View>
        )}
        keyExtractor={(item) => item.id}
        />
      )}

      <View style={styles.buttonRow}>
        <RectangularButton title="Layout" onPress={() => {}} />
        <CircularButton size={90} title="Camera" onPress={() => {router.navigate("/camera")}} />
        <RectangularButton title="Delete" onPress={() => {}} />
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
  }
});
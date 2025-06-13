import CircularButton from "@/components/CircularButton";
import GalleryPhoto from "@/components/GalleryPhoto";
import RectangularButton from "@/components/RectangularButton";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as MediaLibrary from "expo-media-library";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, ToastAndroid, View } from "react-native";

const ALBUM_NAME = "SU Camera App";

export default function Gallery() {
  const [hasPermissions, setHasPermissions] = useState(false);
  const [photos, setPhotos] = useState<MediaLibrary.Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [listMode, setListMode] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setHasPermissions(status === "granted");
      if (status !== "granted") {
        ToastAndroid.showWithGravity(
          "Permission to access the media library is required.",
          ToastAndroid.SHORT,
          ToastAndroid.CENTER
        );
      }
    })();
  }, []);

  const getPhotos = async () => {
    setLoading(true);
    let album = await MediaLibrary.getAlbumAsync(ALBUM_NAME);
    let assets: MediaLibrary.Asset[] = [];
    if (album) {
      const readPhotos = await MediaLibrary.getAssetsAsync({
        album: album.id,
        mediaType: MediaLibrary.MediaType.photo,
        first: 99,
        sortBy: [MediaLibrary.SortBy.creationTime],
      });
      assets = readPhotos.assets;
    }
    setPhotos(assets);
    setLoading(false);
    setSelected([]);
  }

  useFocusEffect(
    useCallback(() => {
      if (hasPermissions) {
        getPhotos();
      }
    }, [hasPermissions])
  );


  const handlePhotoPress = (id: string) => {
    if (selected.length > 0) {
      setSelected((prev) => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
    }
    else {
      router.navigate({ pathname: "/viewer", params: { id } });
    }
  };
  const handlePhotoLongPress = (id: string) => {
    if (selected.length === 0) {
      setSelected([id]);
    }
  };
  const handleDelete = async () => {
    if (selected.length === 0) return;
    try {
      await MediaLibrary.deleteAssetsAsync(selected);
      ToastAndroid.showWithGravity(
        `Deleted ${selected.length} photo(s).`,
        ToastAndroid.SHORT,
        ToastAndroid.CENTER
      );
      setSelected([]);
      getPhotos();
    }
    catch (error) {
      ToastAndroid.showWithGravity(
        "Failed to delete selected photos.",
        ToastAndroid.LONG,
        ToastAndroid.CENTER
      );
      getPhotos();
    }
  };


  const getPaddedPhotos = () => {
    if (listMode) {
      return photos;
    }
    const remainder = photos.length % 3;
    if (remainder === 0) {
      return photos;
    }
    const padding = Array.from({ length: 3 - remainder }, (_, i) => ({ id: `empty-${i}`, isPlaceholder: true }));
    return [...photos, ...padding];
  };

  const isPlaceholder = (item: any): item is { id: string; isPlaceholder: boolean } => {
    return item && item.isPlaceholder === true;
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      {loading && (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={styles.text}>Loading...</Text>
        </View>
      )}
      {!loading && !hasPermissions && (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={styles.text}>No access to the media library!</Text>
        </View>
      )}
      {!loading && hasPermissions && photos.length === 0 && (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={styles.text}>No photos found in the media library.</Text>
          <RectangularButton
            title="refresh"
            onPress={getPhotos}
            style={{ marginTop: 15 }}
          />
        </View>
      )}
      {!loading && hasPermissions && (
        <FlatList
        numColumns={listMode ? 1 : 3}
        style={{ flex: 1, width: "100%" }}
        key={listMode ? "list" : "grid"}
        data={getPaddedPhotos()}
        renderItem={({ item }) => (
          isPlaceholder(item) ? (
            <View style={{ flex: 1, aspectRatio: 1, margin: 5, backgroundColor: 'transparent' }} />
          ) : (
            <GalleryPhoto
              item={item}
              selected={selected.includes(item.id)}
              onPress={() => handlePhotoPress(item.id)}
              onLongPress={() => handlePhotoLongPress(item.id)}
            />
          )
        )}
        keyExtractor={(item) => item.id}
        />
      )}

      <View style={styles.buttonRow}>
        <RectangularButton style={{width: 125}} title={listMode ? "grid mode" : "list mode"} onPress={() => {
          setListMode(!listMode);
          setSelected([]);
        }} />
        <View style={styles.bigButtonWrapper}/>
        <CircularButton size={85} onPress={() => {router.navigate("/camera")}}>
          <Ionicons name="camera-outline" size={35} color="white" />
        </CircularButton>
        <RectangularButton
          style={{width: 125}}
          title={`delete${selected.length > 0 ? ` (${selected.length})` : ""}`}
          onPress={handleDelete}
          disabled={selected.length === 0}
        />
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
  },
  bigButtonWrapper: {
    width: 112,
    height: 112,
    borderRadius: 56,
    position: "absolute",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
});
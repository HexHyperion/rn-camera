import CircularButton from "@/components/CircularButton";
import GalleryPhoto from "@/components/GalleryPhoto";
import RectangularButton from "@/components/RectangularButton";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as MediaLibrary from "expo-media-library";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, ToastAndroid, View } from "react-native";

const ALBUM_NAME = "SU Camera App";

export default function Gallery() {
  const [hasPermissions, setHasPermissions] = useState(false);
  const [photos, setPhotos] = useState<MediaLibrary.Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [listMode, setListMode] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (isMounted) setHasPermissions(status === "granted");
      if (status !== "granted") {
        if (isMounted) setLoading(false);
        return;
      }
    })();
    return () => { isMounted = false; };
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

    try {
      const key = "photoLocations";
      const data = await AsyncStorage.getItem(key);
      if (data) {
        let photoLocations = JSON.parse(data);
        const existingIds = new Set(assets.map((a) => a.id));
        const filtered = photoLocations.filter((photo: any) => existingIds.has(photo.id));
        if (filtered.length !== photoLocations.length) {
          await AsyncStorage.setItem(key, JSON.stringify(filtered));
        }
      }
    }
    catch (e) {}
  }

  useFocusEffect(
    useCallback(() => {
      if (hasPermissions) {
        getPhotos();
      }
    }, [hasPermissions])
  );


  const handlePhotoPress = useCallback((id: string) => {
    if (selected.length > 0) {
      setSelected((prev) => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
    }
    else {
      router.navigate({ pathname: "/viewer", params: { id } });
    }
  }, [selected, router]);
  const handlePhotoLongPress = useCallback((id: string) => {
    if (selected.length === 0) {
      setSelected([id]);
    }
  }, [selected]);
  const handleDelete = useCallback(async () => {
    if (selected.length === 0) return;
    try {
      await MediaLibrary.deleteAssetsAsync(selected);
      const key = "photoLocations";
      const data = await AsyncStorage.getItem(key);
      if (data) {
        let photoLocations = JSON.parse(data);
        photoLocations = photoLocations.filter((photo: any) => !selected.includes(photo.id));
        await AsyncStorage.setItem(key, JSON.stringify(photoLocations));
      }
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
  }, [selected, getPhotos]);


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
          <ActivityIndicator size="large" color="white" />
        </View>
      )}
      {!loading && !hasPermissions && (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={styles.text}>No permission to access photos.</Text>
        </View>
      )}
      {!loading && hasPermissions && photos.length === 0 && (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={styles.text}>No photos found.</Text>
        </View>
      )}
      {!loading && hasPermissions && photos.length > 0 && (
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
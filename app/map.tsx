import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ListRenderItem } from "react-native";
import { Image, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MapView, { Marker } from "react-native-maps";

export default function Map() {
  const [photoLocations, setPhotoLocations] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [photosAtLocation, setPhotosAtLocation] = useState<any[]>([]);

  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheetMethods>(null);

  useEffect(() => {
    (async () => {
      const key = "photoLocations";
      const data = await AsyncStorage.getItem(key);
      if (data) {
        setPhotoLocations(JSON.parse(data));
      }
    })();
  }, []);

  const groupedPhotos = useMemo(() => {
    const groups: Record<string, any[]> = {};
    photoLocations.forEach(photo => {
      if (photo.latitude && photo.longitude) {
        const lat = photo.latitude.toFixed(5);
        const lng = photo.longitude.toFixed(5);
        const key = `${lat},${lng}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(photo);
      }
    });
    return groups;
  }, [photoLocations]);

  const handleMarkerPress = useCallback((lat: number, lng: number) => {
    setSelectedLocation({ latitude: lat, longitude: lng });
    const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;
    setPhotosAtLocation(groupedPhotos[key] || []);
    bottomSheetRef.current?.expand?.();
  }, [groupedPhotos]);

  const renderPhotoItem: ListRenderItem<any> = ({ item }) => {
    if (!item) return null;
    return (
      <View style={{ flex: 1, flexDirection: "column", justifyContent: "space-between", backgroundColor: "#0f0f0f", borderRadius: 10, padding: 10, minWidth: 250 }}>
        <Image
          source={{ uri: item.uri }}
          style={{ flex: 1, width: "100%", height: undefined, borderRadius: 8, marginBottom: 5, resizeMode: "cover", alignSelf: "stretch" }}
        />
        <View style={{ marginTop: 5 }}>
          <Text style={{ color: 'white', fontFamily: 'monospace' }}>
            <Text style={{ fontWeight: 'bold' }}>Lat.:</Text> {item.latitude.toFixed(5)}
          </Text>
          <Text style={{ color: 'white', fontFamily: 'monospace' }}>
            <Text style={{ fontWeight: 'bold' }}>Long.:</Text> {item.longitude.toFixed(5)}
          </Text>
        </View>
      </View>
    )
  };

  return (
    <GestureHandlerRootView>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", position: "relative" }}>
        <MapView
          ref={mapRef}
          style={{ width: "100%", height: "100%" }}
          initialRegion={{
            latitude: 50.06571839718029,
            longitude: 19.94302213951292,
            latitudeDelta: 0.3,
            longitudeDelta: 0.3
          }}>
          {Object.entries(groupedPhotos).map(([key, photos]) => {
            const { latitude, longitude } = photos[0];
            return (
              <Marker
                key={key}
                coordinate={{ latitude, longitude }}
                onPress={() => handleMarkerPress(latitude, longitude)}
              />
            );
          })}
        </MapView>
        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={["4%", "40%"]}
          backgroundStyle={{ backgroundColor: "black" }}
          handleIndicatorStyle={{ backgroundColor: "white" }}>
            {selectedLocation && photosAtLocation.length > 0 ? (
              <BottomSheetFlatList
                data={photosAtLocation.filter(item => item.id && item.uri)}
                horizontal
                keyExtractor={(item: any) => item.id}
                renderItem={renderPhotoItem}
                contentContainerStyle={{ gap: 10 }}
                style={{ padding: 10, marginBlock: 10 }}
              />
            ) : (
              <Text style={styles.text}>Tap a marker to see photos at that location.</Text>
            )}
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: "monospace",
    color: "white"
  },
});
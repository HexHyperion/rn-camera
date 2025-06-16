import MapTooltip from "@/components/MapTooltip";
import BottomSheet, { BottomSheetFlatList, BottomSheetView } from "@gorhom/bottom-sheet";
import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ListRenderItem } from "react-native";
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

export default function Map() {
  const [photoLocations, setPhotoLocations] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [photosAtLocation, setPhotosAtLocation] = useState<any[]>([]);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number, y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(true);

  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheetMethods>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      const key = "photoLocations";
      const data = await AsyncStorage.getItem(key);
      if (isMounted) {
        if (data) {
          setPhotoLocations(JSON.parse(data));
        }
        setLoading(false);
      }
    })();
    return () => { isMounted = false; };
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

  const handleMarkerPress = useCallback(async (lat: number, lng: number) => {
    const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;
    const location = { latitude: lat, longitude: lng };

    setSelectedLocation(location);
    const photos = groupedPhotos[key] || [];
    setPhotosAtLocation(photos);
    if (!selectedPhotoId) {
      setSelectedPhotoId(photos.length > 0 ? photos[0].id : null);
    }
    setIsDragging(false);

    if (mapRef.current) {
      try {
        const point = await mapRef.current.pointForCoordinate(location);
        setTooltipPosition(point);
      }
      catch {
        setTooltipPosition(null);
      }
    }

    bottomSheetRef.current?.expand?.();
  }, [groupedPhotos, selectedPhotoId]);

  const renderPhotoItem: ListRenderItem<any> = ({ item }) => {
    if (!item) return null;
    const isSelected = item.id === selectedPhotoId;
    return (
      <TouchableOpacity
        style={{ ...styles.photoListItem, borderColor: isSelected ? "white" : "transparent" }}
        onPress={() => setSelectedPhotoId(item.id)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: item.uri }}
          style={{ flex: 1, width: "100%", height: undefined, borderRadius: 8, marginBottom: 5, resizeMode: "cover", alignSelf: "stretch", opacity: isSelected ? 0.7 : 1 }}
        />
        <Text style={styles.text}>Lat.: {item.latitude}</Text>
        <Text style={styles.text}>Long.: {item.longitude}</Text>
      </TouchableOpacity>
    );
  };

  const handleMapPress = useCallback(() => {
    if (!isDragging) {
      setSelectedLocation(null);
      setPhotosAtLocation([]);
      setSelectedPhotoId(null);
      setTooltipPosition(null);
      bottomSheetRef.current?.snapToIndex?.(0);
    }
  }, [isDragging]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  if (!photoLocations.length) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={styles.text}>No photo locations found.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={{ width: "100%", height: "100%" }}
        initialRegion={{
          latitude: 50.06571839718029,
          longitude: 19.94302213951292,
          latitudeDelta: 0.3,
          longitudeDelta: 0.3,
        }}
        onPanDrag={() => setIsDragging(true)}
        onPress={handleMapPress}
        onRegionChangeComplete={async () => {
          if (selectedLocation && mapRef.current) {
            try {
              const point = await mapRef.current.pointForCoordinate(selectedLocation);
              setTooltipPosition(point);
            }
            catch {
              setTooltipPosition(null);
            }
          }
          setIsDragging(false);
        }}
      >

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

      {/* The native Callout is kinda broken, to say nicely, therefore
          I use a custom one to be absolutely sure it shows up on Android */}
      {tooltipPosition && !isDragging && photosAtLocation.length > 0 &&
        <MapTooltip
          markerX={tooltipPosition.x}
          markerY={tooltipPosition.y}
          photo={photosAtLocation.find(p => p.id === selectedPhotoId) || photosAtLocation[0]}
        />
      }

      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={["4%", "40%"]}
        backgroundStyle={{ backgroundColor: "black" }}
        handleIndicatorStyle={{ backgroundColor: "white" }}
      >
        {selectedLocation && photosAtLocation.length > 0 ? (
          <BottomSheetFlatList
            data={photosAtLocation.filter((item) => item.id && item.uri)}
            horizontal
            keyExtractor={(item: any) => item.id}
            renderItem={renderPhotoItem}
            contentContainerStyle={{ gap: 10 }}
            style={{ margin: 10 }}
            extraData={selectedPhotoId}
          />
        ) : (
          <BottomSheetView style={{ padding: 20, alignItems: "center" }}>
            <Text style={styles.text}>
              Tap a marker to see photos at that location.
            </Text>
          </BottomSheetView>
        )}
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: "monospace",
    color: "white"
  },
  photoListItem: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: "#0f0f0f",
    borderRadius: 10,
    padding: 5,
    minWidth: 250,
    borderWidth: 5
  }
});
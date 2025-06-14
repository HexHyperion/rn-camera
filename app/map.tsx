import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MapView from "react-native-maps";

export default function Map() {

  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheetMethods>(null);

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
      <MapView
        ref={mapRef}
        style={{ width: "100%", height: "100%" }}
        initialRegion={{
          latitude: 56.29058753030209,
          longitude: 12.846723020223669,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03
        }}/>

      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={["4%", "30%"]}
        backgroundStyle={{ backgroundColor: "black" }}
        handleIndicatorStyle={{ backgroundColor: "white" }}>
        <BottomSheetView style={{ padding: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 25 }}>
          <Text/>

        </BottomSheetView>
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
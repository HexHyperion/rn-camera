import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function MapTooltip({ markerX, markerY, photo, style }: { markerX: number, markerY: number, photo: any, style?: any }) {
  return (
    <View
      style={[styles.tooltipContainer, { top: markerY - 100, left: markerX - 100 }, style]}
      pointerEvents="none"
    >
      <Text style={styles.tooltipText}>Photo #{photo?.id}</Text>
      <Text style={styles.tooltipText}>
        {photo?.timestamp ? new Date(photo.timestamp).toLocaleString() : "No date"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tooltipContainer: {
    position: "absolute",
    width: 200,
    padding: 8,
    backgroundColor: "#000000aa",
    borderColor: "white",
    borderWidth: 2,
    borderRadius: 5,
    zIndex: 1000,
  },
  tooltipText: {
    color: "white",
    fontFamily: "monospace",
    fontSize: 12,
  },
});

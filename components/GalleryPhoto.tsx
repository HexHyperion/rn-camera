import * as MediaLibrary from 'expo-media-library';
import React, { useCallback } from 'react';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';

export default function RectangularButton({item, onPress, onLongPress, selected} : {item: MediaLibrary.Asset, onPress?: () => void, onLongPress?: () => void, selected?: boolean}) {
  const handlePress = useCallback(() => {
    onPress?.();
  }, [onPress]);
  const handleLongPress = useCallback(() => {
    onLongPress?.();
  }, [onLongPress]);
  return (
    <TouchableOpacity style={[styles.button, selected && styles.selected]} onPress={handlePress} onLongPress={handleLongPress}>
      <Image source={{ uri: item.uri }} style={[styles.image, selected && styles.selectedImage]} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    margin: 5,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    backgroundColor: "black",
    borderRadius: 2,
  },
  selected: {
    padding: 5,
    borderWidth: 5,
    borderRadius: 10,
    borderColor: "white",
    borderStyle: "solid",
  },
  selectedImage: {
    opacity: 0.7,
  }
})
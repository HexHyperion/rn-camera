import React, { ReactNode, useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';

export default function CircularButton({title, size, style, onPress, children} : {title?: string, size: number, style?: ViewStyle, onPress: () => void, children?: ReactNode}) {
  const handlePress = useCallback(() => {
    onPress();
  }, [onPress]);
  return (
    <TouchableOpacity style={{...styles.button, width: size, height: size, borderRadius: size/2, ...style}} onPress={handlePress}>
      {children ? children : <Text style={styles.text}>{title ?? ""}</Text>}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    backgroundColor: "black",
    borderWidth: 2,
    borderColor: "white",
  },
  text: {
    fontFamily: "monospace",
    color: "white",
    textAlign: "center",
  }
})
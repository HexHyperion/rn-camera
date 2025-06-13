import React from 'react'
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native'

export default function CircularButton({title, size, style, onPress} : {title: string, size: number, style?: ViewStyle, onPress: () => void}) {
  return (
    <TouchableOpacity style={{...style, ...styles.button, width: size, height: size, borderRadius: size/2}} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
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
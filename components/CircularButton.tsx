import React from 'react'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'

export default function CircularButton({title, size, onPress} : {title: string, size: number, onPress: () => void}) {
  return (
    <TouchableOpacity style={{...styles.button, width: size, height: size, borderRadius: size/2}} onPress={onPress}>
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
    color: "white"
  }
})
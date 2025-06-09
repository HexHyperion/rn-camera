import React from 'react'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'

export default function RectangularButton({title, onPress} : {title: string, onPress: () => void}) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingInline: 10,
    paddingBlock: 5,
    backgroundColor: "black",
    borderWidth: 2,
    borderColor: "white",
    borderRadius: 5
  },
  text: {
    fontFamily: "monospace",
    color: "white"
  }
})
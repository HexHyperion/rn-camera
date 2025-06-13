import { StyleSheet, Text, View } from 'react-native';

export default function RadioButton({value, checked = false, onPress} : {value: string, checked?: boolean, onPress?: (value: string) => void}) {
  return (
    <View style={styles.wrapper} onTouchEnd={() => {
      onPress?.(value);
    }}>
      <View style={[styles.radio, checked && { backgroundColor: "white" }]}/>
      <Text style={styles.title}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginInline: 10,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "white",
    backgroundColor: "transparent",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  title: {
    fontFamily: "monospace",
    color: "white"
  }
})
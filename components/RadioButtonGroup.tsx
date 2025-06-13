import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import RadioButton from './RadioButton';

export default function RadioButtonGroup({title, columns, data, onChange, initialSelected} : {title: string, columns: number, data: string[], onChange: (value: string) => void, initialSelected?: string}) {
  const [selected, setSelected] = useState<string | null>(initialSelected ?? null);

  const handlePress = (value: string) => {
    setSelected(value);
    onChange(value);
  };

  return (
    <View style={styles.container}>
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.contentContainer}
        data={data}
        keyExtractor={(item) => item}
        numColumns={columns}
        key={columns}
        renderItem={({item}) => (
          <View style={styles.itemWrapper}>
            <RadioButton
              value={item}
              checked={selected === item}
              onPress={handlePress}
            />
          </View>
        )}
        ListHeaderComponent={() => (
          <Text style={styles.title}>{title}</Text>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  list: {
    width: '100%',
  },
  contentContainer: {
    width: '100%',
  },
  itemWrapper: {
    flex: 1,
    alignItems: 'stretch',
    marginBottom: 10,
  },
  title: {
    fontFamily: "monospace",
    color: "white",
    fontSize: 18,
    marginBottom: 8,
    marginLeft: 10,
    fontWeight: "bold",
  }
})
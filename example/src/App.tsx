import React, { useCallback, useState } from 'react';
import { StyleSheet, View, TextInput, Button, Text } from 'react-native';
import { useMeCabIpaDic } from 'react-native-mecab';

export default function App() {
  const [inputText, setInputText] = useState('これは猫です。');
  const [enabled, setEnabled] = useState(true);

  const { state, result, error } = useMeCabIpaDic(inputText, { enabled });

  const toggleEnabled = useCallback(() => {
    setEnabled((previousValue) => !previousValue);
  }, []);

  return (
    <View style={styles.container}>
      <Button
        title={enabled ? 'Disable MeCab' : 'Enable MeCab'}
        onPress={toggleEnabled}
      />
      <TextInput
        style={styles.input}
        onChangeText={setInputText}
        value={inputText}
      />
      {state === 'ok' ? (
        result.map((feature, index) => (
          <Text key={index}>
            {feature.surface} ({feature.reading ?? '?'})
          </Text>
        ))
      ) : state === 'loading' ? (
        <Text>Loading...</Text>
      ) : (
        <Text>{error.message ?? 'An unexpected error occurred.'}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: 200,
  },
});

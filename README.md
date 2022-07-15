# react-native-mecab

A mecab wrapper for React Native

## Table of Contents

1. Installation
   1. [Dependencies](#1-dependencies)
   2. [Install the Package](#2-install-the-package)
   3. [Provide the Dictionary Files](#3-provide-the-dictionary-files)
      1. [Preparing the dictionary files](#preparing-the-dictionary-files)
      2. [Installing the dictionary on Android](#installing-the-dictionary-on-android)
      3. [Installing the dictionary on iOS](#installing-the-dictionary-on-ios)
      4. [Finishing up](#finishing-up)
2. Usage
   1. [IPADic React Hook](#ipadic-react-hook)
   2. [MeCab Instance](#mecab-instance)
3. [Contributing](#contributing)
4. [License](#license)

## Installation

### 1. Dependencies

Before using this module, make sure that you have installed and properly linked the [react-native-fs module (follow this guide)](https://github.com/itinance/react-native-fs).

### 2. Install the Package

Open a Terminal in the directory of your project and run:

```sh
yarn add react-native-mecab
```

or

```sh
npm install react-native-mecab
```

### 3. Provide the Dictionary Files

MeCab requires some dictionary files to work. This module supports multiple dictionaries at the same time. Each dictionary has to be installed in a unique directory (dictionary directory) in the application's assets (on iOS the directory needs to be added to Copy Bundle Resources).

This repository provides an [already-compiled IPADic](#) for download. IPADic is one of the most widely used dictionaries for MeCab. If you don't know which dictionary to choose, IPADic is a decent choice.

#### Preparing the dictionary files

1. Download or compile the dictionary of choice ([click here to download a pre-compiled version of IPADic](#)).
2. The following dictionary files should be present in a dictionary directory: `char.bin`, `dicrc`, `left-id.def`, `matrix.bin`, `pos-id.def`, `rewrite.def`, `right-id.def`, `sys.dic`, `unk.dic`.

#### Installing the dictionary on Android

1. If it doesn't already exist, create the assets directory at the following path: `android/app/src/main/assets`.
2. Put the dictionary directory inside of the assets directory.
   - Examples:
     - `android/app/src/main/assets/ipadic`
     - `android/app/src/main/assets/dictionaries/ipadic`
     - `android/app/src/main/assets/dictionaries/naistdic`

#### Installing the dictionary on iOS

1. Open the `.xcworkspace` of you project's `ios` directory with XCode.
2. Drag and drop your dictionary directory into the main project. On the popup, make sure to select the following:
   - Check the `Copy items if needed` box.
   - Set the `Added folders` option to `Create folder references`.
3. Make sure that the added directory is colored blue in the project view. If it isn't, repeat step 2.
4. Add the dictionary directory to your project's `Copy Bundle Resources` setting:
   1. Navigate to TARGETS -> YourProjectName -> `Build Phases` tab -> Copy Bundle Resources
   2. Press the `+` button and add the dictionary directory you added earlier.

#### Finishing up

1. Make sure that the paths to the dictionary directory of the same type for both platforms are identical relative to the assets root (assets root being the assets folder on Android or the project root on iOS). For example, if you're using IPADic, the paths for both platforms could be one of the following:
   - IPADic in the root:
     - Android: `android/app/src/main/assets/ipadic`
     - iOS `<xcode-project-root>/ipadic`
   - IPADic in a subfolder:
     - Android: `android/app/src/main/assets/dictionaries/ipadic`
     - iOS `<xcode-project-root>/dictionaries/ipadic`
2. If you wish to use the `useMeCabIpaDic` hook, then make sure that you put the IPADic dictionary directory into the assets root and call it `ipadic`, as shown bellow:
   - Android: `android/app/src/main/assets/ipadic`
   - iOS `<xcode-project-root>/ipadic`

## Usage

### IPADic React Hook

This module provides a React hook which makes the usage relatively simple. It could be imported as shown below:

```tsx
import { useMeCabIpaDic } from 'react-native-mecab';
```

The hook expects the following arguments:

1. `query` (`string`) - the Japanese input to be parsed
2. `options` (`object`, optional) - the options object with the following properties:
   - `enabled` (`boolean`, `true` by default) - when set to `false`, the hook will not do any parsing

The hook returns an object with three properties:

- `state` (`'loading'` | `'ok'` | `'error'`) - the current state of parsing
- `result` (`null` | `ParsedFeature[]`) - the result of parsing; equals to `null` if the state is `'loading'` or `'error'`
  - the `ParsedFeature` type is an object with the following structure:
    - `surface` (`string`)
    - `pos` (`string`)
    - `posDetail1` (`string` | `null`)
    - `posDetail2` (`string` | `null`)
    - `posDetail3` (`string` | `null`)
    - `conjugation1` (`string` | `null`)
    - `conjugation2` (`string` | `null`)
    - `dictionaryForm` (`string` | `null`)
    - `reading` (`string` | `null`)
    - `pronunciation` (`string` | `null`)
- `error` (`null` | `Error`) - the error that happened during parsing (if any); equals to `null` if the state is `'loading'` or `'ok'`

#### Full example:

```tsx
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
```

### MeCab Instance

If you want to use a different dictionary or have a use case with which you can't use the React hook, then you can use a `MeCab` instance directly. It could be imported as shown below:

```tsx
import { MeCab } from 'react-native-mecab';
```

After instantiation, the asynchronous `.init` method needs to be called with the dictionary directory (relative to the assets root) passed as the first argument.

```tsx
const mecab = new MeCab();
mecab.init('ipadic').catch(console.error);
```

After successful initialization, you can parse a Japanese sentence using the `.tokenize` method, which will resolve with a tokenization result string.

```tsx
mecab.tokenize('これは猫です。').then((result) => {
  console.log(result);
});
```

The result string will resemble the following:

```
これ: 名詞,代名詞,一般,*,*,*,これ,コレ,コレ
は: 助詞,係助詞,*,*,*,*,は,ハ,ワ
猫: 名詞,一般,*,*,*,*,猫,ネコ,ネコ
です: 助動詞,*,*,*,特殊・デス,基本形,です,デス,デス
。: 記号,句点,*,*,*,*,。,。,。
```

After you're done with using the instance, make sure to call the `.dispose` method. If you lose the reference to the given MeCab instance without calling this method first, then it will cause a memory leak.

```tsx
mecab.dispose().catch(console.error);
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

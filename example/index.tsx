import { AppRegistry } from 'react-native';
import App from './src/App';
import { MeCab } from 'react-native-mecab';

const mecab = new MeCab();
mecab.init('ipadic').catch(console.error);
mecab
  .tokenize('これは猫です。')
  .then((result) => console.log('result: ', result))
  .then(() => mecab.dispose())
  .then(() => console.log('disposed'));
// .then(() => mecab.tokenize('aaa'));

AppRegistry.registerComponent('main', () => App);

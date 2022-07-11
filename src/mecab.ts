import RNFS from 'react-native-fs';
import { NativeModules, Platform } from 'react-native';

type State =
  | 'uninitialized'
  | 'initializing'
  | 'initialized'
  | 'disposed'
  | 'failed';

const linkingError =
  `The package 'react-native-mecab' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';
const MecabModule = NativeModules.Mecab
  ? NativeModules.Mecab
  : new Proxy(
      {},
      {
        get() {
          throw new Error(linkingError);
        },
      }
    );
const dictionaryFiles = [
  'char.bin',
  'dicrc',
  'left-id.def',
  'matrix.bin',
  'pos-id.def',
  'rewrite.def',
  'right-id.def',
  'sys.dic',
  'unk.dic',
];

export class MeCab {
  private pointerKey: string | null = null;
  private state: State = 'uninitialized';
  private resolveInitialization!: (value: void | PromiseLike<void>) => void;
  private rejectInitialization!: (reason?: unknown) => void;
  private readonly initializationPromise: Promise<void>;

  public constructor() {
    this.initializationPromise = new Promise((resolve, reject) => {
      this.resolveInitialization = resolve;
      this.rejectInitialization = reject;
    });
  }

  public async init(dictionaryDirectory: string): Promise<void> {
    if (this.state !== 'uninitialized') {
      this.throwInit(
        `Cannot call \`init(...)\`, mecab ${
          this.state === 'initializing'
            ? 'is currently initiazing'
            : this.state === 'initialized'
            ? 'has already been initialized'
            : this.state === 'disposed'
            ? 'has been disposed of'
            : 'is in a failed state'
        }.`
      );
    }

    this.state = 'initializing';

    dictionaryDirectory = dictionaryDirectory
      .replace(/^[\\\/]+/, '')
      .replace(/[\\\/]+$/, '');

    const missingFiles = [];
    const documentDirectoryPath = RNFS.DocumentDirectoryPath;
    const documentDictionaryDirectory = `${documentDirectoryPath}/${dictionaryDirectory}`;

    try {
      if (!(await this.existsAssets(dictionaryDirectory))) {
        this.state = 'failed';
        throw new Error(
          `Path "${dictionaryDirectory}" was not found in the application assets.`
        );
      }

      await RNFS.mkdir(documentDictionaryDirectory);

      for (const fileName of dictionaryFiles) {
        const assetFilePath = `${dictionaryDirectory}/${fileName}`;

        if (!(await this.existsAssets(assetFilePath))) {
          missingFiles.push(fileName);
          continue;
        }

        await this.copyFileAssets(
          assetFilePath,
          `${documentDictionaryDirectory}/${fileName}`
        );
      }
    } catch (error) {
      this.throwInit((error as Error).message);
    }

    if (missingFiles.length > 0) {
      this.state = 'failed';
      this.throwInit(
        `Invalid contents of the dictionary directory. The following files are missing: "${missingFiles.join(
          '", "'
        )}".`
      );
    }

    try {
      const mecabrcPath = `${documentDictionaryDirectory}/mecabrc`;

      if (!(await RNFS.exists(mecabrcPath))) {
        await RNFS.writeFile(mecabrcPath, '');
      }
    } catch (error) {
      this.throwInit((error as Error).message);
    }

    this.pointerKey = await MecabModule.initTagger(documentDictionaryDirectory);
    this.state = 'initialized';
    this.resolveInitialization();
  }

  public async tokenize(query: string): Promise<string> {
    this.throwIfInvalidState();

    await this.initializationPromise;
    return await MecabModule.parse(this.pointerKey, query);
  }

  public async dispose(): Promise<void> {
    this.throwIfInvalidState();

    await this.initializationPromise;
    this.state = 'disposed';
    await MecabModule.dispose(this.pointerKey);
  }

  private throwInit(message: string) {
    const error = new Error(message);
    this.rejectInitialization(error);
    throw error;
  }

  private throwIfInvalidState() {
    if (this.state === 'uninitialized') {
      throw new Error(
        'Mecab was not initialized. Did you forget to run `init(...)`?'
      );
    }

    if (this.state === 'disposed') {
      throw new Error('This instance has been disposed of.');
    }

    if (this.state === 'failed') {
      throw new Error('This instance is in a failed state.');
    }
  }

  private async existsAssets(path: string) {
    return Platform.OS === 'ios'
      ? await RNFS.exists(`${RNFS.MainBundlePath}/${path}`)
      : await RNFS.existsAssets(path);
  }

  private async copyFileAssets(filepath: string, destPath: string) {
    if (Platform.OS === 'ios') {
      try {
        if (await RNFS.exists(destPath)) {
          await RNFS.unlink(destPath);
        }

        await RNFS.copyFile(`${RNFS.MainBundlePath}/${filepath}`, destPath);
      } catch (e) {
        console.warn(
          `Copying "${RNFS.MainBundlePath}/${filepath}" -> "${destPath}" failed. ` +
            'This might occur due to two MeCab instances getting initialized with the same ' +
            'dictionary directory at the same time. Generally speaking, multiple instances ' +
            'of MeCab are only necessary when different dictionaries are required to be ' +
            'used at the same time. Otherwise, only one instance is required for the ' +
            'lifetime of the app.'
        );
      }
      return;
    }

    await RNFS.copyFileAssets(filepath, destPath);
  }
}

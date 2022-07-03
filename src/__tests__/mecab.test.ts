import { when } from 'jest-when';
import RNFS from 'react-native-fs';
import ReactNative from 'react-native';
import { MeCab } from '../index';

jest.mock('react-native-fs', () => {
  return {
    DocumentDirectoryPath: '/documents',
    existsAssets: jest.fn(),
    mkdir: jest.fn(),
    copyFileAssets: jest.fn(),
    exists: jest.fn(),
    writeFile: jest.fn(),
  };
});
jest.mock('react-native', () => ({
  Platform: {
    select: () => '',
  },
  NativeModules: {
    Mecab: {
      initTagger: jest.fn(),
      parse: async (pointerKey: string, query: string) =>
        `pointerKey: ${pointerKey}, query: ${query}`,
      dispose: async (_pointerKey: string) => void 0,
    },
  },
}));

const mockedRNFS = RNFS as jest.Mocked<typeof RNFS>;
const mockedReactNative = ReactNative as jest.Mocked<typeof ReactNative>;
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

describe('Mecab', () => {
  describe('Init', () => {
    it('Should throw if already initialized', async () => {
      mockedRNFS.existsAssets.mockResolvedValue(true);

      const mecab = new MeCab();
      await mecab.init('ipadic');
      await expect(mecab.init('ipadic')).rejects.toThrow(
        'Cannot call `init(...)`, mecab has already been initialized.'
      );
      // @ts-expect-error Checking the internal state.
      expect(mecab.state).toEqual('initialized');
    });

    it('Should throw if currently initializing', async () => {
      mockedRNFS.existsAssets.mockResolvedValue(true);

      const mecab = new MeCab();
      mecab.init('ipadic');
      await expect(mecab.init('ipadic')).rejects.toThrow(
        'Cannot call `init(...)`, mecab is currently initiazing.'
      );
      // @ts-expect-error Checking the internal state.
      expect(mecab.state).toEqual('initializing');
    });

    it('Should throw if initialization after failure is attempted', async () => {
      mockedRNFS.existsAssets.mockResolvedValue(false);

      const mecab = new MeCab();
      await expect(mecab.init('ipadic')).rejects.toThrow(
        'Path "ipadic" was not found in the application assets.'
      );
      await expect(mecab.init('ipadic')).rejects.toThrow(
        'Cannot call `init(...)`, mecab is in a failed state.'
      );
      // @ts-expect-error Checking the internal state.
      expect(mecab.state).toEqual('failed');
    });

    it('Should throw if initialization after disposal is attempted', async () => {
      mockedRNFS.existsAssets.mockResolvedValue(true);

      const mecab = new MeCab();
      await expect(mecab.init('ipadic')).resolves.toBeUndefined();
      await expect(mecab.dispose()).resolves.toBeUndefined();
      await expect(mecab.init('ipadic')).rejects.toThrow(
        'Cannot call `init(...)`, mecab has been disposed of.'
      );
      // @ts-expect-error Checking the internal state.
      expect(mecab.state).toEqual('disposed');
    });

    it('Should throw if invalid dicdir provided', async () => {
      when(mockedRNFS.existsAssets)
        .calledWith('ipadic')
        .mockResolvedValue(false);

      const expectedError =
        'Path "ipadic" was not found in the application assets.';
      const mecab = new MeCab();
      const initPromise = mecab.init('ipadic');

      await expect(mecab.tokenize('asd')).rejects.toThrow(expectedError);
      await expect(initPromise).rejects.toThrow(expectedError);
      // @ts-expect-error Checking the internal state.
      expect(mecab.state).toEqual('failed');
    });

    it('Should create the dictionary directory', async () => {
      mockedRNFS.existsAssets.mockResolvedValue(true);

      const mecab = new MeCab();
      await mecab.init('ipadic');

      expect(mockedRNFS.mkdir.mock.calls.length).toEqual(1);
      expect(mockedRNFS.mkdir.mock.calls[0]?.[0]).toEqual('/documents/ipadic');
    });

    it("Should throw if dictionary files don't exist", async () => {
      for (const file of dictionaryFiles) {
        mockedRNFS.existsAssets.mockReset();
        when(mockedRNFS.existsAssets)
          .calledWith(`ipadic/${file}`)
          .mockResolvedValue(false)
          .defaultResolvedValue(true);

        const expectedError = `Invalid contents of the dictionary directory. The following files are missing: "${file}".`;
        const mecab = new MeCab();
        const initPromise = mecab.init('ipadic');

        await expect(mecab.tokenize('asd')).rejects.toThrow(expectedError);
        await expect(initPromise).rejects.toThrow(expectedError);
        // @ts-expect-error Checking the internal state.
        expect(mecab.state).toEqual('failed');
      }

      mockedRNFS.existsAssets.mockReset();
      mockedRNFS.existsAssets.mockResolvedValue(true);
      const mecab = new MeCab();
      await expect(mecab.init('ipadic')).resolves.toBeUndefined();
    });

    it('Should copy the dictionary files', async () => {
      mockedRNFS.existsAssets.mockResolvedValue(true);

      const mecab = new MeCab();
      await expect(mecab.init('ipadic')).resolves.toBeUndefined();

      for (const file of dictionaryFiles) {
        expect(mockedRNFS.copyFileAssets.mock.calls).toEqual(
          expect.arrayContaining([
            [`ipadic/${file}`, `/documents/ipadic/${file}`],
          ])
        );
      }
    });

    it("Should create a mecabrc file if it doesn't exist", async () => {
      mockedRNFS.existsAssets.mockResolvedValue(true);
      when(mockedRNFS.exists)
        .calledWith('/documents/ipadic/mecabrc')
        .mockResolvedValue(false);

      const mecab = new MeCab();
      await expect(mecab.init('ipadic')).resolves.toBeUndefined();

      expect(mockedRNFS.writeFile.mock.calls.length).toEqual(1);
      expect(mockedRNFS.writeFile.mock.calls[0]).toEqual([
        '/documents/ipadic/mecabrc',
        '',
      ]);
    });

    it("Shouldn't create a mecabrc file if it exists", async () => {
      mockedRNFS.existsAssets.mockResolvedValue(true);
      when(mockedRNFS.exists)
        .calledWith('/documents/ipadic/mecabrc')
        .mockResolvedValue(true);

      const mecab = new MeCab();
      await expect(mecab.init('ipadic')).resolves.toBeUndefined();

      expect(mockedRNFS.writeFile.mock.calls.length).toEqual(0);
    });

    it('Should create a tagger instance', async () => {
      mockedRNFS.existsAssets.mockResolvedValue(true);

      const mecab = new MeCab();
      await expect(mecab.init('ipadic')).resolves.toBeUndefined();

      expect(
        mockedReactNative.NativeModules.Mecab.initTagger.mock.calls
      ).toEqual([['/documents/ipadic']]);
      // @ts-expect-error Checking the internal state.
      expect(mecab.state).toEqual('initialized');
    });
  });
});

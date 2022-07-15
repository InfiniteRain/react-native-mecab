import { useEffect, useState } from 'react';
import { MeCab } from 'react-native-mecab';

export type HookState = 'loading' | 'ok' | 'error';

type LoadingReturn = {
  state: 'loading';
  result: null;
  error: null;
};

type OkReturn = {
  state: 'ok';
  result: ParsedFeature[];
  error: null;
};

type ErrorReturn = {
  state: 'error';
  result: null;
  error: any;
};

type HookReturn = LoadingReturn | OkReturn | ErrorReturn;

type HookOptions = {
  enabled?: boolean;
};

export type ParsedFeature = {
  surface: string;
  pos: string;
  posDetail1: string | null;
  posDetail2: string | null;
  posDetail3: string | null;
  conjugation1: string | null;
  conjugation2: string | null;
  dictionaryForm: string | null;
  reading: string | null;
  pronunciation: string | null;
};

type InternalHookState = {
  state: HookState;
  result: ParsedFeature[] | null;
  error: any;
};

const mecab = new MeCab();
mecab.init('ipadic').catch(console.error);

const processMeCabProp = (prop?: string): string | null =>
  !prop || prop === '*' ? null : prop;

const parseResult = (result: string): ParsedFeature[] => {
  const features: ParsedFeature[] = [];

  for (const line of result.trim().split('\n')) {
    if (line === '') {
      continue;
    }

    const throwLineError = () => {
      throw new Error(`Failed to parse a MeCab result line: ${line}`);
    };

    const lineSplit = line.split(': ');

    if (lineSplit.length !== 2) {
      throwLineError();
    }

    const [surface, feature] = lineSplit as [string, string];
    const featureSplit = feature.split(',');

    if (featureSplit.length < 7 || featureSplit.length > 9) {
      throwLineError();
    }

    const [
      pos,
      posDetail1,
      posDetail2,
      posDetail3,
      conjugation1,
      conjugation2,
      dictionaryForm,
      reading,
      pronunciation,
    ] = featureSplit as [
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string?,
      string?
    ];

    features.push({
      surface,
      pos,
      posDetail1: processMeCabProp(posDetail1),
      posDetail2: processMeCabProp(posDetail2),
      posDetail3: processMeCabProp(posDetail3),
      conjugation1: processMeCabProp(conjugation1),
      conjugation2: processMeCabProp(conjugation2),
      dictionaryForm: processMeCabProp(dictionaryForm),
      reading: processMeCabProp(reading),
      pronunciation: processMeCabProp(pronunciation),
    });
  }

  return features;
};

export const useMeCabIpaDic = (
  query: string,
  options?: HookOptions
): HookReturn => {
  const [internalState, setInternalState] = useState<InternalHookState>({
    state: 'loading',
    result: null,
    error: null,
  });

  useEffect(() => {
    if (options?.enabled !== undefined && !options.enabled) {
      return;
    }

    setInternalState({
      state: 'loading',
      result: null,
      error: null,
    });

    mecab
      .tokenize(query)
      .then((result) => {
        setInternalState((previousState) => ({
          ...previousState,
          state: 'ok',
          result: parseResult(result),
        }));
      })
      .catch((e) => {
        setInternalState((previousState) => ({
          ...previousState,
          state: 'error',
          error: e,
        }));
      });
  }, [query, options?.enabled]);

  return { ...internalState } as HookReturn;
};

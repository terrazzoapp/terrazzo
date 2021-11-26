export interface TokensFlat {
  'color.blue': string;
  'color.white': string;
  'type.family.suisse_intl': string;
}

export interface Modes {
  color: 'light';
}

export const tokens = {
  /** Color */
  color: {
    blue: '#2B3FAA',
    white: '#FFFFFF',
  },
  /** Typography */
  type: {
    family: {
      suisse_intl: 'Suisse Intl',
    },
  },
};

export const modes = {
  /** Color */
  color: {
    blue: { light: '#2B3FAA' },
    white: { light: '#FFFFFF' },
  },
  /** Typography */
};

/** Get alternate values */
export function getAlt<T = string>(tokenID: keyof TokensFlat, mode: string): T {
  let defaultVal = tokens;
  let altVal = modes;
  for (const next of tokenID.split('.')) {
    defaultVal = defaultVal[next];
    if (altVal[next] !== undefined) altVal = altVal[next];
  }
  return (altVal && altVal[mode]) || defaultVal;
}
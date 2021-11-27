export interface TokensFlat {
  'color.black': string;
  'color.dark_gray': string;
  'color.blue': string;
  'color.red': string;
  'color.white': string;
  'type.family.suisse_intl': string;
}

export interface Modes {
  color: 'light';
}

export const tokens = {
  /** Color */
  color: {
    black: '#040404',
    dark_gray: '#282A37',
    blue: '#2B3FAA',
    red: '#D0323A',
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
    black: { light: '#040404' },
    dark_gray: { light: '#282A37' },
    blue: { light: '#2B3FAA' },
    red: { light: '#D0323A' },
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
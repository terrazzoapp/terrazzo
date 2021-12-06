export interface TokensFlat {
  'color.black': string;
  'color.dark_gray': string;
  'color.blue': string;
  'color.green': string;
  'color.red': string;
  'color.white': string;
  'color.purple': string;
  'type.family.neue_montreal': string;
}

export interface Modes {
  color: 'light';
}

export const tokens = {
  /** Color */
  color: {
    black: '#00193f',
    dark_gray: '#282a37',
    blue: '#2b3faa',
    green: '#77ea6e',
    red: '#d0323a',
    white: '#FFFFFF',
    purple: '#6a35d9',
  },
  /** Typography */
  type: {
    family: {
      neue_montreal: 'Neue Montreal',
    },
  },
};

export const modes = {
  /** Color */
  color: {
    black: { light: '#00193F' },
    dark_gray: { light: '#282A37' },
    blue: { light: '#2B3FAA' },
    green: { light: '#77EA6E' },
    red: { light: '#d0323a' },
    white: { light: '#FFFFFF' },
    purple: { light: '#6a35d9' },
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
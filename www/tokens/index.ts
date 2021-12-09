export interface TokensFlat {
  'color.Black': string;
  'color.Blue': string;
  'color.Dark_Gray': string;
  'color.Green': string;
  'color.Red': string;
  'color.Purple': string;
  'color.White': string;
  'type.family.neue_montreal': string;
  'icon.cloud--download': string;
  'icon.cloud--upload': string;
  'icon.crop': string;
  'icon.delete': string;
  'icon.do-not': string;
  'icon.do-not--02': string;
  'icon.download--01': string;
  'icon.download--02': string;
  'icon.embed': string;
  'icon.export--01': string;
  'icon.export--02': string;
  'icon.launch': string;
  'icon.love': string;
  'icon.minimize': string;
  'icon.paperclip': string;
  'icon.player--flow': string;
  'icon.renew': string;
  'icon.repeat': string;
  'icon.reset': string;
  'icon.trash': string;
  'icon.upload--01': string;
  'icon.upload--02': string;
}

export interface Modes {
  color: 'light';
}

export const tokens = {
  /** Color */
  color: {
    Black: '#00193f',
    Blue: '#2b3faa',
    Dark_Gray: '#282a37',
    Green: '#77ea6e',
    Red: '#d0323a',
    Purple: '#6a35d9',
    White: '#ffffff',
  },
  /** Typography */
  type: {
    family: {
      neue_montreal: 'Neue Montreal',
    },
  },
  icon: {
    'cloud--download': './public/icons/cloud--download.svg',
    'cloud--upload': './public/icons/cloud--upload.svg',
    crop: './public/icons/crop.svg',
    delete: './public/icons/delete.svg',
    'do-not': './public/icons/do-not.svg',
    'do-not--02': './public/icons/do-not--02.svg',
    'download--01': './public/icons/download--01.svg',
    'download--02': './public/icons/download--02.svg',
    embed: './public/icons/embed.svg',
    'export--01': './public/icons/export--01.svg',
    'export--02': './public/icons/export--02.svg',
    launch: './public/icons/launch.svg',
    love: './public/icons/love.svg',
    minimize: './public/icons/minimize.svg',
    paperclip: './public/icons/paperclip.svg',
    'player--flow': './public/icons/player--flow.svg',
    renew: './public/icons/renew.svg',
    repeat: './public/icons/repeat.svg',
    reset: './public/icons/reset.svg',
    trash: './public/icons/trash.svg',
    'upload--01': './public/icons/upload--01.svg',
    'upload--02': './public/icons/upload--02.svg',
  },
};

export const modes = {
  /** Color */
  color: {
    Black: { light: '#00193f' },
    Blue: { light: '#2b3faa' },
    Dark_Gray: { light: '#282a37' },
    Green: { light: '#77ea6e' },
    Red: { light: '#d0323a' },
    Purple: { light: '#6a35d9' },
    White: { light: '#ffffff' },
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
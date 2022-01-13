export const tokens = {
  "color": {
    "Black": "#00193f",
    "Blue": "#2b3faa",
    "Dark_Gray": "#282a37",
    "Green": "#77ea6e",
    "Red": "#d0323a",
    "Purple": "#6a35d9",
    "White": "#ffffff"
  },
  "font": {},
  "family": {
    "neue_montreal": [
      "Neue Montreal"
    ]
  },
  "icon": {
    "cloud--download": "./public/icons/cloud--download.svg",
    "cloud--upload": "./public/icons/cloud--upload.svg",
    "crop": "./public/icons/crop.svg",
    "delete": "./public/icons/delete.svg",
    "do-not": "./public/icons/do-not.svg",
    "do-not--02": "./public/icons/do-not--02.svg",
    "download--01": "./public/icons/download--01.svg",
    "download--02": "./public/icons/download--02.svg",
    "embed": "./public/icons/embed.svg",
    "export--01": "./public/icons/export--01.svg",
    "export--02": "./public/icons/export--02.svg",
    "launch": "./public/icons/launch.svg",
    "love": "./public/icons/love.svg",
    "minimize": "./public/icons/minimize.svg",
    "paperclip": "./public/icons/paperclip.svg",
    "player--flow": "./public/icons/player--flow.svg",
    "renew": "./public/icons/renew.svg",
    "repeat": "./public/icons/repeat.svg",
    "reset": "./public/icons/reset.svg",
    "trash": "./public/icons/trash.svg",
    "upload--01": "./public/icons/upload--01.svg",
    "upload--02": "./public/icons/upload--02.svg"
  }
};


export const modes = {
  "color": {
    "Black": {
      "light": "#00193f"
    },
    "Blue": {
      "light": "#2b3faa"
    },
    "Dark_Gray": {
      "light": "#282a37"
    },
    "Green": {
      "light": "#77ea6e"
    },
    "Red": {
      "light": "#d0323a"
    },
    "Purple": {
      "light": "#6a35d9"
    },
    "White": {
      "light": "#ffffff"
    }
  },
  "font": {},
  "family": {
    "neue_montreal": {}
  },
  "icon": {
    "cloud--download": {},
    "cloud--upload": {},
    "crop": {},
    "delete": {},
    "do-not": {},
    "do-not--02": {},
    "download--01": {},
    "download--02": {},
    "embed": {},
    "export--01": {},
    "export--02": {},
    "launch": {},
    "love": {},
    "minimize": {},
    "paperclip": {},
    "player--flow": {},
    "renew": {},
    "repeat": {},
    "reset": {},
    "trash": {},
    "upload--01": {},
    "upload--02": {}
  }
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
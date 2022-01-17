export const tokens = {
  "color": {
    "black": "#00193f",
    "blue": "#2b3faa",
    "dark-gray": "#282a37",
    "green": "#77cd8f",
    "purple": "#6a35d9",
    "red": "#f6566a",
    "white": "#ffffff"
  },
  "gradient": {
    "red": [
      {
        "color": "#d0323a",
        "position": 0
      },
      {
        "color": "#fd8d4e",
        "position": 1
      }
    ]
  },
  "typography": {
    "heading-1": {
      "fontName": [
        "PP Neue Montreal"
      ],
      "fontSize": "36px",
      "fontStyle": "regular",
      "fontWeight": 500,
      "letterSpacing": "0em",
      "lineHeight": 1
    },
    "heading-2": {
      "fontName": [
        "PP Neue Montreal"
      ],
      "fontSize": "28px",
      "fontStyle": "regular",
      "fontWeight": 500,
      "letterSpacing": "0em",
      "lineHeight": 1
    },
    "heading-3": {
      "fontName": [
        "PP Neue Montreal"
      ],
      "fontSize": "24px",
      "fontStyle": "regular",
      "fontWeight": 500,
      "letterSpacing": "0em",
      "lineHeight": 1
    },
    "body": {
      "fontName": [
        "PP Neue Montreal"
      ],
      "fontSize": "16px",
      "fontStyle": "regular",
      "fontWeight": 400,
      "letterSpacing": "0em",
      "lineHeight": 1
    }
  },
  "icon": {
    "crop": "./icon/crop.svg",
    "cloud-upload": "./icon/cloud-upload.svg",
    "cloud-download": "./icon/cloud-download.svg",
    "delete": "./icon/delete.svg",
    "do-not-2": "./icon/do-not-2.svg",
    "download-1": "./icon/download-1.svg",
    "export-2": "./icon/export-2.svg",
    "export-1": "./icon/export-1.svg",
    "embed": "./icon/embed.svg",
    "download-2": "./icon/download-2.svg",
    "do-not": "./icon/do-not.svg",
    "minimize": "./icon/minimize.svg",
    "launch": "./icon/launch.svg",
    "maximize": "./icon/maximize.svg",
    "love": "./icon/love.svg",
    "paperclip": "./icon/paperclip.svg",
    "upload-2": "./icon/upload-2.svg",
    "player-flow": "./icon/player-flow.svg",
    "reset": "./icon/reset.svg",
    "upload-1": "./icon/upload-1.svg",
    "trash": "./icon/trash.svg",
    "refresh": "./icon/refresh.svg",
    "renew": "./icon/renew.svg",
    "repeat": "./icon/repeat.svg"
  },
  "distance": {
    "near": {
      "offset-x": "0",
      "offset-y": "8px",
      "blur": "16px",
      "spread": "0",
      "color": "#00001a"
    },
    "med": {
      "offset-x": "0",
      "offset-y": "16px",
      "blur": "32px",
      "spread": "0",
      "color": "#000026"
    },
    "far": {
      "offset-x": "0",
      "offset-y": "32px",
      "blur": "64px",
      "spread": "0",
      "color": "#000026"
    }
  }
};


export const modes = {};


/** Get mode value */
export function getMode<T = string>(tokenID: keyof TokensFlat, mode: string): T {
  let defaultVal = tokens;
  let modeVal = modes;
  for (const next of tokenID.split('.')) {
    defaultVal = defaultVal[next];
    if (modeVal[next] !== undefined) modeVal = modeVal[next];
  }
  return (modeVal && modeVal[mode]) || defaultVal;
}
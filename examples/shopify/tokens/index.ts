export const tokens = {
  "color": {
    "black": "#000000",
    "blueLighter": "#ebf5fa",
    "blueLight": "#b4e1fa",
    "blue": "#006fbb",
    "blueDark": "#084e8a",
    "blueDarker": "#001429",
    "blueText": "#3e4e57",
    "greenLighter": "#e3f1df",
    "greenLight": "#bbe5b3",
    "green": "#50b83c",
    "greenDark": "#108043",
    "greenDarker": "#173630",
    "greenText": "#414f3e",
    "indigoLighter": "#f4f5fa",
    "indigoLight": "#b3bcf5",
    "indigo": "#5c6ac4",
    "indigoDark": "#202e78",
    "indigoDarker": "#000639",
    "indigoText": "#3e4155",
    "inkLightest": "#919eab",
    "inkLighter": "#637381",
    "inkLight": "#454f5b",
    "ink": "#212b36",
    "orangeLighter": "#fcebdb",
    "orangeLight": "#ffc58b",
    "orange": "#f49342",
    "orangeDark": "#c05717",
    "orangeDarker": "#4a1504",
    "orangeText": "#594430",
    "purpleLighter": "#f6f0fd",
    "purpleLight": "#e3d0ff",
    "purple": "#9c6ade",
    "purpleDark": "#50248f",
    "purpleDarker": "#230051",
    "purpleText": "#50495a",
    "redLighter": "#fbeae5",
    "redLight": "#fead9a",
    "red": "#de3618",
    "redDark": "#bf0711",
    "redDarker": "#330101",
    "redText": "#583c35",
    "skyLighter": "#f9fafb",
    "skyLight": "#f4f6f8",
    "sky": "#dfe3e8",
    "skyDark": "#c4cdd5",
    "tealLighter": "#e0f5f5",
    "tealLight": "#b7ecec",
    "teal": "#47c1bf",
    "tealDark": "#00848e",
    "tealDarker": "#003135",
    "tealText": "#405352",
    "white": "#ffffff",
    "yellowLighter": "#fcf1cd",
    "yellowLight": "#ffea8a",
    "yellow": "#eec200",
    "yellowDark": "#8a6116",
    "yellowDarker": "#573b00",
    "yellowText": "#595130"
  },
  "font": {},
  "family": {
    "base": [
      "-apple-system",
      "BlinkMacSystemFont",
      "San Francisco",
      "Segoe UI",
      "Roboto",
      "Helvetica Neue",
      "sans-serif"
    ],
    "mono": [
      "Monaco",
      "Consolas",
      "Lucida Console",
      "monospace"
    ]
  },
  "space": {
    "none": "0",
    "extraTight": "4px",
    "tight": "8px",
    "baseTight": "12px",
    "base": "16px",
    "loose": "20px",
    "extraLoose": "32px"
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
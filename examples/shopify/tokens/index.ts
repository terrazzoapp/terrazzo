export const tokens = {
  "color": {
    "black": "#000000",
    "blue_lighter": "#ebf5fa",
    "blue_light": "#b4e1fa",
    "blue": "#006fbb",
    "blue_dark": "#084e8a",
    "blue_darker": "#001429",
    "blue_text": "#3e4e57",
    "green_lighter": "#e3f1df",
    "green_light": "#bbe5b3",
    "green": "#50b83c",
    "green_dark": "#108043",
    "green_darker": "#173630",
    "green_text": "#414f3e",
    "indigo_lighter": "#f4f5fa",
    "indigo_light": "#b3bcf5",
    "indigo": "#5c6ac4",
    "indigo_dark": "#202e78",
    "indigo_darker": "#000639",
    "indigo_text": "#3e4155",
    "ink_lightest": "#919eab",
    "ink_lighter": "#637381",
    "ink_light": "#454f5b",
    "ink": "#212b36",
    "orange_lighter": "#fcebdb",
    "orange_light": "#ffc58b",
    "orange": "#f49342",
    "orange_dark": "#c05717",
    "orange_darker": "#4a1504",
    "orange_text": "#594430",
    "purple_lighter": "#f6f0fd",
    "purple_light": "#e3d0ff",
    "purple": "#9c6ade",
    "purple_dark": "#50248f",
    "purple_darker": "#230051",
    "purple_text": "#50495a",
    "red_lighter": "#fbeae5",
    "red_light": "#fead9a",
    "red": "#de3618",
    "red_dark": "#bf0711",
    "red_darker": "#330101",
    "red_text": "#583c35",
    "sky_lighter": "#f9fafb",
    "sky_light": "#f4f6f8",
    "sky": "#dfe3e8",
    "sky_dark": "#c4cdd5",
    "teal_lighter": "#e0f5f5",
    "teal_light": "#b7ecec",
    "teal": "#47c1bf",
    "teal_dark": "#00848e",
    "teal_darker": "#003135",
    "teal_text": "#405352",
    "white": "#ffffff",
    "yellow_lighter": "#fcf1cd",
    "yellow_light": "#ffea8a",
    "yellow": "#eec200",
    "yellow_dark": "#8a6116",
    "yellow_darker": "#573b00",
    "yellow_text": "#595130"
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
    "extra_tight": "4px",
    "tight": "8px",
    "base_tight": "12px",
    "base": "16px",
    "loose": "20px",
    "extra_loose": "32px"
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
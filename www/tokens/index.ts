export const tokens = {
  "color": {
    "black": "#00193f",
    "blue": "#2b3faa",
    "darkGray": "#282a37",
    "green": "#77cd8f",
    "purple": "#6a35d9",
    "red": "#f6566a",
    "white": "#ffffff"
  },
  "font": {},
  "family": {
    "ppNeue": [
      "PP Neue Montreal",
      "system-ui",
      "ui-sans-serif",
      "-apple-system",
      "Helvetica Neue",
      "Helvetica",
      "Arial",
      "sans-serif"
    ],
    "mono": [
      "IBM Plex Mono",
      "ui-monospace",
      "SF Mono",
      "Monaco",
      "Cascadia Mono",
      "Cascadia Code",
      "Consolas",
      "monospace"
    ]
  },
  "size": {
    "01": "8px",
    "02": "9px",
    "03": "12px",
    "04": "14px",
    "05": "18px",
    "06": "24px",
    "07": "36px",
    "08": "56px"
  },
  "space": {
    "4xs": "1px",
    "3xs": "2px",
    "2xs": "4px",
    "xs": "8px",
    "sm": "12px",
    "md": "16px",
    "lg": "24px",
    "xl": "32px",
    "2xl": "40px",
    "3xl": "48px"
  },
  "layout": {
    "2xs": "16px",
    "xs": "24px",
    "sm": "32px",
    "md": "48px",
    "lg": "64px",
    "xl": "96px",
    "2xl": "160px"
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
/** ------------------------------------------
 *  Autogenerated by ⛋ Terrazzo. DO NOT EDIT!
 * ------------------------------------------- */

export const tokens = {
  "shadow.base": {
    ".": [
      {
        "offsetX": 0,
        "offsetY": "4px",
        "blur": "8px",
        "spread": 0,
        "color": "rgb(0, 0, 0, 0.15)"
      }
    ],
  },
  "shadow.simple": {
    ".": [
      {
        "offsetX": 0,
        "offsetY": "4px",
        "blur": "8px",
        "spread": 0,
        "color": "rgb(0, 0, 0, 0.15)"
      }
    ],
  },
  "shadow.inset": {
    ".": [
      {
        "inset": true,
        "offsetX": 0,
        "offsetY": "4px",
        "blur": "8px",
        "spread": 0,
        "color": "rgb(0, 0, 0, 0.15)"
      }
    ],
  },
  "shadow.layered": {
    ".": [
      {
        "offsetX": 0,
        "offsetY": "1px",
        "blur": "1px",
        "color": "rgba(0, 0, 0, 0.12)"
      },
      {
        "offsetX": 0,
        "offsetY": "2px",
        "blur": "2px",
        "color": "rgba(0, 0, 0, 0.12)"
      },
      {
        "offsetX": 0,
        "offsetY": "4px",
        "blur": "4px",
        "color": "rgba(0, 0, 0, 0.12)"
      },
      {
        "offsetX": 0,
        "offsetY": "8px",
        "blur": "8px",
        "color": "rgba(0, 0, 0, 0.12)"
      },
      {
        "offsetX": 0,
        "offsetY": "16px",
        "blur": "16px",
        "color": "rgba(0, 0, 0, 0.12)"
      }
    ],
  },
};

/** Get individual token */
export function token(tokenID, modeName = ".") {
  return tokens[tokenID]?.[modeName];
}
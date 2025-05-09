/** ------------------------------------------
 *  Autogenerated by ⛋ Terrazzo. DO NOT EDIT!
 * ------------------------------------------- */

export const tokens = {
  "shadow.base": {
    ".": [
      {
        "color": {
          "colorSpace": "srgb",
          "components": [
            0,
            0,
            0
          ],
          "alpha": 0.15
        },
        "offsetX": {
          "value": 0,
          "unit": "px"
        },
        "offsetY": {
          "value": 4,
          "unit": "px"
        },
        "blur": {
          "value": 8,
          "unit": "px"
        },
        "spread": {
          "value": 0,
          "unit": "px"
        },
        "inset": false
      }
    ],
  },
  "shadow.simple": {
    ".": [
      {
        "color": {
          "colorSpace": "srgb",
          "components": [
            0,
            0,
            0
          ],
          "alpha": 0.15
        },
        "offsetX": {
          "value": 0,
          "unit": "px"
        },
        "offsetY": {
          "value": 4,
          "unit": "px"
        },
        "blur": {
          "value": 8,
          "unit": "px"
        },
        "spread": {
          "value": 0,
          "unit": "px"
        },
        "inset": false
      }
    ],
  },
  "shadow.inset": {
    ".": [
      {
        "color": {
          "colorSpace": "srgb",
          "components": [
            0,
            0,
            0
          ],
          "alpha": 0.15
        },
        "offsetX": {
          "value": 0,
          "unit": "px"
        },
        "offsetY": {
          "value": 4,
          "unit": "px"
        },
        "blur": {
          "value": 8,
          "unit": "px"
        },
        "spread": {
          "value": 0,
          "unit": "px"
        },
        "inset": true
      }
    ],
  },
  "shadow.layered": {
    ".": [
      {
        "color": {
          "colorSpace": "srgb",
          "components": [
            0,
            0,
            0
          ],
          "alpha": 0.12
        },
        "offsetX": {
          "value": 0,
          "unit": "px"
        },
        "offsetY": {
          "value": 1,
          "unit": "px"
        },
        "blur": {
          "value": 1,
          "unit": "px"
        },
        "spread": {
          "value": 0,
          "unit": "px"
        },
        "inset": false
      },
      {
        "color": {
          "colorSpace": "srgb",
          "components": [
            0,
            0,
            0
          ],
          "alpha": 0.12
        },
        "offsetX": {
          "value": 0,
          "unit": "px"
        },
        "offsetY": {
          "value": 2,
          "unit": "px"
        },
        "blur": {
          "value": 2,
          "unit": "px"
        },
        "spread": {
          "value": 0,
          "unit": "px"
        },
        "inset": false
      },
      {
        "color": {
          "colorSpace": "srgb",
          "components": [
            0,
            0,
            0
          ],
          "alpha": 0.12
        },
        "offsetX": {
          "value": 0,
          "unit": "px"
        },
        "offsetY": {
          "value": 4,
          "unit": "px"
        },
        "blur": {
          "value": 4,
          "unit": "px"
        },
        "spread": {
          "value": 0,
          "unit": "px"
        },
        "inset": false
      },
      {
        "color": {
          "colorSpace": "srgb",
          "components": [
            0,
            0,
            0
          ],
          "alpha": 0.12
        },
        "offsetX": {
          "value": 0,
          "unit": "px"
        },
        "offsetY": {
          "value": 8,
          "unit": "px"
        },
        "blur": {
          "value": 8,
          "unit": "px"
        },
        "spread": {
          "value": 0,
          "unit": "px"
        },
        "inset": false
      },
      {
        "color": {
          "colorSpace": "srgb",
          "components": [
            0,
            0,
            0
          ],
          "alpha": 0.12
        },
        "offsetX": {
          "value": 0,
          "unit": "px"
        },
        "offsetY": {
          "value": 16,
          "unit": "px"
        },
        "blur": {
          "value": 16,
          "unit": "px"
        },
        "spread": {
          "value": 0,
          "unit": "px"
        },
        "inset": false
      }
    ],
  },
};

/** Get individual token */
export function token(tokenID, modeName = ".") {
  return tokens[tokenID]?.[modeName];
}

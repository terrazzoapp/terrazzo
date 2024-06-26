/** ------------------------------------------
 *  Autogenerated by ⛋ Terrazzo. DO NOT EDIT!
 * ------------------------------------------- */

import type {
  ColorTokenNormalized,
} from "@terrazzo/parser";

export declare const tokens: {
  /** Black */
  "color.black": Record<".", ColorTokenNormalized["$value"]>;
  /** Lightest blue */
  "color.blue.1": Record<".", ColorTokenNormalized["$value"]>;
  "color.blue.2": Record<".", ColorTokenNormalized["$value"]>;
  "color.blue.3": Record<".", ColorTokenNormalized["$value"]>;
  "color.blue.4": Record<".", ColorTokenNormalized["$value"]>;
  "color.blue.5": Record<".", ColorTokenNormalized["$value"]>;
  "color.blue.6": Record<".", ColorTokenNormalized["$value"]>;
  "color.blue.7": Record<".", ColorTokenNormalized["$value"]>;
  "color.blue.8": Record<".", ColorTokenNormalized["$value"]>;
  /** Max saturation blue */
  "color.blue.9": Record<".", ColorTokenNormalized["$value"]>;
  "color.blue.10": Record<".", ColorTokenNormalized["$value"]>;
  "color.blue.11": Record<".", ColorTokenNormalized["$value"]>;
  /** Darkest blue */
  "color.blue.12": Record<".", ColorTokenNormalized["$value"]>;
  /** White */
  "color.white": Record<".", ColorTokenNormalized["$value"]>;
  /** Mode-aware background color */
  "ui.bg": Record<"." | "light" | "dark", ColorTokenNormalized["$value"]>;
  /** Mode-aware foreground color */
  "ui.fg": Record<"." | "light" | "dark", ColorTokenNormalized["$value"]>;
};

export declare function token<K extends keyof typeof tokens>(tokenID: K, modeName?: never): (typeof tokens)[K]["."];
export declare function token<K extends keyof typeof tokens, M extends keyof (typeof tokens)[K]>(tokenID: K, modeName: M): (typeof tokens)[K][M];

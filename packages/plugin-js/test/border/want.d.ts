/** ------------------------------------------
 *  Autogenerated by ⛋ Terrazzo. DO NOT EDIT!
 * ------------------------------------------- */

import type {
  BorderTokenNormalized,
  ColorTokenNormalized,
} from "@terrazzo/parser";

export declare const tokens: {
  /** Default border */
  "border.solid": Record<"." | "light" | "dark", BorderTokenNormalized["$value"]>;
  /** Border for placeholder items */
  "border.dashed": Record<"." | "light" | "dark", BorderTokenNormalized["$value"]>;
  "border.default": Record<".", BorderTokenNormalized["$value"]>;
  "color.base.gray.10": Record<".", ColorTokenNormalized["$value"]>;
  "color.base.gray.15": Record<".", ColorTokenNormalized["$value"]>;
  "color.base.gray.20": Record<".", ColorTokenNormalized["$value"]>;
  "color.base.gray.25": Record<".", ColorTokenNormalized["$value"]>;
  "color.base.gray.30": Record<".", ColorTokenNormalized["$value"]>;
  "color.base.gray.40": Record<".", ColorTokenNormalized["$value"]>;
  "color.base.gray.50": Record<".", ColorTokenNormalized["$value"]>;
  "color.base.gray.60": Record<".", ColorTokenNormalized["$value"]>;
  "color.base.gray.70": Record<".", ColorTokenNormalized["$value"]>;
  "color.base.gray.80": Record<".", ColorTokenNormalized["$value"]>;
  "color.base.gray.85": Record<".", ColorTokenNormalized["$value"]>;
  "color.base.gray.90": Record<".", ColorTokenNormalized["$value"]>;
  "color.base.gray.95": Record<".", ColorTokenNormalized["$value"]>;
  "color.base.gray.100": Record<".", ColorTokenNormalized["$value"]>;
  "color.border": Record<"." | "light" | "dark", ColorTokenNormalized["$value"]>;
};

export declare function token<K extends keyof typeof tokens>(tokenID: K, modeName?: never): (typeof tokens)[K]["."];
export declare function token<K extends keyof typeof tokens, M extends keyof (typeof tokens)[K]>(tokenID: K, modeName: M): (typeof tokens)[K][M];

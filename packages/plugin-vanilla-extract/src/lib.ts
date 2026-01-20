import type { TokenTransformed } from '@terrazzo/parser';
import type ve from '@vanilla-extract/css';
import { camelCase } from 'scule';

export const FORMAT_ID = 'vanilla-extract';
export const THEME_EXPORT = 'vars'; // Could be a future option, for now match docs

export interface VanillaExtractPluginOptions {
  /**
   * Filename to generate.
   * @default "theme.css.ts"
   */
  filename?: string;
  /**
   * - true: use global `createGlobalThemeContract()` API
   * - false: use scoped `createThemeContract()` API
   * @default true
   */
  globalThemeContract?: boolean;
  /**
   * Mapping of exported JS variables to token modes. The key MUST be a valid JS identifier.
   * @example
   *
   * ```js
   * themes: {
   *   default: { mode: "." }, // "." refers to the default mode, or no mode
   *   light: { mode: "light" },
   *   dark: { mode: "dark" },
   * }
   * ```
   */
  themes?: Record<
    string,
    | {
        /* @deprecated */
        mode: string | string[];
        input?: never;
      }
    | {
        /* @deprecated */
        mode?: never;
        input: Record<string, string>;
      }
  >;
  /**
   * Mapping of exported JS variables to token modes for global themes. The key MUST be a valid JS identifier.
   * @example
   *
   * ```js
   * globalThemes: {
   *   default: { selector: ":root", mode: "." }, // "." refers to the default mode, or no mode
   *   light: { selector: "[data-color-mode=light]", mode: "light" },
   *   dark: { selector: "[data-color-mode=dark]" mode: "dark" },
   * }
   * ```
   */
  globalThemes?: Record<
    string,
    | {
        selector: string;
        /* @deprecated */
        mode: string | string[];
        input?: never;
      }
    | {
        selector: string;
        /* @deprecated */
        mode?: never;
        input: Record<string, string>;
      }
  >;
  /**
   * Change the naming strategy for the createTheme() API’s `[class, vars]` tuple.
   * @default (name) => [`${name}Class`, name]
   */
  themeVarNaming?: (name: string) => [string, string];
}

// imports saved as a constant to prevent typos
export const VE = {
  createTheme: 'createTheme',
  createGlobalTheme: 'createGlobalTheme',
  createThemeContract: 'createThemeContract',
  createGlobalThemeContract: 'createGlobalThemeContract',
} satisfies Partial<Record<keyof typeof ve, string>>;

export function isJSIdent(ident: unknown): boolean {
  if (typeof ident !== 'string') {
    return false;
  }
  return /^[A-Za-z$_][A-Za-z0-9_$]*$/.test(ident);
}

/** Generate createThemeContract() or createGlobalThemeContract() */
export function generateThemeContract({
  tokens,
  globalThemeContract,
}: {
  tokens: TokenTransformed[];
  globalThemeContract: boolean;
}): string {
  const tokensObj: any = {};
  for (const token of tokens) {
    const parts = token.localID!.split('.');
    const name = parts.pop()!;

    // rebuild nested object again from flattened tokens array
    let node = tokensObj;
    for (const part of parts) {
      if (!(part in node)) {
        node[part] = {};
      }
      node = node[part];
    }

    if (token.type !== 'MULTI_VALUE') {
      throw new Error('Error in plugin-vanilla-extract: values didn’t generate correctly.');
    }

    const cssName = token.value.__cssName?.replace(/^--/, '');
    if ('.' in token.value) {
      node[name] = globalThemeContract ? cssName : null;
    } else {
      node[name] = {};
      for (const k of Object.keys(token.value)) {
        if (k === '__cssName') {
          continue;
        }
        node[name][camelCase(k)] = globalThemeContract ? `${cssName}-${k}` : null;
      }
    }
  }

  return `export const ${THEME_EXPORT} = ${globalThemeContract ? VE.createGlobalThemeContract : VE.createThemeContract}(${JSON.stringify(tokensObj, undefined, 2)});\n`;
}

/** Generate createTheme()/createGlobalTheme() */
export function generateTheme({
  name,
  namingPattern,
  tokens,
  selector,
  globalTheme = false,
}: {
  name: string;
  namingPattern: (name: string) => [string, string];
  tokens: TokenTransformed[];
  selector?: string;
  globalTheme?: boolean;
}) {
  const tokensObj: any = {};
  for (const token of tokens) {
    const parts = token.localID!.split('.');
    const name = parts.pop()!;

    // rebuild nested object again from flattened tokens array
    let node = tokensObj;
    for (const part of parts) {
      if (!(part in node)) {
        node[part] = {};
      }
      node = node[part];
    }
    if (token.type === 'MULTI_VALUE') {
      if ('.' in token.value) {
        node[name] = serializeValue(token.value['.'], tokens);
      } else {
        node[name] = {};
        for (const [k, v] of Object.entries(token.value)) {
          if (k === '__cssName') {
            continue;
          }
          node[name][camelCase(k)] = serializeValue(v, tokens);
        }
      }
    } else {
      node[name] = serializeValue(token.value, tokens);
    }
  }

  const ident = globalTheme ? `${name}` : `[${namingPattern(name)[0]}, ${namingPattern(name)[1]}]`;
  const prefix = globalTheme
    ? `${VE.createGlobalTheme}(${JSON.stringify(selector)}, ${THEME_EXPORT}, `
    : `${VE.createTheme}(${THEME_EXPORT}, `;
  const rawTokens = JSON.stringify(tokensObj, undefined, 2);
  return `export const ${ident} = ${prefix}${deserializeAllValues(rawTokens)});\n`;
}

const IDENT_ESCAPE = '__ident__';

/** Encode an alias to a Vanilla Extract token inside a JSON array */
export function serializeValue(value: string | number | boolean, tokens: TokenTransformed[]): string {
  // raw values: number / boolean
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  // aliases
  // ⚠️ Warning! Trying to simply transform CSS vars to IDs is brittle, error-prone, and will break in many conditions.
  // However, reverse lookups from generated CSS vars is stable and safe. Subtle but important difference.
  const [_, varName] = value.match(/^var\(([^)]+)\)$/) ?? [];
  if (varName) {
    const originalToken = tokens.find((t) => t.type === 'MULTI_VALUE' && t.value.__cssName === varName);
    if (!originalToken) {
      throw new Error(`Can’t find token associated with ${value}`);
    }
    let jsIdent = '';
    const parts = originalToken.localID!.split('.');
    for (const part of parts) {
      if (!isJSIdent(part)) {
        // Note: there are probably some token IDs with quotation marks in them that this
        // would break on, but also, how dare you, you monster
        jsIdent += /^[1-9][0-9]*$/.test(part) ? `[${part}]` : `['${part.replace(/'/g, "\\'")}']`;
      } else {
        jsIdent += `.${part}`;
      }
    }
    return `${IDENT_ESCAPE}${THEME_EXPORT}${jsIdent}${IDENT_ESCAPE}`;
  }

  // special case: zero
  if (/^0[A-Z]+/i.test(value)) {
    return '0';
  }
  // special case: px converts to numbers
  // if (/^\d+px/i.test(value)) {
  //   return Number.parseFloat(value);
  // }
  return value;
}

/** Decode all aliases from a JSON string */
export function deserializeAllValues(json: string): string {
  return json.replace(/"__ident__(.*)__ident__"/g, '$1');
}

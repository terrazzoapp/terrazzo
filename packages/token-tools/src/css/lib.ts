import type { TokenNormalized } from '../types.js';

/** Function that generates a var(…) statement */
export type IDGenerator<T = TokenNormalized> = (token: T) => string;

export function defaultAliasTransform(token: TokenNormalized) {
  if (!token) {
    throw new Error('Undefined token');
  }
  return `var(${makeCSSVar(token.id)})`;
}

/** Generate shorthand CSS for select token types */
export function generateShorthand({ $type, localID }: { $type: string; localID: string }): string | undefined {
  switch ($type) {
    case 'transition': {
      return ['duration', 'delay', 'timing-function']
        .map((p) => makeCSSVar(`${localID}-${p}`, { wrapVar: true }))
        .join(' ');
    }
    // note: "typography" is not set in shorthand because it can often unset values unintentionally.
    // @see https://developer.mozilla.org/en-US/docs/Web/CSS/font
  }
}

const CSS_VAR_RE =
  /(?:(\p{Uppercase_Letter}?[\p{Lowercase_Letter}\p{Number}]+|[\p{Uppercase_Letter}\p{Number}]+|[\u{80}-\u{10FFFF}\p{Number}]+)|.)/u;

export interface MakeCSSVarOptions {
  /** Prefix with string */
  prefix?: string;
  /**
   * Wrap with `var(…)`
   * @default false
   */
  wrapVar?: boolean;
}

/**
 * Generate a valid CSS variable from any string
 * Code by @dfrankland
 */
export function makeCSSVar(name: string, { prefix, wrapVar = false }: MakeCSSVarOptions = {}): string {
  if (typeof name !== 'string') {
    throw new Error(`makeCSSVar() Expected string, received ${name}`);
  }

  let property = name.split(CSS_VAR_RE).filter(Boolean).join('-');
  if (prefix && !property.startsWith(`${prefix}-`)) {
    property = `${prefix}-${property}`;
  }
  const finalProperty = `--${property}`.toLocaleLowerCase();
  return wrapVar ? `var(${finalProperty})` : finalProperty;
}

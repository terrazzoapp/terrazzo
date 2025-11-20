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
export function generateShorthand({ token, localID }: { token: TokenNormalized; localID: string }): string | undefined {
  switch (token.$type) {
    case 'transition': {
      return ['duration', 'delay', 'timing-function']
        .map((p) => makeCSSVar(`${localID}-${p}`, { wrapVar: true }))
        .join(' ');
    }
    case 'typography': {
      const typeVar = (name: string) => makeCSSVar(`${localID}-${name}`, { wrapVar: true });
      // Note: typography tokens should have both of these properties, but this is just being defensive
      if ('font-size' in token.$value && 'font-family' in token.$value) {
        let output = '';
        for (const prop of ['font-style', 'font-variant', 'font-weight']) {
          if (prop in token.$value) {
            output += ` ${typeVar(prop)}`;
          }
        }
        let fontSizeVar = typeVar('font-size');
        if ('line-height' in token.$value) {
          fontSizeVar += `/${typeVar('line-height')}`;
        }
        output += ` ${fontSizeVar}`;
        output += ` ${typeVar('font-family')}`;
        return output.trim();
      }
      break;
    }
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

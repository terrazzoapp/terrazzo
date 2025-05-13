// import type { TokenTransformedMultiValue } from '@terrazzo/parser';

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
export function generateShorthand({
  token,
  localID,
}: { token: any /*TokenTransformedMultiValue*/; localID: string }): string | undefined {
  const $type = token.token.$type;

  switch ($type) {
    case 'transition': {
      return ['duration', 'delay', 'timing-function']
        .map((p) => makeCSSVar(`${localID}-${p}`, { wrapVar: true }))
        .join(' ');
    }

    case 'typography': {
      const properties = token.value;

      if ('font-size' in properties && 'font-family' in properties) {
        const output: string[] = [];

        const fontSizeVar = makeCSSVar(`${localID}-font-size`, { wrapVar: true });

        if ('font-style' in properties) {
          output.push(makeCSSVar(`${localID}-font-style`, { wrapVar: true }));
        }

        if ('font-variant' in properties) {
          output.push(makeCSSVar(`${localID}-font-variant`, { wrapVar: true }));
        }

        if ('font-weight' in properties) {
          output.push(makeCSSVar(`${localID}-font-weight`, { wrapVar: true }));
        }

        if ('line-height' in properties) {
          output.push(`${fontSizeVar}/${makeCSSVar(`${localID}-line-height`, { wrapVar: true })}`);
        } else {
          output.push(fontSizeVar);
        }

        output.push(makeCSSVar(`${localID}-font-family`, { wrapVar: true }));

        return output.join(' ');
      }
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

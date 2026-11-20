import type { TokenNormalized } from '../types.js';

export interface SubValueAliasContext {
  parentToken: TokenNormalized;
  subValueName: string;
}

/** Function that generates a var(…) statement */
export type IDGenerator<T = TokenNormalized> = (
  token: T,
  subValue?: SubValueAliasContext,
) => string;

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
  omitTypographyShorthand,
  subValueVariableName,
}: {
  token: TokenNormalized;
  localID: string;
  omitTypographyShorthand?: boolean;
  subValueVariableName?: (variableName: string, subValueName: string) => string;
}): string | undefined {
  const baseVar = localID.startsWith('--') ? localID : makeCSSVar(localID);
  function subValueVar(name: string) {
    return `var(${subValueVariableName ? subValueVariableName(baseVar, name) : `${baseVar}-${name}`})`;
  }

  switch (token.$type) {
    case 'transition': {
      return ['duration', 'delay', 'timing-function'].map((p) => subValueVar(p)).join(' ');
    }
    case 'typography': {
      if (omitTypographyShorthand) {
        return undefined;
      }
      // Note: typography tokens should have both of these properties, but this is just being defensive
      if ('font-size' in token.$value && 'font-family' in token.$value) {
        let output = '';
        for (const prop of ['font-style', 'font-variant', 'font-weight']) {
          if (prop in token.$value) {
            output += ` ${subValueVar(prop)}`;
          }
        }
        let fontSizeVar = subValueVar('font-size');
        if ('line-height' in token.$value) {
          fontSizeVar += `/${subValueVar('line-height')}`;
        }
        output += ` ${fontSizeVar}`;
        output += ` ${subValueVar('font-family')}`;
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
export function makeCSSVar(
  name: string,
  { prefix, wrapVar = false }: MakeCSSVarOptions = {},
): string {
  if (typeof name !== 'string') {
    throw new TypeError(`makeCSSVar() Expected string, received ${name}`);
  }

  let property = name.split(CSS_VAR_RE).filter(Boolean).join('-');
  if (prefix && !property.startsWith(`${prefix}-`)) {
    property = `${prefix}-${property}`;
  }
  const finalProperty = `--${property}`.toLocaleLowerCase();
  return wrapVar ? `var(${finalProperty})` : finalProperty;
}

import { kebabCase } from '../string.js';

/** Function that generates a var(…) statement */
export type IDGenerator = (id: string) => string;

export const defaultAliasTransform = (id: string) => `var(${makeCSSVar(id)})`;

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

/** Build object of alias values */
export function transformCompositeAlias<T extends {}>(
  value: T,
  { aliasOf, transformAlias = defaultAliasTransform }: { aliasOf: string; transformAlias?: IDGenerator },
): Record<string, string> {
  const output: Record<string, string> = {};
  for (const key of Object.keys(value)) {
    output[kebabCase(key)] = transformAlias(`${aliasOf}-${key}`);
  }
  return output as Record<keyof T, string>;
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
  let property = name.split(CSS_VAR_RE).filter(Boolean).join('-');
  if (prefix && !property.startsWith(`${prefix}-`)) {
    property = `${prefix}-${property}`;
  }
  const finalProperty = `--${property}`.toLocaleLowerCase();
  return wrapVar ? `var(${finalProperty})` : finalProperty;
}

import type { TokenNormalized } from '../types.js';

export interface TransformJSValueOptions {
  mode: string;
  /** indent space count */
  indent?: number;
  /** initial indent level */
  startingIndent?: number;
}

/**
 * Convert token value to a JS string via acorn/astring.
 */
export function transformJSValue<T extends TokenNormalized>(
  token: T,
  { mode, indent = 2, startingIndent = 0 }: TransformJSValueOptions,
) {
  if (!(mode in token.mode)) {
    return;
  }
  const indentStart = startingIndent > 0 ? ' '.repeat(startingIndent ?? 2) : '';

  // note: since tokens are JSON-serializable to begin with, using
  // JSON.stringify generates the same output as an AST parser/generator would
  // but faster and without the added overhead (even acorn/astring leave object
  // keys quoted).

  // TODO: use @biomejs/js-api when it’s stable for pretty formatting

  return JSON.stringify(token.mode[mode]!.$value, undefined, indent).replace(/\n/g, `\n${indentStart}`);
}

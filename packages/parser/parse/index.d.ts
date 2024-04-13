import type { Config } from '../config.js';
import type { Group, Token, TokenNormalized } from '../types.js';
import type Logger from '../logger.js';

export * from './validate.js';

export interface ParseOptions extends Config {
  logger?: Logger;
  /** Skip lint step (default: false) */
  skipLint?: boolean;
}

export default function parse(input: string | object, options: ParseOptions): Promise<Record<string, TokenNormalized>>;

/** Determine if an input is likely a JSON string */
export function maybeJSONString(input: unknown): boolean;

/** Resolve alias */
export function resolveAlias(
  alias: string,
  options: { tokens: Record<string, TokenNormalized>; logger: Logger; path: string[] },
): string | undefined;

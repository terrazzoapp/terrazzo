import type { DocumentNode } from '@humanwhocodes/momoa';
import type { TokenNormalized } from '@terrazzo/token-tools';
import type { ConfigInit } from '../config.js';
import type Logger from '../logger.js';

export * from './validate.js';

export interface ParseOptions {
  logger?: Logger;
  /** Skip lint step (default: false) */
  skipLint?: boolean;
  config: ConfigInit;
}

export interface ParseResult {
  tokens: Record<string, TokenNormalized>;
  ast: DocumentNode;
}

/**
 * Parse and validate Tokens JSON, and lint it
 */
export default function parse(input: string | object, options?: ParseOptions): Promise<ParseResult>;

/** Determine if an input is likely a JSON string */
export function maybeJSONString(input: unknown): boolean;

/** Resolve alias */
export function resolveAlias(
  alias: string,
  options: { tokens: Record<string, TokenNormalized>; logger: Logger; path: string[] },
): string | undefined;

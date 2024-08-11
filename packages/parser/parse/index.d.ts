import type { DocumentNode } from '@humanwhocodes/momoa';
import type { TokenNormalized } from '@terrazzo/token-tools';
import type yamlToMomoa from 'yaml-to-momoa';
import type { ConfigInit } from '../config.js';
import type Logger from '../logger.js';

export * from './validate.js';

export interface ParseInput {
  /** Source filename (if read from disk) */
  filename?: URL;
  /** JSON/YAML string, or JSON-serializable object (if already in memory) */
  src: string | object;
}

export interface ParseOptions {
  logger?: Logger;
  config: ConfigInit;
  /** Skip lint step (default: false) */
  skipLint?: boolean;
  /** Continue on error? (Useful for `tz check`) (default: false) */
  continueOnError?: boolean;
  /** Provide yamlToMomoa module to parse YAML (by default, this isn’t shipped to cut down on package weight) */
  yamlToMomoa?: typeof yamlToMomoa;
}

export interface ParseResult {
  tokens: Record<string, TokenNormalized>;
  /** ASTs are returned in order of input array */
  sources: { filename?: URL; src: string; document: DocumentNode }[];
}

/**
 * Parse and validate Tokens JSON, and lint it
 */
export default function parse(input: ParseInput[], options?: ParseOptions): Promise<ParseResult>;

/** Determine if an input is likely a JSON string */
export function maybeJSONString(input: unknown): boolean;

/** Resolve alias */
export function resolveAlias(
  alias: string,
  options: { tokens: Record<string, TokenNormalized>; logger: Logger; path: string[] },
): string | undefined;

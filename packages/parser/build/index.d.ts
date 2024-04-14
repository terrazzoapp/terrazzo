import type { DocumentNode } from '@humanwhocodes/momoa';
import type { ConfigInit } from '../config.js';
import type { TokenNormalized } from '../types.js';
import type Logger from '../logger.js';

export interface BuildRunnerOptions {
  tokens: Record<string, TokenNormalized>;
  config: ConfigInit;
  ast: DocumentNode;
  logger: Logger;
}

export interface OutputFile {
  filename: string;
  contents: string | Buffer;
}

export interface Formatter {
  /** Get a token by ID */
  getToken(id: string): TokenNormalized | undefined;
  /** Get a map of tokens that match a glob */
  getAllTokens(glob: string): Record<string, TokenNormalized>;
  /** Set a token value */
  setTokenValue(
    id: string,
    newValue: {
      /** Final value (to be used in output files) */
      value: string;
      /** How this token will be aliased internally */
      alias: string;
      /** (optional) Provide mode values for this token */
      mode?: Record<string, string>;
      /** (optional) Arbitrary metadata that can be used in the final build step */
      metadata?: Record<string, unknown>;
    },
  ): void;
}

export interface TransformHookOptions {
  tokens: Record<string, TokenNormalized>;
  format: (formatID: string) => Formatter;
}

export interface BuildHookOptions {
  tokens: Record<string, TokenNormalized>;
  format: (formatID: string) => Omit<Formatter, 'setTokenValue'>;
}

export interface BuildRunnerResult {
  outputFiles: OutputFile[];
}

export default function build(options: BuildRunnerOptions): Promise<BuildRunnerResult>;

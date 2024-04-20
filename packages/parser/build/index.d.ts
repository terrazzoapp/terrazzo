import type { DocumentNode } from '@humanwhocodes/momoa';
import type { ConfigInit } from '../config.js';
import type { TokenNormalized } from '../types.js';
import type Logger from '../logger.js';

export interface BuildRunnerOptions {
  tokens: Record<string, TokenNormalized>;
  ast: DocumentNode;
  config: ConfigInit;
  logger?: Logger;
}

export interface OutputFile {
  filename: string;
  contents: string | Buffer;
}

export interface TokenFormatValue {
  /** Final value (to be used in output files) */
  value: string | Record<string, string>;
  /** Token’s format-unique ID */
  formatID: string;
  /** (optional) Mode values for this token */
  mode?: Record<string, string | Record<string, string>>;
  /** (optional) Arbitrary metadata that can be used in the final build step */
  metadata?: Record<string, unknown>;
}

export interface Formatter {
  /** Get a token by ID */
  getToken(id: string): TokenFormatValue;
  /** Get a map of tokens that match a glob */
  getAllTokens(glob?: string): Record<string, TokenFormatValue>;
  /** Set a token value */
  setTokenValue(id: string, value: TokenFormatValue): void;
}

export interface TransformHookOptions {
  /** Map of tokens */
  tokens: Record<string, TokenNormalized>;
  /** Format API */
  format: (formatID: string) => Formatter;
  /** Momoa document */
  ast: DocumentNode;
}

export interface BuildHookOptions {
  /** Map of tokens */
  tokens: Record<string, TokenNormalized>;
  /** Format API */
  format: (formatID: string) => Omit<Formatter, 'setTokenValue'>;
  /** Momoa document */
  ast: DocumentNode;
  outputFile: (
    /** Filename to output (relative to outDir) */
    filename: string,
    /** Contents to write to file */
    contents: string | Buffer,
  ) => void;
}

export interface BuildRunnerResult {
  outputFiles: OutputFile[];
}

export interface BuildEndHookOptions {
  /** Map of tokens */
  tokens: Record<string, TokenNormalized>;
  /** Format API */
  format: (formatID: string) => Omit<Formatter, 'setTokenValue'>;
  /** Momoa document */
  ast: DocumentNode;
  /** Final files to be written */
  outputFiles: OutputFile[];
}

export default function build(options: BuildRunnerOptions): Promise<BuildRunnerResult>;

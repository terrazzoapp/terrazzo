import type { DocumentNode } from '@humanwhocodes/momoa';
import type { ConfigInit } from '../config.js';
import type Logger from '../logger.js';
import type { TokenNormalized } from '../types.js';

export interface BuildRunnerOptions {
  ast: DocumentNode;
  config: ConfigInit;
  logger?: Logger;
}

export interface OutputFile {
  filename: string;
  contents: string | Buffer;
}

/** Transformed token with a single value. Note that this may be any type! */
export interface TokenTransformedSingleValue {
  /** ID unique to this format. If missing, use `token.id`. */
  localID?: string;
  type: 'SINGLE_VALUE';
  value: string;
  /** The mode of this value (default: `"."`) */
  mode: string;
  /** The original token */
  token: TokenNormalized;
}

/** Transformed token with multiple values. Note that this may be any type! */
export interface TokenTransformedMultiValue {
  /** ID unique to this format. If missing, use `token.id` */
  localID?: string;
  type: 'MULTI_VALUE';
  value: Record<string, string>;
  /** The mode of this value (default: `"."`) */
  mode: string;
  /** The original token */
  token: TokenNormalized;
}

export type TokenTransformed = TokenTransformedSingleValue | TokenTransformedMultiValue;

export interface TransformParams {
  /** ID of an existing format */
  format: string;
  /** Glob of tokens to select (e.g. `"color.*"` to select all tokens starting with `"color."`) */
  select?: string | string[];
  /** Mode name, if selecting a mode (default: `"."`) */
  mode?: string | string[];
}

export interface TransformHookOptions {
  /** Map of tokens */
  tokens: Record<string, TokenNormalized>;
  /** Query transformed values */
  getTransforms(params: TransformParams): TokenTransformed;
  /** Update transformed values */
  setTransform(
    id: string,
    params: {
      format: string;
      localID?: string;
      value: string | Record<string, string>;
      mode?: string;
    },
  ): void;
  /** Momoa document */
  ast: DocumentNode;
}

export interface BuildHookOptions {
  /** Map of tokens */
  tokens: Record<string, TokenNormalized>;
  /** Query transformed values */
  getTransforms(params: TransformParams): TokenTransformed[];
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
  /** Query transformed values */
  getTransforms(params: TransformParams): TokenTransformed[];
  /** Momoa document */
  ast: DocumentNode;
  /** Final files to be written */
  outputFiles: OutputFile[];
}

export default function build(
  tokens: Record<string, TokenNormalized>,
  options: BuildRunnerOptions,
): Promise<BuildRunnerResult>;

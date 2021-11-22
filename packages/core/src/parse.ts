import yaml from 'js-yaml';

export type TokenType = 'token' | 'group' | 'file' | 'url';

export interface TokenManifest {
  /** Manifest name */
  name?: string;
  /** Metadata. Useful for any arbitrary data */
  metadata?: Record<string, any>;
  /** Version. Only useful for the design system */
  version?: number;
  /** Tokens. Required */
  tokens: {
    [tokensOrGroup: string]: Group | Token | FileOrURL;
  };
}

/** An arbitrary grouping of tokens. Groups can be nested infinitely to form namespaces. */
export interface Group<T = string> {
  type: 'group';
  /** (optional) User-friendly name of the group */
  name?: string;
  /** (optional) Longer descripton of this group */
  description?: string;
  /** (optional) Enforce that all child tokens have values for all modes */
  modes?: string[];
  tokens: {
    [tokensOrGroup: string]: Group<T> | Token<T> | FileOrURL;
  };
}

/** A design token. */
export interface Token<T = string> {
  type: 'token';
  /** (optional) User-friendly name of this token */
  name?: string;
  /** (optional) Longer description of this token */
  description?: string;
  value: TokenValue<T>;
}

export interface FileOrURL {
  type: 'file' | 'url';
  /** (optional) User-friendly name of this token */
  name?: string;
  /** (optional) Longer description of this token */
  description?: string;
  value: {
    default: string;
    [mode: string]: string;
  };
}

export interface TokenValue<T = string> {
  /** Required */
  default: T;
  /** Additional modes */
  [mode: string]: T;
}

/** Parse tokens.yaml string */
export default function parse(source: string): TokenManifest {
  return yaml.load(source) as TokenManifest;
}

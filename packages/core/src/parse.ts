import yaml from 'js-yaml';

export type NodeType = 'token' | 'group' | 'file' | 'url';

export interface RawTokenSchema {
  /** Manifest name */
  name?: string;
  /** Metadata. Useful for any arbitrary data */
  metadata?: Record<string, any>;
  /** Version. Only useful for the design system */
  version?: number;
  /** Tokens. Required */
  tokens: {
    [tokensOrGroup: string]: RawSchemaNode;
  };
}

export interface TokenSchema extends RawTokenSchema {
  tokens: {
    [tokensOrGroup: string]: SchemaNode;
  };
}

/** An arbitrary grouping of tokens. Groups can be nested infinitely to form namespaces. */
export interface RawGroupNode<T = string> {
  type: 'group';
  /** (optional) User-friendly name of the group */
  name?: string;
  /** (optional) Longer descripton of this group */
  description?: string;
  /** (optional) Enforce that all child tokens have values for all modes */
  modes?: string[];
  tokens: {
    [tokensOrGroup: string]: RawSchemaNode<T>;
  };
}

/** An arbitrary grouping of tokens. Groups can be nested infinitely to form namespaces. */
export interface GroupNode<T = string> extends RawGroupNode<T> {
  /** unique identifier (e.g. "color.gray") */
  id: string;
  /** id within group (e.g. "gray") */
  localID: string;
  /** group reference (yes, groups can be nested!) */
  group?: GroupNode;
  tokens: {
    [tokensOrGroup: string]: SchemaNode<T>;
  };
}

/** A design token. */
export interface RawTokenNode<T = string> {
  /** type: token is optional in schemas (it’s implied) */
  type: 'token' | undefined;
  /** (optional) User-friendly name of this token */
  name?: string;
  /** (optional) Longer description of this token */
  description?: string;
  value: T | T[] | TokenValue<T>;
}

/** A design token. */
export interface TokenNode<T = string> extends RawTokenNode<T> {
  /** unique identifier (e.g. "color.gray") */
  id: string;
  /** id within group (e.g. "gray") */
  localID: string;
  /** group reference */
  group?: GroupNode;
  value: TokenValue<T>;
}

/** A local file on disk. */
export interface RawFileNode {
  type: 'file';
  /** (optional) User-friendly name of this token */
  name?: string;
  /** (optional) Longer description of this token */
  description?: string;
  value: string | string[] | TokenValue<string>;
}

/** A local file on disk. */
export interface FileNode extends RawFileNode {
  /** unique identifier (e.g. "color.gray") */
  id: string;
  /** id within group (e.g. "gray") */
  localID: string;
  /** group reference */
  group?: GroupNode;
  value: TokenValue<string>;
}

/** A URL reference */
export interface RawURLNode {
  type: 'url';
  /** (optional) User-friendly name of this token */
  name?: string;
  /** (optional) Longer description of this token */
  description?: string;
  value: string | string[] | TokenValue<string>;
}

/** A URL reference */
export interface URLNode extends RawURLNode {
  /** unique identifier (e.g. "color.gray") */
  id: string;
  /** id within group (e.g. "gray") */
  localID: string;
  /** group reference */
  group?: GroupNode;
  value: TokenValue<string>;
}

export type RawSchemaNode<T = string> = RawGroupNode<T> | RawTokenNode<T> | RawFileNode | RawURLNode;

export type SchemaNode<T = string> = GroupNode<T> | TokenNode<T> | FileNode | URLNode;

export type TokenValue<T = string> = {
  /** Required */
  default: T;
  /** Additional modes */
  [mode: string]: T;
};

export function parse(source: string): RawTokenSchema {
  return yaml.load(source) as RawTokenSchema;
}

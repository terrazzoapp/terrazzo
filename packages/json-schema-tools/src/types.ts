import type * as momoa from '@humanwhocodes/momoa';

export interface InputSource {
  /** The location of this input */
  filename: URL;
  /** Either a string or in-memory object that is JSON-serializable. Optionally, a YAML string may be provided if yaml-to-momoa is installed and loaded. */
  src: any;
}

export interface InputSourceWithDocument extends InputSource {
  document: momoa.DocumentNode;
}

export type ValueNodeWithIndex = momoa.ValueNode & { index: number };

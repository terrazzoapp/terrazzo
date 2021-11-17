import type { TokenManifest } from './validate';
import type { Config } from './config';

export interface Generator {
  name: string;
  generate(manifest: TokenManifest, config: Config): Promise<GeneratorResult[]>;
}

export interface GeneratorResult {
  /** File to output (ex: /sass/tokens.sass) */
  file: string;
  /** File contents */
  contents: string | Buffer;
}

export default class Builder {}

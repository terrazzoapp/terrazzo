import fs from 'fs';
import type { Config } from './config';
import type { TokenManifest } from './parse';

export interface Plugin {
  name: string;
  /** (optional) load config */
  config?: (config: Config) => void;
  /** main build fn */
  build(manifest: TokenManifest): Promise<BuildResult[]>;
}

export interface BuildResult {
  /** File to output inside config.outDir (ex: ./tokens.sass) */
  fileName: string;
  /** File contents */
  contents: string | Buffer;
}

export default class Builder {
  config: Config;
  manifest: TokenManifest;

  constructor({ config, manifest }: { config: Config; manifest: TokenManifest }) {
    this.config = config;
    this.manifest = manifest;
  }

  /** Build all the tokens */
  public async build(): Promise<void> {
    for (const plugin of this.config.plugins) {
      try {
        // config()
        if (plugin.config) plugin.config(this.config);

        // build()
        const results = await plugin.build(this.manifest);
        for (const { fileName, contents } of results) {
          const filePath = new URL(fileName.replace(/^\//, ''), this.config.outDir);
          fs.mkdirSync(new URL('./', filePath), { recursive: true });
          fs.writeFileSync(filePath, contents);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`[${plugin.name}] ${err}`);
        throw err;
      }
    }
  }
}

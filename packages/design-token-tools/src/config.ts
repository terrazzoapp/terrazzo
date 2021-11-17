import type { Generator } from './build';

import fs from 'fs';
import { fileURLToPath } from 'url';
import z from 'zod';

export interface Config {
  tokens: URL;
  generators: Generator[];
}

export interface UserConfig {
  /** path to tokens.yml */
  tokens?: string;
  /** generators */
  generators: string[];
}

/** Load and validate tokens.config.js */
export default class ConfigLoader {
  public filePath: URL;

  constructor(basename?: string) {
    if (basename) {
      const filePath = new URL(basename, `file://${process.cwd()}/`);
      if (!fs.existsSync(filePath)) throw new Error(`Could not locate ${basename} in ${process.cwd()}`);
      this.filePath = filePath;
    } else {
      let filePath: URL | undefined;
      for (const f of ['tokens.config.js', 'tokens.config.mjs']) {
        if (fs.existsSync(f)) {
          filePath = new URL(f, `file://${process.cwd()}/`);
          break;
        }
      }
      if (filePath) {
        this.filePath = filePath;
      } else {
        throw new Error(`Could not locate tokens.config.js in ${process.cwd()}`);
      }
    }
  }

  /** load config file */
  async load(): Promise<Config> {
    const { default: config } = await import(fileURLToPath(this.filePath));
    const ConfigSchema = z.object({
      tokens: z
        .string()
        .optional()
        .default('tokens.yaml')
        .transform((val) => new URL(val.replace(/^\//, ''), `file://${process.cwd()}`)),
      generators: z
        .array(z.string())
        .optional()
        .default(['@tokens/json', '@tokens/sass', '@tokens/typescript'])
        .transform(async (val) => await Promise.all(val.map((specifier) => import(specifier).then((m) => m.default)))),
    });
    return await ConfigSchema.parseAsync(config);
  }
}

import type { TokenNormalized } from '@terrazzo/token-tools';
import type { Config } from 'tailwindcss';

export interface TailwindPluginOptions {
  /** output file (default: "./tailwind-tokens.js") */
  filename?: string;
  /** (optional) module format to use (to match your Tailwind config) */
  format?: 'esm' | 'cjs';
  /** (optional) Transform token value */
  transform?: <T extends TokenNormalized>(token: T, mode: keyof T['mode']) => string | number | string[] | undefined;
  /** @see https://tailwindcss.com/docs/theme */
  tailwind: {
    theme: Config['theme'];
  };
}

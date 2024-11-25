import type { TokenNormalized } from '@terrazzo/token-tools';
import type { Config } from 'tailwindcss';

export interface TailwindPluginOptions {
  /**
   * Output file
   * @default "./tailwind-tokens.js"
   */
  filename?: string;
  /** Module format to use (to match your Tailwind config. */
  format?: 'esm' | 'cjs';
  /** Transform token value */
  transform?: <T extends TokenNormalized>(token: T, mode: keyof T['mode']) => string | number | string[] | undefined;
  /** @see https://tailwindcss.com/docs/theme */
  tailwind: {
    theme: Config['theme'];
  };
}

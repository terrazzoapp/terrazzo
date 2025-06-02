import type { CSSPluginOptions } from '@terrazzo/plugin-css';

export interface SassPluginOptions {
  /** Where to output CSS */
  filename?: CSSPluginOptions['filename'];
  /** Glob patterns to exclude tokens from output */
  exclude?: CSSPluginOptions['exclude'];
}

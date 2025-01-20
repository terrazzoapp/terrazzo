import type { TokenNormalizedSet } from '../types.js';
import type { IDGenerator } from './lib.js';

export interface TransformCSSValueOptions {
  /** Complete set of tokens (needed to resolve full and partial aliases) */
  tokensSet: TokenNormalizedSet;
  transformAlias?: IDGenerator;
  /** Options for color tokens */
  color?: {
    /** Output legacy hex-6 and hex-8 */
    legacyHex?: boolean;
  };
}

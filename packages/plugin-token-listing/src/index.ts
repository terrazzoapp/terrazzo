import type { Plugin } from '@terrazzo/parser';
import getBuild from './build.js';
import type { TokenListingPluginOptions } from './types.js';

export * from './types.js';

export default function tokenListingPlugin(options: TokenListingPluginOptions): Plugin {
  return {
    name: '@terrazzo/plugin-token-listing',
    enforce: 'post',
    build: getBuild(options),
  };
}

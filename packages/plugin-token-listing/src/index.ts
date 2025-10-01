import type { Plugin } from '@terrazzo/parser';
import getBuild from './build.js';
import type { TokenListingPluginOptions } from './lib.js';

export * from './lib.js';

export default function tokenListingPlugin(options: TokenListingPluginOptions): Plugin {
  return {
    name: '@terrazzo/plugin-token-listing',
    enforce: 'post',
    build: getBuild(options),
  };
}

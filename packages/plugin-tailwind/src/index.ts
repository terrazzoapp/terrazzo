import type { Plugin } from '@terrazzo/parser';
import type { TailwindPluginOptions } from './lib.js';

export * from './lib.js';

export default function pluginJS(options: TailwindPluginOptions): Plugin {
  return {
    name: '@terrazzo/plugin-tailwind',
  };
}

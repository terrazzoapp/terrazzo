import type { Plugin } from '../../config.js';

export * from './rules/duplicate-values.js';

import ruleDuplicateValues from './rules/duplicate-values.js';

export default function coreLintPlugin(): Plugin {
  return {
    name: '@terrazzo/plugin-lint-core',
    lint() {
      return {
        duplicateValues: ruleDuplicateValues,
      };
    },
  };
}

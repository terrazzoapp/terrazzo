import type { Plugin } from '../../config.js';
import ruleDuplicateValues from './rules/duplicate-values.js';

export default function coreLintPlugin(): Plugin {
  return {
    name: '@terrazzo/plugin-lint-core',
    registerLintRules() {
      return [{}];
    },
    lint({ rules }) {},
  };
}

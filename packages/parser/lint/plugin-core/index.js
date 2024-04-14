import ruleDuplicateValues from './rules/duplicate-values.js';

export default function coreLintPlugin() {
  return {
    name: '@terrazzo/plugin-lint-core',
    lint() {
      return {
        duplicateValues: ruleDuplicateValues,
      };
    },
  };
}

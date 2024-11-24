import type { Plugin, LintNotice } from '@cobalt-ui/core';
import evaluateContrast, { type RuleContrastOptions } from './rules/contrast.js';

export { evaluateContrast };
export * from './rules/contrast.js';
export * from './lib/index.js';

export const RULES = {
  contrast: 'a11y/contrast',
};

export default function PluginA11y(): Plugin {
  return {
    name: '@cobalt-ui/lint-a11y',
    registerRules() {
      return Object.values(RULES).map((id) => ({ id, severity: 'error' }));
    },
    async lint({ tokens, rules }) {
      const notices: LintNotice[] = [];
      for (const rule of rules) {
        if (rule.severity === 'off') {
          continue;
        }

        switch (rule.id) {
          case RULES.contrast: {
            if (!rule.options || !Array.isArray((rule.options as RuleContrastOptions)?.checks)) {
              throw new Error('options.checks must be an array');
            }

            const violations = evaluateContrast(tokens, rule.options as RuleContrastOptions);
            if (violations.length) {
              notices.push(...violations.map((message) => ({ id: rule.id, message })));
            }
            break;
          }
        }
      }

      return notices;
    },
  };
}

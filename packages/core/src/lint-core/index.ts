import { type LintRule, type LintNotice } from '../parse/index.js';
import { type LintStageOptions } from '../index.js';
import duplicateValues from './rules/duplicate-values.js';
import requiredChildren from './rules/required-children.js';
import requiredModes from './rules/required-modes.js';
import naming from './rules/naming.js';
import colorFormat from './rules/color/format.js';
import colorGamut from './rules/color/gamut.js';
import typographyRequiredProperties from './rules/typography/required-properties.js';

export { colorFormat, colorGamut, duplicateValues, requiredChildren, requiredModes, naming, typographyRequiredProperties };
export * from './rules/duplicate-values.js';
export * from './rules/required-children.js';
export * from './rules/required-modes.js';
export * from './rules/naming.js';
export * from './rules/color/format.js';
export * from './rules/color/gamut.js';
export * from './rules/typography/required-properties.js';

export const CORE_LINT_RULES = {
  'duplicate-values': 'duplicate-values',
  naming: 'naming',
  'required-children': 'required-children',
  'required-modes': 'required-modes',
  'color/format': 'color/format',
  'color/gamut': 'color/gamut',
  'typography/required-properties': 'typography/required-properties',
};

export const CORE_LINT_RULES_DEFAULT_SEVERITY: Record<keyof typeof CORE_LINT_RULES, LintRule['severity']> = {
  'duplicate-values': 'warn',
  naming: 'off',
  'required-children': 'off',
  'required-modes': 'off',
  'color/format': 'off',
  'color/gamut': 'warn',
  'typography/required-properties': 'off',
};

export default function lintCore({ tokens, rules }: LintStageOptions): LintNotice[] | undefined {
  const notices: LintNotice[] = [];
  for (const rule of rules) {
    if (rule.severity === 'off') {
      continue;
    }

    const evaluator = {
      'color/format': colorFormat,
      'color/gamut': colorGamut,
      'duplicate-values': duplicateValues,
      naming: naming,
      'required-children': requiredChildren,
      'required-modes': requiredModes,
      'typography/required-properties': typographyRequiredProperties,
    }[rule.id];

    if (!evaluator) {
      throw new Error(`Unknown rule "${rule.id}"`);
    }

    const violations = evaluator(tokens, rule.options as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    if (violations.length) {
      notices.push(...violations.map((message) => ({ id: rule.id, message })));
    }
  }

  return notices.length ? notices : undefined;
}

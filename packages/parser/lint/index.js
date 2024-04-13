import { type DocumentNode, iterator } from '@humanwhocodes/momoa';
import type { Plugin } from '../config';
import type Logger from '../logger';

export interface LintNotice {
  /** Must match a registered rule */
  id: string;
  // node?: SchemaNode // "node" will be added in 2.0;
  /** Lint message shown to the user */
  message: string;
}

export interface LintRule<O = any> {
  id: string;
  severity: LintRuleSeverity;
  options?: O;
}

export type LintRuleSeverity = 'error' | 'warn' | 'off';
export type LintRuleShorthand = LintRuleSeverity | 0 | 1 | 2;
export type LintRuleLonghand = [LintRuleSeverity | 0 | 1 | 2, any];

export interface LintRunnerOptions {
  logger: Logger;
  plugins: Plugin[];
}

export default async function lintRunner(ast: DocumentNode, { logger, plugins }: LintRunnerOptions) {
  // TODO: call registerRules()

  for (const plugin of plugins) {
    if (typeof plugin.lint === 'function') {
      const s = performance.now();
      logger.debug({ group: 'plugin', task: plugin.name, message: 'Start linting' });
      await plugin.lint({ rules: [], tokens: iterator(ast) });
      logger.debug({ group: 'plugin', task: plugin.name, message: 'Finish linting', timing: performance.now() - s });
    }
  }
}

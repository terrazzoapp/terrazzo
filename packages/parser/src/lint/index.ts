import type { AnyNode, DocumentNode } from '@humanwhocodes/momoa';
import { type TokenNormalized, pluralize } from '@terrazzo/token-tools';
import type { ConfigInit } from '../config.js';
import type Logger from '../logger.js';

export interface LintNotice {
  /** Lint message shown to the user */
  message: string;
  /** Erring node (used to point to a specific line) */
  node?: AnyNode;
}

export type LintRuleSeverity = 'error' | 'warn' | 'off';
export type LintRuleShorthand = LintRuleSeverity | 0 | 1 | 2;
export type LintRuleLonghand = [LintRuleSeverity | 0 | 1 | 2, any];

export interface LintRuleNormalized<O = any> {
  id: string;
  severity: LintRuleSeverity;
  options?: O;
}

export interface LintRuleEvaluatorOptions<O = any> {
  tokens: Record<string, TokenNormalized>;
  document: DocumentNode;
  filename?: URL;
  source?: string;
  /** Any options the user has declared for this plugin */
  options?: O;
}
export type LintRuleEvaluator = (options: LintRuleEvaluatorOptions) => Promise<LintNotice[] | undefined>;

export interface LintRunnerOptions {
  tokens: Record<string, TokenNormalized>;
  document: DocumentNode;
  filename?: URL;
  config: ConfigInit;
  logger: Logger;
}

const listFormat = new Intl.ListFormat('en-us');

export default async function lintRunner({
  tokens,
  document,
  config = {} as ConfigInit,
  logger,
}: LintRunnerOptions): Promise<void> {
  const { plugins = [], lint } = config;
  const unusedLintRules = Object.keys(lint?.rules ?? {});

  for (const plugin of plugins) {
    if (typeof plugin.lint === 'function') {
      const s = performance.now();
      logger.debug({ group: 'plugin', label: plugin.name, message: 'Start linting' });

      const linter = plugin.lint();
      const errorEntries: LintNotice[] = [];
      const warnEntries: LintNotice[] = [];
      await Promise.all(
        Object.entries(linter).map(async ([ruleID, evaluator]) => {
          if (!(ruleID in lint.rules) || lint.rules[ruleID] === null) {
            return;
          }
          const [severity, options] = lint.rules[ruleID]!;
          if (severity === 'off') {
            return;
          }
          const results = await evaluator({ tokens, options, document });
          for (const result of results ?? []) {
            const noticeList = severity === 'error' ? errorEntries : warnEntries;
            noticeList.push({ message: result.message, node: result.node });
          }

          // tick off used rule
          const unusedLintRuleI = unusedLintRules.indexOf(ruleID);
          if (unusedLintRuleI !== -1) {
            unusedLintRules.splice(unusedLintRuleI, 1);
          }
        }),
      );
      for (const entry of errorEntries) {
        logger.error(entry);
      }
      for (const entry of warnEntries) {
        logger.warn(entry);
      }
      logger.debug({ group: 'plugin', label: plugin.name, message: 'Finish linting', timing: performance.now() - s });
      if (errorEntries.length) {
        const counts = [pluralize(errorEntries.length, 'error', 'errors')];
        if (warnEntries.length) {
          counts.push(pluralize(warnEntries.length, 'warning', 'warnings'));
        }
        logger.error({ message: `Lint failed with ${listFormat.format(counts)}`, label: plugin.name });
      }
    }
  }

  // warn user if they have unused lint rules (they might have meant to configure something!)
  for (const unusedRule of unusedLintRules) {
    logger.warn({ group: 'parser', label: 'lint', message: `Unknown lint rule "${unusedRule}"` });
  }
}

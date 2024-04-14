import type { AnyNode, DocumentNode } from '@humanwhocodes/momoa';
import type { ConfigInit, Plugin } from '../config.js';
import type Logger from '../logger.js';
import type { Group } from '../types.js';

export interface LintNotice {
  /** Lint message shown to the user */
  message: string;
  /** Erring node (used to point to a specific line) */
  node?: AnyNode;
}

export interface LinterOptions {
  tokens: Group;
  ast: DocumentNode;
  severity: LintRuleSeverity;
  /** Any options the user has declared for this plugin */
  options?: any;
}
export type Linter = (options: LinterOptions) => Promise<LintNotice[] | undefined>;

export interface LintRule<O = any> {
  id: string;
  severity: LintRuleSeverity;
  options?: O;
}

export type LintRuleSeverity = 'error' | 'warn' | 'off';
export type LintRuleShorthand = LintRuleSeverity | 0 | 1 | 2;
export type LintRuleLonghand = [LintRuleSeverity | 0 | 1 | 2, any];

export interface LintRunnerOptions {
  ast: DocumentNode;
  config: ConfigInit;
  logger: Logger;
}

export default function lintRunner(options: LintRunnerOptions): Promise<void>;

import type { LintNotice, LinterOptions } from '../../index.js';

export interface RuleDuplicateValueOptions {
  /** (optional) Token IDs to ignore. Supports globs (`*`). */
  ignore?: string[];
}

export default function ruleDuplicateValues(
  options: LinterOptions<RuleDuplicateValueOptions>,
): Promise<LintNotice[] | undefined>;

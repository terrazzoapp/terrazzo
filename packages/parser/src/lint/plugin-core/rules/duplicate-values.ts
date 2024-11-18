import { isAlias, isTokenMatch } from '@terrazzo/token-tools';
import type { LintNotice, LinterOptions } from '../../index.js';

export interface RuleDuplicateValueOptions {
  /** (optional) Token IDs to ignore. Supports globs (`*`). */
  ignore?: string[];
}

export default async function ruleDuplicateValues({
  tokens,
  rule: { severity },
  options,
}: LinterOptions<RuleDuplicateValueOptions>): Promise<LintNotice[] | undefined> {
  if (severity === 'off') {
    return;
  }

  const notices: LintNotice[] = [];
  const values: Record<string, Set<any>> = {};

  for (const id in tokens) {
    if (!Object.hasOwn(tokens, id)) {
      continue;
    }

    const t = tokens[id]!;

    // skip ignored tokens
    if (options?.ignore && isTokenMatch(id, options.ignore)) {
      return;
    }

    if (!values[t.$type]) {
      values[t.$type] = new Set();
    }

    // primitives: direct comparison is easy
    if (
      t.$type === 'color' ||
      t.$type === 'dimension' ||
      t.$type === 'duration' ||
      t.$type === 'link' ||
      t.$type === 'number' ||
      t.$type === 'fontWeight'
    ) {
      // skip aliases (note: $value will be resolved)
      if (isAlias(t.aliasOf)) {
        return;
      }

      if (values[t.$type]?.has(t.$value)) {
        notices.push({ message: `Duplicated value: "${t.$value}" (${t.id})`, node: t.source.node });
        return;
      }

      values[t.$type]?.add(t.$value);
      return;
    }

    // everything else: use deepEqual
    let isDuplicate = false;
    for (const v of values[t.$type]?.values() ?? []) {
      if (JSON.stringify(t.$value) === JSON.stringify(v)) {
        notices.push({ message: `Duplicated value (${t.id})`, node: t.source.node });
        isDuplicate = true;
        break;
      }
    }

    if (isDuplicate) {
      continue;
    }

    values[t.$type]?.add(t.$value);
  }

  return notices;
}

import { isAlias, isTokenMatch } from '@terrazzo/token-tools';
import deepEqual from 'deep-equal';
import type { ParsedToken } from '../../token.js';

export interface RuleDuplicateValueOptions {
  /** (optional) Token IDs to ignore. Supports globs (`*`). */
  ignore?: string[];
}

export default function ruleDuplicateValues(node: GroupOrToken, options?: RuleDuplicateValueOptions): string {
  const notices: string[] = [];
  const values: Record<string, Set<any>> = {};

  // skip ignored tokens
  if (options?.ignore && isTokenMatch(node.id, options.ignore)) {
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
    if (isAlias(t._original.$value)) {
      continue;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (values[t.$type]?.has(t.$value)) {
      notices.push(`Duplicated value: "${t.$value as unknown as string}" (${t.id})`);
      continue;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    values[t.$type]?.add(t.$value);
    continue;
  }

  // everything else: use deepEqual
  let isDuplicate = false;
  for (const v of values[t.$type]?.values() ?? []) {
    if (deepEqual(t.$value, v)) {
      notices.push(`Duplicated value (${t.id})`);
      isDuplicate = true;
      break;
    }
  }

  if (isDuplicate) {
    continue;
  }

  values[t.$type]?.add(t.$value as any); // eslint-disable-line @typescript-eslint/no-explicit-any
}

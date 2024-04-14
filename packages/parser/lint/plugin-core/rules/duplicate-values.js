import { isAlias, isTokenMatch } from '@terrazzo/token-tools';
import deepEqual from 'deep-equal';

export default function ruleDuplicateValues({ ast, tokens, severity }) {
  const notices = [];
  const values = {};

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
      return;
    }

    if (values[t.$type]?.has(t.$value)) {
      notices.push(`Duplicated value: "${t.$value}" (${t.id})`);
      return;
    }

    values[t.$type]?.add(t.$value);
    return;
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
    return;
  }

  values[t.$type]?.add(t.$value);
}

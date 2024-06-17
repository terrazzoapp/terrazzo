import { isAlias, isTokenMatch } from '@terrazzo/token-tools';
import deepEqual from 'deep-equal';

export default function ruleDuplicateValues({ tokens, rule: { severity }, options }) {
  if (severity === 'off') {
    return;
  }

  const notices = [];
  const values = {};

  for (const id in tokens) {
    if (!Object.hasOwn(tokens, id)) {
      continue;
    }

    const t = tokens[id];

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
      if (isAlias(t._original.$value)) {
        return;
      }

      if (values[t.$type]?.has(t.$value)) {
        notices.push({ message: `Duplicated value: "${t.$value}" (${t.id})`, node: t.sourceNode });
        return;
      }

      values[t.$type]?.add(t.$value);
      return;
    }

    // everything else: use deepEqual
    let isDuplicate = false;
    for (const v of values[t.$type]?.values() ?? []) {
      if (deepEqual(t.$value, v)) {
        notices.push({ message: `Duplicated value (${t.id})`, node: t.sourceNode });
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

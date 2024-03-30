import { isAlias, isTokenMatch } from '@cobalt-ui/utils';
import deepEqual from 'deep-equal';
import { type BorderTokenValue, type GradientToken, type ParsedToken, type ShadowValue, type StrokeStyleValue, type TransitionValue, type TypographyValue } from '../../token.js';

export interface RuleDuplicateValueOptions {
  /** (optional) Token IDs to ignore. Supports globs (`*`). */
  ignore?: string[];
}

export default function ruleDuplicateValues(tokens: ParsedToken[], options?: RuleDuplicateValueOptions): string[] {
  const notices: string[] = [];
  const values = {
    border: new Set<BorderTokenValue>(),
    color: new Set<string>(),
    cubicBezier: new Set<[number, number, number, number]>(),
    dimension: new Set<string>(),
    duration: new Set<string>(),
    fontFamily: new Set<string[]>(),
    fontWeight: new Set<number>(),
    gradient: new Set<GradientToken['$value']>(),
    link: new Set<string>(),
    number: new Set<number>(),
    shadow: new Set<ShadowValue>(),
    strokeStyle: new Set<StrokeStyleValue>(),
    transition: new Set<TransitionValue>(),
    typography: new Set<TypographyValue>(),
  };

  for (const t of tokens) {
    // skip ignored tokens
    if (options?.ignore && isTokenMatch(t.id, options.ignore)) {
      continue;
    }

    // primitives: direct comparison is easy
    if (t.$type === 'color' || t.$type === 'dimension' || t.$type === 'duration' || t.$type === 'link' || t.$type === 'number' || t.$type === 'fontWeight') {
      // skip aliases (note: $value will be resolved)
      if (isAlias(t._original.$value)) {
        continue;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((values[t.$type] as Set<any>).has(t.$value)) {
        notices.push(`Duplicated value: "${t.$value as unknown as string}" (${t.id})`);
        continue;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (values[t.$type] as Set<any>).add(t.$value);
      continue;
    }

    // everything else: use deepEqual
    let isDuplicate = false;
    for (const v of values[t.$type].values()) {
      if (deepEqual(t.$value, v)) {
        notices.push(`Duplicated value (${t.id})`);
        isDuplicate = true;
        break;
      }
    }

    if (isDuplicate) {
      continue;
    }

    values[t.$type].add(t.$value as any); // eslint-disable-line @typescript-eslint/no-explicit-any
  }

  return notices;
}

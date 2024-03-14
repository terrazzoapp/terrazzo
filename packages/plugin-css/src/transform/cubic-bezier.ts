import type { ParsedCubicBezierToken } from '@cobalt-ui/core';

/** transform cubic beziér */
export default function transformCubicBezier(value: ParsedCubicBezierToken['$value']): string {
  return `cubic-bezier(${value.join(', ')})`;
}

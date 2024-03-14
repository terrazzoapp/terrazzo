import type { ParsedStrokeStyleToken } from '@cobalt-ui/core';

/** transform stroke style */
export default function transformStrokeStyle(value: ParsedStrokeStyleToken['$value']): string {
  if (typeof value === 'string') {
    return value;
  }
  return 'dashed'; // CSS doesn’t support custom dashes or line caps, so just convert to `dashed`
}

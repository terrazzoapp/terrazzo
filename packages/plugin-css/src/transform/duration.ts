import type {ParsedDurationToken} from '@cobalt-ui/core';

/** transform duration */
export default function transformDuration(value: ParsedDurationToken['$value']): string {
  return String(value);
}

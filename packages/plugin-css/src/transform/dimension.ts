import type {ParsedDimensionToken} from '@cobalt-ui/core';

/** transform dimension */
export default function transformDimension(value: ParsedDimensionToken['$value']): string {
  return String(value);
}

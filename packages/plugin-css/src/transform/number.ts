import type {ParsedNumberToken} from '@cobalt-ui/core';

/** transform number */
export default function transformNumber(value: ParsedNumberToken['$value']): number {
  return Number(value);
}

import type { ParsedLinkToken } from '@cobalt-ui/core';

/** transform file */
export default function transformLink(value: ParsedLinkToken['$value']): string {
  return `url('${value}')`;
}

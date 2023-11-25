import type {ParsedFontWeightToken} from '@cobalt-ui/core';

/** transform font weight */
export default function transformFontWeight(value: ParsedFontWeightToken['$value']): number {
  return Number(value);
}

import type { ParsedBorderToken, ParsedToken } from '@cobalt-ui/core';
import { isAlias } from '@cobalt-ui/utils';
import type { makeNameGenerator } from '../utils/token.js';
import { getMode, varRef } from '../utils/token.js';
import transformColor, { type ColorFormat } from './color.js';
import transformDimension from './dimension.js';
import transformStrokeStyle from './stroke-style.js';

export default function transformBorder(
  token: ParsedBorderToken,
  {
    colorFormat,
    mode,
    prefix,
    tokens,
    generateName,
  }: { colorFormat: ColorFormat; mode?: string; prefix?: string; tokens?: ParsedToken[]; generateName?: ReturnType<typeof makeNameGenerator> },
): string {
  const { value, originalVal } = getMode(token, mode);
  if (typeof originalVal === 'string') {
    return varRef(originalVal, { prefix, tokens, generateName });
  }
  const width = isAlias(originalVal.width) ? varRef(originalVal.width, { property: 'width', prefix, tokens, generateName }) : transformDimension(value.width);
  const color = isAlias(originalVal.color) ? varRef(originalVal.color, { property: 'color', prefix, tokens, generateName }) : transformColor(originalVal.color, colorFormat);
  const style = isAlias(originalVal.style) ? varRef(originalVal.style as string, { property: 'style', prefix, tokens, generateName }) : transformStrokeStyle(value.style);
  return `${width} ${style} ${color}`;
}

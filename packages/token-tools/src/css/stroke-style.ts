import type { StrokeStyleValue } from '../types.js';
import { type IDGenerator, defaultAliasTransform } from './lib.js';

/** Convert strokeStyle value to CSS */
export function transformStrokeStyleValue(
  value: string | StrokeStyleValue,
  { aliasOf, transformAlias = defaultAliasTransform }: { aliasOf?: string; transformAlias?: IDGenerator } = {},
): string {
  if (aliasOf) {
    return transformAlias(aliasOf);
  }
  return typeof value === 'string' ? value : 'dashed'; // CSS doesn’t have `dash-array`; it’s just "dashed"
}

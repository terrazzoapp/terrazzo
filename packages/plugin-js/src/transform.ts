import type { TokenNormalized, TokenTransformed, TransformHookOptions } from '@terrazzo/parser';
import { FORMAT_ID } from './lib.js';

export default function transformValue(
  token: TokenNormalized,
  {
    id,
    setTransform,
    customTransform,
  }: {
    id: string;
    setTransform: TransformHookOptions['setTransform'];
    customTransform?: (token: TokenNormalized, mode: string) => TokenTransformed['value'];
  },
) {
  if (customTransform) {
    for (const mode in token.mode) {
      const value = customTransform(token, mode);
      if (value) {
        if ((typeof value !== 'string' && typeof value !== 'object') || Array.isArray(value)) {
          throw new Error(
            `transform(): expected string or Object of strings, received ${Array.isArray(value) ? 'Array' : typeof value}`,
          );
        }
        switch (token.$type) {
          case 'typography': {
            if (typeof value !== 'object') {
              throw new Error('transform(): typography tokens must be an object of keys');
            }
            break;
          }
        }
        setTransform(id, { format: FORMAT_ID, value, mode });
        return;
      }
    }
  }
}

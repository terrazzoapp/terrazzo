import type { TransitionValueNormalized } from '../types.js';
import { transformCubicBezierValue } from './cubic-bezier.js';
import { transformDurationValue } from './duration.js';
import { type IDGenerator, defaultAliasTransform, transformCompositeAlias } from './lib.js';

/** Convert transition value to multiple CSS values */
export function transformTransitionValue(
  value: TransitionValueNormalized,
  {
    aliasOf,
    partialAliasOf,
    transformAlias = defaultAliasTransform,
  }: {
    aliasOf?: string;
    partialAliasOf?: Partial<Record<keyof typeof value, string>>;
    transformAlias?: IDGenerator;
  } = {},
): {
  duration: ReturnType<typeof transformDurationValue>;
  delay: ReturnType<typeof transformDurationValue>;
  'timing-function': ReturnType<typeof transformCubicBezierValue>;
} {
  if (aliasOf) {
    return transformCompositeAlias(value, { aliasOf, transformAlias }) as {
      duration: ReturnType<typeof transformDurationValue>;
      delay: ReturnType<typeof transformDurationValue>;
      'timing-function': ReturnType<typeof transformCubicBezierValue>;
    };
  }
  return {
    duration: partialAliasOf?.duration
      ? transformAlias(partialAliasOf.duration)
      : transformDurationValue(value.duration, { transformAlias }),
    delay: partialAliasOf?.delay
      ? transformAlias(partialAliasOf.delay)
      : transformDurationValue(value.delay, { transformAlias }),
    'timing-function': partialAliasOf?.timingFunction
      ? transformAlias(partialAliasOf.timingFunction)
      : transformCubicBezierValue(value.timingFunction, { transformAlias }),
  };
}

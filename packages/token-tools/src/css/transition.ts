import type { CubicBezierTokenNormalized, DurationTokenNormalized, TransitionTokenNormalized } from '../types.js';
import type { StrictTransformCSSValueOptions } from './css-types.js';
import { transformCubicBezier } from './cubic-bezier.js';
import { transformDuration } from './duration.js';
import { defaultAliasTransform } from './lib.js';

/** Convert transition value to shorthand */
export function transformTransition(token: TransitionTokenNormalized, options: StrictTransformCSSValueOptions) {
  const { tokensSet, transformAlias = defaultAliasTransform } = options;
  if (token.aliasChain?.[0]) {
    return transformAlias(tokensSet[token.aliasChain[0]]);
  }

  const duration = token.partialAliasOf?.duration
    ? transformAlias(tokensSet[token.partialAliasOf.duration])
    : transformDuration({ $value: token.$value.duration } as DurationTokenNormalized, options);
  const delay = token.partialAliasOf?.delay
    ? transformAlias(tokensSet[token.partialAliasOf.delay])
    : transformDuration({ $value: token.$value.delay } as DurationTokenNormalized, options);
  const timingFunction = token.partialAliasOf?.timingFunction
    ? transformAlias(tokensSet[token.partialAliasOf.timingFunction])
    : transformCubicBezier({ $value: token.$value.timingFunction } as CubicBezierTokenNormalized, options);

  return `${duration} ${delay} ${timingFunction}`;
}

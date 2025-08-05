import type { Logger, TokenNormalized } from '@terrazzo/parser';
import { transformCSSValue } from '@terrazzo/token-tools/css';

function isCompositeTypography(computed: ReturnType<typeof transformCSSValue>): computed is {
  'font-family'?: string;
  'font-size'?: string;
  'font-style'?: string;
  'font-weight'?: string;
  'line-height'?: string;
} {
  return (
    typeof computed === 'object' &&
    ('font-weight' in computed ||
      'font-size' in computed ||
      'font-family' in computed ||
      'line-height' in computed ||
      'font-style' in computed)
  );
}

export function computePreviewValue({
  tokensSet,
  token,
  mode,
  logger,
}: {
  tokensSet: Record<string, TokenNormalized>;
  token: TokenNormalized;
  mode?: string;
  logger: Logger;
}): string {
  const recursiveNoAliasTransform = (rToken: TokenNormalized): string => {
    /* When a token aliases to another token, the aliased token often does not have values in
     * the same mode, so we revert to the default mode in that case, which will often, but not
     * always, yield the correct value. This algorithm prints wrong values when an aliased token
     * is affected by a different set of modes. */
    const modeToTransformWith = mode && mode in rToken.mode ? mode : '.';

    const computed = transformCSSValue(rToken, {
      mode: modeToTransformWith,
      tokensSet,
      transformAlias: recursiveNoAliasTransform,
      color: { legacyHex: true },
    });

    if (typeof computed === 'object') {
      if (token.$type === 'typography' && isCompositeTypography(computed)) {
        return `${computed['font-weight'] || 400}${computed['font-style'] ? ` ${computed['font-style']}` : ''} ${computed['font-size'] || '1rem'}${computed['line-height'] ? `/${computed['line-height']}` : ''} ${computed['font-family'] ?? 'inherit'}`;
      }

      // TODO: WideGamutColorValue

      logger.warn({
        group: 'plugin',
        label: `@terrazzo/plugin-token-listing > build > ${token.id}`,
        message: `Preview value computation is not supported yet for: ${JSON.stringify(computed)}`,
      });
      return '';
    }

    return computed ?? '';
  };

  return recursiveNoAliasTransform(token);
}

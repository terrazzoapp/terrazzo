import type { Logger, Plugin, TokenNormalized, TokenTransformed, TransformParams } from '@terrazzo/parser';
import type { TokenListingExtension, TokenListingPluginOptions } from './lib.js';
import { transformCSSValue } from '@terrazzo/token-tools/css';

export * from './lib.js';

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

function computePreviewValue({
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

// function extractReferencedTokens(token: TokenNormalized): TokenNormalized[] {
//   return token.aliasChain ? [token.aliasChain[0]] : []
// }

// function extractEntriesFromTokenInMode(token: TokenNormalized, tokenInMode: TokenNormalized, mode: string): any[] {
// // TODO: extract entries from the tokens referenced inside this one's value
// const referencedTokens = extractReferencedTokens(tokenInMode);
// const referencedEntries = referencedTokens.map(extractEntriesFromToken)

// // TODO: compute the combination of modes that exist in these entries. E.g. if referencedToken 1 has modes light and dark, and referencedToken 2 has modes light and dark, then we have: light + light, light + dark, dark + light, dark + dark.
// // If referencedToken 1 has light and dark, and referencedToken 2 has mobile, tablet, desktop, then we have: light + mobile, light + tablet, light + desktop, dark + mobile, dark + tablet, dark + desktop.
// const referenceModeMatrix = referencedEntries.reduce((acc, entries) => { }, []);

// // TODO: eliminate mutually exclusive modes from the mode matrix, e.g. the Resolver spec will tell us that light and dark are mutually exclusive, so we can eliminate light + dark and dark + light from the matrix.
// // FIXME: resolver spec not available yet.
// const finalModeMatrix = filterMutuallyExclusiveModes(referenceModeMatrix);

/*
  
  t1 .        t2 .
  t1 light    t2 light
  t1 dark     t2 dark
  
  
  return {
    $name: token.id,
    $type: token.$type,
    $value: tokenInMode ? tokenInMode.$value : token.$value,
    $modes: [mode],
    };
    }
// TODO: return a mapping of those entries' modes/previewValues and our current token

function extractEntriesFromToken(token: TokenNormalized) {
  return Object.entries(token.mode).map(([mode, tokenInMode]) => ({
    $name: token.id,
    $type: token.$type,
    $value: tokenInMode ? tokenInMode.$value : token.$value,
    $modes: [mode],
  }));
}

function computeEntry(entry) {
  return {
    ...entry,
    $extensions: {
      'app.terrazzo.listing': getListingMeta({ token, tokensSet: tokens, getTransforms, mode }),
    },
  };
}


*/

export default function tokenListingPlugin(options: TokenListingPluginOptions): Plugin {
  const { names = [], subtype } = options;

  const getListingMeta = ({
    token,
    tokensSet,
    getTransforms,
    logger,
    mode,
  }: {
    token: TokenNormalized;
    tokensSet: Record<string, TokenNormalized>;
    logger: Logger;
    getTransforms: (params: TransformParams) => TokenTransformed[];
    mode?: string;
  }): TokenListingExtension => {
    const computedNames: Record<string, string> = {};
    for (const [name, nameOption] of Object.entries(names)) {
      if ('plugin' in nameOption) {
        // FIXME: plugin IDs and names actually differ, we'd need to import an `id` export from plugins.
        // The current code assumes that the plugin name is the same as the ID, until then, to DEBUG.
        const pluginToken = getTransforms({
          format: nameOption.plugin.replace('@terrazzo/plugin-', ''),
          id: token.id,
          mode,
        })[0];
        // FIXME this line is made complicated because localID is not guaranteed to exist and be a string.
        computedNames[name] = pluginToken && 'localID' in pluginToken ? `${pluginToken.localID}` : '';
      } else if ('transform' in nameOption) {
        computedNames[name] = nameOption.transform(token, mode === '.' ? undefined : mode);
      }
    }

    const previewValue = computePreviewValue({ tokensSet, token, mode, logger });

    const output: TokenListingExtension = {
      names: computedNames,
      // source: TODO once the Resolver Spec is implemented.
      originalValue: token.originalValue.$value,
      subtype: subtype?.(token),
    };

    if (previewValue !== '') {
      output.previewValue = previewValue;
    }

    if (mode !== '.') {
      output.mode = mode;
    }

    return output;
  };

  return {
    name: '@terrazzo/plugin-token-listing',
    async build({ context: { logger }, tokens, getTransforms, outputFile }) {
      const listing = Object.values(tokens).flatMap((token) =>
        Object.entries(token.mode).map(([mode, tokenInMode]) => ({
          $name: token.id,
          $type: token.$type,
          $value: tokenInMode ? tokenInMode.$value : token.$value,
          $extensions: {
            'app.terrazzo.listing': getListingMeta({ logger, token, tokensSet: tokens, getTransforms, mode }),
          },
        })),
      );

      const content = {
        meta: {
          version: 1,
          'authoring-tool': 'Terrazzo',
          modes: options.modes,
          names: options.names,
          source: options.defaultSource,
        },
        data: listing,
      };

      // biome-ignore lint/suspicious/noExplicitAny: accounting for typos.
      const filename = options.filename ?? (options as any)?.fileName ?? 'tokens.listing.json';
      outputFile(filename, JSON.stringify(content, null, 2));
    },
  };
}

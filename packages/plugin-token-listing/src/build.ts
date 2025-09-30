import type { Logger, Plugin, TokenNormalized, TokenTransformed, TransformParams } from '@terrazzo/parser';
import type { PlatformOption, TokenListing, TokenListingExtension, TokenListingPluginOptions } from './lib.js';
import { computePreviewValue } from './utils/previewValue.js';
import mapValues from './utils/utils.js';

export * from './lib.js';

function getNameFromPlugin({
  getTransforms,
  mode,
  plugin,
  token,
}: {
  getTransforms: (params: TransformParams) => TokenTransformed[];
  mode: string | undefined;
  plugin: string;
  token: TokenNormalized;
}): string | undefined {
  const transformed = getTransforms({ format: plugin.replace('@terrazzo/plugin-', ''), id: token.id, mode });
  if (transformed[0]) {
    return transformed[0].meta?.['token-listing']?.name;
  }

  const fallback = getTransforms({ format: plugin, id: token.id, mode });
  if (fallback[0]) {
    return fallback[0].meta?.['token-listing']?.name;
  }
}

function getName({
  getTransforms,
  logger,
  mode,
  platform,
  tokensSet,
  token,
}: {
  getTransforms: (params: TransformParams) => TokenTransformed[];
  logger: Logger;
  mode: string | undefined;
  platform: PlatformOption;
  tokensSet: Record<string, TokenNormalized>;
  token: TokenNormalized;
}): string | undefined {
  // Whole platform is a Terrazzo plugin shorthand.
  if (typeof platform === 'string') {
    return getNameFromPlugin({ getTransforms, mode, plugin: platform, token });
  }

  let name: string | undefined;
  if ('name' in platform && typeof platform.name === 'string') {
    name = getNameFromPlugin({ getTransforms, mode, plugin: platform.name, token });
  } else if ('name' in platform && typeof platform.name === 'function') {
    name = platform.name({
      logger,
      mode: mode === '.' ? undefined : mode,
      tokensSet,
      token,
    });
  }

  let filter: boolean = true;
  if ('filter' in platform && typeof platform.filter === 'string') {
    filter = !!getNameFromPlugin({ getTransforms, mode, plugin: platform.filter, token });
  } else if ('filter' in platform && typeof platform.filter === 'function') {
    filter = platform.filter({
      logger,
      mode: mode === '.' ? undefined : mode,
      tokensSet,
      token,
    });
  }

  return filter ? name : undefined;
}

export default function getBuild(options: TokenListingPluginOptions): Plugin['build'] {
  const { platforms = {} } = options;

  const getListingMeta = ({
    getTransforms,
    logger,
    mode,
    token,
    tokensSet,
  }: {
    getTransforms: (params: TransformParams) => TokenTransformed[];
    logger: Logger;
    mode?: string;
    token: TokenNormalized;
    tokensSet: Record<string, TokenNormalized>;
  }): TokenListingExtension => {
    const computedNames: Record<string, string> = {};
    for (const [pid, platform] of Object.entries(platforms)) {
      const name = getName({ getTransforms, logger, mode, platform, tokensSet, token });
      if (name) {
        computedNames[pid] = name;
      }
    }

    const output: TokenListingExtension = {
      names: computedNames,
      originalValue: token.originalValue.$value,
    };

    const previewValue =
      options.previewValue?.({ tokensSet, token, mode, logger }) ??
      computePreviewValue({ tokensSet, token, mode, logger });
    if (previewValue !== '') {
      output.previewValue = previewValue;
    }

    const subtype = options.subtype?.({
      logger,
      mode: mode === '.' ? undefined : mode,
      tokensSet,
      token,
    });
    if (subtype) {
      output.subtype = subtype;
    }

    if (mode !== '.') {
      output.mode = mode;
    }

    const sourceOfTruth =
      typeof options.sourceOfTruth === 'object'
        ? options.sourceOfTruth?.custom?.({ tokensSet, token, mode, logger })
        : undefined;
    if (sourceOfTruth) {
      output.sourceOfTruth = sourceOfTruth;
    }

    const source = token.source.loc
      ? {
          resource: token.source.loc,
          loc: token.source.node.loc,
        }
      : undefined;
    if (source) {
      output.source = source;
    }

    return output;
  };

  return async function build({ context: { logger }, getTransforms, outputFile, tokens }) {
    const listing = Object.values(tokens).flatMap((token) =>
      Object.entries(token.mode).map(([mode, tokenInMode]) => ({
        $name: token.id,
        $type: token.$type,
        $value: tokenInMode ? tokenInMode.$value : token.$value,
        $deprecated: token.$deprecated,
        $extensions: {
          'app.terrazzo.listing': getListingMeta({ getTransforms, logger, token, tokensSet: tokens, mode }),
        },
      })),
    );

    const content = {
      meta: {
        version: 1,
        authoringTool: 'Terrazzo',
        modes: options.modes,
        platforms: mapValues(options.platforms ?? {}, (platform: PlatformOption) =>
          typeof platform === 'string' ? { description: platform } : { description: platform.description },
        ),
        sourceOfTruth:
          typeof options.sourceOfTruth === 'string' ? options.sourceOfTruth : options.sourceOfTruth?.default,
      },
      data: listing,
    } satisfies TokenListing;

    // biome-ignore lint/suspicious/noExplicitAny: accounting for typos.
    const filename = options.filename ?? (options as any)?.fileName ?? 'tokens.listing.json';
    outputFile(filename, JSON.stringify(content, null, 2));
  };
}

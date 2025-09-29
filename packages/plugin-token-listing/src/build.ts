import type { PlatformOption, TokenListingExtension, TokenListingPluginOptions } from './lib.js';
import { computePreviewValue } from './utils/previewValue.js';
import mapValues from './utils/utils.js';
import type { ListingService, Logger, Plugin, TokenNormalized, TokenTransformed, TransformParams } from '@terrazzo/parser';

export * from './lib.js';

function getNameFromPlugin({
  listingService, 
  mode,
  plugin,
  token,
}: {
  listingService: ListingService;
  mode: string | undefined;
  plugin: string;
  token: TokenNormalized;
}): string | undefined {
  const annotation = listingService.getAnnotationsForToken(token.id, mode).find(({ pluginId }) => pluginId === plugin);

  return annotation?.name;
}

function getName({ logger, listingService, mode, platform, tokensSet, token }: {
  logger: Logger;
  listingService: ListingService;
  mode: string | undefined;
  platform: PlatformOption;
  tokensSet: Record<string, TokenNormalized>;
  token: TokenNormalized;
}): string | undefined {

  // Whole platform is a Terrazzo plugin shorthand.
  if (typeof platform === 'string') {
    return getNameFromPlugin({ listingService, mode, plugin: platform, token });
  }
  
  let name: string | undefined;
  if ('name' in platform && typeof platform.name === 'string') {
    name = getNameFromPlugin({ listingService, mode, plugin: platform.name, token });
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
    filter = !!(getNameFromPlugin({ listingService, mode, plugin: platform.filter, token }));
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

export default function getBuild(options: TokenListingPluginOptions): Plugin["build"] {
  const { platforms = {} } = options;

  const getListingMeta = ({
    listingService,
    logger,
    mode,
    token,
    tokensSet,
  }: {
    token: TokenNormalized;
    tokensSet: Record<string, TokenNormalized>;
    logger: Logger;
    listingService: ListingService;
    getTransforms: (params: TransformParams) => TokenTransformed[];
    mode?: string;
  }): TokenListingExtension => {
    const computedNames: Record<string, string> = {};
    for (const [pid, platform] of Object.entries(platforms)) {
      const name = getName({ logger, listingService, mode, platform, tokensSet, token });
      if (name) {
        computedNames[pid] = name;
      }
    }

    const output: TokenListingExtension = {
      names: computedNames,
      originalValue: token.originalValue.$value,
    };

    
    const previewValue = options.previewValue?.({ tokensSet, token, mode, logger }) ?? computePreviewValue({ tokensSet, token, mode, logger });
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
      typeof options.sourceOfTruth === 'object' ? options.sourceOfTruth?.custom?.({ tokensSet, token, mode, logger }) : undefined;
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

  return async function build({ context: { listingService, logger }, tokens, getTransforms, outputFile }) {
    const listing = Object.values(tokens).flatMap((token) =>
      Object.entries(token.mode).map(([mode, tokenInMode]) => ({
        $name: token.id,
        $type: token.$type,
        $value: tokenInMode ? tokenInMode.$value : token.$value,
        $deprecated: token.$deprecated,
        $extensions: {
          'app.terrazzo.listing': getListingMeta({ listingService, logger, token, tokensSet: tokens, getTransforms, mode }),
        },
      })),
    );

    const content = {
      meta: {
        version: 1,
        authoringTool: 'Terrazzo',
        modes: options.modes,
        names: mapValues(options.platforms ?? {}, (platform: PlatformOption) =>
          typeof platform === 'string' ? { description: platform } : { description: platform.description },
        ),
        sourceOfTruth:
          typeof options.sourceOfTruth === 'string' ? options.sourceOfTruth : options.sourceOfTruth?.default,
      },
      data: listing,
    };

    // biome-ignore lint/suspicious/noExplicitAny: accounting for typos.
    const filename = options.filename ?? (options as any)?.fileName ?? 'tokens.listing.json';
    outputFile(filename, JSON.stringify(content, null, 2));
  };
}

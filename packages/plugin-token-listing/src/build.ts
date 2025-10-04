import type { Logger, ModeMap, Plugin, TokenNormalized, TokenTransformed, TransformParams } from '@terrazzo/parser';
import type { PlatformOption, TokenListing, TokenListingExtension, TokenListingPluginOptions } from './lib.js';
import { computePreviewValue } from './utils/previewValue.js';
import mapValues from './utils/utils.js';
import path from 'node:path';

export * from './lib.js';

function getNameFromPlugin({
  getTransforms,
  logger,
  mode,
  pid,
  plugin,
  token,
}: {
  getTransforms: (params: TransformParams) => TokenTransformed[];
  logger: Logger;
  mode: string | undefined;
  pid: string;
  plugin: string;
  token: TokenNormalized;
}): string | undefined {
  const transformed = getTransforms({ format: plugin, id: token.id, mode });
  if (transformed[0]) {
    return transformed[0].meta?.['token-listing']?.name;
  }

  const fallback = getTransforms({ format: plugin.replace('@terrazzo/plugin-', ''), id: token.id, mode });
  if (fallback[0]) {
    return fallback[0].meta?.['token-listing']?.name;
  }

  if (getTransforms({ format: plugin, id: '*' }).length === 0 && getTransforms({ format: plugin.replace('@terrazzo/plugin-', ''), id: '*' }).length === 0) {
    logger.error({
      group: 'plugin',
      label: 'token-listing',
      message: `Could not find format "${plugin}" to compute token names for platform "${pid}", please check your configuration matches the format documented in the plugin you're attempting to use.`,
    });
  }

  return undefined;
}

function getName({
  getTransforms,
  logger,
  mode,
  pid,
  platform,
  tokensSet,
  token,
}: {
  getTransforms: (params: TransformParams) => TokenTransformed[];
  logger: Logger;
  mode: string;
  pid: string;
  platform: PlatformOption;
  tokensSet: Record<string, TokenNormalized>;
  token: TokenNormalized;
}): string | undefined {
  // Whole platform is a Terrazzo plugin shorthand.
  if (typeof platform === 'string') {
    return getNameFromPlugin({ getTransforms, logger, mode, pid, plugin: platform, token });
  }

  let name: string | undefined;
  if ('name' in platform && typeof platform.name === 'string') {
    name = getNameFromPlugin({ getTransforms, logger, mode, pid, plugin: platform.name, token });
  } else if ('name' in platform && typeof platform.name === 'function') {
    name = platform.name({ logger, mode, tokensSet, token });
  }

  let filter: boolean = true;
  if ('filter' in platform && typeof platform.filter === 'string') {
    filter = !!getNameFromPlugin({ getTransforms, logger, mode, pid, plugin: platform.filter, token });
  } else if ('filter' in platform && typeof platform.filter === 'function') {
    filter = platform.filter({ logger, mode, tokensSet, token });
  }

  return filter ? name : undefined;
}

function getPlatformDescription(platform: PlatformOption): { description?: string } {
  if (typeof platform === 'string') {
    return { description: `Automatically generated from ${platform}` };
  }

  return { description: platform.description };
}

export default function getBuild(options: TokenListingPluginOptions): Plugin['build'] {
  const { platforms = {} } = options;

  const getListingMeta = ({
    getTransforms,
    logger,
    mode,
    resourceRoot = process.cwd(),
    token,
    tokensSet,
  }: {
    getTransforms: (params: TransformParams) => TokenTransformed[];
    logger: Logger;
    mode: string;
    resourceRoot?: string;
    token: TokenNormalized;
    tokensSet: Record<string, TokenNormalized>;
  }): TokenListingExtension => {
    const computedNames: Record<string, string> = {};
    for (const [pid, platform] of Object.entries(platforms)) {
      const name = getName({ getTransforms, logger, mode, pid, platform, tokensSet, token });
      if (name) {
        computedNames[pid] = name;
      }
    }

    const originalValue = (token.originalValue?.$extensions as {
        mode?: ModeMap<TokenNormalized>;
      })?.mode?.[mode] ?? token.originalValue.$value;

    const output: TokenListingExtension = {
      names: computedNames,
      originalValue,
    };

    const previewValue =
      options.previewValue?.({ logger, mode, tokensSet, token }) ??
      computePreviewValue({ logger, mode, tokensSet, token });
    if (previewValue !== '') {
      output.previewValue = previewValue;
    }

    const subtype = options.subtype?.({ logger, mode, tokensSet, token });
    if (subtype) {
      output.subtype = subtype;
    }

    if (mode !== '.') {
      output.mode = mode;
    }

    const sourceOfTruth =
      typeof options.sourceOfTruth === 'object'
        ? options.sourceOfTruth?.custom?.({ logger, mode, tokensSet, token })
        : undefined;
    if (sourceOfTruth) {
      output.sourceOfTruth = sourceOfTruth;
    }

    if (token.source.loc) {
      const fsLoc = token.source.loc.replace('file://', '');
      const relativeLoc = path.relative(resourceRoot, fsLoc);
    
      output.source = {
        resource: `file://<root>/${relativeLoc}`,
        loc: token.source.node.loc,
      };
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
          'app.terrazzo.listing': getListingMeta({ getTransforms, logger, token, resourceRoot: options.resourceRoot, tokensSet: tokens, mode }),
        },
      })),
    );

    const content = {
      meta: {
        version: 1,
        authoringTool: 'Terrazzo',
        modes: options.modes,
        platforms: mapValues(options.platforms ?? {}, getPlatformDescription),
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

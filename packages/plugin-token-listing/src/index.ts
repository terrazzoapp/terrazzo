import type { PlatformOption, ListedExtension, TokenListingPluginOptions } from './lib.js';
import { computePreviewValue } from './utils/previewValue.js';
import mapValues from './utils/utils.js';
import type { Logger, Plugin, TokenNormalized, TokenTransformed, TransformParams } from '@terrazzo/parser';

export type { ListedExtension, ListedToken, TokenListing } from './lib.js';

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
  // FIXME: plugin IDs and names actually differ, we'd need to import an `id` export from plugins.
  // The current code assumes that the plugin name is the same as the ID, until then, to DEBUG.
  const pluginToken = getTransforms({
    format: plugin.replace('@terrazzo/plugin-', ''),
    id: token.id,
    mode,
  })[0];

  // FIXME this line is made complicated because localID is not guaranteed to exist and be a string.
  return pluginToken && 'localID' in pluginToken ? `${pluginToken.localID}` : '';
}

export default function tokenListingPlugin(options: TokenListingPluginOptions): Plugin {
  const { platforms = {} } = options;

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
  }): ListedExtension => {
    const computedNames: Record<string, string> = {};
    for (const [pid, platform] of Object.entries(platforms)) {
      let name: string | undefined;

      // Whole platform is a Terrazzo plugin shorthand.
      if (typeof platform === 'string') {
        name = getNameFromPlugin({
          getTransforms,
          mode: mode === '.' ? undefined : mode,
          plugin: platform,
          token,
        });
      } else if ('name' in platform && typeof platform.name === 'string') {
        // TODO first figure out how filtering is tied to name output
        name = getNameFromPlugin({
          getTransforms,
          mode: mode === '.' ? undefined : mode,
          plugin: platform.name,
          token,
        });
      } else if ('name' in platform && typeof platform.name === 'function') {
        name = platform.name(token, mode === '.' ? undefined : mode);
      }

      // TODO how to decide for filter?

      if (name) {
        computedNames[pid] = name;
      }
    }

    const output: ListedExtension = {
      names: computedNames,
      originalValue: token.originalValue.$value,
    };

    const previewValue = computePreviewValue({ tokensSet, token, mode, logger });
    if (previewValue !== '') {
      output.previewValue = previewValue;
    }

    const subtype = options.subtype?.(token);
    if (subtype) {
      output.subtype = subtype;
    }

    if (mode !== '.') {
      output.mode = mode;
    }

    const sourceOfTruth =
      typeof options.sourceOfTruth === 'object' ? options.sourceOfTruth?.custom?.(token) : undefined;
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

  return {
    name: '@terrazzo/plugin-token-listing',
    async build({ context: { logger }, tokens, getTransforms, outputFile }) {
      const listing = Object.values(tokens).flatMap((token) =>
        Object.entries(token.mode).map(([mode, tokenInMode]) => ({
          $name: token.id,
          $type: token.$type,
          $value: tokenInMode ? tokenInMode.$value : token.$value,
          $description: token.$description,
          $deprecated: token.$deprecated,
          $extensions: {
            'app.terrazzo.listing': getListingMeta({ logger, token, tokensSet: tokens, getTransforms, mode }),
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
    },
  };
}

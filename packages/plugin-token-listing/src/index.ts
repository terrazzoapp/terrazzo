import type { Plugin, TokenNormalized, TokenTransformed, TransformParams } from '@terrazzo/parser';
import { type TokenListingExtension, type TokenListingPluginOptions } from './lib.js';

export * from './lib.js';

export default function tokenListingPlugin(options: TokenListingPluginOptions): Plugin {
  const { names = [], customSource } = options;

  const getListingMeta = ({
    token,
    getTransforms,
    mode,
  }: {
    token: TokenNormalized;
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
      } else if ('getName' in nameOption) {
        computedNames[name] = nameOption.getName(token);
      }
    }

    const webValue = getTransforms({ format: 'css', id: token.id, mode })[0];
    console.log('webValue,', webValue);

    const output: TokenListingExtension = {
      names: computedNames,
      // TODO compute subtype with heuristics or through a function option
      subtype: token.$type,
      previewValue: webValue?.value,
      originalValue: token.originalValue.$value,
    };

    if (mode !== '.') {
      output.mode = mode;
    }

    const computedCustomSource = customSource?.(token);
    if (computedCustomSource) {
      output.source = computedCustomSource;
    }

    return output;
  };

  return {
    name: '@terrazzo/plugin-token-listing',
    async build({ tokens, getTransforms, outputFile }) {
      const listing = Object.values(tokens).flatMap((token) =>
        Object.entries(token.mode).map(([mode, tokenInMode]) => ({
          $name: token.id,
          $type: token.$type,
          $value: tokenInMode ? tokenInMode.$value : token.$value,
          $extensions: {
            'app.terrazzo.listing': getListingMeta({ token, getTransforms, mode }),
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

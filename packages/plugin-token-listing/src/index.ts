import type { Plugin, TokenNormalized, TokenTransformed, TransformParams } from '@terrazzo/parser';
import type { TokenListingExtension, TokenListingPluginOptions } from './lib.js';
import { transformCSSValue } from '@terrazzo/token-tools/css';

export * from './lib.js';

function computePreviewValue(
  tokensSet: Record<string, TokenNormalized>,
  token: TokenNormalized,
  mode?: string,
): string {
  const recursiveNoAliasTransform = (rToken: TokenNormalized): string => {
    // // @ts-expect-error Not typed yet in TZ.
    // if (mode && mode !== '.' && rToken.$extensions?.mode?.[mode]) {

    // }
    // // "$value": "{color.brand.200}",
    // // "$extensions": { "mode": { "light": "{color.brand.200}", "dark": "{color.brand.600}" } }

    if (rToken.id === 'color.background.brand.default') {
      console.log('recursiveNoAliasTransform', mode, typeof mode);
    }
    return `${transformCSSValue(rToken, {
      mode: mode ?? '.',
      tokensSet,
      // STEVE THIS IS WHERE YOU WERE. need to recursively transform so that we dont endu p with var(--)
      // but the primitive token doesn't have a mode value so we need to switch back to "." if undefined?
      transformAlias: recursiveNoAliasTransform,
      // color: { legacyHex: true },
    })}`;
  };

  return recursiveNoAliasTransform(token);
}

export default function tokenListingPlugin(options: TokenListingPluginOptions): Plugin {
  const { names = [], subtype } = options;

  const getListingMeta = ({
    token,
    tokensSet,
    getTransforms,
    mode,
  }: {
    token: TokenNormalized;
    tokensSet: Record<string, TokenNormalized>;
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
    if (token.id === 'color.background.brand.default') {
      console.log('\n\n\n\n\n\n\n\n\n');
    }

    const previewValue = computePreviewValue(tokensSet, token, mode);
    // FIXME: check for failed transforms in whole listing output
    if (token.id === 'color.background.brand.default') {
      console.log('mode', mode);
      // console.log(getTransforms({ format: 'css', id: token.id, mode }));
      console.log('previewValue,', previewValue);
      console.log('\n\n\n');
    }

    const output: TokenListingExtension = {
      names: computedNames,
      // source: TODO once the Resolver Spec is implemented.
      previewValue,
      originalValue: token.originalValue.$value, // FIXME
      subtype: subtype?.(token),
    };

    if (mode !== '.') {
      output.mode = mode;
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
            'app.terrazzo.listing': getListingMeta({ token, tokensSet: tokens, getTransforms, mode }),
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

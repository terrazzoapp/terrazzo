import type { Plugin } from '@terrazzo/parser';
import { tokenToColor } from '@terrazzo/token-tools';
import { to as convert } from 'colorjs.io/fn';

export const FORMAT = 'swift';

export interface SwiftPluginOptions {
  /**
   * Asset Catalog name
   * @default "Tokens"
   */
  catalogName?: string;
}

export interface ColorData {
  colors?: {
    appearances?: { appearance: string; value: string }[];
    color: {
      'color-space'?: string;
      components?: Record<string, string>;
    };
    idiom?: string;
  }[];
  info?: {
    author: string;
    version: number;
  };
}

export default function PluginSwift({ catalogName = 'Tokens' }: SwiftPluginOptions = {}): Plugin {
  return {
    name: '@terrazzo/plugin-swift',
    async transform({ tokens, setTransform }) {
      for (const [id, token] of Object.entries(tokens)) {
        switch (token.$type) {
          case 'color': {
            for (const [mode, modeValue] of Object.entries(token.mode)) {
              if (!modeValue) {
                continue;
              }
              const parsed = tokenToColor(modeValue.$value);
              const {
                coords: [red, green, blue],
                alpha,
              } = convert(parsed, parsed.spaceId, { inGamut: { space: 'p3' } });
              setTransform(id, {
                format: FORMAT,
                mode,
                value: { red: String(red), green: String(green), blue: String(blue), alpha: String(alpha) },
                meta: { 'token-listing': { name: `Color("${token.id}")` } },
              });
            }
            break;
          }

          // TODO: other types
        }
      }
    },
    async build({ getTransforms, outputFile }) {
      const catalog = `${catalogName.replace(/\.xcassets$/, '')}.xcassets`;
      for (const token of getTransforms({ id: '*', format: FORMAT, mode: '.' })) {
        const colorData: ColorData = {
          colors: [
            {
              color: { 'color-space': 'display-p3', components: token.value as Record<string, string> },
              idiom: 'universal',
            },
          ],
          info: { author: 'Terrazzo', version: 1 },
        };
        const [darkToken] = getTransforms({ id: token.token.id, format: FORMAT, mode: 'dark' });
        if (darkToken) {
          colorData.colors!.push({
            appearances: [{ appearance: 'luminosity', value: 'dark' }],
            color: { 'color-space': 'display-p3', components: darkToken.value as Record<string, string> },
            idiom: 'universal',
          });
        }
        outputFile(
          `${catalog}/${token.token.id}.colorset/Contents.json`,
          `${JSON.stringify(colorData, undefined, 2)}\n`,
        );
      }
    },
  };
}

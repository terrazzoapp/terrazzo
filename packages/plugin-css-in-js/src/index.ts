import type { Plugin, TokenTransformed } from '@terrazzo/parser';
import { FORMAT_ID as FORMAT_CSS } from '@terrazzo/plugin-css';
import { camelCase } from 'scule';

export interface CssInJsOptions {
  /**
   * Name the output file.
   * @default "vars.js"
   */
  filename?: string;
}

const PLUGIN_NAME = '@terrazzo/css-in-js';

export default function cssInJs({ filename = 'vars.js' }: CssInJsOptions = {}): Plugin {
  return {
    name: PLUGIN_NAME,
    async build({ context, getTransforms, outputFile }) {
      const css = getTransforms({ format: FORMAT_CSS });
      const tokens = {} as any;

      // 1. Get base groups
      css.sort(alphaComparator);
      for (const token of css) {
        if (!token.localID) {
          context.logger.warn({
            group: 'plugin',
            label: PLUGIN_NAME,
            message: `Token ${token.id} missing CSS var`,
          });
        }
        let node = tokens;
        const parts = token.id.split('.');
        const last = parts.pop()!;
        for (const next of parts) {
          if (!(next in node)) {
            node[camelCase(next)] = {};
          }
          node = node[next];
        }

        if (token.token.jsonID.endsWith('/$root')) {
          node[camelCase(last)] = { $root: `var(${token.localID})` };
        } else {
          node[camelCase(last)] = `var(${token.localID})`;
        }
      }

      // 2. for groups with $root, flatten the nesting
      function walk(root: Record<string, any>, cb: (node: Record<string, any>) => void) {
        if (root && typeof root === 'object' && !Array.isArray(root)) {
          for (const child of Object.values(root)) {
            cb(child);
            walk(child, cb);
          }
        }
      }
      // note: we’re doing this from 2 levels up to modify this object on the fly without breaking or interrupting our walker
      walk(tokens, (parent) => {
        if (parent && typeof parent === 'object') {
          for (const a of Object.keys(parent)) {
            if (parent[a].$root) {
              let shouldHoist = true;
              for (const b of Object.keys(parent[a]).filter((id) => id !== '$root')) {
                const hoistedName = camelCase(`${a}-${b}`);
                if (hoistedName in parent[a]) {
                  context.logger.warn({
                    group: 'plugin',
                    label: PLUGIN_NAME,
                    message: `Could not hoist …${a}.$root because it conflicts with sibling token name ${b}`,
                  });
                  shouldHoist = false;
                  break;
                }
                parent[hoistedName] = parent[a][b];
              }
              // only at the very end can we overwrite the $root, at which point the previous refs will disappear
              if (shouldHoist) {
                parent[a] = parent[a].$root;
              }
            }
          }
        }
      });

      // 3. second pass: build output
      let js = '';
      let dts = '';
      for (const group of Object.keys(tokens)) {
        js += `export const ${jsIdent(group)} = ${JSON.stringify(tokens[group], undefined, 2)};\n`;
        dts += `export const ${jsIdent(group)}: ${JSON.stringify(tokens[group], undefined, 2).replace(/"var\(--[^)]+\)"/g, 'string')};\n`;
      }

      outputFile(filename, js);

      const dtsFilename = typeof filename === 'string' ? filename.replace(/\.(c|m)?js$/, '.d.$1ts') : 'vars.d.ts';
      outputFile(dtsFilename, dts);
    },
  };
}

/** Make a name into a valid JS identifier by adding a preceding _ */
function jsIdent(name: string): string {
  return !/^[A-Za-z$_]/.test(name) ? `_${name}` : name;
}

/** JS compiler-optimizable comparator */
export function alphaComparator(a: TokenTransformed, b: TokenTransformed): number {
  return a.id.localeCompare(b.id, 'en-us', { numeric: true });
}

import type { TokenTransformed } from '@terrazzo/parser';
import { isTokenMatch, kebabCase } from '@terrazzo/token-tools';
import { makeCSSVar } from '@terrazzo/token-tools/css';
import type { CSSRule, UtilityCSSGroup, UtilityCSSPrefix } from '../lib.js';

// micro-optimization: precompile all RegExs (which can be known) because dynamic compilation is a waste of resources
const GROUP_REGEX: Record<UtilityCSSPrefix, RegExp> = {
  bg: /(^bg-|-bg-)/,
  border: /(^border-|-border-)/,
  font: /(^font-|-font-)/,
  gap: /(^gap-|-gap-)/,
  m: /(^margin-|-margin-|)/,
  p: /(^padding-|-padding-|)/,
  shadow: /(^shadow-|-shadow-)/,
  text: /(^text-|-text-)/,
};

/** Make CSS class name from transformed token */
function makeSelector(token: TokenTransformed, prefix: UtilityCSSPrefix, subgroup?: string): string {
  return `.${prefix}${subgroup || ''}-${kebabCase(token.token.id).replace(GROUP_REGEX[prefix], '')}`;
}

function makeVarValue(token: TokenTransformed): string {
  return makeCSSVar(token.localID ?? token.token.id, { wrapVar: true });
}

export default function generateUtilityCSS(
  groups: Record<UtilityCSSGroup, string[]>,
  tokens: TokenTransformed[],
): CSSRule[] {
  const output: CSSRule[] = [];

  const groupEntries = Object.entries(groups);
  groupEntries.sort((a, b) => a[0].localeCompare(b[0]));

  for (const [group, selectors] of groupEntries) {
    const matchingTokens = tokens.filter((token) => isTokenMatch(token.token.id, selectors));
    if (!matchingTokens.length) {
      // biome-ignore lint/suspicious/noConsole: intentional user log
      console.warn(`[@terrazzo/plugin-css] utility group "${group}" matched 0 tokens: ${JSON.stringify(selectors)}`);
      break;
    }

    switch (group) {
      case 'bg': {
        for (const token of matchingTokens) {
          const selector = makeSelector(token, 'bg');
          switch (token.token.$type) {
            case 'color': {
              output.push({ selectors: [selector], declarations: { 'background-color': makeVarValue(token) } });
              break;
            }
            case 'gradient': {
              output.push({
                selectors: [selector],
                declarations: {
                  'background-image': `linear-gradient(${makeCSSVar(token.localID ?? token.token.id, { wrapVar: true })})`,
                },
              });
            }
          }
        }
        break;
      }
      case 'border': {
        // ALL generic properties must come before specific properties
        for (const token of matchingTokens) {
          const property = {
            border: 'border',
            color: 'border-color',
            dimension: 'border-width',
            strokeStyle: 'border-style',
          }[token.token.$type as string];
          if (property) {
            output.push({
              selectors: [makeSelector(token, 'border')],
              declarations: { [property]: makeVarValue(token) },
            });
          }
        }
        // specific properties
        for (const token of matchingTokens) {
          for (const side of ['top', 'right', 'bottom', 'left']) {
            const property = {
              border: `border-${side}`,
              color: `border-${side}-color`,
              dimension: `border-${side}-width`,
              strokeStyle: `border-${side}-style`,
            }[token.token.$type as string];
            if (property) {
              output.push({
                selectors: [makeSelector(token, 'border', `-${side}`)],
                declarations: { [property]: makeVarValue(token) },
              });
            }
          }
        }
        break;
      }
      case 'font': {
        for (const token of matchingTokens) {
          const selector = makeSelector(token, 'font');

          if (token.token.$type === 'typography' && token.type === 'MULTI_VALUE') {
            const declarations: Record<string, string> = {};
            for (const k of Object.keys(token.value)) {
              declarations[k] = makeCSSVar(`${token.localID ?? token.token.id}-${k}`, { wrapVar: true });
            }
            output.push({ selectors: [selector], declarations });
          } else {
            const property = {
              dimension: 'font-size',
              fontFamily: 'font-family',
              fontWeight: 'font-weight',
            }[token.token.$type as string];
            if (property) {
              output.push({
                selectors: [selector],
                declarations: { [property]: makeVarValue(token) },
              });
            }
          }
        }
        break;
      }
      case 'layout': {
        const filteredTokens = matchingTokens.filter((t) => t.token.$type === 'dimension'); // only dimension tokens here
        // gap
        // ALL generic properties (gap) must come before specific properties (column-gap)
        for (const token of filteredTokens) {
          output.push({ selectors: [makeSelector(token, 'gap')], declarations: { gap: makeVarValue(token) } });
        }
        // specific properties
        for (const token of filteredTokens) {
          output.push({
            selectors: [makeSelector(token, 'gap', '-col')],
            declarations: { 'column-gap': makeVarValue(token) },
          });
        }
        // specific properties
        for (const token of filteredTokens) {
          output.push({
            selectors: [makeSelector(token, 'gap', '-row')],
            declarations: { 'row-gap': makeVarValue(token) },
          });
        }

        // margin/padding
        for (const prefix of ['m', 'p'] as const) {
          const property = prefix === 'm' ? 'margin' : 'padding';
          // note: ALL generic properties (margin: [value]) MUST come before specific properties (margin-top: [value])
          // this is why we loop through all tokens so many times
          for (const token of filteredTokens) {
            output.push({
              selectors: [makeSelector(token, prefix, 'a')],
              declarations: { [property]: makeVarValue(token) },
            });
          }
          for (const token of filteredTokens) {
            const value = makeVarValue(token);
            output.push(
              {
                selectors: [makeSelector(token, prefix, 'x')],
                declarations: { [`${property}-left`]: value, [`${property}-right`]: value },
              },
              {
                selectors: [makeSelector(token, prefix, 'y')],
                declarations: { [`${property}-bottom`]: value, [`${property}-top`]: value },
              },
            );
          }
          for (const side of ['top', 'right', 'bottom', 'left']) {
            for (const token of filteredTokens) {
              output.push({
                selectors: [makeSelector(token, prefix, side[0])],
                declarations: { [`${property}-${side}`]: makeVarValue(token) },
              });
            }
          }
          for (const token of filteredTokens) {
            const value = makeVarValue(token);
            output.push(
              { selectors: [makeSelector(token, prefix, 's')], declarations: { [`${property}-inline-start`]: value } },
              { selectors: [makeSelector(token, prefix, 'e')], declarations: { [`${property}-inline-end`]: value } },
            );
          }
        }
        break;
      }
      case 'shadow': {
        for (const token of matchingTokens) {
          if (token.token.$type === 'shadow') {
            output.push({
              selectors: [makeSelector(token, 'shadow')],
              declarations: { 'box-shadow': makeVarValue(token) },
            });
          }
        }
        break;
      }
      case 'text': {
        for (const token of matchingTokens) {
          const selector = makeSelector(token, 'text');
          const value = makeVarValue(token);
          switch (token.token.$type) {
            case 'color': {
              output.push({ selectors: [selector], declarations: { color: value } });
              break;
            }
            case 'gradient': {
              output.push({
                selectors: [selector],
                declarations: {
                  background: `-webkit-linear-gradient(${value})`,
                  '-webkit-background-clip': 'text',
                  '-webkit-text-fill-color': 'transparent',
                },
              });
              break;
            }
          }
        }
        break;
      }
      default: {
        // biome-ignore lint/suspicious/noConsole: intentional user log
        console.warn(`[@terrazzo/plugin-css] unknown utility CSS group "${group}", ignoring`);
        break;
      }
    }
  }

  return output;
}

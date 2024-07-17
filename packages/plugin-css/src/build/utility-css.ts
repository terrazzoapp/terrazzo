import { isTokenMatch } from '@terrazzo/token-tools';
import { makeCSSVar } from '@terrazzo/token-tools/css';
import type { TokenTransformed } from '@terrazzo/parser';
import { kebabCase } from 'scule';
import type { CSSRule, UtilityCSSGroup } from '../lib.js';

// micro-optimization: precompile all RegExs (which can be known) because dynamic compilation is a waste of resources
const GROUP_REGEX: Record<UtilityCSSGroup, RegExp> = {
  bg: /(^bg-|-bg-)/,
  border: /(^border-|-border-)/,
  font: /(^font-|-font-)/,
  gap: /(^gap-|-gap-)/,
  margin: /(^m-|-m-)/,
  padding: /(^p-|-p-)/,
  shadow: /(^shadow-|-shadow-)/,
  text: /(^text-|-text-)/,
};

/** Make CSS class name from transformed token */
function makeSelector(group: UtilityCSSGroup, token: TokenTransformed, subgroup?: string): string {
  let prefix: string = group;
  // inconsistency: margin/padding are more abbreviated because of their commonality. handle that here.
  if (group === 'margin' || group === 'padding') {
    prefix = group[0]!;
    if (subgroup) {
      prefix += subgroup;
    }
  } else {
    if (subgroup) {
      prefix += `-${subgroup}`;
    }
  }
  return `.${prefix}-${kebabCase(token.token.id).replace(GROUP_REGEX[group], '')}`;
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
      console.warn(`[@terrazzo/plugin-css] utility group "${group}" matched 0 tokens: ${JSON.stringify(selectors)}`);
      break;
    }
    switch (group) {
      case 'bg': {
        for (const token of matchingTokens) {
          const selector = makeSelector('bg', token);
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
              break;
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
              selectors: [makeSelector('border', token)],
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
                selectors: [makeSelector('border', token, side)],
                declarations: { [property]: makeVarValue(token) },
              });
            }
          }
        }
        break;
      }
      case 'font': {
        for (const token of matchingTokens) {
          const selector = makeSelector('font', token);

          if (token.token.$type === 'typography' && token.type === 'MULTI_VALUE') {
            const declarations: Record<string, string> = {};
            for (const k in token.value) {
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
      case 'gap': {
        const filteredTokens = matchingTokens.filter((t) => t.token.$type === 'dimension'); // only dimension tokens here

        // ALL generic properties (gap) must come before specific properties (column-gap)
        for (const token of filteredTokens) {
          output.push({ selectors: [makeSelector('gap', token)], declarations: { gap: makeVarValue(token) } });
        }
        // specific properties
        for (const token of filteredTokens) {
          output.push({
            selectors: [makeSelector('gap', token, 'col')],
            declarations: { 'column-gap': makeVarValue(token) },
          });
        }
        // specific properties
        for (const token of filteredTokens) {
          output.push({
            selectors: [makeSelector('gap', token, 'row')],
            declarations: { 'row-gap': makeVarValue(token) },
          });
        }
        break;
      }
      case 'margin':
      case 'padding': {
        const filteredTokens = matchingTokens.filter((t) => t.token.$type === 'dimension'); // only dimension tokens here
        const property = group === 'margin' ? 'margin' : 'padding';

        // note: ALL generic properties (margin: [value]) MUST come before specific properties (margin-top: [value])
        // this is why we loop through all tokens so many times
        for (const token of filteredTokens) {
          output.push({
            selectors: [makeSelector(group, token, 'a')],
            declarations: { [property]: makeVarValue(token) },
          });
        }
        for (const token of filteredTokens) {
          const value = makeVarValue(token);
          output.push(
            {
              selectors: [makeSelector(group, token, 'x')],
              declarations: { [`${property}-left`]: value, [`${property}-right`]: value },
            },
            {
              selectors: [makeSelector(group, token, 'y')],
              declarations: { [`${property}-bottom`]: value, [`${property}-top`]: value },
            },
          );
        }
        for (const side of ['top', 'right', 'bottom', 'left']) {
          for (const token of filteredTokens) {
            output.push({
              selectors: [makeSelector(group, token, side[0])],
              declarations: { [`${property}-${side}`]: makeVarValue(token) },
            });
          }
        }
        for (const token of filteredTokens) {
          const value = makeVarValue(token);
          output.push(
            { selectors: [makeSelector(group, token, 's')], declarations: { [`${property}-inline-start`]: value } },
            { selectors: [makeSelector(group, token, 'e')], declarations: { [`${property}-inline-end`]: value } },
          );
        }
        break;
      }
      case 'shadow': {
        for (const token of matchingTokens) {
          if (token.token.$type === 'shadow') {
            output.push({
              selectors: [makeSelector('shadow', token)],
              declarations: { 'box-shadow': makeVarValue(token) },
            });
          }
        }
        break;
      }
      case 'text': {
        for (const token of matchingTokens) {
          const selector = makeSelector('text', token);
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
        console.warn(`[@terrazzo/plugin-css] unknown utility CSS group "${group}", ignoring`);
        break;
      }
    }
  }

  return output;
}

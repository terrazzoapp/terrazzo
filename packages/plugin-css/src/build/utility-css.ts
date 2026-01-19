import type { Logger, TokenTransformed } from '@terrazzo/parser';
import { kebabCase } from '@terrazzo/token-tools';
import { makeCSSVar } from '@terrazzo/token-tools/css';
import wcmatch from 'wildcard-match';
import { type CSSRule, declaration, PLUGIN_NAME, rule, type UtilityCSSGroup, type UtilityCSSPrefix } from '../lib.js';

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
function makePrelude(token: TokenTransformed, prefix: UtilityCSSPrefix, subgroup?: string): CSSRule['prelude'] {
  return [`.${prefix}${subgroup || ''}-${kebabCase(token.token.id).replace(GROUP_REGEX[prefix], '')}`];
}

function makeVarValue(token: TokenTransformed): string {
  return makeCSSVar(token.localID ?? token.token.id, { wrapVar: true });
}

export default function generateUtilityCSS(
  groups: Partial<Record<UtilityCSSGroup, string[]>>,
  tokens: TokenTransformed[],
  { logger }: { logger: Logger },
): CSSRule[] {
  const output: CSSRule[] = [];

  const groupEntries = Object.entries(groups);
  groupEntries.sort((a, b) => a[0].localeCompare(b[0]));

  for (const [group, selectors] of groupEntries) {
    const selectorMatcher = wcmatch(selectors);
    const matchingTokens = tokens.filter((token) => selectorMatcher(token.token.id));
    if (!matchingTokens.length) {
      logger.warn({
        group: 'plugin',
        label: PLUGIN_NAME,
        message: `utility group "${group}" matched 0 tokens: ${JSON.stringify(selectors)}`,
      });
      break;
    }
    switch (group) {
      case 'bg': {
        for (const token of matchingTokens) {
          const prelude = makePrelude(token, 'bg');
          switch (token.token.$type) {
            case 'color': {
              output.push(rule(prelude, [declaration('background-color', makeVarValue(token))]));
              break;
            }
            case 'gradient': {
              const value = declaration(
                'background-image',
                `linear-gradient(${makeCSSVar(token.localID ?? token.token.id, { wrapVar: true })})`,
              );
              output.push(rule(prelude, [value]));
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
            output.push(rule(makePrelude(token, 'border'), [declaration(property, makeVarValue(token))]));
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
              output.push(rule(makePrelude(token, 'border', `-${side}`), [declaration(property, makeVarValue(token))]));
            }
          }
        }
        break;
      }
      case 'font': {
        for (const token of matchingTokens) {
          const prelude = makePrelude(token, 'font');
          if (token.token.$type === 'typography' && token.type === 'MULTI_VALUE') {
            const value = Object.keys(token.value).map((property) =>
              declaration(property, makeCSSVar(`${token.localID ?? token.token.id}-${property}`, { wrapVar: true })),
            );
            output.push(rule(prelude, value));
          } else {
            const property = {
              dimension: 'font-size',
              fontFamily: 'font-family',
              fontWeight: 'font-weight',
            }[token.token.$type as string];
            if (property) {
              output.push(rule(prelude, [declaration(property, makeVarValue(token))]));
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
          output.push(rule(makePrelude(token, 'gap'), [declaration('gap', makeVarValue(token))]));
        }
        // specific properties
        for (const token of filteredTokens) {
          output.push(rule(makePrelude(token, 'gap', '-col'), [declaration('column-gap', makeVarValue(token))]));
        }
        // specific properties
        for (const token of filteredTokens) {
          output.push(rule(makePrelude(token, 'gap', '-row'), [declaration('row-gap', makeVarValue(token))]));
        }

        // margin/padding
        for (const prefix of ['m', 'p'] as const) {
          const property = prefix === 'm' ? 'margin' : 'padding';
          // note: ALL generic properties (margin: [value]) MUST come before specific properties (margin-top: [value])
          // this is why we loop through all tokens so many times
          for (const token of filteredTokens) {
            output.push(rule(makePrelude(token, prefix, 'a'), [declaration(property, makeVarValue(token))]));
          }
          for (const token of filteredTokens) {
            const value = makeVarValue(token);
            output.push(
              rule(makePrelude(token, prefix, 'x'), [
                declaration(`${property}-inline`, value),
                declaration(`${property}-left`, value),
                declaration(`${property}-right`, value),
              ]),
              rule(makePrelude(token, prefix, 'y'), [
                declaration(`${property}-block`, value),
                declaration(`${property}-bottom`, value),
                declaration(`${property}-top`, value),
              ]),
            );
          }
          for (const side of ['top', 'right', 'bottom', 'left']) {
            for (const token of filteredTokens) {
              output.push(
                rule(makePrelude(token, prefix, side[0]), [declaration(`${property}-${side}`, makeVarValue(token))]),
              );
            }
          }
          for (const token of filteredTokens) {
            const value = makeVarValue(token);
            output.push(
              rule(makePrelude(token, prefix, 'bs'), [declaration(`${property}-block-start`, value)]),
              rule(makePrelude(token, prefix, 'be'), [declaration(`${property}-block-end`, value)]),
              rule(makePrelude(token, prefix, 'is'), [declaration(`${property}-inline-start`, value)]),
              rule(makePrelude(token, prefix, 'ie'), [declaration(`${property}-inline-end`, value)]),
            );
          }
        }
        break;
      }
      case 'shadow': {
        for (const token of matchingTokens) {
          if (token.token.$type === 'shadow') {
            output.push(rule(makePrelude(token, 'shadow'), [declaration('box-shadow', makeVarValue(token))]));
          }
        }
        break;
      }
      case 'text': {
        for (const token of matchingTokens) {
          const prelude = makePrelude(token, 'text');
          const value = makeVarValue(token);
          switch (token.token.$type) {
            case 'color': {
              output.push(rule(prelude, [declaration('color', value)]));
              break;
            }
            case 'gradient': {
              output.push(
                rule(prelude, [
                  declaration('background', `-webkit-linear-gradient(${value})`),
                  declaration('-webkit-background-clip', 'text'),
                  declaration('-webkit-text-fill-color', 'transparent'),
                ]),
              );
              break;
            }
          }
        }
        break;
      }
      default: {
        logger.warn({ group: 'plugin', label: PLUGIN_NAME, message: `unknown utility CSS group "${group}", ignoring` });
        break;
      }
    }
  }

  return output;
}

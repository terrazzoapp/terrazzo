import type { Logger, TokenTransformed } from '@terrazzo/parser';
import { kebabCase } from '@terrazzo/token-tools';
import { makeCSSVar } from '@terrazzo/token-tools/css';
import wcmatch from 'wildcard-match';
import { type CSSRule, decl, PLUGIN_NAME, rule, type UtilityCSSGroup, type UtilityCSSPrefix } from './lib.js';

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
  const root: CSSRule[] = [];
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
              root.push(rule(prelude, [decl('background-color', makeVarValue(token))]));
              break;
            }
            case 'gradient': {
              const value = decl(
                'background-image',
                `linear-gradient(${makeCSSVar(token.localID ?? token.token.id, { wrapVar: true })})`,
              );
              root.push(rule(prelude, [value]));
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
            root.push(rule(makePrelude(token, 'border'), [decl(property, makeVarValue(token))]));
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
              root.push(rule(makePrelude(token, 'border', `-${side}`), [decl(property, makeVarValue(token))]));
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
              decl(property, makeCSSVar(`${token.localID ?? token.token.id}-${property}`, { wrapVar: true })),
            );
            root.push(rule(prelude, value));
          } else {
            const property = {
              dimension: 'font-size',
              fontFamily: 'font-family',
              fontWeight: 'font-weight',
            }[token.token.$type as string];
            if (property) {
              root.push(rule(prelude, [decl(property, makeVarValue(token))]));
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
          root.push(rule(makePrelude(token, 'gap'), [decl('gap', makeVarValue(token))]));
        }
        // specific properties
        for (const token of filteredTokens) {
          root.push(rule(makePrelude(token, 'gap', '-col'), [decl('column-gap', makeVarValue(token))]));
        }
        // specific properties
        for (const token of filteredTokens) {
          root.push(rule(makePrelude(token, 'gap', '-row'), [decl('row-gap', makeVarValue(token))]));
        }

        // margin/padding
        for (const prefix of ['m', 'p'] as const) {
          const property = prefix === 'm' ? 'margin' : 'padding';
          // note: ALL generic properties (margin: [value]) MUST come before specific properties (margin-top: [value])
          // this is why we loop through all tokens so many times
          for (const token of filteredTokens) {
            root.push(rule(makePrelude(token, prefix, 'a'), [decl(property, makeVarValue(token))]));
          }
          for (const token of filteredTokens) {
            const value = makeVarValue(token);
            root.push(
              rule(makePrelude(token, prefix, 'x'), [
                decl(`${property}-inline`, value),
                decl(`${property}-left`, value),
                decl(`${property}-right`, value),
              ]),
              rule(makePrelude(token, prefix, 'y'), [
                decl(`${property}-block`, value),
                decl(`${property}-bottom`, value),
                decl(`${property}-top`, value),
              ]),
            );
          }
          for (const side of ['top', 'right', 'bottom', 'left']) {
            for (const token of filteredTokens) {
              root.push(rule(makePrelude(token, prefix, side[0]), [decl(`${property}-${side}`, makeVarValue(token))]));
            }
          }
          for (const token of filteredTokens) {
            const value = makeVarValue(token);
            root.push(
              rule(makePrelude(token, prefix, 'bs'), [decl(`${property}-block-start`, value)]),
              rule(makePrelude(token, prefix, 'be'), [decl(`${property}-block-end`, value)]),
              rule(makePrelude(token, prefix, 'is'), [decl(`${property}-inline-start`, value)]),
              rule(makePrelude(token, prefix, 'ie'), [decl(`${property}-inline-end`, value)]),
            );
          }
        }
        break;
      }
      case 'shadow': {
        for (const token of matchingTokens) {
          if (token.token.$type === 'shadow') {
            root.push(rule(makePrelude(token, 'shadow'), [decl('box-shadow', makeVarValue(token))]));
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
              root.push(rule(prelude, [decl('color', value)]));
              break;
            }
            case 'gradient': {
              root.push(
                rule(prelude, [
                  decl('background', `-webkit-linear-gradient(${value})`),
                  decl('-webkit-background-clip', 'text'),
                  decl('-webkit-text-fill-color', 'transparent'),
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

  return root;
}

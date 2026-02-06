import type { BuildHookOptions, Logger } from '@terrazzo/parser';
import { generateShorthand, makeCSSVar } from '@terrazzo/token-tools/css';
import wcmatch from 'wildcard-match';
import {
  addDeclUnique,
  type CSSDeclaration,
  type CSSPluginOptions,
  type CSSRule,
  decl,
  FORMAT_ID,
  getIndentFromPrepare,
  PLUGIN_NAME,
  printRules,
  rule,
} from './lib.js';
import generateUtilityCSS from './utility-css.js';

const P3_MQ = '@media (color-gamut: p3)';
const REC2020_MQ = '@media (color-gamut: rec2020)';

export interface BuildFormatOptions {
  logger: Logger;
  include: CSSPluginOptions['include'];
  exclude: CSSPluginOptions['exclude'];
  getTransforms: BuildHookOptions['getTransforms'];
  modeSelectors: CSSPluginOptions['modeSelectors'];
  permutations: CSSPluginOptions['permutations'];
  utility: CSSPluginOptions['utility'];
  baseSelector: string;
  baseScheme: CSSPluginOptions['baseScheme'];
}

export default function buildCSS({
  logger,
  getTransforms,
  include: userInclude,
  exclude: userExclude,
  utility,
  permutations,
  modeSelectors,
  baseSelector,
  baseScheme,
}: BuildFormatOptions): string {
  const include = userInclude ? wcmatch(userInclude) : () => true;
  const exclude = userExclude ? wcmatch(userExclude) : () => false;
  if (permutations?.length) {
    let output = '';

    for (const p of permutations) {
      if (typeof p.prepare !== 'function') {
        logger.error({ group: 'plugin', label: PLUGIN_NAME, message: 'prepare(css) must be a function!' });
      }

      const tokens = getTransforms({ format: FORMAT_ID, input: p.input });
      if (!tokens.length) {
        continue;
      }

      const root: (CSSRule | CSSDeclaration)[] = [];
      const hdrColors = {
        p3: [] as CSSDeclaration[],
        rec2020: [] as CSSDeclaration[],
      };

      const pInclude = p.include ? wcmatch(p.include) : () => true;
      const pExclude = p.exclude ? wcmatch(p.exclude) : () => false;

      const includeToken = (tokenId: string): boolean => {
        return include(tokenId) && pInclude(tokenId) && !exclude(tokenId) && !pExclude(tokenId);
      };

      for (const token of tokens) {
        if (!includeToken(token.id)) {
          continue;
        }
        const localID = makeCSSVar(token.localID ?? token.token.id);
        const aliasTokens = token.token.aliasedBy?.length
          ? getTransforms({ format: FORMAT_ID, id: token.token.aliasedBy, input: p.input })
          : [];

        // single-value token
        if (token.type === 'SINGLE_VALUE') {
          addDeclUnique(root, decl(localID, token.value, token.token.$description));
        }

        // multi-value token (wide gamut color)
        else if (token.value.srgb && token.value.p3 && token.value.rec2020) {
          addDeclUnique(root, decl(localID, token.value.srgb!, token.token.$description));

          if (token.value.p3 !== token.value.srgb) {
            addDeclUnique(hdrColors.p3, decl(localID, token.value.p3!, token.token.$description));
            addDeclUnique(hdrColors.rec2020, decl(localID, token.value.rec2020!, token.token.$description));

            // handle aliases within color gamut media queries
            for (const alias of aliasTokens) {
              if (alias.localID && typeof alias.value === 'string') {
                const aliasID = makeCSSVar(alias.localID);
                addDeclUnique(hdrColors.p3, decl(aliasID, alias.value, alias.token.$description));
                addDeclUnique(hdrColors.rec2020, decl(aliasID, alias.value, alias.token.$description));
              }
            }
          }
        }

        // multi-value token
        else {
          for (const [name, subValue] of Object.entries(token.value)) {
            const subValueID = `${localID}-${name}`;
            addDeclUnique(root, decl(subValueID, subValue, token.token.$description));
          }
          // Note: always generate shorthand AFTER other declarations
          const shorthand = generateShorthand({ token: { ...token.token, $value: token.value as any }, localID });
          if (shorthand) {
            addDeclUnique(root, decl(localID, shorthand, token.token.$description));
          }
        }

        // redeclare aliases so they have the correct scope
        for (const alias of aliasTokens) {
          if (alias.localID && typeof alias.value === 'string') {
            if (!includeToken(alias.id)) {
              continue;
            }
            addDeclUnique(root, decl(alias.localID, alias.value, token.token.$description));
          }
        }
      }

      const indentRules = getIndentFromPrepare(p.prepare);
      if (output) {
        output += '\n';
      }
      output += `${p.prepare(printRules(root, indentRules))}\n`;

      // declare P3 and Rec2020 gamuts, if needed
      for (const gamut of ['p3', 'rec2020'] as const) {
        if (hdrColors[gamut].length) {
          output += `\n@media (color-gamut: ${gamut}) {\n`;
          output += indentRules.indentChar;
          output += p
            .prepare(printRules(hdrColors[gamut], indentRules))
            .replace(/\n(?!\n)/g, `\n${indentRules.indentChar}`); // indent every line an extra level
          output += '\n}\n';
        }
      }
    }

    // add utility CSS
    if (utility && Object.keys(utility).length) {
      if (output) {
        output += '\n\n';
      }
      output += generateUtilityCSS(utility, getTransforms({ format: FORMAT_ID }), { logger });
    }

    return output;
  }

  // legacy plugin (will be deprecated in 3.0)
  let output = '';
  const rootTokens = getTransforms({ format: FORMAT_ID, mode: '.' });
  if (rootTokens.length) {
    const rules: CSSRule[] = [
      rule([baseSelector], []),
      rule([P3_MQ], [rule([baseSelector])]),
      rule([REC2020_MQ], [rule([baseSelector])]),
    ];

    const rootRule = rules[0]!;
    const p3Rule = rules[1]!.children[0] as CSSRule;
    const rec2020Rule = rules[2]!.children[0] as CSSRule;

    // add base color-scheme declaration first if configured
    // (must be before other properties to ensure it appears first in output)
    if (baseScheme) {
      rootRule.children.unshift(decl('color-scheme', baseScheme));
    }

    for (const token of rootTokens) {
      // handle exclude (if any)
      if (!include(token.token.id) || exclude(token.token.id)) {
        continue;
      }

      const localID = token.localID ?? token.token.id;
      const aliasTokens = token.token.aliasedBy?.length
        ? getTransforms({ format: FORMAT_ID, id: token.token.aliasedBy, mode: '.' })
        : [];

      // single-value token
      if (token.type === 'SINGLE_VALUE') {
        addDeclUnique(rootRule.children, decl(localID, token.value, token.token.$description));
      }

      // multi-value token (wide gamut color)
      else if (token.value.srgb && token.value.p3 && token.value.rec2020) {
        addDeclUnique(rootRule.children, decl(localID, token.value.srgb!, token.token.$description));

        if (token.value.p3 !== token.value.srgb) {
          addDeclUnique(p3Rule.children, decl(localID, token.value.p3!, token.token.$description));
          addDeclUnique(rec2020Rule.children, decl(localID, token.value.rec2020!, token.token.$description));
          // handle aliases within color gamut media queries
          for (const alias of aliasTokens) {
            if (alias.localID && typeof alias.value === 'string') {
              addDeclUnique(p3Rule.children, decl(alias.localID, alias.value, token.token.$description));
              addDeclUnique(rec2020Rule.children, decl(alias.localID, alias.value, token.token.$description));
            }
          }
        }
      }

      // multi-value token
      else if (token.type === 'MULTI_VALUE') {
        for (const [name, value] of Object.entries(token.value)) {
          const property = name === '.' ? localID : [localID, name].join('-');
          addDeclUnique(rootRule.children, decl(property, value, token.token.$description));
        }
        // Note: always place shorthand after other values
        const shorthand = generateShorthand({ token: { ...token.token, $value: token.value as any }, localID });
        if (shorthand) {
          addDeclUnique(rootRule.children, decl(token.localID ?? token.token.id, shorthand, token.token.$description));
        }
      }
    }

    output += printRules(rules);
  }

  // legacy modeSelectors
  // Delete this behavior in 3.0.
  // This code is intentionally left-alone as a separate code path so it behaves as it did with 0.x.
  for (const selector of modeSelectors ?? []) {
    const selectorTokens = getTransforms({ format: FORMAT_ID, id: selector.tokens, mode: selector.mode });
    if (!selectorTokens.length) {
      continue;
    }

    const modeRule: CSSRule = rule(selector.selectors);

    // add color-scheme declaration first if configured for this mode
    // (must be before other properties to ensure it appears first in output)
    if (selector.scheme) {
      modeRule.children.unshift(decl('color-scheme', selector.scheme));
    }
    const hdrColors = {
      p3: [] as CSSDeclaration[],
      rec2020: [] as CSSDeclaration[],
    };
    for (const token of selectorTokens) {
      const localID = token.localID ?? token.token.id;
      const aliasTokens = token.token.aliasedBy?.length
        ? getTransforms({ format: FORMAT_ID, id: token.token.aliasedBy })
        : [];

      // single-value token
      if (token.type === 'SINGLE_VALUE') {
        addDeclUnique(modeRule.children, decl(localID, token.value, token.token.$description));
      }

      // multi-value token (wide gamut color)
      else if (token.value.srgb && token.value.p3 && token.value.rec2020) {
        addDeclUnique(modeRule.children, decl(localID, token.value.srgb!, token.token.$description));
        if (token.value.p3 !== token.value.srgb) {
          addDeclUnique(hdrColors.p3, decl(localID, token.value.p3!, token.token.$description));
          addDeclUnique(hdrColors.rec2020, decl(localID, token.value.rec2020!, token.token.$description));

          // handle aliases within color gamut media queries
          for (const alias of aliasTokens) {
            if (alias.localID && typeof alias.value === 'string') {
              for (const gamut of ['p3', 'rec2020'] as const) {
                addDeclUnique(hdrColors[gamut], decl(alias.localID, alias.value, token.token.$description));
              }
            }
          }
        }
      }

      // multi-value token
      else {
        for (const [name, subValue] of Object.entries(token.value)) {
          addDeclUnique(modeRule.children, decl(`${localID}-${name}`, subValue, token.token.$description));
        }
        // Note: always generate shorthand after other declarations
        const shorthand = generateShorthand({ token: { ...token.token, $value: token.value as any }, localID });
        if (shorthand) {
          addDeclUnique(modeRule.children, decl(localID, shorthand, token.token.$description));
        }
      }

      // redeclare aliases so they have the correct scope
      for (const alias of aliasTokens) {
        if (alias.localID && typeof alias.value === 'string') {
          addDeclUnique(modeRule.children, decl(alias.localID, alias.value, token.token.$description));
        }
      }
    }

    if (output) {
      output += '\n\n';
    }
    output += printRules([
      modeRule,
      rule([P3_MQ], [rule(selector.selectors, hdrColors.p3)]),
      rule([REC2020_MQ], [rule(selector.selectors, hdrColors.rec2020)]),
    ]);
  }

  // add utility CSS
  if (utility && Object.keys(utility).length) {
    if (output) {
      output += '\n\n';
    }
    output += printRules(generateUtilityCSS(utility, getTransforms({ format: FORMAT_ID, mode: '.' }), { logger }));
  }

  return output;
}

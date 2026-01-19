import type { BuildHookOptions, Logger } from '@terrazzo/parser';
import { generateShorthand, makeCSSVar } from '@terrazzo/token-tools/css';
import wcmatch from 'wildcard-match';
import {
  type CSSDeclaration,
  type CSSPluginOptions,
  type CSSRule,
  declaration,
  FORMAT_ID,
  getIndentFromPrepare,
  hasDeclarationProperty,
  PLUGIN_NAME,
  printRules,
  rule,
} from '../lib.js';
import generateUtilityCSS from './utility-css.js';

const P3_MQ = '@media (color-gamut: p3)';
const REC2020_MQ = '@media (color-gamut: rec2020)';

export interface BuildFormatOptions {
  logger: Logger;
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
  exclude,
  utility,
  permutations,
  modeSelectors,
  baseSelector,
  baseScheme,
}: BuildFormatOptions): string {
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

      for (const token of tokens) {
        const localID = makeCSSVar(token.localID ?? token.token.id);
        const aliasTokens = token.token.aliasedBy?.length
          ? getTransforms({ format: FORMAT_ID, id: token.token.aliasedBy, input: p.input })
          : [];

        // single-value token
        if (token.type === 'SINGLE_VALUE') {
          if (!hasDeclarationProperty(root, localID)) {
            root.push(declaration(localID, token.value, token.token.$description));
          }
        }

        // multi-value token (wide gamut color)
        else if (token.value.srgb && token.value.p3 && token.value.rec2020) {
          if (!hasDeclarationProperty(root, localID)) {
            root.push(declaration(localID, token.value.srgb!, token.token.$description));
          }

          if (token.value.p3 !== token.value.srgb) {
            hdrColors.p3.push(declaration(localID, token.value.p3!, token.token.$description));
            hdrColors.rec2020.push(declaration(localID, token.value.rec2020!, token.token.$description));

            // handle aliases within color gamut media queries
            for (const alias of aliasTokens) {
              if (alias.localID && typeof alias.value === 'string') {
                const aliasID = makeCSSVar(alias.localID);
                if (!hasDeclarationProperty(hdrColors.p3, aliasID)) {
                  hdrColors.p3.push(declaration(aliasID, alias.value, alias.token.$description));
                }
                if (!hasDeclarationProperty(hdrColors.rec2020, aliasID)) {
                  hdrColors.rec2020.push(declaration(aliasID, alias.value, alias.token.$description));
                }
              }
            }
          }
        }

        // multi-value token
        else {
          for (const [name, subValue] of Object.entries(token.value)) {
            const subValueID = `${localID}-${name}`;
            root.push(declaration(subValueID, subValue, token.token.$description));
          }
          // Note: always generate shorthand AFTER other declarations
          const shorthand = generateShorthand({ token: { ...token.token, $value: token.value as any }, localID });
          if (shorthand && hasDeclarationProperty(root, localID)) {
            root.push(declaration(localID, shorthand, token.token.$description));
          }
        }

        // redeclare aliases so they have the correct scope
        for (const alias of aliasTokens) {
          if (alias.localID && typeof alias.value === 'string' && !hasDeclarationProperty(root, alias.localID)) {
            root.push(declaration(alias.localID, alias.value, token.token.$description));
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
      rootRule.children.unshift(declaration('color-scheme', baseScheme));
    }

    const shouldExclude = wcmatch(exclude ?? []);

    for (const token of rootTokens) {
      // handle exclude (if any)
      if (shouldExclude(token.token.id)) {
        continue;
      }

      const localID = token.localID ?? token.token.id;
      const aliasTokens = token.token.aliasedBy?.length
        ? getTransforms({ format: FORMAT_ID, id: token.token.aliasedBy })
        : [];

      // single-value token
      if (token.type === 'SINGLE_VALUE') {
        rootRule.children.push(declaration(localID, token.value, token.token.$description));
      }

      // multi-value token (wide gamut color)
      else if (token.value.srgb && token.value.p3 && token.value.rec2020) {
        rootRule.children.push(declaration(localID, token.value.srgb!, token.token.$description));

        if (token.value.p3 !== token.value.srgb) {
          p3Rule.children.push(declaration(localID, token.value.p3!, token.token.$description));
          rec2020Rule.children.push(declaration(localID, token.value.rec2020!, token.token.$description));
          // handle aliases within color gamut media queries
          for (const alias of aliasTokens) {
            if (alias.localID && typeof alias.value === 'string') {
              if (!hasDeclarationProperty(p3Rule.children, alias.localID)) {
                p3Rule.children.push(declaration(alias.localID, alias.value, token.token.$description));
              }
              if (!hasDeclarationProperty(rec2020Rule.children, alias.localID)) {
                rec2020Rule.children.push(declaration(alias.localID, alias.value, token.token.$description));
              }
            }
          }
        }
      }

      // multi-value token
      else if (token.type === 'MULTI_VALUE') {
        for (const [name, value] of Object.entries(token.value)) {
          const property = name === '.' ? localID : [localID, name].join('-');
          rootRule.children.push(declaration(property, value, token.token.$description));
        }
        // Note: always place shorthand after other values
        const shorthand = generateShorthand({ token: { ...token.token, $value: token.value as any }, localID });
        if (shorthand && !hasDeclarationProperty(rootRule.children, token.localID!)) {
          rootRule.children.push(declaration(token.localID ?? token.token.id, shorthand, token.token.$description));
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
      modeRule.children.unshift(declaration('color-scheme', selector.scheme));
    }
    const hdrColors = {
      p3: [] as CSSDeclaration[],
      rec2020: [] as CSSDeclaration[],
    };
    for (const token of selectorTokens) {
      const localID = token.localID ?? token.token.id;
      const aliasTokens = token.token.aliasedBy?.length
        ? getTransforms({ format: FORMAT_ID, id: token.token.aliasedBy, mode: selector.mode || '.' })
        : [];

      // single-value token
      if (token.type === 'SINGLE_VALUE') {
        modeRule.children.push(declaration(localID, token.value, token.token.$description));
      }

      // multi-value token (wide gamut color)
      else if (token.value.srgb && token.value.p3 && token.value.rec2020) {
        modeRule.children.push(declaration(localID, token.value.srgb!, token.token.$description));
        if (token.value.p3 !== token.value.srgb) {
          hdrColors.p3.push(declaration(localID, token.value.p3!, token.token.$description));
          hdrColors.rec2020.push(declaration(localID, token.value.rec2020!, token.token.$description));

          // handle aliases within color gamut media queries
          for (const alias of aliasTokens) {
            if (alias.localID && typeof alias.value === 'string') {
              for (const gamut of ['p3', 'rec2020'] as const) {
                if (!hasDeclarationProperty(hdrColors[gamut], alias.localID)) {
                  hdrColors[gamut].push(declaration(alias.localID, alias.value, token.token.$description));
                }
              }
            }
          }
        }
      }

      // multi-value token
      else {
        for (const [name, subValue] of Object.entries(token.value)) {
          modeRule.children.push(declaration(`${localID}-${name}`, subValue, token.token.$description));
        }
        // Note: always generate shorthand after other declarations
        const shorthand = generateShorthand({ token: { ...token.token, $value: token.value as any }, localID });
        if (shorthand) {
          modeRule.children.push(declaration(localID, shorthand, token.token.$description));
        }
      }

      // redeclare aliases so they have the correct scope
      for (const alias of aliasTokens) {
        if (
          alias.localID &&
          typeof alias.value === 'string' &&
          !hasDeclarationProperty(modeRule.children, alias.localID)
        ) {
          modeRule.children.push(declaration(alias.localID, alias.value, token.token.$description));
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
    output += printRules(generateUtilityCSS(utility, getTransforms({ format: FORMAT_ID, mode: '.' }), { logger }));
  }

  return output;
}

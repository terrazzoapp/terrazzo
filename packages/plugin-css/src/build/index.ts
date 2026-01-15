import type { BuildHookOptions, Logger } from '@terrazzo/parser';
import { generateShorthand, makeCSSVar } from '@terrazzo/token-tools/css';
import wcmatch from 'wildcard-match';
import { type CSSPluginOptions, type CSSRule, prettify, FORMAT_ID, printDeclaration, printRules } from '../lib.js';
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
      let buffer = '';
      if (typeof p.prepare !== 'function') {
        logger.error({ group: 'plugin', label: '@terrazzo/plugin-css', message: 'prepare(css) must be a function!' });
      }

      const tokens = getTransforms({ format: FORMAT_ID, input: p.input });
      if (!tokens.length) {
        continue;
      }

      const declarations = new Set<string>();
      const hoistedAliases: [string, string][] = [];
      const hdrColors = {
        p3: [] as [string, string][],
        rec2020: [] as [string, string][],
      };

      for (const token of tokens) {
        const localID = makeCSSVar(token.localID ?? token.token.id);
        const aliasTokens = token.token.aliasedBy?.length
          ? getTransforms({ format: FORMAT_ID, id: token.token.aliasedBy, input: p.input })
          : [];

        buffer += '\n'; // we’ll trim any extra space at the end

        // single-value token
        if (token.type === 'SINGLE_VALUE') {
          declarations.add(localID);
          buffer += printDeclaration(localID, token.value, { comment: token.token.$description });
        }

        // multi-value token (wide gamut color)
        else if (token.value.srgb && token.value.p3 && token.value.rec2020) {
          buffer += printDeclaration(localID, token.value.srgb!, { comment: token.token.$description });

          if (token.value.p3 !== token.value.srgb) {
            hdrColors.p3.push([
              localID,
              printDeclaration(localID, token.value.p3!, { comment: token.token.$description }),
            ]);
            hdrColors.rec2020.push([
              localID,
              printDeclaration(localID, token.value.rec2020!, { comment: token.token.$description }),
            ]);

            // handle aliases within color gamut media queries
            for (const alias of aliasTokens) {
              if (alias.localID && typeof alias.value === 'string') {
                const aliasID = makeCSSVar(alias.localID);
                if (!hdrColors.p3.some(([id]) => id === aliasID)) {
                  hdrColors.p3.push([
                    aliasID,
                    printDeclaration(aliasID, alias.value, { comment: alias.token.$description }),
                  ]);
                }
                if (!hdrColors.rec2020.some(([id]) => id === aliasID)) {
                  hdrColors.rec2020.push([
                    aliasID,
                    printDeclaration(aliasID, alias.value, { comment: alias.token.$description }),
                  ]);
                }
              }
            }
          }
        }

        // multi-value token
        else {
          for (const [name, subvalue] of Object.entries(token.value)) {
            const subValueID = `${localID}-${name}`;
            buffer += printDeclaration(subValueID, subvalue, { comment: token.token.$description });
          }
          // Note: always generate shorthand AFTER other declarations
          const shorthand = generateShorthand({ token: { ...token.token, $value: token.value as any }, localID });
          if (shorthand) {
            buffer += printDeclaration(localID, shorthand, { comment: token.token.$description });
          }
        }

        // redeclare aliases so they have the correct scope
        for (const alias of aliasTokens) {
          if (alias.localID && typeof alias.value === 'string') {
            hoistedAliases.push([
              makeCSSVar(alias.localID),
              printDeclaration(makeCSSVar(alias.localID), alias.value, { comment: token.token.$description }),
            ]);
          }
        }
      }

      // print and clear buffer
      output += p.prepare(buffer);
      buffer = '';

      // declare P3 and Rec2020 gamuts, if needed
      for (const gamut of ['p3', 'rec2020'] as const) {
        if (hdrColors[gamut].length) {
          output += `\n\n${gamut === 'p3' ? P3_MQ : REC2020_MQ} {\n`;
          for (const [_id, css] of hdrColors[gamut]) {
            buffer += `\n${css}`;
          }
          output += p.prepare(buffer);
          buffer = '';
          output += `\n}`;
        }
      }

      // after selector has settled, add in aliases, only if it hasn’t been declared already
      for (const [id, css] of hoistedAliases) {
        if (!declarations.has(id)) {
          buffer += '\n';
          buffer += css;
        }
      }
      output += p.prepare(buffer);
    }

    // add utility CSS
    if (utility && Object.keys(utility).length) {
      output += printRules(generateUtilityCSS(utility, getTransforms({ format: FORMAT_ID, mode: '.' })));
    }

    return `${prettify(output)}\n`;
  }

  const rules: CSSRule[] = [];

  // legacy plugin (will be deprecated in 3.0)
  const rootTokens = getTransforms({ format: FORMAT_ID, mode: '.' });
  if (rootTokens.length) {
    const rootRule: CSSRule = { selectors: [baseSelector], declarations: {} };

    // add base color-scheme declaration first if configured
    // (must be before other properties to ensure it appears first in output)
    if (baseScheme) {
      rootRule.declarations['color-scheme'] = { value: baseScheme };
    }

    // note: `nestedQuery` was designed specifically for higher-gamut colors to
    // apply color-gamut media queries to existing selectors (i.e. keep the same
    // targets, and apply another nested layer of media query filtering based on
    // hardware). Because of how CSS works they need to get built out into their
    // own selectors that have different structures depending on whether
    // `selectors` has a media query or not.
    const p3Rule: CSSRule = { selectors: [baseSelector], nestedQuery: P3_MQ, declarations: {} };
    const rec2020Rule: CSSRule = { selectors: [baseSelector], nestedQuery: REC2020_MQ, declarations: {} };
    rules.push(rootRule, p3Rule, rec2020Rule);

    const shouldExclude = wcmatch(exclude ?? []);

    for (const token of rootTokens) {
      // handle exclude (if any)
      if (shouldExclude(token.token.id)) {
        continue;
      }

      const localID = token.localID ?? token.token.id;

      // `aliasTokens` are an important concept unique to CSS: if the root value
      // changes in a scope, all downstream aliases MUST be redeclared,
      // otherwise the values are stale.  here, `aliasedBy` is a reverse lookup
      // that lets us redeclare all CSS values again that are minimally-needed.
      const aliasTokens = token.token.aliasedBy?.length
        ? getTransforms({ format: FORMAT_ID, id: token.token.aliasedBy })
        : [];

      // single-value token
      if (token.type === 'SINGLE_VALUE') {
        rootRule.declarations[localID] = { value: token.value, description: token.token.$description };
      }

      // multi-value token (wide gamut color)
      else if (token.value.srgb && token.value.p3 && token.value.rec2020) {
        rootRule.declarations[localID] = { value: token.value.srgb!, description: token.token.$description };
        if (token.value.p3 !== token.value.srgb) {
          p3Rule.declarations[localID] = { value: token.value.p3!, description: token.token.$description };
          rec2020Rule.declarations[localID] = { value: token.value.rec2020!, description: token.token.$description };

          // handle aliases within color gamut media queries
          for (const alias of aliasTokens) {
            if (alias.localID && typeof alias.value === 'string') {
              p3Rule.declarations[alias.localID] ??= { value: alias.value, description: token.token.$description };
              rec2020Rule.declarations[alias.localID] ??= { value: alias.value, description: token.token.$description };
            }
          }
        }
      }

      // multi-value token
      else if (token.type === 'MULTI_VALUE') {
        for (const [name, value] of Object.entries(token.value)) {
          rootRule.declarations[name === '.' ? localID : [localID, name].join('-')] = {
            value,
            description: token.token.$description,
          };
        }
        // Note: always place shorthand after other values
        const shorthand = generateShorthand({ token: { ...token.token, $value: token.value as any }, localID });
        if (shorthand) {
          rootRule.declarations[token.localID ?? token.token.id] = {
            value: shorthand,
            description: token.token.$description,
          };
        }
      }
    }
  }

  // legacy modeSelectors
  for (const selector of modeSelectors ?? []) {
    const selectorTokens = getTransforms({ format: FORMAT_ID, id: selector.tokens, mode: selector.mode });
    if (!selectorTokens.length) {
      continue;
    }

    const selectorRule: CSSRule = { selectors: selector.selectors, declarations: {} };

    // add color-scheme declaration first if configured for this mode
    // (must be before other properties to ensure it appears first in output)
    if (selector.scheme) {
      selectorRule.declarations['color-scheme'] = { value: selector.scheme };
    }

    const selectorP3Rule: CSSRule = { selectors: selector.selectors, nestedQuery: P3_MQ, declarations: {} };
    const selectorRec2020Rule: CSSRule = { selectors: selector.selectors, nestedQuery: REC2020_MQ, declarations: {} };
    const selectorAliasDeclarations: CSSRule['declarations'] = {};
    rules.push(selectorRule, selectorP3Rule, selectorRec2020Rule);

    for (const token of selectorTokens) {
      const localID = token.localID ?? token.token.id;

      const aliasTokens = token.token.aliasedBy?.length
        ? getTransforms({
            format: FORMAT_ID,
            id: token.token.aliasedBy,
            mode: selector.mode || '.',
          })
        : [];

      // single-value token
      if (token.type === 'SINGLE_VALUE') {
        selectorRule.declarations[localID] = { value: token.value, description: token.token.$description };
      }

      // multi-value token (wide gamut color)
      else if (token.value.srgb && token.value.p3 && token.value.rec2020) {
        selectorRule.declarations[localID] = { value: token.value.srgb!, description: token.token.$description };
        if (token.value.p3 !== token.value.srgb) {
          selectorP3Rule.declarations[localID] = { value: token.value.p3!, description: token.token.$description };
          selectorRec2020Rule.declarations[localID] = {
            value: token.value.rec2020!,
            description: token.token.$description,
          };

          // handle aliases within color gamut media queries
          for (const alias of aliasTokens) {
            if (alias.localID && typeof alias.value === 'string') {
              selectorP3Rule.declarations[alias.localID] ??= {
                value: alias.value,
                description: token.token.$description,
              };
              selectorRec2020Rule.declarations[alias.localID] ??= {
                value: alias.value,
                description: token.token.$description,
              };
            }
          }
        }
      }

      // multi-value token
      else {
        for (const [name, subvalue] of Object.entries(token.value)) {
          selectorRule.declarations[`${localID}-${name}`] = { value: subvalue, description: token.token.$description };
        }
        // Note: always generate shorthand after other declarations
        const shorthand = generateShorthand({ token: { ...token.token, $value: token.value as any }, localID });
        if (shorthand) {
          selectorRule.declarations[localID] = { value: shorthand, description: token.token.$description };
        }
      }

      // redeclare aliases so they have the correct scope
      for (const alias of aliasTokens) {
        if (alias.localID && typeof alias.value === 'string') {
          selectorAliasDeclarations[alias.localID] = { value: alias.value, description: token.token.$description };
        }
      }
    }

    // after selector has settled, add in aliases if there are no conflicts
    for (const [name, { value, description }] of Object.entries(selectorAliasDeclarations)) {
      selectorRule.declarations[name] ??= { value, description };
    }
  }

  // add utility CSS
  if (utility && Object.keys(utility).length) {
    rules.push(...generateUtilityCSS(utility, getTransforms({ format: FORMAT_ID, mode: '.' })));
  }

  return printRules(rules);
}

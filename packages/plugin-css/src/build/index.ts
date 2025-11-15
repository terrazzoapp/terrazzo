import type { BuildHookOptions } from '@terrazzo/parser';
import { generateShorthand } from '@terrazzo/token-tools/css';
import wcmatch from 'wildcard-match';
import { type CSSPluginOptions, type CSSRule, FORMAT_ID, printRules } from '../lib.js';
import generateUtilityCSS from './utility-css.js';

const P3_MQ = '@media (color-gamut: p3)';
const REC2020_MQ = '@media (color-gamut: rec2020)';

export interface BuildFormatOptions {
  exclude: CSSPluginOptions['exclude'];
  getTransforms: BuildHookOptions['getTransforms'];
  modeSelectors: CSSPluginOptions['modeSelectors'];
  utility: CSSPluginOptions['utility'];
  baseSelector: string;
  baseScheme: CSSPluginOptions['baseScheme'];
}

export default function buildFormat({
  getTransforms,
  exclude,
  utility,
  modeSelectors,
  baseSelector,
  baseScheme,
}: BuildFormatOptions): string {
  const rules: CSSRule[] = [];

  // :root
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

  // modeSelectors (note: without these, modes won't get written to CSS)
  for (const { selectors, tokens, mode, scheme } of modeSelectors ?? []) {
    if (!selectors.length) {
      continue;
    }
    const selectorTokens = getTransforms({ format: FORMAT_ID, id: tokens, mode });
    if (!selectorTokens.length) {
      continue;
    }

    const selectorRule: CSSRule = { selectors, declarations: {} };

    // add color-scheme declaration first if configured for this mode
    // (must be before other properties to ensure it appears first in output)
    if (scheme) {
      selectorRule.declarations['color-scheme'] = { value: scheme };
    }

    const selectorP3Rule: CSSRule = { selectors, nestedQuery: P3_MQ, declarations: {} };
    const selectorRec2020Rule: CSSRule = { selectors, nestedQuery: REC2020_MQ, declarations: {} };
    const selectorAliasDeclarations: CSSRule['declarations'] = {};
    rules.push(selectorRule, selectorP3Rule, selectorRec2020Rule);

    for (const token of selectorTokens) {
      const localID = token.localID ?? token.token.id;

      const aliasTokens = token.token.aliasedBy?.length
        ? getTransforms({ format: FORMAT_ID, id: token.token.aliasedBy })
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

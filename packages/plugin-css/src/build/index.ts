import type { BuildHookOptions } from '@terrazzo/parser';
import { isTokenMatch } from '@terrazzo/token-tools';
import { generateShorthand } from '@terrazzo/token-tools/css';
import { type CSSPluginOptions, type CSSRule, FORMAT_ID, printRules } from '../lib.js';
import generateUtilityCSS from './utility-css.js';

const P3_MQ = '@media (color-gamut: p3)';
const REC2020_MQ = '@media (color-gamut: rec2020)';

export interface BuildFormatOptions {
  exclude: CSSPluginOptions['exclude'];
  getTransforms: BuildHookOptions['getTransforms'];
  modeSelectors: CSSPluginOptions['modeSelectors'];
  utility: CSSPluginOptions['utility'];
}

export default function buildFormat({ getTransforms, exclude, utility, modeSelectors }: BuildFormatOptions): string {
  const rules: CSSRule[] = [];

  // :root
  const rootTokens = getTransforms({ format: FORMAT_ID, mode: '.' });
  if (rootTokens.length) {
    const rootRule: CSSRule = { selectors: [':root'], declarations: {} };

    // note: `nestedQuery` was designed specifically for higher-gamut colors to
    // apply color-gamut media queries to existing selectors (i.e. keep the same
    // targets, and apply another nested layer of media query filtering based on
    // hardware). Because of how CSS works they need to get built out into their
    // own selectors that have different structures depending on whether
    // `selectors` has a media query or not.
    const p3Rule: CSSRule = { selectors: [':root'], nestedQuery: P3_MQ, declarations: {} };
    const rec2020Rule: CSSRule = { selectors: [':root'], nestedQuery: REC2020_MQ, declarations: {} };
    rules.push(rootRule, p3Rule, rec2020Rule);

    for (const token of rootTokens) {
      // handle exclude (if any)
      if (isTokenMatch(token.token.id, exclude ?? [])) {
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
        rootRule.declarations[localID] = token.value;
      }

      // multi-value token (wide gamut color)
      else if (token.value.srgb && token.value.p3 && token.value.rec2020) {
        rootRule.declarations[localID] = token.value.srgb!;
        if (token.value.p3 !== token.value.srgb) {
          p3Rule.declarations[localID] = token.value.p3!;
          rec2020Rule.declarations[localID] = token.value.rec2020!;

          // handle aliases within color gamut media queries
          for (const alias of aliasTokens) {
            if (alias.localID && typeof alias.value === 'string') {
              p3Rule.declarations[alias.localID] ??= alias.value;
              rec2020Rule.declarations[alias.localID] ??= alias.value;
            }
          }
        }
      }

      // multi-value token
      else if (token.type === 'MULTI_VALUE') {
        const shorthand = generateShorthand({ token, localID });
        if (shorthand) {
          rootRule.declarations[token.localID ?? token.token.id] = shorthand;
        }
        for (const [name, value] of Object.entries(token.value)) {
          rootRule.declarations[name === '.' ? localID : [localID, name].join('-')] = value;
        }
      }
    }
  }

  // modeSelectors (note: without these, modes won’t get written to CSS)
  for (const { selectors, tokens, mode } of modeSelectors ?? []) {
    if (!selectors.length) {
      continue;
    }
    const selectorTokens = getTransforms({ format: FORMAT_ID, id: tokens, mode });
    if (!selectorTokens.length) {
      continue;
    }

    const selectorRule: CSSRule = { selectors, declarations: {} };
    const selectorP3Rule: CSSRule = { selectors, nestedQuery: P3_MQ, declarations: {} };
    const selectorRec2020Rule: CSSRule = { selectors, nestedQuery: REC2020_MQ, declarations: {} };
    const selectorAliasDeclarations: Record<string, string> = {};
    rules.push(selectorRule, selectorP3Rule, selectorRec2020Rule);

    for (const token of selectorTokens) {
      const localID = token.localID ?? token.token.id;

      const aliasTokens = token.token.aliasedBy?.length
        ? getTransforms({ format: FORMAT_ID, id: token.token.aliasedBy })
        : [];

      // single-value token
      if (token.type === 'SINGLE_VALUE') {
        selectorRule.declarations[localID] = token.value;
      }

      // multi-value token (wide gamut color)
      else if (token.value.srgb && token.value.p3 && token.value.rec2020) {
        selectorRule.declarations[localID] = token.value.srgb!;
        if (token.value.p3 !== token.value.srgb) {
          selectorP3Rule.declarations[localID] = token.value.p3!;
          selectorRec2020Rule.declarations[localID] = token.value.rec2020!;

          // handle aliases within color gamut media queries
          for (const alias of aliasTokens) {
            if (alias.localID && typeof alias.value === 'string') {
              selectorP3Rule.declarations[alias.localID] ??= alias.value;
              selectorRec2020Rule.declarations[alias.localID] ??= alias.value;
            }
          }
        }
      }

      // multi-value token
      else {
        const shorthand = generateShorthand({ token, localID });
        if (shorthand) {
          selectorRule.declarations[localID] = shorthand;
        }
        for (const [name, subvalue] of Object.entries(token.value)) {
          selectorRule.declarations[`${localID}-${name}`] = subvalue;
        }
      }

      // redeclare aliases so they have the correct scope
      for (const alias of aliasTokens) {
        if (alias.localID && typeof alias.value === 'string') {
          selectorAliasDeclarations[alias.localID] = alias.value;
        }
      }
    }

    // after selector has settled, add in aliases if there are no conflicts
    for (const [name, value] of Object.entries(selectorAliasDeclarations)) {
      selectorRule.declarations[name] ??= value;
    }
  }

  // add utility CSS
  if (utility && Object.keys(utility).length) {
    rules.push(...generateUtilityCSS(utility, getTransforms({ format: FORMAT_ID, mode: '.' })));
  }

  return printRules(rules);
}

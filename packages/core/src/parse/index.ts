import { cloneDeep, FG_YELLOW, getAliasID, invalidTokenIDError, isAlias, RESET } from '@cobalt-ui/utils';
import type { Group, ParsedToken, TokenType, TokenOrGroup } from '../token.js';
import { isEmpty, isObj, splitType } from '../util.js';
import { normalizeColorValue, ParseColorOptions } from './tokens/color.js';
import { normalizeFontFamilyValue } from './tokens/fontFamily.js';
import { normalizeDurationValue } from './tokens/duration.js';
import { normalizeDimensionValue } from './tokens/dimension.js';
import { normalizeCubicBezierValue } from './tokens/cubic-bezier.js';
import { normalizeLinkValue } from './tokens/link.js';
import { normalizeStrokeStyleValue } from './tokens/stroke-style.js';
import { normalizeBorderValue } from './tokens/border.js';
import { normalizeTransitionValue } from './tokens/transition.js';
import { normalizeShadowValue } from './tokens/shadow.js';
import { normalizeGradientValue } from './tokens/gradient.js';
import { normalizeTypographyValue } from './tokens/typography.js';
import { normalizeFontWeightValue } from './tokens/fontWeight.js';
import { normalizeNumberValue } from './tokens/number.js';
import { convertTokensStudioFormat, isTokensStudioFormat } from './tokens-studio.js';
import { convertFigmaVariablesFormat, isFigmaVariablesFormat, type FigmaParseOptions, FigmaVariableManifest } from './figma.js';

export interface ParseResult {
  errors?: string[];
  warnings?: string[];
  result: {
    metadata: Record<string, unknown>;
    tokens: ParsedToken[];
  };
}

export interface ParseOptions {
  /** Configure transformations for color tokens */
  color: ParseColorOptions;
  figma?: FigmaParseOptions;
}

interface InheritedGroup {
  $type?: TokenType;
  $extensions: {
    requiredModes: string[];
  };
}

const RESERVED_KEYS = new Set(['$description', '$name', '$type', '$value', '$extensions']);

export function parse(rawTokens: unknown, options: ParseOptions): ParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const result: ParseResult = { result: { metadata: {}, tokens: [] } };
  if (!rawTokens || typeof rawTokens !== 'object' || Array.isArray(rawTokens)) {
    errors.push(`Invalid schema type. Expected object, received "${Array.isArray(rawTokens) ? 'Array' : typeof rawTokens}"`);
    result.errors = errors;
    return result;
  }

  let schema = rawTokens as Group;

  // 0. handle Figma Variables format
  if (isFigmaVariablesFormat(rawTokens)) {
    const figmaTokensResult = convertFigmaVariablesFormat(rawTokens as FigmaVariableManifest, options?.figma);
    errors.push(...(figmaTokensResult.errors ?? []));
    warnings.push(...(figmaTokensResult.warnings ?? []));
    schema = figmaTokensResult.result;
  }

  // 0. handle Tokens Studio for Figma format
  else if (isTokensStudioFormat(rawTokens)) {
    const tokensStudioResult = convertTokensStudioFormat(rawTokens as Group);
    errors.push(...(tokensStudioResult.errors ?? []));
    warnings.push(...(tokensStudioResult.warnings ?? []));
    schema = tokensStudioResult.result;
  }

  // 1. collect tokens
  const tokens: Record<string, ParsedToken> = {};
  function walk(node: TokenOrGroup, chain: string[] = [], group: InheritedGroup = { $extensions: { requiredModes: [] } }): void {
    if (!node || !isObj(node)) return;
    for (const [k, v] of Object.entries(node)) {
      if (!v || !isObj(v)) {
        errors.push(`${k}: unexpected token format "${v}"`);
        continue;
      }
      const tokenValidationError = invalidTokenIDError(k);
      if (tokenValidationError) {
        errors.push(`${k}: tokenValidationError`);
        continue;
      }
      if (k.includes('.')) {
        errors.push(`${k}: IDs can’t contain periods`);
        continue;
      }
      if (!Object.keys(v).length) {
        warnings.push(`${k}: group is empty`);
      }

      // token
      const token = {
        _original: cloneDeep(v),
        _group: {
          id: chain.join('.') || '.',
          ...(group || {}),
        },
        id: chain.concat(k).join('.'),
        $type: v.$type || group.$type,
        ...v,
      } as ParsedToken;
      const isToken = '$value' in token; // token MUST have $value, per the sepc
      if (isToken) {
        if (k.startsWith('$')) {
          errors.push(`${k}: token ID can’t start with the $ character`);
          continue;
        }
        if (isEmpty(token.$value)) {
          errors.push(`${token.id}: missing "$value"`);
          continue;
        }
        if (!!token.$extensions && token.$extensions.mode && !isObj(token.$extensions.mode)) {
          errors.push(`${token.id}: "mode" must be an object`);
        }
        if (group.$extensions.requiredModes.length) {
          for (const modeID of group.$extensions.requiredModes) {
            if (!token.$extensions || !token.$extensions.mode || !token.$extensions.mode[modeID]) errors.push(`${token.id}: missing mode "${modeID}" required from parent group`);
          }
        }
        tokens[token.id] = token;
      }
      // group
      else {
        const nextGroup = { ...group };

        const groupTokens: Record<string, TokenOrGroup> = {};
        for (const propertyKey of Object.keys(v)) {
          // move all "$" properties to group
          if (propertyKey.startsWith('$')) {
            // merge $extensions; don’t overwrite them
            if (propertyKey === '$extensions') nextGroup.$extensions = { ...nextGroup.$extensions, ...v.$extensions };
            else (nextGroup as any)[propertyKey] = v[propertyKey];
            if (!RESERVED_KEYS.has(propertyKey)) {
              if (!result.warnings) result.warnings = [];
              result.warnings.push(`Unknown property "${propertyKey}"`);
            }
          }
          // everything else is a token or subgroup needing to be scanned
          else {
            groupTokens[propertyKey] = v[propertyKey];
          }
        }

        // continue walking if all children look like tokens or groups (all objects)
        if (Object.values(groupTokens).every((t: any) => isObj(t))) {
          walk(groupTokens, [...chain, k], nextGroup);
        }
        // otherwise, this is probably a token with missing properties
        else {
          throw new Error(`${k}: missing $type`);
        }
      }
    }
  }

  const group: InheritedGroup = { $extensions: { requiredModes: [] } };
  const topNodes: Record<string, TokenOrGroup> = {};
  for (const k of Object.keys(schema)) {
    if (k.startsWith('$')) {
      if (k === '$extensions') group.$extensions = { ...schema.$extensions, ...group.$extensions };
      else (group as any)[k] = schema[k];
      if (!RESERVED_KEYS.has(k)) {
        if (!result.warnings) result.warnings = [];
        result.warnings.push(`Unknown property "${k}"`);
      }
      result.result.metadata[k] = schema[k];
    } else {
      topNodes[k] = schema[k]!;
    }
  }
  walk(topNodes, [], group);
  if (errors.length) {
    result.errors = errors;
    return result;
  }

  // 2. resolve aliases
  const values: Record<string, unknown> = {};

  // 2a. pass 1: gather all IDs & values
  for (const token of Object.values(tokens)) {
    values[token.id] = token.$value;
    if (token.$extensions && token.$extensions.mode) {
      for (const [k, v] of Object.entries(token.$extensions.mode || {})) {
        values[`${token.id}#${k}`] = v;
      }
    }
  }

  // 2b. pass 2: resolve 1:1 aliases
  function resolveAliases(id: string, v: unknown): any {
    return splitType(v, {
      default(val) {
        return val;
      },
      string(strVal) {
        if (!isAlias(strVal)) return strVal;
        const nextID = getAliasID(strVal);
        if (!(nextID in values)) {
          throw new Error(`${id}: can’t find ${strVal}`);
        }

        // check for circular references
        const ref = values[nextID] as string;
        if (typeof ref === 'string' && isAlias(ref) && id === getAliasID(ref)) {
          throw new Error(`${id}: can’t reference circular alias ${strVal}`);
        }

        return values[nextID];
      },
      array(arrVal) {
        return arrVal.map((value) => resolveAliases(id, value));
      },
      object(objVal) {
        for (const prop of Object.keys(objVal as Record<string, unknown>)) {
          objVal[prop] = resolveAliases(id, objVal[prop]);
        }
        return objVal;
      },
    });
  }
  while (unaliasedValues(values)) {
    try {
      for (const [id, value] of Object.entries(values)) {
        values[id] = resolveAliases(id, value);
      }
    } catch (err: any) {
      errors.push(err.message || err);
      break;
    }
  }
  if (errors.length) {
    result.errors = errors;
    return result;
  }

  // 3. validate values & replace aliases
  function normalizeModes(id: string, validate: (value: unknown) => any): void {
    const token = tokens[id]!;
    if (!token.$extensions || !token.$extensions.mode) return;
    for (const k of Object.keys(token.$extensions.mode || {})) {
      (tokens[id] as any).$extensions.mode[k] = validate(values[`${id}#${k}`]);
    }
  }

  for (const [id, token] of Object.entries(tokens)) {
    try {
      switch (token.$type) {
        // 8.1 Color
        case 'color': {
          tokens[id]!.$value = normalizeColorValue(values[id], options.color);
          normalizeModes(id, (v) => normalizeColorValue(v, options.color));
          break;
        }
        // 8.2 Dimension
        case 'dimension': {
          tokens[id]!.$value = normalizeDimensionValue(values[id]);
          normalizeModes(id, (v) => normalizeDimensionValue(v));
          break;
        }
        // 8.3 FontFamily
        case 'font' as 'fontFamily': // @deprecated (but keep support for now)
        case 'fontFamily': {
          if ((token.$type as any) === 'font') console.warn(`${FG_YELLOW}@cobalt-ui/core${RESET} $type: "font" is deprecated. Please use "fontFamily" instead.`); // eslint-disable-line no-console
          tokens[id]!.$value = normalizeFontFamilyValue(values[id]);
          normalizeModes(id, (v) => normalizeFontFamilyValue(v));
          break;
        }
        // 8.4 FontWeight
        case 'fontWeight': {
          tokens[id]!.$value = normalizeFontWeightValue(values[id]);
          normalizeModes(id, (v) => normalizeFontWeightValue(v));
          break;
        }
        // 8.5 Duration
        case 'duration': {
          tokens[id]!.$value = normalizeDurationValue(values[id]);
          normalizeModes(id, (v) => normalizeDurationValue(v));
          break;
        }
        // 8.6 Cubic Bezier
        case 'cubicBezier': {
          tokens[id]!.$value = normalizeCubicBezierValue(values[id]);
          normalizeModes(id, (v) => normalizeCubicBezierValue(v));
          break;
        }
        // 8.7 Number
        case 'number': {
          tokens[id]!.$value = normalizeNumberValue(values[id]);
          normalizeModes(id, (v) => normalizeNumberValue(v));
          break;
        }
        // 8.? Link
        case 'link': {
          tokens[id]!.$value = normalizeLinkValue(values[id]);
          normalizeModes(id, (v) => normalizeLinkValue(v));
          break;
        }
        // 9.2 Stroke Style
        case 'strokeStyle': {
          tokens[id]!.$value = normalizeStrokeStyleValue(values[id]);
          normalizeModes(id, (v) => normalizeStrokeStyleValue(v));
          break;
        }
        // 9.3 Border
        case 'border': {
          tokens[id]!.$value = normalizeBorderValue(values[id], { color: options.color });
          normalizeModes(id, (v) => normalizeBorderValue(v, { color: options.color }));
          break;
        }
        // 9.4 Transition
        case 'transition': {
          tokens[id]!.$value = normalizeTransitionValue(values[id]);
          normalizeModes(id, (v) => normalizeTransitionValue(v));
          break;
        }
        // 9.5 Shadow
        case 'shadow': {
          tokens[id]!.$value = normalizeShadowValue(values[id], { color: options.color });
          normalizeModes(id, (v) => normalizeShadowValue(v, { color: options.color }));
          break;
        }
        // 9.6 Gradient
        case 'gradient': {
          tokens[id]!.$value = normalizeGradientValue(values[id], { color: options.color });
          normalizeModes(id, (v) => normalizeGradientValue(v, { color: options.color }));
          break;
        }
        // 9.7 Typography
        case 'typography': {
          tokens[id]!.$value = normalizeTypographyValue(values[id]);
          normalizeModes(id, (v) => normalizeTypographyValue(v));
          break;
        }
        // custom/other
        default: {
          (tokens[id] as any).value = values[id];
          normalizeModes(id, (v) => v);
          break;
        }
      }
    } catch (err: any) {
      errors.push(`${id}: ${err.message || err}`);
    }
  }

  // 4. finish
  if (errors.length) result.errors = errors;
  if (warnings.length) result.warnings = warnings;
  result.result.tokens = Object.values(tokens);
  result.result.tokens.sort((a, b) => a.id.localeCompare(b.id, 'en-us', { numeric: true })); // sort alphabetically
  return result;
}

/** given a string, find all {aliases} */
export function findAliases(input: string): string[] {
  const matches: string[] = [];
  if (!input.includes('{')) return matches;
  let lastI = -1;
  for (let n = 0; n < input.length; n++) {
    switch (input[n]) {
      case '\\': {
        // if '\{' or '\}' encountered, skip
        if (input[n + 1] == '{' || input[n + 1] == '}') n += 1;
        break;
      }
      case '{': {
        lastI = n; // '{' encountered; keep going until '}' (below)
        break;
      }
      case '}': {
        if (lastI === -1) continue; // ignore '}' if no '{'
        matches.push(input.substring(lastI, n + 1));
        lastI = -1; // reset last index
        break;
      }
    }
  }
  return matches;
}

function unaliasedValues(values: Record<string, unknown>): boolean {
  return Object.values(values).some((v) =>
    splitType(v, {
      default: () => false,
      string: (value) => isAlias(value),
      array: (value) =>
        value.some((part) => {
          if (typeof part === 'string') return isAlias(part);
          if (isObj(part)) return unaliasedValues(part as Record<string, unknown>);
          return false;
        }),
      object: (value) => unaliasedValues(value as Record<string, unknown>),
    }),
  );
}

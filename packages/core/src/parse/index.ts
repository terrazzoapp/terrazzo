import type { Group, ParsedToken, TokenType, TokenOrGroup } from '../@types/token';
import { isEmpty, isObj, splitType } from '../util.js';
import { normalizeColorValue } from './tokens/color.js';
import { normalizeFontValue } from './tokens/font.js';
import { normalizeDurationValue } from './tokens/duration.js';
import { normalizeDimensionValue } from './tokens/dimension.js';
import { normalizeCubicBezierValue } from './tokens/cubic-bezier.js';
import { normalizeFileValue } from './tokens/file.js';
import { normalizeURLValue } from './tokens/url.js';
import { normalizeShadowValue } from './tokens/shadow.js';
import { normalizeGradientValue } from './tokens/gradient.js';
import { normalizeTypographyValue } from './tokens/typography.js';
import { normalizeTransitionValue } from './tokens/transition.js';

export interface ParseResult {
  errors?: string[];
  warnings?: string[];
  result: {
    metadata: Record<string, unknown>;
    tokens: ParsedToken[];
  };
}

const ALIAS_RE = /^\{([^}]+)\}$/;

export function parse(schema: Group): ParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const result: ParseResult = { result: { metadata: {}, tokens: [] } };
  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
    errors.push(`Invalid schema type. Expected object, received "${Array.isArray(schema) ? 'Array' : typeof schema}"`);
    result.errors = errors;
    return result;
  }

  interface InheritedGroup {
    type?: TokenType;
    requiredModes: string[];
  }

  // 1. collect tokens
  if (schema.metadata && isObj(schema.metadata)) {
    result.result.metadata = schema.metadata;
  }
  const tokens: Record<string, ParsedToken> = {};
  function walk(node: TokenOrGroup, chain: string[] = [], group: InheritedGroup = { requiredModes: [] }): void {
    if (!node || !isObj(node)) return;
    for (const [k, v] of Object.entries(node)) {
      if (!v || !isObj(v)) {
        errors.push(`${k}: unexpected token format "${v}"`);
        continue;
      }
      if (k.includes('.') || k.includes('#')) {
        errors.push(`${k}: invalid name. Names can’t include "." or "#".`);
        continue;
      }
      if (!Object.keys(v).length) {
        errors.push(`${k}: groups can’t be empty`);
      }

      // token
      const token = {
        _original: { ...v },
        _group: {
          id: chain.join('.') || '.',
          ...(group || {}),
        },
        id: chain.concat(k).join('.'),
        type: v.type || group.type,
        ...v,
      } as ParsedToken;
      const isToken = !!token.value;
      if (isToken) {
        if (isEmpty(token.value)) {
          errors.push(`${token.id}: missing value`);
          continue;
        }
        if (!!token.mode && !isObj(token.mode)) {
          errors.push(`${token.id}: "mode" must be an object`);
        }
        if (group.requiredModes.length) {
          for (const modeID of group.requiredModes) {
            if (!(token.mode || {})[modeID]) errors.push(`${token.id}: missing mode "${modeID}" required from parent group`);
          }
        }
        tokens[token.id] = token;
      }
      // group
      else {
        const { metadata, ...groupTokens } = v; // "metadata" only reserved word on group
        const nextGroup = { ...group, ...(metadata || {}) };
        if (!!metadata && !isObj(metadata)) {
          errors.push(`${k}: "metadata" must be an object, received ${Array.isArray(metadata) ? 'array' : typeof metadata}`);
        }
        // continue walking if all children look like tokens or groups (all objects)
        if (Object.values(groupTokens).every((t: any) => isObj(t))) {
          walk(groupTokens, [...chain, k], nextGroup);
          continue;
        }
        // otherwise, this is probably a token with missing properties
        throw new Error(`${k}: missing type`);
      }
    }
  }

  const { metadata, ...topNodes } = schema;
  walk(topNodes, [], { requiredModes: [], ...(metadata || []) });
  if (errors.length) {
    result.errors = errors;
    return result;
  }

  // 2. resolve aliases
  const values: Record<string, unknown> = {};

  // 2a. pass 1: gather all IDs & values
  for (const token of Object.values(tokens)) {
    values[token.id] = token.value;
    for (const [k, v] of Object.entries(token.mode || {})) {
      values[`${token.id}#${k}`] = v;
    }
  }

  // 2b. pass 2: resolve 1:1 aliases
  function resolveAliases(id: string, v: unknown): any {
    return splitType(v, {
      default(val) {
        return val;
      },
      string(strVal) {
        if (!ALIAS_RE.test(strVal)) return strVal;
        const nextID = getAliasID(strVal);
        if (!values[nextID]) {
          throw new Error(`${id}: can’t find ${strVal}`);
        }

        // check for circular references
        const ref = values[nextID] as string;
        if (typeof ref === 'string' && ALIAS_RE.test(ref) && id === getAliasID(ref)) {
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
    if (!tokens[id].mode) return;
    for (const k of Object.keys(tokens[id].mode || {})) {
      (tokens[id] as any).mode[k] = validate(values[`${id}#${k}`]);
    }
  }

  for (const [id, token] of Object.entries(tokens)) {
    try {
      switch (token.type) {
        // 8.1 Color
        case 'color':
          tokens[id].value = normalizeColorValue(values[id]);
          normalizeModes(id, normalizeColorValue);
          break;
        // 8.2 Dimension
        case 'dimension':
          tokens[id].value = normalizeDimensionValue(values[id]);
          normalizeModes(id, normalizeDimensionValue);
          break;
        // 8.3 Font
        case 'font':
          tokens[id].value = normalizeFontValue(values[id]);
          normalizeModes(id, normalizeFontValue);
          break;
        // 8.4 Duration
        case 'duration':
          tokens[id].value = normalizeDurationValue(values[id]);
          normalizeModes(id, normalizeDurationValue);
          break;
        // 8.5 Cubic Bezier
        case 'cubic-bezier':
          tokens[id].value = normalizeCubicBezierValue(values[id]);
          normalizeModes(id, normalizeCubicBezierValue);
          break;
        // 8.? File
        case 'file':
          tokens[id].value = normalizeFileValue(values[id]);
          normalizeModes(id, normalizeFileValue);
          break;
        // 8.? URL
        case 'url':
          tokens[id].value = normalizeURLValue(values[id]);
          normalizeModes(id, normalizeURLValue);
          break;
        // 9.? Transition
        case 'transition':
          tokens[id].value = normalizeTransitionValue(values[id]);
          normalizeModes(id, normalizeTransitionValue);
          break;
        // 9.? Shadow
        case 'shadow':
          tokens[id].value = normalizeShadowValue(values[id]);
          normalizeModes(id, normalizeShadowValue);
          break;
        // 9.? Gradient
        case 'gradient':
          tokens[id].value = normalizeGradientValue(values[id]);
          normalizeModes(id, normalizeGradientValue);
          break;
        // 9.? Typography
        case 'typography':
          tokens[id].value = normalizeTypographyValue(values[id]);
          normalizeModes(id, normalizeTypographyValue);
          break;
        // custom/other
        default:
          (tokens[id] as any).value = values[id];
          normalizeModes(id, (v) => v);
          break;
      }
    } catch (err: any) {
      errors.push(`${id}: ${err.message || err}`);
    }
  }

  // 4. finish
  if (errors.length) result.errors = errors;
  if (warnings.length) result.warnings = warnings;
  result.result.tokens = Object.values(tokens);
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
      string: (value) => ALIAS_RE.test(value),
      array: (value) =>
        value.some((part) => {
          if (typeof part === 'string') return ALIAS_RE.test(part);
          if (isObj(part)) return unaliasedValues(part as Record<string, unknown>);
          return false;
        }),
      object: (value) => unaliasedValues(value as Record<string, unknown>),
    })
  );
}

function getAliasID(input: string): string {
  const match = input.match(ALIAS_RE);
  if (!match) return input;
  return match[1];
}

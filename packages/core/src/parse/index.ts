import type { Group, ParsedToken, TokenType, TokenOrGroup } from '../@types/token';
import { isEmpty, isObj, splitType } from '../util.js';
import { normalizeColorValue } from './tokens/color.js';
import { normalizeFontValue } from './tokens/font.js';
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

export interface ParseResult {
  errors?: string[];
  warnings?: string[];
  result: {
    metadata: Record<string, unknown>;
    tokens: ParsedToken[];
  };
}

const ALIAS_RE = /^\{([^}]+)\}$/;

const RESERVED_KEYS = new Set(['$description', '$name', '$type', '$value', '$extensions']);

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
    $type?: TokenType;
    $extensions: {
      requiredModes: string[];
    };
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
      if (k.includes('.') || k.includes('{') || k.includes('}') || k.includes('#')) {
        errors.push(`${k}: IDs can’t include any of the following: .{}#`);
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
        $type: v.$type || group.$type,
        ...v,
      } as ParsedToken;
      const isToken = token.hasOwnProperty('$value'); // token MUST have $value, per the sepc
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
            if (!token.$extensions || !token.$extensions.mode || !token.$extensions.mode[modeID])
              errors.push(`${token.id}: missing mode "${modeID}" required from parent group`);
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
      if (k === '$extensions') group.$extensions = { ...group.$extensions, ...schema.$extensions };
      else (group as any)[k] = schema[k];
      if (!RESERVED_KEYS.has(k)) {
        if (!result.warnings) result.warnings = [];
        result.warnings.push(`Unknown property "${k}"`);
      }
      result.result.metadata[k] = schema[k];
    } else {
      topNodes[k] = schema[k];
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
    const token = tokens[id];
    if (!token.$extensions || !token.$extensions.mode) return;
    for (const k of Object.keys(token.$extensions.mode || {})) {
      (tokens[id] as any).$extensions.mode[k] = validate(values[`${id}#${k}`]);
    }
  }

  for (const [id, token] of Object.entries(tokens)) {
    try {
      switch (token.$type) {
        // 8.1 Color
        case 'color':
          tokens[id].$value = normalizeColorValue(values[id]);
          normalizeModes(id, normalizeColorValue);
          break;
        // 8.2 Dimension
        case 'dimension':
          tokens[id].$value = normalizeDimensionValue(values[id]);
          normalizeModes(id, normalizeDimensionValue);
          break;
        // 8.3 Font
        case 'font':
          tokens[id].$value = normalizeFontValue(values[id]);
          normalizeModes(id, normalizeFontValue);
          break;
        // 8.4 Duration
        case 'duration':
          tokens[id].$value = normalizeDurationValue(values[id]);
          normalizeModes(id, normalizeDurationValue);
          break;
        // 8.5 Cubic Bezier
        case 'cubicBezier':
          tokens[id].$value = normalizeCubicBezierValue(values[id]);
          normalizeModes(id, normalizeCubicBezierValue);
          break;
        // 8.? Link
        case 'link':
          tokens[id].$value = normalizeLinkValue(values[id]);
          normalizeModes(id, normalizeLinkValue);
          break;
        // 9.2 Stroke Style
        case 'strokeStyle':
          tokens[id].$value = normalizeStrokeStyleValue(values[id]);
          normalizeModes(id, normalizeStrokeStyleValue);
          break;
        // 9.3 Border
        case 'border':
          tokens[id].$value = normalizeBorderValue(values[id]);
          normalizeModes(id, normalizeBorderValue);
          break;
        // 9.4 Transition
        case 'transition':
          tokens[id].$value = normalizeTransitionValue(values[id]);
          normalizeModes(id, normalizeTransitionValue);
          break;
        // 9.5 Shadow
        case 'shadow':
          tokens[id].$value = normalizeShadowValue(values[id]);
          normalizeModes(id, normalizeShadowValue);
          break;
        // 9.6 Gradient
        case 'gradient':
          tokens[id].$value = normalizeGradientValue(values[id]);
          normalizeModes(id, normalizeGradientValue);
          break;
        // 9.7 Typography
        case 'typography':
          tokens[id].$value = normalizeTypographyValue(values[id]);
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

import color from 'better-color-tools';

export interface ColorToken extends TokenBase<string> {
  type: 'color';
}

export interface ConicGradientToken extends TokenBase<string> {
  type: 'conic-gradient';
}

export interface CubicBezierToken extends TokenBase<[number, number, number, number]> {
  type: 'cubic-bezier';
}

export interface DimensionToken extends TokenBase<string> {
  type: 'dimension';
}

export interface FontToken extends TokenBase<string[]> {
  type: 'font';
}

export interface FileToken extends TokenBase<string> {
  type: 'file';
}

export type Group = {
  metadata?: Record<string, unknown>;
} & {
  [childNode: string]: TokenOrGroup;
};

export interface LinearGradientToken extends TokenBase<string> {
  type: 'linear-gradient';
}

export type Mode<T = string> = Record<string, T>;

export interface RadialGradientToken extends TokenBase<string> {
  type: 'radial-gradient';
}

export interface ShadowToken extends TokenBase<string[]> {
  type: 'shadow';
}

export interface TokenBase<T = string> {
  /** User-friendly name */
  name?: string;
  /** Token description */
  description?: string;
  /** Token value */
  value: T;
  /** Mode variants */
  mode: Mode<T>;
}

export type Token =
  | ColorToken
  | ConicGradientToken
  | CubicBezierToken
  | DimensionToken
  | FileToken
  | FontToken
  | LinearGradientToken
  | RadialGradientToken
  | ShadowToken
  | URLToken;

export type TokenType = Token['type'];

export type TokenOrGroup = Group | Token;

export interface URLToken extends TokenBase<string> {
  type: 'url';
  value: string;
}

export interface ParsedMetadata {
  name?: string;
  version?: string;
  metadata?: Record<string, unknown>;
}

export interface ParseResult {
  errors?: string[];
  warnings?: string[];
  result: {
    metadata: ParsedMetadata;
    tokens: ParsedToken[];
  };
}

export type ParsedToken = { id: string } & Token;

export interface Schema {
  name?: string;
  version?: string;
  metadata?: Record<string, unknown>;
  tokens: Record<string, TokenOrGroup>;
}

const VALID_TOP_LEVEL_KEYS = new Set(['name', 'version', 'metadata', 'tokens']);
const ALIAS_RE = /^\{.*\}$/;

export function parse(schema: Schema): ParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const result: ParseResult = { result: { metadata: {}, tokens: [] } };
  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
    errors.push(`Invalid schema type. Expected object, received "${Array.isArray(schema) ? 'Array' : typeof schema}"`);
    result.errors = errors;
    return result;
  }

  // 1. check top-level
  for (const k of Object.keys(schema)) {
    if (VALID_TOP_LEVEL_KEYS.has(k)) {
      if (k !== 'tokens') (result.result.metadata as any)[k] = (schema as any)[k];
    } else {
      errors.push(`Invalid top-level name "${k}". Place arbitrary data inside "metadata".`);
    }
  }
  if (errors.length) {
    result.errors = errors;
    return result;
  }
  if (!schema.tokens || typeof schema.tokens !== 'object' || !Object.keys(schema.tokens).length) {
    errors.push('"tokens" is empty!');
    result.errors = errors;
    return result;
  }

  interface InheritedGroup {
    type?: TokenType;
    modes: string[];
  }

  // 2. collect tokens
  const tokens: Record<string, ParsedToken> = {};
  function walk(node: TokenOrGroup, chain: string[] = [], group: InheritedGroup = { modes: [] }): void {
    for (const [k, v] of Object.entries(node)) {
      if (!v || Array.isArray(v) || typeof v !== 'object') {
        errors.push(`${k}: unexpected token format "${v}"`);
        continue;
      }
      if (k.includes('.') || k.includes('#')) {
        errors.push(`${k}: invalid name. Names can’t include "." or "#".`);
        continue;
      }

      // token
      const isToken = v.type || (group.type && !!v.value);
      if (isToken) {
        const id = chain.concat(k).join('.');
        const nodeType: TokenType = v.type || group.type;
        if (!v.value) {
          errors.push(`${id}: missing value`);
          continue;
        }
        const token = v as Token;
        let mode = token.mode || {};
        if (typeof mode !== 'object' || Array.isArray(mode)) {
          errors.push(`${id}: "mode" must be an object`);
          mode = {};
        }
        if (group.modes.length) {
          for (const modeID of group.modes) {
            if (!mode[modeID]) errors.push(`${id}: missing mode "${modeID}" set on parent group`);
          }
        }

        for (const [modeID, modeValue] of Object.entries(mode)) {
          if (!checkStrVal(modeValue)) errors.push(`${id}#${modeID}: bad value "${modeValue}"`);
        }
        tokens[id] = {
          id,
          ...(token as any),
          type: nodeType,
          mode: mode as any,
        };
      }
      // group
      else {
        const { metadata, ...groupTokens } = v; // "metadata" only reserved word on group
        const nextGroup = { ...group };
        if (metadata) {
          if (metadata.type) nextGroup.type = metadata.type;
          if (Array.isArray(metadata.modes)) nextGroup.modes = metadata.modes;
        }
        if (Object.keys(groupTokens).length) {
          walk(groupTokens, [...chain, k], nextGroup);
        }
      }
    }
  }
  walk(schema.tokens);
  if (errors.length) {
    result.errors = errors;
    return result;
  }

  // 3. resolve aliases
  const values: Record<string, unknown> = {};
  // 3a. pass 1: gather all IDs & values
  for (const token of Object.values(tokens)) {
    values[token.id] = token.value;
    for (const [k, v] of Object.entries(token.mode)) {
      values[`${token.id}#${k}`] = v;
    }
  }
  // 3b. pass 2: resolve simple aliases
  aliasLoop: while (Object.values(values).some((t) => typeof t === 'string' && ALIAS_RE.test(t))) {
    for (const [k, v] of Object.entries(values)) {
      if (typeof v !== 'string' || !ALIAS_RE.test(v)) continue;
      const id = v.substring(1, v.length - 1);
      if (!values[id]) {
        errors.push(`${k}: can’t find ${v}`);
        break aliasLoop;
      }
      // check for circular references
      const ref = values[id] as string;
      if (typeof ref === 'string' && ALIAS_RE.test(ref) && id === ref.substring(1, ref.length - 1)) {
        errors.push(`${k}: can’t reference circular alias ${v}`);
        break aliasLoop;
      }
      values[k] = values[id];
    }
  }
  if (errors.length) {
    result.errors = errors;
    return result;
  }
  // 3c. pass 3: resolve embedded aliases from simple aliases
  while (
    Object.values(values).some(
      (t) => (typeof t === 'string' && findAliases(t).length) || (Array.isArray(t) && t.some((v) => typeof v === 'string' && findAliases(v).length))
    )
  ) {
    for (const [k, v] of Object.entries(values)) {
      if (typeof v === 'string') {
        let value = v;
        for (const alias of findAliases(v)) {
          const aliasedID = alias.substring(1, alias.length - 1);
          values[k] = value.replace(alias, values[aliasedID] as any);
        }
      }
      if (Array.isArray(v) && v.every((s) => typeof s === 'string')) {
        values[k] = v.map((s) => {
          let value = s;
          for (const alias of findAliases(s)) {
            const aliasedID = alias.substring(1, alias.length - 1);
            value = value.replace(alias, values[aliasedID]);
          }
          return value;
        });
      }
    }
  }

  // 4. validate values & replace aliases
  for (const id of Object.keys(tokens)) {
    const token = tokens[id];
    try {
      switch (token.type) {
        // string tokens can all be validated together
        case 'dimension':
        case 'file':
        case 'linear-gradient':
        case 'radial-gradient':
        case 'conic-gradient': {
          const val = values[id] as string;
          // ✔ valid string
          if (checkStrVal(val)) tokens[id].value = val;
          // ✘ invalid string
          else errors.push(`${id}: bad value "${val}"`);
          for (const modeID of Object.keys(token.mode)) {
            const modeVal = values[`${id}#${modeID}`];
            // ✔ valid mode
            if (checkStrVal(modeVal)) tokens[id].mode[modeID] = modeVal as string;
            // ✘ invalid mode
            else errors.push(`${id}: bad value "${modeVal}"`);
          }
          break;
        }
        case 'color': {
          const val = values[id] as ColorToken['value'];
          // ✔ valid color
          if (checkColor(val)) tokens[id].value = val;
          // ✘ invalid color
          else errors.push(`${id}: invalid color "${val}"`);
          for (const modeID of Object.keys(token.mode)) {
            const modeVal = values[`${id}#${modeID}`] as ColorToken['value'];
            // ✔ valid mode
            if (checkColor(modeVal)) tokens[id].mode[modeID] = modeVal;
            // ✘ invalid mode
            else errors.push(`${id}: invalid color "${modeVal}"`);
          }
          break;
        }
        case 'font': {
          const rawVal = values[id];
          const val = Array.isArray(rawVal) ? rawVal : [rawVal];
          // ✔ valid font
          if (checkFont(val)) tokens[id].value = val;
          // ✘ invalid font
          else errors.push(`${id}: expected string or array of strings, received ${typeof token.value}`);
          for (const modeID of Object.keys(token.mode)) {
            const rawModeVal = values[`${id}#${modeID}`];
            const modeVal = Array.isArray(rawModeVal) ? rawModeVal : [rawModeVal];
            // ✔ valid mode
            if (checkFont(modeVal)) tokens[id].mode[modeID] = modeVal;
            // ✘ invalid mode
            else errors.push(`${id}: expected string or array of strings, received ${typeof rawModeVal}`);
          }
          break;
        }
        case 'cubic-bezier': {
          const val = values[id] as CubicBezierToken['value'];
          // ✔ valid cubic-bezier
          if (checkCubicBezier(val)) {
            val[0] = Math.max(0, Math.min(1, val[0]));
            val[2] = Math.max(0, Math.min(1, val[2]));
            tokens[id].value = val;
          }
          // ✘ invalid cubic-bezier
          else errors.push(`${id}: expected [x1, y1, x2, y2], received "${val}"`);
          for (const modeID of Object.keys(token.mode)) {
            const modeVal = values[`${id}#${modeID}`] as CubicBezierToken['value'];
            // ✔ valid mode
            if (checkCubicBezier(modeVal)) {
              modeVal[0] = Math.max(0, Math.min(1, modeVal[0]));
              modeVal[2] = Math.max(0, Math.min(1, modeVal[2]));
              tokens[id].mode[modeID] = modeVal;
            }
            // ✘ invalid mode
            else errors.push(`${id}: expected [x1, y1, x2, y2], received "${modeVal}"`);
          }
          break;
        }
        case 'url': {
          const val = values[id] as URLToken['value'];
          // ✔ valid url
          if (checkURL(val)) tokens[id].value = val;
          // ✘ invalid url
          else errors.push(`${id}: invalid url "${val}" (if this is relative, use type: "file")`);
          for (const modeID of Object.keys(token.mode)) {
            const modeVal = values[`${id}#${modeID}`] as URLToken['value'];
            // ✔ valid mode
            if (checkURL(modeVal)) tokens[id].mode[modeID] = modeVal;
            // ✘ invalid mode
            else errors.push(`${id}: invalid url "${modeVal}" (if this is relative, use type: "file")`);
          }
          break;
        }
        case 'shadow': {
          const val = values[id] as ShadowToken['value'];
          // ✔ valid shadow (validate before aliasing, as aliases may be inside array)
          if (checkShadow(val)) tokens[id].value = val;
          // ✘ invalid shadow
          else errors.push(`${id}: expected array, received "${token.value}"`);
          for (const modeID of Object.keys(token.mode)) {
            const modeVal = values[`${id}#${modeID}`] as ShadowToken['value'];
            // ✔ valid mode
            if (checkShadow(modeVal)) tokens[id].mode[modeID] = modeVal;
            // ✘ invalid mode
            else errors.push(`${id}: expected array, received "${modeVal}"`);
          }
          break;
        }
        // custom/other
        default: {
          tokens[id].value = values[id] as any;
          for (const modeID of Object.keys((token as any).mode)) {
            (tokens[id] as any).mode[modeID] = values[`${id}#${modeID}`];
          }
          break;
        }
      }
    } catch (err: any) {
      errors.push(`${id}: ${err.message || err}`);
    }
  }

  // 4. return
  if (errors.length) result.errors = errors;
  if (warnings.length) result.warnings = warnings;
  result.result.tokens = Object.values(tokens);
  return result;
}

function checkColor(val: unknown): boolean {
  if (!val) return false;
  if (typeof val !== 'string') return false;
  try {
    color.from(val);
    return true;
  } catch {
    return false;
  }
}

function checkCubicBezier(val: unknown): boolean {
  if (!val) return false;
  return Array.isArray(val) && val.length === 4 && val.every((v) => typeof v === 'number' && !Number.isNaN(v));
}

function checkStrVal(val: unknown): boolean {
  return !!val && typeof val === 'string';
}

function checkFont(val: unknown): boolean {
  if (!val) return false;
  if (typeof val === 'string') return true;
  return Array.isArray(val) && val.every((v) => typeof v === 'string' && v.length);
}

function checkShadow(val: unknown): boolean {
  if (!val) return false;
  return Array.isArray(val) && val.every((v) => typeof v === 'string' && v.length);
}

function checkURL(val: unknown): boolean {
  if (!val || typeof val !== 'string') return false;
  try {
    new URL(val);
    return true;
  } catch {
    return false;
  }
}

/** given a string, find all {aliases} */
function findAliases(input: string): string[] {
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

/**
 * Handle format for Tokens Studio for Figma
 * This works by first converting the Tokens Studio format
 * into an equivalent W3C Design Tokens format, then parsing that result
 */
import {getAliasID, isAlias} from '@cobalt-ui/utils';
import type {GradientStop, Group, Token} from '../token.js';

export function convertTokensStudioFormat(rawTokens: Record<string, unknown>): {errors?: string[]; warnings?: string[]; result: Group} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const w3cTokens: Group = {};

  function addToken(value: Token, path: string[]): void {
    const parts = [...path];
    const id = parts.pop()!;
    let tokenNode = w3cTokens;
    for (const p of parts) {
      if (!(p in tokenNode)) tokenNode[p] = {};
      tokenNode = tokenNode[p] as Group;
    }
    tokenNode[id] = value;
  }

  function walk(node: unknown, path: string[]): void {
    if (!node || typeof node !== 'object') return;
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith('$')) continue; // don’t scan meta properties like $themes or $metadata

      // token
      if (!!v && typeof v === 'object' && 'type' in v && 'value' in v) {
        const tokenID = [...path, k].join('.');

        // resolve aliases
        const tokenSet = path[0]!;
        if (typeof v.value === 'string') {
          if (v.value.trim().startsWith('{') && !v.value.trim().startsWith(`{${tokenSet}`)) {
            v.value = v.value.trim().replace('{', `{${tokenSet}.`);
          }
        } else if (v.value && typeof v.value === 'object') {
          for (const [property, propertyValue] of Object.entries(v.value)) {
            if (typeof propertyValue !== 'string') continue;
            if (propertyValue.trim().startsWith('{') && !propertyValue.trim().startsWith(`{${tokenSet}`)) {
              v.value[property] = v.value[property].trim().replace('{', `{${tokenSet}.`);
            }
          }
        }

        switch (v.type) {
          case 'border': {
            addToken({$type: 'border', $value: v.value}, [...path, k]);
            break;
          }
          case 'borderRadius': {
            // invalid token: surface error
            if (typeof v.value !== 'string') {
              // @ts-expect-error invalid value type; throw error
              addToken({$type: 'borderRadius', $value: v.value}, [...path, k]);
              break;
            }
            const values = (v.value as string)
              .split(' ')
              .map((s) => s.trim())
              .filter(Boolean);
            if (values.length === 1) {
              addToken({$type: 'dimension', $value: v.value.trim()}, [...path, k]);
            } else if (values.length === 2 || values.length === 3 || values.length === 4) {
              // Tokens Studio doesn’t support the "/" character … right?
              warnings.push(`Token "${tokenID}" is a multi value borderRadius token. Expanding into ${tokenID}TopLeft, ${tokenID}TopRight, ${tokenID}BottomRight, and ${tokenID}BottomLeft.`);
              let order = [values[0], values[1], values[0], values[1]] as [string, string, string, string]; // TL, BR
              if (values.length === 3) order = [values[0], values[1], values[2], values[1]] as [string, string, string, string]; // TL, TR/BL, BR
              else if (values.length === 4) order = [values[0], values[1], values[2], values[3]] as [string, string, string, string]; // TL, TR, BR, BL
              addToken({$type: 'dimension', $value: order[0]}, [...path, `${k}TopLeft`]);
              addToken({$type: 'dimension', $value: order[1]}, [...path, `${k}TopRight`]);
              addToken({$type: 'dimension', $value: order[2]}, [...path, `${k}BottomRight`]);
              addToken({$type: 'dimension', $value: order[3]}, [...path, `${k}BottomLeft`]);
            } else {
              // @ts-expect-error invalid value type; throw error
              addToken({$type: 'borderRadius', $value: v.value}, [...path, k]);
            }
            break;
          }
          case 'boxShadow': {
            // invalid token: surface error
            if (!v.value || typeof v.value !== 'object') {
              addToken({$type: 'shadow', $value: v.value}, [...path, k]);
              break;
            }
            addToken(
              {
                $type: 'shadow',
                $value: [
                  {
                    offsetX: v.value.x,
                    offsetY: v.value.y,
                    blur: v.value.blur,
                    spread: v.value.spread,
                    color: v.value.color,
                    inset: v.value.inset ?? false,
                    // type: ignore???
                  },
                ],
              },
              [...path, k],
            );
            break;
          }
          case 'color': {
            // …because gradient tokens share the same type why not :/
            if (v.value.includes('linear-gradient(')) {
              const stops: GradientStop[] = [];
              const [_, ...rawStops] = v.value.replace(')', '').split(',');
              for (const s of rawStops) {
                let [color, position] = s.trim().split(' ');

                // normalize color
                // why do aliases follow a different syntax here entirely :/
                if (color.includes('$')) color = `{${tokenSet}.${color.replace('$', '')}}`;

                // normalize position
                if (position.includes('%')) position = parseFloat(position) / 100;
                else if (typeof position === 'string' && position.length) position = parseFloat(position);

                stops.push({color, position});
              }
              addToken({$type: 'gradient', $value: stops}, [...path, k]);
              break;
            }
            addToken({$type: 'color', $value: v.value}, [...path, k]);
            break;
          }
          case 'fontFamilies': {
            addToken({$type: 'fontFamily', $value: v.value}, [...path, k]);
            break;
          }
          case 'borderWidth':
          case 'dimension':
          case 'fontSizes':
          case 'letterSpacing':
          case 'lineHeights':
          case 'opacity':
          case 'sizing': {
            // this is a number if this is unitless
            const isNumber = typeof v.value === 'number' || (typeof v.value === 'string' && String(Number(v.value)) === v.value);
            if (isNumber) {
              addToken({$type: 'number', $value: Number(v.value)}, [...path, k]);
            } else {
              addToken({$type: 'dimension', $value: v.value}, [...path, k]);
            }
            break;
          }
          case 'fontWeights': {
            addToken({$type: 'fontWeight', $value: parseInt(v.value, 10) || v.value}, [...path, k]);
            break;
          }
          case 'spacing': {
            // invalid token: surface error
            if (typeof v.value !== 'string') {
              // @ts-expect-error invalid value type; throw error
              addToken({$type: 'spacing', $value: v.value}, [...path, k]);
              break;
            }
            const values = (v.value as string)
              .split(' ')
              .map((s) => s.trim())
              .filter(Boolean);
            if (values.length === 1) {
              addToken({$type: 'dimension', $value: v.value.trim()}, [...path, k]);
            } else if (values.length === 2 || values.length === 3 || values.length === 4) {
              warnings.push(`Token "${tokenID}" is a multi value spacing token. Expanding into ${tokenID}Top, ${tokenID}Right, ${tokenID}Bottom, and ${tokenID}Left.`);
              let order: [string, string, string, string] = [values[0], values[1], values[0], values[1]] as [string, string, string, string]; // TB, RL
              if (values.length === 3) order = [values[0], values[1], values[2], values[1]] as [string, string, string, string]; // T, RL, B
              else if (values.length === 4) order = [values[0], values[1], values[2], values[3]] as [string, string, string, string]; // T, R, B, L
              addToken({$type: 'dimension', $value: order[0]}, [...path, `${k}Top`]);
              addToken({$type: 'dimension', $value: order[1]}, [...path, `${k}Right`]);
              addToken({$type: 'dimension', $value: order[2]}, [...path, `${k}Bottom`]);
              addToken({$type: 'dimension', $value: order[3]}, [...path, `${k}Left`]);
            } else {
              // @ts-expect-error invalid value type; throw error
              addToken({$type: 'spacing', $value: v.value}, [...path, k]);
            }
            break;
          }
          case 'textDecoration':
          case 'textCase': {
            // ignore; these either get used in "typography" token or silently skipped
            break;
          }
          case 'typography': {
            // fortunately, the Tokens Studio spec is inconsistent with their "typography" tokens
            // in that they match the W3C format (even though `fontFamilies` [sic] tokens exist)

            // unfortunately, `textCase` and `textDecoration` are special and have to be flattened
            if (!!v.value && typeof v.value === 'object') {
              for (const property of ['textCase', 'textDecoration']) {
                if (property in v.value && isAlias(v.value[property])) {
                  const aliasHistory = new Set<string>();
                  // attempt lookup; abandon if not
                  const firstLookup = getAliasID(v.value[property]).split('.');
                  let newValue = get(rawTokens, [...firstLookup, 'value']) ?? get(rawTokens, [tokenSet, ...firstLookup, 'value']);
                  if (typeof newValue === 'string') aliasHistory.add(newValue);
                  // note: check for circular refs, just in case Token Studio doesn’t handle that
                  while (typeof newValue === 'string' && isAlias(newValue)) {
                    const nextLookup = getAliasID(newValue).split('.');
                    newValue = get(rawTokens, [...nextLookup, 'value']) ?? get(rawTokens, [tokenSet, ...nextLookup, 'value']);
                    if (typeof newValue === 'string' && aliasHistory.has(newValue)) {
                      errors.push(`Alias "${v.value[property]}" is a circular reference`);
                      newValue = undefined;
                      break;
                    }
                    if (typeof newValue === 'string') aliasHistory.add(newValue);
                  }
                  // lookup successful! save
                  if (newValue) v.value[property] = newValue;
                  // lookup failed; remove
                  else delete v.value[property];
                }
              }
            }

            addToken({$type: 'typography', $value: v.value}, [...path, k]);
            break;
          }
        }
        continue;
      }

      // group
      walk(v, [...path, k]);
    }
  }
  walk(rawTokens, []);

  return {
    errors: errors.length ? errors : undefined,
    warnings: warnings.length ? warnings : undefined,
    result: w3cTokens,
  };
}

export function isTokensStudioFormat(rawTokens: unknown): boolean {
  return !!rawTokens && typeof rawTokens === 'object' && '$themes' in rawTokens && Array.isArray(rawTokens.$themes) && '$metadata' in rawTokens && typeof rawTokens.$metadata === 'object';
}

function get(obj: Record<string, unknown>, path: string[]): unknown | undefined {
  let node = obj;
  for (const p of path) {
    if (!node || typeof node !== 'object' || !(p in node)) break;
    node = node[p] as any;
  }
  return node;
}

/**
 * Handle format for Tokens Studio for Figma
 * This works by first converting the Tokens Studio format
 * into an equivalent DTCG result, then parsing that result
 */
import { parseAlias } from '@cobalt-ui/utils';
import type { GradientStop, Group, Token } from '../token.js';

// I’m not sure this is comprehensive at all but better than nothing
const FONT_WEIGHTS: Record<string, number> = {
  thin: 100,
  hairline: 100,
  'extra-light': 200,
  extralight: 200,
  'extra light': 200,
  'ultra-light': 200,
  ultralight: 200,
  'ultra light': 200,
  light: 300,
  normal: 400,
  regular: 400,
  book: 400,
  medium: 500,
  'semi bold': 600,
  semibold: 600,
  'semi-bold': 600,
  'demi bold': 600,
  'demi-bold': 600,
  demibold: 600,
  bold: 700,
  'extra bold': 800,
  'extra-bold': 800,
  extrabold: 800,
  black: 900,
  heavy: 900,
  'extra black': 950,
  'extra-black': 950,
  extrablack: 950,
  'ultra black': 950,
  ultrablack: 950,
  'ultra-black': 950,
};

const ALIAS_RE = /{[^}]+}/g;

export interface TSTokenBase {
  description?: string;
}

export interface TSBorderToken extends TSTokenBase {
  type: 'border';
  value: {
    color?: TSColorToken['value'];
    width?: string;
    style?: string;
  };
}

export interface TSBorderRadiusToken extends TSTokenBase {
  type: 'borderRadius';
  value: string;
}

export interface TSBorderWidthToken extends TSTokenBase {
  type: 'borderWidth';
  value: string;
}

export interface TSBoxShadowToken extends TSTokenBase {
  type: 'boxShadow';
  value: {
    x: string;
    y: string;
    blur: string;
    spread: string;
    color?: TSColorToken['value'];
    inset?: boolean;
  };
}

export interface TSColorToken extends TSTokenBase {
  type: 'color';
  value: string;
}

export interface TSDimensionToken extends TSTokenBase {
  type: 'dimension';
  value: string;
}

export interface TSFontFamiliesToken extends TSTokenBase {
  type: 'fontFamilies';
  value: string[];
}

export interface TSFontSizesToken extends TSTokenBase {
  type: 'fontSizes';
  value: number | string;
}

export interface TSFontWeightsToken extends TSTokenBase {
  type: 'fontWeights';
  value: number | string;
}

export interface TSLetterSpacingToken extends TSTokenBase {
  type: 'letterSpacing';
  value: number | string;
}

export interface TSLineHeightsToken extends TSTokenBase {
  type: 'lineHeights';
  value: number | string;
}

export interface TSOpacityToken extends TSTokenBase {
  type: 'opacity';
  value: number | string;
}

export interface TSParagraphSpacingToken extends TSTokenBase {
  type: 'paragraphSpacing';
  value: string;
}

export interface TSSizingToken extends TSTokenBase {
  type: 'sizing';
  value: string;
}

export interface TSSpacingToken extends TSTokenBase {
  type: 'spacing';
  value: string;
}

export interface TSTextCaseToken extends TSTokenBase {
  type: 'textCase';
  value: number;
}

export interface TSTextDecorationToken extends TSTokenBase {
  type: 'textDecoration';
  value: number;
}

export interface TSTypographyToken extends TSTokenBase {
  type: 'typography';
  value: Record<string, string | number>;
}

export type TSToken =
  | TSBorderToken
  | TSBorderRadiusToken
  | TSBorderWidthToken
  | TSBoxShadowToken
  | TSColorToken
  | TSDimensionToken
  | TSFontFamiliesToken
  | TSFontSizesToken
  | TSFontWeightsToken
  | TSLetterSpacingToken
  | TSLineHeightsToken
  | TSOpacityToken
  | TSParagraphSpacingToken
  | TSSizingToken
  | TSSpacingToken
  | TSTextCaseToken
  | TSTextDecorationToken
  | TSTypographyToken;

export function convertTokensStudioFormat(rawTokens: Record<string, unknown>): { errors?: string[]; warnings?: string[]; result: Group } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const dtcgTokens: Group = {};

  function addToken(value: Token, path: string[]): void {
    const parts = [...path];
    const id = parts.pop()!;
    let tokenNode = dtcgTokens;
    for (const p of parts) {
      if (!(p in tokenNode)) {
        tokenNode[p] = {};
      }
      tokenNode = tokenNode[p] as Group;
    }
    // hack: remove empty descriptions
    if (value.$description === undefined) {
      delete value.$description;
    }
    tokenNode[id] = value;
  }

  function resolveAlias(alias: unknown, path: string[]): string | undefined {
    if (typeof alias !== 'string' || !alias.includes('{')) {
      return;
    }
    const matches = alias.match(ALIAS_RE);
    if (!matches) {
      return;
    }

    let resolved = alias;
    matchLoop: for (const match of matches) {
      const { id } = parseAlias(match);
      const tokenAliasPath = id.split('.');

      if (get(rawTokens, tokenAliasPath)) {
        continue; // this is complete and correct
      }

      // if this alias is missing its top-level namespace, try and resolve it
      const namespaces = Object.keys(rawTokens);
      namespaces.sort((a, b) => (a === path[0] ? -1 : b === path[0] ? 1 : 0));
      for (const namespace of namespaces) {
        if (get(rawTokens, [namespace, ...tokenAliasPath])) {
          resolved = resolved.replace(match, `{${namespace}.${id}}`);
          continue matchLoop;
        }
      }
      errors.push(`Could not resolve alias "${match}"`);
    }
    return resolved;
  }

  function walk(node: unknown, path: string[]): void {
    if (!node || typeof node !== 'object') {
      return;
    }
    for (const k in node) {
      const tokenPath = [...path, k];
      const tokenID = tokenPath.join('.');
      const v = (node as Record<string, unknown>)[k] as TSToken;

      if (!v || typeof v !== 'object') {
        continue;
      }

      // skip metatadata (e.g. "$themes" or "$metadata")
      if (k.startsWith('$')) {
        continue;
      }

      // resolve aliases (Tokens Studio’s top-level namespaces may or may not be discarded)
      const alias = resolveAlias(v.value, path);
      if (alias) {
        v.value = alias;
      }

      // transform core types
      switch (v.type) {
        case 'border': {
          addToken(
            {
              $type: 'border',
              $value: v.value,
              $description: v.description,
            },
            tokenPath,
          );
          break;
        }
        case 'borderRadius': {
          if (typeof v.value !== 'string') {
            addToken(
              {
                // @ts-expect-error invalid token: surface error
                $type: 'borderRadius',
                $value: v.value,
                $description: v.description,
              },
              [...path, tokenID],
            );
            break;
          }
          const values = (v.value as string)
            .split(' ')
            .map((s) => resolveAlias(s, path) || s)
            .filter(Boolean);
          if (values.length === 1) {
            addToken({ $type: 'dimension', $value: v.value.trim(), $description: v.description }, tokenPath);
          } else if (values.length === 2 || values.length === 3 || values.length === 4) {
            // Tokens Studio doesn’t support the "/" character … right?
            warnings.push(
              `Token "${tokenID}" is a multi value borderRadius token. Expanding into ${tokenID}TopLeft, ${tokenID}TopRight, ${tokenID}BottomRight, and ${tokenID}BottomLeft.`,
            );
            let order = [values[0], values[1], values[0], values[1]] as [string, string, string, string]; // TL, BR
            if (values.length === 3)
              order = [values[0], values[1], values[2], values[1]] as [string, string, string, string]; // TL, TR/BL, BR
            else if (values.length === 4) order = [values[0], values[1], values[2], values[3]] as [string, string, string, string]; // TL, TR, BR, BL
            addToken({ $type: 'dimension', $value: order[0], $description: v.description }, [...path, `${k}TopLeft`]);
            addToken({ $type: 'dimension', $value: order[1], $description: v.description }, [...path, `${k}TopRight`]);
            addToken({ $type: 'dimension', $value: order[2], $description: v.description }, [...path, `${k}BottomRight`]);
            addToken({ $type: 'dimension', $value: order[3], $description: v.description }, [...path, `${k}BottomLeft`]);
          } else {
            addToken(
              {
                // @ts-expect-error invalid value type; throw error
                $type: 'borderRadius',
                $value: v.value,
                $description: v.description,
              },
              tokenPath,
            );
          }
          break;
        }
        case 'boxShadow': {
          // invalid token: surface error
          if (!v.value || typeof v.value !== 'object') {
            addToken(
              {
                $type: 'shadow',
                $value: v.value,
                $description: v.description,
              },
              tokenPath,
            );
            break;
          }
          addToken(
            {
              $type: 'shadow',
              $value: [
                {
                  offsetX: v.value.x ?? 0,
                  offsetY: v.value.y ?? 0,
                  blur: v.value.blur ?? 0,
                  spread: v.value.spread ?? 0,
                  color: v.value.color ?? '#000000',
                  inset: v.value.inset ?? false,
                  // type: ignore???
                },
              ],
              $description: v.description,
            },
            tokenPath,
          );
          break;
        }
        case 'color': {
          // …because gradient tokens share the same type why not :/
          if (v.value.includes('linear-gradient(')) {
            const stops: GradientStop[] = [];
            const [_, ...rawStops] = v.value.replace(')', '').split(',');
            for (const s of rawStops) {
              let [colorRaw = '', positionRaw = ''] = s.trim().split(' ');
              let color = colorRaw;
              if (color.startsWith('$')) {
                color = `{${color.replace('$', '')}}`;
              }
              color = resolveAlias(color, path) || color;
              let position: string | number = positionRaw;
              if (positionRaw.includes('%')) {
                position = parseFloat(positionRaw) / 100;
              }
              position = resolveAlias(position, path) || position;
              stops.push({ color, position: position as number });
            }
            addToken(
              {
                $type: 'gradient',
                $value: stops,
                $description: v.description,
              },
              tokenPath,
            );
          } else {
            addToken(
              {
                $type: 'color',
                $value: v.value,
                $description: v.description,
              },
              tokenPath,
            );
          }
          break;
        }
        case 'fontFamilies': {
          addToken(
            {
              $type: 'fontFamily',
              $value: v.value,
              $description: v.description,
            },
            tokenPath,
          );
          break;
        }
        case 'borderWidth':
        case 'dimension':
        case 'fontSizes':
        case 'letterSpacing':
        case 'lineHeights':
        case 'opacity':
        case 'paragraphSpacing':
        case 'sizing': {
          const maybeNumber = parseFloat(String(v.value));
          const isNumber = typeof v.value === 'number' || String(maybeNumber) === String(v.value);
          addToken(
            {
              $type: isNumber ? 'number' : 'dimension',
              $value: (isNumber ? maybeNumber : v.value) as any,
              $description: v.description,
            },
            tokenPath,
          );
          break;
        }
        case 'fontWeights': {
          addToken(
            {
              $type: 'fontWeight',
              $value: (FONT_WEIGHTS[String(v.value).toLowerCase()] || parseInt(String(v.value), 10) || v.value) as number,
              $description: v.description,
            },
            tokenPath,
          );
          break;
        }
        case 'spacing': {
          // invalid token: surface error
          if (typeof v.value !== 'string' || alias) {
            addToken(
              {
                // @ts-expect-error invalid value type; throw error
                $type: 'spacing',
                $value: v.value,
                $description: v.description,
              },
              tokenPath,
            );
            break;
          }
          const values = (v.value as string)
            .split(' ')
            .map((s) => resolveAlias(s, path) || s)
            .filter(Boolean);
          if (values.length === 1) {
            addToken({ $type: 'dimension', $value: v.value, $description: v.description }, tokenPath);
          } else if (values.length === 2 || values.length === 3 || values.length === 4) {
            warnings.push(`Token "${tokenID}" is a multi value spacing token. Expanding into ${tokenID}Top, ${tokenID}Right, ${tokenID}Bottom, and ${tokenID}Left.`);
            let order: [string, string, string, string] = [values[0], values[1], values[0], values[1]] as [string, string, string, string]; // TB, RL
            if (values.length === 3)
              order = [values[0], values[1], values[2], values[1]] as [string, string, string, string]; // T, RL, B
            else if (values.length === 4) order = [values[0], values[1], values[2], values[3]] as [string, string, string, string]; // T, R, B, L
            addToken({ $type: 'dimension', $value: order[0], $description: v.description }, [...path, `${k}Top`]);
            addToken({ $type: 'dimension', $value: order[1], $description: v.description }, [...path, `${k}Right`]);
            addToken({ $type: 'dimension', $value: order[2], $description: v.description }, [...path, `${k}Bottom`]);
            addToken({ $type: 'dimension', $value: order[3], $description: v.description }, [...path, `${k}Left`]);
          } else {
            addToken(
              {
                // @ts-expect-error invalid value type; throw error
                $type: 'spacing',
                $value: v.value,
                $description: v.description,
              },
              tokenPath,
            );
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
          // in that they match DTCG (even though `fontFamilies` [sic] tokens exist)
          if (v.value && typeof v.value === 'object') {
            for (const property in v.value) {
              const propertyAlias = resolveAlias(v.value[property], path);
              if (propertyAlias) {
                // TODO: remove this once string tokens are supported
                if (property === 'textCase' || property === 'textDecoration') {
                  let currentAlias = propertyAlias;
                  const aliasHistory = new Set<string>([v.value[property] as string, propertyAlias]);
                  let finalValue: string | undefined;
                  while (!finalValue) {
                    const propertyPath = parseAlias(currentAlias).id.split('.');
                    const maybeToken = get(rawTokens, propertyPath);
                    if (!maybeToken || typeof maybeToken !== 'object' || !(maybeToken as TSToken).value) {
                      errors.push(`Couldn’t find ${currentAlias}`);
                      break;
                    }
                    const nextAlias = resolveAlias((maybeToken as TSToken).value, propertyPath);
                    if (!nextAlias) {
                      finalValue = (maybeToken as any).value;
                      break;
                    }
                    if (aliasHistory.has(nextAlias)) {
                      errors.push(`Circular alias ${propertyAlias} can’t be resolved`);
                      break;
                    }
                    currentAlias = nextAlias;
                    aliasHistory.add(currentAlias);
                  }
                  if (finalValue) {
                    v.value[property] = finalValue; // resolution worked
                  } else {
                    delete v.value[property]; // give up
                  }
                } else {
                  v.value[property] = propertyAlias; // otherwise, resolve
                }
              } else {
                if (property === 'fontWeights') {
                  v.value[property] = FONT_WEIGHTS[String(v.value[property]).toLowerCase()] || (v.value[property] as string);
                }
                const maybeNumber = parseFloat(String(v.value[property]));
                if (String(maybeNumber) === v.value[property]) {
                  v.value[property] = maybeNumber;
                }
              }
            }
          }
          addToken(
            {
              $type: 'typography',
              $value: v.value,
              $description: v.description,
            },
            tokenPath,
          );
          break;
        }
      }

      // group
      walk(v, tokenPath);
    }
  }
  walk(rawTokens, []);

  return {
    errors: errors.length ? errors : undefined,
    warnings: warnings.length ? warnings : undefined,
    result: dtcgTokens,
  };
}

export function isTokensStudioFormat(rawTokens: unknown): boolean {
  return (
    !!rawTokens &&
    typeof rawTokens === 'object' &&
    '$themes' in rawTokens &&
    Array.isArray(rawTokens.$themes) &&
    '$metadata' in rawTokens &&
    typeof rawTokens.$metadata === 'object'
  );
}

function get(obj: Record<string, unknown>, path: string[]): unknown | undefined {
  let node = obj;
  for (const p of path) {
    if (!node || typeof node !== 'object' || !(p in node)) {
      return undefined;
    }
    node = node[p] as any;
  }
  return node;
}

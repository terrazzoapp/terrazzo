import type * as momoa from '@humanwhocodes/momoa';
import { getObjMember } from '@terrazzo/json-schema-tools';
import { FONT_WEIGHTS, isAlias, parseColor } from '@terrazzo/token-tools';
import type Logger from '../logger.js';

interface PreValidatedToken {
  id: string;
  $type: string;
  $value: unknown;
  mode: Record<string, { $value: unknown; source: { node: any; filename: string | undefined } }>;
}

/**
 * Normalize token value.
 * The reason for the “any” typing is this aligns various user-provided inputs to the type
 */
export function normalize(token: PreValidatedToken, { logger, src }: { logger: Logger; src: string }) {
  const entry = { group: 'parser' as const, label: 'init', src };

  function normalizeFontFamily(value: unknown): string[] {
    return typeof value === 'string' ? [value] : (value as string[]);
  }

  function normalizeFontWeight(value: unknown): number {
    return (typeof value === 'string' && FONT_WEIGHTS[value as keyof typeof FONT_WEIGHTS]) || (value as number);
  }

  function normalizeColor(value: unknown, node: momoa.AnyNode | undefined) {
    if (typeof value === 'string' && !isAlias(value)) {
      logger.warn({
        ...entry,
        node,
        message: `${token.id}: string colors will be deprecated in a future version. Please update to object notation`,
      });
      try {
        return parseColor(value);
      } catch {
        return { colorSpace: 'srgb', components: [0, 0, 0], alpha: 1 };
      }
    } else if (value && typeof value === 'object') {
      if ((value as any).alpha === undefined) {
        (value as any).alpha = 1;
      }
    }
    return value;
  }

  switch (token.$type) {
    case 'color': {
      for (const mode of Object.keys(token.mode)) {
        token.mode[mode]!.$value = normalizeColor(token.mode[mode]!.$value, token.mode[mode]!.source.node);
      }
      token.$value = token.mode['.']!.$value;
      break;
    }

    case 'fontFamily': {
      for (const mode of Object.keys(token.mode)) {
        token.mode[mode]!.$value = normalizeFontFamily(token.mode[mode]!.$value);
      }
      token.$value = token.mode['.']!.$value;
      break;
    }

    case 'fontWeight': {
      for (const mode of Object.keys(token.mode)) {
        token.mode[mode]!.$value = normalizeFontWeight(token.mode[mode]!.$value);
      }
      token.$value = token.mode['.']!.$value;
      break;
    }

    case 'border': {
      for (const mode of Object.keys(token.mode)) {
        const border = token.mode[mode]!.$value as any;
        if (!border || typeof border !== 'object') {
          continue;
        }
        if (border.color) {
          border.color = normalizeColor(
            border.color,
            getObjMember(token.mode[mode]!.source.node as momoa.ObjectNode, 'color'),
          );
        }
      }
      token.$value = token.mode['.']!.$value;
      break;
    }

    case 'shadow': {
      for (const mode of Object.keys(token.mode)) {
        // normalize to array
        if (!Array.isArray(token.mode[mode]!.$value)) {
          token.mode[mode]!.$value = [token.mode[mode]!.$value];
        }
        const $value = token.mode[mode]!.$value as any[];
        for (let i = 0; i < $value.length; i++) {
          const shadow = $value[i]!;
          if (!shadow || typeof shadow !== 'object') {
            continue;
          }
          const shadowNode = (
            token.mode[mode]!.source.node.type === 'Array'
              ? token.mode[mode]!.source.node.elements[i]!.value
              : token.mode[mode]!.source.node
          ) as momoa.ObjectNode;
          if (shadow.color) {
            shadow.color = normalizeColor(shadow.color, getObjMember(shadowNode, 'color'));
          }
          if (!('inset' in shadow)) {
            shadow.inset = false;
          }
        }
      }
      token.$value = token.mode['.']!.$value;
      break;
    }

    case 'gradient': {
      for (const mode of Object.keys(token.mode)) {
        if (!Array.isArray(token.mode[mode]!.$value)) {
          continue;
        }
        const $value = token.mode[mode]!.$value as any[];
        for (let i = 0; i < $value.length; i++) {
          const stop = $value[i]!;
          if (!stop || typeof stop !== 'object') {
            continue;
          }
          const stopNode = (token.mode[mode]!.source.node as momoa.ArrayNode)?.elements?.[i]?.value as momoa.ObjectNode;
          if (stop.color) {
            stop.color = normalizeColor(stop.color, getObjMember(stopNode, 'color'));
          }
        }
      }
      token.$value = token.mode['.']!.$value;
      break;
    }

    case 'typography': {
      for (const mode of Object.keys(token.mode)) {
        const $value = token.mode[mode]!.$value as any;
        if (typeof $value !== 'object') {
          return;
        }
        for (const [k, v] of Object.entries($value)) {
          switch (k) {
            case 'fontFamily': {
              $value[k] = normalizeFontFamily(v);
              break;
            }
            case 'fontWeight': {
              $value[k] = normalizeFontWeight(v);
              break;
            }
          }
        }
      }
      token.$value = token.mode['.']!.$value;
      break;
    }
  }
}

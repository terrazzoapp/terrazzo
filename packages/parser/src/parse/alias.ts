import type { AnyNode, ObjectNode } from '@humanwhocodes/momoa';
import {
  type BorderTokenNormalized,
  GradientTokenNormalized,
  type TokenNormalized,
  type TokenNormalizedSet,
  type TransitionTokenNormalized,
  type TypographyTokenNormalized,
  isAlias,
  parseAlias,
} from '@terrazzo/token-tools';
import type Logger from '../logger.js';

export interface ApplyAliasOptions {
  tokensSet: TokenNormalizedSet;
  filename: URL;
  src: string;
  node: ObjectNode;
  logger: Logger;
}

export type PreAliased<T extends TokenNormalized> = {
  $value: T['$value'] | string;
  mode: Record<string, T['mode'][string] & { $value: T['$value'] | string }>;
};

/**
 * Resolve aliases and update the token nodes.
 *
 * Data structures are in an awkward in-between phase, where they have
 * placeholders for data but we still need to resolve everything. As such,
 * TypeScript will raise errors expecting the final shape.
 *
 * This is also a bit tricky because different token types alias slightly
 * differently. For example, color tokens and other “primitive” tokens behave
 * as-expected. But composite tokens like Typography, Gradient, Border, etc. can
 * either fully- or partially-alias their values. Then we add modes to the mix,
 * and we have to do the work all over again for each mode declared.
 *
 * All that to say, there are a generous amount of TypeScript overrides here rather
 * than try to codify indeterminate shapes.
 */
export default function applyAliases(token: TokenNormalized, options: ApplyAliasOptions): void {
  // prepopulate default mode (if not set)
  token.mode['.'] ??= {} as any;
  token.mode['.'].$value ??= token.$value;
  token.mode['.'].originalValue ??= token.originalValue.$value;
  token.mode['.'].source ??= token.source;

  // resolve root
  if (typeof token.$value === 'string' && isAlias(token.$value)) {
    applyAlias(token, options);
  }

  // resolve modes
  for (const mode of Object.keys(token.mode)) {
    const modeValue = token.mode[mode]!.$value;

    // if the entire mode value is a simple alias, resolve & continue
    if (typeof modeValue === 'string' && isAlias(modeValue)) {
      applyAlias(token, { expectedType: token.$type, ...options });
      continue;
    }

    // if the mode is an object or array that’s partially aliased, do work per-token type
    switch (token.$type) {
      case 'border': {
        // object type: allow modes to only partially override the default
        token.mode[mode]!.$value = { ...token.$value, ...token.mode[mode]!.$value };
        applyBorderPartialAlias(token, mode, options);
        break;
      }
      case 'gradient': {
        applyGradientPartialAlias(token, mode, options);
        break;
      }
      case 'shadow': {
        applyArrayPartialAlias(token, mode, options);
        break;
      }
      case 'strokeStyle': {
        applyStrokeStylePartialAlias(token, mode, options);
        break;
      }
      case 'transition': {
        // object type: allow modes to only partially override the default
        token.mode[mode]!.$value = { ...token.$value, ...token.mode[mode]!.$value };
        applyTransitionPartialAlias(token, mode, options);
        break;
      }
      case 'typography': {
        // object type: allow modes to only partially override the default
        token.mode[mode]!.$value = { ...token.$value, ...token.mode[mode]!.$value };
        applyTypographyPartialAlias(token, mode, options);
        break;
      }
    }
  }
}

/**
 * Resolve alias
 * Note: to save work during resolution (and reduce memory), this will inject
 * `aliasedBy` while it traverses. Resolution isn’t normally associated with
 * mutation, but for our usecase it is preferable.
 */
export function resolveAlias(
  alias: string,
  options: {
    tokensSet: Record<string, TokenNormalized>;
    logger: Logger;
    filename?: URL;
    src: string;
    node: AnyNode;
    scanned?: string[];
  },
): { id: string; chain: string[] } {
  const { scanned = [], logger, filename, src, node, tokensSet } = options;
  const baseMessage = { group: 'parser' as const, label: 'alias', filename, src, node };
  const id = parseAlias(alias);

  if (!tokensSet[id]) {
    logger.error({ ...baseMessage, message: `Alias "${alias}" not found.` });
  }
  if (scanned.includes(id)) {
    logger.error({ ...baseMessage, message: `Circular alias detected from "${alias}".` });
  }

  const token = tokensSet[id]!;
  scanned.push(id);

  // important: use originalValue to trace the full alias path correctly
  // finish resolution
  if (typeof token.originalValue.$value !== 'string' || !isAlias(token.originalValue.$value)) {
    return { id, chain: scanned };
  }

  // continue resolving
  return resolveAlias(token.originalValue.$value as string, options);
}

type TokenOrModeValue = {
  $value: any;
  $type?: string;
  source?: TokenNormalized['source'];
  aliasOf?: string;
  aliasChain?: string[];
  aliasedBy?: string[];
};

/**
 * Applies alias to any primitive tokens, or modes that replace the value altogether.
 */
function applyAlias(node: TokenOrModeValue, options: { expectedType?: string } & ApplyAliasOptions): void {
  if (typeof node.$value !== 'string' || !isAlias(node.$value)) {
    return;
  }
  const baseMessage = {
    group: 'parser' as const,
    label: 'alias',
    node: node.source?.node ?? options?.node,
    filename: options.filename,
    src: options.src,
  };
  const { tokensSet, logger, expectedType = node.$type } = options;
  const shallowAliasID = parseAlias(node.$value);
  const { id: deepAliasID, chain } = resolveAlias(shallowAliasID, options);
  const resolvedToken = tokensSet[deepAliasID] as TokenNormalized | undefined;

  if (!tokensSet[deepAliasID]) {
    logger.error({ ...baseMessage, message: `Couldn’t resolve alias ${node.$value}` });
  }

  // populate $type, if missing
  if ('id' in node && !node.$type) {
    node.$type = resolvedToken!.$type;
  }

  // throw error if expectedType differed
  if (expectedType && resolvedToken!.$type !== expectedType) {
    logger.error({ ...baseMessage, message: `Expected  ${node.$type}, received ${resolvedToken!.$type}` });
  }

  // update $value
  node.$value = resolvedToken!.$value;

  // apply alias metadata
  node.aliasOf = deepAliasID;
  if (chain) {
    node.aliasChain = chain;
  }

  // apply reverse alias
  if ('id' in node && chain?.length) {
    if (!node.aliasedBy) {
      node.aliasedBy = [];
    }
    for (const id of chain!) {
      if (id === node.id) {
        continue;
      }
      if (!node.aliasedBy!.includes(id)) {
        node.aliasedBy!.push(id);
      }
    }
  }
}

function applyBorderPartialAlias(token: BorderTokenNormalized, mode: string, options: ApplyAliasOptions): void {
  for (const [k, v] of Object.entries(token.mode[mode]!.$value)) {
    if (typeof v === 'string' && isAlias(v)) {
      token.partialAliasOf ??= {};
      (token.partialAliasOf as any)[k] = parseAlias(v);
      applyAlias((token.mode[mode] as any).$value[k], {
        expectedType: { color: 'color', width: 'dimension', style: 'strokeStyle' }[k],
        ...options,
      });
    }
  }
}

function applyGradientPartialAlias(token: GradientTokenNormalized, mode: string, options: ApplyAliasOptions): void {
  for (let i = 0; i < token.mode[mode]!.$value.length; i++) {
    const step = token.mode[mode]!.$value[i]!;
    if (typeof step.color === 'string' && isAlias(step.color)) {
      token.partialAliasOf ??= [];
      (token.partialAliasOf as any)[i] ??= {};
      token.partialAliasOf[i]!.color = parseAlias(step.color);
    }
  }
}

function applyTransitionPartialAlias(token: TransitionTokenNormalized, mode: string, options: ApplyAliasOptions): void {
  for (const [k, v] of Object.entries(token.mode[mode]!.$value)) {
    if (typeof v === 'string' && isAlias(v)) {
      token.partialAliasOf ??= {};
      (token.partialAliasOf as any)[k] = parseAlias(v);
      applyAlias((token.mode[mode] as any).$value[k], {
        expectedType: { duration: 'duration', delay: 'duration', timingFunction: 'cubicBezier' }[k],
        ...options,
      });
    }
  }
}

function applyTypographyPartialAlias(token: TypographyTokenNormalized, mode: string, options: ApplyAliasOptions): void {
  for (const [k, v] of Object.entries(token.mode[mode]!.$value)) {
    if (typeof v === 'string' && isAlias(v)) {
      token.partialAliasOf ??= {};
      (token.partialAliasOf as any)[k] = parseAlias(v);
      applyAlias((token.mode[mode] as any).$value[k], {
        expectedType:
          {
            fontFamily: 'fontFamily',
            fontWeight: 'fontWeight',
            letterSpacing: 'dimension',
            lineHeight: 'dimension',
          }[k] || 'string',
        ...options,
      });
    }
  }
}

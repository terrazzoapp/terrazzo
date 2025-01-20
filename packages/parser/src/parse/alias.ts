import type { AnyNode, ArrayNode, ObjectNode } from '@humanwhocodes/momoa';
import {
  type BorderTokenNormalized,
  type GradientTokenNormalized,
  type ShadowTokenNormalized,
  type StrokeStyleTokenNormalized,
  type TokenNormalized,
  type TokenNormalizedSet,
  type TransitionTokenNormalized,
  type TypographyTokenNormalized,
  isAlias,
  parseAlias,
} from '@terrazzo/token-tools';
import type Logger from '../logger.js';
import { getObjMembers } from './json.js';

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
  token.mode['.'].$value = token.$value;
  token.mode['.'].originalValue ??= token.originalValue.$value;
  token.mode['.'].source ??= token.source;

  // resolve root
  if (typeof token.$value === 'string' && isAlias(token.$value)) {
    const { aliasChain, resolvedToken } = resolveAlias(token, token.$value, options);
    token.aliasOf = resolvedToken.id;
    token.aliasChain = aliasChain;
    (token as any).$value = resolvedToken.$value;
  }

  // resolve modes
  for (const mode of Object.keys(token.mode)) {
    const modeValue = token.mode[mode]!.$value;

    // if the entire mode value is a simple alias, resolve & continue
    if (typeof modeValue === 'string' && isAlias(modeValue)) {
      const expectedType = [token.$type];
      const { aliasChain, resolvedToken } = resolveAlias(token.mode[mode]!, modeValue, {
        ...options,
        expectedType,
        node: token.mode[mode]!.source?.node || options.node,
      });
      token.mode[mode]!.aliasOf = resolvedToken.id;
      token.mode[mode]!.aliasChain = aliasChain;
      (token.mode[mode] as any).$value = resolvedToken.$value;
      continue;
    }

    // object types: expand default $value into current mode
    if (
      typeof token.$value === 'object' &&
      typeof token.mode[mode]!.$value === 'object' &&
      !Array.isArray(token.$value)
    ) {
      for (const [k, v] of Object.entries(token.$value)) {
        if (!(k in token.mode[mode]!.$value)) {
          (token.mode[mode]!.$value as any)[k] = v;
        }
      }
    }

    // if the mode is an object or array that’s partially aliased, do work per-token type
    const node = (getObjMembers(options.node).$value as any) || options.node;
    switch (token.$type) {
      case 'border': {
        applyBorderPartialAlias(token, mode, { ...options, node });
        break;
      }
      case 'gradient': {
        applyGradientPartialAlias(token, mode, { ...options, node });
        break;
      }
      case 'shadow': {
        applyShadowPartialAlias(token, mode, { ...options, node });
        break;
      }
      case 'strokeStyle': {
        applyStrokeStylePartialAlias(token, mode, { ...options, node });
        break;
      }
      case 'transition': {
        applyTransitionPartialAlias(token, mode, { ...options, node });
        break;
      }
      case 'typography': {
        applyTypographyPartialAlias(token, mode, { ...options, node });
        break;
      }
    }
  }
}

type TokenOrModeValue = {
  $value: any;
  $type?: string;
  source?: TokenNormalized['source'];
  aliasOf?: string;
  aliasChain?: string[];
  aliasedBy?: string[];
};

const LIST_FORMAT = new Intl.ListFormat('en-us', { type: 'disjunction' });

/**
 * Resolve alias. Also add info on root node if it’s the root token (has .id)
 */
function resolveAlias(node: TokenOrModeValue, alias: string, options: { expectedType?: string[] } & ApplyAliasOptions) {
  const baseMessage = {
    group: 'parser' as const,
    label: 'alias',
    node: node.source?.node ?? options?.node,
    filename: options.filename,
    src: options.src,
  };
  const { logger } = options;
  const shallowAliasID = parseAlias(alias);
  const { token: resolvedToken, chain } = _resolveAliasInner(shallowAliasID, options);

  // Note: we are “cheating” here and mutating the root node only if it’s the
  // root token While this isn’t great, the alternative is more work—passing it
  // back to the consumer and making it determine where/how to apply this data.
  if ('id' in node && !node.$type) {
    node.$type = resolvedToken!.$type;
  }

  // throw error if expectedType differed
  const expectedType = [...(options.expectedType ?? [])];
  if (node.$type && !expectedType?.length) {
    expectedType.push(node.$type);
  }
  if (expectedType?.length && !expectedType.includes(resolvedToken!.$type)) {
    logger.error({
      ...baseMessage,
      message: `Invalid alias: expected $type: ${LIST_FORMAT.format(expectedType!)}, received $type: ${resolvedToken!.$type}.`,
      node: (node.source?.node?.type === 'Object' && getObjMembers(node.source.node).$value) || baseMessage.node,
    });
  }

  // Cheat #2: apply reverse alias
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

  return { resolvedToken: resolvedToken!, aliasChain: chain };
}

function _resolveAliasInner(
  alias: string,
  {
    scanned = [],
    ...options
  }: {
    tokensSet: Record<string, TokenNormalized>;
    logger: Logger;
    filename?: URL;
    src: string;
    node: AnyNode;
    scanned?: string[];
  },
): { token: TokenNormalized; chain: string[] } {
  const { logger, filename, src, node, tokensSet } = options;
  const baseMessage = { group: 'parser' as const, label: 'alias', filename, src, node };
  const id = parseAlias(alias);
  if (!tokensSet[id]) {
    logger.error({ ...baseMessage, message: `Alias {${alias}} not found.` });
  }
  if (scanned.includes(id)) {
    logger.error({ ...baseMessage, message: `Circular alias detected from ${alias}.` });
  }

  const token = tokensSet[id]!;
  scanned.push(id);

  // important: use originalValue to trace the full alias path correctly
  // finish resolution
  if (typeof token.originalValue.$value !== 'string' || !isAlias(token.originalValue.$value)) {
    return { token, chain: scanned };
  }

  // continue resolving
  return _resolveAliasInner(token.originalValue.$value as string, { ...options, scanned });
}

function applyBorderPartialAlias(token: BorderTokenNormalized, mode: string, options: ApplyAliasOptions): void {
  for (const [k, v] of Object.entries(token.mode[mode]!.$value)) {
    if (typeof v === 'string' && isAlias(v)) {
      token.partialAliasOf ??= {};
      const node = (getObjMembers(options.node)[k] as any) || options.node;
      const { resolvedToken } = resolveAlias(token.mode[mode]!, v, {
        ...options,
        expectedType: { color: ['color'], width: ['dimension'], style: ['strokeStyle'] }[k],
        node,
      });
      (token.partialAliasOf as any)[k] = resolvedToken.id;
      (token.mode[mode]!.$value as any)[k] = resolvedToken.$value;
    }
  }
}

function applyGradientPartialAlias(token: GradientTokenNormalized, mode: string, options: ApplyAliasOptions): void {
  for (let i = 0; i < token.mode[mode]!.$value.length; i++) {
    const step = token.mode[mode]!.$value[i]!;
    for (const [k, v] of Object.entries(step)) {
      if (typeof v === 'string' && isAlias(v)) {
        token.partialAliasOf ??= [];
        (token.partialAliasOf as any)[i] ??= {};
        const expectedType = { color: ['color'], position: ['number'] }[k];
        let node = ((options.node as unknown as ArrayNode | undefined)?.elements?.[i]?.value as any) || options.node;
        if (node.type === 'Object') {
          node = getObjMembers(node)[k] || node;
        }
        const { resolvedToken } = resolveAlias(token.mode[mode]!, v, { ...options, expectedType, node });
        (token.partialAliasOf[i] as any)[k] = resolvedToken.id;
        (step as any)[k] = resolvedToken.$value;
      }
    }
  }
}

function applyShadowPartialAlias(token: ShadowTokenNormalized, mode: string, options: ApplyAliasOptions): void {
  // shadow-only fix: historically this token type may or may not allow an array
  // of values, and at this stage in parsing, they all might not have been
  // normalized yet.
  if (!Array.isArray(token.mode[mode]!.$value)) {
    token.mode[mode]!.$value = [token.mode[mode]!.$value];
  }

  for (let i = 0; i < token.mode[mode]!.$value.length; i++) {
    const layer = token.mode[mode]!.$value[i]!;
    for (const [k, v] of Object.entries(layer)) {
      if (typeof v === 'string' && isAlias(v)) {
        token.partialAliasOf ??= [];
        (token.partialAliasOf as any)[i] ??= {};
        const expectedType = {
          offsetX: ['dimension'],
          offsetY: ['dimension'],
          blur: ['dimension'],
          spread: ['dimension'],
          color: ['color'],
          inset: ['boolean'],
        }[k];
        let node = ((options.node as unknown as ArrayNode | undefined)?.elements?.[i] as any) || options.node;
        if (node.type === 'Object') {
          node = getObjMembers(node)[k] || node;
        }
        const { resolvedToken } = resolveAlias(token.mode[mode]!, v, { ...options, expectedType, node });
        (token.partialAliasOf[i] as any)[k] = resolvedToken.id;
        (layer as any)[k] = resolvedToken.$value;
      }
    }
  }
}

function applyStrokeStylePartialAlias(
  token: StrokeStyleTokenNormalized,
  mode: string,
  options: ApplyAliasOptions,
): void {
  // only dashArray can be aliased
  if (typeof token.mode[mode]!.$value !== 'object' || !('dashArray' in token.mode[mode]!.$value)) {
    return;
  }

  for (let i = 0; i < token.mode[mode]!.$value.dashArray.length; i++) {
    const dash = token.mode[mode]!.$value.dashArray[i]!;
    if (typeof dash === 'string' && isAlias(dash)) {
      let node = (getObjMembers(options.node).dashArray as any) || options.node;
      if (node.type === 'Array') {
        node = ((node as unknown as ArrayNode | undefined)?.elements?.[i]?.value as any) || node;
      }
      const { resolvedToken } = resolveAlias(token.mode[mode]!, dash, {
        ...options,
        expectedType: ['dimension'],
        node,
      });
      (token.mode[mode]!.$value as any).dashArray[i] = resolvedToken.$value;
    }
  }
}

function applyTransitionPartialAlias(token: TransitionTokenNormalized, mode: string, options: ApplyAliasOptions): void {
  for (const [k, v] of Object.entries(token.mode[mode]!.$value)) {
    if (typeof v === 'string' && isAlias(v)) {
      token.partialAliasOf ??= {};
      const expectedType = { duration: ['duration'], delay: ['duration'], timingFunction: ['cubicBezier'] }[k];
      const node = (getObjMembers(options.node)[k] as any) || options.node;
      const { resolvedToken } = resolveAlias(token.mode[mode]!, v, { ...options, expectedType, node });
      (token.partialAliasOf as any)[k] = resolvedToken.id;
      (token.mode[mode]!.$value as any)[k] = resolvedToken.$value;
    }
  }
}

function applyTypographyPartialAlias(token: TypographyTokenNormalized, mode: string, options: ApplyAliasOptions): void {
  for (const [k, v] of Object.entries(token.mode[mode]!.$value)) {
    if (typeof v === 'string' && isAlias(v)) {
      token.partialAliasOf ??= {};
      const expectedType = {
        fontFamily: ['fontFamily'],
        fontWeight: ['fontWeight'],
        letterSpacing: ['dimension'],
        lineHeight: ['dimension', 'number'],
      }[k] || ['string'];
      const node = (getObjMembers(options.node)[k] as any) || options.node;
      const { resolvedToken } = resolveAlias(token.mode[mode] as any, v, { ...options, expectedType, node });
      (token.partialAliasOf as any)[k] = resolvedToken.id;
      (token.mode[mode]!.$value as any)[k] = resolvedToken.$value;
    }
  }
}

import type { AnyNode, ArrayNode, ObjectNode, StringNode } from '@humanwhocodes/momoa';
import { type TokenNormalized, type TokenNormalizedSet, isAlias, parseAlias } from '@terrazzo/token-tools';
import type Logger from '../logger.js';

/** Throw error if resolved alias for composite properties doesn’t match expected $type. */
export const COMPOSITE_TYPE_VALUES: Record<string, Record<string, TokenNormalized['$type'][]>> = {
  border: {
    color: ['color'],
    width: ['dimension'],
    strokeStyle: ['strokeStyle'],
  },
  gradient: {
    color: ['color'],
    position: ['number'],
  },
  shadow: {
    color: ['color'],
    position: ['dimension'],
  },
  strokeStyle: {
    dashArray: ['dimension'],
  },
  transition: {
    duration: ['duration'],
    delay: ['duration'],
    timingFunction: ['cubicBezier'],
  },
  typography: {
    fontFamily: ['fontFamily'],
    fontSize: ['dimension'],
    fontWeight: ['fontWeight'],
    letterSpacing: ['dimension'],
    lineHeight: ['dimension', 'number'],
  },

  boolean: {},
  color: {},
  cubicBezier: {},
  dimension: {},
  duration: {},
  fontFamily: {},
  fontWeight: {},
  link: {},
  number: {},
  string: {},
};

/**
 * Resolve alias
 * Note: to save work during resolution (and reduce memory), this will inject
 * `aliasedBy` while it traverses. Resolution isn’t normally associated with
 * mutation, but for our usecase it is preferable.
 */
export function resolveAlias(
  alias: string,
  {
    tokensSet,
    logger,
    filename,
    src,
    node,
    scanned = [],
  }: {
    tokensSet: Record<string, TokenNormalized>;
    logger: Logger;
    filename?: URL;
    src: string;
    node: AnyNode;
    scanned?: string[];
  },
): { id: string; chain: string[] } {
  const id = parseAlias(alias);
  if (!tokensSet[id]) {
    logger.error({ group: 'parser', label: 'alias', message: `Alias "${alias}" not found.`, filename, src, node });
  }
  if (scanned.includes(id)) {
    logger.error({
      group: 'parser',
      label: 'alias',
      message: `Circular alias detected from "${alias}".`,
      filename,
      src,
      node,
    });
  }
  const token = tokensSet[id]!;
  // important: use originalValue to trace the full alias path correctly
  if (!isAlias(token.originalValue.$value)) {
    return { id, chain: scanned.concat(id) };
  }
  return resolveAlias(token.originalValue.$value as string, {
    tokensSet,
    logger,
    filename,
    node,
    src,
    scanned: scanned.concat(id),
  });
}

/** Resolve aliases, update values, and mutate `token` to add `aliasOf` / `partialAliasOf` */
export function applyAliases(
  token: TokenNormalized,
  {
    tokensSet,
    logger,
    filename,
    src,
    node,
    skipReverseAlias,
  }: {
    tokensSet: TokenNormalizedSet;
    logger: Logger;
    filename?: URL;
    src: string;
    node: AnyNode;
    skipReverseAlias?: boolean;
  },
) {
  const { $type } = token;

  /**
   * Add reverse alias lookups. Note this intentionally mutates the root
   * references in `tokens` to save work.  This is essential to doing everything
   * in one pass while still being accurate.
   */
  function addReverseAliases(resolvedID: string, ids: string[]) {
    if (skipReverseAlias || !tokensSet[resolvedID]) {
      return;
    }

    // populate entire chain of aliases, so we can redeclare tokens when needed
    if (!tokensSet[resolvedID]!.aliasedBy) {
      tokensSet[resolvedID]!.aliasedBy = [];
    }
    for (const link of [token.id, ...ids]) {
      if (link !== resolvedID && !tokensSet[resolvedID]!.aliasedBy!.includes(link)) {
        tokensSet[resolvedID]!.aliasedBy.push(link);
      }
    }
  }

  const $valueNode =
    (node.type === 'Object' && node.members.find((m) => (m.name as StringNode).value === '$value')?.value) || node;
  const expectedAliasTypes = COMPOSITE_TYPE_VALUES[$type];

  // handle simple aliases
  if (isAlias(token.$value)) {
    const { id: deepAliasID, chain } = resolveAlias(token.$value as string, {
      tokensSet,
      logger,
      filename,
      node,
      src,
    });
    const resolvedToken = tokensSet[deepAliasID]!;

    // resolve value in root token, and add aliasOf
    token.aliasOf = deepAliasID;
    token.aliasChain = chain;
    token.$value = resolvedToken.$value;

    addReverseAliases(deepAliasID, chain);

    if (token.$type && token.$type !== resolvedToken.$type) {
      logger.error({
        group: 'parser',
        label: 'alias',
        message: `Invalid alias: expected $type: "${token.$type}", received $type: "${resolvedToken.$type}".`,
        node: $valueNode,
        filename,
        src,
      });
    }
    token.$type = resolvedToken.$type;
  }

  // handle aliases within array values (e.g. cubicBezier, gradient)
  else if (token.$type === 'cubicBezier' || token.$type === 'gradient' || token.$type === 'shadow') {
    // some arrays are primitives, some are objects. handle both
    for (let i = 0; i < token.$value.length; i++) {
      const value = token.$value[i] as unknown as string;
      if (isAlias(value)) {
        if (!token.partialAliasOf) {
          token.partialAliasOf = [];
        }
        const { id: deepAliasID } = resolveAlias(value, { tokensSet, logger, filename, node, src });
        const shallowAliasID = parseAlias(value);
        token.partialAliasOf![i] = shallowAliasID;
        token.$value[i] = tokensSet[deepAliasID]!.$value as any;
      } else if (typeof token.$value[i] === 'object') {
        for (const [property, subvalue] of Object.entries(token.$value[i]!)) {
          if (isAlias(subvalue)) {
            if (!token.partialAliasOf) {
              token.partialAliasOf = [];
            }
            if (!token.partialAliasOf[i]) {
              token.partialAliasOf[i] = {};
            }
            const { id: deepAliasID, chain } = resolveAlias(subvalue, { tokensSet, logger, filename, node, src });
            const shallowAliasID = parseAlias(subvalue);
            const resolvedToken = tokensSet[deepAliasID]!;

            addReverseAliases(deepAliasID, chain);

            const possibleTypes: string[] = expectedAliasTypes?.[property as keyof typeof expectedAliasTypes] || [];
            if (possibleTypes.length && !possibleTypes.includes(resolvedToken.$type)) {
              const elementNode = ($valueNode as ArrayNode).elements[i]!.value;
              logger.error({
                group: 'parser',
                label: 'alias',
                message: `Invalid alias: expected $type: "${possibleTypes.join('" or "')}", received $type: "${resolvedToken.$type}".`,
                node: (elementNode as ObjectNode).members.find((m) => (m.name as StringNode).value === property)!.value,
                filename,
                src,
              });
            }

            (token.partialAliasOf[i] as any)[property] = shallowAliasID; // also keep the shallow alias here, too!
            (token.$value[i] as any)[property] = resolvedToken.$value;
          }
        }
      }
    }
  }
  // handle aliases within object (composite) values (e.g. border, typography, transition)
  else if (typeof token.$value === 'object') {
    for (const [property, subvalue] of Object.entries(token.$value)) {
      if (isAlias(subvalue)) {
        if (!token.partialAliasOf) {
          token.partialAliasOf = {};
        }
        const { id: deepAliasID, chain } = resolveAlias(subvalue, { tokensSet, logger, filename, node, src });
        const shallowAliasID = parseAlias(subvalue);

        addReverseAliases(deepAliasID, chain);

        (token.partialAliasOf as any)[property] = shallowAliasID; // keep the shallow alias!
        const resolvedToken = tokensSet[deepAliasID]!;
        if (expectedAliasTypes?.[property] && !expectedAliasTypes[property].includes(resolvedToken.$type)) {
          logger.error({
            group: 'parser',
            label: 'alias',
            message: `Invalid alias: expected $type: "${expectedAliasTypes[property].join('" or "')}", received $type: "${resolvedToken.$type}".`,
            node: ($valueNode as ObjectNode).members.find((m) => m.name.type === 'String' && m.name.value === property)!
              .value,
            filename,
            src,
          });
        }
        (token.$value as any)[property] = resolvedToken.$value;
      }

      // strokeStyle has an array within an object
      else if (Array.isArray(subvalue)) {
        for (let i = 0; i < subvalue.length; i++) {
          if (isAlias(subvalue[i])) {
            const { id: deepAliasID, chain } = resolveAlias(subvalue[i], {
              tokensSet,
              logger,
              filename,
              node,
              src,
            });

            addReverseAliases(deepAliasID, chain);

            if (!token.partialAliasOf) {
              token.partialAliasOf = {};
            }
            if (!(token.partialAliasOf as any)[property]) {
              (token.partialAliasOf as any)[property] = [];
            }
            const aliasID = parseAlias(subvalue[i]);
            (token.partialAliasOf as any)[property][i] = aliasID; // keep the shallow alias!
            const resolvedToken = tokensSet[deepAliasID];
            if (expectedAliasTypes?.[property] && !expectedAliasTypes[property].includes(resolvedToken!.$type)) {
              const arrayNode = ($valueNode as ObjectNode).members.find(
                (m) => m.name.type === 'String' && m.name.value === property,
              )!.value as ArrayNode;
              logger.error({
                group: 'parser',
                label: 'alias',
                message: `Invalid alias: expected $type: "${expectedAliasTypes[property].join('" or "')}", received $type: "${resolvedToken?.$type}".`,
                node: arrayNode.elements[i],
                filename,
                src,
              });
            }
            (token.$value as any)[property][i] = tokensSet[deepAliasID]!.$value;
          }
        }
      }

      // typography tokens: make sure to un-link non-aliases
      else if (token.partialAliasOf) {
        delete (token.partialAliasOf as any)[property];
      }
    }
  }
}

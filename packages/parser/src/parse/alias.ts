import type { AnyNode, ArrayNode, ObjectNode, StringNode } from '@humanwhocodes/momoa';
import { type TokenNormalized, isAlias, parseAlias } from '@terrazzo/token-tools';
import type Logger from '../logger.js';

/** Throw error if resolved alias for composite properties doesn’t match expected $type. */
export const COMPOSITE_TYPE_VALUES = {
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
    tokens,
    logger,
    filename,
    src,
    node,
    scanned = [],
  }: {
    tokens: Record<string, TokenNormalized>;
    logger: Logger;
    filename?: URL;
    src: string;
    node: AnyNode;
    scanned?: string[];
  },
): { id: string; chain: string[] } {
  const { id } = parseAlias(alias);
  if (!tokens[id]) {
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
  const token = tokens[id]!;
  // important: use originalValue to trace the full alias path correctly
  if (!isAlias(token.originalValue.$value)) {
    return { id, chain: scanned.concat(id) };
  }
  return resolveAlias(token.originalValue.$value as string, {
    tokens,
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
    tokens,
    logger,
    filename,
    src,
    node,
    skipReverseAlias,
  }: {
    tokens: Record<string, TokenNormalized>;
    logger: Logger;
    filename?: URL;
    src: string;
    node: AnyNode;
    skipReverseAlias?: boolean;
  },
) {
  /**
   * Add reverse alias lookups. Note this intentionally mutates the root
   * references in `tokens` to save work.  This is essential to doing everything
   * in one pass while still being accurate.
   */
  function addReverseAliases(resolvedID: string, ids: string[]) {
    if (skipReverseAlias || !tokens[resolvedID]) {
      return;
    }

    // populate entire chain of aliases, so we can redeclare tokens when needed
    if (!tokens[resolvedID]!.aliasedBy) {
      tokens[resolvedID]!.aliasedBy = [];
    }
    for (const link of [token.id, ...ids]) {
      if (link !== resolvedID && !tokens[resolvedID]!.aliasedBy!.includes(link)) {
        tokens[resolvedID]!.aliasedBy.push(link);
      }
    }
  }

  const $valueNode =
    (node.type === 'Object' && node.members.find((m) => (m.name as StringNode).value === '$value')?.value) || node;
  const expectedAliasTypes =
    token.$type in COMPOSITE_TYPE_VALUES && COMPOSITE_TYPE_VALUES[token.$type as keyof typeof COMPOSITE_TYPE_VALUES];

  // handle simple aliases
  if (isAlias(token.$value)) {
    const { id: deepAliasID, chain } = resolveAlias(token.$value as string, { tokens, logger, filename, node, src });
    const { mode: aliasMode } = parseAlias(token.$value as string);
    const resolvedToken = tokens[deepAliasID]!;

    // resolve value in root token, and add aliasOf
    token.aliasOf = deepAliasID;
    token.aliasChain = chain;
    token.$value = resolvedToken!.mode[aliasMode!]?.$value || resolvedToken.$value;

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
      // @ts-ignore
      if (isAlias(token.$value[i])) {
        if (!token.partialAliasOf) {
          token.partialAliasOf = [];
        }
        // @ts-ignore
        const { id: deepAliasID } = resolveAlias(token.$value[i], { tokens, logger, filename, node, src });
        // @ts-ignore
        const { id: aliasID, mode: aliasMode } = parseAlias(token.$value[i]);
        token.partialAliasOf![i] = aliasID;
        // @ts-ignore
        token.$value[i] = (aliasMode && tokens[deepAliasID].mode[aliasMode]?.$value) || tokens[deepAliasID].$value;
      } else if (typeof token.$value[i] === 'object') {
        for (const [property, subvalue] of Object.entries(token.$value[i]!)) {
          if (isAlias(subvalue)) {
            if (!token.partialAliasOf) {
              token.partialAliasOf = [];
            }
            if (!token.partialAliasOf[i]) {
              token.partialAliasOf[i] = {};
            }
            const { id: deepAliasID, chain } = resolveAlias(subvalue, { tokens, logger, filename, node, src });
            const { id: shallowAliasID, mode: aliasMode } = parseAlias(subvalue);
            const resolvedToken = tokens[deepAliasID]!;

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

            // @ts-ignore
            token.partialAliasOf[i][property] = shallowAliasID; // also keep the shallow alias here, too!
            // @ts-ignore
            token.$value[i][property] = (aliasMode && resolvedToken.mode[aliasMode]?.$value) || resolvedToken.$value;
          }
        }
      }
    }
  }
  // handle aliases within object (composite) values (e.g. border, typography, transition)
  else if (typeof token.$value === 'object') {
    for (const [property, subvalue] of Object.entries(token.$value)) {
      if (!Object.hasOwn(token.$value, property)) {
        continue;
      }

      if (isAlias(subvalue)) {
        if (!token.partialAliasOf) {
          token.partialAliasOf = {};
        }
        const { id: deepAliasID, chain } = resolveAlias(subvalue, { tokens, logger, filename, node, src });
        const { id: shallowAliasID, mode: aliasMode } = parseAlias(subvalue);

        addReverseAliases(deepAliasID, chain);

        // @ts-ignore
        token.partialAliasOf[property] = shallowAliasID; // keep the shallow alias!
        const resolvedToken = tokens[deepAliasID];
        // @ts-ignore
        if (expectedAliasTypes?.[property] && !expectedAliasTypes[property].includes(resolvedToken!.$type)) {
          logger.error({
            group: 'parser',
            label: 'alias',
            // @ts-ignore
            message: `Invalid alias: expected $type: "${expectedAliasTypes[property].join('" or "')}", received $type: "${resolvedToken.$type}".`,
            // @ts-ignore
            node: $valueNode.members.find((m) => m.name.value === property).value,
            filename,
            src,
          });
        }
        // @ts-ignore
        token.$value[property] = resolvedToken.mode[aliasMode]?.$value || resolvedToken.$value;
      }

      // strokeStyle has an array within an object
      // @ts-ignore
      else if (Array.isArray(token.$value[property])) {
        // @ts-ignore
        for (let i = 0; i < token.$value[property].length; i++) {
          // @ts-ignore
          if (isAlias(token.$value[property][i])) {
            // @ts-ignore
            const { id: deepAliasID, chain } = resolveAlias(token.$value[property][i], {
              tokens,
              logger,
              filename,
              node,
              src,
            });

            addReverseAliases(deepAliasID, chain);

            if (!token.partialAliasOf) {
              token.partialAliasOf = {};
            }
            // @ts-ignore
            if (!token.partialAliasOf[property]) {
              // @ts-ignore
              token.partialAliasOf[property] = [];
            }
            // @ts-ignore
            const { id: aliasID, mode: aliasMode } = parseAlias(token.$value[property][i]);
            // @ts-ignore
            token.partialAliasOf[property][i] = aliasID; // keep the shallow alias!
            const resolvedToken = tokens[deepAliasID];
            // @ts-ignore
            if (expectedAliasTypes?.[property] && !expectedAliasTypes[property].includes(resolvedToken.$type)) {
              // @ts-ignore
              const arrayNode = $valueNode.members.find((m) => m.name.value === property).value;
              logger.error({
                group: 'parser',
                label: 'alias',
                // @ts-ignore
                message: `Invalid alias: expected $type: "${expectedAliasTypes[property].join('" or "')}", received $type: "${resolvedToken.$type}".`,
                node: arrayNode.elements[i],
                filename,
                src,
              });
            }
            // @ts-ignore
            token.$value[property][i] = tokens[deepAliasID].mode[aliasMode]?.$value || tokens[deepAliasID].$value;
          }
        }
      }
    }
  }
}

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

/** Resolve alias */
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
) {
  const { id } = parseAlias(alias);
  if (!tokens[id]) {
    logger.error({ message: `Alias "${alias}" not found.`, filename, src, node });
  }
  if (scanned.includes(id)) {
    logger.error({ message: `Circular alias detected from "${alias}".`, filename, src, node });
  }
  const token = tokens[id]!;
  if (!isAlias(token.$value)) {
    return id;
  }
  return resolveAlias(token.$value as string, { tokens, logger, filename, node, src, scanned: [...scanned, id] });
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
  }: { tokens: Record<string, TokenNormalized>; logger: Logger; filename?: URL; src: string; node: AnyNode },
) {
  const $valueNode =
    (node.type === 'Object' && node.members.find((m) => (m.name as StringNode).value === '$value')?.value) || node;
  const expectedAliasTypes =
    token.$type in COMPOSITE_TYPE_VALUES && COMPOSITE_TYPE_VALUES[token.$type as keyof typeof COMPOSITE_TYPE_VALUES];

  // handle simple aliases
  if (isAlias(token.$value)) {
    const aliasOfID = resolveAlias(token.$value as string, { tokens, logger, filename, node, src });
    const { mode: aliasMode } = parseAlias(token.$value as string);
    const aliasOf = tokens[aliasOfID]!;
    token.aliasOf = aliasOfID;
    token.$value = aliasOf!.mode[aliasMode!]?.$value || aliasOf.$value;
    if (token.$type && token.$type !== aliasOf.$type) {
      logger.error({
        message: `Invalid alias: expected $type: "${token.$type}", received $type: "${aliasOf.$type}".`,
        node: $valueNode,
        filename,
        src,
      });
    }
    token.$type = aliasOf.$type;
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
        const aliasOfID = resolveAlias(token.$value[i], { tokens, logger, filename, node, src });
        // @ts-ignore
        const { id: aliasID, mode: aliasMode } = parseAlias(token.$value[i]);
        token.partialAliasOf![i] = aliasID;
        // @ts-ignore
        token.$value[i] = (aliasMode && tokens[aliasOfID]!.mode[aliasMode]?.$value) || tokens[aliasOfID]!.$value;
      } else if (typeof token.$value[i] === 'object') {
        for (const [property, subvalue] of Object.entries(token.$value[i]!)) {
          if (isAlias(subvalue)) {
            if (!token.partialAliasOf) {
              token.partialAliasOf = [];
            }
            if (!token.partialAliasOf[i]) {
              token.partialAliasOf[i] = {};
            }
            const aliasOfID = resolveAlias(subvalue, { tokens, logger, filename, node, src });
            const { id: aliasID, mode: aliasMode } = parseAlias(subvalue);
            const aliasToken = tokens[aliasOfID]!;
            const possibleTypes: string[] = expectedAliasTypes?.[property as keyof typeof expectedAliasTypes] || [];
            if (!possibleTypes.includes(aliasToken.$type)) {
              const elementNode = ($valueNode as ArrayNode).elements[i]!.value;
              logger.error({
                message: `Invalid alias: expected $type: "${possibleTypes.join('" or "')}", received $type: "${aliasToken.$type}".`,
                node: (elementNode as ObjectNode).members.find((m) => (m.name as StringNode).value === property)!.value,
                filename,
                src,
              });
            }

            // @ts-ignore
            token.partialAliasOf[i]![property] = aliasID; // also keep the shallow alias here, too!
            // @ts-ignore
            token.$value[i]![property] = (aliasMode && aliasToken.mode[aliasMode]?.$value) || aliasToken.$value;
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
        const aliasOfID = resolveAlias(subvalue, { tokens, logger, filename, node, src });
        const { id: aliasID, mode: aliasMode } = parseAlias(subvalue);
        // @ts-ignore
        token.partialAliasOf[property] = aliasID; // keep the shallow alias!
        const aliasToken = tokens[aliasOfID];
        // @ts-ignore
        if (expectedAliasTypes?.[property] && !expectedAliasTypes[property].includes(aliasToken!.$type)) {
          logger.error({
            // @ts-ignore
            message: `Invalid alias: expected $type: "${expectedAliasTypes[property].join('" or "')}", received $type: "${aliasToken.$type}".`,
            // @ts-ignore
            node: $valueNode.members.find((m) => m.name.value === property).value,
            filename,
            src,
          });
        }
        // @ts-ignore
        token.$value[property] = aliasToken!.mode[aliasMode]?.$value || aliasToken!.$value;
      }

      // strokeStyle has an array within an object
      // @ts-ignore
      else if (Array.isArray(token.$value[property]!)) {
        // @ts-ignore
        for (let i = 0; i < token.$value[property]!.length; i++) {
          // @ts-ignore
          if (isAlias(token.$value[property]![i])) {
            // @ts-ignore
            const aliasOfID = resolveAlias(token.$value[property][i], { tokens, logger, filename, node, src });
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
            const aliasToken = tokens[aliasOfID];
            // @ts-ignore
            if (expectedAliasTypes?.[property] && !expectedAliasTypes[property].includes(aliasToken.$type)) {
              // @ts-ignore
              const arrayNode = $valueNode.members.find((m) => m.name.value === property).value;
              logger.error({
                // @ts-ignore
                message: `Invalid alias: expected $type: "${expectedAliasTypes[property].join('" or "')}", received $type: "${aliasToken.$type}".`,
                node: arrayNode.elements[i],
                filename,
                src,
              });
            }
            // @ts-ignore
            token.$value[property]![i] = tokens[aliasOfID]!.mode[aliasMode]?.$value || tokens[aliasOfID]!.$value;
          }
        }
      }
    }
  }
}

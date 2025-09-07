import { type AnyNode, evaluate, type ObjectNode } from '@humanwhocodes/momoa';
import parseRef from '@terrazzo/json-ref-parser';
import type { GroupNormalized, TokenNormalized, TokenNormalizedSet } from '@terrazzo/token-tools';
import type Logger from '../logger.js';
import type { InputSource } from '../types.js';
import { getObjMember, refToTokenID } from './json.js';

/** Generate a TokenNormalized from a Momoa node */
export function tokenFromNode(
  node: AnyNode,
  { groups, path, source }: { groups: Record<string, GroupNormalized>; path: string[]; source: InputSource },
): TokenNormalized | undefined {
  if (node.type !== 'Object' || path.includes('$extensions') || path.includes('$defs')) {
    return undefined;
  }

  const jsonID = `#/${path.join('/')}`;
  const id = path.join('.');

  // token (can’t exist inside $extensions or $defs
  if (getObjMember(node, '$value')) {
    const originalToken = evaluate(node) as any;
    const groupID = `#/${path.slice(0, -1).join('/')}`;
    const group = groups[groupID]!;
    if (group?.tokens && !group.tokens.includes(id)) {
      group.tokens.push(id);
    }
    const nodeSource = { filename: source.filename?.href, node };
    const token: TokenNormalized = {
      id,
      $type: originalToken.$type || group.$type,
      $description: originalToken.$description || undefined,
      $deprecated: originalToken.$deprecated || group.$deprecated || undefined,
      $value: originalToken.$value,
      $extensions: originalToken.$extensions || undefined,
      aliasChain: undefined,
      aliasedBy: undefined,
      aliasOf: undefined,
      partialAliasOf: undefined,
      dependencies: undefined,
      group,
      originalValue: undefined, // undefined because we are not sure if the value has been modified or not
      source: nodeSource,
      jsonID,
      mode: {
        '.': {
          $value: originalToken.$value,
          aliasOf: undefined,
          aliasChain: undefined,
          partialAliasOf: undefined,
          originalValue: undefined,
          dependencies: undefined,
          source: {
            ...nodeSource,
            node: (getObjMember(nodeSource.node, '$value') ?? nodeSource.node) as ObjectNode,
          },
        },
      },
    };

    const $extensions = getObjMember(node, '$extensions');
    if ($extensions) {
      const modeNode = getObjMember($extensions as ObjectNode, 'mode') as ObjectNode;
      for (const mode of Object.keys((token.$extensions as any).mode)) {
        const modeValue = (token.$extensions as any).mode;
        token.mode[mode] = {
          $value: modeValue,
          aliasOf: undefined,
          aliasChain: undefined,
          partialAliasOf: undefined,
          originalValue: undefined,
          dependencies: undefined,
          source: {
            ...nodeSource,
            node: getObjMember(modeNode, mode) as any,
          },
        };
      }
    }
    return token;
  }
}

/** Arbitrary keys that should be associated with a token group */
const GROUP_PROPERTIES = ['$deprecated', '$description', '$extensions', '$type'];

/** Generate a group from a node */
export function groupFromNode(
  node: ObjectNode,
  { path, groups }: { path: string[]; groups: Record<string, GroupNormalized> },
): GroupNormalized {
  const id = path.join('.');
  const jsonID = `#/${path.join('/')}`;

  // group
  if (!groups[jsonID]) {
    groups[jsonID] = {
      id,
      $deprecated: undefined,
      $description: undefined,
      $extensions: undefined,
      $type: undefined,
      tokens: [],
    };
  }
  // first, copy all parent groups’ properties into local, since they cascade
  const groupIDs = Object.keys(groups);
  groupIDs.sort(); // these may not be sorted; re-sort just in case (order determines final values)
  for (const groupID of groupIDs) {
    const isParentGroup = jsonID.startsWith(groupID) && groupID !== jsonID;
    if (isParentGroup) {
      groups[jsonID] = { ...groups[groupID] } as GroupNormalized;
    }
  }
  // next, override cascading values with local
  for (const m of node.members) {
    if (m.name.type !== 'String' || !GROUP_PROPERTIES.includes(m.name.value)) {
      continue;
    }
    (groups as any)[jsonID]![m.name.value] = evaluate(m.value);
  }

  return groups[jsonID]!;
}

/**
 * Link and reverse-link tokens in one pass.
 */
export function markAliases({
  tokens,
  jsonID,
  aliasChain,
  logger,
  src,
}: {
  tokens: TokenNormalizedSet;
  jsonID: string;
  aliasChain: string[];
  src: string;
  logger: Logger;
}) {
  if (!aliasChain.length) {
    return;
  }

  // TODO: deprecate
  // In the future, token composition will be more complex, which means we can
  // make more granular tracing possible with JSON $refs. But we keep the dot
  // notation for backwards-compatibility with older versions. This may be
  // removed in a future version.
  const allTokenIDs = Object.keys(tokens);
  const tokenID = allTokenIDs.find((id) => jsonID.startsWith(id));
  if (!tokenID || !tokens[tokenID]) {
    return;
  }

  if (!tokens[tokenID].dependencies) {
    tokens[tokenID].dependencies = [...aliasChain];
  } else {
    tokens[tokenID].dependencies.push(...aliasChain.filter((ref) => !tokens[tokenID]!.dependencies!.includes(ref)));
  }

  const { subpath: $refPath } = parseRef(jsonID);
  const $valueIndex = $refPath?.indexOf('$value') ?? -1;

  // This is an alias if either a $value is referenced, or has a root $ref that points directly to an existing token
  const isAlias = $valueIndex > 0 || !!tokens[aliasChain.at(-1)!];
  if (!isAlias) {
    return;
  }

  // $value updates aliasOf, aliasedBy, partialAliasOf
  const aliasChainTokenIDs = aliasChain
    .map((path) => allTokenIDs.find((id) => path.startsWith(id)))
    .filter(Boolean) as string[];
  for (const aliasedByID of aliasChainTokenIDs) {
    if (tokens[aliasedByID]) {
      if (!tokens[aliasedByID].aliasedBy) {
        tokens[aliasedByID].aliasedBy = [];
      }
      if (!tokens[aliasedByID].aliasedBy.includes(refToTokenID(tokenID)!)) {
        tokens[aliasedByID].aliasedBy.push(refToTokenID(tokenID)!);
      }
    }
  }

  if ($refPath!.at(-1) === '$value') {
    const aliasedID = aliasChainTokenIDs.at(-1)!;
    tokens[tokenID].aliasOf = refToTokenID(aliasedID)!;
    tokens[tokenID].$type = tokens[aliasedID]!.$type;
  }

  // Figure out partial alias ($value is a mix of local values and $refs)
  const partialValue = ($refPath ?? []).slice($valueIndex + 1);
  if (!partialValue.length) {
    return;
  }

  if (!tokens[tokenID].partialAliasOf) {
    tokens[tokenID].partialAliasOf = Array.isArray(tokens[tokenID].$value) ? [] : {};
  }
  let node = tokens[tokenID]!.$value as any;
  let sourceNode = getObjMember(tokens[tokenID]!.source.node, '$value') as AnyNode;
  let partialAliasNode = tokens[tokenID].partialAliasOf as any;
  for (let i = 0; i < partialValue.length; i++) {
    const key = partialValue[i]!;

    if (key in node && typeof node[key] !== 'undefined') {
      if (sourceNode.type === 'Object') {
        sourceNode = getObjMember(sourceNode, key)!;
      } else if (sourceNode.type === 'Array') {
        sourceNode = sourceNode.elements[Number(key)]!.value;
      }

      // last node: apply partial alias
      if (i === partialValue.length - 1) {
        const aliasedID = aliasChainTokenIDs.pop()!;
        partialAliasNode[key] = refToTokenID(aliasedID);
        if (!(aliasedID in tokens)) {
          logger.error({
            group: 'parser',
            label: 'init',
            message: `Invalid alias: ${aliasedID}`,
            node: sourceNode,
            src,
          });
        }
        node[key] = tokens[aliasedID]!.$value;
        break;
      }

      node = node[key];
      // otherwise, create deeper structure and continue traversing
      if (!(key in partialAliasNode)) {
        partialAliasNode[key] = Array.isArray(node[key]) ? [] : {};
      }
      partialAliasNode = partialAliasNode[key];
    }
  }
}

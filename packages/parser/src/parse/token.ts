import { type AnyNode, evaluate, type ObjectNode, type StringNode } from '@humanwhocodes/momoa';
import parseRef from '@terrazzo/json-ref-parser';
import { type GroupNormalized, parseAlias, type TokenNormalized, type TokenNormalizedSet } from '@terrazzo/token-tools';
import type Logger from '../logger.js';
import type { InputSource, ReferenceObject } from '../types.js';
import { getObjMember } from './json.js';

/** Convert valid DTCG alias to $ref */
export function aliasToRef(alias: string): ReferenceObject | undefined {
  const id = parseAlias(alias);
  // if this is invalid, stop
  if (id === alias) {
    return;
  }
  return { $ref: `#/${id.replace(/~/g, '~0').replace(/\//g, '~1').replace(/\./g, '/')}/$value` };
}

export interface TokenFromNodeOptions {
  groups: Record<string, GroupNormalized>;
  path: string[];
  source: InputSource;
}

/** Generate a TokenNormalized from a Momoa node */
export function tokenFromNode(
  node: AnyNode,
  { groups, path, source }: TokenFromNodeOptions,
): TokenNormalized | undefined {
  const isToken =
    node.type === 'Object' && getObjMember(node, '$value') && !path.includes('$extensions') && !path.includes('$defs');
  if (!isToken) {
    return undefined;
  }

  const jsonID = `#/${path.join('/')}`;
  const id = path.join('.');

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
    $deprecated: originalToken.$deprecated ?? group.$deprecated ?? undefined, // ⚠️ MUST use ?? here to inherit false correctly
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
      const modeValue = (token.$extensions as any).mode[mode];
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

export interface TokenRawValues {
  jsonID: string;
  originalValue: any;
  source: TokenNormalized['source'];
  mode: Record<string, { originalValue: any; source: TokenNormalized['source'] }>;
}

/** Generate originalValue and source from node */
export function tokenRawValuesFromNode(
  node: AnyNode,
  { filename, path }: { filename: string; path: string[] },
): TokenRawValues | undefined {
  const isToken =
    node.type === 'Object' && getObjMember(node, '$value') && !path.includes('$extensions') && !path.includes('$defs');
  if (!isToken) {
    return undefined;
  }

  const jsonID = `#/${path.join('/')}`;
  const rawValues: TokenRawValues = {
    jsonID,
    originalValue: evaluate(node),
    source: { loc: filename, filename, node: node as ObjectNode },
    mode: {},
  };
  rawValues.mode['.'] = {
    originalValue: rawValues.originalValue.$value,
    source: { ...rawValues.source, node: getObjMember(node as ObjectNode, '$value') as ObjectNode },
  };
  const $extensions = getObjMember(node, '$extensions');
  if ($extensions) {
    const modes = getObjMember($extensions as ObjectNode, 'mode');
    if (modes) {
      for (const modeMember of (modes as ObjectNode).members) {
        const mode = (modeMember.name as StringNode).value;
        rawValues.mode[mode] = {
          originalValue: evaluate(modeMember.value),
          source: { loc: filename, filename, node: modeMember.value as ObjectNode },
        };
      }
    }
  }

  return rawValues;
}

/** Arbitrary keys that should be associated with a token group */
const GROUP_PROPERTIES = ['$deprecated', '$description', '$extensions', '$type'];

/**
 * Generate a group from a node.
 * This method mutates the groups index as it goes because of group inheritance.
 * As it encounters new groups it may have to update other groups.
 */
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
export function graphAliases({
  tokens,
  jsonID,
  refChain,
  logger,
  src,
}: {
  tokens: TokenNormalizedSet;
  jsonID: string;
  refChain: string[];
  src: string;
  logger: Logger;
}) {
  if (!refChain.length) {
    return;
  }

  const allTokenIDs = Object.keys(tokens);
  const tokenID = allTokenIDs.find((id) => jsonID.startsWith(id));
  if (!tokenID || !tokens[tokenID]) {
    return;
  }

  if (!tokens[tokenID].dependencies) {
    tokens[tokenID].dependencies = [...refChain];
  } else {
    tokens[tokenID].dependencies.push(...refChain.filter((ref) => !tokens[tokenID]!.dependencies!.includes(ref)));
  }

  const { subpath: $refPath } = parseRef(jsonID);
  const $valueIndex = $refPath?.indexOf('$value') ?? -1;

  // This is an alias if either a $value is referenced, or has a root $ref that points directly to an existing token
  const isAlias = $valueIndex > 0 || !!tokens[refChain.at(-1)?.replace(/\/\$value$/, '')!];
  if (!isAlias) {
    return;
  }

  // $value updates aliasOf, aliasedBy, partialAliasOf
  const refChainTokenIDs = refChain
    .map((path) => allTokenIDs.find((id) => path.startsWith(id)))
    .filter(Boolean) as string[];
  for (const aliasedByID of refChainTokenIDs) {
    if (tokens[aliasedByID]) {
      if (!tokens[aliasedByID].aliasedBy) {
        tokens[aliasedByID].aliasedBy = [];
      }
      if (!tokens[aliasedByID].aliasedBy.includes(refToTokenID(tokenID)!)) {
        tokens[aliasedByID].aliasedBy.push(refToTokenID(tokenID)!);
      }
    }
  }

  const aliasedID = refChainTokenIDs.at(-1)!;
  tokens[tokenID].aliasOf = refToTokenID(aliasedID)!;
  tokens[tokenID].$type = tokens[aliasedID]!.$type;

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
        const aliasedID = refChainTokenIDs.pop()!;
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

/** Convert valid DTCG alias to $ref Momoa Node */
export function aliasToMomoa(
  alias: string,
  loc: ObjectNode['loc'] = { start: { line: -1, column: -1, offset: 0 }, end: { line: -1, column: -1, offset: 0 } },
): ObjectNode | undefined {
  const $ref = aliasToRef(alias);
  if (!$ref) {
    return;
  }
  return {
    type: 'Object',
    members: [
      {
        type: 'Member',
        name: { type: 'String', value: '$ref', loc },
        value: { type: 'String', value: $ref.$ref, loc },
        loc,
      },
    ],
    loc,
  };
}

/**
 * Convert Reference Object to token ID.
 * This can then be turned into an alias by surrounding with { … }
 */
export function refToTokenID($ref: ReferenceObject | string): string | undefined {
  const path = typeof $ref === 'object' ? $ref.$ref : $ref;
  if (typeof path !== 'string') {
    return;
  }
  const { subpath } = parseRef(path);
  return (subpath?.length && subpath.join('.').replace(/\.\$value.*$/, '')) || undefined;
}

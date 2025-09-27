import { type AnyNode, evaluate, type ObjectNode, type StringNode } from '@humanwhocodes/momoa';
import { getObjMember, parseRef, type RefMap } from '@terrazzo/json-schema-tools';
import {
  type GroupNormalized,
  isAlias,
  parseAlias,
  type TokenNormalized,
  type TokenNormalizedSet,
} from '@terrazzo/token-tools';
import wcmatch from 'wildcard-match';
import type { default as Logger } from '../logger.js';
import type { Config, InputSource, ReferenceObject } from '../types.js';

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
  ignore: Config['ignore'];
}

/** Generate a TokenNormalized from a Momoa node */
export function tokenFromNode(
  node: AnyNode,
  { groups, path, source, ignore }: TokenFromNodeOptions,
): TokenNormalized | undefined {
  const isToken = node.type === 'Object' && getObjMember(node, '$value') && !path.includes('$extensions');
  if (!isToken) {
    return undefined;
  }

  const jsonID = `#/${path.join('/')}`;
  const id = path.join('.');

  // filter out ignored
  const isIgnored = ignore?.tokens ? wcmatch(ignore?.tokens) : () => false;
  if (isIgnored(id)) {
    return;
  }

  const originalToken = evaluate(node) as any;
  const groupID = `#/${path.slice(0, -1).join('/')}`;
  const group = groups[groupID]!;
  if (group?.tokens && !group.tokens.includes(id)) {
    group.tokens.push(id);
    group.tokens.sort((a, b) => a.localeCompare(b, 'en-us', { numeric: true }));
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
  const isToken = node.type === 'Object' && getObjMember(node, '$value') && !path.includes('$extensions');
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
      groups[jsonID].$deprecated = groups[groupID]?.$deprecated ?? groups[jsonID].$deprecated;
      groups[jsonID].$description = groups[groupID]?.$description ?? groups[jsonID].$description;
      groups[jsonID].$type = groups[groupID]?.$type ?? groups[jsonID].$type;
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

export interface GraphAliasesOptions {
  tokens: TokenNormalizedSet;
  sources: Record<string, InputSource>;
  logger: Logger;
}

/**
 * Link and reverse-link tokens in one pass.
 */
export function graphAliases(refMap: RefMap, { tokens, logger, sources }: GraphAliasesOptions) {
  // mini-helper that probably shouldn’t be used outside this function
  const getTokenRef = (ref: string) => ref.replace(/\/\$value\/?.*/, '');

  for (const [jsonID, { refChain }] of Object.entries(refMap)) {
    if (!refChain.length) {
      continue;
    }

    // aliasChain + dependencies
    const rootRef = getTokenRef(jsonID);
    if (tokens[rootRef]) {
      if (!tokens[rootRef].dependencies) {
        tokens[rootRef].dependencies = [];
      }
      tokens[rootRef].dependencies.push(...refChain.filter((r) => !tokens[rootRef]!.dependencies!.includes(r)));
      tokens[rootRef].dependencies.sort((a, b) => a.localeCompare(b, 'en-us', { numeric: true }));
    }

    // Top alias
    const isTopLevelAlias = jsonID.endsWith('/$value') || tokens[jsonID];
    if (isTopLevelAlias) {
      // aliasOf
      if (tokens[rootRef]) {
        tokens[rootRef].aliasOf = refToTokenID(refChain.at(-1)!);
        const aliasChain = refChain.map(refToTokenID) as string[];
        tokens[rootRef]!.aliasChain = [...aliasChain];
      }
    }

    // Partial alias
    const partial = jsonID
      .replace(/.*\/\$value\/?/, '')
      .split('/')
      .filter(Boolean);
    if (partial.length && tokens[rootRef]?.$value && typeof tokens[rootRef].$value === 'object') {
      let node: any = tokens[rootRef].$value;
      let sourceNode = getObjMember(tokens[rootRef]!.source.node, '$value') as AnyNode;
      if (!tokens[rootRef].partialAliasOf) {
        tokens[rootRef].partialAliasOf = Array.isArray(tokens[rootRef].$value) ? [] : {};
      }
      let partialAliasOf = tokens[rootRef].partialAliasOf as any;

      for (let i = 0; i < partial.length; i++) {
        let key = partial[i] as string | number;
        if (String(Number(key)) === key) {
          key = Number(key);
        }
        if (key in node && typeof node[key] !== 'undefined') {
          node = node[key];
          if (sourceNode.type === 'Object') {
            sourceNode = getObjMember(sourceNode, key as string)!;
          } else if (sourceNode.type === 'Array') {
            sourceNode = sourceNode.elements[key as number]!.value;
          }
        }
        // last node: apply partial alias
        if (i === partial.length - 1) {
          const aliasedID = getTokenRef(refChain.at(-1)!);
          if (!(aliasedID in tokens)) {
            logger.error({
              group: 'parser',
              label: 'init',
              message: `Invalid alias: ${aliasedID}`,
              node: sourceNode,
              src: sources[tokens[rootRef]!.source.filename!]?.src,
            });
            break;
          }
          partialAliasOf[key] = refToTokenID(aliasedID);
        }
        // otherwise, create deeper structure and continue traversing
        if (!(key in partialAliasOf)) {
          partialAliasOf[key] = Array.isArray(node) ? [] : {};
        }
        partialAliasOf = partialAliasOf[key];
      }
    }

    // aliasedBy (reversed)
    const aliasedByRefs = [jsonID, ...refChain].reverse();
    for (let i = 0; i < aliasedByRefs.length; i++) {
      const baseRef = getTokenRef(aliasedByRefs[i]!);
      if (!tokens[baseRef]) {
        continue;
      }
      const upstream = aliasedByRefs.slice(i + 1);
      if (!upstream.length) {
        break;
      }
      if (!tokens[baseRef].aliasedBy) {
        tokens[baseRef].aliasedBy = [];
      }
      for (let j = 0; j < upstream.length; j++) {
        const downstream = refToTokenID(upstream[j]!)!;
        if (!tokens[baseRef].aliasedBy.includes(downstream)) {
          tokens[baseRef].aliasedBy.push(downstream);
          tokens[baseRef].aliasedBy.sort((a, b) => a.localeCompare(b, 'en-us', { numeric: true })); // sort, because the ordering is arbitrary and flaky
        }
      }
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

const EXPECTED_NESTED_ALIAS: Record<string, Record<string, string[]>> = {
  border: {
    color: ['color'],
    stroke: ['strokeStyle'],
    width: ['dimension'],
  },
  gradient: {
    color: ['color'],
    number: ['number'],
  },
  shadow: {
    color: ['color'],
    offsetX: ['dimension'],
    offsetY: ['dimension'],
    blur: ['dimension'],
    spread: ['dimension'],
    inset: ['boolean'],
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
    fontWeight: ['fontWeight'],
    fontSize: ['dimension'],
    lineHeight: ['dimension', 'number'],
    letterSpacing: ['dimension'],
  },
};

/**
 * Resolve DTCG aliases
 */
export function resolveAliases(
  tokens: TokenNormalizedSet,
  { logger, refMap, sources }: { logger: Logger; refMap: RefMap; sources: Record<string, InputSource> },
): void {
  for (const token of Object.values(tokens)) {
    const aliasEntry = {
      group: 'parser' as const,
      label: 'init',
      src: sources[token.source.filename!]?.src,
      node: getObjMember(token.source.node, '$value'),
    };

    for (const mode of Object.keys(token.mode)) {
      function resolveInner(alias: string, refChain: string[]): string {
        const nextID = aliasToRef(alias);
        if (refChain.includes(nextID?.$ref!)) {
          logger.error({ ...aliasEntry, message: 'Circular alias detected.' });
        }
        const nextToken = (nextID && tokens[nextID.$ref.replace(/\/\$value$/, '')]) || undefined;
        if (!nextToken) {
          logger.error({ ...aliasEntry, message: `Could not resolve alias ${alias}.` });
        }
        refChain.push(nextID!.$ref);
        if (isAlias(nextToken!.mode[mode]!.$value as string)) {
          return resolveInner(nextToken!.mode[mode]!.$value as string, refChain);
        }
        return nextToken!.jsonID;
      }

      function traverseAndResolve(
        node: any,
        { expectedTypes, path }: { expectedTypes?: string[]; path: (string | number)[] },
      ): any {
        if (typeof node !== 'string') {
          if (Array.isArray(node)) {
            for (let i = 0; i < node.length; i++) {
              if (!node[i]) {
                continue;
              }
              node[i] = traverseAndResolve(node[i], {
                // special case: cubicBezier
                expectedTypes: expectedTypes?.includes('cubicBezier') ? ['number'] : expectedTypes,
                path: [...path, i],
              });
            }
          } else if (typeof node === 'object') {
            for (const key of Object.keys(node)) {
              if (!expectedTypes?.length || !EXPECTED_NESTED_ALIAS[expectedTypes[0]!] || !isAlias(node[key])) {
                continue;
              }
              node[key] = traverseAndResolve(node[key], {
                expectedTypes: EXPECTED_NESTED_ALIAS[expectedTypes[0]!]![key],
                path: [...path, key],
              });
            }
          }
          return node;
        }
        if (!isAlias(node)) {
          return node;
        }

        const refChain: string[] = [];
        const resolvedID = resolveInner(node, refChain);
        if (expectedTypes?.length && !expectedTypes.includes(tokens[resolvedID]!.$type)) {
          logger.error({
            ...aliasEntry,
            message: `Cannot alias to $type "${tokens[resolvedID]!.$type}" from $type "${expectedTypes.join(' / ')}".`,
          });
        }

        if (mode === '.') {
          // TODO: preserving graph analysis across alternate modes not supported at this time
          refMap[path.join('/')] = { filename: token.source.filename!, refChain };
        }

        return tokens[resolvedID]!.mode[mode]?.$value || tokens[resolvedID]!.$value;
      }

      // resolve DTCG aliases without
      const finalValue = traverseAndResolve(token.mode[mode]!.$value, {
        expectedTypes: token.$type ? [token.$type] : undefined,
        path: [token.jsonID, '$value'],
      });
      if (finalValue) {
        token.mode[mode]!.$value = finalValue;
      }

      // fill in $type and $value
      if (mode === '.') {
        token.$value = token.mode[mode]!.$value;
      }
    }
  }
}

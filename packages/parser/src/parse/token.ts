import * as momoa from '@humanwhocodes/momoa';
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
export function aliasToRef(alias: string, mode?: string): ReferenceObject | undefined {
  const id = parseAlias(alias);
  // if this is invalid, stop
  if (id === alias) {
    return;
  }
  return {
    $ref: `#/${id.replace(/~/g, '~0').replace(/\//g, '~1').replace(/\./g, '/')}${mode && mode !== '.' ? `/$extensions/mode/${mode}` : ''}/$value`,
  };
}

export interface TokenFromNodeOptions {
  groups: Record<string, GroupNormalized>;
  path: string[];
  source: InputSource;
  ignore: Config['ignore'];
}

/** Generate a TokenNormalized from a Momoa node */
export function tokenFromNode(
  node: momoa.AnyNode,
  { groups, path, source, ignore }: TokenFromNodeOptions,
): TokenNormalized | undefined {
  const isToken = node.type === 'Object' && getObjMember(node, '$value') && !path.includes('$extensions');
  if (!isToken) {
    return undefined;
  }

  const jsonID = `#/${path.join('/')}`;
  const id = path.join('.');

  const originalToken = momoa.evaluate(node) as any;

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
        aliasedBy: undefined,
        originalValue: undefined,
        dependencies: undefined,
        source: {
          ...nodeSource,
          node: (getObjMember(nodeSource.node, '$value') ?? nodeSource.node) as momoa.ObjectNode,
        },
      },
    },
  };

  // after assembling token, handle ignores to see if the final result should be ignored or not
  // filter out ignored
  if ((ignore?.deprecated && token.$deprecated) || (ignore?.tokens && wcmatch(ignore.tokens)(token.id))) {
    return;
  }

  const $extensions = getObjMember(node, '$extensions');
  if ($extensions) {
    const modeNode = getObjMember($extensions as momoa.ObjectNode, 'mode') as momoa.ObjectNode;
    for (const mode of Object.keys((token.$extensions as any).mode)) {
      const modeValue = (token.$extensions as any).mode[mode];
      token.mode[mode] = {
        $value: modeValue,
        aliasOf: undefined,
        aliasChain: undefined,
        partialAliasOf: undefined,
        aliasedBy: undefined,
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
  node: momoa.AnyNode,
  { filename, path }: { filename: string; path: string[] },
): TokenRawValues | undefined {
  const isToken = node.type === 'Object' && getObjMember(node, '$value') && !path.includes('$extensions');
  if (!isToken) {
    return undefined;
  }

  const jsonID = `#/${path.join('/')}`;
  const rawValues: TokenRawValues = {
    jsonID,
    originalValue: momoa.evaluate(node),
    source: { loc: filename, filename, node: node as momoa.ObjectNode },
    mode: {},
  };
  rawValues.mode['.'] = {
    originalValue: rawValues.originalValue.$value,
    source: { ...rawValues.source, node: getObjMember(node as momoa.ObjectNode, '$value') as momoa.ObjectNode },
  };
  const $extensions = getObjMember(node, '$extensions');
  if ($extensions) {
    const modes = getObjMember($extensions as momoa.ObjectNode, 'mode');
    if (modes) {
      for (const modeMember of (modes as momoa.ObjectNode).members) {
        const mode = (modeMember.name as momoa.StringNode).value;
        rawValues.mode[mode] = {
          originalValue: momoa.evaluate(modeMember.value),
          source: { loc: filename, filename, node: modeMember.value as momoa.ObjectNode },
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
  node: momoa.ObjectNode,
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
    (groups as any)[jsonID]![m.name.value] = momoa.evaluate(m.value);
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
  const getTokenRef = (ref: string) => ref.replace(/\/(\$value|\$extensions)\/?.*/, '');

  for (const [jsonID, { refChain }] of Object.entries(refMap)) {
    if (!refChain.length) {
      continue;
    }

    const mode = jsonID.match(/\/\$extensions\/mode\/([^/]+)/)?.[1] || '.';
    const rootRef = getTokenRef(jsonID);
    const modeValue = tokens[rootRef]?.mode[mode];
    if (!modeValue) {
      continue;
    }

    // aliasChain + dependencies
    if (!modeValue.dependencies) {
      modeValue.dependencies = [];
    }
    modeValue.dependencies.push(...refChain.filter((r) => !modeValue.dependencies!.includes(r)));
    modeValue.dependencies.sort((a, b) => a.localeCompare(b, 'en-us', { numeric: true }));

    // Top alias
    const isTopLevelAlias = jsonID.endsWith('/$value') || tokens[jsonID];
    if (isTopLevelAlias) {
      modeValue.aliasOf = refToTokenID(refChain.at(-1)!);
      const aliasChain = refChain.map(refToTokenID) as string[];
      modeValue.aliasChain = [...aliasChain];
    }

    // Partial alias
    const partial = jsonID
      .replace(/.*\/\$value\/?/, '')
      .split('/')
      .filter(Boolean);
    if (partial.length && modeValue.$value && typeof modeValue.$value === 'object') {
      let node: any = modeValue.$value;
      let sourceNode = modeValue.source.node as momoa.AnyNode;
      if (!modeValue.partialAliasOf) {
        modeValue.partialAliasOf = Array.isArray(modeValue.$value) || tokens[rootRef]?.$type === 'shadow' ? [] : {};
      }
      let partialAliasOf = modeValue.partialAliasOf as any;
      // special case: for shadows, normalize object to array
      if (tokens[rootRef]?.$type === 'shadow' && !Array.isArray(node)) {
        if (Array.isArray(modeValue.partialAliasOf) && !modeValue.partialAliasOf.length) {
          modeValue.partialAliasOf.push({} as any);
        }
        partialAliasOf = (modeValue.partialAliasOf as any)[0]!;
      }

      for (let i = 0; i < partial.length; i++) {
        let key = partial[i] as string | number;
        if (String(Number(key)) === key) {
          key = Number(key);
        }
        if (key in node && typeof node[key] !== 'undefined') {
          node = node[key];
          if (sourceNode.type === 'Object') {
            sourceNode = getObjMember(sourceNode, key as string) ?? sourceNode;
          } else if (sourceNode.type === 'Array') {
            sourceNode = sourceNode.elements[key as number]?.value ?? sourceNode;
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
      const baseToken = tokens[baseRef]?.mode[mode] || tokens[baseRef];
      if (!baseToken) {
        continue;
      }
      const upstream = aliasedByRefs.slice(i + 1);
      if (!upstream.length) {
        break;
      }
      if (!baseToken.aliasedBy) {
        baseToken.aliasedBy = [];
      }
      for (let j = 0; j < upstream.length; j++) {
        const downstream = refToTokenID(upstream[j]!)!;
        if (!baseToken.aliasedBy.includes(downstream)) {
          baseToken.aliasedBy.push(downstream);
          if (mode === '.') {
            tokens[baseRef]!.aliasedBy = baseToken.aliasedBy;
          }
        }
      }
      baseToken.aliasedBy.sort((a, b) => a.localeCompare(b, 'en-us', { numeric: true })); // sort, because the ordering is arbitrary and flaky
    }

    if (mode === '.') {
      tokens[rootRef]!.aliasChain = modeValue.aliasChain;
      tokens[rootRef]!.aliasedBy = modeValue.aliasedBy;
      tokens[rootRef]!.aliasOf = modeValue.aliasOf;
      tokens[rootRef]!.dependencies = modeValue.dependencies;
      tokens[rootRef]!.partialAliasOf = modeValue.partialAliasOf;
    }
  }
}

/** Convert valid DTCG alias to $ref Momoa Node */
export function aliasToMomoa(
  alias: string,
  loc: momoa.ObjectNode['loc'] = {
    start: { line: -1, column: -1, offset: 0 },
    end: { line: -1, column: -1, offset: 0 },
  },
): momoa.ObjectNode | undefined {
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
 * ⚠️ This is not mode-aware. This will flatten multiple modes into the same root token.
 */
export function refToTokenID($ref: ReferenceObject | string): string | undefined {
  const path = typeof $ref === 'object' ? $ref.$ref : $ref;
  if (typeof path !== 'string') {
    return;
  }
  const { subpath } = parseRef(path);
  return (subpath?.length && subpath.join('.').replace(/\.(\$value|\$extensions).*$/, '')) || undefined;
}

const EXPECTED_NESTED_ALIAS: Record<string, Record<string, string[]>> = {
  border: {
    color: ['color'],
    stroke: ['strokeStyle'],
    width: ['dimension'],
  },
  gradient: {
    color: ['color'],
    position: ['number'],
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
        const nextRef = aliasToRef(alias, mode)?.$ref!;
        if (refChain.includes(nextRef)) {
          logger.error({ ...aliasEntry, message: 'Circular alias detected.' });
        }
        const nextJSONID = nextRef.replace(/\/(\$value|\$extensions).*/, '');
        const nextToken = tokens[nextJSONID]?.mode[mode] || tokens[nextJSONID]?.mode['.'];
        if (!nextToken) {
          logger.error({ ...aliasEntry, message: `Could not resolve alias ${alias}.` });
        }
        refChain.push(nextRef);
        if (isAlias(nextToken!.originalValue! as string)) {
          return resolveInner(nextToken!.originalValue! as string, refChain);
        }
        return nextJSONID;
      }

      function traverseAndResolve(
        value: any,
        { node, expectedTypes, path }: { node: momoa.AnyNode; expectedTypes?: string[]; path: (string | number)[] },
      ): any {
        if (typeof value !== 'string') {
          if (Array.isArray(value)) {
            for (let i = 0; i < value.length; i++) {
              if (!value[i]) {
                continue;
              }
              value[i] = traverseAndResolve(value[i], {
                node: (node as momoa.ArrayNode).elements?.[i]?.value!,
                // special case: cubicBezier
                expectedTypes: expectedTypes?.includes('cubicBezier') ? ['number'] : expectedTypes,
                path: [...path, i],
              }).$value;
            }
          } else if (typeof value === 'object') {
            for (const key of Object.keys(value)) {
              if (!expectedTypes?.length || !EXPECTED_NESTED_ALIAS[expectedTypes[0]!]) {
                continue;
              }
              value[key] = traverseAndResolve(value[key], {
                node: getObjMember(node as momoa.ObjectNode, key)!,
                expectedTypes: EXPECTED_NESTED_ALIAS[expectedTypes[0]!]![key],
                path: [...path, key],
              }).$value;
            }
          }
          return { $value: value };
        }

        if (!isAlias(value)) {
          if (!expectedTypes?.includes('string') && (value.includes('{') || value.includes('}'))) {
            logger.error({ ...aliasEntry, message: 'Invalid alias syntax.', node });
          }
          return { $value: value };
        }

        const refChain: string[] = [];
        const resolvedID = resolveInner(value, refChain);
        if (expectedTypes?.length && !expectedTypes.includes(tokens[resolvedID]!.$type)) {
          logger.error({
            ...aliasEntry,
            message: `Cannot alias to $type "${tokens[resolvedID]!.$type}" from $type "${expectedTypes.join(' / ')}".`,
            node,
          });
        }

        refMap[path.join('/')] = { filename: token.source.filename!, refChain };

        return {
          $type: tokens[resolvedID]!.$type,
          $value: tokens[resolvedID]!.mode[mode]?.$value || tokens[resolvedID]!.$value,
        };
      }

      // resolve DTCG aliases without
      const pathBase = mode === '.' ? token.jsonID : `${token.jsonID}/$extensions/mode/${mode}`;
      const { $type, $value } = traverseAndResolve(token.mode[mode]!.$value, {
        node: aliasEntry.node!,
        expectedTypes: token.$type ? [token.$type] : undefined,
        path: [pathBase, '$value'],
      });
      if (!token.$type) {
        (token as any).$type = $type;
      }
      if ($value) {
        token.mode[mode]!.$value = $value;
      }

      // fill in $type and $value
      if (mode === '.') {
        token.$value = token.mode[mode]!.$value;
      }
    }
  }
}

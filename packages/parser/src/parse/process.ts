import type * as momoa from '@humanwhocodes/momoa';
import {
  encodeFragment,
  findNode,
  getObjMember,
  type InputSourceWithDocument,
  mergeObjects,
  parseRef,
  replaceNode,
  traverse,
} from '@terrazzo/json-schema-tools';
import { type GroupNormalized, isAlias, type TokenNormalizedSet } from '@terrazzo/token-tools';
import { alphaComparator } from '../lib/array.js';
import { filterResolverPaths } from '../lib/resolver-utils.js';
import type Logger from '../logger.js';
import type { ConfigInit, RefMap } from '../types.js';
import { assert, assertObjectNode, assertStringNode } from './assert.js';
import { normalize } from './normalize.js';
import {
  aliasToGroupRef,
  graphAliases,
  groupFromNode,
  refToTokenID,
  resolveAliases,
  tokenFromNode,
  tokenRawValuesFromNode,
} from './token.js';

export interface ProcessTokensOptions {
  config: ConfigInit;
  logger: Logger;
  sourceByFilename: Record<string, InputSourceWithDocument>;
  sources: InputSourceWithDocument[];
  isResolver?: boolean;
}

export function processTokens(
  rootSource: InputSourceWithDocument,
  { config, logger, sourceByFilename, isResolver }: ProcessTokensOptions,
): TokenNormalizedSet {
  const entry = { group: 'parser' as const, label: 'init' };

  // 1. Inline $refs to discover any additional tokens
  const refMap: RefMap = {};
  function resolveRef(node: momoa.StringNode, chain: string[]): momoa.AnyNode {
    const { subpath } = parseRef(node.value);
    assert(subpath, logger, { ...entry, message: 'Can’t resolve $ref', node, src: rootSource.src });
    const next = findNode(rootSource.document, subpath);
    assert(next, logger, {
      ...entry,
      message: "Can't find $ref",
      node,
      src: rootSource.src,
    });
    if (next?.type === 'Object') {
      const next$ref = getObjMember(next, '$ref');
      if (next$ref && next$ref.type === 'String') {
        if (chain.includes(next$ref.value)) {
          logger.error({
            ...entry,
            message: `Circular $ref detected: ${JSON.stringify(next$ref.value)}`,
            node: next$ref,
            src: rootSource.src,
          });
        }
        chain.push(next$ref.value);
        return resolveRef(next$ref, chain);
      }
    }
    return next;
  }
  const inlineStart = performance.now();
  traverse(rootSource.document, {
    enter(node, _parent, rawPath) {
      if (rawPath.includes('$extensions') || node.type !== 'Object') {
        return;
      }
      const $ref = node.type === 'Object' ? getObjMember(node, '$ref') : undefined;
      if (!$ref) {
        return;
      }
      assertStringNode($ref, logger, {
        ...entry,
        message: 'Invalid $ref. Expected string.',
        node: $ref,
        src: rootSource.src,
      });
      const jsonID = encodeFragment(rawPath);
      refMap[jsonID] = { filename: rootSource.filename.href, refChain: [$ref.value] };
      const resolved = resolveRef($ref, refMap[jsonID]!.refChain);
      if (resolved.type === 'Object') {
        node.members.splice(
          node.members.findIndex((m) => m.name.type === 'String' && m.name.value === '$ref'),
          1,
        );
        replaceNode(node, mergeObjects(resolved, node));
      } else {
        replaceNode(node, resolved);
      }
    },
  });
  logger.debug({ ...entry, message: 'Inline aliases', timing: performance.now() - inlineStart });

  // 2. Resolve $extends to discover any more additional tokens
  function flatten$extends(node: momoa.ObjectNode, chain: string[]) {
    const memberKeys = node.members.map((m) => m.name.type === 'String' && m.name.value).filter(Boolean) as string[];

    if (memberKeys.includes('$extends')) {
      const $extends = getObjMember(node, '$extends');
      assertStringNode($extends, logger, {
        ...entry,
        message: '$extends must be a string',
        node: $extends,
        src: rootSource.src,
      });

      if (memberKeys.includes('$value')) {
        logger.error({ ...entry, message: '$extends can’t exist within a token', node: $extends, src: rootSource.src });
      }
      const next = isAlias($extends.value) ? aliasToGroupRef($extends.value) : undefined;

      assert(next, logger, {
        ...entry,
        message: '$extends must be a valid alias',
        node: $extends,
        src: rootSource.src,
      });

      if (
        chain.includes(next.$ref) ||
        // Check that $extends is not importing from higher up (could go in either direction, which is why we check both ways)
        chain.some((value) => value.startsWith(next.$ref) || next.$ref.startsWith(value))
      ) {
        logger.error({ ...entry, message: 'Circular $extends detected', node: $extends, src: rootSource.src });
      }

      chain.push(next.$ref);
      const extended = findNode(rootSource.document, parseRef(next.$ref).subpath ?? []);
      assert(extended, logger, {
        ...entry,
        message: 'Could not resolve $extends',
        node: $extends,
        src: rootSource.src,
      });
      assertObjectNode(extended, logger, { ...entry, message: '$extends must resolve to a group of tokens', node });

      // To ensure this is resolvable, try and flatten this node first (will catch circular refs)
      flatten$extends(extended, chain);

      replaceNode(node, mergeObjects(extended, node));
    }

    // Deeply-traverse for any interior $extends (even if it wasn’t at the top level)
    for (const member of node.members) {
      if (
        member.value.type === 'Object' &&
        member.name.type === 'String' &&
        !['$value', '$extensions'].includes(member.name.value)
      ) {
        traverse(member.value, {
          enter(subnode, _parent) {
            if (subnode.type === 'Object') {
              flatten$extends(subnode, chain);
            }
          },
        });
      }
    }
  }

  const extendsStart = performance.now();
  const extendsChain: string[] = [];
  flatten$extends(rootSource.document.body as momoa.ObjectNode, extendsChain);
  logger.debug({ ...entry, message: 'Resolving $extends', timing: performance.now() - extendsStart });

  // 3. Parse discovered tokens
  const firstPass = performance.now();
  const tokens: TokenNormalizedSet = {};
  // micro-optimization: while we’re iterating over tokens, keeping a “hot”
  // array in memory saves recreating arrays from object keys over and over again.
  // it does produce a noticeable speedup > 1,000 tokens.
  const tokenIDs: string[] = [];
  const groups: Record<string, GroupNormalized> = {};

  // 3a. Token & group population
  traverse(rootSource.document, {
    enter(node, _parent, rawPath) {
      if (node.type !== 'Object') {
        return;
      }
      groupFromNode(node, { path: isResolver ? filterResolverPaths(rawPath) : rawPath, groups });
      const token = tokenFromNode(node, {
        groups,
        ignore: config.ignore,
        path: isResolver ? filterResolverPaths(rawPath) : rawPath,
        source: rootSource,
      });
      if (token) {
        tokenIDs.push(token.jsonID);
        tokens[token.jsonID] = token;
      }
    },
  });

  logger.debug({ ...entry, message: 'Parsing: 1st pass', timing: performance.now() - firstPass });
  const secondPass = performance.now();

  // 3b. Resolve originalValue and original sources
  for (const source of Object.values(sourceByFilename)) {
    traverse(source.document, {
      enter(node, _parent, path) {
        if (node.type !== 'Object') {
          return;
        }

        const tokenRawValues = tokenRawValuesFromNode(node, { filename: source.filename!.href, path });
        if (tokenRawValues && tokens[tokenRawValues?.jsonID]) {
          tokens[tokenRawValues.jsonID]!.originalValue = tokenRawValues.originalValue;
          tokens[tokenRawValues.jsonID]!.mode['.'].originalValue = tokenRawValues.originalValue;
          tokens[tokenRawValues.jsonID]!.source = tokenRawValues.source;
          for (const mode of Object.keys(tokenRawValues.mode)) {
            tokens[tokenRawValues.jsonID]!.mode[mode]!.originalValue = tokenRawValues.mode[mode]!.originalValue;
            tokens[tokenRawValues.jsonID]!.mode[mode]!.source = tokenRawValues.mode[mode]!.source;
          }
        }
      },
    });
  }

  // 3c. DTCG alias resolution
  // Unlike $refs which can be resolved as we go, these can’t happen until the final, flattened set
  resolveAliases(tokens, { logger, sources: sourceByFilename, refMap });
  logger.debug({ ...entry, message: 'Parsing: 2nd pass', timing: performance.now() - secondPass });

  // 4. Alias graph
  // We’ve resolved aliases, but we need this pass for reverse linking i.e. “aliasedBy”
  const aliasStart = performance.now();
  graphAliases(refMap, { tokens, logger, sources: sourceByFilename });
  logger.debug({ ...entry, message: 'Alias graph built', timing: performance.now() - aliasStart });

  // 5. normalize
  // Allow for some minor variance in inputs, and be nice to folks.
  const normalizeStart = performance.now();
  for (const id of tokenIDs) {
    const token = tokens[id]!;
    normalize(token as any, { logger, src: sourceByFilename[token.source.filename!]?.src });
  }
  logger.debug({ ...entry, message: 'Normalized values', timing: performance.now() - normalizeStart });

  // 6. alphabetize & filter
  // This can’t happen until the last step, where we’re 100% sure we’ve resolved everything.
  if (config.alphabetize === false) {
    return tokens;
  }

  const sortStart = performance.now();
  const tokensSorted: TokenNormalizedSet = {};
  tokenIDs.sort(alphaComparator);
  for (const path of tokenIDs) {
    const id = refToTokenID(path)!;
    tokensSorted[id] = tokens[path]!;
  }
  // Sort group IDs once, too
  for (const group of Object.values(groups)) {
    group.tokens.sort(alphaComparator);
  }
  logger.debug({ ...entry, message: 'Sorted tokens', timing: performance.now() - sortStart });

  return tokensSorted;
}

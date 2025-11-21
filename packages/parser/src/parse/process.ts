import { type InputSourceWithDocument, type RefMap, traverse } from '@terrazzo/json-schema-tools';
import type { GroupNormalized, TokenNormalizedSet } from '@terrazzo/token-tools';
import { filterResolverPaths } from '../lib/resolver-utils.js';
import type Logger from '../logger.js';
import { isLikelyResolver } from '../resolver/validate.js';
import type { ConfigInit } from '../types.js';
import { normalize } from './normalize.js';
import {
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
  refMap: RefMap;
  sources: InputSourceWithDocument[];
}

export function processTokens(
  rootSource: InputSourceWithDocument,
  { config, logger, sourceByFilename, refMap }: ProcessTokensOptions,
): TokenNormalizedSet {
  const entry = { group: 'parser' as const, label: 'init' };

  // 2. Parse
  const firstPass = performance.now();
  const tokens: TokenNormalizedSet = {};
  // micro-optimization: while we’re iterating over tokens, keeping a “hot”
  // array in memory saves recreating arrays from object keys over and over again.
  // it does produce a noticeable speedup > 1,000 tokens.
  const tokenIDs: string[] = [];
  const groups: Record<string, GroupNormalized> = {};

  // 2a. Token & group population
  const isResolver = isLikelyResolver(rootSource.document);
  traverse(rootSource.document, {
    enter(node, _parent, rawPath) {
      if (node.type !== 'Object') {
        return;
      }
      const path = isResolver ? filterResolverPaths(rawPath) : rawPath;
      groupFromNode(node, { path, groups });
      const token = tokenFromNode(node, {
        groups,
        ignore: config.ignore,
        path,
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

  // 2b. Resolve originalValue and original sources
  for (const source of Object.values(sourceByFilename)) {
    traverse(source.document, {
      enter(node, _parent, path) {
        if (node.type !== 'Object') {
          return;
        }

        const tokenRawValues = tokenRawValuesFromNode(node, { filename: source.filename!.href, path });
        if (tokenRawValues && tokens[tokenRawValues?.jsonID]) {
          tokens[tokenRawValues.jsonID]!.originalValue = tokenRawValues.originalValue;
          tokens[tokenRawValues.jsonID]!.source = tokenRawValues.source;
          for (const mode of Object.keys(tokenRawValues.mode)) {
            tokens[tokenRawValues.jsonID]!.mode[mode]!.originalValue = tokenRawValues.mode[mode]!.originalValue;
            tokens[tokenRawValues.jsonID]!.mode[mode]!.source = tokenRawValues.mode[mode]!.source;
          }
        }
      },
    });
  }

  // 2c. DTCG alias resolution
  // Unlike $refs which can be resolved as we go, these can’t happen until the final, flattened set
  resolveAliases(tokens, { logger, sources: sourceByFilename, refMap });
  logger.debug({ ...entry, message: 'Parsing: 2nd pass', timing: performance.now() - secondPass });

  // 3. Alias graph
  // We’ve resolved aliases, but we need this pass for reverse linking i.e. “aliasedBy”
  const aliasStart = performance.now();
  graphAliases(refMap, { tokens, logger, sources: sourceByFilename });
  logger.debug({ ...entry, message: 'Alias graph built', timing: performance.now() - aliasStart });

  // 4. normalize
  // Allow for some minor variance in inputs, and be nice to folks.
  const normalizeStart = performance.now();
  for (const id of tokenIDs) {
    const token = tokens[id]!;
    normalize(token as any, { logger, src: sourceByFilename[token.source.filename!]?.src });
  }
  logger.debug({ ...entry, message: 'Normalized values', timing: performance.now() - normalizeStart });

  // 5. alphabetize & filter
  // This can’t happen until the last step, where we’re 100% sure we’ve resolved everything.
  const tokensSorted: TokenNormalizedSet = {};
  tokenIDs.sort((a, b) => a.localeCompare(b, 'en-us', { numeric: true }));
  for (const path of tokenIDs) {
    // Filter out any tokens in $defs (we needed to reference them earlier, but shouldn’t include them in the final assortment)
    if (path.includes('/$defs/')) {
      continue;
    }
    const id = refToTokenID(path)!;
    tokensSorted[id] = tokens[path]!;
  }
  // Sort group IDs once, too
  for (const group of Object.values(groups)) {
    group.tokens.sort((a, b) => a.localeCompare(b, 'en-us', { numeric: true }));
  }

  return tokensSorted;
}

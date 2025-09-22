import { type ObjectNode, print } from '@humanwhocodes/momoa';
import { type GroupNormalized, isAlias, type TokenNormalized, type TokenNormalizedSet } from '@terrazzo/token-tools';
import type Logger from '../logger.js';
import type { InputSource, ParseOptions } from '../types.js';
import { bundle, toMomoa, traverseAsync } from './json.js';
import { normalize } from './normalize.js';
import {
  aliasToRef,
  graphAliases,
  groupFromNode,
  refToTokenID,
  tokenFromNode,
  tokenRawValuesFromNode,
} from './token.js';

/** Ephemeral format that only exists while parsing the document. This is not confirmed to be DTCG yet. */
export interface IntermediaryToken {
  id: string;
  /** Was this token aliasing another? */
  $ref?: string;
  $type?: string;
  $description?: string;
  $deprecated?: string | boolean;
  $value: unknown;
  $extensions?: Record<string, unknown>;
  group: TokenNormalized['group'];
  aliasOf?: string;
  partialAliasOf?: Record<string, any> | any[];
  mode: Record<
    string,
    {
      $type?: string;
      $value: unknown;
      aliasOf?: string;
      partialAliasOf?: Record<string, any> | any[];
      source?: { filename?: URL; node: ObjectNode };
    }
  >;
  source: {
    filename?: URL;
    node: ObjectNode;
  };
}

export interface LoadOptions extends Pick<ParseOptions, 'continueOnError' | 'yamlToMomoa' | 'transform'> {
  logger: Logger;
}

/** Load from multiple entries, while resolving remote files */
export async function loadSources(
  inputs: Omit<InputSource, 'document'>[],
  { logger, continueOnError, yamlToMomoa, transform }: LoadOptions,
): Promise<{ tokens: TokenNormalizedSet; sources: InputSource[] }> {
  const entry = { group: 'parser' as const, label: 'init' };
  const sources = inputs.map((input, i) => ({
    ...input,
    filename: input.filename ?? new URL(`virtual:${i}`), // for objects created in memory, an index-based ID helps associate tokens with these
  })) as InputSource[];
  const sourceByFilename: Record<string, InputSource> = {};

  function parseWithTransform(input: (typeof inputs)[number]) {
    let { document } = toMomoa(input.src, { logger, continueOnError, filename: input.filename, yamlToMomoa });

    // If there’s a root transformer, reparse
    if (transform?.root) {
      const json = typeof input.src === 'string' ? JSON.parse(input.src) : input.src;
      const result = transform.root(json, '.', document);
      if (result) {
        const reRunResult = toMomoa(result, {
          filename: input.filename,
          logger,
          continueOnError, // YAML not needed in transform()
        });
        document = reRunResult.document;
      }
    }

    return document;
  }

  // 1. Bundle root documents together
  const firstLoad = performance.now();
  logger.debug({ ...entry, message: `Loading token files` });
  for (const source of sources) {
    source.document = parseWithTransform(source);
    if (typeof source.src !== 'string') {
      source.src = print(source.document, { indent: 2 });
    }
    sourceByFilename[source.filename!.href] = source;
  }
  const { document: merged, aliasMap } = await bundle(sources, {
    continueOnError: !!continueOnError,
    logger,
    parse: parseWithTransform,
  });
  logger.debug({
    ...entry,
    message: `Loading done`,
    timing: performance.now() - firstLoad,
  });
  const artificialSource = { src: print(merged, { indent: 2 }), document: merged };

  // 2. Parse
  const resolveStart = performance.now();
  const tokens: TokenNormalizedSet = {};
  const groups: Record<string, GroupNormalized> = {};
  logger.debug({ ...entry, message: 'Parsing tokens' });

  // 2a. Token & group population
  await traverseAsync(merged, {
    async enter(node, _parent, path) {
      if (node.type !== 'Object') {
        return;
      }
      groupFromNode(node, { path, groups });
      const token = tokenFromNode(node, {
        groups,
        path,
        // Give all tokens the artificial merged source to account for tokens created via $refs.
        // In the 2nd pass we’ll overwrite hand-typed tokens with their true source.
        source: { src: artificialSource, document: merged },
      });
      if (token) {
        tokens[token.jsonID] = token;
      }
    },
  });

  // 2b. Resolve originalValue and original sources
  for (const source of sources) {
    await traverseAsync(source.document, {
      async enter(node, _parent, path) {
        if (node.type !== 'Object') {
          return;
        }

        const tokenRawValues = tokenRawValuesFromNode(node, { filename: source.filename!.href, path });
        if (tokenRawValues) {
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
  // Note: these have to be resolved after $refs. Because they technically
  // aren’t convertible to $refs until the final document is built.
  for (const token of Object.values(tokens)) {
    const aliasEntry = {
      ...entry,
      message: ``,
      src: sourceByFilename[token.source.filename!]?.src,
      node: token.source.node,
    };
    for (const mode of Object.keys(token.mode)) {
      if (!isAlias(token.mode[mode]!.$value as string)) {
        continue;
      }

      const refChain: string[] = [];
      function resolveAlias(alias: string): string {
        const nextID = aliasToRef(alias);
        const nextToken = (nextID && tokens[nextID.$ref.replace(/\/\$value$/, '')]) || undefined;
        if (!nextToken) {
          logger.error({ ...aliasEntry, message: `Could not resolve alias ${alias}` });
        }
        refChain.push(nextID!.$ref);
        if (isAlias(nextToken!.mode[mode]!.$value as string)) {
          return resolveAlias(nextToken!.mode[mode]!.$value as string);
        }
        return nextToken!.jsonID;
      }

      const resolvedID = resolveAlias(token.mode[mode]!.$value as string);
      token.mode[mode]!.$value = tokens[resolvedID]!.mode[mode]!.$value;
      aliasMap[token.jsonID] = { filename: token.source.filename!, refChain };

      if (token.$type && tokens[resolvedID]!.$type !== token.$type) {
        logger.error({
          ...aliasEntry,
          message: `Cannot alias to $type "${tokens[resolvedID]!.$type}" from $type "${token.$type}".`,
        });
      }
      token.$type = tokens[resolvedID]!.$type;

      if (mode === '.') {
        token.$value = token.mode[mode]!.$value;
      }
    }
  }
  logger.debug({ ...entry, message: 'Parsing done', timing: performance.now() - resolveStart });

  // 3. Alias graph
  const aliasStart = performance.now();
  logger.debug({ ...entry, message: 'Building alias graph' });
  for (const jsonID of Object.keys(aliasMap)) {
    graphAliases({
      tokens,
      jsonID,
      refChain: aliasMap[jsonID]?.refChain ?? [],
      logger,
      src: sourceByFilename[tokens[jsonID]!.source.filename!]?.src,
    });
  }
  logger.debug({ ...entry, message: 'Alias graph built', timing: performance.now() - aliasStart });

  // 4. normalize
  const normalizeStart = performance.now();
  logger.debug({ ...entry, message: 'Normalizing start' });
  for (const token of Object.values(tokens)) {
    normalize(token as any, { logger, src: sourceByFilename[token.source.filename!]?.src });
  }
  logger.debug({ ...entry, message: 'Normalizing done', timing: performance.now() - normalizeStart });

  // 5. alphabetize (reduces noise across plugin outputs)
  const sortedKeys = Object.keys(tokens)
    .sort()
    .map<[string, string]>((path) => [path, refToTokenID(path)!]);
  const tokensSorted: TokenNormalizedSet = {};
  for (const [path, id] of sortedKeys) {
    tokensSorted[id] = tokens[path]!;
  }

  return { tokens: tokensSorted, sources };
}

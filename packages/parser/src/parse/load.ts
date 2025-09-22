import * as momoa from '@humanwhocodes/momoa';
import { bundle, getObjMember, type RefMap, replaceNode, traverseAsync } from '@terrazzo/json-schema-tools';
import type { GroupNormalized, TokenNormalized, TokenNormalizedSet } from '@terrazzo/token-tools';
import { toMomoa } from '../lib/momoa.js';
import type Logger from '../logger.js';
import type { InputSource, ParseOptions } from '../types.js';
import { normalize } from './normalize.js';
import {
  graphAliases,
  groupFromNode,
  refToTokenID,
  resolveAliases,
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
      source?: { filename?: URL; node: momoa.ObjectNode };
    }
  >;
  source: {
    filename?: URL;
    node: momoa.ObjectNode;
  };
}

export interface LoadOptions extends Pick<ParseOptions, 'config' | 'continueOnError' | 'yamlToMomoa' | 'transform'> {
  logger: Logger;
}

/** Load from multiple entries, while resolving remote files */
export async function loadSources(
  inputs: Omit<InputSource, 'document'>[],
  { config, logger, continueOnError, yamlToMomoa, transform }: LoadOptions,
): Promise<{ tokens: TokenNormalizedSet; sources: InputSource[] }> {
  const entry = { group: 'parser' as const, label: 'init' };

  // 1. Bundle root documents together
  const firstLoad = performance.now();
  logger.debug({ ...entry, message: `Loading token files` });
  let document = {} as momoa.DocumentNode;

  /** The original user inputs, in original order, with parsed ASTs */
  const sources = inputs.map((input, i) => ({
    ...input,
    document: {} as momoa.DocumentNode,
    filename: input.filename || new URL(`virtual:${i}`), // for objects created in memory, an index-based ID helps associate tokens with these
  }));
  /** The sources array, indexed by filename */
  let sourceByFilename: Record<string, InputSource> = {};
  /** Mapping of all final $ref resolutions. This will be used to generate the graph later. */
  let refMap: RefMap = {};

  try {
    const result = await bundle(sources, {
      parse: transform
        ? async (src, filename) => {
            const document = toMomoa(src);
            let lastPath = '#/';
            let last$type: string | undefined;
            await traverseAsync(src, {
              async enter(node, parent, path) {
                const ctx = { filename, parent, path };
                switch (node.type) {
                  case 'Document': {
                    const result = transform.root?.(structuredClone(node), ctx);
                    if (result) {
                      if (result.type !== 'Document') {
                        logger.error({ ...entry, message: `Expected Document, received ${result.type}` });
                      }
                      replaceNode(document, result);
                    }
                    break;
                  }
                  case 'Object': {
                    const next$type = getObjMember(node, '$type');
                    if (next$type?.type === 'String') {
                      const jsonPath = `#/${path.join('/')}`;
                      if (jsonPath.startsWith(lastPath)) {
                        last$type = next$type.value;
                      }
                      lastPath = jsonPath;
                    }
                    if (getObjMember(node, '$value')) {
                      let result: any = transform.token?.(structuredClone(node), ctx);
                      if (result) {
                        replaceNode(document, result);
                        result = undefined;
                      }
                      result = transform[last$type as keyof typeof transform]?.(structuredClone(node as any), ctx);
                      if (result) {
                        replaceNode(document, result);
                      }
                    } else {
                      const result = transform.group?.(structuredClone(node), ctx);
                      if (result) {
                        replaceNode(document, result);
                      }
                    }
                    break;
                  }
                }
              },
            });
            return document;
          }
        : undefined,
      yamlToMomoa,
    });
    document = result.document;
    sourceByFilename = result.sources;
    refMap = result.refMap;
    for (const [filename, source] of Object.entries(result.sources)) {
      const i = sources.findIndex((s) => s.filename.href === filename);
      if (i === -1) {
        sources.push(source);
      } else {
        sources[i]!.src = source.src; // this is a sanitized source that is easier to work with
        sources[i]!.document = source.document;
      }
    }
  } catch (err) {
    let src = sources.find((s) => s.filename.href === (err as any).filename)?.src;
    if (src && typeof src !== 'string') {
      src = JSON.stringify(src, undefined, 2);
    }
    logger.error({
      ...entry,
      continueOnError,
      message: (err as Error).message,
      node: (err as any).node,
      src,
    });
  }

  logger.debug({
    ...entry,
    message: `Loading done`,
    timing: performance.now() - firstLoad,
  });
  const artificialSource = { src: momoa.print(document, { indent: 2 }), document };

  // 2. Parse
  const resolveStart = performance.now();
  const tokens: TokenNormalizedSet = {};
  const groups: Record<string, GroupNormalized> = {};
  logger.debug({ ...entry, message: 'Parsing tokens' });

  // 2a. Token & group population
  await traverseAsync(document, {
    async enter(node, _parent, path) {
      if (node.type !== 'Object') {
        return;
      }
      groupFromNode(node, { path, groups });
      const token = tokenFromNode(node, {
        groups,
        ignore: config.ignore,
        path,
        source: { src: artificialSource, document },
      });
      if (token) {
        tokens[token.jsonID] = token;
      }
    },
  });

  // 2b. Resolve originalValue and original sources
  for (const source of Object.values(sourceByFilename)) {
    await traverseAsync(source.document, {
      async enter(node, _parent, path) {
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
  // Note: these have to be resolved after $refs. Because they technically
  // aren’t convertible to $refs until the final document is built.
  resolveAliases(tokens, { logger, sources: sourceByFilename, refMap });
  logger.debug({ ...entry, message: 'Parsing done', timing: performance.now() - resolveStart });

  // 3. Alias graph
  const aliasStart = performance.now();
  logger.debug({ ...entry, message: 'Building alias graph' });
  graphAliases(refMap, {
    tokens,
    logger,
    sources: sourceByFilename,
  });
  logger.debug({ ...entry, message: 'Alias graph built', timing: performance.now() - aliasStart });

  // 4. normalize
  const normalizeStart = performance.now();
  logger.debug({ ...entry, message: 'Normalizing start' });
  for (const token of Object.values(tokens)) {
    normalize(token as any, { logger, src: sourceByFilename[token.source.filename!]?.src });
  }
  logger.debug({ ...entry, message: 'Normalizing done', timing: performance.now() - normalizeStart });

  // 5. alphabetize & filter
  const tokensSorted: TokenNormalizedSet = {};
  const sortedKeys = Object.keys(tokens).sort((a, b) => a.localeCompare(b, 'en-us', { numeric: true }));
  for (const path of sortedKeys) {
    // Filter out any tokens in $defs (we needed to reference them earlier, but shouldn’t include them in the final assortment)
    if (path.includes('/$defs/')) {
      continue;
    }
    const id = refToTokenID(path)!;
    tokensSorted[id] = tokens[path]!;
  }

  return { tokens: tokensSorted, sources };
}

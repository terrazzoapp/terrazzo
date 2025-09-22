import { type DocumentNode, parse as momoaParse, type ObjectNode, print } from '@humanwhocodes/momoa';
import { bundle, type RefMap, traverseAsync } from '@terrazzo/json-schema-tools';
import type { GroupNormalized, TokenNormalized, TokenNormalizedSet } from '@terrazzo/token-tools';
import type yamlToMomoa from 'yaml-to-momoa';
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
      source?: { filename?: URL; node: ObjectNode };
    }
  >;
  source: {
    filename?: URL;
    node: ObjectNode;
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

  function parseWithTransform(src: any, filename: URL) {
    let document = toMomoa(src, filename, yamlToMomoa);

    // If there’s a root transformer, reparse
    if (transform?.root) {
      const json = typeof src === 'string' ? JSON.parse(src) : src;
      const result = transform.root(json, '.', document);
      if (result) {
        const reRunResult = toMomoa(result, filename);
        document = reRunResult;
      }
    }

    return document;
  }

  // 1. Bundle root documents together
  const firstLoad = performance.now();
  logger.debug({ ...entry, message: `Loading token files` });
  let document = {} as DocumentNode;

  /** The original user inputs, in original order, with parsed ASTs */
  const sources = inputs.map((input, i) => ({
    ...input,
    document: {} as DocumentNode,
    filename: input.filename || new URL(`virtual:${i}`), // for objects created in memory, an index-based ID helps associate tokens with these
  }));
  /** The sources array, indexed by filename */
  let sourceByFilename: Record<string, InputSource> = {};
  /** Mapping of all final $ref resolutions. This will be used to generate the graph later. */
  let refMap = {} as RefMap;

  try {
    const result = await bundle(sources, {
      parse: parseWithTransform,
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
  const artificialSource = { src: print(document, { indent: 2 }), document };

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
        // Give all tokens the artificial merged source to account for tokens created via $refs.
        // In the 2nd pass we’ll overwrite hand-typed tokens with their true source.
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

function toMomoa(srcRaw: any, _filename: URL, ytm?: typeof yamlToMomoa): DocumentNode {
  let src = '';
  if (typeof srcRaw === 'string') {
    src = srcRaw;
  }
  let document = {} as DocumentNode;
  if (typeof srcRaw === 'string' && !maybeRawJSON(srcRaw)) {
    if (ytm) {
      document = ytm(srcRaw); // if string, but not JSON, attempt YAML
    } else {
      throw new Error(`Install yaml-to-momoa package to parse YAML, and pass in as option, e.g.:

    import { parse } from '@terrazzo/parser';
    import yamlToMomoa from 'yaml-to-momoa';

    parse(yamlString, { yamlToMomoa });`);
    }
  } else {
    document = momoaParse(typeof srcRaw === 'string' ? srcRaw : JSON.stringify(srcRaw, undefined, 2), {
      mode: 'jsonc',
      ranges: true,
      tokens: true,
    });
  }
  if (!src) {
    src = print(document, { indent: 2 });
  }
  return document;
}

/** Determine if an input is likely a JSON string */
function maybeRawJSON(input: string): boolean {
  return typeof input === 'string' && input.trim().startsWith('{');
}

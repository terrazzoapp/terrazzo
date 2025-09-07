import { type DocumentNode, evaluate, type ObjectNode, print } from '@humanwhocodes/momoa';
import parseRef from '@terrazzo/json-ref-parser';
import {
  type GroupNormalized,
  isAlias,
  parseAlias,
  type Token,
  type TokenNormalized,
  type TokenNormalizedSet,
} from '@terrazzo/token-tools';
import type Logger from '../logger.js';
import type { InputSource, ParseOptions } from '../types.js';
import { aliasToMomoa, flatten$refs, getObjMember, refToTokenID, replaceNode, toMomoa, traverse } from './json.js';
import { normalize } from './normalize.js';
import { detectCircularAliases, resolveRaw } from './resolve.js';
import { groupFromNode, markAliases, tokenFromNode } from './token.js';

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
  const sources = inputs.map((i) => ({
    ...i,
    filename: i.filename ?? new URL(`virtual:${i}`), // for objects created in memory, an index-based ID helps associate tokens with these
  })) as InputSource[];

  function parseWithTransform(input: (typeof inputs)[number]) {
    let { document } = toMomoa(input.src, { logger, continueOnError, filename: input.filename, yamlToMomoa });

    // If there’s a root transformer, reparse
    if (transform?.root) {
      const json = typeof input.src === 'string' ? JSON.parse(input.src) : input.src;
      const result = transform?.root(json, '.', document);
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

  // 1. parse root-level documents
  const firstLoad = performance.now();
  logger.debug({ ...entry, message: `Parsing tokens` });
  await Promise.all(
    inputs.map(async (input, i) => {
      if (!input || typeof input !== 'object') {
        logger.error({ ...entry, message: `Input (${i}) must be an object.` });
      }
      if (!input.src || (typeof input.src !== 'string' && typeof input.src !== 'object')) {
        logger.error({ ...entry, message: `Input (${i}) missing "src" with a JSON/YAML string, or JSON object.` });
      }
      if (input.filename) {
        if (!(input.filename instanceof URL)) {
          logger.error({ ...entry, message: `Input (${i}) "filename" must be a URL (remote or file URL).` });
        }
      }

      // Note: we’re still parsing with Momoa because folks may use JSONC or YAML
      sources[i]!.document = parseWithTransform(input);
      // For objects created in memory, use the source code formatted by Momoa
      if (typeof sources[i]!.src !== 'string') {
        sources[i]!.src = print(sources[i]!.document, { indent: 2 });
      }
    }),
  );
  logger.debug({
    ...entry,
    message: `Parsing tokens done`,
    timing: performance.now() - firstLoad,
  });

  // 2. fetch sub-documents
  const fetchStart = performance.now();
  logger.debug({ ...entry, message: `Fetch remote files` });
  const sharedCache = Object.fromEntries(sources.map((s) => [s.filename!.href, s]));
  async function recursiveResolve(source: InputSource): Promise<void> {
    const queue: Promise<void>[] = [];
    traverse(source.document, {
      enter(node) {
        const $ref = node.type === 'Object' ? getObjMember(node, '$ref') : undefined;
        if ($ref?.type !== 'String') {
          return;
        }
        const { url } = parseRef($ref.value);
        if (!url || url === '.') {
          return;
        }
        try {
          const absoluteURL = new URL(url, source.filename!);
          if (sharedCache[absoluteURL.href]) {
            return; // already fetched
          }
          sharedCache[absoluteURL.href] = { filename: absoluteURL, src: '', document: {} as DocumentNode }; // insert placeholder synchronously so we don’t load the same resources in parallel
          queue.push(
            resolveRaw(absoluteURL).then(async (src) => {
              sharedCache[absoluteURL.href]!.src = src;
              const document = parseWithTransform({ src, filename: absoluteURL });
              sharedCache[absoluteURL.href]!.document = document;
              await recursiveResolve(sharedCache[absoluteURL.href]!);
            }),
          );
        } catch {
          logger.error({
            ...entry,
            message: `Cannot resolve ${url} from ${source.filename?.href}`,
            node,
            src: source.src,
          });
        }
      },
    });
    await Promise.all(queue);
  }
  await Promise.all(sources.map(recursiveResolve));
  logger.debug({ ...entry, message: `Fetch done`, timing: performance.now() - fetchStart });

  // 3. Initial pass
  const resolveStart = performance.now();
  const tokens: TokenNormalizedSet = {};
  const groups: Record<string, GroupNormalized> = {};
  const aliasMap = new Map<string, { filename: string; aliasChain: string[] }>();
  logger.debug({ ...entry, message: 'Parsing start' });
  for (const source of sources) {
    const { src } = source;
    // 1st pass: flatten, and resolve values
    // We flatten first because some tokens might be “hiding” inside $ref generation. This lets us get the full count soonest.
    const mutatedCopy = structuredClone(source.document);
    traverse(mutatedCopy, {
      // before we start parsing, we have to resolve all $refs, because those may affect the final structure significantly.
      // after a full pass of inlining $refs, then we can update the token values
      enter(node, _, path) {
        if (node.type !== 'Object' || path.includes('$extensions') || path.includes('$defs')) {
          return;
        }
        const jsonID = `#/${path.join('/')}`;
        const aliasChain: string[] = [];
        const options = { source, sources: sharedCache, aliasChain, visited: [] };
        try {
          const flattened = flatten$refs(node, options) as ObjectNode;
          replaceNode(node, flattened);
          groupFromNode(node, { groups, path });
          if (aliasChain.length) {
            aliasMap.set(jsonID, { filename: source.filename!.href, aliasChain });
          }
        } catch (err) {
          logger.error({ ...entry, message: (err as Error).message, node, src });
        }
      },
      exit(node, _parent, path) {
        const token = tokenFromNode(node, { groups, path, source });
        if (token) {
          tokens[token.jsonID] = token;
        }
      },
    });

    // 2nd pass: resolve originalValue
    // When we flattened $refs to get all tokens, we lost the original structure. This is a
    // quicker pass that only gets the original, composed values
    traverse(source.document, {
      enter(node, _parent, path) {
        if (
          node.type === 'Object' &&
          getObjMember(node, '$value') &&
          !path.includes('$extensions') &&
          !path.includes('$defs')
        ) {
          const id = `#/${path.join('/')}`;
          if (!tokens[id]) {
            logger.error({
              ...entry,
              message: 'Terrazzo encountered an error in parsing. Please open an issue.',
              node,
              src,
            });
          }

          const originalToken = evaluate(node) as unknown as Token;
          tokens[id]!.originalValue = originalToken as any;
          tokens[id]!.source.node = node;
          tokens[id]!.mode['.'].originalValue = originalToken as any;

          const $extensions = getObjMember(node, '$extensions');
          if ($extensions && $extensions.type === 'Object') {
            const modes = getObjMember($extensions, 'mode');
            if (modes && modes.type === 'Object') {
              for (const modeMember of modes.members) {
                if (modeMember.name.type !== 'String') {
                  continue;
                }
                const mode = modeMember.name.value;
                tokens[id]!.mode[mode]!.originalValue = (originalToken as any).$extensions.mode[mode];
                tokens[id]!.mode[mode]!.source.node = modeMember.value as any;
              }
            }
          }
        }
      },
    });
  }
  logger.debug({ ...entry, message: 'Parsing done', timing: performance.now() - resolveStart });

  // 3. resolve aliases & catch circular refs
  const circularStart = performance.now();
  logger.debug({ ...entry, message: 'Circular ref check' });
  for (const jsonID of Object.keys(tokens)) {
    // circular aliases
    try {
      detectCircularAliases(tokens, jsonID);
    } catch {
      logger.error({
        ...entry,
        message: 'Circular alias detected.',
        node: getObjMember(tokens[jsonID]!.source.node, '$value'),
        src: sources.find((s) => s.filename?.href === tokens[jsonID]!.source.filename)?.src,
      });
    }
    for (const mode of Object.keys(tokens[jsonID]!.mode)) {
      if (isAlias(tokens[jsonID]!.mode[mode]!.$value as any)) {
        const aliasedID = parseAlias(tokens[jsonID]!.mode[mode]!.$value as any);
        tokens[jsonID]!.mode[mode]!.aliasOf = aliasedID;
        tokens[jsonID]!.mode[mode]!.$value = tokens[`#/${aliasedID.split('.').join('/')}`]!.$value;
        if (mode === '.') {
          tokens[jsonID]!.$value = tokens[jsonID]!.mode[mode]!.$value;
        }
      }
    }

    if (!tokens[jsonID]!.$type) {
      logger.error({
        ...entry,
        message: 'Token has no $type',
        node: getObjMember((tokens[jsonID] as any).source.node, '$value'),
        src: sources.find((s) => s.filename?.href === tokens[jsonID]!.source.filename)?.src,
      });
    }
  }
  logger.debug({ ...entry, message: 'Circular ref check done', timing: performance.now() - circularStart });

  // 5. mark alias & dependencies
  const aliasStart = performance.now();
  logger.debug({ ...entry, message: 'Alias mapping start' });
  for (const jsonID of aliasMap.keys()) {
    const src = sources.find((s) => s.filename?.href === aliasMap.get(jsonID)!.filename)?.src;
    markAliases({
      tokens,
      jsonID,
      aliasChain: aliasMap.get(jsonID)!.aliasChain,
      logger,
      src,
    });
  }
  logger.debug({ ...entry, message: 'Alias mapping done', timing: performance.now() - aliasStart });

  // 6. normalize
  const normalizeStart = performance.now();
  logger.debug({ ...entry, message: 'Normalizing start' });
  for (const token of Object.values(tokens)) {
    normalize(token as any, { logger, src: sources.find((s) => s.filename?.href === token.source.filename)?.src });
  }
  logger.debug({ ...entry, message: 'Normalizing done', timing: performance.now() - normalizeStart });

  // 7. alphabetize
  const sortedKeys = Object.keys(tokens)
    .sort()
    .map<[string, string]>((path) => [path, refToTokenID(path)!]);
  const tokensSorted: TokenNormalizedSet = {};
  for (const [path, id] of sortedKeys) {
    tokensSorted[id] = tokens[path]!;
  }

  return { tokens: tokensSorted, sources };
}

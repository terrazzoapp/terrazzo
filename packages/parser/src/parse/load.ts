import {
  type AnyNode,
  type DocumentNode,
  evaluate,
  type ObjectNode,
  print,
  type StringNode,
  type ValueNode,
} from '@humanwhocodes/momoa';
import parseRef from '@terrazzo/json-ref-parser';
import {
  type GroupNormalized,
  isAlias,
  parseAlias,
  type TokenNormalized,
  type TokenNormalizedSet,
} from '@terrazzo/token-tools';
import type Logger from '../logger.js';
import type { InputSource, ParseOptions } from '../types.js';
import { aliasToMomoa, flatten$refs, getObjMember, refToTokenID, toMomoa, traverse } from './json.js';
import { normalize } from './normalize.js';

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

  // First pass: parse all root-level documents
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

  // Second pass: load and parse all remote documents, but don’t flatten aliases yet.
  // This gives us the full token count and all original values, which we want to preserve before flattening.
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
        if (!url) {
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

  // Third pass: map all tokens and preserve original values, before flattening
  const preResolveStart = performance.now();
  logger.debug({ ...entry, message: 'Normalize start' });
  const tokens: TokenNormalizedSet = {};
  for (const source of sources) {
    const groups: Record<string, GroupNormalized> = {};
    traverse(source.document, {
      enter(node, _parent, path) {
        const id = path.join('.');

        if (node.type === 'Object') {
          // token
          if (node.members.some((m) => m.name.type === 'String' && m.name.value === '$value')) {
            const originalValue = evaluate(node) as any;
            const group = groups[path.slice(0, path.length - 1).join('.')] as any;
            if (group?.tokens && !group.tokens.includes(id)) {
              group.tokens.push(id);
            }
            const nodeSource = { filename: source.filename?.href, node };
            if (tokens[id]) {
              logger.info({
                ...entry,
                message: `Token ${id} overwritten in ${source.filename?.href}`,
                node,
                src: source.src,
              });
            }
            tokens[id] = {
              id,
              $type: originalValue.$type || group.$type,
              $description: originalValue.$description || undefined,
              $deprecated: originalValue.$deprecated || group.$deprecated || undefined,
              $value: originalValue.$value,
              $extensions: originalValue.$extensions || undefined,
              aliasChain: undefined,
              aliasedBy: undefined,
              aliasOf: undefined,
              partialAliasOf: undefined,
              dependencies: undefined,
              group,
              originalValue,
              source: nodeSource,
              mode: {
                '.': {
                  $value: originalValue.$value,
                  aliasOf: undefined,
                  aliasChain: undefined,
                  partialAliasOf: undefined,
                  originalValue: originalValue.$value,
                  dependencies: undefined,
                  source: {
                    ...nodeSource,
                    node: (getObjMember(nodeSource.node, '$value') ?? nodeSource.node) as ObjectNode,
                  },
                },
              },
            };

            if (tokens[id].$extensions && 'mode' in tokens[id].$extensions) {
              const modeNode = (getObjMember(node, '$extensions') as ObjectNode).members.find(
                (m) => m.name.type === 'String' && m.name.value === 'mode',
              )!.value as ObjectNode;
              for (const mode of Object.keys((tokens[id].$extensions as any).mode)) {
                const modeValue = (tokens[id].$extensions as any).mode;
                tokens[id].mode[mode] = {
                  $value: modeValue,
                  aliasOf: undefined,
                  aliasChain: undefined,
                  partialAliasOf: undefined,
                  originalValue: modeValue,
                  dependencies: undefined,
                  source: modeNode.members.find((m) => m.name.type === 'String' && m.name.value === mode)!.value as any,
                };
              }
            }

            return;
          }

          // group
          if (!groups[id]) {
            groups[id] = {
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
            const isParentGroup = id.startsWith(groupID) && groupID !== id;
            if (isParentGroup) {
              groups[id] = { ...groups[groupID] } as GroupNormalized;
            }
          }
          // next, override cascading values with local
          for (const m of node.members) {
            if (
              m.name.type !== 'String' ||
              !['$deprecated', '$description', '$extensions', '$type'].includes(m.name.value)
            ) {
              continue;
            }
            (groups as any)[id]![m.name.value] = evaluate(m.value);
          }
        }
      },
    });
  }
  logger.debug({ ...entry, message: 'Normalize done', timing: performance.now() - preResolveStart });

  // Fourth pass: resolve and flatten aliases
  const resolveStart = performance.now();
  logger.debug({ ...entry, message: 'Resolution start' });
  for (const source of sources) {
    const { src } = source;
    // this will be mutated, so make a copy first
    const flattenedDoc = structuredClone(source.document);
    traverse(flattenedDoc, {
      // before we start parsing, we have to resolve all $refs, because those may affect the final structure significantly.
      // after a full pass of inlining $refs, then we can update the token values
      enter(node, _, path) {
        const rawID = `#/${path.join('/')}`;
        const options = { source, sources: sharedCache, visited: [] };
        const isToken = path.includes('$value');

        try {
          switch (node.type) {
            case 'Object': {
              const aliasChain: string[] = [];
              const flattened = flatten$refs(node, { ...options, aliasChain }) as ObjectNode;
              node.members = flattened.members;

              if (isToken) {
                updateFromAliasChain({ tokens, rawID, aliasChain, logger, src });
              }
              break;
            }
            case 'Array': {
              for (let i = 0; i < node.elements.length; i++) {
                const aliasChain: string[] = [];
                if (node.elements[i]!.value.type === 'Object') {
                  node.elements[i]!.value = flatten$refs(node.elements[i]!.value as ObjectNode, {
                    ...options,
                    aliasChain,
                  }) as ValueNode;
                }

                if (isToken) {
                  updateFromAliasChain({ tokens, rawID, aliasChain, logger, src });
                }
              }
              break;
            }
            case 'String': {
              if (isAlias(node.value)) {
                const aliasChain: string[] = [];
                const flattened = flatten$refs(aliasToMomoa(node.value)!, { ...options, aliasChain });

                // DTCG aliases can result in any type, so we have to transform the node fully
                node.type = flattened.type as any;
                node.loc = flattened.loc;
                node.range = flattened.range;
                if (flattened.type === 'Array') {
                  (node as any).elements = flattened.elements;
                  (node as any).value = undefined;
                } else if (flattened.type === 'Object') {
                  (node as any).members = flattened.members;
                  (node as any).value = undefined;
                } else {
                  (node as any).value = flattened.value;
                }

                if (isToken) {
                  updateFromAliasChain({ tokens, rawID, aliasChain, logger, src });
                }
              }
              break;
            }
          }
        } catch (err) {
          logger.error({ ...entry, message: (err as Error).message, node, src });
        }
      },
      exit(node, _parent, path) {
        // Don’t parse `$extensions` deeply
        if (path.includes('$extensions')) {
          return;
        }
        // skip over non-tokens
        const $value = node.type === 'Object' && getObjMember(node, '$value');
        if (!$value) {
          return;
        }
        const id = path.join('.');
        tokens[id]!.$value = evaluate($value) as any;
        tokens[id]!.mode['.'].$value = tokens[id]!.$value;

        const $extensions = getObjMember(node, '$extensions');
        if ($extensions?.type === 'Object') {
          const mode = getObjMember($extensions, 'mode');
          if (mode?.type === 'Object') {
            for (const m of mode.members) {
              const name = (m.name as StringNode).value;
              tokens[id]!.mode[name]!.$value = evaluate(m.value) as any;
            }
          }
        }
      },
    });
  }
  logger.debug({ ...entry, message: 'Resolution done', timing: performance.now() - resolveStart });

  // fifth pass: check for circular DTCG aliases and missing $types
  const circularStart = performance.now();
  logger.debug({ ...entry, message: 'Validating resolution' });
  for (const id of Object.keys(tokens)) {
    // circular aliases
    try {
      traceDTCG(tokens, id);
    } catch {
      logger.error({
        ...entry,
        message: 'Circular alias detected.',
        node: getObjMember(tokens[id]!.source.node, '$value'),
        src: sources.find((s) => s.filename?.href === tokens[id]!.source.filename)?.src,
      });
    }
  }

  for (const id of Object.keys(tokens)) {
    if (!tokens[id]!.$type) {
      logger.error({
        ...entry,
        message: 'Token has no $type',
        node: getObjMember((tokens[id] as any).source.node, '$value'),
        src: sources.find((s) => s.filename?.href === tokens[id]!.source.filename)?.src,
      });
    }
  }
  logger.debug({ ...entry, message: 'Validating resolution done', timing: performance.now() - circularStart });

  // sixth pass: normalize tokens
  const normalizeStart = performance.now();
  logger.debug({ ...entry, message: 'Normalizing start' });
  for (const token of Object.values(tokens)) {
    normalize(token as any, { logger, src: sources.find((s) => s.filename?.href === token.source.filename)?.src });
  }
  logger.debug({ ...entry, message: 'Normalizing done', timing: performance.now() - normalizeStart });

  return { tokens, sources };
}

let fs: any;

/**
 * Resolve a URL and return its unparsed content in Node.js or browser environments safely.
 * Note: response could be JSON or YAML (tip: pair with maybeRawJSON helper)
 */
async function resolveRaw(path: URL, init?: RequestInit): Promise<string> {
  // load node:fs if we‘re trying to load files. throw error if we try and open files from a browser context.
  if (path.protocol === 'file:') {
    if (!fs) {
      try {
        fs = await import('node:fs/promises').then((m) => m.default);
      } catch {
        throw new Error(`Tried to load file ${path.href} outside a Node.js environment`);
      }
    }
    return await fs.readFile(path, 'utf8');
  }

  const res = await fetch(path, { redirect: 'follow', ...init });
  if (!res.ok) {
    throw new Error(`${path.href} responded with ${res.status}:\n${res.text()}`);
  }
  return res.text();
}

/**
 * Link and reverse-link tokens in one pass.
 *
 * This is one of, if not the most obtuse parts of the codebase. We flip
 * back-and-forth between DTCG dot separated IDs and JSON $ref notation. This is
 * an “ends justifies the means” scenario where the behavior should be captured
 * in test cases, and this just satisfies those. We’re trading off idiomatic
 * code for performance.
 */
function updateFromAliasChain({
  tokens,
  rawID,
  aliasChain,
  logger,
  src,
}: {
  tokens: TokenNormalizedSet;
  rawID: string;
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
  const aliasChainTokenIDs = aliasChain.map(refToTokenID).filter(Boolean) as string[];
  const tokenID = refToTokenID(rawID);
  if (!tokenID || !tokens[tokenID]) {
    return;
  }

  if (!tokens[tokenID].dependencies) {
    tokens[tokenID].dependencies = [...aliasChain];
  } else {
    tokens[tokenID].dependencies.push(...aliasChain.filter((ref) => !tokens[tokenID]!.dependencies!.includes(ref)));
  }

  for (const aliasedByID of aliasChainTokenIDs) {
    if (tokens[aliasedByID]) {
      if (!tokens[aliasedByID].aliasedBy) {
        tokens[aliasedByID].aliasedBy = [];
      }
      if (!tokens[aliasedByID].aliasedBy.includes(tokenID)) {
        tokens[aliasedByID].aliasedBy.push(tokenID);
      }
    }
  }

  const { subpath: $refPath } = parseRef(rawID);
  const partialValueIndex = $refPath?.indexOf('$value');
  if (!(partialValueIndex! > 0)) {
    const aliasedID = aliasChainTokenIDs.pop()!;
    tokens[tokenID].aliasOf = aliasedID;
    tokens[tokenID].$type = tokens[aliasedID]!.$type;
    return;
  }
  const partialValue = ($refPath ?? []).slice(partialValueIndex! + 1);

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
        partialAliasNode[key] = aliasedID;
        if (!(aliasedID in tokens)) {
          logger.error({
            group: 'parser',
            label: 'init',
            message: `Invalid alias: ${aliasedID}`,
            node: sourceNode,
            src,
          });
        }
        node[key] = structuredClone(tokens[aliasedID]!.$value);
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

/** Detect circular aliases */
function traceDTCG(tokens: TokenNormalizedSet, id: string, path = [] as string[]): void {
  for (const mode of Object.keys(tokens[id]!.mode)) {
    if (!isAlias((tokens[id]!.mode[mode] as any).$value)) {
      continue;
    }
    const nextID = parseAlias((tokens[id]!.mode[mode] as any).$value);
    if (path.includes(nextID)) {
      throw new Error();
    }
    path.push(nextID);
    traceDTCG(tokens, nextID, path);
  }
}

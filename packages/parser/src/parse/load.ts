import { type AnyNode, evaluate, type ObjectNode, print, type StringNode } from '@humanwhocodes/momoa';
import parseRef from '@terrazzo/json-pointer-parser';
import { isAlias, parseAlias, type TokenNormalized } from '@terrazzo/token-tools';
import type Logger from '../logger.js';
import type { InputSource, ParseOptions } from '../types.js';
import { findNode, getObjMembers, mergeObjects, toMomoa, traverse } from './json.js';

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
export async function loadAll(
  inputs: Omit<InputSource, 'document'>[],
  { logger, continueOnError, yamlToMomoa, transform }: LoadOptions,
): Promise<{ tokens: Record<string, IntermediaryToken>; sources: InputSource[] }> {
  const sources = inputs.map((i) => ({
    ...i,
    filename: i.filename ?? new URL(`virtual:${i}`), // for objects created in memory, an index-based ID helps associate tokens with these
  })) as InputSource[];
  let tokens: Record<string, IntermediaryToken> = {};

  const parseWithTransform = (input: (typeof inputs)[number]) => {
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
  };

  await Promise.all(
    inputs.map(async (input, i) => {
      if (!input || typeof input !== 'object') {
        logger.error({ group: 'parser', label: 'init', message: `Input (${i}) must be an object.` });
      }
      if (!input.src || (typeof input.src !== 'string' && typeof input.src !== 'object')) {
        logger.error({
          message: `Input (${i}) missing "src" with a JSON/YAML string, or JSON object.`,
          group: 'parser',
          label: 'init',
        });
      }
      if (input.filename) {
        if (!(input.filename instanceof URL)) {
          logger.error({
            message: `Input (${i}) "filename" must be a URL (remote or file URL).`,
            group: 'parser',
            label: 'init',
          });
        }
      }

      sources[i]!.document = parseWithTransform(input);
      // For objects created in memory, use the source code formatted by Momoa
      if (typeof sources[i]!.src !== 'string') {
        sources[i]!.src = print(sources[i]!.document, { indent: 2 });
      }

      /** Resolver for $refs */
      const resolve = async (ref: string, _path: string[] = []): Promise<AnyNode> => {
        // 1. parse and normalize $ref
        let absoluteURL = new URL('file:///');
        let subpath: string[] = [];
        try {
          const parsed = parseRef(ref);
          subpath = parsed.subpath ?? subpath;
          absoluteURL = new URL(parsed.url, input.filename);
        } catch {
          throw new Error(`Could not resolve "${ref}"`);
        }

        // 2. detect circular $refs
        if (_path.includes(absoluteURL.href)) {
          throw new Error(`Circular $ref "${ref}" can’t be resolved.`);
        }
        _path.push(absoluteURL.href);

        // 3. load document and subpath
        let node = {} as AnyNode;
        const cached = sources.find((s) => s.filename?.href === absoluteURL.href);
        if (cached) {
          node = findNode(cached.document, subpath);
        } else {
          const res = await resolveRaw(absoluteURL);
          const nextDocument = parseWithTransform({ src: res, filename: absoluteURL });
          sources.push({ src: res, filename: absoluteURL, document: nextDocument });
          node = findNode(nextDocument, subpath);
        }

        // 4. continue loop if this is another $ref
        if (node.type === 'Object') {
          const hasRef = node.members.find(
            (m) => m.name.type === 'String' && m.name.value === '$ref' && m.value.type === 'String',
          )?.value as StringNode | undefined;
          if (hasRef) {
            const resolved = await resolve(hasRef.value, _path);
            return node.members.length > 1
              ? mergeObjects(resolved as ObjectNode, node) // Important: local node takes priority, i.e. last
              : resolved;
          }
        }

        // 5. finish
        return node;
      };

      const nextTokens = await bundleTokens(sources[i]!, { logger, resolve });
      tokens = { ...tokens, ...nextTokens };
    }),
  );

  return {
    tokens,
    sources,
  };
}

/** Flatten tokens into a shallow map, while bundling in remote tokens */
export async function bundleTokens(
  input: InputSource,
  { logger, resolve }: { logger: Logger; resolve: (reference: string) => Promise<AnyNode> },
): Promise<Record<string, IntermediaryToken>> {
  const tokens: Record<string, IntermediaryToken> = {};
  const typeInh: Record<string, string> = {};
  const descInh: Record<string, string> = {};
  const deprecatedInh: Record<string, string> = {};
  const entry = { group: 'parser' as const, label: 'core', filename: input.filename, src: input.src };

  traverse(input.document, {
    async enter(node, _parent, path) {
      // TODO: handle aliases
      if (node.type === 'String') {
        if (isAlias(node.value)) {
          const path = `#/${parseAlias(node.value).split('.').join('/')}`;
          (node as any).type = 'Object';
          (node as any).members = [
            { type: 'Member', name: { type: 'String', value: '$ref' }, value: { type: 'String', value: path } },
          ];
        }
      }

      if (node.type !== 'Object') {
        return;
      }

      const id = path.join('.');

      let $ref: string | undefined;

      // Resolve and inline $refs, if any
      const refIndex = node.members.findIndex(
        (m) => m.name.type === 'String' && m.name.value === '$ref' && m.value.type === 'String',
      );
      if (refIndex !== -1) {
        try {
          $ref = (node.members[refIndex]!.value as StringNode).value;
          const resolved = await resolve($ref);
          if (node.members.length > 1) {
            if (resolved.type !== 'Object') {
              logger.error({
                ...entry,
                message: `Expected $ref to resolve to object, received ${resolved.type}`,
                node,
                src: input.src,
              });
            } else {
              node.members = mergeObjects(resolved as ObjectNode, node).members;
            }
          } else {
            // overwrite node entirely
            for (const [k, v] of Object.entries(resolved)) {
              (node as any)[k] = v;
            }
          }
        } catch (err) {
          logger.error({ ...entry, message: String(err), node, src: input.src });
        }
      }

      // ⚠️ Important: scan members AFTER the $ref inlining to include the new values
      const members = getObjMembers(node);
      if (members.$type) {
        typeInh[id] = evaluate(members.$type as StringNode) as string;
      }
      if (members.$description) {
        descInh[id] = evaluate(members.$description as StringNode) as string;
      }
      if (members.$deprecated) {
        deprecatedInh[id] = evaluate(members.$deprecated as StringNode) as string;
      }

      // $value
      if (members.$value) {
        const groupID = path.slice(0, path.length - 1).join('.');

        let aliasOf: string | undefined;
        if (typeof members.$value === 'string' && isAlias(members.$value)) {
          aliasOf = parseAlias(members.$value);
        } else if (
          members.$value &&
          typeof members.$value === 'object' &&
          '$ref' in members.$value &&
          typeof members.$value.$ref === 'string'
        ) {
          aliasOf = members.$value.$ref;
        }

        tokens[id] = {
          id,
          $type: ((members.$type && evaluate(members.$type)) as string) ?? findClosest(id, typeInh) ?? undefined,
          $description:
            ((members.$description && evaluate(members.$description)) as string) ??
            findClosest(id, descInh) ??
            undefined,
          $deprecated:
            (members.$deprecated && (evaluate(members.$deprecated) as string)) ??
            findClosest(id, deprecatedInh) ??
            undefined,
          $value: evaluate(members.$value),
          $extensions: members.$extensions
            ? (evaluate(members.$extensions as ObjectNode) as Record<string, unknown>)
            : undefined,
          aliasOf,
          partialAliasOf: undefined,
          group: {
            id: groupID,
            $type: (findClosest(groupID, typeInh) as any) ?? undefined,
            $description: findClosest(groupID, descInh) ?? undefined,
            $deprecated: findClosest(groupID, deprecatedInh) ?? undefined,
            tokens: [],
          },
          mode: {
            '.': {
              $type: undefined,
              $value: undefined,
              aliasOf,
              partialAliasOf: undefined,
              source: {
                filename: input.filename,
                node,
              },
            },
          },
          source: {
            filename: input.filename,
            node,
          },
        };

        // Handle modes
        tokens[id]!.mode['.']!.$type = tokens[id]!.$type;
        tokens[id]!.mode['.']!.$value = tokens[id]!.$value;
        tokens[id]!.mode['.']!.source = tokens[id]!.source;
        if (members.$extensions?.type === 'Object') {
          const ext = getObjMembers(members.$extensions);
          if (ext.mode?.type === 'Object') {
            for (const mode of ext.mode.members) {
              if (mode.name.type !== 'String') {
                continue;
              }
              const $value = evaluate(mode.value);
              tokens[id]!.mode[mode.name.value] = {
                $type: tokens[id]!.$type,
                $value,
                aliasOf: undefined,
                partialAliasOf: undefined,
                source: {
                  filename: input.filename,
                  node: mode.value as ObjectNode,
                },
              };
              if (typeof $value === 'string' && isAlias($value)) {
                tokens[id]!.mode[mode.name.value]!.aliasOf = parseAlias($value);
              }
            }
          }
        }
      }
    },
  });

  return tokens;
}

/** Given an inheritance map of properties, find the most-closely-scoped one */
function findClosest<T = unknown>(id: string, properties: Record<string, T>): T | undefined {
  if (id in properties) {
    return properties[id];
  }
  let longestMatch = '';
  let closestValue: T | undefined;
  for (const [k, v] of Object.entries(properties)) {
    if (id.startsWith(k) && k.length > longestMatch.length) {
      longestMatch = k;
      closestValue = v;
    }
  }
  return closestValue;
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

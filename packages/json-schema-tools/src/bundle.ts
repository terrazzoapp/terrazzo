import * as momoa from '@humanwhocodes/momoa';
import type yamlToMomoa from 'yaml-to-momoa';
import { findNode, getObjMember, JSONError, mergeDocuments, traverseAsync } from './momoa.js';
import { parseRef } from './parse-ref.js';
import type { InputSource, InputSourceWithDocument, RefMap } from './types.js';
import { relPath } from './utils.js';

export interface BundleOptions {
  /**
   * Provide an interface for fetching and/or filesystem reads.
   * - Remote files will have an "https:" protocol
   * - Files will have a "file:" protocol
   * Circular requests are already prevented internally. This will only request net-new resources.
   */
  req: (url: URL, origin: URL) => Promise<string>;
  /** Optionally provide a parser that produces a Momoa document. Useful if you are transforming on-the-fly. */
  parse?: (src: any, filename: URL) => Promise<momoa.DocumentNode>;
  /** Optionally provide YAML support via the yaml-to-momoa package. */
  yamlToMomoa?: typeof yamlToMomoa;
}

/** Flatten multiple Momoa documents into one, while resolving refs. */
export async function bundle(
  sources: InputSource[],
  { req, parse: userParse, yamlToMomoa }: BundleOptions,
): Promise<{ document: momoa.DocumentNode; sources: Record<string, InputSourceWithDocument>; refMap: RefMap }> {
  const cache: Record<string, InputSourceWithDocument> = {};
  const refMap: RefMap = {};
  const parse: NonNullable<BundleOptions['parse']> = async (src, filename) => {
    if (typeof src === 'string' && !maybeRawJSON(src)) {
      if (yamlToMomoa) {
        const result = yamlToMomoa(src);
        return userParse ? userParse(momoa.print(result, { indent: 2 }), filename) : result;
      }
      throw new Error(`Install yaml-to-momoa package to parse YAML, and pass in as option, e.g.:

    import { bundle } from '@terrazzo/json-schema-tools';
    import yamlToMomoa from 'yaml-to-momoa';

    bundle(yamlString, { yamlToMomoa });`);
    }
    return userParse
      ? userParse(src, filename)
      : momoa.parse(typeof src === 'string' ? src : JSON.stringify(src, undefined, 2), {
          mode: 'jsonc',
          ranges: true,
          tokens: true,
        });
  };

  let sourcesLength = sources.length;
  for (let i = 0; i < sourcesLength; i++) {
    const resolved: InputSourceWithDocument = {
      ...sources[i]!,
      document: await parse(sources[i]!.src, sources[i]!.filename),
    };
    if (resolved.document?.type !== 'Document') {
      throw new Error(`parse() must return a DocumentNode from momoa’s parser.`);
    }
    if (typeof resolved.src !== 'string') {
      resolved.src = momoa.print(resolved.document, { indent: 2 });
    }
    cache[sources[i]!.filename.href] = resolved;
    await traverseAsync(resolved.document, {
      async enter(node, _parent, path) {
        const $refNode = node.type === 'Object' ? getObjMember(node, '$ref') : undefined;
        if ($refNode?.type === 'String') {
          const visited: string[] = [];
          async function resolveRef(value: string, origin: URL): Promise<{ url: URL; subpath?: string[] }> {
            const { url, subpath } = parseRef(value);

            // local $ref: ensure it’s not circular, otherwise stop here
            if (url === '.') {
              if (!subpath?.length) {
                throw new JSONError(
                  `$ref ${JSON.stringify(value)} can’t recursively embed its parent document`,
                  node,
                  sources[i]!.src,
                );
              }
              return { url: origin, subpath };
            }

            // remote $ref: resolve, and replace final value
            const nextURL = new URL(url, origin);
            if (visited.includes(nextURL.href)) {
              throw new JSONError(`Can’t resolve circular $ref ${JSON.stringify(value)}`, node, sources[i]!.src);
            }
            visited.push(nextURL.href);

            let nextSource = cache[nextURL.href];
            if (!nextSource) {
              const src = await req(nextURL, origin);
              nextSource = { filename: nextURL, src, document: await parse(src, nextURL) };
              cache[nextURL.href] = nextSource;
              sources.push(nextSource);
            }

            const next$ref = findNode(nextSource.document, subpath);
            if (!next$ref) {
              throw new JSONError(`Can’t resolve $ref ${JSON.stringify(value)}`, node, sources[i]!.src);
            }

            // if this is a nested $ref, keep tracing
            if (next$ref.type === 'Object' && getObjMember(next$ref, '$ref')) {
              return await resolveRef((getObjMember(next$ref, '$ref') as momoa.StringNode).value, nextURL);
            }

            return { url: nextURL, subpath };
          }

          const resolved = await resolveRef($refNode.value, sources[i]!.filename);
          // if this is for another document, transform the ref
          if (resolved.url.href !== sources[i]!.filename.href) {
            $refNode.value = `#/$defs/${relPath(sources[i]!.filename, resolved.url)}${resolved.subpath?.length ? `#/${resolved.subpath.join('/')}` : ''}`;
          }

          // 1. deeply-traverse $refs
          // 2. fetch and cache new documents in `sources`
          // 3. inline the new documents, and add to the array (increase sourcesLength)
          // 4. if the $ref was remote, rewrite it to the local path
        }
      },
    });
  }

  return {
    document: mergeDocuments(Object.values(sources).map((s) => s.document)),
    sources: cache,
    refMap,
  };
}

/** Determine if an input is likely a JSON string */
export function maybeRawJSON(input: string): boolean {
  return typeof input === 'string' && /^\s*\{/.test(input);
}

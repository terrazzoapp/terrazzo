import * as momoa from '@humanwhocodes/momoa';
import type yamlToMomoa from 'yaml-to-momoa';
import { findNode, getObjMember, JSONError, mergeDocuments, traverseAsync } from './momoa.js';
import { encodeFragment, parseRef } from './parse-ref.js';
import type { InputSource, InputSourceWithDocument } from './types.js';
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

const VIRTUAL_LOC: momoa.LocationRange = {
  start: { line: -1, column: -1, offset: 0 },
  end: { line: -1, column: -1, offset: 0 },
};

/** Flatten multiple Momoa documents into one, while resolving refs. */
export async function bundle(
  sources: InputSource[],
  { req, parse: userParse, yamlToMomoa }: BundleOptions,
): Promise<{ document: momoa.DocumentNode; sources: Record<string, InputSourceWithDocument> }> {
  const cache: Record<string, InputSourceWithDocument> = {};
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

  const originalSourceLength = sources.length; // distinguish user-provided source vs dynamic $ref source
  const origin = sources[0]!.filename;
  let document = {} as momoa.DocumentNode;
  for (let i = 0; i < sources.length; i++) {
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
    // For first parsed document, merge into this as we work
    if (!document.type) {
      document = resolved.document;
    }

    cache[sources[i]!.filename.href] = resolved;
    await traverseAsync(resolved.document, {
      async enter(node, _parent) {
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
          const resolvedIsOriginalSource = sources
            .slice(0, originalSourceLength)
            .some((s) => s.filename.href === resolved.url.href);
          // if this is for a new, remote document, transform the ref
          if (!resolvedIsOriginalSource && resolved.url.href !== sources[i]!.filename.href) {
            $refNode.value = `#/$defs/${makeDefsKey(origin, resolved.url)}${resolved.subpath?.length ? encodeFragment(resolved.subpath!).replace(/^#/, '') : ''}`;
          }
        }
      },
    });

    if (i > 0) {
      // For sources a user provided, merge them together
      if (i < originalSourceLength) {
        document = mergeDocuments([document, resolved.document]);
      }
      // For all other sources discovered dynamically via $refs, hoist into $defs
      // This is to allow for $refs pulling in document partials, and other un-mergeable structures.
      else {
        let $defs = getObjMember(document.body as momoa.ObjectNode, '$defs') as momoa.ObjectNode | undefined;
        if (!$defs) {
          const $defsMember = {
            type: 'Member',
            name: { type: 'String', value: '$defs', loc: VIRTUAL_LOC },
            value: { type: 'Object', members: [], loc: VIRTUAL_LOC },
            loc: VIRTUAL_LOC,
          } as momoa.MemberNode;
          $defs = $defsMember.value as momoa.ObjectNode;
          (document.body as momoa.ObjectNode).members.push($defsMember);
        }
        $defs!.members.push({
          type: 'Member',
          name: { type: 'String', value: makeDefsKey(origin, resolved.filename), loc: VIRTUAL_LOC },
          value: resolved.document.body,
          loc: VIRTUAL_LOC,
        });
      }
    }
  }

  return {
    document,
    sources: cache,
  };
}

/** Determine if an input is likely a JSON string */
export function maybeRawJSON(input: string): boolean {
  return typeof input === 'string' && /^\s*[{"[]/.test(input);
}

/** Make safe key for $defs */
function makeDefsKey(origin: URL, resolved: URL): string {
  return relPath(origin, resolved).replace(/~/g, '~0').replace(/\//g, '~1');
}

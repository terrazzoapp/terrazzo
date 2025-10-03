import * as momoa from '@humanwhocodes/momoa';
import type yamlToMomoa from 'yaml-to-momoa';
import {
  findNode,
  getObjMember,
  JSONError,
  mergeDocuments,
  mergeObjects,
  replaceNode,
  traverseAsync,
} from './momoa.js';
import { parseRef } from './parse-ref.js';
import type { InputSource, InputSourceWithDocument, RefMap } from './types.js';

/** Placeholder for node:fs. Not loaded directly, in case this package is used in browser. */
let fs: any;

export interface BundleOptions {
  /** Optionally provide a parser that produces a Momoa document. Useful if you are transforming on-the-fly. */
  parse?: (src: any, filename: URL) => Promise<momoa.DocumentNode>;
  /** Optionally provide YAML support via the yaml-to-momoa package. */
  yamlToMomoa?: typeof yamlToMomoa;
}

/** Flatten multiple Momoa documents into one, while resolving refs. */
export async function bundle(
  sources: InputSource[],
  { parse: userParse, yamlToMomoa }: BundleOptions,
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

  const resolvedDocs = await Promise.all<momoa.DocumentNode>(
    sources.map(async (source) => {
      const resolved: InputSourceWithDocument = { ...source, document: await parse(source.src, source.filename) };
      if (resolved.document?.type !== 'Document') {
        throw new Error(`parse() must return a DocumentNode from momoa’s parser.`);
      }
      if (typeof resolved.src !== 'string') {
        resolved.src = momoa.print(resolved.document, { indent: 2 });
      }
      cache[source.filename.href] = resolved;
      await traverseAsync(resolved.document, {
        async enter(node, _parent, path) {
          if (node.type === 'Object' && getObjMember(node, '$ref')) {
            const refChain: string[] = [];
            const newNode = await resolveRef(node, {
              source: resolved,
              sources: cache,
              visited: [],
              refChain,
              parse,
            });
            if (refChain.length) {
              refMap[`#/${path.join('/')}`] = { filename: source.filename!.href, refChain };
            }
            replaceNode(node, newNode);
          }
        },
      });
      return resolved.document;
    }),
  );

  return {
    document: mergeDocuments(resolvedDocs),
    sources: cache,
    refMap,
  };
}

/** Determine if an input is likely a JSON string */
export function maybeRawJSON(input: string): boolean {
  return typeof input === 'string' && input.trim().startsWith('{');
}

export interface ResolveRefOptions {
  parse: NonNullable<BundleOptions['parse']>;
  source: InputSourceWithDocument;
  sources: Record<string, InputSourceWithDocument>;
  visited: string[];
  refChain: string[];
}

/** Flatten $refs and merge objects one level deep. */
export async function resolveRef(
  node: momoa.ObjectNode,
  options: ResolveRefOptions,
): Promise<momoa.StringNode | momoa.NumberNode | momoa.ObjectNode | momoa.BooleanNode | momoa.ArrayNode> {
  if (node.type !== 'Object') {
    return node;
  }
  const { parse, visited, source, sources, refChain } = options;
  const $ref = getObjMember(node, '$ref');
  if (!$ref) {
    return node;
  }

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

  if ($ref.type !== 'String') {
    throw new JSONError('Invalid $ref. Expected string.', $ref, source.filename.href);
  }

  const { url, subpath } = parseRef($ref.value);
  if (url === '.' && !subpath?.length) {
    throw new JSONError('Can’t recursively embed a document within itself.', $ref, source.filename.href);
  }
  const filename = url === '.' ? source.filename! : new URL(url, source.filename!);
  if (url !== '.' && visited.includes(filename.href)) {
    throw new JSONError(`Circular $ref detected: ${JSON.stringify($ref.value)}`, $ref, source.filename.href);
  }
  visited.push(filename.href);
  const nextPath =
    filename.href === source.filename!.href
      ? `#/${subpath?.join('/') ?? ''}`
      : `${filename.href}${subpath ? `#/${subpath.join('/')}` : ''}`;
  if (refChain.includes(nextPath)) {
    throw new JSONError(`Circular $ref detected: "${$ref.value}"`, $ref, source.filename.href);
  }
  refChain.push(nextPath);

  if (!sources[filename.href]) {
    const rawSource = await resolveRaw(filename);
    sources[filename.href] = { filename, src: rawSource, document: await parse(rawSource, filename) };
  }

  const resolved = findNode(sources[filename.href]!.document, subpath) as momoa.ObjectNode | undefined;

  if (!resolved) {
    throw new Error(`Could not resolve $ref "${$ref.value}"`);
  }
  const flattened = await resolveRef(resolved, options);

  // 2. Either use $ref as-is, or merge into object (only if it is an object)
  const isOnlyRef = node.members.length === 1;
  if (isOnlyRef) {
    return flattened;
  }
  if (flattened.type !== 'Object') {
    throw new JSONError(`Can’t merge $ref of type "${resolved.type}" into Object`, $ref, source.filename.href);
  }
  return mergeObjects(flattened, {
    ...node,
    members: node.members.filter((m) => !(m.name.type === 'String' && m.name.value === '$ref')),
  });
}

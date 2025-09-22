import {
  type AnyNode,
  type ArrayNode,
  type BooleanNode,
  type DocumentNode,
  parse as momoaParse,
  type NumberNode,
  type ObjectNode,
  type ParseOptions,
  print,
  type StringNode,
  type ValueNode,
} from '@humanwhocodes/momoa';
import parseRef from '@terrazzo/json-ref-parser';
import type yamlToMomoa from 'yaml-to-momoa';
import type Logger from '../logger.js';
import type { InputSource } from '../types.js';

export interface AsyncJSONVisitor {
  enter?: (node: AnyNode, parent: AnyNode | undefined, path: string[]) => Promise<void>;
  exit?: (node: AnyNode, parent: AnyNode | undefined, path: string[]) => Promise<void>;
}

export type ValueNodeWithIndex = ValueNode & { index: number };

/** Get single member by name. Better when you only need a single value. */
export function getObjMember(node: ObjectNode | undefined, key: string): ValueNode | undefined {
  if (!node || node.type !== 'Object') {
    return;
  }
  return node.members.find((m) => m.name.type === 'String' && m.name.value === key)?.value;
}

/** Format ObjectNode members as key–value object. Better when retrieving multiple values. */
export function getObjMembers(node: ObjectNode): Record<string | number, ValueNodeWithIndex> {
  const members: Record<string | number, ValueNodeWithIndex> = {};
  if (node.type !== 'Object') {
    return members;
  }
  for (let i = 0; i < node.members.length; i++) {
    const m = node.members[i]!;
    if (m.name.type !== 'String') {
      continue;
    }
    members[m.name.value] = { ...m.value, index: i };
  }
  return members;
}

/** Replace an ObjectNode’s contents outright with another */
export function replaceObjMembers(a: ObjectNode, b: DocumentNode | ObjectNode) {
  a.members = (b.type === 'Document' && (b.body as ObjectNode)?.members) || (b as ObjectNode).members;
}

/**
 * Variation of Momoa’s traverse(), which keeps track of global path.
 * Allows mutation of AST (along with any consequences)
 */
export async function traverseAsync(root: AnyNode, visitor: AsyncJSONVisitor): Promise<void> {
  /**
   * Recursively visits a node.
   * @param {AnyNode} node The node to visit.
   * @param {AnyNode} [parent] The parent of the node to visit.
   * @return {void}
   */
  async function visitNode(node: AnyNode, parent: AnyNode | undefined, path: string[] = []) {
    const nextPath = [...path];
    await visitor.enter?.(node, parent, nextPath);
    switch (node.type) {
      case 'Document': {
        await visitNode(node.body, node, nextPath);
        break;
      }
      case 'Array': {
        let i = 0;
        let len = node.elements.length;
        let prevElements = node.elements;
        while (i < len) {
          await visitNode(node.elements[i]!, node, [...nextPath, String(i)]);
          // if this node mutated, start over
          if (node.elements !== prevElements) {
            i = 0;
            len = node.elements.length;
            prevElements = node.elements;
            continue;
          }
          i++;
        }
        break;
      }
      case 'Element':
      case 'Member': {
        await visitNode(node.value, node, nextPath);
        break;
      }
      case 'Object': {
        let i = 0;
        let len = node.members.length;
        let prevMembers = node.members;
        while (i < len) {
          await visitNode(node.members[i]!, node, [...nextPath, (node.members[i]!.name as StringNode).value]);
          // if this node mutated, start over
          if (node.members !== prevMembers) {
            i = 0;
            len = node.members.length;
            prevMembers = node.members;
            continue;
          }
          i++;
        }
        break;
      }
    }
    await visitor.exit?.(node, parent, nextPath);
  }
  await visitNode(root, undefined, []);
}

/** Determine if an input is likely a JSON string */
export function maybeRawJSON(input: string): boolean {
  return typeof input === 'string' && input.trim().startsWith('{');
}

/** Find Momoa node by traversing paths */
export function findNode<T = AnyNode>(node: AnyNode, path?: string[]): T {
  if (!path?.length) {
    return node as T;
  }

  let nextNode: AnyNode | undefined;

  switch (node.type) {
    // for Document nodes, dive into body for “free” (not part of the path)
    case 'Document': {
      return findNode(node.body, path);
    }
    case 'Object': {
      const [member, ...rest] = path;
      nextNode = node.members.find((m) => m.name.type === 'String' && m.name.value === member)?.value;
      if (nextNode && rest.length) {
        return findNode(nextNode, path.slice(1));
      }
      break;
    }
    case 'Array': {
      const [_index, ...rest] = path;
      const index = Number.parseInt(_index!, 10);
      nextNode = node.elements[index]?.value;
      if (nextNode && rest.length) {
        return findNode(nextNode, path.slice(1));
      }
      break;
    }
  }

  return nextNode as T;
}

export interface ToMomoaOptions {
  filename?: URL;
  continueOnError?: boolean;
  logger: Logger;
  yamlToMomoa?: typeof yamlToMomoa;
}

export function toMomoa(
  input: string | Record<string, any>,
  { continueOnError, filename, logger, yamlToMomoa }: ToMomoaOptions,
): InputSource {
  let src = '';
  if (typeof input === 'string') {
    src = input;
  }
  let document = {} as DocumentNode;
  if (typeof input === 'string' && !maybeRawJSON(input)) {
    if (yamlToMomoa) {
      try {
        document = yamlToMomoa(input); // if string, but not JSON, attempt YAML
      } catch (err) {
        logger.error({ group: 'parser', label: 'json', message: String(err), filename, src: input, continueOnError });
      }
    } else {
      logger.error({
        group: 'parser',
        label: 'yaml',
        message: `Install yaml-to-momoa package to parse YAML, and pass in as option, e.g.:

    import { parse } from '@terrazzo/parser';
    import yamlToMomoa from 'yaml-to-momoa';

    parse(yamlString, { yamlToMomoa });`,
        continueOnError: false, // fail here; no point in continuing
      });
    }
  } else {
    document = parseJSON(input);
  }
  if (!src) {
    src = print(document, { indent: 2 });
  }
  return { src, document };
}

/** Momoa, just with default options pre-set */
export function parseJSON(input: string | Record<string, any>, options?: ParseOptions): any {
  return momoaParse(
    // note: it seems silly at first glance to have JSON.stringify() inside a JSON parser.
    // we do this for objects created in memory to simulate line and column numbers for
    // better stack traces, which we don’t get with the native JSON parser.
    typeof input === 'string' ? input : JSON.stringify(input, undefined, 2),
    {
      mode: 'jsonc',
      ranges: true,
      tokens: true,
      ...options,
    },
  );
}

/** Merge multiple Momoa documents from different sources. Conflicts will be overridden  */
export function mergeDocuments(documents: DocumentNode[]): DocumentNode {
  if (!documents.length) {
    throw new Error(`Can’t merge 0 documents.`);
  }
  if (documents.length === 1) {
    return documents[0]!;
  }
  if (documents.some((d) => d.body.type !== 'Object')) {
    throw new Error(`mergeDocuments() can only merge top-level objects`);
  }
  const final = structuredClone(documents[0]!);
  for (const next of documents.slice(1)) {
    final.body = mergeObjects(final.body as ObjectNode, next.body as ObjectNode);

    // take the longer end point. this is wrong, but it’s… less wrong
    if (next.body.loc.end.offset > final.body.loc.end.offset) {
      final.loc.end = { ...next.body.loc.end };
    }
  }

  return final;
}

/** Merge Momoa Objects. */
export function mergeObjects(a: ObjectNode, b: ObjectNode): ObjectNode {
  const obj: ObjectNode = structuredClone(a);
  // on type mismatch, b overwrites a
  if (a.type !== 'Object') {
    return structuredClone(b);
  }
  for (const next of b.members) {
    if (next.name.type !== 'String') {
      throw new Error(`Member with key ${print(next.name)} not JSON serializable`);
    }
    const i = obj.members.findIndex((prev) => (prev.name as StringNode).value === (next.name as StringNode).value);
    if (i !== -1) {
      switch (next.value.type) {
        // Only objects get deep merging
        case 'Object': {
          obj.members[i]!.value = mergeObjects(obj.members[i]!.value as ObjectNode, next.value);
          break;
        }
        // Everything else gets overwritten
        case 'String':
        case 'Boolean':
        case 'Number':
        case 'Null':
        case 'Array': {
          obj.members[i]!.value = next.value;
          obj.members[i]!.loc = next.loc;
          break;
        }
        default: {
          throw new Error(`Unhandled: ${next.value.type}`);
        }
      }
    } else {
      obj.members.push(next);
    }
  }
  return obj;
}

let fs: any;

export interface ResolveRefOptions {
  parse: (source: Pick<InputSource, 'filename' | 'src'>) => DocumentNode;
  source: InputSource;
  sources: Record<string, InputSource>;
  visited: string[];
  refChain: string[];
}

/** Flatten $refs and merge objects one level deep. */
export async function resolveRef(
  node: ObjectNode,
  options: ResolveRefOptions,
): Promise<StringNode | NumberNode | ObjectNode | BooleanNode | ArrayNode> {
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
    throw new Error(`Invalid $ref. Expected string.`);
  }

  const { url, subpath } = parseRef($ref.value);
  if (url === '.' && !subpath?.length) {
    throw new Error(`Can’t recursively embed a document within itself.`);
  }
  const filename = url === '.' ? source.filename! : new URL(url, source.filename!);
  if (url !== '.' && visited.includes(filename.href)) {
    throw new Error(`Circular $ref detected: "${$ref.value}"`);
  }
  visited.push(filename.href);
  const nextPath =
    filename.href === source.filename!.href
      ? `#/${subpath?.join('/') ?? '/'}`
      : `${filename.href}${subpath ? `#${subpath.join('/')}` : ''}`;
  if (refChain.includes(nextPath)) {
    throw new Error(`Circular $ref detected: "${$ref.value}"`);
  }
  refChain.push(nextPath);

  if (!sources[filename.href]) {
    const rawSource = await resolveRaw(filename);
    sources[filename.href] = { filename, src: rawSource, document: parse({ filename, src: rawSource }) };
  }

  const resolved = findNode(sources[filename.href]!.document, subpath) as ObjectNode | undefined;

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
    throw new Error(`Can’t merge $ref of type "${resolved.type}" into Object`);
  }
  return mergeObjects(flattened, {
    ...node,
    members: node.members.filter((m) => !(m.name.type === 'String' && m.name.value === '$ref')),
  });
}

/** Is this object a pure $ref? (no other properties) */
export function isPure$ref(value: unknown): boolean {
  if (!value || typeof value !== 'object') {
    return false;
  }
  return '$ref' in value && Object.keys(value).length === 1;
}

/** Replace node */
export function replaceNode(a: AnyNode, b: AnyNode) {
  a.type = b.type;
  a.loc ??= b.loc;
  a.range ??= b.range;
  if (b.type === 'Object') {
    (a as ObjectNode).members = b.members;
  } else if (b.type === 'Array') {
    (a as ArrayNode).elements = b.elements;
  } else if (b.type === 'Document') {
    (a as DocumentNode).body = b.body;
  } else if (b.type !== 'Null') {
    (a as StringNode).value = (b as StringNode).value;
  }
}

export interface BundleOptions {
  parse: (source: Pick<InputSource, 'filename' | 'src'>) => DocumentNode;
  continueOnError: boolean;
  logger: Logger;
  yamlToMomoa?: typeof yamlToMomoa;
}

/** Flatten multiple Momoa documents into one, while resolving refs. */
export async function bundle(
  sources: InputSource[],
  options: BundleOptions,
): Promise<{ document: DocumentNode; aliasMap: Record<string, { filename: string; refChain: string[] }> }> {
  const externalDocs: Record<string, InputSource> = {};
  const aliasMap: Record<string, { filename: string; refChain: string[] }> = {};
  const resolvedDocs = await Promise.all<DocumentNode>(
    sources.map(async (source) => {
      const resolved = structuredClone(source.document);
      await traverseAsync(resolved, {
        async enter(node, _parent, path) {
          if (node.type === 'Object' && getObjMember(node, '$ref')) {
            const refChain: string[] = [];
            const newNode = await resolveRef(node, {
              source,
              sources: externalDocs,
              visited: [],
              refChain,
              ...options,
            });
            if (refChain.length) {
              aliasMap[`#/${path.join('/')}`] = { filename: source.filename!.href, refChain };
            }
            replaceNode(node, newNode);
          }
        },
      });
      return resolved;
    }),
  );

  return { document: mergeDocuments(resolvedDocs), aliasMap };
}

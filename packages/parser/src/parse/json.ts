import {
  type AnyNode,
  type ArrayNode,
  type BooleanNode,
  type DocumentNode,
  type MemberNode,
  parse as momoaParse,
  type NumberNode,
  type ObjectNode,
  type ParseOptions,
  print,
  type StringNode,
  type ValueNode,
} from '@humanwhocodes/momoa';
import parseRef from '@terrazzo/json-ref-parser';
import { parseAlias } from '@terrazzo/token-tools';
import type yamlToMomoa from 'yaml-to-momoa';
import type Logger from '../logger.js';
import type { InputSource, ReferenceObject } from '../types.js';

export interface JSONVisitor {
  enter?: (node: AnyNode, parent: AnyNode | undefined, path: string[]) => void;
  exit?: (node: AnyNode, parent: AnyNode | undefined, path: string[]) => void;
}

/** Determines if a given value is an AST node. */
export function isNode(value: unknown): boolean {
  return !!value && typeof value === 'object' && 'type' in value && typeof value.type === 'string';
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

/** Inject members to ObjectNode */
export function injectObjMembers(node: ObjectNode, members: MemberNode[] = []) {
  if (node.type !== 'Object') {
    return;
  }
  node.members.push(...members);
}

/** Replace an ObjectNode’s contents outright with another */
export function replaceObjMembers(a: ObjectNode, b: DocumentNode | ObjectNode) {
  a.members = (b.type === 'Document' && (b.body as ObjectNode)?.members) || (b as ObjectNode).members;
}

/**
 * Variation of Momoa’s traverse(), which keeps track of global path.
 * Allows mutation of AST (along with any consequences)
 */
export function traverse(root: AnyNode, visitor: JSONVisitor) {
  /**
   * Recursively visits a node.
   * @param {AnyNode} node The node to visit.
   * @param {AnyNode} [parent] The parent of the node to visit.
   * @return {void}
   */
  function visitNode(node: AnyNode, parent: AnyNode | undefined, path: string[] = []) {
    const nextPath = [...path];

    visitor.enter?.(node, parent, nextPath);

    // visit child nodes before enter & exit
    switch (node.type) {
      case 'Document': {
        visitNode(node.body, node, nextPath); // document.body is invisible
        break;
      }
      case 'Array': {
        let i = 0;
        let len = node.elements.length;
        let prevElements = node.elements;
        while (i < len) {
          visitNode(node.elements[i]!, node, [...nextPath, String(i)]);
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
        visitNode(node.value, node, nextPath);
        break;
      }
      case 'Object': {
        let i = 0;
        let len = node.members.length;
        let prevMembers = node.members;
        while (i < len) {
          visitNode(node.members[i]!, node, [...nextPath, (node.members[i]!.name as StringNode).value]);
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
    visitor.exit?.(node, parent, nextPath);
  }

  visitNode(root, undefined, []);
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

/** Flatten $refs and merge objects one level deep. */
export function flatten$refs(
  node: ObjectNode,
  {
    source,
    sources,
    visited = [],
    aliasChain = [],
  }: {
    source: InputSource;
    sources: Record<string, InputSource>;
    visited: string[];
    aliasChain: string[];
  },
): StringNode | NumberNode | ObjectNode | BooleanNode | ArrayNode {
  if (node.type !== 'Object') {
    return node;
  }

  // 1. if $ref is anywhere in this object, hoist to top and merge in
  const $ref = getObjMember(node, '$ref');
  if (!$ref) {
    return node;
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
  if (aliasChain.includes(nextPath)) {
    throw new Error(`Circular $ref detected: "${$ref.value}"`);
  }
  aliasChain.push(nextPath);
  const resolved = findNode(sources[filename.href]!.document, subpath) as ObjectNode | undefined;
  if (!resolved) {
    throw new Error(`Could not resolve $ref "${$ref.value}"`);
  }
  const flattened = flatten$refs(resolved, { source, sources, visited, aliasChain });

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

/** Convert valid DTCG alias to $ref */
export function aliasToRef(alias: string): ReferenceObject | undefined {
  const id = parseAlias(alias);
  // if this is invalid, stop
  if (id === alias) {
    return;
  }
  return { $ref: `#/${id.replace(/~/g, '~0').replace(/\//g, '~1').replace(/\./g, '/')}/$value` };
}

/** Is this object a pure $ref? (no other properties) */
export function isPure$ref(value: unknown): boolean {
  if (!value || typeof value !== 'object') {
    return false;
  }
  return '$ref' in value && Object.keys(value).length === 1;
}

/**
 * Convert Reference Object to token ID.
 * This can then be turned into an alias by surrounding with { … }
 */
export function refToTokenID($ref: ReferenceObject | string): string | undefined {
  const path = typeof $ref === 'object' ? $ref.$ref : $ref;
  if (typeof path !== 'string') {
    return;
  }
  const { subpath } = parseRef(path);
  return (subpath?.length && subpath.join('.').replace(/\.\$value.*$/, '')) || undefined;
}

/** Convert valid DTCG alias to $ref Momoa Node */
export function aliasToMomoa(
  alias: string,
  loc: ObjectNode['loc'] = { start: { line: -1, column: -1, offset: 0 }, end: { line: -1, column: -1, offset: 0 } },
): ObjectNode | undefined {
  const $ref = aliasToRef(alias);
  if (!$ref) {
    return;
  }
  return {
    type: 'Object',
    members: [
      {
        type: 'Member',
        name: { type: 'String', value: '$ref', loc },
        value: { type: 'String', value: $ref.$ref, loc },
        loc,
      },
    ],
    loc,
  };
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

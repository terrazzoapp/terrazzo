import {
  type AnyNode,
  type DocumentNode,
  type MemberNode,
  parse as momoaParse,
  type ObjectNode,
  type ParseOptions,
  print,
  type StringNode,
  type ValueNode,
} from '@humanwhocodes/momoa';
import type yamlToMomoa from 'yaml-to-momoa';
import type Logger from '../logger.js';
import type { InputSource } from '../types.js';

export interface JSONVisitor {
  enter?: (node: AnyNode, parent: AnyNode | undefined, path: string[]) => void;
  exit?: (node: AnyNode, parent: AnyNode | undefined, path: string[]) => void;
}

export const CHILD_KEYS = {
  Document: ['body'] as const,
  Object: ['members'] as const,
  Member: ['name', 'value'] as const,
  Element: ['value'] as const,
  Array: ['elements'] as const,
  String: [] as const,
  Number: [] as const,
  Boolean: [] as const,
  Null: [] as const,
  Identifier: [] as const,
  NaN: [] as const,
  Infinity: [] as const,
};

/** Determines if a given value is an AST node. */
export function isNode(value: unknown): boolean {
  return !!value && typeof value === 'object' && 'type' in value && typeof value.type === 'string';
}

export type ValueNodeWithIndex = ValueNode & { index: number };

/** Get single member by name. Useful when you only need a single value. */
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
    if (node.type === 'Member') {
      const { name } = node;
      nextPath.push('value' in name ? name.value : String(name));
    }

    visitor.enter?.(node, parent, nextPath);

    const childNode = CHILD_KEYS[node.type];
    for (const key of childNode ?? []) {
      const value = node[key as keyof typeof node];
      if (!value) {
        continue;
      }
      if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          visitNode(value[i] as unknown as AnyNode, node, key === 'elements' ? [...nextPath, String(i)] : nextPath);
        }
      } else if (isNode(value)) {
        visitNode(value as unknown as AnyNode, node, nextPath);
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

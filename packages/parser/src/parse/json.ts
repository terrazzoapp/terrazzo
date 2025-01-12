import {
  type AnyNode,
  type DocumentNode,
  type MemberNode,
  type ObjectNode,
  type StringNode,
  type ValueNode,
  parse as parseJSON,
  print,
} from '@humanwhocodes/momoa';
import parseJSONPointer from '@terrazzo/json-pointer-parser';
import type yamlToMomoa from 'yaml-to-momoa';
import type Logger from '../logger.js';
import type { InputSource } from '../types.js';
import { resolveRaw } from './resolve.js';

export interface Visitor {
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

/** Get ObjectNode members as object */
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

/**
 * Inject members to ObjectNode
 * @param {ObjectNode} node
 * @param {MemberNode[]} members
 */
export function injectObjMembers(node: ObjectNode, members: MemberNode[] = []) {
  if (node.type !== 'Object') {
    return;
  }
  node.members.push(...members);
}

/**
 * Variation of Momoa’s traverse(), which keeps track of global path.
 * Allows mutation of AST (along with any consequences)
 */
export function traverse(root: AnyNode, visitor: Visitor) {
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

      if (value && typeof value === 'object') {
        if (Array.isArray(value)) {
          for (let i = 0; i < value.length; i++) {
            visitNode(
              // @ts-expect-error this is safe
              value[i],
              node,
              key === 'elements' ? [...nextPath, String(i)] : nextPath,
            );
          }
        } else if (isNode(value)) {
          visitNode(value as unknown as AnyNode, node, nextPath);
        }
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

/** Does this object have a JSON pointer? */
export function getJSONPointerValue(node: ObjectNode): string | undefined {
  return (
    node.members.find((m) => m.name.type === 'String' && m.name.value === '$ref')?.value as StringNode | undefined
  )?.value;
}

/** Find Momoa node by traversing paths */
export function findNode<T = AnyNode>(node: AnyNode, path: string[]): T | undefined {
  if (!path.length) {
    return;
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
        message: `Install \`yaml-to-momoa\` package to parse YAML, and pass in as option, e.g.:

    import { parse } from '@terrazzo/parser';
    import yamlToMomoa from 'yaml-to-momoa';

    parse(yamlString, { yamlToMomoa });`,
        continueOnError: false, // fail here; no point in continuing
      });
    }
  } else {
    document = parseJSON(
      typeof input === 'string' ? input : JSON.stringify(input, undefined, 2), // everything else: assert it’s JSON-serializable
      {
        mode: 'jsonc',
        ranges: true,
        tokens: true,
      },
    );
  }
  if (!src) {
    src = print(document, { indent: 2 });
  }
  return { src, document };
}

export interface TracePointerOptions {
  filename: URL;
  document: DocumentNode;
  logger: Logger;
  node?: AnyNode;
  src?: string;
  yamlToMomoa?: typeof yamlToMomoa;
  _pointerChain?: Set<string>;
  _sources?: Record<string, InputSource>;
}

/** Trace JSON pointers until resolution (or circular error) */
export async function tracePointer(
  pointerValue: string,
  options: TracePointerOptions,
): Promise<(InputSource & { node: AnyNode }) | undefined> {
  if (!options._sources) {
    options._sources = {};
  }
  if (!options._pointerChain) {
    options._pointerChain = new Set();
  }
  const { filename, logger, node, src, document, yamlToMomoa } = options;
  const { url: relativeURL, subpath } = parseJSONPointer(pointerValue);
  const refFilename = new URL(relativeURL, filename);

  // detect circular pointers, and throw
  const refID = `${refFilename.href}#${(subpath ?? []).join('/')}`;
  if (options._pointerChain.has(refID)) {
    const chain = [...options._pointerChain].join(' → ');
    logger.error({ message: `Circular ref detected: ${chain}` });
  }
  options._pointerChain.add(refID);

  let resolvedNode: ValueNode | undefined = undefined;
  let resolvedSource: InputSource = { src, document };

  // local $ref
  if (relativeURL === '.') {
    if (subpath?.length) {
      resolvedNode = findNode(document, subpath);
    } else {
      logger.error({
        message: `Invalid ref: ${pointerValue}. Can’t recursively embed the same document within itself.`,
        filename,
        node,
        src,
      });
    }
  }

  // remote $ref (resolve)
  else {
    // remote $ref is already in cache
    if (options._sources[refFilename.href]) {
      resolvedSource = options._sources[refFilename.href]!;
      resolvedNode = subpath?.length ? findNode<ValueNode>(resolvedSource.document, subpath) : (document as any);
    }
    // remote $ref needs fetching
    else {
      // otherwise, resolve
      const resolvedPointer = await resolveRaw(refFilename);
      resolvedSource = toMomoa(resolvedPointer, { filename: refFilename, logger, yamlToMomoa });
      options._sources[refFilename.href] = resolvedSource; // update cache with new entry
      resolvedNode = subpath?.length ? findNode<ValueNode>(resolvedSource.document, subpath) : (document as any);
    }
  }
  if (resolvedNode) {
    if (resolvedNode.type === 'Object') {
      const nextPointerValue = getJSONPointerValue(resolvedNode);
      if (nextPointerValue) {
        return await tracePointer(nextPointerValue, options);
      }
    }
    return { ...resolvedSource, node: resolvedNode };
  } else {
    logger.error({ message: `Invalid ref: ${pointerValue} not found`, filename, node, src });
  }
}

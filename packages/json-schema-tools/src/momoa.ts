import {
  type AnyNode,
  type ArrayNode,
  type DocumentNode,
  type ObjectNode,
  print,
  type StringNode,
  type ValueNode,
} from '@humanwhocodes/momoa';
import type { ValueNodeWithIndex } from './types.js';

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

/** Replace Momoa node a with b inline (destructive)  */
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

export interface AsyncJSONVisitor {
  enter?: (node: AnyNode, parent: AnyNode | undefined, path: string[]) => Promise<void>;
  exit?: (node: AnyNode, parent: AnyNode | undefined, path: string[]) => Promise<void>;
}

/**
 * Async variation of Momoa’s traverse() that also keeps track of global path.
 * Allows crude mutation of AST during traversal (along with any consequences).
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
          // if this node mutated, the current array in memory is invalidated and we must start over
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
          // if this node mutated, the current array in memory is invalidated and we must start over
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

export class JSONError extends Error {
  node: AnyNode;
  filename = '';

  constructor(message: string, node: AnyNode, filename: string) {
    super(message);
    this.node = node;
    try {
      this.filename = filename;
    } catch {
      // noop
    }
  }
}

import * as momoa from '@humanwhocodes/momoa';
import type { ValueNodeWithIndex } from './types.js';

/** Find Momoa node by traversing paths */
export function findNode<T = momoa.AnyNode>(within: momoa.AnyNode, path?: string[]): T {
  if (!path?.length) {
    return within as T;
  }

  let nextNode: momoa.AnyNode | undefined;

  switch (within.type) {
    // for Document nodes, dive into body for “free” (not part of the path)
    case 'Document': {
      return findNode(within.body, path);
    }
    case 'Object': {
      const [member, ...rest] = path;
      nextNode = within.members.find((m) => m.name.type === 'String' && m.name.value === member)?.value;
      if (nextNode && rest.length) {
        return findNode(nextNode, path.slice(1));
      }
      break;
    }
    case 'Array': {
      const [_index, ...rest] = path;
      const index = Number.parseInt(_index!, 10);
      nextNode = within.elements[index]?.value;
      if (nextNode && rest.length) {
        return findNode(nextNode, path.slice(1));
      }
      break;
    }
  }

  return nextNode as T;
}

/** Get single member by name. Better when you only need a single value. */
export function getObjMember(node: momoa.ObjectNode | undefined, key: string): momoa.ValueNode | undefined {
  if (!node || node.type !== 'Object') {
    return;
  }
  return node.members.find((m) => m.name.type === 'String' && m.name.value === key)?.value;
}

/** Format ObjectNode members as key–value object. Better when retrieving multiple values. */
export function getObjMembers(node: momoa.ObjectNode): Record<string | number, ValueNodeWithIndex> {
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

/** Merge Momoa Objects. */
export function mergeObjects(a: momoa.ObjectNode, b: momoa.ObjectNode): momoa.ObjectNode {
  const obj: momoa.ObjectNode = structuredClone(a);
  // on type mismatch, b overwrites a
  if (a.type !== 'Object') {
    return structuredClone(b);
  }
  for (const next of b.members) {
    if (next.name.type !== 'String') {
      throw new Error(`Member with key ${momoa.print(next.name)} not JSON serializable`);
    }
    const i = obj.members.findIndex(
      (prev) => (prev.name as momoa.StringNode).value === (next.name as momoa.StringNode).value,
    );
    if (i !== -1) {
      switch (next.value.type) {
        // Only objects get deep merging
        case 'Object': {
          obj.members[i]!.value = mergeObjects(obj.members[i]!.value as momoa.ObjectNode, next.value);
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
export function replaceNode(a: momoa.AnyNode, b: momoa.AnyNode) {
  a.type = b.type;
  a.loc ??= b.loc;
  a.range ??= b.range;
  if (b.type === 'Object') {
    (a as momoa.ObjectNode).members = b.members;
  } else if (b.type === 'Array') {
    (a as momoa.ArrayNode).elements = b.elements;
  } else if (b.type === 'Document') {
    (a as momoa.DocumentNode).body = b.body;
  } else if (b.type !== 'Null') {
    (a as momoa.StringNode).value = (b as momoa.StringNode).value;
  }
}

export interface JSONVisitor {
  enter?: (node: momoa.AnyNode, parent: momoa.AnyNode | undefined, path: string[]) => void;
  exit?: (node: momoa.AnyNode, parent: momoa.AnyNode | undefined, path: string[]) => void;
}

/**
 * Variation of Momoa’s traverse() that also keeps track of global path.
 * Allows crude mutation of AST during traversal (along with any consequences).
 */
export function traverse(root: momoa.AnyNode, visitor: JSONVisitor): void {
  /**
   * Recursively visits a node.
   * @param {AnyNode} node The node to visit.
   * @param {AnyNode} [parent] The parent of the node to visit.
   * @return {void}
   */
  function visitNode(node: momoa.AnyNode, parent: momoa.AnyNode | undefined, path: string[] = []) {
    const nextPath = [...path];
    visitor.enter?.(node, parent, nextPath);
    switch (node.type) {
      case 'Document': {
        visitNode(node.body, node, nextPath);
        break;
      }
      case 'Array': {
        let i = 0;
        let len = node.elements.length;
        let prevElements = node.elements;
        while (i < len) {
          visitNode(node.elements[i]!, node, [...nextPath, String(i)]);
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
        visitNode(node.value, node, nextPath);
        break;
      }
      case 'Object': {
        let i = 0;
        let len = node.members.length;
        let prevMembers = node.members;
        while (i < len) {
          visitNode(node.members[i]!, node, [...nextPath, (node.members[i]!.name as momoa.StringNode).value]);
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
    visitor.exit?.(node, parent, nextPath);
  }
  visitNode(root, undefined, []);
}

export interface AsyncJSONVisitor {
  enter?: (node: momoa.AnyNode, parent: momoa.AnyNode | undefined, path: string[]) => Promise<void>;
  exit?: (node: momoa.AnyNode, parent: momoa.AnyNode | undefined, path: string[]) => Promise<void>;
}

/**
 * Async variation of Momoa’s traverse() that also keeps track of global path.
 * Allows crude mutation of AST during traversal (along with any consequences).
 */
export async function traverseAsync(root: momoa.AnyNode, visitor: AsyncJSONVisitor): Promise<void> {
  /**
   * Recursively visits a node.
   * @param {AnyNode} node The node to visit.
   * @param {AnyNode} [parent] The parent of the node to visit.
   * @return {void}
   */
  async function visitNode(node: momoa.AnyNode, parent: momoa.AnyNode | undefined, path: string[] = []) {
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
          await visitNode(node.members[i]!, node, [...nextPath, (node.members[i]!.name as momoa.StringNode).value]);
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
  node: momoa.AnyNode;
  filename = '';

  constructor(message: string, node: momoa.AnyNode, filename: string) {
    super(message);
    this.node = node;
    try {
      this.filename = filename;
    } catch {
      // noop
    }
  }
}

import type { AnyNode, ObjectNode, ValueNode } from '@humanwhocodes/momoa';

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
};

/**
 * Determines if a given value is an AST node.
 */
export function isNode(value: unknown) {
  return value && typeof value === 'object' && 'type' in value && typeof value.type === 'string';
}

/** Get ObjectNode members as object */
export function getObjMembers(node: ObjectNode): Record<string | number, ValueNode | undefined> {
  const members: Record<string, ValueNode | undefined> = {};
  if (node.type !== 'Object') {
    return members;
  }
  for (const m of node.members) {
    if (m.name.type !== 'String' && m.name.type !== 'Number') {
      continue;
    }
    members[m.name.value] = m.value;
  }
  return members;
}

/**
 * Variation of Momoa’s traverse(), which keeps track of global path
 */
export function traverse(root: AnyNode, visitor: Visitor) {
  /**
   * Recursively visits a node.
   * @param {Node} node The node to visit.
   * @param {Node} [parent] The parent of the node to visit.
   * @returns {void}
   */
  function visitNode(node: AnyNode, parent: AnyNode | undefined, path: string[] = []) {
    const nextPath = [...path];
    if (node.type === 'Member') {
      nextPath.push(node.name.value);
    }

    visitor.enter?.(node, parent, nextPath);

    for (const key of CHILD_KEYS[node.type] ?? []) {
      const value = node[key as keyof typeof node] as unknown as AnyNode;

      if (value && typeof value === 'object') {
        if (Array.isArray(value)) {
          for (let i = 0; i < value.length; i++) {
            visitNode(value[i], node, key === 'elements' ? [...nextPath, String(i)] : nextPath);
          }
        } else if (isNode(value)) {
          visitNode(value, node, nextPath);
        }
      }
    }

    visitor.exit?.(node, parent, nextPath);
  }

  visitNode(root, undefined, []);
}

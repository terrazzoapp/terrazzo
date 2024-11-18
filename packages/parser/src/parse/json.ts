import type { AnyNode, MemberNode, ObjectNode, ValueNode } from '@humanwhocodes/momoa';

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

/** Get ObjectNode members as object */
export function getObjMembers(node: ObjectNode): Record<string | number, ValueNode> {
  const members: Record<string | number, ValueNode> = {};
  if (node.type !== 'Object') {
    return members;
  }
  for (const m of node.members) {
    if (m.name.type !== 'String') {
      continue;
    }
    members[m.name.value] = m.value;
  }
  return members;
}

/**
 * Inject members to ObjectNode and return a clone
 * @param {ObjectNode} node
 * @param {MemberNode[]} members
 * @return {ObjectNode}
 */
export function injectObjMembers(node: ObjectNode, members: MemberNode[] = []): ObjectNode {
  if (node.type !== 'Object') {
    return node;
  }
  const newNode = structuredClone(node);
  newNode.members.push(...members);
  return newNode;
}

/**
 * Variation of Momoa’s traverse(), which keeps track of global path
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
export function maybeJSONString(input: string): boolean {
  return typeof input === 'string' && input.trim().startsWith('{');
}

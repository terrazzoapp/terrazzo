export const CHILD_KEYS = {
  Document: ['body'],
  Object: ['members'],
  Member: ['name', 'value'],
  Element: ['value'],
  Array: ['elements'],
  String: [],
  Number: [],
  Boolean: [],
  Null: [],
};

/** Determines if a given value is an AST node. */
export function isNode(value) {
  return value && typeof value === 'object' && 'type' in value && typeof value.type === 'string';
}

/** Get ObjectNode members as object */
export function getObjMembers(node) {
  const members = {};
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
export function traverse(root, visitor) {
  /**
   * Recursively visits a node.
   * @param {Node} node The node to visit.
   * @param {Node} [parent] The parent of the node to visit.
   * @returns {void}
   */
  function visitNode(node, parent, path = []) {
    const nextPath = [...path];
    if (node.type === 'Member') {
      nextPath.push(node.name.value);
    }

    visitor.enter?.(node, parent, nextPath);

    for (const key of CHILD_KEYS[node.type] ?? []) {
      const value = node[key];

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

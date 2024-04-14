import type { AnyNode, MemberNode, ObjectNode, ValueNode } from '@humanwhocodes/momoa';

export interface Visitor {
  enter?: (node: AnyNode, parent: AnyNode | undefined, path: string[]) => void;
  exit?: (node: AnyNode, parent: AnyNode | undefined, path: string[]) => void;
}

declare const CHILD_KEYS: {
  Document: readonly ['body'];
  Object: readonly ['members'];
  Member: readonly ['name', 'value'];
  Element: readonly ['value'];
  Array: readonly ['elements'];
  String: readonly [];
  Number: readonly [];
  Boolean: readonly [];
  Null: readonly [];
};

/** Determines if a given value is an AST node. */
export function isNode(value: unknown): boolean;

/** Get ObjectNode members as object */
export function getObjMembers(node: ObjectNode): Record<string | number, ValueNode | undefined>;

/** Inject members to ObjectNode and return a clone */
export function injectObjMembers(node: ObjectNode, members: MemberNode[]): ObjectNode;

/** Variation of Momoa’s traverse(), which keeps track of global path */
export function traverse(root: AnyNode, visitor: Visitor): void;

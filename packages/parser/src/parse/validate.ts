import {
  type AnyNode,
  type ArrayNode,
  type DocumentNode,
  type MemberNode,
  print,
  type StringNode,
} from '@humanwhocodes/momoa';
import { isAlias } from '@terrazzo/token-tools';
import type { Logger } from '../logger.js';

const listFormat = new Intl.ListFormat('en-us', { type: 'disjunction' });

export interface ValidateOptions {
  ast: DocumentNode;
  logger: Logger;
}

/**
 * Given a JSON node, does it match the expected type?
 */
function nodeIsType(node: AnyNode, validTypes: ('String' | 'Boolean' | 'Number' | 'Array' | 'Object')[]): boolean {
  return validTypes.includes(node.type as (typeof validTypes)[number]);
}

/**
 * Given a JSON node, validate that it is a valid DTCG token (MUST be a token; will err if not)
 */
export default function validate(node: MemberNode, { ast, logger }: ValidateOptions) {
  const getCodeFrame = () => ({
    code: print(ast, { indent: 2 }),
    line: (node.loc?.start.line ?? 0) + 2,
    column: (node.loc?.start.column ?? 0) + '   "$value":'.length,
  });

  if (node.type !== 'Member' && node.type !== 'Object') {
    logger.error({
      message: `Expected Object, received ${JSON.stringify((node as AnyNode).type)}`,
      codeFrame: getCodeFrame(),
    });
    return;
  }

  let $type: StringNode | undefined;
  let $value: AnyNode | undefined;

  const members = (node.value.type === 'Object' && node.value.members) || [];
  for (const m of members) {
    switch (m.name.value) {
      case '$type': {
        $type = m.value as StringNode;
        break;
      }
      case '$value': {
        $value = m.value as AnyNode;
        break;
      }
    }
  }

  if (!$type) {
    logger.error({ message: 'Token missing $type', codeFrame: getCodeFrame() });
    return;
  }
  if (!$value) {
    logger.error({ message: 'Token missing $value', codeFrame: getCodeFrame() });
    return;
  }

  // If top-level value is a valid alias, this is valid
  // (note: tokens that accept objects as values will have to check for internal aliases separately)
  if ($value.type === 'String' && isAlias($value.value)) {
    return;
  }

  switch ($type.value) {
    case 'boolean': {
      if (!nodeIsType($value, ['Boolean'])) {
        logger.error({
          label: 'parse',
          message: `Expected boolean, received ${print($value)}`,
          codeFrame: getCodeFrame(),
        });
      }
      break;
    }
    case 'color': {
      if (!nodeIsType($value, ['String'])) {
        logger.error({
          label: 'parse',
          message: `Expected string, received ${print($value)}`,
          codeFrame: getCodeFrame(),
        });
      }
      break;
    }
    case 'cubicBezier': {
      if (!nodeIsType($value, ['Array'])) {
        logger.error({
          label: 'parse',
          message: `Expected array of strings, received ${print($value)}`,
          codeFrame: getCodeFrame(),
        });
      }
      if (
        ($value as ArrayNode).elements.length !== 4 ||
        !($value as ArrayNode).elements.every((e) => e.value.type === 'Number')
      ) {
        logger.error({
          label: 'parse',
          message: 'Expected [𝑥1, 𝑦1, 𝑥2, 𝑦2]',
          codeFrame: getCodeFrame(),
        });
        break;
      }
      break;
    }
    case 'dimension': {
      if ($value.type === 'Number') {
        if ($value.value !== 0) {
          logger.error({ message: 'Missing units', codeFrame: getCodeFrame() });
          break;
        } else {
          break; // Only `0` is a valid number
        }
      } else if (!nodeIsType($value, ['String'])) {
        logger.error({ label: 'parse', message: `Expected string, received ${JSON.stringify($value)}` });
      }

      break;
    }
    case 'duration': {
      if (!nodeIsType($value, ['String'])) {
        logger.error({ label: 'parse', message: `Expected string, received ${JSON.stringify($value)}` });
      }
      break;
    }
    case 'fontFamily': {
      if (!nodeIsType($value, ['String', 'Array'])) {
        break;
      }
      break;
    }
    case 'fontWeight': {
      if (!nodeIsType($value, ['String', 'Number'])) {
        break;
      }
      break;
    }
    case 'gradient': {
      if (!nodeIsType($value, ['Array'])) {
        break;
      }
      break;
    }
    case 'shadow': {
      if (!nodeIsType($value, ['Object', 'Array'])) {
        break;
      }
      break;
    }
    case 'string': {
      if (!nodeIsType($value, ['String'])) {
        break;
      }
      break;
    }
    case 'strokeStyle': {
      if (!nodeIsType($value, ['String', 'Object'])) {
        break;
      }
      break;
    }
    case 'transition': {
      if (!nodeIsType($value, ['Object'])) {
        break;
      }
      break;
    }
    case 'typography': {
      if (!nodeIsType($value, ['Object'])) {
        break;
      }
      break;
    }
    default: {
      // noop
      break;
    }
  }
}

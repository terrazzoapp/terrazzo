import type { SourceLocation } from '@babel/code-frame';
import {
  type AnyNode,
  type ArrayNode,
  type DocumentNode,
  type MemberNode,
  type ObjectNode,
  print,
  type StringNode,
  type ValueNode,
} from '@humanwhocodes/momoa';
import { isAlias } from '@terrazzo/token-tools';
import type Logger from '../logger.js';

const listFormat = new Intl.ListFormat('en-us', { type: 'disjunction' });

export const FONT_WEIGHT_VALUES = new Set([
  'thin',
  'hairline',
  'extra-light',
  'ultra-light',
  'light',
  'normal',
  'regular',
  'book',
  'medium',
  'semi-bold',
  'demi-bold',
  'bold',
  'extra-bold',
  'ultra-bold',
  'black',
  'heavy',
  'extra-black',
  'ultra-black',
]);

export const STROKE_STYLE_VALUES = new Set([
  'solid',
  'dashed',
  'dotted',
  'double',
  'groove',
  'ridge',
  'outset',
  'inset',
]);
export const STROKE_STYLE_LINE_CAP_VALUES = new Set(['round', 'butt', 'square']);

export interface ValidateOptions {
  ast: DocumentNode;
  logger: Logger;
}

/** Get the location of a JSON node */
function getLoc(node: AnyNode): SourceLocation['start'] {
  return { line: node.loc?.start.line ?? 1, column: node.loc?.start.column };
}

/** Distinct from isAlias() in that this accepts malformed aliases */
function isMaybeAlias(node: AnyNode | undefined): boolean {
  if (node?.type === 'String') {
    return node.value.startsWith('{');
  }
  return false;
}

/** Get ObjectNode members as object */
function getObjMembers(node: ObjectNode): Record<string | number, ValueNode | undefined> {
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

/**  */
function validateMembersAs(
  $value: ObjectNode,
  properties: Record<string, { validator: typeof validateAlias; required?: boolean }>,
  node: AnyNode,
  { ast, logger }: ValidateOptions,
) {
  const members = getObjMembers($value);
  for (const property in properties) {
    const { validator, required } = properties[property]!;
    if (!members[property]) {
      if (required) {
        logger.error({ message: `Missing required property "${property}"`, node, ast, loc: getLoc($value) });
      }
      continue;
    }
    const value = members[property]!;
    if (isMaybeAlias(value)) {
      validateAlias(value, node, { ast, logger });
    } else {
      validator(value, node, { ast, logger });
    }
  }
}

export function validateAlias($value: ValueNode, node: AnyNode, { ast, logger }: ValidateOptions) {
  if ($value.type !== 'String' || !isAlias($value.value)) {
    logger.error({ message: `Invalid alias: ${print($value)}`, node, ast, loc: getLoc($value) });
  }
}

export function validateColor($value: ValueNode, node: AnyNode, { ast, logger }: ValidateOptions) {
  if ($value.type !== 'String') {
    logger.error({ message: `Expected string, received ${$value.type}`, node, ast, loc: getLoc($value) });
  } else if ($value.value === '') {
    logger.error({ message: 'Expected color, received empty string', node, ast, loc: getLoc($value) });
  }
}

export function validateCubicBézier($value: ValueNode, node: AnyNode, { ast, logger }: ValidateOptions) {
  if ($value.type !== 'Array') {
    logger.error({
      message: `Expected array of strings, received ${print($value)}`,
      node,
      ast,
      loc: getLoc($value),
    });
  } else if (
    !($value as ArrayNode).elements.every(
      (e) => e.value.type === 'Number' || (e.value.type === 'String' && isAlias(e.value.value)),
    )
  ) {
    logger.error({
      message: 'Expected an array of 4 numbers, received some non-numbers',
      node,
      ast,
      loc: getLoc($value),
    });
  } else if (($value as ArrayNode).elements.length !== 4) {
    logger.error({
      message: `Expected an array of 4 numbers, received ${($value as ArrayNode).elements.length}`,
      node,
      ast,
      loc: getLoc($value),
    });
  }
}

export function validateDimension($value: ValueNode, node: AnyNode, { ast, logger }: ValidateOptions) {
  if ($value.type === 'Number' && $value.value === 0) {
    return; // `0` is a valid number
  }
  if ($value.type !== 'String') {
    logger.error({ message: `Expected string, received ${$value.type}`, node, ast, loc: getLoc($value) });
  } else if ($value.value === '') {
    logger.error({ message: 'Expected dimension, received empty string', node, ast, loc: getLoc($value) });
  } else if (String(Number($value.value)) === $value.value) {
    logger.error({ message: 'Missing units', node, ast, loc: getLoc($value) });
  } else if (!/^[0-9]+/.test($value.value)) {
    logger.error({
      message: `Expected dimension with units, received ${print($value)}`,
      node,
      ast,
      loc: getLoc($value),
    });
  }
}

export function validateDuration($value: ValueNode, node: AnyNode, { ast, logger }: ValidateOptions) {
  if ($value.type === 'Number' && $value.value === 0) {
    return; // `0` is a valid number
  }
  if ($value.type !== 'String') {
    logger.error({ message: `Expected string, received ${$value.type}`, node, ast, loc: getLoc($value) });
  } else if ($value.value === '') {
    logger.error({ message: 'Expected duration, received empty string', node, ast, loc: getLoc($value) });
  } else if (!/m?s$/.test($value.value)) {
    logger.error({ message: 'Missing unit "ms" or "s"', node, ast, loc: getLoc($value) });
  } else if (!/^[0-9]+/.test($value.value)) {
    logger.error({
      message: `Expected duration in \`ms\` or \`s\`, received ${print($value)}`,
      node,
      ast,
      loc: getLoc($value),
    });
  }
}

export function validateFontFamily($value: ValueNode, node: AnyNode, { ast, logger }: ValidateOptions) {
  if ($value.type !== 'String' && $value.type !== 'Array') {
    logger.error({
      message: `Expected string or array of strings, received ${$value.type}`,
      node,
      ast,
      loc: getLoc($value),
    });
  }
  if ($value.type === 'String' && $value.value === '') {
    logger.error({ message: 'Expected font family name, received empty string', node, ast, loc: getLoc($value) });
  }
  if ($value.type === 'Array' && !$value.elements.every((e) => e.value.type === 'String' && e.value.value !== '')) {
    logger.error({
      message: 'Expected an array of strings, received some non-strings or empty strings',
      node,
      ast,
      loc: getLoc($value),
    });
  }
}

export function validateFontWeight($value: ValueNode, node: AnyNode, { ast, logger }: ValidateOptions) {
  if ($value.type !== 'String' && $value.type !== 'Number') {
    logger.error({
      message: `Expected a font weight name or number 0–1000, received ${$value.type}`,
      node,
      ast,
      loc: getLoc($value),
    });
  }
  if ($value.type === 'String' && !FONT_WEIGHT_VALUES.has($value.value)) {
    logger.error({
      message: `Unknown font weight ${print($value)}. Expected one of: ${listFormat.format([...FONT_WEIGHT_VALUES])}.`,
      node,
      ast,
      loc: getLoc($value),
    });
  }
  if ($value.type === 'Number' && ($value.value < 0 || $value.value > 1000)) {
    logger.error({ message: `Expected number 0–1000, received ${print($value)}`, node, ast, loc: getLoc($value) });
  }
}

export function validateNumber($value: ValueNode, node: AnyNode, { ast, logger }: ValidateOptions) {
  if ($value.type !== 'Number') {
    logger.error({
      message: `Expected number, received ${$value.type}`,
      node,
      ast,
      loc: getLoc($value),
    });
  }
}

export function validateShadowLayer($value: ValueNode, node: AnyNode, { ast, logger }: ValidateOptions) {
  if ($value.type !== 'Object') {
    logger.error({ message: `Expected Object, received ${$value.type}`, node, ast, loc: getLoc($value) });
    return;
  }
  validateMembersAs(
    $value,
    {
      color: { validator: validateColor, required: true },
      offsetX: { validator: validateDimension, required: true },
      offsetY: { validator: validateDimension, required: true },
      blur: { validator: validateDimension },
      spread: { validator: validateDimension },
    },
    node,
    { ast, logger },
  );
}

export function validateStrokeStyle($value: ValueNode, node: AnyNode, { ast, logger }: ValidateOptions) {
  // note: strokeStyle’s values are NOT aliasable (unless by string, but that breaks validations)
  if ($value.type === 'String') {
    if (!STROKE_STYLE_VALUES.has($value.value)) {
      logger.error({
        message: `Unknown stroke style ${print($value)}. Expected one of: ${listFormat.format([
          ...STROKE_STYLE_VALUES,
        ])}.`,
        node,
        ast,
        loc: getLoc($value),
      });
    }
  } else if ($value.type === 'Object') {
    const strokeMembers = getObjMembers($value);
    for (const property of ['dashArray', 'lineCap']) {
      if (!strokeMembers[property]) {
        logger.error({
          message: `Missing required property "${property}"`,
          node,
          ast,
          loc: getLoc($value),
        });
      }
    }
    const { lineCap, dashArray } = strokeMembers;
    if (lineCap?.type !== 'String' || !STROKE_STYLE_LINE_CAP_VALUES.has(lineCap.value)) {
      logger.error({
        message: `Unknown lineCap value ${print(lineCap!)}. Expected one of: ${listFormat.format([
          ...STROKE_STYLE_LINE_CAP_VALUES,
        ])}.`,
      });
    }
    if (dashArray?.type === 'Array') {
      for (const element of dashArray.elements) {
        if (element.value.type === 'String' && element.value.value !== '') {
          if (isMaybeAlias(element.value)) {
            validateAlias(element.value, node, { logger, ast });
          } else {
            validateDimension(element.value, node, { logger, ast });
          }
        } else {
          logger.error({
            message: 'Expected array of strings, recieved some non-strings or empty strings.',
            node,
            ast,
            loc: getLoc(element),
          });
        }
      }
    } else {
      logger.error({
        message: `Expected array of strings, received ${dashArray!.type}`,
        node,
        ast,
        loc: getLoc($value),
      });
    }
  } else {
    logger.error({ message: `Expected string or object, received ${$value.type}`, node, ast, loc: getLoc($value) });
  }
}

/**
 * Validate a MemberNode (the entire token object, plus its key in the parent object) to see if it’s a valid DTCG token or not.
 * Keeping the parent key really helps in debug messages.
 */
export default function validate(node: MemberNode, { ast, logger }: ValidateOptions) {
  if (node.type !== 'Member' && node.type !== 'Object') {
    logger.error({
      message: `Expected Object, received ${JSON.stringify((node as AnyNode).type)}`,
      node,
      ast,
      loc: { line: 1 },
    });
    return;
  }

  const rootMembers = node.value.type === 'Object' ? getObjMembers(node.value) : {};
  const $value = rootMembers.$value as ValueNode | undefined;
  const $type = rootMembers.$type as StringNode | undefined;

  if (!$value) {
    logger.error({ message: 'Token missing $value', node, ast, loc: getLoc(node) });
    return;
  }
  // If top-level value is a valid alias, this is valid (no need for $type)
  // ⚠️ Important: ALL Object and Array nodes below will need to check for aliases within!
  if (isMaybeAlias($value)) {
    validateAlias($value, node, { logger, ast });
    return;
  }

  if (!$type) {
    logger.error({ message: 'Token missing $type', node, ast, loc: getLoc(node) });
    return;
  }

  switch ($type.value) {
    case 'color': {
      validateColor($value, node, { logger, ast });
      break;
    }
    case 'cubicBezier': {
      validateCubicBézier($value, node, { logger, ast });
      break;
    }
    case 'dimension': {
      validateDimension($value, node, { logger, ast });
      break;
    }
    case 'duration': {
      validateDuration($value, node, { logger, ast });
      break;
    }
    case 'fontFamily': {
      validateFontFamily($value, node, { logger, ast });
      break;
    }
    case 'fontWeight': {
      validateFontWeight($value, node, { logger, ast });
      break;
    }
    case 'number': {
      validateNumber($value, node, { logger, ast });
      break;
    }
    case 'shadow': {
      if ($value.type === 'Object') {
        validateShadowLayer($value, node, { logger, ast });
      } else if ($value.type === 'Array') {
        for (const element of $value.elements) {
          validateShadowLayer(element.value, $value, { logger, ast });
        }
      } else {
        logger.error({
          message: `Expected shadow object or array of shadow objects, received ${$value.type}`,
          node,
          ast,
          loc: getLoc($value),
        });
      }
      break;
    }

    // extensions
    case 'boolean': {
      if ($value.type !== 'Boolean') {
        logger.error({ message: `Expected boolean, received ${$value.type}`, node, ast, loc: getLoc($value) });
      }
      break;
    }
    case 'link': {
      if ($value.type !== 'String') {
        logger.error({ message: `Expected string, received ${$value.type}`, node, ast, loc: getLoc($value) });
      } else if ($value.value === '') {
        logger.error({ message: 'Expected URL, received empty string', node, ast, loc: getLoc($value) });
      }
      break;
    }
    case 'string': {
      if ($value.type !== 'String') {
        logger.error({ message: `Expected string, received ${$value.type}`, node, ast, loc: getLoc($value) });
      }
      break;
    }

    // composite types
    case 'border': {
      if ($value.type !== 'Object') {
        logger.error({ message: `Expected object, received ${$value.type}`, node, ast, loc: getLoc($value) });
        break;
      }
      validateMembersAs(
        $value,
        {
          color: { validator: validateColor, required: true },
          style: { validator: validateStrokeStyle, required: true },
          width: { validator: validateDimension, required: true },
        },
        node,
        { ast, logger },
      );
      break;
    }
    case 'gradient': {
      if ($value.type !== 'Array') {
        logger.error({
          message: `Expected array of gradient stops, received ${$value.type}`,
          node,
          ast,
          loc: getLoc($value),
        });
        break;
      }
      for (let i = 0; i < $value.elements.length; i++) {
        const element = $value.elements[i]!;
        if (element.value.type !== 'Object') {
          logger.error({
            message: `Stop #${i + 1}: Expected gradient stop, received ${element.value.type}`,
            node,
            ast,
            loc: getLoc(element),
          });
          break;
        }
        validateMembersAs(
          element.value,
          {
            color: { validator: validateColor, required: true },
            position: { validator: validateNumber, required: true },
          },
          node,
          { ast, logger },
        );
      }
      break;
    }
    case 'strokeStyle': {
      validateStrokeStyle($value, node, { ast, logger });
      break;
    }
    case 'transition': {
      if ($value.type !== 'Object') {
        logger.error({ message: `Expected object, received ${$value.type}`, node, ast, loc: getLoc($value) });
        break;
      }
      const transitionMembers = getObjMembers($value);
      for (const property of ['duration', 'delay', 'timingFunction']) {
        if (!transitionMembers[property]) {
          logger.error({
            message: `Missing required property "${property}"`,
            node,
            ast,
            loc: getLoc($value),
          });
        }
      }
      validateMembersAs(
        $value,
        {
          duration: { validator: validateDuration, required: true },
          delay: { validator: validateDuration, required: true },
          timingFunction: { validator: validateCubicBézier, required: true },
        },
        node,
        { ast, logger },
      );
      break;
    }
    case 'typography': {
      if ($value.type !== 'Object') {
        logger.error({ message: `Expected object, received ${$value.type}`, node, ast, loc: getLoc($value) });
        break;
      }
      if ($value.members.length === 0) {
        logger.error({
          message: 'Empty typography token. Must contain at least 1 property.',
          node,
          ast,
          loc: getLoc($value),
        });
      }
      validateMembersAs(
        $value,
        {
          fontFamily: { validator: validateFontFamily },
          fontWeight: { validator: validateFontWeight },
        },
        node,
        { ast, logger },
      );
      break;
    }

    default: {
      // noop
      break;
    }
  }
}

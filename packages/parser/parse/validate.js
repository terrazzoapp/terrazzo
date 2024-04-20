import { print } from '@humanwhocodes/momoa';
import { isAlias } from '@terrazzo/token-tools';
import { getObjMembers } from './json.js';

const listFormat = new Intl.ListFormat('en-us', { type: 'disjunction' });

/**
 * @typedef {import("@humanwhocodes/momoa").AnyNode} AnyNode
 * @typedef {import("@humanwhocodes/momoa").ObjectNode} ObjectNode
 * @typedef {import("@humanwhocodes/momoa").ValueNode} ValueNode
 * @typedef {import("@babel/code-frame").SourceLocation} SourceLocation
 */

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

/**
 * Get the location of a JSON node
 * @param {AnyNode} node
 * @return {SourceLocation}
 */
function getLoc(node) {
  return { line: node.loc?.start.line ?? 1, column: node.loc?.start.column };
}

/**
 * Distinct from isAlias() in that this accepts malformed aliases
 * @param {AnyNode} node
 * @return {boolean}
 */
function isMaybeAlias(node) {
  if (node?.type === 'String') {
    return node.value.startsWith('{');
  }
  return false;
}

/**
 * Assert object members match given types
 * @param {ObjectNode} $value
 * @param {Record<string, { validator: typeof validateAlias; required?: boolean }>} properties
 * @param {AnyNode} node
 * @param {ValidateOptions} options
 * @return {void}
 */
function validateMembersAs($value, properties, node, { ast, logger }) {
  const members = getObjMembers($value);
  for (const property in properties) {
    const { validator, required } = properties[property];
    if (!members[property]) {
      if (required) {
        logger.error({ message: `Missing required property "${property}"`, node, ast, loc: getLoc($value) });
      }
      continue;
    }
    const value = members[property];
    if (isMaybeAlias(value)) {
      validateAlias(value, node, { ast, logger });
    } else {
      validator(value, node, { ast, logger });
    }
  }
}

/**
 * Verify an Alias token is valid
 * @param {ValueNode} $value
 * @param {AnyNode} node
 * @param {ValidateOptions} options
 * @return {void}
 */
export function validateAlias($value, node, { ast, logger }) {
  if ($value.type !== 'String' || !isAlias($value.value)) {
    logger.error({ message: `Invalid alias: ${print($value)}`, node, ast, loc: getLoc($value) });
  }
}

/**
 * Verify a Border token is valid
 * @param {ValueNode} $value
 * @param {AnyNode} node
 * @param {ValidateOptions} options
 * @return {void}
 */
export function validateBorder($value, node, { ast, logger }) {
  if ($value.type !== 'Object') {
    logger.error({ message: `Expected object, received ${$value.type}`, node, ast, loc: getLoc($value) });
    return;
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
}

/**
 * Verify a Color token is valid
 * @param {ValueNode} $value
 * @param {AnyNode} node
 * @param {ValidateOptions} options
 * @return {void}
 */
export function validateColor($value, node, { ast, logger }) {
  if ($value.type !== 'String') {
    logger.error({ message: `Expected string, received ${$value.type}`, node, ast, loc: getLoc($value) });
  } else if ($value.value === '') {
    logger.error({ message: 'Expected color, received empty string', node, ast, loc: getLoc($value) });
  }
}

/**
 * Verify a Cubic Bézier token is valid
 * @param {ValueNode} $value
 * @param {AnyNode} node
 * @param {ValidateOptions} options
 * @return {void}
 */
export function validateCubicBézier($value, node, { ast, logger }) {
  if ($value.type !== 'Array') {
    logger.error({
      message: `Expected array of strings, received ${print($value)}`,
      node,
      ast,
      loc: getLoc($value),
    });
  } else if (
    !$value.elements.every((e) => e.value.type === 'Number' || (e.value.type === 'String' && isAlias(e.value.value)))
  ) {
    logger.error({
      message: 'Expected an array of 4 numbers, received some non-numbers',
      node,
      ast,
      loc: getLoc($value),
    });
  } else if ($value.elements.length !== 4) {
    logger.error({
      message: `Expected an array of 4 numbers, received ${$value.elements.length}`,
      node,
      ast,
      loc: getLoc($value),
    });
  }
}

/**
 * Verify a Dimension token is valid
 * @param {ValueNode} $value
 * @param {AnyNode} node
 * @param {ValidateOptions} options
 * @return {void}
 */
export function validateDimension($value, node, { ast, logger }) {
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

/**
 * Verify a Duration token is valid
 * @param {ValueNode} $value
 * @param {AnyNode} node
 * @param {ValidateOptions} options
 * @return {void}
 */
export function validateDuration($value, node, { ast, logger }) {
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

/**
 * Verify a Font Family token is valid
 * @param {ValueNode} $value
 * @param {AnyNode} node
 * @param {ValidateOptions} options
 * @return {void}
 */
export function validateFontFamily($value, node, { ast, logger }) {
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

/**
 * Verify a Font Weight token is valid
 * @param {ValueNode} $value
 * @param {AnyNode} node
 * @param {ValidateOptions} options
 * @return {void}
 */
export function validateFontWeight($value, node, { ast, logger }) {
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

/**
 * Verify a Gradient token is valid
 * @param {ValueNode} $value
 * @param {AnyNode} node
 * @param {ValidateOptions} options
 * @return {void}
 */
export function validateGradient($value, node, { ast, logger }) {
  if ($value.type !== 'Array') {
    logger.error({
      message: `Expected array of gradient stops, received ${$value.type}`,
      node,
      ast,
      loc: getLoc($value),
    });
    return;
  }
  for (let i = 0; i < $value.elements.length; i++) {
    const element = $value.elements[i];
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
}

/**
 * Verify a Number token is valid
 * @param {ValueNode} $value
 * @param {AnyNode} node
 * @param {ValidateOptions} options
 * @return {void}
 */
export function validateNumber($value, node, { ast, logger }) {
  if ($value.type !== 'Number') {
    logger.error({ message: `Expected number, received ${$value.type}`, node, ast, loc: getLoc($value) });
  }
}

/**
 * Verify a Shadow token’s value is valid
 * @param {ValueNode} $value
 * @param {AnyNode} node
 * @param {ValidateOptions} options
 * @return {void}
 */
export function validateShadowLayer($value, node, { ast, logger }) {
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

/**
 * Verify a Stroke Style token is valid.
 * @param {ValueNode} $value
 * @param {AnyNode} node
 * @param {ValidateOptions} options
 * @return {void}
 */
export function validateStrokeStyle($value, node, { ast, logger }) {
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
        message: `Unknown lineCap value ${print(lineCap)}. Expected one of: ${listFormat.format([
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
        message: `Expected array of strings, received ${dashArray.type}`,
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
 * Verify a Transition token is valid
 * @param {ValueNode} $value
 * @param {AnyNode} node
 * @param {ValidateOptions} options
 * @return {void}
 */
export function validateTransition($value, node, { ast, logger }) {
  if ($value.type !== 'Object') {
    logger.error({ message: `Expected object, received ${$value.type}`, node, ast, loc: getLoc($value) });
    return;
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
}

/**
 * Validate a MemberNode (the entire token object, plus its key in the parent object) to see if it’s a valid DTCG token or not.
 * Keeping the parent key really helps in debug messages.
 * @param {AnyNode} node
 * @param {ValidateOptions} options
 * @return {void}
 */
export default function validate(node, { ast, logger }) {
  if (node.type !== 'Member' && node.type !== 'Object') {
    logger.error({
      message: `Expected Object, received ${JSON.stringify(node.type)}`,
      node,
      ast,
      loc: { line: 1 },
    });
    return;
  }

  const rootMembers = node.value.type === 'Object' ? getObjMembers(node.value) : {};
  const $value = rootMembers.$value;
  const $type = rootMembers.$type;

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
      validateBorder($value, node, { ast, logger });
      break;
    }
    case 'gradient': {
      validateGradient($value, node, { ast, logger });
      break;
    }
    case 'strokeStyle': {
      validateStrokeStyle($value, node, { ast, logger });
      break;
    }
    case 'transition': {
      validateTransition($value, node, { ast, logger });
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

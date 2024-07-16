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

export const VALID_COLORSPACES = new Set([
  'adobe-rgb',
  'display-p3',
  'hsl',
  'hwb',
  'lab',
  'lch',
  'oklab',
  'oklch',
  'prophoto',
  'rec2020',
  'srgb',
  'srgb-linear',
  'xyz',
  'xyz-d50',
  'xyz-d65',
]);

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
function validateMembersAs($value, properties, node, { source, logger }) {
  const members = getObjMembers($value);
  for (const property in properties) {
    const { validator, required } = properties[property];
    if (!members[property]) {
      if (required) {
        logger.error({ message: `Missing required property "${property}"`, node: $value, source });
      }
      continue;
    }
    const value = members[property];
    if (isMaybeAlias(value)) {
      validateAlias(value, node, { source, logger });
    } else {
      validator(value, node, { source, logger });
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
export function validateAlias($value, node, { source, logger }) {
  if ($value.type !== 'String' || !isAlias($value.value)) {
    logger.error({ message: `Invalid alias: ${print($value)}`, node: $value, source });
  }
}

/**
 * Verify a Border token is valid
 * @param {ValueNode} $value
 * @param {AnyNode} node
 * @param {ValidateOptions} options
 * @return {void}
 */
export function validateBorder($value, node, { source, logger }) {
  if ($value.type !== 'Object') {
    logger.error({ message: `Expected object, received ${$value.type}`, node: $value, source });
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
    { source, logger },
  );
}

/**
 * Verify a Color token is valid
 * @param {ValueNode} $value
 * @param {AnyNode} node
 * @param {ValidateOptions} options
 * @return {void}
 */
export function validateColor($value, node, { source, logger }) {
  if ($value.type === 'String') {
    // TODO: enable when object notation is finalized
    // logger.warn({
    //   message: 'String colors are no longer recommended; please use the object notation instead.',
    //   node: $value,
    //   source,
    // });
    if ($value.value === '') {
      logger.error({ message: 'Expected color, received empty string', node: $value, source });
    }
  } else if ($value.type === 'Object') {
    validateMembersAs(
      $value,
      {
        colorSpace: {
          validator: (v) => {
            if (v.type !== 'String') {
              logger.error({ message: `Expected string, received ${print(v)}`, node: v, source });
            }
            if (!VALID_COLORSPACES.has(v.value)) {
              logger.error({ message: `Unsupported colorspace ${print(v)}`, node: v, source });
            }
          },
          required: true,
        },
        channels: {
          validator: (v, node) => {
            if (v.type !== 'Array') {
              logger.error({ message: `Expected array, received ${print(v)}`, node: v, source });
            }
            if (v.elements?.length !== 3) {
              logger.error({ message: `Expected 3 channels, received ${v.elements?.length ?? 0}`, node: v, source });
            }
            for (const element of v.elements) {
              if (element.value.type !== 'Number') {
                logger.error({ message: `Expected number, received ${print(element.value)}`, node: element, source });
              }
            }
          },
          required: true,
        },
        hex: {
          validator: (v) => {
            if (
              v.type !== 'String' ||
              // this is a weird one—with the RegEx we test, it will work for
              // lengths of 3, 4, 6, and 8 (but not 5 or 7). So we check length
              // here, to keep the RegEx simple and readable. The "+ 1" is just
              // accounting for the '#' prefix character.
              v.value.length === 5 + 1 ||
              v.value.length === 7 + 1 ||
              !/^#[a-f0-9]{3,8}$/i.test(v.value)
            ) {
              logger.error({ message: `Invalid hex color ${print(v)}`, node: v, source });
            }
          },
        },
        alpha: { validator: validateNumber },
      },
      node,
      { source, logger },
    );
  } else {
    logger.error({ message: `Expected object, received ${$value.type}`, node: $value, source });
  }
}

/**
 * Verify a Cubic Bézier token is valid
 * @param {ValueNode} $value
 * @param {AnyNode} node
 * @param {ValidateOptions} options
 * @return {void}
 */
export function validateCubicBezier($value, node, { source, logger }) {
  if ($value.type !== 'Array') {
    logger.error({ message: `Expected array of strings, received ${print($value)}`, node: $value, source });
  } else if (
    !$value.elements.every((e) => e.value.type === 'Number' || (e.value.type === 'String' && isAlias(e.value.value)))
  ) {
    logger.error({
      message: 'Expected an array of 4 numbers, received some non-numbers',
      node: $value,
      source,
    });
  } else if ($value.elements.length !== 4) {
    logger.error({
      message: `Expected an array of 4 numbers, received ${$value.elements.length}`,
      node: $value,
      source,
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
export function validateDimension($value, node, { source, logger }) {
  if ($value.type === 'Number' && $value.value === 0) {
    return; // `0` is a valid number
  }
  if ($value.type !== 'String') {
    logger.error({ message: `Expected string, received ${$value.type}`, node: $value, source });
  } else if ($value.value === '') {
    logger.error({ message: 'Expected dimension, received empty string', node: $value, source });
  } else if (String(Number($value.value)) === $value.value) {
    logger.error({ message: 'Missing units', node: $value, source });
  } else if (!/^[0-9]+/.test($value.value)) {
    logger.error({ message: `Expected dimension with units, received ${print($value)}`, node: $value, source });
  }
}

/**
 * Verify a Duration token is valid
 * @param {ValueNode} $value
 * @param {AnyNode} node
 * @param {ValidateOptions} options
 * @return {void}
 */
export function validateDuration($value, node, { source, logger }) {
  if ($value.type === 'Number' && $value.value === 0) {
    return; // `0` is a valid number
  }
  if ($value.type !== 'String') {
    logger.error({ message: `Expected string, received ${$value.type}`, node: $value, source });
  } else if ($value.value === '') {
    logger.error({ message: 'Expected duration, received empty string', node: $value, source });
  } else if (!/m?s$/.test($value.value)) {
    logger.error({ message: 'Missing unit "ms" or "s"', node: $value, source });
  } else if (!/^[0-9]+/.test($value.value)) {
    logger.error({ message: `Expected duration in \`ms\` or \`s\`, received ${print($value)}`, node: $value, source });
  }
}

/**
 * Verify a Font Family token is valid
 * @param {ValueNode} $value
 * @param {AnyNode} node
 * @param {ValidateOptions} options
 * @return {void}
 */
export function validateFontFamily($value, node, { source, logger }) {
  if ($value.type !== 'String' && $value.type !== 'Array') {
    logger.error({ message: `Expected string or array of strings, received ${$value.type}`, node: $value, source });
  }
  if ($value.type === 'String' && $value.value === '') {
    logger.error({ message: 'Expected font family name, received empty string', node: $value, source });
  }
  if ($value.type === 'Array' && !$value.elements.every((e) => e.value.type === 'String' && e.value.value !== '')) {
    logger.error({
      message: 'Expected an array of strings, received some non-strings or empty strings',
      node: $value,
      source,
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
export function validateFontWeight($value, node, { source, logger }) {
  if ($value.type !== 'String' && $value.type !== 'Number') {
    logger.error({
      message: `Expected a font weight name or number 0–1000, received ${$value.type}`,
      node: $value,
      source,
    });
  }
  if ($value.type === 'String' && !FONT_WEIGHT_VALUES.has($value.value)) {
    logger.error({
      message: `Unknown font weight ${print($value)}. Expected one of: ${listFormat.format([...FONT_WEIGHT_VALUES])}.`,
      node: $value,
      source,
    });
  }
  if ($value.type === 'Number' && ($value.value < 0 || $value.value > 1000)) {
    logger.error({ message: `Expected number 0–1000, received ${print($value)}`, node: $value, source });
  }
}

/**
 * Verify a Gradient token is valid
 * @param {ValueNode} $value
 * @param {AnyNode} node
 * @param {ValidateOptions} options
 * @return {void}
 */
export function validateGradient($value, node, { source, logger }) {
  if ($value.type !== 'Array') {
    logger.error({ message: `Expected array of gradient stops, received ${$value.type}`, node: $value, source });
    return;
  }
  for (let i = 0; i < $value.elements.length; i++) {
    const element = $value.elements[i];
    if (element.value.type !== 'Object') {
      logger.error({
        message: `Stop #${i + 1}: Expected gradient stop, received ${element.value.type}`,
        node: element,
        source,
      });
      break;
    }
    validateMembersAs(
      element.value,
      {
        color: { validator: validateColor, required: true },
        position: { validator: validateNumber, required: true },
      },
      element,
      { source, logger },
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
export function validateNumber($value, node, { source, logger }) {
  if ($value.type !== 'Number') {
    logger.error({ message: `Expected number, received ${$value.type}`, node: $value, source });
  }
}

/**
 * Verify a Shadow token’s value is valid
 * @param {ValueNode} $value
 * @param {AnyNode} node
 * @param {ValidateOptions} options
 * @return {void}
 */
export function validateShadowLayer($value, node, { source, logger }) {
  if ($value.type !== 'Object') {
    logger.error({ message: `Expected Object, received ${$value.type}`, node: $value, source });
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
    { source, logger },
  );
}

/**
 * Verify a Stroke Style token is valid.
 * @param {ValueNode} $value
 * @param {AnyNode} node
 * @param {ValidateOptions} options
 * @return {void}
 */
export function validateStrokeStyle($value, node, { source, logger }) {
  // note: strokeStyle’s values are NOT aliasable (unless by string, but that breaks validations)
  if ($value.type === 'String') {
    if (!STROKE_STYLE_VALUES.has($value.value)) {
      logger.error({
        message: `Unknown stroke style ${print($value)}. Expected one of: ${listFormat.format([
          ...STROKE_STYLE_VALUES,
        ])}.`,
        node: $value,
        source,
      });
    }
  } else if ($value.type === 'Object') {
    const strokeMembers = getObjMembers($value);
    for (const property of ['dashArray', 'lineCap']) {
      if (!strokeMembers[property]) {
        logger.error({
          message: `Missing required property "${property}"`,
          node: $value,
          source,
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
            validateAlias(element.value, node, { logger, source });
          } else {
            validateDimension(element.value, node, { logger, source });
          }
        } else {
          logger.error({
            message: 'Expected array of strings, recieved some non-strings or empty strings.',
            node: element,
            source,
          });
        }
      }
    } else {
      logger.error({
        message: `Expected array of strings, received ${dashArray.type}`,
        node: $value,
        source,
      });
    }
  } else {
    logger.error({
      message: `Expected string or object, received ${$value.type}`,
      node: $value,
      source,
    });
  }
}

/**
 * Verify a Transition token is valid
 * @param {ValueNode} $value
 * @param {AnyNode} node
 * @param {ValidateOptions} options
 * @return {void}
 */
export function validateTransition($value, node, { source, logger }) {
  if ($value.type !== 'Object') {
    logger.error({ message: `Expected object, received ${$value.type}`, node: $value, source });
    return;
  }
  validateMembersAs(
    $value,
    {
      duration: { validator: validateDuration, required: true },
      delay: { validator: validateDuration, required: false }, // note: spec says delay is required, but Terrazzo makes delay optional
      timingFunction: { validator: validateCubicBezier, required: true },
    },
    node,
    { source, logger },
  );
}

/**
 * Validate a MemberNode (the entire token object, plus its key in the parent object) to see if it’s a valid DTCG token or not.
 * Keeping the parent key really helps in debug messages.
 * @param {AnyNode} node
 * @param {ValidateOptions} options
 * @return {void}
 */
export default function validate(node, { source, logger }) {
  if (node.type !== 'Member' && node.type !== 'Object') {
    logger.error({
      message: `Expected Object, received ${JSON.stringify(node.type)}`,
      node,
      source,
    });
    return;
  }

  const rootMembers = node.value.type === 'Object' ? getObjMembers(node.value) : {};
  const $value = rootMembers.$value;
  const $type = rootMembers.$type;

  if (!$value) {
    logger.error({ message: 'Token missing $value', node, source });
    return;
  }
  // If top-level value is a valid alias, this is valid (no need for $type)
  // ⚠️ Important: ALL Object and Array nodes below will need to check for aliases within!
  if (isMaybeAlias($value)) {
    validateAlias($value, node, { logger, source });
    return;
  }

  if (!$type) {
    logger.error({ message: 'Token missing $type', node, source });
    return;
  }

  switch ($type.value) {
    case 'color': {
      validateColor($value, node, { logger, source });
      break;
    }
    case 'cubicBezier': {
      validateCubicBezier($value, node, { logger, source });
      break;
    }
    case 'dimension': {
      validateDimension($value, node, { logger, source });
      break;
    }
    case 'duration': {
      validateDuration($value, node, { logger, source });
      break;
    }
    case 'fontFamily': {
      validateFontFamily($value, node, { logger, source });
      break;
    }
    case 'fontWeight': {
      validateFontWeight($value, node, { logger, source });
      break;
    }
    case 'number': {
      validateNumber($value, node, { logger, source });
      break;
    }
    case 'shadow': {
      if ($value.type === 'Object') {
        validateShadowLayer($value, node, { logger, source });
      } else if ($value.type === 'Array') {
        for (const element of $value.elements) {
          validateShadowLayer(element.value, $value, { logger, source });
        }
      } else {
        logger.error({
          message: `Expected shadow object or array of shadow objects, received ${$value.type}`,
          node: $value,
          source,
        });
      }
      break;
    }

    // extensions
    case 'boolean': {
      if ($value.type !== 'Boolean') {
        logger.error({ message: `Expected boolean, received ${$value.type}`, node: $value, source });
      }
      break;
    }
    case 'link': {
      if ($value.type !== 'String') {
        logger.error({ message: `Expected string, received ${$value.type}`, node: $value, source });
      } else if ($value.value === '') {
        logger.error({ message: 'Expected URL, received empty string', node: $value, source });
      }
      break;
    }
    case 'string': {
      if ($value.type !== 'String') {
        logger.error({ message: `Expected string, received ${$value.type}`, node: $value, source });
      }
      break;
    }

    // composite types
    case 'border': {
      validateBorder($value, node, { source, logger });
      break;
    }
    case 'gradient': {
      validateGradient($value, node, { source, logger });
      break;
    }
    case 'strokeStyle': {
      validateStrokeStyle($value, node, { source, logger });
      break;
    }
    case 'transition': {
      validateTransition($value, node, { source, logger });
      break;
    }
    case 'typography': {
      if ($value.type !== 'Object') {
        logger.error({ message: `Expected object, received ${$value.type}`, node: $value, source });
        break;
      }
      if ($value.members.length === 0) {
        logger.error({ message: 'Empty typography token. Must contain at least 1 property.', node: $value, source });
      }
      validateMembersAs(
        $value,
        {
          fontFamily: { validator: validateFontFamily },
          fontWeight: { validator: validateFontWeight },
        },
        node,
        { source, logger },
      );
      break;
    }

    default: {
      // noop
      break;
    }
  }
}

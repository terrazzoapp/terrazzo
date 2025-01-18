import {
  type AnyNode,
  type MemberNode,
  type ObjectNode,
  type StringNode,
  type ValueNode,
  evaluate,
  print,
} from '@humanwhocodes/momoa';
import { type Token, type TokenNormalized, isAlias, isTokenMatch, splitID } from '@terrazzo/token-tools';
import type Logger from '../logger.js';
import type { ConfigInit } from '../types.js';
import { getObjMembers, injectObjMembers } from './json.js';

const listFormat = new Intl.ListFormat('en-us', { type: 'disjunction' });

export interface ValidateOptions {
  filename?: URL;
  src: string;
  logger: Logger;
}

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

/** Distinct from isAlias() in that this accepts malformed aliases */
function isMaybeAlias(node: AnyNode) {
  if (node?.type === 'String') {
    return node.value.startsWith('{');
  }
  return false;
}

/** Assert object members match given types */
function validateMembersAs(
  $value: ObjectNode,
  properties: Record<string, { validator: typeof validateAliasSyntax; required?: boolean }>,
  node: AnyNode,
  { filename, src, logger }: ValidateOptions,
) {
  const members = getObjMembers($value);
  for (const [name, value] of Object.entries(properties)) {
    const { validator, required } = value;
    if (!members[name]) {
      if (required) {
        logger.error({
          group: 'parser',
          label: 'validate',
          message: `Missing required property "${name}"`,
          filename,
          node: $value,
          src,
        });
      }
      continue;
    }
    const memberValue = members[name];
    if (isMaybeAlias(memberValue)) {
      validateAliasSyntax(memberValue, node, { filename, src, logger });
    } else {
      validator(memberValue, node, { filename, src, logger });
    }
  }
}

/** Verify an Alias $value is formatted correctly */
export function validateAliasSyntax($value: ValueNode, _node: AnyNode, { filename, src, logger }: ValidateOptions) {
  if ($value.type !== 'String' || !isAlias($value.value)) {
    logger.error({
      group: 'parser',
      label: 'validate',
      message: `Invalid alias: ${print($value)}`,
      filename,
      node: $value,
      src,
    });
  }
}

/** Verify a Border token is valid */
export function validateBorder($value: ValueNode, node: AnyNode, { filename, src, logger }: ValidateOptions) {
  if ($value.type !== 'Object') {
    logger.error({
      group: 'parser',
      label: 'validate',
      message: `Expected object, received ${$value.type}`,
      filename,
      node: $value,
      src,
    });
  } else {
    validateMembersAs(
      $value,
      {
        color: { validator: validateColor, required: true },
        style: { validator: validateStrokeStyle, required: true },
        width: { validator: validateDimension, required: true },
      },
      node,
      { filename, src, logger },
    );
  }
}

/** Verify a Color token is valid */
export function validateColor($value: ValueNode, node: AnyNode, { filename, src, logger }: ValidateOptions) {
  const baseMessage = { group: 'parser' as const, label: 'validate', filename, node: $value, src };
  if ($value.type === 'String') {
    // TODO: enable when object notation is finalized
    // logger.warn({
    //   filename,
    //   message: 'String colors are no longer recommended; please use the object notation instead.',
    //   node: $value,
    //   src,
    // });
    if ($value.value === '') {
      logger.error({ ...baseMessage, message: 'Expected color, received empty string' });
    }
  } else if ($value.type === 'Object') {
    validateMembersAs(
      $value,
      {
        colorSpace: {
          validator: (v) => {
            if (v.type !== 'String') {
              logger.error({
                ...baseMessage,
                message: `Expected string, received ${print(v)}`,
                node: v,
              });
            }
            if (!VALID_COLORSPACES.has((v as StringNode).value)) {
              logger.error({
                ...baseMessage,
                message: `Unsupported colorspace ${print(v)}`,
                node: v,
              });
            }
          },
          required: true,
        },
        channels: {
          validator: (v) => {
            if (v.type !== 'Array') {
              logger.error({
                ...baseMessage,
                message: `Expected array, received ${print(v)}`,
                node: v,
              });
            } else {
              if (v.elements?.length !== 3) {
                logger.error({
                  ...baseMessage,
                  message: `Expected 3 channels, received ${v.elements?.length ?? 0}`,
                  node: v,
                });
              }
              for (const element of v.elements) {
                if (element.value.type !== 'Number') {
                  logger.error({
                    ...baseMessage,
                    message: `Expected number, received ${print(element.value)}`,
                    node: element,
                  });
                }
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
              logger.error({
                ...baseMessage,
                message: `Invalid hex color ${print(v)}`,
                node: v,
              });
            }
          },
        },
        alpha: { validator: validateNumber },
      },
      node,
      { filename, src, logger },
    );
  } else {
    logger.error({
      ...baseMessage,
      message: `Expected object, received ${$value.type}`,
      node: $value,
    });
  }
}

/** Verify a Cubic Bézier token is valid */
export function validateCubicBezier($value: ValueNode, _node: AnyNode, { filename, src, logger }: ValidateOptions) {
  const baseMessage = { group: 'parser' as const, label: 'validate', filename, node: $value, src };
  if ($value.type !== 'Array') {
    logger.error({ ...baseMessage, message: `Expected array of strings, received ${print($value)}` });
  } else if (
    !$value.elements.every((e) => e.value.type === 'Number' || (e.value.type === 'String' && isAlias(e.value.value)))
  ) {
    logger.error({ ...baseMessage, message: 'Expected an array of 4 numbers, received some non-numbers' });
  } else if ($value.elements.length !== 4) {
    logger.error({ ...baseMessage, message: `Expected an array of 4 numbers, received ${$value.elements.length}` });
  }
}

/** Verify a Dimension token is valid */
export function validateDimension($value: ValueNode, _node: AnyNode, { filename, src, logger }: ValidateOptions) {
  if ($value.type === 'Number' && $value.value === 0) {
    return; // `0` is a valid number
  }

  const baseMessage = { group: 'parser' as const, label: 'validate', filename, node: $value, src };

  // Give priority to object notation because it’s a faster code path
  if ($value.type === 'Object') {
    const { value, unit } = getObjMembers($value);
    if (!value) {
      logger.error({ ...baseMessage, message: 'Missing required property "value".' });
    }
    if (!unit) {
      logger.error({ ...baseMessage, message: 'Missing required property "unit".' });
    }
    if (value!.type !== 'Number') {
      logger.error({
        ...baseMessage,
        message: `Expected number, received ${value!.type}`,
        node: value,
      });
    }
    if (!['px', 'em', 'rem'].includes((unit as StringNode).value)) {
      logger.error({
        ...baseMessage,
        message: `Expected unit "px", "em", or "rem", received ${print(unit as StringNode)}`,
        node: unit,
      });
    }
    return;
  }

  // Backwards compat: string
  if ($value.type !== 'String') {
    logger.error({ ...baseMessage, message: `Expected string, received ${$value.type}` });
  }
  const value = ($value as StringNode).value.match(/^-?[0-9.]+/)?.[0];
  const unit = ($value as StringNode).value.replace(value!, '');
  if (($value as StringNode).value === '') {
    logger.error({ ...baseMessage, message: 'Expected dimension, received empty string' });
  } else if (!['px', 'em', 'rem'].includes(unit)) {
    logger.error({
      ...baseMessage,
      message: `Expected unit "px", "em", or "rem", received ${JSON.stringify(unit || ($value as StringNode).value)}`,
    });
  } else if (!Number.isFinite(Number.parseFloat(value!))) {
    logger.error({ ...baseMessage, message: `Expected dimension with units, received ${print($value)}` });
  }
}

/** Verify a Duration token is valid */
export function validateDuration($value: ValueNode, _node: AnyNode, { filename, src, logger }: ValidateOptions) {
  if ($value.type === 'Number' && $value.value === 0) {
    return; // `0` is a valid number
  }

  const baseMessage = { group: 'parser' as const, label: 'validate', filename, node: $value, src };

  // Give priority to object notation because it’s a faster code path
  if ($value.type === 'Object') {
    const { value, unit } = getObjMembers($value);
    if (!value) {
      logger.error({ ...baseMessage, message: 'Missing required property "value".' });
    }
    if (!unit) {
      logger.error({ ...baseMessage, message: 'Missing required property "unit".' });
    }
    if (value?.type !== 'Number') {
      logger.error({
        ...baseMessage,
        message: `Expected number, received ${value?.type}`,
        node: value,
      });
    }
    if (!['ms', 's'].includes((unit as StringNode).value)) {
      logger.error({
        ...baseMessage,
        message: `Expected unit "ms" or "s", received ${print(unit!)}`,
        node: unit,
      });
    }
    return;
  }

  // Backwards compat: string
  if ($value.type !== 'String') {
    logger.error({ ...baseMessage, message: `Expected string, received ${$value.type}` });
  }
  const value = ($value as StringNode).value.match(/^-?[0-9.]+/)?.[0]!;
  const unit = ($value as StringNode).value.replace(value, '');
  if (($value as StringNode).value === '') {
    logger.error({ ...baseMessage, message: 'Expected duration, received empty string' });
  } else if (!['ms', 's'].includes(unit)) {
    logger.error({
      ...baseMessage,
      message: `Expected unit "ms" or "s", received ${JSON.stringify(unit || ($value as StringNode).value)}`,
    });
  } else if (!Number.isFinite(Number.parseFloat(value))) {
    logger.error({ ...baseMessage, message: `Expected duration with units, received ${print($value)}` });
  }
}

/**  Verify a Font Family token is valid */
export function validateFontFamily($value: ValueNode, _node: AnyNode, { filename, src, logger }: ValidateOptions) {
  const baseMessage = { group: 'parser' as const, label: 'validate', filename, node: $value, src };
  if ($value.type !== 'String' && $value.type !== 'Array') {
    logger.error({ ...baseMessage, message: `Expected string or array of strings, received ${$value.type}` });
  }
  if ($value.type === 'String' && $value.value === '') {
    logger.error({ ...baseMessage, message: 'Expected font family name, received empty string' });
  }
  if ($value.type === 'Array' && !$value.elements.every((e) => e.value.type === 'String' && e.value.value !== '')) {
    logger.error({
      ...baseMessage,
      message: 'Expected an array of strings, received some non-strings or empty strings',
    });
  }
}

/** Verify a Font Weight token is valid */
export function validateFontWeight($value: ValueNode, _node: AnyNode, { filename, src, logger }: ValidateOptions) {
  const baseMessage = { group: 'parser' as const, label: 'validate', filename, node: $value, src };
  if ($value.type !== 'String' && $value.type !== 'Number') {
    logger.error({ ...baseMessage, message: `Expected a font weight name or number 0–1000, received ${$value.type}` });
  }
  if ($value.type === 'String' && !FONT_WEIGHT_VALUES.has($value.value)) {
    logger.error({
      ...baseMessage,
      message: `Unknown font weight ${print($value)}. Expected one of: ${listFormat.format([...FONT_WEIGHT_VALUES])}.`,
    });
  }
  if ($value.type === 'Number' && ($value.value < 0 || $value.value > 1000)) {
    logger.error({ ...baseMessage, message: `Expected number 0–1000, received ${print($value)}` });
  }
}

/** Verify a Gradient token is valid */
export function validateGradient($value: ValueNode, _node: AnyNode, { filename, src, logger }: ValidateOptions) {
  const baseMessage = { group: 'parser' as const, label: 'validate', filename, node: $value, src };

  if ($value.type !== 'Array') {
    logger.error({ ...baseMessage, message: `Expected array of gradient stops, received ${$value.type}` });
  } else {
    for (let i = 0; i < $value.elements.length; i++) {
      const element = $value.elements[i]!;
      if (element.value.type !== 'Object') {
        logger.error({
          ...baseMessage,
          message: `Stop #${i + 1}: Expected gradient stop, received ${element.value.type}`,
          node: element,
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
        { filename, src, logger },
      );
    }
  }
}

/** Verify a Number token is valid */
export function validateNumber($value: ValueNode, _node: AnyNode, { filename, src, logger }: ValidateOptions) {
  if ($value.type !== 'Number') {
    logger.error({
      group: 'parser',
      label: 'validate',
      message: `Expected number, received ${$value.type}`,
      filename,
      node: $value,
      src,
    });
  }
}

/** Verify a Boolean token is valid */
export function validateBoolean($value: ValueNode, _node: AnyNode, { filename, src, logger }: ValidateOptions) {
  if ($value.type !== 'Boolean') {
    logger.error({
      group: 'parser',
      label: 'validate',
      message: `Expected boolean, received ${$value.type}`,
      filename,
      node: $value,
      src,
    });
  }
}

/** Verify a Shadow token’s value is valid */
export function validateShadowLayer($value: ValueNode, node: AnyNode, { filename, src, logger }: ValidateOptions) {
  if ($value.type !== 'Object') {
    logger.error({
      group: 'parser',
      label: 'validate',
      message: `Expected Object, received ${$value.type}`,
      filename,
      node: $value,
      src,
    });
  } else {
    validateMembersAs(
      $value,
      {
        color: { validator: validateColor, required: true },
        offsetX: { validator: validateDimension, required: true },
        offsetY: { validator: validateDimension, required: true },
        blur: { validator: validateDimension },
        spread: { validator: validateDimension },
        inset: { validator: validateBoolean },
      },
      node,
      { filename, src, logger },
    );
  }
}

/** Verify a Stroke Style token is valid. */
export function validateStrokeStyle($value: ValueNode, node: AnyNode, { filename, src, logger }: ValidateOptions) {
  const baseMessage = { group: 'parser' as const, label: 'validate', filename, node: $value, src };

  // note: strokeStyle’s values are NOT aliasable (unless by string, but that breaks validations)
  if ($value.type === 'String') {
    if (!STROKE_STYLE_VALUES.has($value.value)) {
      logger.error({
        ...baseMessage,
        message: `Unknown stroke style ${print($value)}. Expected one of: ${listFormat.format([
          ...STROKE_STYLE_VALUES,
        ])}.`,
      });
    }
  } else if ($value.type === 'Object') {
    const strokeMembers = getObjMembers($value);
    for (const property of ['dashArray', 'lineCap']) {
      if (!strokeMembers[property]) {
        logger.error({ ...baseMessage, message: `Missing required property "${property}"` });
      }
    }
    const { lineCap, dashArray } = strokeMembers;
    if (lineCap?.type !== 'String' || !STROKE_STYLE_LINE_CAP_VALUES.has(lineCap.value)) {
      logger.error({
        ...baseMessage,
        message: `Unknown lineCap value ${print(lineCap!)}. Expected one of: ${listFormat.format([
          ...STROKE_STYLE_LINE_CAP_VALUES,
        ])}.`,
        node,
      });
    }
    if (dashArray?.type === 'Array') {
      for (const element of dashArray.elements) {
        if (element.value.type === 'String' && element.value.value !== '') {
          if (isMaybeAlias(element.value)) {
            validateAliasSyntax(element.value, node, { logger, src });
          } else {
            validateDimension(element.value, node, { logger, src });
          }
        } else {
          logger.error({
            ...baseMessage,
            message: 'Expected array of strings, recieved some non-strings or empty strings.',
            node: element,
          });
        }
      }
    } else {
      logger.error({ ...baseMessage, message: `Expected array of strings, received ${dashArray!.type}` });
    }
  } else {
    logger.error({ ...baseMessage, message: `Expected string or object, received ${$value.type}` });
  }
}

/** Verify a Transition token is valid */
export function validateTransition($value: ValueNode, node: AnyNode, { filename, src, logger }: ValidateOptions) {
  if ($value.type !== 'Object') {
    logger.error({
      group: 'parser',
      label: 'validate',
      message: `Expected object, received ${$value.type}`,
      filename,
      node: $value,
      src,
    });
  } else {
    validateMembersAs(
      $value,
      {
        duration: { validator: validateDuration, required: true },
        delay: { validator: validateDuration, required: false }, // note: spec says delay is required, but Terrazzo makes delay optional
        timingFunction: { validator: validateCubicBezier, required: true },
      },
      node,
      { filename, src, logger },
    );
  }
}

/**
 * Validate a MemberNode (the entire token object, plus its key in the parent
 * object) to see if it’s a valid DTCG token or not. Keeping the parent key
 * really helps in debug messages.
 */
export function validateTokenMemberNode(node: MemberNode, { filename, src, logger }: ValidateOptions) {
  const baseMessage = { group: 'parser' as const, label: 'validate', filename, node, src };

  if (node.type !== 'Member' && node.type !== 'Object') {
    logger.error({
      ...baseMessage,
      message: `Expected Object, received ${JSON.stringify(
        // @ts-ignore Yes, TypeScript, this SHOULD be unexpected. This is why we’re validating.
        node.type,
      )}`,
    });
  }

  const rootMembers = node.value.type === 'Object' ? getObjMembers(node.value) : {};
  const $value = rootMembers.$value as ValueNode;
  const $type = rootMembers.$type as StringNode;

  if (!$value) {
    logger.error({ ...baseMessage, message: 'Token missing $value' });
  }
  // If top-level value is a valid alias, this is valid (no need for $type)
  // ⚠️ Important: ALL Object and Array nodes below will need to check for aliases within!
  if (isMaybeAlias($value)) {
    validateAliasSyntax($value, node, { logger, src });
    return;
  }

  if (!$type) {
    logger.error({ ...baseMessage, message: 'Token missing $type' });
  }

  switch ($type.value) {
    case 'color': {
      validateColor($value, node, { logger, src });
      break;
    }
    case 'cubicBezier': {
      validateCubicBezier($value, node, { logger, src });
      break;
    }
    case 'dimension': {
      validateDimension($value, node, { logger, src });
      break;
    }
    case 'duration': {
      validateDuration($value, node, { logger, src });
      break;
    }
    case 'fontFamily': {
      validateFontFamily($value, node, { logger, src });
      break;
    }
    case 'fontWeight': {
      validateFontWeight($value, node, { logger, src });
      break;
    }
    case 'number': {
      validateNumber($value, node, { logger, src });
      break;
    }
    case 'shadow': {
      if ($value.type === 'Object') {
        validateShadowLayer($value, node, { logger, src });
      } else if ($value.type === 'Array') {
        for (const element of $value.elements) {
          validateShadowLayer(element.value, $value, { logger, src });
        }
      } else {
        logger.error({
          ...baseMessage,
          message: `Expected shadow object or array of shadow objects, received ${$value.type}`,
          node: $value,
        });
      }
      break;
    }

    // extensions
    case 'boolean': {
      if ($value.type !== 'Boolean') {
        logger.error({
          ...baseMessage,
          message: `Expected boolean, received ${$value.type}`,
          node: $value,
        });
      }
      break;
    }
    case 'link': {
      if ($value.type !== 'String') {
        logger.error({
          ...baseMessage,
          message: `Expected string, received ${$value.type}`,
          node: $value,
        });
      } else if ($value.value === '') {
        logger.error({
          ...baseMessage,
          message: 'Expected URL, received empty string',
          node: $value,
        });
      }
      break;
    }
    case 'string': {
      if ($value.type !== 'String') {
        logger.error({
          ...baseMessage,
          message: `Expected string, received ${$value.type}`,
          node: $value,
        });
      }
      break;
    }

    // composite types
    case 'border': {
      validateBorder($value, node, { filename, src, logger });
      break;
    }
    case 'gradient': {
      validateGradient($value, node, { filename, src, logger });
      break;
    }
    case 'strokeStyle': {
      validateStrokeStyle($value, node, { filename, src, logger });
      break;
    }
    case 'transition': {
      validateTransition($value, node, { filename, src, logger });
      break;
    }
    case 'typography': {
      if ($value.type !== 'Object') {
        logger.error({
          ...baseMessage,
          message: `Expected object, received ${$value.type}`,
          node: $value,
        });
        break;
      }
      if ($value.members.length === 0) {
        logger.error({
          ...baseMessage,
          message: 'Empty typography token. Must contain at least 1 property.',
          node: $value,
        });
      }
      validateMembersAs(
        $value,
        {
          fontFamily: { validator: validateFontFamily },
          fontWeight: { validator: validateFontWeight },
        },
        node,
        { filename, src, logger },
      );
      break;
    }

    default: {
      // noop
      break;
    }
  }
}

export interface ValidateTokenNodeOptions {
  subpath: string[];
  src: string;
  filename: URL;
  config: ConfigInit;
  logger: Logger;
  parent?: AnyNode;
  $typeInheritance?: Record<string, Token['$type']>;
}

export default function validateTokenNode(
  node: MemberNode,
  { config, filename, logger, parent, src, subpath, $typeInheritance }: ValidateTokenNodeOptions,
): TokenNormalized | undefined {
  // const start = performance.now();

  // don’t validate $value
  if (subpath.includes('$value') || node.value.type !== 'Object') {
    return;
  }

  const members = getObjMembers(node.value);

  // keep track of $types
  if ($typeInheritance && members.$type && members.$type.type === 'String' && !members.$value) {
    // @ts-ignore
    $typeInheritance[subpath.join('.') || '.'] = node.value.members.find((m) => m.name.value === '$type');
  }

  // don’t validate $extensions or $defs
  if (!members.$value || subpath.includes('$extensions') || subpath.includes('$deps')) {
    return;
  }

  const id = subpath.join('.');

  if (!subpath.includes('.$value') && members.value) {
    logger.warn({
      group: 'parser',
      label: 'validate',
      message: `Group ${id} has "value". Did you mean "$value"?`,
      filename,
      node,
      src,
    });
  }

  const extensions = members.$extensions ? getObjMembers(members.$extensions as ObjectNode) : undefined;
  const sourceNode = structuredClone(node);

  // get parent type by taking the closest-scoped $type (length === closer)
  let parent$type: Token['$type'] | undefined;
  let longestPath = '';
  for (const [k, v] of Object.entries($typeInheritance ?? {})) {
    if (k === '.' || id.startsWith(k)) {
      if (k.length > longestPath.length) {
        parent$type = v;
        longestPath = k;
      }
    }
  }
  if (parent$type && !members.$type) {
    injectObjMembers(
      // @ts-ignore
      sourceNode.value,
      [parent$type],
    );
  }

  validateTokenMemberNode(sourceNode, { filename, src, logger });

  // All tokens must be valid, so we want to validate it up till this
  // point. However, if we are ignoring this token (or respecting
  // $deprecated, we can omit it from the output.
  const $deprecated = members.$deprecated && (evaluate(members.$deprecated) as string | boolean | undefined);
  if ((config.ignore.deprecated && $deprecated) || (config.ignore.tokens && isTokenMatch(id, config.ignore.tokens))) {
    return;
  }

  const group: TokenNormalized['group'] = { id: splitID(id).group!, tokens: [] };
  if (parent$type) {
    group.$type =
      // @ts-ignore
      parent$type.value.value;
  }
  // note: this will also include sibling tokens, so be selective about only accessing group-specific properties
  const groupMembers = getObjMembers(
    // @ts-ignore
    parent,
  );
  if (groupMembers.$description) {
    group.$description = evaluate(groupMembers.$description) as string;
  }
  if (groupMembers.$extensions) {
    group.$extensions = evaluate(groupMembers.$extensions) as Record<string, unknown>;
  }
  const token: TokenNormalized = {
    // @ts-ignore
    $type: members.$type?.value ?? parent$type?.value.value,
    // @ts-ignore
    $value: evaluate(members.$value),
    id,
    // @ts-ignore
    mode: {},
    // @ts-ignore
    originalValue: evaluate(node.value),
    group,
    source: {
      loc: filename ? filename.href : undefined,
      // @ts-ignore
      node: sourceNode.value,
    },
  };
  // @ts-ignore
  if (members.$description?.value) {
    // @ts-ignore
    token.$description = members.$description.value;
  }

  // handle modes
  // note that circular refs are avoided here, such as not duplicating `modes`
  const modeValues = extensions?.mode
    ? getObjMembers(
        // @ts-ignore
        extensions.mode,
      )
    : {};
  for (const mode of ['.', ...Object.keys(modeValues)]) {
    token.mode[mode] = {
      id: token.id,
      // @ts-ignore
      $type: token.$type,
      // @ts-ignore
      $value: mode === '.' ? token.$value : evaluate(modeValues[mode]),
      source: {
        loc: filename ? filename.href : undefined,
        // @ts-ignore
        node: mode === '.' ? structuredClone(token.source.node) : modeValues[mode],
      },
    };
    if (token.$description) {
      token.mode[mode]!.$description = token.$description;
    }
  }

  // logger.debug({
  //   message: `${token.id}: validateTokenNode`,
  //   group: 'parser', label: 'validate',
  //   label: 'validate',
  //   timing: performance.now() - start,
  // });
  return token;
}

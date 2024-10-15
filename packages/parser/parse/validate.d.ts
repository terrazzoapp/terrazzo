import type { AnyNode, MemberNode, ValueNode } from '@humanwhocodes/momoa';
import type Logger from '../logger.js';

declare const FONT_WEIGHT_VALUES: Set<string>;

declare const STROKE_STYLE_VALUES: Set<string>;
declare const STROKE_STYLE_LINE_CAP_VALUES: Set<string>;

export interface ValidateOptions {
  filename?: URL;
  src: string;
  logger: Logger;
}

export function validateAliasSyntax($value: ValueNode, node: AnyNode, options: ValidateOptions): void;

export function validateBorder($value: ValueNode, node: AnyNode, options: ValidateOptions): void;

export function validateColor($value: ValueNode, node: AnyNode, options: ValidateOptions): void;

export function validateCubicBezier($value: ValueNode, node: AnyNode, options: ValidateOptions): void;

export function validateDimension($value: ValueNode, node: AnyNode, options: ValidateOptions): void;

export function validateDuration($value: ValueNode, node: AnyNode, options: ValidateOptions): void;

export function validateFontFamily($value: ValueNode, node: AnyNode, options: ValidateOptions): void;

export function validateFontWeight($value: ValueNode, node: AnyNode, options: ValidateOptions): void;

export function validateGradient($value: ValueNode, node: AnyNode, options: ValidateOptions): void;

export function validateNumber($value: ValueNode, node: AnyNode, options: ValidateOptions): void;

export function validateShadowLayer($value: ValueNode, node: AnyNode, options: ValidateOptions): void;

export function validateStrokeStyle($value: ValueNode, node: AnyNode, options: ValidateOptions): void;

export function validateTransition($value: ValueNode, node: AnyNode, options: ValidateOptions): void;

export function validateTypography($value: ValueNode, node: AnyNode, options: ValidateOptions): void;

export default function validate(node: MemberNode, options: ValidateOptions): void;

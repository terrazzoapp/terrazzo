import {
  BorderToken,
  ColorToken,
  CubicBezierToken,
  DimensionToken,
  DurationToken,
  FontFamilyToken,
  FontWeightToken,
  GradientToken,
  LinkToken,
  NumberToken,
  ShadowToken,
  StrokeStyleToken,
  TransitionToken,
  TypographyToken,
} from '@terrazzo/icons';
import clsx from 'clsx';
import type { ComponentProps } from 'react';
import './TokenType.css';

export type TokenKind =
  | 'color'
  | 'dimension'
  | 'fontFamily'
  | 'fontWeight'
  | 'duration'
  | 'cubicBezier'
  | 'number'
  | 'link'
  | 'strokeStyle'
  | 'border'
  | 'transition'
  | 'shadow'
  | 'gradient'
  | 'typography';

export const TOKEN_TYPE_DISPLAY_NAME: Record<TokenKind, string> = {
  color: 'Color',
  dimension: 'Dimension',
  fontFamily: 'Font Family',
  fontWeight: 'Font Weight',
  duration: 'Duration',
  cubicBezier: 'Cubic Bézier',
  number: 'Number',
  link: 'Link',
  strokeStyle: 'Stroke Style',
  border: 'Border',
  transition: 'Transition',
  shadow: 'Shadow',
  gradient: 'Gradient',
  typography: 'Typography',
};

export const TOKEN_TYPE_ICON: Record<TokenKind, typeof ColorToken> = {
  color: ColorToken,
  dimension: DimensionToken,
  fontFamily: FontFamilyToken,
  fontWeight: FontWeightToken,
  duration: DurationToken,
  cubicBezier: CubicBezierToken,
  number: NumberToken,
  link: LinkToken,
  strokeStyle: StrokeStyleToken,
  border: BorderToken,
  transition: TransitionToken,
  shadow: ShadowToken,
  gradient: GradientToken,
  typography: TypographyToken,
};

export interface TokenTypeProps extends ComponentProps<'div'> {
  /** default: `true` */
  showIcon?: boolean;
  type: TokenKind;
}

export default function TokenType({ className, children, showIcon = true, type, ref, ...rest }: TokenTypeProps) {
  const Icon = TOKEN_TYPE_ICON[type];
  return (
    <div className={clsx('tz-tokentype', className)} ref={ref} {...rest}>
      {showIcon && <Icon role="graphics-symbol" className="tz-tokentype-icon" aria-hidden="true" />}
      {TOKEN_TYPE_DISPLAY_NAME[type]}
      {children}
    </div>
  );
}

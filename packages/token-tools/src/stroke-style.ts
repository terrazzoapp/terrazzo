export const STROKE_STYLE_STRING_VALUES = [
  'solid',
  'dashed',
  'dotted',
  'double',
  'groove',
  'ridge',
  'outset',
  'inset',
] as const;

export const STROKE_STYLE_OBJECT_REQUIRED_PROPERTIES = ['dashArray', 'lineCap'] as const;

export const STROKE_STYLE_LINE_CAP_VALUES = ['round', 'butt', 'square'] as const;

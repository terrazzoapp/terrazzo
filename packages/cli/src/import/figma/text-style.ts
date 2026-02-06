import type { Node } from '@figma/rest-api-spec';
import type { TypographyValue } from '@terrazzo/token-tools';

/** Return a typography token from text */
export function textStyle(node: Node): TypographyValue | undefined {
  if ('style' in node) {
    return {
      fontFamily: [node.style.fontFamily!],
      fontWeight: node.style.fontWeight,
      fontStyle: node.style.fontStyle,
      fontSize: node.style.fontSize ? { value: node.style.fontSize, unit: 'px' } : { value: 1, unit: 'em' },
      letterSpacing: { value: node.style.letterSpacing ?? 0, unit: 'px' },
      lineHeight:
        'lineHeightPercentFontSize' in node.style
          ? node.style.lineHeightPercentFontSize!
          : 'lineHeightPx' in node.style
            ? { value: node.style.lineHeightPx!, unit: 'px' }
            : 1,
    };
  }
}

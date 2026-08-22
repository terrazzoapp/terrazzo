import type {
  DropShadowEffect,
  InnerShadowEffect,
  Node,
  PublishedStyle,
  Style,
  TypeStyle,
} from '@figma/rest-api-spec';
import type {
  ColorValue,
  DimensionToken,
  GradientValue,
  Logger,
  NumberToken,
  ShadowValue,
  TypographyValue,
} from '@terrazzo/parser';

import { formatName, getFile, getFileNodes, getFileStyles } from './lib.js';

/** /v1/files/:file_key/styles */
export async function getStyles(
  fileKey: string,
  { logger, unpublished }: { logger: Logger; unpublished?: boolean },
): Promise<{ count: number; code: any }> {
  const result: { count: number; code: any } = {
    count: 0,
    code: {
      sets: {
        styles: {
          sources: [{}],
        },
      },
    },
  };

  const styleNodeIDs = new Set<string>();
  const stylesByID = new Map<string, Style | PublishedStyle>();

  if (unpublished) {
    const styles = await getFile(fileKey, { logger });
    for (const [id, style] of Object.entries(styles.styles)) {
      styleNodeIDs.add(id);
      stylesByID.set(id, style);
    }
  } else {
    const styles = await getFileStyles(fileKey, { logger });
    for (const style of styles.meta.styles) {
      styleNodeIDs.add(style.node_id);
      stylesByID.set(style.node_id, style);
    }
  }

  const fileNodes = await getFileNodes(fileKey, { ids: [...styleNodeIDs], logger });

  result.count += styleNodeIDs.size;
  for (const [id, s] of stylesByID) {
    const styleNode = fileNodes.nodes[id];
    if (!styleNode) {
      logger.warn({
        group: 'import',
        message: `Style ${s.name} not found in file nodes. Does it need to be published?`,
      });
      continue;
    }

    const styleType = 'style_type' in s ? s.style_type : s.styleType;
    const tokenBase = {
      $type: undefined as any,
      $description: s.description || undefined,
      $value: undefined as any,
      $extensions: {
        'figma.com': {
          name: s.name,
          node_id: id,
          created_at: 'created_at' in s ? s.created_at : undefined,
          updated_at: 'updated_at' in s ? s.updated_at : undefined,
        },
      },
    };

    switch (styleType) {
      case 'FILL': {
        const $value = fillStyle(styleNode.document);
        if (!$value) {
          logger.error({
            group: 'import',
            message: `Could not parse fill for ${s.name}`,
            continueOnError: true,
          });
        }
        if (Array.isArray($value)) {
          tokenBase.$type = 'gradient';
        } else {
          tokenBase.$type = 'color';
        }
        tokenBase.$value = $value;
        break;
      }
      case 'TEXT': {
        const $value = textStyle(styleNode.document);
        if (!$value) {
          logger.error({
            group: 'import',
            message: `Could not parse text for ${s.name}`,
            continueOnError: true,
          });
        }
        tokenBase.$type = 'typography';
        tokenBase.$value = $value;
        break;
      }
      case 'EFFECT': {
        const $value = effectStyle(styleNode.document);
        if (!$value) {
          logger.error({
            group: 'import',
            message: `Could not parse effect for ${s.name}`,
            continueOnError: true,
          });
        }
        tokenBase.$type = 'shadow';
        tokenBase.$value = $value;
        break;
      }
      case 'GRID': {
        const layoutGrids = gridStyles(styleNode.document);
        if (!layoutGrids) {
          logger.error({
            group: 'import',
            message: `Could not parse grid for ${s.name}`,
            continueOnError: true,
          });
          break;
        }
        // Note: Grids scaffold out multiple sub-components, so we need to “cheat” a little here
        let node = result.code.sets.styles.sources[0];
        const path = s.name.split('/').map(formatName);
        const name = path.pop()!;
        for (const key of path) {
          if (!(key in node)) {
            node[key] = {};
          }
          node = node[key];
        }
        node[name] = layoutGrids;
        break;
      }
    }

    // Only place in tree if we got a value for it
    if (tokenBase.$value !== undefined) {
      let node = result.code.sets.styles.sources[0];
      const path = s.name.split('/').map(formatName);
      const name = path.pop()!;
      for (const key of path) {
        if (!(key in node)) {
          node[key] = {};
        }
        node = node[key];
      }
      node[name] = tokenBase;
    }
  }

  return result;
}

/** Return a shadow token from an effect */
export function effectStyle(node: Node): ShadowValue[] | undefined {
  if ('effects' in node) {
    const shadows = node.effects.filter(
      (e) => e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW',
    ) as (DropShadowEffect | InnerShadowEffect)[];
    if (shadows.length > 0) {
      return shadows.map((s) => ({
        inset: s.type === 'INNER_SHADOW',
        offsetX: { value: s.offset.x, unit: 'px' },
        offsetY: { value: s.offset.y, unit: 'px' },
        blur: { value: s.radius, unit: 'px' },
        spread: { value: s.spread ?? 0, unit: 'px' },
        color: {
          colorSpace: 'srgb',
          components: [s.color.r, s.color.g, s.color.b],
          alpha: s.color.a,
        },
      }));
    }
  }
}

/** Return a color or gradient token from a fill */
export function fillStyle(node: Node): ColorValue | GradientValue | undefined {
  if ('fills' in node) {
    for (const fill of node.fills) {
      switch (fill.type) {
        case 'SOLID': {
          return {
            colorSpace: 'srgb',
            components: [fill.color.r, fill.color.g, fill.color.b],
            alpha: fill.color.a,
          };
        }
        case 'GRADIENT_LINEAR':
        case 'GRADIENT_RADIAL':
        case 'GRADIENT_ANGULAR':
        case 'GRADIENT_DIAMOND': {
          return fill.gradientStops.map((stop) => ({
            position: stop.position,
            color: {
              colorSpace: 'srgb',
              components: [stop.color.r, stop.color.g, stop.color.b],
              alpha: stop.color.a,
            },
          }));
        }
      }
    }
  }
}

/** Return a dimension token from grid */
export function gridStyles(
  node: Node,
): Record<string, Record<string, DimensionToken | NumberToken>> | undefined {
  if (!('layoutGrids' in node) || !node.layoutGrids?.length) {
    return;
  }
  const values: Record<string, Record<string, DimensionToken | NumberToken>> = {};
  for (const grid of node.layoutGrids!) {
    const pattern = grid.pattern.toLowerCase();
    if (values[pattern]) {
      continue;
    }
    values[pattern] = {
      sectionSize: { $type: 'dimension', $value: { value: grid.sectionSize, unit: 'px' } },
      gutterSize: { $type: 'dimension', $value: { value: grid.gutterSize, unit: 'px' } },
    };
    if (grid.count > 0) {
      values[pattern].count = { $type: 'number', $value: grid.count };
    }
  }
  return values;
}

/** Return a typography token from text */
export function textStyle(node: Node): TypographyValue | undefined {
  if (!('style' in node)) {
    return;
  }

  const { style } = node;
  if (!style.fontFamily || !Number.isFinite(style.fontWeight) || !Number.isFinite(style.fontSize)) {
    return;
  }

  const typography: TypographyValue = {
    fontFamily: style.fontFamily.split(',').map((family) => family.trim()),
    fontWeight: style.fontWeight!,
    fontStyle: normalizeFontStyle(style),
    fontSize: { value: style.fontSize!, unit: 'px' },
    letterSpacing: { value: style.letterSpacing || 0, unit: 'px' },
    lineHeight: getLineHeight(style),
  };

  if ('paragraphSpacing' in style && Number.isFinite(style.paragraphSpacing)) {
    typography.paragraphSpacing = { value: style.paragraphSpacing!, unit: 'px' };
  }
  if ('paragraphIndent' in style && Number.isFinite(style.paragraphIndent)) {
    typography.paragraphIndent = { value: style.paragraphIndent!, unit: 'px' };
  }
  if ('listSpacing' in style && Number.isFinite(style.listSpacing)) {
    typography.listSpacing = { value: style.listSpacing!, unit: 'px' };
  }
  applyTextCase(typography, style.textCase);
  applyTextDecoration(typography, 'textDecoration' in style ? style.textDecoration : undefined);

  return typography;
}

function getLineHeight(style: TypeStyle): TypographyValue['lineHeight'] {
  if (style.lineHeightUnit === 'FONT_SIZE_%' && Number.isFinite(style.lineHeightPercentFontSize)) {
    return style.lineHeightPercentFontSize! / 100;
  }
  if (Number.isFinite(style.lineHeightPx)) {
    return { value: style.lineHeightPx!, unit: 'px' };
  }
  if (Number.isFinite(style.lineHeightPercentFontSize)) {
    return style.lineHeightPercentFontSize! / 100;
  }
  return 1;
}

function normalizeFontStyle(style: TypeStyle): string | undefined {
  if (style.italic || /italic/i.test(style.fontStyle || '')) {
    return 'italic';
  }
  if (/oblique/i.test(style.fontStyle || '')) {
    return 'oblique';
  }
  return style.fontStyle ? 'normal' : undefined;
}

function applyTextCase(typography: TypographyValue, textCase: TypeStyle['textCase']): void {
  switch (textCase) {
    case 'ORIGINAL': {
      typography.textTransform = 'none';
      break;
    }
    case 'UPPER': {
      typography.textTransform = 'uppercase';
      break;
    }
    case 'LOWER': {
      typography.textTransform = 'lowercase';
      break;
    }
    case 'TITLE': {
      typography.textTransform = 'capitalize';
      break;
    }
    case 'SMALL_CAPS': {
      typography.fontVariantCaps = 'small-caps';
      break;
    }
    case 'SMALL_CAPS_FORCED': {
      typography.fontVariantCaps = 'all-small-caps';
      break;
    }
    case undefined: {
      break;
    }
    default: {
      const exhaustiveTextCase: never = textCase;
      throw new TypeError(`Unknown Figma text case: ${exhaustiveTextCase}`);
    }
  }
}

function applyTextDecoration(
  typography: TypographyValue,
  textDecoration: TypeStyle['textDecoration'],
): void {
  switch (textDecoration) {
    case 'NONE': {
      typography.textDecoration = 'none';
      break;
    }
    case 'STRIKETHROUGH': {
      typography.textDecoration = 'line-through';
      break;
    }
    case 'UNDERLINE': {
      typography.textDecoration = 'underline';
      break;
    }
    case undefined: {
      break;
    }
    default: {
      const exhaustiveTextDecoration: never = textDecoration;
      throw new TypeError(`Unknown Figma text decoration: ${exhaustiveTextDecoration}`);
    }
  }
}

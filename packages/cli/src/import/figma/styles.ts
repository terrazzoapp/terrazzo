import type {
  DropShadowEffect,
  InnerShadowEffect,
  LocalVariable,
  Node,
  PublishedStyle,
  Style,
} from '@figma/rest-api-spec';
import type {
  AliasValue,
  ColorValue,
  DimensionToken,
  DimensionValue,
  GradientValue,
  Logger,
  NumberToken,
  ShadowValue,
  TypographyValue,
} from '@terrazzo/parser';

import { formatName, getFile, getFileNodes, getFileStyles } from './lib.js';
import { canImportStyleBinding, type VariableMatchers } from './variable-bindings.js';

/** /v1/files/:file_key/styles */
export async function getStyles(
  fileKey: string,
  {
    logger,
    unpublished,
    variables,
    matchers,
  }: {
    logger: Logger;
    unpublished?: boolean;
    variables?: Record<string, LocalVariable>;
    matchers?: VariableMatchers;
  },
): Promise<{ count: number; code: any; variableIDs: Set<string> }> {
  const result: { count: number; code: any; variableIDs: Set<string> } = {
    count: 0,
    variableIDs: new Set(),
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
        const $value = effectStyle(styleNode.document, {
          variables,
          variableIDs: result.variableIDs,
          logger,
          matchers,
        });
        if (!$value) {
          logger.warn({
            group: 'import',
            message: `Skipping unsupported non-shadow effect style ${s.name}`,
          });
          break;
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
        result.count++;
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
      result.count++;
    }
  }

  return result;
}

/** Return a shadow token from an effect */
export function effectStyle(
  node: Node,
  {
    variables,
    variableIDs = new Set(),
    logger,
    matchers,
  }: {
    variables?: Record<string, LocalVariable>;
    variableIDs?: Set<string>;
    logger?: Logger;
    matchers?: VariableMatchers;
  } = {},
): ShadowValue[] | undefined {
  if ('effects' in node) {
    const shadows = node.effects.filter(
      (e) => e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW',
    ) as (DropShadowEffect | InnerShadowEffect)[];
    if (shadows.length > 0) {
      return shadows.map((s) => {
        function value(
          field: 'color' | 'offsetX' | 'offsetY' | 'radius' | 'spread',
          fallback: ColorValue | DimensionValue,
        ): ColorValue | DimensionValue | AliasValue {
          const id = s.boundVariables?.[field]?.id;
          if (!variables || !id) {
            return fallback;
          }
          const importable = canImportStyleBinding(id, field === 'color' ? 'color' : 'dimension', {
            variables,
            matchers,
          });
          if (!importable) {
            logger?.warn({
              group: 'import',
              message: `Unable to resolve shadow ${field} binding ${id}; using the raw value.`,
            });
            return fallback;
          }
          variableIDs.add(id);
          return `{${variables[id]!.name.split('/').map(formatName).join('.')}}`;
        }
        return {
          inset: s.type === 'INNER_SHADOW',
          offsetX: value('offsetX', { value: s.offset.x, unit: 'px' }) as
            | DimensionValue
            | AliasValue,
          offsetY: value('offsetY', { value: s.offset.y, unit: 'px' }) as
            | DimensionValue
            | AliasValue,
          blur: value('radius', { value: s.radius, unit: 'px' }) as DimensionValue | AliasValue,
          spread: value('spread', { value: s.spread ?? 0, unit: 'px' }) as
            | DimensionValue
            | AliasValue,
          color: value('color', {
            colorSpace: 'srgb',
            components: [s.color.r, s.color.g, s.color.b],
            alpha: s.color.a,
          }) as ColorValue | AliasValue,
        };
      });
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
      gutterSize: { $type: 'dimension', $value: { value: grid.sectionSize, unit: 'px' } },
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

  let lineHeight: string | number | DimensionValue = 1;
  if ('lineHeightPercentFontSize' in node.style) {
    lineHeight = node.style.lineHeightPercentFontSize!;
  } else if ('lineHeightPx' in node.style) {
    lineHeight = { value: node.style.lineHeightPx!, unit: 'px' };
  }

  return {
    fontFamily: [node.style.fontFamily!],
    fontWeight: node.style.fontWeight,
    fontStyle: node.style.fontStyle,
    fontSize: node.style.fontSize
      ? { value: node.style.fontSize, unit: 'px' }
      : { value: 1, unit: 'em' },
    letterSpacing: { value: node.style.letterSpacing ?? 0, unit: 'px' },
    lineHeight,
  };
}

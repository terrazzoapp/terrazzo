import type {
  DropShadowEffect,
  GetFileNodesResponse,
  InnerShadowEffect,
  Node,
  PublishedStyle,
  Style,
} from '@figma/rest-api-spec';
import type {
  ColorValue,
  DimensionToken,
  DimensionValue,
  GradientValue,
  Logger,
  NumberToken,
  ShadowValue,
  TypographyValue,
} from '@terrazzo/parser';

import { formatName, getFile, getFileNodes, getFileStyles, getStyle } from './lib.js';

type StyleMetadata = Style | PublishedStyle;
type StyleNode = NonNullable<GetFileNodesResponse['nodes'][string]>;

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

  const stylesByID = new Map<string, StyleMetadata>();

  if (unpublished) {
    const styles = await getFile(fileKey, { logger });
    for (const [id, style] of Object.entries(styles.styles)) {
      stylesByID.set(id, style);
    }
  } else {
    const styles = await getFileStyles(fileKey, { logger });
    for (const style of styles.meta.styles) {
      stylesByID.set(style.node_id, style);
    }
  }

  const styleNodesByID = await getStyleNodes(fileKey, stylesByID, { logger });

  for (const [id, s] of stylesByID) {
    const styleNode = styleNodesByID.get(id);
    if (!styleNode) {
      logger.warn({
        group: 'import',
        message: `Style ${s.name} not found in file nodes. Does it need to be published?`,
      });
      continue;
    }
    result.count++;

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
    if (tokenBase.$type !== undefined) {
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

async function getStyleNodes(
  fileKey: string,
  stylesByID: Map<string, StyleMetadata>,
  { logger }: { logger: Logger },
): Promise<Map<string, StyleNode>> {
  const localStyleNodeIDs: string[] = [];
  const remoteStyles: [styleID: string, style: Style][] = [];
  for (const [id, style] of stylesByID) {
    if ('remote' in style && style.remote) {
      remoteStyles.push([id, style]);
    } else {
      localStyleNodeIDs.push(id);
    }
  }

  const styleNodesByID = new Map<string, StyleNode>();
  if (localStyleNodeIDs.length > 0) {
    const localFileNodes = await getFileNodes(fileKey, { ids: localStyleNodeIDs, logger });
    for (const id of localStyleNodeIDs) {
      const styleNode = localFileNodes.nodes[id];
      if (styleNode) {
        styleNodesByID.set(id, styleNode);
      }
    }
  }

  const remoteStylesByFile = new Map<string, { styleID: string; sourceNodeID: string }[]>();
  const remoteStyleLocations = await Promise.all(
    remoteStyles.map(async ([styleID, style]) => {
      const { meta } = await getStyle(style.key, { logger });
      return { styleID, sourceFileKey: meta.file_key, sourceNodeID: meta.node_id };
    }),
  );
  for (const { styleID, sourceFileKey, sourceNodeID } of remoteStyleLocations) {
    const styles = remoteStylesByFile.get(sourceFileKey) ?? [];
    styles.push({ styleID, sourceNodeID });
    remoteStylesByFile.set(sourceFileKey, styles);
  }

  await Promise.all(
    [...remoteStylesByFile].map(async ([sourceFileKey, styles]) => {
      const sourceNodeIDs = styles.map(({ sourceNodeID }) => sourceNodeID);
      const sourceFileNodes = await getFileNodes(sourceFileKey, {
        ids: sourceNodeIDs,
        logger,
      });
      for (const { styleID, sourceNodeID } of styles) {
        const styleNode = sourceFileNodes.nodes[sourceNodeID];
        if (styleNode) {
          styleNodesByID.set(styleID, styleNode);
        }
      }
    }),
  );

  return styleNodesByID;
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

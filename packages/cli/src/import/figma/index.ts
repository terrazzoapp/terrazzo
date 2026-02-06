import type {
  GetFileNodesResponse,
  GetFileStylesResponse,
  GetLocalVariablesResponse,
  GetPublishedVariablesResponse,
  LocalVariable,
  LocalVariableCollection,
  PublishedVariable,
  PublishedVariableCollection,
  RGBA,
} from '@figma/rest-api-spec';
import type { Logger } from '@terrazzo/parser';
import { merge } from 'merge-anything';
import { effectStyle } from './effect-style.js';
import { fillStyle } from './fill-style.js';
import { textStyle } from './text-style.js';

export interface importFromFigmaOptions {
  url: string;
  logger: Logger;
  /** Grab unpublished Styles/Variables @default false */
  unpublished?: boolean;
  skipStyles?: boolean;
  skipVariables?: boolean;
}

export interface FigmaOutput {
  variableCount: number;
  styleCount: number;
  /** The Resolver JSON, in object format (could be any shape) */
  code: Record<string, any>;
}

const KEY = ':key';
const FILE_KEY = ':file_key';
const API = {
  fileNodes: `https://api.figma.com/v1/files/${FILE_KEY}/nodes`,
  fileStyles: `https://api.figma.com/v1/files/${FILE_KEY}/styles`,
  localVariables: `https://api.figma.com/v1/files/${FILE_KEY}/variables/local`,
  publishedVariables: `https://api.figma.com/v1/files/${FILE_KEY}/variables/published`,
  styles: `https://api.figma.com/v1/styles/${KEY}`,
};

export async function importFromFigma({
  url,
  logger,
  unpublished,
  skipStyles,
  skipVariables,
}: importFromFigmaOptions): Promise<FigmaOutput> {
  const fileKey = getFileID(url);
  if (!fileKey) {
    logger.error({ group: 'import', message: `Invalid Figma URL: ${url}` });
  }

  const result: FigmaOutput = {
    variableCount: 0,
    styleCount: 0,
    code: {
      $schema: 'https://www.designtokens.org/schemas/2025.10/resolver.json',
      version: '2025.10',
      resolutionOrder: [],
      sets: {},
      modifiers: {},
    },
  };

  try {
    const [styles, vars] = await Promise.all([
      ...(!skipStyles ? [getStyles(fileKey!, { logger })] : []),
      ...(!skipVariables ? [getVariables(fileKey!, { logger, unpublished })] : []),
    ]);
    if (styles) {
      result.styleCount += styles.count;
      result.code = merge(result.code, styles.code);
    }
    if (vars) {
      result.variableCount += vars.count;
      result.code = merge(result.code, vars.code);
    }
  } catch (err) {
    logger.error({ group: 'import', message: (err as Error).message });
  }

  return result;
}

/** Is this a valid URL, and one belonging to a Figma file? */
export function isFigmaPath(url: string) {
  try {
    new URL(url);
    return /^https:\/\/(www\.)?figma\.com\/design\/[A-Za-z0-9]+/.test(url);
  } catch {
    return false;
  }
}

/** Get File ID from design URL */
export function getFileID(url: string) {
  return url.match(/^https:\/\/(www\.)?figma\.com\/design\/([^/]+)/)?.[2];
}

/** /v1/files/:file_key/nodes */
export async function getFileNodes(fileKey: string, { ids, logger }: { logger: Logger; ids?: string[] }) {
  let url = API.fileNodes.replace(FILE_KEY, fileKey);
  if (ids?.length) {
    url += `?ids=${ids.join(',')}`;
  }
  const fileRes = await fetch(url, {
    method: 'GET',
    headers: { 'X-Figma-Token': process.env.FIGMA_ACCESS_TOKEN! },
  });
  if (!fileRes.ok) {
    logger.error({ group: 'import', message: `${fileRes.status} ${await fileRes.text()}` });
  }
  return (await fileRes.json()) as GetFileNodesResponse;
}

const STYLE_TYPE_MAP = {
  FILL: 'color',
  TEXT: 'typography',
  EFFECT: 'shadow',
  GRID: 'string',
};

export interface TokenExport {
  count: number;
  code: Record<string, any>;
}

/** /v1/files/:file_key/styles */
export async function getStyles(
  fileKey: string,
  { logger }: Pick<importFromFigmaOptions, 'logger'>,
): Promise<TokenExport> {
  const result: TokenExport = {
    count: 0,
    code: {
      sets: {
        styles: {
          sources: [{}],
        },
      },
    },
  };

  const stylesRes = await fetch(API.fileStyles.replace(FILE_KEY, fileKey), {
    method: 'GET',
    headers: { 'X-Figma-Token': process.env.FIGMA_ACCESS_TOKEN! },
  });
  if (!stylesRes.ok) {
    logger.error({ group: 'import', message: `${stylesRes.status} ${await stylesRes.text()}` });
  }
  const styles = (await stylesRes.json()) as GetFileStylesResponse;

  const fileNodes = await getFileNodes(fileKey, { ids: styles.meta.styles.map((s) => s.node_id), logger });

  result.count += styles.meta.styles.length;
  for (const s of styles.meta.styles) {
    let node = result.code.sets.styles.sources[0];
    const path = s.name.split('/');
    const name = path.pop()!;
    for (const key of path) {
      if (!(key in node)) {
        node[key] = {};
      }
      node = node[key];
    }

    node[name] = {
      $type: STYLE_TYPE_MAP[s.style_type],
      $description: s.description || undefined,
      $value: undefined,
      $extensions: {
        'figma.com': {
          name: s.name,
          node_id: s.node_id,
          created_at: s.created_at,
          updated_at: s.updated_at,
        },
      },
    };

    switch (s.style_type) {
      case 'FILL': {
        const $value = fillStyle(fileNodes.nodes[s.node_id]!.document);
        if (!$value) {
          logger.error({ group: 'import', message: `Could not parse fill for ${s.name}`, continueOnError: true });
        }
        if (Array.isArray($value)) {
          node[name].$type = 'gradient'; // Override color if gradient fill
        }
        node[name].$value = $value;
        break;
      }
      case 'TEXT': {
        const $value = textStyle(fileNodes.nodes[s.node_id]!.document);
        if (!$value) {
          logger.error({ group: 'import', message: `Could not parse text for ${s.name}`, continueOnError: true });
        }
        node[name].$value = $value;
        break;
      }
      case 'EFFECT': {
        const $value = effectStyle(fileNodes.nodes[s.node_id]!.document);
        if (!$value) {
          logger.error({ group: 'import', message: `Could not parse effect for ${s.name}`, continueOnError: true });
        }
        node[name].$value = $value;
        break;
      }
      case 'GRID': {
        logger.error({ group: 'import', message: `Could not parse grid for ${s.name}`, continueOnError: true });
        delete node[name];
        break;
      }
    }
  }

  return result;
}

const VARIABLE_TYPE_MAP = {
  BOOLEAN: 'boolean',
  COLOR: 'color',
  FLOAT: 'number',
  STRING: 'string',
};

/** /v1/files/:file_key/variables/published | /v1/files/:file_key/variables/local */
export async function getVariables(
  fileKey: string,
  { logger, unpublished }: Pick<importFromFigmaOptions, 'logger' | 'unpublished'>,
): Promise<TokenExport> {
  const result: TokenExport = {
    count: 0,
    code: {
      sets: {},
      modifiers: {},
    },
  };

  const allVariables: Record<string, LocalVariable> = {};
  const variableCollections: Record<string, LocalVariableCollection> = {};
  let finalVariables: Record<string, LocalVariable> = {};
  const modeIDToName: Record<string, string> = {}; // Note: this can have duplicate values; they’ll be scoped in separate modifier contexts

  // We must always fetch local variables, no matter what, to get the data we need
  const localRes = await fetch(API.localVariables.replace(FILE_KEY, fileKey), {
    method: 'GET',
    headers: { 'X-Figma-Token': process.env.FIGMA_ACCESS_TOKEN! },
  });
  if (!localRes.ok) {
    logger.error({ group: 'import', message: `${localRes.status} ${await localRes.text}` });
  }
  const local = (await localRes.json()) as GetLocalVariablesResponse;
  for (const id of Object.keys(local.meta.variables)) {
    if (local.meta.variables[id]!.hiddenFromPublishing) {
      continue;
    }
    allVariables[id] = local.meta.variables[id]!;
  }
  for (const id of Object.keys(local.meta.variableCollections)) {
    variableCollections[id] = local.meta.variableCollections[id]!;
    for (const mode of local.meta.variableCollections[id]!.modes) {
      modeIDToName[mode.modeId] = mode.name;
    }
  }

  // If --unpublished is set, we’re ready to transform; otherwise, filter set from latest publish
  if (unpublished) {
    finalVariables = allVariables;
  } else {
    const publishedRes = await fetch(API.publishedVariables.replace(FILE_KEY, fileKey), {
      method: 'GET',
      headers: { 'X-Figma-Token': process.env.FIGMA_ACCESS_TOKEN! },
    });
    if (!publishedRes.ok) {
      logger.error({ group: 'import', message: `${publishedRes.status} ${await publishedRes.text()}` });
    }
    const published = (await publishedRes.json()) as GetPublishedVariablesResponse;
    for (const id of Object.keys(published.meta.variables)) {
      finalVariables[id] = allVariables[id]!;
    }
  }

  for (const id of Object.keys(finalVariables)) {
    const variable = finalVariables[id]!;
    const collection = variableCollections[variable.variableCollectionId]!;
    const hasMultipleModes = collection.modes.length > 1;
    if (hasMultipleModes) {
      if (!(collection.name in result.code.modifiers)) {
        result.code.modifiers[collection.name] = {
          contexts: Object.fromEntries(collection.modes.map((m) => [m.name, [{}]])),
          default: modeIDToName[collection.defaultModeId],
        };
      }
    } else {
      if (!(collection.name in result.code.sets)) {
        result.code.sets[collection.name] = { sources: [{}] };
      }
    }

    for (const [modeID, value] of Object.entries(variable.valuesByMode)) {
      let node = result.code;
      if (hasMultipleModes) {
        node = result.code.modifiers[collection.name].contexts[modeIDToName[modeID]!][0]!;
      } else {
        node = result.code.sets[collection.name].sources[0];
      }
      const path = variable.name.split('/');
      const name = path.pop()!;
      for (const p of path) {
        if (!(p in node)) {
          node[p] = {};
        }
        node = node[p];
      }

      node[name] = {
        $type: VARIABLE_TYPE_MAP[variable.resolvedType],
        $description: (variable as LocalVariable).description || undefined,
        $value: undefined,
        $extensions: {
          'figma.com': {
            name: variable.name,
            id: variable.id,
            key: variable.key,
            variableCollectionId: variable.variableCollectionId,
          },
        },
      };
      if (typeof value === 'object' && 'type' in value && value.type === 'VARIABLE_ALIAS') {
        node[name].$value = `{${finalVariables[value.id]!.name.split('/').join('.')}}`;
      } else {
        switch (variable.resolvedType) {
          case 'BOOLEAN':
          case 'FLOAT':
          case 'STRING': {
            node[name].$value = value;
            break;
          }
          case 'COLOR': {
            const { r, g, b, a } = value as RGBA;
            node[name].$value = { colorSpace: 'srgb', components: [r, g, b], alpha: a };
            break;
          }
        }
      }
    }
  }

  // Finally, update count with final Object count after filtering
  result.count = Object.keys(finalVariables).length;

  return result;
}

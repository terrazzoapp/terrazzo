import type {
  GetFileNodesResponse,
  GetFileStylesResponse,
  GetLocalVariablesResponse,
  GetPublishedVariablesResponse,
  LocalVariable,
  LocalVariableCollection,
  PublishedVariable,
  PublishedVariableCollection,
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
      $description: s.description || undefined,
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
        node[name].$type = 'color';
        const $value = fillStyle(fileNodes.nodes[s.node_id]!.document);
        if (!$value) {
          logger.error({ group: 'import', message: `Could not parse fill for ${s.name}`, continueOnError: true });
        }
        node[name].$value = $value;
        break;
      }
      case 'TEXT': {
        node[name].$type = 'typography';
        const $value = textStyle(fileNodes.nodes[s.node_id]!.document);
        if (!$value) {
          logger.error({ group: 'import', message: `Could not parse text for ${s.name}`, continueOnError: true });
        }
        node[name].$value = $value;
        break;
      }
      case 'EFFECT': {
        node[name].$type = 'shadow';
        const $value = effectStyle(fileNodes.nodes[s.node_id]!.document);
        if (!$value) {
          logger.error({ group: 'import', message: `Could not parse effect for ${s.name}`, continueOnError: true });
        }
        node[name].$value = $value;
        break;
      }
      case 'GRID': {
        logger.error({ group: 'import', message: `Could not parse grid for ${s.name}`, continueOnError: true });
        break;
      }
    }
  }

  return result;
}

/** /v1/files/:file_key/variables/published | /v1/files/:file_key/variables/local */
export async function getVariables(
  fileKey: string,
  { logger, unpublished }: Pick<importFromFigmaOptions, 'logger' | 'unpublished'>,
): Promise<TokenExport> {
  const result: TokenExport = {
    count: 0,
    code: { sets: {} },
  };

  const variables: Record<string, LocalVariable | PublishedVariable> = {};
  const variableCollections: Record<string, LocalVariableCollection | PublishedVariableCollection> = {};

  if (unpublished !== true) {
    const publishedRes = await fetch(API.publishedVariables.replace(FILE_KEY, fileKey), {
      method: 'GET',
      headers: { 'X-Figma-Token': process.env.FIGMA_ACCESS_TOKEN! },
    });
    if (!publishedRes.ok) {
      logger.error({ group: 'import', message: `${publishedRes.status} ${await publishedRes.text()}` });
    }
    const published = (await publishedRes.json()) as GetPublishedVariablesResponse;
    for (const id of Object.keys(published.meta.variables)) {
      result.count++;
      variables[id] = published.meta.variables[id]!;
    }
    for (const id of Object.keys(published.meta.variableCollections)) {
      variableCollections[id] = published.meta.variableCollections[id]!;
    }
  }
  if (unpublished || !result.count) {
    const localRes = await fetch(API.localVariables.replace(FILE_KEY, fileKey), {
      method: 'GET',
      headers: { 'X-Figma-Token': process.env.FIGMA_ACCESS_TOKEN! },
    });
    if (!localRes.ok) {
      logger.error({ group: 'import', message: `${localRes.status} ${await localRes.text}` });
    }
    const local = (await localRes.json()) as GetLocalVariablesResponse;
    for (const id of Object.keys(local.meta.variables)) {
      result.count++;
      variables[id] = local.meta.variables[id]!;
    }
    for (const id of Object.keys(local.meta.variableCollections)) {
      variableCollections[id] = local.meta.variableCollections[id]!;
    }
  }

  for (const id of Object.keys(variables)) {
    const variable = variables[id]!;

    if (
      ('remote' in variable && variable.remote) ||
      ('hiddenFromPublishing' in variable && variable.hiddenFromPublishing)
    ) {
      continue;
    }

    const collection = variableCollections[variable.variableCollectionId]!;
    if (!(collection.name in result.code.sets)) {
      result.code.sets[collection.name] = { sources: [] };
    }
    let node = result.code.sets[collection.name].sources[0];
    const path = variable.name.split('/');
    const name = path.pop()!;
    for (const key of path) {
      if (!(key in node)) {
        node[key] = {};
      }
      node = node[key];
    }

    node[name] = {
      $description: (variable as LocalVariable).description || undefined,
      $extensions: {
        'figma.com': {
          name: variable.name,
          id: variable.id,
          key: variable.key,
          subscribed_id: (variable as PublishedVariable).subscribed_id,
          updated_at: (variable as PublishedVariable).updatedAt,
        },
      },
    };
    const variableType = 'resolvedDataType' in variable ? variable.resolvedDataType : variable.resolvedType;
    switch (variableType) {
      case 'BOOLEAN': {
        node[name].$type = 'boolean';
        node[name].$value = false;
        break;
      }
      case 'FLOAT': {
        node[name].$type = 'number';
        node[name].$value = 0.123;
        break;
      }
      case 'STRING': {
        node[name].$type = 'string';
        node[name].$value = 'foo';
        break;
      }
      case 'COLOR': {
        node[name].$type = 'color';
        node[name].$value = { colorSpace: 'srgb', components: [], alpha: 1 };
        break;
      }
    }
  }

  return result;
}

import type { Logger } from '@terrazzo/parser';
import { pluralize } from '@terrazzo/token-tools';
import { merge } from 'merge-anything';
import { formatNumber, getFileID } from './lib.js';
import { getStyles } from './styles.js';
import { getVariables } from './variables.js';

export interface importFromFigmaOptions {
  url: string;
  logger: Logger;
  /** Grab unpublished Styles/Variables @default false */
  unpublished?: boolean;
  skipStyles?: boolean;
  skipVariables?: boolean;
  /** RegEx for overriding Variable types with fontFamily tokens */
  fontFamilyNames?: string;
  /** RegEx for overriding Variable types with fontWeight tokens */
  fontWeightNames?: string;
  /** RegEx for overriding Variable types with number tokens */
  numberNames?: string;
}

export interface FigmaOutput {
  variableCount: number;
  styleCount: number;
  /** The Resolver JSON, in object format (could be any shape) */
  code: Record<string, any>;
}

export async function importFromFigma({
  url,
  logger,
  unpublished,
  skipStyles,
  skipVariables,
  fontFamilyNames = '/fontFamily$',
  fontWeightNames = '/fontWeight$',
  numberNames,
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
      !skipStyles ? getStyles(fileKey!, { logger }) : null,
      !skipVariables
        ? getVariables(fileKey!, {
            logger,
            unpublished,
            matchers: {
              fontFamily: fontFamilyNames ? new RegExp(fontFamilyNames) : undefined,
              fontWeight: fontWeightNames ? new RegExp(fontWeightNames) : undefined,
              number: numberNames ? new RegExp(numberNames) : undefined,
            },
          })
        : null,
    ]);
    if (styles) {
      result.styleCount += styles.count;
      result.code = merge(result.code, styles.code);
    }
    if (vars) {
      result.variableCount += vars.count;
      result.code = merge(result.code, vars.code);
      if (vars.remoteCount) {
        logger.warn({
          group: 'import',
          message: `${formatNumber(vars.remoteCount)} ${pluralize(vars.remoteCount, 'Variable', 'Variables')} were remote and could not be accessed. Try importing from other files to grab them.`,
        });
      }
    }
  } catch (err) {
    logger.error({ group: 'import', message: (err as Error).message });
  }

  // Arbitrarily guess on resolutionOrder
  for (const group of ['sets', 'modifiers'] as const) {
    for (const name of Object.keys(result.code[group])) {
      result.code.resolutionOrder.push({ $ref: `#/${group}/${name}` });
    }
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

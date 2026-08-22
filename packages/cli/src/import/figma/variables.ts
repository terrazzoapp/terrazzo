import type {
  LocalVariable,
  LocalVariableCollection,
  RGBA,
  VariableResolvedDataType,
} from '@figma/rest-api-spec';
import type { CubicBezierValue, DurationValue, Logger } from '@terrazzo/parser';

import { formatName, getFileLocalVariables, getFilePublishedVariables } from './lib.js';

export type FigmaVariableTokenType =
  | 'cubicBezier'
  | 'duration'
  | 'fontFamily'
  | 'fontWeight'
  | 'number';

export type FigmaVariableMatchers = Partial<Record<FigmaVariableTokenType, RegExp>>;

const FIGMA_TYPE_MAP: Record<VariableResolvedDataType, string> = {
  BOOLEAN: 'boolean',
  COLOR: 'color',
  FLOAT: 'dimension',
  STRING: 'string',
};

function getAliasID(value: unknown): string | undefined {
  if (
    typeof value === 'object' &&
    value &&
    'type' in value &&
    value.type === 'VARIABLE_ALIAS' &&
    'id' in value &&
    typeof value.id === 'string'
  ) {
    return value.id;
  }
  return undefined;
}

function getTypeOverride(
  variable: LocalVariable,
  matchers: FigmaVariableMatchers,
): FigmaVariableTokenType | undefined {
  if (variable.resolvedType === 'STRING' && matchers.fontFamily?.test(variable.name)) {
    return 'fontFamily';
  }
  if (
    (variable.resolvedType === 'FLOAT' || variable.resolvedType === 'STRING') &&
    matchers.fontWeight?.test(variable.name)
  ) {
    return 'fontWeight';
  }
  if (variable.resolvedType === 'FLOAT' && matchers.number?.test(variable.name)) {
    return 'number';
  }
  if (variable.resolvedType === 'STRING' && matchers.duration?.test(variable.name)) {
    return 'duration';
  }
  if (variable.resolvedType === 'STRING' && matchers.cubicBezier?.test(variable.name)) {
    return 'cubicBezier';
  }
}

function parseDuration(value: unknown): DurationValue | undefined {
  if (typeof value !== 'string') {
    return;
  }
  const match = value.match(/^\s*(\d+(?:\.\d+)?|\.\d+)\s*(ms|s)\s*$/i);
  if (!match) {
    return;
  }
  const number = Number(match[1]);
  if (!Number.isFinite(number)) {
    return;
  }
  return { value: number, unit: match[2]!.toLowerCase() === 's' ? 's' : 'ms' };
}

function parseCubicBezier(value: unknown): CubicBezierValue | undefined {
  if (typeof value !== 'string') {
    return;
  }
  const numberPattern = String.raw`[+-]?(?:\d+(?:\.\d+)?|\.\d+)`;
  const match = value.match(
    new RegExp(
      `^\\s*cubic-bezier\\(\\s*(${numberPattern})\\s*,\\s*(${numberPattern})\\s*,\\s*(${numberPattern})\\s*,\\s*(${numberPattern})\\s*\\)\\s*$`,
      'i',
    ),
  );
  if (!match) {
    return;
  }
  const points: [number, number, number, number] = [
    Number(match[1]),
    Number(match[2]),
    Number(match[3]),
    Number(match[4]),
  ];
  if (
    points.some((point) => typeof point !== 'number' || !Number.isFinite(point)) ||
    points[0] < 0 ||
    points[0] > 1 ||
    points[2] < 0 ||
    points[2] > 1
  ) {
    return;
  }
  return points;
}

function applyTypeOverride(
  type: FigmaVariableTokenType,
  value: unknown,
): { $type: FigmaVariableTokenType; $value: unknown } | undefined {
  switch (type) {
    case 'cubicBezier': {
      const parsed = parseCubicBezier(value);
      return parsed ? { $type: type, $value: parsed } : undefined;
    }
    case 'duration': {
      const parsed = parseDuration(value);
      return parsed ? { $type: type, $value: parsed } : undefined;
    }
    case 'fontFamily': {
      return { $type: type, $value: String(value).split(',') };
    }
    case 'fontWeight': {
      return { $type: type, $value: value };
    }
    case 'number': {
      return typeof value === 'number' ? { $type: type, $value: value } : undefined;
    }
    default: {
      const exhaustiveType: never = type;
      throw new TypeError(`Unknown Figma Variable type override: ${exhaustiveType}`);
    }
  }
}

/** /v1/files/:file_key/variables/published | /v1/files/:file_key/variables/local */
export async function getVariables(
  fileKey: string,
  {
    logger,
    unpublished,
    matchers,
  }: {
    logger: Logger;
    unpublished?: boolean;
    matchers: FigmaVariableMatchers;
  },
): Promise<{ count: number; remoteCount: number; code: any }> {
  const result: { count: number; remoteCount: number; code: any } = {
    count: 0,
    remoteCount: 0,
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
  const local = await getFileLocalVariables(fileKey, { logger });
  for (const id of Object.keys(local.meta.variables)) {
    allVariables[id] = local.meta.variables[id]!;
  }
  for (const id of Object.keys(local.meta.variableCollections)) {
    variableCollections[id] = local.meta.variableCollections[id]!;
    for (const mode of local.meta.variableCollections[id]!.modes) {
      modeIDToName[mode.modeId] = formatName(mode.name);
    }
  }

  // If --unpublished is set, we’re ready to transform; otherwise, filter set from latest publish
  if (unpublished) {
    finalVariables = Object.fromEntries(
      Object.entries(allVariables).filter(([, variable]) => !variable.hiddenFromPublishing),
    );
  } else {
    const published = await getFilePublishedVariables(fileKey, { logger });
    for (const id of Object.keys(published.meta.variables)) {
      finalVariables[id] = allVariables[id]!;
    }
  }

  const pendingIDs = Object.keys(finalVariables);
  for (let i = 0; i < pendingIDs.length; i++) {
    const variable = finalVariables[pendingIDs[i]!];
    if (!variable) {
      continue;
    }
    for (const value of Object.values(variable.valuesByMode)) {
      const aliasID = getAliasID(value);
      if (!aliasID || !allVariables[aliasID] || aliasID in finalVariables) {
        continue;
      }
      finalVariables[aliasID] = allVariables[aliasID]!;
      pendingIDs.push(aliasID);
    }
  }

  const remoteIDs = new Set<string>();

  for (const id of Object.keys(finalVariables)) {
    const variable = finalVariables[id]!;
    const collection = variableCollections[variable.variableCollectionId]!;
    const collectionName = formatName(collection.name);
    const hasMultipleModes = collection.modes.length > 1;
    if (hasMultipleModes) {
      if (!(collectionName in result.code.modifiers)) {
        result.code.modifiers[collectionName] = {
          contexts: Object.fromEntries(collection.modes.map((m) => [formatName(m.name), [{}]])),
          default: modeIDToName[collection.defaultModeId],
        };
      }
    } else if (!(collectionName in result.code.sets)) {
      result.code.sets[collectionName] = { sources: [{}] };
    }

    const typeOverride = getTypeOverride(variable, matchers);

    for (const [modeID, value] of Object.entries(variable.valuesByMode)) {
      const modeName = modeIDToName[modeID]!;
      let node = result.code;
      if (hasMultipleModes) {
        if (!(modeName in result.code.modifiers[collectionName].contexts)) {
          // TODO: why did this happen? Why did we miss this? Is this a hidden conflict?
          result.code.modifiers[collectionName].contexts[modeName] = [{}];
        }
        node = result.code.modifiers[collectionName].contexts[modeName][0]!;
      } else {
        node = result.code.sets[collectionName].sources[0];
      }

      const tokenBase = {
        $type: undefined as any,
        $description: (variable as LocalVariable).description || undefined,
        $value: undefined as any,
        $extensions: {
          'figma.com': {
            name: variable.name,
            id: variable.id,
            variableCollectionId: variable.variableCollectionId,
            codeSyntax:
              Object.keys(variable.codeSyntax).length > 0 ? variable.codeSyntax : undefined,
          },
        },
      };

      // If this token is an alias of another, keep this as a value override
      const isAliasOfID = getAliasID(value);
      if (isAliasOfID) {
        if (allVariables[isAliasOfID]) {
          tokenBase.$type = typeOverride || FIGMA_TYPE_MAP[variable.resolvedType];
          tokenBase.$value = `{${allVariables[isAliasOfID].name.split('/').map(formatName).join('.')}}`;
        } else {
          remoteIDs.add(isAliasOfID);
          continue;
        }
      } else if (typeOverride) {
        const overriddenToken = applyTypeOverride(typeOverride, value);
        if (overriddenToken) {
          tokenBase.$type = overriddenToken.$type;
          tokenBase.$value = overriddenToken.$value;
        } else {
          logger.warn({
            group: 'import',
            message: `Could not convert ${variable.name} to ${typeOverride}; preserving its Figma ${variable.resolvedType} type.`,
          });
        }
      }
      if (tokenBase.$value === undefined) {
        switch (variable.resolvedType) {
          case 'BOOLEAN':
          case 'STRING': {
            tokenBase.$type = variable.resolvedType.toLowerCase();
            tokenBase.$value = value;
            break;
          }
          case 'FLOAT': {
            tokenBase.$type = 'dimension';
            tokenBase.$value = { value, unit: 'px' };
            break;
          }
          case 'COLOR': {
            const { r, g, b, a } = value as RGBA;
            tokenBase.$type = 'color';
            tokenBase.$value = { colorSpace: 'srgb', components: [r, g, b], alpha: a };
            break;
          }
          default: {
            const exhaustiveType: never = variable.resolvedType;
            throw new TypeError(`Unknown Figma Variable resolved type: ${exhaustiveType}`);
          }
        }
      }

      // Only place in tree if we got a value for it
      if (tokenBase.$value !== undefined) {
        const path = variable.name.split('/').map(formatName);
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
  }

  // Update counts
  result.count = Object.keys(finalVariables).length;
  result.remoteCount = remoteIDs.size;

  return result;
}

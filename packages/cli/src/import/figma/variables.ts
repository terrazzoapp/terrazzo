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

export interface FigmaVariableMatchers {
  cubicBezier?: RegExp;
  duration?: RegExp;
  fontFamily?: RegExp;
  fontWeight?: RegExp;
  /** @deprecated Coerces any matching primitive value with Number(). */
  number?: RegExp;
  /** Overrides only matching FLOAT Variables as number tokens. */
  numberFloat?: RegExp;
}

type FigmaVariableTypeOverride = FigmaVariableTokenType | 'legacyNumber';

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

const FONT_WEIGHT_VALUES = new Set([
  'thin',
  'hairline',
  'extra-light',
  'ultra-light',
  'light',
  'normal',
  'regular',
  'book',
  'medium',
  'semi-bold',
  'demi-bold',
  'bold',
  'extra-bold',
  'ultra-bold',
  'black',
  'heavy',
  'extra-black',
  'ultra-black',
]);

function matches(matcher: RegExp | undefined, value: string): boolean {
  if (!matcher) {
    return false;
  }
  matcher.lastIndex = 0;
  return matcher.test(value);
}

function getDirectTypeOverrides(
  variable: LocalVariable,
  matchers: FigmaVariableMatchers,
): Set<FigmaVariableTypeOverride> {
  const overrides = new Set<FigmaVariableTypeOverride>();
  if (variable.resolvedType === 'STRING' && matches(matchers.fontFamily, variable.name)) {
    overrides.add('fontFamily');
  }
  if (
    (variable.resolvedType === 'FLOAT' || variable.resolvedType === 'STRING') &&
    matches(matchers.fontWeight, variable.name)
  ) {
    overrides.add('fontWeight');
  }
  if (matches(matchers.number, variable.name)) {
    overrides.add('legacyNumber');
  }
  if (variable.resolvedType === 'FLOAT' && matches(matchers.numberFloat, variable.name)) {
    overrides.add('number');
  }
  if (variable.resolvedType === 'STRING' && matches(matchers.duration, variable.name)) {
    overrides.add('duration');
  }
  if (variable.resolvedType === 'STRING' && matches(matchers.cubicBezier, variable.name)) {
    overrides.add('cubicBezier');
  }
  return overrides;
}

function parseDuration(value: unknown): DurationValue | undefined {
  if (typeof value !== 'string') {
    return;
  }
  const match = value.match(/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*(ms|s)\s*$/i);
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
  type: FigmaVariableTypeOverride,
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
      if (
        (typeof value === 'number' && Number.isFinite(value) && value >= 1 && value <= 1000) ||
        (typeof value === 'string' && FONT_WEIGHT_VALUES.has(value))
      ) {
        return { $type: type, $value: value };
      }
      return;
    }
    case 'legacyNumber': {
      if (typeof value === 'object') {
        return;
      }
      const number = Number(value);
      return Number.isFinite(number) ? { $type: 'number', $value: number } : undefined;
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

function getTokenType(type: FigmaVariableTypeOverride): FigmaVariableTokenType {
  return type === 'legacyNumber' ? 'number' : type;
}

function getTypeOverrides(
  variables: Record<string, LocalVariable>,
  matchers: FigmaVariableMatchers,
  logger: Logger,
): Map<string, FigmaVariableTypeOverride> {
  const neighbors = new Map<string, Set<string>>();
  for (const [id, variable] of Object.entries(variables)) {
    if (!neighbors.has(id)) {
      neighbors.set(id, new Set());
    }
    for (const value of Object.values(variable.valuesByMode)) {
      const aliasID = getAliasID(value);
      if (!aliasID || !variables[aliasID]) {
        continue;
      }
      neighbors.get(id)!.add(aliasID);
      if (!neighbors.has(aliasID)) {
        neighbors.set(aliasID, new Set());
      }
      neighbors.get(aliasID)!.add(id);
    }
  }

  const resolvedOverrides = new Map<string, FigmaVariableTypeOverride>();
  const visited = new Set<string>();
  for (const id of Object.keys(variables)) {
    if (visited.has(id)) {
      continue;
    }
    const component: string[] = [];
    const pending = [id];
    while (pending.length > 0) {
      const nextID = pending.pop()!;
      if (visited.has(nextID)) {
        continue;
      }
      visited.add(nextID);
      component.push(nextID);
      for (const neighbor of neighbors.get(nextID) || []) {
        if (!visited.has(neighbor)) {
          pending.push(neighbor);
        }
      }
    }

    const directOverrides = new Set<FigmaVariableTypeOverride>();
    for (const componentID of component) {
      for (const override of getDirectTypeOverrides(variables[componentID]!, matchers)) {
        directOverrides.add(override);
      }
    }
    if (directOverrides.has('legacyNumber') && directOverrides.has('number')) {
      directOverrides.delete('number');
    }
    if (directOverrides.size === 0) {
      continue;
    }
    if (directOverrides.size > 1) {
      logger.warn({
        group: 'import',
        message: `Conflicting type overrides in Figma Variable alias chain: ${component.map((componentID) => variables[componentID]!.name).join(', ')}. Preserving Figma types.`,
      });
      continue;
    }

    const [typeOverride] = directOverrides;
    let canApplyToComponent = true;
    for (const componentID of component) {
      const variable = variables[componentID]!;
      for (const value of Object.values(variable.valuesByMode)) {
        if (getAliasID(value) || applyTypeOverride(typeOverride!, value)) {
          continue;
        }
        logger.warn({
          group: 'import',
          message: `Could not convert ${variable.name} to ${getTokenType(typeOverride!)}; preserving its Figma ${variable.resolvedType} type.`,
        });
        canApplyToComponent = false;
      }
    }
    if (canApplyToComponent) {
      for (const componentID of component) {
        resolvedOverrides.set(componentID, typeOverride!);
      }
    }
  }
  return resolvedOverrides;
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
  const typeOverrides = getTypeOverrides(finalVariables, matchers, logger);

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

    const typeOverride = typeOverrides.get(id);

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
          tokenBase.$type = typeOverride
            ? getTokenType(typeOverride)
            : FIGMA_TYPE_MAP[variable.resolvedType];
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
            message: `Could not convert ${variable.name} to ${getTokenType(typeOverride)}; preserving its Figma ${variable.resolvedType} type.`,
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

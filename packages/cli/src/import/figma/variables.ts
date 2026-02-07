import type { LocalVariable, LocalVariableCollection, RGBA } from '@figma/rest-api-spec';
import type { Logger } from '@terrazzo/parser';
import { formatName, getFileLocalVariables, getFilePublishedVariables } from './lib.js';

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
    matchers: Record<'fontFamily' | 'fontWeight' | 'number', RegExp | undefined>;
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
    if (local.meta.variables[id]!.hiddenFromPublishing) {
      continue;
    }
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
    finalVariables = allVariables;
  } else {
    const published = await getFilePublishedVariables(fileKey, { logger });
    for (const id of Object.keys(published.meta.variables)) {
      finalVariables[id] = allVariables[id]!;
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
    } else {
      if (!(collectionName in result.code.sets)) {
        result.code.sets[collectionName] = { sources: [{}] };
      }
    }

    const matches =
      (matchers.fontFamily?.test(variable.name) && 'fontFamily') ||
      (matchers.fontWeight?.test(variable.name) && 'fontWeight') ||
      (matchers.number?.test(variable.name) && 'number') ||
      undefined;

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
            codeSyntax: Object.keys(variable.codeSyntax).length ? variable.codeSyntax : undefined,
          },
        },
      };

      // If this token is an alias of another, keep this as a value override
      const isAliasOfID =
        (typeof value === 'object' && 'type' in value && value.type === 'VARIABLE_ALIAS' && value.id) || undefined;
      if (isAliasOfID) {
        if (allVariables[isAliasOfID]) {
          tokenBase.$type =
            matches ||
            { COLOR: 'color', BOOLEAN: 'boolean', STRING: 'string', FLOAT: 'dimension' }[variable.resolvedType];
          tokenBase.$value = `{${allVariables[isAliasOfID].name.split('/').map(formatName).join('.')}}`;
        } else {
          remoteIDs.add(isAliasOfID);
          continue;
        }
      } else if (matches === 'fontFamily') {
        tokenBase.$type = 'fontFamily';
        tokenBase.$value = String(value).split(',');
      } else if (matches === 'fontWeight') {
        tokenBase.$type = 'fontWeight';
        tokenBase.$value = value;
      } else if (matches === 'number') {
        if (typeof value === 'object') {
          throw new Error(`Can’t coerce ${variable.name} into number type.`);
        }
        tokenBase.$type = 'number';
        tokenBase.$value = Number(value); // fun fact: this coerces booleans correctly
      } else {
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

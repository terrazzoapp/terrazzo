import type { LocalVariable, LocalVariableCollection, RGBA } from '@figma/rest-api-spec';

import { formatName } from './lib.js';

export function getAliasID(value: unknown): string | undefined {
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

export function isComposedColor(value: unknown): value is { color: unknown; opacity: unknown } {
  return typeof value === 'object' && value !== null && 'color' in value && 'opacity' in value;
}

export function getAliasIDs(value: unknown): string[] {
  const id = getAliasID(value);
  if (id) {
    return [id];
  }
  return isComposedColor(value) ? [...getAliasIDs(value.color), ...getAliasIDs(value.opacity)] : [];
}

export function resolveComposedColor(
  value: { color: unknown; opacity: unknown },
  modeID: string,
  {
    variables,
    collections,
    remoteIDs,
    sourceCollectionID,
  }: {
    variables: Record<string, LocalVariable>;
    collections: Record<string, LocalVariableCollection>;
    remoteIDs: Set<string>;
    sourceCollectionID: string;
  },
): RGBA | undefined {
  const sourceCollection = collections[sourceCollectionID];
  if (!sourceCollection) {
    throw new Error(`Missing Figma source collection: ${sourceCollectionID}`);
  }
  const modeName = sourceCollection.modes.find((mode) => mode.modeId === modeID)?.name;
  const active = new Set<string>();

  function resolve(input: unknown): unknown {
    const id = getAliasID(input);
    if (id) {
      const variable = variables[id];
      if (!variable) {
        remoteIDs.add(id);
        return undefined;
      }
      if (active.has(id)) {
        throw new Error(`Cyclic Figma composed color alias: ${id}`);
      }
      const collection = collections[variable.variableCollectionId];
      if (!collection) {
        throw new Error(`Missing Figma collection for composed color alias: ${id}`);
      }
      const targetModeID =
        variable.variableCollectionId === sourceCollectionID && modeID in variable.valuesByMode
          ? modeID
          : (collection.modes.find(
              (mode) => modeName !== undefined && formatName(mode.name) === formatName(modeName),
            )?.modeId ?? collection.defaultModeId);
      if (!(targetModeID in variable.valuesByMode)) {
        throw new Error(`Missing Figma mode value for composed color alias: ${id}`);
      }
      active.add(id);
      const resolved = resolve(variable.valuesByMode[targetModeID]);
      active.delete(id);
      return resolved;
    }
    if (isComposedColor(input)) {
      const color = resolve(input.color);
      const opacity = resolve(input.opacity);
      if (color === undefined || opacity === undefined) {
        return undefined;
      }
      if (
        typeof color !== 'object' ||
        color === null ||
        !['r', 'g', 'b'].every(
          (channel) =>
            channel in color &&
            typeof (color as Record<string, unknown>)[channel] === 'number' &&
            Number.isFinite((color as Record<string, number>)[channel]),
        )
      ) {
        throw new TypeError('Figma composed color must resolve to RGB or RGBA.');
      }
      if (
        typeof opacity !== 'number' ||
        !Number.isFinite(opacity) ||
        opacity < 0 ||
        opacity > 100
      ) {
        throw new TypeError(
          'Figma composed color opacity must resolve to a percentage from 0 to 100.',
        );
      }
      const { r, g, b } = color as RGBA;
      // Composed opacity is independently authored, not multiplied by the source alpha.
      return { r, g, b, a: opacity / 100 };
    }
    return input;
  }

  return resolve(value) as RGBA | undefined;
}

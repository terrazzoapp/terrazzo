import { formatHex, formatHex8, oklch } from 'culori';
import type { Group, Token, TokenType } from '../token.js';
import { invalidTokenIDError, isTokenMatch } from '@cobalt-ui/utils';

export interface FigmaParseOptions {
  overrides: Record<string, FigmaOverride>;
}

export interface FigmaOverride {
  /** Change the output type */
  $type?: Token['$type'];
  /** Rename a token (will also update aliases) */
  rename?: (id: string) => string | undefined | null;
  /** Convert value (e.g. from px to rem) */
  transform?: (options: { variable: Variable; collection: VariableCollection; mode: VariableMode }) => Token['$value'] | undefined | null;
}

/** sRGB color */
export interface FigmaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface VariableMode {
  modeId: string;
  name: string;
}

export interface VariableCollection {
  /** The unique identifier of this variable collection. */
  id: string;
  /** The name of this variable collection. */
  name: string;
  /** The key of the variable collection. */
  key: string;
  /** The list of modes defined for this variable collection. */
  modes: VariableMode[];
  /** The id of the default mode. */
  defaultModeId: string;
  /** Whether the variable collection is remote. */
  remote: boolean;
  /** Whether this variable collection is hidden when publishing the current file as a library. */
  hiddenFromPublishing: boolean;
  /**
   * The ids of the variables in the collection. Note that the order of these
   * variables is roughly the same as what is shown in Figma Design, however it
   * does not account for groups. As a result, the order of these variables may
   * not exactly reflect the exact ordering and grouping shown in the authoring
   * UI.
   */
  variableIds: string[];
}

export interface VariableBase {
  /** The unique identifier of this variable. */
  id: string;
  /** The name of this variable. */
  name: string;
  /** The key of the variable. */
  key: string;
  /** The id of the variable collection that contains this variable. */
  variableCollectionId: string;
  /** Whether the variable is remote. */
  remote: boolean;
  /** Description of this variable. */
  description?: string;
  /** Whether this variable is hidden when publishing the current file as a library. */
  hiddenFromPublishing: boolean;
}

export interface BooleanVariable extends VariableBase {
  /** The resolved type of the variable. */
  resolvedType: 'BOOLEAN';
  /** The values for each mode of this variable. */
  valuesByMode: { [modeId: string]: boolean | VariableAlias };
}

export interface NumberVariable extends VariableBase {
  /** The resolved type of the variable. */
  resolvedType: 'FLOAT';
  /** The values for each mode of this variable. */
  valuesByMode: { [modeId: string]: number | VariableAlias };
}

export interface StringVariable extends VariableBase {
  /** The resolved type of the variable. */
  resolvedType: 'STRING';
  /** The values for each mode of this variable. */
  valuesByMode: { [modeId: string]: string | VariableAlias };
}

export interface ColorVariable extends VariableBase {
  /** The resolved type of the variable. */
  resolvedType: 'COLOR';
  /** The values for each mode of this variable. */
  valuesByMode: { [modeId: string]: FigmaColor | VariableAlias };
}

export type Variable = BooleanVariable | NumberVariable | StringVariable | ColorVariable;

export interface VariableAlias {
  type: 'VARIABLE_ALIAS';
  /** The id of the variable that this alias points to. In the POST variables endpoint, you can use the temporary id of a variable. */
  id: string;
}

export interface FigmaVariableManifest {
  variables: Record<string, Variable>;
  variableCollections: Record<string, VariableCollection>;
}

export const SLASH_RE = /\//g;
export const DOT_RE = /\./g;

export const DEFAULT_OUTPUT_TYPE: Partial<Record<Variable['resolvedType'], TokenType | undefined>> = {
  COLOR: 'color',
  FLOAT: 'number',
};

export function figmaColorToHex(color: FigmaColor): string {
  const c = oklch({ mode: 'rgb', r: color.r, g: color.g, b: color.b, alpha: color.a });
  if (!c.h) {
    c.h = 0;
  }
  return c.alpha === 1 ? formatHex(c) : formatHex8(c);
}

export function figmaIDToDTCGID(id: string) {
  return id.replace(SLASH_RE, '.');
}

export function convertFigmaVariablesFormat(manifest: FigmaVariableManifest, options?: FigmaParseOptions) {
  const warnings: string[] = [];
  const errors: string[] = [];
  const dtcgTokens: Group = {};
  if (!manifest || !('variables' in manifest) || typeof manifest.variables !== 'object') {
    throw new Error(`Expected ID:Variable mapping in manifest.variables; received "${typeof manifest?.variables}"`);
  }
  if (!('variableCollections' in manifest) || typeof manifest.variableCollections !== 'object') {
    throw new Error(`Expected ID:Collection mapping in manifest.variableCollections; received "${typeof manifest.variableCollections}"`);
  }

  const tokenIDToNameMap: Record<string, string> = {};
  const tokens: Record<string, Token> = {};

  const globs = Object.keys(options?.overrides ?? {}).map((glob) => glob.replace(SLASH_RE, '.'));

  // 1. build shallow token manifest of IDs -> Tokens (aliases will depend on IDs)
  for (const id in manifest.variables) {
    const variable = manifest.variables[id]!;
    // find best override, if any
    let override: FigmaOverride | undefined = undefined;
    // exact matches always take precedence

    if (options?.overrides[id]) {
      override = options.overrides[id];
    } else {
      const match = isTokenMatch(variable.name.replace(SLASH_RE, '.'), globs);
      if (match) {
        override = options!.overrides[match]! || options!.overrides[match.replace(DOT_RE, '/')];
      }
    }

    const collection = manifest.variableCollections[variable.variableCollectionId];
    if (!collection) {
      errors.push(`Collection ID "${variable.variableCollectionId}" missing in data.`);
      break;
    }

    const transformResults = transformToken({ variable, collection, override });
    warnings.push(...(transformResults.warnings ?? []));
    errors.push(...(transformResults.errors ?? []));
    if (transformResults.result) {
      let overrideName = override?.rename?.(variable.name);
      if (overrideName) {
        overrideName = overrideName.replace(SLASH_RE, '.'); // sanitize user input
        if (invalidTokenIDError(overrideName)) {
          errors.push(invalidTokenIDError(overrideName)!);
          break;
        }
      }
      const name = overrideName || figmaIDToDTCGID(variable.name);

      tokenIDToNameMap[variable.id] = name; // note: as tokens get renamed, this will end up with the correct names in the end
      tokens[variable.id] = transformResults.result;
    }
  }

  // 2. resolve IDs -> friendly names (including aliases—we didn’t want to resolve those before all the renaming had settled)
  const dtcgFlat: Record<string, Token> = {};
  for (const id in tokens) {
    const token = tokens[id]!;
    dtcgFlat[tokenIDToNameMap[id]!] = token;

    // resolve Figma aliases to DTCG aliases
    if (typeof token.$value === 'object' && 'type' in token.$value && token.$value.type === 'VARIABLE_ALIAS') {
      token.$value = `{${tokenIDToNameMap[(token.$value as VariableAlias).id]}}`;
    }
    if (token.$extensions?.mode) {
      for (const k in token.$extensions?.mode) {
        const v = token.$extensions.mode[k];
        if (typeof v === 'object' && 'type' in v && v.type === 'VARIABLE_ALIAS') {
          token.$extensions.mode[k] = `{${tokenIDToNameMap[(v as VariableAlias).id]}#${k}}`;
        }
      }
    }
  }

  // 3. explode flat structure into nested structure
  for (const id in dtcgFlat) {
    const parts = id.split('.');
    let node = dtcgTokens;
    const localName = parts.pop()!;
    for (const p of parts) {
      if (!node[p]) {
        node[p] = {};
      }
      node = node[p] as Group;
    }
    node[localName] = dtcgFlat[id]!;
  }

  return {
    errors: errors.length ? errors : undefined,
    warnings: warnings.length ? warnings : undefined,
    result: dtcgTokens,
  };
}

export function transformToken({ variable, collection, override }: { variable: Variable; collection: VariableCollection; override?: FigmaOverride }): {
  warnings?: string[];
  errors?: string[];
  result: Token | undefined;
} {
  const token = {} as Token;
  const errors: string[] = [];
  if (variable.description) {
    token.$description = variable.description;
  }
  const $type = override?.$type || DEFAULT_OUTPUT_TYPE[variable.resolvedType];
  if (!$type) {
    return {
      warnings: [`Couldn’t determine output type for variable "${variable.name}" (${variable.id})`],
      result: undefined,
    };
  }
  token.$type = $type;
  for (const modeId in variable.valuesByMode) {
    const rawValue = variable.valuesByMode[modeId]!;
    const isDefaultMode = modeId === collection.defaultModeId;
    const isMultiModal = Object.values(variable.valuesByMode).length > 1;

    // make sure $extensions.mode exists if there are multiple modes
    if (isMultiModal && !token.$extensions) {
      token.$extensions = { mode: {} };
    }

    const collectionMode = collection.modes.find((mode) => mode.modeId === modeId);
    if (!collectionMode) {
      errors.push(`Collection ID "${variable.variableCollectionId}" missing mode ID "${modeId}"`);
      break;
    }

    // skip alias resolution till later
    if (typeof rawValue === 'object' && 'type' in rawValue && rawValue.type === 'VARIABLE_ALIAS') {
      if (isDefaultMode) {
        token.$value = rawValue as typeof token.$value;
      }
      if (isMultiModal) {
        token.$extensions!.mode![collectionMode.name] = rawValue as typeof token.$value;
      }
      continue;
    }

    // transform token
    try {
      let transformedValue = override?.transform?.({ variable, collection, mode: collectionMode });
      if (transformedValue === undefined || transformedValue == null) {
        switch ($type) {
          case 'color': {
            transformedValue = figmaColorToHex(rawValue as FigmaColor);
            break;
          }
          case 'number': {
            transformedValue = Number(rawValue);
            break;
          }
          case 'duration': {
            transformedValue = typeof rawValue === 'string' ? rawValue : `${rawValue}ms`;
            break;
          }
          case 'dimension': {
            transformedValue = typeof rawValue === 'string' ? rawValue : `${rawValue}px`;
            break;
          }
          default: {
            transformedValue = rawValue as string;
            break;
          }
        }
      }
      if (isDefaultMode) {
        token.$value = transformedValue!;
      }
      if (isMultiModal) {
        token.$extensions!.mode![collectionMode.name] = transformedValue!;
      }
    } catch (err) {
      errors.push(String(err));
    }
  }

  return {
    errors: errors.length ? errors : undefined,
    result: token,
  };
}

export function isFigmaVariablesFormat(manifest: unknown): boolean {
  return (
    !!manifest &&
    typeof manifest === 'object' &&
    'variables' in manifest &&
    typeof manifest.variables === 'object' &&
    'variableCollections' in manifest &&
    typeof manifest.variableCollections === 'object'
  );
}

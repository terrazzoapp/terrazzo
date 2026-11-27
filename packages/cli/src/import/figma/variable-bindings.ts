import type { LocalVariable } from '@figma/rest-api-spec';

export type VariableMatchers = Record<'fontFamily' | 'fontWeight' | 'number', RegExp | undefined>;

function importedType(variable: LocalVariable, matchers?: VariableMatchers): string | undefined {
  if (matchers?.fontFamily?.test(variable.name)) {
    return 'fontFamily';
  }
  if (matchers?.fontWeight?.test(variable.name)) {
    return 'fontWeight';
  }
  if (matchers?.number?.test(variable.name)) {
    return 'number';
  }
  return { COLOR: 'color', FLOAT: 'dimension', STRING: 'string', BOOLEAN: 'boolean' }[
    variable.resolvedType
  ];
}

function aliasID(value: unknown): string | undefined {
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

export function canImportStyleBinding(
  id: string,
  requiredType: 'color' | 'dimension',
  {
    variables,
    matchers,
  }: { variables: Record<string, LocalVariable>; matchers?: VariableMatchers },
): boolean {
  const dependencies = new Set<string>();
  const active = new Set<string>();
  function visit(currentID: string, expectedType?: string): boolean {
    const variable = variables[currentID];
    if (!variable || active.has(currentID)) {
      return false;
    }
    const type = importedType(variable, matchers);
    if (!type || (expectedType && type !== expectedType)) {
      return false;
    }
    if (dependencies.has(currentID)) {
      return true;
    }
    const values = Object.values(variable.valuesByMode);
    if (values.length === 0) {
      return false;
    }
    active.add(currentID);
    for (const value of values) {
      const direct = aliasID(value);
      if (direct && !visit(direct, expectedType)) {
        return false;
      }
      if (typeof value === 'object' && value && 'color' in value && 'opacity' in value) {
        const color = aliasID(value.color);
        const opacity = aliasID(value.opacity);
        if ((color && !visit(color, 'color')) || (opacity && !visit(opacity))) {
          return false;
        }
      }
    }
    active.delete(currentID);
    dependencies.add(currentID);
    return true;
  }
  return visit(id, requiredType);
}

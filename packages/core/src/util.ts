export function isObj(value: unknown): boolean {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** return true for undefined/null, and empty strings, arrays, and objects (numbers aren’t empty) */
export function isEmpty(value: unknown): boolean {
  if (value === undefined || value === null) {
    return true;
  }
  if (typeof value === 'string') {
    return value.length === 0;
  }
  if (Array.isArray(value)) {
    return (value as Array<unknown>).length === 0;
  }
  if (isObj(value)) {
    return Object.keys(value as object).length === 0;
  }
  return false;
}

/** perform a specific operation given an unknown type */
export function splitType(
  input: unknown,
  ops: {
    default?: (value: unknown) => any;
    undefined?: (value: undefined) => any;
    string?: (value: string) => any;
    number?: (value: number) => any;
    object?: (value: Record<string, unknown>) => any;
    array?: (value: Array<unknown>) => any;
  },
): any {
  if ((input === undefined || input === null) && ops.undefined) {
    return ops.undefined(input as any);
  } else if (typeof input === 'string' && ops.string) {
    return ops.string(input);
  } else if (typeof input === 'number' && ops.number) {
    return ops.number(input);
  } else if (Array.isArray(input) && ops.array) {
    return ops.array(input);
  } else if (isObj(input) && ops.object) {
    return ops.object(input as Record<string, unknown>);
  } else if (ops.default) {
    return ops.default(input);
  }
}

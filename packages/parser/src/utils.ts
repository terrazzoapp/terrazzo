import type { ReferenceObject } from './types.js';

/** Check if the given ref is a ReferenceObject */
export function isReferenceObject(ref: unknown): ref is ReferenceObject {
  return !!ref && typeof ref === 'object' && '$ref' in ref && typeof ref.$ref === 'string';
}

/** Check if the given value is a plain object */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

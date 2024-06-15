import type { BuildHookOptions } from '@terrazzo/parser';
import { FILE_HEADER } from './lib.js';

export function buildJSON({ getTransforms }: { getTransforms: BuildHookOptions['getTransforms'] }): string {
  const json: any = {};

  return JSON.stringify(json, undefined, 2);
}

export function buildJS({ getTransforms }: { getTransforms: BuildHookOptions['getTransforms'] }): string {
  const output: string[] = [FILE_HEADER, ''];

  return output.join('\n');
}

export function buildDTS({ getTransforms }: { getTransforms: BuildHookOptions['getTransforms'] }): string {
  const output: string[] = [FILE_HEADER, ''];

  return output.join('\n');
}

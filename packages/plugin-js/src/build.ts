import type { BuildHookOptions } from '@terrazzo/parser';
import { FILE_HEADER, FORMAT_DTS_ID, FORMAT_JS_ID, TYPE_MAP } from './lib.js';

export function buildJS({ getTransforms }: { getTransforms: BuildHookOptions['getTransforms'] }): string {
  const output: string[] = [FILE_HEADER, ''];

  // gather vals
  const tokenVals: Record<string, Record<string, string>> = {};
  for (const token of getTransforms({ format: FORMAT_JS_ID, id: '*' })) {
    if (!tokenVals[token.token.id]) {
      tokenVals[token.token.id] = {};
    }
    tokenVals[token.token.id]![token.mode] = token.value as string;
  }

  // body
  output.push('export const tokens = {');
  for (const [id, tokenValue] of Object.entries(tokenVals)) {
    output.push(`  "${id}": {`);
    for (const [mode, modeValue] of Object.entries(tokenValue)) {
      output.push(`    "${mode}": ${modeValue},`);
    }
    output.push('  },');
  }
  output.push('};', '');

  // footer
  output.push(
    `/** Get individual token */
export function token(tokenID, modeName = ".") {
  return tokens[tokenID]?.[modeName];
}`,
    '',
  );

  return output.join('\n');
}

export function buildDTS({ getTransforms }: { getTransforms: BuildHookOptions['getTransforms'] }): string {
  const output: string[] = [FILE_HEADER, ''];

  const importDeps = new Set<string>();
  const types = getTransforms({ format: FORMAT_DTS_ID, id: '*', mode: '.' }).map((t) => {
    importDeps.add(TYPE_MAP[t.token.$type]); // collect only necessary types
    if (t.type === 'MULTI_VALUE') {
      const description = t.value.description ? `  /** ${t.value.description} */\n` : '';
      return `${description}  "${t.token.id}": ${t.value.value};`;
    }
    return `"${t.token.id}": ${t.value};`;
  });

  output.push(
    'import type {',
    ...[...importDeps].sort((a, b) => a.localeCompare(b)).map((dep) => `  ${dep},`),
    '} from "@terrazzo/parser";',
    '',
    'export declare const tokens: {',
    ...types,
    '};',
    '',
    `export declare function token<K extends keyof typeof tokens>(tokenID: K, modeName?: never): (typeof tokens)[K]["."];
export declare function token<K extends keyof typeof tokens, M extends keyof (typeof tokens)[K]>(tokenID: K, modeName: M): (typeof tokens)[K][M];`,
    '',
  );

  return output.join('\n');
}

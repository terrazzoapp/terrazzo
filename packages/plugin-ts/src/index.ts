import type { BuildResult, Plugin, SchemaNode, TokenNode, TokenSchema } from '@cobalt-ui/core';

import { indent, prop } from './util.js';

export interface Options {
  /** output file (default: "./tokens/index.ts") */
  filename?: string;
}

/** Generate JSON from  */
export default function ts(options?: Options): Plugin {
  let fileName = './index.ts' || (options && options.filename);

  return {
    name: '@cobalt-ui/plugin-ts',
    async build({ schema }): Promise<BuildResult[]> {
      let code = [printTokensInterface(schema), printTokensFlatInterface(schema), printModesInterface(schema), printTokensExport(schema), printModesExport(schema), printAltFunction()];
      return [{ fileName, contents: code.join('\n\n') }];
    },
  };
}

interface PrintObjectOptions {
  tokens: Record<string, SchemaNode>;
  transform(value: any): string | undefined;
  indentLv?: number;
  types?: boolean;
}

/** Print deeply-nested object */
function printObject({ indentLv = 0, tokens, types = false, transform }: PrintObjectOptions): string {
  const code: string[] = [];
  for (const token of Object.values(tokens)) {
    // comment
    const comment: string[] = [];
    if (token.name) comment.push(token.name);
    if (token.description) comment.push(token.description);
    if (comment.length) code.push(indent(`/** ${comment.join(': ')} */`, indentLv));

    // group
    if (token.type === 'group') {
      const printedGroup = printObject({ indentLv: indentLv + 1, tokens: token.tokens, types, transform });
      if (printedGroup.trim()) {
        code.push(indent(`${prop(token.localID)}: {`, indentLv));
        code.push(printedGroup);
        code.push(indent(types ? '};' : '},', indentLv));
      }
    }

    // token
    else {
      const { localID, value } = token as TokenNode;
      const printedVal = transform(value);
      if (printedVal) code.push(indent(`${prop(localID)}: ${printedVal}${types ? ';' : ','}`, indentLv));
    }
  }
  return code.join('\n');
}

/** Print Tokens interface */
function printTokensInterface(schema: TokenSchema): string {
  const code = ['export interface Tokens {'];
  code.push(printObject({ indentLv: 1, tokens: schema.tokens, types: true, transform: (val) => typeof val.default }));
  code.push('}');
  return code.join('\n');
}

/** Print main tokens export */
function printTokensExport(schema: TokenSchema): string {
  const code = ['export const tokens: Tokens = {'];
  code.push(printObject({ indentLv: 1, tokens: schema.tokens, transform: (val) => (typeof val.default === 'string' ? `'${val.default}'` : val.default) }));
  code.push('};');
  return code.join('\n');
}

/** Print primary modes export */
function printModesExport(schema: TokenSchema): string {
  const code = ['export const modes: Record<string, any> = {'];
  code.push(
    printObject({
      indentLv: 1,
      tokens: schema.tokens,
      transform: (val) => {
        const props: string[] = [];
        for (const [k, v] of Object.entries(val)) {
          if (k === 'default') continue;
          props.push(`${prop(k)}: ${typeof v === 'string' ? `'${v}'` : v}`);
        }
        if (!props.length) return undefined;
        return `{ ${props.join(', ')} }`;
      },
    })
  );
  code.push('};');

  return code.join('\n');
}

/** Print TokensFlat interface - used for querying by ID */
function printTokensFlatInterface(schema: TokenSchema): string {
  const flatTokens: Record<string, any> = {};

  /** Flatten deep tokens into flat map */
  function flattenTokens(tokens: Record<string, SchemaNode>): void {
    for (const token of Object.values(tokens)) {
      if (token.type === 'group') {
        flattenTokens(token.tokens);
      } else {
        flatTokens[token.id] = typeof token.value.default;
      }
    }
  }

  flattenTokens(schema.tokens);

  const code = ['export interface TokensFlat {'];
  for (const [k, v] of Object.entries(flatTokens)) {
    code.push(`  ${prop(k)}: ${v};`);
  }
  code.push('}');

  return code.join('\n');
}

/** Print modes interface */
function printModesInterface(schema: TokenSchema): string {
  const flatModes: Record<string, any> = {};

  /** flatten modes into flat map */
  function flattenModes(tokens: Record<string, SchemaNode>): void {
    for (const token of Object.values(tokens)) {
      if (token.type !== 'group') continue;
      if (token.modes && token.modes.length) flatModes[token.id] = `'${token.modes.join("' | '")}'`;
      if (token.tokens) flattenModes(token.tokens);
    }
  }

  flattenModes(schema.tokens);

  const code = ['export interface Modes {'];
  for (const [k, v] of Object.entries(flatModes)) {
    code.push(`  ${prop(k)}: ${v};`);
  }
  code.push('}');

  return code.join('\n');
}

/** Primary method of getting alt values */
function printAltFunction(): string {
  return `/** Get alternate values */
export function getAlt<T = string>(tokenID: keyof TokensFlat, mode: string): T {
  let defaultVal = tokens;
  let altVal = modes;
  for (const next of tokenID.split('.')) {
    defaultVal = defaultVal[next];
    if (altVal[next] !== undefined) altVal = altVal[next];
  }
  return (altVal && altVal[mode]) || defaultVal;
}`;
}

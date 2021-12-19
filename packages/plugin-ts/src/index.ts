import type { BuildResult, Plugin, TokenNode } from "@cobalt-ui/core";

import { Indenter } from "@cobalt-ui/utils";
import { prop } from "./util.js";

type Transformer = (value: any, token: TokenNode) => any;

export interface Options {
  /** output file (default: "./tokens/index.ts") */
  filename?: string;
  /** modify values */
  transformValue?: Transformer;
}

export default function ts(options?: Options): Plugin {
  let fileName = options?.filename || "./index.ts";
  let transformer = options?.transformValue;
  const i = new Indenter(); // TODO: allow config?

  interface PrintObjectOptions {
    tokens: TokenNode[];
    transform(value: any): string | undefined;
    indentLv?: number;
    types?: boolean;
  }

  function printObject({ indentLv = 0, tokens, types = false, transform }: PrintObjectOptions): string {
    const code: string[] = [];
    for (const token of tokens) {
      // comment
      const comment: string[] = [];
      if (token.name) comment.push(token.name);
      if (token.description) comment.push(token.description);
      if (comment.length) code.push(i.indent(`/** ${comment.join(": ")} */`, indentLv));

      // token
      const value = token.value;
      const parts = token.id;

      // apply transformValue()
      if (transformer) {
        for (const k of Object.keys(value)) {
          value[k] = transformer(value[k], token);
        }
      }
      const printedVal = transform(value);
      if (printedVal) code.push(i.indent(`${prop(localID)}: ${printedVal}${types ? ";" : ","}`, indentLv));
    }
    return code.join("\n");
  }

  function printTokensExport(schema: TokenSchema): string {
    const code = ["export const tokens = {"];
    code.push(printObject({ indentLv: 1, tokens: schema.tokens, transform: (val) => (typeof val.default === "string" ? `'${val.default}'` : val.default) }));
    code.push("};");
    return code.join("\n");
  }

  function printModesExport(schema: TokenSchema): string {
    const code = ["export const modes = {"];
    code.push(
      printObject({
        indentLv: 1,
        tokens: schema.tokens,
        transform: (val) => {
          const props: string[] = [];
          for (const [k, v] of Object.entries(val)) {
            if (k === "default") continue;
            props.push(`${prop(k)}: ${typeof v === "string" ? `'${v}'` : v}`);
          }
          if (!props.length) return undefined;
          return `{ ${props.join(", ")} }`;
        },
      })
    );
    code.push("};");

    return code.join("\n");
  }

  function printTokensFlatInterface(schema: TokenSchema): string {
    const flatTokens: Record<string, any> = {};

    function flattenTokens(tokens: Record<string, SchemaNode>): void {
      for (const token of Object.values(tokens)) {
        if (token.type === "group") {
          flattenTokens(token.tokens);
        } else {
          flatTokens[token.id] = typeof token.value.default;
        }
      }
    }

    flattenTokens(schema.tokens);

    const code = ["export interface TokensFlat {"];
    for (const [k, v] of Object.entries(flatTokens)) {
      code.push(`  ${prop(k)}: ${v};`);
    }
    code.push("}");

    return code.join("\n");
  }

  function printModesInterface(schema: TokenSchema): string {
    const flatModes: Record<string, any> = {};

    function flattenModes(tokens: Record<string, SchemaNode>): void {
      for (const token of Object.values(tokens)) {
        if (token.type !== "group") continue;
        if (token.modes && token.modes.length) flatModes[token.id] = `'${token.modes.join("' | '")}'`;
        if (token.tokens) flattenModes(token.tokens);
      }
    }

    flattenModes(schema.tokens);

    const code = ["export interface Modes {"];
    for (const [k, v] of Object.entries(flatModes)) {
      code.push(`  ${prop(k)}: ${v};`);
    }
    code.push("}");

    return code.join("\n");
  }

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

  return {
    name: "@cobalt-ui/plugin-ts",
    async build({ schema }): Promise<BuildResult[]> {
      let code = [printTokensFlatInterface(schema), printModesInterface(schema), printTokensExport(schema), printModesExport(schema), printAltFunction()];
      return [{ fileName, contents: code.join("\n\n") }];
    },
  };
}

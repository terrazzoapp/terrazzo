import type { BuildResult, Plugin, Token } from "@cobalt-ui/core";

import { Indenter } from "@cobalt-ui/utils";
import { encode } from "./util.js";

const MODE_MAP = "-cobalt_token_modes";
const ANY_DOT_RE = /\./g;

export interface Options {
  /** output file (default: "./tokens/index.sass") */
  filename?: string;
  /** use indented syntax (.sass)? (default: false) */
  indentedSyntax?: boolean;
  /** modify values */
  transformValue?: (token: Token, mode?: string) => string;
  /** rename variables */
  transformVariables?: (id: string) => string;
}

export default function sass(options?: Options): Plugin {
  let ext = options?.indentedSyntax ? ".sass" : ".scss";
  let fileName = `${options?.filename?.replace(/(\.(sass|scss))?$/, "") || "index"}${ext}`;
  let transform = options?.transformValue || defaultTransformer;
  let namer = options?.transformVariables || defaultNamer;
  const semi = options?.indentedSyntax ? "" : ";";
  const i = new Indenter();

  function generateModeFn(): string {
    return `@function mode($token, $modeName) {
  $mode: map.get($${MODE_MAP}, $token)${semi}
  @return map.get($mode, $modeName)${semi}
}`;
  }

  function defaultTransformer(token: Token): string {
    switch (token.type) {
      case "font": {
        return token.value.map((fontName) => (fontName.includes(" ") ? `"${fontName}"` : fontName)).join(",");
      }
      case "shadow": {
        return token.value.join(",");
      }
      case "file": {
        return encode(token.value);
      }
      case "url": {
        return `url('${token.value}')`;
      }
      case "cubic-bezier": {
        return `cubic-bezier(${token.value.join(",")})`;
      }
      default: {
        return token.value;
      }
    }
  }

  function defaultNamer(id: string): string {
    return id.replace(ANY_DOT_RE, "__");
  }

  return {
    name: "@cobalt-ui/plugin-sass",
    async build(schema): Promise<BuildResult[]> {
      // 1. gather default values and modes
      let imports = [`@use "sass:map"${semi}`];
      let defaults: string[] = [];
      for (const token of schema.tokens) {
        defaults.push(`$${namer(token.id)}: ${transform(token)}${semi}`);
      }

      // 2. render modes data
      let modeOutput: string[] = [`$${MODE_MAP}: (`];
      for (const token of schema.tokens) {
        if (!token.mode) continue;
        modeOutput.push(i.indent(`$${namer(token.id)}: (`, 1));
        for (const mode of Object.keys(token.mode)) {
          modeOutput.push(i.indent(`${mode}: ${transform(token, mode)},`, 2));
        }
        modeOutput.push(i.indent("),", 1));
      }
      modeOutput.push(`)${semi}`);

      // 3. finish
      let code = [...imports, "", ...defaults, ...modeOutput, "", generateModeFn()].join("\n");
      return [{ fileName, contents: code }];
    },
  };
}


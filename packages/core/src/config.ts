import type { TokenType } from "./parse";
import type { Plugin } from "./build";

import fs from "fs";

export interface FigmaMapping {
  [url: string]: {
    styles: { [StyleName: string]: FigmaValue };
    components: { [StyleName: string]: FigmaValue };
  };
}

export interface FigmaValue {
  /** The type of token to extract */
  type: TokenType;
  /** tokens.yaml ID */
  id: string;
}

export interface Config {
  tokens: URL;
  outDir: URL;
  plugins: Plugin[];
  figma?: FigmaMapping;
}

export interface UserConfig {
  /** path to tokens.yaml (default: "./tokens.yaml") */
  tokens?: string;
  /** output directory (default: "./tokens/") */
  outDir?: string;
  /** specify plugins (default: @cobalt-ui/plugin-json, @cobalt-ui/plugin-sass, @cobalt-ui/plugin-ts) */
  plugins: Plugin[];
  /** add figma keys */
  figma?: FigmaMapping;
}

export class ConfigLoader {
  public filePath: URL;

  constructor(basename?: string) {
    if (basename) {
      const filePath = new URL(basename, `file://${process.cwd()}/`);
      if (!fs.existsSync(filePath)) throw new Error(`Could not locate ${basename} in ${process.cwd()}`);
      this.filePath = filePath;
    } else {
      let filePath: URL | undefined;
      for (const f of ["cobalt.config.js", "cobalt.config.mjs"]) {
        if (fs.existsSync(f)) {
          filePath = new URL(f, `file://${process.cwd()}/`);
          break;
        }
      }
      if (filePath) {
        this.filePath = filePath;
      } else {
        throw new Error(`Could not locate cobalt.config.js in ${process.cwd()}`);
      }
    }
  }

  async load(): Promise<Config> {
    async function loadDefaultPlugins(): Promise<Plugin[]> {
      return await Promise.all(["@cobalt-ui/plugin-json"].map((spec) => import(spec).then((m) => m.default())));
    }

    let m = await import(this.filePath.href);
    let config: any = (m && m.default) || {};

    // partial config: fill in defaults
    const configKeys: (keyof Config)[] = ["outDir", "plugins", "tokens"];
    for (const k of configKeys) {
      switch (k) {
        case "outDir": {
          // default
          if (config[k] === undefined) {
            config[k] = new URL("./tokens/", `file://${process.cwd()}/`);
            break;
          }
          // validate
          if (typeof config[k] !== "string") throw new Error(`[config] ${k} must be string, received ${typeof config[k]}`);
          // normalize
          config[k] = new URL(config[k], `file://${process.cwd()}/`);
          break;
        }
        case "plugins": {
          // default
          if (config[k] === undefined) {
            config[k] = await loadDefaultPlugins();
            break;
          }
          // validate
          if (!Array.isArray(config[k])) throw new Error(`[config] ${k} must be array, received ${typeof config[k]}`);
          if (!config[k].length) throw new Error(`[config] plugins are empty`);
          for (let n = 0; n < config[k].length; n++) {
            if (typeof config[k][n] !== "object") throw new Error(`[plugin#${n}] invalid: expected output plugin, received ${JSON.stringify(config[k][n])}`);
            if (!config[k][n].name) throw new Error(`[plugin#${n}] invalid plugin: missing "name"`);
            if (typeof config[k][n].build !== "function") throw new Error(`[${config[k][n].name}] missing "build" function`);
          }
          break;
        }
        case "tokens": {
          // default
          if (config[k] === undefined) {
            config[k] = new URL("./tokens.yaml", `file://${process.cwd()}/`);
            break;
          }
          // validate
          if (typeof config[k] !== "string") throw new Error(`[config] ${k} must be string, received ${typeof config[k]}`);
          // normalize
          config[k] = new URL(config[k], `file://${process.cwd()}/`);
          break;
        }
        case "figma": {
          // default
          if (config[k] == undefined) {
            break;
          }
          // validate
          for (const group of ["styles", "components"]) {
            if (typeof config[k][group] == "object" && Object.keys(config[k][group]).length) {
              for (const [name, val] of Object.entries(config[k][group])) {
                if (typeof val != "object") throw new Error(`[config] Figma ${group}.${name} expected format \`"StyleName": { type: "color", id: "color.blue" }\`, received "${val}"`);
                const { type, id } = val as any;
                if (typeof type != "string") throw new Error(`[config] Figma ${group}.${name} expected \`{ type: "[string]" }\`, received "${type}"`);
                if (typeof id != "string") throw new Error(`[config] Figma ${group}.${name} expected \`{ id: "[string]" }\`, received "${id}"`);
              }
            }
            break;
          }
        }
      }
    }

    return config;
  }
}

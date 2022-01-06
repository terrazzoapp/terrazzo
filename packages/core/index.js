import { FG_RED, FG_YELLOW, RESET } from "@cobalt-ui/utils";
import * as wasm from "./dist/cobalt_ui.cjs";
import { fetchDoc } from "./figma/index.js";

/**
 * Convert tokens.yaml string into tokens.
 * Uses Rust for very fast compilation and error-checking.
 */
export function parse(code) {
  const { errors, result } = JSON.parse(wasm.parse(code));
  if (errors && errors.length)
    throw new Error(
      `${FG_RED}${errors.map((msg) => `  ✘  ${msg}`).join("\n")}${RESET}`
    );
  return result;
}

/**
 * Get latest updates from Figma.
 * Uses Rust for very fast compilation.
 */
export async function sync(config) {
  if (!config.figma || !Object.keys(config.figma).length) {
    console.warn(
      `  ${FG_YELLOW}⚠  Figma not configued. See ${UNDERLINE}https://cobalt-ui.pages.dev/docs/getting-started/figma${RESET}`
    );
    process.exit(0);
  }
  const results = await Promise.all(
    Object.entries(config.figma).map(async ([url, mappings]) => {
      const doc = await fetchDoc(url);
      const { errors, result } = JSON.parse(wasm.convert_figma(doc, mappings));
      if (errors && errors.length)
        throw new Error(
          `${FG_RED}${errors.map((msg) => `  ✘  ${msg}`).join("\n")}${RESET}`
        );
      return result;
    })
  );
  console.log(results.flat());
  return results.flat();
}

/**
 * Validate config and fill in defaults
 * userConfig will override all defaults
 */
export async function loadConfig(userConfig = {}) {
  const config = {
    tokens: "./tokens.yaml",
    outDir: "./tokens/",
    plugins: [],
    figma: {},
  };

  // tokens
  if (userConfig.tokens !== undefined) {
    if (typeof userConfig.tokens == "string") {
      config.tokens = userConfig.tokens;
    } else {
      throw new Error(
        `  ${FG_RED}✘  expected string for "tokens", received ${typeof userConfig.tokens}${RESET}`
      );
    }
  }
  // outDir
  if (userConfig.outDir !== undefined) {
    if (typeof outDir == "string") {
      config.outDir = userConfig.outDir;
    } else {
      throw new Error(
        `  ${FG_RED}✘  expected string for "outDir", received ${typeof userConfig.outDir}${RESET}`
      );
    }
  }
  // plugins
  if (userConfig.plugins !== undefined) {
    if (Array.isArray(userConfig.plugins)) {
      userConfig.plugins.forEach((plugin, i) => {
        if (typeof plugin.name != "string")
          throw new Error(`  ${FG_RED}✘  plugin[${i}] missing "name"${RESET}`);
        if (typeof plugin.build != "function")
          throw new Error(
            `  ${FG_RED}✘  plugin[${plugin.name}] missing build() function${RESET}`
          );
      });
      config.plugins = userConfig.plugins;
    } else {
      throw new Error(
        `  ${FG_RED}✘  expected array for "plugins", received ${typeof userConfig.plugins}${RESET}`
      );
    }
  }
  // figma
  if (userConfig.figma !== undefined) {
    if (
      typeof userConfig.figma == "object" &&
      !Array.isArray(userConfig.figma)
    ) {
      for (const [url, fileTokens] of Object.entries(userConfig.figma)) {
        if (Array.isArray(fileTokens)) {
          for (const figmaToken of fileTokens) {
            if (
              typeof figmaToken.component != "string" &&
              typeof figmaToken.style != "string"
            )
              throw new Error(
                `  ${FG_RED}✘  Must specify "component" or "style" name for all Figma tokens${RESET}`
              );
            const name = figmaToken.component || figmaToken.style;
            if (typeof figmaToken.type != "string")
              throw new Error(`  ${FG_RED}✘  ${name}: missing "type"${RESET}`);
            if (typeof figmaToken.token != "string")
              throw new Error(`  ${FG_RED}✘  ${name}: missing "token"${RESET}`);
            if (figmaToken.type == "file" && typeof figmaToken.file != "string")
              throw new Error(
                `  ${FG_RED}✘  ${name}: needs property \`file: "./path/to/file.svg"\`${RESET}`
              );
          }
        } else {
          throw new Error(
            `  ${FG_RED}✘  expected array for ${url}, received ${typeof fileTokens} ${RESET}`
          );
        }
      }
      config.figma = userConfig.figma;
    } else {
      throw new Error(
        `  ${FG_RED}✘  expected object for "figma", received ${typeof userConfig.figma}${RESET}`
      );
    }
  }

  return config;
}

/**
 * Generate code from tokens.
 * Does NOT use Rust as all the plugins are written in JS/TS (no work done in Rust).
 */
export async function build(tokens, config) {
  const results = await Promise.all(
    config.plugins.map((plugin) => plugin.build(tokens, config))
  );
  return results.flat();
}

export default {
  parse,
  sync,
  loadConfig,
  build,
};

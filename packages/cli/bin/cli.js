#!/usr/bin/env node

import dotenv from "dotenv";
dotenv.config();

import co from "@cobalt-ui/core";
import { DIM, FG_BLUE, FG_GREEN, FG_YELLOW, UNDERLINE, RESET } from "@cobalt-ui/utils";
import chokidar from "chokidar";
import fs from "fs";
import { performance } from "perf_hooks";
import { fileURLToPath } from "url";

const [, , cmd, ...args] = process.argv;
const SLASH_PREFIX_RE = /^\/?/;

/** `tokens` CLI command */
async function main() {
  const start = performance.now();

  // ---
  // half-run commands: --help, --version, init

  // --help
  if (args.includes("--help")) {
    showHelp();
    process.exit(0);
  }

  // --version
  if (cmd === "--version" || cmd === "-v") {
    const { version } = JSON.parse(fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"));
    console.log(version);
    process.exit(0);
  }

  // load config
  let cwd = `file://${process.cwd()}/`;
  const configI = args.findIndex((arg) => arg.toLowerCase() === "-c" || arg.toLowerCase() === "--config");
  if (configI != -1 && !args[configI + 1]) throw new Error(`  ${FG_RED}✘  Missing path after --config flag${RESET}`);
  let userConfig = {};
  // --config flag
  if (configI > 0 && args[configI + 1]) {
    try {
      configPath = new URL(args[configI + 1], cwd);
      cwd = new URL(".", configPath); // resolve filepaths relative to config
      userConfig = (await import(fileURLToPath(configPath))).default;
    } catch {
      throw new Error(`  ${FG_RED}✘  Could not locate ${args[configI + 1]}${RESET}`);
    }
  }
  // default (cobalt.config.js)
  else {
    let configPath = new URL("./cobalt.config.js", cwd);
    if (!fs.existsSync(configPath)) configPath = new URL("./cobalt.config.mjs", cwd);
    if (!fs.existsSync(configPath)) throw new Error(`  ${FG_RED}✘  Could not find cobalt.config.js${RESET}`);
    if (fs.existsSync(configPath)) userConfig = (await import(fileURLToPath(configPath))).default;
  }
  const config = await co.loadConfig(userConfig);

  // init
  if (cmd === "init") {
    if (fs.existsSync(config.tokens)) throw new Error(`${config.tokens} already exists`);
    fs.cpSync(new URL("../tokens-example.yaml", import.meta.url), new URL(config.tokens, cwd));
    console.log(`  ${FG_GREEN}✔${RESET} ${config.tokens} created`);
    process.exit(0);
  }

  // ---
  // full-run commands: build, sync, check

  // load tokens.yaml
  if (!fs.existsSync(config.tokens)) throw new Error(`  ${FG_RED}✘  Could not locate ${fileURLToPath(config.tokens)}. To create one, run \`cobalt init\`.${RESET}`);
  let rawSchema = fs.readFileSync(config.tokens, "utf8");

  switch (cmd) {
    case "build": {
      const dt = new Intl.DateTimeFormat("en-us", { hour: "2-digit", minute: "2-digit" });
      let watch = args.includes("-w") || args.includes("--watch");
      const outDir = new URL(config.outDir.replace(SLASH_PREFIX_RE, ""), cwd);

      let tokens = co.parse(rawSchema);
      await co.build(tokens, config)
        .then((updates) =>
          Promise.all(updates.map(({ fileName, contents }) =>
            fs.promises.writeFile(new URL(fileName.replace(SLASH_PREFIX_RE, ""), outDir), contents)
          ))
        );

      if (watch) {
        const watcher = chokidar.watch(fileURLToPath(config.tokens));
        const tokensYAML = config.tokens.href.replace(cwd.href, "");
        watcher.on("change", async (filePath) => {
          try {
            rawSchema = fs.readFileSync(filePath, "utf8");

            await co.build(co.parse(rawSchema), config)
              .then((updates) =>
                Promise.all(updates.map(({ fileName, contents }) =>
                  fs.promises.writeFile(new URL(fileName.replace(SLASH_PREFIX_RE, ""), outDir), contents)
                ))
              );

            console.log(`${DIM}${dt.format(new Date())}${RESET} ${FG_BLUE}Cobalt${RESET} ${FG_YELLOW}${tokensYAML}${RESET} updated ${FG_GREEN}✔${RESET}`);
          } catch (err) {
            console.error(err);
          }
        });
        // keep process occupied
        await new Promise(() => { }); // eslint-disable-line @typescript-eslint/no-empty-function
      } else {
        console.log(`  ${FG_GREEN}✔${RESET}  ${tokens.length} token${tokens.length != 1 ? "s" : ""} built`);
      }

      break;
    }
    case "sync": {
      const updates = await co.sync(config);
      console.log(`  ${FG_GREEN}✔${RESET}  Tokens updated from Figma`);
      break;
    }
    case "check": {
      console.log(`${UNDERLINE}${fileURLToPath(filePath)}${RESET}`);
      co.parse(rawSchema); // will throw if errors
      console.log(`  ${FG_GREEN}✔${RESET}  no errors`);
      process.exit(0);
      break;
    }
    default:
      showHelp();
  }

  console.info(`  Done  ${time(start)}`);
}

main();

/** Show help */
function showHelp() {
  console.log(`cobalt
  [commands]
    build           Build token artifacts from tokens.yaml
      --watch, -w   Watch tokens.yaml for changes and recompile
    sync            Sync tokens.yaml with Figma
    init            Create a starter tokens.yaml file
    check           Check tokens.yaml for errors

  [options]
    --help         Show this message
    --config, -c   Path to config (default: ./cobalt.config.js)
`);
}

/** Print time elapsed */
function time(start) {
  const diff = performance.now() - start;
  return `${DIM}${diff < 750 ? `${Math.round(diff)}ms` : `${(diff / 1000).toFixed(1)}s`}${RESET}`;
}

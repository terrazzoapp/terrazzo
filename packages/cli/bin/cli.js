#!/usr/bin/env node

/* eslint-disable no-console */

import dotenv from 'dotenv';
dotenv.config();

import { parse } from '@cobalt-ui/core';
import { DIM, FG_BLUE, FG_RED, FG_GREEN, FG_YELLOW, UNDERLINE, RESET } from '@cobalt-ui/utils';
import chokidar from 'chokidar';
import fs from 'fs';
import { performance } from 'perf_hooks';
import { fileURLToPath } from 'url';
import { init as initConfig } from '../dist/config.js';
import { build } from '../dist/build.js';
import figma from '../dist/figma/index.js';

const [, , cmd, ...args] = process.argv;

/** `tokens` CLI command */
async function main() {
  const start = performance.now();

  // ---
  // half-run commands: --help, --version, init

  // --help
  if (args.includes('--help')) {
    showHelp();
    process.exit(0);
  }

  // --version
  if (cmd === '--version' || cmd === '-v') {
    const { version } = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
    console.log(version);
    process.exit(0);
  }

  // load config
  let cwd = `file://${process.cwd()}/`;
  const configI = args.findIndex((arg) => arg.toLowerCase() === '-c' || arg.toLowerCase() === '--config');
  if (configI != -1 && !args[configI + 1]) throw new Error(`  ${FG_RED}✘  Missing path after --config flag${RESET}`);
  let userConfig = {};
  // --config flag
  if (configI > 0 && args[configI + 1]) {
    try {
      configPath = new URL(args[configI + 1], cwd);
      cwd = new URL('.', configPath); // resolve filepaths relative to config
      userConfig = (await import(fileURLToPath(configPath))).default;
    } catch {
      throw new Error(`  ${FG_RED}✘  Could not locate ${args[configI + 1]}${RESET}`);
    }
  }
  // default (tokens.config.js)
  else {
    let configPath = new URL('./tokens.config.js', cwd);
    if (!fs.existsSync(configPath)) configPath = new URL('./tokens.config.mjs', cwd);
    if (!fs.existsSync(configPath))
      throw new Error(`  ${FG_RED}✘  Could not find tokens.config.js\n      See ${UNDERLINE}https://cobalt-ui.pages.dev/docs/reference/config/${RESET}`);
    if (fs.existsSync(configPath)) userConfig = (await import(fileURLToPath(configPath))).default;
  }
  const config = await initConfig(userConfig);

  // init
  if (cmd === 'init') {
    if (fs.existsSync(config.tokens)) throw new Error(`${config.tokens} already exists`);
    fs.cpSync(new URL('../tokens-example.json', import.meta.url), new URL(config.tokens, cwd));
    console.log(`  ${FG_GREEN}✔${RESET} ${config.tokens} created`);
    process.exit(0);
  }

  // ---
  // full-run commands: build, sync, check

  // load tokens.json
  if (!fs.existsSync(config.tokens))
    throw new Error(`  ${FG_RED}✘  Could not locate ${fileURLToPath(config.tokens)}. To create one, run \`npx co init\`.${RESET}`);
  let rawSchema = JSON.parse(fs.readFileSync(config.tokens, 'utf8'));

  switch (cmd) {
    case 'build': {
      const dt = new Intl.DateTimeFormat('en-us', {
        hour: '2-digit',
        minute: '2-digit',
      });
      let watch = args.includes('-w') || args.includes('--watch');

      let result = await build(rawSchema, config);
      printErrors(result.errors);
      printWarnings(result.warnings);
      if (result.errors) process.exit(1);

      if (watch) {
        const watcher = chokidar.watch(fileURLToPath(config.tokens));
        const tokensYAML = config.tokens.href.replace(cwd.href, '');
        watcher.on('change', async (filePath) => {
          try {
            rawSchema = JSON.parse(fs.readFileSync(filePath, 'utf8'));

            result = await build(rawSchema, config);

            if (result.errors || result.warnings) {
              printErrors(errors);
              printWarnings(warnings);
            } else {
              console.log(`${DIM}${dt.format(new Date())}${RESET} ${FG_BLUE}Cobalt${RESET} ${FG_YELLOW}${tokensYAML}${RESET} updated ${FG_GREEN}✔${RESET}`);
            }
          } catch (err) {
            printErrors([err.message || err]);
          }
        });
        // keep process occupied
        await new Promise(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function
      } else {
        console.log(`  ${FG_GREEN}✔${RESET}  ${result.result.tokens.length} token${result.result.tokens.length != 1 ? 's' : ''} built`);
      }

      break;
    }
    case 'sync': {
      const updates = await figma(config);
      for (const [id, token] of Object.entries(updates)) {
        let namespaces = id.split('.');
        let node = rawSchema;
        for (const namespace of namespaces) {
          if (!node[namespace]) node[namespace] = {};
          node = node[namespace];
        }
        for (const [k, v] of Object.entries(token)) {
          node[k] = v; //
        }
      }
      fs.writeFileSync(config.tokens, JSON.stringify(rawSchema, undefined, 2), 'utf8');
      console.log(`  ${FG_GREEN}✔${RESET}  Tokens updated from Figma`);
      break;
    }
    case 'check': {
      console.log(`${UNDERLINE}${fileURLToPath(filePath)}${RESET}`);
      const { errors, warnings } = parse(rawSchema); // will throw if errors
      if (errors || warnings) {
        printErrors(errors);
        printWarnings(warnings);
        process.exit(1);
      }
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
    build           Build token artifacts from tokens.json
      --watch, -w   Watch tokens.json for changes and recompile
    sync            Sync tokens.json with Figma
    init            Create a starter tokens.json file
    check           Check tokens.json for errors

  [options]
    --help         Show this message
    --config, -c   Path to config (default: ./tokens.config.js)
`);
}

/** Print time elapsed */
function time(start) {
  const diff = performance.now() - start;
  return `${DIM}${diff < 750 ? `${Math.round(diff)}ms` : `${(diff / 1000).toFixed(1)}s`}${RESET}`;
}

/** Print errors */
export function printErrors(errors) {
  if (!errors || !Array.isArray(errors)) return;
  errors.forEach((e) => console.error(`  ${FG_RED}✘  ${e}${RESET}`));
}

/** Print warnings */
export function printWarnings(warnings) {
  if (!warnings || !Array.isArray(warnings)) return;
  warnings.forEach((w) => console.warn(`  ${FG_YELLOW}!  ${w}${RESET}`));
}

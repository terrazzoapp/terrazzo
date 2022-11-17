#!/usr/bin/env node

/* eslint-disable no-console */

import dotenv from 'dotenv';
dotenv.config();

import {parse} from '@cobalt-ui/core';
import {DIM, FG_BLUE, FG_RED, FG_GREEN, FG_YELLOW, UNDERLINE, RESET} from '@cobalt-ui/utils';
import chokidar from 'chokidar';
import fs from 'node:fs';
import {performance} from 'node:perf_hooks';
import {fileURLToPath, URL} from 'node:url';
import parser from 'yargs-parser';
import {init as initConfig} from '../dist/config.js';
import {build} from '../dist/build.js';
import figma from '../dist/figma/index.js';

const [, , cmd, ...args] = process.argv;
const cwd = new URL(`file://${process.cwd()}/`);

const flags = parser(args, {
  boolean: ['help', 'watch', 'version'],
  string: ['config'],
  alias: {
    config: ['c'],
    version: ['v'],
    watch: ['w'],
  },
});

/** `tokens` CLI command */
async function main() {
  const start = performance.now();

  // ---
  // half-run commands: --help, --version, init

  // --help
  if (flags.help || !cmd) {
    showHelp();
    process.exit(0);
  }

  // --version
  if (flags.version) {
    const {version} = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
    console.log(version);
    process.exit(0);
  }

  // ---
  // full-run commands: build, sync, check

  // setup: load tokens.config.js and tokens.config.json
  let configPath;
  if (typeof flags.config === 'string') {
    if (flags.config === '') {
      console.error(`  ${FG_RED}✘  Missing path after --config flag${RESET}`);
      process.exit(1);
    }
    configPath = resolveConfig(flags.config);
  }
  let config;
  try {
    config = await loadConfig(resolveConfig(configPath));
  } catch (err) {
    console.error(`  ${FG_RED}✘  ${err.message || err}${RESET}`);
    process.exit(1);
  }

  switch (cmd) {
    case 'build': {
      if (!fs.existsSync(config.tokens)) {
        console.error(`  ${FG_RED}✘  Could not locate ${config.tokens}. To create one, run \`npx cobalt init\`.${RESET}`);
        process.exit(1);
      }

      if (!Array.isArray(config.plugins) || !config.plugins.length) {
        console.error(`  ${FG_RED}✘  No plugins defined! Add some in ${configPath || 'tokens.config.js'}${RESET}`);
        process.exit(1);
      }

      let rawSchema = JSON.parse(fs.readFileSync(config.tokens), 'utf8');

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
        const tokenWatcher = chokidar.watch(fileURLToPath(config.tokens));
        const tokensYAML = config.tokens.href.replace(cwd.href, '');
        tokenWatcher.on('change', async (filePath) => {
          try {
            rawSchema = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            result = await build(rawSchema, config);
            if (result.errors || result.warnings) {
              printErrors(result.errors);
              printWarnings(result.warnings);
            } else {
              console.log(`${DIM}${dt.format(new Date())}${RESET} ${FG_BLUE}Cobalt${RESET} ${FG_YELLOW}${tokensYAML}${RESET} updated ${FG_GREEN}✔${RESET}`);
            }
          } catch (err) {
            printErrors([err.message || err]);
          }
        });
        const configWatcher = chokidar.watch(fileURLToPath(resolveConfig(configPath)));
        configWatcher.on('change', async (filePath) => {
          try {
            console.log(`${DIM}${dt.format(new Date())}${RESET} ${FG_BLUE}Cobalt${RESET} ${FG_YELLOW}Config updated. Reloading…${RESET}`);
            config = await loadConfig(filePath);
            rawSchema = JSON.parse(fs.readFileSync(config.tokens, 'utf8'));
            result = await build(rawSchema, config);
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
      if (!fs.existsSync(config.tokens)) {
        console.error(`  ${FG_RED}✘  Could not locate ${config.tokens}. To create one, run \`npx cobalt init\`.${RESET}`);
        process.exit(1);
      }

      let rawSchema = JSON.parse(fs.readFileSync(config.tokens), 'utf8');

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
      let tokensPath = config.tokens;
      if (args[0]) {
        tokensPath = new URL(args[0], cwd);
        if (!fs.existsSync(tokensPath)) {
          console.error(`Expected format: cobalt check ./path/to/tokens.json. Could not locate ${args[0]}.`);
          process.exit(1);
        }
      }

      if (!fs.existsSync(tokensPath)) {
        console.error(`  ${FG_RED}✘  Could not locate ${tokensPath}. To create one, run \`npx cobalt init\`.${RESET}`);
        process.exit(1);
      }

      let rawSchema = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));
      console.log(`${UNDERLINE}${fileURLToPath(tokensPath)}${RESET}`);
      const {errors, warnings} = parse(rawSchema); // will throw if errors
      if (errors || warnings) {
        printErrors(errors);
        printWarnings(warnings);
        process.exit(1);
      }
      console.log(`  ${FG_GREEN}✔${RESET}  no errors`);
      break;
    }
    case 'init': {
      if (fs.existsSync(config.tokens)) throw new Error(`${config.tokens} already exists`);
      fs.cpSync(new URL('../tokens-example.json', import.meta.url), new URL(config.tokens, cwd));
      console.log(`  ${FG_GREEN}✔${RESET} ${config.tokens} created`);
      break;
    }
    default:
      showHelp();
  }

  console.info(`  Done  ${time(start)}`);
  process.exit(0);
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
    check [path]    Check tokens.json for errors

  [options]
    --help         Show this message
    --config, -c   Path to config (default: ./tokens.config.js)
`);
}

/** resolve config */
function resolveConfig(filename) {
  // --config [configpath]
  if (filename) {
    const configPath = new URL(filename, cwd);
    if (fs.existsSync(configPath)) return configPath;
    return undefined;
  }

  // default: tokens.config.js
  for (const defaultFilename of ['./tokens.config.js', './tokens.config.mjs']) {
    const configPath = new URL(defaultFilename, cwd);
    if (fs.existsSync(configPath)) return configPath;
  }
}

/** load config */
async function loadConfig(configPath) {
  let userConfig = {};
  if (configPath) userConfig = (await import(configPath instanceof URL ? fileURLToPath(configPath) : configPath)).default;
  return await initConfig(userConfig, configPath instanceof URL ? configPath : `file://${process.cwd()}/`);
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

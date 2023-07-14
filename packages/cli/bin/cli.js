#!/usr/bin/env node

/* eslint-disable no-console */

import dotenv from 'dotenv';
dotenv.config();

import {parse} from '@cobalt-ui/core';
import {DIM, FG_BLUE, FG_RED, FG_GREEN, FG_YELLOW, UNDERLINE, RESET} from '@cobalt-ui/utils';
import chokidar from 'chokidar';
import fs from 'node:fs';
import path from 'node:path';
import {performance} from 'node:perf_hooks';
import yaml from 'js-yaml';
import undici from 'undici';
import {fileURLToPath, URL} from 'node:url';
import parser from 'yargs-parser';
import {init as initConfig} from '../dist/config.js';
import {build} from '../dist/build.js';

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
  // full-run commands: build, check

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
    // if running `co check [tokens]`, don’t load config from file
    if (cmd === 'check' && args[0]) {
      console.log(args[0]);
      config = await initConfig({tokens: args[0]}, cwd);
    } else {
      config = await loadConfig(resolveConfig(configPath));
    }
  } catch (err) {
    console.error(`  ${FG_RED}✘  ${err.message || err}${RESET}`);
    process.exit(1);
  }

  switch (cmd) {
    case 'build': {
      if (!Array.isArray(config.plugins) || !config.plugins.length) {
        console.error(`  ${FG_RED}✘  No plugins defined! Add some in ${configPath || 'tokens.config.js'}${RESET}`);
        process.exit(1);
      }

      let rawSchema = await loadTokens(config.tokens);

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
        const tokenWatcher = chokidar.watch(config.tokens.map((filepath) => fileURLToPath(filepath)));
        tokenWatcher.on('change', async (filePath) => {
          try {
            rawSchema = await loadTokens(config.tokens);
            result = await build(rawSchema, config);
            if (result.errors || result.warnings) {
              printErrors(result.errors);
              printWarnings(result.warnings);
            } else {
              console.log(`${DIM}${dt.format(new Date())}${RESET} ${FG_BLUE}Cobalt${RESET} ${FG_YELLOW}${filePath}${RESET} updated ${FG_GREEN}✔${RESET}`);
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
            rawSchema = await loadTokens(config.tokens);
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
      console.error(`  ${FG_YELLOW}! "co sync" was deprecated. See https://cobalt-ui.pages.dev/docs/guides/figma`);
      process.exit(1);
      break;
    }
    case 'check': {
      console.log(`${UNDERLINE}${fileURLToPath(config.tokens[0])}${RESET}`);
      const rawSchema = await loadTokens(config.tokens);
      const {errors, warnings} = parse(rawSchema, config); // will throw if errors
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

/** load tokens */
async function loadTokens(tokenPaths) {
  const rawTokens = [];

  // download/read
  for (const filepath of tokenPaths) {
    const ext = path.extname(filepath.pathname);
    const isYAMLExt = ext === '.yaml' || ext === '.yml';
    if (filepath.protocol === 'url:') {
      try {
        const raw = await undici.fetch(filepath, {method: 'GET', headers: {Accepted: '*/*', 'User-Agent': 'cobalt'}}).then((res) => res.text());
        if (isYAMLExt || res.headers.get('content-type').includes('yaml')) {
          rawTokens.push(yaml.load(raw));
        } else {
          rawTokens.push(JSON.parse(raw));
        }
      } catch (err) {
        console.error(`  ${FG_RED}✘  ${filepath.href}: ${err}${RESET}`);
      }
    } else {
      if (fs.existsSync(filepath)) {
        try {
          const raw = fs.readFileSync(filepath, 'utf8');
          if (isYAMLExt) {
            rawTokens.push(yaml.load(raw));
          } else {
            rawTokens.push(JSON.parse(raw));
          }
        } catch (err) {
          console.error(`  ${FG_RED}✘  ${filepath.href}: ${err}${RESET}`);
        }
      } else {
        console.error(`  ${FG_RED}✘  Could not locate ${filepath}. To create one, run \`npx cobalt init\`.${RESET}`);
        process.exit(1);
      }
    }
  }

  // combine
  const tokens = {};
  for (const subtokens of rawTokens) {
    merge(tokens, subtokens);
  }

  return tokens;
}

/** Merge JSON B into A */
function merge(a, b) {
  if (Array.isArray(b)) {
    console.error(`  ${FG_RED}✘ Internal error parsing tokens file.${RESET}`); // oops
    process.exit(1);
    return;
  }
  for (const [k, v] of Object.entries(b)) {
    // overwrite if:
    // - this key doesn’t exist on a, or
    // - this is a token with a $value (don’t merge tokens! overwrite!), or
    // - this is a primitive value (it’s the user’s responsibility to merge these correctly)
    if (!(k in a) || Array.isArray(v) || typeof v !== 'object' || (typeof v === 'object' && '$value' in v)) {
      a[k] = v;
      continue;
    }
    // continue
    if (typeof v === 'object' && !Array.isArray(v)) {
      merge(a[k], v);
    }
  }
}

/** Print time elapsed */
function time(start) {
  const diff = performance.now() - start;
  return `${DIM}${diff < 750 ? `${Math.round(diff)}ms` : `${(diff / 1000).toFixed(1)}s`}${RESET}`;
}

/** Print errors */
export function printErrors(errors) {
  if (!errors || !Array.isArray(errors)) return;
  for (const err of errors) console.error(`  ${FG_RED}✘  ${err}${RESET}`);
}

/** Print warnings */
export function printWarnings(warnings) {
  if (!warnings || !Array.isArray(warnings)) return;
  for (const warn of warnings) console.warn(`  ${FG_YELLOW}!  ${warn}${RESET}`);
}

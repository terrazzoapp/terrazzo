#!/usr/bin/env node

/**
 * @module @cobalt-ui/cli
 * @license MIT License
 *
 * Copyright (c) 2021 Drew Powers
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/* eslint-disable no-console */

import dotenv from 'dotenv';
dotenv.config();

import { parse, isJSON } from '@cobalt-ui/core';
import { DIM, FG_BLUE, FG_RED, FG_GREEN, FG_YELLOW, UNDERLINE, RESET } from '@cobalt-ui/utils';
import chokidar from 'chokidar';
import { parse as parseYAML } from 'yaml';
import fs from 'node:fs';
import { performance } from 'node:perf_hooks';
import parseJSON from 'parse-json';
import { fileURLToPath, URL } from 'node:url';
import parser from 'yargs-parser';
import build from '../dist/build.js';
import { init as initConfig } from '../dist/config.js';
import lint from '../dist/lint.js';
import convert from '../dist/convert.js';

const [, , cmd, ...args] = process.argv;
const cwd = new URL(`file://${process.cwd()}/`);

const flags = parser(args, {
  boolean: ['help', 'watch', 'version'],
  string: ['config', 'out'],
  alias: {
    config: ['c'],
    out: ['o'],
    version: ['v'],
    watch: ['w'],
  },
});

/** `tokens` CLI command */
export default async function main() {
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
    const { version } = parseJSON(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
    console.log(version);
    process.exit(0);
  }

  // ---
  // full-run commands: build, check

  // setup: load tokens.config.js and tokens.config.json
  let configPath;
  if (typeof flags.config === 'string') {
    if (flags.config === '') {
      printErrors('Missing path after --config flag');
      process.exit(1);
    }
    configPath = resolveConfig(flags.config);
  }
  let config;
  try {
    // if running `co check [tokens]`, don’t load config from file
    if (cmd === 'check' && args[0]) {
      config = await initConfig({ tokens: args[0] }, cwd);
    } else if (cmd === 'lint') {
      config = await loadConfig(
        resolveConfig(configPath),
        args[0]
          ? {
              // override config.tokens if passed as CLI arg
              tokens: args[0],
            }
          : undefined,
      );
    } else {
      config = await loadConfig(resolveConfig(configPath));
    }
  } catch (err) {
    printErrors(err.message || err);
    process.exit(1);
  }

  switch (cmd) {
    case 'build': {
      if (!Array.isArray(config.plugins) || !config.plugins.length) {
        printErrors(`✘  No plugins defined! Add some in ${configPath || 'tokens.config.js'}`);
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
      if (result.errors) {
        process.exit(1);
      }

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
        await new Promise(() => {});
      } else {
        console.log(`  ${FG_GREEN}✔${RESET}  ${result.result.tokens.length} token${result.result.tokens.length != 1 ? 's' : ''} built ${time(start)}`);
      }
      break;
    }
    case 'bundle': {
      if (config.tokens.length < 2) {
        printErrors(`co bundle requires multiple inputs, but only found ${config.tokens.length} files in config.`);
        process.exit(1);
      }
      if (!flags.out) {
        printErrors(`--out [file] is required to save bundle`);
        process.exit(1);
      }

      const tokens = await loadTokens(config.tokens);

      const resolvedOut = new URL(flags.out, cwd);
      fs.mkdirSync(new URL('.', resolvedOut), { recursive: true });

      const isYAML = resolvedOut.pathname.toLowerCase().endsWith('.yaml') || resolvedOut.pathname.toLowerCase().endsWith('.yml');
      fs.writeFileSync(resolvedOut, isYAML ? yaml.dump(tokens) : JSON.stringify(tokens, undefined, 2));
      console.log(`  ${FG_GREEN}✔${RESET} Bundled ${config.tokens.length} schemas ${time(start)}`);
      break;
    }
    case 'convert': {
      if (!args[0]) {
        printErrors(`Expected format "co convert [input] --out [output]"`);
        process.exit(1);
      }
      if (!fs.existsSync(new URL(args[0], cwd))) {
        printErrors(`Could not find "${args[0]}". Does the file exist?`);
        process.exit(1);
      }
      if (!flags.out) {
        printErrors(`--out [file] is required to convert`);
        process.exit(1);
      }

      const input = parseJSON(fs.readFileSync(new URL(args[0], cwd), 'utf8'));
      const { errors, warnings, result } = await convert(input);
      if (errors) {
        printErrors(errors);
        process.exit(1);
      }
      if (warnings) {
        printWarnings(warnings);
      }
      console.log(`  ${FG_GREEN}✔${RESET}  converted ${args[0]} → ${flags.out} ${time(start)}`);
      fs.writeFileSync(new URL(flags.out, cwd), JSON.stringify(result, undefined, 2));

      break;
    }
    case 'sync': {
      printWarnings('"co sync" was deprecated. See https://cobalt-ui.pages.dev/docs/guides/figma');
      process.exit(1);
      break;
    }
    case 'check': {
      const rawSchema = await loadTokens(config.tokens);
      const filepath = config.tokens[0];
      console.log(`${UNDERLINE}${filepath.protocol === 'file:' ? fileURLToPath(filepath) : filepath}${RESET}`);
      const { errors, warnings } = parse(rawSchema, config); // will throw if errors
      if (errors || warnings) {
        printErrors(errors);
        printWarnings(warnings);
        process.exit(1);
      }
      console.log(`  ${FG_GREEN}✔${RESET}  no errors ${time(start)}`);
      break;
    }
    case 'lint': {
      if (!Array.isArray(config.plugins) || !config.plugins.length) {
        printErrors(`✘  No plugins defined! Add some in ${configPath || 'tokens.config.js'}`);
        process.exit(1);
      }

      const rawSchema = await loadTokens(config.tokens);
      const parseResult = parse(rawSchema, config); // will throw if errors

      if (parseResult.errors) {
        printErrors(parseResult.errors);
        printWarnings(parseResult.warnings);
        process.exit(1);
      }
      if (parseResult.warnings) {
        printWarnings(parseResult.warnings);
      }
      const lintResult = await lint({ config, tokens: parseResult.result.tokens, rawSchema, warnIfNoPlugins: true });
      if (lintResult.errors) {
        printErrors(lintResult.errors);
        printWarnings(lintResult.warnings);
        process.exit(1);
      }
      if (lintResult.warnings) {
        printWarnings(lintResult.warnings);
      } else {
        console.log(`  ${FG_GREEN}✔${RESET}  all checks passed ${time(start)}`);
      }
      break;
    }
    case 'init': {
      if (fs.existsSync(config.tokens)) {
        throw new Error(`${config.tokens} already exists`);
      }
      fs.cpSync(new URL('../tokens-example.json', import.meta.url), new URL(config.tokens, cwd));
      console.log(`  ${FG_GREEN}✔${RESET} ${config.tokens} created ${time(start)}`);
      break;
    }
    default: {
      showHelp();
      break;
    }
  }

  // done
  process.exit(0);
}

main();

/** Show help */
function showHelp() {
  console.log(`cobalt
  [commands]
    build           Build token artifacts from tokens.json
      --watch, -w   Watch tokens.json for changes and recompile
      --no-lint     Disable linters running on build
    check [path]    Check tokens.json for syntax errors
    lint [path]     Run linters
    init            Create a starter tokens.json file
    bundle          Combine multiple tokens schemas into one
      --out [path]  Specify bundled tokens.json output
    convert [file]  Convert Style Dictionary format to DTCG
      --out [path]  Specify converted tokens.json output

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
    if (fs.existsSync(configPath)) {
      return configPath;
    }
    return undefined;
  }

  // default: tokens.config.js
  for (const defaultFilename of ['./tokens.config.js', './tokens.config.mjs']) {
    const configPath = new URL(defaultFilename, cwd);
    if (fs.existsSync(configPath)) {
      return configPath;
    }
  }
}

/** load config */
async function loadConfig(configPath, overrides) {
  let userConfig = {};
  if (configPath) {
    userConfig = (await import(configPath)).default;
  }
  if (overrides) {
    merge(userConfig ?? {}, overrides);
  }
  return await initConfig(userConfig, configPath instanceof URL ? configPath : `file://${process.cwd()}/`);
}

/** load tokens */
async function loadTokens(tokenPaths) {
  const rawTokens = [];

  // download/read
  for (const filepath of tokenPaths) {
    const pathname = filepath.pathname.toLowerCase();
    const isYAMLExt = pathname.endsWith('.yaml') || pathname.endsWith('.yml');
    if (filepath.protocol === 'http:' || filepath.protocol === 'https:') {
      try {
        // if Figma URL
        if (filepath.host === 'figma.com' || filepath.host === 'www.figma.com') {
          const [_, fileKeyword, fileKey] = filepath.pathname.split('/');
          if (fileKeyword !== 'file' || !fileKey) {
            printErrors(`Unexpected Figma URL. Expected "https://www.figma.com/file/:file_key/:file_name?…", received "${filepath.href}"`);
            process.exit(1);
          }
          const headers = new Headers({ Accept: '*/*', 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:123.0) Gecko/20100101 Firefox/123.0' });
          if (process.env.FIGMA_ACCESS_TOKEN) {
            headers.set('X-FIGMA-TOKEN', process.env.FIGMA_ACCESS_TOKEN);
          } else {
            printWarnings(`FIGMA_ACCESS_TOKEN not set`);
          }
          const res = await fetch(`https://api.figma.com/v1/files/${fileKey}/variables/local`, { method: 'GET', headers });
          if (res.ok) {
            const data = await res.json();
            rawTokens.push(data.meta);
            continue;
          }
          const message = res.status !== 404 ? JSON.stringify(await res.json(), undefined, 2) : '';
          printErrors(`Figma responded with ${res.status}${message ? `:\n${message}` : ''}`);
          process.exit(1);
          break;
        }

        // otherwise, expect YAML/JSON
        const res = await fetch(filepath, { method: 'GET', headers: { Accept: '*/*', 'User-Agent': 'Mozilla/5.0 Gecko/20100101 Firefox/123.0' } });
        const raw = await res.text();
        // if the 1st character is '{', it’s JSON (“if it’s dumb but it works…”)
        if (isJSON(raw)) {
          rawTokens.push(parseJSON(raw));
        } else {
          rawTokens.push(parseYAML(raw));
        }
      } catch (err) {
        printErrors(`${filepath.href}: ${err}`);
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
          printErrors(`${filepath.href}: ${err}`);
        }
      } else {
        printErrors(`Could not locate ${filepath}. To create one, run \`npx cobalt init\`.`);
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
    printErrors('Internal error parsing tokens file.'); // oops
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
  if (!errors || (typeof errors !== 'string' && !Array.isArray(errors))) {
    return;
  }
  for (const err of Array.isArray(errors) ? errors : [errors]) {
    console.error(`  ${FG_RED}✘  ${err}${RESET}`);
  }
}

/** Print warnings */
export function printWarnings(warnings) {
  if (!warnings || (typeof warnings !== 'string' && !Array.isArray(warnings))) {
    return;
  }
  for (const warn of Array.isArray(warnings) ? warnings : [warnings]) {
    console.warn(`  ${FG_YELLOW}!  ${warn}${RESET}`);
  }
}

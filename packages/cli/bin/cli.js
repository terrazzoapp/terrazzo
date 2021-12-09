#!/usr/bin/env node

/* eslint-disable no-console */

import dotenv from 'dotenv';
dotenv.config();

import { Builder, ConfigLoader, parse, Validator } from '@cobalt-ui/core';
import chokidar from 'chokidar';
import fs from 'fs';
import * as color from 'kleur/colors';
import { performance } from 'perf_hooks';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';
import loadFigma from '../dist/figma/index.js';

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
  const configI = args.findIndex((arg) => arg.toLowerCase() === '-c' || arg.toLowerCase() === '--config');
  if (configI !== -1 && !args[configI + 1]) throw new Error(`Missing path after --config flag`);
  const configLoader = new ConfigLoader(configI > 0 ? args[configI + 1] : undefined);
  const config = await configLoader.load();

  // init
  if (cmd === 'init') {
    if (fs.existsSync(config.tokens)) throw new Error(`${config.tokens} already exists`);
    fs.writeFileSync(config.tokens, fs.readFileSync(new URL('../tokens-example.yaml', import.meta.env)));
    console.log(`  ${color.green('✔')} ${config.tokens} created`);
    process.exit(0);
  }

  // ---
  // full-run commands: build, sync, validate

  // load tokens.yaml
  if (!fs.existsSync(config.tokens)) throw new Error(`Could not locate ${fileURLToPath(config.tokens)}. To create one, run \`cobalt init\`.`);
  let rawSchema = fs.readFileSync(config.tokens, 'utf8');
  let schema = parse(fs.readFileSync(config.tokens));

  // validate config
  const validator = new Validator();
  const { errors, warnings } = await validator.validate(schema);

  switch (cmd) {
    case 'build': {
      if (errors) {
        printErrors({ errors, warnings });
        process.exit(1);
      }

      const dt = new Intl.DateTimeFormat('en-us', { hour: '2-digit', minute: '2-digit' });

      let watch = args.includes('-w') || args.includes('--watch');

      const builder = new Builder({ config, schema });
      await builder.build();

      if (watch) {
        const watcher = chokidar.watch(fileURLToPath(config.tokens));
        const tokensYAML = config.tokens.href.replace(new URL(`file://${process.cwd()}/`).href, '');
        watcher.on('change', async (filePath) => {
          try {
            let newRawSchema = fs.readFileSync(filePath, 'utf8');
            if (newRawSchema === rawSchema) return;
            rawSchema = newRawSchema;
            schema = parse(rawSchema);
            const { errors: watchErrors, warnings: watchWarnings } = await validator.validate(schema);
            if (watchErrors) {
              printErrors({ errors: watchErrors, warnings: watchWarnings });
              return;
            }
            await builder.build();
            printErrors({ warnings: watchWarnings });
            console.log(`${color.dim(dt.format(new Date()))} ${color.blue('Cobalt')} ${color.yellow(tokensYAML)} updated ${color.green('✔')}`);
          } catch (err) {
            console.error(err);
          }
        });
        // keep process occupied
        await new Promise(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function
      }

      printErrors({ errors, warnings });
      break;
    }
    case 'sync': {
      const tokens = await loadFigma(config);
      for (const [k, v] of Object.entries(tokens)) {
        let node = schema;
        const parts = k.split('.');
        while (parts.length) {
          const next = parts.shift();
          if (node.type === 'group' || node.tokens) {
            const isFinalToken = parts.length === 0;
            if (node.tokens[next]) {
              if (isFinalToken) {
                node.tokens[next].type = v.type || 'token';
                for (const [mode, value] of Object.entries(v.value)) {
                  node.tokens[next].value[mode] = value;
                }
                break;
              } else {
                node = node.tokens[next];
                continue;
              }
            } else {
              if (isFinalToken) {
                node.tokens[next] = { type: v.type || 'token', value: v.value };
                break;
              } else {
                node.tokens[next] = { type: 'group', tokens: {} };
              }
              node = node.tokens[next];
              continue;
            }
          }
          if (parts.length > 1) throw new Error(`Cannot create group "${next}" inside a token (${k})`);
          for (const [mode, value] of Object.entries(v)) {
            node.value[mode] = value;
          }
        }
      }

      fs.writeFileSync(config.tokens, yaml.dump(schema));
      console.log(`  ${color.green('✔')} Tokens updated from Figma`);
      break;
    }
    case 'validate': {
      console.log(color.underline(fileURLToPath(filePath)));

      if (!errors && !warnings) {
        console.log(`  ${color.green('✔')}  no errors`);
      }
      printErrors({ errors, warnings });

      if (errors) {
        process.exit(1);
      }
      break;
    }
    default:
      showHelp();
  }

  console.info(`  Done  ${time(start)}`);
}

main();

/** Print errors & warnings */
function printErrors({ errors, warnings }) {
  if (errors) {
    for (const error of errors) {
      console.error(`  ${error}`);
    }
  }

  if (warnings) {
    for (const warning of warnings) {
      console.warn(`  ${warning}`);
    }
  }
}

/** Show help */
function showHelp() {
  console.log(`cobalt
  [commands]
    build           Build token artifacts from tokens.yaml
      --watch, -w   Watch tokens.yaml for changes and recompile
    sync            Sync tokens.yaml with Figma
    init            Create a starter tokens.yaml file
    validate        Validate tokens.yaml

  [options]
    --help         Show this message
    --config, -c   Path to config (default: ./cobalt.config.js)
`);
}

/** Print time elapsed */
function time(start) {
  const diff = performance.now() - start;
  return color.dim(`${diff < 750 ? `${Math.round(diff)}ms` : `${(diff / 1000).toFixed(1)}s`}`);
}

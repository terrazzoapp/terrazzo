#!/usr/bin/env node

/* eslint-disable no-console */

import { Builder, ConfigLoader, parse, Validator } from '@cobalt-ui/core';
import fs from 'fs';
import * as color from 'kleur/colors';
import { performance } from 'perf_hooks';
import { fileURLToPath } from 'url';

const [, , cmd, ...args] = process.argv;

/** `tokens` CLI command */
async function main() {
  const start = performance.now();

  if (args.includes('--help')) {
    showHelp();
    return;
  }

  // load config
  const configI = args.findIndex((arg) => arg.toLowerCase() === '-c' || arg.toLowerCase() === '--config');
  if (configI !== -1 && !args[configI + 1]) throw new Error(`Missing path after --config flag`);
  const configLoader = new ConfigLoader(configI > 0 ? args[configI + 1] : undefined);
  const config = await configLoader.load();

  // load tokens.yaml
  if (!fs.existsSync(config.tokens)) throw new Error(`Could not locate ${fileURLToPath(config.tokens)}`);
  const manifest = parse(fs.readFileSync(config.tokens));

  // validate config
  const validator = new Validator(manifest);
  const { errors, warnings } = await validator.validate();

  switch (cmd) {
    case 'build': {
      if (errors) {
        printErrors({ errors, warnings });
        process.exit(1);
      }

      const builder = new Builder({ config, manifest });
      await builder.build();

      printErrors({ errors, warnings });
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
    build       Build token artifacts from tokens.yaml
    validate    Validate tokens.yaml

  [options]
    --help      Show this message
    --config    Path to config (default: ./cobalt.config.js)
`);
}

/** Print time elapsed */
function time(start) {
  const diff = performance.now() - start;
  return color.dim(`${diff < 750 ? `${Math.round(diff)}ms` : `${(diff / 1000).toFixed(1)}s`}`);
}

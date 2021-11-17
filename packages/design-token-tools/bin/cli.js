#!/usr/bin/env node

/* eslint-disable no-console */

import * as color from 'kleur/colors';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { performance } from 'perf_hooks';
import load from '../dist/load.js';
import Validator from '../dist/validate.js';

const [, , cmd, ...args] = process.argv;

/** `tokens` CLI command */
async function main() {
  let configName = 'tokens.config.js';
  let config;
  const configI = args.findIndex((arg) => arg === '-c' || arg === '--config');
  if (configI !== -1) {
    configName = args[config + 1];
    if (!configName) throw new Error(`Must provide path to config (ex: --config tokens.config.js)`);
    if (!fs.existsSync(configName)) throw new Error(`Could not locate ${configName} in ${process.cwd()}`);
    config = await import(configName);
  }

  switch (cmd) {
    case 'build': {
      break;
    }
    case 'validate': {
      const start = performance.now();
      let [filename] = args;
      let filePath;
      if (filename) {
        if (fs.existsSync(filename)) filePath = new URL(filename, `file://${process.cwd()}/`);
        else throw new Error(`Could not locate ${filename}`);
      } else {
        for (const f of ['tokens.yaml', 'tokens.yml']) {
          if (fs.existsSync(f)) {
            filename = f;
            filePath = new URL(f, `file://${process.cwd()}/`);
            break;
          }
        }
        if (!filePath) throw new Error(`Could not locate tokens.yaml in ${process.cwd()}. Try \`tokens validate path/to/tokens.yaml\``);
      }

      const validator = new Validator(load(filePath));
      const { errors, warnings } = await validator.validate();

      console.log(color.underline(fileURLToPath(filePath)));

      if (!errors && !warnings) {
        console.log(`  ${color.green('✔')}  no errors`);
      }

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

      console.info(`  Done  ${time(start)}`);

      if (errors) process.exit(1);
      break;
    }
  }
}
main();

/** Print time elapsed */
function time(start) {
  const diff = performance.now() - start;
  return color.dim(`${diff < 750 ? `${Math.round(diff)}ms` : `${(diff / 1000).toFixed(1)}s`}`);
}

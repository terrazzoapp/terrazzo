#!/usr/bin/env node

/* eslint-disable no-console */

import { Builder, ConfigLoader, parse, Validator } from '@cobalt-ui/core';
import chokidar from 'chokidar';
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

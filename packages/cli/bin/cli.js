#!/usr/bin/env node

/**
 * @module @terrazzo/cli
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

import fs from 'node:fs';
import { createRequire } from 'node:module';
import { parseArgs } from 'node:util';
import { Logger } from '@terrazzo/parser';
import {
  buildCmd,
  checkCmd,
  helpCmd,
  importCmd,
  initCmd,
  labCmd,
  loadConfig,
  normalizeCmd,
  versionCmd,
} from '../dist/index.js';

const require = createRequire(process.cwd());

// Load .env file into process.env
for (const envFile of ['.env', 'production.env', 'development.env']) {
  if (fs.existsSync(envFile)) {
    process.loadEnvFile(envFile);
    break;
  }
}

const [, , ...argsRaw] = process.argv;
const { values: flags, positionals } = parseArgs({
  args: argsRaw,
  strict: true,
  allowPositionals: true,
  options: {
    config: { type: 'string', short: 'c' },
    output: { type: 'string', short: 'o' },
    help: { type: 'boolean' },
    silent: { type: 'boolean' },
    quiet: { type: 'boolean' }, // secret alias for --silent because I can’t remember it
    watch: { type: 'boolean', short: 'w' },
    version: { type: 'boolean' },
    unpublished: { type: 'boolean' },
    'skip-styles': { type: 'boolean' },
    'skip-variables': { type: 'boolean' },
    'font-family-names': { type: 'string' },
    'font-weight-names': { type: 'string' },
    'number-names': { type: 'string' },
  },
});

// Note: there are 2 types of logging in the CLI. The logger passed to the
// parser will provide shared configuration for all methods, but it will throw
// Errors because it’s expected to run in a generic JS context (process.exit
// won’t always be available).
//
// However, in a CLI, errors are more numerous and expected, and users are
// likely to see multiple at once. We want to remove stacktraces just for the
// CLI context. So we wrap this logger with our own formatter that simply prints
// the raw message.
let logLevel;
if (flags.silent || flags.quiet) {
  logLevel = 'error';
} else if (process.env.DEBUG) {
  logLevel = 'debug';
}
const logger = new Logger({
  // set correct level of debugging
  level: logLevel,
  // add debug messages, if requested
  debugScope: process.env.DEBUG,
});

export default async function main() {
  const cmd = positionals[0];

  // ---
  // Half-run commands: --help, --version, init

  // --version
  if (flags.version) {
    versionCmd();
    process.exit(0);
  }

  // --help
  if (flags.help || !cmd) {
    helpCmd();
    process.exit(0);
  }

  // normalize
  if (cmd === 'normalize') {
    await normalizeCmd(positionals[1], { logger, output: flags.output });
    process.exit(0);
  }
  // import
  if (cmd === 'import') {
    await importCmd({ flags, logger, positionals });
    process.exit(0);
  }

  const { config, configPath } = await loadConfig({ cmd, flags, logger });

  // ---
  // Full-run commands: build, check, lint
  switch (cmd) {
    case 'build': {
      await buildCmd({ config, configPath, flags, logger });
      break;
    }
    case 'check':
    case 'lint': {
      await checkCmd({ config, logger, positionals });
      break;
    }
    case 'init': {
      await initCmd({ config, flags, logger });
      break;
    }

    case 'lab': {
      try {
        require.resolve('@terrazzo/token-lab');
        await labCmd({ config, configPath, flags, logger });
      } catch {
        console.error('Install @terrazzo/token-lab and try again.');
        process.exit(1);
      }
      break;
    }
    default: {
      helpCmd();
      break;
    }
  }

  // done
  process.exit(0);
}

await main();

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

import { parse, build } from '@terrazzo/parser';
import chokidar from 'chokidar';
import dotenv from 'dotenv';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import pc from 'picocolors';
import parser from 'yargs-parser';

dotenv.config();

const [, , cmd, ...args] = process.argv;
const cwd = new URL(`file://${process.cwd()}/`);

const GREEN_CHECK = pc.green('✔');

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
    config = (await import(resolveConfig(configPath))).default;
  } catch (err) {
    printErrors(err.message || err);
    process.exit(1);
  }

  switch (cmd) {
    case 'build': {
      if (!Array.isArray(config.plugins) || !config.plugins.length) {
        printErrors(`No plugins defined! Add some in ${configPath || 'terrazzo.config.js'}`);
        process.exit(1);
      }

      let rawSchema = await loadTokens(config.tokens);

      const dt = new Intl.DateTimeFormat('en-us', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const watch = args.includes('-w') || args.includes('--watch');

      let { tokens, ast } = await parse(rawSchema, { config });
      let result = await build(tokens, { ast, config });
      writeFiles(result, config);

      printErrors(result.errors);
      printWarnings(result.warnings);

      if (watch) {
        const tokenWatcher = chokidar.watch(config.tokens.map((filepath) => fileURLToPath(filepath)));
        tokenWatcher.on('change', async (filePath) => {
          try {
            rawSchema = await loadTokens(config.tokens);
            const parseResult = await parse(tokens, { config });
            tokens = parseResult.tokens;
            ast = parseResult.ast;
            result = await build(tokens, { ast, config });
            console.log(
              `${pc.dim(dt.format(new Date()))} ${pc.green('Tz')}} ${pc.yellow(filePath)} updated ${GREEN_CHECK}`,
            );
          } catch (err) {
            printErrors([err.message || err]);
          }
        });
        const configWatcher = chokidar.watch(fileURLToPath(resolveConfig(configPath)));
        configWatcher.on('change', async (filePath) => {
          try {
            console.log(
              `${pc.dim(dt.format(new Date()))} ${pc.green('Tz')} ${pc.yellow('Config updated. Reloading…')}`,
            );
            config = (await import(filePath)).default;
            rawSchema = await loadTokens(config.tokens);
            const parseResult = await parse(tokens, { config });
            tokens = parseResult.tokens;
            ast = parseResult.ast;
            result = await build(tokens, { ast, config });
            writeFiles(result, config);
          } catch (err) {
            printErrors([err.message || err]);
          }
        });

        // keep process occupied
        await new Promise(() => {});
      } else {
        printSuccess(
          `${Object.keys(tokens).length} token${Object.keys(tokens).length !== 1 ? 's' : ''} built ${time(start)}`,
        );
      }
      break;
    }
    case 'check': {
      const rawSchema = await loadTokens(config.tokens);
      const filepath = config.tokens[0];
      console.log(pc.underline(filepath.protocol === 'file:' ? fileURLToPath(filepath) : filepath));
      const { errors, warnings } = parse(rawSchema, config); // will throw if errors
      if (errors || warnings) {
        printErrors(errors);
        printWarnings(warnings);
        process.exit(1);
      }
      printSuccess(`no errors ${time(start)}`);
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
        printSuccess(`all checks passed ${time(start)}`);
      }
      break;
    }
    case 'init': {
      if (fs.existsSync(config.tokens)) {
        throw new Error(`${config.tokens} already exists`);
      }
      fs.cpSync(new URL('../tokens-example.json', import.meta.url), new URL(config.tokens, cwd));
      printSuccess(`${config.tokens} created ${time(start)}`);
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
  console.log(`tz
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

/** load tokens */
async function loadTokens(tokenPaths) {
  // TODO: allow merging of tokens

  // download/read
  for (const filepath of tokenPaths) {
    const pathname = filepath.pathname.toLowerCase();
    if (filepath.protocol === 'http:' || filepath.protocol === 'https:') {
      try {
        // if Figma URL
        if (filepath.host === 'figma.com' || filepath.host === 'www.figma.com') {
          const [_, fileKeyword, fileKey] = filepath.pathname.split('/');
          if (fileKeyword !== 'file' || !fileKey) {
            printErrors(
              `Unexpected Figma URL. Expected "https://www.figma.com/file/:file_key/:file_name?…", received "${filepath.href}"`,
            );
            process.exit(1);
          }
          const headers = new Headers({
            Accept: '*/*',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:123.0) Gecko/20100101 Firefox/123.0',
          });
          if (process.env.FIGMA_ACCESS_TOKEN) {
            headers.set('X-FIGMA-TOKEN', process.env.FIGMA_ACCESS_TOKEN);
          } else {
            printWarnings('FIGMA_ACCESS_TOKEN not set');
          }
          const res = await fetch(`https://api.figma.com/v1/files/${fileKey}/variables/local`, {
            method: 'GET',
            headers,
          });
          if (res.ok) {
            return await res.text();
          }
          const message = res.status !== 404 ? JSON.stringify(await res.json(), undefined, 2) : '';
          printErrors(`Figma responded with ${res.status}${message ? `:\n${message}` : ''}`);
          process.exit(1);
          break;
        }

        // otherwise, expect YAML/JSON
        const res = await fetch(filepath, {
          method: 'GET',
          headers: { Accept: '*/*', 'User-Agent': 'Mozilla/5.0 Gecko/20100101 Firefox/123.0' },
        });
        return await res.text();
      } catch (err) {
        printErrors(`${filepath.href}: ${err}`);
      }
    } else {
      if (fs.existsSync(filepath)) {
        return fs.readFileSync(filepath, 'utf8');
      } else {
        printErrors(`Could not locate ${filepath}. To create one, run \`npx cobalt init\`.`);
        process.exit(1);
      }
    }
  }
}

/** resolve config */
function resolveConfig(filename) {
  // --config [configpath]
  if (filename) {
    const configPath = new URL(filename, cwd);
    if (fs.existsSync(configPath)) {
      return fileURLToPath(configPath);
    }
    return undefined;
  }

  // default: terrazzo.config.js
  for (const defaultFilename of ['./terrazzo.config.js', './terrazzo.config.mjs']) {
    const configPath = new URL(defaultFilename, cwd);
    if (fs.existsSync(configPath)) {
      return fileURLToPath(configPath);
    }
  }
}

/** Print time elapsed */
function time(start) {
  const diff = performance.now() - start;
  return pc.dim(diff < 750 ? `${Math.round(diff)}ms` : `${(diff / 1000).toFixed(1)}s`);
}

/** Print success */
export function printSuccess(message) {
  console.log(`  ${GREEN_CHECK}  ${message}`);
}

/** Print errors */
export function printErrors(errors) {
  if (!errors || (typeof errors !== 'string' && !Array.isArray(errors))) {
    return;
  }
  for (const err of Array.isArray(errors) ? errors : [errors]) {
    console.error(`  ${pc.red(`✘  ${err}`)}`);
  }
}

/** Print warnings */
export function printWarnings(warnings) {
  if (!warnings || (typeof warnings !== 'string' && !Array.isArray(warnings))) {
    return;
  }
  for (const warn of Array.isArray(warnings) ? warnings : [warnings]) {
    console.warn(`  ${pc.yellow(`!  ${warn}`)}`);
  }
}

/** Write files */
export function writeFiles(result, config) {
  for (const { filename, contents } of result.outputFiles) {
    const filepath = new URL(filename, config.outDir);
    fs.mkdirSync(new URL('.', filepath), { recursive: true });
    fs.writeFileSync(filepath, contents);
  }
}

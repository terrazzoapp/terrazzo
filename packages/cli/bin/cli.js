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

import { parse, build, defineConfig } from '@terrazzo/parser';
import chokidar from 'chokidar';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
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
  let config = { tokens: [new URL('./tokens.json', cwd)], outDir: new URL('./tokens/', cwd), plugins: [] };
  const resolvedConfigPath = resolveConfig(configPath);
  if (resolvedConfigPath) {
    try {
      const mod = await import(resolvedConfigPath);
      if (!mod.default) {
        printErrors(
          `No default export found in ${path.relative(fileURLToPath(cwd), resolvedConfigPath)}. See https://terrazzo.dev/docs/cli for instructions.`,
        );
        process.exit(1);
      }
      config = defineConfig(mod.default, { cwd });
    } catch (err) {
      printErrors(err.message || err);
      process.exit(1);
    }
  } else if (cmd !== 'init' && cmd !== 'check') {
    printErrors('No config file found. Create one with `npx terrazzo init`.');
    process.exit(1);
  }

  switch (cmd) {
    case 'build': {
      if (!Array.isArray(config.plugins) || !config.plugins.length) {
        printErrors(`No plugins defined! Add some in ${configPath || 'terrazzo.config.js'}`);
        process.exit(1);
      }

      let rawSchemas = await loadTokens(config.tokens);

      const watch = args.includes('-w') || args.includes('--watch');

      let { tokens, ast } = await parse(rawSchemas, { config });
      let result = await build(tokens, { ast, config });
      writeFiles(result, config);

      printErrors(result.errors);
      printWarnings(result.warnings);

      if (watch) {
        const dt = new Intl.DateTimeFormat('en-us', {
          hour: '2-digit',
          minute: '2-digit',
        });
        const tokenWatcher = chokidar.watch(config.tokens.map((filename) => fileURLToPath(filename)));
        tokenWatcher.on('change', async (filename) => {
          try {
            rawSchemas = await loadTokens(config.tokens);
            const parseResult = await parse(rawSchemas, { config });
            tokens = parseResult.tokens;
            ast = parseResult.ast;
            result = await build(tokens, { ast, config });
            console.log(
              `${pc.dim(dt.format(new Date()))} ${pc.green('Tz')}} ${pc.yellow(filename)} updated ${GREEN_CHECK}`,
            );
          } catch (err) {
            printErrors([err.message || err]);
          }
        });
        const configWatcher = chokidar.watch(resolveConfig(configPath));
        configWatcher.on('change', async (filename) => {
          try {
            console.log(
              `${pc.dim(dt.format(new Date()))} ${pc.green('Tz')} ${pc.yellow('Config updated. Reloading…')}`,
            );
            config = (await import(filename)).default;
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
      const rawSchemas = await loadTokens(flags._[0] ? [resolveTokenPath(flags._[0])] : config.tokens);
      const filename = flags._[0] || config.tokens[0];
      console.log(pc.underline(filename.protocol === 'file:' ? fileURLToPath(filename) : filename));
      await parse(rawSchemas, { config, continueOnError: true }); // will throw if errors
      printSuccess(`No errors ${time(start)}`);
      break;
    }
    case 'lint': {
      if (!Array.isArray(config.plugins) || !config.plugins.length) {
        printErrors(`No plugins defined! Add some in ${configPath || 'tokens.config.js'}`);
        process.exit(1);
      }

      const rawSchema = await loadTokens(flags._[0] ? [resolveTokenPath(flags._[0])] : config.tokens);
      const parseResult = await parse(rawSchema, { config, continueOnError: true }); // will throw if errors

      // TODO

      break;
    }
    case 'init': {
      if (
        !fs.existsSync(new URL('./terrazzo.config.js', cwd)) &&
        !fs.existsSync(new URL('./terrazzo.config.mjs', cwd)) &&
        !fs.existsSync(new URL('./terrazzo.config.cjs', cwd))
      ) {
        fs.cpSync(new URL('../terrazzo.config.js', import.meta.url), new URL('./terrazzo.config.js', cwd));
        printSuccess('terrazzo.config.js created');
      }
      if (!fs.existsSync(config.tokens[0])) {
        fs.cpSync(new URL('../tokens-example.json', import.meta.url), new URL(config?.tokens, cwd));
        printSuccess(`${config.tokens} created ${time(start)}`);
      }
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
    --help          Show this message
    --config, -c    Path to config (default: ./tokens.config.js)
`);
}

/** load tokens */
async function loadTokens(tokenPaths) {
  const allTokens = [];

  if (!Array.isArray(tokenPaths)) {
    printErrors(`loadTokens: Expected array, received ${typeof tokenPaths}`);
    process.exit(1);
  }

  // download/read
  for (let i = 0; i < tokenPaths.length; i++) {
    const filename = tokenPaths[i];

    if (!(filename instanceof URL)) {
      printErrors(`loadTokens[${i}]: Expected URL, received ${filename}`);
      process.exit(1);
    }

    if (filename.protocol === 'http:' || filename.protocol === 'https:') {
      try {
        // if Figma URL
        if (filename.host === 'figma.com' || filename.host === 'www.figma.com') {
          const [_, fileKeyword, fileKey] = filename.pathname.split('/');
          if (fileKeyword !== 'file' || !fileKey) {
            printErrors(
              `Unexpected Figma URL. Expected "https://www.figma.com/file/:file_key/:file_name?…", received "${filename.href}"`,
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
            allTokens.push({ filename, src: await res.text() });
          }
          const message = res.status !== 404 ? JSON.stringify(await res.json(), undefined, 2) : '';
          printErrors(`Figma responded with ${res.status}${message ? `:\n${message}` : ''}`);
          process.exit(1);
          break;
        }

        // otherwise, expect YAML/JSON
        const res = await fetch(filename, {
          method: 'GET',
          headers: { Accept: '*/*', 'User-Agent': 'Mozilla/5.0 Gecko/20100101 Firefox/123.0' },
        });
        allTokens.push({ filename, src: await res.text() });
      } catch (err) {
        printErrors(`${filename.href}: ${err}`);
      }
    } else {
      if (fs.existsSync(filename)) {
        allTokens.push({ filename, src: fs.readFileSync(filename, 'utf8') });
      } else {
        printErrors(
          `Could not locate ${path.relative(fileURLToPath(cwd), fileURLToPath(filename))}. To create one, run \`npx tz init\`.`,
        );
        process.exit(1);
      }
    }
  }

  return allTokens;
}

/**
 * resolve config
 * @return {string | undefined} resolvedPath
 */
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

/** Resolve tokens.json path (for lint command) */
function resolveTokenPath(filename) {
  const tokensPath = new URL(filename, cwd);
  if (!fs.existsSync(tokensPath)) {
    printErrors(`Could not locate ${filename}. Does the file exist?`);
    process.exit(1);
  }
  if (!fs.statSync(tokensPath).isFile()) {
    printErrors(`Expected JSON or YAML file, received ${filename}.`);
    process.exit(1);
  }
  return tokensPath;
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
    const output = new URL(filename, config.outDir);
    fs.mkdirSync(new URL('.', output), { recursive: true });
    fs.writeFileSync(output, contents);
  }
}

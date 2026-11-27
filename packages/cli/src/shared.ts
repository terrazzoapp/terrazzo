import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { type ConfigInit, defineConfig, type Logger } from '@terrazzo/parser';
import pc from 'picocolors';
import { getFigmaAuthHeaders } from './import/figma/lib.js';

export const cwd = new URL(`${pathToFileURL(process.cwd())}/`); // trailing slash needed to interpret as directory
export const DEFAULT_CONFIG_PATH = new URL('./terrazzo.config.ts', cwd);
export const DEFAULT_TOKENS_PATH = new URL('./tokens.json', cwd);

export type Command = 'build' | 'check' | 'help' | 'init' | 'version';

export const GREEN_CHECK = pc.green('✔');

export interface Flags {
  /** --config, -c */
  config?: string;
  /** --out, -o */
  out?: string;
  /** --help */
  help?: boolean;
  /** --no-lint */
  'no-lint'?: boolean;
  /** --watch, -w */
  watch?: boolean;
  /** --version */
  version?: boolean;
}

export interface LoadConfigOptions {
  cmd: Command;
  flags: Flags;
  logger: Logger;
}

/** Load config */
export async function loadConfig({ cmd, flags, logger }: LoadConfigOptions) {
  /**
   * Vite server for loading .ts config files
   * TODO: remove me when Node 24 is the oldest-supported Node version
   */
  try {
    let config: ConfigInit = {
      tokens: [DEFAULT_TOKENS_PATH],
      outDir: new URL('./tokens/', cwd),
      plugins: [],
      lint: {
        build: { enabled: true },
        rules: {},
      },
      alphabetize: false,
      ignore: { tokens: [], deprecated: false },
      permutationLimit: 1000,
    };
    let configPath: string | undefined;

    if (typeof flags.config === 'string') {
      if (flags.config === '') {
        logger.error({ group: 'config', message: 'Missing path after --config flag' });
        process.exit(1);
      }
      configPath = resolveConfig(flags.config);
      if (!configPath) {
        logger.error({ group: 'config', message: `Could not locate ${flags.config}` });
      }
    }

    const resolvedConfigPath = resolveConfig(configPath);
    if (resolvedConfigPath) {
      let mod: any;
      try {
        mod = await import(resolvedConfigPath);
      } catch (error) {
        // --- Node.js 20.x support, delete on upgrade --- //
        // oxlint-disable-next-line no-negated-condition
        if (!mod) {
          logger.warn({
            group: 'config',
            message:
              'Node 22.0 and older will no longer work in the next major release of Terrazzo. Please update to a LTS version.',
          });
          const { tsImport } = await import('tsx/esm/api');
          mod = await tsImport(resolvedConfigPath, fileURLToPath(cwd));
        }
        // --- End Node.js 20.x support --- //
        else {
          logger.error({ group: 'config', message: (error as Error).message || (error as string) });
        }
      }
      if (!mod.default) {
        logger.error({
          group: 'config',
          message: `No default export found in ${resolvedConfigPath.replace(fileURLToPath(cwd), '')}. See https://terrazzo.dev/docs for instructions.`,
        });
      }
      config = defineConfig(mod.default, { cwd, logger });
      if (flags['no-lint']) {
        config.lint.build.enabled = false;
      }
    } else if (cmd !== 'init' && cmd !== 'check') {
      logger.error({
        group: 'config',
        message: 'No config file found. Create one with `npx terrazzo init`.',
      });
    }

    return {
      config,
      configPath: resolvedConfigPath,
    };
  } catch (error) {
    printError((error as Error).message);

    process.exit(1);
  }
}

/** load tokens */
export async function loadTokens(tokenPaths: URL[], { logger }: { logger: Logger }) {
  try {
    const allTokens = [];

    if (!Array.isArray(tokenPaths)) {
      logger.error({
        group: 'config',
        message: `loadTokens: Expected array, received ${typeof tokenPaths}`,
      });
    }

    // if this is the default value, also check for tokens.yaml
    if (
      tokenPaths.length === 1 &&
      tokenPaths[0]!.href === DEFAULT_TOKENS_PATH.href &&
      !fs.existsSync(tokenPaths[0]!)
    ) {
      const yamlPath = new URL('./tokens.yaml', cwd);
      if (fs.existsSync(yamlPath)) {
        tokenPaths[0] = yamlPath;
      } else {
        logger.error({
          group: 'config',
          message: `Could not locate ${path.relative(cwd.href, tokenPaths[0]!.href)}. To create one, run \`npx tz init\`.`,
        });
        return;
      }
    }

    // download/read
    /* oxlint-disable no-await-in-loop */
    for (let i = 0; i < tokenPaths.length; i++) {
      const filename = tokenPaths[i];

      if (!(filename instanceof URL)) {
        logger.error({
          group: 'config',
          message: `Expected URL, received ${filename}`,
          label: `loadTokens[${i}]`,
        });
        return;
      } else if (filename.protocol === 'http:' || filename.protocol === 'https:') {
        try {
          // if Figma URL
          if (filename.host === 'figma.com' || filename.host === 'www.figma.com') {
            const [_, fileKeyword, fileKey] = filename.pathname.split('/');
            if (fileKeyword !== 'file' || !fileKey) {
              logger.error({
                group: 'config',
                message: `Unexpected Figma URL. Expected "https://www.figma.com/file/:file_key/:file_name?…", received "${filename.href}"`,
              });
            }
            const headers = new Headers({
              Accept: '*/*',
              'User-Agent':
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:123.0) Gecko/20100101 Firefox/123.0',
              ...getFigmaAuthHeaders(logger),
            });
            const res = await fetch(`https://api.figma.com/v1/files/${fileKey}/variables/local`, {
              method: 'GET',
              headers,
            });
            if (res.ok) {
              allTokens.push({ filename, src: await res.text() });
            }
            const message =
              res.status === 404 ? '' : JSON.stringify(await res.json(), undefined, 2);
            logger.error({
              group: 'config',
              message: `Figma responded with ${res.status}${message ? `:\n${message}` : ''}`,
            });
            break;
          }

          // otherwise, expect YAML/JSON
          const res = await fetch(filename, {
            method: 'GET',
            headers: { Accept: '*/*', 'User-Agent': 'Mozilla/5.0 Gecko/20100101 Firefox/123.0' },
          });
          allTokens.push({ filename, src: await res.text() });
        } catch (error) {
          logger.error({ group: 'config', message: `${filename.href}: ${error}` });
          return;
        }
      } else if (fs.existsSync(filename)) {
        allTokens.push({ filename, src: fs.readFileSync(filename, 'utf8') });
      } else {
        logger.error({
          group: 'config',
          message: `Could not locate ${path.relative(cwd.href, filename.href)}. To create one, run \`npx tz init\`.`,
        });
        return;
      }
    }
    /* oxlint-enable no-await-in-loop */

    return allTokens;
  } catch (error) {
    printError((error as Error).message);
    process.exit(1);
  }
}

/** Print error */
export function printError(message: string) {
  // oxlint-disable-next-line no-console
  console.error(pc.red(`✗  ${message}`));
}

/** Print success */
export function printSuccess(message: string, startTime?: number) {
  // oxlint-disable-next-line no-console
  console.log(`${GREEN_CHECK}  ${message}${startTime ? ` ${time(startTime)}` : ''}`);
}

/** Resolve config */
export function resolveConfig(filename?: string): string | undefined {
  // --config [configpath]
  if (filename && fs.existsSync(new URL(filename, cwd))) {
    // Note: ':' is a lazy test for Windows-style absolute paths, e.g. "C:\…" (this is not a protocol as it’s on the local filesystem)
    if (!filename.startsWith('/') && !filename.startsWith('.') && !filename.includes(':')) {
      return `./${filename}`;
    }
    return filename;
  }
  // note: the order isn’t significant; just try for most-common first.
  // if a user has multiple config files with different extensions that’s their fault
  for (const ext of ['.ts', '.js', '.mts', '.cts', '.mjs', '.cjs']) {
    const maybeFilename = `terrazzo.config${ext}`;
    if (fs.existsSync(new URL(maybeFilename, cwd))) {
      return fileURLToPath(new URL(maybeFilename, cwd));
    }
  }
}

/** Resolve tokens.json path (for lint command) */
export function resolveTokenPath(filename: string, { logger }: { logger: Logger }) {
  const tokensPath = new URL(filename, cwd);
  if (!fs.existsSync(tokensPath)) {
    logger.error({
      group: 'config',
      message: `Could not locate ${filename}. Does the file exist?`,
    });
  } else if (!fs.statSync(tokensPath).isFile()) {
    logger.error({ group: 'config', message: `Expected JSON or YAML file, received ${filename}.` });
  }
  return tokensPath;
}

/** Print time elapsed */
export function time(start: number) {
  const diff = performance.now() - start;
  return pc.dim(diff < 750 ? `${Math.round(diff)}ms` : `${(diff / 1000).toFixed(1)}s`);
}

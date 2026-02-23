import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { type ConfigInit, defineConfig, type Logger } from '@terrazzo/parser';
import pc from 'picocolors';
import { createServer, type ViteDevServer } from 'vite';
import { ViteNodeRunner } from 'vite-node/client';
import { ViteNodeServer } from 'vite-node/server';

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
  let viteServer: ViteDevServer | undefined;
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
      try {
        // Note: we create a vite-node instance only when resolving the config,
        // because in most scenarios we only ever need this once and never again.
        // even in watch mode we don’t reload the config, so keeping a vite-node
        // “hot” instance doesn’t provide obvious benefits (only potential memory leaks)
        viteServer = await createServer({ mode: 'development' });
        const viteNodeServer = new ViteNodeServer(viteServer as any);
        const viteNodeRunner = new ViteNodeRunner({
          root: viteServer.config.root,
          base: viteServer.config.base,
          fetchModule(...args) {
            return viteNodeServer.fetchModule(...args);
          },
          resolveId(...args) {
            return viteNodeServer.resolveId(...args);
          },
        });
        const mod = await viteNodeRunner.executeFile(resolvedConfigPath);
        if (!mod.default) {
          // we format it immediately below
          throw new Error(
            `No default export found in ${resolvedConfigPath.replace(fileURLToPath(cwd), '')}. See https://terrazzo.dev/docs for instructions.`,
          );
        }
        config = defineConfig(mod.default, { cwd, logger });
      } catch (err) {
        logger.error({ group: 'config', message: (err as Error).message || (err as string) });
      }
    } else if (cmd !== 'init' && cmd !== 'check') {
      logger.error({ group: 'config', message: 'No config file found. Create one with `npx terrazzo init`.' });
    }

    // clean up
    if (viteServer) {
      await viteServer?.close();
    }

    return {
      config,
      configPath: resolvedConfigPath,
    };
  } catch (err) {
    printError((err as Error).message);

    // clean up
    if (viteServer) {
      await viteServer.close();
    }

    process.exit(1);
  }
}

/** load tokens */
export async function loadTokens(tokenPaths: URL[], { logger }: { logger: Logger }) {
  try {
    const allTokens = [];

    if (!Array.isArray(tokenPaths)) {
      logger.error({ group: 'config', message: `loadTokens: Expected array, received ${typeof tokenPaths}` });
    }

    // if this is the default value, also check for tokens.yaml
    if (tokenPaths.length === 1 && tokenPaths[0]!.href === DEFAULT_TOKENS_PATH.href) {
      if (!fs.existsSync(tokenPaths[0]!)) {
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
    }

    // download/read
    for (let i = 0; i < tokenPaths.length; i++) {
      const filename = tokenPaths[i];

      if (!(filename instanceof URL)) {
        logger.error({ group: 'config', message: `Expected URL, received ${filename}`, label: `loadTokens[${i}]` });
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
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:123.0) Gecko/20100101 Firefox/123.0',
            });
            if (process.env.FIGMA_ACCESS_TOKEN) {
              headers.set('X-FIGMA-TOKEN', process.env.FIGMA_ACCESS_TOKEN);
            } else {
              logger.warn({ group: 'config', message: 'FIGMA_ACCESS_TOKEN not set' });
            }
            const res = await fetch(`https://api.figma.com/v1/files/${fileKey}/variables/local`, {
              method: 'GET',
              headers,
            });
            if (res.ok) {
              allTokens.push({ filename, src: await res.text() });
            }
            const message = res.status !== 404 ? JSON.stringify(await res.json(), undefined, 2) : '';
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
        } catch (err) {
          logger.error({ group: 'config', message: `${filename.href}: ${err}` });
          return;
        }
      } else {
        if (fs.existsSync(filename)) {
          allTokens.push({ filename, src: fs.readFileSync(filename, 'utf8') });
        } else {
          logger.error({
            group: 'config',
            message: `Could not locate ${path.relative(cwd.href, filename.href)}. To create one, run \`npx tz init\`.`,
          });
          return;
        }
      }
    }

    return allTokens;
  } catch (err) {
    printError((err as Error).message);
    process.exit(1);
  }
}

/** Print error */
export function printError(message: string) {
  // biome-ignore lint/suspicious/noConsole: this is its job
  console.error(pc.red(`✗  ${message}`));
}

/** Print success */
export function printSuccess(message: string, startTime?: number) {
  // biome-ignore lint/suspicious/noConsole: this is its job
  console.log(`${GREEN_CHECK}  ${message}${startTime ? ` ${time(startTime)}` : ''}`);
}

/** Resolve config */
export function resolveConfig(filename?: string): string | undefined {
  // --config [configpath]
  if (filename && fs.existsSync(new URL(filename, cwd))) {
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
    logger.error({ group: 'config', message: `Could not locate ${filename}. Does the file exist?` });
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

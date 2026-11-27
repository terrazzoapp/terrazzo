import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  build,
  type BuildRunnerResult,
  type ConfigInit,
  type Logger,
  parse,
} from '@terrazzo/parser';
import chokidar from 'chokidar';
import pc from 'picocolors';
import yamlToMomoa from 'yaml-to-momoa';
import {
  cwd,
  DEFAULT_TOKENS_PATH,
  type Flags,
  GREEN_CHECK,
  loadTokens,
  printError,
  printSuccess,
  resolveConfig,
} from './shared.js';

export interface BuildOptions {
  flags: Flags;
  config: ConfigInit;
  configPath: string;
  logger: Logger;
}

/**
 * Serialize async rebuild calls: if a build is in progress, coalesce any
 * incoming requests so only the most recent one runs after the current build.
 */
export function createBuildQueue<T>(
  runBuild: (arg: T) => Promise<void>,
): (arg: T) => Promise<void> {
  let active: Promise<void> | undefined;
  let queued: { arg: T } | undefined;

  return (arg: T) => {
    if (active) {
      queued = { arg };
      return active;
    }

    async function step(item: T): Promise<void> {
      await runBuild(item);
      if (queued) {
        const next = queued;
        queued = undefined;
        return step(next.arg);
      }
    }
    active = step(arg).finally(() => {
      active = undefined;
      queued = undefined;
    });

    return active;
  };
}

/** tz build */
export async function buildCmd({ config, configPath, flags, logger }: BuildOptions) {
  try {
    const startTime = performance.now();
    if (!Array.isArray(config.plugins) || config.plugins.length === 0) {
      logger.error({
        group: 'config',
        message: `No plugins defined! Add some in ${configPath || 'terrazzo.config.ts'}`,
      });
    }

    // first build
    let rawSchemas = await loadTokens(config.tokens, { logger });
    if (!rawSchemas) {
      logger.error({
        group: 'config',
        message: `Error loading ${path.relative(fileURLToPath(cwd), fileURLToPath(config.tokens[0] || DEFAULT_TOKENS_PATH))}`,
      });
      return;
    }
    const skipLint = !config.lint.build.enabled;
    let { tokens, resolver, sources } = await parse(rawSchemas, {
      config,
      logger,
      skipLint,
      yamlToMomoa,
    });
    let result = await build(tokens, { resolver, sources, config, logger });
    writeFiles(result, { config, logger });

    // --watch (handle rebuild)
    if (flags.watch) {
      const dt = new Intl.DateTimeFormat('en-us', {
        hour: '2-digit',
        minute: '2-digit',
      });

      const rebuild = createBuildQueue(
        async ({
          messageBefore,
          messageAfter,
        }: { messageBefore?: string; messageAfter?: string } = {}) => {
          try {
            if (messageBefore) {
              logger.info({ group: 'plugin', label: 'watch', message: messageBefore });
            }
            rawSchemas = await loadTokens(config.tokens, { logger });
            if (!rawSchemas) {
              throw new Error(
                `Error loading ${path.relative(fileURLToPath(cwd), fileURLToPath(config.tokens[0] || DEFAULT_TOKENS_PATH))}`,
              );
            }
            const parseResult = await parse(rawSchemas, { config, logger, skipLint, yamlToMomoa });
            tokens = parseResult.tokens;
            sources = parseResult.sources;
            resolver = parseResult.resolver;
            result = await build(tokens, { resolver, sources, config, logger });
            if (messageAfter) {
              logger.info({ group: 'plugin', label: 'watch', message: messageAfter });
            }
            writeFiles(result, { config, logger });
          } catch (error) {
            // oxlint-disable-next-line no-console
            console.error(pc.red(`✗  ${(error as Error).message || (error as string)}`));
            // don’t exit! we’re watching, so continue as long as possible
          }
        },
      );

      const tokenWatcher = chokidar.watch(config.tokens.map((filename) => fileURLToPath(filename)));
      tokenWatcher.on('change', async (filename) => {
        await rebuild({
          messageBefore: `${pc.dim(dt.format(new Date()))} ${pc.green('tz')}} ${pc.yellow(filename)} updated ${GREEN_CHECK}`,
        });
      });
      const configWatcher = chokidar.watch(resolveConfig(configPath)!);
      configWatcher.on('change', async () => {
        await rebuild({
          messageBefore: `${pc.dim(dt.format(new Date()))} ${pc.green('tz')} ${pc.yellow('Config updated. Reloading…')}`,
        });
      });

      // keep process occupied
      // oxlint-disable-next-line no-empty-function
      await new Promise(() => {});
    } else {
      printSuccess(
        `${Object.keys(tokens).length} token${Object.keys(tokens).length === 1 ? '' : 's'} built`,
        startTime,
      );
    }
  } catch (error) {
    printError((error as Error).message);
    process.exit(1);
  }
}

/** Write files */
export function writeFiles(
  result: BuildRunnerResult,
  { config, logger }: { config: ConfigInit; logger: Logger },
) {
  for (const { filename, contents } of result.outputFiles) {
    const output = new URL(filename, config.outDir);
    fs.mkdirSync(new URL('.', output), { recursive: true });
    fs.writeFileSync(output, contents);
    logger.debug({
      group: 'parser',
      label: 'buildEnd',
      message: `Wrote file ${fileURLToPath(output)}`,
    });
  }
}

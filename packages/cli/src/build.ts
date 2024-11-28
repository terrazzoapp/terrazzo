import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { type BuildRunnerResult, type ConfigInit, type Logger, build, parse } from '@terrazzo/parser';
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
import path from 'node:path';

export interface BuildOptions {
  flags: Flags;
  config: ConfigInit;
  configPath: string;
  logger: Logger;
}

/** tz build */
export async function buildCmd({ config, configPath, flags, logger }: BuildOptions) {
  try {
    const startTime = performance.now();
    if (!Array.isArray(config.plugins) || !config.plugins.length) {
      logger.error({ message: `No plugins defined! Add some in ${configPath || 'terrazzo.config.js'}` });
    }

    // first build
    let rawSchemas = await loadTokens(config.tokens, { logger });
    if (!rawSchemas) {
      logger.error({
        message: `Error loading ${path.relative(fileURLToPath(cwd), fileURLToPath(config.tokens[0] || DEFAULT_TOKENS_PATH))}`,
      });
      return;
    }
    let { tokens, sources } = await parse(rawSchemas, { config, logger, yamlToMomoa });
    let result = await build(tokens, { sources, config, logger });
    writeFiles(result, config);

    // --watch (handle rebuild)
    if (flags.watch) {
      const dt = new Intl.DateTimeFormat('en-us', {
        hour: '2-digit',
        minute: '2-digit',
      });

      async function rebuild({ messageBefore, messageAfter }: { messageBefore?: string; messageAfter?: string } = {}) {
        try {
          if (messageBefore) {
            logger.info({ message: messageBefore });
          }
          rawSchemas = await loadTokens(config.tokens, { logger });
          if (!rawSchemas) {
            throw new Error(
              `Error loading ${path.relative(fileURLToPath(cwd), fileURLToPath(config.tokens[0] || DEFAULT_TOKENS_PATH))}`,
            );
          }
          const parseResult = await parse(rawSchemas, { config, logger, yamlToMomoa });
          tokens = parseResult.tokens;
          sources = parseResult.sources;
          result = await build(tokens, { sources, config, logger });
          if (messageAfter) {
            logger.info({ message: messageAfter });
          }
          writeFiles(result, config);
        } catch (err) {
          console.error(pc.red(`✗  ${(err as Error).message || (err as string)}`));
          // don’t exit! we’re watching, so continue as long as possible
        }
      }

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
      await new Promise(() => {});
    } else {
      printSuccess(
        `${Object.keys(tokens).length} token${Object.keys(tokens).length !== 1 ? 's' : ''} built`,
        startTime,
      );
    }
  } catch (err) {
    printError((err as Error).message);
    process.exit(1);
  }
}

/** Write files */
export function writeFiles(result: BuildRunnerResult, config: ConfigInit) {
  for (const { filename, contents } of result.outputFiles) {
    const output = new URL(filename, config.outDir);
    fs.mkdirSync(new URL('.', output), { recursive: true });
    fs.writeFileSync(output, contents);
  }
}

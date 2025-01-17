import { type ConfigInit, type Logger, parse } from '@terrazzo/parser';
import yamlToMomoa from 'yaml-to-momoa';
import { loadTokens, printError, printSuccess, resolveTokenPath } from './shared.js';

export interface CheckOptions {
  /** positional CLI args */
  positionals: string[];
  config: ConfigInit;
  logger: Logger;
}

/** tz check */
export async function checkCmd({ config, logger, positionals }: CheckOptions) {
  try {
    const startTime = performance.now();
    const tokenPaths = positionals.slice(1).length
      ? positionals.slice(1).map((tokenPath) => resolveTokenPath(tokenPath, { logger }))
      : config.tokens;
    const sources = await loadTokens(tokenPaths, { logger });
    if (!sources?.length) {
      logger.error({ group: 'config', message: 'Couldn’t find any tokens. Run `npx tz init` to create some.' });
      return;
    }
    await parse(sources, { config, continueOnError: true, logger, yamlToMomoa }); // will throw if errors
    printSuccess('No errors', startTime);
  } catch (err) {
    printError((err as Error).message);
    process.exit(1);
  }
}

import { isTokenMatch } from '@terrazzo/token-tools';
import { merge } from 'merge-anything';
import Logger from '../logger.js';

/**
 * @typedef {object} BuildRunnerOptions
 * @typedef {Record<string, TokenNormalized>} BuildRunnerOptions.tokens
 * @typedef {DocumentNode} BuildRunnerOptions.ast
 * @typedef {ConfigInit} BuildRunnerOptions.config
 * @typedef {Logger} BuildRunnerOptions.logger
 * @typedef {import("@humanwhocodes/momoa").DocumentNode} DocumentNode
 * @typedef {import("../config.js").ConfigInit} ConfigInit
 * @typedef {import("../logger.js")} Logger
 * @typedef {import("../types.js").TokenNormalized} TokenNormalized
 *
 * @typedef {object} BuildRunnerResult
 * @typedef {OutputFile[]} BuildRunnerResult.outputFiles
 * @typedef {object} OutputFile
 * @typedef {string} OutputFile.filename
 * @typedef {string | Buffer} OutputFile.contents
 */

/**
 * Run build stage
 * @param {BuildOptions} options
 * @return {Promise<BuildResult>}
 */
export default async function build({ tokens, ast, logger = new Logger(), config }) {
  const formats = {};
  const result = { outputFiles: [] };

  function createFormatter(formatID, readonly = true) {
    const formatter = {
      getTokenValue(tokenID) {
        return formats[formatID][tokenID];
      },
      getAllTokenValues(glob) {
        const matches = {};
        for (const id in tokens) {
          if (!Object.hasOwn(tokens, id)) {
            continue;
          }
          if (isTokenMatch(id, [glob])) {
            matches[id] = { ...tokens[id] };
          }
        }
        return matches;
      },
      setTokenValue(tokenID, value) {
        if (readonly) {
          return; // don’t throw error; just ignore calls
        }
        formats[formatID][tokenID] = merge(formats[formatID][tokenID] ?? {}, value);
      },
    };
    return formatter;
  }

  // transform()
  const startTransform = performance.now();
  logger.debug({ group: 'core', task: 'transform', message: 'Start transform' });
  for (const plugin of config.plugins) {
    if (typeof plugin.transform === 'function') {
      await transform({
        tokens,
        ast,
        format: (formatID) => createFormatter(formatID, false),
      });
    }
  }
  logger.debug({
    group: 'core',
    task: 'transform',
    message: 'Finish transform',
    timing: performance.now() - startTransform,
  });

  // build()
  const startBuild = performance.now();
  logger.debug({ group: 'core', task: 'build', message: 'Start build' });
  for (const plugin of config.plugins) {
    if (typeof plugin.build === 'function') {
      await plugin.build({
        tokens,
        ast,
        format: (formatID) => createFormatter(formatID),
        outputFile(filename, contents) {
          const resolved = new URL(filename, config.outDir);
          if (result.outputFiles.some((f) => new URL(f.filename, config.outDir).href === resolved.href)) {
            logger.error({ message: `Can’t overwrite file "${filename}"`, label: plugin.name });
          }
          result.outputFiles.push(filename, contents);
        },
      });
    }
  }
  logger.debug({
    group: 'core',
    task: 'build',
    message: 'Finish build',
    timing: performance.now() - startBuild,
  });

  // buildEnd()
  const startBuildEnd = performance.now();
  logger.debug({ group: 'core', task: 'build', message: 'Start buildEnd' });
  for (const plugin of config.plugins) {
    if (typeof plugin.buildEnd === 'function') {
      await plugin.buildEnd({
        tokens,
        ast,
        format: (formatID) => createFormatter(formatID),
        outputFiles: merge([], result.outputFiles),
      });
    }
  }
  logger.debug({ group: 'core', task: 'build', message: 'Finish buildEnd', timing: performance.now() - startBuildEnd });

  return result;
}

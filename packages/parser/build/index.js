import { isTokenMatch } from '@terrazzo/token-tools';
import wcmatch from 'wildcard-match';
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

export const SINGLE_VALUE = 'SINGLE_VALUE';
export const MULTI_VALUE = 'MULTI_VALUE';

/** Validate plugin setTransform() calls for immediate feedback */
function validateTransformParams({ params, token, logger, pluginName }) {
  const baseEntry = { group: 'plugin', task: pluginName };

  // validate ID
  if (!token) {
    logger.error({
      ...baseEntry,
      message: `setTransform() tried to transform token "${id}" but it doesn’t exist.`,
    });
  }
  // validate value is valid for SINGLE_VALUE or MULTI_VALUE
  if (
    !params.value ||
    (typeof params.value !== 'string' && typeof params.value !== 'object') ||
    Array.isArray(params.value)
  ) {
    logger.error({
      ...baseEntry,
      message: `setTransform() value expected string or object of strings, received ${
        Array.isArray(params.value) ? 'Array' : typeof params.value
      }`,
    });
  }
  if (typeof params.value === 'object' && Object.values(params.value).some((v) => !v || typeof v !== 'string')) {
    logger.error({
      ...baseEntry,
      message: 'setTransform() value expected object of strings, received some non-string values',
    });
  }
}

/**
 * Run build stage
 * @param {BuildOptions} options
 * @return {Promise<BuildResult>}
 */
export default async function build(tokens, { ast, logger = new Logger(), config }) {
  const formats = {};
  const result = { outputFiles: [] };

  function getTransforms(params) {
    return (formats[params.format] ?? []).filter((token) => {
      if (params.$type) {
        if (typeof params.$type === 'string' && token.$type !== params.$type) {
          return false;
        } else if (Array.isArray(params.$type) && !params.$type.some(($type) => token.type === $type)) {
          return false;
        }
      }
      if (
        params.id &&
        params.id !== '*' &&
        !isTokenMatch(token.token.id, Array.isArray(params.id) ? params.id : [params.id])
      ) {
        return false;
      }
      if (params.mode && !wcmatch(params.mode)(token.mode)) {
        return false;
      }
      return true;
    });
  }

  // transform()
  let transformsLocked = false; // prevent plugins from transforming after stage has ended
  const startTransform = performance.now();
  logger.debug({ group: 'parser', task: 'transform', message: 'Start transform' });
  for (const plugin of config.plugins) {
    if (typeof plugin.transform === 'function') {
      await plugin.transform({
        tokens,
        ast,
        getTransforms,
        setTransform(id, params) {
          if (transformsLocked) {
            logger.warn({
              message: 'Attempted to call setTransform() after transform step has completed.',
              group: 'plugin',
              task: plugin.name,
            });
            return;
          }
          const token = tokens[id];
          validateTransformParams({ token, logger, params, pluginName: plugin.name });

          // upsert
          if (!formats[params.format]) {
            formats[params.format] = [];
          }
          const foundTokenI = formats[params.format].findIndex(
            (t) =>
              params.localID === t.localID &&
              (!params.mode || params.mode === t.mode) &&
              (!params.variant || params.variant === t.variant),
          );
          if (foundTokenI === -1) {
            formats[params.format].push({
              ...params,
              type: typeof params.value === 'string' ? SINGLE_VALUE : MULTI_VALUE,
              mode: params.mode || '.',
              token: structuredClone(token),
            });
          } else {
            formats[params.format][foundTokenI].value = params.value;
            formats[params.format][foundTokenI].type = typeof params.value === 'string' ? SINGLE_VALUE : MULTI_VALUE;
          }
        },
      });
    }
  }
  transformsLocked = true;
  logger.debug({
    group: 'parser',
    task: 'transform',
    message: 'Finish transform',
    timing: performance.now() - startTransform,
  });

  // build()
  const startBuild = performance.now();
  logger.debug({ group: 'parser', task: 'build', message: 'Start build' });
  for (const plugin of config.plugins) {
    if (typeof plugin.build === 'function') {
      const pluginBuildStart = performance.now();
      await plugin.build({
        tokens,
        ast,
        getTransforms,
        outputFile(filename, contents) {
          const resolved = new URL(filename, config.outDir);
          if (result.outputFiles.some((f) => new URL(f.filename, config.outDir).href === resolved.href)) {
            logger.error({ message: `Can’t overwrite file "${filename}"`, label: plugin.name });
          }
          result.outputFiles.push({
            filename,
            contents,
            plugin: plugin.name,
            time: performance.now() - pluginBuildStart,
          });
        },
      });
    }
  }
  logger.debug({
    group: 'parser',
    task: 'build',
    message: 'Finish build',
    timing: performance.now() - startBuild,
  });

  // buildEnd()
  const startBuildEnd = performance.now();
  logger.debug({ group: 'parser', task: 'build', message: 'Start buildEnd' });
  for (const plugin of config.plugins) {
    if (typeof plugin.buildEnd === 'function') {
      await plugin.buildEnd({
        tokens,
        ast,
        getTransforms,
        format: (formatID) => createFormatter(formatID),
        outputFiles: structruedClone(result.outputFiles),
      });
    }
  }
  logger.debug({
    group: 'parser',
    task: 'build',
    message: 'Finish buildEnd',
    timing: performance.now() - startBuildEnd,
  });

  return result;
}

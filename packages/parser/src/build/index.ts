import type { DocumentNode } from '@humanwhocodes/momoa';
import { type TokenNormalized, isTokenMatch } from '@terrazzo/token-tools';
import wcmatch from 'wildcard-match';
import Logger, { type LogEntry } from '../logger.js';
import type { BuildRunnerResult, ConfigInit, TokenTransformed, TransformParams } from '../types.js';

export interface BuildRunnerOptions {
  sources: { filename?: URL; src: string; document: DocumentNode }[];
  config: ConfigInit;
  logger?: Logger;
}

export const SINGLE_VALUE = 'SINGLE_VALUE';
export const MULTI_VALUE = 'MULTI_VALUE';

/** Validate plugin setTransform() calls for immediate feedback */
function validateTransformParams({
  params,
  logger,
  pluginName,
}: { params: TokenTransformed; logger: Logger; pluginName: string }) {
  const baseEntry: LogEntry = { group: 'plugin', label: pluginName, message: '' };

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
  if (typeof params.value === 'object' && Object.values(params.value).some((v) => typeof v !== 'string')) {
    logger.error({
      ...baseEntry,
      message: 'setTransform() value expected object of strings, received some non-string values',
    });
  }
}

/**
 * Run build stage
 */
export default async function build(
  tokens: Record<string, TokenNormalized>,
  { sources, logger = new Logger(), config }: BuildRunnerOptions,
) {
  const formats: Record<string, TokenTransformed[]> = {};
  const result: BuildRunnerResult = { outputFiles: [] };

  function getTransforms(params: TransformParams) {
    return (formats[params.format] ?? []).filter((token) => {
      if (params.$type) {
        if (typeof params.$type === 'string' && token.token.$type !== params.$type) {
          return false;
        } else if (Array.isArray(params.$type) && !params.$type.some(($type) => token.token.$type === $type)) {
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
  logger.debug({ group: 'parser', label: 'transform', message: 'Start transform' });
  for (const plugin of config.plugins) {
    if (typeof plugin.transform === 'function') {
      await plugin.transform({
        tokens,
        sources,
        getTransforms,
        setTransform(id, params) {
          if (transformsLocked) {
            logger.warn({
              message: 'Attempted to call setTransform() after transform step has completed.',
              group: 'plugin',
              label: plugin.name,
            });
            return;
          }
          const token = tokens[id]!;

          // allow `undefined` values, but remove them here
          const cleanValue: TokenTransformed['value'] =
            typeof params.value === 'string' ? params.value : { ...(params.value as Record<string, string>) };
          if (typeof cleanValue === 'object') {
            for (const k of Object.keys(cleanValue)) {
              if (Object.hasOwn(cleanValue, k)) {
                if (cleanValue[k] === undefined) {
                  delete cleanValue[k];
                }
              }
            }
          }

          validateTransformParams({
            logger,
            params: { ...(params as any), value: cleanValue },
            pluginName: plugin.name,
          });

          // upsert
          if (!formats[params.format]) {
            formats[params.format] = [];
          }
          const foundTokenI = formats[params.format]!.findIndex(
            (t) => id === t.id && params.localID === t.localID && (!params.mode || params.mode === t.mode),
          );
          if (foundTokenI === -1) {
            formats[params.format]!.push({
              ...params,
              id,
              value: cleanValue,
              type: typeof cleanValue === 'string' ? SINGLE_VALUE : MULTI_VALUE,
              mode: params.mode || '.',
              token: structuredClone(token),
            } as TokenTransformed);
          } else {
            formats[params.format]![foundTokenI]!.value = cleanValue;
            formats[params.format]![foundTokenI]!.type = typeof cleanValue === 'string' ? SINGLE_VALUE : MULTI_VALUE;
          }
        },
      });
    }
  }
  transformsLocked = true;
  logger.debug({
    group: 'parser',
    label: 'transform',
    message: 'Finish transform',
    timing: performance.now() - startTransform,
  });

  // build()
  const startBuild = performance.now();
  logger.debug({ group: 'parser', label: 'build', message: 'Start build' });
  for (const plugin of config.plugins) {
    if (typeof plugin.build === 'function') {
      const pluginBuildStart = performance.now();
      await plugin.build({
        tokens,
        sources,
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
    label: 'build',
    message: 'Finish build',
    timing: performance.now() - startBuild,
  });

  // buildEnd()
  const startBuildEnd = performance.now();
  logger.debug({ group: 'parser', label: 'build', message: 'Start buildEnd' });
  for (const plugin of config.plugins) {
    if (typeof plugin.buildEnd === 'function') {
      await plugin.buildEnd({ outputFiles: structuredClone(result.outputFiles) });
    }
  }
  logger.debug({
    group: 'parser',
    label: 'build',
    message: 'Finish buildEnd',
    timing: performance.now() - startBuildEnd,
  });

  return result;
}

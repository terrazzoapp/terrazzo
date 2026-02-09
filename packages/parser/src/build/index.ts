import type { InputSourceWithDocument } from '@terrazzo/json-schema-tools';
import { CachedWildcardMatcher, type TokenNormalized } from '@terrazzo/token-tools';
import Logger, { type LogEntry } from '../logger.js';
import type { BuildRunnerResult, ConfigInit, Resolver, TokenTransformed, TransformParams } from '../types.js';

export interface BuildRunnerOptions {
  sources: InputSourceWithDocument[];
  config: ConfigInit;
  resolver: Resolver;
  logger?: Logger;
}
export const SINGLE_VALUE = 'SINGLE_VALUE';
export const MULTI_VALUE = 'MULTI_VALUE';

/** Validate plugin setTransform() calls for immediate feedback */
function validateTransformParams({
  params,
  logger,
  pluginName,
}: {
  params: TokenTransformed;
  logger: Logger;
  pluginName: string;
}): void {
  const baseMessage: LogEntry = { group: 'plugin', label: pluginName, message: '' };

  // validate value is valid for SINGLE_VALUE or MULTI_VALUE
  if (
    !params.value ||
    (typeof params.value !== 'string' && typeof params.value !== 'object') ||
    Array.isArray(params.value)
  ) {
    logger.error({
      ...baseMessage,
      message: `setTransform() value expected string or object of strings, received ${
        Array.isArray(params.value) ? 'Array' : typeof params.value
      }`,
    });
  }
  if (typeof params.value === 'object' && Object.values(params.value).some((v) => typeof v !== 'string')) {
    logger.error({
      ...baseMessage,
      message: 'setTransform() value expected object of strings, received some non-string values',
    });
  }
}

const FALLBACK_PERMUTATION_ID = JSON.stringify({ tzMode: '.' });

// Important: getTransforms() will likely be called hundreds of times, and creating wcmatch instances is expensive!
// Use this cached matcher to significantly speed up matching
const cachedMatcher = new CachedWildcardMatcher();

/** Run build stage */
export default async function build(
  tokens: Record<string, TokenNormalized>,
  { resolver, sources, logger = new Logger(), config }: BuildRunnerOptions,
): Promise<BuildRunnerResult> {
  const formats: Record<string, { [permutationID: string]: TokenTransformed[] }> = {};
  const result: BuildRunnerResult = { outputFiles: [] };

  function getTransforms(plugin: string) {
    return function getTransforms(params: TransformParams) {
      if (!params?.format) {
        logger.warn({
          group: 'plugin',
          label: plugin,
          message: '"format" missing from getTransforms(), no tokens returned.',
        });
        return [];
      }

      let permutationID = params.input ? resolver.getPermutationID(params.input) : FALLBACK_PERMUTATION_ID;
      if (!params.input && params.mode) {
        permutationID = JSON.stringify({ tzMode: params.mode });
      }

      // Optimization: don’t create wildcard matcher if single token IDs are requested—it’s slow and pointless
      const isSingleTokenID = params.id && typeof params.id === 'string' && params.id in tokens;
      const tokenMatcher = params.id && !isSingleTokenID ? cachedMatcher.tokenIDMatch(params.id) : null;
      const modeMatcher = params.mode ? cachedMatcher.match(params.mode) : null;

      const final = (formats[params.format!]?.[permutationID] ?? []).filter((token) => {
        if (params.$type) {
          if (typeof params.$type === 'string' && token.token.$type !== params.$type) {
            return false;
          } else if (Array.isArray(params.$type) && !params.$type.some(($type) => token.token.$type === $type)) {
            return false;
          }
        }
        // Optimization: skip wildcard matcher for single token IDs
        if (typeof params.id === 'string' && params.id in tokens) {
          return token.id === params.id;
        } else if (tokenMatcher && !tokenMatcher(token.token.id)) {
          return false;
        }
        if (params.input && token.permutationID !== resolver.getPermutationID(params.input)) {
          return false;
        }
        if (modeMatcher && !modeMatcher(token.mode)) {
          return false;
        }
        return true;
      });
      return final;
    };
  }

  // transform()
  let transformsLocked = false; // prevent plugins from transforming after stage has ended
  const startTransform = performance.now();
  for (const plugin of config.plugins) {
    if (typeof plugin.transform === 'function') {
      const pt = performance.now();
      await plugin.transform({
        context: { logger },
        tokens,
        sources,
        getTransforms: getTransforms(plugin.name),
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
          let permutationID = params.input ? resolver.getPermutationID(params.input) : FALLBACK_PERMUTATION_ID;
          if (!params.input && params.mode) {
            permutationID = JSON.stringify({ tzMode: params.mode });
          }
          const cleanValue: TokenTransformed['value'] =
            typeof params.value === 'string' ? params.value : { ...(params.value as Record<string, string>) };
          validateTransformParams({
            logger,
            params: { ...(params as any), value: cleanValue },
            pluginName: plugin.name,
          });

          // upsert
          if (!formats[params.format]) {
            formats[params.format] = {};
          }
          if (!formats[params.format]![permutationID]) {
            formats[params.format]![permutationID] = [];
          }
          let foundTokenI = -1;
          if (params.mode) {
            foundTokenI = formats[params.format]![permutationID]!.findIndex(
              (t) => id === t.id && (!params.localID || params.localID === t.localID) && params.mode === t.mode,
            );
          } else if (params.input) {
            if (!formats[params.format]![permutationID]) {
              formats[params.format]![permutationID] = [];
            }
            foundTokenI = formats[params.format]![permutationID]!.findIndex(
              (t) =>
                id === t.id && (!params.localID || params.localID === t.localID) && permutationID === t.permutationID,
            );
          } else {
            foundTokenI = formats[params.format]![permutationID]!.findIndex(
              (t) => id === t.id && (!params.localID || params.localID === t.localID),
            );
          }
          if (foundTokenI === -1) {
            // backwards compat: upconvert mode into "tzMode" modifier. This
            // allows newer plugins to use resolver syntax without disrupting
            // older plugins.
            formats[params.format]![permutationID]!.push({
              ...params,
              id,
              value: cleanValue,
              type: typeof cleanValue === 'string' ? SINGLE_VALUE : MULTI_VALUE,
              mode: params.mode || '.',
              token: structuredClone(token),
              permutationID,
              input: JSON.parse(permutationID),
            } as TokenTransformed);
          } else {
            formats[params.format]![permutationID]![foundTokenI]!.value = cleanValue;
            formats[params.format]![permutationID]![foundTokenI]!.type =
              typeof cleanValue === 'string' ? SINGLE_VALUE : MULTI_VALUE;
          }
        },
        resolver,
      });
      logger.debug({ group: 'plugin', label: plugin.name, message: 'transform()', timing: performance.now() - pt });
    }
  }
  transformsLocked = true;
  logger.debug({
    group: 'parser',
    label: 'transform',
    message: 'All plugins finished transform()',
    timing: performance.now() - startTransform,
  });

  // build()
  const startBuild = performance.now();
  await Promise.all(
    config.plugins.map(async (plugin) => {
      if (typeof plugin.build === 'function') {
        const pb = performance.now();
        await plugin.build({
          context: { logger },
          tokens,
          sources,
          getTransforms: getTransforms(plugin.name),
          resolver,
          outputFile(filename, contents) {
            const resolved = new URL(filename, config.outDir);
            if (result.outputFiles.some((f) => new URL(f.filename, config.outDir).href === resolved.href)) {
              logger.error({
                group: 'plugin',
                message: `Can’t overwrite file "${filename}"`,
                label: plugin.name,
              });
            }
            result.outputFiles.push({ filename, contents, plugin: plugin.name, time: performance.now() - pb });
          },
        });
        logger.debug({ group: 'plugin', label: plugin.name, message: 'build()', timing: performance.now() - pb });
      }
    }),
  );
  logger.debug({
    group: 'parser',
    label: 'build',
    message: 'All plugins finished build()',
    timing: performance.now() - startBuild,
  });

  cachedMatcher.reset(); // Garbage collect wildcard matches accumulated in the build process. This is needed in watch mode especially and long sessions.

  // buildEnd()
  const startBuildEnd = performance.now();
  await Promise.all(
    config.plugins.map(async (plugin) =>
      plugin.buildEnd?.({
        context: { logger },
        tokens,
        getTransforms: getTransforms(plugin.name),
        sources,
        outputFiles: structuredClone(result.outputFiles),
      }),
    ),
  );
  logger.debug({
    group: 'parser',
    label: 'build',
    message: 'buildEnd() step',
    timing: performance.now() - startBuildEnd,
  });

  return result;
}

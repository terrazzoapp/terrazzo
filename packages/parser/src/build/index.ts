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

const FALLBACK_PERMUTATION_ID = JSON.stringify({ tzMode: '*' });

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

      const isLegacyModes = params.input && Object.keys(params.input).length === 1 && 'tzMode' in params.input;
      const permutationID =
        params.input && !isLegacyModes ? resolver.getPermutationID(params.input) : FALLBACK_PERMUTATION_ID;
      const mode = params.mode || (isLegacyModes && params.input.tzMode) || undefined;
      // Optimization: don’t create wildcard matcher if single token IDs are requested—it’s slow and pointless
      const singleTokenID =
        (typeof params.id === 'string' && tokens[params.id]?.id) ||
        (Array.isArray(params.id) && params.id.length === 1 && tokens[params.id[0]!]?.id) ||
        undefined;
      const $type =
        (typeof params.$type === 'string' && [params.$type]) ||
        (Array.isArray(params.$type) && params.$type) ||
        undefined;
      const idMatcher =
        params.id && !singleTokenID && !isFullWildcard(params.id) ? cachedMatcher.tokenIDMatch(params.id) : null;
      const modeMatcher = mode && mode !== '.' && !isFullWildcard(mode) ? cachedMatcher.match(mode) : null;

      return (formats[params.format!]?.[permutationID] ?? []).filter((token) => {
        if ((singleTokenID && token.id !== singleTokenID) || (idMatcher && !idMatcher(token.id))) {
          return false;
        }
        if (params.$type && !$type?.some((value) => token.token.$type === value)) {
          return false;
        }
        if ((mode === '.' && token.mode !== '.') || (modeMatcher && !modeMatcher(token.mode))) {
          return false;
        }
        return true;
      });
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
          if (!token) {
            logger.error({ group: 'plugin', label: plugin.name, message: `No token "${id}"` });
          }
          const isLegacyModes = params.input && Object.keys(params.input).length === 1 && 'tzMode' in params.input;
          const permutationID =
            params.input && !isLegacyModes ? resolver.getPermutationID(params.input) : FALLBACK_PERMUTATION_ID;
          const mode = params.mode || (isLegacyModes && params.input.tzMode) || undefined;
          const cleanValue: TokenTransformed['value'] =
            typeof params.value === 'string' ? params.value : { ...(params.value as Record<string, string>) };
          validateTransformParams({
            logger,
            params: { ...(params as any), value: cleanValue },
            pluginName: plugin.name,
          });

          // upsert
          if (!formats[params.format]) {
            formats[params.format] = { [FALLBACK_PERMUTATION_ID]: [] };
          }
          if (!formats[params.format]![permutationID]) {
            formats[params.format]![permutationID] = [];
          }
          const foundTokenI = formats[params.format]![permutationID]!.findIndex(
            (t) => id === t.id && (!params.localID || params.localID === t.localID) && (!mode || t.mode === mode),
          );
          if (foundTokenI === -1) {
            const transformedToken = {
              ...params,
              id,
              value: cleanValue,
              type: typeof cleanValue === 'string' ? SINGLE_VALUE : MULTI_VALUE,
              mode: mode || '.',
              token: makeReadOnlyToken(token),
              permutationID,
              input: JSON.parse(permutationID),
            } as TokenTransformed;
            // backwards compat: upconvert mode into "tzMode" modifier. This
            // allows newer plugins to use resolver syntax without disrupting
            // older plugins.
            formats[params.format]![permutationID]!.push(transformedToken);

            // If this is a “default” permutation, this should also be duplicated in the global space
            if (params.input && !Object.keys(params.input).length && permutationID !== FALLBACK_PERMUTATION_ID) {
              formats[params.format]![FALLBACK_PERMUTATION_ID]!.push(transformedToken);
            }
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

function isFullWildcard(value: string | string[]): boolean {
  return (
    (typeof value === 'string' && (value === '*' || value === '**')) ||
    (Array.isArray(value) && value.some((v) => v === '*' || v === '**'))
  );
}

/** Generate getters for transformed tokens. Reduces memory usage while improving accuracy. Provides some safety for read-only values. */
function makeReadOnlyToken(token: TokenNormalized) {
  return {
    get id() {
      return token.id;
    },
    get $value() {
      return token.$value;
    },
    get $type() {
      return token.$type;
    },
    get $description() {
      return token.$description;
    },
    get $deprecated() {
      return token.$deprecated;
    },
    get $extends() {
      return token.$extends;
    },
    get $extensions() {
      return token.$extensions;
    },
    get mode() {
      return token.mode;
    },
    get originalValue() {
      return token.originalValue;
    },
    get aliasChain() {
      return token.aliasChain;
    },
    get aliasOf() {
      return token.aliasOf;
    },
    get partialAliasOf() {
      return token.partialAliasOf;
    },
    get aliasedBy() {
      return token.aliasedBy;
    },
    get group() {
      return token.group;
    },
    get source() {
      return token.source;
    },
    get jsonID() {
      return token.jsonID;
    },
    get dependencies() {
      return token.dependencies;
    },
  };
}
